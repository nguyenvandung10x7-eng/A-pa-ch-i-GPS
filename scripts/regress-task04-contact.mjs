import {readFileSync,writeFileSync,mkdtempSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
const sourceRoot=resolve(process.argv[2] || '.');
const temp=mkdtempSync(join(tmpdir(),'task04-qa-')); 
import {stripTypeScriptTypes} from 'node:module';
import {EventEmitter} from 'node:events';
for (const name of ['config','collision','WorldController']) {
 let s=stripTypeScriptTypes(readFileSync(`${sourceRoot}/src/game/phieng-loi/world/${name}.ts`,'utf8'),{mode:'transform'});
 s=s.replaceAll("'./config'","'./config.mjs'").replaceAll("'./collision'","'./collision.mjs'");
 writeFileSync(`${temp}/${name}.mjs`,s);
}
const {WorldController}=await import(pathToFileURL(join(temp,'WorldController.mjs')).href);
const {APPROVED}=await import(pathToFileURL(join(temp,'config.mjs')).href);
globalThis.window=new EventTarget();globalThis.document=new EventTarget();
const object=()=>new Proxy({destroy(){},setName(n){this.name=n;return this},setPosition(x,y){this.x=x;this.y=y;return this}},{get:(t,k)=>k in t?t[k]:(...a)=>t});
function make(){
 const gfx=()=>{const g={destroy(){}}; for(const k of ['lineStyle','strokeRect','fillStyle','fillRect','strokeCircle','fillCircle'])g[k]=()=>g;return g};
 const camera={scrollX:0,scrollY:0,zoom:1,rotation:0,setScroll(){return this},setZoom(){return this},setRotation(){return this}};
 let scene={events:new EventEmitter(),scale:new EventEmitter(),game:{canvas:new EventTarget(),isPaused:false},cameras:{main:camera},children:{length:4},add:{graphics:gfx,circle:gfx,container:(x,y)=>({x,y,setName(n){this.name=n;return this},setPosition(x,y){this.x=x;this.y=y;return this},destroy(){}})}};
 scene.game.canvas.getBoundingClientRect=()=>({left:0,top:0,right:1280,bottom:720,width:1280,height:720});
 scene.game.canvas.setPointerCapture=()=>{};scene.game.canvas.hasPointerCapture=()=>false;scene.game.canvas.releasePointerCapture=()=>{};
 let events=[];let c=new WorldController(scene,{sessionId:1,isCurrent:()=>true},1,structuredClone(APPROVED),(type,data)=>events.push({type,data}));return {c,scene,events};
}
// Controlled controller regression. Independent numeric oracle; no resolver import.
const mode=process.argv[3]??'qa';
const near=(a,b)=>{assert.ok(Math.abs(a.x-b.x)<=1e-6,`${a.x} != ${b.x}`);assert.ok(Math.abs(a.y-b.y)<=1e-6,`${a.y} != ${b.y}`);};
const active=c=>assert.equal(c.inspect().lifecycle,'ACTIVE');
const qFor=d=>{const r=Math.hypot(d.x,d.y);return {x:160+64*d.x/r,y:632+64*d.y/r};};
function pointer(scene,type,q){const e=new Event(type,{cancelable:true});Object.assign(e,{clientX:q.x,clientY:q.y,button:0,pointerId:1});(type==='pointerdown'?scene.game.canvas:window).dispatchEvent(e);}
function oracle(p,q,dt){
 const x=q.x-160,y=q.y-632,r=Math.hypot(x,y),m=r<=8||r>80?0:Math.min(1,(r-8)/56),dx=x/r*m*240*dt/1000,dy=y/r*m*240*dt/1000;
 const cuts=[0,1];for(const [a,d,edges] of [[p.x,dx,[94,586,774,1186]],[p.y,dy,[90,210,390,510]]])if(d)for(const edge of edges){const t=(edge-a)/d;if(t>0&&t<1)cuts.push(t);}
 cuts.sort((a,b)=>a-b);let t=1;
 for(let i=0;i<cuts.length-1;i++){const u=(cuts[i]+cuts[i+1])/2,a=p.x+dx*u,b=p.y+dy*u;
 if(a<94||a>1186||b<90||b>510||(a>586&&a<774&&b>210&&b<390)){t=cuts[i];break;}}
 return {x:p.x+dx*t,y:p.y+dy*t};
}
function inject(c,p,q,delta=1000){c.synthetic({position:p,pointer:q,delta,session:1,run:1});}
const QA={position:{x:181.6552741508931,y:177.56106850225478},pointer:{x:117.73380093449262,y:680.0579693344913}};
const evidence=[];
if(mode==='qa'){
 const {c,scene}=make();inject(c,QA.position,QA.pointer);near(c.inspect().position,{x:94,y:277.2278133311697});
 scene.events.emit('update',0,1000/60);active(c); // Fails at old 1c9c039.
 const contact=c.inspect().position;pointer(scene,'pointerdown',QA.pointer);
 for(let i=0;i<100;i++){scene.events.emit('update',0,1000/60);active(c);near(c.inspect().position,contact);}
 pointer(scene,'pointermove',{x:160,y:696});scene.events.emit('update',0,1000/60);active(c);near(c.inspect().position,{x:94,y:contact.y+4});
 pointer(scene,'pointermove',{x:224,y:632});scene.events.emit('update',0,1000/60);active(c);near(c.inspect().position,{x:98,y:contact.y+4});
 evidence.push({contact,after:c.inspect().position,heldUpdates:100});c.dispose();
}else if(mode==='matrix'){
 // Four bounds faces, four obstacle faces, four bounds corners, four obstacle corners.
 const cases=[
 [{x:181.6552741508931,y:177.56106850225478},QA.pointer,{x:0,y:1},{x:1,y:0}],
 [{x:1098.344725849107,y:177.56106850225478},qFor({x:42.26619906550738,y:48.0579693344913}),{x:0,y:1},{x:-1,y:0}],
 [{x:277.5610685022548,y:177.6552741508931},qFor({x:48.0579693344913,y:-42.26619906550738}),{x:1,y:0},{x:0,y:1}],
 [{x:277.5610685022548,y:422.3447258491069},qFor({x:48.0579693344913,y:42.26619906550738}),{x:1,y:0},{x:0,y:-1}],
 [{x:550.123456789,y:280.87654321},qFor({x:1,y:.371}),{x:0,y:1},{x:-1,y:0}],
 [{x:810.123456789,y:280.87654321},qFor({x:-1,y:.371}),{x:0,y:1},{x:1,y:0}],
 [{x:670.123456789,y:180.87654321},qFor({x:.371,y:1}),{x:1,y:0},{x:0,y:-1}],
 [{x:670.123456789,y:420.87654321},qFor({x:.371,y:-1}),{x:1,y:0},{x:0,y:1}],
 ];
 for(const [x,y,sx,sy] of [[94,90,1,1],[1186,90,-1,1],[94,510,1,-1],[1186,510,-1,-1]])cases.push([{x:x+sx*47.123456789,y:y+sy*47.123456789},qFor({x:-sx,y:-sy}),{x:sx,y:0},{x:sx,y:sy}]);
 for(const [x,y,sx,sy] of [[586,210,-1,-1],[774,210,1,-1],[586,390,-1,1],[774,390,1,1]])cases.push([{x:x+sx*37.123456789,y:y+sy*37.123456789},qFor({x:-sx,y:-sy}),{x:-sx,y:0},{x:sx,y:sy}]);
 for(const [p,q,tangent,away] of cases){const {c,scene}=make();inject(c,p,q);active(c);near(c.inspect().position,oracle(p,q,1000));scene.events.emit('update',0,1000/60);active(c);
 const contact=c.inspect().position;pointer(scene,'pointerdown',q);
 for(let i=0;i<25;i++){scene.events.emit('update',0,1000/60);active(c);near(c.inspect().position,contact);}
 for(const d of [tangent,away]){const start=c.inspect().position,raw=qFor(d);pointer(scene,'pointermove',raw);scene.events.emit('update',0,100);active(c);near(c.inspect().position,oracle(start,raw,100));}
 evidence.push({p,q,contact,after:c.inspect().position});c.dispose();}
}else if(mode==='invalid'){
 for(const p of [{x:94-2e-6,y:300},{x:1186+2e-6,y:300},{x:300,y:90-2e-6},{x:300,y:510+2e-6},{x:586+2e-6,y:300},{x:774-2e-6,y:300},{x:680,y:210+2e-6},{x:680,y:390-2e-6},{x:NaN,y:300}]){
 const {c,scene}=make();const original=c.inspect().position;inject(c,p,{x:224,y:632});assert.equal(c.inspect().lifecycle,'ERROR');near(c.inspect().position,original);scene.events.emit('update',0,16);assert.equal(c.inspect().lifecycle,'ERROR');c.dispose();
 // Explicit white-box corruption verifies next-update validation, separately
 // from public synthetic precondition validation. No production bypass added.
 const runtime=make();runtime.c.position=p;runtime.scene.events.emit('update',0,16);assert.equal(runtime.c.inspect().error,'Invalid runtime position');near(runtime.c.inspect().actorPosition,original);runtime.c.dispose();
 evidence.push({invalid:p,rejected:true,runtimeRejected:true});}
}else throw Error('Unknown regression mode');
console.log(JSON.stringify({mode,cases:evidence.length,evidence},null,2));
