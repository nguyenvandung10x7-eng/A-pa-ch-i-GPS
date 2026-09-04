import tasksJson from '../data/tasks.json';
import type { ChallengeTask } from '../types/task';
import { withChallengeStorageLock } from './challengeStorageLock';
import { isRetiredChallengeTaskId } from './challengeTaskMigrationContract';
import { migrateTaskId } from './taskIdMigration';
import { CHALLENGE_LEVEL_ONE_ACCEPTED_KEY } from './challengeLevels';

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

type OptionalLocalizedField = ChallengeTask['locationIntro'] | ChallengeTask['experienceNote'];

const mergeLocalizedOptionalField = (
  current: OptionalLocalizedField,
  fallback: OptionalLocalizedField,
): OptionalLocalizedField => {
  if (!fallback) return current;
  if (current == null) return fallback;

  if (typeof current !== 'object' || Array.isArray(current)) {
    return fallback;
  }

  let nextValue = current;

  if (typeof current.vi !== 'string') {
    nextValue = { ...nextValue, vi: fallback.vi };
  }

  if (typeof current.en !== 'string') {
    nextValue = { ...nextValue, en: fallback.en };
  }

  return nextValue;
};

const mergeLocalizedRequiredField = (
  current: ChallengeTask['title'] | ChallengeTask['description'],
  fallback: ChallengeTask['title'] | ChallengeTask['description'],
): ChallengeTask['title'] | ChallengeTask['description'] => {
  if (!current || typeof current !== 'object' || Array.isArray(current)) {
    return fallback;
  }

  let nextValue = current;

  if (typeof current.vi !== 'string') {
    nextValue = { ...nextValue, vi: fallback.vi };
  }

  if (typeof current.en !== 'string') {
    nextValue = { ...nextValue, en: fallback.en };
  }

  return nextValue;
};

const normalizeStringField = (value: unknown, fallback: string): string => {
  if (typeof value !== 'string') return fallback;
  const normalized = value.trim();
  return normalized || fallback;
};

const normalizeOptionalStringField = (value: unknown, fallback: string | undefined): string | undefined => {
  if (typeof value !== 'string') return fallback;
  const normalized = value.trim();
  if (normalized) return normalized;
  return fallback;
};

const normalizeOptionalStringArrayField = (value: unknown, fallback: string[] | undefined): string[] | undefined => {
  if (!Array.isArray(value)) return fallback;

  const normalized = value
    .filter((entry): entry is string => typeof entry === 'string')
    .map((entry) => entry.trim())
    .filter(Boolean);

  if (normalized.length > 0) {
    return normalized;
  }

  return fallback;
};

const normalizePoints = (value: unknown, fallback: number): number => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return value;
};

const normalizeEnabled = (value: unknown, fallback: boolean): boolean => {
  if (typeof value !== 'boolean') return fallback;
  return value;
};

const normalizeGps = (value: unknown, fallback: ChallengeTask['gps']): ChallengeTask['gps'] => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return fallback;
  }

  const candidate = value as Partial<ChallengeTask['gps']>;
  const lat = candidate.lat;
  const lng = candidate.lng;
  const radius = candidate.radius;

  if (
    typeof lat !== 'number' || !Number.isFinite(lat)
    || typeof lng !== 'number' || !Number.isFinite(lng)
    || typeof radius !== 'number' || !Number.isFinite(radius) || radius <= 0
  ) {
    return fallback;
  }

  return { lat, lng, radius };
};

export const defaultTasks = tasksJson as ChallengeTask[];

const LEGACY_A1_TASK_ID = 'doi-a1-khoanh-khac-tuong-niem';
const TIME_TRAIN_TASK_ID = 'doi-a1-chuyen-tau-thoi-gian-1954';

const CHO_MUONG_NHE_OBSOLETE_IMAGE_PATHS = new Set([
  '/images/tasks/cho-muong-nhe-mthen.webp',
]);

