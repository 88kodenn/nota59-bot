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
#n59-decant-info .n59-decant-benefits{margin-top:20px;padding-top:16px;border-top:1px solid var(--line)}
#n59-decant-info .n59-decant-benefits h3{margin:16px 0 5px;padding:0;border:0;color:var(--gold);font:600 14px/1.5 var(--sans)}
#n59-decant-info .n59-decant-benefits h3:first-child{margin-top:0}
#n59-decant-info .n59-decant-benefits p{margin:0}
</style><script>
(()=>{'use strict';function enhance(){const section=document.getElementById('n59-rules');if(!section||section.dataset.designVersion==='1')return;section.dataset.designVersion='1';const titles=['Оригинальная парфюмерия','Оплата заказа','Доставка','Срок отправки','Атомайзеры включены','Подарок к заказу'];section.querySelectorAll('ol > li').forEach((row,index)=>{if(!titles[index])return;const title=document.createElement('h2');title.className='n59-rule-heading';title.textContent=titles[index];row.prepend(title);});}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',enhance,{once:true});else enhance();})();
(()=>{
'use strict';
function start(){
const details=document.getElementById('n59-decant-info'),body=details?.querySelector('.n59-decant-copy');if(!details||details.tagName!=='DETAILS'||!body||details.dataset.copyVersion==='2')return;
details.dataset.copyVersion='2';const summary=details.querySelector('summary');if(summary)summary.textContent='Что такое распив?';
const make=(tag,text)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;return node;};
body.replaceChildren();
for(const text of [
'Распив — это покупка части аромата из оригинального полноразмерного флакона. Вместо целого флакона вы выбираете нужный объём — 5 или 10 мл. Мы отбираем эту порцию парфюма в отдельный атомайзер — небольшой флакон с распылителем.',
'В «Ноте 59» на распив предлагается только оригинальная парфюмерия. Мы не разбавляем парфюм, не смешиваем его с другими составами и ничего не добавляем. Вы получаете аромат из оригинального флакона, а не реплику или имитацию.',
'Парфюм приходит в отдельном атомайзере, а не в фирменном флаконе бренда. Так можно выбрать небольшой объём для знакомства с ароматом или пользоваться любимой композицией без покупки целого флакона.'
])body.append(make('p',text));
const benefits=make('div');benefits.className='n59-decant-benefits';
for(const [title,text] of [
['Попробовать','Поносите аромат несколько дней в привычной обстановке и решите, подходит ли он вам, прежде чем покупать полноразмерный флакон.'],
['Чередовать','Выбирайте разные ароматы для работы, вечера, времени года и настроения — не обязательно покупать по большому флакону каждого.'],
['Взять с собой','Компактный атомайзер удобно положить в сумку или взять в поездку, оставив большой флакон дома.']
])benefits.append(make('h3',title),make('p',text));
body.append(benefits);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
</script>'''.encode('utf-8')


def patch(body):
    body = body.replace(REMOVED_RULE, b'', 1)
    if b'id="n59-rules-design-v1"' not in body:
        body = body.replace(b'</body>', ENHANCEMENT + b'</body>', 1)
    return body
