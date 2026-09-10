import {
  PHA_OI_COOLDOWN_SECONDS,
  activateDirectedEvent,
  createDirectorState,
  evaluateDirector,
  finishExpiredEvents,
  getEventDefinition,
  isTrueNothingRoll,
  restoreDirectorHistory,
  takeDueEvents,
  type AbsurdityLevel,
  type DialogueAnchor,
  type DialogueTone,
  type DirectedEventId,
  type DirectorContextKey,
  type DirectorResolution,
  type DirectorSignal,
  type DirectorState,
  type EventDialogue,
  type EventPriority,
} from './absurdityDirector.ts';
import {
  HANU_ROUTE,
  HOUSE_CALL_POINTS,
  OCOP_WORLD_ITEMS,
  PHIENG_LOI_LANDMARKS,
  PHIENG_LOI_WORLD,
  isWalkable,
  migrateLegacyWorldPoint,
  navigationTarget,
  nearestWalkablePoint,
  type WorldPoint,
} from './worldLayout.ts';

export const VIEW_WIDTH = PHIENG_LOI_WORLD.viewWidth;
export const VIEW_HEIGHT = PHIENG_LOI_WORLD.viewHeight;
export const WORLD_WIDTH = PHIENG_LOI_WORLD.width;
export const WORLD_HEIGHT = PHIENG_LOI_WORLD.height;
export const GAME_SAVE_VERSION = 3;

const PLAYER_START_X = PHIENG_LOI_LANDMARKS.playerStart.x;
const PLAYER_START_Y = PHIENG_LOI_LANDMARKS.playerStart.y;
const PLAYER_SPEED = 86;
const CAMERA_VERTICAL_ANCHOR = 0.7;
const MAX_DIALOGUE_QUEUE = 5;
const PRIORITY_VALUE: Record<EventPriority, number> = { low: 0, medium: 1, high: 2 };

export type GameQuality = 'low' | 'high';
export type PowerKind = 'squash' | 'coffee' | 'macadamia';
export type PhaOiVoiceKind = 'normal' | 'long' | 'panicked' | 'whisper' | 'silly';
export type HeeSunMode = 'idle' | 'wander' | 'notice' | 'intro' | 'chasing' | 'distracted' | 'interrupted' | 'drinking' | 'ambush' | 'caught-player' | 'reset' | 'rare-flee';
export type HaNuMode = 'phone-loop' | 'promise-initial' | 'promise-repeat' | 'delivering' | 'delivery-paused' | 'delivered' | 'resetting';
export type FeastMode = 'idle' | 'invite' | 'stare' | 'react' | 'chasing' | 'resetting' | 'relocating';
export type ChickenMode = 'peck' | 'look' | 'triple-look' | 'panic-away' | 'panic-toward-player' | 'cross-screen' | 'follow-hanu' | 'follow-heesun' | 'invade-feast';
export type MacroKind = 'none' | 'growth' | 'world-news' | 'physics' | 'philosophy';
export type SceneKind = 'none' | 'heesun-intro' | 'capture' | 'stream';
export type MessageTone = DialogueTone;

export type InputState = {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  moveX: number;
  moveY: number;
  callQueued: boolean;
};

export type LocalizedMessage = {
  id: number;
  speakerVi: string;
  speakerEn: string;
  textVi: string;
  textEn: string;
  tone: MessageTone;
  anchor: DialogueAnchor;
  priority: EventPriority;
  interruptible: boolean;
  expiresAt: number;
};

type QueuedDialogue = Omit<LocalizedMessage, 'id' | 'expiresAt'> & { dueAt: number; duration: number };
type PlayerState = { x: number; y: number; vx: number; vy: number; facingX: number; facingY: number; walk: number };

export type HeeSunState = {
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
  target: 'player' | 'hanu' | 'chickens' | 'exit';
  resumeMode: HeeSunMode | null;
  chaseStartedAt: number;
  chaseTimeoutAt: number;
  lostSince: number;
  wanderTarget: number;
  nextWanderAt: number;
  navigationX: number;
  navigationY: number;
  nextNavigationAt: number;
};

export type HaNuState = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  waypoint: number;
  lineIndex: number;
  nextLineAt: number;
  revealReadyAt: number;
  lastCollisionAt: number;
  saidAtStream: boolean;
  mode: HaNuMode;
  modeUntil: number;
  promiseStage: 0 | 1 | 2;
  nextPromiseAt: number;
  deliveryStartAt: number;
  deliveryTimeoutAt: number;
  deliveryCycle: number;
  carryingFood: boolean;
  speedBoostUntil: number;
  headTurnUntil: number;
  nextPauseAt: number;
  receivedCount: number;
};

export type FeastState = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  encounters: number;
  pendingRelocate: boolean;
  relocateAt: number;
  nextTriggerAt: number;
  mode: FeastMode;
  modeUntil: number;
  chaseStartedAt: number;
  routineIndex: number;
  nextRoutineAt: number;
  locationIndex: number;
  target: 'player' | 'hanu';
};

export type ChickenState = {
  mode: ChickenMode;
  modeStartedAt: number;
  modeUntil: number;
  panicStartedAt: number;
  panicUntil: number;
  visibleCount: number;
  directionX: number;
  directionY: number;
};

type ChiefState = { startedAt: number; stage: number; nextLineAt: number; pausedUntil: number };
type SceneState = { kind: SceneKind; startedAt: number; stage: number };
export type KaraokeState = {
  active: boolean;
  startedAt: number;
  endsAt: number;
  x: number;
  y: number;
};
export type HeeSunWifeState = {
  visibleUntil: number;
  commandUntil: number;
  x: number;
  y: number;
};
type WorldGagState = {
  chairFallenUntil: number;
  shoeAirborneUntil: number;
  dogAwakeUntil: number;
  macro: MacroKind;
  macroUntil: number;
  heesunTwinUntil: number;
};

export type Particle = {
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
  | { type: 'pha-oi'; voice: PhaOiVoiceKind; outcome: 'normal' | 'true-nothing' }
  | { type: 'director-event'; id: DirectedEventId; soundCue?: string }
  | { type: 'footstep' | 'crunch' | 'chicken-panic' | 'chase-start' | 'chase-stop' | 'capture' | 'reset' | 'phone' | 'domino' | 'stream' | 'feast' | 'feast-chase' | 'delivery-start' | 'delivery-complete' | 'call-ready' | 'karaoke-start' | 'karaoke-stop' | 'exit' }
  | { type: 'power-start' | 'power-end'; power: PowerKind };

export type GameSave = {
  version: number;
  player: { x: number; y: number; facingX: number; facingY: number };
  elapsed: number;
  absurdityScore: number;
  callCount: number;
  normalCallCount?: number;
  triggered: string[];
  feast: Pick<FeastState, 'x' | 'y' | 'encounters'> & Partial<Pick<FeastState, 'pendingRelocate' | 'mode' | 'locationIndex'>>;
  heesun: Pick<HeeSunState, 'x' | 'y' | 'mode' | 'met' | 'caught' | 'scale'> & Partial<Pick<HeeSunState, 'target'>>;
  hanu: Pick<HaNuState, 'x' | 'y' | 'waypoint' | 'lineIndex' | 'saidAtStream'> & Partial<Pick<HaNuState, 'mode' | 'promiseStage' | 'deliveryCycle' | 'carryingFood' | 'receivedCount'>>;
  leaderStarted: boolean;
  chiefStage?: number;
  streamSeen: boolean;
  gateOpen: boolean;
  dominoStartedAt: number;
  powerRemaining?: Partial<Record<PowerKind, number>>;
  squashSequence?: { age: number; stage: number };
  phaOiCooldownRemaining?: number;
  lastVoice?: PhaOiVoiceKind;
  directorRecent?: Array<{ id: string; age: number }>;
  directorCooldownRemaining?: Record<string, number>;
  recurringFlags?: string[];
  recentLocations?: string[];
  complete: boolean;
};

export type UiSnapshot = {
  elapsed: number;
  message: LocalizedMessage | null;
  messageX: number;
  messageY: number;
  messageAnchored: boolean;
  callSerial: number;
  callActive: boolean;
  callReady: boolean;
  callCooldownProgress: number;
  callRechargeActive: boolean;
  cinematicVi: string | null;
  cinematicEn: string | null;
  scene: SceneKind;
  sceneAge: number;
  leaderClock: string | null;
  chiefSpeaking: boolean;
  leaderLineVi: string;
  leaderLineEn: string;
  karaokeActive: boolean;
  karaokeProgress: number;
  power: PowerKind | null;
  powerRemaining: number;
  chasing: boolean;
  feastChasing: boolean;
  hanuDeliveryActive: boolean;
  caught: number;
  macro: MacroKind;
  complete: boolean;
};

export type GameState = {
  player: PlayerState;
  heesun: HeeSunState;
  hanu: HaNuState;
  feast: FeastState;
  chicken: ChickenState;
  chief: ChiefState;
  scene: SceneState;
  karaoke: KaraokeState;
  wife: HeeSunWifeState;
  worldGag: WorldGagState;
  director: DirectorState;
  elapsed: number;
  worldTime: number;
  cameraX: number;
  cameraY: number;
  quality: GameQuality;
  reducedMotion: boolean;
  random: () => number;
  message: LocalizedMessage | null;
  dialogueQueue: QueuedDialogue[];
  messageSerial: number;
  callSerial: number;
  callPulseUntil: number;
  replyPulseUntil: number;
  lastCallAt: number;
  callCount: number;
  normalCallCount: number;
  lastVoice: PhaOiVoiceKind | null;
  phaOiCooldownStartedAt: number;
  phaOiCooldownUntil: number;
  callRechargePulseUntil: number;
  absurdityScore: number;
  absurdityLevel: AbsurdityLevel;
  nextTimeEscalationAt: number;
  triggered: Set<string>;
  recurringFlags: Set<string>;
  recentLocations: string[];
  currentLocation: string;
  streamStartedAt: number;
  fishBoost: number;
  gateOpen: boolean;
  dominoStartedAt: number;
  powerUntil: Record<PowerKind, number>;
  squashSequenceAt: number;
  squashSequenceStage: number;
  nextFootstepAt: number;
  nextCrunchAt: number;
  nextCollisionCheckAt: number;
  nextCollisionSignalAt: number;
  lastCollisionSignature: string;
  shakeUntil: number;
  particles: Particle[];
  complete: boolean;
};

type GameRuntimeOptions = { random?: () => number };
const POWER_DURATION: Record<PowerKind, number> = { squash: 11, coffee: 12, macadamia: 12 };
const FEAST_LOCATIONS = [PHIENG_LOI_LANDMARKS.feastStart, PHIENG_LOI_LANDMARKS.feastSecond, PHIENG_LOI_LANDMARKS.feastField] as const;
const HEESUN_WANDER_POINTS = [PHIENG_LOI_LANDMARKS.heesunStart, PHIENG_LOI_LANDMARKS.chief, PHIENG_LOI_LANDMARKS.feastStart] as const;
const VOICE_WEIGHTS: readonly { kind: PhaOiVoiceKind; weight: number }[] = [
  { kind: 'normal', weight: 48 }, { kind: 'long', weight: 23 }, { kind: 'panicked', weight: 14 },
  { kind: 'whisper', weight: 11 }, { kind: 'silly', weight: 4 },
];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const distance = (ax: number, ay: number, bx: number, by: number) => Math.hypot(ax - bx, ay - by);
const absurdityFromScore = (score: number): AbsurdityLevel => score >= 26 ? 5 : score >= 18 ? 4 : score >= 12 ? 3 : score >= 7 ? 2 : score >= 3 ? 1 : 0;
const addAbsurdity = (game: GameState, amount: number) => {
  game.absurdityScore += amount;
  game.absurdityLevel = absurdityFromScore(game.absurdityScore);
};

/**
 * Gameplay bubbles are deliberately reserved for the four comic leads. Other
 * world reactions stay visual/audio or use the compact HUD/cinematic channels.
 */
export const isGameplayBubble = (anchor: DialogueAnchor, tone: MessageTone) => (
  (anchor === 'player' && tone === 'plain')
  || (anchor === 'heesun' && tone === 'heesun')
  || (anchor === 'hanu' && tone === 'hanu')
  || (anchor === 'vuongme' && tone === 'vuongme')
);

const setMessage = (
  game: GameState,
  speakerVi: string,
  speakerEn: string,
  textVi: string,
  textEn: string,
  tone: MessageTone,
  duration = 2.2,
  anchor: DialogueAnchor = 'world',
  priority: EventPriority = 'low',
  interruptible = true,
) => {
  if (!isGameplayBubble(anchor, tone)) return false;
  const current = game.message && game.message.expiresAt > game.elapsed ? game.message : null;
  if (current && ((!current.interruptible && PRIORITY_VALUE[priority] <= PRIORITY_VALUE[current.priority]) || PRIORITY_VALUE[priority] < PRIORITY_VALUE[current.priority])) return false;
  game.messageSerial += 1;
  game.message = { id: game.messageSerial, speakerVi, speakerEn, textVi, textEn, tone, anchor, priority, interruptible, expiresAt: game.elapsed + duration };
  return true;
};

const queueDialogue = (game: GameState, dialogue: EventDialogue) => {
  if (!isGameplayBubble(dialogue.anchor, dialogue.styleVariant)) return;
  if (dialogue.delay <= 0) {
    setMessage(game, dialogue.speakerVi, dialogue.speakerEn, dialogue.textVi, dialogue.textEn, dialogue.styleVariant, dialogue.duration, dialogue.anchor, dialogue.priority, dialogue.interruptible);
    return;
  }
  if (game.dialogueQueue.length >= MAX_DIALOGUE_QUEUE) return;
  game.dialogueQueue.push({
    speakerVi: dialogue.speakerVi, speakerEn: dialogue.speakerEn, textVi: dialogue.textVi, textEn: dialogue.textEn,
    tone: dialogue.styleVariant, anchor: dialogue.anchor, priority: dialogue.priority, interruptible: dialogue.interruptible,
    dueAt: game.elapsed + dialogue.delay, duration: dialogue.duration,
  });
  game.dialogueQueue.sort((first, second) => first.dueAt - second.dueAt);
};

const updateDialogue = (game: GameState) => {
  if (game.message && game.message.expiresAt <= game.elapsed) game.message = null;
  const next = game.dialogueQueue[0];
  if (!next || next.dueAt > game.elapsed) return;
  game.dialogueQueue.shift();
  setMessage(game, next.speakerVi, next.speakerEn, next.textVi, next.textEn, next.tone, next.duration, next.anchor, next.priority, next.interruptible);
};

const addParticles = (game: GameState, x: number, y: number, colors: string[], count: number, kind: Particle['kind'], strength = 28) => {
  const actual = Math.max(2, Math.round(count * (game.quality === 'low' ? 0.55 : 1) * (game.reducedMotion ? 0.3 : 1)));
  const limit = game.quality === 'low' ? 70 : 145;
  for (let index = 0; index < actual && game.particles.length < limit; index += 1) {
    const angle = game.random() * Math.PI * 2;
    const speed = strength * (0.35 + game.random() * 0.75);
    const life = 0.45 + game.random() * 0.85;
    game.particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - strength * 0.18, life, maxLife: life, color: colors[Math.floor(game.random() * colors.length)] ?? colors[0], size: 1 + Math.floor(game.random() * 2), kind });
  }
};

