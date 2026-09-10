import assert from 'node:assert/strict';
import {
  RENDER_HEIGHT,
  RENDER_WIDTH,
  VIEW_HEIGHT,
  VIEW_WIDTH,
  WORLD_WIDTH,
  createGame,
  createSave,
  createUiSnapshot,
  stepGame,
} from '../src/experiences/phieng-loi/gameEngine.ts';
import { PHIENG_LOI_AUDIO_CUES } from '../src/experiences/phieng-loi/audioManifest.ts';

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

assert.equal(RENDER_WIDTH, 960, 'the hand-drawn renderer should use a 960px backing canvas');
assert.equal(RENDER_HEIGHT, 540, 'the hand-drawn renderer should use a 540px backing canvas');
assert.equal(RENDER_WIDTH / VIEW_WIDTH, RENDER_HEIGHT / VIEW_HEIGHT, 'render scale should preserve 16:9 logical framing');
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
  game.player.x = 515;
  game.player.y = 432;
  tick(game, 0.02);
  assert.equal(game.feast.encounters, 1, 'first table encounter should trigger');
  game.player.x = 100;
  game.player.y = 800;
  tick(game, 5.1);
  const secondX = game.feast.x;
  const secondY = game.feast.y;
  assert.notEqual(secondX, 515, 'table should relocate ahead');
  game.player.x = secondX;
  game.player.y = secondY;
  tick(game, 0.02);
  assert.equal(game.feast.encounters, 2, 'second table encounter should trigger');
  game.player.x = 100;
  game.player.y = 800;
  tick(game, 5.1);
  assert.equal(game.feast.x, 1_018, 'third table location should be the field');
  assert.equal(game.feast.y, 224);
  game.player.x = game.feast.x;
  game.player.y = game.feast.y;
  tick(game, 0.02);
  assert.equal(game.feast.encounters, 3, 'field table encounter should trigger');
}

{
  const game = createGame('high', false);
  quietHeeSun(game);
  game.player.x = 700;
  game.player.y = 247;
  tick(game, 0.02);
  tick(game, 9);
  const snapshot = createUiSnapshot(game);
  assert.equal(snapshot.leaderClock, '19:36', 'chief clock should escalate absurdly');
  assert.equal(snapshot.chiefSpeaking, true, 'chief should keep speaking after player leaves');
}

{
  const game = createGame('high', false);
  quietHeeSun(game);
  game.player.x = 1_205;
  game.player.y = 704;
  const streamEvents = tick(game, 0.02);
  assert.ok(streamEvents.some((event) => event.type === 'stream'), 'stream cinematic should trigger');
  assert.ok(createUiSnapshot(game).cinematicVi?.startsWith('Người đẹp'));
  tick(game, 3);
  assert.ok(game.fishBoost >= 40, 'stream should fill with fish');
}

{
  const game = createGame('high', false);
  quietHeeSun(game);
  game.player.x = 765;
  game.player.y = 458;
  const chickenEvents = call(game);
  assert.ok(chickenEvents.some((event) => event.type === 'chicken-panic'), 'one nearby chicken call should panic the flock');
}

{
  const game = createGame('high', false);
  quietHeeSun(game);
  game.player.x = 530;
  game.player.y = 220;
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
    ['squash', 585, 602],
    ['coffee', 942, 335],
    ['macadamia', 1_335, 525],
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
  game.hanu.x = 790;
  game.hanu.y = 450;
  tick(game, 0.02);
  assert.equal(game.gateOpen, true, 'HaNu should open the gate');
  assert.equal('mode' in game.hanu, false, 'HaNu must remain a phone-walk chaos generator, not a second chase state machine');
  game.hanu.x = 1_265;
  game.hanu.y = 400;
  const dominoEvents = tick(game, 0.02);
  assert.ok(dominoEvents.some((event) => event.type === 'domino'), 'HaNu should start the domino');
  game.hanu.x = 1_050;
  game.hanu.y = 650;
  tick(game, 0.02);
  assert.equal(game.hanu.saidAtStream, true, 'HaNu should claim to be home while in the stream');
  game.heesun.mode = 'chasing';
  game.heesun.x = 900;
  game.heesun.y = 520;
  game.hanu.x = 900;
  game.hanu.y = 520;
  game.hanu.lastCollisionAt = -10;
  game.player.x = 300;
  game.player.y = 800;
  tick(game, 0.02);
  assert.equal(game.heesun.mode, 'distracted', 'HaNu should accidentally interrupt HeeSun');
}

{
  const game = createGame('high', false);
  quietHeeSun(game);
  game.player.x = 942;
  game.player.y = 335;
  call(game);
  const saved = createSave(game);
  const restored = createGame('low', true, saved);
  assert.equal(restored.player.x, 942);
  assert.ok(restored.triggered.has('ocop-coffee'));
  assert.equal(restored.absurdityLevel, game.absurdityLevel);
  assert.equal(createUiSnapshot(restored).power, 'coffee', 'active OCOP time should survive Continue');
}

{
  const game = createGame('high', false);
  quietHeeSun(game);
  game.player.x = WORLD_WIDTH - 50;
  game.player.y = 450;
  const exitEvents = tick(game, 0.02);
  assert.equal(game.complete, true);
  assert.ok(exitEvents.some((event) => event.type === 'exit'));
}

console.log('Phiêng Lơi engine simulation passed: HeeSun, HaNu, absurd events, OCOP, escalation, save, and exit.');
