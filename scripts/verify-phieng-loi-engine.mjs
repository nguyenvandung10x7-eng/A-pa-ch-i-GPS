import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  VIEW_HEIGHT,
  VIEW_WIDTH,
  createGame,
  createSave,
  createUiSnapshot,
  stepGame,
} from '../src/experiences/phieng-loi/gameEngine.ts';
import { PHIENG_LOI_AUDIO_CUES } from '../src/experiences/phieng-loi/audioManifest.ts';
import { PHIENG_LOI_VISUAL_ASSETS } from '../src/experiences/phieng-loi/visualAssets.ts';
import {
  PHIENG_LOI_LANDMARKS,
  isWalkable,
  terrainAt,
} from '../src/experiences/phieng-loi/worldLayout.ts';

const freshInput = (callQueued = false) => ({
  left: false,
  right: false,
  up: false,
  down: false,
  moveX: 0,
  moveY: 0,
  callQueued,
});

const tick = (game, seconds, input = freshInput()) => {
  const events = [];
  let remaining = seconds;
  while (remaining > 0) {
    const dt = Math.min(0.05, remaining);
    events.push(...stepGame(game, input, dt));
    remaining -= dt;
  }
  return events;
};

const call = (game) => stepGame(game, freshInput(true), 0.02);

const quietHeeSun = (game) => {
  game.heesun.met = true;
  game.heesun.mode = 'drinking';
  game.heesun.modeUntil = 99_999;
};

