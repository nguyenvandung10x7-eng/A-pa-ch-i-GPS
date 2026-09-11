import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const transpile = (source, fileName) => {
  const { outputText, diagnostics = [] } = ts.transpileModule(source, {
    fileName,
    reportDiagnostics: true,
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
  });
  assert.equal(diagnostics.filter((item) => item.category === ts.DiagnosticCategory.Error).length, 0);
  return outputText;
};

const worldSource = readFileSync(new URL('../src/experiences/phieng-loi/worldLayout.ts', import.meta.url), 'utf8');
const worldModuleUrl = `data:text/javascript;base64,${Buffer.from(transpile(worldSource, 'worldLayout.ts')).toString('base64')}`;
const playerSource = readFileSync(new URL('../src/experiences/phieng-loi/playerMotion.ts', import.meta.url), 'utf8');
const playerOutput = transpile(playerSource, 'playerMotion.ts').replace(
  /from ['"]\.\/worldLayout['"]/,
  `from '${worldModuleUrl}'`,
);
const playerModule = await import(`data:text/javascript;base64,${Buffer.from(playerOutput).toString('base64')}`);
const worldModule = await import(worldModuleUrl);

const {
  createPhiengLoiPlayerState,
  directionalViewForVelocity,
  getPhiengLoiPlayerVisual,
  stepPhiengLoiPlayer,
} = playerModule;
const { PHIENG_LOI_WORLD, isWalkable } = worldModule;

const emptyInput = () => ({ left: false, right: false, up: false, down: false, moveX: 0, moveY: 0 });
const stepFor = (state, input, seconds, motions = []) => {
  const step = 0.016;
  for (let elapsed = 0; elapsed < seconds; elapsed += step) {
    stepPhiengLoiPlayer(state, input, step);
    motions.push(state.player.motion);
  }
};

let checks = 0;
const check = (name, run) => {
  run();
  checks += 1;
  console.log(`PASS ${name}`);
};

check('player starts at the existing walkable landmark with a bounded camera', () => {
  const state = createPhiengLoiPlayerState();
  assert.ok(isWalkable(state.player.x, state.player.y, 8));
  assert.ok(state.camera.x >= 0 && state.camera.x <= PHIENG_LOI_WORLD.width - PHIENG_LOI_WORLD.viewWidth);
  assert.ok(state.camera.y >= 0 && state.camera.y <= PHIENG_LOI_WORLD.height - PHIENG_LOI_WORLD.viewHeight);
});

check('distance-driven movement reaches walk and run without leaving authored terrain', () => {
  const walk = createPhiengLoiPlayerState();
  stepFor(walk, { ...emptyInput(), moveX: 0.32, moveY: 0.08 }, 0.8);
  assert.equal(walk.player.motion, 'walk');
  assert.ok(walk.player.framePhase > 0);
  assert.ok(isWalkable(walk.player.x, walk.player.y, 8));

  const run = createPhiengLoiPlayerState();
  stepFor(run, { ...emptyInput(), moveX: 0.96, moveY: 0.22 }, 1.2);
  assert.equal(run.player.motion, 'run');
  assert.ok(run.player.x > walk.player.x);
  assert.ok(isWalkable(run.player.x, run.player.y, 8));
});

check('turn and stop transitions settle cleanly', () => {
  const state = createPhiengLoiPlayerState();
  stepFor(state, { ...emptyInput(), moveX: 0.95, moveY: 0.2 }, 0.8);
  const motions = [];
  stepFor(state, { ...emptyInput(), moveX: -0.95, moveY: -0.2 }, 0.45, motions);
  assert.ok(motions.includes('turn'));
  assert.equal(state.player.facing, -1);
  stepFor(state, emptyInput(), 0.8, motions);
  assert.ok(motions.includes('stop'));
  assert.equal(state.player.motion, 'idle');
});

check('directional views retain the source hysteresis contract', () => {
  assert.equal(directionalViewForVelocity('down', 100, 0), 'side');
  assert.equal(directionalViewForVelocity('side', 0, -100), 'up');
  assert.equal(directionalViewForVelocity('up', 0, 100), 'down');
  assert.equal(directionalViewForVelocity('side', 2, 1), 'side');
});

check('camera follows Player and remains inside the existing world', () => {
  const state = createPhiengLoiPlayerState();
  const input = { ...emptyInput(), moveX: 0.95, moveY: 0.28 };
  stepFor(state, input, 4.2);
  assert.ok(state.camera.x > 0);
  assert.ok(state.camera.x <= PHIENG_LOI_WORLD.width - PHIENG_LOI_WORLD.viewWidth);
  assert.ok(state.camera.y >= 0 && state.camera.y <= PHIENG_LOI_WORLD.height - PHIENG_LOI_WORLD.viewHeight);
});

check('visual mapping covers idle, walk, run, turn and stop atlases', () => {
  const state = createPhiengLoiPlayerState(true);
  assert.deepEqual(getPhiengLoiPlayerVisual(state), {
    atlas: 'actions', frame: 0, width: 82,
    x: state.player.x, y: state.player.y, facing: 1,
    scale: 0.88 + (state.player.y / PHIENG_LOI_WORLD.height) * 0.2,
    view: 'down', motion: 'idle', cameraX: state.camera.x, cameraY: state.camera.y,
  });
  state.player.motion = 'walk';
  assert.equal(getPhiengLoiPlayerVisual(state).frame, 0);
  state.player.motion = 'run';
  assert.equal(getPhiengLoiPlayerVisual(state).frame, 8);
  state.player.motion = 'turn';
  assert.equal(getPhiengLoiPlayerVisual(state).frame, 5);
  state.player.motion = 'stop';
  assert.equal(getPhiengLoiPlayerVisual(state).frame, 6);
});

check('S03 keeps the approved snapshot binaries exact and explicitly unverified', () => {
  const expected = {
    'village-world-v2.webp': '9116766cc5a88af35ad5cf90a4afbe80111fef5c3f6b10c7f2c6117ad738cfd3',
    'player-locomotion-side-v2.webp': 'ca2dcc6362dd1b6219a52420df9d06725b97633a3e0f832e9ae5f4ec88cf402f',
    'player-locomotion-down-v2.webp': '3470b27ba531b048f297a69f0a9dde098c4dceb7aaf588f30c950086b48345ee',
    'player-locomotion-up-v2.webp': 'd849d1d6ec7fa4e8bd90c4b1fe4e24885baf1176cc7b1750731132b11cf9b967',
    'player-actions-v2.webp': '192dea52e337a24ca6208edaf54a1b7246608537e7ec25e85481739a18bf7f9f',
  };
  const provenance = readFileSync(new URL('../docs/asset-provenance.md', import.meta.url), 'utf8');
  for (const [name, hash] of Object.entries(expected)) {
    const binary = readFileSync(new URL(`../public/images/phieng-loi/${name}`, import.meta.url));
    assert.equal(createHash('sha256').update(binary).digest('hex'), hash, name);
    assert.match(provenance, new RegExp(`${name.replaceAll('.', '\\.')}.*UNVERIFIED`));
  }
});

check('foot anchor is fixed and S03 does not import NPC, event, call, or audio systems', () => {
  const sceneSource = readFileSync(new URL('../src/experiences/phieng-loi/PhiengLoiPlayerScene.tsx', import.meta.url), 'utf8');
  const cssSource = readFileSync(new URL('../src/phieng-loi.css', import.meta.url), 'utf8');
  const pageSource = readFileSync(new URL('../src/pages/PhiengLoiGamePage.tsx', import.meta.url), 'utf8');
  assert.match(cssSource, /translate\(-50%, -92%\)/);
  assert.match(cssSource, /transform-origin: 50% 92%/);
  assert.match(sceneSource, /visual\.x\.toFixed\(2\).*visual\.y\.toFixed\(2\)/s);
  assert.doesNotMatch(`${playerSource}\n${sceneSource}\n${pageSource}`, /gameEngine|HeeSun|HANU|PHA_OI|PHÀ ƠI|absurdityDirector|audioDirector/);
});

console.log(`Phiêng Lơi Player: ${checks} checks passed. No NPC, event, PHÀ ƠI, or audio system was imported.`);
