import tasksJson from '../data/tasks.json';
import type { ChallengeTask } from '../types/task';

const TASKS_KEY = 'gps-challenge-tasks';

const cloneTasks = (tasks: ChallengeTask[]) => structuredClone(tasks);

export const defaultTasks = tasksJson as ChallengeTask[];

export const loadTasks = (): ChallengeTask[] => {
  const stored = localStorage.getItem(TASKS_KEY);
  if (!stored) return cloneTasks(defaultTasks);
  try {
    const parsed = JSON.parse(stored) as ChallengeTask[];
    return Array.isArray(parsed) ? parsed : cloneTasks(defaultTasks);
  } catch {
    return cloneTasks(defaultTasks);
  }
};

export const saveTasks = (tasks: ChallengeTask[]) => localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
export const resetTasks = () => { localStorage.removeItem(TASKS_KEY); return cloneTasks(defaultTasks); };
export const clearLocalChallengeData = () => {
  localStorage.removeItem('gps-challenge-progress');
  localStorage.removeItem('gps-challenge-history');
};
export const enabledTasks = (tasks: ChallengeTask[]) => tasks.filter((task) => task.enabled);
export const createEmptyTask = (): ChallengeTask => ({
  id: `task-${Date.now()}`,
  title: { vi: '', en: '' },
  description: { vi: '', en: '' },
  category: 'general',
  difficulty: 'easy',
  points: 100,
  gps: { lat: 10.7756, lng: 106.7039, radius: 50 },
  image: '',
  enabled: true,
});
