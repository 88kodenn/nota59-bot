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
    return json.dumps(dict(items=items, seller=values['SELLER']), ensure_ascii=False).encode('utf-8'), photos


def main():
    catalog, photos = load_catalog()
    page = (BASE / 'web_catalog.html').read_bytes()
    scripts = b''.join(b'<script>' + (BASE / name).read_bytes() + b'</script>' for name in ('note_pyramids.js', 'note_colors.js', 'web_rules.js', 'web_new_arrivals.js', 'note-realistic-icons.js'))
    page = page.replace(b'</body>', scripts + b'</body>', 1)

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
