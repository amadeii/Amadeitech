import {runtimeBrowser,instrument,fs} from './three-d-evidence.mjs';
import assert from 'node:assert/strict';
const browser=await runtimeBrowser(),results=[],errors=[];
const urls=['http://127.0.0.1:4173/?motion=full','http://127.0.0.1:5173/?motion=reduce','http://127.0.0.1:5173/?motion=system'];
try {for(const width of [393,1440])for(const url of urls){
 const p=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});await instrument(p);p.on('pageerror',e=>errors.push(e.message));
 await p.goto(url,{waitUntil:'networkidle'});await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(400);assert.equal(await p.locator('html').getAttribute('data-motion'),'reduce');
 const a=await p.evaluate(()=>({hero:window.__threeD.hero.length,network:window.__threeD.network.length}));await p.waitForTimeout(500);assert.deepEqual(await p.evaluate(()=>({hero:window.__threeD.hero.length,network:window.__threeD.network.length})),a,'reduced hero does not redraw continuously');
 await p.locator('.services-scene').evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));await p.waitForTimeout(400);
 const still=await p.locator('.orbit-service').evaluateAll(es=>es.map(e=>({transform:getComputedStyle(e).transform,opacity:getComputedStyle(e).opacity})));
 assert.ok(still.every(c=>c.opacity==='1'));await p.waitForTimeout(500);assert.deepEqual(await p.locator('.orbit-service').evaluateAll(es=>es.map(e=>({transform:getComputedStyle(e).transform,opacity:getComputedStyle(e).opacity}))),still);
 await p.screenshot({path:`.taste-skill/3d-final/after/reduced-${width}-${new URL(url).port}-${new URL(url).searchParams.get('motion')}.png`});
 if(new URL(url).port==='4173'){
  await p.emulateMedia({reducedMotion:'no-preference'});await p.waitForTimeout(600);const phase=await p.locator('.services-scene').getAttribute('data-phase');await p.waitForTimeout(400);assert.notEqual(await p.locator('.services-scene').getAttribute('data-phase'),phase);
  await p.locator('.hero-art').evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));await p.waitForTimeout(500);const count=await p.evaluate(()=>window.__threeD.hero.length);await p.waitForTimeout(400);assert.ok(await p.evaluate(()=>window.__threeD.hero.length)>count);
  await p.emulateMedia({reducedMotion:'reduce'});await p.waitForTimeout(500);const n=await p.evaluate(()=>window.__threeD.hero.length);await p.waitForTimeout(400);assert.equal(await p.evaluate(()=>window.__threeD.hero.length),n);
 }
 results.push({width,url,reduce:true,dynamic:new URL(url).port==='4173'});await p.close();
}assert.deepEqual(errors,[]);console.log(JSON.stringify({results,errors}));}finally{await fs.writeFile('.taste-skill/3d-final/after/motion-results.json',JSON.stringify({results,errors},null,2));await browser.close();}
