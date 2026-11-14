(() => {
'use strict';
if(document.getElementById('n59-navigation'))return;
const wrap=document.querySelector('.wrap');if(!wrap)return;
const style=document.createElement('style');
style.textContent=`
.wrap{padding-bottom:calc(110px + env(safe-area-inset-bottom,0px))}
.n59-rules-hidden{display:none!important}
#n59-rules[hidden]{display:none}
#n59-rules{padding:30px 0 16px}
#n59-rules h1{font:500 clamp(36px,8vw,48px)/1.1 var(--serif);color:var(--gold);margin:0 0 10px}
#n59-rules .n59-subtitle{font-size:14px;line-height:1.7;color:var(--muted);margin:0 0 22px}
#n59-rules ol{list-style:none;padding:0;margin:0;counter-reset:rules}
#n59-rules li{display:grid;grid-template-columns:32px minmax(0,1fr);gap:14px;border-bottom:1px solid var(--line);padding:23px 0;font-size:15px;line-height:1.75;color:var(--text);counter-increment:rules}
#n59-rules li::before{content:counter(rules,decimal-leading-zero);color:var(--gold);font-size:12px;letter-spacing:1px;padding-top:3px}
#n59-navigation{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:980px;z-index:5;display:grid;grid-template-columns:1fr 1fr;background:#0e0d0bf5;border-top:1px solid var(--line);padding:0 18px env(safe-area-inset-bottom,0px);backdrop-filter:blur(14px)}
#n59-navigation button{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:7px;min-height:78px;padding:14px 8px;border:0;background:none;color:var(--muted);font:500 11px/1.4 var(--sans);letter-spacing:1px;text-transform:uppercase}
#n59-navigation button[aria-current=page]{color:var(--gold)}
#n59-navigation button[aria-current=page]::before{content:'';position:absolute;top:0;width:38px;height:2px;background:var(--gold)}
#n59-navigation svg{width:24px;height:24px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
#n59-navigation button::after{content:'';position:absolute;inset:3px 6px 8px;border-radius:12px;background:radial-gradient(ellipse at 50% 28%,#dfbb7824,transparent 72%);opacity:0;pointer-events:none}
#n59-navigation button[aria-current=page]::after{opacity:.6}
#n59-navigation button:active::after{opacity:1}
#n59-navigation button:focus-visible{outline:2px solid var(--gold);outline-offset:-5px;border-radius:10px}
@media(prefers-reduced-motion:no-preference){
#n59-navigation button{transition:color .25s ease,transform .15s ease}
#n59-navigation button:active{transform:scale(.96)}
#n59-navigation button::after{transition:opacity .3s ease}
#n59-navigation button[aria-current=page]::before{animation:n59-nav-line .3s ease-out}
#n59-navigation button[aria-current=page] svg{filter:drop-shadow(0 0 5px #dfbb7845)}
@keyframes n59-nav-line{from{opacity:0;transform:scaleX(.3)}to{opacity:1;transform:scaleX(1)}}
}
@media(hover:hover) and (pointer:fine){#n59-navigation button:hover::after{opacity:.8}}
`;
document.head.append(style);
const section=document.createElement('section');section.id='n59-rules';section.hidden=true;section.setAttribute('aria-labelledby','n59-rules-title');
const heading=document.createElement('h1');heading.id='n59-rules-title';heading.tabIndex=-1;heading.textContent='Правила';
const subtitle=document.createElement('p');subtitle.className='n59-subtitle';subtitle.textContent='Распива и доставки';
const list=document.createElement('ol');
const rules=[
'К распиву предлагается только оригинальная парфюмерия.',
'Заказы оформляются по предоплате.',
'Доставка осуществляется через Ozon и Яндекс за счёт покупателя.',
'Отправка — в течение 1–2 дней после оплаты.',
'Атомайзеры входят в стоимость распива.',
'К каждому заказу на сумму от 3 000 ₽ — подарок.',
'По вопросам отмены заказа, возврата или повреждения при доставке свяжитесь с продавцом. Отмена и возврат рассматриваются в соответствии с применимым законодательством.'
];
for(const text of rules){const item=document.createElement('li'),body=document.createElement('span');body.textContent=text;item.append(body);list.append(item);}
section.append(heading,subtitle,list);wrap.append(section);
const catalogNodes=Array.from(wrap.children).filter(node=>node!==section&&!node.classList.contains('top'));
const nav=document.createElement('nav');nav.id='n59-navigation';nav.setAttribute('aria-label','Основные разделы');
function button(label,path){const node=document.createElement('button');node.type='button';const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');const shape=document.createElementNS('http://www.w3.org/2000/svg','path');shape.setAttribute('d',path);svg.append(shape);const caption=document.createElement('span');caption.textContent=label;node.append(svg,caption);return node;}
const catalogButton=button('Каталог','M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z');
const rulesButton=button('Правила','M6 2h8l4 4v16H6zM14 2v5h4M9 11h6M9 15h6M9 18h4');
catalogButton.setAttribute('aria-current','page');catalogButton.setAttribute('aria-controls','catalog');rulesButton.setAttribute('aria-controls',section.id);
nav.append(catalogButton,rulesButton);document.body.append(nav);
const navAnimations=new WeakMap(),motion=window.matchMedia('(prefers-reduced-motion: reduce)');
nav.addEventListener('click',e=>{const target=e.target instanceof Element?e.target.closest('button'):null;if(!target||target.disabled||motion.matches)return;const icon=target.querySelector('svg');if(!icon?.animate)return;navAnimations.get(icon)?.cancel();const animation=icon.animate([{transform:'translateY(0) scale(1)'},{transform:'translateY(-4px) scale(1.1)',offset:.4},{transform:'translateY(1px) scale(.98)',offset:.75},{transform:'translateY(0) scale(1)'}],{duration:420,easing:'cubic-bezier(.22,.7,.3,1)'});navAnimations.set(icon,animation);},true);
motion.addEventListener?.('change',()=>{if(motion.matches)for(const icon of nav.querySelectorAll('svg'))navAnimations.get(icon)?.cancel();});
let current='catalog',catalogScroll=0;
function showRules(){if(current==='rules')return;catalogScroll=window.scrollY;current='rules';for(const node of catalogNodes)node.classList.add('n59-rules-hidden');section.hidden=false;catalogButton.removeAttribute('aria-current');rulesButton.setAttribute('aria-current','page');window.scrollTo(0,0);heading.focus({preventScroll:true});}
function showCatalog(){if(current==='catalog')return;current='catalog';section.hidden=true;for(const node of catalogNodes)node.classList.remove('n59-rules-hidden');rulesButton.removeAttribute('aria-current');catalogButton.setAttribute('aria-current','page');window.scrollTo(0,catalogScroll);catalogButton.focus({preventScroll:true});}
rulesButton.addEventListener('click',showRules);catalogButton.addEventListener('click',showCatalog);
})();

(() => {
'use strict';
function start(){
const $=id=>document.getElementById(id),catalog=$('catalog'),dialog=$('dialog');if(!catalog||!dialog||$('n59-browse-upgrade'))return;
const make=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
const button=(text,fn)=>{const b=make('button',text,'n59-browse-button');b.type='button';b.onclick=fn;return b;};
const items=()=>typeof data!=='undefined'&&Array.isArray(data?.items)?data.items:[];
const style=make('style');style.id='n59-browse-upgrade';style.textContent=`
.n59-browse-button{min-height:44px;padding:10px 12px;border:1px solid var(--line);border-radius:8px;background:#211b13;color:var(--gold);font:500 13px/1.5 var(--sans);white-space:normal;overflow-wrap:anywhere}
#n59-fulfilment{margin:20px 0;border-block:1px solid var(--line);font:400 13px/1.7 var(--sans)}#n59-fulfilment summary{padding:14px 0;min-height:48px;cursor:pointer;color:var(--gold)}#n59-fulfilment p{margin:0 0 12px}
#n59-recent{margin:24px 0}#n59-recent[hidden],#n59-load-state[hidden]{display:none}#n59-recent h2{font:400 24px/1.4 var(--serif);color:var(--gold)}#n59-recent-list{display:grid;gap:8px}#n59-recent-list button{text-align:left}#n59-recent p{color:var(--muted);font:400 12px/1.6 var(--sans)}
#n59-load-state{padding:18px 0}#n59-load-state .n59-skeletons{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}#n59-load-state .n59-skeleton{height:220px;border:1px solid var(--line);border-radius:12px;background:linear-gradient(145deg,#211c15,#14120f)}
#n59-favorites>div>p,#n59-items>p{padding:16px;border:1px solid var(--line);border-radius:10px;font:400 14px/1.7 var(--sans);color:var(--muted)}
@media(max-width:359px){#n59-load-state .n59-skeletons{grid-template-columns:minmax(0,1fr)}}
`;document.head.append(style);
const fulfilment=make('details');fulfilment.id='n59-fulfilment';fulfilment.append(make('summary','Получение и оплата'));const ruleRows=document.querySelectorAll('#n59-rules li span');for(const index of [1,2,3,4])if(ruleRows[index])fulfilment.append(make('p',ruleRows[index].textContent));fulfilment.append(make('p','Наличие, стоимость доставки и итоговую сумму подтвердит продавец. Сообщение с заказом необходимо отправить самостоятельно.'));document.querySelector('#dialog .detail').append(fulfilment);
const recent=make('section');recent.id='n59-recent';recent.hidden=true;const recentList=make('div');recentList.id='n59-recent-list';const recentNote=make('p');recent.append(make('h2','Недавно смотрели'),recentList,recentNote);catalog.after(recent);
let viewed=[],storageOK=true;try{const saved=JSON.parse(localStorage.getItem('nota59-recent-v1')||'[]');if(Array.isArray(saved))viewed=saved.filter(p=>p&&typeof p.name==='string'&&typeof p.brand==='string').slice(0,5);}catch(e){storageOK=false;}
function drawRecent(){recentList.replaceChildren();const chosen=viewed.map(v=>items().find(p=>p.name===v.name&&p.brand===v.brand)).filter(Boolean);recent.hidden=!chosen.length||catalog.classList.contains('n59-rules-hidden');for(const p of chosen)recentList.append(button(p.name,()=>openProduct(p)));recentNote.textContent=storageOK?'История хранится только на этом устройстве.':'История доступна только до перезагрузки: сохранение недоступно.';}
let pending=null,origin=null,cartReturn=null;
function source(){return {panel:Array.from(document.querySelectorAll('dialog[open]')).at(-1)||null,scroll:window.scrollY,focus:document.activeElement};}
function restore(context){if(!context)return;if(context.panel){if(!context.panel.open)context.panel.showModal();context.panel.scrollTop=context.panelScroll||0;}else window.scrollTo(0,context.scroll);if(context.focus?.isConnected)context.focus.focus({preventScroll:true});}
const original=openProduct;openProduct=function(p){const from=pending||source();pending=null;if(from.panel!==dialog)origin=from;original(p);fulfilment.open=false;viewed=[{name:p.name,brand:p.brand},...viewed.filter(v=>v.name!==p.name||v.brand!==p.brand)].slice(0,5);try{localStorage.setItem('nota59-recent-v1',JSON.stringify(viewed));storageOK=true;}catch(e){storageOK=false;}drawRecent();purchase();};
function purchase(){if(typeof selected==='undefined'||!selected)return;const ml=$('v10')?.getAttribute('aria-pressed')==='true'?10:5;const value=selected[ml===5?'price5':'price10'];const label=ml+' мл · '+(typeof value==='number'&&value>0?new Intl.NumberFormat('ru-RU').format(value)+' ₽':'уточните цену');if($('chosen').textContent!==label)$('chosen').textContent=label;const cart=$('n59-detail-cart'),badge=$('n59-cart-count')?.textContent||'';const total=badge.split(' · ').slice(1).join(' · ');if(cart&&total&&cart.textContent!=='Корзина · '+total)cart.textContent='Корзина · '+total;}
new MutationObserver(purchase).observe($('chosen'),{childList:true});if($('n59-detail-cart'))new MutationObserver(purchase).observe($('n59-detail-cart'),{childList:true});
const cartPanel=$('n59-panel');
 document.addEventListener('click',e=>{const target=e.target instanceof Element?e.target:null;if(!target)return;if(target.closest('#n59-picker .qp-detail,#n59-favorites .n59-fav-actions button')){pending=source();pending.panelScroll=pending.panel?.scrollTop||0;queueMicrotask(()=>{pending=null;});}if(target.closest('#n59-detail-cart')&&dialog.open)cartReturn={p:typeof selected==='undefined'?null:selected,scroll:dialog.scrollTop,origin};else if(target.closest('#n59-cart')&&!dialog.open)cartReturn=null;},true);
 dialog.addEventListener('close',()=>{if(cartPanel?.open)return;const context=origin;origin=null;restore(context);});
 cartPanel?.addEventListener('close',()=>{if(!cartReturn)return;const saved=cartReturn;cartReturn=null;if(!saved.p)return;pending=saved.origin;openProduct(saved.p);dialog.scrollTop=saved.scroll;});
const tg=window.Telegram?.WebApp;function goBack(){const panel=Array.from(document.querySelectorAll('dialog[open]')).at(-1);if(panel?.id==='n59-picker'){const back=Array.from(panel.querySelectorAll('.qp-nav button')).find(b=>b.textContent==='Назад'||b.textContent==='Изменить ответы');if(back){back.click();return;}}if(panel){panel.close();return;}if(!$('n59-rules')?.hidden)document.querySelector('#n59-navigation button[aria-controls="catalog"]')?.click();}
function backState(){const show=!!document.querySelector('dialog[open]')||!$('n59-rules')?.hidden;if(show)tg?.BackButton?.show();else tg?.BackButton?.hide();}
if(tg?.BackButton){tg.BackButton.onClick(goBack);for(const panel of document.querySelectorAll('dialog'))new MutationObserver(backState).observe(panel,{attributes:true,attributeFilter:['open']});if($('n59-rules'))new MutationObserver(backState).observe($('n59-rules'),{attributes:true,attributeFilter:['hidden']});backState();}
const load=make('section');load.id='n59-load-state';load.setAttribute('aria-label','Состояние загрузки каталога');const skeletons=make('div',undefined,'n59-skeletons');skeletons.setAttribute('aria-hidden','true');for(let i=0;i<4;i++)skeletons.append(make('div',undefined,'n59-skeleton'));const retry=button('Повторить',async()=>{retry.disabled=true;skeletons.hidden=false;try{await init();}finally{retry.disabled=false;loading();}});retry.hidden=true;load.append(skeletons,retry);catalog.before(load);
function loading(){const failed=($('status')?.textContent||'').includes('Не удалось');const ready=typeof data!=='undefined'&&Array.isArray(data?.items)&&!failed;load.hidden=catalog.classList.contains('n59-rules-hidden')||ready;skeletons.hidden=failed;retry.hidden=!failed;catalog.setAttribute('aria-busy',String(!ready&&!failed));drawRecent();}
new MutationObserver(loading).observe($('status'),{childList:true});new MutationObserver(loading).observe(catalog,{childList:true,attributes:true,attributeFilter:['class']});loading();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
