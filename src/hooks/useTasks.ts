import { useEffect, useMemo, useState } from 'react';
import { enabledTasks, loadTasks, saveTasks } from '../services/tasks';
import { migrateAllGameplayStorageTaskIds } from '../services/gameplay';
import { applyChallengeCatalogWorkbookImport } from '../services/challengeCatalogWorkbookImport';
import type { ChallengeTask } from '../types/task';

const loadImportedTasks = (): ChallengeTask[] => applyChallengeCatalogWorkbookImport(loadTasks());

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
