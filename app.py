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
    hero_style = b'''<style id="n59-reference-hero">
.wrap .hero{display:block;min-height:0;padding:28px;border:1px solid var(--line);border-radius:16px;background:radial-gradient(ellipse at 100% 0,#8c602e24,transparent 70%),linear-gradient(135deg,#191610,#11100e)}
.wrap .hero:after{display:none}
.wrap .hero .hero-copy{display:grid;grid-template-columns:minmax(0,1fr) 154px;column-gap:18px;width:100%;max-width:100%;min-width:0}
.wrap .hero .eyebrow{grid-column:1/-1}
.wrap .hero .hero-copy h1{grid-column:1;min-width:0;min-height:270px;margin:14px 0 12px;overflow-wrap:anywhere}
.wrap .hero .hero-copy>p{grid-column:1/-1;max-width:100%;margin:0;line-height:1.7}
.wrap .hero .n59-picker-skip{grid-column:1/-1;max-width:100%;line-height:1.6}
.wrap .hero #n59-picker-open{grid-column:1/-1;max-width:100%;min-height:48px;margin-top:18px;padding:13px 20px;border:1px solid var(--gold);border-radius:999px;white-space:normal;overflow-wrap:anywhere;justify-self:start}
.wrap .hero .bottle{display:block;position:absolute;top:52px;right:28px;bottom:auto;width:140px;height:261px;border:0;border-radius:0;transform:none;box-shadow:none;pointer-events:none;background:transparent url("data:image/webp;base64,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") center/contain no-repeat}
.wrap .hero .bottle:before,.wrap .hero .bottle:after,.wrap .hero .bottle span{display:none}
.wrap .tools #brand-open,.wrap .tools input{border-radius:999px}
.wrap .tools #brand-open{border:1px solid #b58a4666}
.wrap #n59-arrival-tabs{border-bottom:0;gap:8px}
.wrap #n59-arrival-tabs button{border:1px solid #b58a4666;border-radius:999px;padding:10px 6px;min-height:52px;background:#191610}
.wrap #n59-arrival-tabs button[aria-pressed=true]{border-color:var(--gold);background:#dfbb7810;color:var(--gold)}
@media(max-width:699px){.wrap .hero{padding:24px 20px}.wrap .hero .hero-copy{grid-template-columns:minmax(0,1fr) 112px;column-gap:12px}.wrap .hero .hero-copy h1{min-height:205px}.wrap .hero #n59-picker-open{width:100%;max-width:100%;padding:13px 14px;justify-self:stretch}.wrap .hero .bottle{display:block;top:58px;right:20px;width:104px;height:194px}}
@media(max-width:359px){.wrap .hero{padding:22px 16px}.wrap .hero .hero-copy{grid-template-columns:minmax(0,1fr) 94px;column-gap:10px}.wrap .hero .hero-copy h1{min-height:180px}.wrap .hero .bottle{display:block;top:62px;right:16px;width:84px;height:157px}}
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