const defaultGame = (quality: GameQuality, reducedMotion: boolean, random: () => number): GameState => ({
  player: { x: PLAYER_START_X, y: PLAYER_START_Y, vx: 0, vy: 0, facingX: 1, facingY: 0, walk: 0 },
  heesun: {
    x: PHIENG_LOI_LANDMARKS.heesunStart.x, y: PHIENG_LOI_LANDMARKS.heesunStart.y, vx: 0, vy: 0,
    mode: 'idle', modeUntil: 0, met: false, caught: 0, scale: 1, speedBoostUntil: 0, nextAmbushAt: 62,
    target: 'player', resumeMode: null, chaseStartedAt: 0, chaseTimeoutAt: 0, lostSince: 0,
    wanderTarget: 0, nextWanderAt: 7, navigationX: PHIENG_LOI_LANDMARKS.heesunStart.x,
    navigationY: PHIENG_LOI_LANDMARKS.heesunStart.y, nextNavigationAt: 0,
  },
  hanu: {
    x: HANU_ROUTE[0].x, y: HANU_ROUTE[0].y, vx: 0, vy: 0, waypoint: 1, lineIndex: 0, nextLineAt: 8,
    revealReadyAt: 0, lastCollisionAt: 0, saidAtStream: false, mode: 'phone-loop', modeUntil: 0,
    promiseStage: 0, nextPromiseAt: 2.4, deliveryStartAt: 38, deliveryTimeoutAt: 0, deliveryCycle: 0,
    carryingFood: false, speedBoostUntil: 0, headTurnUntil: 0, nextPauseAt: 13, receivedCount: 0,
  },
  feast: {
    x: PHIENG_LOI_LANDMARKS.feastStart.x, y: PHIENG_LOI_LANDMARKS.feastStart.y, vx: 0, vy: 0,
    encounters: 0, pendingRelocate: false, relocateAt: 42, nextTriggerAt: 0, mode: 'idle', modeUntil: 0,
    chaseStartedAt: 0, routineIndex: 0, nextRoutineAt: 4, locationIndex: 0,
    target: 'player',
  },
  chicken: { mode: 'peck', modeStartedAt: 0, modeUntil: 0, panicStartedAt: 0, panicUntil: 0, visibleCount: 4, directionX: 1, directionY: 0 },
  chief: { startedAt: 0, stage: 0, nextLineAt: 0, pausedUntil: 0 },
  scene: { kind: 'none', startedAt: 0, stage: 0 },
  karaoke: { active: false, startedAt: 0, endsAt: 0, x: PHIENG_LOI_LANDMARKS.vuongMeStage.x, y: PHIENG_LOI_LANDMARKS.vuongMeStage.y },
  wife: { visibleUntil: 0, commandUntil: 0, x: PHIENG_LOI_LANDMARKS.feastStart.x, y: PHIENG_LOI_LANDMARKS.feastStart.y },
  worldGag: { chairFallenUntil: 0, shoeAirborneUntil: 0, dogAwakeUntil: 0, macro: 'none', macroUntil: 0, heesunTwinUntil: 0 },
  director: createDirectorState(),
  elapsed: 0, worldTime: 0, cameraX: 0,
  cameraY: clamp(PLAYER_START_Y - VIEW_HEIGHT * CAMERA_VERTICAL_ANCHOR, 0, WORLD_HEIGHT - VIEW_HEIGHT),
  quality, reducedMotion, random, message: null, dialogueQueue: [], messageSerial: 0, callSerial: 0,
  callPulseUntil: 0, replyPulseUntil: 0, lastCallAt: -10, callCount: 0, normalCallCount: 0, lastVoice: null,
  phaOiCooldownStartedAt: 0, phaOiCooldownUntil: 0, callRechargePulseUntil: 0,
  absurdityScore: 0, absurdityLevel: 0, nextTimeEscalationAt: 45, triggered: new Set<string>(),
  recurringFlags: new Set<string>(), recentLocations: ['village-entry'], currentLocation: 'village-entry',
  streamStartedAt: 0, fishBoost: 0, gateOpen: false, dominoStartedAt: 0,
  powerUntil: { squash: 0, coffee: 0, macadamia: 0 }, squashSequenceAt: 0, squashSequenceStage: 0,
  nextFootstepAt: 0, nextCrunchAt: 0, nextCollisionCheckAt: 0, nextCollisionSignalAt: 0,
  lastCollisionSignature: '', shakeUntil: 0, particles: [], complete: false,
});

const restoreHeeSunMode = (mode: string): HeeSunMode => {
  if (mode === 'waiting') return 'idle';
  const allowed: readonly HeeSunMode[] = ['idle', 'wander', 'notice', 'intro', 'chasing', 'distracted', 'interrupted', 'drinking', 'ambush', 'caught-player', 'reset', 'rare-flee'];
  return allowed.includes(mode as HeeSunMode) ? mode as HeeSunMode : 'idle';
};

