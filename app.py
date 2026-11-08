import ast
import json
import logging
import os
from pathlib import Path
import runpy
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlsplit

BASE = Path(__file__).resolve().parent

def load_catalog():
    tree = ast.parse((BASE / 'main.py').read_text(encoding='utf-8'))
    values = {}
    for node in tree.body:
        if isinstance(node, ast.Assign):
            for target in node.targets:
                if isinstance(target, ast.Name) and target.id in {'CATALOG', 'SELLER', 'BRAND_WORDS'}:
                    values[target.id] = ast.literal_eval(node.value)
    brands = list(values['BRAND_WORDS'])
    items = []
    photos = {}
    for i, (name, p5, p10, description, notes, photo) in enumerate(values['CATALOG']):
        image = None
        if photo:
            path = (BASE / photo).resolve()
            if path.parent == BASE and path.is_file() and path.suffix.lower() in {'.jpg', '.jpeg', '.png'}:
                image = '/photos/' + str(i)
                photos[image] = path
        items.append(dict(name=name, brand=next((b for b in brands if name.startswith(b + ' ')), ''), price5=p5, price10=p10, description=description, notes=notes, image=image))
    arrivals = json.loads((BASE / 'new_arrivals.json').read_text(encoding='utf-8'))
    existing = {item['name'] for item in items}
    for item in arrivals:
        if item['name'] not in existing:
            items.append(item)
            existing.add(item['name'])
    return json.dumps(dict(items=items, seller=values['SELLER']), ensure_ascii=False).encode('utf-8'), photos

def main():
    catalog, photos = load_catalog()
    page = (BASE / 'web_catalog.html').read_bytes()
    scripts = b''.join(b'<script>' + (BASE / name).read_bytes() + b'</script>' for name in ('note_pyramids.js', 'note_colors.js', 'web_rules.js', 'web_new_arrivals.js'))
    page = page.replace(b'</body>', scripts + b'</body>', 1)

    class Handler(BaseHTTPRequestHandler):
        def do_GET(self):
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

        def log_message(self, fmt, *args):
            logging.getLogger('catalog.http').info(fmt, *args)

    server = ThreadingHTTPServer(('0.0.0.0', int(os.environ.get('PORT', '3000'))), Handler)
    server.daemon_threads = True
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        runpy.run_path(str(BASE / 'main.py'), run_name='__main__')
    finally:
        server.shutdown()
        server.server_close()

if __name__ == '__main__':
    main()
