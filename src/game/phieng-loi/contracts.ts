import type Phaser from 'phaser';
import type { AssetManifest } from './assets';

export type PauseReason = 'manual' | 'hidden';
export type FoundationStatus = {
  sessionId: number;
  state: 'booting' | 'ready' | 'paused' | 'error';
  reasons: readonly PauseReason[];
  message?: string;
};

/** Only the dev harness owns diagnostics. No global event bus or game store. */
export interface FoundationDiagnostics {
  mounts: number;
  cancelledStarts: number;
  created: number;
  destroyed: number;
  live: number;
  maxLive: number;
  bootStarts: number;
  sceneStarts: number;
  sceneShutdowns: number;
  readyEvents: number;
  errors: number;
  adapterListeners: number;
  observers: number;
  sceneListeners: number;
  probes: number;
  timers: number;
  tweens: number;
  objects: number;
  updates: number;
  timerCallbacks: number;
  orphanCallbacks: number;
  sample?: () => ProbeSnapshot;
}

export interface ProbeSnapshot {
  x: number;
  elapsed: number;
  timerTicks: number;
  pointer: { x: number; y: number } | null;
  sceneObjects: number;
  sceneTweens: number;
  fixtureLoaded: boolean;
}

export interface FoundationDevOptions {
  diagnostics: FoundationDiagnostics;
  renderer: 'auto' | 'canvas';
  /** Optional isolated task harness; replaces the technical foundation probe. */
  attachScene?: (scene: Phaser.Scene, context: SceneContext) => void;
}

export interface MountOptions {
  onStatus: (status: FoundationStatus) => void;
  manifest?: AssetManifest;
  dev?: FoundationDevOptions;
}

export interface FoundationHandle {
  readonly sessionId: number;
  pause: () => void;
  resume: () => void;
  dispose: () => Promise<void>;
  /** Invoked only by the dev harness; application code does not receive a Scene. */
  restartScene: () => void;
  inspect: () => {
    sessionId: number;
    disposed: boolean;
    renderer: 'webgl' | 'canvas' | 'pending';
    paused: boolean;
    physics: boolean;
    audioDisabled: boolean;
    sceneKeys: string[];
    probe: ProbeSnapshot | null;
  };
}

export interface SceneContext {
  sessionId: number;
  manifest: AssetManifest;
  isCurrent: () => boolean;
  ready: () => void;
  error: (message: string) => void;
  diagnostics?: FoundationDiagnostics;
  attachProbe?: (scene: Phaser.Scene, context: SceneContext) => void;
}
