import { useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, Flag, Headphones, RotateCcw, ShieldCheck, Trophy, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { TaskMap } from '../components/TaskMap';
import {
  assignRandomChallenge,
  completeActiveChallenge,
  createNewGameWithChallenge,
  failActiveChallenge,
  getProgressSummary,
  loadOrCreateProgress,
  skipActiveChallenge,
} from '../services/gameplay';
import { ChallengeStorageLockUnavailableError } from '../services/challengeStorageLock';
import { localize } from '../services/i18n';
import type { ChallengeTask, LanguageCode } from '../types/task';
import { GeolocationRequestError, getCurrentPosition } from '../utils/geo';

const findRunTask = (tasks: ChallengeTask[], taskId?: string) => tasks.find((task) => task.id === taskId);

type GpsStatus = 'idle' | 'requestingPermission' | 'locating' | 'permissionDenied' | 'unavailable' | 'inaccurateLocation' | 'outsideTargetRadius' | 'verified';
const GAMEPLAY_MUSIC_ACTION_EVENT = 'gps:challenge-music-action';
const GAMEPLAY_MUSIC_PREPARE_EVENT = 'gps:challenge-music-prepare';
const GAMEPLAY_MUSIC_ADVANCE_EVENT = 'gps:challenge-task-received';
const GAMEPLAY_MUSIC_CANCEL_EVENT = 'gps:challenge-music-cancel';
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
  const activeTasks = useMemo(() => tasks.filter((task) => task.enabled), [tasks]);
  const [progress, setProgress] = useState(() => loadOrCreateProgress(activeTasks));
  const [message, setMessage] = useState(() => t('challenge.ready'));
  const [gpsStatus, setGpsStatus] = useState<GpsStatus>('idle');
  const [isMutating, setIsMutating] = useState(false);
  const [failedTaskImageKey, setFailedTaskImageKey] = useState<string | null>(null);
  const [completionPanelRunId, setCompletionPanelRunId] = useState<string | null>(null);
  const previousResetStateRef = useRef<{ activeTasks: ChallengeTask[]; clearVersion: number } | null>(null);
  const task = findRunTask(activeTasks, progress.activeRun?.taskId);
  const summary = getProgressSummary(activeTasks, progress);
  const canPlay = activeTasks.length > 0;
  const canComplete = Boolean(task && progress.activeRun?.status === 'active');
  const isFinished = summary.enabledCount > 0 && summary.remainingCount === 0 && !canComplete;

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

  const currentTaskImageKey = task?.image ? `${task.id}:${task.image}` : null;

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

    window.dispatchEvent(new CustomEvent<'next'>(GAMEPLAY_MUSIC_ACTION_EVENT, { detail: 'next' }));

    await runMutation(async () => {
      try {
        const result = await createNewGameWithChallenge(activeTasks, progress);
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
    const shouldStartNewGame = progress.status === 'completed' && summary.remainingCount === 0;

    window.dispatchEvent(new CustomEvent(GAMEPLAY_MUSIC_PREPARE_EVENT));

    await runMutation(async () => {
      try {
        const result = shouldStartNewGame
          ? await createNewGameWithChallenge(activeTasks, progress)
          : await assignRandomChallenge(activeTasks, progress);
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
        const result = await skipActiveChallenge(activeTasks, progress);
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
        const failedResult = await failActiveChallenge(activeTasks, progress);
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

  return (
  <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(20rem,1.02fr)]">
    <Card className="overflow-visible p-0">
    <div className="overflow-hidden rounded-[1.9rem]">
      {task?.image && failedTaskImageKey !== currentTaskImageKey ? (
      <div className="relative h-56 sm:h-64">
        <img
          src={task.image}
          alt={localize(task.title, language)}
          className="h-full w-full object-cover"
          onError={() => setFailedTaskImageKey(currentTaskImageKey)}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,20,11,0.02),rgba(14,26,16,0.6))]" />
      </div>
      ) : (
      <div className="relative h-48 bg-[linear-gradient(180deg,rgba(181,206,194,0.6),rgba(56,84,53,0.82))]">
        <p className="absolute inset-x-4 top-4 rounded-[0.9rem] bg-[rgba(255,255,255,0.42)] px-3 py-2 text-xs font-semibold text-[var(--forest-900)]">
          {t('challenge.imageUnavailable')}
        </p>
        <div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,transparent,rgba(20,34,18,0.42))]" />
      </div>
      )}

      <div className="p-5 sm:p-6">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="wood-panel rounded-[1.5rem] px-4 py-3 text-center text-[var(--earth-900)]">
        <p className="text-xs font-bold uppercase tracking-[0.18em]">{t('challenge.total')}</p>
        <p className="mt-2 text-3xl font-black">{summary.enabledCount}</p>
        </div>
        <div className="rounded-[1.5rem] bg-[rgba(255,255,255,0.52)] px-4 py-3 text-center ring-1 ring-[rgba(61,84,52,0.12)]">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--forest-700)]">{t('challenge.completedCount')}</p>
        <p className="mt-2 text-3xl font-black text-[var(--forest-950)]">{summary.completedCount}</p>
        </div>
        <div className="rounded-[1.5rem] bg-[rgba(255,255,255,0.52)] px-4 py-3 text-center ring-1 ring-[rgba(61,84,52,0.12)]">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--forest-700)]">{t('challenge.skippedCount')}</p>
        <p className="mt-2 text-3xl font-black text-[var(--forest-950)]">{summary.skippedCount}</p>
        </div>
        <div className="rounded-[1.5rem] bg-[rgba(255,255,255,0.52)] px-4 py-3 text-center ring-1 ring-[rgba(61,84,52,0.12)]">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--forest-700)]">{t('challenge.remaining')}</p>
        <p className="mt-2 text-3xl font-black text-[var(--forest-950)]">{summary.remainingCount}</p>
        </div>
      </div>

      {task && progress.activeRun ? (
        <div className="mt-6 min-w-0">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-[rgba(255,255,255,0.58)] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-[var(--forest-700)] ring-1 ring-[rgba(61,84,52,0.12)]">{task.category}</span>
          <span className="rounded-full bg-[rgba(255,255,255,0.58)] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-[var(--forest-700)] ring-1 ring-[rgba(61,84,52,0.12)]">{task.difficulty}</span>
          {statusBadge ? <span className="rounded-full bg-[rgba(201,148,62,0.16)] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-[var(--earth-900)] ring-1 ring-[rgba(112,79,39,0.12)]">{statusBadge}</span> : null}
        </div>
        <p className="mt-5 section-kicker">{t('challenge.title')}</p>
        <h1 className="mt-2 break-words text-3xl font-black leading-tight text-[var(--forest-950)] sm:text-[2.4rem]">{localize(task.title, language)}</h1>
        <p className="mt-4 text-base leading-7 text-[var(--forest-800)]">{localize(task.description, language)}</p>
        {taskLocationIntro ? (
          <div className="mt-4 rounded-[1.35rem] bg-[rgba(255,255,255,0.58)] p-4 ring-1 ring-[rgba(61,84,52,0.12)]">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--forest-700)]">{t('challenge.locationIntroLabel')}</p>
            <p className="mt-2 text-sm leading-6 text-[var(--forest-800)]">{taskLocationIntro}</p>
          </div>
        ) : null}
        {taskExternalUrl ? (
          <a
            href={taskExternalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex min-h-[3rem] items-center justify-center rounded-full bg-[rgba(255,255,255,0.68)] px-5 py-3 text-sm font-black text-[var(--forest-900)] ring-1 ring-[rgba(61,84,52,0.14)] transition hover:bg-white"
          >
            {t('challenge.externalAction')}
          </a>
        ) : null}
        <div className="mt-5 flex flex-wrap gap-3 text-sm text-[var(--forest-900)]">
          <div className="rounded-[1.25rem] bg-[rgba(255,247,229,0.68)] px-4 py-3 ring-1 ring-[rgba(112,79,39,0.12)]">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--earth-800)]">{t('challenge.radius')}</p>
          <p className="mt-1 font-black">{task.gps.radius}m</p>
          </div>
          <div className="rounded-[1.25rem] bg-[rgba(255,255,255,0.62)] px-4 py-3 ring-1 ring-[rgba(61,84,52,0.12)]">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--forest-700)]">{t('challenge.score')}</p>
          <p className="mt-1 font-black">{task.points} {t('challenge.points')}</p>
          </div>
        </div>
        </div>
      ) : (
        <div className="mt-6 rounded-[1.6rem] bg-[rgba(255,255,255,0.56)] p-5 ring-1 ring-[rgba(61,84,52,0.12)]">
        <h1 className="text-3xl font-black text-[var(--forest-950)]">{isFinished ? t('challenge.allDone') : t('challenge.pending')}</h1>
        <p className="mt-3 text-[var(--forest-800)]">{t('challenge.pendingDescription')}</p>
        </div>
      )}

      <div className="mt-5 rounded-[1.45rem] border border-[rgba(61,84,52,0.12)] bg-[rgba(234,241,229,0.76)] p-4 text-[var(--forest-900)]">
        {message}
      </div>
      <p className="mt-3 text-sm leading-6 text-[var(--forest-700)]">{gpsStatus !== 'idle' ? `${t('challenge.gpsStatus')}: ${t(`challenge.status.${gpsStatus}`)}` : t('challenge.ready')}</p>
      <p className="mt-3 rounded-[1.35rem] border border-[rgba(112,79,39,0.16)] bg-[rgba(255,247,229,0.72)] p-4 text-sm leading-6 text-[var(--earth-900)]">
        {t('challenge.safetyNotice')}
      </p>

      {completionPanelRunId && (
        <div className="mt-4 rounded-[1.5rem] border border-[rgba(61,84,52,0.14)] bg-[rgba(255,255,255,0.68)] p-4 text-[var(--forest-900)] shadow-[0_16px_30px_rgba(42,52,31,0.08)]">
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

      <p className="mt-6 inline-flex items-start gap-2 rounded-[1.2rem] bg-[rgba(255,255,255,0.54)] px-3 py-2 text-sm text-[var(--forest-800)] ring-1 ring-[rgba(61,84,52,0.12)]">
        <Headphones className="mt-0.5 h-4 w-4 shrink-0" />
        <span>{t('challenge.headphoneRecommendation')}</span>
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Button onClick={() => { void startGame(); }} disabled={isMutating} variant="secondary" className="w-full"><RotateCcw className="h-5 w-5" />{t('challenge.newGame')}</Button>
        <Button onClick={() => { void startNextChallenge(); }} disabled={canComplete || isMutating} className="w-full"><Trophy className="h-5 w-5" />{t('challenge.next')}</Button>
        <Button onClick={() => { void verifyGps(); }} disabled={!canComplete || isMutating} className="w-full"><ShieldCheck className="h-5 w-5" />{t('challenge.verifyGps')}</Button>
        <Button onClick={() => { void skipChallenge(); }} disabled={!canComplete || isMutating} variant="secondary" className="w-full"><XCircle className="h-5 w-5" />{t('challenge.skip')}</Button>
        <Button onClick={() => { void failChallenge(); }} disabled={!canComplete || isMutating} variant="secondary" className="w-full sm:col-span-2"><Flag className="h-5 w-5" />{t('challenge.fail')}</Button>
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-sm text-[var(--forest-700)]">
        {progress.activeRun?.gpsVerified ? <span className="inline-flex items-center gap-2 rounded-full bg-[rgba(234,241,229,0.72)] px-3 py-1.5 ring-1 ring-[rgba(61,84,52,0.12)]"><CheckCircle2 className="h-4 w-4 text-[var(--forest-700)]" />{t('challenge.gpsStatus')}</span> : null}
        {progress.completedTaskIds.includes(task?.id ?? '') ? <span className="inline-flex items-center gap-2 rounded-full bg-[rgba(255,247,229,0.72)] px-3 py-1.5 ring-1 ring-[rgba(112,79,39,0.12)]"><CheckCircle2 className="h-4 w-4 text-[var(--earth-800)]" />{t('challenge.completedStatus')}</span> : null}
      </div>
      </div>
    </div>
    </Card>
    <TaskMap tasks={task ? [task] : activeTasks} language={language} t={t} />
  </div>
  );
};
