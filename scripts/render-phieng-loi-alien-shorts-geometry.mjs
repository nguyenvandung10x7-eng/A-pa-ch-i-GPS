import { readFileSync, writeFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const study = new URL('docs/art-direction/studies/alien-shorts-walk-side-v1/', root);
const calibration = JSON.parse(readFileSync(new URL('geometry-calibration-v3.json', study), 'utf8'));
const frameNames = [
  'f0-contact-a.png',
  'f1-down-a.png',
  'f2-passing-a-to-b.png',
  'f3-up-a-to-b.png',
  'f4-contact-b.png',
  'f5-down-b.png',
  'f6-passing-b-to-a.png',
  'f7-up-b-to-a.png',
];

const CELL_WIDTH = 384;
const CELL_HEIGHT = 341;
const ANCHOR_X = CELL_WIDTH * 0.5;
const ANCHOR_Y = CELL_HEIGHT * 0.92;
const WORLD_TO_CELL = CELL_WIDTH / 108;
const COLORS = { A: '#ff941f', B: '#18c8ed' };

const point = (value, column, row) => [
  column * CELL_WIDTH + ANCHOR_X + value[0] * WORLD_TO_CELL,
  row * CELL_HEIGHT + ANCHOR_Y - value[1] * WORLD_TO_CELL,
];

const xy = ([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`;
const polyline = (points, color, width = 4) => (
  `<polyline points="${points.map(xy).join(' ')}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`
);
const joint = ([x, y], color) => (
  `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="3.2" fill="${color}" stroke="#071b18" stroke-width="1"/>`
);

const layers = calibration.phases.map((phase) => {
  const column = phase.index % 4;
  const row = Math.floor(phase.index / 4);
  const ox = column * CELL_WIDTH;
  const oy = row * CELL_HEIGHT;
  const neck = point(phase.neck, column, row);
  const shoulder = point(phase.shoulder_center, column, row);
  const pelvis = point(phase.pelvis, column, row);
  const head = point(phase.head_center, column, row);
  const headRx = phase.head_radius[0] * WORLD_TO_CELL;
  const headRy = phase.head_radius[1] * WORLD_TO_CELL;
  const limbs = ['A', 'B'].flatMap((side) => {
    const leg = phase.legs[side];
    const arm = phase.arms[side];
    const color = COLORS[side];
    const legPoints = ['hip', 'knee', 'ankle'].map((key) => point(leg[key], column, row));
    const footPoints = ['heel', 'pressure', 'toe'].map((key) => point(leg[key], column, row));
    const armPoints = ['shoulder', 'elbow', 'wrist'].map((key) => point(arm[key], column, row));
    return [
      polyline(legPoints, color),
      polyline(footPoints, color, 3),
      polyline(armPoints, color),
      ...legPoints.map((value) => joint(value, color)),
      ...footPoints.map((value) => joint(value, color)),
      ...armPoints.map((value) => joint(value, color)),
    ];
  }).join('');
  return `
    <g>
      <rect x="${ox}" y="${oy}" width="${CELL_WIDTH}" height="${CELL_HEIGHT}" fill="#001b17" opacity="0.30"/>
      <line x1="${ox}" y1="${(oy + ANCHOR_Y).toFixed(2)}" x2="${ox + CELL_WIDTH}" y2="${(oy + ANCHOR_Y).toFixed(2)}" stroke="#ffe052" stroke-width="1.5" opacity="0.92"/>
      <line x1="${(ox + ANCHOR_X - 6).toFixed(2)}" y1="${(oy + ANCHOR_Y).toFixed(2)}" x2="${(ox + ANCHOR_X + 6).toFixed(2)}" y2="${(oy + ANCHOR_Y).toFixed(2)}" stroke="#8dff7a" stroke-width="2"/>
      <line x1="${(ox + ANCHOR_X).toFixed(2)}" y1="${(oy + ANCHOR_Y - 6).toFixed(2)}" x2="${(ox + ANCHOR_X).toFixed(2)}" y2="${(oy + ANCHOR_Y + 6).toFixed(2)}" stroke="#8dff7a" stroke-width="2"/>
      ${polyline([neck, shoulder, pelvis], '#f7f2de', 4)}
      <ellipse cx="${head[0].toFixed(2)}" cy="${head[1].toFixed(2)}" rx="${headRx.toFixed(2)}" ry="${headRy.toFixed(2)}" fill="none" stroke="#f7f2de" stroke-width="3"/>
      ${joint(neck, '#f7f2de')}${joint(shoulder, '#f7f2de')}${joint(pelvis, '#f7f2de')}
      ${limbs}
      <text x="${ox + 10}" y="${oy + 23}" fill="#ffffff" stroke="#071b18" stroke-width="3" paint-order="stroke" font-family="Arial, sans-serif" font-size="17" font-weight="700">${phase.name}</text>
    </g>`;
}).join('');

const raster = frameNames.map((name, index) => {
  const column = index % 4;
  const row = Math.floor(index / 4);
  const frame = readFileSync(new URL(`frames/${name}`, study));
  const dataUrl = `data:image/png;base64,${frame.toString('base64')}`;
  return `<image x="${column * CELL_WIDTH}" y="${row * CELL_HEIGHT}" width="${CELL_WIDTH}" height="${CELL_HEIGHT}" href="${dataUrl}" xlink:href="${dataUrl}"/>`;
}).join('');

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1536" height="682" viewBox="0 0 1536 682">
  ${raster}
  ${layers}
</svg>
`;

writeFileSync(new URL('qa/geometry-overlay.svg', study), svg);
console.log('Wrote alien-shorts geometry overlay (1536x682 SVG).');
