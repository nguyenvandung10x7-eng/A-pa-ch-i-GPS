export const VIEW_WIDTH = 480;
export const VIEW_HEIGHT = 270;
export const RENDER_WIDTH = 960;
export const RENDER_HEIGHT = 540;
const RENDER_SCALE = RENDER_WIDTH / VIEW_WIDTH;
export const WORLD_WIDTH = 1_680;
export const WORLD_HEIGHT = 920;

const PLAYER_START_X = 92;
const PLAYER_START_Y = 486;
const PLAYER_SPEED = 67;
const CAMERA_VERTICAL_ANCHOR = 0.7;
const SAVE_VERSION = 1;

export type GameQuality = 'low' | 'high';
export type PowerKind = 'squash' | 'coffee' | 'macadamia';
export type HeeSunMode = 'waiting' | 'intro' | 'chasing' | 'distracted' | 'drinking' | 'ambush';
export type SceneKind = 'none' | 'heesun-intro' | 'capture' | 'stream';
export type MessageTone = 'plain' | 'heesun' | 'hanu' | 'chief' | 'stream' | 'ocop' | 'world';

export type InputState = {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  moveX: number;
  moveY: number;
  callQueued: boolean;
};

type LocalizedMessage = {
  id: number;
  speakerVi: string;
  speakerEn: string;
  textVi: string;
  textEn: string;
  tone: MessageTone;
  expiresAt: number;
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

type HeeSunState = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  mode: HeeSunMode;
  modeUntil: number;
  met: boolean;
  caught: number;
  scale: number;
  speedBoostUntil: number;
  nextAmbushAt: number;
};

type HaNuState = {
  x: number;
  y: number;
  waypoint: number;
  lineIndex: number;
  nextLineAt: number;
  revealReadyAt: number;
  lastCollisionAt: number;
  saidAtStream: boolean;
};

type FeastState = {
  x: number;
  y: number;
  encounters: number;
  pendingRelocate: boolean;
  relocateAt: number;
  nextTriggerAt: number;
};

type ChickenState = { panicStartedAt: number; panicUntil: number };
type SceneState = { kind: SceneKind; startedAt: number; stage: number };

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  kind: 'dust' | 'leaf' | 'note' | 'splash' | 'crumb';
};

export type GameEvent =
  | { type: 'pha-oi' | 'footstep' | 'crunch' | 'chicken-panic' | 'chase-start' | 'chase-stop' | 'capture' | 'reset' | 'phone' | 'domino' | 'stream' | 'feast' | 'exit' }
  | { type: 'power-start' | 'power-end'; power: PowerKind };

export type GameSave = {
  version: number;
  player: { x: number; y: number; facingX: number; facingY: number };
  elapsed: number;
  absurdityScore: number;
  callCount: number;
  triggered: string[];
  feast: Pick<FeastState, 'x' | 'y' | 'encounters'> & { pendingRelocate?: boolean };
  heesun: Pick<HeeSunState, 'x' | 'y' | 'mode' | 'met' | 'caught' | 'scale'>;
  hanu: Pick<HaNuState, 'x' | 'y' | 'waypoint' | 'lineIndex' | 'saidAtStream'>;
  leaderStarted: boolean;
  streamSeen: boolean;
  gateOpen: boolean;
  dominoStartedAt: number;
  powerRemaining?: Partial<Record<PowerKind, number>>;
  squashSequence?: { age: number; stage: number };
  complete: boolean;
};

export type UiSnapshot = {
  elapsed: number;
  message: LocalizedMessage | null;
  callSerial: number;
  callActive: boolean;
  replyActive: boolean;
  cinematicVi: string | null;
  cinematicEn: string | null;
  scene: SceneKind;
  sceneAge: number;
  leaderClock: string | null;
  chiefSpeaking: boolean;
  power: PowerKind | null;
  powerRemaining: number;
  chasing: boolean;
  caught: number;
  complete: boolean;
};

export type GameState = {
  player: PlayerState;
  heesun: HeeSunState;
  hanu: HaNuState;
  feast: FeastState;
  chicken: ChickenState;
  scene: SceneState;
  elapsed: number;
  worldTime: number;
  cameraX: number;
  cameraY: number;
  quality: GameQuality;
  reducedMotion: boolean;
  message: LocalizedMessage | null;
  messageSerial: number;
  callSerial: number;
  callPulseUntil: number;
  replyPulseUntil: number;
  delayedFarReplyAt: number;
  lastCallAt: number;
  rapidCalls: number;
  callCount: number;
  absurdityScore: number;
  absurdityLevel: 0 | 1 | 2 | 3;
  nextTimeEscalationAt: number;
  triggered: Set<string>;
  leaderStartedAt: number;
  streamStartedAt: number;
  fishBoost: number;
  gateOpen: boolean;
  dominoStartedAt: number;
  powerUntil: Record<PowerKind, number>;
  squashSequenceAt: number;
  squashSequenceStage: number;
  nextFootstepAt: number;
  nextCrunchAt: number;
  shakeUntil: number;
  particles: Particle[];
  complete: boolean;
};

const POWER_DURATION: Record<PowerKind, number> = { squash: 11, coffee: 12, macadamia: 12 };

const HOUSES = [
  { x: 210, y: 260, width: 170, height: 94 },
  { x: 455, y: 126, width: 152, height: 84 },
  { x: 760, y: 548, width: 175, height: 96 },
  { x: 1_260, y: 112, width: 158, height: 88 },
];

const HOUSE_CALL_POINTS = [
  { x: 295, y: 370 },
  { x: 530, y: 220 },
  { x: 845, y: 660 },
  { x: 1_340, y: 210 },
];

const OCOP_ITEMS: Array<{ kind: PowerKind; x: number; y: number }> = [
  { kind: 'squash', x: 585, y: 602 },
  { kind: 'coffee', x: 942, y: 335 },
  { kind: 'macadamia', x: 1_335, y: 525 },
];

const HANU_PATH = [
  { x: 650, y: 462 },
  { x: 792, y: 445 },
  { x: 1_060, y: 650 },
  { x: 1_210, y: 595 },
  { x: 1_300, y: 388 },
  { x: 980, y: 276 },
  { x: 710, y: 320 },
  { x: 520, y: 560 },
];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const distance = (ax: number, ay: number, bx: number, by: number) => Math.hypot(ax - bx, ay - by);
const hash2 = (x: number, y: number) => {
  const value = Math.sin(x * 127.1 + y * 311.7) * 43_758.5453;
  return value - Math.floor(value);
};

const absurdityFromScore = (score: number): 0 | 1 | 2 | 3 => {
  if (score >= 12) return 3;
  if (score >= 7) return 2;
  if (score >= 3) return 1;
  return 0;
};

const addAbsurdity = (game: GameState, amount: number) => {
  game.absurdityScore += amount;
  game.absurdityLevel = absurdityFromScore(game.absurdityScore);
};

const setMessage = (
  game: GameState,
  speakerVi: string,
  speakerEn: string,
  textVi: string,
  textEn: string,
  tone: MessageTone,
  duration = 2.7,
) => {
  game.messageSerial += 1;
  game.message = { id: game.messageSerial, speakerVi, speakerEn, textVi, textEn, tone, expiresAt: game.elapsed + duration };
};

const addParticles = (
  game: GameState,
  x: number,
  y: number,
  colors: string[],
  count: number,
  kind: Particle['kind'],
  strength = 28,
) => {
  const qualityScale = game.quality === 'low' ? 0.55 : 1;
  const motionScale = game.reducedMotion ? 0.3 : 1;
  const actual = Math.max(2, Math.round(count * qualityScale * motionScale));
  const limit = game.quality === 'low' ? 70 : 145;
  for (let index = 0; index < actual && game.particles.length < limit; index += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = strength * (0.35 + Math.random() * 0.75);
    const life = 0.45 + Math.random() * 0.85;
    game.particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - strength * 0.18,
      life,
      maxLife: life,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 1 + Math.floor(Math.random() * 2),
      kind,
    });
  }
};

const defaultGame = (quality: GameQuality, reducedMotion: boolean): GameState => ({
  player: { x: PLAYER_START_X, y: PLAYER_START_Y, vx: 0, vy: 0, facingX: 1, facingY: 0, walk: 0 },
  heesun: {
    x: 365,
    y: 456,
    vx: 0,
    vy: 0,
    mode: 'waiting',
    modeUntil: 0,
    met: false,
    caught: 0,
    scale: 1,
    speedBoostUntil: 0,
    nextAmbushAt: 62,
  },
  hanu: {
    x: HANU_PATH[0].x,
    y: HANU_PATH[0].y,
    waypoint: 1,
    lineIndex: 0,
    nextLineAt: 5,
    revealReadyAt: 0,
    lastCollisionAt: 0,
    saidAtStream: false,
  },
  feast: { x: 515, y: 432, encounters: 0, pendingRelocate: false, relocateAt: 0, nextTriggerAt: 0 },
  chicken: { panicStartedAt: 0, panicUntil: 0 },
  scene: { kind: 'none', startedAt: 0, stage: 0 },
  elapsed: 0,
  worldTime: 0,
  cameraX: 0,
  cameraY: clamp(PLAYER_START_Y - VIEW_HEIGHT * CAMERA_VERTICAL_ANCHOR, 0, WORLD_HEIGHT - VIEW_HEIGHT),
  quality,
  reducedMotion,
  message: null,
  messageSerial: 0,
  callSerial: 0,
  callPulseUntil: 0,
  replyPulseUntil: 0,
  delayedFarReplyAt: 0,
  lastCallAt: -10,
  rapidCalls: 0,
  callCount: 0,
  absurdityScore: 0,
  absurdityLevel: 0,
  nextTimeEscalationAt: 38,
  triggered: new Set<string>(),
  leaderStartedAt: 0,
  streamStartedAt: 0,
  fishBoost: 0,
  gateOpen: false,
  dominoStartedAt: 0,
  powerUntil: { squash: 0, coffee: 0, macadamia: 0 },
  squashSequenceAt: 0,
  squashSequenceStage: 0,
  nextFootstepAt: 0,
  nextCrunchAt: 0,
  shakeUntil: 0,
  particles: [],
  complete: false,
});

export const createGame = (quality: GameQuality, reducedMotion: boolean, save?: GameSave | null): GameState => {
  const game = defaultGame(quality, reducedMotion);
  if (!save || save.version !== SAVE_VERSION || save.complete) return game;

  game.player.x = clamp(save.player.x, 32, WORLD_WIDTH - 32);
  game.player.y = clamp(save.player.y, 42, WORLD_HEIGHT - 32);
  game.player.facingX = save.player.facingX;
  game.player.facingY = save.player.facingY;
  game.elapsed = Math.max(0, save.elapsed);
  game.worldTime = game.elapsed;
  game.absurdityScore = Math.max(0, save.absurdityScore);
  game.absurdityLevel = absurdityFromScore(game.absurdityScore);
  game.callCount = Math.max(0, save.callCount);
  game.triggered = new Set(save.triggered);
  game.feast.x = save.feast.x;
  game.feast.y = save.feast.y;
  game.feast.encounters = save.feast.encounters;
  game.feast.pendingRelocate = save.feast.pendingRelocate ?? false;
  game.feast.relocateAt = game.feast.pendingRelocate ? game.elapsed + 1.1 : 0;
  game.heesun.x = save.heesun.x;
  game.heesun.y = save.heesun.y;
  game.heesun.vx = 0;
  game.heesun.vy = 0;
  game.heesun.mode = save.heesun.mode === 'intro' || save.heesun.mode === 'ambush' ? 'waiting' : save.heesun.mode;
  game.heesun.met = save.heesun.met;
  game.heesun.caught = save.heesun.caught;
  game.heesun.scale = save.heesun.scale;
  game.heesun.modeUntil = game.heesun.mode === 'drinking' ? game.elapsed + 8 : 0;
  game.heesun.nextAmbushAt = game.elapsed + 34;
  game.hanu.x = save.hanu.x;
  game.hanu.y = save.hanu.y;
  game.hanu.waypoint = save.hanu.waypoint;
  game.hanu.lineIndex = save.hanu.lineIndex;
  game.hanu.saidAtStream = save.hanu.saidAtStream;
  game.hanu.nextLineAt = game.elapsed + 4;
  game.leaderStartedAt = save.leaderStarted ? game.elapsed - 20 : 0;
  game.streamStartedAt = save.streamSeen ? Math.max(0.001, game.elapsed - 12) : 0;
  game.gateOpen = save.gateOpen;
  game.dominoStartedAt = save.dominoStartedAt ? game.elapsed - 2 : 0;
  (Object.keys(game.powerUntil) as PowerKind[]).forEach((power) => {
    const remaining = Math.max(0, save.powerRemaining?.[power] ?? 0);
    game.powerUntil[power] = remaining > 0 ? game.elapsed + remaining : 0;
  });
  if (game.powerUntil.squash > game.elapsed && save.squashSequence) {
    game.squashSequenceAt = Math.max(0.001, game.elapsed - Math.max(0, save.squashSequence.age));
    game.squashSequenceStage = clamp(Math.round(save.squashSequence.stage), 0, 2);
  }
  game.complete = save.complete;
  game.nextTimeEscalationAt = game.elapsed + 32;
  game.cameraX = clamp(game.player.x - VIEW_WIDTH / 2, 0, WORLD_WIDTH - VIEW_WIDTH);
  game.cameraY = clamp(game.player.y - VIEW_HEIGHT * CAMERA_VERTICAL_ANCHOR, 0, WORLD_HEIGHT - VIEW_HEIGHT);
  return game;
};

export const createSave = (game: GameState): GameSave => ({
  version: SAVE_VERSION,
  player: {
    x: Math.round(game.player.x),
    y: Math.round(game.player.y),
    facingX: game.player.facingX,
    facingY: game.player.facingY,
  },
  elapsed: game.elapsed,
  absurdityScore: game.absurdityScore,
  callCount: game.callCount,
  triggered: [...game.triggered],
  feast: {
    x: game.feast.x,
    y: game.feast.y,
    encounters: game.feast.encounters,
    pendingRelocate: game.feast.pendingRelocate,
  },
  heesun: {
    x: game.heesun.x,
    y: game.heesun.y,
    mode: game.heesun.mode,
    met: game.heesun.met,
    caught: game.heesun.caught,
    scale: game.heesun.scale,
  },
  hanu: {
    x: game.hanu.x,
    y: game.hanu.y,
    waypoint: game.hanu.waypoint,
    lineIndex: game.hanu.lineIndex,
    saidAtStream: game.hanu.saidAtStream,
  },
  leaderStarted: game.leaderStartedAt !== 0,
  streamSeen: game.streamStartedAt !== 0,
  gateOpen: game.gateOpen,
  dominoStartedAt: game.dominoStartedAt,
  powerRemaining: {
    squash: Math.max(0, game.powerUntil.squash - game.elapsed),
    coffee: Math.max(0, game.powerUntil.coffee - game.elapsed),
    macadamia: Math.max(0, game.powerUntil.macadamia - game.elapsed),
  },
  squashSequence: game.squashSequenceAt > 0
    ? { age: game.elapsed - game.squashSequenceAt, stage: game.squashSequenceStage }
    : undefined,
  complete: game.complete,
});

const currentPower = (game: GameState): PowerKind | null => {
  const powers = (Object.keys(game.powerUntil) as PowerKind[])
    .filter((kind) => game.powerUntil[kind] > game.elapsed)
    .sort((first, second) => game.powerUntil[second] - game.powerUntil[first]);
  return powers[0] ?? null;
};

const chiefClock = (game: GameState) => {
  if (game.leaderStartedAt === 0) return null;
  const age = game.elapsed - game.leaderStartedAt;
  if (age < 1.4) return '00:01';
  if (age < 4.4) return '02:17';
  if (age < 8.2) return '07:42';
  return '19:36';
};

