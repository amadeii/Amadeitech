import { chromium } from 'file:///C:/Users/gabri/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import fs from 'node:fs/promises';
export { fs };
export const runtimeBrowser=()=>chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
export async function instrument(page){
 await page.addInitScript(()=>{
  window.__threeD={hero:[],network:[],events:[]};
  for(const proto of [WebGLRenderingContext.prototype,WebGL2RenderingContext.prototype]){
   const get=proto.getUniformLocation,uniform=proto.uniformMatrix4fv,buffer=proto.bufferSubData;
   const names=new WeakMap();
   proto.getUniformLocation=function(...args){const loc=get.apply(this,args);if(loc)names.set(loc,args[1]);return loc;};
   proto.uniformMatrix4fv=function(...args){if(names.get(args[0])==='modelViewMatrix'&&this.canvas.closest('.hero-object')){window.__threeD.hero.push({time:performance.now(),matrix:Array.from(args[2])});if(window.__threeD.hero.length>5000)window.__threeD.hero.shift();}return uniform.apply(this,args);};
   proto.bufferSubData=function(...args){const data=args[2];if(this.canvas.closest('.network-field')&&data instanceof Float32Array&&(data.length===276||data.length===170)){window.__threeD.network.push({time:performance.now(),points:Array.from(data)});if(window.__threeD.network.length>1000)window.__threeD.network.shift();}return buffer.apply(this,args);};
  }
  for(const type of ['pointerdown','pointermove','pointerup','pointercancel'])document.addEventListener(type,e=>{if(e.target.closest('.hero-art'))window.__threeD.events.push({type,kind:e.pointerType,x:e.clientX,y:e.clientY,time:performance.now()});},{passive:true});
 });
}
export async function startVideo(browser,page,path,width,height=900){
 const recorder=await browser.newPage();
 const scale=Math.min(1,1200/width);
 await recorder.evaluate(({width,height})=>{const c=document.createElement('canvas');c.width=width;c.height=height;window.ctx=c.getContext('2d');window.parts=[];window.rec=new MediaRecorder(c.captureStream(15),{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:2200000});window.rec.ondataavailable=e=>window.parts.push(e.data);window.rec.start();},{width:Math.round(width*scale),height:Math.round(height*scale)});
 let running=true;let frames=0;
 const capture=(async()=>{while(running){const jpg=await page.screenshot({type:'jpeg',quality:85});await recorder.evaluate(async data=>{const im=new Image();im.src='data:image/jpeg;base64,'+data;await im.decode();window.ctx.drawImage(im,0,0,window.ctx.canvas.width,window.ctx.canvas.height);},jpg.toString('base64'));frames++;await page.waitForTimeout(65);}})();
 return async()=>{
  running=false;await capture;
  const data=await recorder.evaluate(()=>new Promise(resolve=>{
   window.rec.onstop=()=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result.split(',')[1]);reader.readAsDataURL(new Blob(window.parts,{type:'video/webm'}));};
   window.rec.stop();
  }));
  await fs.writeFile(path,Buffer.from(data,'base64'));await recorder.close();return frames;
 };
}
export async function touchDrag(page,from,to,duration=750){
 const cdp=await page.context().newCDPSession(page);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:from.x,y:from.y,id:1}]});
 for(let i=1;i<=16;i++){await page.waitForTimeout(duration/16);await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:from.x+(to.x-from.x)*i/16,y:from.y+(to.y-from.y)*i/16,id:1}]});}
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await cdp.detach();
}
