import type { CSSProperties } from 'react';

export const PHIENG_LOI_VISUAL_ASSETS = {
  world: '/images/phieng-loi/village-world-v2.webp',
  heesunAtlas: '/images/phieng-loi/heesun-atlas-v1.webp',
  hanuAtlas: '/images/phieng-loi/hanu-atlas-v1.webp',
  supportAtlas: '/images/phieng-loi/support-atlas-v1.webp',
  heesunRunAtlas: '/images/phieng-loi/heesun-run-v2.webp',
  hanuWalkAtlas: '/images/phieng-loi/hanu-walk-v2.webp',
  playerRunAtlas: '/images/phieng-loi/player-run-v2.webp',
  chiefTalkAtlas: '/images/phieng-loi/chief-talk-v2.webp',
  feastLoopAtlas: '/images/phieng-loi/feast-loop-v2.webp',
  streamLoopAtlas: '/images/phieng-loi/stream-loop-v2.webp',
  vuongMeDanceAtlas: '/images/phieng-loi/vuongme-dance-v1.webp',
  hanuFood: '/images/phieng-loi/hanu-food-box-v1.svg',
  heesunMenu: '/images/phieng-loi/heesun-menu-v1.webp',
  hanuMenu: '/images/phieng-loi/hanu-menu-v1.webp',
} as const;

export type AtlasName =
  | 'heesun'
  | 'hanu'
  | 'support'
  | 'heesunRun'
  | 'hanuWalk'
  | 'playerRun'
  | 'chiefTalk'
  | 'feastLoop'
  | 'streamLoop'
  | 'vuongMeDance';

const ATLAS_CONFIG = {
  heesun: { url: PHIENG_LOI_VISUAL_ASSETS.heesunAtlas, columns: 3, rows: 2, frameAspect: 1 },
  hanu: { url: PHIENG_LOI_VISUAL_ASSETS.hanuAtlas, columns: 3, rows: 2, frameAspect: 1 },
  support: { url: PHIENG_LOI_VISUAL_ASSETS.supportAtlas, columns: 4, rows: 2, frameAspect: 1 },
  heesunRun: { url: PHIENG_LOI_VISUAL_ASSETS.heesunRunAtlas, columns: 4, rows: 2, frameAspect: 0.75 },
  hanuWalk: { url: PHIENG_LOI_VISUAL_ASSETS.hanuWalkAtlas, columns: 4, rows: 2, frameAspect: 0.75 },
  playerRun: { url: PHIENG_LOI_VISUAL_ASSETS.playerRunAtlas, columns: 4, rows: 2, frameAspect: 1 },
  chiefTalk: { url: PHIENG_LOI_VISUAL_ASSETS.chiefTalkAtlas, columns: 4, rows: 2, frameAspect: 1 },
  feastLoop: { url: PHIENG_LOI_VISUAL_ASSETS.feastLoopAtlas, columns: 4, rows: 2, frameAspect: 1 },
  streamLoop: { url: PHIENG_LOI_VISUAL_ASSETS.streamLoopAtlas, columns: 4, rows: 2, frameAspect: 1 },
  vuongMeDance: { url: PHIENG_LOI_VISUAL_ASSETS.vuongMeDanceAtlas, columns: 4, rows: 2, frameAspect: 1 },
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
    aspectRatio: config.frameAspect,
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
