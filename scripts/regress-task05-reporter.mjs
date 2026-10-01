import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,readFileSync,writeFileSync,existsSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {execFileSync,spawnSync} from 'node:child_process';

// Synthetic reporter inputs test Git identity and publication gates only.
// They are never baseline/Task04/Task05 gameplay evidence.
const source=process.cwd(),old=process.argv.includes('--old');
const root=mkdtempSync(join(tmpdir(),'task05-reporter-regression-'));
const repo=join(root,'checkout');
const git=(...args)=>execFileSync('git',args,{cwd:repo,encoding:'utf8',stdio:['pipe','pipe','pipe']}).trim();
const rows=[];
try {
  execFileSync('git',['clone','--no-hardlinks','--quiet',source,repo]);
  if(old)git('checkout','--detach','e0c096a56c18b159a51692c65aa2bb16e7efd910');
  git('config','user.name','Reporter fixture');git('config','user.email','reporter-fixture@example.invalid');
  const head=git('rev-parse','HEAD'),tree=git('rev-parse','HEAD^{tree}');
  const base='ce02cf3a21ab088a80e13417f3ff3d3b7c8545ac';
  const commit=(tree,parents)=>execFileSync('git',['commit-tree',tree,...parents.flatMap(p=>['-p',p])],{cwd:repo,input:'Reporter fixture only\n',encoding:'utf8'}).trim();
  const merge=commit(tree,[base,head]);
  const badParents=commit(tree,[head]);
  const empty=execFileSync('git',['hash-object','-t','tree','-w','--stdin'],{cwd:repo,input:'',encoding:'utf8'}).trim();
  const badTree=commit(empty,[base,head]);
  const output=join(repo,'node_modules/.cache/task05-report');mkdirSync(output,{recursive:true});
  const version=join(repo,'node_modules/@playwright/test');mkdirSync(version,{recursive:true});
  writeFileSync(join(version,'package.json'),JSON.stringify({version:'1.63.0'}));
  const ids=[...Array.from({length:24},(_,i)=>'B'+String(i+1).padStart(2,'0')),...Array.from({length:22},(_,i)=>'M'+String(i+1).padStart(2,'0'))];
  const fixture=()=>({suites:[{specs:ids.map(id=>({title:id+' reporter fixture only',tests:[{status:'expected',expectedStatus:'passed',results:[{status:'passed',retry:0,duration:0,errors:[],attachments:[]}]}]}))}],errors:[]});
  function check(name,{eventName='push',githubSha=head,event,shouldPass=true,failedTest=false}={}){
    const report=fixture();
    if(failedTest){report.suites[0].specs[1].tests[0].status='unexpected';report.suites[0].specs[1].tests[0].results[0].status='failed';}
    writeFileSync(join(output,'results.json'),JSON.stringify(report));
    // A failed invocation must remove even a stale previously accepted file.
    writeFileSync(join(output,'manifest.json'),JSON.stringify({assertionsPassed:true,stale:true}));
    const payload=event??(eventName==='pull_request'?{pull_request:{head:{sha:head},base:{sha:base}}}:{after:head});
    const path=join(root,'event.json');writeFileSync(path,JSON.stringify(payload));
    const result=spawnSync(process.execPath,[join(repo,'scripts/report-task05-evidence.mjs')],{cwd:repo,encoding:'utf8',
      env:{...process.env,GITHUB_ACTIONS:eventName==='local'?'':'true',GITHUB_EVENT_NAME:eventName,GITHUB_SHA:githubSha,GITHUB_EVENT_PATH:path,GITHUB_RUN_ID:'12345',GITHUB_RUN_ATTEMPT:'1'}});
    const manifestExists=existsSync(join(output,'manifest.json'));
    const row={name,shouldPass,exitCode:result.status,manifestExists};rows.push(row);
    if(shouldPass){
      assert.equal(result.status,0,result.stderr);assert.ok(manifestExists);
      const m=JSON.parse(readFileSync(join(output,'manifest.json')));
      if(!old)assert.equal(m.assertionsPassed,true);
      assert.equal(m.sha,head);assert.equal(m.tree,tree);assert.equal(m.counts.passed,46);
      if(!old)assert.equal(m.gitContext.eventName,eventName);
      if(eventName==='pull_request'){
        assert.deepEqual(m.gitContext.pullRequestMerge.parents,[base,head]);
        assert.equal(m.gitContext.pullRequestMerge.sha,merge);assert.equal(m.gitContext.pullRequestMerge.tree,tree);
      }
    } else {assert.notEqual(result.status,0);assert.equal(manifestExists,false,'Failed assertions left a PASS-looking manifest');}
  }
  check('local committed checkout',{eventName:'local'});
  check('push checkout HEAD');
  check('PR checkout HEAD + merge SHA/tree/parents',{eventName:'pull_request',githubSha:merge});
  check('reject push SHA mismatch and stale manifest',{githubSha:base,shouldPass:false});
  check('reject PR event HEAD mismatch',{eventName:'pull_request',githubSha:merge,event:{pull_request:{head:{sha:base},base:{sha:base}}},shouldPass:false});
  check('reject merge parent mismatch',{eventName:'pull_request',githubSha:badParents,shouldPass:false});
  check('reject untested merge tree',{eventName:'pull_request',githubSha:badTree,shouldPass:false});
  check('reject 45/46 report and stale manifest',{failedTest:true,shouldPass:false});
  console.log(JSON.stringify({kind:'SYNTHETIC_REPORTER_REGRESSION_NOT_GAMEPLAY_EVIDENCE',head,tree,total:rows.length,passed:rows.length,rows},null,2));
} catch(error){
  console.error(JSON.stringify({kind:'SYNTHETIC_REPORTER_REGRESSION_NOT_GAMEPLAY_EVIDENCE',old,rows,error:error.message},null,2));
  process.exitCode=1;
} finally {rmSync(root,{recursive:true,force:true});}
