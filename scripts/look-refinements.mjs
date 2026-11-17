import {chromium} from 'file:///C:/Users/gabri/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const errors=[],checks=[];
for(const width of [1920,1440,768,390,320]){
 const p=await b.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.goto('http://127.0.0.1:4173/',{waitUntil:'networkidle'});await p.evaluate(()=>document.fonts.ready);
 for(const [name,s] of [['wandyfitt','#project-wandyfitt'],['beaute','#project-beaute'],['founder','#quem-cria'],['contact','#contato'],['footer','.site-footer']]){
  const el=p.locator(s);
  await el.evaluate(e=>scrollTo({top:scrollY+e.getBoundingClientRect().top-60,behavior:'instant'}));await p.waitForTimeout(200);
  assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  const bad=await el.locator('.cinema-word').evaluateAll(words=>words.filter(w=>{const r=w.getBoundingClientRect(),p=w.closest('.cinema-line').getBoundingClientRect();return r.right>p.right+2 || r.left<p.left-2;}).map(w=>w.textContent));
  assert.deepEqual(bad,[]);
  const height=Math.ceil((await el.boundingBox()).height)+120;
  await p.setViewportSize({width,height:Math.max(1000,height)});
  await el.evaluate(e=>scrollTo({top:scrollY+e.getBoundingClientRect().top-60,behavior:'instant'}));await p.waitForTimeout(120);
  await el.screenshot({path:`.taste-skill/refinements/final-${name}-${width}.png`});
  await p.setViewportSize({width,height:1000});
 }
 checks.push({width,overflow:false,headingClipping:false,buildMotion:'reduce',screenshots:'captured'});
 await p.close();
}
assert.deepEqual(errors,[]);
await fs.writeFile('.taste-skill/refinements/capture-results.json',JSON.stringify({checks,errors},null,2));
console.log(JSON.stringify({checks,errors},null,2));
await b.close();
