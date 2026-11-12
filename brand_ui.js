(() => {
'use strict';
const s=document.getElementById('brand');if(!s||document.getElementById('brand-open'))return;
const logos=window.n59BrandLogos||{};
const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
const style=el('style');style.textContent=`
#brand-open{min-width:0;width:100%;min-height:48px;padding:10px;background:#191610;color:var(--gold);border:1px solid var(--line);border-radius:9px;font:12px var(--sans);text-overflow:ellipsis;overflow:hidden;white-space:nowrap}
#brand-panel{width:calc(100% - 24px);max-width:480px;max-height:85dvh;background:linear-gradient(140deg,#241e15,#100f0c);border:1px solid #b7935266;border-radius:20px;overflow:hidden;color:var(--text)}
#brand-panel::backdrop{background:#000b;backdrop-filter:blur(6px)}
.bp-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:18px}
#brand-panel h2{font:600 28px var(--serif);color:var(--gold);margin:0}
.bp-search{display:block;width:calc(100% - 36px);margin:0 18px 14px;padding:13px;border:1px solid var(--line);background:#100e0b;color:var(--text);border-radius:10px;font:16px var(--sans)}
.bp-list{overflow-y:auto;max-height:48dvh;overscroll-behavior:contain;padding:0 12px 18px}
.bp-row{display:flex;align-items:center;gap:12px;width:100%;min-height:68px;padding:10px 8px;border:0;border-bottom:1px solid var(--line);border-radius:8px;background:transparent;color:var(--text);text-align:left;font:14px var(--sans)}
.bp-row[aria-pressed=true]{background:#d5b37518;box-shadow:inset 0 0 0 1px #d5b37566}
.bp-logo{width:68px;height:44px;flex-shrink:0;display:grid;place-items:center;border:1px solid #d1bf9c55;background:#f5f0e6;border-radius:7px;padding:5px;overflow:hidden}
.bp-logo img{width:100%;height:100%;object-fit:contain;display:block}.bp-logo:has(.bp-white){background:#17140f}
.bp-logo img.bp-white{filter:none}.bp-copy{flex:1;min-width:0}.bp-copy small{display:block;color:var(--muted);font:11px var(--sans);margin-top:5px}
.brand .bp-logo{display:inline-flex;width:48px;height:30px;margin-right:8px;vertical-align:middle}
.bp-empty{padding:16px;color:var(--muted)}
@media(prefers-reduced-motion:reduce){#brand-panel[open]{animation:none}}
`;document.head.append(style);
function image(brand){const a=logos[brand];if(!a)return null;const box=el('span',undefined,'bp-logo'),img=el('img');img.src=a.data;img.alt='';img.loading='lazy';img.onerror=()=>box.remove();if(a.white)img.className='bp-white';box.append(img);return box;}
const trigger=el('button','Все бренды ⌄');trigger.id='brand-open';trigger.type='button';trigger.setAttribute('aria-haspopup','dialog');trigger.setAttribute('aria-controls','brand-panel');trigger.setAttribute('aria-expanded','false');s.after(trigger);s.hidden=true;
const panel=el('dialog');panel.id='brand-panel';panel.setAttribute('aria-labelledby','bp-heading');const head=el('div',undefined,'bp-head'),title=el('h2','Парфюмерные дома'),close=el('button','×','close');title.id='bp-heading';close.type='button';close.setAttribute('aria-label','Закрыть выбор бренда');head.append(title,close);
const search=el('input',undefined,'bp-search');search.type='search';search.placeholder='Найти бренд';search.setAttribute('aria-label','Поиск бренда');const list=el('div',undefined,'bp-list');panel.append(head,search,list);document.body.append(panel);
function draw(){trigger.textContent=(s.selectedOptions[0]?.textContent||'Все бренды')+' ⌄';list.replaceChildren();const q=search.value.trim().toLowerCase();let found=0;for(const o of s.options){if(o.value&&!o.textContent.toLowerCase().includes(q))continue;found++;const row=el('button',undefined,'bp-row');row.type='button';row.setAttribute('aria-pressed',String(o.value===s.value));const logo=image(o.value);if(logo)row.append(logo);const copy=el('span',o.textContent,'bp-copy');if(typeof data!=='undefined'&&data?.items)copy.append(el('small','Ароматов: '+data.items.filter(p=>!o.value||p.brand===o.value).length));row.append(copy);if(o.value===s.value){const tick=el('span','✓');tick.setAttribute('aria-hidden','true');row.append(tick);}row.onclick=()=>{s.value=o.value;s.dispatchEvent(new Event('change',{bubbles:true}));panel.close();draw();};list.append(row);}if(!found)list.append(el('p','Бренд не найден','bp-empty'));}
trigger.onclick=()=>{search.value='';draw();panel.showModal();trigger.setAttribute('aria-expanded','true');close.focus();};close.onclick=()=>panel.close();panel.addEventListener('close',()=>{trigger.setAttribute('aria-expanded','false');trigger.focus();});search.oninput=draw;s.addEventListener('change',draw);new MutationObserver(draw).observe(s,{childList:true,subtree:true});
function decorate(){for(const n of document.querySelectorAll('#catalog .brand,#maker')){if(n.querySelector('img'))continue;const brand=n.textContent.trim(),logo=image(brand);if(logo)n.prepend(logo);}}
new MutationObserver(decorate).observe(document.getElementById('catalog'),{childList:true,subtree:true});new MutationObserver(decorate).observe(document.getElementById('maker'),{childList:true});decorate();draw();
})();

