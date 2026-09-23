import Phaser from 'phaser';
import { AURA_LAYERS, FRAME_KEYS, REVEAL_COMPLETE, REVEAL_CONFIG } from './config';

type Phase = 'idle' | 'playing' | 'finishing' | 'completed' | 'cancelled' | 'disposed';
export interface RevealCompletion { type: typeof REVEAL_COMPLETE; runId: number }
interface Options {
  x?: number;
  y?: number;
  fps?: number;
  onComplete: (event: RevealCompletion) => void;
}

// Scene-owned guard. Entries are removed on shutdown/destroy, never persisted.
const owners = new WeakMap<Phaser.Scene, HeeSunReveal>();

/** Requires REVEAL_ASSETS to be loaded. No triggers or downstream scene routing. */
export class HeeSunReveal {
  private root?: Phaser.GameObjects.Container;
  private sprite?: Phaser.GameObjects.Sprite;
  private aura: Phaser.GameObjects.Image[] = [];
  private retiredTweens: Phaser.Tweens.Tween[] = [];
  private phase: Phase = 'idle';
  private runId = 0;
  private completed = 0;
  private visited: number[] = [];
  private rendered: number[] = [];
  private elapsedMs = 0;
  private frameSamples: { frame: number; elapsedMs: number }[] = [];
  private animationCompleted = false;
  private lastCompletionClean = false;
  private readonly fps: number;

