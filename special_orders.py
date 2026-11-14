"""Special-order applications in the existing orders database."""
import hashlib
import html
import json
import os
import re
import time
from urllib.parse import urlsplit
import orders


def install(app, base):
    old_init = orders.init_db
    old_dict = orders._order_to_dict
    old_text = orders._seller_text
    old_page = app._order_page
    original_server = app.ThreadingHTTPServer
    script = (base / 'web_special_orders.js').read_bytes()

    def init_db():
        old_init()
        with orders._connect() as conn:
            columns = {row['name'] for row in conn.execute('PRAGMA table_info(orders)')}
            for name, definition in [('order_type', "TEXT NOT NULL DEFAULT 'catalog'"), ('request_key', 'TEXT'), ('request_hash', 'TEXT')]:
                if name not in columns:
                    conn.execute('ALTER TABLE orders ADD COLUMN ' + name + ' ' + definition)
            conn.execute('CREATE UNIQUE INDEX IF NOT EXISTS special_request_key ON orders(user_id, request_key) WHERE request_key IS NOT NULL')

    def to_dict(row):
        result = old_dict(row)
        if result.get('order_type') == 'special':
            result['total'] = None
            if result['status'] == 'new':
                result['status_label'] = 'на согласовании'
        result.pop('request_key', None)
        result.pop('request_hash', None)
        return result

    def seller_text(order):
        if order.get('order_type') != 'special':
            return old_text(order)
        item = order['items'][0]
        return '\n'.join(['Заявка на парфюмерию под заказ ' + order['order_number'], 'Покупатель: ' + order['customer_name'], 'Телефон: ' + order['contact'], 'Аромат: ' + item['name'], 'Объём: ' + str(item['volume']) + ' мл', 'Количество: ' + str(item['qty']), 'Комментарий: ' + order['comment'], 'Стоимость: уточняется. Не является подтверждением оплаты.'])

    def order_page(order):
        if order.get('order_type') != 'special':
            return old_page(order)
        text = html.escape(seller_text(order))
        status = html.escape(order['status_label'])
        return '<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Заявка</title></head><body><h1>Парфюмерия под заказ</h1><p>' + status + '</p><pre style="white-space:pre-wrap">' + text + '</pre></body></html>'

    def create(payload):
        if not isinstance(payload, dict):
            raise ValueError('Некорректная заявка')
        user = orders.validate_init_data(payload.get('initData'), os.environ.get('BOT_TOKEN', ''))
        fields = {}
        for name, maximum in [('fragrance', 200), ('name', 100), ('contact', 100), ('comment', 500)]:
            value = payload.get(name, '')
            if not isinstance(value, str) or len(value) > maximum:
                raise ValueError('Некорректное поле: ' + name)
            fields[name] = value.strip()
        if not all(fields[k] for k in ('fragrance', 'name', 'contact')):
            raise ValueError('Укажите аромат, имя и телефон')
        phone = fields['contact']
        if not re.fullmatch(r'[+0-9\s().-]+', phone) or not 7 <= len(re.sub(r'\D', '', phone)) <= 15:
            raise ValueError('Проверьте номер телефона')
        volume, qty = payload.get('volume'), payload.get('qty')
        if type(volume) is not int or not 1 <= volume <= 1000 or type(qty) is not int or not 1 <= qty <= 99:
            raise ValueError('Проверьте объём и количество')
        key = payload.get('requestKey')
        if not isinstance(key, str) or not re.fullmatch(r'[A-Za-z0-9-]{16,80}', key):
            raise ValueError('Некорректный ключ заявки')
        digest = hashlib.sha256(json.dumps([fields, volume, qty], ensure_ascii=False, sort_keys=True).encode()).hexdigest()
        item = dict(name=fields['fragrance'], brand='', volume=volume, qty=qty, price=None, total=None)
        now = int(time.time())
        duplicate = False
        with orders._connect() as conn:
            conn.execute('BEGIN IMMEDIATE')
            existing = conn.execute('SELECT * FROM orders WHERE user_id=? AND request_key=?', (user['id'], key)).fetchone()
            if existing:
                if existing['request_hash'] != digest:
                    raise ValueError('Данные заявки изменились. Обновите форму')
                number = existing['order_number']
                duplicate = True
            else:
                count = conn.execute("SELECT COUNT(*) FROM orders WHERE user_id=? AND order_type='special' AND created_at>?", (user['id'], now - 60)).fetchone()[0]
                if count >= 5:
                    raise ValueError('Слишком много заявок. Подождите минуту')
                number = '59-' + str(conn.execute('SELECT COALESCE(MAX(id),0)+1 FROM orders').fetchone()[0]).zfill(4)
                conn.execute('INSERT INTO orders (order_number,user_id,username,customer_name,contact,receipt,carrier,address,comment,items_json,total,status,created_at,updated_at,order_type,request_key,request_hash) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', (number,user['id'],str(user.get('username','')),fields['name'],phone,'request','','',fields['comment'],json.dumps([item],ensure_ascii=False),0,'new',now,now,'special',key,digest))
        order = orders.get_order(number, user['id'])
        notified = None if duplicate else orders._notify_seller(order, os.environ.get('BOT_TOKEN', ''), os.environ.get('SELLER_CHAT_ID', ''))
        return dict(ok=True, order_number=number, order_type='special', total=None, status=order['status'], status_label=order['status_label'], duplicate=duplicate, seller_notified=notified)

    def server(address, handler):
        old_post, old_send = handler.do_POST, handler._send
        def post(self):
            if urlsplit(self.path).path != '/api/special-orders':
                return old_post(self)
            try:
                self._json(201, create(self._read_json()))
            except ValueError as exc:
                self._error(400, str(exc))
            except Exception:
                orders.logger.exception('Special application processing failed')
                self._error(500, 'Не удалось подтвердить сохранение. Повторите проверку той же заявки')
        def send(self, status, body, mime):
            if status == 200 and mime.startswith('text/html') and b'id="catalog"' in body:
                old = "order.order_number+' — '+money(order.total)+' — '+order.status_label".encode()
                new = "order.order_number+' — '+(order.order_type==='special'?'Парфюмерия под заказ: '+order.items[0].name+' · '+order.items[0].volume+' мл × '+order.items[0].qty+' · цена уточняется':money(order.total))+' — '+order.status_label".encode()
                body = body.replace(old, new)
                body = body.replace(b'</body>', b'<script>' + script + b'</script></body>', 1)
            return old_send(self, status, body, mime)
        handler.do_POST, handler._send = post, send
        return original_server(address, handler)

    orders.init_db, orders._order_to_dict, orders._seller_text = init_db, to_dict, seller_text
    app._order_page, app.ThreadingHTTPServer = order_page, server
    return create
