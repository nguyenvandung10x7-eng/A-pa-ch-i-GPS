export type ChallengeTaskMigrationAction = 'rename' | 'retire';

type ChallengeTaskMigrationBase = {
  sourceTaskId: string;
  preserveProgress: boolean;
  note: string;
};

export type ChallengeTaskRenameMigrationEntry = ChallengeTaskMigrationBase & {
  action: 'rename';
  targetTaskId: string;
};

export type ChallengeTaskRetireMigrationEntry = ChallengeTaskMigrationBase & {
  action: 'retire';
};

export type ChallengeTaskMigrationEntry =
  | ChallengeTaskRenameMigrationEntry
  | ChallengeTaskRetireMigrationEntry;

/**
 * Single migration boundary for Challenge task catalog changes.
 *
 * Future workbook imports should add compatibility changes here before changing
 * task IDs in tasks.json. That keeps stored task catalogs, progress/history,
 * legacy links, and experience filters on one canonical ID policy.
 */
export const CHALLENGE_TASK_MIGRATIONS: readonly ChallengeTaskMigrationEntry[] = [
  {
    sourceTaskId: 'cho-muong-nhe-mthen',
    action: 'rename',
    targetTaskId: 'cho-muong-nhe-tang-banh-trung-thu',
    preserveProgress: true,
    note: 'Canonicalize the Muong Nhe market task name.',
  },
  {
    sourceTaskId: 'cau-ta-ko-khu-cat-banh',
    action: 'rename',
    targetTaskId: 'cau-ta-ko-khu-tang-banh-trung-thu',
    preserveProgress: true,
    note: 'Canonicalize the Ta Ko Khu bridge task name.',
  },
  {
    sourceTaskId: 'ban-a-pa-chai-trai-ban',
    action: 'rename',
    targetTaskId: 'ban-a-pa-chai-tang-banh-trung-thu',
    preserveProgress: true,
    note: 'Canonicalize the A Pa Chai village task name.',
  },
  {
    sourceTaskId: 'ke-nenh-ruong-bac-thang-mthen',
    action: 'rename',
    targetTaskId: 'ruong-bac-thang-ta-leng-mthen',
    preserveProgress: true,
    note: 'Canonicalize the terraced-fields task ID.',
  },
  {
    sourceTaskId: 'thac-ke-nenh-trai-ban-lanh-lung',
    action: 'rename',
    targetTaskId: 'thac-ke-nenh-mthen',
    preserveProgress: true,
    note: 'Canonicalize the Ke Nenh waterfall task ID.',
  },
  {
    sourceTaskId: 'deo-pha-din-cat-banh',
    action: 'retire',
    preserveProgress: false,
    note: 'Removed from the active Challenge catalog.',
  },
  {
    sourceTaskId: 'cong-vien-tai-dinh-cu-him-lam-cat-banh',
    action: 'retire',
    preserveProgress: false,
    note: 'Removed from the active Challenge catalog.',
  },
] as const;

const renameTargets = new Map<string, string>();
const retiredTaskIds = new Set<string>();

CHALLENGE_TASK_MIGRATIONS.forEach((entry) => {
  if (entry.action === 'rename') {
    renameTargets.set(entry.sourceTaskId, entry.targetTaskId);
    return;
  }

  retiredTaskIds.add(entry.sourceTaskId);
});

export const resolveCanonicalChallengeTaskId = (taskId: string): string => {
  let currentTaskId = taskId;
  const visited = new Set<string>();

  while (true) {
    if (visited.has(currentTaskId)) {
      // Keep cycle participants unchanged rather than producing unstable IDs.
      return taskId;
    }

    visited.add(currentTaskId);
    const nextTaskId = renameTargets.get(currentTaskId);
    if (!nextTaskId || nextTaskId === currentTaskId) {
      return currentTaskId;
    }

    currentTaskId = nextTaskId;
  }
};

export const migrateChallengeTaskId = (taskId: string): { taskId: string; changed: boolean } => {
  const canonicalTaskId = resolveCanonicalChallengeTaskId(taskId);
  return { taskId: canonicalTaskId, changed: canonicalTaskId !== taskId };
};

export const migrateChallengeTaskIdList = (taskIds: string[]): { taskIds: string[]; changed: boolean } => {
  const migratedTaskIds: string[] = [];
  const seen = new Set<string>();
  let changed = false;

  taskIds.forEach((taskId) => {
    const { taskId: migratedTaskId, changed: migrated } = migrateChallengeTaskId(taskId);
    if (migrated) changed = true;

    if (seen.has(migratedTaskId)) {
      changed = true;
      return;
    }

    seen.add(migratedTaskId);
    migratedTaskIds.push(migratedTaskId);
  });

  return { taskIds: migratedTaskIds, changed };
};

export const isRetiredChallengeTaskId = (taskId: string): boolean => {
  const canonicalTaskId = resolveCanonicalChallengeTaskId(taskId);
  return retiredTaskIds.has(taskId) || retiredTaskIds.has(canonicalTaskId);
};

export const getChallengeTaskMigrationEntry = (taskId: string): ChallengeTaskMigrationEntry | undefined =>
  CHALLENGE_TASK_MIGRATIONS.find((entry) => entry.sourceTaskId === taskId);
