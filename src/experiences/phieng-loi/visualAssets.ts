import type { CSSProperties } from 'react';

export const PHIENG_LOI_VISUAL_ASSETS = {
  world: '/images/phieng-loi/village-world-v2.webp',
  heesunLocomotionSideAtlas: '/images/phieng-loi/heesun-side-v2.webp',
  heesunLocomotionDownAtlas: '/images/phieng-loi/heesun-down-v2.webp',
  heesunLocomotionUpAtlas: '/images/phieng-loi/heesun-up-v2.webp',
  heesunActionsAtlas: '/images/phieng-loi/heesun-actions-v2.webp',
  hanuLocomotionSideAtlas: '/images/phieng-loi/hanu-side-v2.webp',
  hanuLocomotionDownAtlas: '/images/phieng-loi/hanu-down-v2.webp',
  hanuLocomotionUpAtlas: '/images/phieng-loi/hanu-up-v2.webp',
  hanuActionsAtlas: '/images/phieng-loi/hanu-actions-v2.webp',
  supportAtlas: '/images/phieng-loi/support-atlas-v1.webp',
  playerLocomotionSideAtlas: '/images/phieng-loi/player-locomotion-side-v2.webp',
  playerLocomotionDownAtlas: '/images/phieng-loi/player-locomotion-down-v2.webp',
  playerLocomotionUpAtlas: '/images/phieng-loi/player-locomotion-up-v2.webp',
  playerPhaOiAtlas: '/images/phieng-loi/player-pha-oi-v1.webp',
  playerActionsAtlas: '/images/phieng-loi/player-actions-v2.webp',
  chiefTalkAtlas: '/images/phieng-loi/chief-talk-v2.webp',
  feastLoopAtlas: '/images/phieng-loi/feast-loop-v2.webp',
  streamLoopAtlas: '/images/phieng-loi/stream-loop-v2.webp',
  feastActionAtlas: '/images/phieng-loi/feast-action-atlas-v1.webp',
  streamActionAtlas: '/images/phieng-loi/stream-action-atlas-v1.webp',
  vuongMeDanceAtlas: '/images/phieng-loi/vuongme-dance-v1.webp',
  heesunWifeAtlas: '/images/phieng-loi/heesun-wife-atlas-v1.webp',
  victoryMonument: '/images/phieng-loi/dien-bien-victory-monument-v1.webp',
  victoryMuseum: '/images/phieng-loi/dien-bien-victory-museum-v1.webp',
  heesunMenu: '/images/phieng-loi/heesun-menu-v1.webp',
  hanuMenu: '/images/phieng-loi/hanu-menu-v1.webp',
} as const;

export type AtlasName =
  | 'heesunLocomotionSide'
  | 'heesunLocomotionDown'
  | 'heesunLocomotionUp'
  | 'heesunActions'
  | 'hanuLocomotionSide'
  | 'hanuLocomotionDown'
  | 'hanuLocomotionUp'
  | 'hanuActions'
  | 'support'
  | 'playerLocomotionSide'
  | 'playerLocomotionDown'
  | 'playerLocomotionUp'
  | 'playerPhaOi'
  | 'playerActions'
  | 'chiefTalk'
  | 'feastLoop'
  | 'streamLoop'
  | 'feastAction'
  | 'streamAction'
  | 'vuongMeDance'
  | 'heesunWife';

const ATLAS_CONFIG = {
  heesunLocomotionSide: { url: PHIENG_LOI_VISUAL_ASSETS.heesunLocomotionSideAtlas, columns: 4, rows: 4, frameAspect: 1.5 },
  heesunLocomotionDown: { url: PHIENG_LOI_VISUAL_ASSETS.heesunLocomotionDownAtlas, columns: 4, rows: 4, frameAspect: 1.5 },
  heesunLocomotionUp: { url: PHIENG_LOI_VISUAL_ASSETS.heesunLocomotionUpAtlas, columns: 4, rows: 4, frameAspect: 1.5 },
  heesunActions: { url: PHIENG_LOI_VISUAL_ASSETS.heesunActionsAtlas, columns: 4, rows: 4, frameAspect: 1.5 },
  hanuLocomotionSide: { url: PHIENG_LOI_VISUAL_ASSETS.hanuLocomotionSideAtlas, columns: 4, rows: 4, frameAspect: 1.5 },
  hanuLocomotionDown: { url: PHIENG_LOI_VISUAL_ASSETS.hanuLocomotionDownAtlas, columns: 4, rows: 4, frameAspect: 1.5 },
  hanuLocomotionUp: { url: PHIENG_LOI_VISUAL_ASSETS.hanuLocomotionUpAtlas, columns: 4, rows: 4, frameAspect: 1.5 },
  hanuActions: { url: PHIENG_LOI_VISUAL_ASSETS.hanuActionsAtlas, columns: 4, rows: 4, frameAspect: 1.5 },
  support: { url: PHIENG_LOI_VISUAL_ASSETS.supportAtlas, columns: 4, rows: 2, frameAspect: 1 },
  playerLocomotionSide: { url: PHIENG_LOI_VISUAL_ASSETS.playerLocomotionSideAtlas, columns: 4, rows: 4, frameAspect: 1.5 },
  playerLocomotionDown: { url: PHIENG_LOI_VISUAL_ASSETS.playerLocomotionDownAtlas, columns: 4, rows: 4, frameAspect: 1.5 },
  playerLocomotionUp: { url: PHIENG_LOI_VISUAL_ASSETS.playerLocomotionUpAtlas, columns: 4, rows: 4, frameAspect: 1.5 },
  playerPhaOi: { url: PHIENG_LOI_VISUAL_ASSETS.playerPhaOiAtlas, columns: 4, rows: 2, frameAspect: .75 },
  playerActions: { url: PHIENG_LOI_VISUAL_ASSETS.playerActionsAtlas, columns: 4, rows: 3, frameAspect: 384 / 341 },
  chiefTalk: { url: PHIENG_LOI_VISUAL_ASSETS.chiefTalkAtlas, columns: 4, rows: 2, frameAspect: 1 },
  feastLoop: { url: PHIENG_LOI_VISUAL_ASSETS.feastLoopAtlas, columns: 4, rows: 2, frameAspect: 1 },
  streamLoop: { url: PHIENG_LOI_VISUAL_ASSETS.streamLoopAtlas, columns: 4, rows: 2, frameAspect: 1 },
  feastAction: { url: PHIENG_LOI_VISUAL_ASSETS.feastActionAtlas, columns: 4, rows: 2, frameAspect: 1 },
  streamAction: { url: PHIENG_LOI_VISUAL_ASSETS.streamActionAtlas, columns: 4, rows: 2, frameAspect: 1 },
  vuongMeDance: { url: PHIENG_LOI_VISUAL_ASSETS.vuongMeDanceAtlas, columns: 4, rows: 2, frameAspect: 1 },
  heesunWife: { url: PHIENG_LOI_VISUAL_ASSETS.heesunWifeAtlas, columns: 4, rows: 2, frameAspect: 0.75 },
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
