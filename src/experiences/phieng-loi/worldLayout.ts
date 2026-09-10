export type WorldPoint = { x: number; y: number };
export type TerrainKind = 'dirt' | 'grass' | 'wood';

export const PHIENG_LOI_WORLD = {
  artWidth: 1_672,
  artHeight: 941,
  width: 2_400,
  height: 1_350,
  viewWidth: 640,
  viewHeight: 360,
} as const;

const WORLD_SCALE_X = PHIENG_LOI_WORLD.width / PHIENG_LOI_WORLD.artWidth;
const WORLD_SCALE_Y = PHIENG_LOI_WORLD.height / PHIENG_LOI_WORLD.artHeight;
const WORLD_SCALE = (WORLD_SCALE_X + WORLD_SCALE_Y) / 2;

/** Coordinates below are authored against village-world-v2.webp's native plate. */
const worldPoint = (x: number, y: number): WorldPoint => ({
  x: Math.round(x * WORLD_SCALE_X),
  y: Math.round(y * WORLD_SCALE_Y),
});

const worldRadius = (radius: number) => Math.round(radius * WORLD_SCALE);

/** Preserves Continue saves made on the 1680×920 v1 world. */
export const migrateLegacyWorldPoint = (point: WorldPoint): WorldPoint => ({
  x: point.x * (PHIENG_LOI_WORLD.width / 1_680),
  y: point.y * (PHIENG_LOI_WORLD.height / 920),
});

type RouteSegment = {
  from: WorldPoint;
  to: WorldPoint;
  radius: number;
  terrain: TerrainKind;
};

type NavigationNode = WorldPoint & { links: number[] };

export const PHIENG_LOI_LANDMARKS = {
  playerStart: worldPoint(48, 338),
  heesunStart: worldPoint(315, 382),
  feastStart: worldPoint(755, 495),
  feastSecond: worldPoint(995, 520),
  feastField: worldPoint(620, 705),
  chief: worldPoint(775, 395),
  chickenYard: worldPoint(385, 625),
  stream: worldPoint(1_080, 560),
  streamGroup: worldPoint(1_050, 512),
  bridge: worldPoint(1_290, 648),
  vuongMeStage: worldPoint(1_490, 550),
  gate: worldPoint(100, 345),
  domino: worldPoint(1_540, 590),
  exit: worldPoint(1_640, 605),
  squash: worldPoint(380, 535),
  coffee: worldPoint(835, 500),
  macadamia: worldPoint(1_515, 580),
  dog: worldPoint(680, 420),
  buffalo: worldPoint(1_445, 288),
} as const satisfies Record<string, WorldPoint>;

/**
 * These corridors are traced against village-world-v2.webp. Social NPCs sit in
 * authored pockets just off these lanes; moving actors use the road network and
 * the single wooden crossing instead of walking over houses, crops or water.
 */
const route = (
  from: [number, number],
  to: [number, number],
  radius: number,
  terrain: TerrainKind,
): RouteSegment => ({
  from: worldPoint(...from),
  to: worldPoint(...to),
  radius: worldRadius(radius),
  terrain,
});

const ROUTES: RouteSegment[] = [
  route([24, 338], [185, 370], 50, 'dirt'),
  route([185, 370], [350, 425], 55, 'dirt'),
  route([350, 425], [520, 495], 58, 'dirt'),
  route([520, 495], [720, 548], 62, 'dirt'),
  route([720, 548], [910, 575], 64, 'dirt'),
  route([910, 575], [1_075, 600], 61, 'dirt'),
  route([1_075, 600], [1_175, 628], 54, 'dirt'),
  route([1_175, 628], [1_305, 648], 30, 'wood'),
  route([1_305, 648], [1_415, 625], 30, 'wood'),
  route([1_415, 625], [1_640, 605], 55, 'dirt'),

  // House, chief and village-table pockets branch from—not across—the road.
  route([520, 495], [640, 425], 44, 'dirt'),
  route([640, 425], [775, 395], 48, 'dirt'),
  route([720, 548], [755, 495], 48, 'dirt'),
  route([755, 495], [835, 500], 42, 'dirt'),
  route([910, 575], [995, 520], 47, 'dirt'),

  // Stream-bank and karaoke clearings remain dead ends, keeping NPCs off traffic.
  route([1_075, 600], [1_040, 525], 43, 'dirt'),
  route([1_415, 625], [1_490, 550], 46, 'dirt'),

  // Farm path supplies a second real table location and the OCOP garden pocket.
  route([350, 425], [390, 555], 39, 'grass'),
  route([390, 555], [500, 650], 43, 'grass'),
  route([500, 650], [625, 735], 46, 'dirt'),
];

