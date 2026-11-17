import fs from 'node:fs/promises';
import {chromium} from 'file:///C:/Users/gabri/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
const root='C:/Users/gabri/Downloads/Wandyfit';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try {const page=await browser.newPage({viewport:{width:1280,height:800}});
await page.route('**/*',async route=>{const url=new URL(route.request().url());if(url.hostname!=='panel.local')return route.abort();const path=decodeURIComponent(url.pathname);if(path.includes('..'))return route.abort();try {let body=await fs.readFile(root+path);if(path.endsWith('.html'))body=Buffer.from(body.toString().replace(/<script[\s\S]*?<\/script>/g,''));await route.fulfill({body,contentType:path.endsWith('.html')?'text/html':path.endsWith('.css')?'text/css':path.endsWith('.jpeg')?'image/jpeg':'application/octet-stream'});}catch {await route.abort();}});
await page.goto('http://panel.local/cp/pedidos.html',{waitUntil:'networkidle'});await page.screenshot({path:'public/projects/wandyfitt-panel.png'});
await fs.writeFile('scripts/panel-evidence.json',JSON.stringify({source:root+'/cp/pedidos.html',capture:'public/projects/wandyfitt-panel.png',scope:'Interface HTML e CSS originais renderizada localmente. Scripts removidos da captura; nenhuma conexão com backend, autenticação, consulta de dados ou ação em produção.',confirmedPanel:['dashboard.html','pedidos.html','cozinha.html','cardapio.html','financeiro.html'],operationalStatus:'Não verificado'},null,2));
}finally{await browser.close();}
