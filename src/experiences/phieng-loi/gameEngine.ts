export const VIEW_WIDTH = 480;
export const VIEW_HEIGHT = 270;
export const WORLD_WIDTH = 1_680;
export const WORLD_HEIGHT = 920;

const PLAYER_START_X = 92;
const PLAYER_START_Y = 486;
const PLAYER_SPEED = 67;
const CAMERA_VERTICAL_ANCHOR = 0.58;
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
    const angle = Math.atan2(targetY - game.heesun.y, targetX - game.heesun.x);
    game.heesun.x += Math.cos(angle) * 49 * dt;
    game.heesun.y += Math.sin(angle) * 49 * dt;
    if (game.elapsed >= game.heesun.modeUntil) game.heesun.mode = 'chasing';
    return;
  }
  if (game.heesun.mode !== 'chasing' || game.scene.kind === 'stream' || game.scene.kind === 'capture') return;
  const angle = Math.atan2(game.player.y - game.heesun.y, game.player.x - game.heesun.x);
  const boost = game.heesun.speedBoostUntil > game.elapsed ? 1.3 : 1;
  const speed = (game.absurdityLevel >= 3 ? 58 : 53) * boost;
  game.heesun.x += Math.cos(angle) * speed * dt;
  game.heesun.y += Math.sin(angle) * speed * dt;
  if (distance(game.player.x, game.player.y, game.heesun.x, game.heesun.y) < 17 * Math.max(1, game.heesun.scale * 0.8)) startCapture(game, events);
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

const drawGround = (context: CanvasRenderingContext2D, game: GameState) => {
  context.fillStyle = '#748c54';
  context.fillRect(game.cameraX - 2, game.cameraY - 2, VIEW_WIDTH + 4, VIEW_HEIGHT + 4);
  const startX = Math.floor(game.cameraX / 16) * 16;
  const startY = Math.floor(game.cameraY / 16) * 16;
  for (let y = startY; y < game.cameraY + VIEW_HEIGHT + 16; y += 16) {
    for (let x = startX; x < game.cameraX + VIEW_WIDTH + 16; x += 16) {
      const value = hash2(x / 16, y / 16);
      context.fillStyle = value > 0.72 ? '#7f985b' : value < 0.19 ? '#647c4d' : '#748c54';
      context.fillRect(x, y, 16, 16);
      if (game.quality === 'high' && value > 0.62) {
        context.fillStyle = value > 0.86 ? '#d1bd63' : '#496d43';
        context.fillRect(x + 5 + Math.floor(value * 5), y + 5, 1, 3);
      }
    }
  }
};

const drawMountains = (context: CanvasRenderingContext2D) => {
  context.fillStyle = '#344f43';
  context.beginPath();
  context.moveTo(0, 145);
  context.lineTo(100, 80);
  context.lineTo(205, 132);
  context.lineTo(350, 48);
  context.lineTo(470, 118);
  context.lineTo(640, 35);
  context.lineTo(790, 126);
  context.lineTo(935, 64);
  context.lineTo(1_090, 133);
  context.lineTo(1_260, 42);
  context.lineTo(1_430, 116);
  context.lineTo(WORLD_WIDTH, 56);
  context.lineTo(WORLD_WIDTH, 180);
  context.lineTo(0, 180);
  context.closePath();
  context.fill();
  context.fillStyle = '#516b4d';
  context.beginPath();
  context.moveTo(0, 158);
  context.lineTo(145, 116);
  context.lineTo(285, 154);
  context.lineTo(460, 102);
  context.lineTo(630, 161);
  context.lineTo(790, 113);
  context.lineTo(1_015, 162);
  context.lineTo(1_225, 104);
  context.lineTo(1_455, 164);
  context.lineTo(WORLD_WIDTH, 120);
  context.lineTo(WORLD_WIDTH, 195);
  context.lineTo(0, 195);
  context.closePath();
  context.fill();
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
  paths.forEach((points) => {
    context.beginPath();
    points.forEach(([x, y], index) => index === 0 ? context.moveTo(x, y) : context.lineTo(x, y));
    context.strokeStyle = '#55694b';
    context.lineWidth = 24;
    context.stroke();
    context.strokeStyle = '#a99063';
    context.lineWidth = 18;
    context.stroke();
    context.strokeStyle = '#c5aa72';
    context.lineWidth = 11;
    context.stroke();
    context.strokeStyle = 'rgba(246, 215, 148, .36)';
    context.lineWidth = 2;
    context.stroke();
  });
};

