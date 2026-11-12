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
