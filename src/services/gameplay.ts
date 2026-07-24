import type { ChallengeRun, ChallengeTask, GpsPoint } from '../types/task';
import { distanceMeters } from '../utils/geo';
import { saveRun } from './history';

const PROGRESS_KEY = 'gps-challenge-progress';

type Coordinates = Pick<GpsPoint, 'lat' | 'lng'>;

export type GameStatus = 'pending' | 'active' | 'completed';

export type GpsVerification =
  | { status: 'low-accuracy'; accuracy: number; requiredAccuracy: number }
  | { status: 'outside-radius'; accuracy: number; meters: number; radius: number }
  | { status: 'success'; accuracy: number; meters: number; radius: number };

export type PlayerProgress = {
  gameId: string;
  status: GameStatus;
  score: number;
  startedAt: string;
  updatedAt: string;
  activeRun?: ChallengeRun;
  completedTaskIds: string[];
  skippedTaskIds: string[];
  assignmentHistory: string[];
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
  skippedTaskIds: [],
  assignmentHistory: [],
});

export const loadProgress = (): PlayerProgress | undefined => {
  const stored = localStorage.getItem(PROGRESS_KEY);
  if (!stored) return undefined;

  try {
    const parsed = JSON.parse(stored) as PlayerProgress;
    if (!parsed || typeof parsed.gameId !== 'string') return undefined;

    // Migrate progress written by the first gameplay implementation.
    return {
      ...parsed,
      skippedTaskIds: Array.isArray(parsed.skippedTaskIds) ? parsed.skippedTaskIds : [],
      assignmentHistory: Array.isArray(parsed.assignmentHistory)
        ? parsed.assignmentHistory
        : ((parsed as PlayerProgress & { attemptedTaskIds?: string[] }).attemptedTaskIds ?? []),
    };
  } catch {
    return undefined;
  }
};

export const loadOrCreateProgress = () => loadProgress() ?? createNewGame();

export const getAvailableTasks = (tasks: ChallengeTask[], progress: PlayerProgress) => (
  tasks.filter((task) => task.enabled && !progress.assignmentHistory.includes(task.id))
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
    assignmentHistory: [...progress.assignmentHistory, task.id],
    updatedAt: now(),
  });
};

export const validateGps = (task: ChallengeTask, coordinates: Coordinates, accuracy: number): GpsVerification => {
  const requiredAccuracy = Math.min(task.gps.radius, 100);
  if (!Number.isFinite(accuracy) || accuracy > requiredAccuracy) {
    return { status: 'low-accuracy', accuracy: Math.round(accuracy), requiredAccuracy };
  }

  const meters = Math.round(distanceMeters(coordinates, task.gps));
  return meters <= task.gps.radius
    ? { status: 'success', accuracy: Math.round(accuracy), meters, radius: task.gps.radius }
    : { status: 'outside-radius', accuracy: Math.round(accuracy), meters, radius: task.gps.radius };
};

export const completeActiveChallenge = (progress: PlayerProgress, task: ChallengeTask, coordinates: Coordinates, accuracy: number) => {
  if (!progress.activeRun || progress.activeRun.status !== 'active' || progress.activeRun.taskId !== task.id) {
    return { progress, completed: false as const, duplicate: true, gps: undefined };
  }

  if (progress.completedTaskIds.includes(task.id)) {
    return { progress, completed: false as const, duplicate: true, gps: undefined };
  }

  const gps = validateGps(task, coordinates, accuracy);
  if (gps.status !== 'success') return { progress, completed: false as const, duplicate: false, gps };

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
    completed: true as const,
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
    status: 'active',
    activeRun: run,
    updatedAt: failedAt,
  });
};

export const skipActiveChallenge = (progress: PlayerProgress) => {
  if (!progress.activeRun || progress.activeRun.status !== 'active') return progress;

  const skippedAt = now();
  const run: ChallengeRun = { ...progress.activeRun, status: 'skipped', skippedAt };
  saveRun(run);

  return persistProgress({
    ...progress,
    status: 'active',
    activeRun: undefined,
    skippedTaskIds: unique([...progress.skippedTaskIds, run.taskId]),
    updatedAt: skippedAt,
  });
};

export const getProgressSummary = (tasks: ChallengeTask[], progress: PlayerProgress) => {
  const enabledCount = tasks.filter((task) => task.enabled).length;
  const completedCount = progress.completedTaskIds.length;
  return {
    enabledCount,
    completedCount,
    skippedCount: progress.skippedTaskIds.length,
    assignedCount: progress.assignmentHistory.length,
    remainingCount: Math.max(0, enabledCount - progress.assignmentHistory.length),
    score: progress.score,
  };
};
