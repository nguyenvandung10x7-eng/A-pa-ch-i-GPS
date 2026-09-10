import type { CSSProperties } from 'react';

export const PHIENG_LOI_VISUAL_ASSETS = {
  world: '/images/phieng-loi/village-world-v1.webp',
  heesunAtlas: '/images/phieng-loi/heesun-atlas-v1.webp',
  hanuAtlas: '/images/phieng-loi/hanu-atlas-v1.webp',
  supportAtlas: '/images/phieng-loi/support-atlas-v1.webp',
  heesunMenu: '/images/phieng-loi/heesun-menu-v1.webp',
  hanuMenu: '/images/phieng-loi/hanu-menu-v1.webp',
} as const;

export type AtlasName = 'heesun' | 'hanu' | 'support';

const ATLAS_CONFIG = {
  heesun: { url: PHIENG_LOI_VISUAL_ASSETS.heesunAtlas, columns: 3, rows: 2 },
  hanu: { url: PHIENG_LOI_VISUAL_ASSETS.hanuAtlas, columns: 3, rows: 2 },
  support: { url: PHIENG_LOI_VISUAL_ASSETS.supportAtlas, columns: 4, rows: 2 },
} as const;

export const atlasFrameStyle = (atlas: AtlasName, frame: number): CSSProperties => {
  const config = ATLAS_CONFIG[atlas];
  const safeFrame = Math.max(0, Math.min(config.columns * config.rows - 1, frame));
  const column = safeFrame % config.columns;
  const row = Math.floor(safeFrame / config.columns);
  const x = (column / (config.columns - 1)) * 100;
  const y = (row / (config.rows - 1)) * 100;
  return {
    backgroundImage: `url(${config.url})`,
    backgroundPosition: `${x}% ${y}%`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: `${config.columns * 100}% ${config.rows * 100}%`,
  };
};

export const preloadPhiengLoiVisualAssets = async (): Promise<void> => {
  if (typeof Image === 'undefined') return;
  await Promise.all(Object.values(PHIENG_LOI_VISUAL_ASSETS).map((url) => new Promise<void>((resolve) => {
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => resolve();
    image.onerror = () => resolve();
    image.src = url;
  })));
};
