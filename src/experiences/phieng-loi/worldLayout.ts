export type WorldPoint = { x: number; y: number };
export type TerrainKind = 'dirt' | 'grass' | 'wood';

type RouteSegment = {
  from: WorldPoint;
  to: WorldPoint;
  radius: number;
  terrain: TerrainKind;
};

type NavigationNode = WorldPoint & { links: number[] };

export const PHIENG_LOI_LANDMARKS = {
  playerStart: { x: 92, y: 458 },
  heesunStart: { x: 365, y: 462 },
  feastStart: { x: 825, y: 456 },
  feastField: { x: 744, y: 782 },
  chief: { x: 720, y: 430 },
  chickenYard: { x: 492, y: 590 },
  stream: { x: 1_188, y: 580 },
  streamGroup: { x: 1_166, y: 566 },
  vuongMeStage: { x: 940, y: 510 },
  gate: { x: 1_008, y: 542 },
  domino: { x: 1_525, y: 554 },
  exit: { x: 1_646, y: 515 },
  squash: { x: 563, y: 706 },
  coffee: { x: 930, y: 488 },
  macadamia: { x: 1_532, y: 552 },
} as const satisfies Record<string, WorldPoint>;

/**
 * These corridors are traced against village-world-v1.webp. They are the spatial
 * contract between the painted scene and gameplay: road, courtyard, garden path,
 * and the single wooden stream crossing. A character is never allowed to roam on
 * the decorative roofs, crops, rocks, or water merely because those pixels happen
 * to sit below it.
 */
const ROUTES: RouteSegment[] = [
  { from: { x: 34, y: 452 }, to: { x: 250, y: 452 }, radius: 54, terrain: 'dirt' },
  { from: { x: 250, y: 452 }, to: { x: 430, y: 474 }, radius: 52, terrain: 'dirt' },
  { from: { x: 430, y: 474 }, to: { x: 620, y: 482 }, radius: 48, terrain: 'dirt' },
  { from: { x: 620, y: 482 }, to: { x: 800, y: 502 }, radius: 48, terrain: 'dirt' },
  { from: { x: 800, y: 502 }, to: { x: 990, y: 542 }, radius: 52, terrain: 'dirt' },
  { from: { x: 990, y: 542 }, to: { x: 1_174, y: 580 }, radius: 48, terrain: 'dirt' },
  { from: { x: 1_174, y: 580 }, to: { x: 1_272, y: 592 }, radius: 39, terrain: 'dirt' },
  { from: { x: 1_272, y: 592 }, to: { x: 1_404, y: 592 }, radius: 23, terrain: 'wood' },
  { from: { x: 1_404, y: 592 }, to: { x: 1_548, y: 552 }, radius: 45, terrain: 'dirt' },
  { from: { x: 1_548, y: 552 }, to: { x: 1_666, y: 510 }, radius: 47, terrain: 'dirt' },

  // Open village courtyard above the main road.
  { from: { x: 590, y: 472 }, to: { x: 704, y: 428 }, radius: 45, terrain: 'dirt' },
  { from: { x: 704, y: 428 }, to: { x: 906, y: 452 }, radius: 67, terrain: 'dirt' },
  { from: { x: 906, y: 452 }, to: { x: 990, y: 542 }, radius: 52, terrain: 'dirt' },

  // Narrow garden path visible below the chicken yard.
  { from: { x: 420, y: 484 }, to: { x: 500, y: 590 }, radius: 35, terrain: 'grass' },
  { from: { x: 500, y: 590 }, to: { x: 566, y: 716 }, radius: 34, terrain: 'grass' },
  { from: { x: 566, y: 716 }, to: { x: 724, y: 790 }, radius: 40, terrain: 'dirt' },
  { from: { x: 724, y: 790 }, to: { x: 904, y: 758 }, radius: 39, terrain: 'dirt' },
];

const NAVIGATION: NavigationNode[] = [
  { x: 60, y: 452, links: [1] },
  { x: 250, y: 452, links: [0, 2] },
  { x: 430, y: 474, links: [1, 3, 13] },
  { x: 620, y: 482, links: [2, 4, 11] },
  { x: 800, y: 502, links: [3, 5] },
  { x: 990, y: 542, links: [4, 6, 12] },
  { x: 1_174, y: 580, links: [5, 7] },
  { x: 1_272, y: 592, links: [6, 8] },
  { x: 1_404, y: 592, links: [7, 9] },
  { x: 1_548, y: 552, links: [8, 10] },
  { x: 1_652, y: 515, links: [9] },
  { x: 704, y: 428, links: [3, 12] },
  { x: 906, y: 452, links: [11, 5] },
  { x: 500, y: 590, links: [2, 14] },
  { x: 566, y: 716, links: [13, 15] },
  { x: 724, y: 790, links: [14, 16] },
  { x: 904, y: 758, links: [15] },
];

export const HANU_ROUTE: WorldPoint[] = [
  { x: 620, y: 482 },
  { x: 704, y: 428 },
  { x: 906, y: 452 },
  { x: 990, y: 542 },
  { x: 1_174, y: 580 },
  { x: 1_272, y: 592 },
  { x: 1_404, y: 592 },
  { x: 1_525, y: 558 },
  { x: 1_404, y: 592 },
  { x: 1_272, y: 592 },
  { x: 1_174, y: 580 },
  { x: 990, y: 542 },
  { x: 800, y: 502 },
  { x: 620, y: 482 },
  { x: 500, y: 590 },
  { x: 430, y: 474 },
];

