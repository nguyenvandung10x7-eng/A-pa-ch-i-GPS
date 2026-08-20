import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const trackedBytes = execFileSync('git', ['ls-files', '-z']);
const tracked = [];
let trackedStart = 0;
for (let index = 0; index < trackedBytes.length; index += 1) {
  if (trackedBytes[index] !== 0) continue;
  if (index > trackedStart) tracked.push(Buffer.from(trackedBytes.subarray(trackedStart, index)));
  trackedStart = index + 1;
}

const findings = [];
const allowedEnvExamples = new Set(['.env.example', '.env.sample', '.env.template']);

const credentialNames = new Map([
  ['SUPABASE_SERVICE_ROLE_KEY', 'Supabase service-role key'],
  ['AWS_SECRET_ACCESS_KEY', 'AWS secret access key'],
  ['OPENAI_API_KEY', 'OpenAI API key'],
  ['NETLIFY_AUTH_TOKEN', 'Netlify auth token'],
  ['GOOGLE_CLIENT_SECRET', 'Google client secret'],
]);

const placeholder = /^(?:your[_-]|replace[_-]|example|placeholder|changeme|xxx+|<)/i;
const quotedCredentialShape = /^[A-Za-z0-9_+\/=.-]{16,}$/;
const unquotedCredentialShape = /^[A-Za-z0-9_+\/=-]{16,}$/;
const jwtPattern = /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g;
const keyCandidatePattern = /(?<![\p{ID_Continue}$\u200C\u200D])(?:"((?:\\(?:\r\n|\n|\r|[\s\S])|[^"\\\r\n])*)"|'((?:\\(?:\r\n|\n|\r|[\s\S])|[^'\\\r\n])*)'|([A-Za-z_$][A-Za-z0-9_$]*))/gu;

