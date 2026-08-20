import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const tracked = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' })
  .split('\0')
  .filter(Boolean);

const findings = [];
const allowedEnvExamples = new Set(['.env.example', '.env.sample', '.env.template']);

const credentialNames = [
  ['SUPABASE_SERVICE_ROLE_KEY', 'Supabase service-role key'],
  ['AWS_SECRET_ACCESS_KEY', 'AWS secret access key'],
  ['OPENAI_API_KEY', 'OpenAI API key'],
  ['NETLIFY_AUTH_TOKEN', 'Netlify auth token'],
  ['GOOGLE_CLIENT_SECRET', 'Google client secret'],
];

const placeholder = /^(?:your[_-]|replace[_-]|example|placeholder|changeme|xxx+|<)/i;
const quotedCredentialShape = /^[A-Za-z0-9_+\/=.-]{16,}$/;
const unquotedCredentialShape = /^[A-Za-z0-9_+\/=-]{16,}$/;
const jwtPattern = /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g;

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const credentialAssignmentRegex = (key) => new RegExp(
  `(?<![\\p{ID_Continue}$\\u200C\\u200D])(?:["']${escapeRegex(key)}["']|${escapeRegex(key)})\\s*[:=]\\s*(?:"((?:\\\\.|[^"\\\\]){16,})"|'((?:\\\\.|[^'\\\\]){16,})'|([^\\s,;#]{16,}))`,
  'giu',
);

const decodeQuotedValue = (raw) => {
  const decodeCodePoint = (hex) => {
    try {
      const codePoint = Number.parseInt(hex, 16);
      return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : '';
    } catch {
      return '';
    }
  };

  return raw
    .replace(/\\u\{([0-9a-fA-F]{1,6})\}/g, (_, hex) => decodeCodePoint(hex))
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => decodeCodePoint(hex))
    .replace(/\\x([0-9a-fA-F]{2})/g, (_, hex) => decodeCodePoint(hex))
    .replace(/\\(["'\\/])/g, '$1');
};

const decodeJwtPayload = (token) => {
  try {
    const payload = token.split('.')[1];
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    return JSON.parse(Buffer.from(padded, 'base64').toString('utf8'));
  } catch {
    return null;
  }
};

const scanText = (file, text) => {
  if (/-----BEGIN [A-Z0-9 ]*PRIVATE KEY-----/.test(text)) {
    findings.push(`${file}: private key material`);
  }

  for (const [key, name] of credentialNames) {
    const regex = credentialAssignmentRegex(key);
    for (const match of text.matchAll(regex)) {
      const quoted = match[1] ?? match[2];
      const value = quoted === undefined ? (match[3] ?? '') : decodeQuotedValue(quoted);
      const shape = quoted === undefined ? unquotedCredentialShape : quotedCredentialShape;
      if (shape.test(value) && !placeholder.test(value)) {
        findings.push(`${file}: ${name}`);
      }
    }
  }

  for (const token of text.match(jwtPattern) ?? []) {
    const payload = decodeJwtPayload(token);
    if (payload?.role === 'service_role') {
      findings.push(`${file}: Supabase service_role JWT`);
    }
  }
};

for (const file of tracked) {
  const base = path.basename(file);
  if ((base === '.env' || base.startsWith('.env.')) && !allowedEnvExamples.has(base)) {
    findings.push(`${file}: tracked environment file`);
  }

  let buffer;
  try {
    buffer = readFileSync(file);
  } catch {
    continue;
  }

  const utf8 = buffer.toString('utf8');
  scanText(file, utf8);

  if (buffer.includes(0)) {
    const nulStripped = utf8.replace(/\0/g, '');
    if (nulStripped !== utf8) scanText(file, nulStripped);

    if (buffer.length % 2 === 0) {
      const utf16le = buffer.toString('utf16le');
      if (utf16le !== utf8 && utf16le !== nulStripped) scanText(file, utf16le);
    }
  }
}

if (findings.length) {
  console.error('Committed-secret guard failed. Remove the credential from tracked history/current files and rotate it if it was real.');
  for (const finding of [...new Set(findings)]) console.error(`- ${finding}`);
  process.exit(1);
}

console.log(`Committed-secret guard passed (${tracked.length} tracked files scanned).`);
