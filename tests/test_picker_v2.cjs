'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const context={window:{},document:{readyState:'loading',addEventListener(){}}};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'..','picker_v2.js'),'utf8'),context);
const engine=context.window.Nota59PickerV2;
const product=(name,extra={})=>({name,brand:'Test',price5:500,price10:1000,...extra});
const payload={items:[product('Creed Aventus'),product('Amouage Interlude Man'),product('Tom Ford Ombré Leather EDP'),product('Initio Wild Rush'),product('Kilian Angels Share',{available:false})]};
for(const occasion of ['На каждый день','На вечер',''])for(const direction of [...engine.directions,'']){
 const result=engine.recommend(payload,occasion,direction);
 assert.equal(result.loading,false);
 assert.equal(result.unprofiled,0);
 assert.ok(result.items.every(m=>m.product.available!==false));
 assert.ok(result.items.every((m,i,a)=>!i||a[i-1].score>=m.score));
 assert.equal(JSON.stringify(result),JSON.stringify(engine.recommend(payload,occasion,direction)));
}
assert.equal(engine.recommend(null).loading,true);
assert.equal(engine.recommend({items:[product('Mystery')]}).unprofiled,1);
assert.equal(engine.recommend({items:[product('Tom Ford Ombré Leather Parfum')]}).unprofiled,1);
assert.equal(engine.recommend({items:[product('Tom Ford Ombre\u0301 Leather EDP')]},'На вечер','Кожаный').items.length,1);
assert.equal(engine.recommend({items:[product('Creed Aventus',{price5:'500',price10:0})]}).items.length,0);
assert.equal(engine.recommend({items:[payload.items[0],payload.items[0]]}).items.length,1);
assert.equal(engine.recommend({items:[payload.items[0]]},'На вечер','Дымный').items.length,0);
assert.throws(()=>engine.recommend(payload,'invalid',''));
assert.throws(()=>engine.recommend(payload,'','invalid'));
console.log('Picker v2 regression tests passed: 27 answer combinations and edge cases.');
