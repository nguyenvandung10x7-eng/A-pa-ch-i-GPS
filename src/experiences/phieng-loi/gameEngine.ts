export const VIEW_WIDTH = 480;
export const VIEW_HEIGHT = 270;
export const WORLD_WIDTH = 2_080;
export const WORLD_HEIGHT = 1_280;

const PLAYER_START_X = 920;
const PLAYER_START_Y = 700;
const INTERACTION_RADIUS = 48;
const DASH_DURATION = 0.28;
const DASH_COOLDOWN = 2.6;
const CALL_DURATION = 3.8;
const CALL_COOLDOWN = 8;
const FEAST_DURATION = 3.1;
const CAMERA_VERTICAL_ANCHOR = 0.62;

export type PowerKind = 'squash' | 'coffee' | 'macadamia' | 'tea' | 'buffalo';
export type ZoneKind = 0 | 1 | 2 | 3;
export type GameQuality = 'low' | 'high';
export type LandmarkKind =
  | 'stilt-house'
  | 'feast'
  | 'buffalo-kitchen'
  | 'squash-field'
  | 'terraces'
  | 'macadamia-grove'
  | 'tea-hut'
  | 'waterwheel'
  | 'stream-girl'
  | 'coffee-hill'
  | 'museum'
  | 'monument';

export type InputState = {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  moveX: number;
  moveY: number;
  interactQueued: boolean;
  dashQueued: boolean;
  cheerQueued: boolean;
};

type PlayerState = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  facingX: number;
  facingY: number;
  walk: number;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  kind: 'square' | 'leaf' | 'water' | 'note';
};

type AmbientActor = {
  x: number;
  y: number;
  phase: number;
  kind: 'chicken' | 'buffalo' | 'dog' | 'villager';
  color: string;
};

type SceneryProp = {
  x: number;
  y: number;
  variant: number;
  kind: 'tree' | 'bamboo' | 'rock' | 'flower';
};

type PoiDefinition = {
  kind: LandmarkKind;
  x: number;
  y: number;
  zone: ZoneKind;
  power?: PowerKind;
};

export type GameEvent =
  | {
    type:
      | 'dash'
      | 'complete'
      | 'feast-start'
      | 'feast-finish'
      | 'cheer'
      | 'token'
      | 'interact'
      | 'jump'
      | 'land'
      | 'hit'
      | 'shield-break'
      | 'break';
  }
  | { type: 'power-start' | 'power-end'; power: PowerKind }
  | { type: 'zone-change'; zone: ZoneKind }
  | { type: 'landmark'; landmark: LandmarkKind };

export type ActivePower = { kind: PowerKind; remaining: number };

export type MapPoint = {
  kind: LandmarkKind;
  x: number;
  y: number;
  discovered: boolean;
};

export type UiSnapshot = {
  progress: number;
  zone: ZoneKind;
  elapsed: number;
  memories: number;
  totalMemories: number;
  powers: ActivePower[];
  callout: LandmarkKind | null;
  flash: PowerKind | 'cheer' | null;
  dashCooldown: number;
  cheerCooldown: number;
  cheerUnlocked: boolean;
  cheerActive: boolean;
  nearby: LandmarkKind | null;
  nearbyVisited: boolean;
  busy: boolean;
  guideTarget: LandmarkKind | null;
  playerMapX: number;
  playerMapY: number;
  mapPoints: MapPoint[];
  discovered: LandmarkKind[];
};

export type GameState = {
  player: PlayerState;
  elapsed: number;
  worldTime: number;
  cameraX: number;
  cameraY: number;
  zone: ZoneKind;
  discovered: Set<LandmarkKind>;
  activePoi: LandmarkKind | null;
  activePoiUntil: number;
  nearbyPoi: LandmarkKind | null;
  activity: 'feast' | null;
  activityUntil: number;
  completionAt: number;
  powerUntil: Record<PowerKind, number>;
  dashUntil: number;
  dashReadyAt: number;
  cheerUntil: number;
  cheerReadyAt: number;
  cheerUnlocked: boolean;
  flashUntil: number;
  flashKind: PowerKind | 'cheer' | null;
  particles: Particle[];
  quality: GameQuality;
  reducedMotion: boolean;
  complete: boolean;
};

export const POWER_DURATION: Record<PowerKind, number> = {
  squash: 12,
  coffee: 13,
  macadamia: 14,
  tea: 15,
  buffalo: 12,
};

export const POWER_KINDS: PowerKind[] = ['squash', 'coffee', 'macadamia', 'tea', 'buffalo'];

export const LANDMARK_KINDS: LandmarkKind[] = [
  'stilt-house',
  'feast',
  'buffalo-kitchen',
  'squash-field',
  'terraces',
  'macadamia-grove',
  'tea-hut',
  'waterwheel',
  'stream-girl',
  'coffee-hill',
  'museum',
  'monument',
];

const POIS: PoiDefinition[] = [
  { kind: 'stilt-house', x: 520, y: 530, zone: 0 },
  { kind: 'feast', x: 860, y: 680, zone: 0 },
  { kind: 'buffalo-kitchen', x: 690, y: 745, zone: 0, power: 'buffalo' },
  { kind: 'squash-field', x: 265, y: 270, zone: 1, power: 'squash' },
  { kind: 'terraces', x: 1_020, y: 235, zone: 1 },
  { kind: 'macadamia-grove', x: 1_210, y: 520, zone: 1, power: 'macadamia' },
  { kind: 'tea-hut', x: 820, y: 345, zone: 1, power: 'tea' },
  { kind: 'waterwheel', x: 1_385, y: 500, zone: 2 },
  { kind: 'stream-girl', x: 1_675, y: 655, zone: 2 },
  { kind: 'coffee-hill', x: 1_775, y: 1_025, zone: 3, power: 'coffee' },
  { kind: 'museum', x: 445, y: 1_045, zone: 3 },
  { kind: 'monument', x: 870, y: 1_055, zone: 3 },
];

const AMBIENT_ACTORS: AmbientActor[] = [
  { x: 748, y: 595, phase: 0.2, kind: 'chicken', color: '#cf783e' },
  { x: 790, y: 620, phase: 1.6, kind: 'chicken', color: '#e8c167' },
  { x: 610, y: 650, phase: 2.4, kind: 'dog', color: '#8a613d' },
  { x: 1_125, y: 645, phase: 0.8, kind: 'buffalo', color: '#493b31' },
  { x: 1_590, y: 485, phase: 1.2, kind: 'villager', color: '#7f4052' },
  { x: 1_820, y: 940, phase: 3.1, kind: 'villager', color: '#315e65' },
  { x: 510, y: 920, phase: 4.2, kind: 'villager', color: '#9d5941' },
];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const distance = (ax: number, ay: number, bx: number, by: number) => Math.hypot(ax - bx, ay - by);
const hash2 = (x: number, y: number) => {
  const value = Math.sin(x * 127.1 + y * 311.7) * 43_758.5453;
  return value - Math.floor(value);
};

