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

const rootIdentifier = (expression) => {
  let current = expression;
  while (ts.isPropertyAccessExpression(current) || ts.isElementAccessExpression(current)) current = current.expression;
  return ts.isIdentifier(current) ? current.text : null;
};

const mutationOperators = new Set([
  ts.SyntaxKind.EqualsToken,
  ts.SyntaxKind.PlusEqualsToken,
  ts.SyntaxKind.MinusEqualsToken,
  ts.SyntaxKind.AsteriskEqualsToken,
  ts.SyntaxKind.AsteriskAsteriskEqualsToken,
  ts.SyntaxKind.SlashEqualsToken,
  ts.SyntaxKind.PercentEqualsToken,
  ts.SyntaxKind.LessThanLessThanEqualsToken,
  ts.SyntaxKind.GreaterThanGreaterThanEqualsToken,
  ts.SyntaxKind.GreaterThanGreaterThanGreaterThanEqualsToken,
  ts.SyntaxKind.AmpersandEqualsToken,
  ts.SyntaxKind.BarEqualsToken,
  ts.SyntaxKind.CaretEqualsToken,
  ts.SyntaxKind.BarBarEqualsToken,
  ts.SyntaxKind.AmpersandAmpersandEqualsToken,
  ts.SyntaxKind.QuestionQuestionEqualsToken,
]);

const readOnlyArrayMethods = new Set([
  'at', 'concat', 'entries', 'every', 'filter', 'find', 'findIndex', 'findLast', 'findLastIndex',
  'flat', 'flatMap', 'forEach', 'includes', 'indexOf', 'join', 'keys', 'lastIndexOf', 'map', 'reduce',
  'reduceRight', 'slice', 'some', 'toLocaleString', 'toReversed', 'toSorted', 'toSpliced', 'toString',
  'values', 'with',
]);

const callbackAliasParameterIndexes = new Map([
  ['every', [0, 2]],
  ['filter', [0, 2]],
  ['find', [0, 2]],
  ['findIndex', [0, 2]],
  ['findLast', [0, 2]],
  ['findLastIndex', [0, 2]],
  ['flatMap', [0, 2]],
  ['forEach', [0, 2]],
  ['map', [0, 2]],
  ['some', [0, 2]],
  ['toSorted', [0, 1]],
]);

const mutationHelperNames = new Set([
  'Object.assign',
  'Object.defineProperty',
  'Object.defineProperties',
  'Reflect.set',
  'Reflect.defineProperty',
]);

const expressionIsRootedAt = (expression, identifierName) => rootIdentifier(expression) === identifierName;

const callbackMutatesParameter = (callback, parameterIndex) => {
  if (!ts.isArrowFunction(callback) && !ts.isFunctionExpression(callback)) return true;

  const parameter = callback.parameters[parameterIndex];
  if (!parameter) return false;
  if (!ts.isIdentifier(parameter.name)) return true;
  const parameterName = parameter.name.text;
  let mutated = false;

  const visit = (node) => {
    if (mutated) return;

    if (ts.isBinaryExpression(node) && mutationOperators.has(node.operatorToken.kind)
        && expressionIsRootedAt(node.left, parameterName)) {
      mutated = true;
      return;
    }

    if ((ts.isPrefixUnaryExpression(node) || ts.isPostfixUnaryExpression(node))
        && (node.operator === ts.SyntaxKind.PlusPlusToken || node.operator === ts.SyntaxKind.MinusMinusToken)
        && expressionIsRootedAt(node.operand, parameterName)) {
      mutated = true;
      return;
    }

    if (ts.isCallExpression(node)) {
      if (ts.isPropertyAccessExpression(node.expression) || ts.isElementAccessExpression(node.expression)) {
        const receiver = node.expression.expression;
        if (expressionIsRootedAt(receiver, parameterName)) {
          mutated = true;
          return;
        }
      }

      const helperName = ts.isPropertyAccessExpression(node.expression)
        ? `${rootIdentifier(node.expression.expression) ?? ''}.${node.expression.name.text}`
        : null;
      if (helperName && mutationHelperNames.has(helperName)
          && node.arguments.some((argument) => expressionIsRootedAt(argument, parameterName))) {
        mutated = true;
        return;
      }
    }

    ts.forEachChild(node, visit);
  };

  visit(callback.body);
  return mutated;
};

const callbackAliasIndexesForCall = (methodName, node) => {
  if (methodName === 'reduce' || methodName === 'reduceRight') {
    const indexes = [1, 3];
    if (node.arguments.length === 1) indexes.push(0);
    return indexes;
  }
  return callbackAliasParameterIndexes.get(methodName) ?? null;
};

