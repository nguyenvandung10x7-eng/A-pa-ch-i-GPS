import { useMemo, useState } from 'react';
import { enabledTasks, loadTasks, saveTasks } from '../services/tasks';
import { migrateAllGameplayStorageTaskIds } from '../services/gameplay';
import type { ChallengeTask } from '../types/task';

export const useTasks = () => {
  const [tasks, setTasksState] = useState<ChallengeTask[]>(() => {
    migrateAllGameplayStorageTaskIds();
    return loadTasks();
  });
  const setTasks = (next: ChallengeTask[]) => { setTasksState(next); saveTasks(next); };
  const activeTasks = useMemo(() => enabledTasks(tasks), [tasks]);
  return { tasks, setTasks, activeTasks };
};
