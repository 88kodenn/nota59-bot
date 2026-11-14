"""Early banner discovery and content-versioned caching, isolated from API responses."""
import hashlib
import logging
from urllib.parse import parse_qs, urlsplit

PATH = '/assets/nota59-banner.jpg'
OLD_URL = PATH + '?v=cd5b4d08'


def install(app, base):
    try:
        image = (base / 'Nota59-banner.JPG').read_bytes()
    except OSError:
        logging.getLogger(__name__).exception('Banner optimisation skipped: image unavailable')
        return
    version = hashlib.sha256(image).hexdigest()[:16]
    url = PATH + '?v=' + version
    etag = '"' + version + '"'
    preload = ('<link rel="preload" as="image" fetchpriority="high" href="' + url + '">').encode()
    original_server = app.ThreadingHTTPServer

    def server(address, handler):
        original_get = handler.do_GET
        original_head = handler.do_HEAD
        original_send = handler._send

        def send(self, status, body, mime):
            if status == 200 and mime.startswith('text/html') and b'id="catalog"' in body:
                body = body.replace(OLD_URL.encode(), url.encode())
                body = body.replace(b'<head>', b'<head>' + preload, 1)
            return original_send(self, status, body, mime)

        def asset(self, head=False):
            parsed = urlsplit(self.path)
            if parsed.path != PATH:
                return original_head(self) if head else original_get(self)
            versioned = parse_qs(parsed.query).get('v') == [version]
            cache = 'public, max-age=31536000, immutable' if versioned else 'no-cache'
            tags = [tag.strip().removeprefix('W/') for tag in self.headers.get('If-None-Match', '').split(',')]
            unchanged = etag in tags or '*' in tags
            self.send_response(304 if unchanged else 200)
            self.send_header('ETag', etag)
            self.send_header('Cache-Control', cache)
            self.send_header('X-Content-Type-Options', 'nosniff')
            if not unchanged:
                self.send_header('Content-Type', 'image/jpeg')
                self.send_header('Content-Length', str(len(image)))
            self.end_headers()
            if not head and not unchanged:
                self.wfile.write(image)

        handler._send = send
        handler.do_GET = lambda self: asset(self)
        handler.do_HEAD = lambda self: asset(self, True)
        return original_server(address, handler)

    app.ThreadingHTTPServer = server
