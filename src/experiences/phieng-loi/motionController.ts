import type { GameState } from './gameEngine';

export type MotionActorId =
  | 'player'
  | 'heesun'
  | 'hanu'
  | 'feast'
  | 'chief'
  | 'stream'
  | 'vuongme'
  | 'wife'
  | 'dog'
  | 'chicken';

export type MotionView = 'side' | 'down' | 'up';

export type ActorMotion =
  | 'idle'
  | 'start'
  | 'move'
  | 'walk'
  | 'run'
  | 'turn'
  | 'stop'
  | 'shout'
  | 'caught'
  | 'seated-tired'
  | 'wander'
  | 'notice'
  | 'intro'
  | 'chase'
  | 'chase-distracted'
  | 'recoil'
  | 'drinking'
  | 'ambush'
  | 'victory'
  | 'reset'
  | 'flee'
  | 'seated-toast'
  | 'phone-walk'
  | 'phone-pause'
  | 'delivery'
  | 'delivery-fast'
  | 'handoff'
  | 'delivered'
  | 'feast-idle'
  | 'feast-stare'
  | 'feast-rise'
  | 'feast-chase'
  | 'feast-reset'
  | 'talk'
  | 'observe-hold'
  | 'stream-idle'
  | 'stream-react'
  | 'stream-arrive'
  | 'peck'
  | 'look'
  | 'panic'
  | 'awake'
  | 'command'
  | 'dance-player'
  | 'dance-heesun'
  | 'dance-hanu'
  | 'dance-feast'
  | 'dance-chief'
  | 'dance-stream'
  | 'dance-vuongme'
  | 'dance-animal';

export type MotionSnapshot = {
  motion: ActorMotion;
  localMotionTime: number;
  framePhase: number;
  facing: number;
  view: MotionView;
};

export type MotionTrack = {
  currentMotion: ActorMotion;
  previousMotion: ActorMotion;
  motionEnteredAt: number;
  localMotionTime: number;
  facing: number;
  previousFacing: number;
  turnStartedAt: number;
  reactionUntil: number;
  visualOverride: ActorMotion | null;
  preEventMotionState: MotionSnapshot | null;
  pendingFacing: number;
  transitionUntil: number;
  settleMotion: ActorMotion | null;
  lastUpdatedAt: number;
  speed: number;
  phaseOffset: number;
  /** Integrated atlas-frame clock; changing speed must not rewrite past phase. */
  framePhase: number;
  view: MotionView;
  pendingView: MotionView;
  viewStartedAt: number;
};

export type MotionController = Record<MotionActorId, MotionTrack>;

type MotionRequest = {
  motion: ActorMotion;
  now: number;
  vx?: number;
  vy?: number;
  facingHint?: number;
  visualOverride?: ActorMotion | null;
  reactionUntil?: number;
  allowLocomotionTransitions?: boolean;
  directionalView?: boolean;
};

export type MotionPose = {
  x: number;
  y: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
};

const ACTOR_PHASE: Record<MotionActorId, number> = {
  player: 0,
  heesun: .73,
  hanu: 1.47,
  feast: 2.16,
  chief: 2.82,
  stream: 3.51,
  vuongme: 4.2,
  wife: 4.86,
  dog: 5.42,
  chicken: 6.04,
};

const LOCOMOTION = new Set<ActorMotion>([
  'move', 'walk', 'run', 'wander', 'chase', 'chase-distracted', 'flee', 'phone-walk',
  'delivery', 'delivery-fast', 'feast-chase', 'stream-arrive', 'panic',
]);

const DANCE: Record<Exclude<MotionActorId, 'wife'>, ActorMotion> = {
  player: 'dance-player',
  heesun: 'dance-heesun',
  hanu: 'dance-hanu',
  feast: 'dance-feast',
  chief: 'dance-chief',
  stream: 'dance-stream',
  vuongme: 'dance-vuongme',
  dog: 'dance-animal',
  chicken: 'dance-animal',
};

const createTrack = (actor: MotionActorId, now: number): MotionTrack => ({
  currentMotion: 'idle',
  previousMotion: 'idle',
  motionEnteredAt: now,
  localMotionTime: 0,
  facing: 1,
  previousFacing: 1,
  turnStartedAt: 0,
  reactionUntil: 0,
  visualOverride: null,
  preEventMotionState: null,
  pendingFacing: 1,
  transitionUntil: 0,
  settleMotion: null,
  lastUpdatedAt: now,
  speed: 0,
  phaseOffset: ACTOR_PHASE[actor],
  framePhase: 0,
  view: actor === 'player' ? 'down' : 'side',
  pendingView: actor === 'player' ? 'down' : 'side',
  viewStartedAt: 0,
});