const cinematicCopy = (game: GameState): { vi: string; en: string } | null => {
  if (game.scene.kind === 'capture') {
    const age = game.elapsed - game.scene.startedAt;
    if (age < 1.45) return { vi: '3 GIỜ SAU', en: '3 HOURS LATER' };
    if (age >= 4.35) return { vi: '5 GIỜ SAU', en: '5 HOURS LATER' };
  }
  if (game.scene.kind === 'stream' && game.elapsed - game.scene.startedAt < 2.65) {
    return {
      vi: 'Người đẹp đi ra suối tắm, cá tìm về xem chân em nữa.',
      en: 'The village beauties go down to the stream; even the fish come to see their feet.',
    };
  }
  return null;
};

export const createUiSnapshot = (game: GameState): UiSnapshot => {
  const power = currentPower(game);
  const cinematic = cinematicCopy(game);
  return {
    elapsed: game.elapsed,
    message: game.message && game.message.expiresAt > game.elapsed ? game.message : null,
    callSerial: game.callSerial,
    callActive: game.callPulseUntil > game.elapsed,
    replyActive: game.replyPulseUntil > game.elapsed,
    cinematicVi: cinematic?.vi ?? null,
    cinematicEn: cinematic?.en ?? null,
    scene: game.scene.kind,
    sceneAge: game.scene.kind === 'none' ? 0 : game.elapsed - game.scene.startedAt,
    leaderClock: chiefClock(game),
    chiefSpeaking: game.leaderStartedAt !== 0,
    power,
    powerRemaining: power ? clamp((game.powerUntil[power] - game.elapsed) / POWER_DURATION[power], 0, 1) : 0,
    chasing: game.heesun.mode === 'chasing' || game.heesun.mode === 'distracted',
    caught: game.heesun.caught,
    complete: game.complete,
  };
};

const clearQueuedInput = (input: InputState) => { input.callQueued = false; };
const riverCenterX = (y: number) => 1_105 + Math.sin(y * 0.009) * 30;
const isBridgeY = (y: number) => (y > 402 && y < 474) || (y > 662 && y < 728);
const solidRects = HOUSES.map((house) => ({ x: house.x - 10, y: house.y - 18, width: house.width + 20, height: house.height + 70 }));

const isBlocked = (game: GameState, x: number, y: number) => {
  if (x < 24 || y < 44 || x > WORLD_WIDTH - 24 || y > WORLD_HEIGHT - 26) return true;
  if (!isBridgeY(y) && Math.abs(x - riverCenterX(y)) < 34) return true;
  if (solidRects.some((rect) => x > rect.x && x < rect.x + rect.width && y > rect.y && y < rect.y + rect.height)) return true;
  return distance(x, y, game.hanu.x, game.hanu.y) < 14;
};

const startChickenPanic = (game: GameState, events: GameEvent[]) => {
  if (game.chicken.panicUntil > game.elapsed) return;
  game.chicken.panicStartedAt = game.elapsed;
  game.chicken.panicUntil = game.elapsed + 4.3;
  game.shakeUntil = game.elapsed + 0.34;
  addAbsurdity(game, 1.15);
  addParticles(game, 760, 454, ['#ead08c', '#c66b3d', '#fff2c0'], 28, 'leaf', 58);
  events.push({ type: 'chicken-panic' });
  setMessage(game, 'CẢ BẢN', 'THE WHOLE VILLAGE', 'Không ai biết con gà đầu tiên đã báo động điều gì.', 'Nobody knows what the first chicken warned them about.', 'world', 3.1);
  if (game.heesun.mode === 'chasing') {
    game.heesun.mode = 'distracted';
    game.heesun.modeUntil = game.elapsed + 2.6;
  }
};

const startChase = (game: GameState, events: GameEvent[], shout = true) => {
  if (game.heesun.mode === 'chasing') return;
  game.heesun.met = true;
  game.heesun.mode = 'chasing';
  game.heesun.modeUntil = 0;
  if (shout) setMessage(game, 'HEESUN', 'HEESUN', 'BẠN ƠI!', 'MY FRIEND!', 'heesun', 1.8);
  game.shakeUntil = game.elapsed + 0.26;
  events.push({ type: 'chase-start' });
};

const startHeeSunIntro = (game: GameState) => {
  game.heesun.mode = 'intro';
  game.scene = { kind: 'heesun-intro', startedAt: game.elapsed, stage: 0 };
  setMessage(
    game,
    'HEESUN',
    'HEESUN',
    'Ôi bạn ôi, lâu lắm không gặp hay anh em ngồi tí nhỉ?',
    'My friend! Long time no see. Shall we sit down for just a little while?',
    'heesun',
    2.55,
  );
};

const startCapture = (game: GameState, events: GameEvent[]) => {
  game.scene = { kind: 'capture', startedAt: game.elapsed, stage: 0 };
  game.heesun.mode = 'drinking';
  game.player.vx = 0;
  game.player.vy = 0;
  game.message = null;
  game.shakeUntil = game.elapsed + 0.5;
  events.push({ type: 'capture' });
};

const resetAfterCapture = (game: GameState, events: GameEvent[]) => {
  game.player.x = PLAYER_START_X;
  game.player.y = PLAYER_START_Y;
  game.player.vx = 0;
  game.player.vy = 0;
  game.player.facingX = 1;
  game.player.facingY = 0;
  game.heesun.caught += 1;
  game.heesun.x = game.feast.x - 30;
  game.heesun.y = game.feast.y + 20;
  game.heesun.vx = 0;
  game.heesun.vy = 0;
  game.heesun.mode = 'drinking';
  game.heesun.modeUntil = game.elapsed + 13;
  game.heesun.nextAmbushAt = game.elapsed + 42;
  game.scene = { kind: 'none', startedAt: 0, stage: 0 };
  game.message = null;
  game.cameraX = 0;
  game.cameraY = clamp(PLAYER_START_Y - VIEW_HEIGHT * CAMERA_VERTICAL_ANCHOR, 0, WORLD_HEIGHT - VIEW_HEIGHT);
  addAbsurdity(game, 1.25);
  events.push({ type: 'reset' });
};

const updateScene = (game: GameState, events: GameEvent[]) => {
  if (game.scene.kind === 'none') return;
  const age = game.elapsed - game.scene.startedAt;
  if (game.scene.kind === 'heesun-intro') {
    if (game.scene.stage === 0 && age >= 2.55) {
      game.scene.stage = 1;
      setMessage(game, 'BẠN', 'YOU', 'Thôi.', 'No.', 'plain', 0.75);
    } else if (game.scene.stage === 1 && age >= 3.75) {
      game.scene.stage = 2;
      setMessage(game, 'HEESUN', 'HEESUN', 'Bạn ôi…', 'My friend…', 'heesun', 0.82);
    } else if (game.scene.stage === 2 && age >= 4.58) {
      game.scene = { kind: 'none', startedAt: 0, stage: 0 };
      startChase(game, events);
    }
    return;
  }
  if (game.scene.kind === 'capture') {
    if (game.scene.stage === 0 && age >= 1.55) game.scene.stage = 1;
    if (game.scene.stage === 1 && age >= 2.18) {
      game.scene.stage = 2;
      setMessage(game, 'HEESUN', 'HEESUN', 'Làm chén cuối.', 'One last cup.', 'heesun', 2.05);
    }
    if (age >= 6.05) resetAfterCapture(game, events);
    return;
  }
  if (game.scene.kind === 'stream') {
    if (game.scene.stage === 0 && age >= 2.65) {
      game.scene.stage = 1;
      game.fishBoost = Math.max(game.fishBoost, 44);
      setMessage(game, 'MỘT CÔ GÁI', 'ONE OF THE WOMEN', 'Hôm nay cá hơi đông.', 'The fish are a little crowded today.', 'stream', 2.45);
    }
    if (age >= 5.35) game.scene = { kind: 'none', startedAt: 0, stage: 0 };
  }
};

const activatePower = (game: GameState, power: PowerKind, events: GameEvent[]) => {
  const key = `ocop-${power}`;
  if (game.triggered.has(key)) return;
  game.triggered.add(key);
  game.powerUntil[power] = game.elapsed + POWER_DURATION[power];
  addAbsurdity(game, 1.35);
  game.shakeUntil = game.elapsed + 0.38;
  events.push({ type: 'power-start', power });
  if (power === 'squash') {
    game.squashSequenceAt = game.elapsed;
    game.squashSequenceStage = 0;
    setMessage(game, 'BÍ XANH TÌA DÌNH', 'TIA DINH SQUASH', 'Bạn phình lớn bất thường. Không ai tỏ ra ngạc nhiên.', 'You swell to an unreasonable size. Nobody looks surprised.', 'ocop', 2.5);
    addParticles(game, game.player.x, game.player.y, ['#a8d35f', '#e1ef91', '#fff0a7'], 34, 'leaf', 48);
  } else if (power === 'coffee') {
    setMessage(game, 'CÀ PHÊ MƯỜNG ẢNG', 'MUONG ANG COFFEE', 'Cả thế giới chậm lại. Riêng HeeSun thì không.', 'The whole world slows down. HeeSun does not.', 'ocop', 3);
    addParticles(game, game.player.x, game.player.y, ['#d56f3e', '#f3bc63', '#fff0a0'], 30, 'note', 45);
  } else {
    setMessage(game, 'MẮC CA ĐIỆN BIÊN', 'DIEN BIEN MACADAMIA', 'Mỗi bước chân bây giờ giòn đến mức không thể lẩn trốn.', 'Every step is now far too crunchy for hiding.', 'ocop', 3);
    addParticles(game, game.player.x, game.player.y, ['#d7b56d', '#f4df9a', '#805331'], 30, 'crumb', 42);
  }
};

const nearestHouseDistance = (game: GameState) => HOUSE_CALL_POINTS.reduce(
  (nearest, house) => Math.min(nearest, distance(game.player.x, game.player.y, house.x, house.y)),
  Number.POSITIVE_INFINITY,
);

const handleCall = (game: GameState, events: GameEvent[]) => {
  game.callSerial += 1;
  game.callCount += 1;
  game.callPulseUntil = game.elapsed + 1.05;
  game.shakeUntil = game.elapsed + 0.2;
  events.push({ type: 'pha-oi' });
  const interval = game.elapsed - game.lastCallAt;
  game.rapidCalls = interval < 1.15 ? game.rapidCalls + 1 : 1;
  game.lastCallAt = game.elapsed;
  addAbsurdity(game, game.rapidCalls >= 3 ? 1.05 : 0.48);
  addParticles(game, game.player.x, game.player.y - 13, ['#fff2a8', '#efbc58', '#e56c43'], 24, 'note', 55);

  const nearestPower = OCOP_ITEMS
    .filter((item) => !game.triggered.has(`ocop-${item.kind}`))
    .map((item) => ({ item, value: distance(game.player.x, game.player.y, item.x, item.y) }))
    .sort((first, second) => first.value - second.value)[0];
  if (nearestPower && nearestPower.value < 70) {
    activatePower(game, nearestPower.item.kind, events);
    return;
  }
  if (distance(game.player.x, game.player.y, 765, 458) < 105) {
    startChickenPanic(game, events);
    return;
  }
  if (distance(game.player.x, game.player.y, game.hanu.x, game.hanu.y) < 82) {
    setMessage(game, 'HANU', 'HANU', 'Ừ?', 'Yeah?', 'hanu', 1.45);
    events.push({ type: 'phone' });
    return;
  }
  if (distance(game.player.x, game.player.y, game.heesun.x, game.heesun.y) < 115) {
    if (!game.heesun.met && game.scene.kind === 'none') startHeeSunIntro(game);
    else setMessage(game, 'HEESUN', 'HEESUN', 'Bạn gọi tôi à?', 'Were you calling me?', 'heesun', 2);
    return;
  }
  if (game.streamStartedAt !== 0 && distance(game.player.x, game.player.y, 1_205, 705) < 145) {
    game.fishBoost = Math.min(76, game.fishBoost + 12);
    setMessage(game, 'BÊN SUỐI', 'BY THE STREAM', 'Cá lại tìm về đông thêm một lớp.', 'Another layer of fish arrives.', 'stream', 2.2);
    events.push({ type: 'stream' });
    return;
  }
  if (nearestHouseDistance(game) < 125) {
    const count = Number(game.triggered.has('house-call-1')) + Number(game.triggered.has('house-call-2'));
    if (count === 0) {
      game.triggered.add('house-call-1');
      game.replyPulseUntil = game.elapsed + 1.05;
      setMessage(game, 'TRONG NHÀ', 'INSIDE THE HOUSE', 'Ơi.', 'Yes?', 'world', 1.65);
    } else if (count === 1) {
      game.triggered.add('house-call-2');
      game.replyPulseUntil = game.elapsed + 1.05;
      setMessage(game, 'TRONG NHÀ', 'INSIDE THE HOUSE', 'Ơiiii.', 'Yeees?', 'world', 1.8);
    } else {
      game.delayedFarReplyAt = game.elapsed + 1.15;
      game.message = null;
    }
    return;
  }
  if (game.rapidCalls >= 3) {
    startChickenPanic(game, events);
    game.delayedFarReplyAt = game.elapsed + 0.7;
    return;
  }
  if (game.absurdityLevel >= 2 || game.callCount % 3 === 0) game.delayedFarReplyAt = game.elapsed + 0.8;
  else {
    game.replyPulseUntil = game.elapsed + 0.9;
    setMessage(game, 'AI ĐÓ RẤT XA', 'SOMEONE VERY FAR AWAY', 'Ơi…', 'Yeees…', 'world', 1.8);
  }
};

const updatePowers = (game: GameState, previousElapsed: number, moving: boolean, events: GameEvent[]) => {
  (Object.keys(game.powerUntil) as PowerKind[]).forEach((power) => {
    if (game.powerUntil[power] > previousElapsed && game.powerUntil[power] <= game.elapsed) {
      events.push({ type: 'power-end', power });
      if (power === 'squash') game.heesun.scale = 1;
    }
  });
  if (game.squashSequenceAt > 0) {
    const age = game.elapsed - game.squashSequenceAt;
    if (game.squashSequenceStage === 0 && age >= 2.65) {
      game.squashSequenceStage = 1;
      setMessage(game, 'HEESUN', 'HEESUN', 'Bạn dạo này béo lên đấy.', 'You have put on some weight.', 'heesun', 1.7);
    } else if (game.squashSequenceStage === 1 && age >= 4.45) {
      game.squashSequenceStage = 2;
      game.heesun.scale = 1.72;
      setMessage(game, 'PHIÊNG LƠI', 'PHIENG LOI', 'HeeSun ăn theo. Đây là một sai lầm.', 'HeeSun copies you. This is a mistake.', 'world', 2.3);
      game.shakeUntil = game.elapsed + 0.45;
      addParticles(game, game.heesun.x, game.heesun.y, ['#a8d35f', '#f4e594'], 36, 'leaf', 52);
    }
  }
  if (moving && game.powerUntil.macadamia > game.elapsed && game.elapsed >= game.nextCrunchAt) {
    game.nextCrunchAt = game.elapsed + 0.32;
    events.push({ type: 'crunch' });
    addParticles(game, game.player.x, game.player.y + 5, ['#e0bd75', '#855a37'], 5, 'crumb', 16);
    if (game.heesun.mode === 'waiting' && distance(game.player.x, game.player.y, game.heesun.x, game.heesun.y) < 330) {
      setMessage(game, 'HEESUN', 'HEESUN', 'Tôi nghe thấy bạn rồi.', 'I can hear you.', 'heesun', 1.7);
      startChase(game, events, false);
    }
  }
};

const updateFeast = (game: GameState, events: GameEvent[]) => {
  if (game.feast.pendingRelocate && game.elapsed >= game.feast.relocateAt) {
    const farEnough = distance(game.player.x, game.player.y, game.feast.x, game.feast.y) > 110;
    if (farEnough || game.elapsed >= game.feast.relocateAt + 2.2) {
      game.feast.pendingRelocate = false;
      if (game.feast.encounters === 1) {
        game.feast.x = clamp(game.player.x + 330, 610, 1_020);
        game.feast.y = game.player.y < 460 ? game.player.y + 150 : game.player.y - 145;
      } else if (game.feast.encounters === 2) {
        game.feast.x = 1_018;
        game.feast.y = 224;
      }
    }
  }
  if (game.feast.encounters >= 3 || game.feast.pendingRelocate || game.elapsed < game.feast.nextTriggerAt) return;
  if (distance(game.player.x, game.player.y, game.feast.x, game.feast.y) > 73 || game.scene.kind !== 'none') return;
  game.feast.encounters += 1;
  game.feast.nextTriggerAt = game.elapsed + 5;
  game.feast.pendingRelocate = game.feast.encounters < 3;
  game.feast.relocateAt = game.elapsed + 2.25;
  addAbsurdity(game, 1.4);
  events.push({ type: 'feast' });
  setMessage(game, 'MÂM NHẬU', 'THE DRINKING TABLE', 'Vào làm chén.', 'Come have a cup.', 'world', 2.05);
};

