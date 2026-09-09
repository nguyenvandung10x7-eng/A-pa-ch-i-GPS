import type { ChallengeTask } from '../types/task';

export const CHALLENGE_LEVEL_ONE_ACCEPTED_KEY = 'book-of-dien-bien-challenge-level-one-accepted';

export const LEVEL_ONE_TASK_IDS = [
  'quang-truong-7-5-mthen',
] as const;

const LEGACY_LEVEL_ONE_TASK_IDS = [
  'quan-com-hung-ha-thuoc-lao-free',
  'de-xe-may-ngoai-troi-qua-dem',
  'quang-truong-7-5-hat-quoc-ca',
] as const;

const levelOneTaskIdSet = new Set<string>(LEVEL_ONE_TASK_IDS);
const legacyLevelOneTaskIdSet = new Set<string>(LEGACY_LEVEL_ONE_TASK_IDS);
const levelOneUnlockTaskIdSet = new Set<string>([
  ...LEVEL_ONE_TASK_IDS,
  ...LEGACY_LEVEL_ONE_TASK_IDS,
]);

export const isLevelOneTaskId = (taskId: string): boolean => levelOneTaskIdSet.has(taskId);

export const isLegacyLevelOneTaskId = (taskId: string): boolean => legacyLevelOneTaskIdSet.has(taskId);

export const hasUnlockedAllChallenges = (completedTaskIds: string[]): boolean => (
  completedTaskIds.some((taskId) => levelOneUnlockTaskIdSet.has(taskId))
);

export const getLevelOneTasks = (tasks: ChallengeTask[]): ChallengeTask[] => {
  const tasksById = new Map(tasks.map((task) => [task.id, task]));
  return LEVEL_ONE_TASK_IDS.flatMap((taskId) => {
    const task = tasksById.get(taskId);
    return task ? [task] : [];
  });
};

export const getLockedChallengeTasks = (
  tasks: ChallengeTask[],
  openTaskIds: readonly string[] = LEVEL_ONE_TASK_IDS,
): ChallengeTask[] => {
  const openTaskIdSet = new Set(openTaskIds);
  return tasks.filter((task) => !openTaskIdSet.has(task.id));
};