/**
 * Three directional drawings replace the old mirrored side-only player. The
 * wider exit threshold keeps shallow diagonal input from flickering between
 * atlases; changing view never resets the accumulated stride phase.
 */
export const directionalViewForVelocity = (
  current: MotionView,
  vx: number,
  vy: number,
): MotionView => {
  const ax = Math.abs(vx);
  const ay = Math.abs(vy);
  if (Math.hypot(vx, vy) <= 3) return current;
  if (current === 'side') return ay > ax * 1.18 ? (vy > 0 ? 'down' : 'up') : 'side';
  if (ax > ay * 1.12) return 'side';
  if (ay > ax * .72) return vy > 0 ? 'down' : 'up';
  return current;
};

export const createMotionController = (now = 0): MotionController => ({
  player: createTrack('player', now),
  heesun: createTrack('heesun', now),
  hanu: createTrack('hanu', now),
  feast: createTrack('feast', now),
  chief: createTrack('chief', now),
  stream: createTrack('stream', now),
  vuongme: createTrack('vuongme', now),
  wife: createTrack('wife', now),
  dog: createTrack('dog', now),
  chicken: createTrack('chicken', now),
});

const enterMotion = (
  track: MotionTrack,
  motion: ActorMotion,
  now: number,
  duration = 0,
  settleMotion: ActorMotion | null = null,
) => {
  if (track.currentMotion === motion && track.settleMotion === settleMotion) return;
  const isStride = (value: ActorMotion) => LOCOMOTION.has(value) || value === 'start' || value === 'turn' || value === 'stop';
  if (!isStride(track.currentMotion) || !isStride(motion)) track.framePhase = 0;
  track.previousMotion = track.currentMotion;
  track.currentMotion = motion;
  track.motionEnteredAt = now;
  track.localMotionTime = 0;
  track.transitionUntil = duration > 0 ? now + duration : 0;
  track.settleMotion = settleMotion;
};

/**
 * Converts an actor state request into a visual motion. Short locomotion
 * transitions and direction hysteresis live here, never in EventDirector.
 */
