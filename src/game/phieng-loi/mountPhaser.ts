import type Phaser from 'phaser';
import { FOUNDATION_ASSETS, validateManifest } from './assets';
import type { FoundationHandle, MountOptions, PauseReason, SceneContext } from './contracts';

// One route owner, not a persistent game singleton. Only the teardown promise
// survives HMR; no game/scene state is restored into a replacement instance.
const hotData = import.meta.hot?.data as { pl00Teardown?: Promise<void> } | undefined;
let teardownBarrier: Promise<void> = hotData?.pl00Teardown ?? Promise.resolve();
let active: FoundationHandle | undefined;
let nextSession = 0;

export function mountPhaser(parent: HTMLElement, options: MountOptions): FoundationHandle {
  if (active) void active.dispose();
  const previousTeardown = teardownBarrier;
  const sessionId = ++nextSession;
  const dev = import.meta.env.DEV ? options.dev : undefined;
  const diagnostics = dev?.diagnostics;
  if (diagnostics) diagnostics.mounts += 1;
  const reasons = new Set<PauseReason>();
  if (document.hidden) reasons.add('hidden');
  let game: Phaser.Game | undefined;
  let disposed = false;
  let ready = false;
  let error = false;
  let disposal: Promise<void> | undefined;
  let observer: ResizeObserver | undefined;
  let listenersAttached = false;
  const current = (): boolean => !disposed && active === handle;
  const report = (state: 'booting' | 'ready' | 'paused' | 'error', message?: string): void => {
    if (current()) options.onStatus({ sessionId, state, reasons: [...reasons], message });
  };

  const applyPause = (): void => {
    if (!current() || !game || !ready || error) return;
    if (reasons.size > 0) {
      game.pause();
      report('paused');
    } else if (game.isPaused) {
      // TweenManager uses wall time in Phaser 4.2.1. Consume its elapsed time
      // through the public tick API while every tween is paused. This creates
      // no clock/RAF and preserves individually paused tweens and callbacks.
      for (const scene of game.scene.getScenes(true)) {
        const playing = scene.tweens.getTweens().filter((tween) => !tween.paused);
        for (const tween of playing) tween.paused = true;
        scene.tweens.tick();
        for (const tween of playing) tween.paused = false;
      }
      game.resume();
      // No second ready notification. The handle exposes the current pause
      // state; React already owns the resume command and the dev snapshot UI.
    }
  };

  const setHidden = (hidden: boolean): void => {
    if (hidden) reasons.add('hidden');
    else reasons.delete('hidden');
    applyPause();
  };
  const onVisibility = (): void => setHidden(document.hidden);
  const onPageHide = (): void => setHidden(true);
  const onPageShow = (): void => setHidden(document.hidden);

  const start = previousTeardown.then(async () => {
    if (!current()) {
      if (diagnostics) diagnostics.cancelledStarts += 1;
      return;
    }
    report('booting');
    const { createGame } = await import('./createGame');
    const probe = dev ? await import('./dev/FoundationProbe') : undefined;
    if (!current() || !parent.isConnected) {
      if (diagnostics) diagnostics.cancelledStarts += 1;
      return;
    }
    if (parent.clientWidth <= 0 || parent.clientHeight <= 0) {
      throw new Error('Phaser host must have a non-zero size');
    }
    const manifest = import.meta.env.DEV ? options.manifest ?? FOUNDATION_ASSETS : FOUNDATION_ASSETS;
    validateManifest(manifest);
    const context: SceneContext = {
      sessionId,
      manifest,
      isCurrent: current,
      diagnostics,
      attachProbe: probe?.attachFoundationProbe,
      ready: () => queueMicrotask(() => {
        if (!current() || error || ready) return;
        ready = true;
        if (diagnostics) diagnostics.readyEvents += 1;
        report('ready');
        applyPause();
      }),
      error: (message) => {
        if (!current() || error) return;
        error = true;
        if (diagnostics) diagnostics.errors += 1;
        report('error', message);
      },
    };
    game = createGame(parent, context, dev?.renderer === 'canvas');
    if (diagnostics) {
      diagnostics.created += 1;
      diagnostics.live += 1;
      diagnostics.maxLive = Math.max(diagnostics.maxLive, diagnostics.live);
    }
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', onPageHide);
    window.addEventListener('pageshow', onPageShow);
    listenersAttached = true;
    if (diagnostics) diagnostics.adapterListeners += 3;
    observer = new ResizeObserver(() => {
      if (current() && game?.isBooted) {
        // refresh computes display size from cached parent bounds. Update them
        // first, as Phaser's native scale step does when processing a resize.
        game.scale.getParentBounds();
        game.scale.refresh();
      }
    });
    observer.observe(parent);
    if (diagnostics) diagnostics.observers += 1;
  }).catch((cause: unknown) => {
    if (current()) {
      error = true;
      if (diagnostics) diagnostics.errors += 1;
      report('error', cause instanceof Error ? cause.message : 'Phaser initialization failed');
    }
  });

  const handle: FoundationHandle = {
    sessionId,
    pause: () => { reasons.add('manual'); applyPause(); },
    resume: () => { reasons.delete('manual'); applyPause(); },
    dispose: () => {
      if (disposal) return disposal;
      disposed = true;
      if (listenersAttached) {
        document.removeEventListener('visibilitychange', onVisibility);
        window.removeEventListener('pagehide', onPageHide);
        window.removeEventListener('pageshow', onPageShow);
        listenersAttached = false;
        if (diagnostics) diagnostics.adapterListeners -= 3;
      }
      if (observer) {
        observer.disconnect();
        observer = undefined;
        if (diagnostics) diagnostics.observers -= 1;
      }
      disposal = start.then(() => new Promise<void>((resolve) => {
        const previousGame = game;
        if (!previousGame) { resolve(); return; }
        previousGame.events.once('destroy', () => queueMicrotask(() => {
          // DESTROY is emitted before renderer/canvas/loop teardown completes.
          // The microtask runs after the rest of that synchronous engine step.
          if (diagnostics) { diagnostics.destroyed += 1; diagnostics.live -= 1; }
          game = undefined;
          resolve();
        }));
        previousGame.destroy(true, false);
      })).then(() => { if (active === handle) active = undefined; });
      teardownBarrier = disposal;
      return disposal;
    },
    restartScene: () => {
      if (!dev || !current() || !ready || game?.isPaused || error) return;
      game?.scene.getScene('pl:v2:foundation').scene.restart();
    },
    inspect: () => ({
      sessionId,
      disposed,
      renderer: !game?.renderer ? 'pending' : game.renderer.type === 2 ? 'webgl' : 'canvas',
      paused: game?.isPaused ?? false,
      physics: game?.scene.getScenes(false).some((scene) => Boolean(scene.physics?.world || scene.matter?.world)) ?? false,
      audioDisabled: game?.config.audio.noAudio === true,
      sceneKeys: game?.scene.getScenes(false).map((scene) => scene.sys.settings.key) ?? [],
      probe: diagnostics?.sample?.() ?? null,
    }),
  };
  active = handle;
  return handle;
}

if (import.meta.hot) {
  import.meta.hot.dispose((data: { pl00Teardown?: Promise<void> }) => {
    data.pl00Teardown = active?.dispose() ?? teardownBarrier;
  });
}