const drawFields = (context: CanvasRenderingContext2D, game: GameState) => {
  context.fillStyle = '#735739';
  context.fillRect(390, 560, 265, 250);
  context.fillStyle = '#947344';
  for (let y = 575; y < 805; y += 25) context.fillRect(395, y, 255, 7);
  for (let y = 580; y < 800; y += 25) {
    for (let x = 407; x < 645; x += 18) {
      const sway = Math.round(Math.sin(game.worldTime * 1.6 + x * 0.04 + y) * 1);
      context.fillStyle = '#3f7241';
      context.fillRect(x + sway, y - 9, 2, 10);
      context.fillStyle = '#d2aa43';
      context.fillRect(x + 2 + sway, y - 7, 2, 5);
    }
  }
  context.fillStyle = '#6c7f45';
  context.beginPath();
  context.ellipse(940, 195, 260, 145, 0, 0, Math.PI * 2);
  context.fill();
  const colors = ['#99a857', '#b7b85c', '#cbb65c', '#879a50'];
  for (let index = 0; index < 8; index += 1) {
    context.strokeStyle = colors[index % colors.length];
    context.lineWidth = 8;
    context.beginPath();
    context.ellipse(940, 205 + index * 10, 238 - index * 24, 106 - index * 8, 0, Math.PI, Math.PI * 2);
    context.stroke();
  }
  context.fillStyle = '#806b43';
  context.fillRect(1_260, 480, 250, 210);
  for (let row = 0; row < 6; row += 1) {
    for (let column = 0; column < 8; column += 1) {
      const x = 1_278 + column * 29 + (row % 2) * 7;
      const y = 500 + row * 31;
      context.fillStyle = '#315a3b';
      context.fillRect(x - 7, y - 8, 14, 13);
      context.fillStyle = '#557a46';
      context.fillRect(x - 10, y - 4, 20, 6);
      context.fillStyle = '#ddc06f';
      context.fillRect(x - 4, y - 5, 2, 2);
      context.fillRect(x + 5, y, 2, 2);
    }
  }
};

const drawRiver = (context: CanvasRenderingContext2D, game: GameState) => {
  context.beginPath();
  for (let y = 120; y <= WORLD_HEIGHT + 40; y += 28) {
    const x = riverCenterX(y);
    if (y === 120) context.moveTo(x, y);
    else context.lineTo(x, y);
  }
  context.lineCap = 'round';
  context.strokeStyle = '#3d656a';
  context.lineWidth = 80;
  context.stroke();
  context.strokeStyle = '#69a1a3';
  context.lineWidth = 65;
  context.stroke();
  context.strokeStyle = '#8ac1b9';
  context.lineWidth = 43;
  context.stroke();
  const slowTime = game.powerUntil.coffee > game.elapsed ? game.worldTime * 0.22 : game.worldTime;
  const startY = Math.floor(game.cameraY / 22) * 22;
  for (let y = startY; y < game.cameraY + VIEW_HEIGHT + 30; y += 22) {
    const x = riverCenterX(y);
    const wave = Math.sin(slowTime * 1.8 + y * 0.07) * 6;
    context.fillStyle = 'rgba(224, 244, 221, .6)';
    context.fillRect(x - 17 + wave, y, 12, 1);
    context.fillRect(x + 5 - wave * 0.5, y + 9, 15, 1);
  }
};

