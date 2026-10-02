import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,rmSync,renameSync,mkdirSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const dir='node_modules/.cache/task06-mobile-report';mkdirSync(dir,{recursive:true});
for(const n of ['manifest.json','manifest.json.tmp','failure.json'])rmSync(dir+'/'+n,{force:true});
const git=(...a)=>execFileSync('git',a,{encoding:'utf8'}).trim();const sha=git('rev-parse','HEAD'),tree=git('rev-parse','HEAD^{tree}');
try{
 assert.equal(git('status','--porcelain'),'');const bytes=readFileSync(dir+'/results.json'),r=JSON.parse(bytes),tests=[];
 function collect(s){for(const sp of s.specs??[])for(const t of sp.tests)tests.push({id:sp.title.split(' ')[0],...t});for(const sub of s.suites??[])collect(sub);}r.suites.forEach(collect);
 assert.equal(r.errors.length,0);assert.equal(tests.length,12);
 const projects=['webkit-667-landscape','webkit-844-landscape','webkit-ipad','chromium-android-landscape'];
 for(const projectName of projects){const p=tests.filter(t=>t.projectName===projectName);assert.deepEqual(p.map(t=>t.id).sort(),['M01','M02','M03']);}
 assert.ok(tests.every(t=>t.status==='expected'&&t.expectedStatus==='passed'&&t.results.length===1&&t.results[0].status==='passed'&&t.results[0].retry===0&&t.results[0].errors.length===0));
 const build=JSON.parse(readFileSync('dist-player-preview/preview-version.json'));assert.equal(build.sha,sha);assert.equal(build.tree,tree);assert.equal(build.dirty,false);
 const ci=process.env.GITHUB_ACTIONS==='true';let context=null;if(ci){const e=JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH));assert.equal(sha,e.pull_request?.head.sha??e.after);context={runId:process.env.GITHUB_RUN_ID,attempt:process.env.GITHUB_RUN_ATTEMPT,githubSha:process.env.GITHUB_SHA};}
 const m={sha,tree,origin:ci?'CI':'LOCAL',context,assertionsPassed:true,qa:'BLOCKED_BY_PLAYER_PLAYTEST_FEEDBACK',counts:{total:12,passed:12,failed:0,skipped:0,retry:0,flaky:0},resultsSha256:createHash('sha256').update(bytes).digest('hex'),projects,limitations:['Linux WebKit mobile emulation is not physical iOS Safari','WebKit continuous MOVE uses trusted mouse hold; touch taps tested separately','Chromium continuous MOVE uses native CDP touch','hidden-app event is synthetic supplemental coverage; physical OS backgrounding still needs owner device'],ac:['P05','P07','P08','P11'],F12:'ACCEPTED_WITH_OWNER_WAIVER'};
 writeFileSync(dir+'/manifest.json.tmp',JSON.stringify(m,null,2)+'\n');renameSync(dir+'/manifest.json.tmp',dir+'/manifest.json');console.log(JSON.stringify(m));
}catch(e){rmSync(dir+'/manifest.json',{force:true});writeFileSync(dir+'/failure.json',JSON.stringify({sha,tree,status:'NOT_ACCEPTANCE_EVIDENCE',error:e.message}));throw e;}
