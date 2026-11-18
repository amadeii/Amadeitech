import {runtimeBrowser,fs} from './three-d-evidence.mjs';
const browser=await runtimeBrowser();const metadata=[];
try{for(const [label,kind,width] of [['before','hero',1440],['after','hero',1440],['after','hero',393],['after','orbit',393],['after','orbit',1440]]){
 const dir=`.taste-skill/3d-final/${label}`,p=await browser.newPage();const data=await fs.readFile(`${dir}/${kind}-${width}.webm`);
 await p.setContent(`<video muted src="data:video/webm;base64,${data.toString('base64')}"></video><canvas></canvas>`);await p.locator('video').evaluate(v=>new Promise(r=>{if(v.readyState>=2)r();else v.onloadeddata=r;}));
 const result=await p.evaluate(async({width,kind})=>{const v=document.querySelector('video'),c=document.querySelector('canvas'),ctx=c.getContext('2d');const w=width<768?393:600,h=width<768?900:375;c.width=w*3;c.height=(h+35)*2;ctx.fillStyle='#060a15';ctx.fillRect(0,0,c.width,c.height);const moments=kind==='hero'?[.2,.9,1.6,2.3,3,3.7]:width<768?[1,5,9,13,17,21]:[1,7,13,19,25,31];
  for(let i=0;i<6;i++){await new Promise(r=>{v.onseeked=r;v.currentTime=moments[i];});const x=i%3*w,y=Math.floor(i/3)*(h+35);ctx.drawImage(v,x,y+35,w,h);ctx.fillStyle='white';ctx.font='18px sans-serif';ctx.fillText(`${moments[i]} s`,x+12,y+25);}
  return {data:c.toDataURL(),duration:v.duration,videoWidth:v.videoWidth,videoHeight:v.videoHeight};
 },{width,kind});await fs.writeFile(`${dir}/decoded-${kind}-${width}.png`,Buffer.from(result.data.split(',')[1],'base64'));metadata.push({label,kind,width,...result,data:undefined});await p.close();
}await fs.writeFile('.taste-skill/3d-final/after/video-metadata.json',JSON.stringify(metadata,null,2));console.log(JSON.stringify(metadata));}finally{await browser.close();}
