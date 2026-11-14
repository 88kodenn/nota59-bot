import ast
import json
import logging
import os
from pathlib import Path
import runpy
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlsplit, parse_qs
from catalog_note_fixes import apply_note_fixes
import orders

BASE = Path(__file__).resolve().parent
logger = logging.getLogger('catalog.app')


def _safe_photo_path(raw):
    if not raw:
        return None

    raw_path = Path(raw)
    if raw_path.is_absolute() or '..' in raw_path.parts:
        return None

    path = (BASE / raw).resolve()
    try:
        path.relative_to(BASE)
    except ValueError:
        return None

    if not path.is_file() or path.suffix.lower() not in {'.jpg', '.jpeg', '.png'}:
        return None

    return path


def load_picker_categories():
    try:
        tree = ast.parse((BASE / 'scent_picker.py').read_text(encoding='utf-8'))
        for node in tree.body:
            if isinstance(node, ast.Assign) and any(
                isinstance(target, ast.Name) and target.id == 'CATEGORIES'
                for target in node.targets
            ):
                categories = ast.literal_eval(node.value)
                if isinstance(categories, dict):
                    return {
                        key: list(names)
                        for key, names in categories.items()
                        if isinstance(key, str)
                        and isinstance(names, (list, tuple))
                        and all(isinstance(name, str) for name in names)
                    }
    except (OSError, SyntaxError, ValueError, TypeError):
        logger.exception('Не удалось загрузить подборки ароматов')

    return {}


def load_catalog():
    tree = ast.parse((BASE / 'main.py').read_text(encoding='utf-8'))
    values = {}

    for node in tree.body:
        if isinstance(node, ast.Assign):
            for target in node.targets:
                if isinstance(target, ast.Name) and target.id in {
                    'CATALOG', 'SELLER', 'BRAND_WORDS'
                }:
                    try:
                        values[target.id] = ast.literal_eval(node.value)
                    except (ValueError, SyntaxError) as exc:
                        raise ValueError(
                            f'Некорректное значение {target.id}: {exc}'
                        ) from exc

    required = {'CATALOG', 'SELLER', 'BRAND_WORDS'}
    missing = required - values.keys()

    if missing:
        raise ValueError(
            f'Не найдены обязательные переменные: {", ".join(sorted(missing))}'
        )

    brands = list(values['BRAND_WORDS'])
    items = []
    photos = {}

    for index, entry in enumerate(values['CATALOG']):
        try:
            name, price_5, price_10, description, notes, photo = entry
        except (TypeError, ValueError) as exc:
            logger.warning('Пропущена некорректная запись каталога #%s: %s', index, exc)
            continue

        image = None
        if photo:
            photo_path = _safe_photo_path(str(photo))
            if photo_path:
                image = f'/photos/{index}'
                photos[image] = photo_path

        brand = next(
            (brand for brand in brands if name.startswith(brand + ' ')),
            '',
        )
        items.append({
            'name': name,
            'brand': brand,
            'price5': price_5,
            'price10': price_10,
            'description': description,
            'notes': notes,
            'image': image,
        })

    try:
        arrivals = json.loads(
            (BASE / 'new_arrivals.json').read_text(encoding='utf-8')
        )
    except (OSError, json.JSONDecodeError) as exc:
        logger.warning('Не удалось загрузить new_arrivals.json: %s', exc)
        arrivals = []

    if not isinstance(arrivals, list):
        logger.warning(
            'new_arrivals.json должен содержать список; значение проигнорировано'
        )
        arrivals = []

    existing_names = {item['name'] for item in items}

    for arrival in arrivals:
        if not isinstance(arrival, dict) or not arrival.get('name'):
            logger.warning('Пропущена некорректная запись новинок: %r', arrival)
            continue

        if arrival['name'] not in existing_names:
            items.append(arrival)
            existing_names.add(arrival['name'])

    apply_note_fixes(items)

    catalog_payload = {
        'items': items,
        'seller': values['SELLER'],
        'pickerCategories': load_picker_categories(),
    }

    return (
        json.dumps(catalog_payload, ensure_ascii=False).encode('utf-8'),
        photos,
    )


def _format_money(value):
    return f'{value:,}'.replace(',', ' ') + ' ₽'


def _order_page(order):
    item_lines = []

    for item in order['items']:
        item_lines.append(
            f'<li>{item["brand"]} — {item["name"]} — '
            f'{item["volume"]} мл × {item["qty"]} — '
            f'{_format_money(item["total"])}</li>'
        )

    receipt = 'самовывоз' if order['receipt'] == 'pickup' else 'доставка'

    return f'''<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Заказ {order['order_number']} — НОТА 59</title>
<style>
body {{ margin: 0; padding: 24px; background: #0e0d0b; color: #f3eade; font-family: system-ui, sans-serif; }}
main {{ max-width: 560px; margin: auto; padding: 22px; background: #14120f; border: 1px solid #cda76430; border-radius: 16px; }}
h1 {{ margin: 0 0 16px; color: #dfbb78; font-size: 24px; }}
.status {{ display: inline-block; padding: 6px 12px; border: 1px solid #dfbb78; border-radius: 999px; color: #dfbb78; }}
ul {{ padding-left: 20px; }}
.total {{ color: #dfbb78; font-weight: 600; }}
</style>
</head>
<body>
<main>
<h1>Заказ {order['order_number']}</h1>
<p><span class="status">{order['status_label']}</span></p>
<ul>{''.join(item_lines)}</ul>
<p class="total">Итого за товары: {_format_money(order['total'])}</p>
<p>Получение: {receipt}</p>
</main>
</body>
</html>'''


