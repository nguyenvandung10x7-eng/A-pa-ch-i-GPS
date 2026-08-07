import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, Flag, Headphones, RotateCcw, ShieldCheck, Trophy, XCircle } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { TaskMap } from '../components/TaskMap';
import {
  assignRandomChallenge,
  completeActiveChallenge,
  createNewGameWithChallenge,
  failActiveChallenge,
  loadOrCreateProgress,
  reassignActiveRunForScope,
  skipActiveChallenge,
} from '../services/gameplay';
import { ChallengeStorageLockUnavailableError } from '../services/challengeStorageLock';
import { getEligibleTasksForExperience, getScopedExperienceModeFromSearch } from '../services/experienceFilters';
import {
  GAMEPLAY_MUSIC_ACTION_EVENT,
  GAMEPLAY_MUSIC_ADVANCE_EVENT,
  GAMEPLAY_MUSIC_CANCEL_EVENT,
  GAMEPLAY_MUSIC_PREPARE_EVENT,
} from '../services/gameplayMusicEvents';
import { localize } from '../services/i18n';
import type { ChallengeTask, LanguageCode } from '../types/task';
import { GeolocationRequestError, getCurrentPosition } from '../utils/geo';

const findRunTask = (tasks: ChallengeTask[], taskId?: string) => tasks.find((task) => task.id === taskId);

const formatTokenLabel = (value: string) => value
  .split('-')
  .filter(Boolean)
  .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
  .join(' ');

const splitTaskHeading = (value: string) => {
  const [locationName, ...rest] = value.split(/\s+[-\u2013]\s+/);
  return {
    locationName: locationName?.trim() || value,
    subtitle: rest.join(' - ').trim(),
  };
};

const getScopedProgressSummary = (tasks: ChallengeTask[], progress: ReturnType<typeof loadOrCreateProgress>) => {
  const enabledTaskIds = new Set(tasks.filter((task) => task.enabled).map((task) => task.id));
  const countInScope = (taskIds: string[]) => taskIds.filter((taskId) => enabledTaskIds.has(taskId)).length;
  const completedCount = countInScope(progress.completedTaskIds);
  const skippedCount = countInScope(progress.skippedTaskIds);
  const scopedAttemptedCount = new Set([
    ...progress.completedTaskIds.filter((taskId) => enabledTaskIds.has(taskId)),
    ...progress.skippedTaskIds.filter((taskId) => enabledTaskIds.has(taskId)),
    ...progress.failedTaskIds.filter((taskId) => enabledTaskIds.has(taskId)),
    ...progress.attemptedTaskIds.filter((taskId) => enabledTaskIds.has(taskId)),
  ]).size;

  const enabledCount = enabledTaskIds.size;

  return {
    enabledCount,
    completedCount,
    skippedCount,
    attemptedCount: scopedAttemptedCount,
    remainingCount: Math.max(0, enabledCount - scopedAttemptedCount),
    score: progress.score,
  };
};

type GpsStatus = 'idle' | 'requestingPermission' | 'locating' | 'permissionDenied' | 'unavailable' | 'inaccurateLocation' | 'outsideTargetRadius' | 'verified';
const SAMPLE_TIKTOK_URL = 'https://www.tiktok.com/@1954.theater';