export const advanceMotion = (track: MotionTrack, request: MotionRequest): MotionTrack => {
  const dt = Math.max(0, Math.min(.1, request.now - track.lastUpdatedAt));
  track.lastUpdatedAt = request.now;
  track.localMotionTime += dt;
  // Integrate the interval at the previous sample's rate. A new velocity applies
  // from this sample onward, not retroactively to the entire action duration.
  track.framePhase += dt * motionFrameRate(track);
  track.speed = Math.hypot(request.vx ?? 0, request.vy ?? 0);
  if (request.reactionUntil !== undefined) track.reactionUntil = Math.max(track.reactionUntil, request.reactionUntil);

  if (request.directionalView) {
    const desiredView = directionalViewForVelocity(track.view, request.vx ?? 0, request.vy ?? 0);
    if (desiredView !== track.view) {
      if (track.pendingView !== desiredView) {
        track.pendingView = desiredView;
        track.viewStartedAt = request.now;
      } else if (request.now - track.viewStartedAt >= .065) {
        track.view = desiredView;
        track.viewStartedAt = request.now;
      }
    } else {
      track.pendingView = desiredView;
      track.viewStartedAt = 0;
    }
  }

  const desiredFacing = Math.abs(request.facingHint ?? request.vx ?? 0) > .001
    ? Math.sign(request.facingHint ?? request.vx ?? 1)
    : track.facing;
  if (desiredFacing !== track.facing) {
    if (track.pendingFacing !== desiredFacing) {
      track.pendingFacing = desiredFacing;
      track.turnStartedAt = request.now;
    } else if (request.now - track.turnStartedAt >= .075 && track.speed > 3) {
      track.previousFacing = track.facing;
      track.facing = desiredFacing;
      track.turnStartedAt = request.now;
      if (request.allowLocomotionTransitions && LOCOMOTION.has(request.motion)) {
        enterMotion(track, 'turn', request.now, .11, request.motion);
      }
    }
  } else {
    track.pendingFacing = desiredFacing;
    track.turnStartedAt = 0;
  }

  const nextOverride = request.visualOverride ?? null;
  if (nextOverride) {
    if (track.visualOverride !== nextOverride) {
      if (!track.visualOverride) {
        track.preEventMotionState = {
          motion: track.currentMotion,
          localMotionTime: track.localMotionTime,
          framePhase: track.framePhase,
          facing: track.facing,
          view: track.view,
        };
      }
      track.visualOverride = nextOverride;
      enterMotion(track, nextOverride, request.now);
    }
    return track;
  }

  if (track.visualOverride) {
    const suspended = track.preEventMotionState;
    track.visualOverride = null;
    track.preEventMotionState = null;
    track.previousMotion = track.currentMotion;
    track.currentMotion = request.motion;
    track.motionEnteredAt = request.now - (suspended?.motion === request.motion ? suspended.localMotionTime : 0);
    track.localMotionTime = suspended?.motion === request.motion ? suspended.localMotionTime : 0;
    track.framePhase = suspended?.motion === request.motion ? suspended.framePhase : 0;
    track.facing = suspended?.facing ?? track.facing;
    track.view = suspended?.view ?? track.view;
    track.pendingView = track.view;
    track.transitionUntil = 0;
    track.settleMotion = null;
    return track;
  }

  if (track.transitionUntil > request.now && track.settleMotion === request.motion) return track;
  if (track.transitionUntil > 0 && request.now >= track.transitionUntil && track.settleMotion) {
    const settle = track.settleMotion;
    enterMotion(track, settle, request.now);
  }
  if (track.currentMotion === request.motion) return track;

  if (request.allowLocomotionTransitions) {
    const wasMoving = LOCOMOTION.has(track.currentMotion) || LOCOMOTION.has(track.settleMotion ?? 'idle');
    const willMove = LOCOMOTION.has(request.motion);
    if (track.currentMotion === 'shout' && willMove) {
      enterMotion(track, request.motion, request.now);
      return track;
    }
    if (!wasMoving && willMove) {
      enterMotion(track, 'start', request.now, .12, request.motion);
      return track;
    }
    if (wasMoving && !willMove && request.motion === 'idle') {
      enterMotion(track, 'stop', request.now, .16, 'idle');
      return track;
    }
  }
  enterMotion(track, request.motion, request.now);
  return track;
};

const activeCue = (game: GameState, actor: MotionActorId) => {
  const cue = game.animationCues[actor];
  return cue && cue.until > game.elapsed ? cue.cue : null;
};

export const actorMotionForGame = (game: GameState, actor: MotionActorId): ActorMotion => {
  if (game.karaoke.active && actor !== 'wife') return DANCE[actor];
  const cue = activeCue(game, actor);
  const speed = actor === 'player'
    ? Math.hypot(game.player.vx, game.player.vy)
    : actor === 'heesun'
      ? Math.hypot(game.heesun.vx, game.heesun.vy)
      : actor === 'hanu'
        ? Math.hypot(game.hanu.vx, game.hanu.vy)
        : Math.hypot(game.feast.vx, game.feast.vy);

  if (actor === 'player') {
    if (game.scene.kind === 'capture') return game.scene.stage >= 1 ? 'seated-tired' : 'caught';
    if (game.callPulseUntil > game.elapsed) return 'shout';
    return speed >= 60 ? 'run' : speed > 4 ? 'walk' : 'idle';
  }
  if (actor === 'heesun') {
    if (game.scene.kind === 'capture') return game.scene.stage >= 1 ? 'seated-toast' : 'victory';
    if (cue === 'comic-bump' || cue === 'heesun-shoe') return 'recoil';
    if (cue === 'heesun-drink') return 'drinking';
    const mapping: Record<typeof game.heesun.mode, ActorMotion> = {
      idle: 'idle', wander: 'wander', notice: 'notice', intro: 'intro', chasing: 'chase',
      distracted: 'chase-distracted', interrupted: 'recoil', drinking: 'drinking', ambush: 'ambush',
      'caught-player': 'victory', reset: 'reset', 'rare-flee': 'flee',
    };
    return mapping[game.heesun.mode];
  }
  if (actor === 'hanu') {
    if (cue === 'hanu-handoff' || cue === 'hanu-pull-box') return 'handoff';
    if (cue === 'hanu-phone-pause' || cue === 'hanu-phone-call') return 'phone-pause';
    if (cue === 'hanu-wrong-turn') return 'delivery-fast';
    if (game.hanu.mode === 'delivery-paused') return 'phone-pause';
    if (game.hanu.mode === 'delivered') return 'delivered';
    if (game.hanu.carryingFood) return game.hanu.speedBoostUntil > game.elapsed ? 'delivery-fast' : 'delivery';
    return speed > 3 ? 'phone-walk' : 'phone-pause';
  }
  if (actor === 'feast') {
    if (cue === 'feast-stare' || game.feast.mode === 'stare') return 'feast-stare';
    if (cue === 'feast-react' || game.feast.mode === 'react' || game.feast.mode === 'invite') return 'feast-rise';
    if (game.feast.mode === 'chasing' && game.elapsed - game.feast.chaseStartedAt < .46) return 'feast-rise';
    if (game.feast.mode === 'chasing') return 'feast-chase';
    if (game.feast.mode === 'resetting') return 'feast-reset';
    return 'feast-idle';
  }
  if (actor === 'chief') return game.chief.pausedUntil > game.elapsed ? 'observe-hold' : game.chief.startedAt > 0 ? 'talk' : 'idle';
  if (actor === 'stream') {
    if (game.karaoke.active) return 'dance-stream';
    return game.streamStartedAt > 0 && game.elapsed - game.streamStartedAt < 5.35 ? 'stream-react' : 'stream-idle';
  }
  if (actor === 'vuongme') return 'dance-vuongme';
  if (actor === 'wife') return game.wife.commandUntil > game.elapsed ? 'command' : 'idle';
  if (actor === 'dog') return game.worldGag.dogAwakeUntil > game.elapsed ? 'awake' : 'idle';
  if (actor === 'chicken') {
    if (game.chicken.mode === 'peck') return 'peck';
    if (game.chicken.mode === 'look' || game.chicken.mode === 'triple-look') return 'look';
    return 'panic';
  }
  return 'idle';
};

