import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, sep } from 'node:path';

const musicSource = readFileSync('src/data/music.ts', 'utf8');
const ledger = readFileSync('docs/audio-provenance.md', 'utf8');
const publicAudioRoot = 'public/audio';

const normalizePath = (path) => path.split(sep).join('/');

const collectMp3Files = (directory) => readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
  const absolute = join(directory, entry.name);
  if (entry.isDirectory()) return collectMp3Files(absolute);
  return entry.isFile() && entry.name.toLowerCase().endsWith('.mp3')
    ? [normalizePath(absolute)]
    : [];
});

const runtimeCatalogStart = musicSource.indexOf('export const MUSIC_TRACKS');
const runtimeCatalogEnd = musicSource.indexOf('export const ALL_MUSIC_TRACK_IDS');
const runtimeCatalogSource = runtimeCatalogStart >= 0 && runtimeCatalogEnd > runtimeCatalogStart
  ? musicSource.slice(runtimeCatalogStart, runtimeCatalogEnd)
  : '';

const fileNameFields = [...runtimeCatalogSource.matchAll(/\bfileName\s*:/g)];
const literalFileNameMatches = [...runtimeCatalogSource.matchAll(
  /\bfileName\s*:\s*(['"`])([^'"`\r\n]+)\1\s*(?=[,}])/g,
)];
const runtimeFileNames = literalFileNameMatches.map((match) => match[2]);
const runtimePaths = new Set(runtimeFileNames.map((fileName) => `public/audio/${fileName}`));
const publicMp3Paths = new Set(collectMp3Files(publicAudioRoot));
const ledgerRows = [...ledger.matchAll(/^\| `([^`]+\.mp3)` \|[^\n]*\| (CLEARED|UNVERIFIED|BLOCKED) \|/gim)];
const ledgerStatuses = new Map(ledgerRows.map((match) => [match[1], match[2]]));

const failures = [];

if (!runtimeCatalogSource) {
  failures.push('Could not locate the MUSIC_TRACKS / BOOK_MUSIC_TRACKS runtime catalog region in src/data/music.ts.');
}

if (literalFileNameMatches.length !== fileNameFields.length) {
  failures.push(
    'Every runtime catalog fileName field must be a directly auditable string literal that fully terminates the property expression; identifier-valued, concatenated, or other expressions are not allowed.',
  );
}

for (const match of literalFileNameMatches) {
  const quote = match[1];
  const fileName = match[2];
  if (quote === '`' && fileName.includes('${')) {
    failures.push(`Dynamic template-literal audio fileName is not allowed: ${fileName}`);
  }
  if (!fileName.toLowerCase().endsWith('.mp3')) {
    failures.push(`Runtime audio fileName must end in .mp3: ${fileName}`);
  }
}

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
  failures.push('src/data/music.ts contains duplicate runtime audio fileName entries.');
}

if (failures.length > 0) {
  console.error('Audio provenance coverage validation failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `Audio provenance coverage passed: ${runtimePaths.size} runtime references, ${publicMp3Paths.size} deployable MP3s, ${ledgerStatuses.size} ledger rows.`,
);
