export const VIEW_WIDTH = 960;
export const VIEW_HEIGHT = 540;

const GROUND_Y = 438;
const PLAYER_START_X = 240;
const ZONE_LENGTH = 6_400;
export const LEVEL_END = ZONE_LENGTH * 4;
const FEAST_X = 1_650;
const FEAST_DURATION = 2.75;
const DASH_DURATION = 0.34;
const DASH_COOLDOWN = 3.2;
const CHEER_DURATION = 2.45;
const CHEER_COOLDOWN = 10;

export type PowerKind = 'squash' | 'coffee' | 'macadamia' | 'tea' | 'buffalo';
export type ZoneKind = 0 | 1 | 2 | 3;
export type GameQuality = 'low' | 'high';
export type LandmarkKind = 'cornfield' | 'terraces' | 'waterwheel' | 'stream-girl' | 'museum' | 'monument';

export type InputState = {
  left: boolean;
  right: boolean;
  moveAxis: number;
  jumpQueued: boolean;
  dashQueued: boolean;
  cheerQueued: boolean;
};

type PlayerState = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  grounded: boolean;
  facing: -1 | 1;
};

type Pickup = {
  id: string;
  x: number;
  y: number;
  kind: 'token' | PowerKind;
};

type HazardKind = 'stream' | 'basket' | 'goat' | 'chicken' | 'hay' | 'log' | 'stone';

type Hazard = {
  id: string;
  x: number;
  width: number;
  kind: HazardKind;
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
  gravity: number;
  shape: 'square' | 'circle' | 'leaf';
};

type TrailPoint = { x: number; y: number; life: number };

export type GameEvent =
  | { type: 'jump' | 'land' | 'token' | 'hit' | 'shield-break' | 'break' | 'complete' | 'dash' | 'feast-start' | 'feast-finish' | 'cheer' }
  | { type: 'power-start' | 'power-end'; power: PowerKind }
  | { type: 'zone-change'; zone: ZoneKind }
  | { type: 'landmark'; landmark: LandmarkKind };

export type ActivePower = { kind: PowerKind; remaining: number };

export type UiSnapshot = {
  lives: number;
  progress: number;
  zone: ZoneKind;
  tokens: number;
  elapsed: number;
  powers: ActivePower[];
  callout: PowerKind | null;
  heroZone: ZoneKind | null;
  flash: PowerKind | 'hit' | 'cheer' | null;
  dashCooldown: number;
  cheerCooldown: number;
  cheerUnlocked: boolean;
  cheerActive: boolean;
  feastPhase: 'meeting' | 'unlocked' | null;
  landmark: LandmarkKind | null;
};

export type GameState = {
  player: PlayerState;
  collected: Set<string>;
  broken: Set<string>;
  particles: Particle[];
  trail: TrailPoint[];
  lives: number;
  checkpoint: number;
  elapsed: number;
  worldTime: number;
  cameraX: number;
  zone: ZoneKind;
  invulnerableUntil: number;
  freezeUntil: number;
  shakeUntil: number;
  flashUntil: number;
  flashKind: PowerKind | 'hit' | 'cheer' | null;
  calloutKind: PowerKind | null;
  calloutUntil: number;
  heroZone: ZoneKind | null;
  heroUntil: number;
  powerUntil: Record<PowerKind, number>;
  dashUntil: number;
  dashReadyAt: number;
  cheerUntil: number;
  cheerReadyAt: number;
  cheerUnlocked: boolean;
  feastStarted: boolean;
  feastUntil: number;
  feastNoticeUntil: number;
  seenLandmarks: Set<LandmarkKind>;
  landmarkKind: LandmarkKind | null;
  landmarkUntil: number;
  lastDustAt: number;
  lastTrailAt: number;
  quality: GameQuality;
  reducedMotion: boolean;
  complete: boolean;
  failed: boolean;
};

export const POWER_DURATION: Record<PowerKind, number> = {
  squash: 11,
  coffee: 12,
  macadamia: 15,
  tea: 13,
  buffalo: 16,
};

export const POWER_KINDS: PowerKind[] = ['squash', 'coffee', 'macadamia', 'tea', 'buffalo'];

const landmarkMoments: Array<{ kind: LandmarkKind; x: number }> = [
  { kind: 'cornfield', x: 5_050 },
  { kind: 'terraces', x: 7_850 },
  { kind: 'waterwheel', x: 13_380 },
  { kind: 'stream-girl', x: 15_470 },
  { kind: 'museum', x: 21_020 },
  { kind: 'monument', x: 23_640 },
];

const pickups: Pickup[] = [
  { id: 'token-01', x: 900, y: 366, kind: 'token' },
  { id: 'squash', x: 2_420, y: 366, kind: 'squash' },
  { id: 'token-02', x: 4_550, y: 344, kind: 'token' },
  { id: 'coffee', x: 7_100, y: 366, kind: 'coffee' },
  { id: 'token-03', x: 9_760, y: 338, kind: 'token' },
  { id: 'macadamia', x: 11_850, y: 366, kind: 'macadamia' },
  { id: 'token-04', x: 13_720, y: 340, kind: 'token' },
  { id: 'tea', x: 14_780, y: 366, kind: 'tea' },
  { id: 'token-05', x: 17_750, y: 334, kind: 'token' },
  { id: 'buffalo', x: 20_250, y: 366, kind: 'buffalo' },
  { id: 'token-06', x: 23_100, y: 340, kind: 'token' },
  { id: 'token-07', x: 24_700, y: 366, kind: 'token' },
];

const hazards: Hazard[] = [
  { id: 'basket-01', x: 1_340, width: 62, kind: 'basket' },
  { id: 'stream-01', x: 1_890, width: 138, kind: 'stream' },
  { id: 'hay-01', x: 2_980, width: 82, kind: 'hay' },
  { id: 'hay-02', x: 3_760, width: 88, kind: 'hay' },
  { id: 'chicken-01', x: 5_260, width: 46, kind: 'chicken' },
  { id: 'stream-02', x: 5_780, width: 150, kind: 'stream' },
  { id: 'goat-01', x: 7_780, width: 70, kind: 'goat' },
  { id: 'basket-02', x: 8_420, width: 62, kind: 'basket' },
  { id: 'stream-03', x: 9_090, width: 160, kind: 'stream' },
  { id: 'basket-03', x: 10_020, width: 66, kind: 'basket' },
  { id: 'goat-02', x: 10_680, width: 70, kind: 'goat' },
  { id: 'stone-01', x: 12_420, width: 84, kind: 'stone' },
  { id: 'stream-04', x: 13_080, width: 182, kind: 'stream' },
  { id: 'goat-03', x: 13_850, width: 70, kind: 'goat' },
  { id: 'stone-02', x: 14_260, width: 78, kind: 'stone' },
  { id: 'chicken-02', x: 15_420, width: 46, kind: 'chicken' },
  { id: 'goat-04', x: 16_080, width: 70, kind: 'goat' },
  { id: 'stream-05', x: 16_770, width: 190, kind: 'stream' },
  { id: 'chicken-03', x: 17_620, width: 46, kind: 'chicken' },
  { id: 'goat-05', x: 18_260, width: 70, kind: 'goat' },
  { id: 'log-01', x: 20_980, width: 102, kind: 'log' },
  { id: 'hay-03', x: 21_780, width: 92, kind: 'hay' },
  { id: 'log-02', x: 22_650, width: 110, kind: 'log' },
  { id: 'basket-04', x: 23_650, width: 66, kind: 'basket' },
  { id: 'stream-06', x: 24_250, width: 154, kind: 'stream' },
];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const zoneAt = (x: number): ZoneKind => clamp(Math.floor(x / ZONE_LENGTH), 0, 3) as ZoneKind;

const overlaps = (
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number },
) => a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;

const isPowerActive = (game: GameState, kind: PowerKind) => game.powerUntil[kind] > game.elapsed;

const particleColors: Record<PowerKind, string[]> = {
  squash: ['#86b64e', '#b9da69', '#eff6a6'],
  coffee: ['#70402d', '#bf7540', '#f4d382'],
  macadamia: ['#b89551', '#ebd58e', '#fff1bd'],
  tea: ['#8ac5a6', '#d7f2d5', '#f6ffe8'],
  buffalo: ['#9a4938', '#d98149', '#f5c06a'],
};

const addParticles = (
  game: GameState,
  x: number,
  y: number,
  colors: string[],
  count: number,
  strength = 180,
  shape: Particle['shape'] = 'square',
) => {
  if (game.reducedMotion) count = Math.ceil(count * 0.35);
  if (game.quality === 'low') count = Math.ceil(count * 0.6);
  const maxParticles = game.quality === 'low' ? 70 : 150;
  const available = Math.max(0, maxParticles - game.particles.length);
  for (let index = 0; index < Math.min(count, available); index += 1) {
    const angle = Math.random() * Math.PI * 2;
    const velocity = strength * (0.45 + Math.random() * 0.7);
    const life = 0.38 + Math.random() * 0.62;
    game.particles.push({
      x,
      y,
      vx: Math.cos(angle) * velocity,
      vy: Math.sin(angle) * velocity - strength * 0.24,
      life,
      maxLife: life,
      size: 2.5 + Math.random() * 5,
      color: colors[index % colors.length],
      gravity: 280 + Math.random() * 260,
      shape,
    });
  }
};

const updateParticles = (game: GameState, dt: number) => {
  for (let index = game.particles.length - 1; index >= 0; index -= 1) {
    const particle = game.particles[index];
    particle.life -= dt;
    if (particle.life <= 0) {
      game.particles.splice(index, 1);
      continue;
    }
    particle.vy += particle.gravity * dt;
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
  }
  for (let index = game.trail.length - 1; index >= 0; index -= 1) {
    game.trail[index].life -= dt;
    if (game.trail[index].life <= 0) game.trail.splice(index, 1);
  }
};

const movingHazardX = (hazard: Hazard, game: GameState) => {
  let x = hazard.x;
  if (hazard.kind === 'goat') x += Math.sin(game.worldTime * 2.25 + hazard.x * 0.01) * 42;
  if (hazard.kind === 'chicken') x += Math.sin(game.worldTime * 3.1 + hazard.x * 0.02) * 58;
  if (hazard.kind !== 'stream' && game.cheerUntil > game.elapsed) {
    const progress = clamp(1 - (game.cheerUntil - game.elapsed) / CHEER_DURATION, 0, 1);
    const away = x < game.player.x ? -1 : 1;
    const distance = hazard.kind === 'goat' || hazard.kind === 'chicken' ? 185 : 58;
    x += away * (24 + Math.sin(progress * Math.PI / 2) * distance);
  }
  return x;
};

const getHazardRect = (hazard: Hazard, game: GameState) => {
  const x = movingHazardX(hazard, game);
  switch (hazard.kind) {
    case 'stream': return { x: x + 18, y: GROUND_Y - 4, width: Math.max(30, hazard.width - 36), height: 96 };
    case 'basket': return { x, y: GROUND_Y - 42, width: hazard.width, height: 42 };
    case 'goat': return { x, y: GROUND_Y - 45, width: 70, height: 45 };
    case 'chicken': return { x, y: GROUND_Y - 28, width: 46, height: 28 };
    case 'hay': return { x, y: GROUND_Y - 66, width: hazard.width, height: 66 };
    case 'log': return { x, y: GROUND_Y - 52, width: hazard.width, height: 52 };
    case 'stone': return { x, y: GROUND_Y - 48, width: hazard.width, height: 48 };
  }
};

