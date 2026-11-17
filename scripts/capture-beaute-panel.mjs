import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'file:///C:/Users/gabri/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
const root = 'C:/Users/gabri/Desktop/Norium/dist';
const browser = await chromium.launch({ executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:true });
const requests = [];
try {
 const page = await browser.newPage({ viewport:{width:1280,height:800} });
 await page.route('**/*', async route => {
  const request = route.request(), url = new URL(request.url());
  requests.push({path:url.pathname,method:request.method()});
  const json = body => route.fulfill({json:body,headers:{'access-control-allow-origin':'http://panel.local','access-control-allow-credentials':'true'}});
  // Offline browser fixtures only. No real session, backend, customer records,
  // database connection, metrics, or source changes in the original project.
  if (url.pathname.endsWith('/auth/me')) return json({user:{id:'offline-capture',name:'Prévia local',email:'',roles:[],permissions:['products.read','products.write']}});
  if (url.pathname.endsWith('/products')) return json({data:[],pagination:{page:1,limit:8,total:0,totalPages:0}});
  if (url.pathname.endsWith('/brands')) return json([]);
  if (url.hostname !== 'panel.local' || request.method() !== 'GET') return route.abort();
  const pathname = decodeURIComponent(url.pathname);
  const file = path.resolve(root, '.' + pathname);
  if (!file.startsWith(path.resolve(root) + path.sep)) return route.abort();
  const ext = path.extname(file);
  const target = ext ? file : path.join(root,'index.html');
  const types = {'.js':'application/javascript','.css':'text/css','.html':'text/html','.jpeg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2'};
  try { await route.fulfill({body:await fs.readFile(target),contentType:types[path.extname(target)]??'application/octet-stream'}); }
  catch { await route.abort(); }
 });
 await page.goto('http://panel.local/produtos',{waitUntil:'networkidle'});
 await page.getByRole('heading',{name:'Produtos',exact:true}).waitFor();
 await page.waitForTimeout(500);
 await page.screenshot({path:'public/projects/beaute-panel.png'});
 await fs.writeFile('scripts/beaute-panel-evidence.json',JSON.stringify({source:'C:/Users/gabri/Desktop/Norium',route:'/produtos',capture:'public/projects/beaute-panel.png',scope:'Captura real do frontend administrativo existente vinculado à 29 Beauté. Renderização local do build original com fixtures vazias de API e sessão offline apenas neste navegador. Sem dados de clientes, métricas inventadas, backend, autenticação real ou alteração do projeto original.',confirmedInSource:['produtos','pedidos','estoque','clientes','cupons','marcas','relatorios'],operationalStatus:'Não verificado',requests},null,2));
 console.log('Captured real Norium products interface offline');
} finally { await browser.close(); }
