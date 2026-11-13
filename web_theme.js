(() => {
'use strict';
if(document.getElementById('n59-mobile-layout'))return;
const style=document.createElement('style');style.id='n59-mobile-layout';style.textContent=`
@media(max-width:699px){
.wrap{padding-left:max(14px,env(safe-area-inset-left,0px));padding-right:max(14px,env(safe-area-inset-right,0px));padding-bottom:calc(var(--n59-mobile-nav-height,110px) + 20px)}
.top{gap:10px;padding:16px 0}.top .logo{font-size:28px;letter-spacing:1.5px}.top .micro{max-width:55%;font-size:9px;line-height:1.6;letter-spacing:.35px;overflow-wrap:anywhere}
.hero{margin-top:14px;padding:24px 20px;min-height:260px}.hero:after{inset:8px}.hero .hero-copy{max-width:100%;width:100%}.hero .eyebrow{font-size:10px;letter-spacing:.8px}.hero h1{font-size:clamp(34px,8.5vw,40px);line-height:1.05;margin:14px 0}.hero .hero-copy>p{max-width:calc(100% - 72px);font-size:12px;line-height:1.65}.hero .bottle{right:17px;bottom:26px;width:52px;height:105px;pointer-events:none}.hero .bottle:before{top:-32px;width:32px;height:31px}.hero .bottle span{font-size:8px;letter-spacing:.4px}
.hero #n59-picker-open{min-height:48px;max-width:calc(100% - 65px);padding:12px 14px;font-size:13px;line-height:1.45;white-space:normal;touch-action:manipulation}.hero .n59-picker-skip{max-width:calc(100% - 65px);font-size:10px;line-height:1.6}
.tools{grid-template-columns:minmax(0,1fr) 110px;gap:8px;padding:12px 0 10px}.tools input,.tools select{min-width:0;min-height:48px;font-size:16px}.tools input{padding:12px 10px}.tools select{padding:12px 8px}#brand-open{min-width:0;min-height:48px;padding:10px 8px;font-size:11px;touch-action:manipulation}
.section{flex-wrap:wrap;align-items:baseline;gap:6px 12px;margin:10px 0 12px}.section h2{font-size:27px}#status{font-size:11px;overflow-wrap:anywhere}
#catalog{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}#catalog .card{min-width:0}#catalog .cover img{padding:10px}#catalog .info{padding:12px 10px}#catalog .brand{font-size:10px;letter-spacing:.3px;overflow-wrap:anywhere}#catalog .name{font-size:20px;line-height:1.15;margin-bottom:14px;overflow-wrap:anywhere}#catalog .bottom{gap:6px;padding-top:8px}#catalog .price{font-size:13px}#catalog .more{width:44px;height:44px;min-width:44px;min-height:44px;touch-action:manipulation}
#n59-navigation{padding:0 max(12px,env(safe-area-inset-right,0px)) env(safe-area-inset-bottom,0px) max(12px,env(safe-area-inset-left,0px));background:#0e0d0b;backdrop-filter:none;-webkit-backdrop-filter:none}#n59-navigation button{min-width:0;min-height:68px;padding:8px 3px;gap:4px;font-size:10px;line-height:1.4;letter-spacing:.5px;touch-action:manipulation}#n59-navigation svg,#n59-navigation #n59-cart svg{width:22px;height:22px}#n59-navigation #n59-cart{padding:8px 3px;font-size:10px;gap:3px}#n59-cart-count{font-size:10px}
#dialog,#n59-picker,#n59-panel,#brand-panel{box-sizing:border-box;width:calc(100% - 20px);max-height:calc(100vh - 24px);max-height:calc(100dvh - 24px);overscroll-behavior:contain;scroll-padding-bottom:20px}#dialog .detail{padding:16px 14px 0}#dialog .name{font-size:30px;overflow-wrap:anywhere}#dialog .copy{font-size:14px;line-height:1.7}#dialog .volumes{gap:8px;margin:16px 0 20px}#dialog .volumes button{min-height:48px;touch-action:manipulation}
#n59-picker .qp-head,#n59-picker .qp-body{padding:16px}#n59-picker h2{font-size:25px}#n59-picker h3{font-size:27px}#n59-picker .qp-option{min-height:56px;touch-action:manipulation}#n59-picker .qp-nav button{min-height:44px}
#n59-panel{padding:16px}#n59-panel h2{font-size:28px}#n59-form input,#n59-form select,#n59-form textarea,.bp-search{font-size:16px}#n59-form input,#n59-form select{min-height:48px}#n59-form textarea{min-height:88px}.n59-controls button{min-width:44px;min-height:44px;touch-action:manipulation}#n59-checkout{overflow-wrap:anywhere}
.footer{flex-wrap:wrap;gap:12px;font-size:11px}.ingredient{width:58px}.ingredient span{font-size:10px}.ingredients{gap:12px 6px}
}
@media(max-width:359px){
.wrap{padding-left:max(12px,env(safe-area-inset-left,0px));padding-right:max(12px,env(safe-area-inset-right,0px))}.top .logo{font-size:25px}.top .micro{font-size:8px;letter-spacing:0}.hero{padding:22px 18px}.hero .bottle{display:none}.hero .hero-copy>p,.hero .n59-picker-skip{max-width:100%}.hero #n59-picker-open{width:100%;max-width:100%}.tools{grid-template-columns:minmax(0,1fr)}#catalog .name{font-size:19px}#catalog .bottom{display:grid;grid-template-columns:minmax(0,1fr);gap:8px}#catalog .price{white-space:normal;overflow-wrap:anywhere}#catalog .more{justify-self:end}
}
@media(max-width:299px){#catalog{grid-template-columns:minmax(0,1fr)}.top .micro{max-width:100%}.hero h1{font-size:32px}}
@media(max-height:500px) and (orientation:landscape) and (max-width:699px){#dialog,#n59-picker,#n59-panel,#brand-panel{max-height:calc(100vh - 12px);max-height:calc(100dvh - 12px)}}
`;document.head.append(style);
const nav=document.getElementById('n59-navigation');
if(!nav)return;
const media=window.matchMedia('(max-width:699px)');
const measure=()=>{if(media.matches)document.documentElement.style.setProperty('--n59-mobile-nav-height',Math.ceil(nav.getBoundingClientRect().height)+'px');else document.documentElement.style.removeProperty('--n59-mobile-nav-height');};
if('ResizeObserver' in window)new ResizeObserver(measure).observe(nav);
window.addEventListener('resize',measure,{passive:true});
if(media.addEventListener)media.addEventListener('change',measure);else media.addListener(measure);
measure();
})();

