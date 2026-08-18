import { useEffect, useMemo, useState } from 'react';
import { defaultTasks, enabledTasks, loadTasks, saveTasks } from '../services/tasks';
import { migrateAllGameplayStorageTaskIds } from '../services/gameplay';
import { applyChallengeCatalogWorkbookImport } from '../services/challengeCatalogWorkbookImport';
import { applyPublicChallengePolish } from '../services/publicChallengePolish';
import type { ChallengeTask } from '../types/task';

const CATALOG_IMPORT_VERSION_KEY = 'book-of-dien-bien-challenge-catalog-import-version';
const CATALOG_IMPORT_VERSION = '2026-08-17-chapter-13-gps-arrival';
const PUBLIC_POLISH_VERSION_KEY = 'book-of-dien-bien-challenge-public-polish-version';
const PUBLIC_POLISH_VERSION = '2026-08-18-neutral-empty-image-covers';

const applyCurrentDefaults = (tasks: ChallengeTask[]): ChallengeTask[] =>
  applyPublicChallengePolish(applyChallengeCatalogWorkbookImport(tasks));

const loadImportedTasks = (): ChallengeTask[] => {
  let tasks = loadTasks();
  let changed = false;
  const pendingMarkers: Array<readonly [string, string]> = [];

  if (localStorage.getItem(CATALOG_IMPORT_VERSION_KEY) !== CATALOG_IMPORT_VERSION) {
    const imported = applyChallengeCatalogWorkbookImport(tasks);
    changed = changed || imported !== tasks;
    tasks = imported;
    pendingMarkers.push([CATALOG_IMPORT_VERSION_KEY, CATALOG_IMPORT_VERSION]);
  }

  if (localStorage.getItem(PUBLIC_POLISH_VERSION_KEY) !== PUBLIC_POLISH_VERSION) {
    const polished = applyPublicChallengePolish(tasks);
    changed = changed || polished !== tasks;
    tasks = polished;
    pendingMarkers.push([PUBLIC_POLISH_VERSION_KEY, PUBLIC_POLISH_VERSION]);
  }

  // Persist the migrated catalog before advancing any version marker. If persistence
  // fails, the markers remain untouched so the migration is retried on next startup.
  if (changed) saveTasks(tasks);
  pendingMarkers.forEach(([key, value]) => localStorage.setItem(key, value));

  return tasks;
};

const isCanonicalDefaultsReset = (tasks: ChallengeTask[]): boolean =>
  JSON.stringify(tasks) === JSON.stringify(defaultTasks);

export const useTasks = () => {
  const [tasks, setTasksState] = useState<ChallengeTask[]>(() => loadImportedTasks());

  useEffect(() => {
    let disposed = false;

    migrateAllGameplayStorageTaskIds()
      .then(() => {
        if (disposed) return;
        setTasksState(loadImportedTasks());
      })
      .catch(() => {
        // Ignore lock/migration errors here and keep best-effort task loading.
      });

    return () => {
      disposed = true;
    };
  }, []);

  const setTasks = (next: ChallengeTask[]) => {
    // Admin "Restore defaults" returns the canonical pre-workbook tasks.json array.
    // Rebuild the current defaults only for that explicit reset. Ordinary Admin edits
    // are stored verbatim and are never replayed through an older catalog migration.
    const tasksToSave = isCanonicalDefaultsReset(next) ? applyCurrentDefaults(next) : next;

    // Save first, then advance markers so a failed persistence cannot strand the
    // browser in a state that claims current defaults without actually storing them.
    saveTasks(tasksToSave);
    if (tasksToSave !== next) {
      localStorage.setItem(CATALOG_IMPORT_VERSION_KEY, CATALOG_IMPORT_VERSION);
      localStorage.setItem(PUBLIC_POLISH_VERSION_KEY, PUBLIC_POLISH_VERSION);
    }
    setTasksState(tasksToSave);
  };

  const activeTasks = useMemo(() => enabledTasks(tasks), [tasks]);
  return { tasks, setTasks, activeTasks };
};