const updateLeader = (game: GameState) => {
  if (game.leaderStartedAt === 0 && distance(game.player.x, game.player.y, 700, 247) < 92 && game.scene.kind === 'none') {
    game.leaderStartedAt = game.elapsed || 0.001;
    addAbsurdity(game, 1.25);
    setMessage(game, 'TRƯỞNG BẢN', 'VILLAGE CHIEF', 'Tôi xin nói ngắn gọn.', 'I will be brief.', 'chief', 2.1);
  }
  if (game.leaderStartedAt !== 0 && !game.triggered.has('chief-first') && game.elapsed - game.leaderStartedAt >= 2.25) {
    game.triggered.add('chief-first');
    setMessage(game, 'TRƯỞNG BẢN', 'VILLAGE CHIEF', 'Thứ nhất…', 'Firstly…', 'chief', 2.4);
  }
};

const updateStream = (game: GameState, events: GameEvent[]) => {
  if (game.streamStartedAt !== 0 || game.scene.kind !== 'none') return;
  if (distance(game.player.x, game.player.y, 1_205, 704) > 90) return;
  game.streamStartedAt = game.elapsed || 0.001;
  game.scene = { kind: 'stream', startedAt: game.elapsed, stage: 0 };
  game.player.vx = 0;
  game.player.vy = 0;
  addAbsurdity(game, 1.5);
  events.push({ type: 'stream' });
};

const updateHaNu = (game: GameState, dt: number, events: GameEvent[]) => {
  const target = HANU_PATH[game.hanu.waypoint % HANU_PATH.length];
  const dx = target.x - game.hanu.x;
  const dy = target.y - game.hanu.y;
  const length = Math.max(0.001, Math.hypot(dx, dy));
  const environmentSlow = game.powerUntil.coffee > game.elapsed ? 0.22 : 1;
  const speed = 24 * environmentSlow;
  game.hanu.x += (dx / length) * speed * dt;
  game.hanu.y += (dy / length) * speed * dt;
  if (length < 8) game.hanu.waypoint = (game.hanu.waypoint + 1) % HANU_PATH.length;

  if (game.elapsed >= game.hanu.nextLineAt && game.scene.kind !== 'capture') {
    const lines = [['Ừ.', 'Yeah.'], ['Ừ.', 'Yeah.'], ['Thế à?', 'Really?'], ['Ừ.', 'Yeah.']];
    const line = lines[game.hanu.lineIndex % lines.length];
    game.hanu.lineIndex += 1;
    game.hanu.nextLineAt = game.elapsed + 4.2 + (game.hanu.lineIndex % 3) * 1.1;
    setMessage(game, 'HANU · ĐIỆN THOẠI', 'HANU · ON THE PHONE', line[0], line[1], 'hanu', 1.25);
    events.push({ type: 'phone' });
  }
  if (!game.hanu.saidAtStream && game.hanu.x > 1_020 && game.hanu.y > 605) {
    game.hanu.saidAtStream = true;
    setMessage(game, 'HANU · GIỮA SUỐI', 'HANU · IN THE STREAM', 'Ừ, tôi đang ở nhà.', 'Yeah, I am at home.', 'hanu', 2.7);
    events.push({ type: 'phone' });
    addAbsurdity(game, 1);
  }
  if (!game.gateOpen && game.absurdityLevel >= 1 && game.hanu.x > 760 && game.hanu.x < 825 && game.hanu.y < 485) {
    game.gateOpen = true;
    addAbsurdity(game, 0.6);
    if (game.heesun.met && game.heesun.mode === 'waiting') {
      setMessage(game, 'PHIÊNG LƠI', 'PHIENG LOI', 'HaNu vô tình mở cổng cho HeeSun.', 'HaNu accidentally opens the gate for HeeSun.', 'world', 2.3);
      startChase(game, events, false);
    }
  }
  if (game.dominoStartedAt === 0 && game.hanu.x > 1_260 && game.hanu.y > 350 && game.hanu.y < 440) {
    game.dominoStartedAt = game.elapsed;
    addAbsurdity(game, 1.1);
    setMessage(game, 'PHIÊNG LƠI', 'PHIENG LOI', 'HaNu không hề nhìn thấy chuyện vừa xảy ra.', 'HaNu does not notice what just happened.', 'world', 2.4);
    events.push({ type: 'domino' });
  }
  if (distance(game.hanu.x, game.hanu.y, 765, 458) < 54 && game.chicken.panicUntil <= game.elapsed) startChickenPanic(game, events);

  const chasing = game.heesun.mode === 'chasing' || game.heesun.mode === 'distracted';
  if (chasing && distance(game.player.x, game.player.y, game.hanu.x, game.hanu.y) < 70 && game.elapsed >= game.hanu.revealReadyAt) {
    game.hanu.revealReadyAt = game.elapsed + 11;
    game.heesun.speedBoostUntil = game.elapsed + 2.1;
    setMessage(game, 'HANU · ĐIỆN THOẠI', 'HANU · ON THE PHONE', 'Nó ở đây này!', 'It is right here!', 'hanu', 1.7);
    events.push({ type: 'phone' });
  }
  if (chasing && distance(game.heesun.x, game.heesun.y, game.hanu.x, game.hanu.y) < 23 && game.elapsed >= game.hanu.lastCollisionAt + 8) {
    game.hanu.lastCollisionAt = game.elapsed;
    game.heesun.mode = 'distracted';
    game.heesun.modeUntil = game.elapsed + 2.2;
    setMessage(game, 'HANU', 'HANU', 'Ơ… xin lỗi.', 'Oh… sorry.', 'hanu', 1.7);
    events.push({ type: 'phone' });
  }
};

const moveHeeSunTowards = (
  game: GameState,
  targetX: number,
  targetY: number,
  speed: number,
  dt: number,
  turnResponse: number,
) => {
  let navigationX = targetX;
  let navigationY = targetY;
  const heeSunSide = Math.sign(game.heesun.x - riverCenterX(game.heesun.y));
  const targetSide = Math.sign(targetX - riverCenterX(targetY));
  if (heeSunSide !== 0 && targetSide !== 0 && heeSunSide !== targetSide && !isBridgeY(game.heesun.y)) {
    const bridgeY = [438, 695].sort((first, second) => (
      distance(game.heesun.x, game.heesun.y, riverCenterX(first), first)
      + distance(targetX, targetY, riverCenterX(first), first)
      - distance(game.heesun.x, game.heesun.y, riverCenterX(second), second)
      - distance(targetX, targetY, riverCenterX(second), second)
    ))[0];
    navigationX = riverCenterX(bridgeY);
    navigationY = bridgeY;
  }

  const baseAngle = Math.atan2(navigationY - game.heesun.y, navigationX - game.heesun.x);
  const probe = 25;
  const options = [0, 0.42, -0.42, 0.82, -0.82, 1.25, -1.25];
  const steeringAngle = options
    .map((offset) => baseAngle + offset)
    .find((angle) => !isBlocked(
      game,
      game.heesun.x + Math.cos(angle) * probe,
      game.heesun.y + Math.sin(angle) * probe,
    )) ?? baseAngle;
  const desiredVx = Math.cos(steeringAngle) * speed;
  const desiredVy = Math.sin(steeringAngle) * speed;
  const response = 1 - Math.exp(-dt * turnResponse);
  game.heesun.vx += (desiredVx - game.heesun.vx) * response;
  game.heesun.vy += (desiredVy - game.heesun.vy) * response;

  const nextX = game.heesun.x + game.heesun.vx * dt;
  if (!isBlocked(game, nextX, game.heesun.y)) game.heesun.x = nextX;
  else game.heesun.vx *= -0.24;
  const nextY = game.heesun.y + game.heesun.vy * dt;
  if (!isBlocked(game, game.heesun.x, nextY)) game.heesun.y = nextY;
  else game.heesun.vy *= -0.24;
};

const updateHeeSun = (game: GameState, dt: number, events: GameEvent[]) => {
  if (!game.heesun.met && game.scene.kind === 'none' && distance(game.player.x, game.player.y, game.heesun.x, game.heesun.y) < 82) startHeeSunIntro(game);
  if (game.heesun.mode === 'drinking' && game.elapsed >= game.heesun.modeUntil) game.heesun.mode = 'waiting';
  if (game.heesun.mode === 'ambush' && game.elapsed >= game.heesun.modeUntil) startChase(game, events);
  if (
    game.absurdityLevel >= 3
    && game.heesun.met
    && game.heesun.mode === 'waiting'
    && game.elapsed >= game.heesun.nextAmbushAt
    && game.player.x > 720
    && game.scene.kind === 'none'
  ) {
    game.heesun.x = clamp(game.player.x + 205, 780, WORLD_WIDTH - 130);
    game.heesun.y = clamp(game.player.y + (game.player.y < 470 ? 105 : -105), 110, WORLD_HEIGHT - 80);
    game.heesun.mode = 'ambush';
    game.heesun.modeUntil = game.elapsed + 1.25;
    game.heesun.nextAmbushAt = game.elapsed + 38;
    setMessage(game, 'PHIÊNG LƠI', 'PHIENG LOI', 'Một tiếng “bạn ơi” phát ra từ chỗ không nên có người.', 'A “my friend” comes from somewhere nobody should be.', 'world', 2.3);
  }
  if (game.heesun.mode === 'waiting' && game.heesun.met && distance(game.player.x, game.player.y, game.heesun.x, game.heesun.y) < 92) startChase(game, events);
  if (game.heesun.mode === 'distracted') {
    const panic = game.chicken.panicUntil > game.elapsed;
    const targetX = panic ? 1_520 : game.hanu.x;
    const targetY = panic ? 455 : game.hanu.y;
    moveHeeSunTowards(game, targetX, targetY, 49, dt, 3.1);
    if (game.elapsed >= game.heesun.modeUntil) game.heesun.mode = 'chasing';
    return;
  }
  if (game.heesun.mode !== 'chasing' || game.scene.kind === 'stream' || game.scene.kind === 'capture') {
    game.heesun.vx *= Math.max(0, 1 - dt * 6);
    game.heesun.vy *= Math.max(0, 1 - dt * 6);
    return;
  }
  const captureRadius = 17 * Math.max(1, game.heesun.scale * 0.8);
  if (distance(game.player.x, game.player.y, game.heesun.x, game.heesun.y) < captureRadius) {
    startCapture(game, events);
    return;
  }
  const boost = game.heesun.speedBoostUntil > game.elapsed ? 1.3 : 1;
  const speed = (game.absurdityLevel >= 3 ? 58 : 53) * boost;
  moveHeeSunTowards(game, game.player.x, game.player.y, speed, dt, 3.45);
  if (distance(game.player.x, game.player.y, game.heesun.x, game.heesun.y) < captureRadius) startCapture(game, events);
};

const updateParticles = (game: GameState, dt: number) => {
  game.particles = game.particles.filter((particle) => {
    particle.life -= dt;
    if (particle.life <= 0) return false;
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.vx *= 1 - dt * 1.7;
    particle.vy += (particle.kind === 'leaf' || particle.kind === 'note' ? 3 : 18) * dt;
    return true;
  });
};

const updateCamera = (game: GameState, dt: number) => {
  const targetX = clamp(game.player.x - VIEW_WIDTH / 2, 0, WORLD_WIDTH - VIEW_WIDTH);
  const targetY = clamp(game.player.y - VIEW_HEIGHT * CAMERA_VERTICAL_ANCHOR, 0, WORLD_HEIGHT - VIEW_HEIGHT);
  const response = game.reducedMotion ? 1 : 1 - Math.exp(-dt * 7.2);
  game.cameraX += (targetX - game.cameraX) * response;
  game.cameraY += (targetY - game.cameraY) * response;
};

export const stepGame = (game: GameState, input: InputState, dt: number): GameEvent[] => {
  const events: GameEvent[] = [];
  const previousElapsed = game.elapsed;
  game.elapsed += dt;
  game.worldTime += dt;
  if (game.message && game.message.expiresAt <= game.elapsed) game.message = null;
  if (game.delayedFarReplyAt > 0 && game.elapsed >= game.delayedFarReplyAt) {
    game.delayedFarReplyAt = 0;
    game.replyPulseUntil = game.elapsed + 1.2;
    setMessage(game, 'MỘT CĂN NHÀ RẤT XA', 'A VERY DISTANT HOUSE', 'ƠIIII!', 'YEEEES!', 'world', 2.3);
  }
  if (game.elapsed >= game.nextTimeEscalationAt) {
    game.nextTimeEscalationAt = game.elapsed + 42;
    addAbsurdity(game, 0.8);
  }
  updateScene(game, events);

  let moveX = input.moveX;
  let moveY = input.moveY;
  if (Math.abs(moveX) < 0.08) moveX = Number(input.right) - Number(input.left);
  if (Math.abs(moveY) < 0.08) moveY = Number(input.down) - Number(input.up);
  const inputLength = Math.hypot(moveX, moveY);
  if (inputLength > 1) {
    moveX /= inputLength;
    moveY /= inputLength;
  }
  const introAge = game.scene.kind === 'heesun-intro' ? game.elapsed - game.scene.startedAt : 99;
  const controlsLocked = game.scene.kind === 'capture' || (game.scene.kind === 'heesun-intro' && introAge < 3.75) || game.complete;
  const moving = !controlsLocked && inputLength > 0.08;
  if (!controlsLocked) {
    const targetVx = moveX * PLAYER_SPEED;
    const targetVy = moveY * PLAYER_SPEED;
    const response = 1 - Math.exp(-dt * 14);
    game.player.vx += (targetVx - game.player.vx) * response;
    game.player.vy += (targetVy - game.player.vy) * response;
    const nextX = game.player.x + game.player.vx * dt;
    if (!isBlocked(game, nextX, game.player.y)) game.player.x = nextX;
    else game.player.vx = 0;
    const nextY = game.player.y + game.player.vy * dt;
    if (!isBlocked(game, game.player.x, nextY)) game.player.y = nextY;
    else game.player.vy = 0;
    if (moving) {
      game.player.facingX = moveX;
      game.player.facingY = moveY;
      game.player.walk += dt * 9.2;
      if (game.elapsed >= game.nextFootstepAt) {
        game.nextFootstepAt = game.elapsed + 0.36;
        events.push({ type: 'footstep' });
        if (game.quality === 'high') addParticles(game, game.player.x, game.player.y + 5, ['#9f815b', '#c8ac75'], 2, 'dust', 8);
      }
    }
  } else {
    game.player.vx = 0;
    game.player.vy = 0;
  }
  updatePowers(game, previousElapsed, moving, events);
  updateFeast(game, events);
  updateLeader(game);
  updateStream(game, events);
  updateHaNu(game, dt, events);
  updateHeeSun(game, dt, events);
  if (input.callQueued && game.scene.kind !== 'capture' && !game.complete) handleCall(game, events);
  if (!game.complete && game.player.x > WORLD_WIDTH - 58 && game.player.y > 385 && game.player.y < 565) {
    game.complete = true;
    game.player.vx = 0;
    game.player.vy = 0;
    setMessage(game, 'PHIÊNG LƠI', 'PHIENG LOI', 'Bạn đã ra khỏi bản. Phía sau vẫn có người gọi “Bạn ơi…”.', 'You made it out. Behind you, someone is still calling “My friend…”', 'world', 4);
    events.push({ type: 'exit' });
  }
  game.fishBoost = Math.max(0, game.fishBoost - dt * 0.45);
  updateParticles(game, dt);
  updateCamera(game, dt);
  clearQueuedInput(input);
  return events;
};

