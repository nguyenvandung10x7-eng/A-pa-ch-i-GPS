import type { ChallengeRun, ChallengeStatus, ChallengeTask, GpsPoint } from '../types/task';
import { distanceMeters } from '../utils/geo';
import { saveRun } from './history';

const PROGRESS_KEY = 'gps-challenge-progress';

type Coordinates = Pick<GpsPoint, 'lat' | 'lng'>;

export type PlayerProgress = {
  gameId: string;
  status: ChallengeStatus;
  score: number;
  startedAt: string;
  updatedAt: string;
  activeRun?: ChallengeRun;
  completedTaskIds: string[];
  skippedTaskIds: string[];
  failedTaskIds: string[];
  attemptedTaskIds: string[];
};

export type GpsVerificationStatus = 'verified' | 'outsideTargetRadius' | 'inaccurateLocation';

export type GpsVerificationResult = {
  meters: number;
  accuracy?: number;
  valid: boolean;
  status: GpsVerificationStatus;
};

const now = () => new Date().toISOString();
const unique = (values: string[]) => [...new Set(values.filter(Boolean))];

const normalizeStatus = (value: unknown): ChallengeStatus => {
  switch (value) {
    case 'active':
    case 'completed':
    case 'failed':
    case 'skipped':
      return value;
    default:
      return 'pending';
  }
};

const normalizeTaskIds = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return unique(value.filter((item): item is string => typeof item === 'string'));
};

const sanitizeProgress = (value: unknown, tasks: ChallengeTask[] = []): PlayerProgress | undefined => {
  if (!value || typeof value !== 'object') return undefined;

  const parsed = value as Partial<PlayerProgress> & { activeRun?: Partial<ChallengeRun> };
  if (typeof parsed.gameId !== 'string') return undefined;

  const enabledTaskIds = new Set(tasks.filter((task) => task.enabled).map((task) => task.id));
  const completedTaskIds = normalizeTaskIds(parsed.completedTaskIds).filter((id) => enabledTaskIds.size === 0 || enabledTaskIds.has(id));
  const skippedTaskIds = normalizeTaskIds(parsed.skippedTaskIds).filter((id) => enabledTaskIds.size === 0 || enabledTaskIds.has(id));
  const failedTaskIds = normalizeTaskIds(parsed.failedTaskIds).filter((id) => enabledTaskIds.size === 0 || enabledTaskIds.has(id));
  const attemptedTaskIds = unique([
    ...completedTaskIds,
    ...skippedTaskIds,
    ...failedTaskIds,
    ...normalizeTaskIds(parsed.attemptedTaskIds).filter((id) => enabledTaskIds.size === 0 || enabledTaskIds.has(id)),
  ]);

  const rawActiveRun = parsed.activeRun && typeof parsed.activeRun === 'object' ? parsed.activeRun : undefined;
  const activeRunTaskId = typeof rawActiveRun?.taskId === 'string' ? rawActiveRun.taskId : undefined;
  const activeRunIsValid = Boolean(rawActiveRun && activeRunTaskId && (enabledTaskIds.size === 0 || enabledTaskIds.has(activeRunTaskId)) && rawActiveRun.status === 'active');
  const activeRun = activeRunIsValid ? rawActiveRun as ChallengeRun : undefined;
  const normalizedStatus = normalizeStatus(parsed.status);
  const status = normalizedStatus === 'active' && activeRun ? 'active' : normalizedStatus === 'completed' || normalizedStatus === 'failed' || normalizedStatus === 'skipped' ? normalizedStatus : 'pending';

  return {
    gameId: parsed.gameId,
    status,
    score: typeof parsed.score === 'number' && Number.isFinite(parsed.score) ? parsed.score : 0,
    startedAt: typeof parsed.startedAt === 'string' ? parsed.startedAt : now(),
    updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : now(),
    activeRun,
    completedTaskIds,
    skippedTaskIds,
    failedTaskIds,
    attemptedTaskIds,
  };
};

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
  failedTaskIds: [],
  attemptedTaskIds: [],
});

export const loadProgress = (tasks: ChallengeTask[] = []): PlayerProgress | undefined => {
  const stored = localStorage.getItem(PROGRESS_KEY);
  if (!stored) return undefined;

  try {
    const parsed = JSON.parse(stored) as unknown;
    const sanitized = sanitizeProgress(parsed, tasks);
    return sanitized ? persistProgress(sanitized) : undefined;
  } catch {
    return undefined;
  }
};

export const loadOrCreateProgress = (tasks: ChallengeTask[] = []) => loadProgress(tasks) ?? createNewGame();

