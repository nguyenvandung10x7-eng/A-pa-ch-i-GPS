import type { ChallengeTask } from '../types/task';

export const CHALLENGE_LEVEL_ONE_ACCEPTED_KEY = 'book-of-dien-bien-challenge-level-one-accepted';

export const LEVEL_ONE_TASK_IDS = [
  'quan-com-hung-ha-thuoc-lao-free',
  'de-xe-may-ngoai-troi-qua-dem',
  'quang-truong-7-5-hat-quoc-ca',
  'quang-truong-7-5-mthen',
] as const;

const levelOneTaskIdSet = new Set<string>(LEVEL_ONE_TASK_IDS);

export const isLevelOneTaskId = (taskId: string): boolean => levelOneTaskIdSet.has(taskId);

export const hasUnlockedAllChallenges = (completedTaskIds: string[]): boolean => (
  completedTaskIds.some(isLevelOneTaskId)
);

export const getLevelOneTasks = (tasks: ChallengeTask[]): ChallengeTask[] => {
  const tasksById = new Map(tasks.map((task) => [task.id, task]));
  return LEVEL_ONE_TASK_IDS.flatMap((taskId) => {
    const task = tasksById.get(taskId);
    return task ? [task] : [];
  });
};

export const getLockedChallengeTasks = (tasks: ChallengeTask[]): ChallengeTask[] => (
  tasks.filter((task) => !isLevelOneTaskId(task.id))
);

export const readLevelOneAccepted = (): boolean => {
  try {
    return window.localStorage.getItem(CHALLENGE_LEVEL_ONE_ACCEPTED_KEY) === '1';
  } catch {
    return false;
  }
};

export const acceptLevelOne = (): void => {
  window.localStorage.setItem(CHALLENGE_LEVEL_ONE_ACCEPTED_KEY, '1');
};
