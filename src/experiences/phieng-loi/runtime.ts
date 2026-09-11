export type PhiengLoiInputState = {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  moveX: number;
  moveY: number;
};

export type PhiengLoiLoopState = 'idle' | 'running' | 'paused' | 'disposed';

export type PhiengLoiFrameScheduler = {
  now: () => number;
  requestFrame: (callback: FrameRequestCallback) => number;
  cancelFrame: (frameId: number) => void;
};

export type PhiengLoiFrameLoop = {
  start: () => void;
  pause: () => void;
  resume: () => void;
  dispose: () => void;
  getState: () => PhiengLoiLoopState;
};

export const MAX_SIMULATION_STEP_SECONDS = 0.032;
export const MAX_VISIBLE_FRAME_CATCH_UP_SECONDS = 1;

export const createPhiengLoiInputState = (): PhiengLoiInputState => ({
  left: false,
  right: false,
  up: false,
  down: false,
  moveX: 0,
  moveY: 0,
});

export const clearPhiengLoiInput = (input: PhiengLoiInputState) => {
  input.left = false;
  input.right = false;
  input.up = false;
  input.down = false;
  input.moveX = 0;
  input.moveY = 0;
};

export const updatePhiengLoiKey = (
  input: PhiengLoiInputState,
  key: string,
  pressed: boolean,
): boolean => {
  switch (key.toLowerCase()) {
    case 'arrowleft':
    case 'a':
      input.left = pressed;
      return true;
    case 'arrowright':
    case 'd':
      input.right = pressed;
      return true;
    case 'arrowup':
    case 'w':
      input.up = pressed;
      return true;
    case 'arrowdown':
    case 's':
      input.down = pressed;
      return true;
    default:
      return false;
  }
};

const browserFrameScheduler = (): PhiengLoiFrameScheduler => ({
  now: () => performance.now(),
  requestFrame: (callback) => window.requestAnimationFrame(callback),
  cancelFrame: (frameId) => window.cancelAnimationFrame(frameId),
});

export const createPhiengLoiFrameLoop = ({
  onStep,
  scheduler = browserFrameScheduler(),
}: {
  onStep: (deltaSeconds: number) => void;
  scheduler?: PhiengLoiFrameScheduler;
}): PhiengLoiFrameLoop => {
  let state: PhiengLoiLoopState = 'idle';
  let frameId: number | null = null;
  let previousTime = 0;

  const cancelPendingFrame = () => {
    if (frameId === null) return;
    scheduler.cancelFrame(frameId);
    frameId = null;
  };

  const scheduleNextFrame = () => {
    if (state !== 'running' || frameId !== null) return;
    frameId = scheduler.requestFrame(frame);
  };

  const frame = (time: number) => {
    frameId = null;
    if (state !== 'running') return;

    const frameDelta = Math.min(
      MAX_VISIBLE_FRAME_CATCH_UP_SECONDS,
      Math.max(0.001, (time - previousTime) / 1_000),
    );
    previousTime = time;
    let remaining = frameDelta;
    while (remaining > 0.0001 && state === 'running') {
      const simulationStep = Math.min(MAX_SIMULATION_STEP_SECONDS, remaining);
      onStep(simulationStep);
      remaining -= simulationStep;
    }
    scheduleNextFrame();
  };

  const run = () => {
    if (state === 'disposed' || state === 'running') return;
    state = 'running';
    previousTime = scheduler.now();
    scheduleNextFrame();
  };

  return {
    start: run,
    pause: () => {
      if (state !== 'running') return;
      state = 'paused';
      cancelPendingFrame();
    },
    resume: run,
    dispose: () => {
      if (state === 'disposed') return;
      state = 'disposed';
      cancelPendingFrame();
    },
    getState: () => state,
  };
};