const drawBridge = (context: CanvasRenderingContext2D, y: number) => {
  const x = riverCenterX(y);
  context.fillStyle = '#55402f';
  context.fillRect(x - 49, y - 14, 98, 28);
  context.fillStyle = '#ae7f4a';
  for (let offset = -44; offset <= 38; offset += 9) context.fillRect(x + offset, y - 12, 7, 24);
  context.fillStyle = '#e0b66e';
  context.fillRect(x - 49, y - 13, 98, 2);
  context.fillRect(x - 49, y + 11, 98, 2);
};

const drawTree = (context: CanvasRenderingContext2D, x: number, y: number, variant: number) => {
  context.fillStyle = 'rgba(31, 47, 34, .25)';
  context.fillRect(x - 8, y + 4, 21, 5);
  context.fillStyle = '#58422d';
  context.fillRect(x - 2, y - 11, 4, 20);
  context.fillStyle = variant % 2 ? '#315e3d' : '#3e6942';
  context.fillRect(x - 11, y - 25, 23, 16);
  context.fillRect(x - 7, y - 32, 15, 11);
  context.fillStyle = variant % 2 ? '#5b864a' : '#759451';
  context.fillRect(x - 8, y - 28, 9, 5);
  context.fillRect(x + 3, y - 20, 7, 5);
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
        context.fillStyle = chance > 0.86 ? '#d7c55e' : '#e19a79';
        context.fillRect(x, y - 2, 2, 2);
        context.fillStyle = '#4e7444';
        context.fillRect(x, y, 1, 3);
      }
    }
  }
};

const drawStiltHouse = (
  context: CanvasRenderingContext2D,
  house: { x: number; y: number; width: number; height: number },
  index: number,
  time: number,
) => {
  const { x, y, width } = house;
  context.fillStyle = 'rgba(35, 42, 31, .28)';
  context.fillRect(x - 8, y + 66, width + 20, 14);
  context.fillStyle = '#57422d';
  context.fillRect(x + 15, y + 44, 5, 36);
  context.fillRect(x + width - 20, y + 44, 5, 36);
  context.fillStyle = index % 2 ? '#9c6b45' : '#b0804e';
  context.fillRect(x + 5, y + 21, width - 10, 40);
  context.fillStyle = '#d3ad70';
  for (let line = x + 11; line < x + width - 9; line += 13) context.fillRect(line, y + 23, 2, 34);
  context.fillStyle = '#263d35';
  context.fillRect(x + width * 0.58, y + 34, 20, 27);
  context.fillStyle = '#302d28';
  context.beginPath();
  context.moveTo(x - 15, y + 22);
  context.lineTo(x + width / 2, y - 16);
  context.lineTo(x + width + 15, y + 22);
  context.closePath();
  context.fill();
  context.fillStyle = index % 2 ? '#6f7e50' : '#855143';
  context.beginPath();
  context.moveTo(x - 9, y + 19);
  context.lineTo(x + width / 2, y - 10);
  context.lineTo(x + width + 9, y + 19);
  context.closePath();
  context.fill();
  context.fillStyle = '#654a32';
  context.fillRect(x + width - 31, y + 57, 4, 28);
  context.fillRect(x + width - 6, y + 57, 4, 28);
  for (let step = 0; step < 4; step += 1) context.fillRect(x + width - 31, y + 61 + step * 6, 29, 2);
  const smoke = Math.sin(time * 1.2 + index) * 3;
  context.fillStyle = 'rgba(229, 224, 195, .45)';
  context.fillRect(x + 26 + smoke, y - 18, 5, 8);
  context.fillRect(x + 23 - smoke * 0.4, y - 28, 7, 7);
};

const drawWaterwheel = (context: CanvasRenderingContext2D, game: GameState) => {
  const x = 1_073;
  const y = 668;
  const time = game.powerUntil.coffee > game.elapsed ? game.worldTime * 0.22 : game.worldTime;
  context.save();
  context.translate(x, y);
  context.strokeStyle = '#68492f';
  context.lineWidth = 3;
  context.beginPath();
  context.arc(0, 0, 30, 0, Math.PI * 2);
  context.stroke();
  context.rotate(time * 0.45);
  for (let spoke = 0; spoke < 12; spoke += 1) {
    context.rotate(Math.PI / 6);
    context.fillStyle = '#c09356';
    context.fillRect(-2, -29, 4, 29);
    context.fillStyle = '#745039';
    context.fillRect(-5, -33, 10, 5);
  }
  context.fillStyle = '#533a29';
  context.fillRect(-4, -4, 8, 8);
  context.restore();
};

