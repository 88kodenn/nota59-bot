"""Isolated Mini App card experiment; revert its commit to disable."""
import json
from urllib.parse import quote

OLD = 'Ex Nihilo Blue Talisman'
NAME = 'Ex Nihilo Blue Talisman Extrait'
SOURCE = 'https://us.ex-nihilo-paris.com/products/blue-talisman-extrait'
INTRO = 'Сочная груша, белые цветы и мягкое ванильно-древесное тепло.'
SECTIONS = [
    ('Как раскрывается', 'Первое впечатление: груша задаёт фруктовую сочность, бергамот добавляет цитрусовую свежесть.\n\nПосле раскрытия: цветок апельсина соединяется с жасмином самбак. Производитель описывает цветочное сердце как тёплое, округлое и солнечное.\n\nВ завершении: ваниль и сандал делают основу мягче и фактурнее. Мускусы, Ambrofix и амбровая древесина поддерживают глубину. Точное время переходов индивидуально.'),
    ('Характер аромата', 'Направление: фруктово-цветочное, с древесно-амбровой основой.\nСвежая сторона: груша и бергамот.\nТёплая сторона: ваниль, сандал и амбровая древесина.\nЦветочная сторона: цветок апельсина и жасмин.\n\nПо описанию производителя, Extrait — более глубокая и насыщенная интерпретация оригинала. Числовые оценки сладости, стойкости и шлейфа не выставлены.'),
    ('Когда и куда носить', 'Рекомендация «Ноты 59»: рассмотрите его для встреч, прогулок и вечерних выходов, когда хочется фруктово-цветочного аромата с тёплым продолжением.\n\nДля офиса и закрытых помещений сначала оцените комфортную дозировку на себе. Сезонные рекомендации — ориентир, а не ограничение.'),
    ('Первое знакомство', 'Впервые пробуете этот аромат? Начните с 5 мл.\n\nОцените отдельно грушевое начало, цветочное раскрытие и ванильно-древесное завершение. Важно, чтобы нравилось не только первое впечатление, но и то, что остаётся после него.\n\nСтойкость и заметность индивидуальны. Концентрация Extrait не гарантирует конкретного количества часов звучания.')
]
LIKES = ['Ищете фруктовый аромат со свежим началом и мягким, тёплым продолжением.', 'Вам близко сочетание груши, белых цветов и ванильно-древесных оттенков.', 'Хотите познакомиться с более насыщенной интерпретацией Blue Talisman.']
CAUTIONS = ['Ищете исключительно прохладный цитрусовый аромат без ванильного тепла.', 'Не любите белоцветочные композиции или сладковатые оттенки груши.', 'Предпочитаете сухую древесину без выраженной фруктово-цветочной части.']
NOTES = 'Верх: груша, бергамот.\nСердце: цветок апельсина, жасмин.\nБаза: сандал, ваниль, мускус, Ambrofix, амбровая древесина.'
DESCRIPTION = INTRO + '\n\nЭто Extrait de Parfum, а не исходная версия Eau de Parfum.\n\n' + '\n\n'.join(title + '\n' + text for title, text in SECTIONS)
SCRIPT = r'''
(() => {
'use strict';
const config=__CONFIG__;
const make=(tag,text)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;return e;};
const start=()=>{
 const dialog=document.getElementById('dialog'),title=document.getElementById('title'),description=document.getElementById('description');
 if(!dialog||!title||!description||document.getElementById('n59-blue-card-style'))return;
 const aliases=window.nota59SearchAliases||(window.nota59SearchAliases={});
 aliases[config.name]=(aliases[config.old]||'экс нихило экснихило блю талисман')+' экстракт экстрат extrait';
 const style=make('style');style.id='n59-blue-card-style';style.textContent=`
 #n59-blue-overview,#n59-blue-details{font:400 14px/1.7 var(--sans);color:var(--text);overflow-wrap:anywhere}
 #n59-blue-overview h4{font:500 18px/1.4 var(--sans);color:var(--gold);margin:18px 0 8px}
 #n59-blue-overview ul{padding-left:20px;margin:8px 0}#n59-blue-overview li{margin:7px 0}
 #n59-blue-overview .blue-tags{display:flex;flex-wrap:wrap;gap:6px;margin:12px 0}
 #n59-blue-overview .blue-tags span{padding:5px 9px;border:1px solid var(--line);border-radius:16px;font-size:12px}
 #n59-blue-overview .blue-label,#n59-blue-details .blue-source{font-size:12px;color:var(--muted)}
 #n59-blue-details details{border-top:1px solid var(--line);padding:12px 0}
 #n59-blue-details summary{cursor:pointer;min-height:44px;display:list-item;align-content:center;color:var(--gold);font-weight:500}
 #n59-blue-details p{white-space:pre-line;margin:10px 0}#n59-blue-details a{color:var(--gold)}
 `;document.head.append(style);
 const overview=make('section');overview.id='n59-blue-overview';
 const details=make('section');details.id='n59-blue-details';
 let hidden=[];
 const restore=()=>{for(const [e,value] of hidden)e.style.display=value;hidden=[];overview.remove();details.remove();};
 const paint=()=>{
  restore();
  const name=title.textContent.trim();
  if(!['Blue Talisman Extrait',config.name].includes(name))return;
  const volumes=dialog.querySelector('.volumes');
  if(!volumes)return;
  overview.replaceChildren(make('p','Extrait de Parfum'),make('p',config.intro));
  const tags=make('div');tags.className='blue-tags';
  for(const t of ['Фруктово-цветочный','Тёплая база','Ваниль и сандал'])tags.append(make('span',t));
  overview.append(tags);
  for(const [heading,items] of [['Вам понравится, если…',config.likes],['Может не подойти, если…',config.cautions]]){
   const list=make('ul');for(const text of items)list.append(make('li',text));overview.append(make('h4',heading),list);
  }
  const label=make('p','Подбор по заявленной композиции — редакционные рекомендации «Ноты 59», а не гарантия индивидуального восприятия.');label.className='blue-label';overview.append(label);volumes.before(overview);
  details.replaceChildren();
  for(const [heading,text] of config.sections){const block=make('details');block.append(make('summary',heading),make('p',text));details.append(block);}
  const source=make('p','Ноты и описание версии — по данным EX NIHILO. '),link=make('a','Официальная страница');source.className='blue-source';link.href=config.source;link.target='_blank';link.rel='noopener noreferrer';source.append(link);details.append(source);
  const heading=description.previousElementSibling;
  for(const e of [description,heading?.tagName==='H3'?heading:null])if(e){hidden.push([e,e.style.display]);e.style.display='none';}
  description.before(details);
 };
 new MutationObserver(paint).observe(title,{childList:true,subtree:true,characterData:true});
 paint();
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
'''


