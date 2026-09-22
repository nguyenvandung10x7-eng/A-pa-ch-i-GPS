import Phaser from 'phaser';
import type { SceneContext } from '../contracts';
import { FOUNDATION_SCENE } from './BootScene';

export class FoundationScene extends Phaser.Scene {
  constructor(private readonly context: SceneContext) {
    super(FOUNDATION_SCENE);
  }

  create(): void {
    if (!this.context.isCurrent()) return;
    const diagnostics = this.context.diagnostics;
    if (diagnostics) {
      diagnostics.sceneStarts += 1;
      diagnostics.sceneListeners += 2;
      const cleanup = (): void => {
        this.events.off(Phaser.Scenes.Events.SHUTDOWN, cleanup);
        this.events.off(Phaser.Scenes.Events.DESTROY, cleanup);
        diagnostics.sceneListeners -= 2;
        diagnostics.sceneShutdowns += 1;
      };
      this.events.once(Phaser.Scenes.Events.SHUTDOWN, cleanup);
      this.events.once(Phaser.Scenes.Events.DESTROY, cleanup);
    }
    this.cameras.main.setBackgroundColor('#172027');
    this.context.attachProbe?.(this, this.context);
    this.context.ready();
  }
}