const drawFeast = (context: CanvasRenderingContext2D, game: GameState) => {
  const { x, y } = game.feast;
  context.fillStyle = 'rgba(34, 39, 29, .3)';
  context.fillRect(x - 40, y + 15, 80, 17);
  context.fillStyle = '#b54b3d';
  context.fillRect(x - 28, y - 7, 56, 36);
  context.fillStyle = '#e3c45d';
  for (let stripe = -23; stripe < 26; stripe += 9) context.fillRect(x + stripe, y - 5, 3, 32);
  context.fillStyle = '#f1dda0';
  context.fillRect(x - 10, y + 2, 20, 9);
  context.fillStyle = '#70934d';
  context.fillRect(x - 6, y + 5, 5, 3);
  context.fillStyle = '#a64f3b';
  context.fillRect(x + 2, y + 5, 5, 3);
  const people = [[-37, 0, '#7c483f'], [37, 0, '#315d62'], [-25, 34, '#6e714a'], [25, 34, '#9f603d']] as const;
  people.forEach(([dx, dy, color], index) => {
    const wave = game.callPulseUntil > game.elapsed ? Math.sin(game.elapsed * 14 + index) * 2 : 0;
    context.fillStyle = '#c58a60';
    context.fillRect(x + dx - 2, y + dy - 10 + wave, 5, 5);
    context.fillStyle = color;
    context.fillRect(x + dx - 5, y + dy - 5 + wave, 10, 11);
    context.fillStyle = '#362f2b';
    context.fillRect(x + dx - 7, y + dy + 5, 5, 3);
    context.fillRect(x + dx + 3, y + dy + 5, 5, 3);
  });
};

const drawChief = (context: CanvasRenderingContext2D, game: GameState) => {
  const x = 700;
  const y = 247;
  const speaking = game.leaderStartedAt !== 0;
  const bob = speaking ? Math.round(Math.sin(game.worldTime * 4)) : 0;
  context.fillStyle = 'rgba(31, 43, 33, .28)';
  context.fillRect(x - 8, y + 8, 18, 5);
  context.fillStyle = '#2c2927';
  context.fillRect(x - 4, y - 21 + bob, 9, 7);
  context.fillStyle = '#c58a61';
  context.fillRect(x - 3, y - 14 + bob, 7, 6);
  context.fillStyle = '#5c3130';
  context.fillRect(x - 7, y - 8 + bob, 15, 16);
  context.fillStyle = '#d4ba70';
  context.fillRect(x - 8, y - 24 + bob, 17, 4);
  if (speaking) {
    context.fillStyle = 'rgba(25, 42, 34, .9)';
    context.fillRect(x - 28, y - 43, 57, 14);
    context.fillStyle = '#f4dda0';
    context.font = '700 6px monospace';
    context.textAlign = 'center';
    context.fillText('THỨ NHẤT…', x, y - 34);
  }
};

