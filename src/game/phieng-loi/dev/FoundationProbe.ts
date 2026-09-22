import Phaser from 'phaser';
import type { FoundationDiagnostics, SceneContext } from '../contracts';

export function createDiagnostics(): FoundationDiagnostics {
  return {
    mounts: 0, cancelledStarts: 0, created: 0, destroyed: 0, live: 0, maxLive: 0,
    bootStarts: 0, sceneStarts: 0, sceneShutdowns: 0, readyEvents: 0, errors: 0,
    adapterListeners: 0, observers: 0, sceneListeners: 0, probes: 0,
    timers: 0, tweens: 0, objects: 0, updates: 0, timerCallbacks: 0, orphanCallbacks: 0,
  };
}

/** Procedural technical probes only. No image, sprite sequence or gameplay. */
export function attachFoundationProbe(scene: Phaser.Scene, context: SceneContext): void {
  const diagnostics = context.diagnostics;
  if (!diagnostics) return;
  let alive = true;
  let timerTicks = 0;
  let pointer: { x: number; y: number } | null = null;
  const square = scene.add.rectangle(320, 460, 48, 48, 0xf1bb62);
  const target = scene.add.rectangle(960, 540, 80, 80, 0x75cbd5).setInteractive();
  const tween = scene.tweens.add({ targets: square, x: 800, duration: 10000, ease: 'Linear' });
  const timer = scene.time.addEvent({
    delay: 10000, loop: true,
    callback: () => {
      if (!alive || !context.isCurrent()) { diagnostics.orphanCallbacks += 1; return; }
      timerTicks += 1;
      diagnostics.timerCallbacks += 1;
    },
  });
  const update = (): void => {
    if (!alive || !context.isCurrent()) { diagnostics.orphanCallbacks += 1; return; }
    diagnostics.updates += 1;
  };
  const onPointer = (event: Phaser.Input.Pointer): void => {
    if (!alive || !context.isCurrent()) { diagnostics.orphanCallbacks += 1; return; }
    pointer = { x: event.worldX, y: event.worldY };
  };
  target.on(Phaser.Input.Events.POINTER_DOWN, onPointer);
  scene.events.on(Phaser.Scenes.Events.POST_UPDATE, update);
  const sample = () => ({
    x: square.x,
    elapsed: timer.getElapsed(),
    timerTicks,
    pointer,
    sceneObjects: scene.children.length,
    sceneTweens: scene.tweens.getTweens().length,
    fixtureLoaded: context.manifest.every((asset) => scene.textures.exists(asset.key)),
  });
  diagnostics.sample = sample;
  diagnostics.probes += 1;
  diagnostics.timers += 1;
  diagnostics.tweens += 1;
  diagnostics.objects += 2;
  diagnostics.sceneListeners += 4;
  const cleanup = (): void => {
    if (!alive) return;
    alive = false;
    scene.events.off(Phaser.Scenes.Events.SHUTDOWN, cleanup);
    scene.events.off(Phaser.Scenes.Events.DESTROY, cleanup);
    scene.events.off(Phaser.Scenes.Events.POST_UPDATE, update);
    target.off(Phaser.Input.Events.POINTER_DOWN, onPointer);
    timer.remove(false);
    tween.remove();
    square.destroy();
    target.destroy();
    if (diagnostics.sample === sample) diagnostics.sample = undefined;
    diagnostics.probes -= 1;
    diagnostics.timers -= 1;
    diagnostics.tweens -= 1;
    diagnostics.objects -= 2;
    diagnostics.sceneListeners -= 4;
  };
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, cleanup);
  scene.events.once(Phaser.Scenes.Events.DESTROY, cleanup);
}
