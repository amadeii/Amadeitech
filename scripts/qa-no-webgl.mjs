import {chromium} from 'file:///C:/Users/gabri/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const dir='.impeccable/review/no-webgl';await fs.mkdir(dir,{recursive:true});
const checks=[],errors=[];
const hash=s=>createHash('sha256').update(s).digest('hex');
for(const disabled of [true,false]) {
 const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:disabled?['--disable-webgl']:[]});
 try {
  for(const width of [1440,390]) {
   const p=await b.newPage({viewport:{width,height:width<650?844:1000},reducedMotion:'reduce'});
   p.on('pageerror',e=>errors.push(e.message));
   await p.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});await p.waitForTimeout(2000);
   const mode=disabled?'svg':'webgl';
   await p.locator(`.hero-object [data-renderer=${mode}]`).waitFor();
   assert.equal(await p.locator('.hero-object-fallback').count(),0);
   if(disabled) {
    assert.equal(await p.locator('.hero-object svg').count(),1);
    assert.ok(await p.locator('.hero-object svg path').count()>0);
    const before=await p.locator('.hero-object svg').evaluate(el=>el.innerHTML);await p.waitForTimeout(700);
    const after=await p.locator('.hero-object svg').evaluate(el=>el.innerHTML);
    assert.notEqual(before,after,'Actual model and orbits update without WebGL');
    const network=p.locator('.network-field canvas[data-renderer=canvas2d]');
    const a=await network.evaluate(el=>el.toDataURL());await p.waitForTimeout(700);
    const z=await network.evaluate(el=>el.toDataURL());assert.notEqual(a,z,'Particles move without WebGL');
    checks.push({width,webglDisabled:true,animatedModel:true,animatedParticles:true,before:hash(before),after:hash(after)});
   } else {
    const saved=await p.locator('.hero-object canvas').evaluate(c=>{window.qaLoss=c.getContext('webgl2').getExtension('WEBGL_lose_context');window.qaLoss.loseContext();return true;});assert.ok(saved);
    await p.locator('.hero-object [data-renderer=svg]').waitFor();
    const a=await p.locator('.hero-object svg').evaluate(el=>el.innerHTML);await p.waitForTimeout(700);
    assert.notEqual(await p.locator('.hero-object svg').evaluate(el=>el.innerHTML),a,'Context loss switches to animated SVG');
    await p.evaluate(()=>window.qaLoss.restoreContext());
    await p.locator('.hero-object [data-renderer=webgl]').waitFor();
    assert.equal(await p.locator('.hero-object svg').count(),0);
    checks.push({width,webglDisabled:false,animatedFailover:true,gpuRestored:true});
   }
   await p.screenshot({path:`${dir}/${mode}-${width}.png`});
   assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   await p.close();
   console.log(`${mode} ${width}: passed`);
  }
  if(disabled)for(const reducedMotion of ['reduce','no-preference']) {
   const p=await b.newPage({reducedMotion});
   await p.goto('http://127.0.0.1:4174/?motion=full',{waitUntil:'networkidle'});await p.waitForTimeout(1000);
   const svg=p.locator('.hero-object svg');
   const before=await svg.evaluate(el=>el.innerHTML);await p.waitForTimeout(700);
   const after=await svg.evaluate(el=>el.innerHTML);
   assert.equal(before!==after,reducedMotion==='no-preference','SVG respects production motion preference');
   checks.push({production:reducedMotion,animatedSvg:before!==after});await p.close();
  }
 }finally{await b.close();}
}
assert.deepEqual(errors,[]);
await fs.writeFile(`${dir}/results.json`,JSON.stringify({checks,errors},null,2));
