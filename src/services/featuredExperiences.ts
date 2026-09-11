import { createExactTaskExperienceMode, SPECIALIZED_TASK_IDS } from './experienceFilters';

export const TIME_TRAIN_TASK_ID = SPECIALIZED_TASK_IDS.timeTrain;
export const TIME_TRAIN_EXPERIENCE_MODE = createExactTaskExperienceMode(TIME_TRAIN_TASK_ID);
export const TIME_TRAIN_CHALLENGE_PATH = `/challenge?experience=${encodeURIComponent(TIME_TRAIN_EXPERIENCE_MODE)}`;

export const PHIENG_LOI_TASK_ID = 'ban-phieng-loi-mthen';
export const PHIENG_LOI_EXPERIENCE_MODE = createExactTaskExperienceMode(PHIENG_LOI_TASK_ID);
export const PHIENG_LOI_CHALLENGE_PATH = `/challenge?experience=${encodeURIComponent(PHIENG_LOI_EXPERIENCE_MODE)}`;
