(() => {
'use strict';
function start(){
 const panel=document.getElementById('n59-gift-sets');
 if(!panel||panel.dataset.n59LazyReady)return;
 panel.dataset.n59LazyReady='true';
 const tracked=new WeakSet();
 function load(image){
  const src=image.dataset.n59GiftSrc;if(!src)return;
  image.decoding='async';image.loading='eager';
  image.src=src;delete image.dataset.n59GiftSrc;
 }
 const observer='IntersectionObserver' in window?new IntersectionObserver(entries=>{
  for(const entry of entries)if(entry.isIntersecting&&!panel.hidden){load(entry.target);observer.unobserve(entry.target);}
 },{root:null,rootMargin:'200px 0px',threshold:0}):null;
 function scan(){
  for(const image of panel.querySelectorAll('.gift-card img[data-n59-gift-src]')){
   if(observer){if(!tracked.has(image)){tracked.add(image);observer.observe(image);}}
   else if(!panel.hidden&&panel.getClientRects().length)load(image);
  }
 }
 new MutationObserver(scan).observe(panel,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','class']});
 scan();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