export const createGame = (quality: GameQuality, reducedMotion: boolean, save?: GameSave | null, runtime: GameRuntimeOptions = {}): GameState => {
  const game = defaultGame(quality, reducedMotion, runtime.random ?? Math.random);
  if (!save || ![1, 2, GAME_SAVE_VERSION].includes(save.version) || save.complete) return game;
  const restorePoint = (point: WorldPoint) => nearestWalkablePoint(save.version === 1 ? migrateLegacyWorldPoint(point) : point);
  const player = restorePoint({ x: clamp(save.player.x, 32, WORLD_WIDTH - 32), y: clamp(save.player.y, 42, WORLD_HEIGHT - 32) });
  Object.assign(game.player, player, { facingX: save.player.facingX, facingY: save.player.facingY });
  game.elapsed = Math.max(0, save.elapsed);
  game.worldTime = game.elapsed;
  game.absurdityScore = Math.max(0, save.absurdityScore);
  game.absurdityLevel = absurdityFromScore(game.absurdityScore);
  game.callCount = Math.max(0, save.callCount);
  game.normalCallCount = Math.max(0, save.normalCallCount ?? save.callCount);
  game.lastVoice = save.lastVoice ?? null;
  game.triggered = new Set(save.triggered);
  game.recurringFlags = new Set(save.recurringFlags ?? []);
  game.recentLocations = (save.recentLocations ?? []).slice(-6);

  Object.assign(game.feast, restorePoint(save.feast), {
    encounters: Math.max(0, save.feast.encounters), pendingRelocate: save.feast.pendingRelocate ?? false,
    locationIndex: clamp(Math.round(save.feast.locationIndex ?? save.feast.encounters), 0, FEAST_LOCATIONS.length - 1),
    mode: save.feast.mode === 'chasing' ? 'chasing' : 'idle', relocateAt: game.elapsed + 26,
  });
  game.feast.modeUntil = game.feast.mode === 'chasing' ? game.elapsed + 6 : 0;
  game.feast.chaseStartedAt = game.feast.mode === 'chasing' ? game.elapsed : 0;

  Object.assign(game.heesun, restorePoint(save.heesun), {
    mode: restoreHeeSunMode(save.heesun.mode), met: save.heesun.met, caught: save.heesun.caught,
    scale: save.heesun.scale, target: save.heesun.target ?? 'player', nextAmbushAt: game.elapsed + 34,
  });
  if (['intro', 'ambush', 'caught-player', 'reset'].includes(game.heesun.mode)) game.heesun.mode = 'idle';
  if (game.heesun.mode === 'chasing' || game.heesun.mode === 'distracted') {
    game.heesun.chaseStartedAt = game.elapsed;
    game.heesun.chaseTimeoutAt = game.elapsed + 14;
    game.heesun.modeUntil = game.heesun.mode === 'distracted' ? game.elapsed + 2 : 0;
  } else if (game.heesun.mode === 'drinking' || game.heesun.mode === 'interrupted') {
    game.heesun.modeUntil = game.elapsed + 3;
    game.heesun.resumeMode = 'idle';
  }

  Object.assign(game.hanu, restorePoint(save.hanu), {
    waypoint: Math.abs(save.hanu.waypoint) % HANU_ROUTE.length, lineIndex: Math.max(0, save.hanu.lineIndex),
    saidAtStream: save.hanu.saidAtStream, mode: save.hanu.mode ?? 'phone-loop',
    promiseStage: save.hanu.promiseStage ?? 0, deliveryCycle: Math.max(0, save.hanu.deliveryCycle ?? 0),
    carryingFood: save.hanu.carryingFood ?? false, receivedCount: Math.max(0, save.hanu.receivedCount ?? 0),
    nextPromiseAt: game.elapsed + 5, nextLineAt: game.elapsed + 6,
  });
  if (['promise-initial', 'promise-repeat', 'delivery-paused'].includes(game.hanu.mode)) game.hanu.mode = game.hanu.carryingFood ? 'delivering' : 'phone-loop';
  if (game.hanu.carryingFood) {
    game.hanu.mode = 'delivering';
    game.hanu.promiseStage = 2;
    game.hanu.deliveryTimeoutAt = game.elapsed + 45;
  }
  game.hanu.deliveryStartAt = game.hanu.promiseStage >= 2 ? game.elapsed + 7 : game.elapsed + 30;

  game.chief.startedAt = save.leaderStarted ? Math.max(0.001, game.elapsed - 20) : 0;
  game.chief.stage = Math.max(0, save.chiefStage ?? (save.leaderStarted ? 1 : 0));
  game.chief.nextLineAt = save.leaderStarted ? game.elapsed + 8 : 0;
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
  const cooldown = Math.min(PHA_OI_COOLDOWN_SECONDS, Math.max(0, save.phaOiCooldownRemaining ?? 0));
  if (cooldown > 0) {
    game.phaOiCooldownStartedAt = game.elapsed - (PHA_OI_COOLDOWN_SECONDS - cooldown);
    game.phaOiCooldownUntil = game.elapsed + cooldown;
  }
  restoreDirectorHistory(game.director, game.elapsed, save.directorRecent, save.directorCooldownRemaining);
  game.director.nextWorldTickAt = game.elapsed + 3.5;
  game.nextTimeEscalationAt = game.elapsed + 36;
  game.cameraX = clamp(game.player.x - VIEW_WIDTH / 2, 0, WORLD_WIDTH - VIEW_WIDTH);
  game.cameraY = clamp(game.player.y - VIEW_HEIGHT * CAMERA_VERTICAL_ANCHOR, 0, WORLD_HEIGHT - VIEW_HEIGHT);
  return game;
};

export const createSave = (game: GameState): GameSave => {
  const directorCooldownRemaining: Record<string, number> = {};
  Object.entries(game.director.cooldownUntil).forEach(([id, until]) => {
    if (until && until > game.elapsed) directorCooldownRemaining[id] = until - game.elapsed;
  });
  return {
    version: GAME_SAVE_VERSION,
    player: { x: Math.round(game.player.x), y: Math.round(game.player.y), facingX: game.player.facingX, facingY: game.player.facingY },
    elapsed: game.elapsed, absurdityScore: game.absurdityScore, callCount: game.callCount, normalCallCount: game.normalCallCount, triggered: [...game.triggered],
    recurringFlags: [...game.recurringFlags], recentLocations: game.recentLocations.slice(-6),
    feast: { x: game.feast.x, y: game.feast.y, encounters: game.feast.encounters, pendingRelocate: game.feast.pendingRelocate, mode: game.feast.mode, locationIndex: game.feast.locationIndex },
    heesun: { x: game.heesun.x, y: game.heesun.y, mode: game.heesun.mode, met: game.heesun.met, caught: game.heesun.caught, scale: game.heesun.scale, target: game.heesun.target },
    hanu: { x: game.hanu.x, y: game.hanu.y, waypoint: game.hanu.waypoint, lineIndex: game.hanu.lineIndex, saidAtStream: game.hanu.saidAtStream, mode: game.hanu.mode, promiseStage: game.hanu.promiseStage, deliveryCycle: game.hanu.deliveryCycle, carryingFood: game.hanu.carryingFood, receivedCount: game.hanu.receivedCount },
    leaderStarted: game.chief.startedAt !== 0, chiefStage: game.chief.stage, streamSeen: game.streamStartedAt !== 0,
    gateOpen: game.gateOpen, dominoStartedAt: game.dominoStartedAt,
    powerRemaining: { squash: Math.max(0, game.powerUntil.squash - game.elapsed), coffee: Math.max(0, game.powerUntil.coffee - game.elapsed), macadamia: Math.max(0, game.powerUntil.macadamia - game.elapsed) },
    squashSequence: game.squashSequenceAt > 0 ? { age: game.elapsed - game.squashSequenceAt, stage: game.squashSequenceStage } : undefined,
    phaOiCooldownRemaining: Math.max(0, game.phaOiCooldownUntil - game.elapsed), lastVoice: game.lastVoice ?? undefined,
    directorRecent: game.director.recentEvents.map((event) => ({ id: event.id, age: game.elapsed - event.at })),
    directorCooldownRemaining, complete: game.complete,
  };
};

const currentPower = (game: GameState): PowerKind | null => {
  const powers = (Object.keys(game.powerUntil) as PowerKind[])
    .filter((kind) => game.powerUntil[kind] > game.elapsed)
    .sort((first, second) => game.powerUntil[second] - game.powerUntil[first]);
  return powers[0] ?? null;
};

const chiefClock = (game: GameState) => {
  if (game.chief.startedAt === 0) return null;
  const age = game.elapsed - game.chief.startedAt;
  if (age < 1.4) return '00:01';
  if (age < 4.4) return '02:17';
  if (age < 8.2) return '07:42';
  if (age < 30) return '19:36';
  return `${String(Math.min(99, 19 + Math.floor(age / 12))).padStart(2, '0')}:${String(Math.floor(age * 7) % 60).padStart(2, '0')}`;
};

const chiefLine = (stage: number) => {
  if (stage <= 0) return { vi: 'Tôi xin nói ngắn gọn…', en: 'I will be brief…' };
  if (stage === 1) return { vi: 'Thứ nhất…', en: 'Firstly…' };
  if (stage === 2) return { vi: 'Thứ hai…', en: 'Secondly…' };
  if (stage === 3) return { vi: 'Thứ ba…', en: 'Thirdly…' };
  return { vi: `Điểm thứ ${stage}…`, en: `Point number ${stage}…` };
};

const cinematicCopy = (game: GameState): { vi: string; en: string } | null => {
  if (game.karaoke.active) return null;
  if (game.scene.kind === 'capture') {
    const age = game.elapsed - game.scene.startedAt;
    if (age < 1.05) return { vi: '3 GIỜ SAU', en: '3 HOURS LATER' };
    if (age >= 2.75 && age < 3.65) return { vi: '5 GIỜ SAU', en: '5 HOURS LATER' };
    return null;
  }
  if (game.scene.kind === 'stream' && game.elapsed - game.scene.startedAt < 2.65) {
    return { vi: 'Người đẹp đi ra suối tắm, cá tìm về xem chân em nữa.', en: 'The village beauties go down to the stream; even the fish come to see their feet.' };
  }
  if (game.worldGag.macro === 'growth') {
    const remaining = game.worldGag.macroUntil - game.elapsed;
    return remaining > 3 ? { vi: 'TĂNG TRƯỞNG PHIÊNG LƠI: 9,8%', en: 'PHIÊNG LƠI GROWTH: 9.8%' } : { vi: '10,2%', en: '10.2%' };
  }
  if (game.worldGag.macro === 'world-news') return { vi: 'Tình hình tiếp tục diễn biến phức tạp.', en: 'The situation continues to develop.' };
  if (game.worldGag.macro === 'physics') return { vi: 'Hiện chưa xác định HeeSun đang ở đâu.', en: 'HeeSun’s location remains undetermined.' };
  if (game.worldGag.macro === 'philosophy') return { vi: 'Bạn hoàn toàn có quyền rời Phiêng Lơi. Về lý thuyết.', en: 'You are entirely free to leave Phiêng Lơi. In theory.' };
  return null;
};

const anchorPosition = (game: GameState, anchor: DialogueAnchor): WorldPoint | null => {
  if (anchor === 'player') return game.player;
  if (anchor === 'heesun') return game.heesun;
  if (anchor === 'hanu') return game.hanu;
  if (anchor === 'vuongme') return game.karaoke;
  if (anchor === 'feast') return game.feast;
  if (anchor === 'chief') return PHIENG_LOI_LANDMARKS.chief;
  if (anchor === 'stream') return PHIENG_LOI_LANDMARKS.streamGroup;
  return null;
};

export const createUiSnapshot = (game: GameState): UiSnapshot => {
  const power = currentPower(game);
  const cinematic = cinematicCopy(game);
  const anchor = game.message ? anchorPosition(game, game.message.anchor) : null;
  const cooldownRemaining = Math.max(0, game.phaOiCooldownUntil - game.elapsed);
  const karaokeDuration = Math.max(.001, game.karaoke.endsAt - game.karaoke.startedAt);
  const leaderLine = chiefLine(game.chief.stage);
  return {
    elapsed: game.elapsed,
    message: game.message && game.message.expiresAt > game.elapsed ? game.message : null,
    messageX: anchor ? clamp(((anchor.x - game.cameraX) / VIEW_WIDTH) * 100, 13, 87) : 50,
    messageY: anchor ? clamp(((anchor.y - 42 - game.cameraY) / VIEW_HEIGHT) * 100, 20, 76) : 52,
    messageAnchored: Boolean(anchor),
    callSerial: game.callSerial,
    callActive: game.callPulseUntil > game.elapsed,
    callReady: cooldownRemaining <= 0,
    callCooldownProgress: cooldownRemaining > 0 ? clamp(1 - cooldownRemaining / PHA_OI_COOLDOWN_SECONDS, 0, 1) : 1,
    callRechargeActive: game.callRechargePulseUntil > game.elapsed,
    cinematicVi: cinematic?.vi ?? null,
    cinematicEn: cinematic?.en ?? null,
    scene: game.scene.kind,
    sceneAge: game.scene.kind === 'none' ? 0 : game.elapsed - game.scene.startedAt,
    leaderClock: chiefClock(game),
    chiefSpeaking: game.chief.startedAt !== 0,
    leaderLineVi: leaderLine.vi,
    leaderLineEn: leaderLine.en,
    karaokeActive: game.karaoke.active,
    karaokeProgress: game.karaoke.active ? clamp((game.elapsed - game.karaoke.startedAt) / karaokeDuration, 0, 1) : 0,
    power,
    powerRemaining: power ? clamp((game.powerUntil[power] - game.elapsed) / POWER_DURATION[power], 0, 1) : 0,
    chasing: game.heesun.mode === 'chasing' || game.heesun.mode === 'distracted',
    feastChasing: game.feast.mode === 'chasing',
    hanuDeliveryActive: game.hanu.mode === 'delivering' || (game.hanu.mode === 'delivery-paused' && game.hanu.carryingFood),
    caught: game.heesun.caught,
    macro: game.worldGag.macro,
    complete: game.complete,
  };
};

