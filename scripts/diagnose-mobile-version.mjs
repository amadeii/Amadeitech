import { chromium } from 'file:///C:/Users/gabri/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import fs from 'node:fs/promises';
const dir='.taste-skill/mobile-version';await fs.mkdir(dir,{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const evidence=[];
try {
 for(const [name,url] of [['local','http://127.0.0.1:5173/'],['published','https://amadeitech.com.br/']]){
  const page=await browser.newPage({viewport:{width:393,height:852},isMobile:true,hasTouch:true,deviceScaleFactor:1,reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(url,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
  const project=page.locator('#project-wandyfitt');await project.scrollIntoViewIfNeeded();await page.waitForTimeout(1500);
  await project.locator('img').first().evaluate(i=>i.decode());
  const result=await page.evaluate(async()=>({url:location.href,viewport:{width:innerWidth,height:innerHeight},showcases:document.querySelectorAll('.showcase').length,oldSwitches:document.querySelectorAll('.project-view-switch').length,oldButtons:Array.from(document.querySelectorAll('#projetos button')).map(e=>e.textContent.trim()).filter(t=>/^(Site público|Painel de comando)$/.test(t)),projectCount:document.querySelectorAll('#projetos [data-project]').length,wandyClass:document.querySelector('#project-wandyfitt')?.className,wandyImages:Array.from(document.querySelectorAll('#project-wandyfitt img')).map(e=>({src:e.currentSrc,width:e.naturalWidth,height:e.naturalHeight})),scripts:Array.from(document.scripts).map(s=>s.src).filter(Boolean),styles:Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(s=>s.href),serviceWorkers:navigator.serviceWorker?(await navigator.serviceWorker.getRegistrations()).map(r=>({scope:r.scope,active:r.active?.scriptURL})):[],cacheStorage:'caches'in window?await caches.keys():[],overflow:document.documentElement.scrollWidth>innerWidth}));
  await page.screenshot({path:`${dir}/${name}-393x852.png`});await project.screenshot({path:`${dir}/${name}-wandy-full.png`});
  evidence.push({name,...result,errors});await page.close();
 }
 const modules={};
 for(const file of ['/src/App.tsx','/src/ProjectShowcase.tsx','/src/showcases.css','/@vite/client']){
  const response=await fetch('http://127.0.0.1:5173'+file);const body=await response.text();modules[file]={status:response.status,cacheControl:response.headers.get('cache-control'),updatedComponent:body.includes('ProjectShowcase'),oldSwitchMarkup:body.includes('className: "project-view-switch"'),hasMobileSource:body.includes('(max-width: 767px)'),hasHMR:body.includes('import.meta.hot')};
 }
 await fs.writeFile(`${dir}/diagnosis.json`,JSON.stringify({evidence,modules},null,2));console.log(JSON.stringify({evidence,modules},null,2));
}finally{await browser.close()}
