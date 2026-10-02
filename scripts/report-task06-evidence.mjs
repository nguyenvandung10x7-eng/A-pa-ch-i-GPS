import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,rmSync,renameSync,mkdirSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const dir='node_modules/.cache/task06-report';mkdirSync(dir,{recursive:true});
for(const n of ['manifest.json','manifest.json.tmp','failure.json'])rmSync(dir+'/'+n,{force:true});
const git=(...a)=>execFileSync('git',a,{encoding:'utf8'}).trim();
const sha=git('rev-parse','HEAD'),tree=git('rev-parse','HEAD^{tree}');
try{
 assert.equal(git('status','--porcelain'),'');
 const report=JSON.parse(readFileSync(dir+'/results.json'));const tests=[];
 function collect(s){for(const spec of s.specs??[])for(const t of spec.tests)tests.push({id:spec.title.split(' ')[0],...t});for(const sub of s.suites??[])collect(sub);}
 report.suites.forEach(collect);assert.equal(report.errors.length,0);assert.equal(tests.length,12);assert.equal(new Set(tests.map(t=>t.id)).size,12);
 assert.ok(tests.every(t=>t.status==='expected'&&t.expectedStatus==='passed'&&t.results.length===1&&t.results[0].status==='passed'&&t.results[0].retry===0&&t.results[0].errors.length===0));
 const build=JSON.parse(readFileSync('dist-player-preview/preview-version.json'));assert.equal(build.sha,sha);assert.equal(build.tree,tree);assert.equal(build.dirty,false);
 const ci=process.env.GITHUB_ACTIONS==='true';let context=null;
 if(ci){const e=JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH));const expected=e.pull_request?.head.sha??e.after;assert.equal(sha,expected);assert.ok(process.env.GITHUB_RUN_ID);context={event:process.env.GITHUB_EVENT_NAME,githubSha:process.env.GITHUB_SHA,headSha:sha,runId:process.env.GITHUB_RUN_ID,attempt:process.env.GITHUB_RUN_ATTEMPT};}
 const m={sha,tree,base:'b59d50578e1268a0d6c9c8569e596fafae88229b',origin:ci?'CI':'LOCAL',context,assertionsPassed:true,qa:'PENDING',counts:{total:12,passed:12,failed:0,skipped:0,retry:0,flaky:0},resultsSha256:createHash('sha256').update(readFileSync(dir+'/results.json')).digest('hex'),deploymentSmoke:process.env.TASK06_URL??'NOT_RUN',ac:JSON.parse(readFileSync('docs/task06/ac-matrix.json')),F12:'ACCEPTED_WITH_OWNER_WAIVER'};
 writeFileSync(dir+'/manifest.json.tmp',JSON.stringify(m,null,2)+'\n');renameSync(dir+'/manifest.json.tmp',dir+'/manifest.json');console.log(JSON.stringify(m));
}catch(e){rmSync(dir+'/manifest.json',{force:true});writeFileSync(dir+'/failure.json',JSON.stringify({sha,tree,status:'NOT_ACCEPTANCE_EVIDENCE',error:e.message}));throw e;}
