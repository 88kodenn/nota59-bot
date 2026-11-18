"""Early hero rendering and versioned assets, isolated from API responses."""
import gzip
import hashlib
import logging
import re
from urllib.parse import parse_qs, urlsplit

PATH = '/assets/nota59-banner.jpg'
OLD_URL = PATH + '?v=cd5b4d08'
ICONS_PATH = '/assets/note-realistic-icons.js'
HERO = re.compile(rb'(<(?:section|div)\b[^>]*\bclass=["\'][^"\']*\bhero\b[^"\']*["\'][^>]*>)')


def install(app, base):
    try:
        image = (base / 'Nota59-banner.JPG').read_bytes()
    except OSError:
        logging.getLogger(__name__).exception('Banner optimisation skipped: image unavailable')
        return
    version = hashlib.sha256(image).hexdigest()[:16]
    url = PATH + '?v=' + version
    preload = ('<link rel="preload" as="image" fetchpriority="high" href="' + url + '">').encode()
    photo = ('<img class="n59-hero-photo" src="' + url + '" alt="" aria-hidden="true" loading="eager" decoding="async" fetchpriority="high">').encode()
    resources = {PATH: (image, 'image/jpeg', version)}
    icons = None
    try:
        icons = (base / 'note-realistic-icons.js').read_bytes()
        icon_version = hashlib.sha256(icons).hexdigest()[:16]
        resources[ICONS_PATH] = (icons, 'application/javascript; charset=utf-8', icon_version)
    except OSError:
        logging.getLogger(__name__).exception('External note icons skipped: source unavailable')
    compressed = {path: gzip.compress(data, mtime=0) for path, (data, mime, digest) in resources.items() if 'javascript' in mime}
    original_server = app.ThreadingHTTPServer

    def server(address, handler):
        original_get = handler.do_GET
        original_head = handler.do_HEAD
        original_send = handler._send

        def send(self, status, body, mime):
            if status == 200 and mime.startswith('text/html') and b'id="catalog"' in body:
                body = body.replace(OLD_URL.encode(), url.encode())
                body = body.replace(b'<head>', b'<head>' + preload, 1)
                body, count = HERO.subn(lambda match: match.group(1) + photo, body, count=1)
                if not count:
                    logging.getLogger(__name__).warning('Static hero insertion skipped: container not found')
                if icons is not None:
                    inline = b'<script>' + icons + b'</script>'
                    external = ('<script defer src="' + ICONS_PATH + '?v=' + icon_version + '"></script>').encode()
                    if body.count(inline) == 1:
                        body = body.replace(inline, external, 1)
                    else:
                        logging.getLogger(__name__).warning('External note icons skipped: inline block mismatch')
            return original_send(self, status, body, mime)

        def asset(self, head=False):
            parsed = urlsplit(self.path)
            resource = resources.get(parsed.path)
            if resource is None:
                return original_head(self) if head else original_get(self)
            data, mime, digest = resource
            use_gzip = False
            if parsed.path in compressed:
                for entry in self.headers.get('Accept-Encoding', '').lower().split(','):
                    parts = [part.strip() for part in entry.split(';')]
                    if parts[0] == 'gzip':
                        try:
                            quality = next((float(part[2:]) for part in parts[1:] if part.startswith('q=')), 1.0)
                        except ValueError:
                            quality = 0.0
                        use_gzip = quality > 0
                        break
            if use_gzip:
                data = compressed[parsed.path]
            etag = '"' + digest + ('-gzip' if use_gzip else '') + '"'
            versioned = parse_qs(parsed.query).get('v') == [digest]
            cache = 'public, max-age=31536000, immutable' if versioned else 'no-cache'
            tags = [tag.strip().removeprefix('W/') for tag in self.headers.get('If-None-Match', '').split(',')]
            unchanged = etag in tags or '*' in tags
            self.send_response(304 if unchanged else 200)
            self.send_header('ETag', etag)
            self.send_header('Cache-Control', cache)
            self.send_header('X-Content-Type-Options', 'nosniff')
            if parsed.path in compressed:
                self.send_header('Vary', 'Accept-Encoding')
            if use_gzip:
                self.send_header('Content-Encoding', 'gzip')
            if not unchanged:
                self.send_header('Content-Type', mime)
                self.send_header('Content-Length', str(len(data)))
            self.end_headers()
            if not head and not unchanged:
                self.wfile.write(data)

        handler._send = send
        handler.do_GET = lambda self: asset(self)
        handler.do_HEAD = lambda self: asset(self, True)
        return original_server(address, handler)

    app.ThreadingHTTPServer = server
