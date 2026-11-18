"""Gift photos, brand picker and vector shop-section icons."""
import logging
from urllib.parse import urlsplit

def install(app, base):
    if getattr(app, '_n59_gift_visuals_installed', False):
        return
    original_server = app.ThreadingHTTPServer
    script = (base / 'web_gift_brands.js').read_bytes()
    script += b'\n' + (base / 'section_icons.js').read_bytes()
    script += b'\n' + (base / 'gift_lazy.js').read_bytes()
    names = {
        '/assets/gift-original-duo.jpg': 'Сет 2x10мл .JPG',
        '/assets/gift-original-trio.jpg': 'Сет 3x5мл .JPG',
    }
    def server(address, handler):
        original_send, original_get, original_head = handler._send, handler.do_GET, handler.do_HEAD
        def send(self, status, body, mime):
            if status == 200 and mime.startswith('text/html') and b'id="catalog"' in body:
                body = body.replace(b"'/assets/gift-'+format+'.jpg", b"'/assets/gift-original-'+format+'.jpg")
                eager = b"image.src='/assets/gift-original-'+format+'.jpg';"
                lazy = b"image.dataset.n59GiftSrc='/assets/gift-original-'+format+'.jpg';"
                if body.count(eager) == 1:
                    body = body.replace(eager, lazy, 1)
                else:
                    logging.getLogger(__name__).warning('Gift lazy loading skipped: source assignment mismatch')
                body = body.replace(b'</body>', b'<script>' + script + b'</script></body>', 1)
            return original_send(self, status, body, mime)
        def asset(self, head=False):
            name = names.get(urlsplit(self.path).path)
            if name is None:
                return original_head(self) if head else original_get(self)
            try:
                body = (base / name).read_bytes()
            except OSError:
                logging.getLogger(__name__).exception('Original gift photo unavailable: %s', name)
                self.send_error(404)
                return
            self.send_response(200)
            self.send_header('Content-Type', 'image/jpeg')
            self.send_header('Content-Length', str(len(body)))
            self.send_header('Cache-Control', 'no-cache')
            self.send_header('X-Content-Type-Options', 'nosniff')
            self.end_headers()
            if not head:
                self.wfile.write(body)
        handler._send = send
        handler.do_GET = lambda self: asset(self)
        handler.do_HEAD = lambda self: asset(self, True)
        return original_server(address, handler)
    app.ThreadingHTTPServer = server
    app._n59_gift_visuals_installed = True
