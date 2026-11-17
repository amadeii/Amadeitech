import fs from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'file:///C:/Users/gabri/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const evidence=[];
try {
 for(const project of ['wandyfitt','beaute']) {
  const root=project==='wandyfitt'?'C:/Users/gabri/Downloads/Wandyfit':'C:/Users/gabri/Desktop/Norium/dist';
  const page=await browser.newPage({viewport:{width:1280,height:800}});
  await page.route('**/*',async route=>{
   const req=route.request(),url=new URL(req.url());
   const json=body=>route.fulfill({json:body,headers:{'access-control-allow-origin':'http://panel.local','access-control-allow-credentials':'true'}});
   if(project==='beaute') {
    if(url.pathname.endsWith('/auth/me'))return json({user:{id:'offline-capture',name:'Prévia local',email:'',roles:[],permissions:['products.read','products.write','orders.read','inventory.read']}});
    if(/\/(products|orders|inventory)$/.test(url.pathname))return json({data:[],pagination:{page:1,limit:8,total:0,totalPages:0}});
    if(url.pathname.endsWith('/brands'))return json([]);
   }
   if(url.hostname!=='panel.local'||req.method()!=='GET')return route.abort();
   let file=path.resolve(root,'.'+decodeURIComponent(url.pathname));
   if(!file.startsWith(path.resolve(root)+path.sep))return route.abort();
   if(!path.extname(file))file=path.join(root,'index.html');
   try {
    let body=await fs.readFile(file);
    if(project==='wandyfitt'&&file.endsWith('.html'))body=Buffer.from(body.toString().replace(/<script[\s\S]*?<\/script>/gi,''));
    const types={'.html':'text/html','.css':'text/css','.js':'application/javascript','.svg':'image/svg+xml','.jpeg':'image/jpeg','.png':'image/png'};
    await route.fulfill({body,contentType:types[path.extname(file)]??'application/octet-stream'});
   }catch{await route.abort();}
  });
  const modules=project==='wandyfitt'?['pedidos','cozinha','cardapio']:['produtos','pedidos','estoque'];
  for(const module of modules) {
   const route=project==='wandyfitt'?`/cp/${module}.html`:`/${module}`;
   await page.goto('http://panel.local'+route,{waitUntil:'networkidle'});
   if(project==='wandyfitt'&&module==='cozinha') {
    await page.evaluate(()=>{window.WandyData={listOrders:()=>[]};});
    await page.addScriptTag({content:await fs.readFile(root+'/assets/js/cp-cozinha.js','utf8')});
   }
   await page.waitForTimeout(350);
   const image=`public/projects/${project}-${module}.png`;
   await page.screenshot({path:image});
   evidence.push({project,module,source:project==='wandyfitt'?root+route:root.replace('/dist','')+'/src/pages/'+({produtos:'Products',pedidos:'Orders',estoque:'Inventory'}[module])+'.tsx',image,heading:await page.locator('h1').allTextContents()});
  }
  await page.close();
 }
 await fs.writeFile('scripts/panel-modules-evidence.json',JSON.stringify({scope:'Capturas das interfaces originais em navegador isolado. Wandy: HTML/CSS sem scripts de autenticação/backend; cozinha renderizada com cp-cozinha.js original e listOrders vazio. Norium: build original com APIs vazias e sessão offline. Zeros são estado vazio local, sem métricas comerciais. Nenhum dado de cliente, consulta real ou ação em produção.',operationalStatus:'Backend e produção não homologados nesta rodada',evidence},null,2));
}finally{await browser.close();}
