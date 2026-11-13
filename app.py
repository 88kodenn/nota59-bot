import ast
import json
import logging
import os
from pathlib import Path
import runpy
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlsplit
from catalog_note_fixes import apply_note_fixes

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
            if isinstance(node, ast.Assign) and any(isinstance(t, ast.Name) and t.id == 'CATEGORIES' for t in node.targets):
                categories = ast.literal_eval(node.value)
                if isinstance(categories, dict):
                    return {key: list(names) for key, names in categories.items() if isinstance(key, str) and isinstance(names, (list, tuple)) and all(isinstance(name, str) for name in names)}
    except (OSError, SyntaxError, ValueError, TypeError):
        logger.exception('Не удалось загрузить подборки ароматов')
    return {}


def load_catalog():
    tree = ast.parse((BASE / 'main.py').read_text(encoding='utf-8'))
    values = {}
    for node in tree.body:
        if isinstance(node, ast.Assign):
            for target in node.targets:
                if isinstance(target, ast.Name) and target.id in {'CATALOG', 'SELLER', 'BRAND_WORDS'}:
                    try:
                        values[target.id] = ast.literal_eval(node.value)
                    except (ValueError, SyntaxError) as exc:
                        raise ValueError(f'Некорректное значение {target.id}: {exc}') from exc

    required = {'CATALOG', 'SELLER', 'BRAND_WORDS'}
    missing = required - values.keys()
    if missing:
        raise ValueError(f'Не найдены обязательные переменные: {", ".join(sorted(missing))}')

    brands = list(values['BRAND_WORDS'])
    items = []
    photos = {}
    for i, entry in enumerate(values['CATALOG']):
        try:
            name, p5, p10, description, notes, photo = entry
        except (TypeError, ValueError) as exc:
            logger.warning('Пропущена некорректная запись каталога #%s: %s', i, exc)
            continue

        image = None
        if photo:
            path = _safe_photo_path(str(photo))
            if path:
                image = f'/photos/{i}'
                photos[image] = path

        brand = next((b for b in brands if name.startswith(b + ' ')), '')
        items.append(dict(name=name, brand=brand, price5=p5, price10=p10, description=description, notes=notes, image=image))

    try:
        arrivals = json.loads((BASE / 'new_arrivals.json').read_text(encoding='utf-8'))
    except (OSError, json.JSONDecodeError) as exc:
        logger.warning('Не удалось загрузить new_arrivals.json: %s', exc)
        arrivals = []

    if not isinstance(arrivals, list):
        logger.warning('new_arrivals.json должен содержать список; значение проигнорировано')
        arrivals = []

    existing = {item['name'] for item in items}
    for arrival in arrivals:
        if not isinstance(arrival, dict) or not arrival.get('name'):
            logger.warning('Пропущена некорректная запись новинок: %r', arrival)
            continue
        if arrival['name'] not in existing:
            items.append(arrival)
            existing.add(arrival['name'])

    apply_note_fixes(items)
    return json.dumps(dict(items=items, seller=values['SELLER'], pickerCategories=load_picker_categories()), ensure_ascii=False).encode('utf-8'), photos


def main():
    catalog, photos = load_catalog()
    page = (BASE / 'web_catalog.html').read_bytes()
    scripts = b''.join(b'<script>' + (BASE / name).read_bytes() + b'</script>' for name in ('web_picker.js', 'note_pyramids.js', 'note_colors.js', 'web_rules.js', 'web_theme.js', 'web_new_arrivals.js', 'web_enhancements.js', 'note-realistic-icons.js', 'brand_ui.js'))
    page = page.replace(b'</body>', scripts + b'</body>', 1)
    # Keep legacy DOM anchors for cart initialization; hide only redundant product actions.
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
        def do_GET(self):
            try:
                path = urlsplit(self.path).path
                if path in ('/', '/index.html'):
                    body, mime = page, 'text/html; charset=utf-8'
                elif path == '/api/catalog':
                    body, mime = catalog, 'application/json; charset=utf-8'
                elif path == '/healthz':
                    body, mime = b'ok', 'text/plain; charset=utf-8'
                elif path in photos:
                    image = photos[path]
                    body = image.read_bytes()
                    mime = 'image/png' if image.suffix.lower() == '.png' else 'image/jpeg'
                else:
                    self.send_error(404)
                    return
                self.send_response(200)
                self.send_header('Content-Type', mime)
                self.send_header('Content-Length', str(len(body)))
                self.send_header('X-Content-Type-Options', 'nosniff')
                self.send_header('Referrer-Policy', 'no-referrer')
                self.send_header('Cache-Control', 'no-cache')
                self.end_headers()
                self.wfile.write(body)
            except (BrokenPipeError, ConnectionResetError):
                logger.debug('Клиент закрыл соединение')
            except Exception:
                logger.exception('Ошибка обработки запроса %s', self.path)
                try:
                    self.send_error(500)
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
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
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