def main():
    catalog, photos = load_catalog()
    catalog_data = json.loads(catalog)

    catalog_index = {
        (item['name'], item.get('brand', '')): item
        for item in catalog_data['items']
    }

    orders.init_db()

    bot_token = os.environ.get('BOT_TOKEN', '')
    seller_chat_id = os.environ.get('SELLER_CHAT_ID', '')
    admin_token = os.environ.get('ADMIN_TOKEN', '')

    page = (BASE / 'web_catalog.html').read_bytes()

    script_names = (
        'web_picker.js',
        'note_pyramids.js',
        'note_colors.js',
        'web_rules.js',
        'web_theme.js',
        'web_new_arrivals.js',
        'web_enhancements.js',
        'note-realistic-icons.js',
        'brand_ui.js',
        'web_orders.js',
    )

    scripts = b''.join(
        b'<script>' + (BASE / name).read_bytes() + b'</script>'
        for name in script_names
    )
    page = page.replace(b'</body>', scripts + b'</body>', 1)

    purchase_style = b'''<style id="n59-compact-purchase">
#dialog #order,#dialog #n59-add,#dialog .detail > .hint{display:none!important}
#dialog .purchase{display:grid!important;grid-template-columns:auto minmax(0,1fr);align-items:center;gap:10px;padding:10px 14px max(10px,env(safe-area-inset-bottom))}
#dialog #n59-detail-cart{min-width:0;width:100%;margin:0}
#dialog #n59-notice{grid-column:1/-1}
@media(max-width:360px){#dialog .purchase{grid-template-columns:minmax(0,1fr)}#dialog #chosen{font-size:18px}}
</style>'''
    page = page.replace(b'</head>', purchase_style + b'</head>', 1)

    hero_style = b'''<style id="n59-angular-hero">
.wrap .hero{display:block;min-height:0;padding:28px;border:1px solid var(--line);border-radius:16px;background:radial-gradient(ellipse at 100% 0,#8c602e24,transparent 70%),linear-gradient(135deg,#191610,#11100e)}
.wrap .hero:after{display:none}
.wrap .hero .hero-copy{display:grid;grid-template-columns:minmax(0,1fr) 106px;column-gap:18px;width:100%;max-width:100%;min-width:0}
.wrap .hero .eyebrow{grid-column:1/-1}
.wrap .hero .hero-copy h1{grid-column:1;min-width:0;min-height:150px;margin:14px 0 12px;overflow-wrap:anywhere}
.wrap .hero .hero-copy>p{grid-column:1/-1;max-width:100%;margin:0;line-height:1.7}
.wrap .hero .n59-picker-skip{grid-column:1/-1;max-width:100%;line-height:1.6}
.wrap .hero #n59-picker-open{grid-column:1/-1;max-width:100%;min-height:48px;margin-top:18px;padding:13px 20px;border-radius:10px;white-space:normal;overflow-wrap:anywhere;justify-self:start}
.wrap .hero .bottle{display:flex;position:absolute;top:76px;right:36px;bottom:auto;width:78px;height:116px;border:1px solid #9b8450;border-radius:3px;transform:none;background:linear-gradient(105deg,#343532 0%,#121412 13%,#090b0a 45%,#1d211e 85%,#353831 100%);box-shadow:inset 3px 0 4px #ffffff0b,inset -3px 0 5px #000a,0 12px 20px #0007;pointer-events:none}
.wrap .hero .bottle:before{top:-30px;left:-3px;width:82px;height:28px;border:1px solid #4e5049;border-radius:2px;background:linear-gradient(100deg,#484a43,#171916 30%,#272a24 75%,#505148);box-shadow:inset 0 2px 1px #ffffff15,0 3px 3px #0008}
.wrap .hero .bottle:after{inset:8px;border:1px solid #b59b592e;border-radius:1px}
.wrap .hero .bottle span{font:500 10px/1.4 var(--sans);letter-spacing:1px;color:#c8ae73}
@media(max-width:699px){.wrap .hero{padding:24px 20px}.wrap .hero .hero-copy{grid-template-columns:minmax(0,1fr) 72px;column-gap:12px}.wrap .hero .hero-copy h1{min-height:132px}.wrap .hero #n59-picker-open{width:100%;max-width:100%;padding:13px 14px;justify-self:stretch}.wrap .hero .bottle{display:flex;top:78px;right:24px;width:58px;height:96px}.wrap .hero .bottle:before{top:-26px;left:-3px;width:62px;height:24px}.wrap .hero .bottle span{font-size:8px;letter-spacing:.5px}}
@media(max-width:359px){.wrap .hero{padding:22px 16px}.wrap .hero .hero-copy{grid-template-columns:minmax(0,1fr) 58px;column-gap:10px}.wrap .hero .bottle{display:flex;right:19px;width:48px;height:86px}.wrap .hero .bottle:before{width:52px}.wrap .hero .bottle span{font-size:7px}}
</style>'''
    page = page.replace(b'</head>', hero_style + b'</head>', 1)

    class Handler(BaseHTTPRequestHandler):
        def _send(self, status, body, mime):
            self.send_response(status)
            self.send_header('Content-Type', mime)
            self.send_header('Content-Length', str(len(body)))
            self.send_header('X-Content-Type-Options', 'nosniff')
            self.send_header('Referrer-Policy', 'no-referrer')
            self.send_header('Cache-Control', 'no-cache')
            self.end_headers()
            self.wfile.write(body)

        def _json(self, status, payload):
            self._send(
                status,
                json.dumps(payload, ensure_ascii=False).encode('utf-8'),
                'application/json; charset=utf-8',
            )

        def _error(self, status, message):
            self._json(status, {'ok': False, 'error': message})

        def _read_json(self):
            content_length = int(self.headers.get('Content-Length', '0') or 0)

            if content_length <= 0 or content_length > 100000:
                raise ValueError('Некорректный размер запроса')

            return json.loads(
                self.rfile.read(content_length).decode('utf-8')
            )

        def do_GET(self):
            try:
                parsed_url = urlsplit(self.path)
                path = parsed_url.path
                query = parse_qs(parsed_url.query)

                if path in ('/', '/index.html'):
                    body, mime = page, 'text/html; charset=utf-8'
                elif path == '/api/catalog':
                    body, mime = catalog, 'application/json; charset=utf-8'
                elif path == '/api/orders':
                    init_data = query.get('init', [''])[0]
                    user = orders.validate_init_data(init_data, bot_token)
                    user_orders = orders.list_orders(user['id'])
                    self._json(200, {'ok': True, 'orders': user_orders})
                    return
                elif path.startswith('/order/'):
                    order_number = path.removeprefix('/order/')
                    init_data = query.get('init', [''])[0]
                    user = orders.validate_init_data(init_data, bot_token)
                    order = orders.get_order(order_number, user['id'])
                    self._send(
                        200,
                        _order_page(order).encode('utf-8'),
                        'text/html; charset=utf-8',
                    )
                    return
                elif path == '/healthz':
                    body, mime = b'ok', 'text/plain; charset=utf-8'
                elif path in photos:
                    image_path = photos[path]
                    body = image_path.read_bytes()
                    mime = 'image/png' if image_path.suffix.lower() == '.png' else 'image/jpeg'
                else:
                    self.send_error(404)
                    return

                self._send(200, body, mime)
            except (BrokenPipeError, ConnectionResetError):
                logger.debug('Клиент закрыл соединение')
            except ValueError as exc:
                self._error(400, str(exc))
            except Exception:
                logger.exception('Ошибка обработки запроса %s', self.path)
                try:
                    self.send_error(500)
                except Exception:
                    pass

        def do_POST(self):
            try:
                path = urlsplit(self.path).path

                if path == '/api/orders':
                    payload = self._read_json()
                    result = orders.create_order(
                        payload,
                        catalog_index,
                        bot_token,
                        seller_chat_id,
                    )
                    self._json(201, result)
                    return

                if path.startswith('/api/orders/') and path.endswith('/status'):
                    if not admin_token or self.headers.get('X-Admin-Key') != admin_token:
                        self._error(403, 'Доступ запрещён')
                        return

                    order_number = path.removeprefix('/api/orders/').removesuffix('/status')
                    payload = self._read_json()
                    result = orders.update_status(order_number, payload.get('status', ''))
                    self._json(200, result)
                    return

                self.send_error(404)
            except ValueError as exc:
                self._error(400, str(exc))
            except Exception:
                logger.exception('Ошибка обработки запроса %s', self.path)
                try:
                    self._error(500, 'Внутренняя ошибка сервера')
                except Exception:
                    pass

        do_HEAD = do_GET

        def log_message(self, fmt, *args):
            logger.info(fmt, *args)

    try:
        port = int(os.environ.get('PORT', '3000'))
    except ValueError:
        logger.warning('Некорректный PORT=%r, используется 3000', os.environ.get('PORT'))
        port = 3000

    server = ThreadingHTTPServer(('0.0.0.0', port), Handler)
    server.daemon_threads = True

    server_thread = threading.Thread(target=server.serve_forever, daemon=True)
    server_thread.start()

    try:
        runpy.run_path(str(BASE / 'main.py'), run_name='__main__')
    except SystemExit:
        raise
    except BaseException:
        logger.exception('Критическая ошибка в main.py')
        raise
    finally:
        server.shutdown()
        server.server_close()


if __name__ == '__main__':
    main()