const scenery: SceneryProp[] = (() => {
  const props: SceneryProp[] = [];
  for (let y = 44; y < WORLD_HEIGHT - 36; y += 42) {
    for (let x = 42; x < WORLD_WIDTH - 36; x += 44) {
      const chance = hash2(x, y);
      const edge = x < 125 || x > WORLD_WIDTH - 135 || y < 120 || y > WORLD_HEIGHT - 90;
      const grove = (x > 1_690 && y > 900) || (x > 1_100 && x < 1_330 && y > 390 && y < 620);
      const clearVillage = x > 380 && x < 1_020 && y > 430 && y < 820;
      const clearCity = x > 260 && x < 1_050 && y > 850;
      const clearRiver = x > 1_310 && x < 1_560;
      if ((edge && chance > 0.38) || (grove && chance > 0.52) || (!clearVillage && !clearCity && !clearRiver && chance > 0.88)) {
        const kind: SceneryProp['kind'] =
          chance > 0.95 ? 'bamboo' : chance > 0.9 ? 'tree' : chance > 0.87 ? 'rock' : 'flower';
        props.push({
          x: x + Math.floor(hash2(y, x) * 20 - 10),
          y: y + Math.floor(hash2(x + 9, y - 7) * 18 - 9),
          variant: Math.floor(chance * 5),
          kind,
        });
      }
    }
  }
  return props;
})();

const solidRects = [
  { x: 420, y: 365, width: 205, height: 118 },
  { x: 705, y: 455, width: 165, height: 100 },
  { x: 560, y: 820, width: 150, height: 86 },
  { x: 330, y: 880, width: 230, height: 128 },
  { x: 760, y: 870, width: 220, height: 118 },
  { x: 1_690, y: 900, width: 176, height: 84 },
];

const riverCenterX = (y: number) => 1_475 + Math.sin(y * 0.008) * 42;
const isBridgeY = (y: number) => (y > 455 && y < 535) || (y > 835 && y < 915);

const isBlocked = (x: number, y: number) => {
  if (x < 28 || y < 38 || x > WORLD_WIDTH - 28 || y > WORLD_HEIGHT - 26) return true;
  if (!isBridgeY(y) && Math.abs(x - riverCenterX(y)) < 34) return true;
  return solidRects.some((rect) => x > rect.x - 7 && x < rect.x + rect.width + 7 && y > rect.y - 5 && y < rect.y + rect.height + 8);
};

const zoneAt = (x: number, y: number): ZoneKind => {
  if (x > 1_330 && y < 900) return 2;
  if (y > 820) return 3;
  if (y < 470 || x < 355) return 1;
  return 0;
};

const addParticles = (
  game: GameState,
  x: number,
  y: number,
  colors: string[],
  count: number,
  kind: Particle['kind'] = 'square',
  strength = 28,
) => {
  const qualityFactor = game.quality === 'low' ? 0.55 : 1;
  const motionFactor = game.reducedMotion ? 0.35 : 1;
  const actual = Math.max(2, Math.round(count * qualityFactor * motionFactor));
  const limit = game.quality === 'low' ? 55 : 110;
  for (let index = 0; index < actual && game.particles.length < limit; index += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = strength * (0.3 + Math.random() * 0.75);
    const life = 0.45 + Math.random() * 0.85;
    game.particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - strength * 0.16,
      life,
      maxLife: life,
      size: 1 + Math.floor(Math.random() * 2),
      color: colors[Math.floor(Math.random() * colors.length)],
      kind,
    });
  }
};

const updateParticles = (game: GameState, dt: number) => {
  game.particles = game.particles.filter((particle) => {
    particle.life -= dt;
    if (particle.life <= 0) return false;
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.vx *= 1 - dt * 1.8;
    particle.vy += (particle.kind === 'leaf' ? 2 : 12) * dt;
    return true;
  });
};

export const createGame = (quality: GameQuality, reducedMotion: boolean): GameState => ({
  player: {
    x: PLAYER_START_X,
    y: PLAYER_START_Y,
    vx: 0,
    vy: 0,
    facingX: 0,
    facingY: 1,
    walk: 0,
  },
  elapsed: 0,
  worldTime: 0,
  cameraX: clamp(PLAYER_START_X - VIEW_WIDTH / 2, 0, WORLD_WIDTH - VIEW_WIDTH),
  cameraY: clamp(PLAYER_START_Y - VIEW_HEIGHT * CAMERA_VERTICAL_ANCHOR, 0, WORLD_HEIGHT - VIEW_HEIGHT),
  zone: 0,
  discovered: new Set<LandmarkKind>(),
  activePoi: null,
  activePoiUntil: 0,
  nearbyPoi: null,
  activity: null,
  activityUntil: 0,
  completionAt: 0,
  powerUntil: {
    squash: 0,
    coffee: 0,
    macadamia: 0,
    tea: 0,
    buffalo: 0,
  },
  dashUntil: 0,
  dashReadyAt: 0,
  cheerUntil: 0,
  cheerReadyAt: 0,
  cheerUnlocked: false,
  flashUntil: 0,
  flashKind: null,
  particles: [],
  quality,
  reducedMotion,
  complete: false,
});

const activePowers = (game: GameState): ActivePower[] => POWER_KINDS
  .filter((kind) => game.powerUntil[kind] > game.elapsed)
  .map((kind) => ({
    kind,
    remaining: clamp((game.powerUntil[kind] - game.elapsed) / POWER_DURATION[kind], 0, 1),
  }));

const nearestUndiscovered = (game: GameState) => POIS
  .filter((poi) => !game.discovered.has(poi.kind))
  .sort((a, b) => (
    distance(game.player.x, game.player.y, a.x, a.y)
    - distance(game.player.x, game.player.y, b.x, b.y)
  ))[0] ?? null;

export const createUiSnapshot = (game: GameState): UiSnapshot => ({
  progress: game.discovered.size / POIS.length,
  zone: game.zone,
  elapsed: game.elapsed,
  memories: game.discovered.size,
  totalMemories: POIS.length,
  powers: activePowers(game),
  callout: game.activePoiUntil > game.elapsed ? game.activePoi : null,
  flash: game.flashUntil > game.elapsed ? game.flashKind : null,
  dashCooldown: clamp((game.dashReadyAt - game.elapsed) / DASH_COOLDOWN, 0, 1),
  cheerCooldown: clamp((game.cheerReadyAt - game.elapsed) / CALL_COOLDOWN, 0, 1),
  cheerUnlocked: game.cheerUnlocked,
  cheerActive: game.cheerUntil > game.elapsed,
  nearby: game.nearbyPoi,
  nearbyVisited: game.nearbyPoi ? game.discovered.has(game.nearbyPoi) : false,
  busy: game.activity !== null,
  guideTarget: game.cheerUntil > game.elapsed ? nearestUndiscovered(game)?.kind ?? null : null,
  playerMapX: game.player.x / WORLD_WIDTH,
  playerMapY: game.player.y / WORLD_HEIGHT,
  mapPoints: POIS.map((poi) => ({
    kind: poi.kind,
    x: poi.x / WORLD_WIDTH,
    y: poi.y / WORLD_HEIGHT,
    discovered: game.discovered.has(poi.kind),
  })),
  discovered: [...game.discovered],
});

const clearQueuedInput = (input: InputState) => {
  input.interactQueued = false;
  input.dashQueued = false;
  input.cheerQueued = false;
};

const powerColors: Record<PowerKind, string[]> = {
  squash: ['#9ec55a', '#d7ed83', '#fff2a1'],
  coffee: ['#a95532', '#e4904d', '#ffd47a'],
  macadamia: ['#b79555', '#ead58c', '#fff0bc'],
  tea: ['#77ac83', '#bde2a0', '#edffcf'],
  buffalo: ['#8d4330', '#df7747', '#ffc071'],
};