const inView = (game: GameState, x: number, y: number, margin = 90) => (
  x > game.cameraX - margin
  && x < game.cameraX + VIEW_WIDTH + margin
  && y > game.cameraY - margin
  && y < game.cameraY + VIEW_HEIGHT + margin
);

const TAU = Math.PI * 2;
const ART_INK = '#26342d';

const fillAndStroke = (
  context: CanvasRenderingContext2D,
  fill: string | CanvasGradient,
  stroke = ART_INK,
  lineWidth = 1.15,
) => {
  context.fillStyle = fill;
  context.fill();
  context.strokeStyle = stroke;
  context.lineWidth = lineWidth;
  context.stroke();
};

const drawSoftShadow = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  radiusX: number,
  radiusY: number,
  alpha = 0.24,
) => {
  context.save();
  context.translate(x, y);
  context.scale(1, radiusY / radiusX);
  const shadow = context.createRadialGradient(0, 0, 0, 0, 0, radiusX);
  shadow.addColorStop(0, `rgba(24, 40, 31, ${alpha})`);
  shadow.addColorStop(1, 'rgba(24, 40, 31, 0)');
  context.fillStyle = shadow;
  context.beginPath();
  context.arc(0, 0, radiusX, 0, TAU);
  context.fill();
  context.restore();
};

const drawGrassTuft = (context: CanvasRenderingContext2D, x: number, y: number, sway: number, color: string) => {
  context.strokeStyle = color;
  context.lineWidth = 0.8;
  context.lineCap = 'round';
  context.beginPath();
  context.moveTo(x, y + 2);
  context.quadraticCurveTo(x - 1.5 + sway, y - 1.5, x - 2.5 + sway, y - 3.5);
  context.moveTo(x, y + 2);
  context.quadraticCurveTo(x + sway * 0.4, y - 2, x + sway, y - 4.8);
  context.moveTo(x, y + 2);
  context.quadraticCurveTo(x + 1.5 + sway, y - 1, x + 3.2 + sway, y - 2.8);
  context.stroke();
};

const drawLeaf = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  radiusX: number,
  radiusY: number,
  angle: number,
  color: string,
) => {
  context.save();
  context.translate(x, y);
  context.rotate(angle);
  context.beginPath();
  context.moveTo(-radiusX, 0);
  context.quadraticCurveTo(0, -radiusY, radiusX, 0);
  context.quadraticCurveTo(0, radiusY, -radiusX, 0);
  context.closePath();
  context.fillStyle = color;
  context.fill();
  context.restore();
};

const drawRock = (context: CanvasRenderingContext2D, x: number, y: number, scale: number, wet = false) => {
  context.save();
  context.translate(x, y);
  context.scale(scale, scale);
  context.beginPath();
  context.moveTo(-8, 2);
  context.quadraticCurveTo(-7, -5, -2, -7);
  context.quadraticCurveTo(5, -8, 9, -2);
  context.quadraticCurveTo(8, 4, 3, 6);
  context.quadraticCurveTo(-4, 7, -8, 2);
  context.closePath();
  const fill = context.createLinearGradient(0, -8, 0, 7);
  fill.addColorStop(0, wet ? '#78948c' : '#8b8b73');
  fill.addColorStop(1, wet ? '#405e59' : '#596454');
  fillAndStroke(context, fill, '#31453e', 1);
  context.strokeStyle = wet ? 'rgba(225, 244, 222, .58)' : 'rgba(225, 218, 172, .35)';
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(-4, -3);
  context.quadraticCurveTo(0, -5, 5, -2);
  context.stroke();
  context.restore();
};

const drawLimb = (
  context: CanvasRenderingContext2D,
  points: [number, number, number, number, number, number],
  color: string,
  width: number,
) => {
  const [x1, y1, cx, cy, x2, y2] = points;
  context.lineCap = 'round';
  context.lineJoin = 'round';
  context.strokeStyle = ART_INK;
  context.lineWidth = width + 2.2;
  context.beginPath();
  context.moveTo(x1, y1);
  context.quadraticCurveTo(cx, cy, x2, y2);
  context.stroke();
  context.strokeStyle = color;
  context.lineWidth = width;
  context.stroke();
};

const drawGround = (context: CanvasRenderingContext2D, game: GameState) => {
  const top = game.cameraY - 4;
  const ground = context.createLinearGradient(0, top, 0, top + VIEW_HEIGHT + 8);
  ground.addColorStop(0, '#91a966');
  ground.addColorStop(0.52, '#789652');
  ground.addColorStop(1, '#668747');
  context.fillStyle = ground;
  context.fillRect(game.cameraX - 4, top, VIEW_WIDTH + 8, VIEW_HEIGHT + 8);

  const startX = Math.floor(game.cameraX / 42) * 42;
  const startY = Math.floor(game.cameraY / 34) * 34;
  for (let y = startY; y < game.cameraY + VIEW_HEIGHT + 38; y += 34) {
    for (let x = startX; x < game.cameraX + VIEW_WIDTH + 46; x += 42) {
      const value = hash2(x / 17, y / 13);
      const px = x + value * 18;
      const py = y + hash2(y / 7, x / 19) * 15;
      context.save();
      context.globalAlpha = 0.16 + value * 0.1;
      context.fillStyle = value > 0.52 ? '#b0bf73' : '#456e43';
      context.beginPath();
      context.ellipse(px, py, 11 + value * 8, 4 + value * 3, value * 2.4, 0, TAU);
      context.fill();
      context.restore();
      if (game.quality === 'high' && value > 0.36) {
        const sway = Math.sin(game.worldTime * 1.15 + px * 0.045) * 0.8;
        drawGrassTuft(context, px + 3, py + 1, sway, value > 0.76 ? '#d7c76e' : '#426f43');
      }
    }
  }
};

const drawMountains = (context: CanvasRenderingContext2D) => {
  const haze = context.createLinearGradient(0, 22, 0, 198);
  haze.addColorStop(0, '#b9c8a3');
  haze.addColorStop(1, '#668063');
  context.fillStyle = haze;
  context.beginPath();
  context.moveTo(0, 153);
  context.bezierCurveTo(58, 139, 79, 79, 126, 87);
  context.bezierCurveTo(181, 95, 199, 145, 246, 137);
  context.bezierCurveTo(306, 126, 316, 50, 376, 55);
  context.bezierCurveTo(437, 60, 459, 126, 520, 117);
  context.bezierCurveTo(585, 107, 609, 39, 675, 45);
  context.bezierCurveTo(744, 52, 761, 133, 836, 127);
  context.bezierCurveTo(906, 120, 921, 67, 982, 71);
  context.bezierCurveTo(1_045, 75, 1_079, 145, 1_147, 133);
  context.bezierCurveTo(1_220, 120, 1_247, 46, 1_311, 51);
  context.bezierCurveTo(1_382, 57, 1_407, 129, 1_468, 119);
  context.bezierCurveTo(1_540, 107, 1_584, 57, WORLD_WIDTH, 62);
  context.lineTo(WORLD_WIDTH, 180);
  context.lineTo(0, 180);
  context.closePath();
  context.fill();
  const ridge = context.createLinearGradient(0, 94, 0, 204);
  ridge.addColorStop(0, '#56755a');
  ridge.addColorStop(1, '#385e49');
  context.fillStyle = ridge;
  context.beginPath();
  context.moveTo(0, 167);
  context.bezierCurveTo(75, 158, 105, 113, 164, 122);
  context.bezierCurveTo(224, 132, 255, 164, 316, 151);
  context.bezierCurveTo(378, 138, 423, 102, 480, 112);
  context.bezierCurveTo(548, 124, 571, 166, 638, 158);
  context.bezierCurveTo(703, 149, 741, 111, 804, 119);
  context.bezierCurveTo(883, 129, 929, 169, 1_014, 158);
  context.bezierCurveTo(1_096, 148, 1_154, 105, 1_225, 113);
  context.bezierCurveTo(1_315, 123, 1_361, 169, 1_450, 158);
  context.bezierCurveTo(1_533, 148, 1_600, 117, WORLD_WIDTH, 126);
  context.lineTo(WORLD_WIDTH, 195);
  context.lineTo(0, 195);
  context.closePath();
  context.fill();

  context.strokeStyle = 'rgba(224, 230, 196, .28)';
  context.lineWidth = 2;
  for (let x = 75; x < WORLD_WIDTH; x += 170) {
    context.beginPath();
    context.moveTo(x, 147);
    context.quadraticCurveTo(x + 34, 128, x + 69, 146);
    context.stroke();
  }
};

const drawRoads = (context: CanvasRenderingContext2D) => {
  const paths: Array<Array<[number, number]>> = [
    [[35, 492], [250, 470], [470, 450], [680, 470], [870, 424], [1_080, 446], [1_300, 470], [1_660, 470]],
    [[470, 450], [565, 345], [700, 247], [850, 300], [942, 335]],
    [[680, 470], [585, 602], [790, 710], [1_080, 696], [1_205, 704], [1_335, 525]],
    [[1_210, 465], [1_300, 388], [1_430, 280]],
  ];
  context.lineCap = 'round';
  context.lineJoin = 'round';
  paths.forEach((points, pathIndex) => {
    context.beginPath();
    points.forEach(([x, y], index) => index === 0 ? context.moveTo(x, y) : context.lineTo(x, y));
    context.strokeStyle = 'rgba(42, 61, 43, .32)';
    context.lineWidth = 30;
    context.stroke();
    context.strokeStyle = '#9a8054';
    context.lineWidth = 23;
    context.stroke();
    const dust = context.createLinearGradient(0, 395, 0, 720);
    dust.addColorStop(0, '#d2b477');
    dust.addColorStop(1, '#b18b59');
    context.strokeStyle = dust;
    context.lineWidth = 17;
    context.stroke();
    context.strokeStyle = 'rgba(250, 224, 160, .48)';
    context.lineWidth = 1.2;
    context.stroke();

    for (let index = 1; index < points.length; index += 1) {
      const [ax, ay] = points[index - 1];
      const [bx, by] = points[index];
      for (let step = 0.15; step < 1; step += 0.23) {
        const seed = hash2(pathIndex * 37 + index, step * 91);
        const x = ax + (bx - ax) * step + (seed - 0.5) * 9;
        const y = ay + (by - ay) * step + (hash2(seed * 19, index) - 0.5) * 7;
        context.fillStyle = seed > 0.5 ? 'rgba(90, 68, 43, .32)' : 'rgba(255, 231, 172, .35)';
        context.beginPath();
        context.ellipse(x, y, 1.2 + seed, 0.55 + seed * 0.4, seed * 4, 0, TAU);
        context.fill();
      }
    }
  });
};

const drawFields = (context: CanvasRenderingContext2D, game: GameState) => {
  context.save();
  context.beginPath();
  context.moveTo(384, 566);
  context.quadraticCurveTo(510, 538, 661, 566);
  context.lineTo(655, 812);
  context.quadraticCurveTo(520, 830, 386, 802);
  context.closePath();
  const cornSoil = context.createLinearGradient(390, 555, 650, 810);
  cornSoil.addColorStop(0, '#9a7748');
  cornSoil.addColorStop(1, '#655036');
  fillAndStroke(context, cornSoil, '#4d5f3e', 2.2);
  for (let y = 580; y < 800; y += 25) {
    context.strokeStyle = 'rgba(211, 164, 89, .52)';
    context.lineWidth = 4.5;
    context.beginPath();
    context.moveTo(397, y + 3);
    context.quadraticCurveTo(520, y - 8, 647, y + 2);
    context.stroke();
    for (let x = 407; x < 645; x += 18) {
      const sway = Math.sin(game.worldTime * 1.15 + x * 0.04 + y) * 1.1;
      context.strokeStyle = '#355f3b';
      context.lineWidth = 1.4;
      context.beginPath();
      context.moveTo(x, y + 3);
      context.quadraticCurveTo(x + sway, y - 7, x + sway * 1.4, y - 13);
      context.stroke();
      drawLeaf(context, x - 2 + sway, y - 7, 4.2, 1.55, -0.55, '#4d7b45');
      drawLeaf(context, x + 2 + sway, y - 10, 4, 1.45, 0.65, '#638c4c');
      context.fillStyle = '#d2a93f';
      context.beginPath();
      context.ellipse(x + sway * 1.2, y - 7, 1.25, 3.1, -0.15, 0, TAU);
      context.fill();
    }
  }
  context.restore();

  const terrace = context.createRadialGradient(940, 196, 25, 940, 210, 270);
  terrace.addColorStop(0, '#a9b76c');
  terrace.addColorStop(1, '#60794a');
  context.fillStyle = terrace;
  context.beginPath();
  context.ellipse(940, 195, 260, 145, -0.03, 0, TAU);
  context.fill();
  const colors = ['#a7b866', '#c1bf6d', '#d0b960', '#7e9b55'];
  for (let index = 0; index < 8; index += 1) {
    const breeze = Math.sin(game.worldTime * 0.42 + index) * 1.1;
    context.strokeStyle = 'rgba(48, 70, 42, .35)';
    context.lineWidth = 11;
    context.beginPath();
    context.ellipse(940, 207 + index * 10, 242 - index * 24, 109 - index * 8, 0, Math.PI, TAU);
    context.stroke();
    context.strokeStyle = colors[index % colors.length];
    context.lineWidth = 7.2;
    context.beginPath();
    context.ellipse(940 + breeze, 204 + index * 10, 238 - index * 24, 106 - index * 8, 0, Math.PI, TAU);
    context.stroke();
  }

  context.beginPath();
  context.moveTo(1_250, 486);
  context.quadraticCurveTo(1_380, 458, 1_518, 486);
  context.lineTo(1_510, 694);
  context.quadraticCurveTo(1_380, 714, 1_255, 684);
  context.closePath();
  const orchard = context.createLinearGradient(1_260, 480, 1_490, 690);
  orchard.addColorStop(0, '#8c754b');
  orchard.addColorStop(1, '#6f5b3d');
  fillAndStroke(context, orchard, '#4b6140', 2);
  for (let row = 0; row < 6; row += 1) {
    for (let column = 0; column < 8; column += 1) {
      const x = 1_278 + column * 29 + (row % 2) * 7;
      const y = 500 + row * 31;
      const sway = Math.sin(game.worldTime * 0.8 + row * 2 + column) * 0.9;
      context.strokeStyle = '#4a4f35';
      context.lineWidth = 1.3;
      context.beginPath();
      context.moveTo(x, y + 6);
      context.quadraticCurveTo(x + sway, y, x + sway, y - 7);
      context.stroke();
      context.fillStyle = row % 2 ? '#3f6d43' : '#315d3e';
      context.beginPath();
      context.ellipse(x - 4 + sway, y - 7, 7, 4.5, -0.3, 0, TAU);
      context.ellipse(x + 4 + sway, y - 7, 7, 4.5, 0.3, 0, TAU);
      context.fill();
      context.fillStyle = '#ddb85e';
      context.beginPath();
      context.arc(x - 3 + sway, y - 8, 1.15, 0, TAU);
      context.arc(x + 4 + sway, y - 5, 1.1, 0, TAU);
      context.fill();
    }
  }
};