const clearQueuedInput = (input: InputState) => { input.callQueued = false; };
const isBlocked = (game: GameState, x: number, y: number) => !isWalkable(x, y, 8) || distance(x, y, game.hanu.x, game.hanu.y) < 12;

const chooseVoice = (game: GameState): PhaOiVoiceKind => {
  const available = VOICE_WEIGHTS.filter(({ kind }) => kind !== game.lastVoice);
  const total = available.reduce((sum, item) => sum + item.weight, 0);
  let roll = game.random() * total;
  const selected = available.find((item) => {
    roll -= item.weight;
    return roll <= 0;
  }) ?? available[0];
  let voice = selected.kind;
  if (game.heesun.mode === 'chasing' && voice === 'normal') {
    voice = game.lastVoice === 'panicked' ? 'long' : 'panicked';
  }
  game.lastVoice = voice;
  return voice;
};

const startChickenMode = (game: GameState, mode: ChickenMode, duration: number, events: GameEvent[]) => {
  Object.assign(game.chicken, {
    mode, modeStartedAt: game.elapsed, modeUntil: game.elapsed + duration,
    panicStartedAt: game.elapsed, panicUntil: game.elapsed + duration,
    visibleCount: mode === 'look' ? 1 : mode === 'triple-look' ? 3 : 10,
    directionX: mode === 'panic-toward-player' ? -1 : 1,
  });
  game.shakeUntil = game.elapsed + 0.26;
  addParticles(game, PHIENG_LOI_LANDMARKS.chickenYard.x, PHIENG_LOI_LANDMARKS.chickenYard.y, ['#ead08c', '#c66b3d', '#fff2c0'], 18, 'leaf', 46);
  if (mode !== 'look' && mode !== 'triple-look') events.push({ type: 'chicken-panic' });
};

const startChase = (game: GameState, events: GameEvent[], shout = true, target: HeeSunState['target'] = 'player') => {
  const alreadyChasing = game.heesun.mode === 'chasing' && game.heesun.target === target;
  Object.assign(game.heesun, {
    met: true, mode: 'chasing', target, modeUntil: 0, resumeMode: null,
    chaseStartedAt: game.elapsed, chaseTimeoutAt: game.elapsed + (target === 'player' ? 24 : 7), lostSince: 0,
  });
  if (shout && !alreadyChasing) setMessage(game, 'HEESUN', 'HEESUN', 'BẠN ƠI!', 'MY FRIEND!', 'heesun', 1.5, 'heesun', 'medium');
  game.shakeUntil = game.elapsed + 0.26;
  if (!alreadyChasing) events.push({ type: 'chase-start' });
};

const stopChase = (game: GameState, events: GameEvent[], message = true) => {
  if (game.heesun.mode !== 'chasing' && game.heesun.mode !== 'distracted') return;
  Object.assign(game.heesun, { mode: 'reset', modeUntil: game.elapsed + 1.1, target: 'player', vx: 0, vy: 0 });
  if (message) setMessage(game, 'HEESUN · RẤT XA', 'HEESUN · FAR AWAY', 'Bạn ơiiii…', 'My frieeend…', 'heesun', 1.7, 'heesun');
  events.push({ type: 'chase-stop' });
};

const startHeeSunIntro = (game: GameState) => {
  game.heesun.mode = 'intro';
  game.scene = { kind: 'heesun-intro', startedAt: game.elapsed, stage: 0 };
  setMessage(game, 'HEESUN', 'HEESUN', 'Ôi bạn ôi, lâu lắm không gặp hay anh em ngồi tí nhỉ?', 'My friend! Long time no see. Shall we sit down for just a little while?', 'heesun', 2.55, 'heesun', 'high', false);
};

const startCapture = (game: GameState, events: GameEvent[]) => {
  game.scene = { kind: 'capture', startedAt: game.elapsed, stage: 0 };
  game.heesun.mode = 'caught-player';
  game.player.vx = 0;
  game.player.vy = 0;
  game.message = null;
  game.dialogueQueue = [];
  game.shakeUntil = game.elapsed + 0.5;
  events.push({ type: 'capture' });
};

const resetAfterCapture = (game: GameState, events: GameEvent[]) => {
  Object.assign(game.player, { x: PLAYER_START_X, y: PLAYER_START_Y, vx: 0, vy: 0, facingX: 1, facingY: 0 });
  Object.assign(game.heesun, {
    x: game.feast.x - 30, y: game.feast.y + 20, vx: 0, vy: 0, caught: game.heesun.caught + 1,
    mode: 'drinking', modeUntil: game.elapsed + 9, resumeMode: 'idle', nextAmbushAt: game.elapsed + 38,
  });
  game.scene = { kind: 'none', startedAt: 0, stage: 0 };
  game.message = null;
  game.cameraX = 0;
  game.cameraY = clamp(PLAYER_START_Y - VIEW_HEIGHT * CAMERA_VERTICAL_ANCHOR, 0, WORLD_HEIGHT - VIEW_HEIGHT);
  addAbsurdity(game, 0.8);
  events.push({ type: 'reset' });
};

const updateScene = (game: GameState, events: GameEvent[]) => {
  if (game.scene.kind === 'none') return;
  const age = game.elapsed - game.scene.startedAt;
  if (game.scene.kind === 'heesun-intro') {
    if (game.scene.stage === 0 && age >= 2.55) {
      game.scene.stage = 1;
      setMessage(game, 'BẠN', 'YOU', 'Thôi.', 'No.', 'plain', 0.75, 'player', 'high', false);
    } else if (game.scene.stage === 1 && age >= 3.75) {
      game.scene.stage = 2;
      setMessage(game, 'HEESUN', 'HEESUN', 'Bạn ơi…', 'My friend…', 'heesun', 0.82, 'heesun', 'high', false);
    } else if (game.scene.stage === 2 && age >= 4.58) {
      game.scene = { kind: 'none', startedAt: 0, stage: 0 };
      startChase(game, events);
    }
    return;
  }
  if (game.scene.kind === 'capture') {
    if (game.scene.stage === 0 && age >= 1.05) {
      game.scene.stage = 1;
      Object.assign(game.player, { x: game.feast.x + 22, y: game.feast.y + 12 });
      Object.assign(game.heesun, { x: game.feast.x - 26, y: game.feast.y + 8 });
      setMessage(game, 'HEESUN', 'HEESUN', 'Làm chén cuối.', 'One last cup.', 'heesun', 1.45, 'heesun', 'high', false);
    } else if (game.scene.stage === 1 && age >= 2.75) {
      game.scene.stage = 2;
      game.message = null;
    } else if (age >= 3.65) resetAfterCapture(game, events);
    return;
  }
  if (game.scene.kind === 'stream') {
    if (game.scene.stage === 0 && age >= 2.65) {
      game.scene.stage = 1;
      game.fishBoost = Math.max(game.fishBoost, 44);
      setMessage(game, 'MỘT CÔ GÁI', 'ONE OF THE WOMEN', 'Hôm nay cá hơi đông.', 'The fish are a little crowded today.', 'stream', 2.45, 'stream');
    }
    if (age >= 5.35) game.scene = { kind: 'none', startedAt: 0, stage: 0 };
  }
};

const activatePower = (game: GameState, power: PowerKind, events: GameEvent[]) => {
  const key = `ocop-${power}`;
  if (game.triggered.has(key)) return false;
  game.triggered.add(key);
  game.powerUntil[power] = game.elapsed + POWER_DURATION[power];
  addAbsurdity(game, 0.9);
  game.shakeUntil = game.elapsed + 0.38;
  events.push({ type: 'power-start', power });
  if (power === 'squash') {
    game.squashSequenceAt = game.elapsed;
    game.squashSequenceStage = 0;
    setMessage(game, 'BÍ XANH TÌA DÌNH', 'TIA DINH SQUASH', 'Bạn phình lớn bất thường. Không ai tỏ ra ngạc nhiên.', 'You swell to an unreasonable size. Nobody looks surprised.', 'ocop', 2.5, 'player');
    addParticles(game, game.player.x, game.player.y, ['#a8d35f', '#e1ef91', '#fff0a7'], 34, 'leaf', 48);
  } else if (power === 'coffee') {
    setMessage(game, 'CÀ PHÊ MƯỜNG ẢNG', 'MUONG ANG COFFEE', 'Cả thế giới chậm lại. Riêng HeeSun thì không.', 'The whole world slows down. HeeSun does not.', 'ocop', 3, 'player');
  } else {
    setMessage(game, 'MẮC CA ĐIỆN BIÊN', 'DIEN BIEN MACADAMIA', 'Mỗi bước chân bây giờ giòn đến mức không thể lẩn trốn.', 'Every step is now far too crunchy for hiding.', 'ocop', 3, 'player');
  }
  return true;
};

const nearestHouseDistance = (game: GameState) => HOUSE_CALL_POINTS.reduce((nearest, house) => Math.min(nearest, distance(game.player.x, game.player.y, house.x, house.y)), Number.POSITIVE_INFINITY);

const directorContext = (game: GameState): Set<DirectorContextKey> => {
  const context = new Set<DirectorContextKey>();
  const playerNearHanu = distance(game.player.x, game.player.y, game.hanu.x, game.hanu.y) < 105;
  const heesunNearHanu = distance(game.heesun.x, game.heesun.y, game.hanu.x, game.hanu.y) < 42;
  const nearFeast = distance(game.player.x, game.player.y, game.feast.x, game.feast.y) < 110
    || distance(game.heesun.x, game.heesun.y, game.feast.x, game.feast.y) < 82
    || distance(game.hanu.x, game.hanu.y, game.feast.x, game.feast.y) < 82;
  if (nearestHouseDistance(game) < 130) context.add('near-house');
  if (distance(game.player.x, game.player.y, PHIENG_LOI_LANDMARKS.chickenYard.x, PHIENG_LOI_LANDMARKS.chickenYard.y) < 110) context.add('near-chickens');
  if (nearFeast) context.add('near-feast');
  if (playerNearHanu || heesunNearHanu) context.add('near-hanu');
  if (distance(game.player.x, game.player.y, game.heesun.x, game.heesun.y) < 125) context.add('near-heesun');
  if (distance(game.player.x, game.player.y, PHIENG_LOI_LANDMARKS.stream.x, PHIENG_LOI_LANDMARKS.stream.y) < 130) context.add('near-stream');
  if (distance(game.player.x, game.player.y, PHIENG_LOI_LANDMARKS.chief.x, PHIENG_LOI_LANDMARKS.chief.y) < 110 || distance(game.hanu.x, game.hanu.y, PHIENG_LOI_LANDMARKS.chief.x, PHIENG_LOI_LANDMARKS.chief.y) < 82) context.add('near-chief');
  if (['idle', 'wander', 'notice', 'drinking', 'reset'].includes(game.heesun.mode)) context.add('heesun-idle');
  if (game.heesun.mode === 'chasing' || game.heesun.mode === 'distracted') context.add('heesun-chasing');
  if (game.hanu.carryingFood && (game.hanu.mode === 'delivering' || game.hanu.mode === 'delivery-paused')) context.add('hanu-delivering');
  if (['idle', 'invite', 'stare', 'react'].includes(game.feast.mode)) context.add('feast-idle');
  if (game.feast.mode === 'chasing') context.add('feast-chasing');
  if (['peck', 'look', 'triple-look'].includes(game.chicken.mode)) context.add('chickens-calm'); else context.add('chickens-running');
  if (game.chief.startedAt !== 0) context.add('chief-speaking');
  if ((context.has('heesun-chasing') && context.has('hanu-delivering')) || (context.has('heesun-chasing') && context.has('feast-chasing'))) context.add('multiple-chase');
  if (game.scene.kind === 'none' && !game.karaoke.active && !game.complete) context.add('karaoke-eligible');
  if (game.elapsed - game.director.lastMajorAt > 20) context.add('major-quiet');
  if (game.scene.kind === 'none' && !game.director.activeMajor && !game.message) context.add('world-quiet');
  return context;
};