export const motionFrameRate = (track: MotionTrack) => {
  const speed = track.speed;
  switch (track.currentMotion) {
    case 'move': return Math.max(6.8, Math.min(11, speed / 8.5));
    case 'walk': return Math.max(4.8, Math.min(8.2, speed / 7));
    case 'run': return Math.max(7.4, Math.min(11.2, speed / 8.5));
    case 'wander': return Math.max(3.2, Math.min(5.2, speed / 5));
    case 'chase': case 'chase-distracted': return Math.max(7.2, Math.min(11.2, speed / 7.2));
    case 'flee': return Math.max(10, Math.min(13, speed / 7));
    case 'phone-walk': return Math.max(4, Math.min(6.2, speed / 6.2));
    case 'delivery': return Math.max(5.4, Math.min(7.4, speed / 6));
    case 'delivery-fast': return Math.max(7, Math.min(9.8, speed / 5.6));
    case 'feast-chase': return Math.max(7.5, Math.min(10.5, speed / 6));
    case 'dance-player': return 6.6;
    case 'dance-heesun': return 8.2;
    case 'dance-hanu': return 5.8;
    case 'dance-feast': return 8.8;
    case 'dance-chief': return 4.6;
    case 'dance-stream': return 6.9;
    case 'dance-vuongme': return 9.2;
    case 'dance-animal': return 7.4;
    case 'talk': return 4.8;
    case 'feast-idle': return 1.35;
    case 'stream-idle': return 1.7;
    default: return 4.5;
  }
};

export const frameForTrack = (track: MotionTrack, frameCount: number, reducedMotion: boolean, frameOffset = 0) => (
  reducedMotion ? frameOffset % frameCount : (Math.floor(track.framePhase + track.phaseOffset) + frameOffset) % frameCount
);

const easeOutBack = (value: number) => {
  const c = 1.70158;
  const t = value - 1;
  return 1 + (c + 1) * t ** 3 + c * t ** 2;
};

