import type { LegacyTaskMapping } from '../types/book';

/**
 * Explicit bridges from legacy GPS challenge task IDs into the Book domain.
 *
 * Keep this list deliberately small and intentional: a task should only be
 * mapped once its Book page or experience target is stable. Unmapped legacy
 * tasks continue to live in the existing challenge flow without affecting
 * Book reading state.
 */
export const BOOK_LEGACY_TASK_MAPPINGS: LegacyTaskMapping[] = [
  {
    taskId: 'canh-dong-muong-thanh-cat-banh',
    target: {
      type: 'experience',
      experienceId: 'experience-muong-thanh-mooncake-sidequest',
    },
  },
  {
    taskId: 'doi-a1-chuyen-tau-thoi-gian-1954',
    target: {
      type: 'experience',
      experienceId: 'experience-a1-1954-time-train',
    },
  },
];

const mappingByTaskId = new Map(
  BOOK_LEGACY_TASK_MAPPINGS.map((mapping) => [mapping.taskId, mapping] as const),
);

export const getBookTargetForLegacyTask = (taskId: string) =>
  mappingByTaskId.get(taskId)?.target ?? null;
