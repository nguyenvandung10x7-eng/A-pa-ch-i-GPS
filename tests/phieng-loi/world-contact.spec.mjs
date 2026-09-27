import {test,expect} from '@playwright/test';
import {execFileSync} from 'node:child_process';
for(const [id,mode] of [['N23','qa'],['N24','matrix'],['N25','invalid']])test(`T04-${id} controller contact regression ${mode}`,async({},info)=>{
 const output=execFileSync(process.execPath,['scripts/regress-task04-contact.mjs',process.cwd(),mode],{encoding:'utf8'});
 const evidence=JSON.parse(output);expect(evidence.cases).toBe({qa:1,matrix:16,invalid:9}[mode]);
 await info.attach('controller-regression',{body:output,contentType:'application/json'});
});