const discoverPoi = (game: GameState, poi: PoiDefinition, events: GameEvent[]) => {
  const isNew = !game.discovered.has(poi.kind);
  game.activePoi = poi.kind;
  game.activePoiUntil = game.elapsed + (isNew ? 4.4 : 2.4);
  events.push({ type: 'interact' });

  if (isNew) {
    game.discovered.add(poi.kind);
    events.push({ type: 'landmark', landmark: poi.kind });
    events.push({ type: 'token' });
    addParticles(game, poi.x, poi.y - 8, ['#f4d477', '#fff0b0', '#8fc28b'], 22, 'leaf', 36);
  }

  if (poi.power) {
    game.powerUntil[poi.power] = game.elapsed + POWER_DURATION[poi.power];
    game.flashKind = poi.power;
    game.flashUntil = game.elapsed + 1.45;
    events.push({ type: 'power-start', power: poi.power });
    addParticles(game, game.player.x, game.player.y - 8, powerColors[poi.power], 28, 'square', 42);
  }

  if (game.discovered.size === POIS.length && game.completionAt === 0) {
    game.completionAt = game.elapsed + 4.8;
  }
};

const interact = (game: GameState, events: GameEvent[]) => {
  if (!game.nearbyPoi || game.activity) return;
  const poi = POIS.find((candidate) => candidate.kind === game.nearbyPoi);
  if (!poi) return;

  if (poi.kind === 'feast' && !game.discovered.has('feast')) {
    game.activity = 'feast';
    game.activityUntil = game.elapsed + FEAST_DURATION;
    game.player.x = poi.x;
    game.player.y = poi.y + 17;
    game.player.vx = 0;
    game.player.vy = 0;
    game.activePoi = 'feast';
    game.activePoiUntil = game.activityUntil + 2.6;
    events.push({ type: 'feast-start' });
    return;
  }

  discoverPoi(game, poi, events);
};

const finishActivity = (game: GameState, events: GameEvent[]) => {
  if (game.activity !== 'feast' || game.elapsed < game.activityUntil) return;
  game.activity = null;
  game.cheerUnlocked = true;
  const feast = POIS.find((poi) => poi.kind === 'feast');
  if (feast) discoverPoi(game, feast, events);
  events.push({ type: 'feast-finish' });
  game.flashKind = 'cheer';
  game.flashUntil = game.elapsed + 0.5;
  addParticles(game, game.player.x, game.player.y - 12, ['#f4cd65', '#e9854f', '#fff1ad'], 34, 'note', 50);
};

const updateNearby = (game: GameState) => {
  const radius = game.powerUntil.tea > game.elapsed ? INTERACTION_RADIUS * 1.5 : INTERACTION_RADIUS;
  const nearest = POIS
    .map((poi) => ({ poi, value: distance(game.player.x, game.player.y, poi.x, poi.y) }))
    .filter((entry) => entry.value <= radius)
    .sort((a, b) => a.value - b.value)[0];
  game.nearbyPoi = nearest?.poi.kind ?? null;
};

const updateCamera = (game: GameState, dt: number) => {
  const targetX = clamp(game.player.x - VIEW_WIDTH / 2, 0, WORLD_WIDTH - VIEW_WIDTH);
  const targetY = clamp(game.player.y - VIEW_HEIGHT * CAMERA_VERTICAL_ANCHOR, 0, WORLD_HEIGHT - VIEW_HEIGHT);
  const response = game.reducedMotion ? 1 : 1 - Math.exp(-dt * 6.5);
  game.cameraX += (targetX - game.cameraX) * response;
  game.cameraY += (targetY - game.cameraY) * response;
};

export const stepGame = (game: GameState, input: InputState, dt: number): GameEvent[] => {
  const events: GameEvent[] = [];
  const previousElapsed = game.elapsed;
  game.elapsed += dt;
  game.worldTime += dt;

  POWER_KINDS.forEach((power) => {
    if (game.powerUntil[power] > previousElapsed && game.powerUntil[power] <= game.elapsed) {
      events.push({ type: 'power-end', power });
    }
  });

  finishActivity(game, events);

  if (game.completionAt > 0 && game.elapsed >= game.completionAt && !game.complete) {
    game.complete = true;
    events.push({ type: 'complete' });
  }

  let moveX = input.moveX;
  let moveY = input.moveY;
  if (Math.abs(moveX) < 0.08) moveX = Number(input.right) - Number(input.left);
  if (Math.abs(moveY) < 0.08) moveY = Number(input.down) - Number(input.up);
  const length = Math.hypot(moveX, moveY);
  if (length > 1) {
    moveX /= length;
    moveY /= length;
  }

  if (!game.activity && !game.complete) {
    if (input.dashQueued && game.elapsed >= game.dashReadyAt && length > 0.08) {
      game.dashUntil = game.elapsed + DASH_DURATION;
      game.dashReadyAt = game.elapsed + (game.powerUntil.macadamia > game.elapsed ? DASH_COOLDOWN * 0.56 : DASH_COOLDOWN);
      events.push({ type: 'dash' });
      addParticles(game, game.player.x, game.player.y, ['#efe0a4', '#b8d38d'], 14, 'leaf', 32);
    }

    if (input.cheerQueued && game.cheerUnlocked && game.elapsed >= game.cheerReadyAt) {
      game.cheerUntil = game.elapsed + CALL_DURATION;
      game.cheerReadyAt = game.elapsed + (game.powerUntil.tea > game.elapsed ? CALL_COOLDOWN * 0.62 : CALL_COOLDOWN);
      game.flashKind = 'cheer';
      game.flashUntil = game.elapsed + 0.32;
      events.push({ type: 'cheer' });
      addParticles(game, game.player.x, game.player.y - 8, ['#ffd66d', '#f08c57', '#fff0ae'], 30, 'note', 48);
    }

    const coffee = game.powerUntil.coffee > game.elapsed;
    const tea = game.powerUntil.tea > game.elapsed;
    const buffalo = game.powerUntil.buffalo > game.elapsed;
    const baseSpeed = coffee ? 78 : tea ? 52 : 60;
    const dashSpeed = game.dashUntil > game.elapsed ? 2.35 : 1;
    const strengthSpeed = buffalo ? 1.08 : 1;
    const targetVx = moveX * baseSpeed * dashSpeed * strengthSpeed;
    const targetVy = moveY * baseSpeed * dashSpeed * strengthSpeed;
    const response = 1 - Math.exp(-dt * (dashSpeed > 1 ? 21 : 13));
    game.player.vx += (targetVx - game.player.vx) * response;
    game.player.vy += (targetVy - game.player.vy) * response;

    const nextX = game.player.x + game.player.vx * dt;
    if (!isBlocked(nextX, game.player.y)) game.player.x = nextX;
    else game.player.vx = 0;
    const nextY = game.player.y + game.player.vy * dt;
    if (!isBlocked(game.player.x, nextY)) game.player.y = nextY;
    else game.player.vy = 0;

    if (length > 0.1) {
      game.player.facingX = moveX;
      game.player.facingY = moveY;
      game.player.walk += dt * (coffee ? 12 : 8.5) * dashSpeed;
      if (game.quality === 'high' && game.player.walk % 1 < dt * 3 && hash2(game.player.x, game.worldTime) > 0.62) {
        addParticles(game, game.player.x, game.player.y + 4, ['#a78b62', '#d0b781'], 2, 'square', 8);
      }
    }
  } else {
    game.player.vx = 0;
    game.player.vy = 0;
  }

  updateNearby(game);
  if (input.interactQueued) interact(game, events);

  const nextZone = zoneAt(game.player.x, game.player.y);
  if (nextZone !== game.zone) {
    game.zone = nextZone;
    events.push({ type: 'zone-change', zone: nextZone });
  }

  updateParticles(game, dt);
  updateCamera(game, dt);
  clearQueuedInput(input);
  return events;
};

