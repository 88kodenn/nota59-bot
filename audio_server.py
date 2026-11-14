"""Local audio adapter. Start with python audio_server.py."""
import logging
from pathlib import Path
from urllib.parse import urlsplit
import app
import banner_delivery

BASE = Path(__file__).resolve().parent
SOURCES = {
    '/assets/sounds/serving-wine.wav': 'FOODGware_Serving wine 1 (ID 1721)_BigSoundBank.com.wav',
    '/assets/sounds/champagne-cork.wav': 'FOODGware_Champagne cork 2 (ID 0648)_BigSoundBank.com.wav',
}
OLD_SELECTOR = b'#dialog #v5,#dialog #v10,#n59-order-submit,#n59-selected-plus,#n59-selected-minus,#n59-panel button[data-action="plus"],#n59-panel button[data-action="minus"]'
CAP_SELECTOR = b'#n59-selected-plus,#n59-selected-minus,#n59-panel button[data-action="plus"],#n59-panel button[data-action="minus"]'

def install():
    original_server = app.ThreadingHTTPServer
    script = (BASE / 'web_sounds.js').read_bytes()
    guard = b"if(document.getElementById('n59-volume-sound')?.getAttribute('aria-pressed')==='false'||token!==sequence"
    if script.count(b'if(token!==sequence') != 1:
        raise RuntimeError('Unexpected sample audio guard; review web_sounds.js')
    script = script.replace(b'if(token!==sequence', guard, 1)
    script += b"\ndocument.addEventListener('click',function(e){if(!(e.target instanceof Element)||!e.target.closest('#n59-volume-sound'))return;document.dispatchEvent(new Event('n59-audio-stop'));},true);\n"
    needle = b"document.addEventListener('visibilitychange',()=>{if(document.hidden){sequence++;if(active){try{active.stop();}catch(e){}active=null;}}});"
    replacement = b"function stopSample(){sequence++;if(active){try{active.stop();}catch(e){}active=null;}}document.addEventListener('n59-audio-stop',stopSample);document.addEventListener('visibilitychange',()=>{if(document.hidden)stopSample();});"
    if script.count(needle) != 1:
        raise RuntimeError('Unexpected sample audio stop handler; review web_sounds.js')
    script = script.replace(needle, replacement, 1)

    def server(address, handler):
        original_get = handler.do_GET
        original_send = handler._send

        def send(self, status, body, mime):
            if status == 200 and mime.startswith('text/html') and b'id="catalog"' in body:
                if OLD_SELECTOR not in body:
                    logging.getLogger(__name__).warning('Legacy sound selector not found; check deployment source')
                body = body.replace(OLD_SELECTOR, CAP_SELECTOR)
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
    banner_delivery.install(app, BASE)
    install()
    app.main()
