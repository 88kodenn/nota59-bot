(() => {
'use strict';
const section=document.querySelector('.wrap > .section');if(!section||document.getElementById('n59-arrival-tabs'))return;
const style=document.createElement('style');style.textContent=`
.wrap>.section{flex-wrap:wrap}
#n59-arrival-tabs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));align-items:stretch;gap:8px;flex-basis:100%;width:100%;min-width:0;border-bottom:1px solid var(--line);margin-top:8px}
#n59-arrival-tabs button{background:none;border:0;border-bottom:2px solid transparent;color:var(--muted);padding:12px 3px;min-height:52px;min-width:0;max-width:100%;font:500 12px/1.5 var(--sans);text-align:center;white-space:normal;overflow-wrap:anywhere}
#n59-arrival-tabs button[aria-pressed=true]{border-bottom-color:var(--gold);color:var(--gold)}
.n59-new-badge{position:absolute;right:9px;top:9px;padding:5px 7px;background:#18140fe6;border:1px solid var(--line);border-radius:5px;font:500 10px var(--sans);color:var(--gold)}
.price.n59-inquire{font-size:12px;white-space:normal;color:var(--muted)}
.n59-section-hidden{display:none!important}
.wrap>.section[data-shop-section=gift]>h2,.wrap>.section[data-shop-section=gift]>#status,.wrap>.section[data-shop-section=request]>h2,.wrap>.section[data-shop-section=request]>#status{display:none}
.n59-shop-section{margin:14px 0 24px;padding:22px 16px;border:1px solid var(--line);border-radius:12px;background:linear-gradient(145deg,#211c15,#14120f)}
.n59-shop-section[hidden]{display:none}.n59-shop-section h2{margin:0 0 12px;color:var(--gold);font:400 25px/1.4 var(--serif);overflow-wrap:anywhere}.n59-shop-section p{margin:0;color:var(--muted);font:400 14px/1.8 var(--sans)}
`;document.head.append(style);
const tabs=document.createElement('div');tabs.id='n59-arrival-tabs';tabs.setAttribute('role','group');tabs.setAttribute('aria-label','Разделы магазина');
const all=el('button','Все ароматы'),gift=el('button','Подарочные наборы'),request=el('button','Парфюмерия под заказ');
const giftPanel=el('section',undefined,'n59-shop-section'),requestPanel=el('section',undefined,'n59-shop-section');giftPanel.id='n59-gift-sets';requestPanel.id='n59-special-order';
const giftTitle=el('h2','Подарочные наборы'),requestTitle=el('h2','Парфюмерия под заказ');giftTitle.id='n59-gift-title';requestTitle.id='n59-request-title';giftPanel.setAttribute('aria-labelledby',giftTitle.id);requestPanel.setAttribute('aria-labelledby',requestTitle.id);
giftPanel.append(giftTitle,el('p','В этом разделе пока нет опубликованных наборов.'));requestPanel.append(requestTitle,el('p','Список парфюмерии под заказ пока не заполнен.'));giftPanel.hidden=requestPanel.hidden=true;section.after(giftPanel,requestPanel);
for(const [b,id] of [[all,'catalog'],[gift,giftPanel.id],[request,requestPanel.id]]){b.type='button';b.setAttribute('aria-controls',id);}tabs.append(all,gift,request);section.append(tabs);
let active='all';
function applySection(){section.dataset.shopSection=active;const rules=section.classList.contains('n59-rules-hidden');giftPanel.hidden=rules||active!=='gift';requestPanel.hidden=rules||active!=='request';for(const [b,value] of [[all,'all'],[gift,'gift'],[request,'request']])b.setAttribute('aria-pressed',String(active===value));for(const node of [document.querySelector('.tools'),$('catalog'),$('n59-active-brand'),$('n59-fav-launch'),$('n59-recent'),$('n59-search-empty'),$('n59-load-state')])if(node)node.classList.toggle('n59-section-hidden',active!=='all');}
function switchTo(value){active=value;if(typeof data!=='undefined'&&data)window.render();applySection();}
all.onclick=()=>switchTo('all');gift.onclick=()=>switchTo('gift');request.onclick=()=>switchTo('request');new MutationObserver(applySection).observe(section,{attributes:true,attributeFilter:['class']});applySection();document.addEventListener('DOMContentLoaded',applySection,{once:true});
const priced=value=>typeof value==='number'&&Number.isFinite(value)&&value>0;
const brandSearchAliases={'tom ford':'том форд'};
window.volume=function(v){
 $('v5').setAttribute('aria-pressed',String(v===5));$('v10').setAttribute('aria-pressed',String(v===10));
 const price=v===5?selected.price5:selected.price10,hasPrice=priced(price);
 $('chosen').textContent=hasPrice?money(price):'Цена уточняется';$('chosen').style.fontSize=hasPrice?'':'15px';
 $('order').href='https://t.me/'+encodeURIComponent(data.seller)+'?text='+encodeURIComponent('Здравствуйте! Интересует '+selected.name+', '+v+' мл. '+(hasPrice?'Подскажите наличие и условия заказа.':'Подскажите цену, наличие и условия заказа.'));
};
window.render=function(){
 if(typeof data==='undefined'||!data)return;
 const words=norm($('search').value.trim()).split(/\s+/).filter(Boolean);
 const items=data.items.filter(p=>(!$('brand').value||p.brand===$('brand').value)&&words.every(w=>norm([p.name,p.brand,p.description,p.notes,(window.nota59SearchAliases || {})[p.name] || '',brandSearchAliases[norm(String(p.brand||'').trim())] || ''].join(' ')).includes(w)));
 $('catalog').replaceChildren();$('status').textContent=items.length?items.length+' ароматов':'Нет совпадений — измените поиск';
 for(const p of items){
  const card=el('article',undefined,'card'),cover=visual(p),info=el('div',undefined,'info'),bottom=el('div',undefined,'bottom'),button=el('button','↗','more');
  if(p.isNew)cover.append(el('span','Новинка','n59-new-badge'));
  const prices=[p.price5,p.price10].filter(priced),price=el('span',prices.length?'от '+money(Math.min(...prices)):'Цена уточняется',prices.length?'price':'price n59-inquire');
  button.type='button';button.setAttribute('aria-label','Открыть аромат '+p.name);button.onclick=()=>openProduct(p);
  bottom.append(price,button);info.append(el('p',p.brand,'brand'),el('h2',p.name.startsWith(p.brand+' ')?p.name.slice(p.brand.length+1):p.name,'name'),bottom);card.append(cover,info);$('catalog').append(card);
 }
 applySection();
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
if(typeof data!=='undefined'&&data){$('search').oninput=window.render;$('brand').onchange=window.render;window.render();}
})();
