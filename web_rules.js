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
let current='catalog',catalogScroll=0;
function showRules(){if(current==='rules')return;catalogScroll=window.scrollY;current='rules';for(const node of catalogNodes)node.classList.add('n59-rules-hidden');section.hidden=false;catalogButton.removeAttribute('aria-current');rulesButton.setAttribute('aria-current','page');window.scrollTo(0,0);heading.focus({preventScroll:true});}
function showCatalog(){if(current==='catalog')return;current='catalog';section.hidden=true;for(const node of catalogNodes)node.classList.remove('n59-rules-hidden');rulesButton.removeAttribute('aria-current');catalogButton.setAttribute('aria-current','page');window.scrollTo(0,catalogScroll);catalogButton.focus({preventScroll:true});}
rulesButton.addEventListener('click',showRules);catalogButton.addEventListener('click',showCatalog);
})();
