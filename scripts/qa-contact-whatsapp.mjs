import {chromium} from 'file:///C:/Users/gabri/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import {PNG} from 'file:///C:/Users/gabri/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright-core/lib/utilsBundle.js';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const dir='.impeccable/review/contact-whatsapp';
await fs.mkdir(dir,{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const checks=[],errors=[];
const pixels=(a,b)=>{const x=PNG.sync.read(a),y=PNG.sync.read(b);let changed=0;for(let i=0;i<x.data.length;i+=4)if([0,1,2].some(c=>Math.abs(x.data[i+c]-y.data[i+c])>4))changed++;return changed/(x.width*x.height);};
try {
 for(const width of [1440,390,320]) {
  const context=await browser.newContext({viewport:{width,height:width<650?844:1000},reducedMotion:'reduce'});
  const intercepted=[];
  // Never contact WhatsApp or send a real message during testing.
  await context.route('https://wa.me/**',async route=>{intercepted.push(route.request().url());await route.fulfill({contentType:'text/html',body:'<!doctype html><title>WhatsApp navigation intercepted locally</title>'});});
  const page=await context.newPage();
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});
  await page.waitForTimeout(1600);
  assert.equal(await page.locator('.motion-toggle,.preview-notice,.globe-controls,.light-mode').count(),0);
  assert.equal(await page.locator('html').getAttribute('data-motion'),'full');
  if(width===1440){
   const hero=page.locator('.hero-object canvas');
   const a=await hero.screenshot({style:'.network-field{visibility:hidden!important}'});
   await page.waitForTimeout(700);
   const b=await hero.screenshot({style:'.network-field{visibility:hidden!important}'});
   assert.ok(pixels(a,b)>.001,'Orbit continues without pause controls');
   await page.screenshot({path:`${dir}/hero.png`});
  }
  await page.locator('#experiencia').scrollIntoViewIfNeeded();
  await page.waitForTimeout(700);
  const globe=page.locator('.globe-canvas canvas');
  const a=await globe.evaluate(el=>el.toDataURL());
  await page.waitForTimeout(600);
  assert.notEqual(await globe.evaluate(el=>el.toDataURL()),a,'Globe animates automatically');
  await page.screenshot({path:`${dir}/globe-${width}.png`});
  await page.locator('#contato').scrollIntoViewIfNeeded();
  const field=page.getByLabel('Número do WhatsApp',{exact:true});
  assert.equal(await field.getAttribute('type'),'tel');
  assert.equal(await field.getAttribute('inputmode'),'tel');
  assert.equal(await page.getByText('Como prefere receber nosso retorno?',{exact:true}).count(),0);
  const button=page.getByRole('button',{name:'Enviar pelo WhatsApp',exact:true});
  await button.click();
  assert.equal(await page.locator('[name=name]').evaluate(el=>el.validity.valid),false);
  await page.locator('[name=name]').fill('Teste de revisão');
  await page.locator('[name=company]').fill('Empresa de teste');
  await page.locator('[name=type]').selectOption({label:'Sistema web ou painel'});
  await page.locator('[name=need]').fill('Preciso organizar os pedidos e o catálogo.');
  for(const invalid of ['teste@example.com','123','...........','41999999999999999999999']) {
   await field.fill(invalid);await button.click();
   assert.match(await page.locator('.form-feedback').innerText(),/WhatsApp válido/);
   assert.equal(intercepted.length,0,'Invalid input must not open WhatsApp');
  }
  await field.fill('(41) 98888-7777');
  const popupPromise=page.waitForEvent('popup');
  await button.click();
  const popup=await popupPromise;
  await popup.waitForLoadState();
  assert.equal(intercepted.length,1);
  const url=new URL(intercepted[0]);
  assert.equal(url.hostname,'wa.me');
  assert.equal(url.pathname,'/5541991543278');
  const message=url.searchParams.get('text');
  for(const part of ['Nome: Teste de revisão','Negócio: Empresa de teste','Projeto: Sistema web ou painel','Necessidade: Preciso organizar os pedidos e o catálogo.','WhatsApp: (41) 98888-7777']) assert.ok(message.includes(part));
  assert.match(await page.locator('.form-feedback').innerText(),/toque em Enviar/);
  assert.equal(await page.getByRole('link',{name:'Abrir WhatsApp novamente'}).getAttribute('href'),url.href);
  await popup.close();
  await field.fill('41988887777');
  assert.equal(await page.getByRole('link',{name:'Abrir WhatsApp novamente'}).count(),0,'Editing clears stale message');
  // Simulate a blocked popup: the fallback link must still contain the new data.
  await page.evaluate(()=>{window.open=()=>null;});
  await page.locator('[name=company]').fill('');await button.click();
  assert.ok(decodeURIComponent(await page.getByRole('link',{name:'Abrir WhatsApp novamente'}).getAttribute('href')).includes('Negócio: Não informado'));
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await page.reload({waitUntil:'networkidle'});
  await page.locator('#contato').scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  await page.screenshot({path:`${dir}/contact-${width}.png`});
  checks.push({width,removedControls:true,automaticGlobe:true,phoneField:true,invalidBlocked:true,correctDestination:true,completeMessage:true,popupFallback:true,noOverflow:true});
  await context.close();
  console.log(`Contact and automatic motion ${width}: passed`);
 }
 const p=await browser.newPage({reducedMotion:'reduce'});
 await p.goto('http://127.0.0.1:4174/',{waitUntil:'networkidle'});
 assert.equal(await p.locator('html').getAttribute('data-motion'),'reduce');
 await p.locator('#experiencia').scrollIntoViewIfNeeded();await p.waitForTimeout(700);
 const canvas=p.locator('.globe-canvas canvas'),before=await canvas.evaluate(el=>el.toDataURL());await p.waitForTimeout(500);
 assert.equal(await canvas.evaluate(el=>el.toDataURL()),before,'Production accessibility preference preserved');
 await p.close();
 assert.deepEqual(errors,[]);
 await fs.writeFile(`${dir}/results.json`,JSON.stringify({checks,productionReducedMotion:true,realWhatsappMessagesSent:0,outboundWhatsappRequestsBlocked:true,errors},null,2));
 console.log('All checks passed; no real WhatsApp request or message sent');
}finally{await browser.close();}
