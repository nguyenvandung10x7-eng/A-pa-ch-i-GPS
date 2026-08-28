import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Bike, CheckCircle2, ChevronDown, Compass, Cookie, Film, Flag, Headphones, Leaf, MapPin, RotateCcw, ShieldCheck, Star, Trophy, XCircle } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ExploreAtlas } from '../components/ExploreAtlas';
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

type ChallengeAccent = 'paper' | 'cinematic' | 'playful' | 'mooncake' | 'nature' | 'horizon';

const getChallengeAccent = (task?: ChallengeTask): { className: string; kind: ChallengeAccent } => {
  if (!task) return { className: 'is-paper', kind: 'paper' };

  const id = task.id.toLowerCase();
  const classes: string[] = [];
  const isCinematic = id === 'doi-a1-chuyen-tau-thoi-gian-1954';
  const isPlayful = id === 'de-xe-may-ngoai-troi-qua-dem';
  const isMooncake = task.category === 'mooncake' || id.includes('banh') || id.includes('mooncake');
  const isHorizon = /a-pa-chai|muong-nhe|ta-ko-khu/.test(id);
  const isNature = /long-chao|thac|ruong|xoai|phieng-loi|pa-khoang|huoi-pha/.test(id);

  if (isCinematic) classes.push('is-cinematic');
  if (isPlayful) classes.push('is-playful');
  if (isMooncake) classes.push('is-mooncake');
  if (isHorizon) classes.push('is-horizon');
  if (isNature) classes.push('is-nature');

  const kind: ChallengeAccent = isCinematic
    ? 'cinematic'
    : isPlayful
      ? 'playful'
      : isMooncake
        ? 'mooncake'
        : isHorizon
          ? 'horizon'
          : isNature
            ? 'nature'
            : 'paper';

  return {
    className: classes.length > 0 ? classes.join(' ') : 'is-paper',
    kind,
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
  const [detailsOpen, setDetailsOpen] = useState(false);
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
  const scopeCompletionPrimaryLabel = language === 'vi' ? 'Quay lại Sách' : 'Back to Book';

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

  const startGame = async (preferredTaskIds?: string[]) => {
    if (isMutating) return;

    if (isScopedCompleted) {
      void navigate('/book');
      return;
    }

    const preferredTaskIdSet = preferredTaskIds?.length ? new Set(preferredTaskIds) : null;
    const startCandidates = preferredTaskIdSet
      ? eligibleTasks.filter((candidate) => preferredTaskIdSet.has(candidate.id))
      : eligibleTasks;

    if (startCandidates.length === 0) {
      setMessage(t('challenge.allDone'));
      return;
    }

    window.dispatchEvent(new CustomEvent<'next'>(GAMEPLAY_MUSIC_ACTION_EVENT, { detail: 'next' }));

    await runMutation(async () => {
      try {
        const result = await createNewGameWithChallenge(activeTasks, progress, startCandidates);
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
      void navigate('/book');
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
  const challengeAccent = getChallengeAccent(task);
  const currentTaskCompleted = progress.completedTaskIds.includes(task?.id ?? '');
  const currentTaskGpsVerified = Boolean(progress.activeRun?.gpsVerified);
  return (
    <ExploreAtlas
      tasks={eligibleTasks}
      progressTotal={eligibleTasks.length}
      activeTask={task}
      score={summary.score}
      completedCount={summary.completedCount}
      completedTaskIds={progress.completedTaskIds}
      language={language}
      detailsOpen={detailsOpen}
      isMutating={isMutating}
      onOpenDetails={() => setDetailsOpen(true)}
      onCloseDetails={() => setDetailsOpen(false)}
      onStart={(taskIds) => { void startGame(taskIds); }}
    >
      <Card
        className={[
          'challenge-editorial overflow-visible p-0',
          challengeAccent.className,
          currentTaskCompleted ? 'is-complete' : '',
          currentTaskGpsVerified ? 'is-gps-verified' : '',
        ].filter(Boolean).join(' ')}
      >
        <div className="challenge-editorial__frame">
          <section className="challenge-editorial__hero">
            <div className="challenge-editorial__media">
              {task && hasAdditionalTaskImages ? (
                <div key={task.id} className="challenge-editorial__gallery" aria-label={t('admin.additionalImages')}>
                  {taskGalleryImages.map((imagePath, index) => {
                    const imageKey = task.id + ':' + index + ':' + imagePath;
                    const imageFailed = failedGalleryImageKeys.includes(imageKey);

                    return (
                      <div key={imageKey} className="challenge-editorial__slide">
                        {imageFailed ? (
                          <div className="challenge-editorial__image-fallback">
                            <p>{t('challenge.imageUnavailable')}</p>
                          </div>
                        ) : (
                          <img
                            src={imagePath}
                            alt={localizedTaskTitle}
                            loading={index === 0 ? 'eager' : 'lazy'}
                            onError={() => setFailedGalleryImageKeys((previousKeys) => (
                              previousKeys.includes(imageKey) ? previousKeys : [...previousKeys, imageKey]
                            ))}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : task?.image && failedTaskImageKey !== currentTaskImageKey ? (
                <img
                  src={task.image}
                  alt={localizedTaskTitle}
                  onError={() => setFailedTaskImageKey(currentTaskImageKey)}
                />
              ) : (
                <div className="challenge-editorial__image-fallback">
                  <p>{t('challenge.imageUnavailable')}</p>
                </div>
              )}
            </div>

            <div className="challenge-editorial__treatment" aria-hidden="true" />
            <div className="challenge-editorial__hero-shade" aria-hidden="true" />

            {challengeAccent.kind !== 'paper' ? (
              <div className="challenge-editorial__accent" aria-hidden="true">
                {challengeAccent.kind === 'cinematic' ? <Film /> : null}
                {challengeAccent.kind === 'playful' ? <Bike /> : null}
                {challengeAccent.kind === 'mooncake' ? <Cookie /> : null}
                {challengeAccent.kind === 'nature' ? <Leaf /> : null}
                {challengeAccent.kind === 'horizon' ? <Compass /> : null}
              </div>
            ) : null}

            {statusBadge ? (
              <span className="challenge-editorial__hero-status">
                <span aria-hidden="true" />
                {statusBadge}
              </span>
            ) : null}

            <div className="challenge-editorial__hero-copy">
              <p>{t('challenge.title')}</p>
              <h1>{locationName}</h1>
              {locationSubtitle ? <p>{locationSubtitle}</p> : null}
            </div>
          </section>

          <div className="challenge-editorial__content">
            <div className="challenge-editorial__grid">
              <div className="challenge-editorial__main">
                {task && progress.activeRun ? (
                  <>
                    <header className="challenge-editorial__heading">
                      <p>{t('challenge.title')}</p>
                      <h2 id="challenge-task-title">{localizedTaskTitle}</h2>
                      {taskExperienceNote ? (
                        <p className="challenge-editorial__experience">
                          <span>{t('challenge.experienceNoteLabel')}:</span> {taskExperienceNote}
                        </p>
                      ) : null}
                    </header>

                    <div className="challenge-editorial__facts">
                      <div className="challenge-editorial__fact is-reward">
                        <Star aria-hidden="true" />
                        <span>{task.points} {t('challenge.points')}</span>
                      </div>
                      <div className="challenge-editorial__fact is-gps">
                        <MapPin aria-hidden="true" />
                        <span>{t('challenge.radius')} {task.gps.radius}m</span>
                      </div>
                    </div>

                    <div className="challenge-editorial__taxonomy">
                      <span>{categoryLabel}</span>
                      <span>{difficultyLabel}</span>
                      {statusBadge ? (
                        <span className="is-status">
                          <i aria-hidden="true" />
                          {statusBadge}
                        </span>
                      ) : null}
                    </div>

                    <section className="challenge-editorial__mission" aria-label={t('challenge.title')}>
                      <span className="challenge-editorial__mission-mark" aria-hidden="true" />
                      {instructionsExpanded ? (
                        <div className="challenge-editorial__prose">
                          {instructionParagraphs.map((paragraph) => (
                            <p key={paragraph} style={{ whiteSpace: 'pre-line' }}>{paragraph}</p>
                          ))}
                        </div>
                      ) : (
                        <div
                          className="challenge-editorial__prose line-clamp-4"
                          style={{ whiteSpace: 'pre-line' }}
                        >
                          {localizedTaskDescription}
                        </div>
                      )}
                      <button
                        type="button"
                        aria-expanded={instructionsExpanded}
                        onClick={() => setExpandedInstructionsTaskId(instructionsExpanded ? null : task.id)}
                        className="challenge-editorial__text-toggle"
                      >
                        {instructionsExpanded ? t('challenge.collapseInstructions') : t('challenge.viewFullInstructions')}
                        <ChevronDown aria-hidden="true" />
                      </button>
                    </section>

                    {taskExternalUrl ? (
                      <a
                        href={taskExternalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="challenge-editorial__external-action"
                      >
                        {t('challenge.externalAction')}
                      </a>
                    ) : null}
                  </>
                ) : (
                  <div className="challenge-editorial__pending">
                    <h1>{isFinished ? t('challenge.allDone') : t('challenge.pending')}</h1>
                    <p>{t('challenge.pendingDescription')}</p>
                  </div>
                )}
              </div>

              <aside className="challenge-editorial__rail">
                <section className="challenge-editorial__status-panel">
                  <div className="challenge-editorial__status-message" aria-live="polite">{message}</div>
                  <p className="challenge-editorial__gps-line">
                    <ShieldCheck aria-hidden="true" />
                    <span>{gpsStatus !== 'idle' ? t('challenge.gpsStatus') + ': ' + t('challenge.status.' + gpsStatus) : t('challenge.ready')}</span>
                  </p>

                  <div className="challenge-editorial__state-badges">
                    {currentTaskGpsVerified ? (
                      <span>
                        <CheckCircle2 aria-hidden="true" />
                        {t('challenge.gpsStatus')}
                      </span>
                    ) : null}
                    {currentTaskCompleted ? (
                      <span>
                        <CheckCircle2 aria-hidden="true" />
                        {t('challenge.completedStatus')}
                      </span>
                    ) : null}
                  </div>

                  <p className="challenge-editorial__safety">{t('challenge.safetyNotice')}</p>

                  {completionPanelRunId ? (
                    <div className="challenge-editorial__completion">
                      <p>{t('challenge.completionHandoff.title')}</p>
                      <p>{t('challenge.completionHandoff.description')}</p>
                      <p>{t('challenge.completionHandoff.sampleHint')}</p>
                      <div>
                        <a
                          href={SAMPLE_TIKTOK_URL}
                          target="_blank"
                          rel="noopener noreferrer"
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
                  ) : null}

                  <p className="challenge-editorial__headphone">
                    <Headphones aria-hidden="true" />
                    <span>{t('challenge.headphoneRecommendation')}</span>
                  </p>
                </section>

                <div className="challenge-editorial__primary-action">
                  <Button
                    onClick={() => { void verifyGps(); }}
                    disabled={!canComplete || isMutating}
                    variant="gpsPrimary"
                    className="w-full"
                    style={{ scrollMarginBottom: '7rem' }}
                  >
                    <ShieldCheck className="h-5 w-5" />
                    {t('challenge.verifyGps')}
                  </Button>
                </div>

                <section className="challenge-editorial__progress">
                  <div>
                    <div>
                      <p>{t('challenge.journeyProgress')}</p>
                      <p>{t('challenge.progressCompletedLine', { completed: summary.completedCount, total: summary.enabledCount })}</p>
                      <p>{t('challenge.progressRemainingLine', { remaining: summary.remainingCount })}</p>
                    </div>
                    <p>{progressPercent}%</p>
                  </div>
                  <div className="challenge-editorial__progress-track">
                    <div style={{ width: String(progressPercent) + '%' }} />
                  </div>
                  <p>{t('challenge.progressBreakdown', { completed: summary.completedCount, skipped: summary.skippedCount, remaining: summary.remainingCount })}</p>
                </section>

                <div className="challenge-editorial__secondary-actions">
                  <Button
                    onClick={() => { void startGame(); }}
                    disabled={isMutating}
                    variant="secondary"
                    className="w-full border border-[rgba(91,67,38,0.14)] bg-[rgba(247,242,231,0.86)]"
                  >
                    <RotateCcw className="h-5 w-5" />
                    {isScopedCompleted ? scopeCompletionPrimaryLabel : t('challenge.newGame')}
                  </Button>
                  {!isScopedCompleted ? (
                    <Button
                      onClick={() => { void startNextChallenge(); }}
                      disabled={canComplete || isMutating || eligibleTasks.length === 0}
                      variant="secondary"
                      className="w-full border border-[rgba(61,84,52,0.14)] bg-[rgba(255,255,255,0.68)]"
                    >
                      <Trophy className="h-5 w-5" />
                      {t('challenge.next')}
                    </Button>
                  ) : null}
                  <Button
                    onClick={() => { void skipChallenge(); }}
                    disabled={!canComplete || isMutating}
                    variant="secondary"
                    className="w-full"
                  >
                    <XCircle className="h-5 w-5" />
                    {t('challenge.skip')}
                  </Button>
                  <Button
                    onClick={() => { void failChallenge(); }}
                    disabled={!canComplete || isMutating}
                    variant="secondary"
                    className="w-full text-[var(--brocade-red)]"
                  >
                    <Flag className="h-5 w-5" />
                    {t('challenge.fail')}
                  </Button>
                </div>
              </aside>
            </div>

            {taskLocationIntro ? (
              <details className="challenge-editorial__details">
                <summary>
                  <span>{t('challenge.locationIntroLabel')}</span>
                  <ChevronDown aria-hidden="true" />
                </summary>
                <div>
                  <p>{taskLocationIntro}</p>
                </div>
              </details>
            ) : null}
          </div>
        </div>
      </Card>
    </ExploreAtlas>
  );
};
