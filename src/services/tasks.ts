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

const mergeLocalizedOptionalField = (
  current: ChallengeTask['locationIntro'],
  fallback: ChallengeTask['locationIntro'],
): ChallengeTask['locationIntro'] => {
  if (!fallback) return current;
  if (current == null) return fallback;

  let nextValue = current;

  if (!Object.prototype.hasOwnProperty.call(current, 'vi')) {
    nextValue = { ...nextValue, vi: fallback.vi };
  }

  if (!Object.prototype.hasOwnProperty.call(current, 'en')) {
    nextValue = { ...nextValue, en: fallback.en };
  }

  return nextValue;
};

export const defaultTasks = tasksJson as ChallengeTask[];

const LEGACY_A1_TASK_ID = 'doi-a1-khoanh-khac-tuong-niem';
const TIME_TRAIN_TASK_ID = 'doi-a1-chuyen-tau-thoi-gian-1954';
const LEGACY_REMOVED_TASK_IDS = new Set([
  'deo-pha-din-cat-banh',
  'cong-vien-tai-dinh-cu-him-lam-cat-banh',
]);
const LEGACY_RENAMES = new Map<string, string>([
  ['cho-muong-nhe-mthen', 'cho-muong-nhe-tang-banh-trung-thu'],
  ['cau-ta-ko-khu-cat-banh', 'cau-ta-ko-khu-tang-banh-trung-thu'],
  ['ban-a-pa-chai-trai-ban', 'ban-a-pa-chai-tang-banh-trung-thu'],
  ['ke-nenh-ruong-bac-thang-mthen', 'ruong-bac-thang-ta-leng-mthen'],
  ['thac-ke-nenh-trai-ban-lanh-lung', 'thac-ke-nenh-mthen'],
]);
const AUTHORITATIVE_TASK_IDS = new Set([
  'cho-muong-nhe-tang-banh-trung-thu',
  'cau-ta-ko-khu-tang-banh-trung-thu',
  'ban-a-pa-chai-tang-banh-trung-thu',
  'bao-tang-chien-thang-dien-bien-phu-trai-nghiem',
  'cot-co-a-pa-chai-mthen',
  'cot-co-a-pa-chai-trai-ban-lanh-lung',
  'ruong-bac-thang-ta-leng-mthen',
  'thac-ke-nenh-mthen',
]);

const CHO_MUONG_NHE_OBSOLETE_IMAGE_PATHS = new Set([
  '/images/tasks/cho-muong-nhe-mthen.webp',
]);

