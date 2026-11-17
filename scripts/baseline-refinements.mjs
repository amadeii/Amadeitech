import {chromium} from 'file:///C:/Users/gabri/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import fs from 'node:fs/promises';
await fs.mkdir('.taste-skill/refinements',{recursive:true});
const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
for(const width of [1440,390]){
 const p=await b.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});
 await p.goto('http://127.0.0.1:5173/?motion=reduce',{waitUntil:'networkidle'});
 for(const id of ['ares','alanna']){const el=p.locator(`#project-${id}`);await el.scrollIntoViewIfNeeded();await p.waitForTimeout(400);await el.screenshot({path:`.taste-skill/refinements/baseline-${id}-${width}.png`});}
 await p.close();
}
await b.close();