const canBreakHazard = (hazard: Hazard, game: GameState) => {
  if (hazard.kind === 'hay') return isPowerActive(game, 'squash') || isPowerActive(game, 'buffalo');
  if (hazard.kind === 'log') return isPowerActive(game, 'buffalo');
  return false;
};

export const createGame = (quality: GameQuality, reducedMotion: boolean): GameState => ({
  player: {
    x: PLAYER_START_X,
    y: -110,
    vx: 0,
    vy: 32,
    width: 34,
    height: 56,
    grounded: false,
    facing: 1,
  },
  collected: new Set(),
  broken: new Set(),
  particles: [],
  trail: [],
  lives: 3,
  checkpoint: PLAYER_START_X,
  elapsed: 0,
  worldTime: 0,
  cameraX: 0,
  zone: 0,
  invulnerableUntil: 0,
  freezeUntil: 0,
  shakeUntil: 0,
  flashUntil: 0,
  flashKind: null,
  calloutKind: null,
  calloutUntil: 0,
  heroZone: null,
  heroUntil: 0,
  powerUntil: { squash: 0, coffee: 0, macadamia: 0, tea: 0, buffalo: 0 },
  dashUntil: 0,
  dashReadyAt: 0,
  cheerUntil: 0,
  cheerReadyAt: 0,
  cheerUnlocked: false,
  feastStarted: false,
  feastUntil: 0,
  feastNoticeUntil: 0,
  seenLandmarks: new Set(),
  landmarkKind: null,
  landmarkUntil: 0,
  lastDustAt: 0,
  lastTrailAt: 0,
  quality,
  reducedMotion,
  complete: false,
  failed: false,
});

export const createUiSnapshot = (game: GameState): UiSnapshot => ({
  lives: game.lives,
  progress: clamp(game.player.x / LEVEL_END, 0, 1),
  zone: game.zone,
  tokens: [...game.collected].filter((id) => id.startsWith('token')).length,
  elapsed: game.elapsed,
  powers: POWER_KINDS.flatMap((kind) => {
    const remainingSeconds = game.powerUntil[kind] - game.elapsed;
    return remainingSeconds > 0
      ? [{ kind, remaining: clamp(remainingSeconds / POWER_DURATION[kind], 0, 1) }]
      : [];
  }),
  callout: game.calloutUntil > game.elapsed ? game.calloutKind : null,
  heroZone: game.heroUntil > game.elapsed ? game.heroZone : null,
  flash: game.flashUntil > game.elapsed ? game.flashKind : null,
  dashCooldown: clamp((game.dashReadyAt - game.elapsed) / DASH_COOLDOWN, 0, 1),
  cheerCooldown: clamp((game.cheerReadyAt - game.elapsed) / CHEER_COOLDOWN, 0, 1),
  cheerUnlocked: game.cheerUnlocked,
  cheerActive: game.cheerUntil > game.elapsed,
  feastPhase: game.feastStarted && game.feastUntil > game.elapsed
    ? 'meeting'
    : game.feastNoticeUntil > game.elapsed
      ? 'unlocked'
      : null,
  landmark: game.landmarkUntil > game.elapsed ? game.landmarkKind : null,
});

const activatePower = (game: GameState, power: PowerKind) => {
  game.powerUntil[power] = game.elapsed + POWER_DURATION[power];
  game.calloutKind = power;
  game.calloutUntil = game.elapsed + 1.55;
  game.freezeUntil = game.elapsed + (game.reducedMotion ? 0.06 : 0.14);
  game.shakeUntil = game.elapsed + (game.reducedMotion ? 0.08 : 0.3);
  game.flashKind = power;
  game.flashUntil = game.elapsed + 0.24;
  addParticles(game, game.player.x + 18, game.player.y + 24, particleColors[power], 28, 220, power === 'tea' ? 'leaf' : 'square');
};

const clearQueuedInput = (input: InputState) => {
  input.jumpQueued = false;
  input.dashQueued = false;
  input.cheerQueued = false;
};

const updateCamera = (game: GameState, dt: number, fast: boolean) => {
  const lookAhead = fast ? 355 : 255;
  const targetCamera = clamp(game.player.x - lookAhead, 0, LEVEL_END - VIEW_WIDTH + 200);
  game.cameraX += (targetCamera - game.cameraX) * Math.min(1, dt * (fast ? 7.5 : 5.2));
};

export const stepGame = (game: GameState, input: InputState, dt: number): GameEvent[] => {
  const events: GameEvent[] = [];
  const previousElapsed = game.elapsed;
  game.elapsed += dt;

  POWER_KINDS.forEach((power) => {
    const end = game.powerUntil[power];
    if (end > 0 && previousElapsed < end && game.elapsed >= end) {
      game.powerUntil[power] = 0;
      addParticles(game, game.player.x + 18, game.player.y + 28, particleColors[power], 9, 90, 'circle');
      events.push({ type: 'power-end', power });
    }
  });

  const worldScale = isPowerActive(game, 'tea') ? 0.46 : 1;
  game.worldTime += dt * worldScale;
  updateParticles(game, dt);

  if (game.feastStarted && !game.cheerUnlocked && game.elapsed >= game.feastUntil) {
    game.cheerUnlocked = true;
    game.feastNoticeUntil = game.elapsed + 2.35;
    game.flashKind = 'cheer';
    game.flashUntil = game.elapsed + 0.28;
    game.shakeUntil = game.elapsed + (game.reducedMotion ? 0.06 : 0.24);
    addParticles(game, game.player.x + 22, GROUND_Y - 43, ['#ffe39a', '#e18a54', '#8fd2af'], 26, 210, 'circle');
    events.push({ type: 'feast-finish' });
  }

  if (game.feastStarted && game.feastUntil > game.elapsed) {
    game.player.vx += (0 - game.player.vx) * Math.min(1, dt * 14);
    game.player.vy = 0;
    game.player.y = GROUND_Y - game.player.height;
    game.player.grounded = true;
    clearQueuedInput(input);
    updateCamera(game, dt, false);
    return events;
  }

  if (game.freezeUntil > game.elapsed) {
    clearQueuedInput(input);
    return events;
  }

  const player = game.player;
  const coffeeActive = isPowerActive(game, 'coffee');
  const squashActive = isPowerActive(game, 'squash');
  const buffaloActive = isPowerActive(game, 'buffalo');
  const keyDirection = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  const moveAxis = Math.abs(input.moveAxis) > 0.1 ? clamp(input.moveAxis, -1, 1) : keyDirection;

  if (input.dashQueued && game.elapsed >= game.dashReadyAt) {
    if (Math.abs(moveAxis) > 0.1) player.facing = moveAxis < 0 ? -1 : 1;
    game.dashUntil = game.elapsed + DASH_DURATION;
    game.dashReadyAt = game.elapsed + DASH_COOLDOWN;
    game.invulnerableUntil = Math.max(game.invulnerableUntil, game.dashUntil);
    player.vx = player.facing * (coffeeActive ? 650 : 570);
    addParticles(game, player.x + player.width / 2, player.y + player.height / 2, ['#fff1b7', '#8ed0b1', '#527c6c'], 13, 170, 'circle');
    events.push({ type: 'dash' });
  }

  if (input.cheerQueued && game.cheerUnlocked && game.elapsed >= game.cheerReadyAt) {
    game.cheerUntil = game.elapsed + CHEER_DURATION;
    game.cheerReadyAt = game.elapsed + CHEER_COOLDOWN;
    game.invulnerableUntil = Math.max(game.invulnerableUntil, game.cheerUntil);
    game.shakeUntil = game.elapsed + (game.reducedMotion ? 0.05 : 0.22);
    game.flashKind = 'cheer';
    game.flashUntil = game.elapsed + 0.18;
    addParticles(game, player.x + player.width / 2, player.y + 24, ['#ffe08a', '#f5a35a', '#a4d9ac'], 34, 270, 'circle');
    events.push({ type: 'cheer' });
  }
  input.dashQueued = false;
  input.cheerQueued = false;

  const dashActive = game.dashUntil > game.elapsed;
  const targetSpeed = dashActive
    ? player.facing * (coffeeActive ? 650 : 570)
    : moveAxis * (coffeeActive ? 355 : buffaloActive ? 220 : 205);
  player.vx += (targetSpeed - player.vx) * Math.min(1, dt * (dashActive ? 22 : coffeeActive ? 12 : 8.5));
  if (!dashActive && Math.abs(moveAxis) > 0.1) player.facing = moveAxis < 0 ? -1 : 1;

  if (input.jumpQueued && player.grounded) {
    player.vy = squashActive ? -820 : coffeeActive ? -720 : -690;
    player.grounded = false;
    addParticles(game, player.x + player.width / 2, GROUND_Y - 2, ['#d9c187', '#8b744d'], 7, 85, 'circle');
    events.push({ type: 'jump' });
  }
  input.jumpQueued = false;

  const wasGrounded = player.grounded;
  const previousVy = player.vy;
  player.vy += 1_350 * dt;
  player.x = clamp(player.x + player.vx * dt, 0, LEVEL_END + 40);
  player.y += player.vy * dt;

  if (player.y + player.height >= GROUND_Y) {
    player.y = GROUND_Y - player.height;
    player.vy = 0;
    player.grounded = true;
    if (!wasGrounded && previousVy > 210) {
      addParticles(game, player.x + player.width / 2, GROUND_Y - 2, ['#ccb57e', '#806844'], squashActive ? 12 : 7, squashActive ? 135 : 80, 'circle');
      events.push({ type: 'land' });
    }
  } else {
    player.grounded = false;
  }

  if (player.grounded && Math.abs(player.vx) > 90 && game.elapsed - game.lastDustAt > (coffeeActive ? 0.08 : 0.16)) {
    game.lastDustAt = game.elapsed;
    addParticles(game, player.x + 14, GROUND_Y - 3, ['#cdb982', '#806a46'], coffeeActive ? 3 : 2, 55, 'circle');
  }

  if (coffeeActive && Math.abs(player.vx) > 150 && game.elapsed - game.lastTrailAt > 0.07 && !game.reducedMotion) {
    game.lastTrailAt = game.elapsed;
    game.trail.push({ x: player.x, y: player.y, life: 0.34 });
    if (game.trail.length > 8) game.trail.shift();
  }

  const nextZone = zoneAt(player.x);
  if (nextZone !== game.zone) {
    game.zone = nextZone;
    game.heroZone = nextZone;
    game.heroUntil = game.elapsed + 2.7;
    game.checkpoint = nextZone * ZONE_LENGTH + 260;
    events.push({ type: 'zone-change', zone: nextZone });
  }
  if (player.x - game.checkpoint > 680) game.checkpoint = Math.max(PLAYER_START_X, player.x - 520);

  if (!game.feastStarted && player.x >= FEAST_X - 118) {
    game.feastStarted = true;
    game.feastUntil = game.elapsed + FEAST_DURATION;
    game.feastNoticeUntil = game.feastUntil + 2.35;
    game.invulnerableUntil = Math.max(game.invulnerableUntil, game.feastUntil);
    game.dashUntil = 0;
    player.x = FEAST_X - 118;
    player.y = GROUND_Y - player.height;
    player.vx = 0;
    player.vy = 0;
    player.grounded = true;
    player.facing = 1;
    game.trail.length = 0;
    clearQueuedInput(input);
    events.push({ type: 'feast-start' });
    updateCamera(game, dt, false);
    return events;
  }

  for (const moment of landmarkMoments) {
    if (player.x < moment.x || game.seenLandmarks.has(moment.kind)) continue;
    game.seenLandmarks.add(moment.kind);
    game.landmarkKind = moment.kind;
    game.landmarkUntil = game.elapsed + (moment.kind === 'stream-girl' ? 3.8 : 3.15);
    if (moment.kind === 'stream-girl') {
      player.vx *= 0.34;
      game.freezeUntil = Math.max(game.freezeUntil, game.elapsed + (game.reducedMotion ? 0.04 : 0.16));
    }
    if (moment.kind === 'museum' || moment.kind === 'monument') {
      game.shakeUntil = Math.max(game.shakeUntil, game.elapsed + (game.reducedMotion ? 0.04 : 0.16));
    }
    events.push({ type: 'landmark', landmark: moment.kind });
    break;
  }

  const playerRect = { x: player.x, y: player.y, width: player.width, height: player.height };
  pickups.forEach((pickup) => {
    if (game.collected.has(pickup.id)) return;
    if (!overlaps(playerRect, { x: pickup.x - 9, y: pickup.y - 20, width: 50, height: 66 })) return;
    game.collected.add(pickup.id);
    if (pickup.kind === 'token') {
      addParticles(game, pickup.x + 13, pickup.y + 12, ['#f7d77d', '#fff4c1', '#db665b'], 12, 145, 'leaf');
      events.push({ type: 'token' });
      return;
    }
    activatePower(game, pickup.kind);
    events.push({ type: 'power-start', power: pickup.kind });
  });

  if (game.invulnerableUntil <= game.elapsed) {
    for (const hazard of hazards) {
      if (game.broken.has(hazard.id)) continue;
      const hazardRect = getHazardRect(hazard, game);
      if (!overlaps(playerRect, hazardRect)) continue;

      if (canBreakHazard(hazard, game)) {
        game.broken.add(hazard.id);
        game.freezeUntil = game.elapsed + (game.reducedMotion ? 0.03 : 0.08);
        game.shakeUntil = game.elapsed + (game.reducedMotion ? 0.04 : 0.22);
        addParticles(game, hazardRect.x + hazardRect.width / 2, hazardRect.y + 20, ['#b9793c', '#e0ad59', '#765038'], 22, 210, 'square');
        events.push({ type: 'break' });
        break;
      }

      if (isPowerActive(game, 'macadamia')) {
        game.powerUntil.macadamia = 0;
        game.invulnerableUntil = game.elapsed + 1.25;
        player.vy = -330;
        player.vx = -145;
        game.freezeUntil = game.elapsed + (game.reducedMotion ? 0.04 : 0.1);
        game.shakeUntil = game.elapsed + (game.reducedMotion ? 0.06 : 0.28);
        game.flashKind = 'macadamia';
        game.flashUntil = game.elapsed + 0.2;
        addParticles(game, player.x + 18, player.y + 25, particleColors.macadamia, 30, 260, 'square');
        events.push({ type: 'shield-break' });
        break;
      }

      game.lives -= 1;
      game.invulnerableUntil = game.elapsed + 1.45;
      game.shakeUntil = game.elapsed + (game.reducedMotion ? 0.06 : 0.34);
      game.flashKind = 'hit';
      game.flashUntil = game.elapsed + 0.22;
      addParticles(game, player.x + 18, player.y + 26, ['#f4ddd0', '#b64945', '#582d2b'], 18, 190, 'square');
      events.push({ type: 'hit' });
      if (game.lives <= 0) {
        game.failed = true;
        player.vx = 0;
      } else {
        player.x = game.checkpoint;
        player.y = GROUND_Y - player.height;
        player.vx = 0;
        player.vy = 0;
      }
      break;
    }
  }

  if (player.x >= LEVEL_END && !game.complete) {
    player.x = LEVEL_END;
    player.vx = 0;
    game.complete = true;
    addParticles(game, player.x, player.y, ['#f7d77d', '#fff4c1', '#d96f58', '#8dcc7b'], 46, 260, 'leaf');
    events.push({ type: 'complete' });
  }

  updateCamera(game, dt, coffeeActive || dashActive);
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
  const r = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + r, y);
  context.lineTo(x + width - r, y);
  context.quadraticCurveTo(x + width, y, x + width, y + r);
  context.lineTo(x + width, y + height - r);
  context.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  context.lineTo(x + r, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - r);
  context.lineTo(x, y + r);
  context.quadraticCurveTo(x, y, x + r, y);
  context.closePath();
};

