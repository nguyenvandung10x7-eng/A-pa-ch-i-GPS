import type { ChallengeTask } from '../types/task';
import { validateGps } from './gameplay';
import { loadHistory } from './history';
import { withChallengeStorageLock } from './challengeStorageLock';

export const JOURNEY_KEY = 'book-of-dien-bien-journey-v1';
export const JOURNEY_EVENT = 'book-of-dien-bien-journey-change';
export const A1_TASK_ID = 'doi-a1-chuyen-tau-thoi-gian-1954';
export const CULTURE_TASK_ID = 'ban-phieng-loi-mthen';
export const HISTORY_CHAPTER_ID = 'chapter-06-1954';
export type JourneyStage = '1954' | 'culture' | 'book';
export type JourneyStamp = { completedAt: string; source: 'journey' | 'legacy-gps'; gpsVerified: true };
export type JourneyState = { version: 1; trainOpenedAt?: string; a1?: JourneyStamp; culture?: JourneyStamp };

export const emptyJourney = (): JourneyState => ({ version: 1 });
const isTimestamp = (value: unknown): value is string => typeof value === 'string' && Number.isFinite(Date.parse(value));
const stamp = (value: unknown): JourneyStamp | undefined => {
  if (!value || typeof value !== 'object') return undefined;
  const record = value as Partial<JourneyStamp>;
  return record.gpsVerified === true && isTimestamp(record.completedAt)
    && (record.source === 'journey' || record.source === 'legacy-gps') ? record as JourneyStamp : undefined;
};
export const parseJourney = (raw: string | null): JourneyState => {
  if (!raw) return emptyJourney();
  const parsed = JSON.parse(raw) as JourneyState;
  if (!parsed || parsed.version !== 1) throw new Error('journey-storage-version');
  const a1 = stamp(parsed.a1);
  return { version: 1, trainOpenedAt: isTimestamp(parsed.trainOpenedAt) ? parsed.trainOpenedAt : undefined,
    a1, culture: a1 ? stamp(parsed.culture) : undefined };
};
export const journeyStage = (state: JourneyState): JourneyStage => state.a1 ? state.culture ? 'book' : 'culture' : '1954';

// Read-only bridge: an old score, a saved page or an unrelated Level 1 task is
// NOT evidence of visiting A1. Never modify gameplay, history or Book storage.
export const readJourney = (): JourneyState => {
  const state = parseJourney(localStorage.getItem(JOURNEY_KEY));
  const history = loadHistory();
  const legacyStamp = (taskId: string): JourneyStamp | undefined => {
    const run = history.find((entry) => entry?.taskId === taskId && entry.gpsVerified === true
      && entry.status === 'completed' && isTimestamp(entry.completedAt));
    return run?.completedAt ? { completedAt: run.completedAt, source: 'legacy-gps', gpsVerified: true } : undefined;
  };
  const a1 = state.a1 ?? legacyStamp(A1_TASK_ID);
  return { ...state, a1, culture: a1 ? state.culture ?? legacyStamp(CULTURE_TASK_ID) : undefined };
};
const persist = (state: JourneyState) => {
  localStorage.setItem(JOURNEY_KEY, JSON.stringify(state));
  window.dispatchEvent(new Event(JOURNEY_EVENT));
};
export const rememberTrainOpened = () => withChallengeStorageLock(() => {
  const state = readJourney();
  persist({ ...state, trainOpenedAt: state.trainOpenedAt ?? new Date().toISOString() });
});

export type JourneyPosition = { lat: number; lng: number; accuracy: number; timestamp: number };
export type JourneyResult = 'completed' | 'locked' | 'experience-required' | 'unavailable' | 'stale-location' | 'inaccurateLocation' | 'outsideTargetRadius';
export const checkJourneyCompletion = (
  state: JourneyState, stage: '1954' | 'culture', task: ChallengeTask | undefined,
  position: JourneyPosition, confirmed: boolean, now = Date.now(),
): JourneyResult => {
  if (stage === 'culture' && !state.a1) return 'locked';
  if (!confirmed || (stage === '1954' && !state.trainOpenedAt && !state.a1)) return 'experience-required';
  if (!task?.enabled || task.id !== (stage === '1954' ? A1_TASK_ID : CULTURE_TASK_ID)
    || !Number.isFinite(task.gps.lat) || !Number.isFinite(task.gps.lng)
    || task.gps.lat < -90 || task.gps.lat > 90 || task.gps.lng < -180 || task.gps.lng > 180
    || !Number.isFinite(task.gps.radius) || task.gps.radius <= 0) return 'unavailable';
  if (!Number.isFinite(position.timestamp) || now - position.timestamp > 30_000 || position.timestamp > now + 5_000) return 'stale-location';
  if (!Number.isFinite(position.lat) || Math.abs(position.lat) > 90
    || !Number.isFinite(position.lng) || Math.abs(position.lng) > 180
    || !Number.isFinite(position.accuracy) || position.accuracy < 0) return 'inaccurateLocation';
  const result = validateGps(task, position, position.accuracy);
  return result.valid ? 'completed' : result.status as JourneyResult;
};
export const completeJourneyStage = (
  stage: '1954' | 'culture', task: ChallengeTask | undefined, position: JourneyPosition, confirmed: boolean,
) => withChallengeStorageLock((): JourneyResult => {
  const state = readJourney();
  const result = checkJourneyCompletion(state, stage, task, position, confirmed);
  if (result !== 'completed') return result;
  const nextStamp: JourneyStamp = { completedAt: new Date().toISOString(), source: 'journey', gpsVerified: true };
  persist(stage === '1954' ? { ...state, a1: state.a1 ?? nextStamp } : { ...state, culture: state.culture ?? nextStamp });
  return result;
});
