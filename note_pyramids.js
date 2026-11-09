(() => {
'use strict';
let uid=0;
const art=Object.create(null);
const grad=(type,stops)=>{const id='g'+(++uid);const stopsMarkup=stops.map(([o,c])=>`<stop offset='${o}' stop-color='${c}'/>`).join('');const def=type==='rad'?`<radialGradient id='${id}' cx='35%' cy='30%' r='75%'>${stopsMarkup}</radialGradient>`:`<linearGradient id='${id}' x1='0' y1='0' x2='0' y2='1'>${stopsMarkup}</linearGradient>`;return {id,defs:`<defs>${def}</defs>`};};
const M={
citrus([a,b,c]){const g=grad('rad',[[0,a],[1,b]]);return `${g.defs}<circle cx='32' cy='34' r='20' fill='url(#${g.id})'/><path d='M32 14v40M12 34h40M18 20l28 28M46 20L18 48' stroke='${c}' stroke-width='2' opacity='.65' stroke-linecap='round'/><path d='M40 12q8-6 14 0-6 6-14 0z' fill='${c}'/>`;},
fruit([a,b,c]){const g=grad('rad',[[0,a],[1,b]]);return `${g.defs}<path d='M32 12c14 0 22 10 22 22s-8 20-22 20-22-8-22-20 8-22 22-22z' fill='url(#${g.id})'/><path d='M24 22c6-4 14-4 18 2' stroke='#fff' stroke-opacity='.55' stroke-width='3' stroke-linecap='round'/><path d='M32 12c2-6 8-8 12-6-2 6-8 8-12 6z' fill='${c}'/>`;},
spice([a,b,c]){const g=grad('lin',[[0,a],[1,b]]);return `${g.defs}<path d='M18 28h28v20a8 8 0 0 1-8 8H26a8 8 0 0 1-8-8z' fill='url(#${g.id})'/><path d='M22 28c2-6 18-6 20 0z' fill='${c}'/><circle cx='26' cy='40' r='2' fill='#fff' opacity='.5'/><circle cx='38' cy='44' r='2' fill='#fff' opacity='.35'/><rect x='26' y='18' width='12' height='6' rx='2' fill='${c}'/>`;},
flower([a,b,c]){const g=grad('rad',[[0,a],[1,b]]);let petals='';for(let i=0;i<5;i++){const ang=i*72;petals+=`<ellipse cx='32' cy='20' rx='7' ry='12' fill='url(#${g.id})' transform='rotate(${ang} 32 32)'/>`;}return `${g.defs}${petals}<circle cx='32' cy='32' r='6' fill='${c}'/>`;},
wood([a,b,c]){const g=grad('lin',[[0,a],[1,b]]);return `${g.defs}<ellipse cx='32' cy='32' rx='20' ry='13' fill='url(#${g.id})'/><ellipse cx='32' cy='32' rx='13' ry='8' fill='none' stroke='${c}' stroke-width='2'/><ellipse cx='32' cy='32' rx='6' ry='4' fill='none' stroke='${c}' stroke-width='2'/><path d='M12 32h40' stroke='${c}' stroke-width='1.5' opacity='.5'/>`;},
resin([a,b,c]){const g=grad('rad',[[0,a],[1,b]]);return `${g.defs}<path d='M32 10c10 8 16 16 16 24a16 16 0 1 1-32 0c0-8 6-16 16-24z' fill='url(#${g.id})'/><path d='M26 22c4-4 10-4 12 0' stroke='#fff' stroke-opacity='.5' stroke-width='3' stroke-linecap='round'/><circle cx='32' cy='40' r='3' fill='${c}' opacity='.6'/>`;},
gourmand([a,b,c]){const g=grad('lin',[[0,a],[1,b]]);return `${g.defs}<path d='M20 40c0-10 8-16 12-16s12 6 12 16-8 12-12 12-12-2-12-12z' fill='url(#${g.id})'/><path d='M24 36c4-4 12-4 16 0' stroke='${c}' stroke-width='2' fill='none'/><path d='M32 24V12' stroke='${c}' stroke-width='3' stroke-linecap='round'/><circle cx='32' cy='10' r='3' fill='${c}'/>`;},
leather([a,b,c]){const g=grad('lin',[[0,a],[1,b]]);return `${g.defs}<rect x='14' y='18' width='36' height='28' rx='6' fill='url(#${g.id})'/><path d='M20 24h24M20 40h24' stroke='${c}' stroke-width='2' stroke-dasharray='4 3'/><path d='M22 18v28M42 18v28' stroke='${c}' stroke-width='1.5' opacity='.6'/>`;},
musk([a,b,c]){const g=grad('rad',[[0,a],[1,b]]);return `${g.defs}<circle cx='32' cy='32' r='18' fill='url(#${g.id})'/><circle cx='26' cy='28' r='6' fill='#fff' opacity='.35'/><circle cx='38' cy='36' r='4' fill='#fff' opacity='.25'/>`;},
herb([a,b,c]){const g=grad('lin',[[0,a],[1,b]]);return `${g.defs}<path d='M32 56V20' stroke='${c}' stroke-width='3' stroke-linecap='round'/><path d='M32 28c-10-2-16-10-14-16 8 0 14 6 14 16z' fill='url(#${g.id})'/><path d='M32 36c10-2 16-10 14-16-8 0-14 6-14 16z' fill='url(#${g.id})'/>`;},
marine([a,b,c]){const g=grad('lin',[[0,a],[1,b]]);return `${g.defs}<path d='M8 40c8-8 16-8 24 0s16 8 24 0' stroke='${c}' stroke-width='3' fill='none' stroke-linecap='round'/><path d='M8 48c8-8 16-8 24 0s16 8 24 0' stroke='${c}' stroke-width='2' fill='none' opacity='.6'/><circle cx='32' cy='22' r='6' fill='url(#${g.id})'/>`;},
misc([a,b,c]){const g=grad('rad',[[0,a],[1,b]]);return `${g.defs}<path d='M32 10c8 10 14 18 14 26a14 14 0 1 1-28 0c0-8 6-16 14-26z' fill='url(#${g.id})'/><circle cx='28' cy='34' r='3' fill='#fff' opacity='.5'/><path d='M40 20l4-4' stroke='${c}' stroke-width='2'/>`;}
};
const NOTE_ART={
'орегано':['herb',['#a5d6a7','#2e7d32','#1b5e20']],
'перец':['spice',['#9e9e9e','#424242','#212121']],
'бергамот':['citrus',['#f7e96b','#e2b93b','#7a8b2f']],
'ладан':['resin',['#fff8e1','#ffe0b2','#ffcc80']],
'опопонакс':['resin',['#ffe0b2','#ffb74d','#ef6c00']],
'амбра':['resin',['#ffe082','#ffb300','#ef6c00']],
'лабданум':['resin',['#d7a86e','#a1662f','#5d3a1a']],
'уд':['wood',['#6d4c41','#3e2723','#1b0000']],
'кожа':['leather',['#8d6e63','#4e342e','#3e2723']],
'сандал':['wood',['#d7ccc8','#a1887f','#5d4037']],
'пачули':['wood',['#8d6e63','#4e342e','#3e2723']],
'лист фиалки':['flower',['#b39ddb','#7e57c2','#4527a0']],
'розмарин':['herb',['#a5d6a7','#2e7d32','#1b5e20']],
'корень ириса':['flower',['#b39ddb','#5e35b1','#311b92']],
'олибанум':['resin',['#fff8e1','#ffe0b2','#ffcc80']],
'мирра':['resin',['#ffe0b2','#ffb74d','#ef6c00']],
'ваниль':['gourmand',['#fff8e1','#ffe0b2','#ffcc80']],
'кедр':['wood',['#a1887f','#5d4037','#3e2723']],
'чёрная вишня':['fruit',['#ef9a9a','#b71c1c','#7f0000']],
'мате':['herb',['#a5d6a7','#2e7d32','#1b5e20']],
'нероли':['flower',['#fff8e1','#ffcc80','#ef6c00']],
'мускатный шалфей':['herb',['#a5d6a7','#2e7d32','#1b5e20']],
'мандарин':['citrus',['#ffb347','#e2762a','#a85b1f']],
'грейпфрут':['citrus',['#ff9a8a','#e05a4f','#a63c34']],
'лимон':['citrus',['#fdf06e','#e8c93a','#a08a1e']],
'табак':['wood',['#a1887f','#5d4037','#3e2723']],
'папирус':['wood',['#fff8e1','#d7ccc8','#a1887f']],
'жасмин':['flower',['#ffffff','#f8bbd0','#f48fb1']],
'мускус':['musk',['#f8bbd0','#f48fb1','#ad1457']],
'кашемировое дерево':['wood',['#d7ccc8','#a1887f','#5d4037']],
'ветивер':['wood',['#a1887f','#6d4c41','#3e2723']],
'мох':['misc',['#a5d6a7','#2e7d32','#1b5e20']],
'чёрная смородина':['fruit',['#b39ddb','#4a148c','#311b92']],
'яблоко':['fruit',['#ff5252','#c62828','#2e7d32']],
'розовый перец':['spice',['#f48fb1','#c2185b','#880e4f']],
'ананас':['fruit',['#ffe082','#f9a825','#7cb342']],
'берёза':['wood',['#eceff1','#b0bec5','#78909c']],
'дубовый мох':['misc',['#a1887f','#6d4c41','#3e2723']],
'Ambroxan':['musk',['#fff8e1','#ffe0b2','#ffcc80']],
'базилик':['herb',['#a5d6a7','#2e7d32','#1b5e20']],
'перец тимут':['spice',['#a5d6a7','#2e7d32','#1b5e20']],
'древесные ноты':['wood',['#a1887f','#5d4037','#3e2723']],
'груша':['fruit',['#aed581','#7cb342','#33691e']],
'цветок апельсина':['flower',['#ffffff','#ffcc80','#ef6c00']],
'Джордживуд':['wood',['#a1887f','#5d4037','#3e2723']],
'Амброфикс':['musk',['#fff8e1','#ffe0b2','#ffcc80']],
'кардамон':['spice',['#a5d6a7','#2e7d32','#1b5e20']],
'имбирь':['spice',['#ffe0b2','#e0a96d','#8d6e63']],
'восточные ноты':['misc',['#ffe0b2','#ffb74d','#ef6c00']],
'мята':['herb',['#a5d6a7','#2e7d32','#1b5e20']],
'бензоин':['resin',['#ffe0b2','#ffb74d','#ef6c00']],
'мёд':['gourmand',['#ffe082','#ffb300','#ef6c00']],
'апельсин':['citrus',['#ffb74d','#e07b26','#a85a1c']],
'цитрон':['citrus',['#ffee58','#d9b826','#9c841c']],
'кориандр':['herb',['#a5d6a7','#2e7d32','#1b5e20']],
'абрикос':['fruit',['#ffcc80','#ef6c00','#e65100']],
'майская роза':['flower',['#f8bbd0','#ec407a','#ad1457']],
'семена моркови':['herb',['#ffe0b2','#ef6c00','#bf360c']],
'инжир':['fruit',['#b39ddb','#6a1b9a','#4a148c']],
'финики':['fruit',['#d7ccc8','#8d6e63','#4e342e']],
'амбретта':['musk',['#ffe082','#ffb300','#ef6c00']],
'маракуйя':['fruit',['#ce93d8','#8e24aa','#4a148c']],
'фруктовые ноты':['fruit',['#ffab91','#d84315','#bf360c']],
'шафран':['spice',['#ffab91','#e64a19','#bf360c']],
'турецкая роза':['flower',['#f8bbd0','#d81b60','#880e4f']],
'индонезийские пачули':['wood',['#6d4c41','#3e2723','#1b0000']],
'элеми':['resin',['#fff8e1','#ffe0b2','#ffcc80']],
'гваяк':['wood',['#8d6e63','#4e342e','#3e2723']],
'пеппервуд':['wood',['#a1887f','#5d4037','#3e2723']],
'лист табака':['wood',['#a1887f','#5d4037','#3e2723']],
'османтус':['flower',['#ffe0b2','#fb8c00','#e65100']],
'нагармота':['wood',['#d7ccc8','#8d6e63','#4e342e']],
'шалфей':['herb',['#a5d6a7','#2e7d32','#1b5e20']],
'мускатный орех':['spice',['#d7ccc8','#8d6e63','#4e342e']],
'красный перец':['spice',['#ef5350','#c62828','#7f0000']],
'кульфи':['gourmand',['#fff8e1','#ffe0b2','#ffcc80']],
'роза':['flower',['#f8bbd0','#e91e63','#ad1457']],
'мастиковое дерево':['wood',['#a5d6a7','#2e7d32','#1b5e20']],
'фисташки':['gourmand',['#aed581','#7cb342','#33691e']],
'тубероза':['flower',['#ffffff','#fff59d','#fbc02d']],
'иланг-иланг':['flower',['#fff59d','#fbc02d','#f57f17']],
'кокос':['gourmand',['#ffffff','#eceff1','#b0bec5']],
'паприка':['spice',['#ff7043','#d84315','#bf360c']],
'коньяк':['gourmand',['#d7a86e','#a1662f','#5d3a1a']],
'дуб':['wood',['#a1887f','#5d4037','#3e2723']],
'Гедион':['musk',['#ffe082','#ffb300','#ef6c00']],
'пралине':['gourmand',['#ffe0b2','#ffb74d','#ef6c00']],
'засахаренный миндаль':['gourmand',['#ffe0b2','#ffb74d','#ef6c00']],
'Iso E Super':['musk',['#eceff1','#b0bec5','#78909c']],
'плавник':['marine',['#b0bec5','#78909c','#455a64']],
'водоросли':['marine',['#a5d6a7','#2e7d32','#1b5e20']],
'семена сельдерея':['herb',['#a5d6a7','#2e7d32','#1b5e20']],
'жёлтый мандарин':['citrus',['#ffd54f','#e0a021','#a3771a']],
'полынь':['herb',['#cfd8dc','#78909c','#455a64']],
'можжевельник':['herb',['#a5d6a7','#2e7d32','#1b5e20']],
'лаванда':['flower',['#b39ddb','#7e57c2','#4527a0']],
'ирис':['flower',['#b39ddb','#5e35b1','#311b92']],
'мирт':['herb',['#a5d6a7','#2e7d32','#1b5e20']],
'жасмин самбак':['flower',['#ffffff','#f8bbd0','#f48fb1']],
'марокканский жасмин':['flower',['#ffffff','#f8bbd0','#f48fb1']],
'карамель':['gourmand',['#ffe0b2','#ffb74d','#ef6c00']],
'красные ягоды':['fruit',['#ef5350','#c62828','#8e0000']],
'песчаный ветивер':['wood',['#e0c9a6','#b08968','#7f5539']],
'замша':['leather',['#a1887f','#6d4c41','#3e2723']],
'Mystikal':['musk',['#b39ddb','#7e57c2','#4527a0']],
'душистый перец':['spice',['#bcaaa4','#6d4c41','#3e2723']]
};
for(const [note,[motif,colors]] of Object.entries(NOTE_ART)) art[note]=M[motif](colors);
const fallback=()=>M.misc(['#ffe0b2','#ffb74d','#ef6c00']);
function groupsFor(raw){
 const lines=String(raw||'').split(/\r?\n/),levels=[['Верх:','Верхние ноты'],['Сердце:','Ноты сердца'],['База:','Базовые ноты']];
 const split=s=>s.replace(/[.。]\s*$/,'').split(',').map(s=>s.trim()).filter(Boolean);
 const groups=levels.map(([prefix,title])=>{const line=lines.find(s=>s.trim().startsWith(prefix));return {title,notes:line?split(line.trim().slice(prefix.length)):[]};}).filter(g=>g.notes.length);
 if(groups.length)return groups;
 const text=String(raw||'').trim();if(!text)return [];
 const body=text.includes(':')?text.slice(text.indexOf(':')+1):text;
 return [{title:'Ноты композиции',notes:split(body.replace(/\n/g,' '))}];
}
window.renderPyramid=function(p){
 const root=$('pyramid');root.replaceChildren();root.hidden=true;
 const groups=groupsFor(p.notes);if(!groups.length)return;
 root.setAttribute('aria-label',groups.length===1?'Иллюстрированные ноты композиции':'Визуальная пирамида нот');
 for(const group of groups){
  const tier=el('section',undefined,'tier');if(groups.length===1)tier.style.width='100%';
  const list=el('ul',undefined,'ingredients');tier.append(el('h4',group.title));
  for(const note of group.notes){
   const item=el('li',undefined,'ingredient'),markup=art[norm(note)]||fallback();
   const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
   for(const [key,value] of Object.entries({viewBox:'0 0 64 64','aria-hidden':'true',fill:'none',stroke:'#daba80','stroke-width':'1.6','stroke-linecap':'round','stroke-linejoin':'round'}))svg.setAttribute(key,value);
   svg.innerHTML=markup;item.append(svg);
   item.append(el('span',note.charAt(0).toUpperCase()+note.slice(1)));list.append(item);
  }
  tier.append(list);root.append(tier);
 }
 root.append(el('p',groups.length===1?'Без деления на уровни, как в исходном каталоге. Иллюстрации стилизованы; условные знаки не являются химическими формулами.':'Индивидуальные стилизованные иллюстрации нот. Условные знаки не являются химическими формулами.','pyramid-caption'));
 root.hidden=false;
};
})();