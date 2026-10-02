import {execFileSync} from 'node:child_process';
import {writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
if(process.env.NETLIFY==='true'){
  assert.equal(process.env.CONTEXT,'branch-deploy','Player preview must never be a production deploy');
  assert.equal(process.env.BRANCH,'task/pl-hs-06-player-preview');
}
const sha=git('rev-parse','HEAD'),tree=git('rev-parse','HEAD^{tree}');
const dirty=git('status','--porcelain')!=='';
if(process.env.NETLIFY==='true')assert.equal(dirty,false);
execFileSync(process.execPath,['node_modules/vite/bin/vite.js','build','--mode','hs01-preview','--outDir','dist-player-preview'],{
 stdio:'inherit',env:{...process.env,VITE_PREVIEW_SHA:sha}});
writeFileSync('dist-player-preview/preview-version.json',JSON.stringify({sha,tree,dirty,scope:'Task06 PREVIEW',F12:'ACCEPTED_WITH_OWNER_WAIVER'})+'\n');
