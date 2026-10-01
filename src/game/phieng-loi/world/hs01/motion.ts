import { sweep } from '../collision';
import type { Point, Rect } from '../config';
import { GEOMETRY, CONFIG } from './config';
export interface Segment { start: Point; end: Point; from: number; to: number }
const at = (s: Segment, t: number): Point => {
  const f = s.to === s.from ? 0 : (t - s.from) / (s.to - s.from);
  return { x: s.start.x + (s.end.x - s.start.x) * f, y: s.start.y + (s.end.y - s.start.y) * f };
};
/** Closed contact includes exact edge/corner. Obstacles use open interiors. */
function interval(p: Point, d: Point, r: Rect, open: boolean): number | null {
  let low = 0, high = 1;
  for (const [a, v, min, max] of [[p.x, d.x, r.left, r.right], [p.y, d.y, r.top, r.bottom]]) {
    if (v === 0) { if (open ? a <= min || a >= max : a < min || a > max) return null; continue; }
    const a1 = (min - a) / v, a2 = (max - a) / v;
    low = Math.max(low, Math.min(a1, a2)); high = Math.min(high, Math.max(a1, a2));
  }
  return (open ? low < high : low <= high) ? low : null;
}
export function obstructed(a: Point, b: Point, r: Rect = GEOMETRY.obstacle): boolean {
  return interval(a, { x: b.x - a.x, y: b.y - a.y }, r, true) !== null;
}
export function pathTo(start: Point, target: Point): Point[] {
  const r = GEOMETRY.obstacle;
  const nodes = [start, target, {x:r.left,y:r.top}, {x:r.right,y:r.top}, {x:r.left,y:r.bottom}, {x:r.right,y:r.bottom}];
  const distance = nodes.map(() => Infinity), previous = nodes.map(() => -1), seen = new Set<number>(); distance[0] = 0;
  for (let n = 0; n < nodes.length; n++) {
    let u = -1;
    for (let i = 0; i < nodes.length; i++) if (!seen.has(i) && (u < 0 || distance[i] < distance[u])) u = i;
    if (u < 0 || !Number.isFinite(distance[u])) break;
    if (u === 1) break;
    seen.add(u);
    for (let v = 0; v < nodes.length; v++) if (!seen.has(v) && !obstructed(nodes[u], nodes[v])) {
      const next = distance[u] + Math.hypot(nodes[v].x - nodes[u].x, nodes[v].y - nodes[u].y);
      if (next < distance[v]) { distance[v] = next; previous[v] = u; }
    }
  }
  if (!Number.isFinite(distance[1])) throw Error('No legal pursuit path');
  const result: Point[] = []; let index = 1;
  while (index !== 0) { result.unshift(nodes[index]); index = previous[index]; if (index < 0) throw Error('Invalid path'); }
  return result;
}
export function playerPath(p: Point, vector: Point, ms: number): Segment[] {
  const d = {x:vector.x * CONFIG.playerSpeed * ms / 1000, y:vector.y * CONFIG.playerSpeed * ms / 1000};
  const hit = sweep(p, d, GEOMETRY.bounds, GEOMETRY.obstacle), until = ms * hit.fraction;
  const result: Segment[] = [{start:{...p}, end:hit.position, from:0, to:until}];
  if (until < ms) result.push({start:hit.position,end:hit.position,from:until,to:ms});
  return result;
}
export function npcPath(p: Point, target: Point, ms: number): Segment[] {
  const result: Segment[] = []; let position = {...p}, time = 0;
  for (const point of pathTo(p, target)) {
    const length = Math.hypot(point.x - position.x, point.y - position.y);
    if (!length) continue;
    const duration = Math.min(ms - time, length / CONFIG.npcSpeed * 1000);
    if (duration <= 0) break;
    const f = duration * CONFIG.npcSpeed / 1000 / length;
    const hit = sweep(position, {x:(point.x-position.x)*f, y:(point.y-position.y)*f}, GEOMETRY.bounds, GEOMETRY.obstacle);
    const until = time + duration * hit.fraction;
    result.push({start:position,end:hit.position,from:time,to:until}); position = hit.position; time = until;
    if (hit.fraction < 1) break;
  }
  if (time < ms || !result.length) result.push({start:position,end:position,from:time,to:ms});
  return result;
}
export function positionAt(path: Segment[], t: number): Point {
  const segment = path.find(s => t >= s.from && t <= s.to) ?? path[path.length-1];
  return at(segment, Math.min(segment.to, Math.max(segment.from, t)));
}
export function contactTime(a: Segment[], b: Segment[]): number | null {
  const body = CONFIG.body, box = {left:-body.width,right:body.width,top:-body.height,bottom:body.height};
  let first: number | null = null;
  for (const x of a) for (const y of b) {
    const from = Math.max(x.from,y.from), to = Math.min(x.to,y.to); if (from > to) continue;
    const p = at(x,from), q = at(y,from), endP = at(x,to), endQ = at(y,to);
    const t = interval({x:p.x-q.x,y:p.y-q.y}, {x:endP.x-p.x-endQ.x+q.x,y:endP.y-p.y-endQ.y+q.y},box,false);
    if (t !== null) { const hit = from + (to-from)*t; if (first === null || hit < first) first = hit; }
  }
  return first;
}
