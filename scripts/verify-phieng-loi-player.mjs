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
const visualAssetsSource = readFileSync(new URL('../src/experiences/phieng-loi/visualAssets.ts', import.meta.url), 'utf8');
const playerOutput = transpile(playerSource, 'playerMotion.ts').replace(
  /from ['"]\.\/worldLayout['"]/,
  `from '${worldModuleUrl}'`,
);
const visualAssetsOutput = transpile(visualAssetsSource, 'visualAssets.ts');
const playerModule = await import(`data:text/javascript;base64,${Buffer.from(playerOutput).toString('base64')}`);
const visualAssetsModule = await import(`data:text/javascript;base64,${Buffer.from(visualAssetsOutput).toString('base64')}`);
const worldModule = await import(worldModuleUrl);

const {
  createPhiengLoiPlayerState,
  directionalViewForVelocity,
  getPhiengLoiPlayerVisual,
  playerSideWalkVariantFromSearch,
  stepPhiengLoiPlayer,
} = playerModule;
const { playerAtlasFrameStyle } = visualAssetsModule;
const { PHIENG_LOI_WORLD, isWalkable } = worldModule;

const pngMetadata = (binary) => {
  assert.equal(binary.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', 'PNG signature');
  assert.equal(binary.readUInt32BE(8), 13, 'PNG IHDR size');
  assert.equal(binary.toString('ascii', 12, 16), 'IHDR', 'PNG first chunk');
  return {
    width: binary.readUInt32BE(16),
    height: binary.readUInt32BE(20),
    bitDepth: binary[24],
    colorType: binary[25],
  };
};

const losslessWebpMetadata = (binary) => {
  assert.equal(binary.toString('ascii', 0, 4), 'RIFF', 'WebP RIFF signature');
  assert.equal(binary.toString('ascii', 8, 12), 'WEBP', 'WebP container signature');
  assert.equal(binary.readUInt32LE(4), binary.length - 8, 'WebP RIFF size');

  let offset = 12;
  while (offset + 8 <= binary.length) {
    const chunkType = binary.toString('ascii', offset, offset + 4);
    const chunkSize = binary.readUInt32LE(offset + 4);
    const payloadOffset = offset + 8;
    assert.ok(payloadOffset + chunkSize <= binary.length, `${chunkType} chunk bounds`);
    if (chunkType === 'VP8L') {
      assert.ok(chunkSize >= 5, 'VP8L header size');
      assert.equal(binary[payloadOffset], 0x2f, 'VP8L signature byte');
      const dimensions = binary.readUInt32LE(payloadOffset + 1);
      return {
        width: (dimensions & 0x3fff) + 1,
        height: ((dimensions >>> 14) & 0x3fff) + 1,
        alphaUsed: ((dimensions >>> 28) & 1) === 1,
        version: (dimensions >>> 29) & 0x7,
      };
    }
    offset = payloadOffset + chunkSize + (chunkSize % 2);
  }
  assert.fail('WebP must contain a lossless VP8L chunk');
};

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
    view: 'down', motion: 'idle', sideWalkVariant: 'default',
    cameraX: state.camera.x, cameraY: state.camera.y,
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

check('alien_shorts selects only the dedicated eight-frame side-walk atlas without changing defaults', () => {
  const defaultState = createPhiengLoiPlayerState();
  defaultState.player.view = 'side';
  defaultState.player.motion = 'walk';
  defaultState.player.framePhase = 3.75;
  assert.deepEqual(
    {
      atlas: getPhiengLoiPlayerVisual(defaultState).atlas,
      frame: getPhiengLoiPlayerVisual(defaultState).frame,
      sideWalkVariant: getPhiengLoiPlayerVisual(defaultState).sideWalkVariant,
    },
    { atlas: 'side', frame: 3, sideWalkVariant: 'default' },
  );

  const state = createPhiengLoiPlayerState(false, 'alien_shorts');
  state.player.view = 'side';
  state.player.motion = 'walk';
  assert.equal(getPhiengLoiPlayerVisual(state).atlas, 'alien_shorts_side_walk');

  state.player.motion = 'run';
  assert.equal(getPhiengLoiPlayerVisual(state).atlas, 'side');
  state.player.motion = 'walk';
  state.player.view = 'down';
  assert.equal(getPhiengLoiPlayerVisual(state).atlas, 'down');
});

check('alien_shorts atlas maps the exact eight cells of its 4x2 grid', () => {
  const expectedPositions = [
    '0% 0%',
    '33.33333333333333% 0%',
    '66.66666666666666% 0%',
    '100% 0%',
    '0% 100%',
    '33.33333333333333% 100%',
    '66.66666666666666% 100%',
    '100% 100%',
  ];
  expectedPositions.forEach((backgroundPosition, frame) => {
    assert.deepEqual(playerAtlasFrameStyle('alien_shorts_side_walk', frame), {
      backgroundImage: 'url(/images/phieng-loi/player-alien-shorts-walk-side-v1.webp)',
      backgroundPosition,
      backgroundRepeat: 'no-repeat',
      backgroundSize: '400% 200%',
      aspectRatio: 384 / 341,
    });
  });
});

check('alien_shorts side walk wraps F7 to F0 and honors reduced motion', () => {
  const state = createPhiengLoiPlayerState(false, 'alien_shorts');
  state.player.view = 'side';
  state.player.motion = 'walk';
  state.player.framePhase = 7.999;
  assert.equal(getPhiengLoiPlayerVisual(state).frame, 7);
  state.player.framePhase = 8;
  assert.equal(getPhiengLoiPlayerVisual(state).frame, 0);

  const reduced = createPhiengLoiPlayerState(true, 'alien_shorts');
  reduced.player.view = 'side';
  reduced.player.motion = 'walk';
  reduced.player.framePhase = 7.999;
  assert.equal(getPhiengLoiPlayerVisual(reduced).frame, 0);
});

check('alien_shorts side walk preserves the existing facing mirror contract', () => {
  const state = createPhiengLoiPlayerState(false, 'alien_shorts');
  state.player.view = 'side';
  state.player.motion = 'walk';
  state.player.framePhase = 5.25;
  state.player.facing = 1;
  const right = getPhiengLoiPlayerVisual(state);
  state.player.facing = -1;
  const left = getPhiengLoiPlayerVisual(state);
  assert.deepEqual(
    { atlas: left.atlas, frame: left.frame, facing: left.facing },
    { atlas: right.atlas, frame: right.frame, facing: -1 },
  );

  const sceneSource = readFileSync(new URL('../src/experiences/phieng-loi/PhiengLoiPlayerScene.tsx', import.meta.url), 'utf8');
  const cssSource = readFileSync(new URL('../src/phieng-loi.css', import.meta.url), 'utf8');
  assert.match(sceneSource, /--sprite-flip', visual\.facing < 0 \? '-1' : '1'/);
  assert.match(cssSource, /scaleX\(var\(--sprite-flip, 1\)\)/);
});

check('alien_shorts query parsing accepts only the exact key and value', () => {
  assert.equal(playerSideWalkVariantFromSearch('?playerMode=alien_shorts'), 'alien_shorts');
  assert.equal(playerSideWalkVariantFromSearch('?other=1&playerMode=alien_shorts'), 'alien_shorts');
  assert.equal(playerSideWalkVariantFromSearch('?playerMode=normal'), 'default');
  assert.equal(playerSideWalkVariantFromSearch('?playerMode=alien-shorts'), 'default');
  assert.equal(playerSideWalkVariantFromSearch('?playerMode=ALIEN_SHORTS'), 'default');
  assert.equal(playerSideWalkVariantFromSearch('?playerMode=alien_shorts_extra'), 'default');
  assert.equal(playerSideWalkVariantFromSearch('?playermode=alien_shorts'), 'default');
  assert.equal(playerSideWalkVariantFromSearch(''), 'default');
});

check('alien_shorts source frames are 384x341 8-bit RGBA and the 4x2 atlas is lossless with alpha', () => {
  const frames = {
    'f0-contact-a.png': '6b56b561fc2b4bdc7067e20dc0032a35c22f964d08de2492e94cd8b2891644f3',
    'f1-down-a.png': '818ffb693ef41ef61ee64e3b1c673c9292e1b6d9618dab7cd43f3426843bc835',
    'f2-passing-a-to-b.png': '43352627626663eeb22c3c46dfd7ed14d66cde9971c27448de660885b4ddb4e8',
    'f3-up-a-to-b.png': '042485891903ffa88f00eb47534246e0aaf3e623f3ea8bdd933bf9c995ad1f31',
    'f4-contact-b.png': '0d6e347ae8ca3ab9cb6179f4078a4f83cf3acae303e5e11e997849e9acedc4cc',
    'f5-down-b.png': 'd20a4f995601e56a44fd514da44c907cba00fc8a3b8e2f6094f1c1f6bad3ce84',
    'f6-passing-b-to-a.png': '6303a40654d41da12f677dad63297f02a0dfa6f377ed011911cf2aeb6968217b',
    'f7-up-b-to-a.png': 'c3c602b496b0bc30a1ec44ce498335609d34fb4bd2868fa7c12641b793ac0c86',
  };
  Object.entries(frames).forEach(([name, hash]) => {
    const binary = readFileSync(new URL(`../docs/art-direction/studies/alien-shorts-walk-side-v1/frames/${name}`, import.meta.url));
    assert.equal(createHash('sha256').update(binary).digest('hex'), hash, `${name} hash`);
    assert.deepEqual(pngMetadata(binary), {
      width: 384,
      height: 341,
      bitDepth: 8,
      colorType: 6,
    }, name);
  });

  const atlas = readFileSync(new URL('../public/images/phieng-loi/player-alien-shorts-walk-side-v1.webp', import.meta.url));
  assert.equal(
    createHash('sha256').update(atlas).digest('hex'),
    'f31bf1849228fdb19b0342b5985827522821ba589609b4da833e4ac5bbee060d',
    'alien_shorts atlas hash',
  );
  assert.deepEqual(losslessWebpMetadata(atlas), {
    width: 1_536,
    height: 682,
    alphaUsed: true,
    version: 0,
  });

  const provenance = readFileSync(new URL('../docs/asset-provenance.md', import.meta.url), 'utf8');
  assert.match(
    provenance,
    /player-alien-shorts-walk-side-v1\.webp.*UNVERIFIED.*f31bf1849228fdb19b0342b5985827522821ba589609b4da833e4ac5bbee060d/,
  );
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