const mergeStoredTasksWithDefaults = (storedTasks: ChallengeTask[]): ChallengeTask[] => {
  const defaultsById = new Map(defaultTasks.map((task) => [task.id, task]));
  const canonicalTimeTrainTask = defaultsById.get(TIME_TRAIN_TASK_ID);
  let changed = false;
  const hasCanonicalA1 = storedTasks.some((task) => task.id === TIME_TRAIN_TASK_ID);
  const storedTaskIds = new Set(storedTasks.map((task) => task.id));
  const seenDefaultIds = new Set<string>();

  const cloneDefaultTask = (taskId: string): ChallengeTask | undefined => {
    const defaultTask = defaultsById.get(taskId);
    return defaultTask ? structuredClone(defaultTask) : undefined;
  };

  const merged = storedTasks.flatMap((task) => {
    if (LEGACY_REMOVED_TASK_IDS.has(task.id)) {
      changed = true;
      return [];
    }

    const renamedTaskId = LEGACY_RENAMES.get(task.id);
    if (renamedTaskId) {
      const canonicalTask = cloneDefaultTask(renamedTaskId);
      if (!canonicalTask) return [];

      if (storedTaskIds.has(renamedTaskId)) {
        changed = true;
        return [];
      }

      changed = true;
      seenDefaultIds.add(renamedTaskId);
      return [canonicalTask];
    }

    if (task.id === LEGACY_A1_TASK_ID && hasCanonicalA1) {
      changed = true;
      return [];
    }

    if (task.id === LEGACY_A1_TASK_ID && canonicalTimeTrainTask) {
      changed = true;
      seenDefaultIds.add(canonicalTimeTrainTask.id);
      const currentImage = typeof task.image === 'string' ? task.image.trim() : '';
      return [{
        ...task,
        id: canonicalTimeTrainTask.id,
        title: canonicalTimeTrainTask.title,
        description: canonicalTimeTrainTask.description,
        locationIntro: task.locationIntro ?? canonicalTimeTrainTask.locationIntro,
        category: canonicalTimeTrainTask.category,
        difficulty: canonicalTimeTrainTask.difficulty,
        points: canonicalTimeTrainTask.points,
        enabled: canonicalTimeTrainTask.enabled,
        externalUrl: canonicalTimeTrainTask.externalUrl,
        image: currentImage || canonicalTimeTrainTask.image,
      }];
    }

    const defaultTask = defaultsById.get(task.id);
    if (!defaultTask) return [task];

    seenDefaultIds.add(task.id);

    if (AUTHORITATIVE_TASK_IDS.has(task.id)) {
      changed = true;
      return [cloneDefaultTask(task.id) as ChallengeTask];
    }

    let nextTask = task;
    const currentImage = typeof nextTask.image === 'string' ? nextTask.image.trim() : '';
    const defaultImage = typeof defaultTask.image === 'string' ? defaultTask.image.trim() : '';

    if (task.id === 'cho-muong-nhe-tang-banh-trung-thu' && CHO_MUONG_NHE_OBSOLETE_IMAGE_PATHS.has(currentImage) && currentImage !== defaultImage && defaultImage) {
      changed = true;
      nextTask = { ...nextTask, image: defaultImage };
    }

    if (!currentImage && defaultImage) {
      changed = true;
      nextTask = { ...nextTask, image: defaultImage };
    }

    const currentExternalUrl = typeof nextTask.externalUrl === 'string' ? nextTask.externalUrl.trim() : '';
    const defaultExternalUrl = typeof defaultTask.externalUrl === 'string' ? defaultTask.externalUrl.trim() : '';
    if (!currentExternalUrl && defaultExternalUrl) {
      changed = true;
      nextTask = { ...nextTask, externalUrl: defaultExternalUrl };
    }

    const mergedLocationIntro = mergeLocalizedOptionalField(nextTask.locationIntro, defaultTask.locationIntro);
    if (mergedLocationIntro !== nextTask.locationIntro) {
      changed = true;
      nextTask = { ...nextTask, locationIntro: mergedLocationIntro };
    }

    if (task.id === TIME_TRAIN_TASK_ID && canonicalTimeTrainTask) {
      const needsSync =
        nextTask.title.vi !== canonicalTimeTrainTask.title.vi
        || nextTask.title.en !== canonicalTimeTrainTask.title.en
        || nextTask.description.vi !== canonicalTimeTrainTask.description.vi
        || nextTask.description.en !== canonicalTimeTrainTask.description.en
        || nextTask.points !== canonicalTimeTrainTask.points
        || nextTask.difficulty !== canonicalTimeTrainTask.difficulty
        || nextTask.category !== canonicalTimeTrainTask.category;

      if (needsSync) {
        changed = true;
        nextTask = {
          ...nextTask,
          title: canonicalTimeTrainTask.title,
          description: canonicalTimeTrainTask.description,
          points: canonicalTimeTrainTask.points,
          difficulty: canonicalTimeTrainTask.difficulty,
          category: canonicalTimeTrainTask.category,
        };
      }
    }

    return [nextTask];
  });

  defaultTasks.forEach((task) => {
    if (seenDefaultIds.has(task.id)) return;
    changed = true;
    merged.push(structuredClone(task));
  });

  if (changed) {
    localStorage.setItem(TASKS_KEY, JSON.stringify(merged));
  }

  return merged;
};

export const loadTasks = (): ChallengeTask[] => {
  const stored = localStorage.getItem(TASKS_KEY);
  if (!stored) return cloneTasks(defaultTasks);
  try {
    const parsed = JSON.parse(stored) as ChallengeTask[];
    if (!Array.isArray(parsed)) return cloneTasks(defaultTasks);
    return mergeStoredTasksWithDefaults(parsed);
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
  locationIntro: { vi: '', en: '' },
  category: 'general',
  difficulty: 'easy',
  points: 100,
  gps: { lat: 10.7756, lng: 106.7039, radius: 50 },
  image: '',
  enabled: true,
});
