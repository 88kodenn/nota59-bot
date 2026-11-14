(() => {
'use strict';
const s=document.getElementById('brand');if(!s||document.getElementById('brand-open'))return;
// Text styling inspired by brand typography, not official logos or proprietary fonts.
const serif='Georgia, "Times New Roman", serif',sans='Arial, Helvetica, sans-serif';
const profiles={
'Amouage':['AMOUAGE',sans,22,400,'.18em'],
'Clive Christian':['CLIVE CHRISTIAN',serif,20,400,'.055em'],
'Creed':['CREED',serif,27,400,'.10em'],
'Dior':['Dior',serif,30,400,'0'],
'Emporio Armani':['EMPORIO ARMANI',serif,20,400,'.06em'],
'Essential Parfums':['ESSENTIAL PARFUMS',sans,18,400,'.08em'],
'Ex Nihilo':['EX NIHILO',sans,22,400,'.18em'],
'Initio':['INITIO',sans,25,400,'.16em'],
'Jean Paul Gaultier':['JEAN PAUL GAULTIER',sans,19,600,'.025em'],
'Kilian':['KILIAN',serif,25,400,'.10em'],
'Louis Vuitton':['LOUIS VUITTON',sans,20,500,'.05em'],
'Maison Crivelli':['MAISON CRIVELLI',serif,19,400,'.07em'],
'Maison Margiela':['Maison Margiela',serif,22,400,'.015em'],
'Mancera':['MANCERA',serif,23,400,'.13em'],
'Parfums de Marly':['PARFUMS DE MARLY',serif,18,400,'.05em'],
'Tom Ford':['TOM FORD',sans,25,700,'.025em'],
'Viktor & Rolf':['VIKTOR&ROLF',serif,23,400,'.04em'],
'Xerjoff':['Xerjoff',serif,28,400,'.015em']
};
const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
function brandName(brand,text){const n=el('span',text,'bp-name'),p=profiles[brand];if(p){n.textContent=p[0];for(const [key,value] of Object.entries({'--bp-family':p[1],'--bp-size':p[2]+'px','--bp-weight':p[3],'--bp-spacing':p[4]}))n.style.setProperty(key,String(value));}return n;}
const style=el('style');style.textContent=`
#brand-open{min-width:0;width:100%;min-height:48px;padding:10px;background:#191610;color:var(--gold);border:1px solid var(--line);border-radius:9px;font:12px var(--sans);text-overflow:ellipsis;overflow:hidden;white-space:nowrap}
#brand-panel{width:calc(100% - 24px);max-width:480px;max-height:85dvh;background:linear-gradient(140deg,#241e15,#100f0c);border:1px solid #b7935266;border-radius:20px;overflow:hidden;color:var(--text)}
#brand-panel::backdrop{background:#000b;backdrop-filter:blur(6px)}
.bp-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:18px}
#brand-panel h2{font:600 28px var(--serif);color:var(--gold);margin:0}
.bp-search{display:block;width:calc(100% - 36px);margin:0 18px 14px;padding:13px;border:1px solid var(--line);background:#100e0b;color:var(--text);border-radius:10px;font:16px var(--sans)}
.bp-list{overflow-y:auto;max-height:48dvh;overscroll-behavior:contain;padding:0 12px 18px}
.bp-row{display:flex;align-items:center;gap:12px;width:100%;min-height:78px;padding:14px 10px;border:0;border-bottom:1px solid var(--line);border-radius:8px;background:transparent;color:var(--text);text-align:left;font:14px var(--sans)}
.bp-row[aria-pressed=true]{background:#d5b37518;box-shadow:inset 0 0 0 1px #d5b37566}
.bp-copy{flex:1;min-width:0}#brand-panel .bp-name{display:block;max-width:100%;font-family:var(--bp-family,var(--sans));font-size:var(--bp-size,20px);font-weight:var(--bp-weight,400);line-height:1.35;letter-spacing:var(--bp-spacing,0);text-transform:none;white-space:normal;overflow-wrap:anywhere}#brand-panel .bp-copy small{display:block;color:var(--muted);font:11px/1.5 var(--sans);letter-spacing:0;text-transform:none;margin-top:7px}
.bp-empty{padding:16px;color:var(--muted)}
@media(max-width:359px){#brand-panel .bp-name{font-size:min(var(--bp-size,20px),6vw)}}
@media(prefers-reduced-motion:reduce){#brand-panel[open]{animation:none}}
`;document.head.append(style);
const trigger=el('button','Все бренды ⌄');trigger.id='brand-open';trigger.type='button';trigger.setAttribute('aria-haspopup','dialog');trigger.setAttribute('aria-controls','brand-panel');trigger.setAttribute('aria-expanded','false');s.after(trigger);s.hidden=true;
const panel=el('dialog');panel.id='brand-panel';panel.setAttribute('aria-labelledby','bp-heading');const head=el('div',undefined,'bp-head'),title=el('h2','Парфюмерные дома'),close=el('button','×','close');title.id='bp-heading';close.type='button';close.setAttribute('aria-label','Закрыть выбор бренда');head.append(title,close);
const search=el('input',undefined,'bp-search');search.type='search';search.placeholder='Найти бренд';search.setAttribute('aria-label','Поиск бренда');const list=el('div',undefined,'bp-list');panel.append(head,search,list);document.body.append(panel);
function draw(){trigger.textContent=(s.selectedOptions[0]?.textContent||'Все бренды')+' ⌄';list.replaceChildren();const q=search.value.trim().toLowerCase();let found=0;for(const o of s.options){if(o.value&&!o.textContent.toLowerCase().includes(q))continue;found++;const row=el('button',undefined,'bp-row');row.type='button';row.setAttribute('aria-pressed',String(o.value===s.value));const copy=el('span',undefined,'bp-copy');copy.append(brandName(o.value,o.textContent));if(typeof data!=='undefined'&&data?.items)copy.append(el('small','Ароматов: '+data.items.filter(p=>!o.value||p.brand===o.value).length));row.append(copy);if(o.value===s.value){const tick=el('span','✓');tick.setAttribute('aria-hidden','true');row.append(tick);}row.onclick=()=>{s.value=o.value;s.dispatchEvent(new Event('change',{bubbles:true}));panel.close();draw();};list.append(row);}if(!found)list.append(el('p','Бренд не найден','bp-empty'));}
trigger.onclick=()=>{search.value='';draw();panel.showModal();trigger.setAttribute('aria-expanded','true');close.focus();};close.onclick=()=>panel.close();panel.addEventListener('close',()=>{trigger.setAttribute('aria-expanded','false');trigger.focus();});search.oninput=draw;s.addEventListener('change',draw);new MutationObserver(draw).observe(s,{childList:true,subtree:true});draw();
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

(() => {
'use strict';
if(document.getElementById('n59-editorial-type'))return;
const href='https://fonts.googleapis.com/css2?family=Onest:wght@400;500;600&family=Prata&display=swap';
let link=document.querySelector('link[rel="stylesheet"][href*="fonts.googleapis.com"]');
if(link)link.href=href;else{link=document.createElement('link');link.rel='stylesheet';link.href=href;document.head.append(link);}
const style=document.createElement('style');style.id='n59-editorial-type';style.textContent=`
:root{--serif:'Prata',Georgia,serif;--sans:'Onest',system-ui,Arial,sans-serif}
body,input,select,textarea,button{font-family:var(--sans)}
.logo,.hero h1,.section h2,#catalog .name,#dialog .name,#dialog h3,#n59-picker h2,#n59-picker h3,#n59-panel h2,#brand-panel h2,#n59-favorites h2,#n59-favorites h3,#n59-search-empty h3,.tier h4{font-family:var(--serif);font-weight:400;font-synthesis:none}
#catalog .name{font-size:20px;line-height:1.35;letter-spacing:-.2px}
#dialog .name{font-size:30px;line-height:1.3;letter-spacing:-.3px}
#dialog .detail>h3{font-size:25px;line-height:1.35}
#dialog .copy{font-family:var(--sans);font-size:15px;font-weight:400;line-height:1.8;letter-spacing:0}
#description .n59-story-section{display:block;margin-top:22px;white-space:pre-wrap}
#description .n59-story-label{display:block;margin-bottom:6px;font:500 13px/1.6 var(--sans);letter-spacing:.15px;color:var(--gold)}
.price,#chosen,#n59-total,#n59-cart-count{font-family:var(--sans);font-variant-numeric:tabular-nums}
@media(max-width:699px){#catalog .name{font-size:18px;line-height:1.35}#dialog .name{font-size:27px}#dialog .detail>h3{font-size:23px}#dialog .copy{font-size:15px;line-height:1.8}.section h2{font-size:25px}#brand-panel h2{font-size:24px}.hero h1{font-size:clamp(28px,7.4vw,36px);line-height:1.25}}
`;document.head.append(style);
const description=document.getElementById('description');if(!description)return;
let rendered=null;
const titles={'В СТОРОНУ':'Направленность','КОМУ ПОДОЙДЁТ':'Кому подойдёт','КОМУ ПОДОЙДЕТ':'Кому подойдёт','КОГДА НОСИТЬ':'Когда носить','СТОЙКОСТЬ И ШЛЕЙФ':'Стойкость и шлейф'};
function format(){if(description.innerHTML===rendered)return;const raw=description.textContent;const matches=[...raw.matchAll(/(^|\n)[\t ]*(В СТОРОНУ|КОМУ ПОДОЙДЁТ|КОМУ ПОДОЙДЕТ|КОГДА НОСИТЬ|СТОЙКОСТЬ И ШЛЕЙФ):[\t ]*/gu)];if(!matches.length){rendered=description.innerHTML;return;}const fragment=document.createDocumentFragment();fragment.append(document.createTextNode(raw.slice(0,matches[0].index).trimEnd()));matches.forEach((m,i)=>{const section=document.createElement('span'),label=document.createElement('span');section.className='n59-story-section';label.className='n59-story-label';label.textContent=titles[m[2]];section.append(label,document.createTextNode(raw.slice(m.index+m[0].length,matches[i+1]?.index??raw.length).trim()));fragment.append(section);});description.replaceChildren(fragment);rendered=description.innerHTML;}
new MutationObserver(format).observe(description,{childList:true});format();
})();