def install(app):
    if getattr(app, '_n59_blue_card_installed', False):
        return
    original_load = app.load_catalog
    original_server = app.ThreadingHTTPServer
    config = dict(name=NAME, old=OLD, intro=INTRO, likes=LIKES, cautions=CAUTIONS, sections=SECTIONS, source=SOURCE)
    script = SCRIPT.replace('__CONFIG__', json.dumps(config, ensure_ascii=False)).encode('utf-8')

    def load_catalog():
        raw, photos = original_load()
        payload = json.loads(raw)
        for item in payload['items']:
            if item.get('name') in (OLD, NAME):
                item.update(name=NAME, description=DESCRIPTION, notes=NOTES)
                if not item.get('image'):
                    item['image'] = 'https://raw.githubusercontent.com/88kodenn/nota59-bot/refs/heads/feature/orders-mvp/' + quote('Ex nihilo blue talisman .JPG', safe='')
        for names in payload.get('pickerCategories', {}).values():
            if isinstance(names, list):
                names[:] = [NAME if name == OLD else name for name in names]
        return json.dumps(payload, ensure_ascii=False).encode('utf-8'), photos

    def server(address, handler):
        original_send = handler._send

        def send(self, status, body, mime):
            if status == 200 and mime.startswith('text/html') and b'id="catalog"' in body:
                body = body.replace(b'</body>', b'<script>' + script + b'</script></body>', 1)
            return original_send(self, status, body, mime)

        handler._send = send
        return original_server(address, handler)

    app.load_catalog = load_catalog
    app.ThreadingHTTPServer = server
    app._n59_blue_card_installed = True
