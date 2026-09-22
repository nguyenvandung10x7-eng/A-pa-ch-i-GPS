import Phaser from 'phaser';
import { assetUrl } from '../assets';
import type { SceneContext } from '../contracts';

export const BOOT_SCENE = 'pl:v2:boot';
export const FOUNDATION_SCENE = 'pl:v2:foundation';

export class BootScene extends Phaser.Scene {
  private failed = false;

  constructor(private readonly context: SceneContext) {
    super(BOOT_SCENE);
  }

  init(): void {
    this.failed = false;
    if (this.context.diagnostics) this.context.diagnostics.bootStarts += 1;
  }

  preload(): void {
    const onError = (file: Phaser.Loader.File): void => {
      this.failed = true;
      this.context.error('Asset load failed: ' + file.key);
    };
    const diagnostics = this.context.diagnostics;
    const cleanup = (): void => {
      this.events.off(Phaser.Scenes.Events.SHUTDOWN, cleanup);
      this.events.off(Phaser.Scenes.Events.DESTROY, cleanup);
      this.load.off(Phaser.Loader.Events.FILE_LOAD_ERROR, onError);
      if (diagnostics) diagnostics.sceneListeners -= 3;
    };
    this.load.on(Phaser.Loader.Events.FILE_LOAD_ERROR, onError);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, cleanup);
    this.events.once(Phaser.Scenes.Events.DESTROY, cleanup);
    if (diagnostics) diagnostics.sceneListeners += 3;
    for (const asset of this.context.manifest) {
      this.load.image(asset.key, assetUrl(asset.path));
    }
  }

  create(): void {
    if (this.context.isCurrent() && !this.failed) {
      this.scene.start(FOUNDATION_SCENE);
    }
  }
}