const roundedRect = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) => {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + safeRadius, y);
  context.lineTo(x + width - safeRadius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
  context.lineTo(x + width, y + height - safeRadius);
  context.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height);
  context.lineTo(x + safeRadius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
  context.lineTo(x, y + safeRadius);
  context.quadraticCurveTo(x, y, x + safeRadius, y);
  context.closePath();
};

const inView = (game: GameState, x: number, y: number, margin = 100) => (
  x > game.cameraX - margin
  && x < game.cameraX + VIEW_WIDTH + margin
  && y > game.cameraY - margin
  && y < game.cameraY + VIEW_HEIGHT + margin
);

const drawGround = (context: CanvasRenderingContext2D, game: GameState) => {
  context.fillStyle = '#78945d';
  context.fillRect(game.cameraX, game.cameraY, VIEW_WIDTH, VIEW_HEIGHT);

  const startX = Math.floor(game.cameraX / 16) * 16;
  const startY = Math.floor(game.cameraY / 16) * 16;
  for (let y = startY; y < game.cameraY + VIEW_HEIGHT + 16; y += 16) {
    for (let x = startX; x < game.cameraX + VIEW_WIDTH + 16; x += 16) {
      const value = hash2(x / 16, y / 16);
      if (y < 126) context.fillStyle = value > 0.7 ? '#768a59' : value < 0.2 ? '#5c734e' : '#687f51';
      else if (y > 815) context.fillStyle = value > 0.7 ? '#91a274' : value < 0.2 ? '#7c9067' : '#879b6e';
      else context.fillStyle = value > 0.7 ? '#829c63' : value < 0.2 ? '#6f8956' : '#78945d';
      context.fillRect(x, y, 16, 16);
      if (game.quality === 'high' && value > 0.58) {
        context.fillStyle = value > 0.82 ? '#b5bd70' : '#5d7e50';
        context.fillRect(x + 4 + Math.floor(value * 7), y + 4, 1, 3);
      }
    }
  }
};

const drawCityPaving = (context: CanvasRenderingContext2D) => {
  context.fillStyle = 'rgba(174, 158, 112, .34)';
  context.fillRect(248, 830, 820, 338);
  for (let y = 838; y < 1_165; y += 18) {
    for (let x = 255; x < 1_065; x += 22) {
      const offset = (Math.floor(y / 18) % 2) * 11;
      context.fillStyle = hash2(x, y) > 0.5 ? 'rgba(222, 202, 148, .18)' : 'rgba(91, 112, 79, .16)';
      context.fillRect(x + offset, y, 18, 1);
      context.fillRect(x + offset, y, 1, 12);
    }
  }
};

