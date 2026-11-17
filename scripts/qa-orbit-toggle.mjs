import { chromium } from 'file:///C:/Users/gabri/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const dir='.taste-skill/orbit-toggle';await fs.mkdir(dir,{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const results=[],errors=[];
try {for(const width of [1440,393]){
 const p=await browser.newPage({viewport:{width,height:900},isMobile:width<768,hasTouch:width<768});
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});
 await p.locator('.services-scene').evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));await p.waitForTimeout(1700);
 const phase=()=>p.locator('.services-scene').getAttribute('data-phase').then(Number);
 async function paused(){await p.waitForTimeout(100);const a=await phase();await p.waitForTimeout(200);assert.equal(await phase(),a,'selected card pauses orbit');}
 async function moving(){const a=await phase();await p.waitForTimeout(750);const delta=((await phase())-a+2*Math.PI)%(2*Math.PI);assert.ok(delta>.045,'orbit visibly resumes');return delta;}
 async function clickCard(){const i=await p.locator('.orbit-service').evaluateAll(es=>es.reduce((best,e,i)=>+e.dataset.depth>+es[best].dataset.depth?i:best,0));const r=await p.locator('.orbit-service').nth(i).boundingBox();if(width<768)await p.touchscreen.tap(r.x+r.width/2,r.y+r.height/2);else await p.mouse.click(r.x+r.width/2,r.y+r.height/2);return i;}
 const originalUrl=p.url();const index=await clickCard();await paused();await p.screenshot({path:`${dir}/paused-${width}.png`});
 const r=await p.locator('.orbit-service').nth(index).boundingBox();if(width<768)await p.touchscreen.tap(r.x+r.width/2,r.y+r.height/2);else await p.mouse.click(r.x+r.width/2,r.y+r.height/2);
 const secondClickDelta=await moving();await p.screenshot({path:`${dir}/resumed-${width}.png`});
 assert.equal(await p.locator('.orbit-service').nth(index).evaluate(e=>document.activeElement===e),true,'resuming preserves focus');
 await clickCard();await paused();
 const point=await p.locator('.orbital-globe').evaluate(e=>{const r=e.getBoundingClientRect();for(let y=r.y+r.height*.25;y<r.y+r.height*.75;y+=10)for(let x=r.x+r.width*.25;x<r.x+r.width*.75;x+=10)if(!document.elementFromPoint(x,y)?.closest('.orbit-service'))return {x,y};});
 assert.ok(point);if(width<768)await p.touchscreen.tap(point.x,point.y);else await p.mouse.click(point.x,point.y);await moving();
 await clickCard();await paused();if(width>=768)await p.mouse.move(1,1);await p.waitForTimeout(5100);await moving();
 const card=p.locator('.orbit-service').first();await card.focus();await p.waitForTimeout(100);
 for(const key of ['Enter','Space']){await p.keyboard.press(key);await paused();await p.keyboard.press(key);await moving();}
 assert.equal(p.url(),originalUrl,'never navigates');
 results.push({width,secondClickDelta,worldResumes:true,timeoutResumes:true,keyboardToggle:true,urlUnchanged:true});await p.close();
}assert.deepEqual(errors,[]);await fs.writeFile(`${dir}/results.json`,JSON.stringify({results,errors},null,2));console.log(JSON.stringify({results,errors}));}finally{await browser.close();}
