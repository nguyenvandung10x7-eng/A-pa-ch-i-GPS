import {readFileSync,writeFileSync,mkdirSync,copyFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const base='c45f3b2d860db1f92efc038d0a94532f818f0f69', dir='node_modules/.cache/task04-report';
const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
const hash=b=>createHash('sha256').update(b).digest('hex');
const read=p=>readFileSync(p,'utf8');
function report(name){try {const r=JSON.parse(read(`node_modules/.cache/${name}-report/results.json`));const tests=[];
const walk=s=>{for(const v of s.specs??[])for(const t of v.tests)tests.push({title:v.title,file:v.file,status:t.status,results:t.results.map(x=>({status:x.status,retry:x.retry}))});for(const c of s.suites??[])walk(c);};walk(r);return {stats:r.stats,errors:r.errors??[],tests};}catch(e){return {error:String(e),tests:[]};}}
const baseline=report('pl00'),world=report('task04');
const baselineFiles=['foundation','reveal','manga','flow'].map((name,i)=>{const path=`tests/phieng-loi/${name}.spec.mjs`,bytes=readFileSync(path);return {path,tests:[16,7,5,16][i],sha256:hash(bytes),unchanged:hash(bytes)===hash(execFileSync('git',['show',`${base}:${path}`]))};});
const ac=p=>read(p).split('\n').filter(l=>l.startsWith('| T04-AC'));
const sourceAC=ac('docs/TASK-04-WORLD-MOVE-SOURCE-AC.md'),copyAC=ac('docs/TASK-04-WORLD-MOVE-AC-MATRIX.md');
const manifest={head:git('rev-parse','HEAD'),tree:git('rev-parse','HEAD^{tree}'),base,branch:git('branch','--show-current'),workingTree:git('status','--porcelain'),
configId:'T04-DEV-WM-CFG-P01',oldCandidate:'54541131b20b9b1e6f65dbcfbf7dff0a26ba7943',oldCandidateQA:'NEVER_PASSED_INDEPENDENT_QA',priorCandidate:'1c9c039f081b13fc9dd482b87fd35f55547536a0',priorCandidateQA:'FAIL_NEEDS_FIX_QA-04-001',qaVerdict:'PENDING_INDEPENDENT_QA',F12:'ACCEPTED_WITH_OWNER_WAIVER',
validationEnvironment:process.env.GITHUB_ACTIONS?'CI':'local',nodeVersion:process.version,runId:process.env.GITHUB_RUN_ID??null,githubSha:process.env.GITHUB_SHA??null,
acCount:sourceAC.length,acUnchanged:JSON.stringify(sourceAC)===JSON.stringify(copyAC),baselineFiles,baseline,world,newScenarios:26,newTestCount:28,
regressionSources:['tests/phieng-loi/world-contact.spec.mjs','scripts/regress-task04-contact.mjs'].map(path=>({path,sha256:hash(readFileSync(path))})),
recoveredInputTestSHA256:'915f64ea428d645438e456dd859bd482adf5a4701ae16f993ecbefb395618380',candidateTestSHA256:hash(readFileSync('tests/phieng-loi/world-move.spec.mjs'))};
mkdirSync(dir,{recursive:true});writeFileSync(`${dir}/manifest.json`,JSON.stringify(manifest,null,2));
writeFileSync(`${dir}/candidate.diff`,execFileSync('git',['diff','--binary',base,'HEAD']));
for(const name of ['AC-MATRIX','APPROVED-CONFIG'])copyFileSync(`docs/TASK-04-WORLD-MOVE-${name}.md`,`${dir}/${name}.md`);
copyFileSync('docs/TASK-04-QA-04-001-FIX.md',`${dir}/QA-04-001-FIX.md`);
console.log(JSON.stringify({head:manifest.head,baseline:baseline.stats,world:world.stats,qa:manifest.qaVerdict}));
if(baseline.errors?.length || world.errors?.length || manifest.workingTree || !manifest.acUnchanged || sourceAC.length!==18 || baselineFiles.some(f=>!f.unchanged) || baseline.tests.length!==44 || world.tests.length!==28 || [...baseline.tests,...world.tests].some(t=>t.status!=='expected'||t.results.length!==1||t.results.some(r=>r.status!=='passed'||r.retry!==0)))process.exitCode=1;