const drawRoads = (context: CanvasRenderingContext2D) => {
  const paths: Array<Array<[number, number]>> = [
    [[920, 700], [780, 650], [600, 615], [500, 545]],
    [[920, 700], [700, 770], [520, 890], [445, 1_045]],
    [[920, 700], [875, 890], [870, 1_055]],
    [[920, 700], [1_130, 620], [1_360, 500], [1_485, 495], [1_675, 655]],
    [[920, 700], [1_160, 790], [1_450, 880], [1_775, 1_025]],
    [[920, 700], [850, 500], [820, 345], [1_020, 235]],
    [[820, 345], [550, 310], [265, 270]],
    [[1_020, 235], [1_180, 360], [1_210, 520]],
  ];

  context.lineCap = 'round';
  context.lineJoin = 'round';
  paths.forEach((points) => {
    context.beginPath();
    points.forEach(([x, y], index) => {
      if (index === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    });
    context.strokeStyle = '#566f4f';
    context.lineWidth = 18;
    context.stroke();
    context.strokeStyle = '#b6a878';
    context.lineWidth = 13;
    context.stroke();
    context.strokeStyle = '#c9bb88';
    context.lineWidth = 7;
    context.stroke();
  });
};

const drawRiver = (context: CanvasRenderingContext2D, game: GameState) => {
  context.beginPath();
  for (let y = -40; y <= WORLD_HEIGHT + 60; y += 32) {
    const x = riverCenterX(y);
    if (y === -40) context.moveTo(x, y);
    else context.lineTo(x, y);
  }
  context.lineCap = 'round';
  context.strokeStyle = '#426b6e';
  context.lineWidth = 78;
  context.stroke();
  context.strokeStyle = '#6da5a3';
  context.lineWidth = 64;
  context.stroke();
  context.strokeStyle = '#91c8bd';
  context.lineWidth = 42;
  context.stroke();

  const startY = Math.floor(game.cameraY / 24) * 24;
  for (let y = startY; y < game.cameraY + VIEW_HEIGHT + 28; y += 24) {
    const x = riverCenterX(y);
    const wave = Math.sin(game.worldTime * 1.8 + y * 0.06) * 5;
    context.fillStyle = 'rgba(222, 244, 218, .58)';
    context.fillRect(x - 16 + wave, y, 10, 1);
    context.fillRect(x + 7 - wave * 0.45, y + 9, 14, 1);
  }
};

const drawBridge = (context: CanvasRenderingContext2D, y: number) => {
  const x = riverCenterX(y);
  context.fillStyle = '#5d4432';
  context.fillRect(x - 47, y - 13, 94, 27);
  context.fillStyle = '#b3844f';
  for (let offset = -42; offset <= 36; offset += 9) context.fillRect(x + offset, y - 11, 7, 23);
  context.fillStyle = '#e0b66e';
  context.fillRect(x - 47, y - 13, 94, 2);
  context.fillRect(x - 47, y + 11, 94, 2);
};

const drawWaterfall = (context: CanvasRenderingContext2D, time: number) => {
  const x = riverCenterX(92);
  context.fillStyle = '#4f5f50';
  context.beginPath();
  context.moveTo(x - 105, 36);
  context.lineTo(x - 52, 18);
  context.lineTo(x - 20, 58);
  context.lineTo(x + 26, 28);
  context.lineTo(x + 104, 52);
  context.lineTo(x + 92, 146);
  context.lineTo(x - 92, 146);
  context.closePath();
  context.fill();
  context.fillStyle = '#6f7b61';
  context.fillRect(x - 78, 58, 44, 46);
  context.fillRect(x + 32, 55, 52, 55);
  context.fillStyle = '#84bbb5';
  context.fillRect(x - 27, 48, 52, 101);
  context.fillStyle = '#d7eee0';
  context.fillRect(x - 18 + Math.sin(time * 2) * 2, 48, 9, 86);
  context.fillRect(x + 6 + Math.sin(time * 1.7 + 1) * 2, 53, 7, 82);
  context.fillStyle = 'rgba(229, 247, 231, .72)';
  context.fillRect(x - 31, 137, 64, 5);
  context.fillRect(x - 20, 145, 40, 3);
};

const drawTerraces = (context: CanvasRenderingContext2D, time: number) => {
  context.save();
  context.translate(1_020, 188);
  context.fillStyle = '#60784e';
  context.beginPath();
  context.ellipse(0, 35, 210, 110, -0.04, Math.PI, Math.PI * 2);
  context.fill();
  const colors = ['#9aab5f', '#b7bc63', '#d0bd65', '#8fa45b'];
  for (let index = 0; index < 7; index += 1) {
    context.strokeStyle = colors[index % colors.length];
    context.lineWidth = 8;
    context.beginPath();
    context.ellipse(0, 43 + index * 9, 192 - index * 23, 76 - index * 6, 0, Math.PI, Math.PI * 2);
    context.stroke();
    context.strokeStyle = 'rgba(239, 216, 126, .45)';
    context.lineWidth = 1;
    context.stroke();
  }
  context.fillStyle = '#d8e08a';
  for (let index = 0; index < 24; index += 1) {
    const angle = index * 0.61 + time * 0.015;
    const radius = 28 + (index % 5) * 24;
    context.fillRect(Math.cos(angle) * radius, 45 + Math.sin(angle) * radius * 0.32, 1, 3);
  }
  context.restore();
};

const drawSquashField = (context: CanvasRenderingContext2D, time: number) => {
  context.fillStyle = '#735a3c';
  context.fillRect(126, 145, 284, 194);
  context.fillStyle = '#987649';
  for (let y = 160; y < 332; y += 28) context.fillRect(130, y, 275, 8);
  for (let y = 174; y < 330; y += 28) {
    for (let x = 145; x < 398; x += 34) {
      const sway = Math.round(Math.sin(time * 1.7 + x * 0.05 + y) * 1);
      context.fillStyle = '#3e7245';
      context.fillRect(x + sway, y - 6, 8, 3);
      context.fillRect(x + 3, y - 10, 3, 11);
      if ((x + y) % 3 < 1) {
        context.fillStyle = '#9ac55d';
        context.fillRect(x + 4, y, 9, 6);
        context.fillStyle = '#d8e27a';
        context.fillRect(x + 6, y + 1, 4, 1);
      }
    }
  }
};

const drawCoffeeHill = (context: CanvasRenderingContext2D, time: number) => {
  context.fillStyle = '#657a4b';
  context.beginPath();
  context.ellipse(1_775, 1_034, 235, 152, 0.08, 0, Math.PI * 2);
  context.fill();
  for (let row = 0; row < 6; row += 1) {
    for (let column = 0; column < 10; column += 1) {
      const x = 1_585 + column * 40 + (row % 2) * 11;
      const y = 925 + row * 42;
      context.fillStyle = '#36563c';
      context.fillRect(x - 7, y - 6, 14, 12);
      context.fillStyle = '#52784a';
      context.fillRect(x - 10, y - 3, 20, 7);
      context.fillStyle = '#b8503c';
      context.fillRect(x - 5, y + ((column + row) % 3), 2, 2);
      context.fillRect(x + 4, y + 2, 2, 2);
      if (Math.sin(time + column) > 0.75) {
        context.fillStyle = '#f4ce78';
        context.fillRect(x, y - 8, 1, 1);
      }
    }
  }
};

const drawCornfield = (context: CanvasRenderingContext2D, time: number) => {
  context.fillStyle = '#8a8748';
  context.fillRect(75, 430, 250, 240);
  for (let y = 442; y < 665; y += 18) {
    for (let x = 88; x < 318; x += 13) {
      const sway = Math.round(Math.sin(time * 1.6 + x * 0.07 + y * 0.03));
      context.fillStyle = '#436f3f';
      context.fillRect(x + sway, y - 8, 2, 10);
      context.fillStyle = '#d7b850';
      context.fillRect(x + 2 + sway, y - 5, 2, 4);
    }
  }
};

const drawTree = (context: CanvasRenderingContext2D, x: number, y: number, variant: number) => {
  context.fillStyle = 'rgba(32, 52, 38, .24)';
  context.fillRect(x - 7, y + 5, 19, 5);
  context.fillStyle = '#59452f';
  context.fillRect(x - 2, y - 9, 4, 17);
  const dark = variant % 2 === 0 ? '#315f43' : '#3f6948';
  const light = variant % 2 === 0 ? '#5d874f' : '#749454';
  context.fillStyle = dark;
  context.fillRect(x - 10, y - 22, 21, 15);
  context.fillRect(x - 6, y - 29, 14, 10);
  context.fillStyle = light;
  context.fillRect(x - 7, y - 25, 9, 5);
  context.fillRect(x + 3, y - 18, 6, 5);
};

const drawBamboo = (context: CanvasRenderingContext2D, x: number, y: number, variant: number) => {
  const height = 22 + variant * 2;
  context.fillStyle = '#385c3d';
  context.fillRect(x - 5, y - height, 2, height + 3);
  context.fillRect(x, y - height - 4, 2, height + 7);
  context.fillRect(x + 5, y - height + 3, 2, height);
  context.fillStyle = '#759755';
  context.fillRect(x - 10, y - height + 2, 7, 2);
  context.fillRect(x + 2, y - height + 7, 9, 2);
  context.fillRect(x - 4, y - 10, 8, 2);
};

const drawStiltHouse = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  accent: string,
) => {
  context.fillStyle = 'rgba(40, 45, 33, .27)';
  context.fillRect(x - 8, y + 63, width + 28, 12);
  context.fillStyle = '#59442e';
  context.fillRect(x + 14, y + 42, 5, 30);
  context.fillRect(x + width - 20, y + 42, 5, 30);
  context.fillStyle = '#a97949';
  context.fillRect(x + 5, y + 20, width - 10, 35);
  context.fillStyle = '#d0a76b';
  for (let line = x + 12; line < x + width - 10; line += 13) context.fillRect(line, y + 22, 2, 30);
  context.fillStyle = '#2f4439';
  context.fillRect(x + width * 0.56, y + 31, 18, 24);
  context.fillStyle = '#332f28';
  context.beginPath();
  context.moveTo(x - 14, y + 21);
  context.lineTo(x + width / 2, y - 14);
  context.lineTo(x + width + 14, y + 21);
  context.closePath();
  context.fill();
  context.fillStyle = accent;
  context.beginPath();
  context.moveTo(x - 9, y + 18);
  context.lineTo(x + width / 2, y - 9);
  context.lineTo(x + width + 9, y + 18);
  context.closePath();
  context.fill();
  context.strokeStyle = 'rgba(255, 226, 145, .45)';
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(x + 3, y + 15);
  context.lineTo(x + width / 2, y - 4);
  context.lineTo(x + width - 3, y + 15);
  context.stroke();
  context.fillStyle = '#6f5133';
  context.fillRect(x + width - 28, y + 52, 4, 26);
  context.fillRect(x + width - 5, y + 52, 4, 26);
  for (let step = 0; step < 4; step += 1) context.fillRect(x + width - 28, y + 56 + step * 6, 27, 2);
};

const drawFeast = (context: CanvasRenderingContext2D, game: GameState) => {
  const x = 860;
  const y = 664;
  context.fillStyle = 'rgba(37, 45, 32, .28)';
  context.fillRect(x - 39, y + 14, 78, 16);
  context.fillStyle = '#b64e3e';
  context.fillRect(x - 27, y - 6, 54, 34);
  context.fillStyle = '#e7c868';
  for (let stripe = -22; stripe < 25; stripe += 9) context.fillRect(x + stripe, y - 4, 3, 30);
  context.fillStyle = '#f3dca0';
  context.fillRect(x - 9, y + 3, 18, 8);
  context.fillStyle = '#769356';
  context.fillRect(x - 5, y + 5, 4, 3);
  context.fillStyle = '#a9543e';
  context.fillRect(x + 2, y + 5, 4, 3);

  const people = [
    [-35, -1, '#914c3f'],
    [35, -1, '#315e65'],
    [-24, 32, '#6f7250'],
    [24, 33, '#a76742'],
    [0, -20, '#4f665c'],
  ] as const;
  people.forEach(([dx, dy, color], index) => {
    const wave = game.cheerUntil > game.elapsed ? Math.sin(game.elapsed * 12 + index) * 2 : 0;
    context.fillStyle = '#c58b62';
    context.fillRect(x + dx - 2, y + dy - 10 + wave, 5, 5);
    context.fillStyle = color;
    context.fillRect(x + dx - 5, y + dy - 5 + wave, 10, 10);
    context.fillStyle = '#3e342c';
    context.fillRect(x + dx - 7, y + dy + 4, 5, 3);
    context.fillRect(x + dx + 3, y + dy + 4, 5, 3);
  });
};