const drawRiver = (context: CanvasRenderingContext2D, game: GameState) => {
  const traceRiver = () => {
    context.beginPath();
    for (let y = 120; y <= WORLD_HEIGHT + 40; y += 28) {
      const x = riverCenterX(y);
      if (y === 120) context.moveTo(x, y);
      else context.lineTo(x, y);
    }
  };
  context.lineCap = 'round';
  traceRiver();
  context.strokeStyle = 'rgba(35, 61, 45, .38)';
  context.lineWidth = 94;
  context.stroke();
  traceRiver();
  context.strokeStyle = '#55745f';
  context.lineWidth = 86;
  context.stroke();
  traceRiver();
  const water = context.createLinearGradient(1_060, 0, 1_150, 0);
  water.addColorStop(0, '#3f7c83');
  water.addColorStop(0.45, '#76adb0');
  water.addColorStop(0.72, '#90c2b6');
  water.addColorStop(1, '#4e8586');
  context.strokeStyle = water;
  context.lineWidth = 70;
  context.stroke();
  traceRiver();
  context.strokeStyle = 'rgba(184, 222, 202, .25)';
  context.lineWidth = 53;
  context.stroke();

  const slowTime = game.powerUntil.coffee > game.elapsed ? game.worldTime * 0.22 : game.worldTime;
  const startY = Math.floor(game.cameraY / 18) * 18;
  for (let y = startY; y < game.cameraY + VIEW_HEIGHT + 30; y += 18) {
    const x = riverCenterX(y);
    const wave = Math.sin(slowTime * 1.8 + y * 0.07) * 7;
    context.strokeStyle = 'rgba(231, 247, 222, .62)';
    context.lineWidth = 1.15;
    context.beginPath();
    context.moveTo(x - 25 + wave, y);
    context.quadraticCurveTo(x - 17 + wave, y - 2, x - 9 + wave, y);
    context.moveTo(x + 3 - wave * 0.5, y + 8);
    context.quadraticCurveTo(x + 12 - wave * 0.5, y + 10, x + 23 - wave * 0.5, y + 7);
    context.stroke();
  }

  const rocks = [
    [1_071, 568, 0.7], [1_128, 592, 0.9], [1_080, 621, 0.55], [1_136, 750, 0.72],
    [1_075, 785, 1.05], [1_132, 817, 0.6], [1_087, 342, 0.72], [1_126, 365, 0.52],
  ] as const;
  rocks.forEach(([x, y, scale]) => {
    if (inView(game, x, y, 30)) drawRock(context, x, y, scale, true);
  });
};

const drawBridge = (context: CanvasRenderingContext2D, y: number) => {
  const x = riverCenterX(y);
  drawSoftShadow(context, x + 3, y + 12, 52, 7, 0.28);
  context.strokeStyle = '#4c3629';
  context.lineWidth = 5;
  context.lineCap = 'round';
  context.beginPath();
  context.moveTo(x - 51, y - 13);
  context.quadraticCurveTo(x, y - 17, x + 51, y - 12);
  context.moveTo(x - 51, y + 13);
  context.quadraticCurveTo(x, y + 17, x + 51, y + 12);
  context.stroke();
  for (let offset = -45; offset <= 42; offset += 9) {
    const tilt = Math.sin(offset * 0.17) * 1.6;
    context.beginPath();
    context.moveTo(x + offset - 3, y - 12 + tilt);
    context.lineTo(x + offset + 4, y - 11 - tilt);
    context.lineTo(x + offset + 4, y + 12 + tilt);
    context.lineTo(x + offset - 3, y + 11 - tilt);
    context.closePath();
    const plank = context.createLinearGradient(0, y - 12, 0, y + 13);
    plank.addColorStop(0, '#c89455');
    plank.addColorStop(1, '#8b5d3b');
    fillAndStroke(context, plank, '#57402f', 0.7);
  }
};

const drawTree = (context: CanvasRenderingContext2D, x: number, y: number, variant: number) => {
  const wide = variant % 2 === 0;
  drawSoftShadow(context, x + 4, y + 5, wide ? 17 : 14, 4.5, 0.22);
  context.strokeStyle = '#4c3828';
  context.lineWidth = wide ? 5 : 4;
  context.lineCap = 'round';
  context.beginPath();
  context.moveTo(x, y + 5);
  context.quadraticCurveTo(x - 1, y - 14, x + (wide ? 2 : -2), y - 24);
  context.moveTo(x, y - 12);
  context.quadraticCurveTo(x - 8, y - 18, x - 9, y - 23);
  context.moveTo(x + 1, y - 16);
  context.quadraticCurveTo(x + 8, y - 20, x + 10, y - 27);
  context.stroke();
  const dark = wide ? '#315f42' : '#28533c';
  const light = wide ? '#6e944f' : '#5e884b';
  [
    [-9, -25, 11, 8], [2, -30, 13, 9], [11, -23, 10, 8], [-1, -18, 15, 9],
  ].forEach(([dx, dy, rx, ry], index) => {
    context.fillStyle = index === 1 || index === 3 ? light : dark;
    context.beginPath();
    context.ellipse(x + dx, y + dy, rx, ry, (index - 1) * 0.18, 0, TAU);
    context.fill();
    context.strokeStyle = '#264b38';
    context.lineWidth = 0.8;
    context.stroke();
  });
  drawLeaf(context, x - 11, y - 30, 4.5, 1.8, -0.5, '#94a95b');
  drawLeaf(context, x + 8, y - 32, 4.3, 1.7, 0.35, '#8ea458');
};

const drawScenery = (context: CanvasRenderingContext2D, game: GameState) => {
  for (let y = 205; y < WORLD_HEIGHT - 24; y += 50) {
    for (let x = 45; x < WORLD_WIDTH - 32; x += 53) {
      const chance = hash2(x, y);
      const clearRoad = Math.abs(y - (455 + Math.sin(x * 0.006) * 24)) < 52;
      const river = Math.abs(x - riverCenterX(y)) < 80;
      const building = solidRects.some((rect) => x > rect.x - 30 && x < rect.x + rect.width + 30 && y > rect.y - 30 && y < rect.y + rect.height + 30);
      if (clearRoad || river || building || chance < 0.82 || !inView(game, x, y, 45)) continue;
      if (chance > 0.91) drawTree(context, x, y, Math.floor(chance * 10));
      else {
        context.strokeStyle = '#486c42';
        context.lineWidth = 0.75;
        context.beginPath();
        context.moveTo(x, y + 2);
        context.quadraticCurveTo(x - 1, y - 1, x + 0.5, y - 4);
        context.stroke();
        context.fillStyle = chance > 0.86 ? '#e1c960' : '#dc8f72';
        context.beginPath();
        context.arc(x - 1.2, y - 4.3, 1.4, 0, TAU);
        context.arc(x + 1.4, y - 3.8, 1.25, 0, TAU);
        context.fill();
      }
    }
  }
};

const drawBananaPlant = (context: CanvasRenderingContext2D, x: number, y: number, time: number, scale = 1) => {
  const sway = Math.sin(time * 0.72 + x * 0.02) * 0.08;
  context.save();
  context.translate(x, y);
  context.scale(scale, scale);
  drawSoftShadow(context, 3, 4, 14, 4, 0.22);
  context.strokeStyle = '#6b693b';
  context.lineWidth = 2.2;
  context.lineCap = 'round';
  context.beginPath();
  context.moveTo(0, 4);
  context.quadraticCurveTo(-1, -10, 1, -23);
  context.stroke();
  const leaves: ReadonlyArray<readonly [number, number, number, string]> = [
    [-8, -25, -0.75, '#477a45'], [8, -27, 0.7, '#5d8d4b'], [-10, -17, -2.7, '#67944d'],
    [10, -17, 2.68, '#3e7042'], [1, -31, -1.45, '#779e52'],
  ];
  leaves.forEach(([leafX, leafY, angle, color], index) => {
    drawLeaf(context, leafX + Math.sin(sway + index) * 1.2, leafY, 10.5, 3.2, angle + sway, color);
  });
  context.fillStyle = '#d3b54f';
  context.beginPath();
  context.ellipse(4, -15, 2.4, 4.5, 0.25, 0, TAU);
  context.fill();
  context.restore();
};

const drawFence = (context: CanvasRenderingContext2D, x: number, y: number, length: number) => {
  context.strokeStyle = '#725238';
  context.lineCap = 'round';
  context.lineJoin = 'round';
  context.lineWidth = 2.4;
  context.beginPath();
  for (let offset = 0; offset <= length; offset += 13) {
    const lean = Math.sin(offset * 0.6) * 1.5;
    context.moveTo(x + offset, y + 3);
    context.lineTo(x + offset + lean, y - 17 - (offset % 3));
  }
  context.moveTo(x - 2, y - 11);
  context.quadraticCurveTo(x + length / 2, y - 15, x + length + 2, y - 10);
  context.moveTo(x - 1, y - 3);
  context.quadraticCurveTo(x + length / 2, y - 7, x + length + 1, y - 2);
  context.stroke();
};

const drawVillageDetails = (context: CanvasRenderingContext2D, game: GameState) => {
  const bananas = [
    [157, 552, 0.9], [181, 555, 0.72], [420, 392, 0.78], [1_452, 442, 0.88], [1_518, 730, 1],
  ] as const;
  bananas.forEach(([x, y, scale]) => {
    if (inView(game, x, y, 50)) drawBananaPlant(context, x, y, game.worldTime, scale);
  });
  const fences = [
    [118, 558, 92], [629, 386, 104], [1_407, 456, 82], [1_263, 721, 96],
  ] as const;
  fences.forEach(([x, y, length]) => {
    if (inView(game, x + length / 2, y, 40)) drawFence(context, x, y, length);
  });
  const stones = [
    [243, 551, 0.62], [610, 529, 0.48], [704, 615, 0.7], [1_404, 364, 0.55], [1_536, 544, 0.82],
  ] as const;
  stones.forEach(([x, y, scale]) => {
    if (inView(game, x, y, 30)) drawRock(context, x, y, scale);
  });
};

const drawStiltHouse = (
  context: CanvasRenderingContext2D,
  house: { x: number; y: number; width: number; height: number },
  index: number,
  time: number,
) => {
  const { x, y, width } = house;
  const roofTop = y - 24;
  const floorY = y + 61;
  drawSoftShadow(context, x + width / 2 + 6, y + 78, width * 0.62, 15, 0.3);

  context.strokeStyle = '#49372b';
  context.lineWidth = 4.5;
  context.lineCap = 'round';
  [18, width * 0.38, width * 0.68, width - 17].forEach((offset, postIndex) => {
    context.beginPath();
    context.moveTo(x + offset, floorY - 3);
    context.lineTo(x + offset + (postIndex % 2 ? 2 : -1), y + 91);
    context.stroke();
  });

  const wall = context.createLinearGradient(x, y + 18, x + width, y + 64);
  wall.addColorStop(0, index % 2 ? '#bd8a56' : '#c99b62');
  wall.addColorStop(0.52, '#a67549');
  wall.addColorStop(1, '#80583c');
  context.beginPath();
  context.moveTo(x + 4, y + 18);
  context.quadraticCurveTo(x + width / 2, y + 14, x + width - 4, y + 19);
  context.lineTo(x + width - 7, floorY);
  context.quadraticCurveTo(x + width / 2, floorY + 3, x + 6, floorY);
  context.closePath();
  fillAndStroke(context, wall, '#45352b', 1.7);

  context.strokeStyle = 'rgba(244, 204, 125, .38)';
  context.lineWidth = 1;
  for (let line = x + 12; line < x + width - 9; line += 11.5) {
    context.beginPath();
    context.moveTo(line, y + 22);
    context.quadraticCurveTo(line - 1.2, y + 42, line + 0.6, floorY - 3);
    context.stroke();
  }

  const doorX = x + width * 0.61;
  context.beginPath();
  context.roundRect(doorX, y + 30, width * 0.17, 31, [3, 3, 0, 0]);
  fillAndStroke(context, '#314038', '#3c332d', 1.2);
  context.fillStyle = '#e6b965';
  context.beginPath();
  context.arc(doorX + width * 0.135, y + 46, 1.15, 0, TAU);
  context.fill();

  const roof = context.createLinearGradient(0, roofTop, 0, y + 25);
  roof.addColorStop(0, index % 2 ? '#655244' : '#563f3a');
  roof.addColorStop(0.64, index % 2 ? '#746342' : '#7d4f42');
  roof.addColorStop(1, '#3d382f');
  context.beginPath();
  context.moveTo(x - 17, y + 21);
  context.quadraticCurveTo(x + width * 0.23, y - 9, x + width / 2, roofTop);
  context.quadraticCurveTo(x + width * 0.77, y - 7, x + width + 18, y + 22);
  context.quadraticCurveTo(x + width + 4, y + 27, x + width / 2, y + 20);
  context.quadraticCurveTo(x - 5, y + 27, x - 17, y + 21);
  context.closePath();
  fillAndStroke(context, roof, '#332f2c', 2.2);
  context.strokeStyle = 'rgba(221, 187, 117, .26)';
  context.lineWidth = 1;
  for (let rib = 0.1; rib < 0.95; rib += 0.1) {
    const ribX = x - 11 + (width + 22) * rib;
    context.beginPath();
    context.moveTo(x + width / 2, roofTop + 2);
    context.quadraticCurveTo(ribX, y + 4, ribX, y + 21);
    context.stroke();
  }

  context.strokeStyle = '#5e422f';
  context.lineWidth = 2.5;
  context.beginPath();
  context.moveTo(x - 3, floorY + 1);
  context.quadraticCurveTo(x + width / 2, floorY + 6, x + width + 2, floorY + 1);
  context.stroke();
  for (let rail = x + 6; rail < x + width * 0.48; rail += 10) {
    context.beginPath();
    context.moveTo(rail, floorY - 1);
    context.lineTo(rail, floorY - 13);
    context.stroke();
  }
  context.beginPath();
  context.moveTo(x + 4, floorY - 12);
  context.lineTo(x + width * 0.49, floorY - 12);
  context.stroke();

  const stairX = x + width - 28;
  context.strokeStyle = '#5a3f2d';
  context.lineWidth = 3;
  context.beginPath();
  context.moveTo(stairX, floorY - 1);
  context.lineTo(stairX - 7, y + 92);
  context.moveTo(stairX + 22, floorY - 1);
  context.lineTo(stairX + 15, y + 92);
  context.stroke();
  context.lineWidth = 2;
  for (let step = 0; step < 5; step += 1) {
    const stepY = floorY + 4 + step * 6;
    context.beginPath();
    context.moveTo(stairX - 1 - step * 1.1, stepY);
    context.lineTo(stairX + 21 - step * 1.1, stepY);
    context.stroke();
  }

  context.fillStyle = '#7f5436';
  context.beginPath();
  context.ellipse(x + 30, y + 82, 7, 9, -0.1, 0, TAU);
  context.ellipse(x + 45, y + 84, 5.5, 7, 0.12, 0, TAU);
  context.fill();
  context.strokeStyle = '#40342c';
  context.lineWidth = 1;
  context.stroke();

  const smoke = Math.sin(time * 0.85 + index) * 3;
  for (let puff = 0; puff < 3; puff += 1) {
    context.fillStyle = `rgba(231, 226, 204, ${0.27 - puff * 0.055})`;
    context.beginPath();
    context.ellipse(x + 28 + smoke * (puff + 1) * 0.5, roofTop - 8 - puff * 10, 4 + puff * 1.6, 6 + puff * 1.8, 0, 0, TAU);
    context.fill();
  }
};

const drawWaterwheel = (context: CanvasRenderingContext2D, game: GameState) => {
  const x = 1_073;
  const y = 668;
  const time = game.powerUntil.coffee > game.elapsed ? game.worldTime * 0.22 : game.worldTime;
  drawSoftShadow(context, x + 6, y + 26, 34, 8, 0.28);
  context.save();
  context.translate(x, y);
  context.strokeStyle = '#4c3427';
  context.lineWidth = 5.5;
  context.beginPath();
  context.arc(0, 0, 30, 0, Math.PI * 2);
  context.stroke();
  context.strokeStyle = '#bb8950';
  context.lineWidth = 2.8;
  context.beginPath();
  context.arc(0, 0, 30, 0, TAU);
  context.stroke();
  context.rotate(time * 0.45);
  for (let spoke = 0; spoke < 12; spoke += 1) {
    context.rotate(Math.PI / 6);
    context.strokeStyle = '#8a603d';
    context.lineWidth = 2.3;
    context.beginPath();
    context.moveTo(0, -2);
    context.lineTo(0, -29);
    context.stroke();
    context.beginPath();
    context.roundRect(-5, -34, 10, 6, 1.5);
    fillAndStroke(context, '#c79758', '#563d2d', 0.8);
  }
  context.fillStyle = '#533a29';
  context.beginPath();
  context.arc(0, 0, 5, 0, TAU);
  context.fill();
  context.restore();
  const splash = Math.sin(time * 3.5) * 2;
  context.strokeStyle = 'rgba(223, 244, 225, .66)';
  context.lineWidth = 1.2;
  context.beginPath();
  context.arc(x - 3 + splash, y + 30, 8, Math.PI * 1.1, Math.PI * 1.85);
  context.arc(x + 14 - splash, y + 27, 6, Math.PI * 1.15, Math.PI * 1.8);
  context.stroke();
};

