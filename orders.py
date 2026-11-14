import hashlib
import hmac
import json
import logging
import os
import sqlite3
import time
import urllib.parse
import urllib.request
from contextlib import contextmanager
from pathlib import Path

BASE = Path(__file__).resolve().parent
DB_PATH = Path(os.environ.get('DATA_DIR') or str(BASE / 'data')) / 'orders.db'
logger = logging.getLogger('catalog.orders')
STATUS_LABELS = dict(new='новый', confirmed='подтверждён', shipped='отправлен', cancelled='отменён')
ALLOWED_STATUSES = tuple(STATUS_LABELS)

@contextmanager
def _connect():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH, timeout=15)
    conn.row_factory = sqlite3.Row
    try:
        conn.execute('PRAGMA journal_mode=WAL')
        with conn:
            yield conn
    finally:
        conn.close()

def init_db():
    with _connect() as conn:
        conn.execute('''CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT, order_number TEXT UNIQUE NOT NULL,
            user_id INTEGER, username TEXT, customer_name TEXT NOT NULL,
            contact TEXT NOT NULL, receipt TEXT NOT NULL, carrier TEXT, address TEXT,
            comment TEXT, items_json TEXT NOT NULL, total INTEGER NOT NULL,
            status TEXT NOT NULL DEFAULT 'new', created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL)''')

def _money(value):
    return format(value, ',').replace(',', ' ') + ' ₽'

def validate_init_data(init_data, bot_token):
    if not isinstance(init_data, str) or not init_data or not bot_token:
        raise ValueError('Откройте каталог заново через Telegram')
    pairs = urllib.parse.parse_qsl(init_data, keep_blank_values=True, max_num_fields=30)
    parsed = dict(pairs)
    if len(parsed) != len(pairs):
        raise ValueError('Некорректные данные Telegram')
    received = parsed.pop('hash', '')
    check = '\n'.join(f'{key}={value}' for key, value in sorted(parsed.items()))
    secret = hmac.new(b'WebAppData', bot_token.encode(), hashlib.sha256).digest()
    expected = hmac.new(secret, check.encode(), hashlib.sha256).hexdigest()
    if not received or not hmac.compare_digest(expected, received):
        raise ValueError('Подпись Telegram не совпадает')
    try:
        age = time.time() - int(parsed.get('auth_date', '0'))
        user = json.loads(parsed.get('user', '{}'))
    except (ValueError, TypeError) as exc:
        raise ValueError('Некорректные данные Telegram') from exc
    if not -60 <= age <= 86400:
        raise ValueError('Данные Telegram устарели. Откройте каталог заново')
    if not isinstance(user, dict) or type(user.get('id')) is not int or user['id'] <= 0:
        raise ValueError('Не определён пользователь Telegram')
    return user

def _validate_items(raw_items, catalog_index):
    if not isinstance(raw_items, list) or not 1 <= len(raw_items) <= 20:
        raise ValueError('В корзине должно быть от 1 до 20 позиций')
    items = []
    for raw in raw_items:
        if not isinstance(raw, dict):
            raise ValueError('Некорректная позиция корзины')
        name, brand = raw.get('name'), raw.get('brand')
        volume, qty = raw.get('volume'), raw.get('qty', raw.get('quantity', 1))
        if not isinstance(name, str) or not isinstance(brand, str):
            raise ValueError('Некорректное название аромата')
        if type(volume) is not int or volume not in (5, 10) or type(qty) is not int or not 1 <= qty <= 99:
            raise ValueError('Некорректный объём или количество')
        product = catalog_index.get((name, brand))
        if not product:
            raise ValueError('Аромат недоступен: ' + name)
        price = product.get('price5' if volume == 5 else 'price10')
        if type(price) is not int or price <= 0:
            raise ValueError('Некорректная цена товара')
        items.append(dict(name=product['name'], brand=product.get('brand', ''), volume=volume, qty=qty, price=price, total=price * qty))
    return items, sum(item['total'] for item in items)

def _seller_text(order):
    lines = [f"Новый заказ {order['order_number']}", f"Покупатель: {order['customer_name']}", f"Контакт: {order['contact']}", '']
    for item in order['items']:
        lines.append(f"{item['name']} — {item['volume']} мл × {item['qty']} = {_money(item['total'])}")
    lines.extend(['', 'Итого за товары: ' + _money(order['total']), 'Получение: ' + ('самовывоз' if order['receipt'] == 'pickup' else 'доставка')])
    if order['receipt'] == 'delivery':
        lines.extend(['Служба: ' + order['carrier'], 'Адрес: ' + order['address']])
    if order['comment']:
        lines.append('Комментарий: ' + order['comment'])
    return '\n'.join(lines)

