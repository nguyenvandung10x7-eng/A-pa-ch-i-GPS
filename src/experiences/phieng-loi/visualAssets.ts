import type { CSSProperties } from 'react';
import type { PlayerAtlasName } from './playerMotion';

export const PHIENG_LOI_PLAYER_ASSETS = {
  world: '/images/phieng-loi/village-world-v2.webp',
  side: '/images/phieng-loi/player-locomotion-side-v2.webp',
  down: '/images/phieng-loi/player-locomotion-down-v2.webp',
  up: '/images/phieng-loi/player-locomotion-up-v2.webp',
  actions: '/images/phieng-loi/player-actions-v2.webp',
} as const;

const ATLAS_CONFIG = {
  side: { url: PHIENG_LOI_PLAYER_ASSETS.side, columns: 4, rows: 4, frameAspect: 1.5 },
  down: { url: PHIENG_LOI_PLAYER_ASSETS.down, columns: 4, rows: 4, frameAspect: 1.5 },
  up: { url: PHIENG_LOI_PLAYER_ASSETS.up, columns: 4, rows: 4, frameAspect: 1.5 },
  actions: { url: PHIENG_LOI_PLAYER_ASSETS.actions, columns: 4, rows: 3, frameAspect: 384 / 341 },
} as const satisfies Record<PlayerAtlasName, {
  url: string;
  columns: number;
  rows: number;
  frameAspect: number;
}>;

export const playerAtlasFrameStyle = (atlas: PlayerAtlasName, frame: number): CSSProperties => {
  const config = ATLAS_CONFIG[atlas];
  const safeFrame = Math.max(0, Math.min(config.columns * config.rows - 1, frame));
  const column = safeFrame % config.columns;
  const row = Math.floor(safeFrame / config.columns);
  return {
    backgroundImage: `url(${config.url})`,
    backgroundPosition: `${(column / (config.columns - 1)) * 100}% ${(row / (config.rows - 1)) * 100}%`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: `${config.columns * 100}% ${config.rows * 100}%`,
    aspectRatio: config.frameAspect,
  };
};

export const preloadPhiengLoiPlayerAssets = async (): Promise<void> => {
  if (typeof Image === 'undefined') return;
  await Promise.all(Object.values(PHIENG_LOI_PLAYER_ASSETS).map((url) => new Promise<void>((resolve) => {
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => resolve();
    image.onerror = () => resolve();
    image.src = url;
  })));
};
