import type { ChallengeRun, ChallengeStatus, ChallengeTask, GpsPoint } from '../types/task';
import { distanceMeters } from '../utils/geo';
import {
  getStoredHistoryRawV2,
  loadLegacyHistoryForVersion,
  restoreStoredHistoryV2RawWhileLocked,
  saveRunWhileLocked,
} from './history';
import {
  CHALLENGE_HISTORY_KEY_V2,
  CHALLENGE_HISTORY_KEY_LEGACY,
  CHALLENGE_PROGRESS_KEY_LEGACY,
  CHALLENGE_PROGRESS_KEY_V2,
  CHALLENGE_STORAGE_PROTOCOL_KEY,
  CHALLENGE_STORAGE_PROTOCOL_V2,
  getChallengeClearVersion,
} from './tasks';
import { withChallengeStorageLock } from './challengeStorageLock';
import { migrateTaskId, migrateTaskIdList } from './taskIdMigration';

type Coordinates = Pick<GpsPoint, 'lat' | 'lng'>;

type ProgressSnapshot = {
  clearVersion: number;
  gameId: string;
  updatedAt: string;
  activeRunId?: string;
  activeRunStatus?: ChallengeRun['status'];
};

type RawStorageSnapshot = {
  protocolRaw: string | null;
  v2ProgressRaw: string | null;
  v2HistoryRaw: string | null;
};

type MutationGate = {
  actionClearVersion: number;
  expected: ProgressSnapshot;
  bootstrapProgress: PlayerProgress;
};

type StorageTaskIdMigrationResult = {
  changed: boolean;
  nextRaw?: string;
};

type AuthoritativeProgressState = {
  progress: PlayerProgress;
  hasPersistedProgress: boolean;
};

const LEGACY_TIMESTAMP_FALLBACK = '1970-01-01T00:00:00.000Z';
const GAMEPLAY_MIGRATION_KEYS = [
  CHALLENGE_PROGRESS_KEY_LEGACY,
  CHALLENGE_PROGRESS_KEY_V2,
  CHALLENGE_HISTORY_KEY_LEGACY,
  CHALLENGE_HISTORY_KEY_V2,
] as const;

let gameplayStorageMigrationPromise: Promise<void> | null = null;

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

export type ScopeReassignmentResult = ProgressMutationResult & {
  reassigned: boolean;
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
  protocolRaw: localStorage.getItem(CHALLENGE_STORAGE_PROTOCOL_KEY),
  v2ProgressRaw: localStorage.getItem(CHALLENGE_PROGRESS_KEY_V2),
  v2HistoryRaw: getStoredHistoryRawV2(),
});

const restoreKeyWhileLocked = (key: string, raw: string | null): void => {
  if (raw === null) {
    localStorage.removeItem(key);
    return;
  }
  localStorage.setItem(key, raw);
};

const restoreRawStorageWhileLocked = (snapshot: RawStorageSnapshot): void => {
  restoreKeyWhileLocked(CHALLENGE_STORAGE_PROTOCOL_KEY, snapshot.protocolRaw);
  restoreKeyWhileLocked(CHALLENGE_PROGRESS_KEY_V2, snapshot.v2ProgressRaw);
  restoreStoredHistoryV2RawWhileLocked(snapshot.v2HistoryRaw);
};

