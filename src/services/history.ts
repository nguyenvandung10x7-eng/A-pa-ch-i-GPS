import type { ChallengeRun } from '../types/task';
import {
  CHALLENGE_HISTORY_KEY_LEGACY,
  CHALLENGE_HISTORY_KEY_V2,
  CHALLENGE_STORAGE_PROTOCOL_KEY,
  CHALLENGE_STORAGE_PROTOCOL_V2,
  getChallengeClearVersion,
} from './tasks';

const normalizeRunClearVersion = (value: unknown): number => {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return parsed;
};

export const getStoredHistoryRawV2 = (): string | null => localStorage.getItem(CHALLENGE_HISTORY_KEY_V2);
export const getStoredHistoryRawLegacy = (): string | null => localStorage.getItem(CHALLENGE_HISTORY_KEY_LEGACY);

export const restoreStoredHistoryV2RawWhileLocked = (raw: string | null): void => {
  if (raw === null) {
    localStorage.removeItem(CHALLENGE_HISTORY_KEY_V2);
    return;
  }
  localStorage.setItem(CHALLENGE_HISTORY_KEY_V2, raw);
};

const parseHistoryRaw = (raw: string | null): ChallengeRun[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as ChallengeRun[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const historyForVersion = (items: ChallengeRun[], clearVersion: number): ChallengeRun[] => (
  items.filter((item) => normalizeRunClearVersion(item?.clearVersion) === clearVersion)
);

export const loadLegacyHistoryForVersion = (clearVersion: number): ChallengeRun[] => (
  historyForVersion(parseHistoryRaw(getStoredHistoryRawLegacy()), clearVersion)
);

export const loadV2HistoryForVersion = (clearVersion: number): ChallengeRun[] => (
  historyForVersion(parseHistoryRaw(getStoredHistoryRawV2()), clearVersion)
);

const saveRunInternal = (run: ChallengeRun, expectedClearVersion: number) => {
  const normalizedExpectedVersion = normalizeRunClearVersion(expectedClearVersion);
  const currentClearVersion = getChallengeClearVersion();
  if (normalizedExpectedVersion !== currentClearVersion) {
    return false;
  }

  const runWithVersion: ChallengeRun = { ...run, clearVersion: normalizedExpectedVersion };
  const next = [runWithVersion, ...loadV2HistoryForVersion(normalizedExpectedVersion).filter((item) => item.id !== run.id)].slice(0, 100);
  localStorage.setItem(CHALLENGE_HISTORY_KEY_V2, JSON.stringify(next));
  return true;
};

export const loadHistory = (): ChallengeRun[] => {
  const currentClearVersion = getChallengeClearVersion();
  const protocol = localStorage.getItem(CHALLENGE_STORAGE_PROTOCOL_KEY);
  if (protocol === CHALLENGE_STORAGE_PROTOCOL_V2) {
    return loadV2HistoryForVersion(currentClearVersion);
  }
  return loadLegacyHistoryForVersion(currentClearVersion);
};

export const saveRunWhileLocked = (run: ChallengeRun, expectedClearVersion: number) => saveRunInternal(run, expectedClearVersion);