const decodeStringLiteral = (raw) => {
  let decoded = '';

  for (let index = 0; index < raw.length;) {
    const char = raw[index];
    if (char !== '\\') {
      decoded += char;
      index += 1;
      continue;
    }

    const next = raw[index + 1];
    if (next === undefined) {
      decoded += '\\';
      break;
    }

    if (next === '\r' && raw[index + 2] === '\n') {
      index += 3;
      continue;
    }
    if (next === '\n' || next === '\r') {
      index += 2;
      continue;
    }

    if (next === 'u') {
      if (raw[index + 2] === '{') {
        const close = raw.indexOf('}', index + 3);
        const hex = close >= 0 ? raw.slice(index + 3, close) : '';
        if (/^[0-9a-fA-F]{1,6}$/.test(hex)) {
          try {
            const codePoint = Number.parseInt(hex, 16);
            if (codePoint <= 0x10ffff) {
              decoded += String.fromCodePoint(codePoint);
              index = close + 1;
              continue;
            }
          } catch {
            // Fall through to normal JavaScript non-escape handling.
          }
        }
      } else {
        const hex = raw.slice(index + 2, index + 6);
        if (/^[0-9a-fA-F]{4}$/.test(hex)) {
          decoded += String.fromCharCode(Number.parseInt(hex, 16));
          index += 6;
          continue;
        }
      }
    }

    if (next === 'x') {
      const hex = raw.slice(index + 2, index + 4);
      if (/^[0-9a-fA-F]{2}$/.test(hex)) {
        decoded += String.fromCharCode(Number.parseInt(hex, 16));
        index += 4;
        continue;
      }
    }

    if (/[0-7]/.test(next)) {
      const octal = raw.slice(index + 1).match(/^[0-7]{1,3}/)?.[0] ?? '';
      if (octal) {
        decoded += String.fromCharCode(Number.parseInt(octal, 8));
        index += 1 + octal.length;
        continue;
      }
    }

    const simpleEscapes = {
      '0': '\0',
      n: '\n',
      r: '\r',
      t: '\t',
      b: '\b',
      f: '\f',
      v: '\v',
      '\\': '\\',
      '"': '"',
      "'": "'",
      '`': '`',
      '/': '/',
    };
    decoded += simpleEscapes[next] ?? next;
    index += 2;
  }

  return decoded;
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

const skipWhitespace = (text, start) => {
  let index = start;
  while (index < text.length && /\s/u.test(text[index])) index += 1;
  return index;
};

const skipTrivia = (text, start) => {
  let index = start;
  while (index < text.length) {
    const whitespaceEnd = skipWhitespace(text, index);
    if (whitespaceEnd !== index) {
      index = whitespaceEnd;
      continue;
    }
    if (text.startsWith('//', index)) {
      const newline = text.indexOf('\n', index + 2);
      return newline < 0 ? text.length : skipTrivia(text, newline + 1);
    }
    if (text.startsWith('/*', index)) {
      const close = text.indexOf('*/', index + 2);
      if (close < 0) return text.length;
      index = close + 2;
      continue;
    }
    return index;
  }
  return index;
};

const isSingleAssignment = (text, index) =>
  text[index] === '='
  && !/[=<>!]/.test(text[index - 1] ?? '')
  && !/[=>]/.test(text[index + 1] ?? '');

const readStringToken = (text, start, quote) => {
  let index = start + 1;
  let raw = '';

  while (index < text.length) {
    const char = text[index];
    if (char === quote) return { raw, end: index + 1, quoted: true };

    if (char === '\\') {
      raw += char;
      if (text[index + 1] === '\r' && text[index + 2] === '\n') {
        raw += '\r\n';
        index += 3;
        continue;
      }
      if (text[index + 1] !== undefined) {
        raw += text[index + 1];
        index += 2;
        continue;
      }
    }

    if ((quote === '"' || quote === "'") && (char === '\n' || char === '\r')) return null;
    raw += char;
    index += 1;
  }

  return null;
};

const readValueToken = (text, start) => {
  let index = skipWhitespace(text, start);
  if (index >= text.length) return null;

  const quote = text[index];
  if (quote === '"' || quote === "'" || quote === '`') {
    return readStringToken(text, index, quote);
  }

  const tokenStart = index;
  while (index < text.length && !/[\s,;#}\])]/u.test(text[index])) index += 1;
  return index > tokenStart
    ? { raw: text.slice(tokenStart, index), end: index, quoted: false }
    : null;
};

const findTypedInitializer = (text, start) => {
  let index = skipWhitespace(text, start);
  let parentheses = 0;
  let brackets = 0;
  let braces = 0;
  let angles = 0;
  let quote = null;

  for (; index < text.length; index += 1) {
    const char = text[index];

    if (quote) {
      if (char === '\\') {
        if (text[index + 1] === '\r' && text[index + 2] === '\n') index += 2;
        else if (text[index + 1] !== undefined) index += 1;
        continue;
      }
      if (char === quote) quote = null;
      continue;
    }

    if (text.startsWith('//', index)) {
      const newline = text.indexOf('\n', index + 2);
      if (newline < 0) return -1;
      index = newline - 1;
      continue;
    }
    if (text.startsWith('/*', index)) {
      const close = text.indexOf('*/', index + 2);
      if (close < 0) return -1;
      index = close + 1;
      continue;
    }

    if (char === '"' || char === "'" || char === '`') {
      quote = char;
      continue;
    }
    if (char === '(') { parentheses += 1; continue; }
    if (char === ')') { if (parentheses) parentheses -= 1; continue; }
    if (char === '[') { brackets += 1; continue; }
    if (char === ']') { if (brackets) brackets -= 1; continue; }
    if (char === '{') { braces += 1; continue; }
    if (char === '}') {
      if (braces) braces -= 1;
      else if (!parentheses && !brackets && !angles) return -1;
      continue;
    }
    if (char === '<') { angles += 1; continue; }
    if (char === '>') { if (angles) angles -= 1; continue; }

    if (!parentheses && !brackets && !braces && !angles) {
      if (isSingleAssignment(text, index)) return index;
      if (char === ';' || char === ',') return -1;
      if (char === '\n' || char === '\r') {
        const next = skipTrivia(text, index + 1);
        if (isSingleAssignment(text, next) || text.startsWith('=>', next) || /[|&?]/.test(text[next] ?? '')) {
          index = next - 1;
          continue;
        }
        return -1;
      }
    }
  }

  return -1;
};

const valueAfterCredentialKey = (text, keyEnd, quotedKey) => {
  let index = skipWhitespace(text, keyEnd);

  // Bracket notation such as process.env["OPENAI_API_KEY"] = "...".
  if (quotedKey && text[index] === ']') index = skipWhitespace(text, index + 1);

  if (isSingleAssignment(text, index)) return readValueToken(text, index + 1);
  if (text[index] !== ':') return null;

  // A colon can be an object-property separator or a TypeScript type annotation.
  // Prefer a later top-level single '=' when present; otherwise treat the colon as
  // the property separator and read the value immediately after it.
  const typedInitializer = findTypedInitializer(text, index + 1);
  if (typedInitializer >= 0) return readValueToken(text, typedInitializer + 1);
  return readValueToken(text, index + 1);
};

const scanText = (file, text) => {
  if (/-----BEGIN [A-Z0-9 ]*PRIVATE KEY-----/.test(text)) {
    findings.push(`${file}: private key material`);
  }

  for (const match of text.matchAll(keyCandidatePattern)) {
    const quotedKey = match[1] ?? match[2];
    const rawKey = quotedKey === undefined ? (match[3] ?? '') : decodeStringLiteral(quotedKey);
    const key = rawKey.toUpperCase();
    const name = credentialNames.get(key);
    if (!name) continue;

    const token = valueAfterCredentialKey(
      text,
      (match.index ?? 0) + match[0].length,
      quotedKey !== undefined,
    );
    if (!token) continue;

    const value = token.quoted ? decodeStringLiteral(token.raw) : token.raw;
    const shape = token.quoted ? quotedCredentialShape : unquotedCredentialShape;
    if (shape.test(value) && !placeholder.test(value)) {
      findings.push(`${file}: ${name}`);
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
  const slash = file.lastIndexOf(0x2f);
  const base = file.subarray(slash + 1).toString('utf8');
  const displayFile = file.toString('utf8');
  if ((base === '.env' || base.startsWith('.env.')) && !allowedEnvExamples.has(base)) {
    findings.push(`${displayFile}: tracked environment file`);
  }

  let buffer;
  try {
    buffer = readFileSync(file);
  } catch {
    continue;
  }

  const utf8 = buffer.toString('utf8');
  scanText(displayFile, utf8);

  if (buffer.includes(0)) {
    const nulStripped = utf8.replace(/\0/g, '');
    if (nulStripped !== utf8) scanText(displayFile, nulStripped);

    if (buffer.length % 2 === 0) {
      const utf16le = buffer.toString('utf16le');
      if (utf16le !== utf8 && utf16le !== nulStripped) scanText(displayFile, utf16le);
    }
  }
}

if (findings.length) {
  console.error('Committed-secret guard failed. Remove the credential from tracked history/current files and rotate it if it was real.');
  for (const finding of [...new Set(findings)]) console.error(`- ${finding}`);
  process.exit(1);
}

console.log(`Committed-secret guard passed (${tracked.length} tracked files scanned).`);
