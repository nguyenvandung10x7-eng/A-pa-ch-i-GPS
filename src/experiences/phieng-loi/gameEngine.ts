export const VIEW_WIDTH = 960;
export const VIEW_HEIGHT = 540;

const GROUND_Y = 438;
const PLAYER_START_X = 240;
const ZONE_LENGTH = 6_400;
export const LEVEL_END = ZONE_LENGTH * 4;

export type PowerKind = 'squash' | 'coffee' | 'macadamia' | 'tea' | 'buffalo';
export type ZoneKind = 0 | 1 | 2 | 3;
export type GameQuality = 'low' | 'high';

export type InputState = {
  left: boolean;
  right: boolean;
  jumpQueued: boolean;
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
  | { type: 'jump' | 'land' | 'token' | 'hit' | 'shield-break' | 'break' | 'complete' }
  | { type: 'power-start' | 'power-end'; power: PowerKind }
  | { type: 'zone-change'; zone: ZoneKind };

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
  flash: PowerKind | 'hit' | null;
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
  flashKind: PowerKind | 'hit' | null;
  calloutKind: PowerKind | null;
  calloutUntil: number;
  heroZone: ZoneKind | null;
  heroUntil: number;
  powerUntil: Record<PowerKind, number>;
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
  if (hazard.kind === 'goat') return hazard.x + Math.sin(game.worldTime * 2.25 + hazard.x * 0.01) * 42;
  if (hazard.kind === 'chicken') return hazard.x + Math.sin(game.worldTime * 3.1 + hazard.x * 0.02) * 58;
  return hazard.x;
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

  if (game.freezeUntil > game.elapsed) {
    input.jumpQueued = false;
    return events;
  }

  const player = game.player;
  const coffeeActive = isPowerActive(game, 'coffee');
  const squashActive = isPowerActive(game, 'squash');
  const buffaloActive = isPowerActive(game, 'buffalo');
  const direction = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  const targetSpeed = direction * (coffeeActive ? 355 : buffaloActive ? 220 : 205);
  player.vx += (targetSpeed - player.vx) * Math.min(1, dt * (coffeeActive ? 12 : 8.5));
  if (direction !== 0) player.facing = direction as -1 | 1;

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

  const lookAhead = coffeeActive ? 355 : 255;
  const targetCamera = clamp(player.x - lookAhead, 0, LEVEL_END - VIEW_WIDTH + 200);
  game.cameraX += (targetCamera - game.cameraX) * Math.min(1, dt * (coffeeActive ? 7.5 : 5.2));
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

const mixColor = (first: string, second: string, amount: number) => {
  const a = first.match(/[a-f\d]{2}/gi)?.map((hex) => Number.parseInt(hex, 16)) ?? [0, 0, 0];
  const b = second.match(/[a-f\d]{2}/gi)?.map((hex) => Number.parseInt(hex, 16)) ?? [0, 0, 0];
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

const drawVillage = (context: CanvasRenderingContext2D, camera: number, time: number, quality: GameQuality) => {
  const houses = [560, 1_650, 2_720, 4_150, 5_470];
  houses.forEach((worldX, index) => {
    const x = worldX - camera;
    if (x < -190 || x > VIEW_WIDTH + 160) return;
    drawStiltHouse(context, x, 397, index % 2 === 0 ? 1.02 : 0.9, index % 2 === 0 ? '#d2b24f' : '#6c9188', time, quality === 'high');
    drawFence(context, x - 35, 170, 428);
    if (index === 1 || index === 3) drawMotorbike(context, x + 48, 416);
    if (index % 2 === 0) drawPerson(context, x + 152, 418, '#466e69', time);
  });
  [1_070, 3_380, 4_780].forEach((worldX) => {
    const x = worldX - camera;
    if (x > -50 && x < VIEW_WIDTH + 50) drawChicken(context, x, 414, time);
  });
  const dogX = 4_930 - camera;
  if (dogX > -60 && dogX < VIEW_WIDTH + 60) drawDog(context, dogX, 411, time);
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
  const fieldGradient = context.createLinearGradient(0, 318, 0, 439);
  fieldGradient.addColorStop(0, '#c6c870');
  fieldGradient.addColorStop(1, '#7f9e48');
  context.fillStyle = fieldGradient;
  context.fillRect(visibleStart, 318, visibleEnd - visibleStart, 121);
  for (let row = 0; row < 6; row += 1) {
    const y = 326 + row * 22;
    context.strokeStyle = row % 2 === 0 ? 'rgba(241, 220, 128, .75)' : 'rgba(68, 105, 49, .62)';
    context.lineWidth = 4;
    context.beginPath();
    context.moveTo(visibleStart, y);
    context.quadraticCurveTo((visibleStart + visibleEnd) / 2, y + Math.sin(time * 0.4 + row) * 7, visibleEnd, y + 4);
    context.stroke();
  }
  context.restore();
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
};

const drawCommunity = (context: CanvasRenderingContext2D, camera: number, time: number, quality: GameQuality) => {
  const houses = [19_700, 22_150, 24_500];
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
  const blink = game.invulnerableUntil > game.elapsed && Math.floor(game.elapsed * 15) % 2 === 0;
  if (blink && alpha === 1) return;

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

  drawFields(context, camera, game.worldTime);
  drawStreamZone(context, camera, game.worldTime, game.quality);
  drawVillage(context, camera, game.worldTime, game.quality);
  drawCommunity(context, camera, game.worldTime, game.quality);

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
  drawParticles(context, game, camera);
  drawTemporalArrival(context, game, camera);

  if (isPowerActive(game, 'tea')) {
    context.fillStyle = 'rgba(218, 240, 220, .07)';
    context.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
  }
};
