import type { ChallengeRun, ChallengeStatus, ChallengeTask, GpsPoint } from '../types/task';
import { distanceMeters } from '../utils/geo';
import { saveRun } from './history';
import { getChallengeClearVersion } from './tasks';

const PROGRESS_KEY = 'gps-challenge-progress';

type Coordinates = Pick<GpsPoint, 'lat' | 'lng'>;

export type PlayerProgress = {
  gameId: string;
  status: ChallengeStatus;
  score: number;
  startedAt: string;
  updatedAt: string;
  clearVersion: number;
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
const normalizeClearVersion = (value: unknown): number => {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return parsed;
};

const buildNewGame = (clearVersion: number): PlayerProgress => ({
  gameId: crypto.randomUUID(),
  status: 'pending',
  score: 0,
  startedAt: now(),
  updatedAt: now(),
  clearVersion,
  completedTaskIds: [],
  skippedTaskIds: [],
  failedTaskIds: [],
  attemptedTaskIds: [],
});

const writeProgress = (progress: PlayerProgress) => {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  return progress;
};

export const isCurrentProgressVersion = (progress: Pick<PlayerProgress, 'clearVersion'>): boolean => (
  normalizeClearVersion(progress.clearVersion) === getChallengeClearVersion()
);

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
    clearVersion: normalizeClearVersion(parsed.clearVersion),
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

const persistProgress = (progress: PlayerProgress, tasks: ChallengeTask[] = []): PlayerProgress => {
  if (!isCurrentProgressVersion(progress)) {
    return loadProgress(tasks) ?? writeProgress(buildNewGame(getChallengeClearVersion()));
  }
  return writeProgress(progress);
};

export const createNewGame = (): PlayerProgress => persistProgress(buildNewGame(getChallengeClearVersion()));

export const loadProgress = (tasks: ChallengeTask[] = []): PlayerProgress | undefined => {
  const stored = localStorage.getItem(PROGRESS_KEY);
  if (!stored) return undefined;

  try {
    const parsed = JSON.parse(stored) as unknown;
    const sanitized = sanitizeProgress(parsed, tasks);
    if (!sanitized) return undefined;
    if (!isCurrentProgressVersion(sanitized)) return undefined;
    return writeProgress(sanitized);
  } catch {
    return undefined;
  }
};

export const loadOrCreateProgress = (tasks: ChallengeTask[] = []) => loadProgress(tasks) ?? createNewGame();

export const getAvailableTasks = (tasks: ChallengeTask[], progress: PlayerProgress) => (
  tasks.filter((task) => task.enabled && !progress.completedTaskIds.includes(task.id) && !progress.skippedTaskIds.includes(task.id) && !progress.failedTaskIds.includes(task.id))
);

export const assignRandomChallenge = (tasks: ChallengeTask[], progress: PlayerProgress): PlayerProgress => {
  if (!isCurrentProgressVersion(progress)) {
    return loadOrCreateProgress(tasks);
  }
  if (progress.activeRun?.status === 'active') return progress;

  const availableTasks = getAvailableTasks(tasks, progress);
  if (availableTasks.length === 0) {
    const hasEnabledTasks = tasks.some((task) => task.enabled);
    return persistProgress({
      ...progress,
      status: hasEnabledTasks ? 'completed' : 'pending',
      activeRun: undefined,
      updatedAt: now(),
    }, tasks);
  }

  const task = availableTasks[Math.floor(Math.random() * availableTasks.length)];
  return persistProgress({
    ...progress,
    status: 'active',
    activeRun: createRun(task),
    updatedAt: now(),
  }, tasks);
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
  if (!isCurrentProgressVersion(progress)) {
    return { progress: loadProgress() ?? createNewGame(), completed: false, duplicate: false, stale: true, gps: undefined };
  }

  if (!progress.activeRun || progress.activeRun.status !== 'active') {
    return { progress, completed: false, duplicate: true, stale: false, gps: undefined };
  }

  if (progress.completedTaskIds.includes(task.id) || progress.skippedTaskIds.includes(task.id) || progress.failedTaskIds.includes(task.id)) {
    return { progress, completed: false, duplicate: true, stale: false, gps: undefined };
  }

  const gps = validateGps(task, coordinates, accuracy);
  if (!gps.valid) return { progress, completed: false, duplicate: false, stale: false, gps };
  if (!isCurrentProgressVersion(progress)) {
    return { progress: loadProgress() ?? createNewGame(), completed: false, duplicate: false, stale: true, gps: undefined };
  }

  const completedAt = now();
  const run: ChallengeRun = {
    ...progress.activeRun,
    status: 'completed',
    outcome: 'completed',
    completedAt,
    gpsVerified: true,
    score: task.points,
  };
  const saved = saveRun(run, progress.clearVersion);
  if (!saved) {
    return { progress: loadProgress() ?? createNewGame(), completed: false, duplicate: false, stale: true, gps: undefined };
  }

  const persisted = persistProgress({
    ...progress,
    status: 'completed',
    score: progress.score + task.points,
    activeRun: run,
    completedTaskIds: unique([...progress.completedTaskIds, task.id]),
    attemptedTaskIds: unique([...progress.attemptedTaskIds, task.id]),
    updatedAt: completedAt,
  });
  if (persisted.clearVersion !== progress.clearVersion) {
    return { progress: persisted, completed: false, duplicate: false, stale: true, gps: undefined };
  }

  return {
    progress: persisted,
    completed: true,
    duplicate: false,
    stale: false,
    gps,
  };
};

export const skipActiveChallenge = (progress: PlayerProgress) => {
  if (!isCurrentProgressVersion(progress)) {
    return { progress: loadProgress() ?? createNewGame(), skipped: false, duplicate: false, stale: true };
  }

  if (!progress.activeRun || progress.activeRun.status !== 'active') {
    return { progress, skipped: false, duplicate: true, stale: false };
  }

  const taskId = progress.activeRun.taskId;
  if (progress.completedTaskIds.includes(taskId) || progress.skippedTaskIds.includes(taskId) || progress.failedTaskIds.includes(taskId)) {
    return { progress, skipped: false, duplicate: true, stale: false };
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
  const saved = saveRun(run, progress.clearVersion);
  if (!saved) {
    return { progress: loadProgress() ?? createNewGame(), skipped: false, duplicate: false, stale: true };
  }

  const persisted = persistProgress({
    ...progress,
    status: 'skipped',
    activeRun: run,
    skippedTaskIds: unique([...progress.skippedTaskIds, taskId]),
    attemptedTaskIds: unique([...progress.attemptedTaskIds, taskId]),
    updatedAt: skippedAt,
  });
  if (persisted.clearVersion !== progress.clearVersion) {
    return { progress: persisted, skipped: false, duplicate: false, stale: true };
  }

  return {
    progress: persisted,
    skipped: true,
    duplicate: false,
    stale: false,
  };
};

export const failActiveChallenge = (progress: PlayerProgress) => {
  if (!isCurrentProgressVersion(progress)) {
    return { progress: loadProgress() ?? createNewGame(), stale: true };
  }

  if (!progress.activeRun || progress.activeRun.status !== 'active') return { progress, stale: false };

  const failedAt = now();
  const run: ChallengeRun = { ...progress.activeRun, status: 'failed', outcome: 'failed', failedAt };
  const saved = saveRun(run, progress.clearVersion);
  if (!saved) {
    return { progress: loadProgress() ?? createNewGame(), stale: true };
  }

  const persisted = persistProgress({
    ...progress,
    status: 'failed',
    activeRun: run,
    failedTaskIds: unique([...progress.failedTaskIds, progress.activeRun.taskId]),
    attemptedTaskIds: unique([...progress.attemptedTaskIds, progress.activeRun.taskId]),
    updatedAt: failedAt,
  });
  if (persisted.clearVersion !== progress.clearVersion) {
    return { progress: persisted, stale: true };
  }

  return { progress: persisted, stale: false };
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
