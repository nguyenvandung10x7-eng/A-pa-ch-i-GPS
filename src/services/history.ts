import type { ChallengeRun } from '../types/task';

const HISTORY_KEY = 'gps-challenge-history';

export const loadHistory = (): ChallengeRun[] => {
  const stored = localStorage.getItem(HISTORY_KEY);
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored) as ChallengeRun[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveRun = (run: ChallengeRun) => {
  const next = [run, ...loadHistory().filter((item) => item.id !== run.id)].slice(0, 100);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  return next;
};