const drawFeast = (context: CanvasRenderingContext2D, game: GameState) => {
  const { x, y } = game.feast;
  drawSoftShadow(context, x + 3, y + 24, 48, 12, 0.3);
  context.save();
  context.translate(x, y);
  context.beginPath();
  context.moveTo(-31, -8);
  context.quadraticCurveTo(0, -14, 31, -7);
  context.lineTo(34, 26);
  context.quadraticCurveTo(1, 33, -34, 26);
  context.closePath();
  const mat = context.createLinearGradient(-30, -8, 30, 28);
  mat.addColorStop(0, '#c95343');
  mat.addColorStop(1, '#8c3540');
  fillAndStroke(context, mat, '#52352f', 1.2);
  context.save();
  context.clip();
  context.strokeStyle = '#e5c85d';
  context.lineWidth = 2.2;
  for (let stripe = -36; stripe < 42; stripe += 9) {
    context.beginPath();
    context.moveTo(stripe, -13);
    context.lineTo(stripe + 6, 34);
    context.stroke();
  }
  context.restore();
  context.fillStyle = '#efe0a6';
  context.beginPath();
  context.ellipse(0, 7, 10, 5.7, 0.05, 0, TAU);
  context.fill();
  context.strokeStyle = '#654b35';
  context.lineWidth = 0.8;
  context.stroke();
  ['#70934d', '#a64f3b', '#dab355'].forEach((color, index) => {
    context.fillStyle = color;
    context.beginPath();
    context.arc(-4 + index * 4, 7 + (index % 2) * 1.5, 2.2, 0, TAU);
    context.fill();
  });
  for (let cup = -1; cup <= 1; cup += 1) {
    context.fillStyle = '#f3e7b8';
    context.beginPath();
    context.ellipse(cup * 11, 18, 2.6, 1.5, 0, 0, TAU);
    context.fill();
  }
  context.restore();

  const people = [[-37, 0, '#7c483f'], [37, 0, '#315d62'], [-25, 34, '#6e714a'], [25, 34, '#9f603d']] as const;
  people.forEach(([dx, dy, color], index) => {
    const wave = game.callPulseUntil > game.elapsed ? Math.sin(game.elapsed * 14 + index) * 2.2 : 0;
    const facing = dx < 0 ? 1 : -1;
    context.save();
    context.translate(x + dx, y + dy + wave);
    drawSoftShadow(context, 0, 7, 9, 3, 0.22);
    context.beginPath();
    context.ellipse(0, -2, 6.5, 8.5, facing * 0.18, 0, TAU);
    fillAndStroke(context, color, ART_INK, 1.1);
    context.fillStyle = '#c78e66';
    context.beginPath();
    context.ellipse(facing * 1.4, -12, 4.2, 4.8, facing * -0.12, 0, TAU);
    context.fill();
    context.strokeStyle = ART_INK;
    context.lineWidth = 1;
    context.stroke();
    context.strokeStyle = '#332c2a';
    context.lineWidth = 2.2;
    context.beginPath();
    context.arc(facing * 1.4, -13.2, 4.1, Math.PI, TAU);
    context.stroke();
    drawLimb(context, [facing * 3, -4, facing * 8, 0, facing * 10, 3], '#c78e66', 2.3);
    context.restore();
  });
};

const drawChief = (context: CanvasRenderingContext2D, game: GameState) => {
  const x = 700;
  const y = 247;
  const speaking = game.leaderStartedAt !== 0;
  const bob = speaking ? Math.sin(game.worldTime * 4) * 0.8 : 0;
  drawSoftShadow(context, x + 1, y + 9, 12, 3.8, 0.25);
  context.save();
  context.translate(x, y + bob);
  context.strokeStyle = '#34372f';
  context.lineWidth = 3.4;
  context.lineCap = 'round';
  context.beginPath();
  context.moveTo(-3.5, 2);
  context.lineTo(-4.5, 10);
  context.moveTo(3.2, 2);
  context.lineTo(4.8, 10);
  context.stroke();
  context.beginPath();
  context.moveTo(-8, -10);
  context.quadraticCurveTo(-9, -2, -6, 4);
  context.quadraticCurveTo(0, 7, 7, 4);
  context.quadraticCurveTo(10, -3, 7, -10);
  context.closePath();
  fillAndStroke(context, '#713f3c', ART_INK, 1.2);
  context.fillStyle = '#cf966d';
  context.beginPath();
  context.ellipse(0, -16, 5.2, 5.9, -0.08, 0, TAU);
  context.fill();
  context.strokeStyle = ART_INK;
  context.lineWidth = 1.1;
  context.stroke();
  context.strokeStyle = '#2d2928';
  context.lineWidth = 2.4;
  context.beginPath();
  context.arc(0, -17.7, 5.2, Math.PI * 1.02, Math.PI * 1.93);
  context.stroke();
  context.fillStyle = '#d9bc68';
  context.beginPath();
  context.ellipse(0, -22.2, 8.5, 2.2, 0.02, 0, TAU);
  context.fill();
  context.strokeStyle = '#69502f';
  context.lineWidth = 0.9;
  context.stroke();
  context.fillStyle = '#29312d';
  context.beginPath();
  context.arc(-1.7, -16, 0.65, 0, TAU);
  context.arc(2.1, -15.7, 0.65, 0, TAU);
  context.fill();
  if (speaking) drawLimb(context, [6, -6, 12, -11, 13, -17], '#cf966d', 2.5);
  context.restore();
  if (speaking) {
    context.beginPath();
    context.roundRect(x - 31, y - 45, 62, 15, 5);
    fillAndStroke(context, 'rgba(36, 54, 43, .94)', '#d0b25d', 0.9);
    context.fillStyle = '#f4dda0';
    context.font = '800 6px "Be Vietnam Pro", sans-serif';
    context.textAlign = 'center';
    context.fillText('THỨ NHẤT…', x, y - 34);
  }
};

const drawStreamGroup = (context: CanvasRenderingContext2D, game: GameState) => {
  const people = [
    { x: 1_178, y: 682, dress: '#8d3f55', sash: '#e7c15b', pose: 'wash' },
    { x: 1_205, y: 699, dress: '#315e68', sash: '#e85b62', pose: 'water' },
    { x: 1_232, y: 680, dress: '#4f7148', sash: '#f0c95e', pose: 'talk' },
    { x: 1_253, y: 708, dress: '#795173', sash: '#74b7a2', pose: 'wring' },
  ];
  people.forEach((person, index) => {
    const laugh = game.streamStartedAt > 0 ? Math.sin(game.worldTime * 4 + index * 1.7) * 1.2 : 0;
    context.save();
    context.translate(person.x, person.y + laugh);
    drawSoftShadow(context, 0, 10, 10, 3.2, 0.18);
    context.beginPath();
    context.moveTo(-6, -9);
    context.quadraticCurveTo(-9, 1, -6, 10);
    context.quadraticCurveTo(0, 13, 7, 9);
    context.quadraticCurveTo(9, 0, 6, -9);
    context.closePath();
    fillAndStroke(context, person.dress, ART_INK, 1.1);
    context.strokeStyle = person.sash;
    context.lineWidth = 2.2;
    context.beginPath();
    context.moveTo(-6.5, 0);
    context.quadraticCurveTo(0, 1.2, 7, 0);
    context.stroke();
    context.fillStyle = '#c98f6b';
    context.beginPath();
    context.ellipse(0, -15, 4.6, 5.2, index % 2 ? 0.12 : -0.1, 0, TAU);
    context.fill();
    context.strokeStyle = ART_INK;
    context.lineWidth = 1;
    context.stroke();
    context.strokeStyle = '#292829';
    context.lineWidth = 2.8;
    context.beginPath();
    context.arc(0, -16.5, 4.4, Math.PI, TAU);
    context.stroke();
    if (person.pose === 'wash') {
      drawLimb(context, [-5, -5, -11, 1, -9, 7], '#c98f6b', 2.1);
      drawLimb(context, [5, -5, 10, 1, 8, 7], '#c98f6b', 2.1);
      context.fillStyle = '#e2d29d';
      context.beginPath();
      context.ellipse(0, 8, 8, 2.5, 0, 0, TAU);
      context.fill();
    } else if (person.pose === 'wring') {
      drawLimb(context, [-5, -5, -9, -1, -2, 2], '#c98f6b', 2.1);
      drawLimb(context, [5, -5, 9, -1, 2, 2], '#c98f6b', 2.1);
      context.strokeStyle = '#e9c47d';
      context.lineWidth = 2.2;
      context.beginPath();
      context.moveTo(-3, 2);
      context.quadraticCurveTo(0, 5, 3, 2);
      context.stroke();
    } else if (person.pose === 'talk') {
      drawLimb(context, [5, -5, 11, -10, 10, -15], '#c98f6b', 2.1);
    }
    context.restore();
  });
  [
    [1_164, 699, 20, 10, -0.25], [1_227, 696, 22, 11, 0.18], [1_250, 716, 18, 8, -0.1],
  ].forEach(([x, y, rx, ry, angle]) => {
    context.fillStyle = '#37684a';
    context.beginPath();
    context.ellipse(x, y, rx, ry, angle, 0, TAU);
    context.fill();
  });
};

const drawFish = (context: CanvasRenderingContext2D, game: GameState) => {
  const streamAge = game.streamStartedAt > 0 ? Math.max(0, game.elapsed - game.streamStartedAt) : 0;
  const base = game.streamStartedAt !== 0 ? Math.min(46, Math.floor(streamAge * 10)) : 5;
  const count = Math.min(84, base + Math.floor(game.fishBoost) + (game.absurdityLevel >= 3 ? 26 : 0));
  const time = game.powerUntil.coffee > game.elapsed ? game.worldTime * 0.2 : game.worldTime;
  for (let index = 0; index < count; index += 1) {
    const lane = index % 9;
    const fishX = 1_142 + ((time * (5 + index % 4) + index * 19) % 127);
    const fishY = 696 + lane * 6 + Math.sin(time * 1.4 + index) * 2;
    context.save();
    context.translate(fishX, fishY);
    context.fillStyle = index % 3 === 0 ? '#f0d68f' : index % 3 === 1 ? '#d97c5a' : '#f1ecbd';
    context.beginPath();
    context.ellipse(0, 0, 3.3, 1.25, 0, 0, TAU);
    context.moveTo(-3, 0);
    context.lineTo(-5.4, -2);
    context.lineTo(-5.1, 2);
    context.closePath();
    context.fill();
    context.fillStyle = '#2d514e';
    context.beginPath();
    context.arc(1.7, -0.25, 0.45, 0, TAU);
    context.fill();
    context.restore();
  }
};

const drawChicken = (context: CanvasRenderingContext2D, x: number, y: number, color: string) => {
  context.save();
  context.translate(x, y);
  context.strokeStyle = '#4a382d';
  context.lineWidth = 0.85;
  context.beginPath();
  context.moveTo(-2, 0);
  context.lineTo(-2.6, 3);
  context.moveTo(2.5, 0);
  context.lineTo(3.2, 3);
  context.stroke();
  context.beginPath();
  context.ellipse(0, -4, 5.4, 4.2, -0.08, 0, TAU);
  fillAndStroke(context, color, '#513b2e', 0.8);
  context.fillStyle = '#f0d7a0';
  context.beginPath();
  context.ellipse(4.2, -7, 3, 3.3, 0.18, 0, TAU);
  context.fill();
  context.strokeStyle = '#513b2e';
  context.stroke();
  context.fillStyle = '#dda43c';
  context.beginPath();
  context.moveTo(6.5, -7.2);
  context.lineTo(9.5, -6.1);
  context.lineTo(6.5, -5.7);
  context.closePath();
  context.fill();
  context.fillStyle = '#bd493c';
  context.beginPath();
  context.arc(3.2, -10, 1.2, 0, TAU);
  context.arc(5.1, -9.7, 1.1, 0, TAU);
  context.fill();
  context.fillStyle = '#2c302b';
  context.beginPath();
  context.arc(5.1, -7.8, 0.5, 0, TAU);
  context.fill();
  context.restore();
};

const drawDog = (context: CanvasRenderingContext2D, game: GameState) => {
  const x = 330;
  const y = 534;
  const heardCall = game.callPulseUntil > game.elapsed && distance(game.player.x, game.player.y, x, y) < 300;
  const wag = Math.sin(game.worldTime * (heardCall ? 15 : 5)) * 0.65;
  drawSoftShadow(context, x + 1, y + 4, 17, 4.5, 0.25);
  context.save();
  context.translate(x, y);
  context.strokeStyle = '#563a2c';
  context.lineWidth = 3.1;
  context.lineCap = 'round';
  context.beginPath();
  context.moveTo(-9, -5);
  context.quadraticCurveTo(-15, -12 - wag * 4, -17, -8 - wag * 6);
  context.stroke();
  context.beginPath();
  context.ellipse(0, -5, 11, 7, 0.03, 0, TAU);
  fillAndStroke(context, '#775036', '#49362d', 1.1);
  context.beginPath();
  context.ellipse(9, -10, 6.2, 6.8, 0.2, 0, TAU);
  fillAndStroke(context, '#7f583a', '#49362d', 1);
  context.fillStyle = '#423129';
  context.beginPath();
  context.moveTo(5, -15);
  context.lineTo(4, -22);
  context.lineTo(9, -16);
  context.moveTo(11, -16);
  context.lineTo(15, -21);
  context.lineTo(15, -13);
  context.fill();
  context.fillStyle = '#222b28';
  context.beginPath();
  context.arc(11, -11, 0.65, 0, TAU);
  context.arc(15, -8, 1, 0, TAU);
  context.fill();
  drawLimb(context, [-5, -2, -6, 3, -6, 7], '#5e4332', 2.1);
  drawLimb(context, [5, -1, 6, 3, 7, 7], '#5e4332', 2.1);
  if (heardCall) {
    context.strokeStyle = '#f1d992';
    context.lineWidth = 1.4;
    context.beginPath();
    context.moveTo(18, -15);
    context.lineTo(22, -19);
    context.moveTo(20, -11);
    context.lineTo(25, -12);
    context.stroke();
  }
  context.restore();
};

const drawBuffalo = (context: CanvasRenderingContext2D, game: GameState) => {
  const x = 888;
  const y = 585;
  const chew = Math.sin(game.worldTime * 2.2) * 1.2;
  drawSoftShadow(context, x + 3, y + 9, 38, 7, 0.3);
  context.save();
  context.translate(x, y);
  context.beginPath();
  context.moveTo(-28, -10);
  context.quadraticCurveTo(-20, -26, 6, -24);
  context.quadraticCurveTo(24, -22, 25, -7);
  context.quadraticCurveTo(23, 5, 5, 7);
  context.quadraticCurveTo(-17, 8, -27, -2);
  context.closePath();
  const hide = context.createLinearGradient(-20, -24, 18, 8);
  hide.addColorStop(0, '#5b5a50');
  hide.addColorStop(1, '#373f3a');
  fillAndStroke(context, hide, '#28332f', 1.5);
  context.beginPath();
  context.ellipse(25, -10, 12, 10, 0.14, 0, TAU);
  fillAndStroke(context, '#4b4c45', '#28332f', 1.3);
  [-17, 7, 20].forEach((leg, index) => drawLimb(context, [leg, 1, leg + (index - 1), 8, leg + (index - 1), 15], '#363c38', 3.8));
  context.strokeStyle = '#d9c693';
  context.lineWidth = 2.7;
  context.lineCap = 'round';
  context.beginPath();
  context.moveTo(19, -17);
  context.quadraticCurveTo(11, -25, 8, -29);
  context.moveTo(29, -18);
  context.quadraticCurveTo(39, -24, 42, -29);
  context.stroke();
  context.fillStyle = '#202826';
  context.beginPath();
  context.arc(29, -12, 0.85, 0, TAU);
  context.ellipse(35, -7 + chew, 2.4, 1.2, 0.1, 0, TAU);
  context.fill();
  context.strokeStyle = '#303632';
  context.lineWidth = 1.8;
  context.beginPath();
  context.moveTo(-27, -14);
  context.quadraticCurveTo(-34, -19, -35, -12);
  context.stroke();
  context.restore();
};