  constructor(private readonly scene: Phaser.Scene, private readonly options: Options) {
    if (owners.has(scene)) throw new Error('This scene already owns a reveal controller');
    this.fps = options.fps ?? REVEAL_CONFIG.fps.default_playtest;
    if (!Number.isFinite(this.fps) || this.fps < REVEAL_CONFIG.fps.min || this.fps > REVEAL_CONFIG.fps.max) {
      throw new Error('Reveal FPS must be within 12–15');
    }
    owners.set(scene, this);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.dispose);
    scene.events.once(Phaser.Scenes.Events.DESTROY, this.dispose);
  }

  play = (): boolean => {
    if (this.phase === 'disposed' || this.phase === 'playing' || this.phase === 'finishing'
      || this.scene.game.isPaused || !this.scene.sys.isActive()) return false;
    for (const key of [...FRAME_KEYS, ...AURA_LAYERS.map((layer) => layer.key)]) {
      if (!this.scene.textures.exists(key)) throw new Error('Missing reveal asset: ' + key);
    }
    this.runId += 1;
    this.phase = 'playing';
    this.visited = [];
    this.rendered = [];
    this.frameSamples = [];
    this.elapsedMs = 0;
    this.animationCompleted = false;
    this.lastCompletionClean = false;
    this.root = this.scene.add.container(this.options.x ?? 640, this.options.y ?? 630)
      .setName('HeeSunRevealRoot');
    const motion = REVEAL_CONFIG.aura;
    this.aura = AURA_LAYERS.map((layer, index) => {
      const image = this.scene.add.image(0, layer.y, layer.key)
        .setName(layer.name).setOrigin(0.5, layer.originY).setAlpha(0);
      const scale = layer.height / image.height;
      image.setScale(scale);
      this.root!.add(image);
      this.scene.tweens.add({ targets: image, alpha: layer.opacity, duration: motion.fade_in_sec * 1000 });
      this.scene.tweens.add({
        targets: image, y: layer.y - motion.bob_px, duration: motion.bob_period_sec * 500,
        delay: index * motion.bob_period_sec * 100, yoyo: true, repeat: -1, ease: 'Sine.InOut',
      });
      this.scene.tweens.add({
        targets: image,
        scaleX: { from: scale * motion.pulse_scale_min, to: scale * motion.pulse_scale_max },
        scaleY: { from: scale * motion.pulse_scale_min, to: scale * motion.pulse_scale_max },
        duration: motion.pulse_period_sec * 500, delay: index * motion.pulse_period_sec * 100,
        yoyo: true, repeat: -1, ease: 'Sine.InOut',
      });
      return image;
    });
    this.sprite = this.scene.add.sprite(0, 0, FRAME_KEYS[0])
      .setName('HeeSunSprite25F').setOrigin(0.5, 1).setScale(REVEAL_CONFIG.characterScale);
    this.root.add(this.sprite);
    // Sprite-local animation is destroyed with the sprite. A stalled render must
    // never skip multiple authored frames to catch up to wall-clock duration.
    this.sprite.anims.create({
      key: REVEAL_CONFIG.id, frames: FRAME_KEYS.map((key) => ({ key })),
      frameRate: this.fps, repeat: 0, skipMissedFrames: false,
    });
    this.sprite.on(Phaser.Animations.Events.ANIMATION_START, this.recordFrame);
    this.sprite.on(Phaser.Animations.Events.ANIMATION_UPDATE, this.recordFrame);
    this.sprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE, this.finish);
    this.scene.events.on(Phaser.Scenes.Events.PRE_UPDATE, this.tick);
    this.scene.game.events.on(Phaser.Core.Events.POST_RENDER, this.recordRenderedFrame);
    this.sprite.play(REVEAL_CONFIG.id);
    return true;
  };

  private tick = (_time: number, delta: number): void => {
    if (this.phase === 'playing') this.elapsedMs += delta;
  };

  private recordFrame = (_animation: Phaser.Animations.Animation, frame: Phaser.Animations.AnimationFrame): void => {
    if (this.visited.at(-1) !== frame.index) {
      this.visited.push(frame.index);
      this.frameSamples.push({ frame: frame.index, elapsedMs: this.elapsedMs });
    }
  };

  private recordRenderedFrame = (): void => {
    const frame = this.sprite?.anims?.currentFrame?.index;
    if (frame && this.rendered.at(-1) !== frame) this.rendered.push(frame);
  };

  private finish = (): void => {
    if (this.phase !== 'playing') return;
    this.animationCompleted = true;
    this.phase = 'finishing';
    const run = this.runId;
    for (const image of this.aura) this.scene.tweens.killTweensOf(image);
    // Only the native animation-complete callback starts this fade. Completion
    // waits for the fade, then destroys everything before notifying the caller.
    this.scene.tweens.add({
      targets: this.aura, alpha: 0, duration: REVEAL_CONFIG.aura.fade_out_sec * 1000,
      onComplete: () => {
        if (this.phase !== 'finishing' || this.runId !== run) return;
        this.clearVisuals();
        // TweenManager releases destroyed entries at the end of its update.
        // Notify after that native step, so no disposed tween remains listed.
        this.scene.events.once(Phaser.Scenes.Events.POST_UPDATE, this.complete);
      },
    });
  };

  private complete = (): void => {
    if (this.phase !== 'finishing') return;
    // We are outside TweenManager.update now. Remove its deferred entries using
    // the public API before handing control back to a future caller.
    for (const tween of this.retiredTweens) {
      this.scene.tweens.remove(tween);
      tween.destroy();
    }
    this.retiredTweens = [];
    this.phase = 'completed';
    this.completed += 1;
    this.lastCompletionClean = !this.root && this.aura.length === 0;
    this.options.onComplete({ type: REVEAL_COMPLETE, runId: this.runId });
  };

  private clearVisuals(): void {
    this.scene.events.off(Phaser.Scenes.Events.PRE_UPDATE, this.tick);
    this.scene.events.off(Phaser.Scenes.Events.POST_UPDATE, this.complete);
    this.scene.game.events.off(Phaser.Core.Events.POST_RENDER, this.recordRenderedFrame);
    for (const tween of this.scene.tweens.getTweensOf(this.aura)) {
      this.scene.tweens.remove(tween);
      tween.destroy();
      if (this.phase === 'finishing') this.retiredTweens.push(tween);
    }
    if (this.sprite) {
      this.sprite.off(Phaser.Animations.Events.ANIMATION_START, this.recordFrame);
      this.sprite.off(Phaser.Animations.Events.ANIMATION_UPDATE, this.recordFrame);
      this.sprite.off(Phaser.Animations.Events.ANIMATION_COMPLETE, this.finish);
      // Scene shutdown may already have destroyed the Sprite via DisplayList.
      this.sprite.anims?.stop();
    }
    this.root?.destroy(true);
    this.root = undefined;
    this.sprite = undefined;
    this.aura = [];
    if (this.phase !== 'finishing') this.retiredTweens = [];
  }

  cancel = (): void => {
    if (this.phase !== 'playing' && this.phase !== 'finishing') return;
    this.phase = 'cancelled';
    this.clearVisuals();
  };

  dispose = (): void => {
    if (this.phase === 'disposed') return;
    this.phase = 'disposed';
    this.clearVisuals();
    this.scene.events.off(Phaser.Scenes.Events.SHUTDOWN, this.dispose);
    this.scene.events.off(Phaser.Scenes.Events.DESTROY, this.dispose);
    owners.delete(this.scene);
  };

  inspect = () => ({
    phase: this.phase, runId: this.runId, completionCount: this.completed,
    fps: this.fps, repeat: 0, skipMissedFrames: false,
    visitedFrames: [...this.visited], renderedFrames: [...this.rendered],
    frameSamples: this.frameSamples.map((sample) => ({ ...sample })),
    elapsedMs: this.elapsedMs, animationCompleted: this.animationCompleted,
    rootCount: this.root ? 1 : 0, auraCount: this.aura.length,
    layers: this.root?.list.map((child) => child.name) ?? [],
    aura: this.aura.map((image) => ({ name: image.name, y: image.y, alpha: image.alpha, scale: image.scaleX })),
    sceneObjects: this.scene.children?.list?.length ?? 0,
    sceneTweens: this.scene.tweens?.getTweens().length ?? 0,
    currentFrame: this.sprite?.anims?.currentFrame?.index ?? null,
    lastCompletionClean: this.lastCompletionClean,
    voice: REVEAL_CONFIG.voice,
  });
}
