import { useEffect, useState } from 'react';
import { emptyJourney, JOURNEY_EVENT, journeyStage, readJourney, type JourneyStage, type JourneyStamp } from '../services/journey';

const snapshot = () => {
  const hostname = window.location.hostname;
  const previewHost = hostname === 'localhost' || hostname === '127.0.0.1'
    || (hostname.startsWith('deploy-preview-') && hostname.endsWith('.netlify.app'));
  const requested = previewHost ? new URLSearchParams(window.location.search).get('journeyPreview') : null;
  const previewSessionKey = 'book-of-dien-bien-journey-preview';
  let storedPreview: string | null = null;
  if (previewHost) {
    try {
      if (requested === 'culture' || requested === 'book') window.sessionStorage.setItem(previewSessionKey, requested);
      if (requested === 'off') window.sessionStorage.removeItem(previewSessionKey);
      storedPreview = window.sessionStorage.getItem(previewSessionKey);
    } catch {
      storedPreview = requested;
    }
  }
  const preview = storedPreview === 'culture' || storedPreview === 'book' ? storedPreview as JourneyStage : undefined;
  const previewStamp: JourneyStamp = { completedAt: new Date(0).toISOString(), source: 'journey', gpsVerified: true };
  try {
    const state = readJourney();
    if (preview === 'culture') return { state: { ...state, a1: state.a1 ?? previewStamp }, storageError: false, preview };
    if (preview === 'book') return { state: { ...state, a1: state.a1 ?? previewStamp, culture: state.culture ?? previewStamp }, storageError: false, preview };
    return { state, storageError: false, preview: undefined };
  }
  catch { return { state: emptyJourney(), storageError: true, preview }; }
};
export const useJourney = () => {
  const [value, setValue] = useState(snapshot);
  useEffect(() => {
    const refresh = () => setValue(snapshot());
    window.addEventListener(JOURNEY_EVENT, refresh);
    window.addEventListener('storage', refresh);
    window.addEventListener('focus', refresh);
    return () => {
      window.removeEventListener(JOURNEY_EVENT, refresh);
      window.removeEventListener('storage', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, []);
  return { ...value, stage: journeyStage(value.state) };
};