(() => {
'use strict';
const make=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
const header=document.querySelector('.top .micro');
if(header)header.replaceChildren(document.createTextNode('Люксовая и нишевая'),make('br'),document.createTextNode('парфюмерия в распив'));
const hero=document.querySelector('.hero'),heading=hero?.querySelector('h1');
if(heading)heading.replaceChildren(document.createTextNode('Небольшой объём.'),make('br'),make('em','Никаких лишних трат.'));
if(!hero||document.getElementById('n59-decant-info'))return;
const details=make('details');details.id='n59-decant-info';
const summary=make('summary','Что такое распив?');details.append(summary);
const body=make('div');body.className='n59-decant-copy';
for(const text of [
'Распив — это часть оригинального аромата в небольшом атомайзере с распылителем. Из большого флакона отбирается нужный объём — 5 или 10 мл.',
'Парфюм не разбавляется и не смешивается с другими составами. Это не реплика и не клон, а аромат из оригинального флакона в удобном небольшом объёме.',
'Так можно познакомиться с ароматом и поносить его перед покупкой полноразмерного флакона.'
])body.append(make('p',text));
details.append(body);hero.after(details);
const style=make('style');style.textContent=`
#n59-decant-info{margin:12px 0 0;border:1px solid var(--line);border-radius:10px;background:#191610;color:var(--text)}
#n59-decant-info>summary{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:48px;padding:13px 16px;list-style:none;color:var(--gold);font:500 13px/1.5 var(--sans);cursor:pointer;touch-action:manipulation}
#n59-decant-info>summary::-webkit-details-marker{display:none}#n59-decant-info>summary::after{content:'+';font:400 20px/1 var(--sans)}#n59-decant-info[open]>summary::after{content:'−'}#n59-decant-info>summary:focus-visible{outline:2px solid var(--gold);outline-offset:3px;border-radius:9px}
#n59-decant-info .n59-decant-copy{padding:0 16px 16px}#n59-decant-info p{margin:12px 0 0;color:var(--muted);font:400 14px/1.75 var(--sans);overflow-wrap:anywhere}
`;document.head.append(style);
const sync=()=>details.classList.toggle('n59-rules-hidden',hero.classList.contains('n59-rules-hidden'));
sync();new MutationObserver(sync).observe(hero,{attributes:true,attributeFilter:['class']});
})();