const persistProgressWhileLocked = (progress: PlayerProgress, expectedClearVersion: number): PlayerProgress | undefined => {
  if (getChallengeClearVersion() !== expectedClearVersion) {
    return undefined;
  }

  const next = { ...progress, clearVersion: expectedClearVersion };
  localStorage.setItem(CHALLENGE_PROGRESS_KEY_V2, JSON.stringify(next));
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

const normalizeAndMigrateTaskIds = (value: unknown): { taskIds: string[]; changed: boolean } => {
  const normalizedTaskIds = normalizeTaskIds(value);
  return migrateTaskIdList(normalizedTaskIds);
};

const firstValidTimestamp = (...values: unknown[]): string | undefined => (
  values.find((value): value is string => typeof value === 'string' && value.trim().length > 0)
);

const sanitizeProgress = (value: unknown, tasks: ChallengeTask[] = []): PlayerProgress | undefined => {
  if (!value || typeof value !== 'object') return undefined;

  const parsed = value as Partial<PlayerProgress> & { activeRun?: Partial<ChallengeRun> };
  if (typeof parsed.gameId !== 'string') return undefined;

  const enabledTaskIds = new Set(tasks.filter((task) => task.enabled).map((task) => task.id));
  const completedTaskIds = normalizeAndMigrateTaskIds(parsed.completedTaskIds).taskIds.filter((id) => enabledTaskIds.size === 0 || enabledTaskIds.has(id));
  const skippedTaskIds = normalizeAndMigrateTaskIds(parsed.skippedTaskIds).taskIds.filter((id) => enabledTaskIds.size === 0 || enabledTaskIds.has(id));
  const failedTaskIds = normalizeAndMigrateTaskIds(parsed.failedTaskIds).taskIds.filter((id) => enabledTaskIds.size === 0 || enabledTaskIds.has(id));
  const attemptedTaskIdsSource = normalizeAndMigrateTaskIds(parsed.attemptedTaskIds).taskIds;
  const attemptedTaskIds = unique([
    ...completedTaskIds,
    ...skippedTaskIds,
    ...failedTaskIds,
    ...attemptedTaskIdsSource.filter((id) => enabledTaskIds.size === 0 || enabledTaskIds.has(id)),
  ]);

  const rawActiveRun = parsed.activeRun && typeof parsed.activeRun === 'object' ? parsed.activeRun : undefined;
  const activeRunTaskId = typeof rawActiveRun?.taskId === 'string' ? migrateTaskId(rawActiveRun.taskId).taskId : undefined;
  const activeRunIsValid = Boolean(rawActiveRun && activeRunTaskId && (enabledTaskIds.size === 0 || enabledTaskIds.has(activeRunTaskId)) && rawActiveRun.status === 'active');
  const activeRun = activeRunIsValid
    ? {
      ...(rawActiveRun as ChallengeRun),
      taskId: activeRunTaskId as string,
    }
    : undefined;
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

const migrateProgressTaskIds = (value: unknown): { value: unknown; changed: boolean } => {
  if (!value || typeof value !== 'object') {
    return { value, changed: false };
  }

  const parsed = value as Partial<PlayerProgress> & { activeRun?: Partial<ChallengeRun> };
  let changed = false;

  const completed = normalizeAndMigrateTaskIds(parsed.completedTaskIds);
  if (completed.changed) {
    changed = true;
  }

  const skipped = normalizeAndMigrateTaskIds(parsed.skippedTaskIds);
  if (skipped.changed) {
    changed = true;
  }

  const failed = normalizeAndMigrateTaskIds(parsed.failedTaskIds);
  if (failed.changed) {
    changed = true;
  }

  const attempted = normalizeAndMigrateTaskIds(parsed.attemptedTaskIds);
  if (attempted.changed) {
    changed = true;
  }

  const mergedAttempted = unique([
    ...completed.taskIds,
    ...skipped.taskIds,
    ...failed.taskIds,
    ...attempted.taskIds,
  ]);

  if (mergedAttempted.length !== attempted.taskIds.length || !mergedAttempted.every((taskId, index) => taskId === attempted.taskIds[index])) {
    changed = true;
  }

  const rawActiveRun = parsed.activeRun && typeof parsed.activeRun === 'object' ? parsed.activeRun : undefined;
  let migratedActiveRun = rawActiveRun;
  if (rawActiveRun && typeof rawActiveRun.taskId === 'string') {
    const migratedTaskId = migrateTaskId(rawActiveRun.taskId);
    if (migratedTaskId.changed) {
      changed = true;
      migratedActiveRun = {
        ...rawActiveRun,
        taskId: migratedTaskId.taskId,
      };
    }
  }

  if (!changed) {
    return { value, changed: false };
  }

  return {
    value: {
      ...parsed,
      completedTaskIds: completed.taskIds,
      skippedTaskIds: skipped.taskIds,
      failedTaskIds: failed.taskIds,
      attemptedTaskIds: mergedAttempted,
      activeRun: migratedActiveRun,
    },
    changed: true,
  };
};

const migrateProgressStorageRawTaskIds = (raw: string): StorageTaskIdMigrationResult => {
  try {
    const parsed = JSON.parse(raw) as unknown;
    const migrated = migrateProgressTaskIds(parsed);
    if (!migrated.changed) {
      return { changed: false };
    }

    return {
      changed: true,
      nextRaw: JSON.stringify(migrated.value),
    };
  } catch {
    // Keep malformed progress storage untouched.
    return { changed: false };
  }
};

const migrateHistoryStorageRawTaskIds = (raw: string): StorageTaskIdMigrationResult => {
  try {
    const parsed = JSON.parse(raw) as ChallengeRun[];
    if (!Array.isArray(parsed)) {
      return { changed: false };
    }

    let changed = false;
    const migratedItems = parsed.map((item) => {
      if (!item || typeof item !== 'object' || typeof item.taskId !== 'string') {
        return item;
      }

      const migratedTask = migrateTaskId(item.taskId);
      if (!migratedTask.changed) {
        return item;
      }

      changed = true;
      return {
        ...item,
        taskId: migratedTask.taskId,
      };
    });

    if (!changed) {
      return { changed: false };
    }

    return {
      changed: true,
      nextRaw: JSON.stringify(migratedItems),
    };
  } catch {
    // Keep malformed history storage untouched.
    return { changed: false };
  }
};

const migrateStorageRawTaskIds = (key: string, raw: string): StorageTaskIdMigrationResult => {
  if (key === CHALLENGE_HISTORY_KEY_LEGACY || key === CHALLENGE_HISTORY_KEY_V2) {
    return migrateHistoryStorageRawTaskIds(raw);
  }

  return migrateProgressStorageRawTaskIds(raw);
};

const migrateAllGameplayStorageTaskIdsWhileLocked = (): void => {
  const rawByKey = new Map<string, string | null>();
  GAMEPLAY_MIGRATION_KEYS.forEach((key) => {
    rawByKey.set(key, localStorage.getItem(key));
  });

  const writes = new Map<string, string>();
  rawByKey.forEach((raw, key) => {
    if (!raw) {
      return;
    }

    const migrated = migrateStorageRawTaskIds(key, raw);
    if (!migrated.changed || typeof migrated.nextRaw !== 'string') {
      return;
    }

    writes.set(key, migrated.nextRaw);
  });

  writes.forEach((nextRaw, key) => {
    localStorage.setItem(key, nextRaw);
  });
};

export const migrateAllGameplayStorageTaskIds = (): Promise<void> => {
  if (!gameplayStorageMigrationPromise) {
    gameplayStorageMigrationPromise = withChallengeStorageLock(() => {
      migrateAllGameplayStorageTaskIdsWhileLocked();
    }).finally(() => {
      gameplayStorageMigrationPromise = null;
    });
  }

  return gameplayStorageMigrationPromise;
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

const resolveCandidatePool = (catalogTasks: ChallengeTask[], candidateTasks?: ChallengeTask[]): ChallengeTask[] => {
  const enabledCatalog = catalogTasks.filter((task) => task.enabled);
  if (candidateTasks === undefined) {
    return enabledCatalog;
  }

  const candidateIds = new Set(candidateTasks.filter((task) => task.enabled).map((task) => task.id));
  return enabledCatalog.filter((task) => candidateIds.has(task.id));
};

const readProgressFromKey = (key: string, tasks: ChallengeTask[]): PlayerProgress | undefined => {
  const stored = localStorage.getItem(key);
  if (!stored) return undefined;

  try {
    const parsed = JSON.parse(stored) as unknown;
    const migrated = migrateProgressTaskIds(parsed);
    const sanitized = sanitizeProgress(migrated.value, tasks);
    if (!sanitized) return undefined;
    if (!isCurrentProgressVersion(sanitized)) return undefined;
    return sanitized;
  } catch {
    return undefined;
  }
};

const loadV2AuthoritativeProgressWhileLocked = (tasks: ChallengeTask[]): AuthoritativeProgressState => {
  const progress = readProgressFromKey(CHALLENGE_PROGRESS_KEY_V2, tasks);
  if (!progress) {
    return { progress: buildCurrentVersionGame(), hasPersistedProgress: false };
  }
  return { progress, hasPersistedProgress: true };
};

const migrateToProtocolV2WhileLocked = (tasks: ChallengeTask[]): AuthoritativeProgressState => {
  migrateAllGameplayStorageTaskIdsWhileLocked();

  const protocol = localStorage.getItem(CHALLENGE_STORAGE_PROTOCOL_KEY);
  if (protocol === CHALLENGE_STORAGE_PROTOCOL_V2) {
    return loadV2AuthoritativeProgressWhileLocked(tasks);
  }

  const currentClearVersion = getChallengeClearVersion();
  const legacyProgress = readProgressFromKey(CHALLENGE_PROGRESS_KEY_LEGACY, tasks);
  const legacyHistory = loadLegacyHistoryForVersion(currentClearVersion);

  if (legacyProgress) {
    localStorage.setItem(CHALLENGE_PROGRESS_KEY_V2, JSON.stringify({ ...legacyProgress, clearVersion: currentClearVersion }));
  } else {
    localStorage.removeItem(CHALLENGE_PROGRESS_KEY_V2);
  }

  if (legacyHistory.length > 0) {
    localStorage.setItem(CHALLENGE_HISTORY_KEY_V2, JSON.stringify(legacyHistory.slice(0, 100)));
  } else {
    localStorage.removeItem(CHALLENGE_HISTORY_KEY_V2);
  }

  localStorage.setItem(CHALLENGE_STORAGE_PROTOCOL_KEY, CHALLENGE_STORAGE_PROTOCOL_V2);
  return loadV2AuthoritativeProgressWhileLocked(tasks);
};

const assignRandomChallengeWhileLocked = (
  catalogTasks: ChallengeTask[],
  progress: PlayerProgress,
  candidateTasks?: ChallengeTask[],
): PlayerProgress => {
  if (progress.activeRun?.status === 'active') return progress;

  const candidatePool = resolveCandidatePool(catalogTasks, candidateTasks);
  const availableTasks = getAvailableTasks(candidatePool, progress);
  if (availableTasks.length === 0) {
    const hasEnabledTasks = candidatePool.length > 0;
    const persisted = persistProgressWhileLocked({
      ...progress,
      status: hasEnabledTasks ? 'completed' : 'pending',
      activeRun: undefined,
      updatedAt: now(),
    }, progress.clearVersion);
    return persisted ?? loadV2AuthoritativeProgressWhileLocked(catalogTasks).progress;
  }

  const task = availableTasks[Math.floor(Math.random() * availableTasks.length)];
  const persisted = persistProgressWhileLocked({
    ...progress,
    status: 'active',
    activeRun: createRun(task),
    updatedAt: now(),
  }, progress.clearVersion);
  return persisted ?? loadV2AuthoritativeProgressWhileLocked(catalogTasks).progress;
};

const runLockedMutation = async <T>(
  tasks: ChallengeTask[],
  gate: MutationGate,
  staleResultFactory: (authoritative: PlayerProgress) => T,
  handler: (authoritative: PlayerProgress) => T,
  options?: { ignoreSnapshotMismatch?: boolean; allowBootstrapFromExpected?: boolean },
): Promise<T> => (
  withChallengeStorageLock(() => {
    if (getChallengeClearVersion() !== gate.actionClearVersion) {
      const protocol = localStorage.getItem(CHALLENGE_STORAGE_PROTOCOL_KEY);
      if (protocol === CHALLENGE_STORAGE_PROTOCOL_V2) {
        return staleResultFactory(loadV2AuthoritativeProgressWhileLocked(tasks).progress);
      }
      return staleResultFactory(loadRenderProgress(tasks) ?? buildCurrentVersionGame());
    }

    const rawSnapshot = captureRawStorageSnapshot();
    try {
      const authoritativeState = migrateToProtocolV2WhileLocked(tasks);
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
          return staleResultFactory(loadV2AuthoritativeProgressWhileLocked(tasks).progress);
        }

        authoritative = bootstrapPersisted;
      } else if (!options?.ignoreSnapshotMismatch && !matchesExpectedSnapshot(authoritative, gate.expected)) {
        return staleResultFactory(authoritative);
      }

      return handler(authoritative);
    } catch (error) {
      try {
        restoreRawStorageWhileLocked(rawSnapshot);
      } catch {
        // Keep the original write error if rollback restoration also fails.
      }
      throw error;
    }
  })
);

export const createNewGameWithChallenge = async (
  catalogTasks: ChallengeTask[],
  expectedProgress: PlayerProgress,
  candidateTasks?: ChallengeTask[],
): Promise<StartGameResult> => {
  const gate = captureMutationGate(expectedProgress);
  return runLockedMutation(
    catalogTasks,
    gate,
    (authoritative) => ({ progress: authoritative, stale: true, started: false }),
    () => {
      // Explicit New Game intentionally supersedes prior in-version progress by lock order.
      const fresh = buildNewGame(gate.actionClearVersion);
      const persistedFresh = persistProgressWhileLocked(fresh, gate.actionClearVersion);
      if (!persistedFresh) {
        return { progress: loadV2AuthoritativeProgressWhileLocked(catalogTasks).progress, stale: true, started: false };
      }

      return {
        progress: assignRandomChallengeWhileLocked(catalogTasks, persistedFresh, candidateTasks),
        stale: false,
        started: true,
      };
    },
    { ignoreSnapshotMismatch: true, allowBootstrapFromExpected: true },
  );
};

const loadRenderProgress = (tasks: ChallengeTask[] = []): PlayerProgress | undefined => {
  const protocol = localStorage.getItem(CHALLENGE_STORAGE_PROTOCOL_KEY);
  if (protocol === CHALLENGE_STORAGE_PROTOCOL_V2) {
    return readProgressFromKey(CHALLENGE_PROGRESS_KEY_V2, tasks);
  }
  return readProgressFromKey(CHALLENGE_PROGRESS_KEY_LEGACY, tasks);
};

export const loadProgress = (tasks: ChallengeTask[] = []): PlayerProgress | undefined => loadRenderProgress(tasks);

export const loadOrCreateProgress = (tasks: ChallengeTask[] = []) => loadProgress(tasks) ?? buildCurrentVersionGame();

export const getAvailableTasks = (tasks: ChallengeTask[], progress: PlayerProgress) => (
  tasks.filter((task) => task.enabled && !progress.completedTaskIds.includes(task.id) && !progress.skippedTaskIds.includes(task.id) && !progress.failedTaskIds.includes(task.id))
);

export const assignRandomChallenge = async (
  catalogTasks: ChallengeTask[],
  progress: PlayerProgress,
  candidateTasks?: ChallengeTask[],
): Promise<NextChallengeResult> => {
  const gate = captureMutationGate(progress);
  return runLockedMutation(
    catalogTasks,
    gate,
    (authoritative) => ({ progress: authoritative, stale: true, assigned: false }),
    (authoritative) => {
      const next = assignRandomChallengeWhileLocked(catalogTasks, authoritative, candidateTasks);
      const assigned = next.updatedAt !== authoritative.updatedAt || next.activeRun?.id !== authoritative.activeRun?.id;
      return { progress: next, stale: false, assigned };
    },
    { allowBootstrapFromExpected: true },
  );
};

export const reassignActiveRunForScope = async (
  catalogTasks: ChallengeTask[],
  progress: PlayerProgress,
  candidateTasks: ChallengeTask[],
): Promise<ScopeReassignmentResult> => {
  const gate = captureMutationGate(progress);
  return runLockedMutation(
    catalogTasks,
    gate,
    (authoritative) => ({ progress: authoritative, stale: true, reassigned: false }),
    (authoritative) => {
      const activeRun = authoritative.activeRun;
      if (!activeRun || activeRun.status !== 'active') {
        return { progress: authoritative, stale: false, reassigned: false };
      }

      const candidatePool = resolveCandidatePool(catalogTasks, candidateTasks);
      const candidateIds = new Set(candidatePool.map((task) => task.id));
      if (candidateIds.has(activeRun.taskId)) {
        return { progress: authoritative, stale: false, reassigned: false };
      }

      const reassignedProgress = assignRandomChallengeWhileLocked(
        catalogTasks,
        {
          ...authoritative,
          status: 'pending',
          activeRun: undefined,
          updatedAt: now(),
        },
        candidatePool,
      );

      const reassigned = reassignedProgress.activeRun?.id !== activeRun.id || reassignedProgress.activeRun?.taskId !== activeRun.taskId;
      return { progress: reassignedProgress, stale: false, reassigned };
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
  catalogTasks: ChallengeTask[],
  task: ChallengeTask,
  coordinates: Coordinates,
  accuracy?: number,
  candidateTasks?: ChallengeTask[],
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
    catalogTasks,
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

      const isKnownTask = catalogTasks.some((candidate) => candidate.enabled && candidate.id === task.id);
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
        return { progress: loadV2AuthoritativeProgressWhileLocked(catalogTasks).progress, stale: true, completed: false, duplicate: false };
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
        return { progress: loadV2AuthoritativeProgressWhileLocked(catalogTasks).progress, stale: true, completed: false, duplicate: false };
      }

      return {
        progress: assignRandomChallengeWhileLocked(catalogTasks, outcomePersisted, candidateTasks),
        stale: false,
        completed: true,
        duplicate: false,
        gps,
      };
    },
  );
};

