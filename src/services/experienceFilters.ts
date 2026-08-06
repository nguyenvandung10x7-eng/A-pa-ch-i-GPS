import type { ChallengeTask } from '../types/task';

export const SPECIALIZED_TASK_IDS = {
  terracedFields: 'ruong-bac-thang-ta-leng-mthen',
  waterfalls: 'thac-ke-nenh-mthen',
  timeTrain: 'doi-a1-chuyen-tau-thoi-gian-1954',
} as const;

export type ExperienceMode =
  | 'terraced-fields'
  | 'waterfalls'
  | 'time-train'
  | 'apa-chai'
  | 'historical-sites'
  | 'dien-bien-plain'
  | 'in-the-city'
  | 'surprise-missions';

const DEFAULT_MODE: ExperienceMode = 'surprise-missions';

const ALL_MODES = new Set<ExperienceMode>([
  'terraced-fields',
  'waterfalls',
  'time-train',
  'apa-chai',
  'historical-sites',
  'dien-bien-plain',
  'in-the-city',
  'surprise-missions',
]);

const MODE_TASK_IDS: Record<ExperienceMode, Set<string>> = {
  'terraced-fields': new Set([SPECIALIZED_TASK_IDS.terracedFields]),
  waterfalls: new Set([SPECIALIZED_TASK_IDS.waterfalls]),
  'time-train': new Set([SPECIALIZED_TASK_IDS.timeTrain]),
  'apa-chai': new Set([
    'cho-muong-nhe-tang-banh-trung-thu',
    'cau-ta-ko-khu-tang-banh-trung-thu',
    'ban-a-pa-chai-tang-banh-trung-thu',
    'cot-co-a-pa-chai-mthen',
    'cot-co-a-pa-chai-trai-ban-lanh-lung',
  ]),
  'historical-sites': new Set([
    'quang-truong-7-5-mthen',
    'bao-tang-chien-thang-dien-bien-phu-trai-nghiem',
  ]),
  'dien-bien-plain': new Set([
    'canh-dong-muong-thanh-cat-banh',
    'ho-huoi-pha-mthen',
    'khu-du-lich-him-lam-trai-ban',
    'ho-pa-khoang-trai-ban',
    'ban-phieng-loi-mthen',
  ]),
  'in-the-city': new Set([
    'quang-truong-7-5-mthen',
    'cong-vien-vu-a-dinh-trai-ban',
    'phadin-coffee-cat-banh',
    'cong-vien-noong-bua-mthen',
    'cho-noong-bua-trai-ban',
    'cong-vien-hoa-ban-mthen',
    'bao-tang-chien-thang-dien-bien-phu-trai-nghiem',
    'ca-phe-ke-nenh-cat-banh',
  ]),
  'surprise-missions': new Set(),
};

const specializedIdSet = new Set(Object.values(SPECIALIZED_TASK_IDS));

export const resolveExperienceMode = (value: string | null): ExperienceMode => {
  if (!value) return DEFAULT_MODE;
  return ALL_MODES.has(value as ExperienceMode) ? (value as ExperienceMode) : DEFAULT_MODE;
};

export const getEligibleTasksForExperience = (tasks: ChallengeTask[], mode: ExperienceMode): ChallengeTask[] => {
  if (mode === 'surprise-missions') {
    return tasks.filter((task) => task.enabled && !specializedIdSet.has(task.id));
  }

  const scopedIds = MODE_TASK_IDS[mode];
  return tasks.filter((task) => task.enabled && scopedIds.has(task.id));
};

export const getExperienceModeFromSearch = (search: string): ExperienceMode => {
  const searchParams = new URLSearchParams(search);
  return resolveExperienceMode(searchParams.get('experience'));
};