export const HOUSE_CALL_POINTS: WorldPoint[] = [
  { x: 252, y: 430 },
  { x: 505, y: 438 },
  { x: 840, y: 438 },
  { x: 1_556, y: 514 },
];

export const OCOP_WORLD_ITEMS = [
  { kind: 'squash' as const, ...PHIENG_LOI_LANDMARKS.squash },
  { kind: 'coffee' as const, ...PHIENG_LOI_LANDMARKS.coffee },
  { kind: 'macadamia' as const, ...PHIENG_LOI_LANDMARKS.macadamia },
];

export const WORLD_OCCLUDERS = [
  { id: 'bridge-front', x: 1_214, y: 608, width: 252, height: 48, depthY: 632 },
  { id: 'lower-left-foliage', x: 0, y: 670, width: 620, height: 250, depthY: 834 },
  { id: 'lower-rocks', x: 810, y: 760, width: 870, height: 160, depthY: 860 },
] as const;

const squaredDistance = (first: WorldPoint, second: WorldPoint) => {
  const dx = first.x - second.x;
  const dy = first.y - second.y;
  return dx * dx + dy * dy;
};

const projectToSegment = (point: WorldPoint, segment: RouteSegment): WorldPoint & { distance: number } => {
  const dx = segment.to.x - segment.from.x;
  const dy = segment.to.y - segment.from.y;
  const lengthSquared = dx * dx + dy * dy || 1;
  const t = Math.max(0, Math.min(1, ((point.x - segment.from.x) * dx + (point.y - segment.from.y) * dy) / lengthSquared));
  const x = segment.from.x + dx * t;
  const y = segment.from.y + dy * t;
  return { x, y, distance: Math.hypot(point.x - x, point.y - y) };
};

export const terrainAt = (x: number, y: number, clearance = 0): TerrainKind | 'blocked' => {
  const matches = ROUTES
    .map((route) => ({ route, projection: projectToSegment({ x, y }, route) }))
    .filter(({ route, projection }) => projection.distance <= Math.max(5, route.radius - clearance))
    .sort((first, second) => (
      first.projection.distance / first.route.radius - second.projection.distance / second.route.radius
    ));
  const wood = matches.find(({ route }) => route.terrain === 'wood');
  return (wood ?? matches[0])?.route.terrain ?? 'blocked';
};

export const isWalkable = (x: number, y: number, clearance = 8) => terrainAt(x, y, clearance) !== 'blocked';

export const nearestWalkablePoint = (point: WorldPoint): WorldPoint => {
  if (isWalkable(point.x, point.y, 8)) return { ...point };
  const nearest = ROUTES
    .map((route) => projectToSegment(point, route))
    .sort((first, second) => first.distance - second.distance)[0];
  return nearest ? { x: nearest.x, y: nearest.y } : { ...PHIENG_LOI_LANDMARKS.playerStart };
};

const lineIsWalkable = (from: WorldPoint, to: WorldPoint) => {
  const length = Math.hypot(to.x - from.x, to.y - from.y);
  const steps = Math.max(1, Math.ceil(length / 12));
  for (let index = 0; index <= steps; index += 1) {
    const t = index / steps;
    if (!isWalkable(from.x + (to.x - from.x) * t, from.y + (to.y - from.y) * t, 7)) return false;
  }
  return true;
};

const closestNode = (point: WorldPoint) => NAVIGATION.reduce(
  (best, node, index) => squaredDistance(point, node) < best.distance ? { index, distance: squaredDistance(point, node) } : best,
  { index: 0, distance: Number.POSITIVE_INFINITY },
).index;

/** Returns the next authored road node when the direct chase line leaves the painted path. */
export const navigationTarget = (from: WorldPoint, target: WorldPoint): WorldPoint => {
  if (lineIsWalkable(from, target)) return target;
  const start = closestNode(from);
  const finish = closestNode(target);
  const distances = NAVIGATION.map(() => Number.POSITIVE_INFINITY);
  const previous = NAVIGATION.map(() => -1);
  const pending = new Set(NAVIGATION.map((_, index) => index));
  distances[start] = 0;

  while (pending.size > 0) {
    let current = -1;
    pending.forEach((index) => {
      if (current === -1 || distances[index] < distances[current]) current = index;
    });
    if (current === -1 || distances[current] === Number.POSITIVE_INFINITY) break;
    pending.delete(current);
    if (current === finish) break;
    NAVIGATION[current].links.forEach((neighbor) => {
      if (!pending.has(neighbor)) return;
      const candidate = distances[current] + Math.sqrt(squaredDistance(NAVIGATION[current], NAVIGATION[neighbor]));
      if (candidate < distances[neighbor]) {
        distances[neighbor] = candidate;
        previous[neighbor] = current;
      }
    });
  }

  const path = [finish];
  while (path[0] !== start && previous[path[0]] !== -1) path.unshift(previous[path[0]]);
  const nextIndex = path[0] === start ? (path[1] ?? start) : start;
  return NAVIGATION[nextIndex];
};