const drawChickens = (context: CanvasRenderingContext2D, game: GameState) => {
  const panicking = game.chicken.panicUntil > game.elapsed;
  const progress = panicking ? (game.elapsed - game.chicken.panicStartedAt) / 4.3 : 0;
  const count = panicking ? (game.quality === 'low' ? 18 : 34) : 4;
  const time = game.powerUntil.coffee > game.elapsed ? game.worldTime * 0.2 : game.worldTime;
  for (let index = 0; index < count; index += 1) {
    const row = index % 6;
    const x = panicking ? 710 + progress * 720 + (index % 7) * 17 : 744 + index * 13;
    const y = panicking ? 414 + row * 15 + Math.sin(time * 12 + index) * 6 : 448 + (index % 2) * 12;
    drawChicken(context, x, y, index % 2 ? '#e7bd63' : '#bd613b');
  }
};

const drawHaNu = (context: CanvasRenderingContext2D, game: GameState) => {
  const { x, y } = game.hanu;
  const slow = game.powerUntil.coffee > game.elapsed ? 0.22 : 1;
  const gait = game.worldTime * 5 * slow;
  const bob = Math.abs(Math.sin(gait)) * -1.8;
  const step = Math.sin(gait) * 2.2;
  context.save();
  context.translate(x, y + bob);
  context.rotate(-0.035 + Math.sin(gait * 0.5) * 0.015);
  drawSoftShadow(context, 1, 10, 14, 4.5, 0.3);

  drawLimb(context, [-5, 1, -6.5, 6, -7 - step * 0.35, 11], '#37423b', 4.2);
  drawLimb(context, [5, 1, 6.5, 6, 7 + step * 0.35, 11], '#37423b', 4.2);
  context.strokeStyle = '#d9c7a0';
  context.lineWidth = 2.4;
  context.beginPath();
  context.moveTo(-10 - step * 0.35, 11.5);
  context.lineTo(-4 - step * 0.35, 11.5);
  context.moveTo(4 + step * 0.35, 11.5);
  context.lineTo(10 + step * 0.35, 11.5);
  context.stroke();

  context.beginPath();
  context.moveTo(-10, -14);
  context.quadraticCurveTo(-13, -6, -10, 2);
  context.quadraticCurveTo(0, 7, 10, 2);
  context.quadraticCurveTo(13, -7, 9, -14);
  context.quadraticCurveTo(4, -18, 0, -15);
  context.quadraticCurveTo(-4, -18, -10, -14);
  context.closePath();
  fillAndStroke(context, '#f0ead9', '#2d3833', 1.35);
  context.strokeStyle = '#c7bda9';
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(-4.5, -15);
  context.quadraticCurveTo(0, -10, 4.5, -15);
  context.stroke();
  context.beginPath();
  context.moveTo(-10.5, -1);
  context.quadraticCurveTo(0, 3, 10.5, -1);
  context.lineTo(9, 5);
  context.quadraticCurveTo(0, 8, -9, 5);
  context.closePath();
  fillAndStroke(context, '#4b6260', ART_INK, 1);

  context.fillStyle = '#c9906b';
  context.beginPath();
  context.ellipse(-0.4, -22, 6.7, 7.5, 0.13, 0, TAU);
  context.fill();
  context.strokeStyle = ART_INK;
  context.lineWidth = 1.25;
  context.stroke();
  context.fillStyle = '#302c2c';
  context.beginPath();
  context.moveTo(-6.5, -23.5);
  context.quadraticCurveTo(-4, -31, 2, -30);
  context.quadraticCurveTo(7, -29, 6.1, -23);
  context.quadraticCurveTo(2, -26, -1, -25);
  context.quadraticCurveTo(-3, -23, -6.5, -23.5);
  context.fill();
  context.fillStyle = '#2b302e';
  context.beginPath();
  context.ellipse(-2.3, -21.4, 0.8, 1.05, 0, 0, TAU);
  context.ellipse(2.1, -20.7, 0.8, 1.05, 0, 0, TAU);
  context.fill();
  context.strokeStyle = '#6e4939';
  context.lineWidth = 0.8;
  context.beginPath();
  context.arc(0.4, -17.8, 2.2, 0.18, Math.PI - 0.2);
  context.stroke();

  drawLimb(context, [8, -11, 12, -9, 12.5, -4], '#c9906b', 3.1);
  drawLimb(context, [-8, -11, -11, -4, -7, 1], '#c9906b', 3.1);
  context.save();
  context.translate(13, -8);
  context.rotate(0.12);
  context.beginPath();
  context.roundRect(-3.1, -8, 6.2, 11, 1.4);
  fillAndStroke(context, '#78c6a7', '#172421', 1.1);
  context.fillStyle = '#18312d';
  context.beginPath();
  context.roundRect(-1.9, -6.4, 3.8, 6.5, 0.6);
  context.fill();
  context.fillStyle = 'rgba(239, 255, 222, .75)';
  context.beginPath();
  context.arc(0.8, -5.1, 0.55, 0, TAU);
  context.fill();
  context.restore();
  context.restore();
};

const drawHeeSun = (context: CanvasRenderingContext2D, game: GameState) => {
  const { x, y, scale, mode } = game.heesun;
  const chasing = mode === 'chasing' || mode === 'distracted';
  const run = game.worldTime * (chasing ? 8.4 : 2.1);
  const bob = chasing ? Math.abs(Math.sin(run)) * -3.1 : Math.sin(run) * 0.7;
  const squash = chasing ? 1 + Math.sin(run * 2) * 0.035 : 1 + Math.sin(run) * 0.012;
  const reach = chasing ? 8 + Math.abs(Math.sin(run * 0.5)) * 6 : 0;
  context.save();
  context.translate(x, y + bob);
  context.scale(scale * squash, scale / squash);
  context.rotate(chasing ? Math.sin(run) * 0.055 : 0);
  drawSoftShadow(context, 1, 12, 19, 5.5, 0.34);

  const stride = chasing ? Math.sin(run) * 3.6 : 0;
  drawLimb(context, [-7, 1, -9, 7, -9 - stride, 13], '#333b35', 5);
  drawLimb(context, [7, 1, 9, 7, 9 + stride, 13], '#333b35', 5);
  context.strokeStyle = '#d5b57a';
  context.lineWidth = 2.8;
  context.beginPath();
  context.moveTo(-14 - stride, 13.5);
  context.lineTo(-5 - stride, 13.5);
  context.moveTo(5 + stride, 13.5);
  context.lineTo(14 + stride, 13.5);
  context.stroke();

  context.beginPath();
  context.moveTo(-15, -20);
  context.bezierCurveTo(-23, -13, -22, 1, -13, 6);
  context.bezierCurveTo(-6, 11, 8, 11, 16, 5);
  context.bezierCurveTo(24, -3, 22, -15, 14, -21);
  context.quadraticCurveTo(0, -27, -15, -20);
  context.closePath();
  const shirt = context.createLinearGradient(-17, -20, 18, 7);
  shirt.addColorStop(0, '#b64e3c');
  shirt.addColorStop(1, '#7d3435');
  fillAndStroke(context, shirt, '#362e2b', 1.65);
  context.save();
  context.clip();
  context.strokeStyle = '#e2bc59';
  context.lineWidth = 2.4;
  for (let stripe = -14; stripe <= 14; stripe += 7) {
    context.beginPath();
    context.moveTo(stripe, -23);
    context.quadraticCurveTo(stripe + 2, -7, stripe, 9);
    context.stroke();
  }
  context.restore();

  const armY = -14;
  if (chasing) {
    drawLimb(context, [-14, armY, -23 - reach * 0.45, -8, -27 - reach, -3], '#cb916a', 4.2);
    drawLimb(context, [14, armY, 23 + reach * 0.45, -10, 27 + reach, -5], '#cb916a', 4.2);
    context.fillStyle = '#cb916a';
    context.beginPath();
    context.arc(-28 - reach, -3, 3.5, 0, TAU);
    context.arc(28 + reach, -5, 3.5, 0, TAU);
    context.fill();
    context.strokeStyle = ART_INK;
    context.lineWidth = 1;
    context.stroke();
  } else {
    drawLimb(context, [-14, armY, -19, -5, -14, 2], '#cb916a', 4);
    drawLimb(context, [14, armY, 19, -5, 14, 2], '#cb916a', 4);
  }

  context.fillStyle = '#cf956e';
  context.beginPath();
  context.ellipse(0, -30.5, 9.5, 10.2, 0.02, 0, TAU);
  context.fill();
  context.strokeStyle = ART_INK;
  context.lineWidth = 1.5;
  context.stroke();

  context.fillStyle = '#2c2828';
  context.beginPath();
  context.ellipse(0, -38, 9.4, 5.2, 0, Math.PI, TAU);
  context.fill();
  const curls = [
    [-7.4, -37.4], [-4.3, -40.2], [-0.7, -41], [3.1, -40.5], [6.6, -38.2],
    [-6, -35.3], [-2.2, -37.2], [1.7, -37.4], [5.2, -35.4],
  ] as const;
  curls.forEach(([curlX, curlY], index) => {
    context.fillStyle = index % 2 ? '#342d2d' : '#241f20';
    context.beginPath();
    context.arc(curlX, curlY, 2.15, 0, TAU);
    context.fill();
    context.strokeStyle = '#171718';
    context.lineWidth = 0.55;
    context.stroke();
  });

  context.fillStyle = '#252a28';
  context.beginPath();
  context.ellipse(-3.4, -30.6, 1.05, 1.3, -0.2, 0, TAU);
  context.ellipse(3.6, -30.3, 1.05, 1.3, 0.2, 0, TAU);
  context.fill();
  context.strokeStyle = '#733e36';
  context.lineWidth = 1;
  context.beginPath();
  context.arc(0.3, -25.8, chasing ? 4.7 : 4.1, 0.1, Math.PI - 0.08);
  context.stroke();
  context.fillStyle = '#fff2cc';
  context.beginPath();
  context.ellipse(0.3, -24.8, chasing ? 3.9 : 3.1, chasing ? 1.8 : 1.25, 0, 0, TAU);
  context.fill();
  context.restore();
};

const drawPlayer = (context: CanvasRenderingContext2D, game: GameState) => {
  const { player } = game;
  const scale = game.powerUntil.squash > game.elapsed ? 1.42 : 1;
  const moving = Math.hypot(player.vx, player.vy) > 5;
  const bob = moving ? Math.abs(Math.sin(player.walk)) * -1.7 : Math.sin(game.worldTime * 1.8) * 0.25;
  const step = moving ? Math.sin(player.walk) * 2.2 : 0;
  const side = Math.abs(player.facingX) > 0.35 ? Math.sign(player.facingX) : 0;
  context.save();
  context.translate(player.x, player.y + bob);
  context.scale(scale, scale);
  context.rotate(moving ? Math.sin(player.walk) * 0.025 : 0);
  drawSoftShadow(context, 1, 9, 12, 4, 0.29);
  drawLimb(context, [-3.6, 1, -4.5, 5, -5 - step, 10], '#394a42', 3.4);
  drawLimb(context, [3.6, 1, 4.5, 5, 5 + step, 10], '#394a42', 3.4);
  context.strokeStyle = '#d8c69b';
  context.lineWidth = 2.2;
  context.beginPath();
  context.moveTo(-8 - step, 10.4);
  context.lineTo(-3 - step, 10.4);
  context.moveTo(3 + step, 10.4);
  context.lineTo(8 + step, 10.4);
  context.stroke();
  context.beginPath();
  context.moveTo(-7, -10);
  context.quadraticCurveTo(-10, -2, -7, 3);
  context.quadraticCurveTo(0, 7, 7, 3);
  context.quadraticCurveTo(10, -3, 7, -10);
  context.closePath();
  fillAndStroke(context, '#d8c38c', ART_INK, 1.2);
  context.strokeStyle = '#425950';
  context.lineWidth = 3.4;
  context.lineCap = 'round';
  context.beginPath();
  context.moveTo(-6.5, -7);
  context.quadraticCurveTo(-10, -1, -8, 4);
  context.moveTo(6.5, -7);
  context.quadraticCurveTo(10, -1, 8, 4);
  context.stroke();
  context.fillStyle = '#d0a078';
  context.beginPath();
  context.ellipse(side * 0.8, -16.2, 5.3, 6.1, side * 0.08, 0, TAU);
  context.fill();
  context.strokeStyle = ART_INK;
  context.lineWidth = 1.1;
  context.stroke();
  context.fillStyle = '#332f2d';
  context.beginPath();
  context.arc(side * 0.8, -18, 5.2, Math.PI * 1.03, Math.PI * 1.96);
  context.fill();
  context.fillStyle = '#62744a';
  context.beginPath();
  context.ellipse(0, -22.1, 8.2, 2.6, -0.05, 0, TAU);
  context.ellipse(0, -24.4, 5.2, 3.2, 0, Math.PI, TAU);
  context.fill();
  context.strokeStyle = '#374435';
  context.lineWidth = 0.9;
  context.stroke();
  context.fillStyle = '#d9bd67';
  context.beginPath();
  context.arc(1, -24.1, 1.05, 0, TAU);
  context.fill();
  context.fillStyle = '#26302d';
  context.beginPath();
  context.arc(-1.6 + side, -16.1, 0.65, 0, TAU);
  context.arc(2.2 + side, -16, 0.65, 0, TAU);
  context.fill();
  context.restore();
};

const drawOcop = (context: CanvasRenderingContext2D, game: GameState) => {
  OCOP_ITEMS.forEach((item) => {
    if (game.triggered.has(`ocop-${item.kind}`) || !inView(game, item.x, item.y, 40)) return;
    const bob = Math.sin(game.worldTime * 2 + item.x) * 2;
    context.save();
    context.translate(item.x, item.y + bob);
    drawSoftShadow(context, 1, 8, 13, 3.5, 0.24);
    if (item.kind === 'squash') {
      context.beginPath();
      context.ellipse(0, 0, 11, 7.5, -0.12, 0, TAU);
      const squash = context.createLinearGradient(-9, -5, 9, 5);
      squash.addColorStop(0, '#b7d86a');
      squash.addColorStop(1, '#6c9c48');
      fillAndStroke(context, squash, '#315b38', 1.1);
      context.strokeStyle = 'rgba(231, 244, 165, .65)';
      context.lineWidth = 1.2;
      context.beginPath();
      context.arc(-1, -1, 7, Math.PI * 1.1, Math.PI * 1.75);
      context.stroke();
      context.strokeStyle = '#3b6b3d';
      context.lineWidth = 1.7;
      context.beginPath();
      context.moveTo(-1, -7);
      context.quadraticCurveTo(1, -10, 4, -10);
      context.stroke();
    } else if (item.kind === 'coffee') {
      context.beginPath();
      context.roundRect(-9, -6, 15, 13, [2, 2, 5, 5]);
      fillAndStroke(context, '#eee0b8', '#5e4838', 1.1);
      context.strokeStyle = '#6c3d2e';
      context.lineWidth = 2;
      context.beginPath();
      context.arc(6, 0, 4.3, -Math.PI / 2, Math.PI / 2);
      context.stroke();
      context.fillStyle = '#5c352c';
      context.beginPath();
      context.ellipse(-1.5, -4.5, 5.2, 1.4, 0, 0, TAU);
      context.fill();
      context.fillStyle = '#c25842';
      [-4, 1.5].forEach((berryX, index) => {
        context.beginPath();
        context.arc(berryX, -9 - index, 2, 0, TAU);
        context.fill();
      });
      context.strokeStyle = 'rgba(242, 235, 203, .65)';
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(-3, -11);
      context.quadraticCurveTo(-5, -12, -3, -16);
      context.moveTo(1, -11);
      context.quadraticCurveTo(3, -14, 1, -17);
      context.stroke();
    } else {
      [[-4.5, 0, -0.25], [4, -1.5, 0.24]].forEach(([nutX, nutY, angle]) => {
        context.save();
        context.translate(nutX, nutY);
        context.rotate(angle);
        context.beginPath();
        context.ellipse(0, 0, 4.6, 6.1, 0, 0, TAU);
        fillAndStroke(context, '#d8b86f', '#674b32', 1);
        context.strokeStyle = '#8a6138';
        context.lineWidth = 0.9;
        context.beginPath();
        context.moveTo(0, -4.6);
        context.quadraticCurveTo(-1.2, 0, 0, 4.7);
        context.stroke();
        context.restore();
      });
    }
    context.restore();
  });
};

