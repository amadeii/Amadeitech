import { chromium } from 'file:///C:/Users/gabri/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import fs from 'node:fs/promises';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const dir='.taste-skill/premium';
await fs.mkdir(`${dir}/before`,{recursive:true});
const local=async()=>{
 for(const width of [1440,390]){
  const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});
  await page.goto('http://127.0.0.1:5173/?motion=reduce',{waitUntil:'networkidle'});
  await page.evaluate(()=>document.fonts.ready);
  for(const selector of ['#project-wandyfitt','#project-ares','#project-beaute','#project-alanna','#quem-cria','.site-footer']){
   const el=page.locator(selector);await el.scrollIntoViewIfNeeded();await el.screenshot({path:`${dir}/before/${selector.replace(/[#.]/g,'')}-${width}.png`});
  }
  await page.close();
 }
};
const sites=[['wandyfitt','https://wandyfitt.com.br/'],['ares','https://aresstudiopilates.com.br/'],['beaute','https://29beaute.com.br/'],['alanna','https://alannafotopet.com.br/']];
const sources=async()=>Promise.all(sites.map(async([id,url])=>{
 const p=await browser.newPage({viewport:{width:1440,height:1000}});
 try{
  await p.goto(url,{waitUntil:'networkidle',timeout:45000});
  const close=p.locator('button.home-promo-close');if(id==='wandyfitt'&&await close.isVisible())await close.click();
  await p.evaluate(()=>document.fonts.ready);
  console.log(JSON.stringify({id,url,headings:await p.locator('h1,h2,h3').evaluateAll(els=>els.map(e=>({text:e.textContent?.trim().slice(0,110),y:Math.round(e.getBoundingClientRect().top+scrollY),tag:e.tagName}))),height:await p.evaluate(()=>document.body.scrollHeight)}));
  await p.screenshot({path:`${dir}/before/source-${id}.png`});
 }catch(e){console.log(JSON.stringify({id,error:e.message}));}finally{await p.close()}
}));
await Promise.all([local(),sources()]);await browser.close();