const colorChannels = (color: string) => {
  if (color.startsWith('#')) {
    return [color.slice(1, 3), color.slice(3, 5), color.slice(5, 7)].map((hex) => Number.parseInt(hex, 16));
  }
  return color.match(/[\d.]+/g)?.slice(0, 3).map(Number) ?? [0, 0, 0];
};

const mixColor = (first: string, second: string, amount: number) => {
  const a = colorChannels(first);
  const b = colorChannels(second);
  return `rgb(${a.map((value, index) => Math.round(value + (b[index] - value) * amount)).join(',')})`;
};

const zoneThemes = [
  { sky: '#88c7ce', horizon: '#f0d597', ground: '#46764e' },
  { sky: '#8fcbd2', horizon: '#efd687', ground: '#6d8742' },
  { sky: '#80bdca', horizon: '#f0d2a0', ground: '#437868' },
  { sky: '#7d98b5', horizon: '#efad71', ground: '#72583d' },
] as const;

const blendedTheme = (x: number) => {
  const zone = zoneAt(x);
  const local = (x - zone * ZONE_LENGTH) / ZONE_LENGTH;
  const amount = zone < 3 ? clamp((local - 0.78) / 0.22, 0, 1) : 0;
  const next = zoneThemes[Math.min(3, zone + 1)];
  return {
    sky: mixColor(zoneThemes[zone].sky, next.sky, amount),
    horizon: mixColor(zoneThemes[zone].horizon, next.horizon, amount),
    ground: mixColor(zoneThemes[zone].ground, next.ground, amount),
  };
};

const drawMountainLayer = (
  context: CanvasRenderingContext2D,
  camera: number,
  parallax: number,
  baseline: number,
  color: string,
  step: number,
) => {
  const offset = -((camera * parallax) % step);
  context.beginPath();
  context.moveTo(-step, VIEW_HEIGHT);
  context.lineTo(-step, baseline);
  for (let x = offset - step; x <= VIEW_WIDTH + step; x += step) {
    const peak = baseline - step * (0.36 + ((Math.abs(Math.round(x / step)) % 3) * 0.08));
    context.quadraticCurveTo(x + step * 0.24, baseline - step * 0.12, x + step * 0.5, peak);
    context.quadraticCurveTo(x + step * 0.78, baseline - step * 0.16, x + step, baseline);
  }
  context.lineTo(VIEW_WIDTH + step, VIEW_HEIGHT);
  context.closePath();
  context.fillStyle = color;
  context.fill();
};

const drawStiltHouse = (
  context: CanvasRenderingContext2D,
  x: number,
  baseY: number,
  scale: number,
  accent: string,
  time: number,
  details = true,
) => {
  context.save();
  context.translate(x, baseY);
  context.scale(scale, scale);
  context.fillStyle = 'rgba(32, 39, 28, .14)';
  context.fillRect(-12, 8, 132, 10);
  context.fillStyle = '#51392a';
  [5, 35, 88, 112].forEach((post) => context.fillRect(post, -42, 7, 52));
  context.fillStyle = '#a5744e';
  context.fillRect(-2, -78, 122, 42);
  context.fillStyle = '#7d553d';
  for (let slat = 5; slat < 118; slat += 12) context.fillRect(slat, -76, 2, 38);
  context.fillStyle = accent;
  context.fillRect(14, -68, 24, 22);
  context.fillStyle = '#2c2922';
  context.fillRect(82, -69, 22, 33);
  context.fillStyle = '#603b31';
  context.beginPath();
  context.moveTo(-18, -76);
  context.lineTo(58, -124);
  context.lineTo(138, -76);
  context.closePath();
  context.fill();
  context.fillStyle = '#8c5941';
  for (let stripe = -4; stripe < 120; stripe += 16) {
    context.beginPath();
    context.moveTo(stripe, -78);
    context.lineTo(58, -120);
    context.lineTo(stripe + 8, -78);
    context.fill();
  }
  context.strokeStyle = '#6e4c35';
  context.lineWidth = 4;
  context.beginPath();
  context.moveTo(83, -36);
  context.lineTo(105, 5);
  context.stroke();
  for (let step = 0; step < 4; step += 1) {
    context.beginPath();
    context.moveTo(88 + step * 5, -27 + step * 9);
    context.lineTo(103 + step * 5, -27 + step * 9);
    context.stroke();
  }
  if (details) {
    context.fillStyle = '#3c4436';
    context.fillRect(26, -29, 44, 14);
    context.fillStyle = '#a7563f';
    context.fillRect(31, -29, 10, 14);
    context.fillStyle = '#d0ae52';
    context.fillRect(45, -29, 8, 14);
    context.fillStyle = '#5b8291';
    context.fillRect(57, -29, 9, 14);
    context.strokeStyle = 'rgba(238, 232, 206, .52)';
    context.lineWidth = 4;
    context.beginPath();
    const drift = Math.sin(time * 0.7 + x) * 5;
    context.moveTo(17, -122);
    context.bezierCurveTo(8 + drift, -143, 29 + drift, -151, 18 + drift, -172);
    context.stroke();
  }
  context.restore();
};

const drawFence = (context: CanvasRenderingContext2D, x: number, width: number, baseY: number) => {
  context.fillStyle = '#785838';
  context.fillRect(x, baseY - 20, width, 4);
  context.fillRect(x, baseY - 7, width, 4);
  for (let post = 0; post <= width; post += 28) context.fillRect(x + post, baseY - 29, 5, 31);
};

const drawMotorbike = (context: CanvasRenderingContext2D, x: number, y: number) => {
  context.strokeStyle = '#26342f';
  context.lineWidth = 4;
  context.beginPath();
  context.arc(x, y, 10, 0, Math.PI * 2);
  context.arc(x + 36, y, 10, 0, Math.PI * 2);
  context.stroke();
  context.strokeStyle = '#8e3e36';
  context.beginPath();
  context.moveTo(x, y - 2);
  context.lineTo(x + 15, y - 19);
  context.lineTo(x + 28, y - 3);
  context.lineTo(x + 7, y - 3);
  context.lineTo(x + 36, y - 3);
  context.stroke();
};

