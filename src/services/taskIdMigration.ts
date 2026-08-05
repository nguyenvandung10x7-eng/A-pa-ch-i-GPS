const TASK_ID_RENAME_ENTRIES: Array<[string, string]> = [
  ['cho-muong-nhe-mthen', 'cho-muong-nhe-tang-banh-trung-thu'],
  ['cau-ta-ko-khu-cat-banh', 'cau-ta-ko-khu-tang-banh-trung-thu'],
  ['ban-a-pa-chai-trai-ban', 'ban-a-pa-chai-tang-banh-trung-thu'],
  ['ke-nenh-ruong-bac-thang-mthen', 'ruong-bac-thang-ta-leng-mthen'],
  ['thac-ke-nenh-trai-ban-lanh-lung', 'thac-ke-nenh-mthen'],
];

const TASK_ID_RENAMES = new Map<string, string>(TASK_ID_RENAME_ENTRIES);

const resolveCanonicalTaskId = (taskId: string): string => {
  let currentTaskId = taskId;
  const visited = new Set<string>();

  while (true) {
    if (visited.has(currentTaskId)) {
      // Keep cycle participants unchanged to avoid unstable remapping.
      return taskId;
    }

    visited.add(currentTaskId);
    const nextTaskId = TASK_ID_RENAMES.get(currentTaskId);
    if (!nextTaskId || nextTaskId === currentTaskId) {
      return currentTaskId;
    }

    currentTaskId = nextTaskId;
  }
};

export const migrateTaskId = (taskId: string): { taskId: string; changed: boolean } => {
  const canonicalTaskId = resolveCanonicalTaskId(taskId);
  return { taskId: canonicalTaskId, changed: canonicalTaskId !== taskId };
};

export const migrateTaskIdList = (taskIds: string[]): { taskIds: string[]; changed: boolean } => {
  const migratedTaskIds: string[] = [];
  const seen = new Set<string>();
  let changed = false;

  taskIds.forEach((taskId) => {
    const { taskId: migratedTaskId, changed: migrated } = migrateTaskId(taskId);
    if (migrated) {
      changed = true;
    }

    if (seen.has(migratedTaskId)) {
      changed = true;
      return;
    }

    seen.add(migratedTaskId);
    migratedTaskIds.push(migratedTaskId);
  });

  if (!changed && migratedTaskIds.length !== taskIds.length) {
    changed = true;
  }

  return { taskIds: migratedTaskIds, changed };
};