const drawStreamGroup = (context: CanvasRenderingContext2D) => {
  const people = [
    { x: 1_183, y: 682, dress: '#8d3f55', sash: '#e7c15b' },
    { x: 1_207, y: 695, dress: '#315e68', sash: '#e85b62' },
    { x: 1_232, y: 680, dress: '#4f7148', sash: '#f0c95e' },
  ];
  people.forEach((person, index) => {
    context.fillStyle = '#292728';
    context.fillRect(person.x - 4, person.y - 23, 9, 8);
    context.fillStyle = '#c68d69';
    context.fillRect(person.x - 3, person.y - 15, 7, 6);
    context.fillStyle = person.dress;
    context.fillRect(person.x - 7, person.y - 9, 15, 17);
    context.fillStyle = person.sash;
    context.fillRect(person.x - 7, person.y - 3, 15, 3);
    context.fillStyle = '#263b3d';
    context.fillRect(person.x - 6, person.y + 8, 5, 11);
    context.fillRect(person.x + 2, person.y + 8, 5, 11);
    if (index === 1) {
      context.fillStyle = '#d9bd7a';
      context.fillRect(person.x + 8, person.y - 2, 5, 4);
    }
  });
  context.fillStyle = '#3d6a49';
  context.fillRect(1_164, 698, 31, 17);
  context.fillRect(1_222, 696, 35, 20);
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
    context.fillStyle = index % 3 === 0 ? '#f0d68f' : index % 3 === 1 ? '#d97c5a' : '#f1ecbd';
    context.fillRect(fishX, fishY, 5, 2);
    context.fillRect(fishX - 2, fishY - 1, 2, 4);
  }
};

const drawChicken = (context: CanvasRenderingContext2D, x: number, y: number, color: string) => {
  context.fillStyle = color;
  context.fillRect(x - 4, y - 6, 8, 6);
  context.fillStyle = '#f1d8a0';
  context.fillRect(x + 3, y - 8, 4, 4);
  context.fillStyle = '#d9a43d';
  context.fillRect(x + 7, y - 6, 3, 1);
  context.fillStyle = '#3c342d';
  context.fillRect(x - 2, y, 1, 3);
  context.fillRect(x + 3, y, 1, 3);
};

const drawDog = (context: CanvasRenderingContext2D, game: GameState) => {
  const x = 330;
  const y = 534;
  const heardCall = game.callPulseUntil > game.elapsed && distance(game.player.x, game.player.y, x, y) < 300;
  const wag = Math.round(Math.sin(game.worldTime * (heardCall ? 15 : 5)) * 3);
  context.fillStyle = 'rgba(30, 39, 31, .28)';
  context.fillRect(x - 12, y + 2, 28, 5);
  context.fillStyle = '#704a32';
  context.fillRect(x - 8, y - 8, 18, 10);
  context.fillRect(x + 7, y - 13, 9, 10);
  context.fillStyle = '#3c3028';
  context.fillRect(x + 9, y - 16, 3, 5);
  context.fillRect(x + 14, y - 15, 3, 5);
  context.fillRect(x + 14, y - 9, 4, 2);
  context.fillStyle = '#81583a';
  context.fillRect(x - 12, y - 8 - wag, 5, 3);
  context.fillStyle = '#49352a';
  context.fillRect(x - 6, y, 3, 7);
  context.fillRect(x + 6, y, 3, 7);
  if (heardCall) {
    context.fillStyle = '#f1d992';
    context.fillRect(x + 19, y - 18, 2, 5);
    context.fillRect(x + 23, y - 20, 2, 7);
  }
};

const drawBuffalo = (context: CanvasRenderingContext2D, game: GameState) => {
  const x = 888;
  const y = 585;
  const chew = Math.round(Math.sin(game.worldTime * 2.2));
  context.fillStyle = 'rgba(30, 39, 31, .3)';
  context.fillRect(x - 28, y + 6, 62, 8);
  context.fillStyle = '#4a4941';
  context.fillRect(x - 25, y - 19, 45, 25);
  context.fillRect(x + 14, y - 16, 20, 18);
  context.fillStyle = '#383a37';
  context.fillRect(x - 20, y + 2, 6, 16);
  context.fillRect(x + 8, y + 2, 6, 16);
  context.fillRect(x + 23, y - 2, 6, 15);
  context.fillStyle = '#d7c492';
  context.fillRect(x + 25, y - 22, 14, 3);
  context.fillRect(x + 31, y - 25, 9, 3);
  context.fillRect(x + 12, y - 22, 11, 3);
  context.fillRect(x + 9, y - 25, 8, 3);
  context.fillStyle = '#232928';
  context.fillRect(x + 27, y - 12, 2, 2);
  context.fillRect(x + 34, y - 8 + chew, 4, 2);
  context.fillStyle = '#303330';
  context.fillRect(x - 30, y - 19, 6, 3);
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
  const bob = Math.round(Math.abs(Math.sin(game.worldTime * 5 * slow)) * -2);
  context.save();
  context.translate(Math.round(x), Math.round(y + bob));
  context.fillStyle = 'rgba(27, 39, 31, .3)';
  context.fillRect(-10, 8, 22, 5);
  context.fillStyle = '#343a36';
  context.fillRect(-7, 0, 5, 10);
  context.fillRect(3, 0, 5, 10);
  context.fillStyle = '#315f68';
  context.fillRect(-10, -14, 20, 17);
  context.fillRect(-8, -18, 16, 7);
  context.fillStyle = '#c68e68';
  context.fillRect(-5, -26, 11, 9);
  context.fillStyle = '#2d2929';
  context.fillRect(-6, -29, 12, 5);
  context.fillStyle = '#c68e68';
  context.fillRect(7, -18, 4, 13);
  context.fillStyle = '#80e0a2';
  context.fillRect(8, -25, 4, 9);
  context.fillStyle = '#14211f';
  context.fillRect(9, -23, 2, 5);
  context.restore();
};