(() => {
'use strict';
if(document.getElementById('n59-card-cart-ui'))return;
const style=document.createElement('style');style.id='n59-card-cart-ui';style.textContent=`
#catalog .card .bottom{display:grid;grid-template-columns:minmax(0,1fr);gap:10px;align-items:stretch}
#catalog .bottom .price{white-space:normal;overflow-wrap:anywhere}
#catalog .bottom .more{display:flex;align-items:center;justify-content:center;width:100%;height:auto;min-width:0;min-height:44px;padding:11px 8px;border:1px solid #b58a4666;border-radius:8px;background:#c89e4b12;color:var(--gold);font:500 13px/1.4 var(--sans);touch-action:manipulation}
#catalog .bottom .more:active{background:#dfbb7826}#catalog .bottom .more:focus-visible{outline:2px solid var(--gold);outline-offset:3px}
#n59-panel{padding:0 18px 18px;scroll-padding-top:84px}
#n59-panel .n59-head{position:sticky;top:0;z-index:3;display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 -18px 12px;padding:14px 18px;background:#14120f;border-bottom:1px solid var(--line)}
#n59-panel .n59-head h2{min-width:0;overflow-wrap:anywhere}
#n59-panel .n59-head button{flex-shrink:0;min-width:44px;min-height:44px;touch-action:manipulation}
#n59-panel #n59-clear{display:block;width:auto;max-width:100%;min-height:44px;margin:8px 0 16px auto;padding:10px 6px;border:1px solid transparent;border-radius:7px;background:transparent;color:var(--muted);font:400 12px/1.5 var(--sans);text-align:right;touch-action:manipulation}
#n59-panel #n59-clear:disabled{opacity:.35}#n59-panel #n59-clear:focus-visible{outline:2px solid var(--gold);outline-offset:2px}
@media(hover:hover) and (pointer:fine){#catalog .bottom .more:hover{background:#dfbb7826}#n59-panel #n59-clear:not(:disabled):hover{color:var(--gold);text-decoration:underline}}
@media(max-width:699px){#n59-panel{padding:0 16px 16px}#n59-panel .n59-head{margin:0 -16px 12px;padding:12px 16px}}
`;document.head.append(style);
const catalog=document.getElementById('catalog');if(!catalog)return;
function patch(root){if(!(root instanceof Element))return;const buttons=root.matches('.more')?[root]:root.querySelectorAll('.more');for(const button of buttons){if(button.textContent!=='Подробнее')button.textContent='Подробнее';}}
patch(catalog);
new MutationObserver(records=>{for(const record of records)for(const node of record.addedNodes)patch(node);}).observe(catalog,{childList:true,subtree:true});
})();

