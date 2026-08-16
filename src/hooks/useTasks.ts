import { useEffect, useMemo, useState } from 'react';
import { enabledTasks, loadTasks, saveTasks } from '../services/tasks';
import { migrateAllGameplayStorageTaskIds } from '../services/gameplay';
import { applyChallengeCatalogWorkbookImport } from '../services/challengeCatalogWorkbookImport';
import { applyChapter13ChallengeImport } from '../services/chapter13ChallengeImport';
import type { ChallengeTask } from '../types/task';

const CATALOG_IMPORT_VERSION_KEY = 'book-of-dien-bien-challenge-catalog-import-version';
const CATALOG_IMPORT_VERSION = '2026-08-16-chapter-13';

const loadImportedTasks = (): ChallengeTask[] => {
  const tasks = loadTasks();
  if (localStorage.getItem(CATALOG_IMPORT_VERSION_KEY) === CATALOG_IMPORT_VERSION) return tasks;

  const imported = applyChapter13ChallengeImport(applyChallengeCatalogWorkbookImport(tasks));
  saveTasks(imported);
  localStorage.setItem(CATALOG_IMPORT_VERSION_KEY, CATALOG_IMPORT_VERSION);
  return imported;
};

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
    setTasksState(next);
    saveTasks(next);
  };
  const activeTasks = useMemo(() => enabledTasks(tasks), [tasks]);
  return { tasks, setTasks, activeTasks };
};
