import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import ts from 'typescript';

const read = (file) => readFileSync(file, 'utf8');
const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));
for (const [name, version, bucket] of [
  ['phaser', '4.2.1', 'dependencies'], ['@playwright/test', '1.63.0', 'devDependencies'],
]) {
  assert.equal(pkg[bucket][name], version);
  assert.equal(lock.packages[''][bucket][name], version);
  assert.equal(lock.packages['node_modules/' + name].version, version);
}
assert.equal(JSON.parse(read('tsconfig.json')).compilerOptions.strict, true);
assert.match(read('src/main.tsx'), /<React.StrictMode>/);
assert.doesNotMatch(pkg.scripts.verify, /verify:phieng-loi:(foundation|runtime)/);
assert.match(pkg.scripts.verify, /verify:pl00/);
assert.match(read('.github/workflows/verify.yml'), /npm run test:pl00/);
assert.match(read('netlify.toml'), /NODE_VERSION\s*=\s*"22"/);
assert.match(read('src/App.tsx'), /import\('\.\/pages\/PhiengLoiV2Page'\)/);
assert.doesNotMatch(read('src/App.tsx'), /PhiengLoiGamePage/);

const root = resolve('src/game/phieng-loi');
const entry = resolve('src/pages/PhiengLoiV2Page.tsx');
const visited = new Set();
const externals = new Set(['react', 'react-router-dom', 'phaser']);
const options = { moduleResolution: ts.ModuleResolutionKind.Bundler, resolveJsonModule: true };

function visit(file) {
  if (visited.has(file)) return;
  assert.ok(file === entry || file.startsWith(root + '/'), 'Import escapes remake boundary: ' + relative(process.cwd(), file));
  visited.add(file);
  if (file.endsWith('.css')) return;
  const text = read(file);
  assert.doesNotMatch(text, /@ts-ignore|@ts-nocheck|requestAnimationFrame|cancelAnimationFrame/);
  assert.doesNotMatch(text, /HeeSun|HS_REVEAL|worldLayout|PhiengLoiGamePage|PHÀ ƠI/);
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
  const follow = (specifier) => {
    if (!specifier.startsWith('.')) {
      assert.ok(externals.has(specifier), 'Unexpected dependency: ' + specifier);
      return;
    }
    if (specifier.endsWith('.css')) {
      const path = resolve(dirname(file), specifier);
      assert.ok(existsSync(path));
      visit(path);
      return;
    }
    const resolved = ts.resolveModuleName(specifier, file, options, ts.sys).resolvedModule;
    assert.ok(resolved, 'Unresolved import: ' + specifier);
    visit(resolve(resolved.resolvedFileName));
  };
  const walk = (node) => {
    assert.notEqual(node.kind, ts.SyntaxKind.AnyKeyword, 'Explicit any in ' + file);
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier) {
      assert.ok(ts.isStringLiteral(node.moduleSpecifier));
      follow(node.moduleSpecifier.text);
    }
    if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
      assert.equal(node.arguments.length, 1);
      assert.ok(ts.isStringLiteral(node.arguments[0]), 'Dynamic import must have an auditable literal');
      follow(node.arguments[0].text);
    }
    ts.forEachChild(node, walk);
  };
  walk(source);
}
visit(entry);
assert.match(read('src/game/phieng-loi/assets.ts'), /FOUNDATION_ASSETS[^\n]*Object.freeze\(\[\]\)/);
assert.doesNotMatch(read('src/game/phieng-loi/createGame.ts'), /\bphysics\s*:|\bplugins\s*:/);
assert.match(read('src/game/phieng-loi/createGame.ts'), /noAudio:\s*true/);
if (existsSync('public/assets/phieng-loi-v2')) {
  assert.equal(readdirSync('public/assets/phieng-loi-v2').length, 0, 'PL-00 must not ship artwork');
}
console.log('PASS PL-00 pins, strictness, route, pipeline, empty assets, config, and transitive import boundary (' + visited.size + ' files).');
console.log('Browser lifecycle and device QA are separate gates; this script does not prove them.');