const drawPerson = (context: CanvasRenderingContext2D, x: number, y: number, shirt: string, time: number, dancing = false) => {
  const bob = dancing ? Math.sin(time * 4 + x) * 3 : 0;
  context.fillStyle = '#c99062';
  context.beginPath();
  context.arc(x, y - 34 + bob, 7, 0, Math.PI * 2);
  context.fill();
  context.strokeStyle = shirt;
  context.lineWidth = 8;
  context.beginPath();
  context.moveTo(x, y - 25 + bob);
  context.lineTo(x, y - 7 + bob);
  context.stroke();
  context.lineWidth = 4;
  context.beginPath();
  context.moveTo(x, y - 21 + bob);
  context.lineTo(x - (dancing ? 14 : 8), y - 13 + bob);
  context.moveTo(x, y - 21 + bob);
  context.lineTo(x + (dancing ? 14 : 8), y - 14 + bob);
  context.moveTo(x, y - 7 + bob);
  context.lineTo(x - 7, y + 4);
  context.moveTo(x, y - 7 + bob);
  context.lineTo(x + 7, y + 4);
  context.stroke();
};

const drawChicken = (context: CanvasRenderingContext2D, x: number, y: number, time: number) => {
  const peck = Math.sin(time * 5 + x) * 3;
  context.fillStyle = '#d98b3f';
  context.beginPath();
  context.ellipse(x, y, 13, 9, 0, 0, Math.PI * 2);
  context.fill();
  context.beginPath();
  context.arc(x + 10, y - 8 + peck, 6, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = '#b74838';
  context.fillRect(x + 8, y - 17 + peck, 4, 5);
  context.strokeStyle = '#6e4932';
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(x - 3, y + 6);
  context.lineTo(x - 4, y + 15);
  context.moveTo(x + 4, y + 6);
  context.lineTo(x + 5, y + 15);
  context.stroke();
};

const drawDog = (context: CanvasRenderingContext2D, x: number, y: number, time: number) => {
  context.fillStyle = '#5b4937';
  context.beginPath();
  context.ellipse(x, y, 18, 10, 0, 0, Math.PI * 2);
  context.fill();
  context.beginPath();
  context.arc(x + 17, y - 6, 8, 0, Math.PI * 2);
  context.fill();
  context.strokeStyle = '#5b4937';
  context.lineWidth = 4;
  context.beginPath();
  context.moveTo(x - 16, y - 4);
  context.quadraticCurveTo(x - 27, y - 17 - Math.sin(time * 5) * 4, x - 29, y - 7);
  context.stroke();
};

const drawBuffalo = (context: CanvasRenderingContext2D, x: number, y: number) => {
  context.fillStyle = '#3d3832';
  context.beginPath();
  context.ellipse(x, y, 31, 17, 0, 0, Math.PI * 2);
  context.fill();
  context.beginPath();
  context.ellipse(x + 30, y - 10, 14, 12, 0, 0, Math.PI * 2);
  context.fill();
  context.fillRect(x - 21, y + 10, 6, 20);
  context.fillRect(x + 14, y + 10, 6, 20);
  context.strokeStyle = '#dfcda5';
  context.lineWidth = 3;
  context.beginPath();
  context.arc(x + 35, y - 15, 14, 2.7, 4.6);
  context.stroke();
};

const drawWaterfallCliff = (context: CanvasRenderingContext2D, camera: number, time: number, quality: GameQuality) => {
  const x = VIEW_WIDTH / 2 + (14_850 - camera) * 0.78;
  if (x < -360 || x > VIEW_WIDTH + 330) return;
  context.save();
  context.globalAlpha = 0.92;
  context.fillStyle = '#52685b';
  context.beginPath();
  context.moveTo(x - 175, 338);
  context.lineTo(x - 142, 198);
  context.lineTo(x - 68, 150);
  context.lineTo(x - 12, 176);
  context.lineTo(x + 48, 126);
  context.lineTo(x + 126, 178);
  context.lineTo(x + 178, 338);
  context.closePath();
  context.fill();
  context.fillStyle = '#354e45';
  context.beginPath();
  context.moveTo(x - 164, 338);
  context.lineTo(x - 82, 184);
  context.lineTo(x - 31, 203);
  context.lineTo(x + 16, 338);
  context.closePath();
  context.fill();

  const water = context.createLinearGradient(x + 28, 150, x + 66, 342);
  water.addColorStop(0, 'rgba(226, 244, 224, .92)');
  water.addColorStop(0.48, 'rgba(139, 203, 191, .86)');
  water.addColorStop(1, 'rgba(79, 148, 143, .2)');
  context.fillStyle = water;
  context.beginPath();
  context.moveTo(x + 24, 156);
  context.bezierCurveTo(x + 5, 220, x + 57, 255, x + 31, 338);
  context.lineTo(x + 92, 338);
  context.bezierCurveTo(x + 68, 263, x + 105, 218, x + 75, 155);
  context.closePath();
  context.fill();
  context.strokeStyle = 'rgba(239, 255, 237, .72)';
  context.lineWidth = 3;
  for (let stream = 0; stream < (quality === 'high' ? 5 : 3); stream += 1) {
    const offset = stream * 13 + Math.sin(time * 2.1 + stream) * 5;
    context.beginPath();
    context.moveTo(x + 33 + offset, 164);
    context.bezierCurveTo(x + 19 + offset, 222, x + 65 + offset, 274, x + 43 + offset, 334);
    context.stroke();
  }
  if (quality === 'high') {
    for (let mist = 0; mist < 7; mist += 1) {
      const drift = Math.sin(time * 0.75 + mist * 1.8) * 18;
      context.fillStyle = `rgba(226, 244, 226, ${0.05 + (mist % 3) * 0.025})`;
      context.beginPath();
      context.arc(x + 48 + drift + mist * 9, 328 - (mist % 2) * 11, 30 + mist * 4, 0, Math.PI * 2);
      context.fill();
    }
  }
  context.restore();
};

const drawMonumentalLandscape = (context: CanvasRenderingContext2D, camera: number, time: number, quality: GameQuality) => {
  drawWaterfallCliff(context, camera, time, quality);

  const structures = [
    { worldX: 8_900, parallax: 0.48, baseY: 364, scale: 1.62, accent: '#c6a657' },
  ];
  structures.forEach((structure) => {
    const x = VIEW_WIDTH / 2 + (structure.worldX - camera) * structure.parallax;
    if (x < -360 || x > VIEW_WIDTH + 330) return;
    context.save();
    context.globalAlpha = 0.58;
    context.fillStyle = 'rgba(39, 57, 42, .28)';
    context.beginPath();
    context.moveTo(x - 170, structure.baseY + 8);
    context.lineTo(x - 118, structure.baseY - 36);
    context.lineTo(x + 195, structure.baseY - 22);
    context.lineTo(x + 245, structure.baseY + 8);
    context.closePath();
    context.fill();
    drawStiltHouse(context, x - 80, structure.baseY, structure.scale, structure.accent, time, quality === 'high');
    context.restore();
  });

  const terraceX = 21_300 - camera;
  if (terraceX > -520 && terraceX < VIEW_WIDTH + 280) {
    context.save();
    context.fillStyle = 'rgba(57, 70, 48, .76)';
    context.beginPath();
    context.moveTo(terraceX - 40, 374);
    context.lineTo(terraceX + 90, 319);
    context.lineTo(terraceX + 315, 338);
    context.lineTo(terraceX + 410, 396);
    context.lineTo(terraceX - 40, 396);
    context.closePath();
    context.fill();
    context.strokeStyle = '#69503a';
    context.lineWidth = 7;
    context.beginPath();
    context.moveTo(terraceX + 34, 350);
    context.lineTo(terraceX + 355, 372);
    context.stroke();
    for (let post = 0; post < 7; post += 1) {
      context.fillStyle = '#584231';
      context.fillRect(terraceX + 52 + post * 48, 352 + post * 3, 5, 48 - post * 3);
    }
    drawStiltHouse(context, terraceX + 116, 335, 0.72, '#75a195', time, quality === 'high');
    context.restore();
  }
};

const drawVillage = (context: CanvasRenderingContext2D, camera: number, time: number, quality: GameQuality) => {
  const houses = [560, 1_650, 2_720, 4_150, 5_470];
  houses.forEach((worldX, index) => {
    const x = worldX - camera;
    if (x < -190 || x > VIEW_WIDTH + 160) return;
    drawStiltHouse(context, x, 397, index % 2 === 0 ? 1.02 : 0.9, index % 2 === 0 ? '#d2b24f' : '#6c9188', time, quality === 'high');
    drawFence(context, x - 35, 170, 428);
    // Keep the first roadside gathering readable instead of parking a bike in it.
    if (index === 3) drawMotorbike(context, x + 48, 416);
    if (index % 2 === 0) drawPerson(context, x + 152, 418, '#466e69', time);
  });
  [1_070, 3_380, 4_780].forEach((worldX) => {
    const x = worldX - camera;
    if (x > -50 && x < VIEW_WIDTH + 50) drawChicken(context, x, 414, time);
  });
  const dogX = 4_930 - camera;
  if (dogX > -60 && dogX < VIEW_WIDTH + 60) drawDog(context, dogX, 411, time);
};

const drawCornfield = (context: CanvasRenderingContext2D, camera: number, time: number, quality: GameQuality) => {
  const start = 4_450;
  const end = 6_360;
  const visibleStart = Math.max(-50, start - camera);
  const visibleEnd = Math.min(VIEW_WIDTH + 50, end - camera);
  if (visibleEnd <= visibleStart) return;

  context.save();
  context.beginPath();
  context.rect(visibleStart, 318, visibleEnd - visibleStart, 120);
  context.clip();
  context.fillStyle = '#708f48';
  context.fillRect(visibleStart, 342, visibleEnd - visibleStart, 96);
  context.fillStyle = '#9eaa4d';
  context.fillRect(visibleStart, 372, visibleEnd - visibleStart, 66);

  const spacing = quality === 'low' ? 34 : 25;
  const first = Math.max(0, Math.floor((camera - start - 60) / spacing));
  const last = Math.ceil((camera + VIEW_WIDTH - start + 60) / spacing);
  for (let index = first; index <= last; index += 1) {
    const worldX = start + index * spacing;
    if (worldX > end) break;
    const x = Math.round(worldX - camera);
    const baseY = 433 - (index % 3) * 3;
    const height = 58 + (index % 4) * 7;
    const sway = Math.round(Math.sin(time * 1.8 + index * 0.8) * 3);
    context.fillStyle = index % 2 ? '#315f3b' : '#3b713e';
    context.fillRect(x, baseY - height, 5, height);
    context.fillRect(x - 11 + sway, baseY - height + 18, 13, 5);
    context.fillRect(x + 3, baseY - height + 32, 14 + sway, 5);
    context.fillStyle = '#d6ad45';
    context.fillRect(x + 3, baseY - height + 12, 9, 18);
    context.fillStyle = '#ead071';
    context.fillRect(x + 5, baseY - height + 15, 5, 12);
    context.fillStyle = '#477845';
    context.fillRect(x + 2, baseY - height + 8, 12, 6);
  }

  const signX = 4_790 - camera;
  if (signX > -140 && signX < VIEW_WIDTH + 140) {
    context.fillStyle = '#59422f';
    context.fillRect(signX, 337, 7, 94);
    context.fillRect(signX + 105, 337, 7, 94);
    context.fillStyle = '#d4a951';
    context.fillRect(signX - 8, 329, 128, 34);
    context.fillStyle = '#2a4937';
    context.font = '900 12px "Segoe UI", sans-serif';
    context.textAlign = 'center';
    context.fillText('ĐỒNG NGÔ', signX + 56, 351);
  }
  context.restore();
};

const drawFields = (context: CanvasRenderingContext2D, camera: number, time: number) => {
  const startX = 6_200 - camera;
  const endX = 12_900 - camera;
  const visibleStart = Math.max(-40, startX);
  const visibleEnd = Math.min(VIEW_WIDTH + 40, endX);
  if (visibleEnd <= visibleStart) return;
  context.save();
  context.beginPath();
  context.rect(visibleStart, 318, visibleEnd - visibleStart, 121);
  context.clip();
  context.fillStyle = '#7f984d';
  context.fillRect(visibleStart, 318, visibleEnd - visibleStart, 121);

  // Large stepped ribbons make the landscape read as terraces even on a phone.
  const terraceColors = ['#d8c865', '#aec15e', '#8fac50', '#739343', '#5f7f3d'];
  for (let segment = 0; segment < 13; segment += 1) {
    const segmentX = 6_080 + segment * 560 - camera;
    for (let level = 0; level < 5; level += 1) {
      const y = 319 + level * 24;
      const offset = (segment % 2 === 0 ? level * 17 : (4 - level) * 12);
      const x = Math.round(segmentX + offset);
      const width = 530 - level * 18;
      context.fillStyle = terraceColors[level];
      context.fillRect(x, y, width, 18);
      context.fillStyle = level % 2 ? '#536f38' : '#725f36';
      context.fillRect(x, y + 17, width, 5);
      context.fillStyle = 'rgba(239, 224, 133, .72)';
      context.fillRect(x + 8, y + 3, width - 16, 3);
      for (let rice = 20; rice < width - 20; rice += 58) {
        const bend = Math.round(Math.sin(time * 1.2 + rice + segment) * 2);
        context.fillStyle = '#3f743f';
        context.fillRect(x + rice, y + 6, 3, 9);
        context.fillRect(x + rice - 3 + bend, y + 7, 5, 3);
      }
    }
  }
  context.restore();
  const terraceLabelX = 8_000 - camera;
  if (terraceLabelX > -210 && terraceLabelX < VIEW_WIDTH + 210) {
    context.fillStyle = 'rgba(27, 55, 43, .88)';
    roundedRect(context, terraceLabelX - 92, 278, 184, 29, 5);
    context.fill();
    context.fillStyle = '#ffe09a';
    context.font = '900 12px "Segoe UI", sans-serif';
    context.textAlign = 'center';
    context.fillText('RUỘNG BẬC THANG', terraceLabelX, 297);
    context.textAlign = 'start';
  }
  [6_900, 8_850, 11_120].forEach((worldX, index) => {
    const x = worldX - camera;
    if (x > -80 && x < VIEW_WIDTH + 80) drawPerson(context, x, 404, index % 2 ? '#7c504c' : '#385d63', time);
  });
  const buffaloX = 9_520 - camera;
  if (buffaloX > -90 && buffaloX < VIEW_WIDTH + 90) drawBuffalo(context, buffaloX, 397);
  context.fillStyle = 'rgba(42, 58, 50, .65)';
  for (let bird = 0; bird < 5; bird += 1) {
    const x = ((bird * 213 + time * (8 + bird)) % 1_200) - 120;
    const y = 175 + bird * 16;
    context.beginPath();
    context.arc(x, y, 5, Math.PI * 1.1, Math.PI * 1.9);
    context.arc(x + 10, y, 5, Math.PI * 1.1, Math.PI * 1.9);
    context.strokeStyle = 'rgba(42, 58, 50, .65)';
    context.lineWidth = 2;
    context.stroke();
  }
};

const drawWaterWheel = (context: CanvasRenderingContext2D, camera: number, time: number, quality: GameQuality) => {
  const x = 13_650 - camera;
  if (x < -150 || x > VIEW_WIDTH + 150) return;
  const centerY = 356;
  const radius = 67;
  context.save();

  context.fillStyle = '#68492f';
  context.fillRect(x - 87, centerY + 58, 12, 80);
  context.fillRect(x + 74, centerY + 58, 12, 80);
  context.fillRect(x - 94, centerY + 65, 187, 9);
  context.strokeStyle = '#8a6239';
  context.lineWidth = 6;
  context.beginPath();
  context.moveTo(x - 76, centerY + 68);
  context.lineTo(x, centerY);
  context.lineTo(x + 78, centerY + 68);
  context.stroke();

  context.translate(x, centerY);
  context.rotate(time * 0.34);
  context.strokeStyle = '#8b673e';
  context.lineWidth = 8;
  context.beginPath();
  context.arc(0, 0, radius, 0, Math.PI * 2);
  context.stroke();
  context.strokeStyle = '#d0a966';
  context.lineWidth = 3;
  context.beginPath();
  context.arc(0, 0, radius - 9, 0, Math.PI * 2);
  context.stroke();
  const spokeCount = quality === 'low' ? 8 : 12;
  for (let spoke = 0; spoke < spokeCount; spoke += 1) {
    context.save();
    context.rotate((Math.PI * 2 * spoke) / spokeCount);
    context.fillStyle = '#765333';
    context.fillRect(-3, -4, radius + 3, 7);
    context.fillStyle = '#bc8a4d';
    context.fillRect(radius - 5, -10, 18, 20);
    context.fillStyle = '#e1bc70';
    context.fillRect(radius + 7, -7, 6, 14);
    context.restore();
  }
  context.fillStyle = '#513722';
  context.fillRect(-12, -12, 24, 24);
  context.fillStyle = '#d7ad62';
  context.fillRect(-5, -5, 10, 10);
  context.restore();

  context.save();
  context.fillStyle = 'rgba(227, 245, 222, .74)';
  for (let splash = 0; splash < 6; splash += 1) {
    const px = x + 45 + splash * 9;
    const py = 405 + Math.round(Math.sin(time * 3.2 + splash) * 6);
    context.fillRect(px, py, 6, 4);
  }
  context.fillStyle = 'rgba(27, 55, 45, .86)';
  roundedRect(context, x - 76, 255, 152, 27, 5);
  context.fill();
  context.fillStyle = '#ffe09a';
  context.font = '900 12px "Segoe UI", sans-serif';
  context.textAlign = 'center';
  context.fillText('CỌN NƯỚC BÊN SUỐI', x, 273);
  context.restore();
};

const drawStreamGirl = (context: CanvasRenderingContext2D, camera: number, time: number) => {
  const x = 15_720 - camera;
  if (x < -130 || x > VIEW_WIDTH + 130) return;
  const bob = Math.round(Math.sin(time * 1.7) * 2);
  context.save();

  context.fillStyle = 'rgba(224, 245, 225, .46)';
  context.fillRect(x - 62, 414, 126, 5);
  context.fillRect(x - 42, 425, 88, 4);
  context.fillStyle = '#d7a071';
  context.fillRect(x - 9, 371 + bob, 8, 47);
  context.fillRect(x + 7, 371 + bob, 8, 47);
  context.fillStyle = '#272b2a';
  context.fillRect(x - 18, 341 + bob, 40, 40);
  context.fillStyle = '#40433e';
  context.fillRect(x - 20, 369 + bob, 44, 10);
  context.fillStyle = '#b33f47';
  context.fillRect(x - 20, 310 + bob, 44, 39);
  context.fillStyle = '#e2c36f';
  context.fillRect(x - 20, 342 + bob, 44, 6);
  context.fillStyle = '#f1d594';
  context.fillRect(x - 14, 317 + bob, 5, 5);
  context.fillRect(x + 2, 317 + bob, 5, 5);
  context.fillRect(x + 14, 317 + bob, 5, 5);
  context.fillStyle = '#d7a071';
  context.fillRect(x - 11, 287 + bob, 25, 25);
  context.fillRect(x - 29, 317 + bob, 10, 35);
  context.fillRect(x + 23, 316 + bob, 10, 43);
  context.fillRect(x + 29, 353 + bob, 20, 8);
  context.fillStyle = '#242827';
  context.fillRect(x - 15, 281 + bob, 33, 12);
  context.fillRect(x + 8, 270 + bob, 17, 18);
  context.fillStyle = '#d6dde0';
  context.fillRect(x - 18, 307 + bob, 40, 4);
  context.fillRect(x - 16, 330 + bob, 36, 3);
  context.fillStyle = '#f4eee0';
  context.fillRect(x + 46, 352 + bob, 20, 10);
  context.fillStyle = '#c8e5df';
  context.fillRect(x + 49, 354 + bob, 14, 3);

  // Fish gather around her feet — a gentle visual nod to the folk lyric.
  context.fillStyle = '#e6c15a';
  for (let fish = 0; fish < 4; fish += 1) {
    const fishX = x - 53 + fish * 34 + Math.round(Math.sin(time * 1.4 + fish) * 8);
    context.fillRect(fishX, 421 + (fish % 2) * 8, 12, 5);
    context.fillRect(fishX - 5, 419 + (fish % 2) * 8, 5, 9);
  }
  context.fillStyle = 'rgba(25, 53, 44, .86)';
  roundedRect(context, x - 94, 237, 188, 27, 5);
  context.fill();
  context.fillStyle = '#ffe09a';
  context.font = '900 12px "Segoe UI", sans-serif';
  context.textAlign = 'center';
  context.fillText('CÔ GÁI THÁI BÊN SUỐI', x, 255);
  context.restore();
};

const drawStreamZone = (context: CanvasRenderingContext2D, camera: number, time: number, quality: GameQuality) => {
  const startX = 12_650 - camera;
  const endX = 19_300 - camera;
  const visibleStart = Math.max(-40, startX);
  const visibleEnd = Math.min(VIEW_WIDTH + 40, endX);
  if (visibleEnd <= visibleStart) return;
  const water = context.createLinearGradient(0, 338, 0, 439);
  water.addColorStop(0, '#80b9ad');
  water.addColorStop(0.55, '#4f928e');
  water.addColorStop(1, '#376d67');
  context.fillStyle = water;
  context.fillRect(visibleStart, 338, visibleEnd - visibleStart, 101);
  context.strokeStyle = 'rgba(226, 245, 218, .65)';
  context.lineWidth = 3;
  const waveStep = quality === 'low' ? 64 : 42;
  for (let x = visibleStart - 30; x < visibleEnd + 30; x += waveStep) {
    const y = 355 + ((x + camera * 0.2) % 74) + Math.sin(time * 1.4 + x * 0.02) * 4;
    context.beginPath();
    context.moveTo(x, y);
    context.quadraticCurveTo(x + 13, y - 5, x + 27, y);
    context.stroke();
  }
  [13_400, 15_930, 18_100].forEach((worldX, index) => {
    const x = worldX - camera;
    if (x < -110 || x > VIEW_WIDTH + 110) return;
    context.fillStyle = index % 2 ? '#626956' : '#7e765d';
    context.beginPath();
    context.ellipse(x, 416, 50, 20, -0.08, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = '#55754e';
    for (let grass = -34; grass <= 34; grass += 14) {
      context.fillRect(x + grass, 386 + Math.sin(time + grass) * 2, 3, 25);
    }
  });
  const bridgeX = 17_050 - camera;
  if (bridgeX > -240 && bridgeX < VIEW_WIDTH + 240) {
    context.strokeStyle = '#6b4a32';
    context.lineWidth = 8;
    for (let plank = 0; plank < 7; plank += 1) {
      context.beginPath();
      context.moveTo(bridgeX + plank * 30, 385 + Math.sin(plank * 0.6) * 3);
      context.lineTo(bridgeX + plank * 30 + 23, 382 + Math.sin(plank * 0.6) * 3);
      context.stroke();
    }
    context.lineWidth = 3;
    context.beginPath();
    context.moveTo(bridgeX - 5, 365);
    context.quadraticCurveTo(bridgeX + 95, 340, bridgeX + 202, 363);
    context.stroke();
  }
  if (quality === 'high') {
    context.fillStyle = 'rgba(240, 201, 91, .8)';
    for (let fish = 0; fish < 3; fish += 1) {
      const x = visibleStart + ((time * (25 + fish * 8) + fish * 270) % Math.max(80, visibleEnd - visibleStart));
      const y = 377 + fish * 17;
      context.beginPath();
      context.ellipse(x, y, 8, 3, 0, 0, Math.PI * 2);
      context.fill();
    }
  }
  drawWaterWheel(context, camera, time, quality);
  drawStreamGirl(context, camera, time);
};

const drawDienBienMuseum = (context: CanvasRenderingContext2D, camera: number, quality: GameQuality) => {
  const x = 21_300 - camera;
  if (x < -260 || x > VIEW_WIDTH + 260) return;
  const topY = 274;
  const baseY = 426;
  context.save();
  context.fillStyle = 'rgba(30, 45, 39, .24)';
  context.fillRect(x - 172, baseY + 3, 344, 13);

  context.fillStyle = '#c9c2ad';
  context.beginPath();
  context.moveTo(x - 104, topY);
  context.lineTo(x + 104, topY);
  context.lineTo(x + 158, baseY);
  context.lineTo(x - 158, baseY);
  context.closePath();
  context.fill();
  context.fillStyle = '#ddd6bd';
  context.fillRect(x - 110, topY - 12, 220, 18);
  context.fillStyle = '#857c69';
  context.fillRect(x - 158, baseY - 13, 316, 13);

  context.save();
  context.beginPath();
  context.moveTo(x - 101, topY + 7);
  context.lineTo(x + 101, topY + 7);
  context.lineTo(x + 151, baseY - 15);
  context.lineTo(x - 151, baseY - 15);
  context.closePath();
  context.clip();
  context.strokeStyle = 'rgba(88, 87, 71, .52)';
  context.lineWidth = quality === 'low' ? 5 : 3;
  const meshStep = quality === 'low' ? 34 : 23;
  for (let line = -310; line < 330; line += meshStep) {
    context.beginPath();
    context.moveTo(x + line, topY - 5);
    context.lineTo(x + line + 150, baseY);
    context.stroke();
    context.beginPath();
    context.moveTo(x + line, baseY);
    context.lineTo(x + line + 150, topY - 5);
    context.stroke();
  }
  context.restore();

  context.fillStyle = '#283c38';
  context.fillRect(x - 34, 349, 68, 64);
  context.fillStyle = '#a9463c';
  context.fillRect(x - 16, 289, 32, 32);
  context.fillStyle = '#f2cf68';
  context.font = '900 20px Georgia, serif';
  context.textAlign = 'center';
  context.fillText('★', x, 313);
  context.fillStyle = 'rgba(24, 48, 40, .9)';
  roundedRect(context, x - 112, 233, 224, 29, 5);
  context.fill();
  context.fillStyle = '#ffe4a2';
  context.font = '900 12px "Segoe UI", sans-serif';
  context.fillText('BẢO TÀNG ĐIỆN BIÊN PHỦ', x, 252);
  context.restore();
};

const drawVictoryMonument = (context: CanvasRenderingContext2D, camera: number) => {
  const x = 23_960 - camera;
  if (x < -220 || x > VIEW_WIDTH + 220) return;
  context.save();
  context.fillStyle = '#776746';
  context.fillRect(x - 128, 402, 256, 26);
  context.fillStyle = '#9c8a61';
  context.fillRect(x - 102, 380, 204, 22);
  context.fillStyle = '#b5a275';
  context.fillRect(x - 78, 360, 156, 20);

  const bronze = '#927040';
  const lightBronze = '#b58d4c';
  [-35, 0, 35].forEach((offset, index) => {
    const headY = index === 1 ? 246 : 260;
    context.fillStyle = lightBronze;
    context.fillRect(x + offset - 8, headY, 17, 18);
    context.fillStyle = bronze;
    context.fillRect(x + offset - 13, headY + 18, 27, 66);
    context.fillRect(x + offset - 16, headY + 82, 12, 40);
    context.fillRect(x + offset + 5, headY + 82, 12, 40);
  });
  context.fillStyle = bronze;
  context.fillRect(x - 54, 279, 24, 10);
  context.fillRect(x + 31, 280, 24, 10);

  // Small Thai child beside the soldier group, part of the monument ensemble.
  context.fillStyle = '#a78148';
  context.fillRect(x + 68, 314, 13, 15);
  context.fillRect(x + 64, 329, 21, 34);
  context.fillRect(x + 65, 362, 7, 20);
  context.fillRect(x + 78, 362, 7, 20);

  context.fillStyle = '#76542f';
  context.fillRect(x + 1, 160, 8, 204);
  context.fillStyle = '#bd3f3d';
  context.beginPath();
  context.moveTo(x + 9, 165);
  context.lineTo(x + 112, 184);
  context.lineTo(x + 9, 229);
  context.closePath();
  context.fill();
  context.fillStyle = '#f3d264';
  context.font = '900 21px Georgia, serif';
  context.textAlign = 'center';
  context.fillText('★', x + 48, 204);

  context.fillStyle = 'rgba(24, 48, 40, .9)';
  roundedRect(context, x - 103, 119, 206, 29, 5);
  context.fill();
  context.fillStyle = '#ffe4a2';
  context.font = '900 12px "Segoe UI", sans-serif';
  context.fillText('TƯỢNG ĐÀI CHIẾN THẮNG', x, 138);
  context.restore();
};

const drawCommunity = (context: CanvasRenderingContext2D, camera: number, time: number, quality: GameQuality) => {
  const houses = [19_700, 22_700, 25_120];
  houses.forEach((worldX, index) => {
    const x = worldX - camera;
    if (x < -190 || x > VIEW_WIDTH + 170) return;
    drawStiltHouse(context, x, 397, index === 1 ? 1.12 : 0.94, index % 2 ? '#d39b51' : '#7a9b86', time, quality === 'high');
  });
  [20_020, 20_105, 23_250, 23_335, 24_050].forEach((worldX, index) => {
    const x = worldX - camera;
    if (x > -50 && x < VIEW_WIDTH + 50) drawPerson(context, x, 420, index % 2 ? '#b55342' : '#315e61', time, true);
  });
  const drumX = 23_290 - camera;
  if (drumX > -60 && drumX < VIEW_WIDTH + 60) {
    context.fillStyle = '#7b4c31';
    context.beginPath();
    context.ellipse(drumX, 404, 18, 28, Math.PI / 2, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = '#e5ba63';
    context.lineWidth = 3;
    context.stroke();
  }
  context.fillStyle = 'rgba(255, 205, 103, .82)';
  for (let lantern = 0; lantern < 10; lantern += 1) {
    const worldX = 19_350 + lantern * 650;
    const x = worldX - camera;
    if (x < -30 || x > VIEW_WIDTH + 30) continue;
    const y = 286 + Math.sin(lantern * 1.7) * 18;
    context.beginPath();
    context.arc(x, y, 6 + Math.sin(time * 2 + lantern), 0, Math.PI * 2);
    context.fill();
  }
};

const drawSeatedNeighbor = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  shirt: string,
  time: number,
  cheering: boolean,
) => {
  const bob = cheering ? Math.sin(time * 7 + x * 0.1) * 3 : Math.sin(time * 1.8 + x) * 1.2;
  context.fillStyle = '#c99062';
  context.beginPath();
  context.arc(x, y - 35 + bob, 7, 0, Math.PI * 2);
  context.fill();
  context.strokeStyle = shirt;
  context.lineWidth = 9;
  context.lineCap = 'round';
  context.beginPath();
  context.moveTo(x, y - 25 + bob);
  context.lineTo(x, y - 10 + bob);
  context.stroke();
  context.strokeStyle = '#26362f';
  context.lineWidth = 4;
  context.beginPath();
  context.moveTo(x, y - 10 + bob);
  context.lineTo(x - 11, y - 1);
  context.moveTo(x, y - 10 + bob);
  context.lineTo(x + 11, y - 1);
  context.stroke();
  context.strokeStyle = shirt;
  context.beginPath();
  context.moveTo(x, y - 23 + bob);
  context.lineTo(x + (cheering ? 15 : 9), y - (cheering ? 40 : 19) + bob);
  context.stroke();
  context.fillStyle = '#f1dda7';
  context.fillRect(x + (cheering ? 13 : 7), y - (cheering ? 45 : 24) + bob, 5, 6);
};

const drawRoadsideFeast = (context: CanvasRenderingContext2D, game: GameState, camera: number) => {
  const x = FEAST_X - camera;
  if (x < -300 || x > VIEW_WIDTH + 300) return;
  const cheering = game.cheerUntil > game.elapsed || (game.feastNoticeUntil > game.elapsed && game.feastUntil <= game.elapsed);
  context.save();
  context.fillStyle = 'rgba(55, 49, 35, .22)';
  context.beginPath();
  context.ellipse(x + 20, GROUND_Y + 6, 150, 30, -0.02, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = '#b45e45';
  context.fillRect(x - 91, GROUND_Y - 11, 218, 15);
  context.fillStyle = '#d69e55';
  context.fillRect(x - 77, GROUND_Y - 8, 190, 8);

  context.save();
  context.translate(x + 12, GROUND_Y - 29);
  context.scale(1.24, 1.24);
  context.fillStyle = '#9a5438';
  context.beginPath();
  context.ellipse(0, 0, 55, 17, 0, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = '#e5b968';
  context.beginPath();
  context.ellipse(0, -4, 46, 10, 0, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = '#6c8b5e';
  context.fillRect(-26, -10, 11, 8);
  context.fillRect(3, -9, 9, 7);
  context.fillStyle = '#f3dfad';
  [-38, -17, 19, 38].forEach((cupX) => context.fillRect(cupX, -13, 7, 9));
  context.restore();

  drawSeatedNeighbor(context, x - 72, GROUND_Y - 3, '#a04d3d', game.worldTime, cheering);
  drawSeatedNeighbor(context, x + 101, GROUND_Y - 3, '#376a67', game.worldTime, cheering);
  drawSeatedNeighbor(context, x - 24, GROUND_Y - 73, '#315c63', game.worldTime, cheering);
  drawSeatedNeighbor(context, x + 43, GROUND_Y - 76, '#746248', game.worldTime, cheering);
  drawSeatedNeighbor(context, x + 132, GROUND_Y - 59, '#9d5943', game.worldTime, cheering);

  context.fillStyle = 'rgba(30, 52, 42, .82)';
  roundedRect(context, x - 100, GROUND_Y - 149, 230, 34, 7);
  context.fill();
  context.fillStyle = '#ffe6a1';
  context.font = '900 13px "Segoe UI", sans-serif';
  context.textAlign = 'center';
  context.fillText(game.cheerUnlocked ? 'MÂM NHẬU · KỸ NĂNG DZÔ!' : 'MÂM NHẬU · MỜI NGỒI!', x + 15, GROUND_Y - 127);
  context.textAlign = 'start';
  context.restore();
};

const pickupShortLabel: Record<PowerKind, string> = {
  squash: 'BÍ',
  coffee: 'CÀ PHÊ',
  macadamia: 'MẮC CA',
  tea: 'SHAN TUYẾT',
  buffalo: 'TRÂU GÁC BẾP',
};

const drawPickup = (context: CanvasRenderingContext2D, pickup: Pickup, x: number, time: number) => {
  const bob = Math.sin(time * 3.2 + pickup.x * 0.01) * 6;
  const y = pickup.y + bob;
  const pulse = 18 + Math.sin(time * 4 + pickup.x) * 3;
  context.fillStyle = pickup.kind === 'token' ? 'rgba(255, 221, 111, .18)' : 'rgba(255, 247, 198, .22)';
  context.beginPath();
  context.arc(x + 14, y + 12, pulse, 0, Math.PI * 2);
  context.fill();

  if (pickup.kind === 'token') {
    context.save();
    context.translate(x + 14, y + 12);
    context.rotate(time * 0.8);
    context.fillStyle = '#f0c85c';
    for (let petal = 0; petal < 8; petal += 1) {
      context.rotate(Math.PI / 4);
      context.fillRect(3, -3, 11, 6);
    }
    context.fillStyle = '#c25243';
    context.beginPath();
    context.arc(0, 0, 5, 0, Math.PI * 2);
    context.fill();
    context.restore();
    return;
  }

  context.save();
  context.translate(x, y);
  if (pickup.kind === 'squash') {
    context.fillStyle = '#88b64c';
    context.beginPath();
    context.ellipse(14, 13, 16, 12, -0.2, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = '#d9e989';
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(6, 5);
    context.quadraticCurveTo(14, 14, 25, 19);
    context.stroke();
    context.fillStyle = '#476b37';
    context.fillRect(12, -2, 5, 7);
  } else if (pickup.kind === 'coffee') {
    context.fillStyle = '#f1d29b';
    roundedRect(context, 2, 1, 27, 24, 5);
    context.fill();
    context.strokeStyle = '#6e3d2b';
    context.lineWidth = 4;
    context.beginPath();
    context.arc(29, 11, 8, -Math.PI / 2, Math.PI / 2);
    context.stroke();
    context.fillStyle = '#6d3d2a';
    context.fillRect(5, 5, 21, 7);
    context.strokeStyle = 'rgba(255,255,255,.7)';
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(9, -3);
    context.quadraticCurveTo(5, -10, 11, -15);
    context.moveTo(18, -3);
    context.quadraticCurveTo(14, -11, 20, -17);
    context.stroke();
  } else if (pickup.kind === 'macadamia') {
    context.fillStyle = '#d8bd78';
    context.beginPath();
    context.arc(14, 12, 14, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = '#8a6b3f';
    context.lineWidth = 3;
    context.beginPath();
    context.arc(14, 12, 8, -0.8, 2.2);
    context.stroke();
  } else if (pickup.kind === 'tea') {
    context.fillStyle = '#e9e1bb';
    roundedRect(context, 2, 5, 28, 21, 4);
    context.fill();
    context.fillStyle = '#75a56f';
    context.fillRect(5, 8, 22, 7);
    context.fillStyle = '#8fc78a';
    context.beginPath();
    context.ellipse(10, 0, 5, 11, -0.7, 0, Math.PI * 2);
    context.ellipse(19, -3, 5, 11, 0.6, 0, Math.PI * 2);
    context.fill();
  } else {
    context.fillStyle = '#7e3f32';
    context.fillRect(2, 1, 8, 28);
    context.fillRect(13, -2, 8, 30);
    context.fillRect(24, 2, 8, 27);
    context.fillStyle = '#d18a55';
    context.fillRect(4, 6, 4, 2);
    context.fillRect(15, 4, 4, 2);
    context.fillRect(26, 9, 4, 2);
  }
  context.restore();

  context.font = '800 9px "Segoe UI", sans-serif';
  const label = pickupShortLabel[pickup.kind];
  const width = context.measureText(label).width + 12;
  context.fillStyle = 'rgba(27, 49, 39, .82)';
  roundedRect(context, x + 14 - width / 2, y + 34, width, 17, 7);
  context.fill();
  context.fillStyle = '#fff4ca';
  context.textAlign = 'center';
  context.fillText(label, x + 14, y + 46);
  context.textAlign = 'start';
};

const drawHazard = (context: CanvasRenderingContext2D, hazard: Hazard, game: GameState, camera: number) => {
  const worldX = movingHazardX(hazard, game);
  const x = worldX - camera;
  if (x < -200 || x > VIEW_WIDTH + 200 || game.broken.has(hazard.id)) return;
  if (hazard.kind === 'stream') {
    const water = context.createLinearGradient(0, GROUND_Y - 4, 0, VIEW_HEIGHT);
    water.addColorStop(0, '#88c5bb');
    water.addColorStop(1, '#3c7672');
    context.fillStyle = water;
    context.fillRect(x, GROUND_Y - 4, hazard.width, VIEW_HEIGHT - GROUND_Y + 4);
    context.strokeStyle = 'rgba(239, 255, 231, .7)';
    context.lineWidth = 3;
    for (let wave = 10; wave < hazard.width; wave += 32) {
      context.beginPath();
      context.moveTo(x + wave, GROUND_Y + 10 + Math.sin(game.worldTime * 3 + wave) * 3);
      context.lineTo(x + wave + 17, GROUND_Y + 10 + Math.cos(game.worldTime * 3 + wave) * 3);
      context.stroke();
    }
    return;
  }
  if (hazard.kind === 'basket') {
    context.fillStyle = '#9b693a';
    roundedRect(context, x, GROUND_Y - 42, hazard.width, 42, 7);
    context.fill();
    context.strokeStyle = '#d7aa5d';
    context.lineWidth = 3;
    for (let stripe = 7; stripe < hazard.width; stripe += 13) {
      context.beginPath();
      context.moveTo(x + stripe, GROUND_Y - 39);
      context.lineTo(x + stripe - 4, GROUND_Y - 3);
      context.stroke();
    }
    return;
  }
  if (hazard.kind === 'goat') {
    context.fillStyle = '#eee3cb';
    context.beginPath();
    context.ellipse(x + 29, GROUND_Y - 23, 29, 18, 0, 0, Math.PI * 2);
    context.fill();
    context.beginPath();
    context.ellipse(x + 59, GROUND_Y - 35, 14, 13, 0, 0, Math.PI * 2);
    context.fill();
    context.fillRect(x + 10, GROUND_Y - 13, 5, 18);
    context.fillRect(x + 42, GROUND_Y - 13, 5, 18);
    context.strokeStyle = '#685240';
    context.lineWidth = 3;
    context.beginPath();
    context.moveTo(x + 56, GROUND_Y - 45);
    context.lineTo(x + 50, GROUND_Y - 56);
    context.moveTo(x + 64, GROUND_Y - 45);
    context.lineTo(x + 70, GROUND_Y - 56);
    context.stroke();
    return;
  }
  if (hazard.kind === 'chicken') {
    drawChicken(context, x + 19, GROUND_Y - 16, game.worldTime);
    return;
  }
  if (hazard.kind === 'hay') {
    context.fillStyle = '#d6a847';
    roundedRect(context, x, GROUND_Y - 66, hazard.width, 66, 9);
    context.fill();
    context.strokeStyle = '#8c5f33';
    context.lineWidth = 3;
    context.beginPath();
    context.arc(x + hazard.width / 2, GROUND_Y - 33, 25, 0, Math.PI * 2);
    context.stroke();
    context.beginPath();
    context.moveTo(x + 8, GROUND_Y - 11);
    context.lineTo(x + hazard.width - 8, GROUND_Y - 56);
    context.stroke();
    return;
  }
  if (hazard.kind === 'log') {
    context.fillStyle = '#6e4931';
    roundedRect(context, x, GROUND_Y - 44, hazard.width, 44, 18);
    context.fill();
    context.fillStyle = '#b77b4a';
    context.beginPath();
    context.arc(x + hazard.width - 14, GROUND_Y - 22, 16, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = '#75462e';
    context.beginPath();
    context.arc(x + hazard.width - 14, GROUND_Y - 22, 9, 0, Math.PI * 2);
    context.stroke();
    return;
  }
  context.fillStyle = '#6f7568';
  context.beginPath();
  context.moveTo(x, GROUND_Y);
  context.lineTo(x + 12, GROUND_Y - 35);
  context.lineTo(x + hazard.width * 0.55, GROUND_Y - 48);
  context.lineTo(x + hazard.width, GROUND_Y - 8);
  context.lineTo(x + hazard.width - 9, GROUND_Y);
  context.closePath();
  context.fill();
  context.fillStyle = 'rgba(255,255,255,.2)';
  context.beginPath();
  context.moveTo(x + 16, GROUND_Y - 32);
  context.lineTo(x + hazard.width * 0.55, GROUND_Y - 44);
  context.lineTo(x + hazard.width * 0.45, GROUND_Y - 30);
  context.closePath();
  context.fill();
};

const drawPlayer = (context: CanvasRenderingContext2D, game: GameState, camera: number, alpha = 1, trailX?: number, trailY?: number) => {
  const player = game.player;
  const x = (trailX ?? player.x) - camera;
  const y = trailY ?? player.y;
  const squashActive = isPowerActive(game, 'squash');
  const coffeeActive = isPowerActive(game, 'coffee');
  const buffaloActive = isPowerActive(game, 'buffalo');
  const teaActive = isPowerActive(game, 'tea');
  const runCycle = Math.sin(game.worldTime * (coffeeActive ? 25 : 14) + player.x * 0.03);
  const airborneStretch = player.grounded ? 1 : clamp(1 + Math.abs(player.vy) / 2_400, 1, 1.18);
  const growth = squashActive ? 1.36 : 1;
  const seated = trailX === undefined && game.feastStarted && game.feastUntil > game.elapsed;
  const blink = !seated && game.invulnerableUntil > game.elapsed && Math.floor(game.elapsed * 15) % 2 === 0;
  if (blink && alpha === 1) return;

  if (seated) {
    context.save();
    context.globalAlpha = alpha;
    context.translate(x + player.width / 2, GROUND_Y - 4);
    context.scale(player.facing, 1);
    context.strokeStyle = '#172922';
    context.lineWidth = 6;
    context.lineCap = 'round';
    context.beginPath();
    context.moveTo(-2, -13);
    context.lineTo(-16, -2);
    context.moveTo(6, -13);
    context.lineTo(18, -2);
    context.stroke();
    context.fillStyle = '#243f3c';
    roundedRect(context, -12, -43, 27, 31, 7);
    context.fill();
    context.fillStyle = '#d7a16d';
    context.beginPath();
    context.arc(2, -50, 10, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = '#252e28';
    context.beginPath();
    context.arc(1, -53, 10, Math.PI, Math.PI * 2);
    context.fill();
    context.fillStyle = '#b44d3d';
    context.fillRect(-10, -61, 25, 6);
    context.strokeStyle = '#e6c86d';
    context.lineWidth = 7;
    context.beginPath();
    context.moveTo(11, -35);
    context.lineTo(27, -27);
    context.stroke();
    context.fillStyle = '#f1dda7';
    context.fillRect(25, -31, 6, 8);
    context.restore();
    return;
  }

  context.save();
  context.globalAlpha = alpha;
  context.translate(x + player.width / 2, y + player.height);
  context.scale(player.facing * growth / airborneStretch, growth * airborneStretch);
  context.translate(-player.width / 2, -player.height);

  if (buffaloActive) {
    context.fillStyle = 'rgba(232, 116, 57, .2)';
    context.beginPath();
    context.arc(player.width / 2, player.height / 2, 34 + Math.sin(game.elapsed * 8) * 3, 0, Math.PI * 2);
    context.fill();
  }
  if (teaActive) {
    context.strokeStyle = 'rgba(211, 247, 219, .55)';
    context.lineWidth = 3;
    context.beginPath();
    context.arc(player.width / 2, player.height / 2, 29 + Math.sin(game.elapsed * 3) * 4, 0, Math.PI * 2);
    context.stroke();
  }
  if (isPowerActive(game, 'macadamia')) {
    context.fillStyle = 'rgba(246, 219, 135, .13)';
    context.strokeStyle = 'rgba(255, 230, 151, .92)';
    context.lineWidth = 3;
    context.beginPath();
    context.arc(player.width / 2, player.height / 2, 35 + Math.sin(game.elapsed * 5) * 2, 0, Math.PI * 2);
    context.fill();
    context.stroke();
    context.strokeStyle = 'rgba(145, 102, 48, .72)';
    context.lineWidth = 1.5;
    for (let segment = 0; segment < 6; segment += 1) {
      const angle = (segment / 6) * Math.PI * 2;
      context.beginPath();
      context.arc(player.width / 2 + Math.cos(angle) * 24, player.height / 2 + Math.sin(angle) * 24, 5, 0, Math.PI * 2);
      context.stroke();
    }
  }

  context.strokeStyle = '#172922';
  context.lineWidth = 7;
  context.lineCap = 'round';
  context.beginPath();
  context.moveTo(12, 45);
  context.lineTo(10 - runCycle * 7, 55);
  context.moveTo(24, 45);
  context.lineTo(26 + runCycle * 7, 55);
  context.stroke();
  context.fillStyle = '#243f3c';
  roundedRect(context, 5, 19, 27, 31, 7);
  context.fill();
  context.fillStyle = '#335c58';
  context.fillRect(8, 22, 21, 7);
  context.fillStyle = buffaloActive ? '#d37442' : '#e6c86d';
  context.fillRect(player.facing > 0 ? 1 : 26, 23, 8, 22);
  context.fillStyle = '#d7a16d';
  context.beginPath();
  context.arc(18, 12, 10, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = '#252e28';
  context.beginPath();
  context.arc(17, 9, 10, Math.PI, Math.PI * 2);
  context.fill();
  context.fillStyle = '#b44d3d';
  context.fillRect(6, 1, 25, 6);
  context.fillRect(10, -3, 17, 5);
  context.fillStyle = '#1c2824';
  context.fillRect(22, 11, 2, 2);

  if (coffeeActive) {
    context.strokeStyle = 'rgba(255, 230, 159, .72)';
    context.lineWidth = 2;
    for (let line = 0; line < 3; line += 1) {
      context.beginPath();
      context.moveTo(-15 - line * 9, 25 + line * 8);
      context.lineTo(-2 - line * 5, 25 + line * 8);
      context.stroke();
    }
  }
  context.restore();
};

const drawCheerWave = (context: CanvasRenderingContext2D, game: GameState, camera: number) => {
  if (game.cheerUntil <= game.elapsed) return;
  const progress = clamp(1 - (game.cheerUntil - game.elapsed) / CHEER_DURATION, 0, 1);
  const x = game.player.x + game.player.width / 2 - camera;
  const y = game.player.y + 24;
  context.save();
  context.textAlign = 'center';
  context.font = `900 ${30 + progress * 14}px "Segoe UI", sans-serif`;
  context.fillStyle = `rgba(255, 230, 139, ${1 - progress * 0.72})`;
  context.strokeStyle = 'rgba(42, 70, 57, .55)';
  context.lineWidth = 5;
  context.strokeText('DZÔÔÔ!', x + game.player.facing * 52, y - 58 - progress * 20);
  context.fillText('DZÔÔÔ!', x + game.player.facing * 52, y - 58 - progress * 20);
  for (let ring = 0; ring < 3; ring += 1) {
    const ringProgress = clamp(progress * 1.25 - ring * 0.16, 0, 1);
    if (ringProgress <= 0) continue;
    context.strokeStyle = `rgba(255, 226, 132, ${(1 - ringProgress) * 0.68})`;
    context.lineWidth = 5 - ringProgress * 2;
    context.beginPath();
    context.arc(x, y, 42 + ringProgress * 260, -0.72, 0.72);
    context.stroke();
  }
  context.restore();
};

const drawParticles = (context: CanvasRenderingContext2D, game: GameState, camera: number) => {
  game.particles.forEach((particle) => {
    const alpha = clamp(particle.life / particle.maxLife, 0, 1);
    context.save();
    context.globalAlpha = alpha;
    context.fillStyle = particle.color;
    const x = particle.x - camera;
    if (particle.shape === 'circle') {
      context.beginPath();
      context.arc(x, particle.y, particle.size / 2, 0, Math.PI * 2);
      context.fill();
    } else if (particle.shape === 'leaf') {
      context.translate(x, particle.y);
      context.rotate((1 - alpha) * 3.4);
      context.beginPath();
      context.ellipse(0, 0, particle.size, particle.size * 0.42, 0, 0, Math.PI * 2);
      context.fill();
    } else {
      context.fillRect(x, particle.y, particle.size, particle.size);
    }
    context.restore();
  });
};

const drawTemporalArrival = (context: CanvasRenderingContext2D, game: GameState, camera: number) => {
  if (game.elapsed > 4.2) return;
  const x = PLAYER_START_X + 17 - camera;
  const alpha = clamp(1 - game.elapsed / 4.2, 0, 1);
  context.save();
  context.globalAlpha = alpha;
  const glow = context.createRadialGradient(x, 38, 4, x, 38, 85);
  glow.addColorStop(0, 'rgba(255, 239, 169, .9)');
  glow.addColorStop(0.34, 'rgba(98, 190, 175, .46)');
  glow.addColorStop(1, 'rgba(78, 112, 137, 0)');
  context.fillStyle = glow;
  context.fillRect(x - 90, -20, 180, 160);
  context.strokeStyle = 'rgba(239, 249, 209, .72)';
  context.lineWidth = 3;
  context.beginPath();
  context.ellipse(x, 37, 55 + Math.sin(game.elapsed * 4) * 7, 17, -0.08, 0, Math.PI * 2);
  context.stroke();
  context.restore();
};

export const renderGame = (context: CanvasRenderingContext2D, game: GameState) => {
  const shakeStrength = game.shakeUntil > game.elapsed && !game.reducedMotion
    ? (game.shakeUntil - game.elapsed) * 15
    : 0;
  const camera = game.cameraX + (Math.random() - 0.5) * shakeStrength;
  const theme = blendedTheme(game.player.x);
  const sky = context.createLinearGradient(0, 0, 0, VIEW_HEIGHT);
  sky.addColorStop(0, theme.sky);
  sky.addColorStop(0.62, theme.horizon);
  sky.addColorStop(1, '#7d9e62');
  context.fillStyle = sky;
  context.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);

  const dayProgress = clamp(game.player.x / LEVEL_END, 0, 1);
  context.fillStyle = `rgba(255, 236, 167, ${0.55 + dayProgress * 0.25})`;
  context.beginPath();
  context.arc(775 - dayProgress * 110, 82 + dayProgress * 55, 28 + dayProgress * 5, 0, Math.PI * 2);
  context.fill();
  drawMountainLayer(context, camera, 0.08, 275, mixColor('#7a9d91', '#6f6f7d', dayProgress), 240);
  drawMountainLayer(context, camera, 0.16, 337, mixColor('#52765d', '#52596a', dayProgress), 190);

  drawMonumentalLandscape(context, camera, game.worldTime, game.quality);
  drawCornfield(context, camera, game.worldTime, game.quality);
  drawFields(context, camera, game.worldTime);
  drawStreamZone(context, camera, game.worldTime, game.quality);
  drawVillage(context, camera, game.worldTime, game.quality);
  drawCommunity(context, camera, game.worldTime, game.quality);
  drawDienBienMuseum(context, camera, game.quality);
  drawVictoryMonument(context, camera);

  context.fillStyle = theme.ground;
  context.fillRect(0, GROUND_Y, VIEW_WIDTH, VIEW_HEIGHT - GROUND_Y);
  context.fillStyle = mixColor(theme.ground, '#203f31', 0.35);
  context.fillRect(0, GROUND_Y, VIEW_WIDTH, 10);
  context.fillStyle = 'rgba(91, 61, 39, .55)';
  const pathOffset = -((camera * 0.96) % 92);
  for (let x = pathOffset - 92; x < VIEW_WIDTH + 92; x += 92) {
    roundedRect(context, x, GROUND_Y + 42, 58, 6, 3);
    context.fill();
  }

  drawRoadsideFeast(context, game, camera);
  hazards.forEach((hazard) => drawHazard(context, hazard, game, camera));
  pickups.forEach((pickup) => {
    if (game.collected.has(pickup.id)) return;
    const x = pickup.x - camera;
    if (x > -80 && x < VIEW_WIDTH + 80) drawPickup(context, pickup, x, game.elapsed);
  });

  const finishX = LEVEL_END - camera;
  if (finishX > -180 && finishX < VIEW_WIDTH + 180) {
    context.fillStyle = '#5c3a28';
    context.fillRect(finishX, GROUND_Y - 175, 10, 175);
    context.fillStyle = '#e4bd5f';
    roundedRect(context, finishX + 10, GROUND_Y - 168, 128, 50, 5);
    context.fill();
    context.fillStyle = '#29453b';
    context.font = '900 15px "Segoe UI", sans-serif';
    context.fillText('PHIÊNG LƠI', finishX + 24, GROUND_Y - 137);
  }

  game.trail.forEach((trail) => drawPlayer(context, game, camera, clamp(trail.life / 0.34, 0, 0.24), trail.x, trail.y));
  drawPlayer(context, game, camera);
  drawCheerWave(context, game, camera);
  drawParticles(context, game, camera);
  drawTemporalArrival(context, game, camera);

  if (isPowerActive(game, 'tea')) {
    context.fillStyle = 'rgba(218, 240, 220, .07)';
    context.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
  }
};