const startFeastChase = (game: GameState, events: GameEvent[], target: FeastState['target'] = 'player') => {
  Object.assign(game.feast, { mode: 'chasing', modeUntil: game.elapsed + 8, chaseStartedAt: game.elapsed, target, vx: 0, vy: 0 });
  events.push({ type: 'feast-chase' });
};

export const applyDirectedEvent = (game: GameState, resolution: DirectorResolution, events: GameEvent[] = []): GameEvent[] => {
  const { definition } = resolution;
  if (definition.id === 'vuongme-karaoke-disco') {
    game.message = null;
    game.dialogueQueue = [];
  }
  definition.dialogueBubbles.forEach((dialogue) => queueDialogue(game, dialogue));
  addAbsurdity(game, definition.tier === 'macro' ? 0.75 : definition.tier === 'major' ? 0.62 : definition.tier === 'medium' ? 0.34 : 0.12);
  events.push({ type: 'director-event', id: definition.id, soundCue: definition.soundCue });
  switch (definition.id) {
    case 'house-reply': case 'distant-reply': case 'far-oi-returns': game.replyPulseUntil = game.elapsed + 1.05; break;
    case 'chicken-glance': startChickenMode(game, 'look', 1.5, events); break;
    case 'chicken-triple-stare': startChickenMode(game, 'triple-look', 1.9, events); break;
    case 'chicken-run-away': startChickenMode(game, 'panic-away', 4.2, events); break;
    case 'chicken-run-toward-player': startChickenMode(game, 'panic-toward-player', 4.4, events); break;
    case 'chicken-crossing': startChickenMode(game, 'cross-screen', 4.2, events); break;
    case 'feast-stare': Object.assign(game.feast, { mode: 'stare', modeUntil: game.elapsed + 2.2 }); break;
    case 'feast-what': Object.assign(game.feast, { mode: 'react', modeUntil: game.elapsed + 2.1 }); break;
    case 'feast-chase': case 'feast-remembers-call': startFeastChase(game, events); break;
    case 'hanu-head-only': game.hanu.headTurnUntil = game.elapsed + 1.5; events.push({ type: 'phone' }); break;
    case 'hanu-go-faster': game.hanu.speedBoostUntil = game.elapsed + 4.5; events.push({ type: 'phone' }); break;
    case 'hanu-almost-caught':
      Object.assign(game.hanu, { mode: 'delivery-paused', modeUntil: game.elapsed + definition.duration, speedBoostUntil: game.elapsed + definition.duration + 2.2 });
      events.push({ type: 'phone' });
      break;
    case 'hanu-phone-first':
      Object.assign(game.hanu, { mode: 'delivery-paused', modeUntil: game.elapsed + definition.duration });
      events.push({ type: 'phone' });
      break;
    case 'hanu-wrong-route': game.hanu.waypoint = (game.hanu.waypoint + 3) % HANU_ROUTE.length; break;
    case 'hanu-feast-delivery': Object.assign(game.hanu, { mode: 'delivery-paused', modeUntil: game.elapsed + definition.duration }); break;
    case 'hanu-perfect-delivery': completeHaNuDelivery(game, events); break;
    case 'heesun-stare':
      if (game.heesun.mode === 'idle' || game.heesun.mode === 'wander') Object.assign(game.heesun, { mode: 'notice', modeUntil: game.elapsed + 3.4 });
      break;
    case 'heesun-delayed-arrival': {
      const side = game.player.facingX >= 0 ? 1 : -1;
      const ambush = nearestWalkablePoint({ x: game.player.x + side * 175, y: game.player.y - 45 });
      Object.assign(game.heesun, ambush, { mode: 'ambush', modeUntil: game.elapsed + 0.85, met: true });
      break;
    }
    case 'stream-more-fish': game.fishBoost = Math.min(96, game.fishBoost + 18); events.push({ type: 'stream' }); break;
    case 'dog-wakes': game.worldGag.dogAwakeUntil = game.elapsed + 1.7; break;
    case 'chair-fall': game.worldGag.chairFallenUntil = game.elapsed + 2.2; game.shakeUntil = game.elapsed + 0.16; break;
    case 'shoe-from-house': game.worldGag.shoeAirborneUntil = game.elapsed + 1.6; break;
    case 'heesun-shoe': Object.assign(game.heesun, { mode: 'interrupted', modeUntil: game.elapsed + 1.7, resumeMode: 'chasing' }); break;
    case 'heesun-feast-interrupt': Object.assign(game.heesun, { mode: 'drinking', modeUntil: game.elapsed + 2.4, resumeMode: 'chasing' }); break;
    case 'heesun-chicken-detour': Object.assign(game.heesun, { mode: 'distracted', target: 'chickens', modeUntil: game.elapsed + 2.6, resumeMode: 'chasing' }); break;
    case 'heesun-smells-food': Object.assign(game.heesun, { mode: 'distracted', target: 'hanu', modeUntil: game.elapsed + 5.5, resumeMode: 'chasing' }); break;
    case 'hanu-blocks-heesun': Object.assign(game.heesun, { mode: 'interrupted', modeUntil: game.elapsed + 2.2, resumeMode: 'chasing', vx: game.heesun.vx * -0.45, vy: game.heesun.vy * -0.45 }); break;
    case 'hanu-wrong-person': case 'hanu-chief-delivery': Object.assign(game.hanu, { mode: 'delivery-paused', modeUntil: game.elapsed + definition.duration }); break;
    case 'hanu-chicken-procession': startChickenMode(game, 'follow-hanu', 7, events); break;
    case 'chicken-follow-heesun': startChickenMode(game, 'follow-heesun', 5.5, events); break;
    case 'chicken-invade-feast': startChickenMode(game, 'invade-feast', 5.2, events); break;
    case 'feast-switch-hanu': startFeastChase(game, events, 'hanu'); break;
    case 'heesun-wrong-corner': {
      const side = game.player.facingX >= 0 ? -1 : 1;
      const corner = nearestWalkablePoint({ x: game.player.x + side * 68, y: game.player.y - 28 });
      Object.assign(game.heesun, corner, { mode: 'notice', modeUntil: game.elapsed + 2.8, met: true, vx: 0, vy: 0 });
      break;
    }
    case 'vuongme-karaoke-disco': {
      const side = game.player.facingX < 0 ? -1 : 1;
      const stage = nearestWalkablePoint({ x: game.player.x + side * 112, y: game.player.y - 20 });
      Object.assign(game.karaoke, { active: true, startedAt: game.elapsed, endsAt: game.elapsed + definition.duration, ...stage });
      game.shakeUntil = game.elapsed + .32;
      events.push({ type: 'karaoke-start' });
      break;
    }
    case 'heesun-wife': {
      const wife = nearestWalkablePoint({ x: game.heesun.x + (game.heesun.x < game.player.x ? -42 : 42), y: game.heesun.y + 10 });
      Object.assign(game.wife, { ...wife, visibleUntil: game.elapsed + 4.8, commandUntil: game.elapsed + 1.4 });
      Object.assign(game.heesun, { mode: 'rare-flee', target: 'exit', modeUntil: game.elapsed + 4.8 });
      Object.assign(game.feast, { mode: 'resetting', modeUntil: game.elapsed + 1, target: 'player', vx: 0, vy: 0 });
      break;
    }
    case 'heesun-flee': Object.assign(game.heesun, { mode: 'rare-flee', target: 'exit', modeUntil: game.elapsed + 5.5 }); break;
    case 'macro-growth': Object.assign(game.worldGag, { macro: 'growth', macroUntil: game.elapsed + 5.5 }); break;
    case 'macro-world-news': Object.assign(game.worldGag, { macro: 'world-news', macroUntil: game.elapsed + 4.5 }); break;
    case 'macro-physics': Object.assign(game.worldGag, { macro: 'physics', macroUntil: game.elapsed + 5, heesunTwinUntil: game.elapsed + 5 }); break;
    case 'macro-philosophy': {
      const behind = nearestWalkablePoint({ x: game.player.x - game.player.facingX * 72, y: game.player.y - game.player.facingY * 54 });
      Object.assign(game.heesun, behind, { mode: 'notice', modeUntil: game.elapsed + 5.2, met: true, vx: 0, vy: 0 });
      Object.assign(game.worldGag, { macro: 'philosophy', macroUntil: game.elapsed + 5.2 });
      break;
    }
    default: break;
  }
  return events;
};

export const triggerDirectedEvent = (game: GameState, id: DirectedEventId, chainDepth = 0): GameEvent[] => {
  const events: GameEvent[] = [];
  const resolution = activateDirectedEvent(game.director, id, game.elapsed, chainDepth, game.random);
  if (resolution) applyDirectedEvent(game, resolution, events);
  return events;
};

const runDirectorSignal = (game: GameState, signal: DirectorSignal, events: GameEvent[]) => {
  const resolution = evaluateDirector(game.director, signal, directorContext(game), game.absurdityLevel, game.elapsed, game.random);
  if (resolution) applyDirectedEvent(game, resolution, events);
  return resolution;
};

const handleCall = (game: GameState, events: GameEvent[]) => {
  if (game.phaOiCooldownUntil > game.elapsed) return;
  game.callSerial += 1;
  game.callCount += 1;
  game.callPulseUntil = game.elapsed + 1.05;
  game.phaOiCooldownStartedAt = game.elapsed;
  game.phaOiCooldownUntil = game.elapsed + PHA_OI_COOLDOWN_SECONDS;
  const voice = chooseVoice(game);
  if (isTrueNothingRoll(game.random())) {
    events.push({ type: 'pha-oi', voice, outcome: 'true-nothing' });
    return;
  }
  events.push({ type: 'pha-oi', voice, outcome: 'normal' });
  game.normalCallCount += 1;
  game.shakeUntil = game.elapsed + 0.2;
  const interval = game.elapsed - game.lastCallAt;
  game.lastCallAt = game.elapsed;
  addAbsurdity(game, interval < 0.9 ? 0.42 : 0.24);
  addParticles(game, game.player.x, game.player.y - 13, ['#fff2a8', '#efbc58', '#e56c43'], 18, 'note', 48);
  const nearestPower = OCOP_WORLD_ITEMS.filter((item) => !game.triggered.has(`ocop-${item.kind}`))
    .map((item) => ({ item, value: distance(game.player.x, game.player.y, item.x, item.y) }))
    .sort((first, second) => first.value - second.value)[0];
  if (nearestPower && nearestPower.value < 70 && activatePower(game, nearestPower.item.kind, events)) return;
  if (game.director.activeMicro.length >= 2) {
    const index = game.director.activeMicro.findIndex((event) => event.canBeInterrupted);
    if (index >= 0) game.director.activeMicro.splice(index, 1);
  }
  const resolution = runDirectorSignal(game, 'pha-oi', events);
  if (!resolution) {
    const fallback = activateDirectedEvent(game.director, 'distant-reply', game.elapsed, 0, game.random);
    if (fallback) applyDirectedEvent(game, fallback, events);
  }
};

