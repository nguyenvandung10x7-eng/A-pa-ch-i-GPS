import type { AssetManifest } from '../assets';
import frames from './source/frames.json';
import state from './source/state.json';

const root = 'assets/phieng-loi-v2/hs-reveal/';
export const REVEAL_COMPLETE = 'reveal_complete';
export const FRAME_KEYS = Array.from({ length: frames.frame_count }, (_, index) =>
  'pl:v2:hs-reveal:frame-' + String(index + 1).padStart(2, '0'));

// Import only Task 01 values. Source next_phase/flow are never interpreted.
export const REVEAL_CONFIG = Object.freeze({
  id: frames.id,
  fps: frames.fps,
  loop: frames.loop,
  characterScale: state.reveal.character_scale_peak,
  aura: state.aura_tween,
  voice: Object.freeze({
    assetId: state.reveal.voice_cue,
    approvedAsset: null,
    approvedCueSeconds: state.reveal.voice_cue_time_sec,
    proposedCueSeconds: state.reveal.voice_cue_proposal_sec,
    status: 'unbound' as const,
  }),
});

// First-pass staging only: no per-frame translation/warp; constant bottom anchor.
export const AURA_LAYERS = [
  { name: 'BeerTowerBack', key: 'pl:v2:hs-reveal:beer-tower', file: 'hs_beer_tower_back.png', height: 570, y: 0, originY: 1, opacity: 1 },
  { name: 'HaloGlow', key: 'pl:v2:hs-reveal:halo', file: 'hs_halo_glow.png', height: 420, y: -360, originY: 0.5, opacity: 0.8 },
  { name: 'RibbonBack', key: 'pl:v2:hs-reveal:ribbon-back', file: 'hs_ribbon_back.png', height: 570, y: 0, originY: 1, opacity: 1 },
] as const;

export const REVEAL_ASSETS: AssetManifest = Object.freeze([
  ...FRAME_KEYS.map((key, index) => ({
    key, path: root + 'heesun_reveal_25f/frames/hs_beer_saint_' + String(index + 1).padStart(2, '0') + '.png',
  })),
  ...AURA_LAYERS.map((layer) => ({ key: layer.key, path: root + 'heesun_aura_layers/' + layer.file })),
]);