const drawBuffaloKitchen = (context: CanvasRenderingContext2D, time: number) => {
  context.fillStyle = '#4d382b';
  context.fillRect(642, 708, 95, 43);
  context.fillStyle = '#7e5035';
  context.beginPath();
  context.moveTo(632, 709);
  context.lineTo(690, 680);
  context.lineTo(747, 709);
  context.closePath();
  context.fill();
  context.fillStyle = '#d38c4d';
  context.fillRect(667, 727, 48, 4);
  context.fillStyle = '#2a2925';
  for (let item = 0; item < 4; item += 1) context.fillRect(671 + item * 11, 714, 5, 17);
  const smoke = Math.sin(time * 1.4) * 3;
  context.fillStyle = 'rgba(226, 218, 186, .48)';
  context.fillRect(713 + smoke, 687, 4, 8);
  context.fillRect(709 - smoke * 0.4, 678, 5, 6);
};

const drawTeaHut = (context: CanvasRenderingContext2D) => {
  context.fillStyle = '#5a4731';
  context.fillRect(777, 297, 88, 54);
  context.fillStyle = '#6d8c58';
  context.beginPath();
  context.moveTo(766, 300);
  context.lineTo(821, 272);
  context.lineTo(875, 300);
  context.closePath();
  context.fill();
  context.fillStyle = '#d8bc75';
  context.fillRect(790, 317, 26, 16);
  context.fillStyle = '#35513f';
  context.fillRect(827, 309, 23, 28);
};

const drawMacadamiaGrove = (context: CanvasRenderingContext2D) => {
  for (let row = 0; row < 4; row += 1) {
    for (let column = 0; column < 5; column += 1) {
      const x = 1_140 + column * 34 + (row % 2) * 8;
      const y = 434 + row * 33;
      drawTree(context, x, y, column + row);
      context.fillStyle = '#e4c77a';
      context.fillRect(x - 5, y - 20, 2, 2);
      context.fillRect(x + 4, y - 14, 2, 2);
    }
  }
};

const drawWaterwheel = (context: CanvasRenderingContext2D, time: number) => {
  const x = 1_407;
  const y = 481;
  context.save();
  context.translate(x, y);
  context.strokeStyle = '#6a482d';
  context.lineWidth = 3;
  context.beginPath();
  context.arc(0, 0, 31, 0, Math.PI * 2);
  context.stroke();
  context.strokeStyle = '#c09558';
  context.lineWidth = 2;
  context.beginPath();
  context.arc(0, 0, 25, 0, Math.PI * 2);
  context.stroke();
  context.rotate(time * 0.42);
  for (let spoke = 0; spoke < 12; spoke += 1) {
    context.rotate(Math.PI / 6);
    context.fillStyle = '#d0a467';
    context.fillRect(-2, -30, 4, 30);
    context.fillStyle = '#765037';
    context.fillRect(-5, -34, 10, 5);
  }
  context.fillStyle = '#5b3f2c';
  context.fillRect(-4, -4, 8, 8);
  context.restore();
};

const drawStreamScene = (context: CanvasRenderingContext2D, time: number) => {
  const x = 1_675;
  const y = 634;
  context.fillStyle = '#587354';
  context.fillRect(x - 70, y + 18, 140, 25);
  context.fillStyle = '#778676';
  context.fillRect(x - 42, y + 2, 28, 18);
  context.fillRect(x + 25, y + 7, 38, 17);
  for (let fish = 0; fish < 5; fish += 1) {
    const fishX = x - 42 + ((time * (8 + fish) + fish * 23) % 95);
    const fishY = y + 31 + Math.sin(time * 1.5 + fish) * 3;
    context.fillStyle = '#e9d59a';
    context.fillRect(fishX, fishY, 4, 1);
  }

  // The adult NPC is framed from a respectful distance behind water and foliage.
  context.fillStyle = '#2e2928';
  context.fillRect(x - 3, y - 22, 7, 7);
  context.fillStyle = '#c88d69';
  context.fillRect(x - 2, y - 15, 5, 7);
  context.fillStyle = '#315f62';
  context.fillRect(x - 6, y - 9, 13, 14);
  context.fillStyle = '#b64f52';
  context.fillRect(x - 6, y - 2, 13, 3);
  context.fillStyle = '#283d40';
  context.fillRect(x - 5, y + 5, 4, 12);
  context.fillRect(x + 2, y + 5, 4, 12);
  context.fillStyle = '#416d52';
  context.fillRect(x - 16, y + 3, 13, 17);
  context.fillRect(x + 6, y + 1, 18, 20);
};

const drawMuseum = (context: CanvasRenderingContext2D) => {
  const x = 330;
  const y = 880;
  context.fillStyle = 'rgba(36, 43, 34, .28)';
  context.fillRect(x - 10, y + 110, 250, 20);
  context.fillStyle = '#b99463';
  context.fillRect(x, y + 48, 230, 80);
  context.fillStyle = '#413f38';
  for (let column = 0; column < 12; column += 1) context.fillRect(x + 10 + column * 19, y + 55, 2, 65);
  context.fillStyle = '#7c553c';
  context.beginPath();
  context.moveTo(x - 14, y + 52);
  context.quadraticCurveTo(x + 115, y - 20, x + 244, y + 52);
  context.closePath();
  context.fill();
  context.strokeStyle = '#d2ad6c';
  context.lineWidth = 3;
  for (let stripe = 0; stripe < 7; stripe += 1) {
    context.beginPath();
    context.moveTo(x + 20 + stripe * 31, y + 42);
    context.lineTo(x + 48 + stripe * 22, y + 2 + Math.abs(3 - stripe) * 4);
    context.stroke();
  }
  context.fillStyle = '#283c36';
  context.fillRect(x + 94, y + 83, 42, 45);
};

const drawMonument = (context: CanvasRenderingContext2D) => {
  const x = 760;
  const y = 870;
  context.fillStyle = 'rgba(35, 43, 33, .28)';
  context.fillRect(x - 30, y + 105, 270, 22);
  context.fillStyle = '#9c8664';
  context.fillRect(x, y + 72, 220, 43);
  context.fillStyle = '#c3ad84';
  context.fillRect(x + 18, y + 57, 184, 18);
  context.fillStyle = '#574d40';
  context.fillRect(x + 86, y + 1, 12, 58);
  context.fillRect(x + 111, y - 6, 12, 65);
  context.fillRect(x + 136, y + 4, 12, 55);
  context.fillStyle = '#6d5a45';
  context.fillRect(x + 80, y + 18, 24, 18);
  context.fillRect(x + 105, y + 11, 24, 20);
  context.fillRect(x + 130, y + 20, 24, 18);
  context.fillStyle = '#a43f37';
  context.beginPath();
  context.moveTo(x + 118, y - 10);
  context.lineTo(x + 174, y + 1);
  context.lineTo(x + 118, y + 19);
  context.closePath();
  context.fill();
  context.fillStyle = '#e9cf72';
  context.fillRect(x + 141, y + 2, 3, 3);
};

const drawCoffeeShelter = (context: CanvasRenderingContext2D) => {
  context.fillStyle = '#4c3c2f';
  context.fillRect(1_692, 900, 176, 84);
  context.fillStyle = '#9c603d';
  context.beginPath();
  context.moveTo(1_680, 906);
  context.lineTo(1_780, 864);
  context.lineTo(1_880, 906);
  context.closePath();
  context.fill();
  context.fillStyle = '#e3c078';
  context.fillRect(1_720, 934, 78, 22);
  context.fillStyle = '#5b3229';
  context.fillRect(1_817, 924, 31, 60);
  context.fillStyle = '#f0d895';
  context.font = '700 7px monospace';
  context.textAlign = 'center';
  context.fillText('MƯỜNG ẢNG', 1_759, 948);
};