const updatePhaOiCooldown = (game: GameState, previousElapsed: number, events: GameEvent[]) => {
  if (game.phaOiCooldownUntil > previousElapsed && game.phaOiCooldownUntil <= game.elapsed) {
    game.phaOiCooldownUntil = 0;
    game.phaOiCooldownStartedAt = 0;
    game.callRechargePulseUntil = game.elapsed + 0.75;
    events.push({ type: 'call-ready' });
  }
};

const shifted = (timestamp: number, dt: number) => timestamp > 0 ? timestamp + dt : timestamp;

/** Keep finite-state routines exactly where they were while the village dances. */
const pauseWorldForKaraoke = (game: GameState, dt: number) => {
  const heesun = game.heesun;
  heesun.modeUntil = shifted(heesun.modeUntil, dt);
  heesun.speedBoostUntil = shifted(heesun.speedBoostUntil, dt);
  heesun.nextAmbushAt = shifted(heesun.nextAmbushAt, dt);
  heesun.chaseStartedAt = shifted(heesun.chaseStartedAt, dt);
  heesun.chaseTimeoutAt = shifted(heesun.chaseTimeoutAt, dt);
  heesun.lostSince = shifted(heesun.lostSince, dt);
  heesun.nextWanderAt = shifted(heesun.nextWanderAt, dt);
  heesun.nextNavigationAt = shifted(heesun.nextNavigationAt, dt);

  const hanu = game.hanu;
  hanu.nextLineAt = shifted(hanu.nextLineAt, dt);
  hanu.revealReadyAt = shifted(hanu.revealReadyAt, dt);
  hanu.lastCollisionAt = shifted(hanu.lastCollisionAt, dt);
  hanu.modeUntil = shifted(hanu.modeUntil, dt);
  hanu.nextPromiseAt = shifted(hanu.nextPromiseAt, dt);
  hanu.deliveryStartAt = shifted(hanu.deliveryStartAt, dt);
  hanu.deliveryTimeoutAt = shifted(hanu.deliveryTimeoutAt, dt);
  hanu.speedBoostUntil = shifted(hanu.speedBoostUntil, dt);
  hanu.headTurnUntil = shifted(hanu.headTurnUntil, dt);
  hanu.nextPauseAt = shifted(hanu.nextPauseAt, dt);

  const feast = game.feast;
  feast.relocateAt = shifted(feast.relocateAt, dt);
  feast.nextTriggerAt = shifted(feast.nextTriggerAt, dt);
  feast.modeUntil = shifted(feast.modeUntil, dt);
  feast.chaseStartedAt = shifted(feast.chaseStartedAt, dt);
  feast.nextRoutineAt = shifted(feast.nextRoutineAt, dt);

  const chicken = game.chicken;
  chicken.modeStartedAt = shifted(chicken.modeStartedAt, dt);
  chicken.modeUntil = shifted(chicken.modeUntil, dt);
  chicken.panicStartedAt = shifted(chicken.panicStartedAt, dt);
  chicken.panicUntil = shifted(chicken.panicUntil, dt);

  const chief = game.chief;
  chief.startedAt = shifted(chief.startedAt, dt);
  chief.nextLineAt = shifted(chief.nextLineAt, dt);
  chief.pausedUntil = shifted(chief.pausedUntil, dt);

  game.streamStartedAt = shifted(game.streamStartedAt, dt);
  game.dominoStartedAt = shifted(game.dominoStartedAt, dt);
  game.wife.visibleUntil = shifted(game.wife.visibleUntil, dt);
  game.wife.commandUntil = shifted(game.wife.commandUntil, dt);
  game.worldGag.chairFallenUntil = shifted(game.worldGag.chairFallenUntil, dt);
  game.worldGag.shoeAirborneUntil = shifted(game.worldGag.shoeAirborneUntil, dt);
  game.worldGag.dogAwakeUntil = shifted(game.worldGag.dogAwakeUntil, dt);
  game.worldGag.macroUntil = shifted(game.worldGag.macroUntil, dt);
  game.worldGag.heesunTwinUntil = shifted(game.worldGag.heesunTwinUntil, dt);

  game.director.activeMicro.forEach((event) => { event.endsAt += dt; });
  game.director.delayedQueue.forEach((event) => { event.dueAt += dt; });
  game.director.nextWorldTickAt += dt;
  game.nextTimeEscalationAt += dt;
  game.nextCollisionCheckAt += dt;
  game.nextCollisionSignalAt += dt;
};

const updateKaraoke = (game: GameState, dt: number, events: GameEvent[]) => {
  if (!game.karaoke.active) return false;
  if (game.elapsed < game.karaoke.endsAt) {
    pauseWorldForKaraoke(game, dt);
    return true;
  }
  game.karaoke.active = false;
  if (game.chief.startedAt > 0) {
    game.chief.stage = Math.max(2, game.chief.stage);
    game.chief.pausedUntil = game.elapsed + .5;
    game.chief.nextLineAt = game.elapsed + 6;
  }
  events.push({ type: 'karaoke-stop' });
  return false;
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
      setMessage(game, 'HEESUN', 'HEESUN', 'Bạn dạo này béo lên đấy.', 'You have put on some weight.', 'heesun', 1.7, 'heesun');
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
    if ((game.heesun.mode === 'idle' || game.heesun.mode === 'wander') && distance(game.player.x, game.player.y, game.heesun.x, game.heesun.y) < 330) {
      setMessage(game, 'HEESUN', 'HEESUN', 'Tôi nghe thấy bạn rồi.', 'I can hear you.', 'heesun', 1.7, 'heesun');
      startChase(game, events, false);
    }
  }
};

const moveTowards = (current: { x: number; y: number; vx: number; vy: number }, target: WorldPoint, speed: number, dt: number, responseRate: number) => {
  const dx = target.x - current.x;
  const dy = target.y - current.y;
  const length = Math.max(0.001, Math.hypot(dx, dy));
  const response = 1 - Math.exp(-dt * responseRate);
  current.vx += ((dx / length) * speed - current.vx) * response;
  current.vy += ((dy / length) * speed - current.vy) * response;
  current.x += current.vx * dt;
  current.y += current.vy * dt;
  return length;
};

const updateFeast = (game: GameState, dt: number, events: GameEvent[]) => {
  const feast = game.feast;
  if (['invite', 'stare', 'react'].includes(feast.mode) && game.elapsed >= feast.modeUntil) feast.mode = 'idle';
  if (feast.mode === 'resetting' && game.elapsed >= feast.modeUntil) Object.assign(feast, { mode: 'idle', vx: 0, vy: 0 });
  if (feast.mode === 'chasing') {
    const chaseTarget = feast.target === 'hanu' && game.hanu.carryingFood ? game.hanu : game.player;
    moveTowards(feast, navigationTarget(feast, chaseTarget), 54, dt, 4.2);
    if (!isWalkable(feast.x, feast.y, 8)) {
      Object.assign(feast, nearestWalkablePoint(feast), { vx: feast.vx * 0.2, vy: feast.vy * 0.2 });
    }
    if (distance(feast.x, feast.y, chaseTarget.x, chaseTarget.y) < 45 || game.elapsed >= feast.modeUntil || (feast.target === 'hanu' && !game.hanu.carryingFood)) {
      Object.assign(feast, { mode: 'resetting', modeUntil: game.elapsed + 1.5, target: 'player', vx: 0, vy: 0 });
      setMessage(game, 'MÂM NHẬU', 'THE DRINKING TABLE', 'Vào làm chén.', 'Come have a cup.', 'world', 1.45, 'feast', 'medium');
    }
    return;
  }
  if (game.elapsed >= feast.nextRoutineAt) {
    feast.routineIndex = (feast.routineIndex + 1) % 5;
    feast.nextRoutineAt = game.elapsed + 3.5 + game.random() * 4.5;
  }
  if (feast.mode === 'idle' && game.elapsed >= feast.nextTriggerAt && game.scene.kind === 'none' && distance(game.player.x, game.player.y, feast.x, feast.y) < 72) {
    Object.assign(feast, {
      mode: 'invite', modeUntil: game.elapsed + 2, nextTriggerAt: game.elapsed + 14,
      encounters: feast.encounters + 1, pendingRelocate: true, relocateAt: game.elapsed + 24,
    });
    setMessage(game, 'MÂM NHẬU', 'THE DRINKING TABLE', 'Vào làm chén.', 'Come have a cup.', 'world', 1.8, 'feast');
    events.push({ type: 'feast' });
  }
  if (feast.pendingRelocate && game.elapsed >= feast.relocateAt && distance(game.player.x, game.player.y, feast.x, feast.y) > 135) {
    feast.locationIndex = (feast.locationIndex + 1) % FEAST_LOCATIONS.length;
    const next = FEAST_LOCATIONS[feast.locationIndex];
    Object.assign(feast, next, { pendingRelocate: false, mode: 'relocating', modeUntil: game.elapsed + 0.4, nextTriggerAt: game.elapsed + 3 });
  }
  if (feast.mode === 'relocating' && game.elapsed >= feast.modeUntil) feast.mode = 'idle';
};

const updateLeader = (game: GameState) => {
  const chief = game.chief;
  if (chief.startedAt === 0 && distance(game.player.x, game.player.y, PHIENG_LOI_LANDMARKS.chief.x, PHIENG_LOI_LANDMARKS.chief.y) < 76 && game.scene.kind === 'none') {
    Object.assign(chief, { startedAt: game.elapsed || 0.001, stage: 0, nextLineAt: game.elapsed + 2.25 });
    addAbsurdity(game, 0.75);
    setMessage(game, 'TRƯỞNG BẢN', 'VILLAGE CHIEF', 'Tôi xin nói ngắn gọn.', 'I will be brief.', 'chief', 2.1, 'chief');
  }
  if (chief.startedAt === 0 || game.elapsed < chief.nextLineAt || game.elapsed < chief.pausedUntil) return;
  chief.stage += 1;
  chief.nextLineAt = game.elapsed + 10 + (chief.stage % 3) * 2;
  const vi = chief.stage === 1 ? 'Thứ nhất…' : chief.stage === 2 ? 'Thứ hai…' : chief.stage === 3 ? 'Thứ ba…' : `Điểm thứ ${chief.stage}…`;
  const en = chief.stage === 1 ? 'Firstly…' : chief.stage === 2 ? 'Secondly…' : chief.stage === 3 ? 'Thirdly…' : `Point number ${chief.stage}…`;
  setMessage(game, 'TRƯỞNG BẢN', 'VILLAGE CHIEF', vi, en, 'chief', 2, 'chief');
};

