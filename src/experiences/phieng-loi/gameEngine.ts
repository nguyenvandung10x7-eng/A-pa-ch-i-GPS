import {
  HANU_ROUTE,
  HOUSE_CALL_POINTS,
  OCOP_WORLD_ITEMS,
  PHIENG_LOI_LANDMARKS,
  isWalkable,
  navigationTarget,
  nearestWalkablePoint,
} from './worldLayout.ts';

export const VIEW_WIDTH = 480;
export const VIEW_HEIGHT = 270;
export const WORLD_WIDTH = 1_680;
export const WORLD_HEIGHT = 920;

const PLAYER_START_X = PHIENG_LOI_LANDMARKS.playerStart.x;
const PLAYER_START_Y = PHIENG_LOI_LANDMARKS.playerStart.y;
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

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const distance = (ax: number, ay: number, bx: number, by: number) => Math.hypot(ax - bx, ay - by);
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
    x: PHIENG_LOI_LANDMARKS.heesunStart.x,
    y: PHIENG_LOI_LANDMARKS.heesunStart.y,
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
    x: HANU_ROUTE[0].x,
    y: HANU_ROUTE[0].y,
    waypoint: 1,
    lineIndex: 0,
    nextLineAt: 5,
    revealReadyAt: 0,
    lastCollisionAt: 0,
    saidAtStream: false,
  },
  feast: {
    x: PHIENG_LOI_LANDMARKS.feastStart.x,
    y: PHIENG_LOI_LANDMARKS.feastStart.y,
    encounters: 0,
    pendingRelocate: false,
    relocateAt: 0,
    nextTriggerAt: 0,
  },
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

  const restoredPlayer = nearestWalkablePoint({
    x: clamp(save.player.x, 32, WORLD_WIDTH - 32),
    y: clamp(save.player.y, 42, WORLD_HEIGHT - 32),
  });
  game.player.x = restoredPlayer.x;
  game.player.y = restoredPlayer.y;
  game.player.facingX = save.player.facingX;
  game.player.facingY = save.player.facingY;
  game.elapsed = Math.max(0, save.elapsed);
  game.worldTime = game.elapsed;
  game.absurdityScore = Math.max(0, save.absurdityScore);
  game.absurdityLevel = absurdityFromScore(game.absurdityScore);
  game.callCount = Math.max(0, save.callCount);
  game.triggered = new Set(save.triggered);
  const restoredFeast = nearestWalkablePoint({ x: save.feast.x, y: save.feast.y });
  game.feast.x = restoredFeast.x;
  game.feast.y = restoredFeast.y;
  game.feast.encounters = save.feast.encounters;
  game.feast.pendingRelocate = save.feast.pendingRelocate ?? false;
  game.feast.relocateAt = game.feast.pendingRelocate ? game.elapsed + 1.1 : 0;
  const restoredHeeSun = nearestWalkablePoint({ x: save.heesun.x, y: save.heesun.y });
  game.heesun.x = restoredHeeSun.x;
  game.heesun.y = restoredHeeSun.y;
  game.heesun.vx = 0;
  game.heesun.vy = 0;
  game.heesun.mode = save.heesun.mode === 'intro' || save.heesun.mode === 'ambush' ? 'waiting' : save.heesun.mode;
  game.heesun.met = save.heesun.met;
  game.heesun.caught = save.heesun.caught;
  game.heesun.scale = save.heesun.scale;
  game.heesun.modeUntil = game.heesun.mode === 'drinking' ? game.elapsed + 8 : 0;
  game.heesun.nextAmbushAt = game.elapsed + 34;
  const restoredHaNu = nearestWalkablePoint({ x: save.hanu.x, y: save.hanu.y });
  game.hanu.x = restoredHaNu.x;
  game.hanu.y = restoredHaNu.y;
  game.hanu.waypoint = save.hanu.waypoint % HANU_ROUTE.length;
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

const isBlocked = (game: GameState, x: number, y: number) => {
  if (!isWalkable(x, y, 8)) return true;
  return distance(x, y, game.hanu.x, game.hanu.y) < 14;
};

