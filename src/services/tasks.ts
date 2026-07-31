import tasksJson from '../data/tasks.json';
import type { ChallengeTask } from '../types/task';
import { withChallengeStorageLock } from './challengeStorageLock';

const TASKS_KEY = 'gps-challenge-tasks';
export const CHALLENGE_CLEAR_VERSION_KEY = 'gps-challenge-clear-version';
export const CHALLENGE_STORAGE_PROTOCOL_KEY = 'gps-challenge-storage-protocol';
export const CHALLENGE_STORAGE_PROTOCOL_V2 = '2';
export const CHALLENGE_PROGRESS_KEY_LEGACY = 'gps-challenge-progress';
export const CHALLENGE_PROGRESS_KEY_V2 = 'gps-challenge-progress-v2';
export const CHALLENGE_HISTORY_KEY_LEGACY = 'gps-challenge-history';
export const CHALLENGE_HISTORY_KEY_V2 = 'gps-challenge-history-v2';

const parseClearVersion = (value: string | null): number => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return parsed;
};

export const getChallengeClearVersion = (): number => parseClearVersion(localStorage.getItem(CHALLENGE_CLEAR_VERSION_KEY));

const cloneTasks = (tasks: ChallengeTask[]) => structuredClone(tasks);

export const defaultTasks = tasksJson as ChallengeTask[];

export const loadTasks = (): ChallengeTask[] => {
  const stored = localStorage.getItem(TASKS_KEY);
  if (!stored) return cloneTasks(defaultTasks);
  try {
    const parsed = JSON.parse(stored) as ChallengeTask[];
    return Array.isArray(parsed) ? parsed : cloneTasks(defaultTasks);
  } catch {
    return cloneTasks(defaultTasks);
  }
};

export const saveTasks = (tasks: ChallengeTask[]) => localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
export const resetTasks = () => { localStorage.removeItem(TASKS_KEY); return cloneTasks(defaultTasks); };
export const clearLocalChallengeData = async (): Promise<void> => {
  await withChallengeStorageLock(() => {
    const snapshot = {
      clearVersion: localStorage.getItem(CHALLENGE_CLEAR_VERSION_KEY),
      protocol: localStorage.getItem(CHALLENGE_STORAGE_PROTOCOL_KEY),
      progressV2: localStorage.getItem(CHALLENGE_PROGRESS_KEY_V2),
      historyV2: localStorage.getItem(CHALLENGE_HISTORY_KEY_V2),
    };

    const restoreKey = (key: string, raw: string | null) => {
      if (raw === null) {
        localStorage.removeItem(key);
        return;
      }
      localStorage.setItem(key, raw);
    };

    const previousVersion = getChallengeClearVersion();
    const nextVersion = Math.max(Date.now(), previousVersion + 1);
    try {
      localStorage.setItem(CHALLENGE_CLEAR_VERSION_KEY, String(nextVersion));
      localStorage.setItem(CHALLENGE_STORAGE_PROTOCOL_KEY, CHALLENGE_STORAGE_PROTOCOL_V2);
      localStorage.removeItem(CHALLENGE_PROGRESS_KEY_V2);
      localStorage.removeItem(CHALLENGE_HISTORY_KEY_V2);
    } catch (error) {
      try {
        restoreKey(CHALLENGE_CLEAR_VERSION_KEY, snapshot.clearVersion);
        restoreKey(CHALLENGE_STORAGE_PROTOCOL_KEY, snapshot.protocol);
        restoreKey(CHALLENGE_PROGRESS_KEY_V2, snapshot.progressV2);
        restoreKey(CHALLENGE_HISTORY_KEY_V2, snapshot.historyV2);
      } catch {
        // Preserve the original protocol-v2 transaction error.
      }
      throw error;
    }

    try {
      localStorage.removeItem(CHALLENGE_PROGRESS_KEY_LEGACY);
    } catch {
      // Best-effort cleanup of legacy key only.
    }

    try {
      localStorage.removeItem(CHALLENGE_HISTORY_KEY_LEGACY);
    } catch {
      // Best-effort cleanup of legacy key only.
    }
  });
};
export const enabledTasks = (tasks: ChallengeTask[]) => tasks.filter((task) => task.enabled);
export const createEmptyTask = (): ChallengeTask => ({
  id: `task-${Date.now()}`,
  title: { vi: '', en: '' },
  description: { vi: '', en: '' },
  category: 'general',
  difficulty: 'easy',
  points: 100,
  gps: { lat: 10.7756, lng: 106.7039, radius: 50 },
  image: '',
  enabled: true,
});
