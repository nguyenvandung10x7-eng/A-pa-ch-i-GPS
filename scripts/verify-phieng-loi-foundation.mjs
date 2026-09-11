import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

// This slice has no runtime imports. Use the existing TypeScript dependency so
// verification does not depend on Node's experimental TypeScript loader.
const fileName = new URL('../src/experiences/phieng-loi/worldLayout.ts', import.meta.url);
const source = readFileSync(fileName, 'utf8');
assert.doesNotMatch(source, /^\s*import\s/m, 'Foundation must remain independent of the game engine');
const { outputText, diagnostics = [] } = ts.transpileModule(source, {
  fileName: 'worldLayout.ts',
  reportDiagnostics: true,
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
});
assert.equal(diagnostics.filter((item) => item.category === ts.DiagnosticCategory.Error).length, 0);
const {
  PHIENG_LOI_WORLD: world,
  PHIENG_LOI_LANDMARKS: landmarks,
  HANU_ROUTE: hanuRoute,
  WORLD_OCCLUDERS: occluders,
  isWalkable,
  terrainAt,
  nearestWalkablePoint,
  navigationTarget,
  migrateLegacyWorldPoint,
} = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);

let checks = 0;
const check = (name, run) => {
  run();
  checks += 1;
  console.log(`PASS ${name}`);
};
const finitePoint = (point) => Number.isFinite(point.x) && Number.isFinite(point.y);

check('existing world and viewport dimensions are preserved', () => {
  assert.deepEqual([world.width, world.height, world.viewWidth, world.viewHeight], [2400, 1350, 640, 360]);
});
check('existing playable landmarks remain reachable', () => {
  for (const name of ['playerStart', 'feastStart', 'feastSecond', 'feastField', 'chief', 'stream', 'bridge', 'vuongMeStage', 'gate', 'domino', 'exit', 'squash', 'coffee', 'macadamia']) {
    assert.ok(isWalkable(landmarks[name].x, landmarks[name].y), name);
  }
});
check('all existing HANU route points stay on walkable corridors', () => {
  hanuRoute.forEach((point, index) => assert.ok(isWalkable(point.x, point.y), `waypoint ${index}`));
});
check('bridge is wood and nearby off-bridge water is blocked', () => {
  assert.equal(terrainAt(landmarks.bridge.x, landmarks.bridge.y), 'wood');
  assert.equal(terrainAt(landmarks.bridge.x, landmarks.bridge.y - 105), 'blocked');
});
check('off-road positions project back to the existing road network', () => {
  for (const point of [{ x: 0, y: 0 }, { x: 2400, y: 1350 }, { x: -100, y: -100 }]) {
    const restored = nearestWalkablePoint(point);
    assert.ok(finitePoint(restored));
    assert.ok(isWalkable(restored.x, restored.y));
  }
  const point = { ...landmarks.playerStart };
  const restored = nearestWalkablePoint(point);
  assert.deepEqual(restored, point);
  assert.notEqual(restored, point, 'caller input must not be returned by reference');
});
check('authored navigation returns finite walkable next points', () => {
  for (const [from, to] of [[landmarks.playerStart, landmarks.exit], [landmarks.feastField, landmarks.bridge], [landmarks.bridge, landmarks.chief]]) {
    const target = navigationTarget(from, to);
    assert.ok(finitePoint(target));
    assert.ok(isWalkable(target.x, target.y));
  }
  assert.deepEqual(navigationTarget(landmarks.playerStart, landmarks.playerStart), landmarks.playerStart);
});
check('legacy coordinate conversion remains unchanged', () => {
  const legacy = { x: 840, y: 460 };
  assert.deepEqual(migrateLegacyWorldPoint(legacy), { x: 1200, y: 675 });
  assert.deepEqual(legacy, { x: 840, y: 460 });
});
check('foreground crop records remain finite and nonempty', () => {
  for (const item of occluders) {
    assert.ok(finitePoint(item));
    assert.ok(item.width > 0 && item.height > 0 && Number.isFinite(item.depthY));
  }
});
console.log(`Phiêng Lơi foundation: ${checks} checks passed. No gameplay or artwork has been activated.`);
