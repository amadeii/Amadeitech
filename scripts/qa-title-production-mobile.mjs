import {chromium} from 'file:///C:/Users/gabri/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try {
 const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'no-preference',hasTouch:true});
 await page.goto('http://127.0.0.1:4174/?motion=reduce',{waitUntil:'networkidle'});
 assert.equal(await page.locator('html').getAttribute('data-motion'),'full');
 await page.waitForFunction(()=>document.querySelector('h1').dataset.vaporizePhase==='out');
 const canvas=page.locator('.vaporize-canvas');
 const a=await canvas.evaluate(c=>c.toDataURL());await page.waitForTimeout(250);assert.notEqual(await canvas.evaluate(c=>c.toDataURL()),a);
 await page.locator('#servicos').evaluate(el=>scrollTo({top:scrollY+el.getBoundingClientRect().top,behavior:'instant'}));
 await page.waitForFunction(()=>document.querySelector('.stagger-flip').dataset.flip==='playing');
 await page.waitForFunction(()=>document.querySelector('.stagger-flip').dataset.flip==='rest');
 await page.locator('.stagger-flip').dispatchEvent('pointerenter',{pointerType:'touch'});
 assert.equal(await page.locator('.stagger-flip').getAttribute('data-flip'),'rest');
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.waitForFunction(()=>document.documentElement.dataset.motion==='reduce');
 assert.equal(await canvas.isVisible(),false);
 await page.screenshot({path:'.impeccable/review/title-effects/production-reduce-mobile.png'});
 await page.locator('#inicio').evaluate(el=>scrollTo({top:0,behavior:'instant'}));
 await page.screenshot({path:'.impeccable/review/title-effects/hero-production-reduce-mobile.png'});
 console.log('Production mobile starts full under no-preference, ignores motion=reduce, particles move, touch does not trigger hover, dynamic reduce presents HTML text.');
} finally {await browser.close();}