const drawHeeSun = (context: CanvasRenderingContext2D, game: GameState) => {
  const { x, y, scale, mode } = game.heesun;
  const chasing = mode === 'chasing' || mode === 'distracted';
  const bob = chasing ? Math.round(Math.abs(Math.sin(game.worldTime * 9)) * -3) : Math.round(Math.sin(game.worldTime * 2));
  context.save();
  context.translate(Math.round(x), Math.round(y + bob));
  context.scale(scale, scale);
  context.fillStyle = 'rgba(29, 36, 29, .34)';
  context.fillRect(-13, 9, 28, 6);
  context.fillStyle = '#333630';
  context.fillRect(-10, 0, 6, 12);
  context.fillRect(5, 0, 6, 12);
  context.fillStyle = '#983f38';
  context.fillRect(-14, -17, 28, 20);
  context.fillStyle = '#d8b667';
  for (let stripe = -10; stripe <= 10; stripe += 7) context.fillRect(stripe, -17, 2, 20);
  context.fillStyle = '#c88e67';
  context.fillRect(-7, -29, 15, 12);
  context.fillStyle = '#302828';
  context.fillRect(-8, -32, 16, 5);
  context.fillStyle = '#2c2626';
  context.fillRect(-4, -23, 2, 2);
  context.fillRect(4, -23, 2, 2);
  context.fillRect(-2, -19, 7, 2);
  if (chasing) {
    context.fillStyle = '#c88e67';
    context.fillRect(-18, -13, 5, 15);
    context.fillRect(13, -13, 5, 15);
  }
  context.restore();
};

const drawPlayer = (context: CanvasRenderingContext2D, game: GameState) => {
  const { player } = game;
  const scale = game.powerUntil.squash > game.elapsed ? 1.42 : 1;
  const moving = Math.hypot(player.vx, player.vy) > 5;
  const bob = moving ? Math.round(Math.abs(Math.sin(player.walk)) * -2) : 0;
  const step = moving ? Math.round(Math.sin(player.walk) * 2) : 0;
  context.save();
  context.translate(Math.round(player.x), Math.round(player.y + bob));
  context.scale(scale, scale);
  context.fillStyle = 'rgba(28, 40, 31, .32)';
  context.fillRect(-8, 6, 18, 5);
  context.fillStyle = '#38473f';
  context.fillRect(-5, 0, 4, 9 + step);
  context.fillRect(2, 0, 4, 9 - step);
  context.fillStyle = '#d0a078';
  context.fillRect(-5, -16, 10, 9);
  context.fillStyle = '#332f2d';
  context.fillRect(-5, -19, 10, 4);
  context.fillStyle = '#d9c48b';
  context.fillRect(-6, -8, 12, 11);
  context.fillStyle = '#425950';
  context.fillRect(-8, -7, 4, 10);
  context.fillRect(5, -7, 4, 10);
  context.fillStyle = '#5d6f42';
  context.fillRect(-7, -23, 14, 4);
  context.fillRect(-5, -26, 10, 4);
  context.fillStyle = '#d9bd67';
  context.fillRect(-1, -25, 3, 2);
  context.restore();
};