export const skipActiveChallenge = async (
  catalogTasks: ChallengeTask[],
  progress: PlayerProgress,
  candidateTasks?: ChallengeTask[],
): Promise<SkipChallengeResult> => {
  if (!progress.activeRun || progress.activeRun.status !== 'active') {
    return { progress, stale: false, skipped: false, duplicate: true };
  }

  const gate = captureMutationGate(progress);
  return runLockedMutation(
    catalogTasks,
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
        return { progress: loadV2AuthoritativeProgressWhileLocked(catalogTasks).progress, stale: true, skipped: false, duplicate: false };
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
        return { progress: loadV2AuthoritativeProgressWhileLocked(catalogTasks).progress, stale: true, skipped: false, duplicate: false };
      }

      return {
        progress: assignRandomChallengeWhileLocked(catalogTasks, outcomePersisted, candidateTasks),
        stale: false,
        skipped: true,
        duplicate: false,
      };
    },
  );
};

export const failActiveChallenge = async (
  catalogTasks: ChallengeTask[],
  progress: PlayerProgress,
  candidateTasks?: ChallengeTask[],
): Promise<FailChallengeResult> => {
  if (!progress.activeRun || progress.activeRun.status !== 'active') {
    return { progress, stale: false, failed: false, duplicate: true };
  }

  const gate = captureMutationGate(progress);
  return runLockedMutation(
    catalogTasks,
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
        return { progress: loadV2AuthoritativeProgressWhileLocked(catalogTasks).progress, stale: true, failed: false, duplicate: false };
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
        return { progress: loadV2AuthoritativeProgressWhileLocked(catalogTasks).progress, stale: true, failed: false, duplicate: false };
      }

      return {
        progress: assignRandomChallengeWhileLocked(catalogTasks, outcomePersisted, candidateTasks),
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
