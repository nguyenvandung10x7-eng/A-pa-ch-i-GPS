import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';

const root = 'src/game/phieng-loi/reveal';
const json = (name) => JSON.parse(readFileSync(root + '/source/' + name, 'utf8'));
const manifest = json('import-manifest.json');
for (const [file, hash] of Object.entries(manifest.files)) {
  const bytes = readFileSync(file);
  assert.equal(createHash('sha256').update(bytes).digest('hex'), hash, 'Source bytes changed: ' + file);
  if (file.includes('/frames/')) {
    assert.equal(bytes.readUInt32BE(16), 210);
    assert.equal(bytes.readUInt32BE(20), 312);
    assert.equal(bytes[25], 6, 'Frame must retain RGBA');
  }
}
const frames = json('frames.json');
const state = json('state.json');
assert.equal(frames.frame_count, 25);
assert.equal(frames.frame_order, 'row-major');
assert.equal(frames.loop, false);
assert.deepEqual(frames.fps, { min: 12, max: 15, default_playtest: 15 });
assert.equal(state.reveal.voice_cue_time_sec, null);
assert.equal(state.task_01_boundary.cleanup_before_event, true);
assert.equal(state.task_01_boundary.do_not_open_manga_or_chase, true);
const assets = 'public/assets/phieng-loi-v2/hs-reveal';
assert.deepEqual(readdirSync(assets).sort(), ['heesun_aura_layers', 'heesun_reveal_25f']);
assert.deepEqual(readdirSync(assets + '/heesun_reveal_25f/frames').sort(),
  Array.from({ length: 25 }, (_, i) => 'hs_beer_saint_' + String(i + 1).padStart(2, '0') + '.png'));
assert.equal(readdirSync(assets + '/heesun_aura_layers').length, 3);
const runtime = readFileSync(root + '/HeeSunReveal.ts', 'utf8');
assert.match(runtime, /skipMissedFrames: false/);
assert.match(runtime, /ANIMATION_COMPLETE/);
assert.doesNotMatch(runtime, /setTimeout|setInterval|requestAnimationFrame|next_phase|\.flow\b|\.scene\.(start|launch)/);
assert.doesNotMatch(readFileSync(root + '/config.ts', 'utf8'), /state\.flow|state\.phases|frames\.next_phase|state\.reveal\.next_phase/);
console.log('PASS Task 01: 25 byte-identical RGBA frames, 3 separate aura assets, source/config hashes, 15 fps default, optional voice unbound, no downstream routing.');
