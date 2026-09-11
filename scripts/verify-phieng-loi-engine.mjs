import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  ABSURD_EVENT_REGISTRY,
  DIRECTOR_LIMITS,
  PHA_OI_COOLDOWN_SECONDS,
  PHA_OI_TRUE_NOTHING_COOLDOWN_SECONDS,
  TRUE_NOTHING_PROBABILITY,
  activateDirectedEvent,
  createDirectorState,
  evaluateDirector,
  isTrueNothingRoll,
} from '../src/experiences/phieng-loi/absurdityDirector.ts';
import {
  GAME_SAVE_VERSION,
  VIEW_HEIGHT,
  VIEW_WIDTH,
  createGame,
  createSave,
  createUiSnapshot,
  isGameplayBubble,
  stepGame,
  triggerDirectedEvent,
} from '../src/experiences/phieng-loi/gameEngine.ts';
import { PHIENG_LOI_AUDIO_CUES } from '../src/experiences/phieng-loi/audioManifest.ts';
import {
  actorMotionForGame,
  advanceMotion,
  createMotionController,
  motionFrameRate,
} from '../src/experiences/phieng-loi/motionController.ts';
import { PHIENG_LOI_VISUAL_ASSETS } from '../src/experiences/phieng-loi/visualAssets.ts';
import { PHIENG_LOI_LANDMARKS, PHIENG_LOI_WORLD, isWalkable, terrainAt } from '../src/experiences/phieng-loi/worldLayout.ts';

const freshInput = (callQueued = false) => ({ left: false, right: false, up: false, down: false, moveX: 0, moveY: 0, callQueued });
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
const sequenceRandom = (values, fallback = 0.5) => {
  let index = 0;
  return () => values[index++] ?? fallback;
};
const lcg = (seed = 0x51f15e) => {
  let value = seed >>> 0;
  return () => {
    value = (Math.imul(value, 1_664_525) + 1_013_904_223) >>> 0;
    return value / 0x1_0000_0000;
  };
};
const stabilize = (game) => {
  game.currentLocation = 'village-road';
  game.director.nextWorldTickAt = 99_999;
  game.hanu.nextPromiseAt = 99_999;
  game.hanu.nextLineAt = 99_999;
  game.heesun.met = true;
  game.heesun.mode = 'drinking';
  game.heesun.modeUntil = 99_999;
  game.heesun.x = PHIENG_LOI_LANDMARKS.chief.x;
  game.heesun.y = PHIENG_LOI_LANDMARKS.chief.y;
};
const call = (game) => stepGame(game, freshInput(true), 0.02);

assert.equal(VIEW_WIDTH / VIEW_HEIGHT, 16 / 9);
assert.ok(PHIENG_LOI_WORLD.width * PHIENG_LOI_WORLD.height >= 1_680 * 920 * 2);
assert.equal(new Set(Object.values(PHIENG_LOI_VISUAL_ASSETS)).size, Object.values(PHIENG_LOI_VISUAL_ASSETS).length);
Object.values(PHIENG_LOI_VISUAL_ASSETS).forEach((path) => {
  assert.match(path, /^\/images\/phieng-loi\/.+\.(?:webp|svg)$/);
  assert.ok(readFileSync(new URL(`../public${path}`, import.meta.url)).byteLength > 400, `${path} must be a real asset`);
});
[
  'playerStart', 'heesunStart', 'feastStart', 'feastSecond', 'feastField', 'chief', 'stream',
  'gate', 'domino', 'exit', 'squash', 'coffee', 'macadamia',
].forEach((name) => assert.ok(isWalkable(PHIENG_LOI_LANDMARKS[name].x, PHIENG_LOI_LANDMARKS[name].y), `${name} must be walkable`));
assert.equal(terrainAt(PHIENG_LOI_LANDMARKS.bridge.x, PHIENG_LOI_LANDMARKS.bridge.y), 'wood');
assert.equal(terrainAt(PHIENG_LOI_LANDMARKS.bridge.x, PHIENG_LOI_LANDMARKS.bridge.y - 105), 'blocked');