(() => {
'use strict';
const brand=document.getElementById('brand'),catalog=document.getElementById('catalog'),tools=document.querySelector('.tools');
if(!brand||!catalog||!tools||document.getElementById('n59-active-brand'))return;
const make=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
const row=make('div');row.id='n59-active-brand';row.hidden=true;row.setAttribute('role','group');row.setAttribute('aria-label','Выбранный бренд');
const chip=make('button'),label=make('span'),cross=make('span','×'),reset=make('button','Сбросить');chip.type=reset.type='button';chip.className='n59-brand-chip';reset.className='n59-brand-reset';cross.setAttribute('aria-hidden','true');chip.append(label,cross);row.append(chip,reset);tools.after(row);
function sync(){const selected=brand.value;row.hidden=!selected||catalog.classList.contains('n59-rules-hidden');label.textContent=brand.selectedOptions[0]?.textContent||selected;chip.setAttribute('aria-label','Убрать фильтр бренда '+label.textContent);reset.setAttribute('aria-label','Сбросить выбранный бренд');}
function clear(){brand.value='';brand.dispatchEvent(new Event('change',{bubbles:true}));sync();document.getElementById('brand-open')?.focus({preventScroll:true});}
chip.addEventListener('click',clear);reset.addEventListener('click',clear);brand.addEventListener('change',sync);new MutationObserver(sync).observe(brand,{childList:true,subtree:true});new MutationObserver(sync).observe(catalog,{attributes:true,attributeFilter:['class']});
const style=make('style');style.textContent=`
#n59-active-brand{display:flex;align-items:center;flex-wrap:wrap;gap:8px;margin:0 0 12px}#n59-active-brand[hidden]{display:none}
#n59-active-brand button{min-height:44px;max-width:100%;font:500 12px/1.5 var(--sans);touch-action:manipulation;cursor:pointer}
#n59-active-brand .n59-brand-chip{display:inline-flex;align-items:center;justify-content:space-between;gap:14px;padding:9px 12px;border:1px solid var(--line);border-radius:9px;background:#211b13;color:var(--gold);text-align:left}
#n59-active-brand .n59-brand-chip span:first-child{overflow-wrap:anywhere}#n59-active-brand .n59-brand-chip span:last-child{flex-shrink:0;font-size:20px;line-height:1}
#n59-active-brand .n59-brand-reset{padding:9px 10px;border:1px solid transparent;border-radius:8px;background:transparent;color:var(--muted)}
#n59-active-brand button:focus-visible{outline:2px solid var(--gold);outline-offset:3px}#n59-active-brand button:active{background:#dfbb7818}
#catalog .bottom .price{white-space:normal;overflow-wrap:anywhere}
`;document.head.append(style);
const money=new Intl.NumberFormat('ru-RU');
function patchPrices(cards){const items=typeof data!=='undefined'&&Array.isArray(data?.items)?data.items:[];const lookup=new Map(items.map(p=>['Открыть аромат '+p.name,p]));for(const card of cards){const button=card.querySelector('.more'),price=card.querySelector('.price');if(!button||!price)continue;const product=lookup.get(button.getAttribute('aria-label'));if(!product)continue;const value=product.price5;const text=typeof value==='number'&&Number.isFinite(value)&&value>0?'5 мл — '+money.format(value)+' ₽':'5 мл — уточните цену';if(price.textContent!==text)price.textContent=text;}}
new MutationObserver(records=>{const cards=[];for(const record of records)for(const node of record.addedNodes){if(!(node instanceof Element))continue;if(node.matches('.card'))cards.push(node);else cards.push(...node.querySelectorAll('.card'));}if(cards.length)patchPrices(cards);}).observe(catalog,{childList:true});
sync();patchPrices(catalog.querySelectorAll('.card'));
})();
