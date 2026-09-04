import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Bike, CheckCircle2, ChevronDown, Compass, Cookie, Film, Headphones, Leaf, MapPin, ShieldCheck } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ChallengeLeaderboardPreview } from '../components/ChallengeLeaderboardPreview';
import { ChallengeLevelOneMenu } from '../components/ChallengeLevelOneMenu';
import { ChallengeLockedExperience } from '../components/ChallengeLockedExperience';
import { ExploreAtlas } from '../components/ExploreAtlas';
import {
  assignRandomChallenge,
  completeActiveChallenge,
  loadOrCreateProgress,
  reassignActiveRunForScope,
} from '../services/gameplay';
import { ChallengeStorageLockUnavailableError } from '../services/challengeStorageLock';
import {
  CHALLENGE_LEVEL_ONE_ACCEPTED_KEY,
  acceptLevelOne,
  getLevelOneTasks,
  getLockedChallengeTasks,
  hasUnlockedAllChallenges,
  isLevelOneTaskId,
  readLevelOneAccepted,
} from '../services/challengeLevels';
import { getEligibleTasksForExperience, getScopedExperienceModeFromSearch } from '../services/experienceFilters';
import {
  GAMEPLAY_MUSIC_ADVANCE_EVENT,
  GAMEPLAY_MUSIC_CANCEL_EVENT,
  GAMEPLAY_MUSIC_PREPARE_EVENT,
} from '../services/gameplayMusicEvents';
import { localize } from '../services/i18n';
import type { ChallengeTask, LanguageCode } from '../types/task';
import { GeolocationRequestError, getCurrentPosition } from '../utils/geo';
import './challenge-levels.css';

