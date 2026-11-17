import { chromium } from 'file:///C:/Users/gabri/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const dir='.taste-skill/showcase-clean';await fs.mkdir(dir,{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const results=[],errors=[];
try {for(const width of [393,1440]){
 const p=await browser.newPage({viewport:{width,height:900},hasTouch:width<768,isMobile:width<768});
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});
 assert.equal(await p.locator('.iphone-status, .showcase-phone-home').count(),0);
 assert.equal(await p.getByText('9:41',{exact:true}).count(),0);
 const projects=p.locator('.showcase-story');assert.equal(await projects.count(),4);
 for(let project=0;project<4;project++){
  const item=projects.nth(project),id=await item.getAttribute('id');
  await item.locator('.showcase-camera').scrollIntoViewIfNeeded();await p.waitForTimeout(1100);
  const scenes=width<768?3:1;
  for(let scene=0;scene<scenes;scene++){
   await item.locator('.showcase-controls > button').nth(scene).click();await p.waitForTimeout(350);
   const img=item.locator('.showcase-screen.is-active img');await img.evaluate(e=>e.decode());
   assert.equal(await img.evaluate(e=>e.naturalWidth>0),true);
   assert.equal(await item.locator('.showcase-controls > button').nth(scene).getAttribute('aria-pressed'),'true');
   await item.locator('.showcase-camera').screenshot({path:`${dir}/${id}-${width}-${scene}.png`});
   results.push({id,width,scene,statusOverlay:false,homeBar:false});
  }
 }
 await p.close();
}assert.deepEqual(errors,[]);await fs.writeFile(`${dir}/results.json`,JSON.stringify({results,errors},null,2));console.log(JSON.stringify({screens:results.length,projects:4,errors}));}finally{await browser.close();}
