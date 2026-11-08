(() => {
'use strict';
const section=document.querySelector('.wrap > .section');if(!section||document.getElementById('n59-arrival-tabs'))return;
const style=document.createElement('style');style.textContent=`
.wrap>.section{flex-wrap:wrap}
#n59-arrival-tabs{display:flex;gap:22px;flex-basis:100%;border-bottom:1px solid var(--line);margin-top:8px}
#n59-arrival-tabs button{background:none;border:0;border-bottom:2px solid transparent;color:var(--muted);padding:12px 0;min-height:44px;font:500 14px var(--sans)}
#n59-arrival-tabs button[aria-pressed=true]{border-bottom-color:var(--gold);color:var(--gold)}
.n59-new-badge{position:absolute;right:9px;top:9px;padding:5px 7px;background:#18140fe6;border:1px solid var(--line);border-radius:5px;font:500 10px var(--sans);color:var(--gold)}
.price.n59-inquire{font-size:12px;white-space:normal;color:var(--muted)}
`;document.head.append(style);
const tabs=document.createElement('div');tabs.id='n59-arrival-tabs';tabs.setAttribute('role','group');tabs.setAttribute('aria-label','Подборка ароматов');
const all=el('button','Все ароматы'),fresh=el('button','Новинки');for(const b of [all,fresh]){b.type='button';b.setAttribute('aria-controls','catalog');}all.setAttribute('aria-pressed','true');fresh.setAttribute('aria-pressed','false');tabs.append(all,fresh);section.append(tabs);
let onlyNew=false;
function switchTo(value){onlyNew=value;all.setAttribute('aria-pressed',String(!value));fresh.setAttribute('aria-pressed',String(value));if(data)window.render();}
all.onclick=()=>switchTo(false);fresh.onclick=()=>switchTo(true);
const priced=value=>typeof value==='number'&&Number.isFinite(value)&&value>0;
window.volume=function(v){
 $('v5').setAttribute('aria-pressed',String(v===5));$('v10').setAttribute('aria-pressed',String(v===10));
 const price=v===5?selected.price5:selected.price10,hasPrice=priced(price);
 $('chosen').textContent=hasPrice?money(price):'Цена уточняется';$('chosen').style.fontSize=hasPrice?'':'15px';
 $('order').href='https://t.me/'+encodeURIComponent(data.seller)+'?text='+encodeURIComponent('Здравствуйте! Интересует '+selected.name+', '+v+' мл. '+(hasPrice?'Подскажите наличие и условия заказа.':'Подскажите цену, наличие и условия заказа.'));
};
window.render=function(){
 if(!data)return;
 const words=norm($('search').value.trim()).split(/\s+/).filter(Boolean);
 const items=data.items.filter(p=>(!onlyNew||p.isNew===true)&&(!$('brand').value||p.brand===$('brand').value)&&words.every(w=>norm([p.name,p.description,p.notes].join(' ')).includes(w)));
 $('catalog').replaceChildren();$('status').textContent=items.length?items.length+' ароматов':'Нет совпадений — измените поиск';
 for(const p of items){
  const card=el('article',undefined,'card'),cover=visual(p),info=el('div',undefined,'info'),bottom=el('div',undefined,'bottom'),button=el('button','↗','more');
  if(p.isNew)cover.append(el('span','Новинка','n59-new-badge'));
  const prices=[p.price5,p.price10].filter(priced),price=el('span',prices.length?'от '+money(Math.min(...prices)):'Цена уточняется',prices.length?'price':'price n59-inquire');
  button.type='button';button.setAttribute('aria-label','Открыть аромат '+p.name);button.onclick=()=>openProduct(p);
  bottom.append(price,button);info.append(el('p',p.brand,'brand'),el('h2',p.name.startsWith(p.brand+' ')?p.name.slice(p.brand.length+1):p.name,'name'),bottom);card.append(cover,info);$('catalog').append(card);
 }
};
const extraArt={
'карамель':'<path d="M13 28l17-13 23 13-1 20-22 9-17-11z" fill="#c58a44"/><path d="M13 28l17 13 23-13M30 41v16"/><path d="M23 28q8-8 17 0" stroke="#ffe0a2"/>',
'красные ягоды':'<path d="M15 12q19 1 31 18M29 17v15" stroke="#9bbb70"/><g fill="#bf5260"><circle cx="17" cy="32" r="10"/><circle cx="43" cy="31" r="9"/><circle cx="29" cy="49" r="9"/></g>',
'душистый перец':'<g fill="#936747"><circle cx="18" cy="24" r="10"/><circle cx="44" cy="20" r="9"/><circle cx="32" cy="46" r="11"/></g><path d="M14 20l7 7m0-7-7 7M40 17l7 6m-7 0 7-6M27 42l9 8m0-8-9 8"/>',
'песчаный ветивер':'<path d="M32 7v22m0-4L18 10m14 15L47 9" stroke="#8db568"/><path d="M32 27L10 54m22-27-9 29m9-29 9 29m-9-29 23 25M9 58h47" stroke="#d9b37b"/>',
'замша':'<path d="M12 15l32-5 9 37-32 9z" fill="#b59a78"/><path d="M12 15l9 41 7-9-8-33M26 23l16-3m-14 10 16-3m-14 10 16-3"/><path d="M26 49l20-5" stroke-dasharray="2 3"/>',
'mystikal':'<path d="M32 7l21 25-21 25L11 32z" fill="#806fa3"/><circle cx="32" cy="32" r="11" fill="none"/><path d="M24 24l16 16m0-16L24 40"/>'
};
const previousPyramid=window.renderPyramid;
window.renderPyramid=function(p){
 previousPyramid(p);
 for(const item of document.querySelectorAll('#pyramid .ingredient')){
  if(item.querySelector('svg'))continue;
  const key=norm(item.querySelector('span')?.textContent||'').trim(),markup=extraArt[key];if(!markup)continue;
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
  for(const [k,v] of Object.entries({viewBox:'0 0 64 64','aria-hidden':'true',fill:'none',stroke:'#e6cc9c','stroke-width':'1.6','stroke-linecap':'round','stroke-linejoin':'round'}))svg.setAttribute(k,v);
  svg.innerHTML=markup;item.prepend(svg);
 }
};
if(data){$('search').oninput=window.render;$('brand').onchange=window.render;window.render();}
})();
