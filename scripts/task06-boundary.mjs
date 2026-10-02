import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
export function assertTask06Boundary(upstream, read=readFileSync){
 const approval=JSON.parse(readFileSync('docs/task06/upstream-exceptions.json'));
 assert.equal(approval.base,'b59d50578e1268a0d6c9c8569e596fafae88229b');
 assert.deepEqual(approval.files.map(r=>r.path).sort(),['src/game/phieng-loi/contracts.ts','src/game/phieng-loi/mountPhaser.ts']);
 assert.deepEqual([...upstream].sort(),[...approval.files.map(r=>r.path),'src/game/phieng-loi/reveal/HeeSunReveal.ts'].sort());
 const hash=b=>createHash('sha256').update(b).digest('hex');
 for(const r of approval.files){
  assert.equal(hash(execFileSync('git',['show',approval.base+':'+r.path])),r.before);
  assert.equal(hash(read(r.path)),r.after,'Unauthorized source bytes: '+r.path);
 }
}