const updateStream = (game: GameState, events: GameEvent[]) => {
  if (game.streamStartedAt !== 0 || game.scene.kind !== 'none' || distance(game.player.x, game.player.y, PHIENG_LOI_LANDMARKS.stream.x, PHIENG_LOI_LANDMARKS.stream.y) > 68) return;
  game.streamStartedAt = game.elapsed || 0.001;
  game.scene = { kind: 'stream', startedAt: game.elapsed, stage: 0 };
  game.player.vx = 0;
  game.player.vy = 0;
  addAbsurdity(game, 0.8);
  events.push({ type: 'stream' });
};

const startHaNuInitialPromise = (game: GameState, events: GameEvent[]) => {
  Object.assign(game.hanu, { mode: 'promise-initial', modeUntil: game.elapsed + 2.6, promiseStage: 1, nextPromiseAt: game.elapsed + 20 });
  setMessage(game, 'HANU · ĐIỆN THOẠI', 'HANU · ON THE PHONE', "Alo, 30' nữa tôi ship cơm cho bạn.", "Hello, I'll deliver your food in 30 minutes.", 'hanu', 2.55, 'hanu', 'medium');
  events.push({ type: 'phone' });
};

const startHaNuRepeatPromise = (game: GameState, events: GameEvent[]) => {
  Object.assign(game.hanu, { mode: 'promise-repeat', modeUntil: game.elapsed + 4.9, promiseStage: 2, deliveryStartAt: game.elapsed + 7 });
  setMessage(game, 'HANU', 'HANU', "30' nữa tôi ship.", "I'll deliver it in 30 minutes.", 'hanu', 1.3, 'hanu', 'medium');
  queueDialogue(game, { speakerVi: 'BẠN', speakerEn: 'YOU', textVi: "30' trước bạn cũng nói thế mà.", textEn: 'You said that 30 minutes ago.', delay: 1.45, duration: 1.65, priority: 'medium', interruptible: false, styleVariant: 'plain', anchor: 'player' });
  queueDialogue(game, { speakerVi: 'HANU', speakerEn: 'HANU', textVi: 'Ừ.', textEn: 'Yeah.', delay: 3.3, duration: 1, priority: 'medium', interruptible: false, styleVariant: 'hanu', anchor: 'hanu' });
  events.push({ type: 'phone' });
};

const startHaNuDelivery = (game: GameState, events: GameEvent[]) => {
  Object.assign(game.hanu, {
    mode: 'delivering', modeUntil: 0, carryingFood: true, deliveryCycle: game.hanu.deliveryCycle + 1,
    deliveryTimeoutAt: game.elapsed + 55, speedBoostUntil: 0,
  });
  game.recurringFlags.add('hanu-delivery-started');
  events.push({ type: 'delivery-start' });
};

const completeHaNuDelivery = (game: GameState, events: GameEvent[]) => {
  Object.assign(game.hanu, { mode: 'delivered', modeUntil: game.elapsed + 4.2, carryingFood: false, receivedCount: game.hanu.receivedCount + 1 });
  game.recurringFlags.add('hanu-delivery-complete');
  setMessage(game, 'HANU', 'HANU', 'Cơm.', 'Food.', 'hanu', 1.2, 'hanu', 'high', false);
  queueDialogue(game, { speakerVi: 'BẠN', speakerEn: 'YOU', textVi: 'Cuối cùng.', textEn: 'Finally.', delay: 1.35, duration: 1.2, priority: 'medium', interruptible: true, styleVariant: 'plain', anchor: 'player' });
  events.push({ type: 'delivery-complete' });
};

const updateHaNu = (game: GameState, dt: number, events: GameEvent[]) => {
  const hanu = game.hanu;
  if (hanu.promiseStage === 0 && game.elapsed >= hanu.nextPromiseAt && game.scene.kind === 'none') startHaNuInitialPromise(game, events);
  if (hanu.promiseStage === 1 && game.elapsed >= hanu.nextPromiseAt && game.scene.kind === 'none' && (distance(game.player.x, game.player.y, hanu.x, hanu.y) < 180 || game.elapsed >= hanu.nextPromiseAt + 10)) startHaNuRepeatPromise(game, events);
  if (hanu.promiseStage === 2 && !hanu.carryingFood && hanu.mode !== 'delivered' && hanu.mode !== 'resetting' && game.elapsed >= hanu.deliveryStartAt) startHaNuDelivery(game, events);
  if ((hanu.mode === 'promise-initial' || hanu.mode === 'promise-repeat') && game.elapsed >= hanu.modeUntil) hanu.mode = 'phone-loop';
  if (hanu.mode === 'delivery-paused' && game.elapsed >= hanu.modeUntil) hanu.mode = 'delivering';
  if (hanu.mode === 'delivered' && game.elapsed >= hanu.modeUntil) Object.assign(hanu, { mode: 'resetting', modeUntil: game.elapsed + 2 });
  else if (hanu.mode === 'resetting' && game.elapsed >= hanu.modeUntil) Object.assign(hanu, { mode: 'phone-loop', promiseStage: 1, nextPromiseAt: game.elapsed + 35 });

  if ((hanu.mode === 'delivering' || hanu.mode === 'delivery-paused') && hanu.carryingFood) {
    if (distance(game.player.x, game.player.y, hanu.x, hanu.y) < 23) {
      completeHaNuDelivery(game, events);
      return;
    }
    if (game.elapsed >= hanu.deliveryTimeoutAt) {
      hanu.deliveryTimeoutAt = game.elapsed + 35;
      hanu.speedBoostUntil = 0;
      setMessage(game, 'HANU', 'HANU', '30 phút nữa.', 'Thirty more minutes.', 'hanu', 1.35, 'hanu');
    }
  }

  const target = HANU_ROUTE[hanu.waypoint % HANU_ROUTE.length];
  const dx = target.x - hanu.x;
  const dy = target.y - hanu.y;
  const length = Math.max(0.001, Math.hypot(dx, dy));
  const speed = hanu.mode === 'delivery-paused' ? 0 : 31 * (game.powerUntil.coffee > game.elapsed ? 0.22 : 1) * (hanu.carryingFood ? 1.22 : 1) * (hanu.speedBoostUntil > game.elapsed ? 1.38 : 1);
  hanu.vx = (dx / length) * speed;
  hanu.vy = (dy / length) * speed;
  hanu.x += hanu.vx * dt;
  hanu.y += hanu.vy * dt;
  if (length < 8) {
    hanu.waypoint = (hanu.waypoint + 1) % HANU_ROUTE.length;
    if (hanu.carryingFood && game.elapsed >= hanu.nextPauseAt && game.random() < 0.24) {
      Object.assign(hanu, { mode: 'delivery-paused', modeUntil: game.elapsed + 0.3 + game.random() * 0.2, nextPauseAt: game.elapsed + 6 });
    }
    runDirectorSignal(game, 'waypoint', events);
  }
  if (game.elapsed >= hanu.nextLineAt && game.scene.kind !== 'capture' && hanu.mode === 'phone-loop') {
    const lines = [['Ừ.', 'Yeah.'], ['Ừ.', 'Yeah.'], ['Thế à?', 'Really?'], ['Ừ.', 'Yeah.']];
    const line = lines[hanu.lineIndex % lines.length];
    hanu.lineIndex += 1;
    hanu.nextLineAt = game.elapsed + 6 + (hanu.lineIndex % 3) * 1.5;
    setMessage(game, 'HANU · ĐIỆN THOẠI', 'HANU · ON THE PHONE', line[0], line[1], 'hanu', 1.1, 'hanu');
    events.push({ type: 'phone' });
  }
  if (!hanu.saidAtStream && distance(hanu.x, hanu.y, PHIENG_LOI_LANDMARKS.stream.x, PHIENG_LOI_LANDMARKS.stream.y) < 65) {
    hanu.saidAtStream = true;
    setMessage(game, 'HANU · GIỮA SUỐI', 'HANU · IN THE STREAM', 'Ừ, tôi đang ở nhà.', 'Yeah, I am at home.', 'hanu', 2.2, 'hanu');
    events.push({ type: 'phone' });
    addAbsurdity(game, 0.45);
  }
  if (!game.gateOpen && game.absurdityLevel >= 1 && distance(hanu.x, hanu.y, PHIENG_LOI_LANDMARKS.gate.x, PHIENG_LOI_LANDMARKS.gate.y) < 54) game.gateOpen = true;
  if (game.dominoStartedAt === 0 && distance(hanu.x, hanu.y, PHIENG_LOI_LANDMARKS.domino.x, PHIENG_LOI_LANDMARKS.domino.y) < 48) {
    game.dominoStartedAt = game.elapsed;
    setMessage(game, 'PHIÊNG LƠI', 'PHIENG LOI', 'HaNu không hề nhìn thấy chuyện vừa xảy ra.', 'HaNu does not notice what just happened.', 'world', 2, 'hanu');
    events.push({ type: 'domino' });
  }
};

const moveHeeSunTowards = (game: GameState, targetX: number, targetY: number, speed: number, dt: number, turnResponse: number) => {
  if (game.elapsed >= game.heesun.nextNavigationAt) {
    const waypoint = navigationTarget(game.heesun, { x: targetX, y: targetY });
    Object.assign(game.heesun, { navigationX: waypoint.x, navigationY: waypoint.y, nextNavigationAt: game.elapsed + 0.18 });
  }
  const baseAngle = Math.atan2(game.heesun.navigationY - game.heesun.y, game.heesun.navigationX - game.heesun.x);
  const options = [0, 0.42, -0.42, 0.82, -0.82, 1.25, -1.25];
  const steeringAngle = options.map((offset) => baseAngle + offset)
    .find((angle) => !isBlocked(game, game.heesun.x + Math.cos(angle) * 32, game.heesun.y + Math.sin(angle) * 32)) ?? baseAngle;
  const response = 1 - Math.exp(-dt * turnResponse);
  game.heesun.vx += (Math.cos(steeringAngle) * speed - game.heesun.vx) * response;
  game.heesun.vy += (Math.sin(steeringAngle) * speed - game.heesun.vy) * response;
  const nextX = game.heesun.x + game.heesun.vx * dt;
  if (!isBlocked(game, nextX, game.heesun.y)) game.heesun.x = nextX; else game.heesun.vx *= -0.24;
  const nextY = game.heesun.y + game.heesun.vy * dt;
  if (!isBlocked(game, game.heesun.x, nextY)) game.heesun.y = nextY; else game.heesun.vy *= -0.24;
};

