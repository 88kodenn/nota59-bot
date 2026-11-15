"""Scoped rules-page presentation for the deployed mini app."""

REMOVED_RULE = "'По вопросам отмены заказа, возврата или повреждения при доставке свяжитесь с продавцом. Отмена и возврат рассматриваются в соответствии с применимым законодательством.'\n".encode('utf-8')

ENHANCEMENT = '''<style id="n59-rules-design-v1">
#n59-navigation button svg,#n59-navigation #n59-cart svg{overflow:visible}
#n59-navigation button svg path,#n59-navigation #n59-cart svg path{transform-box:fill-box;transform-origin:center;transform:scale(1.25)}
#n59-rules{padding:24px 0 20px!important}
#n59-rules #n59-rules-title{font:500 clamp(34px,8vw,44px)/1.08 var(--serif)!important;color:var(--gold);margin:0 0 8px!important;border:0!important;box-shadow:none!important}
#n59-rules #n59-rules-title:focus{outline:none!important}
#n59-rules #n59-rules-title:focus-visible{outline:2px solid var(--gold)!important;outline-offset:5px;border-radius:6px}
#n59-rules .n59-subtitle{font:400 13px/1.6 var(--sans)!important;letter-spacing:.2px;margin:0 0 22px!important;color:var(--muted)}
#n59-rules ol{display:grid!important;grid-template-columns:minmax(0,1fr);gap:10px!important;margin:0!important;padding:0!important;list-style:none}
#n59-rules li{display:grid!important;grid-template-columns:32px minmax(0,1fr)!important;align-content:start;gap:5px 12px!important;padding:17px 16px!important;margin:0!important;border:1px solid var(--line)!important;border-radius:14px!important;background:linear-gradient(135deg,#211c15,#15120e)!important;box-shadow:inset 0 1px 0 #fff4df05;min-width:0}
#n59-rules li::before{grid-column:1;grid-row:1/span 2;display:flex;align-items:center;justify-content:center;width:30px;height:30px;padding:0!important;margin:0!important;border:1px solid #dfbb7838;border-radius:9px;background:#dfbb780a;color:var(--gold);font:500 11px/1 var(--sans)!important;letter-spacing:.5px}
#n59-rules li .n59-rule-heading{grid-column:2;margin:0!important;padding:0!important;border:0!important;color:var(--gold);font:600 14px/1.45 var(--sans)!important;letter-spacing:0}
#n59-rules li>span{grid-column:2;min-width:0;color:var(--text);font:400 13px/1.7 var(--sans)!important;overflow-wrap:anywhere}
#n59-rules li:last-child{border-color:#dfbb7855!important;background:linear-gradient(135deg,#302616,#19150e)!important}
@media(min-width:700px){#n59-rules ol{grid-template-columns:repeat(2,minmax(0,1fr))}#n59-rules li{padding:20px!important}}
@media(max-width:359px){#n59-rules li{padding:15px 12px!important;gap:5px 9px!important}}
#n59-decant-info.n59-trust{margin:14px 0 0;padding:22px 18px;border:1px solid #dfbb7838;border-radius:14px;background:linear-gradient(140deg,#231d14,#14120e)}
#n59-decant-info.n59-trust h2{margin:0 0 14px;color:var(--gold);font:500 clamp(28px,6.5vw,36px)/1.1 var(--serif)}
#n59-decant-info.n59-trust p{margin:0;color:var(--muted);font:400 13px/1.75 var(--sans);overflow-wrap:anywhere}
#n59-decant-info.n59-trust .n59-trust-lead{margin-bottom:8px;color:var(--text);font-weight:500}
#n59-decant-info.n59-trust .n59-trust-benefits{display:grid;grid-template-columns:minmax(0,1fr);gap:9px;margin:18px 0;padding:0;list-style:none}
#n59-decant-info.n59-trust li{padding:13px 14px;border:1px solid var(--line);border-radius:10px;background:#dfbb7805;min-width:0}
#n59-decant-info.n59-trust h3{margin:0 0 5px;padding:0;border:0;color:var(--gold);font:600 13px/1.5 var(--sans)}
#n59-decant-info.n59-trust li p{font-size:12px;line-height:1.65}
#n59-decant-info.n59-trust button{width:100%;min-height:48px;padding:13px 16px;border:1px solid #dfbb78;border-radius:9px;background:linear-gradient(110deg,#b58a46,#e1bf7c);color:#17130d;font:600 13px/1.5 var(--sans);touch-action:manipulation}
@media(min-width:700px){#n59-decant-info.n59-trust{padding:26px}#n59-decant-info.n59-trust .n59-trust-benefits{grid-template-columns:repeat(3,minmax(0,1fr))}}
</style><script>
(()=>{'use strict';function enhance(){const section=document.getElementById('n59-rules');if(!section||section.dataset.designVersion==='1')return;section.dataset.designVersion='1';const titles=['Оригинальная парфюмерия','Оплата заказа','Доставка','Срок отправки','Атомайзеры включены','Подарок к заказу'];section.querySelectorAll('ol > li').forEach((row,index)=>{if(!titles[index])return;const title=document.createElement('h2');title.className='n59-rule-heading';title.textContent=titles[index];row.prepend(title);});}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',enhance,{once:true});else enhance();})();
(()=>{
'use strict';
function start(){
const old=document.getElementById('n59-decant-info'),hero=document.querySelector('.hero');if(!old||!hero||old.classList.contains('n59-trust'))return;
const make=(tag,text)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;return node;};
const section=make('section');section.id=old.id;section.className='n59-trust';section.setAttribute('aria-labelledby','n59-trust-title');
const heading=make('h2','Оригинальный аромат. Ваш объём.');heading.id='n59-trust-title';
const lead=make('p','В «Ноте 59» — только оригинальная парфюмерия на распив.');lead.className='n59-trust-lead';
const copy=make('p','Мы отбираем 5 или 10 мл из оригинального флакона в отдельный атомайзер с распылителем. Не разбавляем и ничего не добавляем.');
const benefits=make('ul');benefits.className='n59-trust-benefits';
for(const [title,text] of [
['Попробовать','Познакомьтесь с ароматом в повседневной жизни — без покупки целого флакона.'],
['Чередовать','Соберите небольшой гардероб ароматов: для работы, вечера и особого настроения.'],
['Взять с собой','Компактный атомайзер удобно положить в сумку или взять в поездку.']
]){const item=make('li');item.append(make('h3',title),make('p',text));benefits.append(item);}
const button=make('button','Выбрать аромат');button.type='button';button.addEventListener('click',()=>{const tools=document.querySelector('.tools');tools?.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});});
section.append(heading,lead,copy,benefits,button);old.replaceWith(section);
const sync=()=>section.classList.toggle('n59-rules-hidden',hero.classList.contains('n59-rules-hidden'));sync();new MutationObserver(sync).observe(hero,{attributes:true,attributeFilter:['class']});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
</script>'''.encode('utf-8')


def patch(body):
    body = body.replace(REMOVED_RULE, b'', 1)
    if b'id="n59-rules-design-v1"' not in body:
        body = body.replace(b'</body>', ENHANCEMENT + b'</body>', 1)
    return body
