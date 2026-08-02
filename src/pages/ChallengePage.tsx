import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Flag, RotateCcw, ShieldCheck, Trophy, XCircle } from 'lucide-react';
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
const GAMEPLAY_MUSIC_PREPARE_EVENT = 'gps:challenge-music-prepare';
const GAMEPLAY_MUSIC_ADVANCE_EVENT = 'gps:challenge-task-received';
const GAMEPLAY_MUSIC_CANCEL_EVENT = 'gps:challenge-music-cancel';
const SAMPLE_TIKTOK_URL = 'https://www.tiktok.com/@1954.theater/video/7669351423066295553';

export const ChallengePage = ({ tasks, clearVersion, language, t }: { tasks: ChallengeTask[]; clearVersion: number; language: LanguageCode; t: (key: string, values?: Record<string, string | number>) => string }) => {
  const navigate = useNavigate();
  const activeTasks = useMemo(() => tasks.filter((task) => task.enabled), [tasks]);
  const [progress, setProgress] = useState(() => loadOrCreateProgress(activeTasks));
  const [message, setMessage] = useState(() => t('challenge.ready'));
  const [gpsStatus, setGpsStatus] = useState<GpsStatus>('idle');
  const [isMutating, setIsMutating] = useState(false);
  const [completionPanelRunId, setCompletionPanelRunId] = useState<string | null>(null);
  const task = findRunTask(activeTasks, progress.activeRun?.taskId);
  const summary = getProgressSummary(activeTasks, progress);
  const canPlay = activeTasks.length > 0;
  const canComplete = Boolean(task && progress.activeRun?.status === 'active');
  const isFinished = summary.enabledCount > 0 && summary.remainingCount === 0 && !canComplete;

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setProgress(loadOrCreateProgress(activeTasks));
      setGpsStatus('idle');
      setMessage(t('challenge.ready'));
      setCompletionPanelRunId(null);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [activeTasks, clearVersion, t]);

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
    setCompletionPanelRunId(null);

    window.dispatchEvent(new CustomEvent(GAMEPLAY_MUSIC_PREPARE_EVENT));

    await runMutation(async () => {
      try {
        const result = await createNewGameWithChallenge(activeTasks, progress);
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

        setMessage(result.progress.activeRun?.status === 'active' ? t('challenge.active') : t('challenge.allDone'));
      } catch (error) {
        window.dispatchEvent(new CustomEvent(GAMEPLAY_MUSIC_CANCEL_EVENT));
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
    setCompletionPanelRunId(null);

    window.dispatchEvent(new CustomEvent(GAMEPLAY_MUSIC_PREPARE_EVENT));

    await runMutation(async () => {
      try {
        const result = progress.status === 'completed' && summary.remainingCount === 0
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
          setCompletionPanelRunId(null);
          return;
        }

        if (result.duplicate) {
          window.dispatchEvent(new CustomEvent(GAMEPLAY_MUSIC_CANCEL_EVENT));
          setGpsStatus('idle');
          setMessage(t('challenge.duplicate'));
          setCompletionPanelRunId(null);
          return;
        }

        if (!result.completed && result.gps) {
          window.dispatchEvent(new CustomEvent(GAMEPLAY_MUSIC_CANCEL_EVENT));
          const nextStatus = result.gps.status === 'inaccurateLocation' ? 'inaccurateLocation' : 'outsideTargetRadius';
          setGpsStatus(nextStatus);
          setMessage(result.gps.status === 'inaccurateLocation' ? t('challenge.status.inaccurateLocation') : t('challenge.status.outsideTargetRadius'));
          setCompletionPanelRunId(null);
          return;
        }

        if (result.completed && result.progress.activeRun?.status === 'active') {
          window.dispatchEvent(new CustomEvent(GAMEPLAY_MUSIC_ADVANCE_EVENT));
        } else {
          window.dispatchEvent(new CustomEvent(GAMEPLAY_MUSIC_CANCEL_EVENT));
        }

        setGpsStatus('verified');
        setMessage(t('challenge.verified', { title: localize(task.title, language), meters: result.gps?.meters ?? 0 }));
        setCompletionPanelRunId(result.completed && completedRunId ? completedRunId : null);
        if (!result.progress.activeRun) {
          setMessage(t('challenge.allDone'));
        }
      } catch (error) {
        window.dispatchEvent(new CustomEvent(GAMEPLAY_MUSIC_CANCEL_EVENT));
        if (error instanceof GeolocationRequestError) {
          const nextStatus = error.code === 1 ? 'permissionDenied' : error.code === 2 ? 'unavailable' : 'unavailable';
          setGpsStatus(nextStatus);
          setMessage(error.code === 1 ? t('challenge.status.permissionDenied') : t('challenge.status.unavailable'));
          setCompletionPanelRunId(null);
          return;
        }
        if (error instanceof ChallengeStorageLockUnavailableError) {
          setGpsStatus('idle');
          setMessage(t('challenge.status.unavailable'));
          setCompletionPanelRunId(null);
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
    setCompletionPanelRunId(null);

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
    setCompletionPanelRunId(null);
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

  if (!canPlay) return <Card><p className="text-slate-200">{t('challenge.empty')}</p></Card>;

  const handleDismissCompletionPanel = () => {
    setCompletionPanelRunId(null);
  };

  const handleNavigateToTikTokSubmission = () => {
    if (!completionPanelRunId) return;
    const destination = `/submit-tiktok?runId=${encodeURIComponent(completionPanelRunId)}`;
    setCompletionPanelRunId(null);
    void navigate(destination);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[.95fr_1.05fr]">
      <Card>
        <div className="overflow-hidden rounded-[1.5rem] bg-slate-950/30">
          {task?.image && <img src={task.image} alt={localize(task.title, language)} className="h-56 w-full object-cover" />}
          <div className="p-5">
            <p className="text-cyan-200">{t('challenge.title')}</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-4">
              <div className="rounded-3xl bg-cyan-300 px-5 py-3 text-center text-slate-950"><p className="text-xs font-bold">{t('challenge.total')}</p><p className="text-3xl font-black">{summary.enabledCount}</p></div>
              <div className="rounded-3xl bg-white/10 px-5 py-3 text-center"><p className="text-xs font-bold text-slate-300">{t('challenge.completedCount')}</p><p className="text-3xl font-black">{summary.completedCount}</p></div>
              <div className="rounded-3xl bg-white/10 px-5 py-3 text-center"><p className="text-xs font-bold text-slate-300">{t('challenge.skippedCount')}</p><p className="text-3xl font-black">{summary.skippedCount}</p></div>
              <div className="rounded-3xl bg-white/10 px-5 py-3 text-center"><p className="text-xs font-bold text-slate-300">{t('challenge.remaining')}</p><p className="text-3xl font-black">{summary.remainingCount}</p></div>
            </div>

            {task && progress.activeRun ? (
              <div className="mt-6">
                <p className="text-cyan-200">{task.category} • {task.difficulty} • {progress.activeRun.status}</p>
                <h1 className="mt-2 text-3xl font-black">{localize(task.title, language)}</h1>
                <p className="mt-3 text-slate-300">{localize(task.description, language)}</p>
                <p className="mt-4 text-sm text-slate-400">{t('challenge.radius')} {task.gps.radius}m • {task.points} {t('challenge.points')}</p>
              </div>
            ) : (
              <div className="mt-6 rounded-3xl bg-white/10 p-5">
                <h1 className="text-3xl font-black">{isFinished ? t('challenge.allDone') : t('challenge.pending')}</h1>
                <p className="mt-3 text-slate-300">{t('challenge.pendingDescription')}</p>
              </div>
            )}

            <p className="mt-4 rounded-2xl bg-slate-950/50 p-4 text-cyan-50">{message}</p>
            <p className="mt-2 text-sm text-cyan-200">{gpsStatus !== 'idle' ? `${t('challenge.gpsStatus')}: ${t(`challenge.status.${gpsStatus}`)}` : t('challenge.ready')}</p>
            <p className="mt-3 rounded-2xl border border-amber-300/35 bg-amber-300/10 p-3 text-sm text-amber-100">
              {t('challenge.safetyNotice')}
            </p>
            {completionPanelRunId && (
              <div className="mt-4 rounded-2xl border border-cyan-300/35 bg-cyan-300/10 p-4 text-cyan-50">
                <p className="text-base font-bold text-cyan-100">{t('challenge.completionHandoff.title')}</p>
                <p className="mt-2 text-sm text-cyan-50">{t('challenge.completionHandoff.description')}</p>
                <p className="mt-2 text-sm text-cyan-100">{t('challenge.completionHandoff.sampleHint')}</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <a
                    href={SAMPLE_TIKTOK_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-white/30 px-4 py-2 text-sm font-black text-white transition hover:bg-white/10"
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
            <div className="mt-5 flex flex-col gap-3">
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => { void startGame(); }} disabled={isMutating} variant="secondary"><RotateCcw className="mr-2 inline h-5 w-5" />{t('challenge.newGame')}</Button>
                <Button onClick={() => { void startNextChallenge(); }} disabled={canComplete || isMutating}><Trophy className="mr-2 inline h-5 w-5" />{t('challenge.next')}</Button>
                <Button onClick={() => { void verifyGps(); }} disabled={!canComplete || isMutating}><ShieldCheck className="mr-2 inline h-5 w-5" />{t('challenge.verifyGps')}</Button>
                <Button onClick={() => { void skipChallenge(); }} disabled={!canComplete || isMutating} variant="secondary"><XCircle className="mr-2 inline h-5 w-5" />{t('challenge.skip')}</Button>
                <Button onClick={() => { void failChallenge(); }} disabled={!canComplete || isMutating} variant="secondary"><Flag className="mr-2 inline h-5 w-5" />{t('challenge.fail')}</Button>
              </div>
              <div className="flex gap-3 text-sm text-slate-200">{progress.activeRun?.gpsVerified && <span><CheckCircle2 className="inline h-4 w-4 text-emerald-300" /> {t('challenge.gpsStatus')}</span>}{progress.completedTaskIds.includes(task?.id ?? '') && <span><CheckCircle2 className="inline h-4 w-4 text-cyan-300" /> {t('challenge.completedStatus')}</span>}</div>
            </div>
          </div>
        </div>
      </Card>
      <TaskMap tasks={task ? [task] : activeTasks} language={language} />
    </div>
  );
};