export const getAvailableTasks = (tasks: ChallengeTask[], progress: PlayerProgress) => (
  tasks.filter((task) => task.enabled && !progress.completedTaskIds.includes(task.id) && !progress.skippedTaskIds.includes(task.id) && !progress.failedTaskIds.includes(task.id))
);

export const assignRandomChallenge = (tasks: ChallengeTask[], progress: PlayerProgress): PlayerProgress => {
  if (progress.activeRun?.status === 'active') return progress;

  const availableTasks = getAvailableTasks(tasks, progress);
  if (availableTasks.length === 0) {
    const hasEnabledTasks = tasks.some((task) => task.enabled);
    return persistProgress({
      ...progress,
      status: hasEnabledTasks ? 'completed' : 'pending',
      activeRun: undefined,
      updatedAt: now(),
    });
  }

  const task = availableTasks[Math.floor(Math.random() * availableTasks.length)];
  return persistProgress({
    ...progress,
    status: 'active',
    activeRun: createRun(task),
    updatedAt: now(),
  });
};

export const validateGps = (task: ChallengeTask, coordinates: Coordinates, accuracy?: number): GpsVerificationResult => {
  const meters = Math.round(distanceMeters(coordinates, task.gps));
  const threshold = Math.max(50, task.gps.radius);
  if (typeof accuracy === 'number' && accuracy > threshold) {
    return { meters, accuracy, valid: false, status: 'inaccurateLocation' };
  }
  if (meters > task.gps.radius) {
    return { meters, accuracy, valid: false, status: 'outsideTargetRadius' };
  }
  return { meters, accuracy, valid: true, status: 'verified' };
};

export const completeActiveChallenge = (progress: PlayerProgress, task: ChallengeTask, coordinates: Coordinates, accuracy?: number) => {
  if (!progress.activeRun || progress.activeRun.status !== 'active') {
    return { progress, completed: false, duplicate: true, gps: undefined };
  }

  if (progress.completedTaskIds.includes(task.id) || progress.skippedTaskIds.includes(task.id) || progress.failedTaskIds.includes(task.id)) {
    return { progress, completed: false, duplicate: true, gps: undefined };
  }

  const gps = validateGps(task, coordinates, accuracy);
  if (!gps.valid) return { progress, completed: false, duplicate: false, gps };

  const completedAt = now();
  const run: ChallengeRun = {
    ...progress.activeRun,
    status: 'completed',
    outcome: 'completed',
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
      attemptedTaskIds: unique([...progress.attemptedTaskIds, task.id]),
      updatedAt: completedAt,
    }),
    completed: true,
    duplicate: false,
    gps,
  };
};

export const skipActiveChallenge = (progress: PlayerProgress) => {
  if (!progress.activeRun || progress.activeRun.status !== 'active') {
    return { progress, skipped: false, duplicate: true };
  }

  const taskId = progress.activeRun.taskId;
  if (progress.completedTaskIds.includes(taskId) || progress.skippedTaskIds.includes(taskId) || progress.failedTaskIds.includes(taskId)) {
    return { progress, skipped: false, duplicate: true };
  }

  const skippedAt = now();
  const run: ChallengeRun = {
    ...progress.activeRun,
    status: 'skipped',
    outcome: 'skipped',
    skippedAt,
    gpsVerified: false,
    score: 0,
  };
  saveRun(run);

  return {
    progress: persistProgress({
      ...progress,
      status: 'skipped',
      activeRun: run,
      skippedTaskIds: unique([...progress.skippedTaskIds, taskId]),
      attemptedTaskIds: unique([...progress.attemptedTaskIds, taskId]),
      updatedAt: skippedAt,
    }),
    skipped: true,
    duplicate: false,
  };
};

export const failActiveChallenge = (progress: PlayerProgress) => {
  if (!progress.activeRun || progress.activeRun.status !== 'active') return progress;

  const failedAt = now();
  const run: ChallengeRun = { ...progress.activeRun, status: 'failed', outcome: 'failed', failedAt };
  saveRun(run);

  return persistProgress({
    ...progress,
    status: 'failed',
    activeRun: run,
    failedTaskIds: unique([...progress.failedTaskIds, progress.activeRun.taskId]),
    attemptedTaskIds: unique([...progress.attemptedTaskIds, progress.activeRun.taskId]),
    updatedAt: failedAt,
  });
};

export const getProgressSummary = (tasks: ChallengeTask[], progress: PlayerProgress) => {
  const enabledCount = tasks.filter((task) => task.enabled).length;
  const attemptedCount = progress.attemptedTaskIds.length;
  return {
    enabledCount,
    completedCount: progress.completedTaskIds.length,
    skippedCount: progress.skippedTaskIds.length,
    attemptedCount,
    remainingCount: Math.max(0, enabledCount - attemptedCount),
    score: progress.score,
  };
};
