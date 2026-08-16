import {
  migrateChallengeTaskId,
  migrateChallengeTaskIdList,
} from './challengeTaskMigrationContract';

/**
 * Compatibility exports for existing gameplay/progress callers.
 * The authoritative rename/retirement policy now lives in
 * challengeTaskMigrationContract.ts so future workbook imports have one place
 * to declare task-catalog compatibility changes.
 */
export const migrateTaskId = migrateChallengeTaskId;
export const migrateTaskIdList = migrateChallengeTaskIdList;