const startChickenPanic = (game: GameState, events: GameEvent[]) => {
  if (game.chicken.panicUntil > game.elapsed) return;
  game.chicken.panicStartedAt = game.elapsed;
  game.chicken.panicUntil = game.elapsed + 4.3;
  game.shakeUntil = game.elapsed + 0.34;
  addAbsurdity(game, 1.15);
  addParticles(game, PHIENG_LOI_LANDMARKS.chickenYard.x, PHIENG_LOI_LANDMARKS.chickenYard.y, ['#ead08c', '#c66b3d', '#fff2c0'], 28, 'leaf', 58);
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

  const nearestPower = OCOP_WORLD_ITEMS
    .filter((item) => !game.triggered.has(`ocop-${item.kind}`))
    .map((item) => ({ item, value: distance(game.player.x, game.player.y, item.x, item.y) }))
    .sort((first, second) => first.value - second.value)[0];
  if (nearestPower && nearestPower.value < 70) {
    activatePower(game, nearestPower.item.kind, events);
    return;
  }
  if (distance(game.player.x, game.player.y, PHIENG_LOI_LANDMARKS.chickenYard.x, PHIENG_LOI_LANDMARKS.chickenYard.y) < 82) {
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
  if (game.streamStartedAt !== 0 && distance(game.player.x, game.player.y, PHIENG_LOI_LANDMARKS.stream.x, PHIENG_LOI_LANDMARKS.stream.y) < 125) {
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
        const relocated = nearestWalkablePoint({
          x: clamp(game.player.x + 300, 620, 1_080),
          y: game.player.y < 500 ? game.player.y + 92 : game.player.y - 82,
        });
        game.feast.x = relocated.x;
        game.feast.y = relocated.y;
      } else if (game.feast.encounters === 2) {
        game.feast.x = PHIENG_LOI_LANDMARKS.feastField.x;
        game.feast.y = PHIENG_LOI_LANDMARKS.feastField.y;
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
  if (
    game.leaderStartedAt === 0
    && distance(game.player.x, game.player.y, PHIENG_LOI_LANDMARKS.chief.x, PHIENG_LOI_LANDMARKS.chief.y) < 76
    && game.scene.kind === 'none'
  ) {
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
  if (distance(game.player.x, game.player.y, PHIENG_LOI_LANDMARKS.stream.x, PHIENG_LOI_LANDMARKS.stream.y) > 68) return;
  game.streamStartedAt = game.elapsed || 0.001;
  game.scene = { kind: 'stream', startedAt: game.elapsed, stage: 0 };
  game.player.vx = 0;
  game.player.vy = 0;
  addAbsurdity(game, 1.5);
  events.push({ type: 'stream' });
};

const updateHaNu = (game: GameState, dt: number, events: GameEvent[]) => {
  const target = HANU_ROUTE[game.hanu.waypoint % HANU_ROUTE.length];
  const dx = target.x - game.hanu.x;
  const dy = target.y - game.hanu.y;
  const length = Math.max(0.001, Math.hypot(dx, dy));
  const environmentSlow = game.powerUntil.coffee > game.elapsed ? 0.22 : 1;
  const speed = 24 * environmentSlow;
  game.hanu.x += (dx / length) * speed * dt;
  game.hanu.y += (dy / length) * speed * dt;
  if (length < 8) game.hanu.waypoint = (game.hanu.waypoint + 1) % HANU_ROUTE.length;

  if (game.elapsed >= game.hanu.nextLineAt && game.scene.kind !== 'capture') {
    const lines = [['Ừ.', 'Yeah.'], ['Ừ.', 'Yeah.'], ['Thế à?', 'Really?'], ['Ừ.', 'Yeah.']];
    const line = lines[game.hanu.lineIndex % lines.length];
    game.hanu.lineIndex += 1;
    game.hanu.nextLineAt = game.elapsed + 4.2 + (game.hanu.lineIndex % 3) * 1.1;
    setMessage(game, 'HANU · ĐIỆN THOẠI', 'HANU · ON THE PHONE', line[0], line[1], 'hanu', 1.25);
    events.push({ type: 'phone' });
  }
  if (!game.hanu.saidAtStream && distance(game.hanu.x, game.hanu.y, PHIENG_LOI_LANDMARKS.stream.x, PHIENG_LOI_LANDMARKS.stream.y) < 65) {
    game.hanu.saidAtStream = true;
    setMessage(game, 'HANU · GIỮA SUỐI', 'HANU · IN THE STREAM', 'Ừ, tôi đang ở nhà.', 'Yeah, I am at home.', 'hanu', 2.7);
    events.push({ type: 'phone' });
    addAbsurdity(game, 1);
  }
  if (
    !game.gateOpen
    && game.absurdityLevel >= 1
    && distance(game.hanu.x, game.hanu.y, PHIENG_LOI_LANDMARKS.gate.x, PHIENG_LOI_LANDMARKS.gate.y) < 54
  ) {
    game.gateOpen = true;
    addAbsurdity(game, 0.6);
    if (game.heesun.met && game.heesun.mode === 'waiting') {
      setMessage(game, 'PHIÊNG LƠI', 'PHIENG LOI', 'HaNu vô tình mở cổng cho HeeSun.', 'HaNu accidentally opens the gate for HeeSun.', 'world', 2.3);
      startChase(game, events, false);
    }
  }
  if (game.dominoStartedAt === 0 && distance(game.hanu.x, game.hanu.y, PHIENG_LOI_LANDMARKS.domino.x, PHIENG_LOI_LANDMARKS.domino.y) < 48) {
    game.dominoStartedAt = game.elapsed;
    addAbsurdity(game, 1.1);
    setMessage(game, 'PHIÊNG LƠI', 'PHIENG LOI', 'HaNu không hề nhìn thấy chuyện vừa xảy ra.', 'HaNu does not notice what just happened.', 'world', 2.4);
    events.push({ type: 'domino' });
  }
  if (
    distance(game.hanu.x, game.hanu.y, PHIENG_LOI_LANDMARKS.chickenYard.x, PHIENG_LOI_LANDMARKS.chickenYard.y) < 54
    && game.chicken.panicUntil <= game.elapsed
  ) startChickenPanic(game, events);

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
  const waypoint = navigationTarget(
    { x: game.heesun.x, y: game.heesun.y },
    { x: targetX, y: targetY },
  );
  const navigationX = waypoint.x;
  const navigationY = waypoint.y;

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
    const ambush = nearestWalkablePoint({
      x: clamp(game.player.x + 205, 780, WORLD_WIDTH - 130),
      y: clamp(game.player.y + (game.player.y < 500 ? 92 : -92), 110, WORLD_HEIGHT - 80),
    });
    game.heesun.x = ambush.x;
    game.heesun.y = ambush.y;
    game.heesun.mode = 'ambush';
    game.heesun.modeUntil = game.elapsed + 1.25;
    game.heesun.nextAmbushAt = game.elapsed + 38;
    setMessage(game, 'PHIÊNG LƠI', 'PHIENG LOI', 'Một tiếng “bạn ơi” phát ra từ chỗ không nên có người.', 'A “my friend” comes from somewhere nobody should be.', 'world', 2.3);
  }
  if (game.heesun.mode === 'waiting' && game.heesun.met && distance(game.player.x, game.player.y, game.heesun.x, game.heesun.y) < 92) startChase(game, events);
  if (game.heesun.mode === 'distracted') {
    const panic = game.chicken.panicUntil > game.elapsed;
    const targetX = panic ? PHIENG_LOI_LANDMARKS.chickenYard.x : game.hanu.x;
    const targetY = panic ? PHIENG_LOI_LANDMARKS.chickenYard.y : game.hanu.y;
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
  let moving = false;
  if (!controlsLocked) {
    const previousX = game.player.x;
    const previousY = game.player.y;
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
    const movedDistance = distance(previousX, previousY, game.player.x, game.player.y);
    moving = movedDistance > 0.01;
    if (inputLength > 0.08) {
      game.player.facingX = moveX;
      game.player.facingY = moveY;
    }
    if (moving) {
      game.player.walk += (movedDistance / PLAYER_SPEED) * 9.2;
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
  if (!game.complete && distance(game.player.x, game.player.y, PHIENG_LOI_LANDMARKS.exit.x, PHIENG_LOI_LANDMARKS.exit.y) < 34) {
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
