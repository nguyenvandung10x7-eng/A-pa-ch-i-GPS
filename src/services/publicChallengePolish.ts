import type { ChallengeTask } from '../types/task';

const FALLBACK_COVERS_BY_TASK_ID: Readonly<Record<string, string>> = {
  'quan-com-hung-ha-thuoc-lao-free': '/images/challenges/quan-com-hung-ha-thuoc-lao-free/cover.svg',
  'de-xe-may-ngoai-troi-qua-dem': '/images/challenges/de-xe-may-ngoai-troi-qua-dem/cover.svg',
  'nhin-xuong-long-chao-cua-chung-ta': '/images/challenges/nhin-xuong-long-chao-cua-chung-ta/cover.svg',
  'tim-cay-xoai-co-thu': '/images/challenges/tim-cay-xoai-co-thu/cover.svg',
};

/**
 * Public-facing polish that is deliberately non-destructive.
 *
 * The editorial catalog contains a few intentionally imageless tasks. Give those tasks
 * a neutral illustrated cover so the Challenge card does not look broken, but never
 * replace an image that an existing user/admin has already supplied.
 */
export const applyPublicChallengePolish = (tasks: ChallengeTask[]): ChallengeTask[] => {
  let changed = false;

  const polished = tasks.map((task) => {
    const fallbackCover = FALLBACK_COVERS_BY_TASK_ID[task.id];
    if (!fallbackCover) return task;

    const currentImage = typeof task.image === 'string' ? task.image.trim() : '';
    if (currentImage) return task;

    changed = true;
    return { ...task, image: fallbackCover };
  });

  return changed ? polished : tasks;
};
