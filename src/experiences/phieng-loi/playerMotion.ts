import type { PhiengLoiInputState } from './runtime';
import {
  PHIENG_LOI_LANDMARKS,
  PHIENG_LOI_WORLD,
  isWalkable,
} from './worldLayout';

export type PlayerMotionName = 'idle' | 'start' | 'walk' | 'run' | 'turn' | 'stop';
export type PlayerView = 'side' | 'down' | 'up';
export type PlayerAtlasName = 'actions' | 'side' | 'down' | 'up';

export type PhiengLoiPlayerState = {
  elapsed: number;
  reducedMotion: boolean;
  player: {
    x: number;
    y: number;
    vx: number;
    vy: number;
    facingX: number;
    facingY: number;
    facing: number;
    pendingFacing: number;
    turnStartedAt: number;
    view: PlayerView;
    pendingView: PlayerView;
    viewStartedAt: number;
    motion: PlayerMotionName;
    previousMotion: PlayerMotionName;
    motionEnteredAt: number;
    localMotionTime: number;
    transitionUntil: number;
    settleMotion: PlayerMotionName | null;
    framePhase: number;
  };
  camera: { x: number; y: number };
};

export type PhiengLoiPlayerVisual = {
  atlas: PlayerAtlasName;
  frame: number;
  width: number;
  x: number;
  y: number;
  facing: number;
  scale: number;
  view: PlayerView;
  motion: PlayerMotionName;
  cameraX: number;
  cameraY: number;
};

export const PLAYER_SPEED = 86;
export const PLAYER_WALK_STRIDE_LENGTH = 54;
export const PLAYER_RUN_STRIDE_LENGTH = 76;
export const CAMERA_VERTICAL_ANCHOR = 0.7;
export const CAMERA_HORIZONTAL_LEAD = 38;
export const CAMERA_VERTICAL_LEAD = 18;
export const CAMERA_RESPONSE = 7.2;

const PLAYER_LOCOMOTION_WIDTH = 108;
const PLAYER_ACTION_WIDTH = 82;
const START_SECONDS = 0.12;
const TURN_SECONDS = 0.11;
const STOP_SECONDS = 0.16;
const VIEW_CHANGE_SECONDS = 0.065;
const FACING_CHANGE_SECONDS = 0.075;

const clamp = (value: number, minimum: number, maximum: number) => (
  Math.max(minimum, Math.min(maximum, value))
);

const isLocomotion = (motion: PlayerMotionName) => motion === 'walk' || motion === 'run';
const isStrideMotion = (motion: PlayerMotionName) => isLocomotion(motion)
  || motion === 'start'
  || motion === 'turn'
  || motion === 'stop';

export const directionalViewForVelocity = (
  current: PlayerView,
  vx: number,
  vy: number,
): PlayerView => {
  const ax = Math.abs(vx);
  const ay = Math.abs(vy);
  if (Math.hypot(vx, vy) <= 3) return current;
  if (current === 'side') return ay > ax * 1.18 ? (vy > 0 ? 'down' : 'up') : 'side';
  if (ax > ay * 1.12) return 'side';
  if (ay > ax * 0.72) return vy > 0 ? 'down' : 'up';
  return current;
};

const enterMotion = (
  state: PhiengLoiPlayerState,
  motion: PlayerMotionName,
  duration = 0,
  settleMotion: PlayerMotionName | null = null,
) => {
  const player = state.player;
  if (player.motion === motion && player.settleMotion === settleMotion) return;
  if (!isStrideMotion(player.motion) || !isStrideMotion(motion)) player.framePhase = 0;
  player.previousMotion = player.motion;
  player.motion = motion;
  player.motionEnteredAt = state.elapsed;
  player.localMotionTime = 0;
  player.transitionUntil = duration > 0 ? state.elapsed + duration : 0;
  player.settleMotion = settleMotion;
};

const resolveInput = (input: PhiengLoiInputState) => {
  let x = input.moveX;
  let y = input.moveY;
  if (Math.abs(x) < 0.08) x = Number(input.right) - Number(input.left);
  if (Math.abs(y) < 0.08) y = Number(input.down) - Number(input.up);
  const length = Math.hypot(x, y);
  if (length > 1) {
    x /= length;
    y /= length;
  }
  return { x, y, length: Math.min(1, length) };
};

