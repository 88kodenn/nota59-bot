(() => {
'use strict';
const shapes = {
leaf:'<path d="M12 48C8 20 27 9 53 11 54 39 34 57 12 48z" fill="#667747"/><path d="M12 51l31-29M25 37l-2-13m11 5 12 1"/>',
flower:'<path d="M32 23C8 0 5 29 23 32 0 47 28 62 32 41 46 65 64 35 41 32 64 11 36 2 32 23z" fill="#ead4b0"/><circle cx="32" cy="32" r="6" fill="#b98c45"/>',
rose:'<path d="M32 55V37m0 11q-15-12-18-4 4 11 18 4m0-7q14-13 18-5-4 12-18 5" fill="#657344"/><path d="M14 23C9 5 30 7 32 13 50 2 62 23 49 33 40 48 19 42 14 23z" fill="#a66d62"/><path d="M20 18q21-9 24 11-18 13-24-11m5 3q16-6 11 9-12 5-11-9"/>',
citrus:'<circle cx="32" cy="34" r="21" fill="#c6a447"/><circle cx="32" cy="34" r="15"/><path d="M32 19v30M17 34h30M21 23l22 22m0-22L21 45"/><path d="M32 12q6-14 20-4-9 11-20 4" fill="#70874c"/>',
lemon:'<path d="M9 37c4-20 29-28 42-14l5 2-2 6C48 54 24 59 13 45l-5-2z" fill="#d6b648"/><path d="M18 34q11-16 26-8"/>',
fruit:'<path d="M32 21C8 8 6 43 22 53q9 5 12-1 12 8 20-12 9-31-22-19z" fill="#a3a765"/><path d="M32 23q-7-15 1-19m0 12q10-15 20-7-5 12-20 7" fill="#5e7844"/>',
pear:'<path d="M28 16q-8 2-9 15C-1 57 64 64 49 36q-12-11-12-19z" fill="#a4aa57"/><path d="M32 16q-3-10 4-12m1 9q12-11 19-2-7 11-19 2" fill="#687d46"/>',
berries:'<path d="M16 11q20 0 33 16M33 17v16"/><g fill="#766082"><circle cx="18" cy="28" r="9"/><circle cx="35" cy="36" r="9"/><circle cx="47" cy="27" r="8"/><circle cx="24" cy="48" r="8"/></g>',
cherry:'<path d="M17 35Q32 17 34 8q3 18 14 29M34 10q11-8 19 0-8 9-19 0" fill="#647c46"/><circle cx="17" cy="43" r="12" fill="#984f4e"/><circle cx="47" cy="44" r="11" fill="#803b3c"/>',
pineapple:'<path d="M21 23L14 7l15 11L32 3l7 15L52 8l-9 17" fill="#738446"/><ellipse cx="33" cy="41" rx="18" ry="20" fill="#b79143"/><path d="M19 29l25 25M17 40l19 18M29 23l20 20M20 53l25-25M17 42l18-18m-4 35 18-18"/>',
coconut:'<circle cx="32" cy="34" r="23" fill="#795338"/><ellipse cx="32" cy="30" rx="19" ry="15" fill="#eee1c5"/><ellipse cx="32" cy="30" rx="11" ry="8" fill="#5d4631"/>',
fig:'<path d="M31 8C20 24 4 35 17 51c12 16 41 1 35-18L37 10z" fill="#80566a"/><path d="M32 16C21 32 12 45 30 51 51 50 46 33 32 16z" fill="#c48b76"/><path d="M29 30v15m7-9-4 4"/>',
spice:'<ellipse cx="23" cy="32" rx="10" ry="20" transform="rotate(25 23 32)" fill="#a78b58"/><path d="M29 16L17 47m5-30-9 24"/><circle cx="45" cy="45" r="9" fill="#75613e"/><circle cx="47" cy="20" r="6" fill="#b79b6c"/>',
pepper:'<g fill="#8d5b47"><circle cx="18" cy="22" r="8"/><circle cx="40" cy="18" r="8"/><circle cx="32" cy="39" r="9"/><circle cx="51" cy="42" r="7"/><circle cx="14" cy="48" r="6"/></g>',
ginger:'<path d="M11 34l13-6 3-16 9-2 4 16 13-8 7 10-17 12 6 12-10 5-11-14-15 4z" fill="#bb965e"/><path d="M24 28l7 9m9-11-2 12"/>',
resin:'<path d="M10 41l12-20 15 4 14-9 7 28-18 12-17-5z" fill="#bd873c"/><path d="M22 21l5 22 13 13m-3-31 5 17 16 2m-31-1 15-1"/>',
wood:'<path d="M10 42l32-25 13 15-32 25z" fill="#9a7043"/><ellipse cx="17" cy="49" rx="9" ry="7" transform="rotate(-40 17 49)" fill="#d2ad73"/><path d="M18 37l27-21m-20 28 26-20"/>',
roots:'<path d="M32 11v20m0-11L19 8m13 16L47 9M32 31L13 55m19-24-3 27m3-27 18 23M22 44l-12 1m25-1 12-2m-18 8 10 8" stroke="#b59b62" stroke-width="3"/>',
moss:'<path d="M9 51q2-14 10-7-4-22 9-12 1-26 13-10 17-7 10 11 17 3 3 15-7 11-20 5z" fill="#647441"/><path d="M18 47l7-7m7 10 2-15m8 13 5-9"/>',
leather:'<path d="M20 9q12 10 24 0l11 15-9 9 7 19q-21 8-42 0l7-19-9-9z" fill="#7d573b"/><path d="M23 16q9 6 18 0M18 48q15 5 28 0" stroke-dasharray="2 3"/>',
honey:'<path d="M17 22h30l3 31H14z" fill="#be913c"/><path d="M16 17h32v6H16z" fill="#e2c17e"/><path d="M25 33l7-4 7 4v9l-7 4-7-4z"/><path d="M41 7q10 9 0 12-10-3 0-12" fill="#d4aa4d"/>',
nut:'<path d="M32 8C5 22 11 50 28 55 48 53 58 26 32 8z" fill="#b98248"/><path d="M32 15q-15 19-7 32m11-28q10 16 1 28"/>',
cream:'<path d="M12 39h40l-8 17H20z" fill="#b98946"/><path d="M15 37q-2-9 9-10-1-9 10-10-3-7 4-11 1 12 9 20 10 7 4 13z" fill="#e5d0a2"/>',
abstract:'<path d="M32 9l19 12v22L32 55 13 43V21z" fill="#ddc08a22"/><path d="M32 18v28M20 25l24 14m0-14L20 39"/><circle cx="32" cy="32" r="7" fill="#e1c388"/>'
};
const aliases={
leaf:'орегано|пачули|индонезийские пачули|базилик|мята|розмарин|шалфей|мускатный шалфей|мате|лист фиалки|лист табака|табак|кориандр',
flower:'ирис|корень ириса|лаванда|жасмин|марокканский жасмин|нероли|цветок апельсина|тубероза|иланг-иланг|османтус',
rose:'роза|турецкая роза|майская роза',
citrus:'бергамот|грейпфрут|апельсин|мандарин|цитрон',lemon:'лимон',fruit:'яблоко|абрикос|личи|маракуйя|фруктовые ноты',pear:'груша',berries:'черная смородина',cherry:'черная вишня',pineapple:'ананас',coconut:'кокос',fig:'инжир|финики',spice:'кардамон|мускатный орех|семена моркови|шафран',pepper:'перец|розовый перец|красный перец|перец тимут|пеппервуд|паприка',ginger:'имбирь',resin:'ладан|олибанум|мирра|опопонакс|лабданум|бензоин|элеми|мастиковое дерево',wood:'уд|кедр|гваяк|древесные ноты|папирус',roots:'ветивер|нагармота',moss:'мох|дубовый мох',leather:'кожа',honey:'мед',nut:'фисташки',cream:'кульфи',abstract:'мускус|амбра|амброксан|ambroxan|ambrofix|амброфикс|akigalawood|джордживуд|iso e super|кашмеран|кашемировое дерево|амбретта|восточные ноты'
};
for(const [kind,names] of Object.entries(aliases))for(const name of names.split('|'))if(!noteArt[name])noteArt[name]=shapes[kind];
noteArt['бурбонская ваниль']=noteArt['ваниль'];
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
   const item=el('li',undefined,'ingredient'),svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
   for(const [key,value] of Object.entries({viewBox:'0 0 64 64','aria-hidden':'true',fill:'none',stroke:'#daba80','stroke-width':'1.6','stroke-linecap':'round','stroke-linejoin':'round'}))svg.setAttribute(key,value);
   svg.innerHTML=noteArt[norm(note)]||shapes.abstract;
   item.append(svg,el('span',note.charAt(0).toUpperCase()+note.slice(1)));list.append(item);
  }
  tier.append(list);root.append(tier);
 }
 root.append(el('p',groups.length===1?'В исходном каталоге ноты приведены без деления на уровни. Иллюстрации стилизованы; абстрактные ноты показаны условными знаками.':'Ноты и уровни взяты из текущей карточки. Иллюстрации стилизованы; абстрактные ноты показаны условными знаками.','pyramid-caption'));
 root.hidden=false;
};
})();
