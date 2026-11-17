import {chromium} from 'file:///C:/Users/gabri/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import sharp from 'file:///C:/Users/gabri/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp/dist/index.mjs';
import fs from 'node:fs/promises';
const dir='.taste-skill/premium';const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{
 for(const [width,id,name] of [[1440,'beaute','desktop'],[390,'wandyfitt','mobile']]){
  const p=await b.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});
  await p.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});
  const root=p.locator(`#project-${id} .showcase`);await root.scrollIntoViewIfNeeded();
  await root.locator('.showcase-screen img').first().evaluate(i=>i.decode());await p.waitForTimeout(1400);
  const buffers=[];const delays=[];
  const shoot=async delay=>{buffers.push(await root.screenshot({animations:'allow'}));delays.push(delay)};
  await shoot(900);
  for(const next of [1,2,0]){
   await root.locator('.showcase-controls button').nth(next).click();
   for(let i=0;i<7;i++){await shoot(i===6?700:100);await p.waitForTimeout(90)}
  }
  let frameWidth,frameHeight;const pixels=[];
  for(const buf of buffers){const {data,info}=await sharp(buf).resize({width:width<768?320:640}).removeAlpha().raw().toBuffer({resolveWithObject:true});frameWidth=info.width;frameHeight=info.height;pixels.push(data)}
  await sharp(Buffer.concat(pixels),{raw:{width:frameWidth,height:frameHeight*pixels.length,channels:3,pageHeight:frameHeight}}).gif({loop:0,delay:delays,effort:6,colors:128}).toFile(`${dir}/demo-${name}.gif`);
  console.log(`${name}: ${pixels.length} actual browser frames`);await p.close();
 }
}finally{await b.close()}
