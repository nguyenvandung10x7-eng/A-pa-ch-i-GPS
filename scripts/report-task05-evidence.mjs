import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync,mkdirSync,rmSync,renameSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';

const output='node_modules/.cache/task05-report';
mkdirSync(output,{recursive:true});
// A previous or partially validated manifest must never survive a failed run.
for(const name of ['manifest.json','manifest.json.tmp','failure.json'])rmSync(output+'/'+name,{force:true});
const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
const hash=file=>createHash('sha256').update(readFileSync(file)).digest('hex');
const json=file=>JSON.parse(readFileSync(file,'utf8'));
const base='ce02cf3a21ab088a80e13417f3ff3d3b7c8545ac';
const ci=process.env.GITHUB_ACTIONS==='true';
const sha=git('rev-parse','HEAD'),tree=git('rev-parse','HEAD^{tree}');

try {
  assert.equal(git('status','--porcelain'),'','Evidence must reference a committed clean candidate');
  const context={eventName:ci?process.env.GITHUB_EVENT_NAME:'local',
    checkout:{sha,tree},githubSha:ci?process.env.GITHUB_SHA:null,
    githubTree:null,pullRequestMerge:null};
  if(ci){
    assert.ok(process.env.GITHUB_EVENT_PATH,'Missing GitHub event payload');
    const event=json(process.env.GITHUB_EVENT_PATH);
    assert.match(context.githubSha??'',/^[0-9a-f]{40}$/,'Missing/invalid GitHub SHA');
    context.githubTree=git('rev-parse',context.githubSha+'^{tree}');
    if(context.eventName==='push'){
      assert.equal(sha,context.githubSha,'Push must checkout the triggering HEAD');
      assert.equal(event.after,sha,'Push payload must match checkout HEAD');
      assert.equal(context.githubTree,tree);
    } else if(context.eventName==='pull_request'){
      const pr=event.pull_request;
      assert.ok(pr,'Missing PR payload');
      assert.equal(sha,pr.head.sha,'PR must checkout event HEAD, not merge ref');
      assert.equal(pr.base.sha,base,'PR base changed; integration requires a new review');
      const parents=git('rev-list','--parents','-n','1',context.githubSha).split(' ').slice(1);
      assert.deepEqual(parents,[pr.base.sha,pr.head.sha],'PR merge must have exactly the event base/head parents');
      // Tests run on HEAD. A different merge tree is not evidence for that tree.
      assert.equal(context.githubTree,tree,'PR merge tree differs from tested checkout tree');
      context.pullRequestMerge={sha:context.githubSha,tree:context.githubTree,parents,
        headSha:pr.head.sha,headTree:git('rev-parse',pr.head.sha+'^{tree}'),
        baseSha:pr.base.sha,baseTree:git('rev-parse',pr.base.sha+'^{tree}'),treeMatchesCheckout:true};
      assert.equal(context.pullRequestMerge.headTree,tree);
    } else assert.fail('Unsupported CI event: '+context.eventName);
    assert.match(process.env.GITHUB_RUN_ID??'',/^\d+$/,'Missing run ID');
    assert.match(process.env.GITHUB_RUN_ATTEMPT??'',/^\d+$/,'Missing run attempt');
  }

  const baseline=json('docs/task05/baseline-sha256.json');
  // Keep the original baseline pins. Only this owner-requested upstream bug fix
  // and its dependent N01 boundary guard may differ, with exact old/new hashes.
  const repair=json('docs/task05/pr161-reveal-repair.json');
  assert.equal(repair.path,'src/game/phieng-loi/reveal/HeeSunReveal.ts');
  assert.equal(repair.dependentBoundaryGuard.path,'tests/phieng-loi/world-move.spec.mjs');
  const repairs=[repair,repair.dependentBoundaryGuard];
  for(const r of repairs){
    assert.equal(r.referenceSha,'e0c096a56c18b159a51692c65aa2bb16e7efd910');
    assert.equal(r.originalSha256,baseline[r.path]);
    assert.equal(createHash('sha256').update(execFileSync('git',['show',r.referenceSha+':'+r.path])).digest('hex'),r.originalSha256);
  }
  const repairByPath=new Map(repairs.map(r=>[r.path,r]));
  const baselineChecks=Object.entries(baseline).map(([path,original])=>({path,
    originalSha256:original,expectedSha256:repairByPath.get(path)?.fixedSha256??original,
    actualSha256:existsSync(path)?hash(path):null,authorizedRepair:repairByPath.has(path)}));
  assert.ok(baselineChecks.every(r=>r.actualSha256===r.expectedSha256),'Baseline integrity or exact repair hash changed');
  const unchanged=baselineChecks.every(r=>r.actualSha256===r.originalSha256);
  const report=json(output+'/results.json');
  const tests=[];
  function collect(s){
    for(const spec of s.specs??[])for(const test of spec.tests)tests.push({title:spec.title,status:test.status,
      expectedStatus:test.expectedStatus,results:test.results.map(r=>({status:r.status,retry:r.retry,duration:r.duration,errors:r.errors,attachments:r.attachments}))});
    for(const sub of s.suites??[])collect(sub);
  }
  for(const s of report.suites)collect(s);
  const counts={total:tests.length,passed:tests.filter(t=>t.status==='expected'&&t.expectedStatus==='passed'&&t.results.length===1&&t.results[0].status==='passed').length,
    failed:tests.filter(t=>t.status==='unexpected').length,skipped:tests.filter(t=>t.status==='skipped').length,
    flaky:tests.filter(t=>t.status==='flaky').length,retryAttempts:tests.reduce((sum,t)=>sum+t.results.filter(r=>r.retry>0).length,0)};
  const matrix=json('docs/task05/ac-matrix.json');
  const checks=new Map(tests.map(t=>[t.title.split(' ')[0],t]));
  assert.equal(matrix.length,24);
  assert.equal(counts.total,46);assert.equal(counts.passed,46);
  assert.equal(checks.size,46,'Duplicate test IDs');
  assert.equal(tests.filter(t=>/^B\d+ /.test(t.title)).length,24);
  assert.equal(tests.filter(t=>/^M\d+ /.test(t.title)).length,22);
  assert.equal(counts.failed+counts.skipped+counts.flaky+counts.retryAttempts,0);
  assert.equal(report.errors.length,0);
  assert.ok(tests.every(t=>t.results[0].retry===0&&(t.results[0].errors??[]).length===0));
  for(const row of matrix)for(const id of row.checks)if(id!=='report-task05-evidence')assert.ok(checks.has(id),'Missing mapped check '+id);
  const observedMatrix=matrix.map(row=>({...row,status:(ci?'CI':'LOCAL')+'_CHECKS_RECORDED_QA_PENDING',
    checks:row.checks.map(id=>({id,status:id==='report-task05-evidence'?'REPORT_ASSERTIONS_PASSED':checks.get(id).status})),
    limitation:row.id==='T05-AC24'&&!ci?'CI_NOT_RUN; local evidence is not CI or independent QA':null}));
  const manifest={scope:'DEV HS01 playtest; QA independent PENDING',base,sha,tree,dirty:false,
    assertionsPassed:true,evidenceStatus:'ASSERTIONS_PASSED_QA_PENDING',
    configId:'T05-DEV-HS01-CFG-A01',technicalRevision:1,origin:ci?'CI':'LOCAL',
    githubSha:context.githubSha,runId:ci?process.env.GITHUB_RUN_ID:null,runAttempt:ci?process.env.GITHUB_RUN_ATTEMPT:null,
    gitContext:context,node:process.version,playwright:json('node_modules/@playwright/test/package.json').version,
    expectedTask05Tests:46,counts,baselineCounts:{pl00:44,world:28},
    baselineUnchanged:unchanged,baselineIntegrityPassed:true,baselineSha256:baseline,
    authorizedUpstreamRepairs:repairs,baselineChecks,
    assets:{png:hash('src/game/phieng-loi/world/hs01/assets/player-stand.png'),wav:hash('src/game/phieng-loi/world/hs01/assets/blackout.wav'),frames:hash('src/game/phieng-loi/world/hs01/assets/frames.json')},
    resultsSha256:hash(output+'/results.json'),acMatrix:observedMatrix,tests,F12:'ACCEPTED_WITH_OWNER_WAIVER'};
  // Publish atomically only after every context, integrity, count and AC gate.
  writeFileSync(output+'/manifest.json.tmp',JSON.stringify(manifest,null,2)+'\n');
  renameSync(output+'/manifest.json.tmp',output+'/manifest.json');
  console.log(JSON.stringify({sha,tree,origin:manifest.origin,gitContext:context,counts,
    assertionsPassed:true,baselineUnchanged:unchanged,baselineIntegrityPassed:true,F12:manifest.F12}));
} catch(error){
  for(const name of ['manifest.json','manifest.json.tmp'])rmSync(output+'/'+name,{force:true});
  writeFileSync(output+'/failure.json',JSON.stringify({evidenceStatus:'FAILED_NOT_ACCEPTANCE_EVIDENCE',sha,tree,message:error.message},null,2)+'\n');
  throw error;
}
