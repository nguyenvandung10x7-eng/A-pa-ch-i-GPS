import { APPROVED, geometry, legal, type Point } from '../config';
export const CONFIG = Object.freeze({
  id: 'T05-DEV-HS01-CFG-A01', technicalRevision: 1,
  playerSpawn: { x: 240, y: 300 }, npcSpawn: { x: 1000, y: 300 }, recovery: { x: 240, y: 300 },
  playerSpeed: 240, npcSpeed: 480, near: 96, holdMs: 500, fadeMs: 500,
  drunkMs: 5000, cooldownMs: 60000, trueNothing: 0.2, initialBalance: 10,
  body: { width: 24, height: 16 }, gap: 2, fps: 15,
});
export const GEOMETRY = geometry(APPROVED);
export function validPoint(p: Point): boolean { return legal(p, GEOMETRY); }
export function validDelta(delta: number): boolean { return Number.isFinite(delta) && delta >= 0 && delta <= 1000; }