const drawActor = (context: CanvasRenderingContext2D, actor: AmbientActor, game: GameState) => {
  const panic = game.cheerUntil > game.elapsed
    ? Math.max(0, 1 - distance(actor.x, actor.y, game.player.x, game.player.y) / 330)
    : 0;
  const offsetX = panic * Math.sign(actor.x - game.player.x || 1) * 18;
  const bob = Math.round(Math.sin(game.worldTime * (panic ? 10 : 2.2) + actor.phase));
  const x = actor.x + offsetX;
  const y = actor.y + bob;

  if (actor.kind === 'chicken') {
    context.fillStyle = actor.color;
    context.fillRect(x - 4, y - 6, 8, 6);
    context.fillStyle = '#f0d7a1';
    context.fillRect(x + 3, y - 8, 4, 4);
    context.fillStyle = '#d3a044';
    context.fillRect(x + 7, y - 6, 3, 1);
    context.fillStyle = '#42372c';
    context.fillRect(x - 2, y, 1, 3);
    context.fillRect(x + 3, y, 1, 3);
    return;
  }
  if (actor.kind === 'dog') {
    context.fillStyle = actor.color;
    context.fillRect(x - 8, y - 7, 14, 8);
    context.fillRect(x + 5, y - 11, 7, 7);
    context.fillRect(x - 7, y, 2, 5);
    context.fillRect(x + 3, y, 2, 5);
    return;
  }
  if (actor.kind === 'buffalo') {
    context.fillStyle = '#2e2b29';
    context.fillRect(x - 16, y - 12, 28, 15);
    context.fillRect(x + 9, y - 9, 12, 11);
    context.fillRect(x - 12, y + 2, 4, 10);
    context.fillRect(x + 6, y + 2, 4, 10);
    context.fillStyle = '#b7a27b';
    context.fillRect(x + 18, y - 12, 8, 2);
    return;
  }
  context.fillStyle = '#342f2a';
  context.fillRect(x - 3, y - 19, 7, 7);
  context.fillStyle = '#c38a63';
  context.fillRect(x - 2, y - 12, 5, 5);
  context.fillStyle = actor.color;
  context.fillRect(x - 5, y - 7, 11, 12);
  context.fillStyle = '#343c39';
  context.fillRect(x - 4, y + 5, 3, 8);
  context.fillRect(x + 2, y + 5, 3, 8);
};

const drawPlayer = (context: CanvasRenderingContext2D, game: GameState) => {
  const player = game.player;
  const squash = game.powerUntil.squash > game.elapsed;
  const scale = squash ? 1.25 : 1;
  const moving = Math.hypot(player.vx, player.vy) > 5;
  const bob = game.activity === 'feast' ? 3 : moving ? Math.round(Math.abs(Math.sin(player.walk)) * -2) : 0;
  const step = moving ? Math.round(Math.sin(player.walk) * 2) : 0;
  context.save();
  context.translate(Math.round(player.x), Math.round(player.y + bob));
  context.scale(scale, scale);
  context.fillStyle = 'rgba(29, 42, 32, .32)';
  context.fillRect(-8, 5, 17, 5);

  if (game.activity === 'feast') {
    context.fillStyle = '#3c4c41';
    context.fillRect(-6, -4, 12, 9);
    context.fillStyle = '#d4a077';
    context.fillRect(-3, -11, 7, 7);
    context.fillStyle = '#62734d';
    context.fillRect(-7, -15, 15, 5);
    context.fillStyle = '#454b35';
    context.fillRect(-5, 5, 4, 3);
    context.fillRect(2, 5, 4, 3);
    context.restore();
    return;
  }

  context.fillStyle = '#3a463f';
  context.fillRect(-5, 0, 4, 9 + step);
  context.fillRect(2, 0, 4, 9 - step);
  context.fillStyle = '#cf9b70';
  context.fillRect(-5, -16, 10, 9);
  context.fillStyle = '#33322e';
  context.fillRect(-5, -18, 10, 4);
  context.fillStyle = '#d9c590';
  context.fillRect(-6, -8, 12, 11);
  context.fillStyle = '#455b50';
  context.fillRect(-8, -7, 4, 10);
  context.fillRect(5, -7, 4, 10);
  context.fillStyle = '#586a42';
  context.fillRect(-7, -22, 14, 4);
  context.fillRect(-5, -25, 10, 4);
  context.fillStyle = '#d7bd68';
  context.fillRect(-1, -24, 3, 2);
  if (player.facingY < -0.25) {
    context.fillStyle = '#5a4635';
    context.fillRect(-5, -14, 10, 4);
  } else if (player.facingX > 0.25) {
    context.fillStyle = '#302c29';
    context.fillRect(4, -14, 1, 1);
  } else if (player.facingX < -0.25) {
    context.fillStyle = '#302c29';
    context.fillRect(-5, -14, 1, 1);
  } else {
    context.fillStyle = '#302c29';
    context.fillRect(-3, -14, 1, 1);
    context.fillRect(2, -14, 1, 1);
  }
  context.restore();
};

const drawPoiMarker = (context: CanvasRenderingContext2D, game: GameState, poi: PoiDefinition) => {
  const discovered = game.discovered.has(poi.kind);
  const nearby = game.nearbyPoi === poi.kind;
  const y = poi.y - 30 + Math.sin(game.worldTime * 2.2 + poi.x) * 2;
  context.save();
  context.translate(poi.x, y);
  context.fillStyle = nearby ? '#fff2a8' : discovered ? 'rgba(221, 235, 184, .72)' : '#efc75f';
  context.beginPath();
  context.moveTo(0, -5);
  context.lineTo(5, 0);
  context.lineTo(0, 5);
  context.lineTo(-5, 0);
  context.closePath();
  context.fill();
  context.fillStyle = '#2d4c3f';
  context.fillRect(-1, -2, 2, 4);
  if (nearby) {
    context.strokeStyle = 'rgba(255, 240, 166, .7)';
    context.lineWidth = 1;
    context.beginPath();
    context.arc(0, 0, 9 + Math.sin(game.worldTime * 3) * 2, 0, Math.PI * 2);
    context.stroke();
  }
  context.restore();
};

const drawParticles = (context: CanvasRenderingContext2D, game: GameState) => {
  game.particles.forEach((particle) => {
    const alpha = clamp(particle.life / particle.maxLife, 0, 1);
    context.globalAlpha = alpha;
    context.fillStyle = particle.color;
    if (particle.kind === 'note') {
      context.fillRect(Math.round(particle.x), Math.round(particle.y), 2, 4);
      context.fillRect(Math.round(particle.x) + 2, Math.round(particle.y), 2, 1);
    } else if (particle.kind === 'leaf') {
      context.fillRect(Math.round(particle.x), Math.round(particle.y), particle.size + 2, particle.size);
    } else {
      context.fillRect(Math.round(particle.x), Math.round(particle.y), particle.size, particle.size);
    }
  });
  context.globalAlpha = 1;
};