def _notify_seller(order, bot_token, seller_chat_id):
    if not bot_token or not seller_chat_id:
        logger.warning('Seller notification not configured for %s', order['order_number'])
        return False
    text = _seller_text(order)
    try:
        for offset in range(0, len(text), 3000):
            body = json.dumps(dict(chat_id=seller_chat_id, text=text[offset:offset + 3000]), ensure_ascii=False).encode()
            request = urllib.request.Request('https://api.telegram.org/bot' + bot_token + '/sendMessage', data=body, headers={'Content-Type': 'application/json'})
            with urllib.request.urlopen(request, timeout=10) as response:
                if not json.loads(response.read()).get('ok'):
                    return False
        return True
    except Exception:
        logger.error('Seller notification failed for %s', order['order_number'])
        return False

def create_order(payload, catalog_index, bot_token, seller_chat_id):
    if not isinstance(payload, dict):
        raise ValueError('Некорректный запрос заказа')
    user = validate_init_data(payload.get('initData'), bot_token)
    items, total = _validate_items(payload.get('items'), catalog_index)
    customer = payload.get('customer')
    if not isinstance(customer, dict):
        raise ValueError('Заполните данные покупателя')
    fields = {}
    for key, maximum in dict(name=100, contact=100, carrier=40, address=300, comment=500).items():
        value = customer.get(key, '')
        if not isinstance(value, str) or len(value) > maximum:
            raise ValueError('Некорректное поле: ' + key)
        fields[key] = value.strip()
    receipt = customer.get('receipt')
    if not fields['name'] or not fields['contact'] or receipt not in ('pickup', 'delivery'):
        raise ValueError('Укажите имя, контакт и способ получения')
    if receipt == 'delivery' and not fields['address']:
        raise ValueError('Укажите адрес доставки')
    now = int(time.time())
    with _connect() as conn:
        conn.execute('BEGIN IMMEDIATE')
        number = '59-' + str(conn.execute('SELECT COALESCE(MAX(id), 0) + 1 FROM orders').fetchone()[0]).zfill(4)
        cursor = conn.execute('''INSERT INTO orders (order_number,user_id,username,customer_name,contact,receipt,carrier,address,comment,items_json,total,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,'new',?,?)''', (number,user['id'],user.get('username',''),fields['name'],fields['contact'],receipt,fields['carrier'],fields['address'] if receipt == 'delivery' else '',fields['comment'],json.dumps(items,ensure_ascii=False),total,now,now))
        order_id = cursor.lastrowid
    order = get_order(number, user['id'])
    notified = _notify_seller(order, bot_token, seller_chat_id)
    return dict(ok=True, order_id=order_id, order_number=number, total=total, status='new', status_label=STATUS_LABELS['new'], seller_notified=notified)

def _order_to_dict(row):
    result = dict(row)
    result['items'] = json.loads(result.pop('items_json'))
    result['status_label'] = STATUS_LABELS.get(result['status'], result['status'])
    return result

def get_order(order_number, user_id):
    with _connect() as conn:
        row = conn.execute('SELECT * FROM orders WHERE order_number=? AND user_id=?', (order_number,user_id)).fetchone()
    if row is None:
        raise ValueError('Заказ не найден')
    return _order_to_dict(row)

def list_orders(user_id, limit=20):
    with _connect() as conn:
        rows = conn.execute('SELECT * FROM orders WHERE user_id=? ORDER BY id DESC LIMIT ?', (user_id,limit)).fetchall()
    return [_order_to_dict(row) for row in rows]

def update_status(order_number, status):
    if not isinstance(status, str) or status not in STATUS_LABELS:
        raise ValueError('Недопустимый статус заказа')
    with _connect() as conn:
        cursor = conn.execute('UPDATE orders SET status=?, updated_at=? WHERE order_number=?', (status,int(time.time()),order_number))
        if cursor.rowcount != 1:
            raise ValueError('Заказ не найден')
    return dict(ok=True, order_number=order_number, status=status)
