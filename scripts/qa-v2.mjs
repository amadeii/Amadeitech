import { chromium } from 'file:///C:/Users/gabri/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const dir='.impeccable/review/v2';await fs.mkdir(dir,{recursive:true});
const errors=[],checks=[];const hash=b=>createHash('sha256').update(b).digest('hex');
const jump=async(page,selector,progress=0)=>{await page.evaluate(({selector,progress})=>{const el=document.querySelector(selector);const r=el.getBoundingClientRect();scrollTo({top:scrollY+r.top+Math.max(0,r.height-innerHeight)*progress,behavior:'instant'});},{selector,progress});await page.waitForTimeout(1100);};
try {
for(const width of [1440,1920,768,390,320]) {
 const page=await browser.newPage({viewport:{width,height:width<650?844:1000},reducedMotion:'no-preference'});
 page.on('pageerror',e=>errors.push({width,error:e.message}));page.on('console',m=>{if(m.type()==='error')errors.push({width,error:m.text()});});
 await page.goto('http://127.0.0.1:4174',{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(1700);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`overflow ${width}`);
 await page.screenshot({path:`${dir}/hero-${width}.png`});
 assert.equal(await page.locator('.hero-object canvas').count(),1);
 if(width===1440){const c=page.locator('.hero-object canvas');const before=hash(await c.screenshot());await page.mouse.move(1250,300);await page.waitForTimeout(900);assert.notEqual(hash(await c.screenshot()),before,'Hero responds to pointer');checks.push('Hero 3D responde ao cursor');}
 if(width<650){await page.getByRole('button',{name:'Menu',exact:true}).click();assert.equal(await page.locator('#main-navigation').isVisible(),true);await page.keyboard.press('Escape');assert.equal(await page.locator('#main-navigation').isVisible(),false);assert.equal(await page.getByRole('button',{name:'Menu',exact:true}).evaluate(e=>e===document.activeElement),true);}
 for(const selector of ['#sobre','#project-beaute','#project-wandyfitt','#project-alanna','#project-ares','.tech-section','#servicos','#contato','.site-footer']) {await jump(page,selector);if(width!==320)await page.screenshot({path:`${dir}/${selector.replace(/[.#]/g,'')}-${width}.png`});}
 const preview=page.getByRole('group',{name:'Visualização de 29 Beauté'});await preview.getByRole('button',{name:'Mobile',exact:true}).click();assert.match(await page.locator('.project-0 .project-image-link img').getAttribute('src'),/mobile/);await preview.getByRole('button',{name:'Desktop',exact:true}).click();
 await jump(page,'.tech-section');const rail=page.locator('.tech-rail');await page.getByRole('button',{name:'Próximas tecnologias'}).click();await page.waitForTimeout(700);assert.ok(await rail.evaluate(e=>e.scrollLeft)>0,`technology carousel ${width}`);
 await jump(page,'#experiencia',0);await page.waitForTimeout(1000);const canvas=page.locator('.globe-canvas canvas');assert.equal(await canvas.count(),1);const before=hash(await canvas.screenshot());
 for(const [p,story] of [[0,'.story-a'],[.5,'.story-b'],[1,'.story-c']]) {await jump(page,'#experiencia',p);assert.equal(await page.locator(story).evaluate(e=>getComputedStyle(e).visibility),'visible');assert.ok(Number(await page.locator(story).evaluate(e=>getComputedStyle(e).opacity))>.9);if(width!==320)await page.screenshot({path:`${dir}/globe-${p}-${width}.png`});}
 assert.notEqual(hash(await canvas.screenshot()),before,'Globe scroll changes render');await page.locator('.globe-controls summary').click();await page.locator('.globe-control input').focus();await page.keyboard.press('ArrowRight');assert.equal(await page.locator('.globe-control input').inputValue(),'1');await page.getByRole('button',{name:'Usar versão leve'}).click();assert.equal(await canvas.count(),0);assert.equal(await page.locator('.globe-fallback img').isVisible(),true);
 await jump(page,'#contato');await page.getByRole('button',{name:'Preparar meu pedido'}).click();assert.equal(await page.locator('[name=name]').evaluate(e=>e.validity.valid),false);await page.locator('[name=name]').fill('Teste local');await page.locator('[name=type]').selectOption({label:'Sistema web ou painel'});await page.locator('[name=need]').fill('Preciso organizar os pedidos da empresa.');await page.locator('[name=contact]').fill('invalido');await page.getByRole('button',{name:'Preparar meu pedido'}).click();assert.match(await page.locator('.form-feedback').innerText(),/e-mail válido/);await page.locator('[name=contact]').fill('teste@example.com');await page.getByRole('button',{name:'Preparar meu pedido'}).click();const url=await page.getByRole('link',{name:'Continuar no WhatsApp'}).getAttribute('href');assert.match(url,/https:\/\/wa.me\/5541991543278/);assert.match(decodeURIComponent(url),/organizar os pedidos/);await page.locator('[name=need]').fill('Outra descrição para o projeto.');assert.equal(await page.getByRole('link',{name:'Continuar no WhatsApp'}).count(),0);
 await page.emulateMedia({reducedMotion:'reduce'});await jump(page,'#experiencia');for(const story of ['.story-a','.story-b','.story-c'])assert.equal(await page.locator(story).evaluate(e=>e.inert),false,'Reduced motion restores focus order');
 if(width!==320){await page.screenshot({path:`${dir}/reduced-${width}.png`});await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.screenshot({path:`${dir}/full-${width}.png`,fullPage:true});}
 checks.push(`Viewport ${width}: sem overflow; menu/preview/carrossel/globo/teclado/fallback/formulário/movimento reduzido`);await page.close();
}
assert.equal(errors.length,0,JSON.stringify(errors));
await fs.writeFile(`${dir}/qa-results.json`,JSON.stringify({checks,errors},null,2));console.log(JSON.stringify({checks,errors},null,2));
}finally{await browser.close();}
