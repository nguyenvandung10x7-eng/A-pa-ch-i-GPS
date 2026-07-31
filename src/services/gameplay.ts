import type { ChallengeRun, ChallengeStatus, ChallengeTask, GpsPoint } from '../types/task';
import { distanceMeters } from '../utils/geo';
import { getStoredHistoryRaw, restoreStoredHistoryRawWhileLocked, saveRunWhileLocked } from './history';
import { getChallengeClearVersion } from './tasks';
import { withChallengeStorageLock } from './challengeStorageLock';

const PROGRESS_KEY = 'gps-challenge-progress';

type Coordinates = Pick<GpsPoint, 'lat' | 'lng'>;

type ProgressSnapshot = {
  clearVersion: number;
  gameId: string;
  updatedAt: string;
  activeRunId?: string;
  activeRunStatus?: ChallengeRun['status'];
};

type RawStorageSnapshot = {
  progressRaw: string | null;
  historyRaw: string | null;
};

type MutationGate = {
  actionClearVersion: number;
  expected: ProgressSnapshot;
  bootstrapProgress: PlayerProgress;
};

type AuthoritativeProgressState = {
  progress: PlayerProgress;
  hasPersistedProgress: boolean;
};

const LEGACY_TIMESTAMP_FALLBACK = '1970-01-01T00:00:00.000Z';

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

export type ProgressMutationResult = {
  progress: PlayerProgress;
  stale: boolean;
};

export type StartGameResult = ProgressMutationResult & {
  started: boolean;
};

export type NextChallengeResult = ProgressMutationResult & {
  assigned: boolean;
};

export type CompleteChallengeResult = ProgressMutationResult & {
  completed: boolean;
  duplicate: boolean;
  gps?: GpsVerificationResult;
};

export type SkipChallengeResult = ProgressMutationResult & {
  skipped: boolean;
  duplicate: boolean;
};