const mergeTaskWithDefault = (task: ChallengeTask, defaultTask: ChallengeTask): { task: ChallengeTask; changed: boolean } => {
  let nextTask = task;
  let changed = false;

  const nextTitle = mergeLocalizedRequiredField(nextTask.title, defaultTask.title);
  if (nextTitle !== nextTask.title) {
    changed = true;
    nextTask = { ...nextTask, title: nextTitle };
  }

  const nextDescription = mergeLocalizedRequiredField(nextTask.description, defaultTask.description);
  if (nextDescription !== nextTask.description) {
    changed = true;
    nextTask = { ...nextTask, description: nextDescription };
  }

  const nextLocationIntro = mergeLocalizedOptionalField(nextTask.locationIntro, defaultTask.locationIntro);
  if (nextLocationIntro !== nextTask.locationIntro) {
    changed = true;
    nextTask = { ...nextTask, locationIntro: nextLocationIntro };
  }

  const nextExperienceNote = mergeLocalizedOptionalField(nextTask.experienceNote, defaultTask.experienceNote);
  if (nextExperienceNote !== nextTask.experienceNote) {
    changed = true;
    nextTask = { ...nextTask, experienceNote: nextExperienceNote };
  }

  const nextCategory = normalizeStringField(nextTask.category, defaultTask.category);
  if (nextCategory !== nextTask.category) {
    changed = true;
    nextTask = { ...nextTask, category: nextCategory };
  }

  const nextDifficulty = normalizeStringField(nextTask.difficulty, defaultTask.difficulty);
  if (nextDifficulty !== nextTask.difficulty) {
    changed = true;
    nextTask = { ...nextTask, difficulty: nextDifficulty };
  }

  const nextPoints = normalizePoints(nextTask.points, defaultTask.points);
  if (nextPoints !== nextTask.points) {
    changed = true;
    nextTask = { ...nextTask, points: nextPoints };
  }

  const nextGps = normalizeGps(nextTask.gps, defaultTask.gps);
  if (nextGps !== nextTask.gps) {
    changed = true;
    nextTask = { ...nextTask, gps: nextGps };
  }

  const nextEnabled = normalizeEnabled(nextTask.enabled, defaultTask.enabled);
  if (nextEnabled !== nextTask.enabled) {
    changed = true;
    nextTask = { ...nextTask, enabled: nextEnabled };
  }

  const nextImage = normalizeStringField(nextTask.image, defaultTask.image);
  if (nextImage !== nextTask.image) {
    changed = true;
    nextTask = { ...nextTask, image: nextImage };
  }

  const currentImage = typeof nextTask.image === 'string' ? nextTask.image.trim() : '';
  const defaultImage = typeof defaultTask.image === 'string' ? defaultTask.image.trim() : '';
  if (nextTask.id === 'cho-muong-nhe-tang-banh-trung-thu' && CHO_MUONG_NHE_OBSOLETE_IMAGE_PATHS.has(currentImage) && currentImage !== defaultImage && defaultImage) {
    changed = true;
    nextTask = { ...nextTask, image: defaultImage };
  }

  const nextExternalUrl = normalizeOptionalStringField(nextTask.externalUrl, defaultTask.externalUrl);
  if (nextExternalUrl !== nextTask.externalUrl) {
    changed = true;
    nextTask = { ...nextTask, externalUrl: nextExternalUrl };
  }

  const nextImages = normalizeOptionalStringArrayField(nextTask.images, defaultTask.images);
  if (nextImages !== nextTask.images) {
    changed = true;
    nextTask = { ...nextTask, images: nextImages };
  }

  return { task: nextTask, changed };
};

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
    if (isRetiredChallengeTaskId(task.id)) {
      changed = true;
      return [];
    }

    const migratedTaskId = migrateTaskId(task.id);
    if (migratedTaskId.changed) {
      const renamedTaskId = migratedTaskId.taskId;
      const canonicalTask = cloneDefaultTask(renamedTaskId);
      if (!canonicalTask) return [];

      if (storedTaskIds.has(renamedTaskId)) {
        changed = true;
        return [];
      }

      seenDefaultIds.add(renamedTaskId);
      const mergedRenamedTask = mergeTaskWithDefault({
        ...task,
        id: renamedTaskId,
      }, canonicalTask);
      changed = true;
      return [mergedRenamedTask.task];
    }

    if (task.id === LEGACY_A1_TASK_ID && hasCanonicalA1) {
      changed = true;
      return [];
    }

    if (task.id === LEGACY_A1_TASK_ID && canonicalTimeTrainTask) {
      changed = true;
      seenDefaultIds.add(canonicalTimeTrainTask.id);
      const migratedLegacyA1Task = mergeTaskWithDefault({
        ...task,
        id: canonicalTimeTrainTask.id,
      }, canonicalTimeTrainTask);
      return [migratedLegacyA1Task.task];
    }

    const defaultTask = defaultsById.get(task.id);
    if (!defaultTask) return [task];

    seenDefaultIds.add(task.id);

    let nextTask = task;
    const mergedTask = mergeTaskWithDefault(task, defaultTask);
    if (mergedTask.changed) {
      changed = true;
      nextTask = mergedTask.task;
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
      levelOneAccepted: localStorage.getItem(CHALLENGE_LEVEL_ONE_ACCEPTED_KEY),
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
      localStorage.removeItem(CHALLENGE_LEVEL_ONE_ACCEPTED_KEY);
    } catch (error) {
      try {
        restoreKey(CHALLENGE_CLEAR_VERSION_KEY, snapshot.clearVersion);
        restoreKey(CHALLENGE_STORAGE_PROTOCOL_KEY, snapshot.protocol);
        restoreKey(CHALLENGE_PROGRESS_KEY_V2, snapshot.progressV2);
        restoreKey(CHALLENGE_HISTORY_KEY_V2, snapshot.historyV2);
        restoreKey(CHALLENGE_LEVEL_ONE_ACCEPTED_KEY, snapshot.levelOneAccepted);
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
