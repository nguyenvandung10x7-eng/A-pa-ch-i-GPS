import { lazy, Suspense } from 'react';
import { PhaserHost } from '../game/phieng-loi/PhaserHost';

const DevHarness = import.meta.env.DEV
  ? lazy(() => import('../game/phieng-loi/dev/FoundationHarness'))
  : null;

export function PhiengLoiV2Page() {
  if (DevHarness && new URLSearchParams(window.location.search).get('dev') === 'foundation') {
    return <Suspense fallback={null}><DevHarness /></Suspense>;
  }
  return <PhaserHost />;
}
