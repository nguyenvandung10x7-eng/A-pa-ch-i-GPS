import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const tracked = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' })
  .split('\0')
  .filter(Boolean);

const findings = [];
const allowedEnvExamples = new Set(['.env.example', '.env.sample', '.env.template']);

const assignmentPatterns = [
  { name: 'Supabase service-role key', regex: /\bSUPABASE_SERVICE_ROLE_KEY\b\s*[:=]\s*["']?([^\s"']{16,})/gi },
  { name: 'AWS secret access key', regex: /\bAWS_SECRET_ACCESS_KEY\b\s*[:=]\s*["']?([^\s"']{16,})/gi },
  { name: 'OpenAI API key', regex: /\bOPENAI_API_KEY\b\s*[:=]\s*["']?([^\s"']{16,})/gi },
  { name: 'Netlify auth token', regex: /\bNETLIFY_AUTH_TOKEN\b\s*[:=]\s*["']?([^\s"']{16,})/gi },
  { name: 'Google client secret', regex: /\bGOOGLE_CLIENT_SECRET\b\s*[:=]\s*["']?([^\s"']{16,})/gi },
];

const placeholder = /^(?:your[_-]|replace[_-]|example|placeholder|changeme|xxx+|<)/i;
const jwtPattern = /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g;

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

  if (buffer.length > 1_500_000 || buffer.includes(0)) continue;
  const text = buffer.toString('utf8');

  if (/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(text)) {
    findings.push(`${file}: private key material`);
  }

  for (const { name, regex } of assignmentPatterns) {
    regex.lastIndex = 0;
    for (const match of text.matchAll(regex)) {
      const value = match[1] ?? '';
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