const drawOcop = (context: CanvasRenderingContext2D, game: GameState) => {
  OCOP_ITEMS.forEach((item) => {
    if (game.triggered.has(`ocop-${item.kind}`) || !inView(game, item.x, item.y, 40)) return;
    const bob = Math.sin(game.worldTime * 2 + item.x) * 2;
    context.save();
    context.translate(item.x, item.y + bob);
    context.fillStyle = 'rgba(25, 40, 31, .24)';
    context.fillRect(-11, 7, 23, 5);
    if (item.kind === 'squash') {
      context.fillStyle = '#8fbe55';
      context.fillRect(-9, -4, 18, 12);
      context.fillStyle = '#d8e98c';
      context.fillRect(-5, -6, 10, 3);
      context.fillStyle = '#3b6b3d';
      context.fillRect(-1, -9, 3, 4);
    } else if (item.kind === 'coffee') {
      context.fillStyle = '#f0d49a';
      context.fillRect(-8, -5, 14, 12);
      context.fillStyle = '#5c352c';
      context.fillRect(6, -2, 4, 6);
      context.fillStyle = '#bb563d';
      context.fillRect(-3, -9, 3, 3);
      context.fillRect(2, -10, 3, 3);
    } else {
      context.fillStyle = '#d8b86f';
      context.fillRect(-8, -5, 7, 9);
      context.fillRect(2, -7, 8, 11);
      context.fillStyle = '#775334';
      context.fillRect(-5, -3, 2, 5);
      context.fillRect(5, -5, 2, 6);
    }
    context.restore();
  });
};

const drawGate = (context: CanvasRenderingContext2D, game: GameState) => {
  const x = 805;
  const y = 447;
  context.fillStyle = '#5a412d';
  context.fillRect(x - 36, y - 20, 5, 43);
  context.fillRect(x + 31, y - 20, 5, 43);
  context.save();
  context.translate(x - 31, y - 16);
  if (game.gateOpen) context.rotate(-0.9);
  context.fillStyle = '#a17443';
  context.fillRect(0, 0, 62, 5);
  context.fillRect(0, 14, 62, 5);
  for (let bar = 0; bar <= 56; bar += 14) context.fillRect(bar, 0, 4, 23);
  context.restore();
};

const drawDomino = (context: CanvasRenderingContext2D, game: GameState) => {
  const age = game.dominoStartedAt > 0 ? game.elapsed - game.dominoStartedAt : 0;
  for (let index = 0; index < 5; index += 1) {
    const progress = clamp(age * 2.2 - index * 0.32, 0, 1);
    context.save();
    context.translate(1_275 + index * 18, 408 + index * 2);
    context.rotate(progress * 1.2);
    context.fillStyle = index % 2 ? '#825239' : '#9c6841';
    context.fillRect(-7, -12, 14, 18);
    context.fillStyle = '#d2a35c';
    context.fillRect(-6, -9, 12, 2);
    context.restore();
  }
};

const drawExit = (context: CanvasRenderingContext2D, game: GameState) => {
  const x = WORLD_WIDTH - 62;
  const y = 452;
  context.fillStyle = '#5b422e';
  context.fillRect(x, y - 35, 4, 52);
  context.fillStyle = '#e3c878';
  context.fillRect(x - 33, y - 39, 68, 22);
  context.fillStyle = '#2c493e';
  context.font = '900 8px monospace';
  context.textAlign = 'center';
  context.fillText('LỐI RA →', x + 1, y - 25);
  if (game.absurdityLevel >= 2) {
    context.fillStyle = '#e3c878';
    context.fillRect(x - 16, y - 66, 34, 16);
    context.fillStyle = '#2c493e';
    context.font = '800 6px monospace';
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
    const bob = Math.round(Math.sin(game.worldTime * 2 + index));
    context.fillStyle = '#2f2929';
    context.fillRect(person.x - 3, person.y - 19 + bob, 7, 7);
    context.fillStyle = '#c68c66';
    context.fillRect(person.x - 2, person.y - 12 + bob, 5, 5);
    context.fillStyle = person.color;
    context.fillRect(person.x - 5, person.y - 7 + bob, 11, 13);
    context.fillStyle = '#343a36';
    context.fillRect(person.x - 4, person.y + 5 + bob, 3, 8);
    context.fillRect(person.x + 2, person.y + 5 + bob, 3, 8);
  });
};

