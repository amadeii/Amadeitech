import {chromium} from 'file:///C:/Users/gabri/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try {
const p=await b.newPage({viewport:{width:1440,height:1000}});await p.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});
const result=await p.evaluate(async()=>{
 const {observeViewportReplay}=await import('/src/viewportReplay.ts');
 const el=document.createElement('div');el.style.cssText='position:fixed;width:100px;height:200px;left:20px;z-index:100';document.body.append(el);
 let enters=0,exits=0;const tick=()=>new Promise(r=>setTimeout(r,90));
 const move=async(top)=>{el.style.top=`${top}px`;await tick();};
 const lifecycle=observeViewportReplay(el,{threshold:.5,onEnter:()=>enters++,onExit:()=>exits++});
 await move(innerHeight-180);
 const initial=enters;
 // Inset boundary is crossed many times, but the real viewport never empties.
 for(const top of [innerHeight-129,innerHeight-135,innerHeight-130,innerHeight-134])await move(top);
 const afterThresholdJitter=enters;
 await move(innerHeight+10);await move(innerHeight-180);
 const afterFullExit=enters;
 lifecycle.dispose();
 await move(innerHeight+10);await move(innerHeight-180);
 el.remove();return {initial,afterThresholdJitter,afterFullExit,afterDispose:enters,exits};
});
assert.equal(result.initial,1);assert.equal(result.afterThresholdJitter,1);assert.equal(result.afterFullExit,2);assert.equal(result.afterDispose,2);assert.equal(result.exits,1);
await fs.writeFile('.impeccable/review/viewport-replay/hysteresis.json',JSON.stringify(result,null,2));console.log(result);
}finally{await b.close();}
const fallback=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--disable-webgl']});
try{const p=await fallback.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});await p.addInitScript(()=>{window.strokes=0;const stroke=CanvasRenderingContext2D.prototype.stroke;CanvasRenderingContext2D.prototype.stroke=function(...args){if(this.canvas.closest('.network-field'))window.strokes++;return stroke.apply(this,args);};});
await p.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});await p.waitForTimeout(1800);const c=p.locator('.network-field canvas[data-renderer=canvas2d]');const a=await c.evaluate(c=>c.toDataURL());const count=await p.evaluate(()=>window.strokes);await p.waitForTimeout(450);const z=await c.evaluate(c=>c.toDataURL());assert.notEqual(a,z);assert.ok(await p.evaluate(()=>window.strokes)>count);await p.screenshot({path:'.impeccable/review/viewport-replay/fallback-network-mobile.png'});console.log('Canvas fallback: animated dynamic connector strokes verified');
}finally{await fallback.close();}
