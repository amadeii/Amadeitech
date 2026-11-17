import {chromium} from 'file:///C:/Users/gabri/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import fs from 'node:fs/promises';
await fs.mkdir('.impeccable/review/title-effects',{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
for(const width of [1440,390,320]){
 const page=await browser.newPage({viewport:{width,height:width<600?844:1000},reducedMotion:'reduce'});
 page.on('pageerror',e=>console.log(e.message));
 await page.goto('http://127.0.0.1:5174/',{waitUntil:'networkidle'});
 await page.waitForTimeout(1400);
 console.log(width,await page.locator('h1').evaluate(el=>({text:el.innerText,rect:el.getBoundingClientRect().toJSON(),phase:el.dataset.vaporizePhase,ready:el.dataset.vaporizeReady,canvas:el.querySelector('canvas').getBoundingClientRect().toJSON(),overflow:document.documentElement.scrollWidth-innerWidth})));
 await page.screenshot({path:`.impeccable/review/title-effects/hero-${width}.png`});
 await page.locator('#servicos').evaluate(el=>scrollTo({top:scrollY+el.getBoundingClientRect().top,behavior:'instant'}));
 await page.waitForTimeout(520);
 await page.screenshot({path:`.impeccable/review/title-effects/flip-${width}.png`});
 console.log('flip',await page.locator('.stagger-flip').evaluate(el=>({rect:el.getBoundingClientRect().toJSON(),text:el.getAttribute('aria-label'),chars:el.querySelectorAll('.text-3d-flip-char').length,transform:getComputedStyle(el.querySelector('.text-3d-flip-char')).transform})));
 await page.close();
}
await browser.close();