const findRunTask = (tasks: ChallengeTask[], taskId?: string) => tasks.find((task) => task.id === taskId);

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

  const enabledCount = enabledTaskIds.size;

  return {
    enabledCount,
    completedCount,
    remainingCount: Math.max(0, enabledCount - completedCount),
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
  const [progress, setProgress] = useState(() => loadOrCreateProgress(activeTasks));
  const [levelOneAccepted, setLevelOneAccepted] = useState(() => readLevelOneAccepted());
  const [showLevelUnlock, setShowLevelUnlock] = useState(false);
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
  const isLevelTwo = hasUnlockedAllChallenges(progress.completedTaskIds);
  const levelOneTasks = useMemo(() => getLevelOneTasks(activeTasks), [activeTasks]);
  const lockedTasks = useMemo(() => getLockedChallengeTasks(activeTasks), [activeTasks]);
  const scopedCatalogTasks = useMemo(
    () => scopedExperienceMode ? getEligibleTasksForExperience(activeTasks, scopedExperienceMode) : activeTasks,
    [activeTasks, scopedExperienceMode],
  );
  const eligibleTasks = useMemo(() => {
    const accessScope = isLevelTwo ? activeTasks : levelOneTasks;
    if (!scopedExperienceMode) return accessScope;
    const accessibleTaskIds = new Set(accessScope.map((candidate) => candidate.id));
    return scopedCatalogTasks.filter((candidate) => accessibleTaskIds.has(candidate.id));
  }, [activeTasks, isLevelTwo, levelOneTasks, scopedCatalogTasks, scopedExperienceMode]);
  const isScopedMode = scopedExperienceMode !== null;
  const isScopedLocked = Boolean(
    isScopedMode
    && !isLevelTwo
    && scopedCatalogTasks.length > 0
    && scopedCatalogTasks.every((candidate) => !isLevelOneTaskId(candidate.id)),
  );
  const task = findRunTask(eligibleTasks, progress.activeRun?.taskId);
  const eligibleTaskIdSet = useMemo(() => new Set(eligibleTasks.map((candidate) => candidate.id)), [eligibleTasks]);
  const summary = useMemo(() => getScopedProgressSummary(eligibleTasks, progress), [eligibleTasks, progress]);
  const canComplete = Boolean(task && progress.activeRun?.status === 'active');
  const canPlay = eligibleTasks.length > 0 || canComplete || isScopedLocked;
  const showLevelOneMenu = canPlay && !isScopedLocked && !isLevelTwo && (!isScopedMode || !levelOneAccepted);
  const showLevelHome = canPlay && (isScopedLocked || showLevelOneMenu);
  const isFinished = summary.enabledCount > 0 && summary.remainingCount === 0 && !canComplete;
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
      setLevelOneAccepted(readLevelOneAccepted());
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

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.storageArea !== window.localStorage) return;
      if (event.key !== CHALLENGE_LEVEL_ONE_ACCEPTED_KEY) return;
      setLevelOneAccepted(event.newValue === '1');
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    if (!showLevelUnlock) return;
    const timeoutId = window.setTimeout(() => setShowLevelUnlock(false), 3600);
    return () => window.clearTimeout(timeoutId);
  }, [showLevelUnlock]);

  useLayoutEffect(() => {
    latestScopeContextRef.current = scopeContext;
  }, [scopeContext]);

  useLayoutEffect(() => {
    document.body.classList.toggle('challenge-level-menu-active', showLevelHome);
    return () => document.body.classList.remove('challenge-level-menu-active');
  }, [showLevelHome]);

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

    if (!scopedExperienceMode || isScopedLocked || eligibleTasks.length === 0) {
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
  }, [activeTasks, eligibleTaskIdSet, eligibleTasks, isScopedLocked, progress, scopedExperienceMode, scopeContext, t]);

  const currentTaskImageKey = task?.image ? `${task.id}:${task.image}` : null;
  const localizedTaskTitle = task ? localize(task.title, language) : '';
  const localizedTaskDescription = task ? localize(task.description, language) : '';
  const { locationName, subtitle: locationSubtitle } = splitTaskHeading(localizedTaskTitle);
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

  const chooseExperience = async (preferredTaskIds: string[]) => {
    if (isMutating) return;

    if (isScopedCompleted) {
      void navigate('/book');
      return;
    }

    const preferredTaskIdSet = new Set(preferredTaskIds);
    const candidates = eligibleTasks.filter((candidate) => (
      preferredTaskIdSet.has(candidate.id)
      && !progress.completedTaskIds.includes(candidate.id)
    ));

    if (candidates.length === 0) {
      setMessage(t('challenge.allDone'));
      return;
    }

    if (progress.activeRun?.status === 'active' && candidates.some((candidate) => candidate.id === progress.activeRun?.taskId)) {
      setDetailsOpen(true);
      return;
    }

    window.dispatchEvent(new CustomEvent(GAMEPLAY_MUSIC_PREPARE_EVENT));

    await runMutation(async () => {
      try {
        const result = progress.activeRun?.status === 'active'
          ? await reassignActiveRunForScope(activeTasks, progress, candidates)
          : await assignRandomChallenge(activeTasks, progress, candidates);
        setProgress(result.progress);
        setGpsStatus('idle');
        if (result.stale) {
          window.dispatchEvent(new CustomEvent(GAMEPLAY_MUSIC_CANCEL_EVENT));
          setMessage(t('challenge.ready'));
          return;
        }

        if (result.progress.activeRun?.status === 'active') {
          window.dispatchEvent(new CustomEvent(GAMEPLAY_MUSIC_ADVANCE_EVENT));
          setCompletionPanelRunId(null);
          setMessage(t('challenge.active'));
          setDetailsOpen(true);
        } else {
          window.dispatchEvent(new CustomEvent(GAMEPLAY_MUSIC_CANCEL_EVENT));
          setMessage(t('challenge.allDone'));
        }
      } catch (error) {
        window.dispatchEvent(new CustomEvent(GAMEPLAY_MUSIC_CANCEL_EVENT));
        if (error instanceof ChallengeStorageLockUnavailableError) {
          setGpsStatus('idle');
          setMessage(t('challenge.status.unavailable'));
          return;
        }
        console.error('Unexpected error while choosing an experience', error);
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

        window.dispatchEvent(new CustomEvent(GAMEPLAY_MUSIC_CANCEL_EVENT));

        setGpsStatus('verified');
        setMessage(t('challenge.arrivalConfirmed', { meters: result.gps?.meters ?? 0 }));
        if (result.completed && isLevelOneTaskId(task.id) && !hasUnlockedAllChallenges(progress.completedTaskIds)) {
          setShowLevelUnlock(true);
        }
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

  if (!canPlay) return <Card><p className="text-emerald-900">{t('challenge.empty')}</p></Card>;

  const handleNavigateToTikTokSubmission = () => {
    if (!completionPanelRunId) return;
    const destination = `/submit-tiktok?runId=${encodeURIComponent(completionPanelRunId)}`;
    setCompletionPanelRunId(null);
    void navigate(destination);
  };

  const leaveCompletedExperience = () => {
    setCompletionPanelRunId(null);
    setDetailsOpen(false);
    if (isScopedMode) void navigate('/book');
  };

  const statusBadge = progress.activeRun?.status === 'active'
    ? t('challenge.invitationOpen')
    : progress.activeRun?.status === 'completed'
      ? t('challenge.completedStatus')
      : '';
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
  const challengeAccent = getChallengeAccent(task);
  const currentTaskCompleted = progress.completedTaskIds.includes(task?.id ?? '');
  const currentTaskGpsVerified = Boolean(progress.activeRun?.gpsVerified);
  const handleAcceptLevelOne = () => {
    try {
      acceptLevelOne();
    } finally {
      setLevelOneAccepted(true);
    }
  };
  const levelHomeContent = isScopedLocked ? (
    <ChallengeLockedExperience language={language} onReturn={() => { void navigate('/challenge'); }} />
  ) : showLevelOneMenu ? (
    <ChallengeLevelOneMenu
      accepted={levelOneAccepted}
      tasks={isScopedMode ? eligibleTasks : levelOneTasks}
      lockedTasks={lockedTasks}
      completedTaskIds={progress.completedTaskIds}
      activeTaskId={task?.id}
      isMutating={isMutating}
      language={language}
      onAccept={handleAcceptLevelOne}
      onChoose={(taskId) => { void chooseExperience([taskId]); }}
    />
  ) : undefined;
  const atlasTasks = eligibleTasks.length > 0 ? eligibleTasks : levelOneTasks;

  return (
    <>
      <ExploreAtlas
        tasks={atlasTasks}
        progressTotal={eligibleTasks.length}
        activeTask={task}
        invitationOpen={canComplete}
        completedCount={summary.completedCount}
        completedTaskIds={progress.completedTaskIds}
        language={language}
        detailsOpen={detailsOpen}
        isMutating={isMutating}
        onOpenDetails={() => setDetailsOpen(true)}
        onCloseDetails={() => setDetailsOpen(false)}
        onChoose={(taskIds) => { void chooseExperience(taskIds); }}
        completionActionLabel={isScopedCompleted ? scopeCompletionPrimaryLabel : undefined}
        onCompletionAction={isScopedCompleted ? () => { void navigate('/book'); } : undefined}
        homeContent={levelHomeContent}
        levelLabel={isLevelTwo ? 'LEVEL 2' : 'LEVEL 1'}
        introAside={isLevelTwo ? <ChallengeLeaderboardPreview language={language} compact /> : undefined}
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
              <p>{t('challenge.fieldLabel')}</p>
              <h1>{locationName}</h1>
              {locationSubtitle ? <p>{locationSubtitle}</p> : null}
            </div>
          </section>

          <div className="challenge-editorial__content">
            {task && progress.activeRun ? (
              <>
                <section className="challenge-editorial__invitation" aria-labelledby="challenge-task-title">
                  <p id="challenge-task-title">{t('challenge.invitationLabel')}</p>
                  {instructionsExpanded ? (
                    <div className="challenge-editorial__prose">
                      {instructionParagraphs.map((paragraph) => (
                        <p key={paragraph} style={{ whiteSpace: 'pre-line' }}>{paragraph}</p>
                      ))}
                    </div>
                  ) : (
                    <div className="challenge-editorial__prose line-clamp-4" style={{ whiteSpace: 'pre-line' }}>
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

                {taskExperienceNote ? (
                  <p className="challenge-editorial__experience">
                    <span>{t('challenge.beforeGoing')}:</span> {taskExperienceNote}
                  </p>
                ) : null}

                {taskExternalUrl && challengeAccent.kind === 'cinematic' ? (
                  <section className="challenge-editorial__temporal-threshold" aria-labelledby="challenge-temporal-threshold-title">
                    <div className="challenge-editorial__temporal-copy">
                      <p id="challenge-temporal-threshold-title">{t('challenge.temporalThreshold.label')}</p>
                      <strong>{t('challenge.temporalThreshold.message')}</strong>
                    </div>
                    <span className="challenge-editorial__temporal-boundary" aria-hidden="true" />
                    <span className="challenge-editorial__temporal-present" aria-hidden="true">{t('challenge.temporalThreshold.present')}</span>
                    <span className="challenge-editorial__temporal-year" aria-hidden="true">1954</span>
                    <a href={taskExternalUrl} target="_blank" rel="noopener noreferrer" className="challenge-editorial__temporal-action">
                      <span>{t('challenge.externalAction')}</span>
                      <ArrowRight aria-hidden="true" />
                    </a>
                  </section>
                ) : taskExternalUrl ? (
                  <a href={taskExternalUrl} target="_blank" rel="noopener noreferrer" className="challenge-editorial__external-action">
                    {t('challenge.externalAction')}
                  </a>
                ) : null}

                {currentTaskCompleted ? (
                  <section className="challenge-editorial__arrival">
                    <span aria-hidden="true"><CheckCircle2 /></span>
                    <div>
                      <strong>{t('challenge.arrivalTitle')}</strong>
                      <p>{t('challenge.arrivalReflection')}</p>
                    </div>
                    <Button type="button" onClick={leaveCompletedExperience} variant="secondary">
                      {isScopedMode ? scopeCompletionPrimaryLabel : t('challenge.backToAtlas')}
                    </Button>
                  </section>
                ) : (
                  <div className="challenge-editorial__primary-action">
                    <Button
                      onClick={() => { void verifyGps(); }}
                      disabled={!canComplete || isMutating}
                      variant="gpsPrimary"
                      className="w-full"
                      style={{ scrollMarginBottom: '7rem' }}
                    >
                      <MapPin className="h-5 w-5" />
                      {gpsStatus === 'requestingPermission' || gpsStatus === 'locating'
                        ? t('challenge.status.locating')
                        : t('challenge.confirmArrival')}
                    </Button>
                  </div>
                )}

                <details className="challenge-editorial__details challenge-editorial__gps-details" open={gpsStatus !== 'idle' && gpsStatus !== 'verified'}>
                  <summary>
                    <span><ShieldCheck aria-hidden="true" />{t('challenge.gpsAndSafety')}</span>
                    <small>{t('challenge.radius')} {task.gps.radius}m</small>
                    <ChevronDown aria-hidden="true" />
                  </summary>
                  <div>
                    <p className="challenge-editorial__status-message" aria-live="polite">{message}</p>
                    <p className="challenge-editorial__gps-line">
                      <ShieldCheck aria-hidden="true" />
                      <span>{gpsStatus !== 'idle' ? t('challenge.status.' + gpsStatus) : t('challenge.arrivalBoundary')}</span>
                    </p>
                    <p className="challenge-editorial__safety">{t('challenge.safetyNotice')}</p>
                    {taskExternalUrl ? (
                      <p className="challenge-editorial__headphone">
                        <Headphones aria-hidden="true" />
                        <span>{t('challenge.headphoneRecommendation')}</span>
                      </p>
                    ) : null}
                  </div>
                </details>

                {taskLocationIntro ? (
                  <details className="challenge-editorial__details">
                    <summary>
                      <span>{t('challenge.locationIntroLabel')}</span>
                      <ChevronDown aria-hidden="true" />
                    </summary>
                    <div><p>{taskLocationIntro}</p></div>
                  </details>
                ) : null}

                {completionPanelRunId ? (
                  <details className="challenge-editorial__details challenge-editorial__share">
                    <summary>
                      <span>{t('challenge.keepMoment')}</span>
                      <ChevronDown aria-hidden="true" />
                    </summary>
                    <div>
                      <p>{t('challenge.completionHandoff.sampleHint')}</p>
                      <div className="challenge-editorial__share-actions">
                        <a href={SAMPLE_TIKTOK_URL} target="_blank" rel="noopener noreferrer">
                          {t('challenge.completionHandoff.sampleAction')}
                        </a>
                        <Button type="button" onClick={handleNavigateToTikTokSubmission} variant="secondary">
                          {t('challenge.completionHandoff.submitAction')}
                        </Button>
                      </div>
                    </div>
                  </details>
                ) : null}
              </>
            ) : (
              <div className="challenge-editorial__pending">
                <h1>{isFinished ? t('challenge.allDone') : t('challenge.choosePlace')}</h1>
                <p>{t('challenge.choosePlaceDescription')}</p>
              </div>
            )}
          </div>
        </div>
      </Card>
      </ExploreAtlas>

      {showLevelUnlock ? (
        <div className="challenge-level-unlocked" role="status" aria-live="polite">
          <strong>LEVEL 2 UNLOCKED</strong>
          <span>{language === 'vi' ? 'Bạn đã chứng minh đủ rồi. Phần còn lại mở hết.' : 'You have proved enough. Everything else is now open.'}</span>
        </div>
      ) : null}
    </>
  );
};
