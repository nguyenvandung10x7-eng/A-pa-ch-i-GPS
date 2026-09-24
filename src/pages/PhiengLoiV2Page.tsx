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

export function PhiengLoiV2Page() {
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