const engineSource = readFileSync(new URL('../src/experiences/phieng-loi/gameEngine.ts', import.meta.url), 'utf8');
const directorSource = readFileSync(new URL('../src/experiences/phieng-loi/absurdityDirector.ts', import.meta.url), 'utf8');
const pageSource = readFileSync(new URL('../src/pages/PhiengLoiGamePage.tsx', import.meta.url), 'utf8');
const visualSource = readFileSync(new URL('../src/experiences/phieng-loi/PhiengLoiVisualScene.tsx', import.meta.url), 'utf8');
const motionSource = readFileSync(new URL('../src/experiences/phieng-loi/motionController.ts', import.meta.url), 'utf8');
const qaSource = readFileSync(new URL('../src/experiences/phieng-loi/qaScenarios.ts', import.meta.url), 'utf8');
assert.doesNotMatch(engineSource, /CanvasRenderingContext2D|\.fillRect\(|\.beginPath\(/);
assert.doesNotMatch(pageSource, /<canvas|renderGame\(/);
assert.match(pageSource, /disabled=\{!ui\.callReady/);
assert.match(pageSource, /while \(remaining > 0\.0001\)/);
assert.match(pageSource, /MAX_VISIBLE_FRAME_CATCH_UP_SECONDS/);
assert.match(visualSource, /PHIENG_LOI_VISUAL_ASSETS\.hanuFood/);
assert.match(visualSource, /game\.karaoke\.active/);
assert.doesNotMatch(visualSource, /VUONGME_CALL_INTERVAL|normalCallCount\s*%/);
assert.match(visualSource, /PHIENG_LOI_VISUAL_ASSETS\.victoryMonument/);
assert.match(visualSource, /PHIENG_LOI_VISUAL_ASSETS\.victoryMuseum/);
assert.match(visualSource, /heesunWife/);
assert.match(visualSource, /createMotionController/);
assert.match(visualSource, /ResizeObserver/);
assert.match(visualSource, /feastCrowdRef/);
assert.match(visualSource, /actorAction/);
assert.match(visualSource, /streamAction/);
assert.doesNotMatch(visualSource, /offsetWidth|clientWidth/);
assert.match(motionSource, /preEventMotionState/);
assert.match(motionSource, /motionEnteredAt/);
assert.match(pageSource, /parsePhiengLoiQaScenario/);
assert.match(pageSource, /drivePhiengLoiQaScenario/);
assert.match(qaSource, /qa-feast-chase/);
for (const scenario of ['locomotion', 'pha-normal', 'pha-nothing', 'heesun-intro', 'heesun-feast', 'capture', 'hanu-delivery', 'signature-chase', 'feast', 'chicken', 'hanu-blocks-heesun', 'disco', 'wife']) {
  assert.match(qaSource, new RegExp(`["']${scenario}["']`), `${scenario} deterministic QA scene must exist`);
}
assert.doesNotMatch(pageSource, /GỌI \/ ĂN \/ CHẠM|CALL \/ EAT \/ ACT/);
assert.doesNotMatch(pageSource, /Ngón trái để đi · Ngón phải|Move with your left thumb/);
assert.doesNotMatch(pageSource, /BẮT HANU|CATCH HANU|catch button/i);

assert.ok(ABSURD_EVENT_REGISTRY.length >= 28, 'the pool should have enough combinable events');
assert.equal(new Set(ABSURD_EVENT_REGISTRY.map(({ id }) => id)).size, ABSURD_EVENT_REGISTRY.length);
ABSURD_EVENT_REGISTRY.forEach((event) => {
  for (const key of ['id', 'tier', 'weight', 'minimumAbsurdity', 'cooldown', 'antiRepeatGroup', 'priority', 'canInterrupt', 'canBeInterrupted', 'actorStateChanges', 'worldStateChanges', 'dialogueBubbles']) {
    assert.ok(key in event, `${event.id} is missing ${key}`);
  }
});
assert.match(directorSource, /signals: \['pha-oi'/);
assert.equal(DIRECTOR_LIMITS.activeMajor, 1);
assert.equal(DIRECTOR_LIMITS.activeMicro, 2);
assert.equal(DIRECTOR_LIMITS.delayedQueue, 6);
assert.equal(DIRECTOR_LIMITS.chainDepth, 5);

assert.equal(TRUE_NOTHING_PROBABILITY, 0.2);
assert.equal(PHA_OI_COOLDOWN_SECONDS, 5);
assert.equal(PHA_OI_TRUE_NOTHING_COOLDOWN_SECONDS, 60);
assert.equal(isGameplayBubble('player', 'plain'), true);
assert.equal(isGameplayBubble('heesun', 'heesun'), true);
assert.equal(isGameplayBubble('hanu', 'hanu'), true);
assert.equal(isGameplayBubble('vuongme', 'vuongme'), true);
for (const [anchor, tone] of [['chief', 'chief'], ['feast', 'world'], ['stream', 'stream'], ['world', 'world'], ['player', 'ocop']]) {
  assert.equal(isGameplayBubble(anchor, tone), false, `${anchor}/${tone} must not occupy a gameplay bubble`);
}
{
  const random = lcg();
  let trueNothing = 0;
  const samples = 50_000;
  for (let index = 0; index < samples; index += 1) trueNothing += Number(isTrueNothingRoll(random()));
  const ratio = trueNothing / samples;
  assert.ok(ratio > 0.19 && ratio < 0.21, `TRUE NOTHING ratio was ${ratio}`);
}
{
  const controller = createMotionController(0);
  const track = controller.player;
  advanceMotion(track, { motion: 'idle', now: 0, vx: 0, vy: 0, facingHint: 1, allowLocomotionTransitions: true });
  advanceMotion(track, { motion: 'move', now: .01, vx: 86, vy: 0, facingHint: 1, allowLocomotionTransitions: true });
  assert.equal(track.currentMotion, 'start', 'locomotion starts with anticipation');
  advanceMotion(track, { motion: 'move', now: .14, vx: 86, vy: 0, facingHint: 1, allowLocomotionTransitions: true });
  assert.equal(track.currentMotion, 'move');
  const firstMotionStart = track.motionEnteredAt;
  advanceMotion(track, { motion: 'move', now: .16, vx: -86, vy: 0, facingHint: -1, allowLocomotionTransitions: true });
  assert.equal(track.facing, 1, 'facing uses hysteresis instead of flipping on the first reverse sample');
  advanceMotion(track, { motion: 'move', now: .25, vx: -86, vy: 0, facingHint: -1, allowLocomotionTransitions: true });
  assert.equal(track.facing, -1);
  assert.equal(track.currentMotion, 'turn');
  advanceMotion(track, { motion: 'move', now: .38, vx: -86, vy: 0, facingHint: -1, allowLocomotionTransitions: true });
  assert.equal(track.currentMotion, 'move');
  assert.ok(track.motionEnteredAt > firstMotionStart, 'each action owns a fresh local phase');
  advanceMotion(track, { motion: 'idle', now: .4, vx: 0, vy: 0, facingHint: -1, allowLocomotionTransitions: true });
  assert.equal(track.currentMotion, 'stop', 'locomotion ends with braking/settle');
  advanceMotion(track, { motion: 'idle', now: .58, vx: 0, vy: 0, facingHint: -1, allowLocomotionTransitions: true });
  assert.equal(track.currentMotion, 'idle');

  const heesun = controller.heesun;
  advanceMotion(heesun, { motion: 'chase', now: .1, vx: 20, facingHint: 1 });
  const slowRate = motionFrameRate(heesun);
  advanceMotion(heesun, { motion: 'chase', now: .2, vx: 82, facingHint: 1 });
  assert.ok(motionFrameRate(heesun) > slowRate, 'chase cadence follows actual velocity');
  advanceMotion(heesun, { motion: 'chase', now: .3, vx: 82, facingHint: 1, visualOverride: 'dance-heesun' });
  assert.equal(heesun.currentMotion, 'dance-heesun');
  assert.equal(heesun.preEventMotionState?.motion, 'chase');
  advanceMotion(heesun, { motion: 'chase', now: 1.3, vx: 82, facingHint: 1, visualOverride: null });
  assert.equal(heesun.currentMotion, 'chase', 'disco restores the pre-event chase motion directly');
}
{
  const game = createGame('high', false, null, { random: () => .8 });
  stabilize(game);
  game.player.x = 1_000;
  game.player.y = 620;
  game.cameraX = game.player.x - VIEW_WIDTH / 2;
  game.cameraY = game.player.y - VIEW_HEIGHT * .7;
  tick(game, .8, { ...freshInput(), moveX: 1 });
  assert.ok(game.cameraX > game.player.x - VIEW_WIDTH / 2 + 12, 'camera leads horizontal movement');
}
{
  const game = createGame('high', false, null, { random: sequenceRandom([0.1, 0.1]) });
  stabilize(game);
  const before = {
    hanuMode: game.hanu.mode,
    heesunMode: game.heesun.mode,
    feastMode: game.feast.mode,
    chicken: game.chicken.mode,
    delayed: game.director.delayedQueue.length,
    recent: game.director.recentEvents.length,
    shakeUntil: game.shakeUntil,
    impulse: { ...game.cameraImpulse },
    particles: game.particles.length,
    animationCues: JSON.stringify(game.animationCues),
    normalCallCount: game.normalCallCount,
  };
  const events = call(game);
  assert.deepEqual(events.filter(({ type }) => type === 'pha-oi').map(({ outcome }) => outcome), ['true-nothing']);
  assert.equal(events.some(({ type }) => type === 'director-event'), false);
  assert.equal(game.message, null);
  assert.equal(game.director.delayedQueue.length, before.delayed);
  assert.equal(game.director.recentEvents.length, before.recent);
  assert.equal(game.hanu.mode, before.hanuMode);
  assert.equal(game.heesun.mode, before.heesunMode);
  assert.equal(game.feast.mode, before.feastMode);
  assert.equal(game.chicken.mode, before.chicken);
  assert.equal(game.shakeUntil, before.shakeUntil);
  assert.deepEqual(game.cameraImpulse, before.impulse);
  assert.equal(game.particles.length, before.particles);
  assert.equal(JSON.stringify(game.animationCues), before.animationCues);
  assert.equal(game.normalCallCount, before.normalCallCount);
  assert.equal(game.lastCallOutcome, 'true-nothing');
  assert.equal(game.karaoke.active, false);
  assert.ok(Math.abs(game.phaOiCooldownUntil - game.elapsed - PHA_OI_TRUE_NOTHING_COOLDOWN_SECONDS) < 0.001);
  assert.equal(game.phaOiCooldownDuration, PHA_OI_TRUE_NOTHING_COOLDOWN_SECONDS);
  const calls = game.callCount;
  assert.equal(call(game).some(({ type }) => type === 'pha-oi'), false);
  assert.equal(game.callCount, calls);
  assert.equal(createUiSnapshot(game).callReady, false);

  game.heesun.mode = 'chasing';
  game.heesun.target = 'player';
  game.heesun.chaseTimeoutAt = game.elapsed + 24;
  game.heesun.x = game.player.x + 250;
  game.heesun.y = game.player.y;
  game.hanu.mode = 'delivering';
  game.hanu.carryingFood = true;
  game.hanu.deliveryTimeoutAt = game.elapsed + 55;
  const heesunX = game.heesun.x;
  const hanuX = game.hanu.x;
  tick(game, 2);
  assert.notEqual(game.heesun.x, heesunX);
  assert.notEqual(game.hanu.x, hanuX);

  const restored = createGame('high', false, createSave(game), { random: () => 0.8 });
  assert.ok(restored.phaOiCooldownUntil - restored.elapsed > 57.9);
  restored.heesun.mode = 'drinking';
  restored.heesun.modeUntil = 99_999;
  restored.hanu.mode = 'delivery-paused';
  restored.hanu.modeUntil = 99_999;
  restored.director.nextWorldTickAt = 99_999;
  restored.currentLocation = 'village-road';
  const readyEvents = tick(restored, restored.phaOiCooldownUntil - restored.elapsed + 0.05);
  assert.ok(readyEvents.some(({ type }) => type === 'call-ready'));
  assert.equal(createUiSnapshot(restored).callReady, true);

  const legacyLongCooldown = createSave(game);
  legacyLongCooldown.version = 2;
  legacyLongCooldown.phaOiCooldownRemaining = 60;
  const cappedLegacy = createGame('high', false, legacyLongCooldown, { random: () => 0.8 });
  assert.ok(cappedLegacy.phaOiCooldownUntil - cappedLegacy.elapsed > 59.9);
  assert.ok(cappedLegacy.phaOiCooldownUntil - cappedLegacy.elapsed <= PHA_OI_TRUE_NOTHING_COOLDOWN_SECONDS);
}

{
  const game = createGame('high', false, null, { random: sequenceRandom([0.8, 0.1, 0, 0.2, 0.4, 0.8, 0, 0.8], 0.7) });
  stabilize(game);
  const first = call(game);
  assert.ok(first.some((event) => event.type === 'pha-oi' && event.outcome === 'normal'));
  assert.ok(first.some((event) => event.type === 'director-event'));
  assert.equal(game.normalCallCount, 1);
  assert.ok(Math.abs(game.phaOiCooldownUntil - game.elapsed - PHA_OI_COOLDOWN_SECONDS) < .001);
  assert.equal(game.phaOiCooldownDuration, PHA_OI_COOLDOWN_SECONDS);
  assert.equal(game.lastCallOutcome, 'normal');
  assert.ok(game.cameraImpulse.until > game.elapsed, 'normal PHÀ ƠI may create a small camera beat');
  const firstVoice = first.find(({ type }) => type === 'pha-oi').voice;
  tick(game, 0.08);
  assert.equal(call(game).some(({ type }) => type === 'pha-oi'), false);
  tick(game, PHA_OI_COOLDOWN_SECONDS);
  game.random = sequenceRandom([0.8, 0.95, 0.4, 0.6], 0.7);
  const second = call(game);
  assert.ok(second.some((event) => event.type === 'pha-oi'));
  assert.notEqual(second.find(({ type }) => type === 'pha-oi').voice, firstVoice);
  assert.ok(game.phaOiCooldownUntil > game.elapsed);
}

{
  const director = createDirectorState();
  const context = new Set(['near-house', 'world-quiet', 'major-quiet', 'chickens-calm', 'feast-idle', 'heesun-idle']);
  const first = evaluateDirector(director, 'pha-oi', context, 0, 1, () => 0);
  const second = evaluateDirector(director, 'pha-oi', context, 0, 2, () => 0);
  assert.ok(first && second);
  assert.notEqual(first.definition.id, second.definition.id);
}

{
  const game = createGame('high', false, null, { random: () => 0.7 });
  game.currentLocation = 'village-road';
  game.director.nextWorldTickAt = 99_999;
  game.hanu.nextPromiseAt = 99_999;
  game.player.x = game.heesun.x - 60;
  game.player.y = game.heesun.y;
  tick(game, 0.05);
  assert.equal(game.scene.kind, 'heesun-intro');
  assert.ok(tick(game, 4.6).some(({ type }) => type === 'chase-start'));
  assert.equal(game.heesun.mode, 'chasing');
  triggerDirectedEvent(game, 'heesun-shoe');
  assert.equal(game.heesun.mode, 'interrupted');
  assert.equal(actorMotionForGame(game, 'heesun'), 'recoil');
  tick(game, 1.8);
  assert.equal(game.heesun.mode, 'chasing');
  game.director.activeMicro = [];
  triggerDirectedEvent(game, 'heesun-chicken-detour');
  assert.equal(game.heesun.target, 'chickens');
  tick(game, 2.7);
  assert.equal(game.heesun.target, 'player');
  game.heesun.x = game.player.x;
  game.heesun.y = game.player.y;
  assert.ok(tick(game, 0.02).some(({ type }) => type === 'capture'));
  assert.equal(createUiSnapshot(game).cinematicVi, null, 'capture contact gets a readable hit-stop before the hard cut');
  tick(game, 0.14);
  assert.equal(createUiSnapshot(game).cinematicVi, '3 GIỜ SAU');
  tick(game, 0.96);
  assert.equal(game.message?.textVi, 'Làm chén cuối.');
  assert.equal(actorMotionForGame(game, 'player'), 'seated-tired');
  assert.equal(actorMotionForGame(game, 'heesun'), 'seated-toast');
  assert.equal(game.player.y, game.feast.y + 18);
  assert.equal(game.heesun.y, game.feast.y + 18);
  tick(game, 1.95);
  assert.equal(game.scene.stage, 1, 'the seated composition holds long enough to read on mobile');
  assert.equal(createUiSnapshot(game).cinematicVi, null);
  tick(game, 1.05);
  assert.equal(createUiSnapshot(game).cinematicVi, '5 GIỜ SAU');
  assert.ok(tick(game, 0.9).some(({ type }) => type === 'reset'));
  assert.equal(game.heesun.caught, 1);
  assert.equal(Math.round(game.player.x), PHIENG_LOI_LANDMARKS.playerStart.x);
}

{
  const game = createGame('high', false, null, { random: () => 0.8 });
  stabilize(game);
  Object.assign(game.heesun, {
    x: game.feast.x + 44,
    y: game.feast.y,
    mode: 'chasing',
    target: 'player',
    chaseTimeoutAt: 99_999,
  });
  const origin = { x: game.heesun.x, y: game.heesun.y };
  triggerDirectedEvent(game, 'heesun-feast-interrupt');
  assert.equal(game.heesun.mode, 'drinking');
  assert.equal(actorMotionForGame(game, 'heesun'), 'drinking');
  assert.deepEqual({ x: game.heesun.actionFromX, y: game.heesun.actionFromY }, origin);
  assert.ok(Math.hypot(game.heesun.x - game.feast.x, game.heesun.y - game.feast.y) < 70, 'HeeSun joins a real table seat');
  tick(game, 2.45);
  assert.equal(game.heesun.mode, 'chasing', 'HeeSun resumes the pre-interrupt chase');
}

{
  const game = createGame('high', false, null, { random: () => 0.8 });
  game.currentLocation = 'village-road';
  game.director.nextWorldTickAt = 99_999;
  game.heesun.met = true;
  game.heesun.mode = 'drinking';
  game.heesun.modeUntil = 99_999;
  tick(game, 2.45);
  assert.equal(game.message?.textVi, "Alo, 30' nữa tôi ship cơm cho bạn.");
  game.hanu.nextPromiseAt = game.elapsed;
  game.player.x = game.hanu.x + 60;
  game.player.y = game.hanu.y;
  tick(game, 0.05);
  assert.equal(game.message?.textVi, "30' nữa tôi ship.");
  tick(game, 1.5);
  assert.equal(game.message?.textVi, "30' trước bạn cũng nói thế mà.");
  tick(game, 1.9);
  assert.equal(game.message?.textVi, 'Ừ.');
  assert.ok(tick(game, 4).some(({ type }) => type === 'delivery-start'));
  assert.equal(game.hanu.carryingFood, true);
  assert.equal(createUiSnapshot(game).hanuDeliveryActive, true);
  game.player.x = PHIENG_LOI_LANDMARKS.playerStart.x;
  game.player.y = PHIENG_LOI_LANDMARKS.playerStart.y;
  game.director.activeMicro = [];
  const oldWaypoint = game.hanu.waypoint;
  triggerDirectedEvent(game, 'hanu-wrong-route');
  assert.notEqual(game.hanu.waypoint, oldWaypoint);
  game.director.activeMicro = [];
  triggerDirectedEvent(game, 'hanu-phone-first');
  assert.equal(game.hanu.mode, 'delivery-paused');
  assert.equal(actorMotionForGame(game, 'hanu'), 'phone-pause');
  tick(game, 1.9);
  assert.equal(game.hanu.mode, 'delivering');
  game.director.activeMicro = [];
  triggerDirectedEvent(game, 'hanu-almost-caught');
  assert.equal(game.hanu.mode, 'delivery-paused');
  tick(game, 1.2);
  assert.equal(game.hanu.mode, 'delivering');
  assert.ok(game.hanu.speedBoostUntil > game.elapsed);
  game.director.activeMicro = [];
  triggerDirectedEvent(game, 'hanu-wrong-person');
  assert.equal(game.hanu.mode, 'delivery-paused');
  assert.equal(actorMotionForGame(game, 'hanu'), 'handoff');
  tick(game, 3);
  assert.equal(game.hanu.mode, 'delivering');
  assert.equal(game.hanu.carryingFood, true);
  game.player.x = game.hanu.x;
  game.player.y = game.hanu.y;
  assert.ok(tick(game, 0.02).some(({ type }) => type === 'delivery-complete'));
  assert.equal(game.hanu.carryingFood, false);
  assert.equal(game.hanu.receivedCount, 1);
}

{
  const game = createGame('high', false, null, { random: () => 0.7 });
  stabilize(game);
  Object.assign(game.hanu, { mode: 'delivering', carryingFood: true, deliveryTimeoutAt: 99_999 });
  const events = triggerDirectedEvent(game, 'hanu-perfect-delivery');
  assert.ok(events.some(({ type }) => type === 'delivery-complete'));
  assert.equal(actorMotionForGame(game, 'hanu'), 'handoff');
  assert.equal(game.hanu.mode, 'delivered');
  assert.equal(game.hanu.carryingFood, false);
}

{
  const game = createGame('high', false, null, { random: () => 0.4 });
  stabilize(game);
  Object.assign(game.hanu, { mode: 'delivering', carryingFood: true, deliveryTimeoutAt: 99_999 });
  Object.assign(game.heesun, { mode: 'chasing', target: 'player', chaseTimeoutAt: 99_999, met: true });
  game.director.activeMicro = [];
  triggerDirectedEvent(game, 'feast-chase');
  game.director.activeMicro = [];
  triggerDirectedEvent(game, 'hanu-chicken-procession');
  const ui = createUiSnapshot(game);
  assert.equal(ui.hanuDeliveryActive, true);
  assert.equal(ui.chasing, true);
  assert.equal(ui.feastChasing, true);
  assert.equal(game.chicken.mode, 'follow-hanu');
  game.director.activeMicro = [];
  triggerDirectedEvent(game, 'feast-switch-hanu');
  assert.equal(game.feast.target, 'hanu');
}

{
  const game = createGame('high', false, null, { random: () => 0.6 });
  stabilize(game);
  game.player.x = game.feast.x;
  game.player.y = game.feast.y;
  tick(game, 0.02);
  assert.equal(game.feast.mode, 'invite');
  assert.equal(game.message, null, 'the feast reacts without covering gameplay with a bubble');
  game.director.activeMicro = [];
  triggerDirectedEvent(game, 'feast-stare');
  assert.equal(game.feast.mode, 'stare');
  tick(game, 2.3);
  assert.equal(game.feast.mode, 'idle');
  game.director.activeMicro = [];
  game.player.x = PHIENG_LOI_LANDMARKS.exit.x - 100;
  game.player.y = PHIENG_LOI_LANDMARKS.exit.y;
  triggerDirectedEvent(game, 'feast-chase');
  assert.equal(game.feast.mode, 'chasing');
  assert.equal(actorMotionForGame(game, 'feast'), 'feast-rise');
  const feastLaunchX = game.feast.x;
  tick(game, .5);
  assert.equal(actorMotionForGame(game, 'feast'), 'feast-chase');
  assert.notEqual(game.feast.x, feastLaunchX, 'the people launch after standing instead of sliding the table immediately');
  tick(game, 8.2);
  assert.notEqual(game.feast.mode, 'chasing');
  game.feast.mode = 'idle';
  game.feast.pendingRelocate = true;
  game.feast.relocateAt = game.elapsed;
  game.player.x = PHIENG_LOI_LANDMARKS.playerStart.x;
  game.player.y = PHIENG_LOI_LANDMARKS.playerStart.y;
  const oldX = game.feast.x;
  tick(game, 0.05);
  assert.notEqual(game.feast.x, oldX);
}

{
  const game = createGame('high', false, null, { random: () => 0 });
  stabilize(game);
  for (const [id, expected] of [
    ['chicken-glance', 'look'], ['chicken-triple-stare', 'triple-look'],
    ['chicken-run-away', 'panic-away'], ['chicken-run-toward-player', 'panic-toward-player'],
    ['hanu-chicken-procession', 'follow-hanu'],
    ['chicken-follow-heesun', 'follow-heesun'], ['chicken-invade-feast', 'invade-feast'],
  ]) {
    game.director.activeMicro = [];
    triggerDirectedEvent(game, id);
    assert.equal(game.chicken.mode, expected);
    assert.equal(actorMotionForGame(game, 'chicken'), expected === 'look' || expected === 'triple-look' ? 'look' : 'panic');
  }
}

{
  const game = createGame('high', false, null, { random: () => 0.5 });
  stabilize(game);
  Object.assign(game.heesun, { mode: 'chasing', target: 'player', chaseTimeoutAt: 99_999 });
  game.feast.mode = 'chasing';
  triggerDirectedEvent(game, 'heesun-wife');
  assert.equal(game.heesun.mode, 'rare-flee');
  assert.equal(actorMotionForGame(game, 'heesun'), 'flee');
  assert.equal(actorMotionForGame(game, 'wife'), 'command');
  assert.equal(game.feast.mode, 'resetting');
  assert.ok(game.wife.visibleUntil > game.elapsed);
  assert.notEqual(game.message?.speakerVi, 'VỢ HEESUN');
  game.director.activeMicro = [];
  triggerDirectedEvent(game, 'macro-philosophy');
  assert.equal(game.worldGag.macro, 'philosophy');
  assert.match(createUiSnapshot(game).cinematicVi ?? '', /Về lý thuyết/);
}

{
  const karaokeDefinition = ABSURD_EVENT_REGISTRY.find(({ id }) => id === 'vuongme-karaoke-disco');
  assert.ok(karaokeDefinition);
  assert.deepEqual(karaokeDefinition.signals, ['pha-oi']);
  assert.ok(karaokeDefinition.contextRequirements.all.includes('karaoke-eligible'));
  assert.ok(karaokeDefinition.cooldown >= 120);

  const game = createGame('high', false, null, { random: () => .74 });
  stabilize(game);
  Object.assign(game.heesun, {
    x: game.player.x + 280, y: game.player.y, mode: 'chasing', target: 'player',
    chaseStartedAt: game.elapsed || .001, chaseTimeoutAt: game.elapsed + 30, met: true,
  });
  Object.assign(game.hanu, {
    x: game.player.x + 170, y: game.player.y, mode: 'delivering', carryingFood: true,
    deliveryTimeoutAt: game.elapsed + 45,
  });
  Object.assign(game.feast, { mode: 'chasing', modeUntil: game.elapsed + 8, chaseStartedAt: game.elapsed || .001 });
  Object.assign(game.chief, { startedAt: game.elapsed || .001, stage: 1, nextLineAt: game.elapsed + 7 });
  game.director.activeMajor = null;
  const heesunX = game.heesun.x;
  const hanuX = game.hanu.x;
  const heesunTimeout = game.heesun.chaseTimeoutAt;
  const deliveryTimeout = game.hanu.deliveryTimeoutAt;
  const startX = game.player.x;
  const startEvents = triggerDirectedEvent(game, 'vuongme-karaoke-disco');
  assert.ok(startEvents.some(({ type }) => type === 'karaoke-start'));
  assert.equal(game.karaoke.active, true);
  tick(game, .4);
  assert.equal(game.message?.speakerVi, 'VUONGME');
  const duringEvents = tick(game, 2, { ...freshInput(), moveX: 1 });
  assert.equal(duringEvents.some(({ type }) => type === 'karaoke-stop'), false);
  assert.notEqual(game.player.x, startX, 'player remains controllable during karaoke');
  assert.equal(game.heesun.x, heesunX);
  assert.equal(game.hanu.x, hanuX);
  assert.equal(game.heesun.mode, 'chasing');
  assert.equal(game.hanu.mode, 'delivering');
  assert.ok(game.heesun.chaseTimeoutAt >= heesunTimeout + 1.95);
  assert.ok(game.hanu.deliveryTimeoutAt >= deliveryTimeout + 1.95);
  game.player.x = startX;
  game.player.y = PHIENG_LOI_LANDMARKS.playerStart.y;
  const stopEvents = tick(game, 8.6);
  assert.ok(stopEvents.some(({ type }) => type === 'karaoke-stop'));
  assert.equal(game.karaoke.active, false);
  assert.equal(game.heesun.mode, 'chasing');
  assert.equal(game.hanu.mode, 'delivering');
  assert.ok(createUiSnapshot(game).leaderLineVi.startsWith('Thứ hai'));
}

{
  const game = createGame('high', false, null, { random: () => 0.99 });
  stabilize(game);
  Object.assign(game.hanu, { mode: 'delivery-paused', modeUntil: 99_999, carryingFood: false });
  Object.assign(game.heesun, { x: game.feast.x, y: game.feast.y, mode: 'interrupted', modeUntil: 99_999 });
  const before = game.director.evaluations;
  tick(game, 10);
  const collisionEvaluations = game.director.evaluations - before;
  assert.ok(collisionEvaluations <= 5, `a persistent collision made ${collisionEvaluations} director evaluations in 10 seconds`);
}

{
  const game = createGame('high', false, null, { random: () => 0 });
  stabilize(game);
  game.absurdityScore = 12;
  game.absurdityLevel = 3;
  for (let count = 0; count < 12; count += 1) {
    game.director.activeMicro = [];
    triggerDirectedEvent(game, 'delayed-chicken-crossing');
    game.elapsed += 0.2;
  }
  assert.ok(game.director.delayedQueue.length <= DIRECTOR_LIMITS.delayedQueue);
  assert.equal(activateDirectedEvent(game.director, 'chicken-crossing', game.elapsed, DIRECTOR_LIMITS.chainDepth + 1, game.random), null);
  const dueAt = game.director.delayedQueue[0]?.dueAt;
  assert.ok(dueAt);
  tick(game, dueAt - game.elapsed + 0.1);
  assert.ok(game.director.recentEvents.some(({ id }) => id === 'chicken-crossing'));
}

{
  const game = createGame('high', false, null, { random: () => 0.99 });
  stabilize(game);
  game.director.nextWorldTickAt = 3.5;
  game.hanu.mode = 'delivery-paused';
  game.hanu.modeUntil = 99_999;
  game.hanu.carryingFood = false;
  const before = game.director.evaluations;
  tick(game, 10);
  const evaluations = game.director.evaluations - before;
  assert.ok(evaluations <= 3, `sparse runtime made ${evaluations} director evaluations in 10 seconds`);
}

{
  const game = createGame('high', false, null, { random: () => 0.8 });
  stabilize(game);
  game.player.x = PHIENG_LOI_LANDMARKS.chief.x;
  game.player.y = PHIENG_LOI_LANDMARKS.chief.y;
  tick(game, 9);
  assert.equal(createUiSnapshot(game).chiefSpeaking, true);
  assert.equal(createUiSnapshot(game).leaderClock, '19:36');
  game.player.x = PHIENG_LOI_LANDMARKS.stream.x;
  game.player.y = PHIENG_LOI_LANDMARKS.stream.y;
  assert.ok(tick(game, 0.02).some(({ type }) => type === 'stream'));
}

{
  const game = createGame('high', false, null, { random: sequenceRandom([0.1, 0.8], 0.7) });
  stabilize(game);
  game.player.x = PHIENG_LOI_LANDMARKS.coffee.x;
  game.player.y = PHIENG_LOI_LANDMARKS.coffee.y;
  assert.ok(call(game).some((event) => event.type === 'power-start' && event.power === 'coffee'));
}

{
  const game = createGame('high', false, null, { random: () => 0.8 });
  stabilize(game);
  Object.assign(game.hanu, { mode: 'delivering', carryingFood: true, promiseStage: 2, deliveryCycle: 2 });
  Object.assign(game.heesun, { mode: 'chasing', target: 'player', chaseTimeoutAt: 99_999 });
  game.recurringFlags.add('hanu-delivery-started');
  game.absurdityScore = 19;
  game.absurdityLevel = 4;
  game.phaOiCooldownStartedAt = game.elapsed;
  game.phaOiCooldownUntil = game.elapsed + 4;
  game.director.delayedQueue.push({ id: 'chicken-crossing', dueAt: game.elapsed + 5, chainDepth: 1, sourceId: 'delayed-chicken-crossing' });
  const save = createSave(game);
  assert.equal(save.version, GAME_SAVE_VERSION);
  const restored = createGame('low', true, save, { random: () => 0.8 });
  assert.equal(restored.hanu.carryingFood, true);
  assert.equal(restored.heesun.mode, 'chasing');
  assert.equal(restored.absurdityLevel, 4);
  assert.ok(restored.recurringFlags.has('hanu-delivery-started'));
  assert.ok(restored.phaOiCooldownUntil - restored.elapsed > 3.9);
  assert.equal(restored.director.delayedQueue.length, 0);
  save.version = 1;
  save.player = { x: 1_330, y: 720, facingX: 1, facingY: 0 };
  const legacy = createGame('high', false, save);
  assert.ok(isWalkable(legacy.player.x, legacy.player.y));
}

{
  const game = createGame('high', false);
  stabilize(game);
  game.player.x = PHIENG_LOI_LANDMARKS.exit.x;
  game.player.y = PHIENG_LOI_LANDMARKS.exit.y;
  assert.ok(tick(game, 0.02).some(({ type }) => type === 'exit'));
  assert.equal(game.complete, true);
}

{
  const game = createGame('high', false, null, { random: () => 0.8 });
  stabilize(game);
  for (let index = 0; index < 120; index += 1) {
    game.random = sequenceRandom([0.2, 0.8, 0, 0.5], 0.7);
    call(game);
    game.director.activeMicro = [];
    game.elapsed += 0.03;
  }
  assert.ok(game.particles.length <= 145);
  assert.ok(game.dialogueQueue.length <= 5);
  assert.ok(game.director.activeMicro.length <= DIRECTOR_LIMITS.activeMicro);
  assert.ok(game.director.delayedQueue.length <= DIRECTOR_LIMITS.delayedQueue);
}

assert.equal(new Set(PHIENG_LOI_AUDIO_CUES.map(({ id }) => id)).size, PHIENG_LOI_AUDIO_CUES.length);
for (const id of ['pha_oi_normal', 'pha_oi_long', 'pha_oi_panicked', 'pha_oi_whisper', 'pha_oi_silly']) {
  assert.ok(PHIENG_LOI_AUDIO_CUES.some((cue) => cue.id === id), `${id} must have a recording slot`);
}
PHIENG_LOI_AUDIO_CUES.forEach((cue) => {
  assert.equal(cue.files.length, cue.takes);
  assert.ok(cue.delivery && cue.processing && cue.trigger);
  assert.ok(cue.durationSeconds[0] > 0 && cue.durationSeconds[1] >= cue.durationSeconds[0]);
});

console.log('Phiêng Lơi simulation passed: 5s normal / 60s TRUE NOTHING cooldown, A-M choreography QA, motion controller, bubble allowlist, karaoke restore, capture seating, chains, save and bounded runtime.');
