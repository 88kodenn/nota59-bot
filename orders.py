import hashlib
import hmac
import json
import logging
import os
import sqlite3
import time
import urllib.parse
import urllib.request
from pathlib import Path

BASE = Path(__file__).resolve().parent
DB_PATH = BASE / "orders.db"
logger = logging.getLogger("catalog.orders")

STATUS_LABELS = {
    "new": "новый",
    "confirmed": "подтверждён",
    "shipped": "отправлен",
    "cancelled": "отменён",
}
ALLOWED_STATUSES = tuple(STATUS_LABELS)


def _connect():
    conn = sqlite3.connect(DB_PATH, timeout=15)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn


def init_db():
    with _connect() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_number TEXT UNIQUE NOT NULL,
                user_id INTEGER,
                username TEXT,
                customer_name TEXT NOT NULL,
                contact TEXT NOT NULL,
                receipt TEXT NOT NULL,
                carrier TEXT,
                address TEXT,
                comment TEXT,
                items_json TEXT NOT NULL,
                total INTEGER NOT NULL,
                status TEXT NOT NULL DEFAULT 'new',
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL
            )
        """)


def _money(value):
    return f"{value:,}".replace(",", " ") + " ₽"


def validate_init_data(init_data, bot_token):
    if not init_data or not bot_token:
        raise ValueError("Не переданы данные Telegram или токен бота")

    parsed = dict(urllib.parse.parse_qsl(init_data, keep_blank_values=True))
    received_hash = parsed.pop("hash", "")
    if not received_hash:
        raise ValueError("В initData нет подписи Telegram")

    data_check_string = "\n".join(
        f"{key}={value}" for key, value in sorted(parsed.items())
    )
    secret_key = hmac.new(b"WebAppData", bot_token.encode(), hashlib.sha256).digest()
    calculated_hash = hmac.new(
        secret_key, data_check_string.encode(), hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(calculated_hash, received_hash):
        raise ValueError("Подпись Telegram не совпадает")

    auth_date = int(parsed.get("auth_date", "0") or 0)
    if not auth_date or time.time() - auth_date > 86400:
        raise ValueError("Данные Telegram устарели")

    try:
        user = json.loads(parsed.get("user", "{}"))
    except json.JSONDecodeError as exc:
        raise ValueError("Некорректные данные пользователя Telegram") from exc

    user_id = user.get("id")
    if not isinstance(user_id, int):
        raise ValueError("Не определён пользователь Telegram")

    return user


def _next_order_number(conn):
    next_id = conn.execute("SELECT COALESCE(MAX(id), 0) + 1 FROM orders").fetchone()[0]
    return f"59-{next_id:04d}"


def _validate_items(raw_items, catalog_index):
    if not isinstance(raw_items, list) or not raw_items:
        raise ValueError("Корзина пуста")

    cleaned = []
    total = 0

    for raw in raw_items:
        if not isinstance(raw, dict):
            raise ValueError("Некорректная позиция корзины")

        name = str(raw.get("name", "")).strip()
        brand = str(raw.get("brand", "")).strip()
        volume = raw.get("volume")
        quantity = raw.get("qty", raw.get("quantity", 1))

        if not name or volume not in (5, 10):
            raise ValueError("Некорректный аромат или объём")

        try:
            quantity = int(quantity)
        except (TypeError, ValueError) as exc:
            raise ValueError("Некорректное количество") from exc

        if not 1 <= quantity <= 99:
            raise ValueError("Количество должно быть от 1 до 99")

        product = catalog_index.get((name, brand))
        if not product:
            raise ValueError(f"Аромат недоступен: {name}")

        price = product.get("price5" if volume == 5 else "price10")
        if not isinstance(price, (int, float)) or price <= 0:
            raise ValueError(f"Не найдена цена для {name}")

        line_total = int(price) * quantity
        total += line_total
        cleaned.append({
            "name": name,
            "brand": brand,
            "volume": volume,
            "qty": quantity,
            "price": int(price),
            "total": line_total,
        })

    return cleaned, total


def _seller_text(order):
    lines = [
        f"Новый заказ {order['order_number']}",
        "",
        f"Покупатель: {order['customer_name']}",
        f"Контакт: {order['contact']}",
    ]

    if order["username"]:
        lines.append(f"Telegram: @{order['username']}")

    lines.extend(["", "Товары:"])

    for index, item in enumerate(order["items"], 1):
        lines.append(
            f"{index}. {item['brand']} — {item['name']} — "
            f"{item['volume']} мл × {item['qty']} = {_money(item['total'])}"
        )

    lines.extend([
        "",
        f"Итого за товары: {_money(order['total'])}",
        f"Получение: {'самовывоз' if order['receipt'] == 'pickup' else 'доставка'}",
    ])

    if order["receipt"] == "delivery":
        lines.append(f"Служба: {order['carrier'] or 'не выбрана'}")
        lines.append(f"Адрес: {order['address'] or 'не указан'}")

    if order["comment"]:
        lines.extend(["", f"Комментарий: {order['comment']}"])

    return "\n".join(lines)


def _notify_seller(order, bot_token, seller_chat_id):
    if not bot_token or not seller_chat_id:
        logger.warning(
            "Уведомление о заказе %s не отправлено: BOT_TOKEN или SELLER_CHAT_ID не заданы",
            order["order_number"],
        )
        return False

    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    payload = urllib.parse.urlencode({
        "chat_id": seller_chat_id,
        "text": _seller_text(order),
        "disable_web_page_preview": "true",
    }).encode()

    request = urllib.request.Request(
        url,
        data=payload,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )

    try:
        with urllib.request.urlopen(request, timeout=10) as response:
            result = json.loads(response.read().decode())

        if not result.get("ok"):
            logger.error("Telegram отклонил уведомление: %s", result)
            return False

        return True
    except Exception:
        logger.exception(
            "Не удалось отправить уведомление о заказе %s",
            order["order_number"],
        )
        return False


def create_order(payload, catalog_index, bot_token, seller_chat_id):
    if not isinstance(payload, dict):
        raise ValueError("Некорректный запрос заказа")

    user = validate_init_data(payload.get("initData", ""), bot_token)
    items, total = _validate_items(payload.get("items"), catalog_index)

    customer = payload.get("customer") or {}
    customer_name = str(customer.get("name", "")).strip()
    contact = str(customer.get("contact", "")).strip()
    receipt = customer.get("receipt", "delivery")
    carrier = str(customer.get("carrier", "")).strip()
    address = str(customer.get("address", "")).strip()
    comment = str(customer.get("comment", "")).strip()

    if not customer_name:
        raise ValueError("Укажите имя")

    if not contact:
        raise ValueError("Укажите телефон или Telegram")

    if receipt not in ("delivery", "pickup"):
        raise ValueError("Выберите способ получения")

    if receipt == "delivery" and not address:
        raise ValueError("Укажите адрес доставки")

    now = int(time.time())

    with _connect() as conn:
        order_number = _next_order_number(conn)
        cursor = conn.execute("""
            INSERT INTO orders (
                order_number, user_id, username, customer_name, contact,
                receipt, carrier, address, comment, items_json, total,
                status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', ?, ?)
        """, (
            order_number,
            user["id"],
            user.get("username", ""),
            customer_name,
            contact,
            receipt,
            carrier,
            address if receipt == "delivery" else "",
            comment,
            json.dumps(items, ensure_ascii=False),
            total,
            now,
            now,
        ))
        order_id = cursor.lastrowid

    order = get_order(order_number, user["id"])
    notified = _notify_seller(order, bot_token, seller_chat_id)

    return {
        "ok": True,
        "order_id": order_id,
        "order_number": order_number,
        "total": total,
        "status": "new",
        "status_label": STATUS_LABELS["new"],
        "seller_notified": notified,
    }


def _order_to_dict(row):
    return {
        "order_number": row["order_number"],
        "user_id": row["user_id"],
        "username": row["username"],
        "customer_name": row["customer_name"],
        "contact": row["contact"],
        "receipt": row["receipt"],
        "carrier": row["carrier"],
        "address": row["address"],
        "comment": row["comment"],
        "items": json.loads(row["items_json"]),
        "total": row["total"],
        "status": row["status"],
        "status_label": STATUS_LABELS.get(row["status"], row["status"]),
        "created_at": row["created_at"],
        "updated_at": row["updated_at"],
    }


def get_order(order_number, user_id):
    with _connect() as conn:
        row = conn.execute(
            "SELECT * FROM orders WHERE order_number = ? AND user_id = ?",
            (order_number, user_id),
        ).fetchone()

    if not row:
        raise ValueError("Заказ не найден")

    return _order_to_dict(row)


def list_orders(user_id, limit=20):
    with _connect() as conn:
        rows = conn.execute("""
            SELECT * FROM orders
            WHERE user_id = ?
            ORDER BY id DESC
            LIMIT ?
        """, (user_id, limit)).fetchall()

    return [_order_to_dict(row) for row in rows]


def update_status(order_number, status):
    if status not in ALLOWED_STATUSES:
        raise ValueError("Недопустимый статус заказа")

    with _connect() as conn:
        cursor = conn.execute(
            "UPDATE orders SET status = ?, updated_at = ? WHERE order_number = ?",
            (status, int(time.time()), order_number),
        )

        if cursor.rowcount != 1:
            raise ValueError("Заказ не найден")

    return {
        "ok": True,
        "order_number": order_number,
        "status": status,
    }
