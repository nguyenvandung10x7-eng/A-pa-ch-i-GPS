import { useEffect, useMemo, useState } from 'react';
import { enabledTasks, loadTasks, saveTasks } from '../services/tasks';
import { migrateAllGameplayStorageTaskIds } from '../services/gameplay';
import type { ChallengeTask } from '../types/task';

export const useTasks = () => {
  const [tasks, setTasksState] = useState<ChallengeTask[]>(() => loadTasks());

  useEffect(() => {
    let disposed = false;

    migrateAllGameplayStorageTaskIds()
      .then(() => {
        if (disposed) return;
        setTasksState(loadTasks());
      })
      .catch(() => {
        // Ignore lock/migration errors here and keep best-effort task loading.
      });

    return () => {
      disposed = true;
    };
  }, []);

  const setTasks = (next: ChallengeTask[]) => { setTasksState(next); saveTasks(next); };
  const activeTasks = useMemo(() => enabledTasks(tasks), [tasks]);
  return { tasks, setTasks, activeTasks };
};
