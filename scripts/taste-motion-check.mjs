// The Windows host requests reduced motion. Inspect the full motion path explicitly;
// the tool's own reduced-motion page still requests reduce and is left intact.
import {Browser} from 'file:///C:/Users/gabri/.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';
const original=Browser.prototype.newPage;
Browser.prototype.newPage=async function(options={}){const page=await original.call(this,options);if(!options.reducedMotion)await page.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});return page;};
const mode=process.argv[2];process.argv.splice(2,1);
await import(`file:///C:/Users/gabri/.agents/skills/design-taste-frontend/scripts/${mode}.mjs`);