const drawParticles = (context: CanvasRenderingContext2D, game: GameState) => {
  game.particles.forEach((particle) => {
    context.globalAlpha = clamp(particle.life / particle.maxLife, 0, 1);
    context.fillStyle = particle.color;
    if (particle.kind === 'note') {
      context.fillRect(Math.round(particle.x), Math.round(particle.y), 2, 4);
      context.fillRect(Math.round(particle.x) + 2, Math.round(particle.y), 2, 1);
    } else {
      context.fillRect(Math.round(particle.x), Math.round(particle.y), particle.size + (particle.kind === 'leaf' ? 2 : 0), particle.size);
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

const drawCaptureScene = (context: CanvasRenderingContext2D, game: GameState) => {
  const age = game.elapsed - game.scene.startedAt;
  context.fillStyle = age >= 4.35 ? '#151d1c' : '#3a4038';
  context.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
  if (age < 1.45 || age >= 4.35) return;
  context.fillStyle = '#6d8053';
  context.fillRect(0, 122, VIEW_WIDTH, 148);
  context.fillStyle = '#273d35';
  context.beginPath();
  context.moveTo(0, 133);
  context.lineTo(80, 70);
  context.lineTo(150, 125);
  context.lineTo(250, 54);
  context.lineTo(350, 128);
  context.lineTo(435, 72);
  context.lineTo(VIEW_WIDTH, 118);
  context.lineTo(VIEW_WIDTH, 152);
  context.lineTo(0, 152);
  context.closePath();
  context.fill();
  const fakeGame = { ...game, feast: { ...game.feast, x: 240, y: 172 } };
  drawFeast(context, fakeGame);
  context.save();
  context.translate(206, 201);
  context.fillStyle = '#38473f';
  context.fillRect(-6, -5, 12, 10);
  context.fillStyle = '#d0a078';
  context.fillRect(-4, -15, 9, 8);
  context.fillStyle = '#332f2d';
  context.fillRect(-5, -18, 10, 4);
  context.fillStyle = '#f2e7b8';
  context.fillRect(-3, -12, 1, 1);
  context.fillRect(3, -12, 1, 1);
  context.restore();
  const fakeHeeSun = { ...game, heesun: { ...game.heesun, x: 281, y: 199, scale: 1.18, mode: 'drinking' as HeeSunMode } };
  drawHeeSun(context, fakeHeeSun);
  context.fillStyle = 'rgba(33, 29, 29, .28)';
  context.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
};

export const renderGame = (context: CanvasRenderingContext2D, game: GameState) => {
  context.save();
  context.imageSmoothingEnabled = false;
  context.clearRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
  if (game.scene.kind === 'capture') {
    drawCaptureScene(context, game);
    context.restore();
    return;
  }
  const shaking = !game.reducedMotion && game.shakeUntil > game.elapsed;
  const shakeX = shaking ? Math.sin(game.worldTime * 91) * 1.4 : 0;
  const shakeY = shaking ? Math.cos(game.worldTime * 77) * 0.9 : 0;
  context.translate(-Math.round(game.cameraX) + shakeX, -Math.round(game.cameraY) + shakeY);
  drawGround(context, game);
  drawMountains(context);
  drawFields(context, game);
  drawRoads(context);
  drawRiver(context, game);
  drawBridge(context, 438);
  drawBridge(context, 695);
  drawScenery(context, game);
  drawWaterwheel(context, game);
  drawFish(context, game);
  drawStreamGroup(context);
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
};
