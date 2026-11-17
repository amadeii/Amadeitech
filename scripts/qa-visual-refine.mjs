import { chromium } from 'file:///C:/Users/gabri/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
const dir='.impeccable/review/visual-refine';
await fs.mkdir(dir,{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const results=[],errors=[];
const hash=s=>createHash('sha256').update(s).digest('hex');
try {
 for(const width of [1440,1920,768,390,320]) {
  const page=await browser.newPage({viewport:{width,height:width<700?844:1000},reducedMotion:'reduce'});
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});
  await page.evaluate(()=>document.fonts.ready);
  const sizes=await page.locator('.project-visual').evaluateAll(els=>els.map(el=>({width:el.clientWidth,height:el.clientHeight})));
  const before=width<=700?Math.max(248,Math.min(width*.65,330)):width<=900?280:Math.max(280,Math.min(width*.23,340));
  for(const s of sizes)assert.ok(Math.abs(s.height/before-1.2)<.01);
  await page.locator('#experiencia').scrollIntoViewIfNeeded();
  await page.waitForTimeout(650);
  const wall=page.locator('.text-reveal-wall');
  const a=await wall.evaluate(c=>c.toDataURL());await page.waitForTimeout(750);
  const b=await wall.evaluate(c=>c.toDataURL());assert.notEqual(a,b);
  assert.equal(await wall.getAttribute('aria-hidden'),'true');
  assert.equal(await page.locator('#globe-flow-heading').innerText(),'Design que aproxima.');
  await page.screenshot({path:`${dir}/wall-${width}.png`});
  assert.equal(await page.locator('.footer-wordmark').count(),0);
  await page.locator('.site-footer').scrollIntoViewIfNeeded();
  assert.equal(await page.locator('.site-footer a').count(),3);
  await page.screenshot({path:`${dir}/footer-${width}.png`});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  results.push({width,sizes,increase:sizes[0].height/before,wallFrames:[hash(a),hash(b)],footerLinks:3});
  await page.close();
 }
 for(const port of [5173,4174]) {
  const page=await browser.newPage({reducedMotion:'reduce'});
  await page.goto(`http://127.0.0.1:${port}/?motion=reduce`,{waitUntil:'networkidle'});
  await page.locator('#experiencia').scrollIntoViewIfNeeded();await page.waitForTimeout(500);
  const wall=page.locator('.text-reveal-wall');
  let a=await wall.evaluate(c=>c.toDataURL());await page.waitForTimeout(650);
  assert.equal(await wall.evaluate(c=>c.toDataURL()),a,'Reduced wall is static');
  if(port===4174) {
   await page.emulateMedia({reducedMotion:'no-preference'});await page.waitForTimeout(1000);
   a=await wall.evaluate(c=>c.toDataURL());await page.waitForTimeout(600);
   assert.notEqual(await wall.evaluate(c=>c.toDataURL()),a);
   await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(200);
   a=await wall.evaluate(c=>c.toDataURL());await page.waitForTimeout(650);
   assert.equal(await wall.evaluate(c=>c.toDataURL()),a);
  }
  results.push({port,reducedStatic:true,dynamicProduction:port===4174});await page.close();
 }
 assert.deepEqual(errors,[]);
 await fs.writeFile(`${dir}/visual-results.json`,JSON.stringify({results,errors},null,2));
 console.log('Visual refinement: all checks passed');
}finally{await browser.close();}
