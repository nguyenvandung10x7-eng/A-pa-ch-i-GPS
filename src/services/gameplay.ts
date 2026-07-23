import type { ChallengeRun, ChallengeTask, GpsPoint } from '../types/task';
import { distanceMeters } from '../utils/geo';
import { saveRun } from './history';

const PROGRESS_KEY = 'gps-challenge-progress';

type Coordinates = Pick<GpsPoint, 'lat' | 'lng'>;

export type ChallengeStatus = 'pending' | 'active' | 'completed' | 'failed';

export type PlayerProgress = {
  gameId: string;
  status: ChallengeStatus;
  score: number;
  startedAt: string;
  updatedAt: string;
  activeRun?: ChallengeRun;
  completedTaskIds: string[];
  attemptedTaskIds: string[];
};

const now = () => new Date().toISOString();
const unique = (values: string[]) => [...new Set(values)];

const createRun = (task: ChallengeTask): ChallengeRun => ({
  id: crypto.randomUUID(),
  taskId: task.id,
  title: task.title,
  category: task.category,
  difficulty: task.difficulty,
  points: task.points,
  status: 'active',
  startedAt: now(),
  gpsVerified: false,
  qrVerified: false,
  score: 0,
});

const persistProgress = (progress: PlayerProgress) => {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  return progress;
};

export const createNewGame = (): PlayerProgress => persistProgress({
  gameId: crypto.randomUUID(),
  status: 'pending',
  score: 0,
  startedAt: now(),
  updatedAt: now(),
  completedTaskIds: [],
  attemptedTaskIds: [],
});

export const loadProgress = (): PlayerProgress | undefined => {
  const stored = localStorage.getItem(PROGRESS_KEY);
  if (!stored) return undefined;

  try {
    const parsed = JSON.parse(stored) as PlayerProgress;
    return parsed && typeof parsed.gameId === 'string' ? parsed : undefined;
  } catch {
    return undefined;
  }
};

export const loadOrCreateProgress = () => loadProgress() ?? createNewGame();

export const getAvailableTasks = (tasks: ChallengeTask[], progress: PlayerProgress) => (
  tasks.filter((task) => task.enabled && !progress.attemptedTaskIds.includes(task.id))
);

export const assignRandomChallenge = (tasks: ChallengeTask[], progress: PlayerProgress): PlayerProgress => {
  if (progress.activeRun?.status === 'active') return progress;

  const availableTasks = getAvailableTasks(tasks, progress);
  if (availableTasks.length === 0) {
    return persistProgress({ ...progress, status: 'completed', activeRun: undefined, updatedAt: now() });
  }

  const task = availableTasks[Math.floor(Math.random() * availableTasks.length)];
  return persistProgress({
    ...progress,
    status: 'active',
    activeRun: createRun(task),
    attemptedTaskIds: unique([...progress.attemptedTaskIds, task.id]),
    updatedAt: now(),
  });
};

export const validateGps = (task: ChallengeTask, coordinates: Coordinates) => {
  const meters = Math.round(distanceMeters(coordinates, task.gps));
  return { meters, valid: meters <= task.gps.radius };
};

export const completeActiveChallenge = (progress: PlayerProgress, task: ChallengeTask, coordinates: Coordinates) => {
  if (!progress.activeRun || progress.activeRun.status !== 'active') {
    return { progress, completed: false, duplicate: true, gps: undefined };
  }

  if (progress.completedTaskIds.includes(task.id)) {
    return { progress, completed: false, duplicate: true, gps: undefined };
  }

  const gps = validateGps(task, coordinates);
  if (!gps.valid) return { progress, completed: false, duplicate: false, gps };

  const completedAt = now();
  const run: ChallengeRun = {
    ...progress.activeRun,
    status: 'completed',
    completedAt,
    gpsVerified: true,
    score: task.points,
  };
  saveRun(run);

  return {
    progress: persistProgress({
      ...progress,
      status: 'completed',
      score: progress.score + task.points,
      activeRun: run,
      completedTaskIds: unique([...progress.completedTaskIds, task.id]),
      updatedAt: completedAt,
    }),
    completed: true,
    duplicate: false,
    gps,
  };
};

export const failActiveChallenge = (progress: PlayerProgress) => {
  if (!progress.activeRun || progress.activeRun.status !== 'active') return progress;

  const failedAt = now();
  const run: ChallengeRun = { ...progress.activeRun, status: 'failed', failedAt };
  saveRun(run);

  return persistProgress({
    ...progress,
    status: 'failed',
    activeRun: run,
    updatedAt: failedAt,
  });
};

export const getProgressSummary = (tasks: ChallengeTask[], progress: PlayerProgress) => {
  const enabledCount = tasks.filter((task) => task.enabled).length;
  const completedCount = progress.completedTaskIds.length;
  return {
    enabledCount,
    completedCount,
    attemptedCount: progress.attemptedTaskIds.length,
    remainingCount: Math.max(0, enabledCount - progress.attemptedTaskIds.length),
    score: progress.score,
  };
};