const drawGate = (context: CanvasRenderingContext2D, game: GameState) => {
  const x = 805;
  const y = 447;
  drawSoftShadow(context, x, y + 21, 40, 5, 0.22);
  context.strokeStyle = '#5a412d';
  context.lineWidth = 5;
  context.lineCap = 'round';
  context.beginPath();
  context.moveTo(x - 34, y - 20);
  context.lineTo(x - 34, y + 23);
  context.moveTo(x + 34, y - 20);
  context.lineTo(x + 34, y + 23);
  context.stroke();
  context.save();
  context.translate(x - 31, y - 16);
  if (game.gateOpen) context.rotate(-0.9);
  context.strokeStyle = '#9d7043';
  context.lineWidth = 4;
  context.beginPath();
  context.moveTo(0, 2);
  context.quadraticCurveTo(31, -1, 62, 2);
  context.moveTo(0, 17);
  context.quadraticCurveTo(31, 14, 62, 17);
  for (let bar = 0; bar <= 56; bar += 14) {
    context.moveTo(bar, -1);
    context.lineTo(bar + 1.5, 22);
  }
  context.stroke();
  context.restore();
};

const drawDomino = (context: CanvasRenderingContext2D, game: GameState) => {
  const age = game.dominoStartedAt > 0 ? game.elapsed - game.dominoStartedAt : 0;
  for (let index = 0; index < 5; index += 1) {
    const progress = clamp(age * 2.2 - index * 0.32, 0, 1);
    context.save();
    context.translate(1_275 + index * 18, 408 + index * 2);
    context.rotate(progress * 1.2);
    context.beginPath();
    context.roundRect(-7, -12, 14, 18, 2);
    fillAndStroke(context, index % 2 ? '#825239' : '#9c6841', '#4e392d', 1);
    context.strokeStyle = '#d2a35c';
    context.lineWidth = 1.2;
    context.beginPath();
    context.moveTo(-5, -8);
    context.quadraticCurveTo(0, -10, 5, -8);
    context.stroke();
    context.restore();
  }
};

const drawExit = (context: CanvasRenderingContext2D, game: GameState) => {
  const x = WORLD_WIDTH - 62;
  const y = 452;
  context.strokeStyle = '#5b422e';
  context.lineWidth = 4.5;
  context.beginPath();
  context.moveTo(x, y - 36);
  context.lineTo(x, y + 18);
  context.stroke();
  context.beginPath();
  context.roundRect(x - 35, y - 42, 70, 24, [4, 2, 5, 3]);
  fillAndStroke(context, '#e3c878', '#5b422e', 1.4);
  context.fillStyle = '#2c493e';
  context.font = '900 8px "Be Vietnam Pro", sans-serif';
  context.textAlign = 'center';
  context.fillText('LỐI RA →', x + 1, y - 25);
  if (game.absurdityLevel >= 2) {
    context.beginPath();
    context.roundRect(x - 18, y - 68, 38, 17, 3);
    fillAndStroke(context, '#e3c878', '#5b422e', 1.1);
    context.fillStyle = '#2c493e';
    context.font = '800 6px "Be Vietnam Pro", sans-serif';
    context.fillText('CHẮC VẬY', x + 1, y - 56);
  }
};

const drawWrongVillagers = (context: CanvasRenderingContext2D, game: GameState) => {
  if (game.absurdityLevel < 1) return;
  const positions = [
    { x: 480, y: 706, color: '#7d4054' },
    { x: 985, y: 188, color: '#315c63' },
    { x: 1_146, y: 590, color: '#8d5a3d' },
  ];
  positions.slice(0, game.absurdityLevel).forEach((person, index) => {
    const bob = Math.sin(game.worldTime * 2 + index) * 0.7;
    context.save();
    context.translate(person.x, person.y + bob);
    drawSoftShadow(context, 0, 7, 9, 3, 0.2);
    drawLimb(context, [-3, 2, -4, 6, -4, 10], '#343a36', 2.6);
    drawLimb(context, [3, 2, 4, 6, 4, 10], '#343a36', 2.6);
    context.beginPath();
    context.moveTo(-5.5, -8);
    context.quadraticCurveTo(-8, -1, -5, 4);
    context.quadraticCurveTo(0, 7, 5.5, 4);
    context.quadraticCurveTo(8, -2, 5, -8);
    context.closePath();
    fillAndStroke(context, person.color, ART_INK, 1);
    context.fillStyle = '#c68c66';
    context.beginPath();
    context.ellipse(0, -13, 4, 4.7, index % 2 ? 0.15 : -0.1, 0, TAU);
    context.fill();
    context.strokeStyle = ART_INK;
    context.lineWidth = 0.9;
    context.stroke();
    context.fillStyle = '#2f2929';
    context.beginPath();
    context.arc(0, -14.5, 4, Math.PI, TAU);
    context.fill();
    context.restore();
  });
};

const drawParticles = (context: CanvasRenderingContext2D, game: GameState) => {
  game.particles.forEach((particle) => {
    context.globalAlpha = clamp(particle.life / particle.maxLife, 0, 1);
    context.fillStyle = particle.color;
    if (particle.kind === 'note') {
      context.strokeStyle = particle.color;
      context.lineWidth = 1.2;
      context.beginPath();
      context.moveTo(particle.x, particle.y + 3);
      context.lineTo(particle.x, particle.y - 2);
      context.quadraticCurveTo(particle.x + 3, particle.y - 3, particle.x + 3.5, particle.y - 1);
      context.stroke();
      context.beginPath();
      context.arc(particle.x - 1, particle.y + 3, 1.5, 0, TAU);
      context.fill();
    } else if (particle.kind === 'leaf') {
      drawLeaf(context, particle.x, particle.y, particle.size + 1.8, Math.max(0.8, particle.size * 0.55), particle.vx * 0.03, particle.color);
    } else {
      context.beginPath();
      context.ellipse(particle.x, particle.y, particle.size * 0.85, particle.size * 0.55, particle.vx * 0.02, 0, TAU);
      context.fill();
    }
  });
  context.globalAlpha = 1;
};

const drawCallWave = (context: CanvasRenderingContext2D, game: GameState) => {
  if (game.callPulseUntil <= game.elapsed) return;
  const progress = 1 - (game.callPulseUntil - game.elapsed) / 1.05;
  const radius = 14 + progress * 120;
  context.strokeStyle = `rgba(255, 224, 118, ${(0.82 * (1 - progress)).toFixed(3)})`;
  context.lineWidth = 3;
  context.beginPath();
  context.arc(game.player.x, game.player.y - 6, radius, 0, Math.PI * 2);
  context.stroke();
  context.strokeStyle = `rgba(255, 246, 194, ${(0.48 * (1 - progress)).toFixed(3)})`;
  context.lineWidth = 1;
  context.beginPath();
  context.arc(game.player.x, game.player.y - 6, radius + 8, 0, Math.PI * 2);
  context.stroke();
};

const drawAtmosphere = (context: CanvasRenderingContext2D, game: GameState) => {
  context.save();
  const light = context.createRadialGradient(VIEW_WIDTH * 0.76, -12, 8, VIEW_WIDTH * 0.72, 24, 245);
  light.addColorStop(0, 'rgba(255, 236, 169, .2)');
  light.addColorStop(0.48, 'rgba(255, 221, 139, .055)');
  light.addColorStop(1, 'rgba(255, 221, 139, 0)');
  context.fillStyle = light;
  context.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);

  if (game.quality === 'high') {
    context.globalAlpha = 0.055;
    for (let index = 0; index < 46; index += 1) {
      const x = hash2(index, 19) * VIEW_WIDTH;
      const y = hash2(7, index * 1.7) * VIEW_HEIGHT;
      context.fillStyle = index % 3 ? '#fff1bd' : '#294d3c';
      context.beginPath();
      context.arc(x, y, 0.35 + hash2(index, 3) * 0.45, 0, TAU);
      context.fill();
    }
  }

  const breeze = game.reducedMotion ? 0 : Math.sin(game.worldTime * 0.7) * 2.2;
  context.strokeStyle = 'rgba(35, 63, 42, .68)';
  context.lineWidth = 3.4;
  context.lineCap = 'round';
  context.beginPath();
  context.moveTo(-8, 40);
  context.quadraticCurveTo(25 + breeze, 22, 58 + breeze, -8);
  context.moveTo(VIEW_WIDTH + 7, VIEW_HEIGHT - 35);
  context.quadraticCurveTo(VIEW_WIDTH - 21 - breeze, VIEW_HEIGHT - 18, VIEW_WIDTH - 48 - breeze, VIEW_HEIGHT + 8);
  context.stroke();
  ([
    [8, 31, -0.55, '#315e3f'], [22, 24, -0.3, '#477846'], [38, 12, -0.65, '#6b944e'],
    [VIEW_WIDTH - 8, VIEW_HEIGHT - 28, 2.7, '#315e3f'], [VIEW_WIDTH - 25, VIEW_HEIGHT - 17, 2.9, '#557f48'],
  ] as const).forEach(([x, y, angle, color]) => drawLeaf(context, x, y, 10, 3.7, angle, color));

  const vignette = context.createRadialGradient(VIEW_WIDTH / 2, VIEW_HEIGHT * 0.47, VIEW_HEIGHT * 0.2, VIEW_WIDTH / 2, VIEW_HEIGHT * 0.48, VIEW_WIDTH * 0.63);
  vignette.addColorStop(0, 'rgba(20, 39, 31, 0)');
  vignette.addColorStop(0.73, 'rgba(20, 39, 31, .03)');
  vignette.addColorStop(1, 'rgba(13, 30, 24, .2)');
  context.fillStyle = vignette;
  context.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
  context.restore();
};

const drawCaptureScene = (context: CanvasRenderingContext2D, game: GameState) => {
  const age = game.elapsed - game.scene.startedAt;
  const night = context.createLinearGradient(0, 0, 0, VIEW_HEIGHT);
  night.addColorStop(0, age >= 4.35 ? '#111817' : '#3c4b42');
  night.addColorStop(1, age >= 4.35 ? '#171e1c' : '#72805a');
  context.fillStyle = night;
  context.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
  if (age < 1.45 || age >= 4.35) return;
  const earth = context.createLinearGradient(0, 120, 0, VIEW_HEIGHT);
  earth.addColorStop(0, '#77875d');
  earth.addColorStop(1, '#4d6846');
  context.fillStyle = earth;
  context.fillRect(0, 121, VIEW_WIDTH, 149);
  context.fillStyle = '#2f4d40';
  context.beginPath();
  context.moveTo(0, 139);
  context.bezierCurveTo(48, 130, 71, 72, 112, 79);
  context.bezierCurveTo(158, 87, 175, 132, 218, 122);
  context.bezierCurveTo(265, 111, 278, 58, 326, 64);
  context.bezierCurveTo(381, 71, 401, 132, VIEW_WIDTH, 119);
  context.lineTo(VIEW_WIDTH, 152);
  context.lineTo(0, 152);
  context.closePath();
  context.fill();
  const fakeGame = { ...game, feast: { ...game.feast, x: 240, y: 172 } };
  drawFeast(context, fakeGame);
  const fakePlayer = {
    ...game,
    player: { ...game.player, x: 206, y: 201, vx: 0, vy: 0, facingX: 1, facingY: 0 },
    powerUntil: { ...game.powerUntil, squash: 0 },
  };
  drawPlayer(context, fakePlayer);
  context.strokeStyle = '#2a312e';
  context.lineWidth = 1.1;
  context.beginPath();
  context.moveTo(202, 184);
  context.lineTo(205, 185);
  context.moveTo(208, 185);
  context.lineTo(211, 184);
  context.stroke();
  const fakeHeeSun = { ...game, heesun: { ...game.heesun, x: 281, y: 199, scale: 1.18, mode: 'drinking' as HeeSunMode } };
  drawHeeSun(context, fakeHeeSun);
  context.fillStyle = 'rgba(33, 29, 29, .24)';
  context.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
};

export const renderGame = (context: CanvasRenderingContext2D, game: GameState) => {
  context.save();
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.imageSmoothingEnabled = true;
  context.clearRect(0, 0, RENDER_WIDTH, RENDER_HEIGHT);
  context.scale(RENDER_SCALE, RENDER_SCALE);
  if (game.scene.kind === 'capture') {
    drawCaptureScene(context, game);
    drawAtmosphere(context, game);
    context.restore();
    return;
  }
  const shaking = !game.reducedMotion && game.shakeUntil > game.elapsed;
  const shakeX = shaking ? Math.sin(game.worldTime * 91) * 1.4 : 0;
  const shakeY = shaking ? Math.cos(game.worldTime * 77) * 0.9 : 0;
  context.save();
  context.translate(-Math.round(game.cameraX) + shakeX, -Math.round(game.cameraY) + shakeY);
  drawGround(context, game);
  drawMountains(context);
  drawFields(context, game);
  drawRoads(context);
  drawRiver(context, game);
  drawBridge(context, 438);
  drawBridge(context, 695);
  drawScenery(context, game);
  drawVillageDetails(context, game);
  drawWaterwheel(context, game);
  drawFish(context, game);
  drawStreamGroup(context, game);
  drawGate(context, game);
  drawDomino(context, game);
  drawExit(context, game);

  const drawables: Array<{ y: number; draw: () => void }> = [];
  HOUSES.forEach((house, index) => {
    if (inView(game, house.x + house.width / 2, house.y + 35, 100)) {
      drawables.push({ y: house.y + 82, draw: () => drawStiltHouse(context, house, index, game.worldTime) });
    }
  });
  drawables.push(
    { y: game.feast.y + 40, draw: () => drawFeast(context, game) },
    { y: 270, draw: () => drawChief(context, game) },
    { y: 490, draw: () => drawChickens(context, game) },
    { y: 534, draw: () => drawDog(context, game) },
    { y: 585, draw: () => drawBuffalo(context, game) },
    { y: game.hanu.y, draw: () => drawHaNu(context, game) },
    { y: game.heesun.y, draw: () => drawHeeSun(context, game) },
    { y: game.player.y, draw: () => drawPlayer(context, game) },
  );
  drawables.sort((first, second) => first.y - second.y).forEach((item) => item.draw());
  drawWrongVillagers(context, game);
  drawOcop(context, game);
  drawCallWave(context, game);
  drawParticles(context, game);
  context.restore();

  drawAtmosphere(context, game);

  const chiefAge = game.leaderStartedAt === 0 ? 0 : game.elapsed - game.leaderStartedAt;
  if (chiefAge > 1.4) {
    const sunset = clamp(chiefAge / 15, 0, 1);
    context.fillStyle = `rgba(73, 55, 76, ${(sunset * 0.2).toFixed(3)})`;
    context.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
    context.fillStyle = `rgba(238, 133, 76, ${(sunset * 0.13).toFixed(3)})`;
    context.fillRect(0, 0, VIEW_WIDTH, 92);
  }
  if (game.powerUntil.coffee > game.elapsed) {
    context.fillStyle = 'rgba(236, 176, 91, .08)';
    context.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
  }
  if (game.absurdityLevel >= 3) {
    context.fillStyle = `rgba(219, 103, 73, ${(0.025 + Math.sin(game.worldTime * 0.7) * 0.008).toFixed(3)})`;
    context.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
  }
  context.restore();
};
