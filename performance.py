"""Conservative catalogue performance adapter; originals remain unchanged."""
import hashlib
import io
import json
import logging
from functools import lru_cache
from urllib.parse import parse_qs, unquote, urlsplit
from PIL import Image, ImageOps

PREFIX = '/assets/fast-photo/'


def install(app, base):
    if getattr(app, '_n59_performance_installed', False):
        return
    resources, by_name = {}, {}
    for path in base.iterdir():
        if not path.is_file() or path.suffix.lower() not in {'.jpg', '.jpeg', '.png'}:
            continue
        if path.name == 'Nota59-banner.JPG':
            continue
        raw = path.read_bytes()
        digest = hashlib.sha256(b'jpeg-900-q80-v1' + raw).hexdigest()[:24]
        url = PREFIX + digest + '.jpg'
        resources[url] = raw
        by_name[path.name] = url
    old_catalog = app.load_catalog

    def load_catalog():
        body, photos = old_catalog()
        payload = json.loads(body)
        for item in payload.get('items', []):
            source = item.get('image')
            if not isinstance(source, str):
                continue
            local = photos.get(source)
            name = local.name if local else None
            parsed = urlsplit(source)
            if parsed.hostname == 'raw.githubusercontent.com' and parsed.path.startswith('/88kodenn/nota59-bot/'):
                name = unquote(parsed.path).rsplit('/', 1)[-1]
            if name in by_name:
                item['image'] = by_name[name]
        return json.dumps(payload, ensure_ascii=False).encode(), photos

    @lru_cache(maxsize=96)
    def thumbnail(path):
        raw = resources[path]
        try:
            with Image.open(io.BytesIO(raw)) as source:
                image = ImageOps.exif_transpose(source).convert('RGB')
                image.thumbnail((900, 900), Image.Resampling.LANCZOS)
                output = io.BytesIO()
                image.save(output, 'JPEG', quality=80, optimize=True, progressive=True)
                result = output.getvalue()
                return (result, 'image/jpeg') if len(result) < len(raw) else (raw, Image.MIME.get(source.format, 'image/jpeg'))
        except (OSError, ValueError):
            logging.getLogger(__name__).exception('Photo optimisation skipped: %s', path)
            return raw, 'image/jpeg'

    gift_urls = {key: by_name.get(name, '/assets/gift-original-' + key + '.jpg') for key, name in [('duo', 'Сет 2x10мл .JPG'), ('trio', 'Сет 3x5мл .JPG')]}
    gift_assignment = ('image.dataset.n59GiftSrc=(' + json.dumps(gift_urls) + ')[format];').encode()
    patches = [
        (b"document.addEventListener('pointerdown',unlock,{once:true,capture:true,passive:true});", b''),
        (b"document.addEventListener('keydown',unlock,{once:true,capture:true});", b''),
        (b"try{load();}catch(e){console.warn('Nota59 audio preload:',e.message);}", b''),
        (b"function unlock(){try{", b"function unlock(){if(document.getElementById('n59-volume-sound')?.getAttribute('aria-pressed')==='false')return;try{"),
        (b"async function play(kind,rate=1){", b"async function play(kind,rate=1){if(document.getElementById('n59-volume-sound')?.getAttribute('aria-pressed')==='false')return;"),
        (b"function switchTo(value){active=value;if(typeof data!=='undefined'&&data)window.render();applySection();}", b"function switchTo(value){active=value;applySection();}"),
        (b"$('search').oninput=window.render;", b"let n59SearchTimer;$('search').oninput=()=>{clearTimeout(n59SearchTimer);n59SearchTimer=setTimeout(()=>window.render(),120);};"),
        (b"photo.src=img.currentSrc||img.src;", b"const n59PhotoURL=new URL(img.currentSrc||img.src,location.href);if(n59PhotoURL.origin===location.origin&&n59PhotoURL.pathname.startsWith('/assets/fast-photo/'))n59PhotoURL.searchParams.set('original','1');photo.src=n59PhotoURL.href;"),
    ]
    connections = b'<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
    original_server = app.ThreadingHTTPServer

    def server(address, handler):
        old_send, old_get, old_head = handler._send, handler.do_GET, handler.do_HEAD
        cached_html = None
        cached_result = None

        def send(self, status, body, mime):
            nonlocal cached_html, cached_result
            if status == 200 and mime.startswith('text/html') and b'id="catalog"' in body:
                if body == cached_html:
                    return old_send(self, status, cached_result, mime)
                original = body
                for before, after in patches:
                    if body.count(before) == 1:
                        body = body.replace(before, after, 1)
                    else:
                        logging.getLogger(__name__).warning('Performance patch skipped: %r', before[:80])
                for assignment in [b"image.src='/assets/gift-'+format+'.jpg';", b"image.src='/assets/gift-original-'+format+'.jpg';", b"image.dataset.n59GiftSrc='/assets/gift-original-'+format+'.jpg';"]:
                    if body.count(assignment) == 1:
                        body = body.replace(assignment, gift_assignment, 1)
                        break
                body = body.replace(b'<head>', b'<head>' + connections, 1)
                cached_html, cached_result = original, body
            return old_send(self, status, body, mime)

        def asset(self, head=False):
            parsed = urlsplit(self.path)
            raw = resources.get(parsed.path)
            if raw is None:
                return old_head(self) if head else old_get(self)
            original = parse_qs(parsed.query).get('original') == ['1']
            body, mime = (raw, 'image/png' if raw.startswith(bytes([137, 80, 78, 71])) else 'image/jpeg') if original else thumbnail(parsed.path)
            etag = '"' + hashlib.sha256(body).hexdigest()[:24] + '"'
            tags = [tag.strip().removeprefix('W/') for tag in self.headers.get('If-None-Match', '').split(',')]
            unchanged = etag in tags or '*' in tags
            self.send_response(304 if unchanged else 200)
            self.send_header('ETag', etag)
            self.send_header('Cache-Control', 'public, max-age=31536000, immutable')
            self.send_header('X-Content-Type-Options', 'nosniff')
            if not unchanged:
                self.send_header('Content-Type', mime)
                self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            if not head and not unchanged:
                self.wfile.write(body)
        handler._send = send
        handler.do_GET = lambda self: asset(self)
        handler.do_HEAD = lambda self: asset(self, True)
        return original_server(address, handler)
    app.load_catalog = load_catalog
    app.ThreadingHTTPServer = server
    app._n59_performance_installed = True
