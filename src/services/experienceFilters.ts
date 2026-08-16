import type { ChallengeTask } from '../types/task';
import { migrateTaskId } from './taskIdMigration';

export const SPECIALIZED_TASK_IDS = {
  terracedFields: 'ruong-bac-thang-ta-leng-mthen',
  waterfalls: 'thac-ke-nenh-mthen',
  timeTrain: 'doi-a1-chuyen-tau-thoi-gian-1954',
  muongThanhMooncake: 'canh-dong-muong-thanh-cat-banh',
} as const;

type NamedExperienceMode =
  | 'terraced-fields'
  | 'waterfalls'
  | 'time-train'
  | 'muong-thanh-mooncake'
  | 'apa-chai'
  | 'historical-sites'
  | 'dien-bien-plain'
  | 'in-the-city'
  | 'surprise-missions';

export type ExactTaskExperienceMode = `task:${string}`;
export type ExperienceMode = NamedExperienceMode | ExactTaskExperienceMode;

const DEFAULT_MODE: NamedExperienceMode = 'surprise-missions';

const ALL_MODES = new Set<NamedExperienceMode>([
  'terraced-fields',
  'waterfalls',
  'time-train',
  'muong-thanh-mooncake',
  'apa-chai',
  'historical-sites',
  'dien-bien-plain',
  'in-the-city',
  'surprise-missions',
]);

const MODE_TASK_IDS: Record<NamedExperienceMode, Set<string>> = {
  'terraced-fields': new Set([SPECIALIZED_TASK_IDS.terracedFields]),
  waterfalls: new Set([SPECIALIZED_TASK_IDS.waterfalls]),
  'time-train': new Set([SPECIALIZED_TASK_IDS.timeTrain]),
  'muong-thanh-mooncake': new Set([SPECIALIZED_TASK_IDS.muongThanhMooncake]),
  'apa-chai': new Set([
    'cho-muong-nhe-tang-banh-trung-thu',
    'cau-ta-ko-khu-tang-banh-trung-thu',
    'ban-a-pa-chai-tang-banh-trung-thu',
    'cot-co-a-pa-chai-mthen',
    'cot-co-a-pa-chai-trai-ban-lanh-lung',
  ]),
  'historical-sites': new Set(),
  'dien-bien-plain': new Set([
    'ban-phieng-loi-mthen',
    'nhin-xuong-long-chao-cua-chung-ta',
    'tim-cay-xoai-co-thu',
  ]),
  'in-the-city': new Set([
    'quan-com-hung-ha-thuoc-lao-free',
    'de-xe-may-ngoai-troi-qua-dem',
  ]),
  'surprise-missions': new Set(),
};

const specializedIdSet = new Set<string>(Object.values(SPECIALIZED_TASK_IDS));

const getExactTaskId = (mode: ExperienceMode): string | null => {
  if (!mode.startsWith('task:')) return null;
  const rawTaskId = mode.slice('task:'.length).trim();
  if (!rawTaskId) return null;
  return migrateTaskId(rawTaskId).taskId;
};

export const createExactTaskExperienceMode = (taskId: string): ExactTaskExperienceMode =>
  `task:${migrateTaskId(taskId.trim()).taskId}`;

export const resolveExperienceMode = (value: string | null): ExperienceMode => {
  if (!value) return DEFAULT_MODE;

  if (value.startsWith('task:')) {
    const rawTaskId = value.slice('task:'.length).trim();
    if (rawTaskId) return createExactTaskExperienceMode(rawTaskId);
    return DEFAULT_MODE;
  }

  return ALL_MODES.has(value as NamedExperienceMode) ? (value as NamedExperienceMode) : DEFAULT_MODE;
};

export const getEligibleTasksForExperience = (tasks: ChallengeTask[], mode: ExperienceMode): ChallengeTask[] => {
  const exactTaskId = getExactTaskId(mode);
  if (exactTaskId) {
    return tasks.filter((task) => task.enabled && task.id === exactTaskId);
  }

  if (mode === 'surprise-missions') {
    return tasks.filter((task) => task.enabled && !specializedIdSet.has(task.id));
  }

  const scopedIds = MODE_TASK_IDS[mode as NamedExperienceMode];
  const scopedTasks = tasks.filter((task) => task.enabled && scopedIds.has(task.id));
  // Old experience cards/bookmarks may outlive editorial retirement of their sole task.
  // Preserve the route but fall back to the active catalog instead of challenge.empty.
  return scopedTasks.length > 0 ? scopedTasks : tasks.filter((task) => task.enabled && !specializedIdSet.has(task.id));
};

export const getExperienceModeFromSearch = (search: string): ExperienceMode => {
  const searchParams = new URLSearchParams(search);
  return resolveExperienceMode(searchParams.get('experience'));
};

export const getScopedExperienceModeFromSearch = (search: string): ExperienceMode | null => {
  const searchParams = new URLSearchParams(search);
  const mode = searchParams.get('experience');
  if (!mode) return null;
  return resolveExperienceMode(mode);
};
