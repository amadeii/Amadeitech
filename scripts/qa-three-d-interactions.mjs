import {runtimeBrowser,fs} from './three-d-evidence.mjs';
import assert from 'node:assert/strict';
const dir='.taste-skill/3d-final/after',browser=await runtimeBrowser(),results=[];
async function visiblePoint(card){return card.evaluate(e=>{const r=e.getBoundingClientRect();for(const fx of [.5,.3,.7,.1,.9])for(const fy of [.5,.3,.7,.1,.9]){const x=r.x+r.width*fx,y=r.y+r.height*fy;if(e.contains(document.elementFromPoint(x,y)))return {x,y};}});}
try{for(const width of [320,375,393,430,768,1440,1920]){
 const p=await browser.newPage({viewport:{width,height:900},hasTouch:width<1000,isMobile:width<1000});await p.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});await p.mouse.move(1,1);await p.locator('.services-scene').evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));await p.waitForTimeout(1600);
 const phase=()=>p.locator('.services-scene').getAttribute('data-phase').then(Number),cards=p.locator('.orbit-service');
 async function click(index){const point=await visiblePoint(cards.nth(index));assert.ok(point);if(width<1000)await p.touchscreen.tap(point.x,point.y);else await p.mouse.click(point.x,point.y);}
 async function moving(){const a=await phase();await p.waitForTimeout(900);assert.ok(((await phase())-a+2*Math.PI)%(2*Math.PI)>.04,'resumes visibly');}
 if(width>=1000){const front=await cards.evaluateAll(es=>es.reduce((best,e,i)=>+e.dataset.depth>+es[best].dataset.depth?i:best,0));const point=await visiblePoint(cards.nth(front));assert.ok(point);await p.mouse.move(point.x,point.y);await p.waitForTimeout(2000);assert.ok(+await p.locator('.services-scene').getAttribute('data-speed')>.65,'stationary hover automatically resumes');await p.mouse.move(1,1);}
 const initial=await cards.evaluateAll(es=>es.reduce((best,e,i)=>+e.dataset.depth>+es[best].dataset.depth?i:best,0));await click(initial);await p.waitForTimeout(100);
 assert.equal(await cards.nth(initial).getAttribute('data-selected'),'true',`actual pointer selected at ${width}`);
 await p.waitForTimeout(1100);const paused=await phase();await p.waitForTimeout(200);assert.equal(await phase(),paused);
 await click(initial);await p.mouse.move(1,1);await moving();assert.equal(await cards.nth(initial).getAttribute('data-selected'),'false');
 await p.keyboard.press('Tab');await cards.nth(1).focus();await p.waitForTimeout(1100);const held=await phase();await p.waitForTimeout(200);assert.equal(await phase(),held);await p.waitForTimeout(4100);await moving();
 await cards.nth(2).focus();await p.keyboard.press('Enter');await p.waitForTimeout(1100);await p.keyboard.press('Enter');await moving();
 await p.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await p.waitForTimeout(250);const off=await phase();await p.locator('.services-scene').evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));await p.waitForTimeout(100);assert.ok(((await phase())-off+2*Math.PI)%(2*Math.PI)<.07,'phase preserved on return');
 await p.waitForTimeout(1400);assert.equal(await cards.evaluateAll(es=>es.every(e=>getComputedStyle(e).opacity==='1')),true);
 assert.equal(new URL(p.url()).hash,'');results.push({width,pointerToggle:true,focusTimeout:true,keyboardToggle:true,scrollReturn:true});await p.close();console.log(`Interaction passed: ${width}px`);
}console.log(JSON.stringify(results));}finally{await fs.writeFile(`${dir}/interaction-results.json`,JSON.stringify(results,null,2));await browser.close();}
