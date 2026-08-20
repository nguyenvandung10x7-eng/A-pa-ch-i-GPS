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
const jwtPattern = /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g;

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const credentialAssignmentRegex = (key) => new RegExp(
  `(?:["']?${escapeRegex(key)}["']?)\\s*[:=]\\s*(?:"([^"]{16,})"|'([^']{16,})'|([A-Za-z0-9_+\\/=-]{16,}))`,
  'gi',
);

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

  if (buffer.includes(0)) continue;
  const text = buffer.toString('utf8');

  if (/-----BEGIN [A-Z0-9 ]*PRIVATE KEY-----/.test(text)) {
    findings.push(`${file}: private key material`);
  }

  for (const [key, name] of credentialNames) {
    const regex = credentialAssignmentRegex(key);
    for (const match of text.matchAll(regex)) {
      const value = match[1] ?? match[2] ?? match[3] ?? '';
      if (!placeholder.test(value)) findings.push(`${file}: ${name}`);
    }
  }

  for (const token of text.match(jwtPattern) ?? []) {
    const payload = decodeJwtPayload(token);
    if (payload?.role === 'service_role') {
      findings.push(`${file}: Supabase service_role JWT`);
    }
  }
}

if (findings.length) {
  console.error('Committed-secret guard failed. Remove the credential from tracked history/current files and rotate it if it was real.');
  for (const finding of [...new Set(findings)]) console.error(`- ${finding}`);
  process.exit(1);
}

console.log(`Committed-secret guard passed (${tracked.length} tracked files scanned).`);
