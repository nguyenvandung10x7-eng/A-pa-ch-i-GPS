import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const runtimeFile = new URL('../src/experiences/phieng-loi/runtime.ts', import.meta.url);
const runtimeSource = readFileSync(runtimeFile, 'utf8');
assert.doesNotMatch(runtimeSource, /^\s*import\s/m, 'Runtime must stay independent of gameplay modules');
const { outputText, diagnostics = [] } = ts.transpileModule(runtimeSource, {
  fileName: 'runtime.ts',
  reportDiagnostics: true,
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
});
assert.equal(diagnostics.filter((item) => item.category === ts.DiagnosticCategory.Error).length, 0);

const {
  MAX_SIMULATION_STEP_SECONDS,
  MAX_VISIBLE_FRAME_CATCH_UP_SECONDS,
  clearPhiengLoiInput,
  createPhiengLoiFrameLoop,
  createPhiengLoiInputState,
  updatePhiengLoiKey,
} = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);

let checks = 0;
const check = (name, run) => {
  run();
  checks += 1;
  console.log(`PASS ${name}`);
};

check('movement keys update only the authored movement input', () => {
  const input = createPhiengLoiInputState();
  assert.equal(updatePhiengLoiKey(input, 'ArrowLeft', true), true);
  assert.equal(updatePhiengLoiKey(input, 'W', true), true);
  assert.equal(updatePhiengLoiKey(input, 'q', true), false);
  assert.deepEqual(input, { left: true, right: false, up: true, down: false, moveX: 0, moveY: 0 });
  assert.equal(updatePhiengLoiKey(input, 'a', false), true);
  assert.equal(updatePhiengLoiKey(input, 'w', false), true);
  assert.equal(input.left, false);
  assert.equal(input.up, false);
});

check('input reset releases keyboard and joystick state', () => {
  const input = { left: true, right: true, up: true, down: true, moveX: .7, moveY: -.4 };
  clearPhiengLoiInput(input);
  assert.deepEqual(input, createPhiengLoiInputState());
});

check('frame loop uses bounded simulation steps', () => {
  let now = 0;
  let nextFrameId = 0;
  const pending = new Map();
  const cancelled = [];
  const steps = [];
  const scheduler = {
    now: () => now,
    requestFrame: (callback) => {
      nextFrameId += 1;
      pending.set(nextFrameId, callback);
      return nextFrameId;
    },
    cancelFrame: (frameId) => {
      cancelled.push(frameId);
      pending.delete(frameId);
    },
  };
  const runFrame = (time) => {
    now = time;
    const [frameId, callback] = pending.entries().next().value;
    pending.delete(frameId);
    callback(time);
  };

  const loop = createPhiengLoiFrameLoop({ onStep: (delta) => steps.push(delta), scheduler });
  assert.equal(loop.getState(), 'idle');
  loop.start();
  assert.equal(loop.getState(), 'running');
  assert.equal(pending.size, 1);
  runFrame(100);
  assert.ok(steps.every((delta) => delta <= MAX_SIMULATION_STEP_SECONDS));
  assert.ok(Math.abs(steps.reduce((total, delta) => total + delta, 0) - .1) < 1e-9);
  assert.equal(pending.size, 1);

  const stepCount = steps.length;
  runFrame(5_000);
  const catchUp = steps.slice(stepCount).reduce((total, delta) => total + delta, 0);
  assert.ok(Math.abs(catchUp - MAX_VISIBLE_FRAME_CATCH_UP_SECONDS) < 1e-9);

  loop.pause();
  assert.equal(loop.getState(), 'paused');
  assert.equal(pending.size, 0);
  assert.ok(cancelled.length > 0);
  loop.resume();
  assert.equal(loop.getState(), 'running');
  assert.equal(pending.size, 1);
  loop.dispose();
  assert.equal(loop.getState(), 'disposed');
  assert.equal(pending.size, 0);
  loop.resume();
  assert.equal(loop.getState(), 'disposed');
});

check('page owns input listeners, visibility pause, and teardown', () => {
  const pageSource = readFileSync(new URL('../src/pages/PhiengLoiGamePage.tsx', import.meta.url), 'utf8');
  assert.match(pageSource, /window\.addEventListener\('keydown'/);
  assert.match(pageSource, /window\.removeEventListener\('keydown'/);
  assert.match(pageSource, /window\.addEventListener\('blur', clearInput\)/);
  assert.match(pageSource, /document\.addEventListener\('visibilitychange'/);
  assert.match(pageSource, /window\.addEventListener\('pagehide'/);
  assert.match(pageSource, /runtime\.dispose\(\)/);
  assert.match(pageSource, /setPointerCapture/);
  assert.match(pageSource, /releasePointerCapture/);
  assert.doesNotMatch(pageSource, /gameEngine|HeeSun|HANU|PHÀ ƠI|PHA_OI|audio|visualAssets|worldLayout/);
});

check('application exposes only the direct Phiêng Lơi route in this slice', () => {
  const appSource = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
  assert.match(appSource, /normalizedPathname === '\/phieng-loi'/);
  assert.match(appSource, /<PhiengLoiGamePage language=\{language\} \/>/);
});

console.log(`Phiêng Lơi runtime: ${checks} checks passed. No actor, map, audio, or event has been activated.`);