const updateHeeSun = (game: GameState, dt: number, events: GameEvent[]) => {
  const heesun = game.heesun;
  if (!heesun.met && game.scene.kind === 'none' && distance(game.player.x, game.player.y, heesun.x, heesun.y) < 82) startHeeSunIntro(game);
  if (heesun.mode === 'notice' && game.elapsed >= heesun.modeUntil) heesun.mode = 'idle';
  if (heesun.mode === 'ambush' && game.elapsed >= heesun.modeUntil) startChase(game, events);
  if ((heesun.mode === 'drinking' || heesun.mode === 'interrupted') && game.elapsed >= heesun.modeUntil) {
    const resume = heesun.resumeMode;
    heesun.resumeMode = null;
    if (resume === 'chasing') startChase(game, events, false); else heesun.mode = 'idle';
  }
  if (heesun.mode === 'reset' && game.elapsed >= heesun.modeUntil) {
    Object.assign(heesun, nearestWalkablePoint(PHIENG_LOI_LANDMARKS.heesunStart), { mode: 'idle', nextWanderAt: game.elapsed + 5 });
  }
  if (heesun.mode === 'rare-flee') {
    moveHeeSunTowards(game, PHIENG_LOI_LANDMARKS.exit.x, PHIENG_LOI_LANDMARKS.exit.y, 104, dt, 5.2);
    if (game.elapsed >= heesun.modeUntil) Object.assign(heesun, nearestWalkablePoint(PHIENG_LOI_LANDMARKS.heesunStart), { mode: 'idle' });
    return;
  }
  if ((heesun.mode === 'idle' || heesun.mode === 'wander') && heesun.met && game.elapsed >= heesun.nextWanderAt) {
    heesun.mode = 'wander';
    const target = HEESUN_WANDER_POINTS[heesun.wanderTarget % HEESUN_WANDER_POINTS.length];
    if (distance(heesun.x, heesun.y, target.x, target.y) < 16) {
      Object.assign(heesun, { wanderTarget: (heesun.wanderTarget + 1) % HEESUN_WANDER_POINTS.length, nextWanderAt: game.elapsed + 4 + game.random() * 5, mode: 'idle' });
    } else moveHeeSunTowards(game, target.x, target.y, 20, dt, 2.4);
  }
  if ((heesun.mode === 'idle' || heesun.mode === 'wander') && heesun.met && distance(game.player.x, game.player.y, heesun.x, heesun.y) < 92) startChase(game, events);
  if (heesun.mode === 'distracted') {
    const target = heesun.target === 'hanu' ? game.hanu : heesun.target === 'chickens' ? PHIENG_LOI_LANDMARKS.chickenYard : game.player;
    moveHeeSunTowards(game, target.x, target.y, 63, dt, 3.1);
    if (game.elapsed >= heesun.modeUntil) {
      heesun.target = 'player';
      startChase(game, events, false);
    }
    return;
  }
  if (heesun.mode !== 'chasing' || game.scene.kind === 'stream' || game.scene.kind === 'capture') {
    heesun.vx *= Math.max(0, 1 - dt * 6);
    heesun.vy *= Math.max(0, 1 - dt * 6);
    return;
  }
  if (heesun.target === 'hanu') {
    moveHeeSunTowards(game, game.hanu.x, game.hanu.y, 72, dt, 3.35);
    if (!game.hanu.carryingFood || game.elapsed >= heesun.chaseTimeoutAt) stopChase(game, events, false);
    return;
  }
  const captureRadius = 17 * Math.max(1, heesun.scale * 0.8);
  if (distance(game.player.x, game.player.y, heesun.x, heesun.y) < captureRadius) {
    startCapture(game, events);
    return;
  }
  moveHeeSunTowards(game, game.player.x, game.player.y, (game.absurdityLevel >= 3 ? 74 : 68) * (heesun.speedBoostUntil > game.elapsed ? 1.3 : 1), dt, 3.45);
  const gap = distance(game.player.x, game.player.y, heesun.x, heesun.y);
  if (gap < captureRadius) startCapture(game, events);
  else if (gap > 390) {
    if (heesun.lostSince === 0) heesun.lostSince = game.elapsed;
    if (game.elapsed - heesun.lostSince > 3.6) stopChase(game, events);
  } else heesun.lostSince = 0;
  if (game.elapsed >= heesun.chaseTimeoutAt) stopChase(game, events);
};

const updateChicken = (game: GameState) => {
  if (game.chicken.mode !== 'peck' && game.elapsed >= game.chicken.modeUntil) Object.assign(game.chicken, { mode: 'peck', visibleCount: 4, panicUntil: 0 });
};

const locationAt = (game: GameState) => {
  const locations: Array<[string, WorldPoint, number]> = [
    ['stream', PHIENG_LOI_LANDMARKS.stream, 135], ['chief-house', PHIENG_LOI_LANDMARKS.chief, 120],
    ['feast', game.feast, 120], ['chicken-yard', PHIENG_LOI_LANDMARKS.chickenYard, 130],
    ['bridge', PHIENG_LOI_LANDMARKS.bridge, 115], ['east-field', PHIENG_LOI_LANDMARKS.exit, 180],
  ];
  return locations.find(([, point, radius]) => distance(game.player.x, game.player.y, point.x, point.y) < radius)?.[0] ?? 'village-road';
};

const updateDirector = (game: GameState, events: GameEvent[]) => {
  const finished = finishExpiredEvents(game.director, game.elapsed);
  const nextDelayed = game.director.delayedQueue[0];
  if (nextDelayed && nextDelayed.dueAt <= game.elapsed) {
    takeDueEvents(game.director, game.elapsed, directorContext(game), game.absurdityLevel, game.random)
      .forEach((resolution) => applyDirectedEvent(game, resolution, events));
  }
  if (finished.length > 0 && !game.director.activeMajor) runDirectorSignal(game, 'event-end', events);
  const location = locationAt(game);
  if (location !== game.currentLocation) {
    game.currentLocation = location;
    game.recentLocations = [...game.recentLocations.filter((item) => item !== location), location].slice(-6);
    runDirectorSignal(game, 'zone', events);
  }
  if (game.elapsed >= game.director.nextWorldTickAt) {
    game.director.nextWorldTickAt = game.elapsed + 3.5 + game.random() * 2.2;
    runDirectorSignal(game, 'world-tick', events);
  }
  if (game.elapsed >= game.nextCollisionCheckAt) {
    game.nextCollisionCheckAt = game.elapsed + 0.2;
    const heesunHanu = distance(game.heesun.x, game.heesun.y, game.hanu.x, game.hanu.y) < 34;
    const heesunFeast = distance(game.heesun.x, game.heesun.y, game.feast.x, game.feast.y) < 68;
    const heesunChicken = distance(game.heesun.x, game.heesun.y, PHIENG_LOI_LANDMARKS.chickenYard.x, PHIENG_LOI_LANDMARKS.chickenYard.y) < 65;
    const playerHanu = game.hanu.carryingFood && distance(game.player.x, game.player.y, game.hanu.x, game.hanu.y) < 48;
    const collisionSignature = [heesunHanu && 'heesun-hanu', heesunFeast && 'heesun-feast', heesunChicken && 'heesun-chicken', playerHanu && 'player-hanu']
      .filter(Boolean).join('|');
    if (collisionSignature && (collisionSignature !== game.lastCollisionSignature || game.elapsed >= game.nextCollisionSignalAt)) {
      game.lastCollisionSignature = collisionSignature;
      game.nextCollisionSignalAt = game.elapsed + 2.5;
      runDirectorSignal(game, 'collision', events);
    } else if (!collisionSignature) game.lastCollisionSignature = '';
    const chaosNearChief = (
      (heesunHanu && distance(game.heesun.x, game.heesun.y, PHIENG_LOI_LANDMARKS.chief.x, PHIENG_LOI_LANDMARKS.chief.y) < 100)
      || (heesunFeast && distance(game.feast.x, game.feast.y, PHIENG_LOI_LANDMARKS.chief.x, PHIENG_LOI_LANDMARKS.chief.y) < 115)
      || (game.feast.mode === 'chasing' && distance(game.feast.x, game.feast.y, PHIENG_LOI_LANDMARKS.chief.x, PHIENG_LOI_LANDMARKS.chief.y) < 115)
    );
    if (chaosNearChief && game.chief.startedAt !== 0) game.chief.pausedUntil = game.elapsed + 0.5;
  }
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
  updatePhaOiCooldown(game, previousElapsed, events);
  updateDialogue(game);
  updateScene(game, events);
  const karaokePausesWorld = updateKaraoke(game, dt, events);

  let moveX = input.moveX;
  let moveY = input.moveY;
  if (Math.abs(moveX) < 0.08) moveX = Number(input.right) - Number(input.left);
  if (Math.abs(moveY) < 0.08) moveY = Number(input.down) - Number(input.up);
  const inputLength = Math.hypot(moveX, moveY);
  if (inputLength > 1) { moveX /= inputLength; moveY /= inputLength; }
  const introAge = game.scene.kind === 'heesun-intro' ? game.elapsed - game.scene.startedAt : 99;
  const controlsLocked = game.scene.kind === 'capture' || (game.scene.kind === 'heesun-intro' && introAge < 3.75) || game.complete;
  let moving = false;
  if (!controlsLocked) {
    const previousX = game.player.x;
    const previousY = game.player.y;
    const response = 1 - Math.exp(-dt * 14);
    game.player.vx += (moveX * PLAYER_SPEED - game.player.vx) * response;
    game.player.vy += (moveY * PLAYER_SPEED - game.player.vy) * response;
    const nextX = game.player.x + game.player.vx * dt;
    if (!isBlocked(game, nextX, game.player.y)) game.player.x = nextX; else game.player.vx = 0;
    const nextY = game.player.y + game.player.vy * dt;
    if (!isBlocked(game, game.player.x, nextY)) game.player.y = nextY; else game.player.vy = 0;
    const movedDistance = distance(previousX, previousY, game.player.x, game.player.y);
    moving = movedDistance > 0.01;
    if (inputLength > 0.08) { game.player.facingX = moveX; game.player.facingY = moveY; }
    if (moving) {
      game.player.walk += (movedDistance / PLAYER_SPEED) * 9.2;
      if (game.elapsed >= game.nextFootstepAt) {
        game.nextFootstepAt = game.elapsed + 0.36;
        events.push({ type: 'footstep' });
        if (game.quality === 'high') addParticles(game, game.player.x, game.player.y + 5, ['#9f815b', '#c8ac75'], 2, 'dust', 8);
      }
    }
  } else { game.player.vx = 0; game.player.vy = 0; }

  updatePowers(game, previousElapsed, moving, events);
  if (!karaokePausesWorld) {
    updateFeast(game, dt, events);
    updateLeader(game);
    updateStream(game, events);
    updateHaNu(game, dt, events);
    updateHeeSun(game, dt, events);
    updateChicken(game);
    if (game.worldGag.macro !== 'none' && game.elapsed >= game.worldGag.macroUntil) game.worldGag.macro = 'none';
    updateDirector(game, events);
    if (game.elapsed >= game.nextTimeEscalationAt) { game.nextTimeEscalationAt = game.elapsed + 45; addAbsurdity(game, 0.35); }
  }
  if (input.callQueued && game.scene.kind !== 'capture' && !game.complete) handleCall(game, events);
  if (!game.complete && distance(game.player.x, game.player.y, PHIENG_LOI_LANDMARKS.exit.x, PHIENG_LOI_LANDMARKS.exit.y) < 34) {
    game.complete = true;
    game.player.vx = 0;
    game.player.vy = 0;
    setMessage(game, 'PHIÊNG LƠI', 'PHIENG LOI', 'Bạn đã ra khỏi bản. Phía sau vẫn có người gọi “Bạn ơi…”.', 'You made it out. Behind you, someone is still calling “My friend…”', 'world', 4, 'world', 'high', false);
    events.push({ type: 'exit' });
  }
  game.fishBoost = Math.max(0, game.fishBoost - dt * 0.45);
  updateParticles(game, dt);
  updateCamera(game, dt);
  clearQueuedInput(input);
  return events;
};

export const directorDefinitionFor = (id: DirectedEventId) => getEventDefinition(id);