const drawCallWave = (context: CanvasRenderingContext2D, game: GameState) => {
  if (game.cheerUntil <= game.elapsed) return;
  const progress = 1 - (game.cheerUntil - game.elapsed) / CALL_DURATION;
  const radius = 18 + progress * 245;
  context.strokeStyle = 'rgba(247, 211, 104, ' + (0.75 * (1 - progress)).toFixed(3) + ')';
  context.lineWidth = 3;
  context.beginPath();
  context.arc(game.player.x, game.player.y - 5, radius, 0, Math.PI * 2);
  context.stroke();
  context.strokeStyle = 'rgba(255, 243, 175, ' + (0.4 * (1 - progress)).toFixed(3) + ')';
  context.lineWidth = 1;
  context.beginPath();
  context.arc(game.player.x, game.player.y - 5, radius + 8, 0, Math.PI * 2);
  context.stroke();
};

const drawWorldTitle = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  title: string,
  discovered: boolean,
) => {
  context.font = '700 6px monospace';
  context.textAlign = 'center';
  const width = Math.max(48, context.measureText(title).width + 10);
  roundedRect(context, x - width / 2, y, width, 13, 3);
  context.fillStyle = discovered ? 'rgba(35, 65, 51, .74)' : 'rgba(48, 52, 38, .82)';
  context.fill();
  context.fillStyle = discovered ? '#dce7bc' : '#f3d274';
  context.fillText(title, x, y + 9);
};

const poiWorldTitles: Record<LandmarkKind, string> = {
  'stilt-house': 'NHÀ SÀN',
  feast: 'MÂM BÊN ĐƯỜNG',
  'buffalo-kitchen': 'BẾP GÁC',
  'squash-field': 'BÍ TÌA DÌNH',
  terraces: 'RUỘNG BẬC THANG',
  'macadamia-grove': 'VƯỜN MẮC CA',
  'tea-hut': 'CHÈ TỦA CHÙA',
  waterwheel: 'CỌN NƯỚC',
  'stream-girl': 'BẾN SUỐI',
  'coffee-hill': 'CÀ PHÊ MƯỜNG ẢNG',
  museum: 'BẢO TÀNG',
  monument: 'TƯỢNG ĐÀI',
};

const drawCompassArrow = (context: CanvasRenderingContext2D, game: GameState) => {
  if (game.cheerUntil <= game.elapsed) return;
  const target = nearestUndiscovered(game);
  if (!target) return;
  const screenX = target.x - game.cameraX;
  const screenY = target.y - game.cameraY;
  if (screenX > 24 && screenX < VIEW_WIDTH - 24 && screenY > 30 && screenY < VIEW_HEIGHT - 24) return;
  const dx = target.x - game.player.x;
  const dy = target.y - game.player.y;
  const angle = Math.atan2(dy, dx);
  const radiusX = VIEW_WIDTH / 2 - 28;
  const radiusY = VIEW_HEIGHT / 2 - 30;
  const scale = Math.min(
    Math.abs(radiusX / (Math.cos(angle) || 0.001)),
    Math.abs(radiusY / (Math.sin(angle) || 0.001)),
  );
  const x = VIEW_WIDTH / 2 + Math.cos(angle) * scale;
  const y = VIEW_HEIGHT / 2 + Math.sin(angle) * scale;
  context.save();
  context.translate(x, y);
  context.rotate(angle);
  context.fillStyle = '#f5d36f';
  context.beginPath();
  context.moveTo(9, 0);
  context.lineTo(-5, -5);
  context.lineTo(-2, 0);
  context.lineTo(-5, 5);
  context.closePath();
  context.fill();
  context.restore();
};

export const renderGame = (context: CanvasRenderingContext2D, game: GameState) => {
  context.save();
  context.imageSmoothingEnabled = false;
  context.clearRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
  context.translate(-Math.round(game.cameraX), -Math.round(game.cameraY));
  drawGround(context, game);
  drawCityPaving(context);
  drawSquashField(context, game.worldTime);
  drawCornfield(context, game.worldTime);
  drawTerraces(context, game.worldTime);
  drawCoffeeHill(context, game.worldTime);
  drawRoads(context);
  drawRiver(context, game);
  drawWaterfall(context, game.worldTime);
  drawBridge(context, 495);
  drawBridge(context, 875);
  drawMacadamiaGrove(context);
  const drawables: Array<{ y: number; draw: () => void }> = [];
  scenery.forEach((prop) => {
    if (!inView(game, prop.x, prop.y, 40)) return;
    drawables.push({
      y: prop.y,
      draw: () => {
        if (prop.kind === 'tree') drawTree(context, prop.x, prop.y, prop.variant);
        else if (prop.kind === 'bamboo') drawBamboo(context, prop.x, prop.y, prop.variant);
        else if (prop.kind === 'rock') {
          context.fillStyle = '#58675c';
          context.fillRect(prop.x - 4, prop.y - 3, 9, 6);
          context.fillStyle = '#84917b';
          context.fillRect(prop.x - 2, prop.y - 4, 5, 2);
        } else {
          context.fillStyle = prop.variant % 2 ? '#e3cf70' : '#e8a081';
          context.fillRect(prop.x, prop.y - 2, 2, 2);
          context.fillStyle = '#4e7745';
          context.fillRect(prop.x, prop.y, 1, 3);
        }
      },
    });
  });
  [
    { y: 438, draw: () => drawStiltHouse(context, 420, 365, 205, '#805345') },
    { y: 528, draw: () => drawStiltHouse(context, 705, 455, 165, '#6c7d55') },
    { y: 893, draw: () => drawStiltHouse(context, 560, 820, 150, '#a86a45') },
    { y: 352, draw: () => drawTeaHut(context) },
    { y: 752, draw: () => drawBuffaloKitchen(context, game.worldTime) },
    { y: 580, draw: () => drawWaterwheel(context, game.worldTime) },
    { y: 672, draw: () => drawStreamScene(context, game.worldTime) },
    { y: 700, draw: () => drawFeast(context, game) },
    { y: 1_010, draw: () => drawMuseum(context) },
    { y: 990, draw: () => drawMonument(context) },
    { y: 986, draw: () => drawCoffeeShelter(context) },
    { y: game.player.y, draw: () => drawPlayer(context, game) },
  ].forEach((drawable) => drawables.push(drawable));
  AMBIENT_ACTORS.forEach((actor) => {
    if (inView(game, actor.x, actor.y, 40)) {
      drawables.push({ y: actor.y, draw: () => drawActor(context, actor, game) });
    }
  });
  drawables.sort((first, second) => first.y - second.y).forEach((drawable) => drawable.draw());
  POIS.forEach((poi) => {
    if (!inView(game, poi.x, poi.y, 65)) return;
    drawPoiMarker(context, game, poi);
    if (game.nearbyPoi === poi.kind || game.discovered.has(poi.kind)) {
      drawWorldTitle(context, poi.x, poi.y + 24, poiWorldTitles[poi.kind], game.discovered.has(poi.kind));
    }
  });
  drawCallWave(context, game);
  drawParticles(context, game);
  context.restore();

  const dayProgress = clamp(game.discovered.size / POIS.length, 0, 1);
  if (dayProgress > 0.36) {
    context.fillStyle = 'rgba(43, 48, 70, ' + ((dayProgress - 0.36) * 0.16).toFixed(3) + ')';
    context.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
  }
  if (game.quality === 'high') {
    context.fillStyle = 'rgba(255, 235, 166, .55)';
    for (let index = 0; index < 10; index += 1) {
      const x = (index * 83 + game.worldTime * (3 + index % 3)) % VIEW_WIDTH;
      const y = 26 + ((index * 47 + Math.sin(game.worldTime + index) * 12) % (VIEW_HEIGHT - 52));
      context.fillRect(Math.round(x), Math.round(y), 1, 1);
    }
  }
  drawCompassArrow(context, game);
};
