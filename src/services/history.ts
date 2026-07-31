import type { ChallengeRun } from '../types/task';
import { getChallengeClearVersion } from './tasks';

export const CHALLENGE_HISTORY_KEY = 'gps-challenge-history';
const normalizeRunClearVersion = (value: unknown): number => {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return parsed;
};

export const getStoredHistoryRaw = (): string | null => localStorage.getItem(CHALLENGE_HISTORY_KEY);

export const restoreStoredHistoryRawWhileLocked = (raw: string | null): void => {
  if (raw === null) {
    localStorage.removeItem(CHALLENGE_HISTORY_KEY);
    return;
  }
  localStorage.setItem(CHALLENGE_HISTORY_KEY, raw);
};

const parseStoredHistory = (): ChallengeRun[] => {
  const stored = getStoredHistoryRaw();
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored) as ChallengeRun[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const loadHistoryForVersion = (clearVersion: number): ChallengeRun[] => (
  parseStoredHistory().filter((item) => normalizeRunClearVersion(item?.clearVersion) === clearVersion)
);

const saveRunInternal = (run: ChallengeRun, expectedClearVersion: number) => {
  const normalizedExpectedVersion = normalizeRunClearVersion(expectedClearVersion);
  const currentClearVersion = getChallengeClearVersion();
  if (normalizedExpectedVersion !== currentClearVersion) {
    return false;
  }

  const runWithVersion: ChallengeRun = { ...run, clearVersion: normalizedExpectedVersion };
  const next = [runWithVersion, ...loadHistoryForVersion(normalizedExpectedVersion).filter((item) => item.id !== run.id)].slice(0, 100);
  localStorage.setItem(CHALLENGE_HISTORY_KEY, JSON.stringify(next));
  return true;
};

export const loadHistory = (): ChallengeRun[] => {
  const currentClearVersion = getChallengeClearVersion();
  return loadHistoryForVersion(currentClearVersion);
};

export const saveRunWhileLocked = (run: ChallengeRun, expectedClearVersion: number) => saveRunInternal(run, expectedClearVersion);