assert.equal(VIEW_WIDTH / VIEW_HEIGHT, 16 / 9, 'the asset viewport should preserve 16:9 framing');
assert.equal(new Set(Object.values(PHIENG_LOI_VISUAL_ASSETS)).size, Object.values(PHIENG_LOI_VISUAL_ASSETS).length, 'visual asset slots must be unique');
Object.values(PHIENG_LOI_VISUAL_ASSETS).forEach((path) => assert.match(path, /^\/images\/phieng-loi\/.+\.webp$/));
const engineSource = readFileSync(new URL('../src/experiences/phieng-loi/gameEngine.ts', import.meta.url), 'utf8');
const pageSource = readFileSync(new URL('../src/pages/PhiengLoiGamePage.tsx', import.meta.url), 'utf8');
assert.doesNotMatch(engineSource, /CanvasRenderingContext2D|\.fillRect\(|\.beginPath\(/, 'game logic must not contain final-art drawing primitives');
assert.doesNotMatch(pageSource, /<canvas|renderGame\(/, 'the gameplay page must mount the asset scene instead of the prototype canvas');
assert.equal(new Set(PHIENG_LOI_AUDIO_CUES.map((cue) => cue.id)).size, PHIENG_LOI_AUDIO_CUES.length, 'audio cue ids must be unique');
PHIENG_LOI_AUDIO_CUES.forEach((cue) => {
  assert.equal(cue.files.length, cue.takes, `${cue.id} should declare one filename per take`);
  assert.ok(cue.delivery && cue.processing && cue.trigger, `${cue.id} should remain recording-ready`);
  assert.ok(cue.durationSeconds[0] > 0 && cue.durationSeconds[1] >= cue.durationSeconds[0]);
});

{
  const game = createGame('high', false);
  game.player.x = 320;
  game.player.y = 456;
  tick(game, 0.05);
  assert.equal(game.scene.kind, 'heesun-intro', 'HeeSun intro should start on proximity');
  const introEvents = tick(game, 4.6);
  assert.ok(introEvents.some((event) => event.type === 'chase-start'), 'intro should end in a chase');
  assert.equal(game.heesun.mode, 'chasing');

  game.heesun.x = game.player.x;
  game.heesun.y = game.player.y;
  const captureEvents = tick(game, 0.02);
  assert.ok(captureEvents.some((event) => event.type === 'capture'), 'contact should start capture cutscene');
  assert.equal(game.scene.kind, 'capture');
  assert.equal(createUiSnapshot(game).cinematicVi, '3 GIỜ SAU');
  const resetEvents = tick(game, 6.1);
  assert.ok(resetEvents.some((event) => event.type === 'reset'), 'capture should reset without Game Over');
  assert.equal(game.heesun.caught, 1);
  assert.equal(Math.round(game.player.x), 92);
}

{
  const game = createGame('high', false);
  quietHeeSun(game);
  game.player.x = PHIENG_LOI_LANDMARKS.feastStart.x;
  game.player.y = PHIENG_LOI_LANDMARKS.feastStart.y;
  tick(game, 0.02);
  assert.equal(game.feast.encounters, 1, 'first table encounter should trigger');
  game.player.x = PHIENG_LOI_LANDMARKS.playerStart.x;
  game.player.y = PHIENG_LOI_LANDMARKS.playerStart.y;
  tick(game, 5.1);
  const secondX = game.feast.x;
  const secondY = game.feast.y;
  assert.notEqual(secondX, PHIENG_LOI_LANDMARKS.feastStart.x, 'table should relocate ahead');
  game.player.x = secondX;
  game.player.y = secondY;
  tick(game, 0.02);
  assert.equal(game.feast.encounters, 2, 'second table encounter should trigger');
  game.player.x = PHIENG_LOI_LANDMARKS.playerStart.x;
  game.player.y = PHIENG_LOI_LANDMARKS.playerStart.y;
  tick(game, 5.1);
  assert.equal(game.feast.x, PHIENG_LOI_LANDMARKS.feastField.x, 'third table location should be the garden field');
  assert.equal(game.feast.y, PHIENG_LOI_LANDMARKS.feastField.y);
  game.player.x = game.feast.x;
  game.player.y = game.feast.y;
  tick(game, 0.02);
  assert.equal(game.feast.encounters, 3, 'field table encounter should trigger');
}

{
  const game = createGame('high', false);
  quietHeeSun(game);
  game.player.x = PHIENG_LOI_LANDMARKS.chief.x;
  game.player.y = PHIENG_LOI_LANDMARKS.chief.y;
  tick(game, 0.02);
  tick(game, 9);
  const snapshot = createUiSnapshot(game);
  assert.equal(snapshot.leaderClock, '19:36', 'chief clock should escalate absurdly');
  assert.equal(snapshot.chiefSpeaking, true, 'chief should keep speaking after player leaves');
}

{
  const game = createGame('high', false);
  quietHeeSun(game);
  game.player.x = PHIENG_LOI_LANDMARKS.stream.x;
  game.player.y = PHIENG_LOI_LANDMARKS.stream.y;
  const streamEvents = tick(game, 0.02);
  assert.ok(streamEvents.some((event) => event.type === 'stream'), 'stream cinematic should trigger');
  assert.ok(createUiSnapshot(game).cinematicVi?.startsWith('Người đẹp'));
  tick(game, 3);
  assert.ok(game.fishBoost >= 40, 'stream should fill with fish');
}

{
  const game = createGame('high', false);
  quietHeeSun(game);
  game.player.x = PHIENG_LOI_LANDMARKS.chickenYard.x;
  game.player.y = PHIENG_LOI_LANDMARKS.chickenYard.y;
  const chickenEvents = call(game);
  assert.ok(chickenEvents.some((event) => event.type === 'chicken-panic'), 'one nearby chicken call should panic the flock');
}

{
  const game = createGame('high', false);
  quietHeeSun(game);
  game.player.x = 505;
  game.player.y = 438;
  call(game);
  assert.ok(game.triggered.has('house-call-1'));
  call(game);
  assert.ok(game.triggered.has('house-call-2'));
  call(game);
  assert.ok(game.delayedFarReplyAt > game.elapsed, 'third house call should schedule a distant reply');
  tick(game, 1.2);
  assert.equal(game.message?.speakerVi, 'MỘT CĂN NHÀ RẤT XA');
}

{
  const game = createGame('high', false);
  quietHeeSun(game);
  const powers = [
    ['squash', PHIENG_LOI_LANDMARKS.squash.x, PHIENG_LOI_LANDMARKS.squash.y],
    ['coffee', PHIENG_LOI_LANDMARKS.coffee.x, PHIENG_LOI_LANDMARKS.coffee.y],
    ['macadamia', PHIENG_LOI_LANDMARKS.macadamia.x, PHIENG_LOI_LANDMARKS.macadamia.y],
  ];
  for (const [power, x, y] of powers) {
    game.player.x = x;
    game.player.y = y;
    const events = call(game);
    assert.ok(events.some((event) => event.type === 'power-start' && event.power === power), `${power} should activate contextually`);
    assert.ok(game.powerUntil[power] > game.elapsed);
  }
  tick(game, 4.5);
  assert.ok(game.heesun.scale > 1.5, 'HeeSun should copy the squash effect');
}

{
  const game = createGame('high', false);
  quietHeeSun(game);
  for (let count = 0; count < 13; count += 1) {
    call(game);
    tick(game, 0.08);
  }
  assert.equal(game.absurdityLevel, 3, 'repeated PHÀ ƠI calls should reach hidden level 3');
}

{
  const game = createGame('high', false);
  quietHeeSun(game);
  game.absurdityScore = 3;
  game.absurdityLevel = 1;
  game.hanu.x = PHIENG_LOI_LANDMARKS.gate.x;
  game.hanu.y = PHIENG_LOI_LANDMARKS.gate.y;
  tick(game, 0.02);
  assert.equal(game.gateOpen, true, 'HaNu should open the gate');
  assert.equal('mode' in game.hanu, false, 'HaNu must remain a phone-walk chaos generator, not a second chase state machine');
  game.hanu.x = PHIENG_LOI_LANDMARKS.domino.x;
  game.hanu.y = PHIENG_LOI_LANDMARKS.domino.y;
  const dominoEvents = tick(game, 0.02);
  assert.ok(dominoEvents.some((event) => event.type === 'domino'), 'HaNu should start the domino');
  game.hanu.x = PHIENG_LOI_LANDMARKS.stream.x;
  game.hanu.y = PHIENG_LOI_LANDMARKS.stream.y;
  tick(game, 0.02);
  assert.equal(game.hanu.saidAtStream, true, 'HaNu should claim to be home while in the stream');
  game.heesun.mode = 'chasing';
  game.heesun.x = 900;
  game.heesun.y = 520;
  game.hanu.x = 900;
  game.hanu.y = 520;
  game.hanu.lastCollisionAt = -10;
  game.player.x = PHIENG_LOI_LANDMARKS.playerStart.x;
  game.player.y = PHIENG_LOI_LANDMARKS.playerStart.y;
  tick(game, 0.02);
  assert.equal(game.heesun.mode, 'distracted', 'HaNu should accidentally interrupt HeeSun');
}

{
  const game = createGame('high', false);
  quietHeeSun(game);
  game.player.x = PHIENG_LOI_LANDMARKS.coffee.x;
  game.player.y = PHIENG_LOI_LANDMARKS.coffee.y;
  call(game);
  const saved = createSave(game);
  const restored = createGame('low', true, saved);
  assert.equal(restored.player.x, PHIENG_LOI_LANDMARKS.coffee.x);
  assert.ok(restored.triggered.has('ocop-coffee'));
  assert.equal(restored.absurdityLevel, game.absurdityLevel);
  assert.equal(createUiSnapshot(restored).power, 'coffee', 'active OCOP time should survive Continue');
}

{
  const game = createGame('high', false);
  quietHeeSun(game);
  game.player.x = PHIENG_LOI_LANDMARKS.exit.x;
  game.player.y = PHIENG_LOI_LANDMARKS.exit.y;
  const exitEvents = tick(game, 0.02);
  assert.equal(game.complete, true);
  assert.ok(exitEvents.some((event) => event.type === 'exit'));
}

{
  const game = createGame('high', false);
  quietHeeSun(game);
  tick(game, 3, { ...freshInput(), up: true });
  assert.ok(isWalkable(game.player.x, game.player.y), 'player must remain on the painted road corridor');
  assert.ok(game.player.y > 390, 'the upper road edge must block walking onto the stilt house art');
  assert.equal(terrainAt(1_330, 592), 'wood', 'the authored stream crossing must report wooden terrain');
  assert.equal(terrainAt(1_330, 540), 'blocked', 'water beside the bridge must remain blocked');

  const saved = createSave(game);
  saved.player = { x: 1_330, y: 720, facingX: 1, facingY: 0 };
  const restored = createGame('high', false, saved);
  assert.ok(isWalkable(restored.player.x, restored.player.y), 'legacy saves outside the new walk mask must be recovered safely');
}

console.log('Phiêng Lơi engine simulation passed: HeeSun, HaNu, absurd events, OCOP, escalation, save, and exit.');