/** Samples intentional body motion; actor translation/path movement remains in game logic. */
export const sampleMotionPose = (track: MotionTrack): MotionPose => {
  const t = track.localMotionTime;
  const phase = track.framePhase * Math.PI * .25 + track.phaseOffset;
  const stride = Math.sin(phase);
  const lift = Math.abs(Math.sin(phase));
  const base: MotionPose = { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 };
  switch (track.currentMotion) {
    case 'idle': base.y = Math.sin(t * 2.1 + track.phaseOffset) * .35; break;
    case 'start': case 'stop': case 'turn': break;
    case 'move': base.y = -lift * 1.15; base.rotation = stride * 1.1; break;
    case 'walk': case 'run': break;
    case 'wander': base.y = -lift * .65; base.rotation = stride * .55; break;
    case 'chase': base.y = -lift * 1.75; base.x = track.facing * .8; base.rotation = track.facing * -4.2 + stride * 1.6; break;
    case 'chase-distracted': base.y = -lift * 1.35; base.rotation = track.facing * -1.8 + stride * 2.4; break;
    case 'flee': base.y = -lift * 2.2; base.x = -track.facing * .5; base.rotation = track.facing * 4.8 + stride * 2.2; break;
    case 'phone-walk': base.y = -lift * .55; base.rotation = stride * .42; break;
    case 'delivery': base.y = -lift * .9; base.rotation = stride * .75; break;
    case 'delivery-fast': base.y = -lift * 1.35; base.rotation = track.facing * -2 + stride * 1.1; break;
    case 'feast-chase': base.y = -lift * 1.4; base.rotation = stride * 1.15; break;
    case 'stream-arrive': base.y = -lift * 1.15; base.rotation = stride * 1.05; break;
    case 'shout': {
      const shout = Math.min(1, t / .2);
      base.y = shout < .45 ? (shout / .45) * .35 : .35 - easeOutBack((shout - .45) / .55) * .35;
      break;
    }
    case 'caught': base.x = -track.facing * 2.5; base.rotation = -track.facing * 6; base.scaleY = .94; break;
    case 'notice': base.x = -track.facing * .9; base.rotation = track.facing * 1.2; break;
    case 'intro': base.x = track.facing * 1.4; base.rotation = track.facing * -1.1; break;
    case 'recoil': {
      const recoil = Math.min(1, t / .34);
      base.x = -track.facing * Math.sin(recoil * Math.PI) * 4.5;
      base.rotation = -track.facing * Math.sin(recoil * Math.PI) * 7;
      break;
    }
    case 'ambush': base.y = 2 - easeOutBack(Math.min(1, t / .28)) * 2; base.scaleY = .9 + easeOutBack(Math.min(1, t / .28)) * .1; break;
    case 'victory': base.y = -Math.sin(Math.min(1, t / .22) * Math.PI) * 2.3; base.rotation = track.facing * -2; break;
    case 'phone-pause': base.rotation = Math.sin(t * 1.4 + track.phaseOffset) * .22; break;
    case 'handoff': base.x = track.facing * Math.sin(Math.min(1, t / .45) * Math.PI) * 2.4; break;
    case 'feast-rise': base.y = 2 - easeOutBack(Math.min(1, t / .32)) * 2.5; break;
    case 'feast-stare': base.rotation = 0; break;
    case 'observe-hold': base.rotation = track.facing * .6; break;
    case 'stream-react': base.y = -Math.sin(t * 4.1 + track.phaseOffset) * .45; break;
    case 'look': base.rotation = track.facing * -2.5; break;
    case 'panic': base.y = -lift * 1.8; base.rotation = stride * 5; break;
    case 'command': base.x = -track.facing * Math.sin(Math.min(1, t / .3) * Math.PI) * 2; base.rotation = track.facing * -2.5; break;
    case 'dance-player': base.y = -lift * 2.5; base.rotation = stride * 2.5; break;
    case 'dance-heesun': base.x = stride * 2.8; base.y = -lift * 4.8; base.rotation = stride * 6.2; break;
    case 'dance-hanu': base.x = stride * 1.8; base.y = -lift * 1.9; base.rotation = stride * 2.2; break;
    case 'dance-feast': base.x = stride * 2.1; base.y = -lift * 3.6; base.rotation = stride * 1.7; break;
    case 'dance-chief': base.y = -lift * 1.4; base.rotation = stride * .75; break;
    case 'dance-stream': base.x = stride * 1.9; base.y = -lift * 2.8; base.rotation = stride * 1.6; break;
    case 'dance-vuongme': base.x = stride * 3.4; base.y = -lift * 5.3; base.rotation = stride * 5.4; break;
    case 'dance-animal': base.y = -lift * 3.2; base.rotation = stride * 7; break;
    default: break;
  }
  return base;
};

export const karaokeOverrideFor = (game: GameState, actor: MotionActorId) => (
  game.karaoke.active && actor !== 'wife' ? DANCE[actor] : null
);
