(() => {
'use strict';
function mount(){
const owner=document.getElementById('n59-gift-builder'),source=document.getElementById('brand-panel');
const select=owner?.querySelector('.gift-filters select');
if(!select||!source)return false;if(document.getElementById('n59-gift-brand-open'))return true;
const make=(tag,text,cls)=>{const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(cls)el.className=cls;return el;};
const baseStyle=Array.from(document.querySelectorAll('style')).find(s=>s.textContent.includes('#brand-open{')&&s.textContent.includes('.bp-list{'));
const style=make('style');style.textContent=(baseStyle?.textContent||'').replaceAll('#brand-panel','#n59-gift-brand-panel').replaceAll('#brand-open','#n59-gift-brand-open')+`
#n59-gift-builder select[data-gift-brand-native]{display:none!important}
#n59-gift-builder #n59-gift-brand-open{display:block;box-sizing:border-box;width:100%;min-width:0;min-height:48px;margin:6px 0 12px;padding:10px;background:#191610;color:var(--gold);border:1px solid var(--line);border-radius:9px;font:12px var(--sans);text-align:left;white-space:nowrap;text-overflow:ellipsis;overflow:hidden}
#n59-gift-brand-panel{box-sizing:border-box;width:calc(100% - 24px);max-width:480px;max-height:calc(var(--n59-visible-height,100dvh) - 24px);padding:0;overscroll-behavior:contain}
#n59-gift-brand-panel h2{font:400 24px/1.35 var(--serif);margin:0;color:var(--gold)}
#n59-gift-brand-panel .bp-list{max-height:48dvh;max-height:min(48dvh,calc(var(--n59-visible-height,100dvh) - 180px));overflow-y:auto}
#n59-gift-brand-panel button:focus-visible,#n59-gift-brand-panel input:focus-visible{outline:2px solid var(--gold);outline-offset:2px}
`;document.head.append(style);
const trigger=make('button','Все бренды ⌄');trigger.id='n59-gift-brand-open';trigger.type='button';trigger.setAttribute('aria-haspopup','dialog');trigger.setAttribute('aria-controls','n59-gift-brand-panel');trigger.setAttribute('aria-expanded','false');select.hidden=true;select.setAttribute('data-gift-brand-native','');select.after(trigger);
const panel=make('dialog');panel.id='n59-gift-brand-panel';panel.setAttribute('aria-labelledby','n59-gift-brand-heading');
const head=make('div',undefined,'bp-head'),title=make('h2','Парфюмерные дома'),close=make('button','×','close');title.id='n59-gift-brand-heading';close.type='button';close.setAttribute('aria-label','Закрыть выбор бренда');head.append(title,close);
const search=make('input',undefined,'bp-search');search.type='search';search.placeholder='Найти бренд';search.setAttribute('aria-label','Поиск бренда в подарочном наборе');
const list=make('div',undefined,'bp-list');panel.append(head,search,list);document.body.append(panel);
const templates=new Map(),key=s=>String(s).toLowerCase().replace(/[^\p{L}\p{N}]/gu,'');
function remember(){for(const name of source.querySelectorAll('.bp-name'))templates.set(key(name.textContent),name.cloneNode(true));}
function sync(){trigger.textContent=(select.selectedOptions[0]?.textContent||'Все бренды')+' ⌄';}
function draw(){
remember();sync();list.replaceChildren();const q=search.value.trim().toLowerCase();
const volume=Number(owner.querySelector('.gift-body>p')?.textContent.match(/по\s+(5|10)\s+мл/)?.[1])||5;
const items=typeof data!=='undefined'&&Array.isArray(data?.items)?data.items:[];
let found=0;
for(const option of select.options){
if(option.disabled||option.value&&!option.textContent.toLowerCase().includes(q))continue;
const count=items.filter(p=>p.available!==false&&Number.isInteger(p['price'+volume])&&p['price'+volume]>0&&(!option.value||p.brand===option.value)).length;
if(option.value&&!count&&option.value!==select.value)continue;
found++;const row=make('button',undefined,'bp-row');row.type='button';row.setAttribute('aria-pressed',String(option.value===select.value));
const copy=make('span',undefined,'bp-copy'),template=templates.get(key(option.textContent));copy.append(template?template.cloneNode(true):make('span',option.textContent,'bp-name'),make('small','Ароматов: '+count));row.append(copy);
if(option.value===select.value){const tick=make('span','✓');tick.setAttribute('aria-hidden','true');row.append(tick);}
row.addEventListener('click',()=>{select.value=option.value;select.dispatchEvent(new Event('change',{bubbles:true}));panel.close();sync();});list.append(row);
}
if(!found){const empty=make('p','Бренд не найден','bp-empty');empty.setAttribute('role','status');list.append(empty);}
}
trigger.addEventListener('click',()=>{search.value='';draw();if(!panel.open)panel.showModal();list.scrollTop=0;trigger.setAttribute('aria-expanded','true');close.focus({preventScroll:true});});
close.addEventListener('click',()=>panel.close());search.addEventListener('input',draw);select.addEventListener('change',sync);
panel.addEventListener('close',()=>{trigger.setAttribute('aria-expanded','false');if(owner.open&&trigger.isConnected)trigger.focus({preventScroll:true});});
owner.addEventListener('close',()=>{if(panel.open)panel.close();});
new MutationObserver(()=>{sync();if(panel.open)draw();}).observe(select,{childList:true,subtree:true});
new MutationObserver(()=>{remember();if(panel.open)draw();}).observe(source.querySelector('.bp-list')||source,{childList:true,subtree:true});
remember();sync();return true;
}
function start(){if(mount())return;const observer=new MutationObserver(()=>{if(mount())observer.disconnect();});observer.observe(document.body,{childList:true,subtree:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();

(() => {
'use strict';
function mount(){
const owner=document.getElementById('n59-gift-builder'),list=owner?.querySelector('.gift-products');
if(!list)return false;if(document.getElementById('n59-gift-catalog-cards'))return true;
const make=(tag,text,cls)=>{const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(cls)el.className=cls;return el;};
const style=make('style');style.id='n59-gift-catalog-cards';style.textContent=`
#n59-gift-builder .gift-products{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;align-items:stretch}
#n59-gift-builder .gift-products>p{grid-column:1/-1}
#n59-gift-builder .gift-products>.gift-product{display:flex;flex-direction:column;align-items:stretch;gap:0;min-width:0;padding:0;border:1px solid var(--line);border-radius:12px;overflow:hidden;background:linear-gradient(145deg,#211c15,#14120f)}
#n59-gift-builder .gift-product>.cover{position:relative;display:block;flex:none;width:100%;aspect-ratio:4/5;margin:0;padding:0;border:0;border-radius:0;overflow:hidden;background:radial-gradient(ellipse at 50% 30%,#72522a55,transparent 70%),#15130f}
#n59-gift-builder .gift-product>.cover>img{position:absolute;inset:0;display:block;width:100%;height:100%;max-width:100%;max-height:100%;margin:0;padding:0;object-fit:cover;object-position:center;border-radius:0}
#n59-gift-builder .gift-product .cover .monogram{font-size:55px}
#n59-gift-builder .gift-product>.info{display:flex;flex:1;flex-direction:column;min-width:0;padding:12px 10px}
#n59-gift-builder .gift-product .info>.brand{margin:0 0 7px;color:var(--gold);font:500 11px/1.5 var(--sans);letter-spacing:.6px;white-space:normal;overflow-wrap:anywhere}
#n59-gift-builder .gift-product .info>.name{margin:0 0 14px;padding:0;border:0;color:var(--text);font:400 18px/1.35 var(--serif);font-synthesis:none;letter-spacing:-.2px;overflow-wrap:anywhere}
#n59-gift-builder .gift-product .bottom{display:grid;grid-template-columns:minmax(0,1fr);align-items:stretch;gap:10px;margin-top:auto;padding-top:8px;border-top:1px solid var(--line)}
#n59-gift-builder .gift-product .price{color:#f2d7a4;font:600 13px/1.5 var(--sans);font-variant-numeric:tabular-nums;white-space:normal;overflow-wrap:anywhere}
#n59-gift-builder .gift-product .bottom>.more{display:flex;align-items:center;justify-content:center;width:100%;height:auto;min-width:0;min-height:44px;padding:11px 8px;border:1px solid #b58a4666;border-radius:8px;background:#c89e4b12;color:var(--gold);font:500 13px/1.4 var(--sans);white-space:normal;overflow-wrap:anywhere}
#n59-gift-builder .gift-product .bottom>.more:not(:disabled):active{background:#dfbb7826}
#n59-gift-builder footer{background:#14120f}
@media(min-width:700px){#n59-gift-builder .gift-products{grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}}
@media(max-width:359px){#n59-gift-builder .gift-products{grid-template-columns:minmax(0,1fr)}#n59-gift-builder .gift-product>.cover{aspect-ratio:1/1}#n59-gift-builder .gift-product>.info{padding:14px}#n59-gift-builder .gift-product .info>.name{font-size:21px}#n59-gift-builder .gift-product .price{font-size:15px}}
`;document.head.append(style);
function draw(){
const catalogue=new Map();for(const card of document.querySelectorAll('#catalog .card')){const label=card.querySelector('.more')?.getAttribute('aria-label');if(label)catalogue.set(label,card);}
const items=typeof data!=='undefined'&&Array.isArray(data?.items)?data.items:[];
for(const row of list.children){
if(!row.classList.contains('gift-product')||row.dataset.catalogCard)continue;
const labels=row.querySelectorAll('p'),fullName=labels[0]?.textContent,add=row.querySelector('button');if(!fullName||!add||labels.length<2)continue;
const product=items.find(p=>p.name===fullName),reference=catalogue.get('Открыть аромат '+fullName),brand=reference?.querySelector('.info>.brand');
let cover;
if(product&&typeof visual==='function')cover=visual(product);
else{cover=make('div',undefined,'cover');const photo=row.querySelector('img');if(photo){photo.alt=fullName;cover.append(photo);}}
const info=make('div',undefined,'info'),name=reference?.querySelector('.name')?.textContent||(product?.brand&&fullName.startsWith(product.brand+' ')?fullName.slice(product.brand.length+1):fullName),bottom=make('div',undefined,'bottom');
add.classList.add('more');bottom.append(make('span',labels[1].textContent.replace(' · ',' — '),'price'),add);
info.append(brand?brand.cloneNode(true):make('p',product?.brand||'','brand'),make('h3',name,'name'),bottom);
row.dataset.catalogCard='true';row.classList.add('card');row.replaceChildren(cover,info);
}
}
new MutationObserver(draw).observe(list,{childList:true});draw();return true;
}
function start(){if(mount())return;const observer=new MutationObserver(()=>{if(mount())observer.disconnect();});observer.observe(document.body,{childList:true,subtree:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
