import {chromium} from 'file:///C:/Users/gabri/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import fs from 'node:fs/promises';
await fs.mkdir('.taste-skill/cinematic',{recursive:true});
const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const p=await b.newPage({viewport:{width:1440,height:1000}});
await p.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});
for(const [name,selector] of [['hero','#inicio'],['intro','#sobre'],['work','#projetos'],['alanna','#project-alanna'],['contact','#contato']]){
 await p.locator(selector).evaluate(e=>scrollTo({top:scrollY+e.getBoundingClientRect().top-85,behavior:'instant'}));
 await p.waitForTimeout(1500);await p.screenshot({path:`.taste-skill/cinematic/after-${name}.png`});
}
await b.close();