const isValidExternalChallengeUrl = (value?: string): value is string => {
  if (!value) return false;

  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

export const ChallengePage = ({ tasks, clearVersion, language, t }: { tasks: ChallengeTask[]; clearVersion: number; language: LanguageCode; t: (key: string, values?: Record<string, string | number>) => string }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const activeTasks = useMemo(() => tasks.filter((task) => task.enabled), [tasks]);
  const scopedExperienceMode = useMemo(() => getScopedExperienceModeFromSearch(location.search), [location.search]);
  const eligibleTasks = useMemo(() => scopedExperienceMode ? getEligibleTasksForExperience(activeTasks, scopedExperienceMode) : activeTasks, [activeTasks, scopedExperienceMode]);
  const [progress, setProgress] = useState(() => loadOrCreateProgress(activeTasks));
  const [message, setMessage] = useState(() => t('challenge.ready'));
  const [gpsStatus, setGpsStatus] = useState<GpsStatus>('idle');
  const [isMutating, setIsMutating] = useState(false);
  const [failedTaskImageKey, setFailedTaskImageKey] = useState<string | null>(null);
  const [failedGalleryImageKeys, setFailedGalleryImageKeys] = useState<string[]>([]);
  const [completionPanelRunId, setCompletionPanelRunId] = useState<string | null>(null);
  const [expandedInstructionsTaskId, setExpandedInstructionsTaskId] = useState<string | null>(null);
  const scopeTransitionRef = useRef<string | null>(null);
  const scopeTransitionOwnerTokenRef = useRef<number | null>(null);
  const scopeReassignTokenRef = useRef(0);
  const scopeMutatingTokenRef = useRef<number | null>(null);
  const latestScopeContextRef = useRef<string>('');
  const previousResetStateRef = useRef<{ activeTasks: ChallengeTask[]; clearVersion: number } | null>(null);
  const task = findRunTask(scopedExperienceMode ? eligibleTasks : activeTasks, progress.activeRun?.taskId);
  const eligibleTaskIdSet = useMemo(() => new Set(eligibleTasks.map((candidate) => candidate.id)), [eligibleTasks]);
  const summary = useMemo(() => getScopedProgressSummary(eligibleTasks, progress), [eligibleTasks, progress]);
  const canComplete = Boolean(task && progress.activeRun?.status === 'active');
  const canPlay = eligibleTasks.length > 0 || canComplete;
  const isFinished = summary.enabledCount > 0 && summary.remainingCount === 0 && !canComplete;
  const isScopedMode = scopedExperienceMode !== null;
  const isScopedCompleted = isScopedMode && isFinished;
  const scopeCompletionPrimaryLabel = language === 'vi' ? 'Chọn trải nghiệm khác' : 'Choose another experience';

  const scopeContext = useMemo(() => [
    scopedExperienceMode ?? 'all',
    progress.gameId,
    progress.activeRun?.id ?? 'none',
    progress.activeRun?.taskId ?? 'none',
    eligibleTasks.map((candidate) => candidate.id).join(','),
  ].join('|'), [eligibleTasks, progress.activeRun?.id, progress.activeRun?.taskId, progress.gameId, scopedExperienceMode]);

  useEffect(() => {
    const previousResetState = previousResetStateRef.current;
    const shouldClearCompletionPanel = !previousResetState || previousResetState.activeTasks !== activeTasks || previousResetState.clearVersion !== clearVersion;
    previousResetStateRef.current = { activeTasks, clearVersion };

    const timeoutId = window.setTimeout(() => {
      setProgress(loadOrCreateProgress(activeTasks));
      setGpsStatus('idle');
      setMessage(t('challenge.ready'));
      if (shouldClearCompletionPanel) {
        setCompletionPanelRunId(null);
      }
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [activeTasks, clearVersion, t]);

  useLayoutEffect(() => {
    latestScopeContextRef.current = scopeContext;
  }, [scopeContext]);

  useEffect(() => {
    const cancelInFlightScopeReassign = () => {
      const cancelToken = scopeMutatingTokenRef.current;
      const ownerToken = scopeTransitionOwnerTokenRef.current;
      if (cancelToken === null && ownerToken === null) {
        scopeTransitionRef.current = null;
        return;
      }

      // Invalidate any pending scope reassign request result for the old scope context.
      scopeReassignTokenRef.current += 1;

      if (cancelToken !== null) {
        scopeMutatingTokenRef.current = null;
        setIsMutating(false);
      }

      scopeTransitionRef.current = null;
      scopeTransitionOwnerTokenRef.current = null;
    };

    if (!scopedExperienceMode) {
      cancelInFlightScopeReassign();
      return;
    }

    const activeRun = progress.activeRun;
    if (!activeRun || activeRun.status !== 'active') {
      cancelInFlightScopeReassign();
      return;
    }
    if (eligibleTaskIdSet.has(activeRun.taskId)) {
      cancelInFlightScopeReassign();
      scopeTransitionRef.current = null;
      return;
    }

    const transitionKey = `${scopedExperienceMode}:${progress.gameId}:${activeRun.id}:${activeRun.taskId}`;
    if (scopeTransitionRef.current === transitionKey && scopeTransitionOwnerTokenRef.current !== null) {
      return;
    }
    scopeTransitionRef.current = transitionKey;

    const requestToken = ++scopeReassignTokenRef.current;
    scopeTransitionOwnerTokenRef.current = requestToken;
    scopeMutatingTokenRef.current = requestToken;
    const requestContext = latestScopeContextRef.current;
    let applied = false;

    setIsMutating(true);

    void reassignActiveRunForScope(activeTasks, progress, eligibleTasks, {
      isOperationValid: () => scopeReassignTokenRef.current === requestToken && latestScopeContextRef.current === requestContext,
    })
      .then((result) => {
        if (scopeReassignTokenRef.current !== requestToken) return;
        if (latestScopeContextRef.current !== requestContext) return;

        applied = true;
        setProgress(result.progress);

        if (result.stale) {
          setMessage(t('challenge.ready'));
          return;
        }

        setGpsStatus('idle');
        setMessage(result.progress.activeRun?.status === 'active' ? t('challenge.active') : t('challenge.allDone'));
      })
      .catch((error) => {
        if (scopeReassignTokenRef.current !== requestToken) return;
        if (latestScopeContextRef.current !== requestContext) return;

        applied = true;
        if (error instanceof ChallengeStorageLockUnavailableError) {
          setGpsStatus('idle');
          setMessage(t('challenge.status.unavailable'));
          return;
        }
        console.error('Unexpected error while reassigning out-of-scope active challenge', error);
        setGpsStatus('unavailable');
        setMessage(t('challenge.status.unavailable'));
      })
      .finally(() => {
        if (scopeMutatingTokenRef.current === requestToken) {
          scopeMutatingTokenRef.current = null;
          setIsMutating(false);
        }

        if (scopeTransitionOwnerTokenRef.current === requestToken && !applied) {
          scopeTransitionRef.current = null;
          scopeTransitionOwnerTokenRef.current = null;
        }
      });
  }, [activeTasks, eligibleTaskIdSet, eligibleTasks, progress, scopedExperienceMode, scopeContext, t]);

  const currentTaskImageKey = task?.image ? `${task.id}:${task.image}` : null;
  const localizedTaskTitle = task ? localize(task.title, language) : '';
  const localizedTaskDescription = task ? localize(task.description, language) : '';
  const { locationName, subtitle: locationSubtitle } = splitTaskHeading(localizedTaskTitle);
  const progressPercent = summary.enabledCount > 0 ? Math.round((summary.completedCount / summary.enabledCount) * 100) : 0;
  const instructionsExpanded = Boolean(task?.id && expandedInstructionsTaskId === task.id);
  const instructionParagraphs = localizedTaskDescription
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  const runMutation = async (mutation: () => Promise<void>) => {
    if (isMutating) return;
    setIsMutating(true);
    try {
      await mutation();
    } finally {
      setIsMutating(false);
    }
  };

  const startGame = async () => {
    if (isMutating) return;

    if (isScopedCompleted) {
      void navigate('/experiences');
      return;
    }

    if (eligibleTasks.length === 0) {
      setMessage(t('challenge.allDone'));
      return;
    }

    window.dispatchEvent(new CustomEvent<'next'>(GAMEPLAY_MUSIC_ACTION_EVENT, { detail: 'next' }));

    await runMutation(async () => {
      try {
        const result = await createNewGameWithChallenge(activeTasks, progress, eligibleTasks);
        setProgress(result.progress);
        setGpsStatus('idle');
        if (result.stale) {
          setMessage(t('challenge.ready'));
          return;
        }

        setCompletionPanelRunId(null);
        setMessage(result.progress.activeRun?.status === 'active' ? t('challenge.active') : t('challenge.allDone'));
      } catch (error) {
        if (error instanceof ChallengeStorageLockUnavailableError) {
          setGpsStatus('idle');
          setMessage(t('challenge.status.unavailable'));
          return;
        }
        console.error('Unexpected error while starting a new game', error);
        setGpsStatus('unavailable');
        setMessage(t('challenge.status.unavailable'));
      }
    });
  };

  const startNextChallenge = async () => {
    if (isMutating) return;

    if (isScopedCompleted) {
      void navigate('/experiences');
      return;
    }

    if (eligibleTasks.length === 0) {
      setMessage(t('challenge.allDone'));
      return;
    }
    const shouldStartNewGame = !isScopedMode && progress.status === 'completed' && summary.remainingCount === 0;

    window.dispatchEvent(new CustomEvent(GAMEPLAY_MUSIC_PREPARE_EVENT));

    await runMutation(async () => {
      try {
        const result = shouldStartNewGame
          ? await createNewGameWithChallenge(activeTasks, progress, eligibleTasks)
          : await assignRandomChallenge(activeTasks, progress, eligibleTasks);
        setProgress(result.progress);
        setGpsStatus('idle');
        if (result.stale) {
          window.dispatchEvent(new CustomEvent(GAMEPLAY_MUSIC_CANCEL_EVENT));
          setMessage(t('challenge.ready'));
          return;
        }

        if (result.progress.activeRun?.status === 'active') {
          window.dispatchEvent(new CustomEvent(GAMEPLAY_MUSIC_ADVANCE_EVENT));
        } else {
          window.dispatchEvent(new CustomEvent(GAMEPLAY_MUSIC_CANCEL_EVENT));
        }

        if (shouldStartNewGame && 'started' in result && result.started) {
          setCompletionPanelRunId(null);
        }

        setMessage(result.progress.activeRun?.status === 'active' ? t('challenge.active') : t('challenge.allDone'));
      } catch (error) {
        window.dispatchEvent(new CustomEvent(GAMEPLAY_MUSIC_CANCEL_EVENT));
        if (error instanceof ChallengeStorageLockUnavailableError) {
          setGpsStatus('idle');
          setMessage(t('challenge.status.unavailable'));
          return;
        }
        console.error('Unexpected error while assigning next challenge', error);
        setGpsStatus('unavailable');
        setMessage(t('challenge.status.unavailable'));
      }
    });
  };

  const verifyGps = async () => {
    if (!task || !canComplete) return;
    const completedRunId = progress.activeRun?.id;

    window.dispatchEvent(new CustomEvent(GAMEPLAY_MUSIC_PREPARE_EVENT));

    await runMutation(async () => {
      setGpsStatus('requestingPermission');
      setMessage(t('challenge.status.requestingPermission'));

      try {
        setGpsStatus('locating');
        setMessage(t('challenge.status.locating'));
        const position = await getCurrentPosition();
        const result = await completeActiveChallenge(
          progress,
          activeTasks,
          task,
          { lat: position.coords.latitude, lng: position.coords.longitude },
          position.coords.accuracy,
          eligibleTasks,
        );
        setProgress(result.progress);

        if (result.stale) {
          window.dispatchEvent(new CustomEvent(GAMEPLAY_MUSIC_CANCEL_EVENT));
          setGpsStatus('idle');
          setMessage(t('challenge.ready'));
          return;
        }

        if (result.duplicate) {
          window.dispatchEvent(new CustomEvent(GAMEPLAY_MUSIC_CANCEL_EVENT));
          setGpsStatus('idle');
          setMessage(t('challenge.duplicate'));
          return;
        }

        if (!result.completed && result.gps) {
          window.dispatchEvent(new CustomEvent(GAMEPLAY_MUSIC_CANCEL_EVENT));
          const nextStatus = result.gps.status === 'inaccurateLocation' ? 'inaccurateLocation' : 'outsideTargetRadius';
          setGpsStatus(nextStatus);
          setMessage(result.gps.status === 'inaccurateLocation' ? t('challenge.status.inaccurateLocation') : t('challenge.status.outsideTargetRadius'));
          return;
        }

        if (result.completed && result.progress.activeRun?.status === 'active') {
          window.dispatchEvent(new CustomEvent(GAMEPLAY_MUSIC_ADVANCE_EVENT));
        } else {
          window.dispatchEvent(new CustomEvent(GAMEPLAY_MUSIC_CANCEL_EVENT));
        }

        setGpsStatus('verified');
        setMessage(t('challenge.verified', { title: localize(task.title, language), meters: result.gps?.meters ?? 0 }));
        if (result.completed && completedRunId) {
          setCompletionPanelRunId(completedRunId);
        }
        if (!result.progress.activeRun) {
          setMessage(t('challenge.allDone'));
        }
      } catch (error) {
        window.dispatchEvent(new CustomEvent(GAMEPLAY_MUSIC_CANCEL_EVENT));
        if (error instanceof GeolocationRequestError) {
          const nextStatus = error.code === 1 ? 'permissionDenied' : error.code === 2 ? 'unavailable' : 'unavailable';
          setGpsStatus(nextStatus);
          setMessage(error.code === 1 ? t('challenge.status.permissionDenied') : t('challenge.status.unavailable'));
          return;
        }
        if (error instanceof ChallengeStorageLockUnavailableError) {
          setGpsStatus('idle');
          setMessage(t('challenge.status.unavailable'));
          return;
        }
        console.error('Unexpected error while verifying challenge GPS', error);
        setGpsStatus('unavailable');
        setMessage(t('challenge.status.unavailable'));
      }
    });
  };

  const skipChallenge = async () => {
    if (!task || !canComplete) return;

    const shouldSkip = window.confirm(t('challenge.confirmSkip'));
    if (!shouldSkip) return;

    window.dispatchEvent(new CustomEvent(GAMEPLAY_MUSIC_PREPARE_EVENT));

    await runMutation(async () => {
      try {
        const result = await skipActiveChallenge(activeTasks, progress, eligibleTasks);
        setProgress(result.progress);
        if (result.stale) {
          window.dispatchEvent(new CustomEvent(GAMEPLAY_MUSIC_CANCEL_EVENT));
          setGpsStatus('idle');
          setMessage(t('challenge.ready'));
          return;
        }

        if (!result.skipped) {
          window.dispatchEvent(new CustomEvent(GAMEPLAY_MUSIC_CANCEL_EVENT));
          setGpsStatus('idle');
          setMessage(t('challenge.duplicate'));
          return;
        }

        if (result.progress.activeRun?.status === 'active') {
          window.dispatchEvent(new CustomEvent(GAMEPLAY_MUSIC_ADVANCE_EVENT));
        } else {
          window.dispatchEvent(new CustomEvent(GAMEPLAY_MUSIC_CANCEL_EVENT));
        }

        setCompletionPanelRunId(null);
        setGpsStatus('idle');
        setMessage(result.progress.activeRun ? t('challenge.skipped') : t('challenge.allDone'));
      } catch (error) {
        window.dispatchEvent(new CustomEvent(GAMEPLAY_MUSIC_CANCEL_EVENT));
        if (error instanceof ChallengeStorageLockUnavailableError) {
          setGpsStatus('idle');
          setMessage(t('challenge.status.unavailable'));
          return;
        }
        console.error('Unexpected error while skipping challenge', error);
        setGpsStatus('unavailable');
        setMessage(t('challenge.status.unavailable'));
      }
    });
  };

  const failChallenge = async () => {
    window.dispatchEvent(new CustomEvent(GAMEPLAY_MUSIC_PREPARE_EVENT));

    await runMutation(async () => {
      try {
        const failedResult = await failActiveChallenge(activeTasks, progress, eligibleTasks);
        setProgress(failedResult.progress);
        if (failedResult.stale) {
          window.dispatchEvent(new CustomEvent(GAMEPLAY_MUSIC_CANCEL_EVENT));
          setGpsStatus('idle');
          setMessage(t('challenge.ready'));
          return;
        }

        if (!failedResult.failed) {
          window.dispatchEvent(new CustomEvent(GAMEPLAY_MUSIC_CANCEL_EVENT));
          setGpsStatus('idle');
          setMessage(t('challenge.duplicate'));
          return;
        }

        if (failedResult.progress.activeRun?.status === 'active') {
          window.dispatchEvent(new CustomEvent(GAMEPLAY_MUSIC_ADVANCE_EVENT));
        } else {
          window.dispatchEvent(new CustomEvent(GAMEPLAY_MUSIC_CANCEL_EVENT));
        }

        setCompletionPanelRunId(null);
        setGpsStatus('idle');
        setMessage(failedResult.progress.activeRun ? t('challenge.failed') : t('challenge.allDone'));
      } catch (error) {
        window.dispatchEvent(new CustomEvent(GAMEPLAY_MUSIC_CANCEL_EVENT));
        if (error instanceof ChallengeStorageLockUnavailableError) {
          setGpsStatus('idle');
          setMessage(t('challenge.status.unavailable'));
          return;
        }
        console.error('Unexpected error while failing challenge', error);
        setGpsStatus('unavailable');
        setMessage(t('challenge.status.unavailable'));
      }
    });
  };

  if (!canPlay) return <Card><p className="text-emerald-900">{t('challenge.empty')}</p></Card>;

  const handleDismissCompletionPanel = () => {
    setCompletionPanelRunId(null);
  };

  const handleNavigateToTikTokSubmission = () => {
    if (!completionPanelRunId) return;
    const destination = `/submit-tiktok?runId=${encodeURIComponent(completionPanelRunId)}`;
    setCompletionPanelRunId(null);
    void navigate(destination);
  };

  const statusBadge = progress.activeRun?.status === 'active' ? t('history.active') : progress.activeRun?.status;
  const taskExternalUrl = task && isValidExternalChallengeUrl(task.externalUrl) ? task.externalUrl : null;
  const taskLocationIntro = task?.locationIntro ? localize(task.locationIntro, language).trim() : '';
  const taskExperienceNote = task?.experienceNote ? localize(task.experienceNote, language).trim() : '';
  const taskCoverImage = task?.image.trim() ?? '';
  const additionalTaskImages = task?.images
    ?.filter((imagePath): imagePath is string => typeof imagePath === 'string')
    .map((imagePath) => imagePath.trim())
    .filter((imagePath) => imagePath.length > 0 && imagePath !== taskCoverImage) ?? [];
  const taskGalleryImages = task ? [...(taskCoverImage ? [taskCoverImage] : []), ...additionalTaskImages] : [];
  const hasAdditionalTaskImages = additionalTaskImages.length > 0;
  const categoryLabel = task ? (() => {
    const translated = t(`challenge.category.${task.category}`);
    return translated === `challenge.category.${task.category}` ? formatTokenLabel(task.category) : translated;
  })() : '';
  const difficultyLabel = task ? (() => {
    const translated = t(`challenge.difficulty.${task.difficulty}`);
    return translated === `challenge.difficulty.${task.difficulty}` ? formatTokenLabel(task.difficulty) : translated;
  })() : '';

  return (
  <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(20rem,1.02fr)]">
    <Card className="overflow-visible p-0">
    <div className="overflow-hidden rounded-[1.9rem]">
      {task && hasAdditionalTaskImages ? (
      <div className="relative">
        <div key={task.id} className="flex snap-x snap-mandatory overflow-x-auto" aria-label={t('admin.additionalImages')}>
          {taskGalleryImages.map((imagePath, index) => {
            const imageKey = `${task.id}:${index}:${imagePath}`;
            const imageFailed = failedGalleryImageKeys.includes(imageKey);

            return (
              <div key={imageKey} className="relative aspect-[4/3] min-h-[16rem] w-full shrink-0 snap-start sm:aspect-[16/10] sm:min-h-[18rem]">
                {imageFailed ? (
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(161,189,177,0.64),rgba(46,72,44,0.9))]" />
                ) : (
                  <img
                    src={imagePath}
                    alt={localizedTaskTitle}
                    className="h-full w-full object-cover object-center"
                    loading={index === 0 ? 'eager' : 'lazy'}
                    onError={() => setFailedGalleryImageKeys((previousKeys) => (previousKeys.includes(imageKey) ? previousKeys : [...previousKeys, imageKey]))}
                  />
                )}
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,20,12,0.02)_22%,rgba(10,18,12,0.18)_48%,rgba(14,22,16,0.84)_100%)]" />
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                  <div className="max-w-[min(100%,34rem)]">
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[rgba(247,240,226,0.78)]">{t('challenge.title')}</p>
                    <h1 className="mt-2 text-[1.9rem] font-black leading-tight text-white drop-shadow-[0_6px_24px_rgba(0,0,0,0.45)] sm:text-[2.3rem]">{locationName}</h1>
                    {locationSubtitle ? <p className="mt-2 max-w-[28rem] text-sm leading-6 text-[rgba(247,240,226,0.92)]">{locationSubtitle}</p> : null}
                    {imageFailed ? <p className="mt-2 text-xs font-semibold text-[rgba(247,240,226,0.88)]">{t('challenge.imageUnavailable')}</p> : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      ) : task?.image && failedTaskImageKey !== currentTaskImageKey ? (
      <div className="relative aspect-[4/3] min-h-[16rem] sm:aspect-[16/10] sm:min-h-[18rem]">
        <img
          src={task.image}
          alt={localizedTaskTitle}
          className="h-full w-full object-cover object-center"
          onError={() => setFailedTaskImageKey(currentTaskImageKey)}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,20,12,0.02)_22%,rgba(10,18,12,0.18)_48%,rgba(14,22,16,0.84)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
          <div className="max-w-[min(100%,34rem)]">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[rgba(247,240,226,0.78)]">{t('challenge.title')}</p>
            <h1 className="mt-2 text-[1.9rem] font-black leading-tight text-white drop-shadow-[0_6px_24px_rgba(0,0,0,0.45)] sm:text-[2.3rem]">{locationName}</h1>
            {locationSubtitle ? <p className="mt-2 max-w-[28rem] text-sm leading-6 text-[rgba(247,240,226,0.92)]">{locationSubtitle}</p> : null}
          </div>
        </div>
      </div>
      ) : (
      <div className="relative aspect-[4/3] min-h-[15rem] bg-[linear-gradient(180deg,rgba(161,189,177,0.64),rgba(46,72,44,0.9))] sm:aspect-[16/10]">
        <p className="absolute inset-x-4 top-4 rounded-[0.9rem] bg-[rgba(255,255,255,0.42)] px-3 py-2 text-xs font-semibold text-[var(--forest-900)]">
          {t('challenge.imageUnavailable')}
        </p>
        <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(180deg,transparent,rgba(20,34,18,0.72))] p-5 sm:p-6">
          <h1 className="text-[1.85rem] font-black leading-tight text-white sm:text-[2.2rem]">{locationName}</h1>
          {locationSubtitle ? <p className="mt-2 text-sm leading-6 text-[rgba(247,240,226,0.92)]">{locationSubtitle}</p> : null}
        </div>
      </div>
      )}

      <div className="p-5 sm:p-6">
      {task && progress.activeRun ? (
        <div className="min-w-0">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--forest-700)]">{t('challenge.title')}</p>
        <h2 className="mt-2 break-words text-[1.95rem] font-black leading-tight text-[var(--forest-950)] sm:text-[2.4rem]">{localizedTaskTitle}</h2>
        {taskExperienceNote ? (
          <p className="mt-2 text-sm leading-6 text-[var(--forest-800)]">
            <span className="font-semibold uppercase tracking-[0.12em] text-[var(--forest-700)]">{t('challenge.experienceNoteLabel')}:</span> {taskExperienceNote}
          </p>
        ) : null}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-[var(--forest-900)]">
          <span className="rounded-full bg-[rgba(255,247,229,0.62)] px-3 py-1.5 font-bold ring-1 ring-[rgba(112,79,39,0.1)]">{task.points} {t('challenge.points')}</span>
          <span className="rounded-full bg-[rgba(255,255,255,0.58)] px-3 py-1.5 font-bold ring-1 ring-[rgba(61,84,52,0.1)]">{t('challenge.radius')} {task.gps.radius}m</span>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full bg-[rgba(255,247,229,0.52)] px-2.5 py-1 font-semibold uppercase tracking-[0.14em] text-[var(--earth-900)] ring-1 ring-[rgba(112,79,39,0.1)]">{categoryLabel}</span>
          <span className="rounded-full bg-[rgba(255,255,255,0.5)] px-2.5 py-1 font-semibold uppercase tracking-[0.12em] text-[var(--forest-700)] ring-1 ring-[rgba(61,84,52,0.1)]">{difficultyLabel}</span>
          {statusBadge ? <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(201,148,62,0.14)] px-2.5 py-1 font-semibold uppercase tracking-[0.12em] text-[var(--earth-900)] ring-1 ring-[rgba(112,79,39,0.12)]"><span className="h-1.5 w-1.5 rounded-full bg-[var(--earth-800)]" aria-hidden="true" />{statusBadge}</span> : null}
        </div>
        <div className="mt-5 rounded-[1.25rem] bg-[rgba(255,255,255,0.34)] px-4 py-4 ring-1 ring-[rgba(61,84,52,0.08)]">
          {instructionsExpanded ? (
            <div className="space-y-3 text-base leading-7 text-[var(--forest-800)]">
              {instructionParagraphs.map((paragraph) => <p key={paragraph} style={{ whiteSpace: 'pre-line' }}>{paragraph}</p>)}
            </div>
          ) : (
            <div className="line-clamp-4 text-base leading-7 text-[var(--forest-800)]" style={{ whiteSpace: 'pre-line' }}>{localizedTaskDescription}</div>
          )}
          <button
            type="button"
            onClick={() => setExpandedInstructionsTaskId(instructionsExpanded ? null : task.id)}
            className="mt-3 inline-flex min-h-[2.75rem] items-center rounded-full px-4 py-2 text-sm font-black text-[var(--forest-900)] ring-1 ring-[rgba(61,84,52,0.12)] transition hover:bg-[rgba(255,255,255,0.46)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(220,179,85,0.32)]"
          >
            {instructionsExpanded ? t('challenge.collapseInstructions') : t('challenge.viewFullInstructions')}
          </button>
        </div>
        {taskLocationIntro ? (
          <div className="mt-4 rounded-[1.2rem] bg-[rgba(255,255,255,0.34)] px-4 py-3 ring-1 ring-[rgba(61,84,52,0.08)]">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--forest-700)]">{t('challenge.locationIntroLabel')}</p>
            <p className="mt-2 text-sm leading-6 text-[var(--forest-800)]">{taskLocationIntro}</p>
          </div>
        ) : null}
        {taskExternalUrl ? (
          <a
            href={taskExternalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex min-h-[3rem] items-center justify-center rounded-full bg-[rgba(255,255,255,0.62)] px-5 py-3 text-sm font-black text-[var(--forest-900)] ring-1 ring-[rgba(61,84,52,0.12)] transition hover:bg-white"
          >
            {t('challenge.externalAction')}
          </a>
        ) : null}
        </div>
      ) : (
        <div className="mt-1 rounded-[1.35rem] bg-[rgba(255,255,255,0.44)] p-5 ring-1 ring-[rgba(61,84,52,0.1)]">
        <h1 className="text-3xl font-black text-[var(--forest-950)]">{isFinished ? t('challenge.allDone') : t('challenge.pending')}</h1>
        <p className="mt-3 text-[var(--forest-800)]">{t('challenge.pendingDescription')}</p>
        </div>
      )}

      <div className="mt-5 rounded-[1.35rem] bg-[rgba(255,255,255,0.38)] px-4 py-3 ring-1 ring-[rgba(61,84,52,0.08)]">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--forest-700)]">{t('challenge.journeyProgress')}</p>
            <p className="mt-2 text-base font-black text-[var(--forest-900)]">{t('challenge.progressCompletedLine', { completed: summary.completedCount, total: summary.enabledCount })}</p>
            <p className="mt-1 text-sm text-[var(--forest-700)]">{t('challenge.progressRemainingLine', { remaining: summary.remainingCount })}</p>
          </div>
          <p className="shrink-0 text-sm font-black text-[var(--forest-800)]">{progressPercent}%</p>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-[rgba(61,84,52,0.12)]">
          <div className="h-full rounded-full bg-[linear-gradient(90deg,#2d4d2f,#597154)] transition-[width] duration-300" style={{ width: `${progressPercent}%` }} />
        </div>
        <p className="mt-2 text-sm leading-6 text-[var(--forest-700)]">{t('challenge.progressBreakdown', { completed: summary.completedCount, skipped: summary.skippedCount, remaining: summary.remainingCount })}</p>
      </div>

      <div className="mt-5 space-y-3 rounded-[1.35rem] bg-[rgba(245,242,233,0.52)] p-4 ring-1 ring-[rgba(61,84,52,0.08)]">
        <div className="rounded-[1.05rem] bg-[rgba(234,241,229,0.72)] px-3.5 py-3 text-[var(--forest-900)]">
          {message}
        </div>
        <p className="text-sm leading-6 text-[var(--forest-700)]">{gpsStatus !== 'idle' ? `${t('challenge.gpsStatus')}: ${t(`challenge.status.${gpsStatus}`)}` : t('challenge.ready')}</p>
        <p className="rounded-[1rem] border border-[rgba(112,79,39,0.14)] bg-[rgba(255,247,229,0.5)] p-3 text-sm leading-6 text-[var(--earth-900)]">
          {t('challenge.safetyNotice')}
        </p>

        {completionPanelRunId && (
          <div className="rounded-[1.2rem] border border-[rgba(61,84,52,0.12)] bg-[rgba(255,255,255,0.62)] p-4 text-[var(--forest-900)]">
          <p className="text-base font-bold text-[var(--forest-950)]">{t('challenge.completionHandoff.title')}</p>
          <p className="mt-2 text-sm leading-6 text-[var(--forest-800)]">{t('challenge.completionHandoff.description')}</p>
          <p className="mt-2 text-sm leading-6 text-[var(--forest-700)]">{t('challenge.completionHandoff.sampleHint')}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
            href={SAMPLE_TIKTOK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[3rem] items-center justify-center rounded-full border border-[rgba(61,84,52,0.16)] bg-[rgba(255,255,255,0.58)] px-4 py-2 text-sm font-black text-[var(--forest-900)] transition hover:bg-white"
            >
            {t('challenge.completionHandoff.sampleAction')}
            </a>
            <Button type="button" onClick={handleNavigateToTikTokSubmission}>
            {t('challenge.completionHandoff.submitAction')}
            </Button>
            <Button type="button" onClick={handleDismissCompletionPanel} variant="secondary">
            {t('challenge.completionHandoff.laterAction')}
            </Button>
          </div>
          </div>
        )}

        <p className="inline-flex items-start gap-2 rounded-[1rem] bg-[rgba(255,255,255,0.5)] px-3 py-2 text-sm text-[var(--forest-800)] ring-1 ring-[rgba(61,84,52,0.1)]">
          <Headphones className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{t('challenge.headphoneRecommendation')}</span>
        </p>

        <div className="flex flex-wrap gap-3 text-sm text-[var(--forest-700)]">
          {progress.activeRun?.gpsVerified ? <span className="inline-flex items-center gap-2 rounded-full bg-[rgba(234,241,229,0.72)] px-3 py-1.5 ring-1 ring-[rgba(61,84,52,0.12)]"><CheckCircle2 className="h-4 w-4 text-[var(--forest-700)]" />{t('challenge.gpsStatus')}</span> : null}
          {progress.completedTaskIds.includes(task?.id ?? '') ? <span className="inline-flex items-center gap-2 rounded-full bg-[rgba(255,247,229,0.72)] px-3 py-1.5 ring-1 ring-[rgba(112,79,39,0.12)]"><CheckCircle2 className="h-4 w-4 text-[var(--earth-800)]" />{t('challenge.completedStatus')}</span> : null}
        </div>
      </div>

      <div className="mt-5">
        <Button onClick={() => { void verifyGps(); }} disabled={!canComplete || isMutating} variant="gpsPrimary" className="w-full" style={{ scrollMarginBottom: '7rem' }}><ShieldCheck className="h-5 w-5" />{t('challenge.verifyGps')}</Button>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Button onClick={() => { void startGame(); }} disabled={isMutating} variant="secondary" className="w-full border border-[rgba(91,67,38,0.14)] bg-[rgba(247,242,231,0.86)]"><RotateCcw className="h-5 w-5" />{isScopedCompleted ? scopeCompletionPrimaryLabel : t('challenge.newGame')}</Button>
          <Button onClick={() => { void startNextChallenge(); }} disabled={canComplete || isMutating || eligibleTasks.length === 0} variant="secondary" className="w-full border border-[rgba(61,84,52,0.14)] bg-[rgba(255,255,255,0.68)]"><Trophy className="h-5 w-5" />{t('challenge.next')}</Button>
          <Button onClick={() => { void skipChallenge(); }} disabled={!canComplete || isMutating} variant="secondary" className="w-full"><XCircle className="h-5 w-5" />{t('challenge.skip')}</Button>
          <Button onClick={() => { void failChallenge(); }} disabled={!canComplete || isMutating} variant="secondary" className="w-full text-[var(--brocade-red)]"><Flag className="h-5 w-5" />{t('challenge.fail')}</Button>
        </div>
      </div>
      </div>
    </div>
    </Card>
    <TaskMap tasks={task ? [task] : eligibleTasks} language={language} t={t} />
  </div>
  );
};
