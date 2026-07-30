import type { ChallengeRun } from '../types/task';
import { getChallengeClearVersion } from './tasks';

const HISTORY_KEY = 'gps-challenge-history';
const normalizeRunClearVersion = (value: unknown): number => {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return parsed;
};

const removeHistoryIfUnchanged = (expectedValue: string) => {
  if (localStorage.getItem(HISTORY_KEY) === expectedValue) {
    localStorage.removeItem(HISTORY_KEY);
  }
};

export const loadHistory = (): ChallengeRun[] => {
  const stored = localStorage.getItem(HISTORY_KEY);
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored) as ChallengeRun[];
    if (!Array.isArray(parsed)) return [];
    const currentClearVersion = getChallengeClearVersion();
    return parsed.filter((item) => normalizeRunClearVersion(item?.clearVersion) === currentClearVersion);
  } catch {
    return [];
  }
};

export const saveRun = (run: ChallengeRun, expectedClearVersion: number) => {
  const normalizedExpectedVersion = normalizeRunClearVersion(expectedClearVersion);
  const currentClearVersion = getChallengeClearVersion();
  if (normalizedExpectedVersion !== currentClearVersion) {
    return false;
  }

  const runWithVersion: ChallengeRun = { ...run, clearVersion: normalizedExpectedVersion };
  const next = [runWithVersion, ...loadHistory().filter((item) => item.id !== run.id)].slice(0, 100);
  const serialized = JSON.stringify(next);
  localStorage.setItem(HISTORY_KEY, serialized);

  if (getChallengeClearVersion() !== normalizedExpectedVersion) {
    removeHistoryIfUnchanged(serialized);
    return false;
  }

  return true;
};
