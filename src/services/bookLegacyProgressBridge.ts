import { getBookTargetForLegacyTask } from '../data/bookLegacyTaskMappings';
import { migrateTaskId } from './taskIdMigration';
import {
  CHALLENGE_PROGRESS_KEY_LEGACY,
  CHALLENGE_PROGRESS_KEY_V2,
  CHALLENGE_STORAGE_PROTOCOL_KEY,
  CHALLENGE_STORAGE_PROTOCOL_V2,
  getChallengeClearVersion,
} from './tasks';

type StoredProgressShape = {
  clearVersion?: unknown;
  completedTaskIds?: unknown;
};

const normalizeVersion = (value: unknown): number => {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return parsed;
};

const readProgress = (key: string): StoredProgressShape | null => {
  const raw = window.localStorage.getItem(key);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
    return parsed as StoredProgressShape;
  } catch {
    return null;
  }
};

const readAuthoritativeLegacyProgress = (): StoredProgressShape | null => {
  const protocol = window.localStorage.getItem(CHALLENGE_STORAGE_PROTOCOL_KEY);
  if (protocol === CHALLENGE_STORAGE_PROTOCOL_V2) {
    return readProgress(CHALLENGE_PROGRESS_KEY_V2);
  }

  return readProgress(CHALLENGE_PROGRESS_KEY_V2) ?? readProgress(CHALLENGE_PROGRESS_KEY_LEGACY);
};

/**
 * Read-only bridge from legacy challenge progress into the Book domain.
 *
 * This never writes to challenge storage. It only exposes Book experience IDs
 * whose explicitly mapped legacy tasks are completed in the current challenge
 * clear-version.
 */
export const getCompletedBookExperienceIdsFromLegacyProgress = (): string[] => {
  if (typeof window === 'undefined') return [];

  const progress = readAuthoritativeLegacyProgress();
  if (!progress) return [];
  if (normalizeVersion(progress.clearVersion) !== getChallengeClearVersion()) return [];
  if (!Array.isArray(progress.completedTaskIds)) return [];

  const experienceIds = progress.completedTaskIds
    .filter((taskId): taskId is string => typeof taskId === 'string' && taskId.length > 0)
    .map((taskId) => migrateTaskId(taskId).taskId)
    .map((taskId) => getBookTargetForLegacyTask(taskId))
    .filter((target): target is { type: 'experience'; experienceId: string } => target?.type === 'experience')
    .map((target) => target.experienceId);

  return [...new Set(experienceIds)];
};