export type FailChallengeResult = ProgressMutationResult & {
  failed: boolean;
  duplicate: boolean;
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

const buildCurrentVersionGame = (): PlayerProgress => buildNewGame(getChallengeClearVersion());

const buildSnapshot = (progress: Pick<PlayerProgress, 'clearVersion' | 'gameId' | 'updatedAt' | 'activeRun'>): ProgressSnapshot => ({
  clearVersion: normalizeClearVersion(progress.clearVersion),
  gameId: progress.gameId,
  updatedAt: progress.updatedAt,
  activeRunId: progress.activeRun?.id,
  activeRunStatus: progress.activeRun?.status,
});

const matchesExpectedSnapshot = (persisted: PlayerProgress, expected: ProgressSnapshot): boolean => (
  normalizeClearVersion(persisted.clearVersion) === expected.clearVersion
  && persisted.gameId === expected.gameId
  && persisted.updatedAt === expected.updatedAt
  && persisted.activeRun?.id === expected.activeRunId
  && persisted.activeRun?.status === expected.activeRunStatus
);

const captureMutationGate = (progress: PlayerProgress): MutationGate => ({
  actionClearVersion: getChallengeClearVersion(),
  expected: buildSnapshot(progress),
  bootstrapProgress: progress,
});

const captureRawStorageSnapshot = (): RawStorageSnapshot => ({
  progressRaw: localStorage.getItem(PROGRESS_KEY),
  historyRaw: getStoredHistoryRaw(),
});

const restoreProgressRawWhileLocked = (raw: string | null): void => {
  if (raw === null) {
    localStorage.removeItem(PROGRESS_KEY);
    return;
  }
  localStorage.setItem(PROGRESS_KEY, raw);
};

const restoreRawStorageWhileLocked = (snapshot: RawStorageSnapshot): void => {
  restoreProgressRawWhileLocked(snapshot.progressRaw);
  restoreStoredHistoryRawWhileLocked(snapshot.historyRaw);
};

const persistProgressWhileLocked = (progress: PlayerProgress, expectedClearVersion: number): PlayerProgress | undefined => {
  if (getChallengeClearVersion() !== expectedClearVersion) {
    return undefined;
  }

  const next = { ...progress, clearVersion: expectedClearVersion };
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(next));
  return next;
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

const firstValidTimestamp = (...values: unknown[]): string | undefined => (
  values.find((value): value is string => typeof value === 'string' && value.trim().length > 0)
);

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
  const startedAt = firstValidTimestamp(parsed.startedAt, rawActiveRun?.startedAt, LEGACY_TIMESTAMP_FALLBACK) ?? LEGACY_TIMESTAMP_FALLBACK;
  const updatedAt = firstValidTimestamp(
    parsed.updatedAt,
    parsed.startedAt,
    rawActiveRun?.completedAt,
    rawActiveRun?.failedAt,
    rawActiveRun?.skippedAt,
    rawActiveRun?.startedAt,
    LEGACY_TIMESTAMP_FALLBACK,
  ) ?? LEGACY_TIMESTAMP_FALLBACK;
  const normalizedStatus = normalizeStatus(parsed.status);
  const status = normalizedStatus === 'active' && activeRun ? 'active' : normalizedStatus === 'completed' || normalizedStatus === 'failed' || normalizedStatus === 'skipped' ? normalizedStatus : 'pending';

  return {
    gameId: parsed.gameId,
    status,
    score: typeof parsed.score === 'number' && Number.isFinite(parsed.score) ? parsed.score : 0,
    startedAt,
    updatedAt,
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

const loadAuthoritativeProgressWhileLocked = (tasks: ChallengeTask[] = []): AuthoritativeProgressState => {
  const stored = localStorage.getItem(PROGRESS_KEY);
  if (!stored) return { progress: buildCurrentVersionGame(), hasPersistedProgress: false };

  try {
    const parsed = JSON.parse(stored) as unknown;
    const sanitized = sanitizeProgress(parsed, tasks);
    if (!sanitized) return { progress: buildCurrentVersionGame(), hasPersistedProgress: false };
    if (!isCurrentProgressVersion(sanitized)) return { progress: buildCurrentVersionGame(), hasPersistedProgress: false };
    return { progress: sanitized, hasPersistedProgress: true };
  } catch {
    return { progress: buildCurrentVersionGame(), hasPersistedProgress: false };
  }
};

const assignRandomChallengeWhileLocked = (tasks: ChallengeTask[], progress: PlayerProgress): PlayerProgress => {
  if (progress.activeRun?.status === 'active') return progress;

  const availableTasks = getAvailableTasks(tasks, progress);
  if (availableTasks.length === 0) {
    const hasEnabledTasks = tasks.some((task) => task.enabled);
    const persisted = persistProgressWhileLocked({
      ...progress,
      status: hasEnabledTasks ? 'completed' : 'pending',
      activeRun: undefined,
      updatedAt: now(),
    }, progress.clearVersion);
    return persisted ?? loadAuthoritativeProgressWhileLocked(tasks);
  }

  const task = availableTasks[Math.floor(Math.random() * availableTasks.length)];
  const persisted = persistProgressWhileLocked({
    ...progress,
    status: 'active',
    activeRun: createRun(task),
    updatedAt: now(),
  }, progress.clearVersion);
  return persisted ?? loadAuthoritativeProgressWhileLocked(tasks);
};

const runLockedMutation = async <T>(
  tasks: ChallengeTask[],
  gate: MutationGate,
  staleResultFactory: (authoritative: PlayerProgress) => T,
  handler: (authoritative: PlayerProgress) => T,
  options?: { ignoreSnapshotMismatch?: boolean; allowBootstrapFromExpected?: boolean },
): Promise<T> => (
  withChallengeStorageLock(() => {
    const authoritativeState = loadAuthoritativeProgressWhileLocked(tasks);
    if (getChallengeClearVersion() !== gate.actionClearVersion) {
      return staleResultFactory(authoritativeState.progress);
    }

    const rawSnapshot = captureRawStorageSnapshot();
    let authoritative = authoritativeState.progress;

    if (!authoritativeState.hasPersistedProgress) {
      if (!options?.allowBootstrapFromExpected) {
        return staleResultFactory(authoritative);
      }

      if (gate.expected.clearVersion !== gate.actionClearVersion) {
        return staleResultFactory(authoritative);
      }

      const bootstrapPersisted = persistProgressWhileLocked(gate.bootstrapProgress, gate.actionClearVersion);
      if (!bootstrapPersisted) {
        return staleResultFactory(loadAuthoritativeProgressWhileLocked(tasks).progress);
      }

      authoritative = bootstrapPersisted;
    } else if (!options?.ignoreSnapshotMismatch && !matchesExpectedSnapshot(authoritative, gate.expected)) {
      return staleResultFactory(authoritative);
    }

    try {
      return handler(authoritative);
    } catch (error) {
      try {
        restoreRawStorageWhileLocked(rawSnapshot);
      } catch {
        // If rollback fails, preserve the original write error for caller handling.
      }
      throw error;
    }
  })
);

export const createNewGameWithChallenge = async (
  tasks: ChallengeTask[],
  expectedProgress: PlayerProgress,
): Promise<StartGameResult> => {
  const gate = captureMutationGate(expectedProgress);
  return runLockedMutation(
    tasks,
    gate,
    (authoritative) => ({ progress: authoritative, stale: true, started: false }),
    () => {
      // Explicit New Game intentionally supersedes prior in-version progress by lock order.
      const fresh = buildNewGame(gate.actionClearVersion);
      const persistedFresh = persistProgressWhileLocked(fresh, gate.actionClearVersion);
      if (!persistedFresh) {
        return { progress: loadAuthoritativeProgressWhileLocked(tasks).progress, stale: true, started: false };
      }

      return {
        progress: assignRandomChallengeWhileLocked(tasks, persistedFresh),
        stale: false,
        started: true,
      };
    },
    { ignoreSnapshotMismatch: true, allowBootstrapFromExpected: true },
  );
};

export const loadProgress = (tasks: ChallengeTask[] = []): PlayerProgress | undefined => {
  const stored = localStorage.getItem(PROGRESS_KEY);
  if (!stored) return undefined;

  try {
    const parsed = JSON.parse(stored) as unknown;
    const sanitized = sanitizeProgress(parsed, tasks);
    if (!sanitized) return undefined;
    if (!isCurrentProgressVersion(sanitized)) return undefined;
    return sanitized;
  } catch {
    return undefined;
  }
};

export const loadOrCreateProgress = (tasks: ChallengeTask[] = []) => loadProgress(tasks) ?? buildCurrentVersionGame();

export const getAvailableTasks = (tasks: ChallengeTask[], progress: PlayerProgress) => (
  tasks.filter((task) => task.enabled && !progress.completedTaskIds.includes(task.id) && !progress.skippedTaskIds.includes(task.id) && !progress.failedTaskIds.includes(task.id))
);

export const assignRandomChallenge = async (tasks: ChallengeTask[], progress: PlayerProgress): Promise<NextChallengeResult> => {
  const gate = captureMutationGate(progress);
  return runLockedMutation(
    tasks,
    gate,
    (authoritative) => ({ progress: authoritative, stale: true, assigned: false }),
    (authoritative) => {
      const next = assignRandomChallengeWhileLocked(tasks, authoritative);
      const assigned = next.updatedAt !== authoritative.updatedAt || next.activeRun?.id !== authoritative.activeRun?.id;
      return { progress: next, stale: false, assigned };
    },
    { allowBootstrapFromExpected: true },
  );
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

export const completeActiveChallenge = async (
  progress: PlayerProgress,
  tasks: ChallengeTask[],
  task: ChallengeTask,
  coordinates: Coordinates,
  accuracy?: number,
): Promise<CompleteChallengeResult> => {
  if (!progress.activeRun || progress.activeRun.status !== 'active') {
    return { progress, stale: false, completed: false, duplicate: true };
  }

  if (progress.completedTaskIds.includes(task.id) || progress.skippedTaskIds.includes(task.id) || progress.failedTaskIds.includes(task.id)) {
    return { progress, stale: false, completed: false, duplicate: true };
  }

  const gps = validateGps(task, coordinates, accuracy);

  const gate = captureMutationGate(progress);
  return runLockedMutation(
    tasks,
    gate,
    (authoritative) => ({ progress: authoritative, stale: true, completed: false, duplicate: false }),
    (authoritative) => {
      if (!gps.valid) {
        return { progress: authoritative, stale: false, completed: false, duplicate: false, gps };
      }

      const activeRun = authoritative.activeRun;
      if (!activeRun || activeRun.status !== 'active') {
        return { progress: authoritative, stale: false, completed: false, duplicate: true };
      }

      const isKnownTask = tasks.some((candidate) => candidate.enabled && candidate.id === task.id);
      if (!isKnownTask || activeRun.taskId !== task.id) {
        return { progress: authoritative, stale: true, completed: false, duplicate: false };
      }

      if (authoritative.completedTaskIds.includes(task.id) || authoritative.skippedTaskIds.includes(task.id) || authoritative.failedTaskIds.includes(task.id)) {
        return { progress: authoritative, stale: false, completed: false, duplicate: true };
      }

      const completedAt = now();
      const run: ChallengeRun = {
        ...activeRun,
        status: 'completed',
        outcome: 'completed',
        completedAt,
        gpsVerified: true,
        score: task.points,
      };

      const savedHistory = saveRunWhileLocked(run, gate.actionClearVersion);
      if (!savedHistory) {
        return { progress: loadAuthoritativeProgressWhileLocked(tasks).progress, stale: true, completed: false, duplicate: false };
      }

      const outcomePersisted = persistProgressWhileLocked({
        ...authoritative,
        status: 'completed',
        score: authoritative.score + task.points,
        activeRun: run,
        completedTaskIds: unique([...authoritative.completedTaskIds, task.id]),
        attemptedTaskIds: unique([...authoritative.attemptedTaskIds, task.id]),
        updatedAt: completedAt,
      }, gate.actionClearVersion);

      if (!outcomePersisted) {
        return { progress: loadAuthoritativeProgressWhileLocked(tasks).progress, stale: true, completed: false, duplicate: false };
      }

      return {
        progress: assignRandomChallengeWhileLocked(tasks, outcomePersisted),
        stale: false,
        completed: true,
        duplicate: false,
        gps,
      };
    },
  );
};

export const skipActiveChallenge = async (tasks: ChallengeTask[], progress: PlayerProgress): Promise<SkipChallengeResult> => {
  if (!progress.activeRun || progress.activeRun.status !== 'active') {
    return { progress, stale: false, skipped: false, duplicate: true };
  }

  const gate = captureMutationGate(progress);
  return runLockedMutation(
    tasks,
    gate,
    (authoritative) => ({ progress: authoritative, stale: true, skipped: false, duplicate: false }),
    (authoritative) => {
      const activeRun = authoritative.activeRun;
      if (!activeRun || activeRun.status !== 'active') {
        return { progress: authoritative, stale: false, skipped: false, duplicate: true };
      }

      const currentTaskId = activeRun.taskId;
      if (authoritative.completedTaskIds.includes(currentTaskId) || authoritative.skippedTaskIds.includes(currentTaskId) || authoritative.failedTaskIds.includes(currentTaskId)) {
        return { progress: authoritative, stale: false, skipped: false, duplicate: true };
      }

      const skippedAt = now();
      const run: ChallengeRun = {
        ...activeRun,
        status: 'skipped',
        outcome: 'skipped',
        skippedAt,
        gpsVerified: false,
        score: 0,
      };

      const savedHistory = saveRunWhileLocked(run, gate.actionClearVersion);
      if (!savedHistory) {
        return { progress: loadAuthoritativeProgressWhileLocked(tasks).progress, stale: true, skipped: false, duplicate: false };
      }

      const outcomePersisted = persistProgressWhileLocked({
        ...authoritative,
        status: 'skipped',
        activeRun: run,
        skippedTaskIds: unique([...authoritative.skippedTaskIds, currentTaskId]),
        attemptedTaskIds: unique([...authoritative.attemptedTaskIds, currentTaskId]),
        updatedAt: skippedAt,
      }, gate.actionClearVersion);

      if (!outcomePersisted) {
        return { progress: loadAuthoritativeProgressWhileLocked(tasks).progress, stale: true, skipped: false, duplicate: false };
      }

      return {
        progress: assignRandomChallengeWhileLocked(tasks, outcomePersisted),
        stale: false,
        skipped: true,
        duplicate: false,
      };
    },
  );
};

export const failActiveChallenge = async (tasks: ChallengeTask[], progress: PlayerProgress): Promise<FailChallengeResult> => {
  if (!progress.activeRun || progress.activeRun.status !== 'active') {
    return { progress, stale: false, failed: false, duplicate: true };
  }

  const gate = captureMutationGate(progress);
  return runLockedMutation(
    tasks,
    gate,
    (authoritative) => ({ progress: authoritative, stale: true, failed: false, duplicate: false }),
    (authoritative) => {
      const activeRun = authoritative.activeRun;
      if (!activeRun || activeRun.status !== 'active') {
        return { progress: authoritative, stale: false, failed: false, duplicate: true };
      }

      const failedAt = now();
      const run: ChallengeRun = {
        ...activeRun,
        status: 'failed',
        outcome: 'failed',
        failedAt,
      };

      const savedHistory = saveRunWhileLocked(run, gate.actionClearVersion);
      if (!savedHistory) {
        return { progress: loadAuthoritativeProgressWhileLocked(tasks).progress, stale: true, failed: false, duplicate: false };
      }

      const outcomePersisted = persistProgressWhileLocked({
        ...authoritative,
        status: 'failed',
        activeRun: run,
        failedTaskIds: unique([...authoritative.failedTaskIds, activeRun.taskId]),
        attemptedTaskIds: unique([...authoritative.attemptedTaskIds, activeRun.taskId]),
        updatedAt: failedAt,
      }, gate.actionClearVersion);

      if (!outcomePersisted) {
        return { progress: loadAuthoritativeProgressWhileLocked(tasks).progress, stale: true, failed: false, duplicate: false };
      }

      return {
        progress: assignRandomChallengeWhileLocked(tasks, outcomePersisted),
        stale: false,
        failed: true,
        duplicate: false,
      };
    },
  );
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
