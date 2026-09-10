import { useCallback, useEffect, useState } from 'react';
import { createExactTaskExperienceMode, SPECIALIZED_TASK_IDS } from '../services/experienceFilters';
import { loadHistory } from '../services/history';
import {
  CHALLENGE_CLEAR_VERSION_KEY,
  CHALLENGE_HISTORY_KEY_LEGACY,
  CHALLENGE_HISTORY_KEY_V2,
  CHALLENGE_STORAGE_PROTOCOL_KEY,
} from '../services/tasks';

export const TIME_TRAIN_TASK_ID = SPECIALIZED_TASK_IDS.timeTrain;
export const TIME_TRAIN_EXPERIENCE_MODE = createExactTaskExperienceMode(TIME_TRAIN_TASK_ID);
export const TIME_TRAIN_CHALLENGE_PATH = `/challenge?experience=${encodeURIComponent(TIME_TRAIN_EXPERIENCE_MODE)}`;

const unlockStorageKeys = new Set([
  CHALLENGE_CLEAR_VERSION_KEY,
  CHALLENGE_HISTORY_KEY_LEGACY,
  CHALLENGE_HISTORY_KEY_V2,
  CHALLENGE_STORAGE_PROTOCOL_KEY,
]);

export const hasCompletedTimeTrainGps = (): boolean => loadHistory().some((run) => (
  run.taskId === TIME_TRAIN_TASK_ID
  && run.status === 'completed'
  && run.gpsVerified === true
  && typeof run.completedAt === 'string'
  && run.completedAt.length > 0
));

export const useTimeTrainUnlock = (): boolean => {
  const readUnlock = useCallback(() => hasCompletedTimeTrainGps(), []);
  const [unlocked, setUnlocked] = useState(readUnlock);

  useEffect(() => {
    const refresh = () => setUnlocked(readUnlock());
    const handleStorage = (event: StorageEvent) => {
      if (event.storageArea !== window.localStorage) return;
      if (event.key !== null && !unlockStorageKeys.has(event.key)) return;
      refresh();
    };

    window.addEventListener('focus', refresh);
    window.addEventListener('pageshow', refresh);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('focus', refresh);
      window.removeEventListener('pageshow', refresh);
      window.removeEventListener('storage', handleStorage);
    };
  }, [readUnlock]);

  return unlocked;
};
