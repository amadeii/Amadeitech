import { chromium } from 'file:///C:/Users/gabri/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import fs from 'node:fs/promises';
const dir='.taste-skill/orbit-mobile-investigation';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try {
 const page=await browser.newPage();const video=await fs.readFile(`${dir}/mobile-full-orbit.webm`);
 await page.setContent(`<video muted src="data:video/webm;base64,${video.toString('base64')}"></video><canvas width="1179" height="1782"></canvas>`);
 await page.locator('video').evaluate(v=>new Promise(r=>{if(v.readyState>=2)r();else v.onloadeddata=r;}));
 const info=await page.evaluate(async()=>{
  const v=document.querySelector('video'),c=document.querySelector('canvas'),x=c.getContext('2d');
  x.fillStyle='#060a15';x.fillRect(0,0,c.width,c.height);
  for(let i=0;i<6;i++){
   await new Promise(r=>{v.onseeked=r;v.currentTime=i*4+.2;});
   x.drawImage(v,(i%3)*393,Math.floor(i/3)*891+40,393,851);
   x.fillStyle='white';x.font='20px sans-serif';x.fillText(`${i*4} s`,(i%3)*393+15,Math.floor(i/3)*891+27);
  }
  return {duration:v.duration,width:v.videoWidth,height:v.videoHeight,data:c.toDataURL()};
 });
 await fs.writeFile(`${dir}/video-contact-sheet.png`,Buffer.from(info.data.split(',')[1],'base64'));
 console.log(JSON.stringify({...info,data:undefined}));
} finally {await browser.close();}