(() => {
'use strict';
function start(){
if(document.getElementById('n59-responsive-v2'))return;
const style=document.createElement('style');style.id='n59-responsive-v2';style.textContent=`
#brand-panel .bp-logo{display:none!important}
@media(max-width:699px){
#dialog,#n59-panel,#n59-picker,#brand-panel,#n59-favorites{width:calc(100% - 20px);max-width:550px;max-height:calc(var(--n59-visible-height,100dvh) - 24px);box-sizing:border-box;overscroll-behavior:contain;scrollbar-gutter:stable;scroll-padding-bottom:24px}
#dialog .detail{padding:16px 14px 0}#dialog .detail-top{gap:8px}#dialog .detail-top .micro{min-width:0;overflow-wrap:anywhere}#dialog #close{flex-shrink:0}
#dialog .purchase{grid-template-columns:minmax(0,auto) minmax(0,1fr)!important;gap:10px;padding:10px 14px max(10px,env(safe-area-inset-bottom,0px))!important;margin-top:18px}
#dialog #chosen{font-size:18px;line-height:1.4;white-space:normal;overflow-wrap:anywhere}#dialog #n59-detail-cart{min-height:48px;padding:10px;font:500 13px/1.5 var(--sans);white-space:normal;overflow-wrap:anywhere}
#dialog .volumes button{min-width:0;white-space:normal;overflow-wrap:anywhere;padding:10px 8px}
#n59-panel .n59-row,#n59-panel #n59-total,#n59-panel #n59-message,#n59-preview{min-width:0;overflow-wrap:anywhere}#n59-panel .n59-row strong{display:block;font:500 15px/1.6 var(--sans)}
#n59-panel .n59-controls{gap:8px;flex-wrap:wrap}#n59-panel .n59-controls button{min-width:44px;min-height:44px;padding:8px 12px;white-space:normal;overflow-wrap:anywhere}
#n59-form label{min-width:0}#n59-form input,#n59-form select,#n59-form textarea{max-width:100%;font-size:16px;scroll-margin-block:90px}#n59-form .n59-field-error{overflow-wrap:anywhere}#n59-checkout{min-height:48px;padding:14px 12px;white-space:normal;overflow-wrap:anywhere}
#n59-panel{padding-bottom:max(16px,env(safe-area-inset-bottom,0px))}#n59-favorites{padding-bottom:max(16px,env(safe-area-inset-bottom,0px))}
#n59-picker .qp-option,#n59-picker .qp-nav button,.bp-row,.n59-extra-button{min-width:0;white-space:normal;overflow-wrap:anywhere}.bp-copy{overflow-wrap:anywhere}
#n59-navigation button,#n59-navigation #n59-cart{overflow-wrap:anywhere}#n59-navigation #n59-cart-count{max-width:100%;white-space:normal;line-height:1.5}
}
@media(max-width:389px){.tools{grid-template-columns:minmax(0,1fr);gap:8px}.tools #brand-open{width:100%;font-size:13px;text-align:left}.tools input{width:100%}.tools{padding-top:10px;padding-bottom:10px}}
@media(max-width:359px){#catalog{grid-template-columns:minmax(0,1fr)}#catalog .cover{aspect-ratio:1/1}#catalog .info{padding:14px}#catalog .name{font-size:21px}#catalog .price{font-size:15px}#dialog .purchase{grid-template-columns:minmax(0,1fr)!important;gap:7px}#dialog #chosen{font-size:18px}#dialog #n59-detail-cart{width:100%}.top{flex-wrap:wrap}.top .micro{max-width:100%}}
@media(max-height:500px) and (orientation:landscape){#dialog,#n59-panel,#n59-picker,#brand-panel,#n59-favorites{max-height:calc(var(--n59-visible-height,100dvh) - 12px)}#dialog .purchase{position:static}#n59-picker .qp-head{position:static}}
`;document.head.append(style);
const panel=document.getElementById('brand-panel');
if(panel){const removeImages=()=>{for(const logo of panel.querySelectorAll('.bp-logo'))logo.remove();};removeImages();new MutationObserver(removeImages).observe(panel,{childList:true,subtree:true});}
let frame=0;
function sync(){cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{const viewport=window.visualViewport;const height=Math.min(window.innerHeight,viewport?.height||window.innerHeight);if(height>0)document.documentElement.style.setProperty('--n59-visible-height',Math.floor(height)+'px');const field=document.activeElement;if(window.matchMedia('(max-width:699px)').matches&&field?.matches('input,textarea,select')&&field.closest('dialog[open]')){const rect=field.getBoundingClientRect(),top=viewport?.offsetTop||0;if(rect.bottom>top+height-20||rect.top<top+60)field.scrollIntoView({block:'center',inline:'nearest',behavior:'instant'});}});}
window.addEventListener('resize',sync,{passive:true});window.addEventListener('orientationchange',sync,{passive:true});window.visualViewport?.addEventListener('resize',sync,{passive:true});document.addEventListener('focusin',sync);document.addEventListener('focusout',sync);const tg=window.Telegram?.WebApp;if(typeof tg?.onEvent==='function')tg.onEvent('viewportChanged',sync);sync();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
