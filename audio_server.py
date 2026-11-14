"""Local audio adapter. Start with python audio_server.py instead of python app.py."""
import logging
from pathlib import Path
from http.server import ThreadingHTTPServer
from urllib.parse import urlsplit
import app

BASE = Path(__file__).resolve().parent
SOURCES = {
    '/assets/sounds/serving-wine.wav': 'FOODGware_Serving wine 1 (ID 1721)_BigSoundBank.com.wav',
    '/assets/sounds/champagne-cork.wav': 'FOODGware_Champagne cork 2 (ID 0648)_BigSoundBank.com.wav',
}

def install():
    original_server = app.ThreadingHTTPServer
    script = (BASE / 'web_sounds.js').read_bytes()

    def server(address, handler):
        original_get = handler.do_GET
        original_send = handler._send

        def send(self, status, body, mime):
            if status == 200 and mime.startswith('text/html'):
                body = body.replace(b'</body>', b'<script>' + script + b'</script></body>', 1)
            return original_send(self, status, body, mime)

        def get(self):
            name = SOURCES.get(urlsplit(self.path).path)
            if name is None:
                return original_get(self)
            try:
                body = (BASE / name).read_bytes()
            except OSError:
                logging.getLogger(__name__).exception('Audio source unavailable: %s', name)
                self.send_error(404)
                return
            if not (body[:4] == b'RIFF' and body[8:12] == b'WAVE'):
                self.send_error(415)
                return
            self._send(200, body, 'audio/wav')

        handler._send = send
        handler.do_GET = get
        handler.do_HEAD = get
        return original_server(address, handler)

    app.ThreadingHTTPServer = server

if __name__ == '__main__':
    install()
    app.main()
