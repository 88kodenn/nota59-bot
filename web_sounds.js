(() => {
'use strict';
if(window.n59SampleAudio)return;window.n59SampleAudio=true;
const AudioCtx=window.AudioContext||window.webkitAudioContext;if(!AudioCtx)return;
let ctx=null,active=null,ready=null,sequence=0,lastOrder='';
const buffers=new Map();
const sources={pour:'/assets/sounds/serving-wine.wav',cork:'/assets/sounds/champagne-cork.wav'};
function cut(input,seconds,kind){
 const rate=input.sampleRate,n=input.length,mono=new Float32Array(n);
 for(let c=0;c<input.numberOfChannels;c++){const a=input.getChannelData(c);for(let i=0;i<n;i++)mono[i]+=a[i]/input.numberOfChannels;}
 const hop=Math.max(1,Math.round(rate*.01)),energy=[];
 for(let i=0;i<n;i+=hop){let sum=0;for(let j=i;j<Math.min(n,i+hop);j++)sum+=mono[j]*mono[j];energy.push(sum);}
 const width=Math.max(1,Math.round(seconds*rate/hop));let start=0;
 if(kind==='pour'){let sum=0,best=-1;for(let i=0;i<energy.length;i++){sum+=energy[i];if(i>=width)sum-=energy[i-width];if(i>=width-1&&sum>best){best=sum;start=(i-width+1)*hop;}}}
 else{const peak=Math.max(...energy),index=energy.findIndex(e=>e>peak*.025);start=Math.max(0,(index-1)*hop);}
 const length=Math.min(Math.round(seconds*rate),n-start);if(length<1)throw new Error('Empty audio');
 const output=ctx.createBuffer(1,length,rate),a=output.getChannelData(0);let peak=0;
 for(let i=0;i<length;i++){a[i]=mono[start+i];peak=Math.max(peak,Math.abs(a[i]));}
 const gain=peak>0?Math.min(3,.6/peak):1,fade=Math.max(1,Math.round(rate*.012));
 for(let i=0;i<length;i++)a[i]*=gain*Math.min(1,i/fade,(length-1-i)/fade);
 return output;
}
function load(){
 if(ready)return ready;if(!ctx)ctx=new AudioCtx();
 ready=Promise.all(Object.entries(sources).map(async([kind,url])=>{
  try{const r=await fetch(url,{cache:'force-cache'});if(!r.ok)throw new Error('HTTP '+r.status);const b=await ctx.decodeAudioData(await r.arrayBuffer());buffers.set(kind,cut(b,kind==='pour'?.7:.85,kind));}
  catch(e){console.warn('Nota59 audio '+kind+':',e.message);}
 }));return ready;
}
function unlock(){try{if(!ctx)ctx=new AudioCtx();const p=ctx.resume();if(p?.catch)p.catch(()=>{});load();}catch(e){console.warn('Nota59 audio:',e.message);}}
async function play(kind,rate=1){
 const token=++sequence;unlock();await ready;
 if(token!==sequence||document.hidden||!buffers.has(kind)||ctx.state!=='running')return;
 if(active){try{active.stop();}catch(e){}active=null;}
 const s=ctx.createBufferSource(),g=ctx.createGain();s.buffer=buffers.get(kind);s.playbackRate.value=rate;
 g.gain.value=.7;s.connect(g);g.connect(ctx.destination);active=s;
 s.onended=()=>{s.disconnect();g.disconnect();if(active===s)active=null;};s.start();
}
document.addEventListener('pointerdown',unlock,{once:true,capture:true,passive:true});
document.addEventListener('keydown',unlock,{once:true,capture:true});
document.addEventListener('click',e=>{
 const b=e.target instanceof Element?e.target.closest('#v5,#v10,#n59-order-submit'):null;
 if(!b||b.disabled||b.getAttribute('aria-disabled')==='true')return;
 if(b.id==='n59-order-submit'){unlock();return;}
 play('pour',b.id==='v5'?Math.pow(2,1/12):Math.pow(2,-1/12));
},true);
function observeOrder(){const result=document.getElementById('n59-order-result');if(!result||result.dataset.n59AudioObserved)return;result.dataset.n59AudioObserved='true';
 new MutationObserver(()=>{const match=result.textContent.match(/^Заказ №([^\n]+) сохранён\./);if(match&&match[1]!==lastOrder){lastOrder=match[1];play('cork');}}).observe(result,{childList:true,subtree:true,characterData:true});
}
new MutationObserver(observeOrder).observe(document.body,{childList:true,subtree:true});observeOrder();
document.addEventListener('visibilitychange',()=>{if(document.hidden){sequence++;if(active){try{active.stop();}catch(e){}active=null;}}});
try{load();}catch(e){console.warn('Nota59 audio preload:',e.message);}
})();
