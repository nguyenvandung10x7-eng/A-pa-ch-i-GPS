import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, sep } from 'node:path';
import ts from 'typescript';

const musicPath = 'src/data/music.ts';
const musicSource = readFileSync(musicPath, 'utf8');
const ledger = readFileSync('docs/audio-provenance.md', 'utf8');
const publicAudioRoot = 'public/audio';
const runtimeCatalogNames = new Set(['MUSIC_TRACKS', 'BOOK_MUSIC_TRACKS']);

const normalizePath = (path) => path.split(sep).join('/');

const collectMp3Files = (directory) => readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
  const absolute = join(directory, entry.name);
  if (entry.isDirectory()) return collectMp3Files(absolute);
  return entry.isFile() && entry.name.toLowerCase().endsWith('.mp3')
    ? [normalizePath(absolute)]
    : [];
});

const sourceFile = ts.createSourceFile(musicPath, musicSource, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
const failures = [];
const runtimeFileNames = [];
const foundCatalogs = new Set();

const propertyNameText = (name) => {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name)) return name.text;
  if (ts.isComputedPropertyName(name) && (ts.isStringLiteral(name.expression) || ts.isNoSubstitutionTemplateLiteral(name.expression))) {
    return name.expression.text;
  }
  return null;
};

const unwrapObjectFreeze = (node) => {
  if (!ts.isCallExpression(node) || node.arguments.length !== 1) return null;
  if (!ts.isPropertyAccessExpression(node.expression)) return null;
  if (!ts.isIdentifier(node.expression.expression) || node.expression.expression.text !== 'Object') return null;
  if (node.expression.name.text !== 'freeze') return null;
  return node.arguments[0];
};

for (const statement of sourceFile.statements) {
  if (!ts.isVariableStatement(statement)) continue;

  for (const declaration of statement.declarationList.declarations) {
    if (!ts.isIdentifier(declaration.name) || !runtimeCatalogNames.has(declaration.name.text)) continue;

    const catalogName = declaration.name.text;
    foundCatalogs.add(catalogName);

    const frozenCatalog = declaration.initializer ? unwrapObjectFreeze(declaration.initializer) : null;
    if (!frozenCatalog || !ts.isArrayLiteralExpression(frozenCatalog)) {
      failures.push(`${catalogName} must be declared as Object.freeze([...]) so the runtime catalog is immutable.`);
      continue;
    }

    for (const [index, element] of frozenCatalog.elements.entries()) {
      const frozenEntry = unwrapObjectFreeze(element);
      if (!frozenEntry || !ts.isObjectLiteralExpression(frozenEntry)) {
        failures.push(`${catalogName}[${index}] must be declared as Object.freeze({...}) so each runtime track is immutable.`);
        continue;
      }

      if (frozenEntry.properties.some((property) => ts.isSpreadAssignment(property))) {
        failures.push(`${catalogName}[${index}] must not contain spread assignments because they can override audited properties such as fileName.`);
        continue;
      }

      const unresolvedComputedProperty = frozenEntry.properties.find((property) => {
        if (!('name' in property) || !property.name || !ts.isComputedPropertyName(property.name)) return false;
        return propertyNameText(property.name) === null;
      });

      if (unresolvedComputedProperty) {
        failures.push(`${catalogName}[${index}] must not contain computed property names that cannot be resolved statically.`);
        continue;
      }

      const fileNameProperties = frozenEntry.properties.filter((property) => {
        if (!ts.isPropertyAssignment(property)) return false;
        return propertyNameText(property.name) === 'fileName';
      });

      if (fileNameProperties.length !== 1) {
        failures.push(`${catalogName}[${index}] must contain exactly one directly auditable fileName property.`);
        continue;
      }

      const initializer = fileNameProperties[0].initializer;
      if (!ts.isStringLiteral(initializer) && !ts.isNoSubstitutionTemplateLiteral(initializer)) {
        failures.push(`${catalogName}[${index}].fileName must be a direct string literal; expressions are not allowed.`);
        continue;
      }

      const fileName = initializer.text;
      if (!fileName.toLowerCase().endsWith('.mp3')) {
        failures.push(`${catalogName}[${index}].fileName must end in .mp3: ${fileName}`);
        continue;
      }

      runtimeFileNames.push(fileName);
    }
  }
}

for (const catalogName of runtimeCatalogNames) {
  if (!foundCatalogs.has(catalogName)) failures.push(`Could not locate runtime audio catalog ${catalogName} in ${musicPath}.`);
}

const runtimePaths = new Set(runtimeFileNames.map((fileName) => `public/audio/${fileName}`));
const publicMp3Paths = new Set(collectMp3Files(publicAudioRoot));
const ledgerRows = [...ledger.matchAll(/^\| `([^`]+\.mp3)` \|[^\n]*\| (CLEARED|UNVERIFIED|BLOCKED) \|/gim)];
const ledgerStatuses = new Map(ledgerRows.map((match) => [match[1], match[2]]));

for (const path of runtimePaths) {
  if (!existsSync(path)) failures.push(`Runtime audio is missing from public/: ${path}`);
  if (!ledgerStatuses.has(path)) failures.push(`Runtime audio is missing from docs/audio-provenance.md: ${path}`);
}

for (const path of publicMp3Paths) {
  if (!ledgerStatuses.has(path)) failures.push(`Deployable MP3 is missing from docs/audio-provenance.md: ${path}`);
}

for (const path of ledgerStatuses.keys()) {
  if (!existsSync(path)) failures.push(`Audio provenance row points to a missing file: ${path}`);
}

if (runtimePaths.size !== runtimeFileNames.length) {
  failures.push(`${musicPath} contains duplicate runtime audio fileName entries.`);
}

if (failures.length > 0) {
  console.error('Audio provenance coverage validation failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `Audio provenance coverage passed: ${runtimePaths.size} runtime references, ${publicMp3Paths.size} deployable MP3s, ${ledgerStatuses.size} ledger rows.`,
);