const navigationNode = (x: number, y: number, links: number[]): NavigationNode => ({
  ...worldPoint(x, y),
  links,
});

const NAVIGATION: NavigationNode[] = [
  navigationNode(30, 338, [1]),
  navigationNode(185, 370, [0, 2]),
  navigationNode(350, 425, [1, 3, 17]),
  navigationNode(520, 495, [2, 4, 10]),
  navigationNode(720, 548, [3, 5, 12]),
  navigationNode(910, 575, [4, 6, 14]),
  navigationNode(1_075, 600, [5, 7, 15]),
  navigationNode(1_175, 628, [6, 8]),
  navigationNode(1_305, 648, [7, 9]),
  navigationNode(1_415, 625, [8, 16, 20]),
  navigationNode(640, 425, [3, 11]),
  navigationNode(775, 395, [10]),
  navigationNode(755, 495, [4, 13]),
  navigationNode(835, 500, [12]),
  navigationNode(995, 520, [5]),
  navigationNode(1_040, 525, [6]),
  navigationNode(1_490, 550, [9]),
  navigationNode(390, 555, [2, 18]),
  navigationNode(500, 650, [17, 19]),
  navigationNode(625, 735, [18]),
  navigationNode(1_640, 605, [9]),
];

export const HANU_ROUTE: WorldPoint[] = [
  worldPoint(100, 345),
  worldPoint(185, 370),
  worldPoint(350, 425),
  worldPoint(520, 495),
  worldPoint(720, 548),
  worldPoint(910, 575),
  worldPoint(1_075, 600),
  worldPoint(1_175, 628),
  worldPoint(1_305, 648),
  worldPoint(1_415, 625),
  worldPoint(1_540, 590),
  worldPoint(1_640, 605),
  worldPoint(1_490, 550),
  worldPoint(1_415, 625),
  worldPoint(1_305, 648),
  worldPoint(1_175, 628),
  worldPoint(1_075, 600),
  worldPoint(910, 575),
  worldPoint(720, 548),
  worldPoint(520, 495),
  worldPoint(350, 425),
  worldPoint(185, 370),
];

export const HOUSE_CALL_POINTS: WorldPoint[] = [
  worldPoint(340, 390),
  worldPoint(650, 405),
  worldPoint(820, 430),
  worldPoint(1_550, 555),
];

export const OCOP_WORLD_ITEMS = [
  { kind: 'squash' as const, ...PHIENG_LOI_LANDMARKS.squash },
  { kind: 'coffee' as const, ...PHIENG_LOI_LANDMARKS.coffee },
  { kind: 'macadamia' as const, ...PHIENG_LOI_LANDMARKS.macadamia },
];

export const WORLD_OCCLUDERS = [
  {
    id: 'bridge-front',
    ...worldPoint(1_145, 662),
    width: worldPoint(280, 0).x,
    height: worldPoint(0, 25).y,
    depthY: worldPoint(0, 680).y,
  },
  {
    id: 'lower-left-foliage',
    ...worldPoint(0, 800),
    width: worldPoint(350, 0).x,
    height: PHIENG_LOI_WORLD.height - worldPoint(0, 800).y,
    depthY: worldPoint(0, 910).y,
  },
  {
    id: 'lower-right-foliage',
    ...worldPoint(1_490, 805),
    width: PHIENG_LOI_WORLD.width - worldPoint(1_490, 0).x,
    height: PHIENG_LOI_WORLD.height - worldPoint(0, 805).y,
    depthY: worldPoint(0, 915).y,
  },
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