const callTouchesRuntimeCatalog = (node) => {
  if (!ts.isCallExpression(node)) return null;

  if (ts.isPropertyAccessExpression(node.expression) || ts.isElementAccessExpression(node.expression)) {
    const receiver = node.expression.expression;
    const receiverRoot = rootIdentifier(receiver);
    if (receiverRoot && runtimeCatalogNames.has(receiverRoot)) {
      const receiverIsCatalogIdentifier = ts.isIdentifier(receiver) && receiver.text === receiverRoot;
      const methodName = ts.isPropertyAccessExpression(node.expression)
        ? node.expression.name.text
        : node.expression.argumentExpression && (ts.isStringLiteral(node.expression.argumentExpression) || ts.isNoSubstitutionTemplateLiteral(node.expression.argumentExpression))
          ? node.expression.argumentExpression.text
          : null;

      if (!receiverIsCatalogIdentifier || !methodName || !readOnlyArrayMethods.has(methodName)) return receiverRoot;

      const aliasParameterIndexes = callbackAliasIndexesForCall(methodName, node);
      if (aliasParameterIndexes) {
        const callback = node.arguments[0];
        if (!callback || aliasParameterIndexes.some((parameterIndex) => callbackMutatesParameter(callback, parameterIndex))) {
          return receiverRoot;
        }
      }
    }
  }

  const helperName = ts.isPropertyAccessExpression(node.expression)
    ? `${rootIdentifier(node.expression.expression) ?? ''}.${node.expression.name.text}`
    : null;
  if (helperName && mutationHelperNames.has(helperName)) {
    for (const argument of node.arguments) {
      const target = rootIdentifier(argument);
      if (target && runtimeCatalogNames.has(target)) return target;
    }
  }

  return null;
};

const visitForCatalogMutations = (node) => {
  if (ts.isBinaryExpression(node) && mutationOperators.has(node.operatorToken.kind)) {
    const target = rootIdentifier(node.left);
    if (target && runtimeCatalogNames.has(target)) {
      failures.push(`Runtime audio catalog ${target} must not be mutated after declaration.`);
    }
  }

  if ((ts.isPrefixUnaryExpression(node) || ts.isPostfixUnaryExpression(node))
      && (node.operator === ts.SyntaxKind.PlusPlusToken || node.operator === ts.SyntaxKind.MinusMinusToken)) {
    const target = rootIdentifier(node.operand);
    if (target && runtimeCatalogNames.has(target)) {
      failures.push(`Runtime audio catalog ${target} must not be mutated after declaration.`);
    }
  }

  const calledCatalog = callTouchesRuntimeCatalog(node);
  if (calledCatalog) {
    failures.push(`Runtime audio catalog ${calledCatalog} must not be passed through potentially mutating calls after declaration.`);
  }

  ts.forEachChild(node, visitForCatalogMutations);
};

visitForCatalogMutations(sourceFile);

for (const statement of sourceFile.statements) {
  if (!ts.isVariableStatement(statement)) continue;

  for (const declaration of statement.declarationList.declarations) {
    if (!ts.isIdentifier(declaration.name) || !runtimeCatalogNames.has(declaration.name.text)) continue;

    const catalogName = declaration.name.text;
    foundCatalogs.add(catalogName);

    if (!declaration.initializer || !ts.isArrayLiteralExpression(declaration.initializer)) {
      failures.push(`${catalogName} must remain an array literal so audio provenance can be audited.`);
      continue;
    }

    for (const [index, element] of declaration.initializer.elements.entries()) {
      if (!ts.isObjectLiteralExpression(element)) {
        failures.push(`${catalogName}[${index}] must remain an object literal so audio provenance can be audited.`);
        continue;
      }

      if (element.properties.some((property) => ts.isSpreadAssignment(property))) {
        failures.push(`${catalogName}[${index}] must not contain spread assignments because they can override audited properties such as fileName.`);
        continue;
      }

      const unresolvedComputedProperty = element.properties.find((property) => {
        if (!('name' in property) || !property.name || !ts.isComputedPropertyName(property.name)) return false;
        return propertyNameText(property.name) === null;
      });

      if (unresolvedComputedProperty) {
        failures.push(`${catalogName}[${index}] must not contain computed property names that cannot be resolved statically because they can override audited properties such as fileName.`);
        continue;
      }

      const fileNameProperties = element.properties.filter((property) => {
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
