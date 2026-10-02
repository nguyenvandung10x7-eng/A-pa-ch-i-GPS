import { lazy, Suspense } from 'react';
import { PhaserHost } from '../game/phieng-loi/PhaserHost';

const DevHarness = import.meta.env.DEV
  ? lazy(() => import('../game/phieng-loi/dev/FoundationHarness'))
  : null;
const RevealHarness = import.meta.env.DEV
  ? lazy(() => import('../game/phieng-loi/reveal/RevealHarness'))
  : null;

const MangaHarness = import.meta.env.DEV
  ? lazy(() => import('../game/phieng-loi/manga/MangaHarness'))
  : null;

const FlowHarness = import.meta.env.DEV
  ? lazy(() => import('../game/phieng-loi/flow/FlowHarness'))
  : null;

const WorldHarness = import.meta.env.DEV ? lazy(() => import('../game/phieng-loi/world/WorldHarness')) : null;
const EncounterPlaytest = import.meta.env.DEV ? lazy(() => import('../game/phieng-loi/world/hs01/Playtest')) : null;

const PlayerPreview = import.meta.env.MODE === 'hs01-preview'
  ? lazy(() => import('../game/phieng-loi/world/hs01/preview/PlayerPreview')) : null;

export function PhiengLoiV2Page() {
  if (PlayerPreview) return <Suspense fallback={<p>Đang tải preview…</p>}><PlayerPreview /></Suspense>;
  if (EncounterPlaytest && new URLSearchParams(window.location.search).get('dev') === 'hs01-play') {
    return <Suspense fallback={null}><EncounterPlaytest /></Suspense>;
  }
  if (WorldHarness && new URLSearchParams(window.location.search).get('dev') === 'world-move') {
    return <Suspense fallback={null}><WorldHarness /></Suspense>;
  }
  if (FlowHarness && new URLSearchParams(window.location.search).get('dev') === 'hs-flow') {
    return <Suspense fallback={null}><FlowHarness /></Suspense>;
  }
  if (MangaHarness && new URLSearchParams(window.location.search).get('dev') === 'hs-manga') {
    return <Suspense fallback={null}><MangaHarness /></Suspense>;
  }
  if (RevealHarness && new URLSearchParams(window.location.search).get('dev') === 'hs-reveal') {
    return <Suspense fallback={null}><RevealHarness /></Suspense>;
  }
  if (DevHarness && new URLSearchParams(window.location.search).get('dev') === 'foundation') {
    return <Suspense fallback={null}><DevHarness /></Suspense>;
  }
  return <PhaserHost />;
}
