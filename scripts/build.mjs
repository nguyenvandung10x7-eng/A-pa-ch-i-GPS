import { cp, mkdir, writeFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';

await mkdir('dist', { recursive: true });
await cp('src', 'dist/src', { recursive: true });
const css = readFileSync('src/index.css', 'utf8').replace(/@[^;]+;/g, '');
const html = `<!doctype html><html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>GPS Challenge</title><meta name="description" content="A configurable GPS scavenger hunt challenge app." /><script src="https://cdn.tailwindcss.com"></script><link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" /><script type="importmap">{"imports":{"react":"https://esm.sh/react@19","react-dom/client":"https://esm.sh/react-dom@19/client","react-router-dom":"https://esm.sh/react-router-dom@7","react-leaflet":"https://esm.sh/react-leaflet@5","leaflet":"https://esm.sh/leaflet@1.9.4","lucide-react":"https://esm.sh/lucide-react@0.468.0","i18next":"https://esm.sh/i18next@23","react-i18next":"https://esm.sh/react-i18next@14"}}</script><style>${css}</style></head><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>`;
await writeFile('dist/index.html', html);
console.log('Built GPS Challenge to dist/');
