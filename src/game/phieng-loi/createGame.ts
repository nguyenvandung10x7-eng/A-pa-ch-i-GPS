import Phaser from 'phaser';
import type { SceneContext } from './contracts';
import { BootScene } from './scenes/BootScene';
import { FoundationScene } from './scenes/FoundationScene';

export function createGame(
  parent: HTMLElement,
  context: SceneContext,
  canvasProbe = false,
): Phaser.Game {
  return new Phaser.Game({
    type: import.meta.env.DEV && canvasProbe ? Phaser.CANVAS : Phaser.AUTO,
    parent,
    width: 1280,
    height: 720,
    backgroundColor: '#172027',
    transparent: false,
    render: { pixelArt: false, antialias: true },
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    fps: { target: 60 },
    audio: { noAudio: true },
    input: { keyboard: false, gamepad: false },
    banner: false,
    scene: [new BootScene(context), new FoundationScene(context)],
  });
}