const requestedMotionForSpeed = (speed: number): PlayerMotionName => (
  speed >= 60 ? 'run' : speed > 4 ? 'walk' : 'idle'
);

const advancePlayerMotion = (
  state: PhiengLoiPlayerState,
  requestedMotion: PlayerMotionName,
  movedDistance: number,
) => {
  const player = state.player;
  const speed = Math.hypot(player.vx, player.vy);
  player.localMotionTime += Math.max(0, state.elapsed - (player.motionEnteredAt + player.localMotionTime));

  if (isLocomotion(requestedMotion)) {
    const strideLength = requestedMotion === 'walk' ? PLAYER_WALK_STRIDE_LENGTH : PLAYER_RUN_STRIDE_LENGTH;
    player.framePhase += (movedDistance / strideLength) * 8;
  }

  const desiredView = directionalViewForVelocity(player.view, player.vx, player.vy);
  if (desiredView !== player.view) {
    if (player.pendingView !== desiredView) {
      player.pendingView = desiredView;
      player.viewStartedAt = state.elapsed;
    } else if (state.elapsed - player.viewStartedAt >= VIEW_CHANGE_SECONDS) {
      player.view = desiredView;
      player.viewStartedAt = state.elapsed;
    }
  } else {
    player.pendingView = desiredView;
    player.viewStartedAt = 0;
  }

  const desiredFacing = Math.abs(player.facingX) > 0.001 ? Math.sign(player.facingX) : player.facing;
  if (desiredFacing !== player.facing) {
    if (player.pendingFacing !== desiredFacing) {
      player.pendingFacing = desiredFacing;
      player.turnStartedAt = state.elapsed;
    } else if (state.elapsed - player.turnStartedAt >= FACING_CHANGE_SECONDS && speed > 3) {
      player.facing = desiredFacing;
      player.turnStartedAt = state.elapsed;
      if (isLocomotion(requestedMotion)) enterMotion(state, 'turn', TURN_SECONDS, requestedMotion);
    }
  } else {
    player.pendingFacing = desiredFacing;
    player.turnStartedAt = 0;
  }

  if (player.transitionUntil > state.elapsed && player.settleMotion === requestedMotion) return;
  if (player.transitionUntil > 0 && state.elapsed >= player.transitionUntil && player.settleMotion) {
    const settleMotion = player.settleMotion;
    enterMotion(state, settleMotion);
  }
  if (player.motion === requestedMotion) return;

  const wasMoving = isLocomotion(player.motion) || isLocomotion(player.settleMotion ?? 'idle');
  const willMove = isLocomotion(requestedMotion);
  if (!wasMoving && willMove) {
    enterMotion(state, 'start', START_SECONDS, requestedMotion);
    return;
  }
  if (wasMoving && !willMove && requestedMotion === 'idle') {
    enterMotion(state, 'stop', STOP_SECONDS, 'idle');
    return;
  }
  enterMotion(state, requestedMotion);
};

const updateCamera = (state: PhiengLoiPlayerState, deltaSeconds: number) => {
  const { player, camera } = state;
  const speed = Math.hypot(player.vx, player.vy);
  const speedRatio = clamp(speed / PLAYER_SPEED, 0, 1);
  const directionX = speed > 2 ? player.vx / speed : 0;
  const directionY = speed > 2 ? player.vy / speed : 0;
  const targetX = clamp(
    player.x - PHIENG_LOI_WORLD.viewWidth / 2 + directionX * CAMERA_HORIZONTAL_LEAD * speedRatio,
    0,
    PHIENG_LOI_WORLD.width - PHIENG_LOI_WORLD.viewWidth,
  );
  const targetY = clamp(
    player.y - PHIENG_LOI_WORLD.viewHeight * CAMERA_VERTICAL_ANCHOR + directionY * CAMERA_VERTICAL_LEAD * speedRatio,
    0,
    PHIENG_LOI_WORLD.height - PHIENG_LOI_WORLD.viewHeight,
  );
  const response = state.reducedMotion ? 1 : 1 - Math.exp(-deltaSeconds * CAMERA_RESPONSE);
  camera.x += (targetX - camera.x) * response;
  camera.y += (targetY - camera.y) * response;
};

