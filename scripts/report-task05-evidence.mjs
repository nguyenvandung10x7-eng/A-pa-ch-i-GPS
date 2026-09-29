import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const output='node_modules/.cache/task05-report';mkdirSync(output,{recursive:true});
const sha=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const tree=execFileSync('git',['rev-parse','HEAD^{tree}'],{encoding:'utf8'}).trim();
const dirty=execFileSync('git',['status','--porcelain'],{encoding:'utf8'}).trim();
const base='ce02cf3a21ab088a80e13417f3ff3d3b7c8545ac';
const hash=file=>createHash('sha256').update(readFileSync(file)).digest('hex');
const baseline=JSON.parse(readFileSync('docs/task05/baseline-sha256.json'));
const unchanged=Object.entries(baseline).every(([path,value])=>existsSync(path)&&hash(path)===value);
const report=JSON.parse(readFileSync(output+'/results.json'));
const tests=[];function collect(s){for(const spec of s.specs??[])for(const test of spec.tests)tests.push({title:spec.title,status:test.status,expectedStatus:test.expectedStatus,results:test.results.map(r=>({status:r.status,retry:r.retry,duration:r.duration,errors:r.errors,attachments:r.attachments}))});for(const sub of s.suites??[])collect(sub);}
for(const s of report.suites)collect(s);
const counts={total:tests.length,passed:tests.filter(t=>t.status==='expected'&&t.results.every(r=>r.status==='passed')).length,
 failed:tests.filter(t=>t.status==='unexpected').length,skipped:tests.filter(t=>t.status==='skipped').length,flaky:tests.filter(t=>t.status==='flaky').length,retryAttempts:tests.reduce((sum,t)=>sum+t.results.filter(r=>r.retry>0).length,0)};
const matrix=JSON.parse(readFileSync('docs/task05/ac-matrix.json'));
const checks=new Map(tests.map(t=>[t.title.split(' ')[0],t]));
for(const row of matrix)for(const id of row.checks)if(id!=='report-task05-evidence')assert.ok(checks.has(id),'Missing mapped check '+id);
const observedMatrix=matrix.map(row=>({...row,status:(process.env.GITHUB_ACTIONS?'CI':'LOCAL')+'_CHECKS_RECORDED_QA_PENDING',
 checks:row.checks.map(id=>({id,status:id==='report-task05-evidence'?'REPORT_ASSERTIONS':checks.get(id).status})),
 limitation:row.id==='T05-AC24'&&!process.env.GITHUB_ACTIONS?'CI_NOT_RUN; local evidence is not CI or independent QA':null}));
const manifest={scope:'DEV HS01 playtest; QA independent PENDING',base,sha,tree,dirty:Boolean(dirty),configId:'T05-DEV-HS01-CFG-A01',technicalRevision:1,
 origin:process.env.GITHUB_ACTIONS?'CI':'LOCAL',githubSha:process.env.GITHUB_SHA??null,runId:process.env.GITHUB_RUN_ID??null,
 node:process.version,playwright:JSON.parse(readFileSync('node_modules/@playwright/test/package.json')).version,
 expectedTask05Tests:46,counts,baselineCounts:{pl00:44,world:28},baselineUnchanged:unchanged,baselineSha256:baseline,
 assets:{png:hash('src/game/phieng-loi/world/hs01/assets/player-stand.png'),wav:hash('src/game/phieng-loi/world/hs01/assets/blackout.wav'),frames:hash('src/game/phieng-loi/world/hs01/assets/frames.json')},
 resultsSha256:hash(output+'/results.json'),acMatrix:observedMatrix,tests,F12:'ACCEPTED_WITH_OWNER_WAIVER'};
writeFileSync(output+'/manifest.json',JSON.stringify(manifest,null,2)+'\n');
assert.equal(unchanged,true,'Baseline test/upstream hashes changed');
assert.equal(matrix.length,24);assert.equal(counts.total,manifest.expectedTask05Tests);
assert.equal(tests.filter(t=>/^B\d+ /.test(t.title)).length,24);assert.equal(tests.filter(t=>/^M\d+ /.test(t.title)).length,22);
assert.equal(counts.passed,manifest.expectedTask05Tests);assert.equal(counts.failed+counts.skipped+counts.flaky+counts.retryAttempts,0);
assert.equal(report.errors.length,0);assert.equal(dirty,'','Evidence must reference a committed clean candidate');
if(process.env.GITHUB_ACTIONS)assert.equal(sha,process.env.GITHUB_SHA);
console.log(JSON.stringify({sha,tree,origin:manifest.origin,counts,baselineUnchanged:unchanged,F12:manifest.F12}));