export const createPhiengLoiPlayerState = (reducedMotion = false): PhiengLoiPlayerState => ({
  elapsed: 0,
  reducedMotion,
  player: {
    x: PHIENG_LOI_LANDMARKS.playerStart.x,
    y: PHIENG_LOI_LANDMARKS.playerStart.y,
    vx: 0,
    vy: 0,
    facingX: 1,
    facingY: 0,
    facing: 1,
    pendingFacing: 1,
    turnStartedAt: 0,
    view: 'down',
    pendingView: 'down',
    viewStartedAt: 0,
    motion: 'idle',
    previousMotion: 'idle',
    motionEnteredAt: 0,
    localMotionTime: 0,
    transitionUntil: 0,
    settleMotion: null,
    framePhase: 0,
  },
  camera: {
    x: clamp(
      PHIENG_LOI_LANDMARKS.playerStart.x - PHIENG_LOI_WORLD.viewWidth / 2,
      0,
      PHIENG_LOI_WORLD.width - PHIENG_LOI_WORLD.viewWidth,
    ),
    y: clamp(
      PHIENG_LOI_LANDMARKS.playerStart.y - PHIENG_LOI_WORLD.viewHeight * CAMERA_VERTICAL_ANCHOR,
      0,
      PHIENG_LOI_WORLD.height - PHIENG_LOI_WORLD.viewHeight,
    ),
  },
});

export const stepPhiengLoiPlayer = (
  state: PhiengLoiPlayerState,
  input: PhiengLoiInputState,
  deltaSeconds: number,
) => {
  const dt = clamp(deltaSeconds, 0, 0.1);
  state.elapsed += dt;
  const movement = resolveInput(input);
  const player = state.player;
  const previousX = player.x;
  const previousY = player.y;
  const response = 1 - Math.exp(-dt * 14);
  player.vx += (movement.x * PLAYER_SPEED - player.vx) * response;
  player.vy += (movement.y * PLAYER_SPEED - player.vy) * response;

  const nextX = player.x + player.vx * dt;
  if (isWalkable(nextX, player.y, 8)) player.x = nextX;
  else player.vx = 0;
  const nextY = player.y + player.vy * dt;
  if (isWalkable(player.x, nextY, 8)) player.y = nextY;
  else player.vy = 0;

  if (movement.length > 0.08) {
    player.facingX = movement.x;
    player.facingY = movement.y;
  }
  const movedDistance = Math.hypot(player.x - previousX, player.y - previousY);
  advancePlayerMotion(state, requestedMotionForSpeed(Math.hypot(player.vx, player.vy)), movedDistance);
  updateCamera(state, dt);
};

const locomotionFrame = (state: PhiengLoiPlayerState) => (
  state.reducedMotion ? 0 : Math.floor(state.player.framePhase) % 8
);

export const getPhiengLoiPlayerVisual = (state: PhiengLoiPlayerState): PhiengLoiPlayerVisual => {
  const { player } = state;
  const locomoting = isLocomotion(player.motion);
  const atlas: PlayerAtlasName = locomoting ? player.view : 'actions';
  const frame = player.motion === 'walk'
    ? locomotionFrame(state)
    : player.motion === 'run'
      ? 8 + locomotionFrame(state)
      : player.motion === 'idle'
        ? player.view === 'down' ? 0 : player.view === 'up' ? 2 : 1
        : player.motion === 'start'
          ? 4
          : player.motion === 'turn'
            ? 5
            : 6;
  return {
    atlas,
    frame,
    width: locomoting ? PLAYER_LOCOMOTION_WIDTH : PLAYER_ACTION_WIDTH,
    x: player.x,
    y: player.y,
    facing: player.facing,
    scale: 0.88 + (player.y / PHIENG_LOI_WORLD.height) * 0.2,
    view: player.view,
    motion: player.motion,
    cameraX: state.camera.x,
    cameraY: state.camera.y,
  };
};
