import { useMemo, useState } from 'react';
import { CheckCircle2, Flag, RotateCcw, ShieldCheck, Trophy, XCircle } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { TaskMap } from '../components/TaskMap';
import {
  assignRandomChallenge,
  completeActiveChallenge,
  createNewGame,
  failActiveChallenge,
  getProgressSummary,
  loadOrCreateProgress,
  skipActiveChallenge,
} from '../services/gameplay';
import { localize } from '../services/i18n';
import type { ChallengeTask, LanguageCode } from '../types/task';
import { GeolocationRequestError, getCurrentPosition } from '../utils/geo';

const findRunTask = (tasks: ChallengeTask[], taskId?: string) => tasks.find((task) => task.id === taskId);

type GpsStatus = 'idle' | 'requestingPermission' | 'locating' | 'permissionDenied' | 'unavailable' | 'inaccurateLocation' | 'outsideTargetRadius' | 'verified';

export const ChallengePage = ({ tasks, language, t }: { tasks: ChallengeTask[]; language: LanguageCode; t: (key: string, values?: Record<string, string | number>) => string }) => {
  const activeTasks = useMemo(() => tasks.filter((task) => task.enabled), [tasks]);
  const [progress, setProgress] = useState(() => loadOrCreateProgress(activeTasks));
  const [message, setMessage] = useState(() => t('challenge.ready'));
  const [gpsStatus, setGpsStatus] = useState<GpsStatus>('idle');
  const task = findRunTask(activeTasks, progress.activeRun?.taskId);
  const summary = getProgressSummary(activeTasks, progress);
  const canPlay = activeTasks.length > 0;
  const canComplete = Boolean(task && progress.activeRun?.status === 'active');
  const isFinished = summary.enabledCount > 0 && summary.remainingCount === 0 && !canComplete;

  const startGame = () => {
    const next = assignRandomChallenge(activeTasks, createNewGame());
    setProgress(next);
    setGpsStatus('idle');
    setMessage(next.activeRun?.status === 'active' ? t('challenge.active') : t('challenge.allDone'));
  };

  const startNextChallenge = () => {
    const next = assignRandomChallenge(activeTasks, progress.status === 'completed' && summary.remainingCount === 0 ? createNewGame() : progress);
    setProgress(next);
    setGpsStatus('idle');
    setMessage(next.activeRun?.status === 'active' ? t('challenge.active') : t('challenge.allDone'));
  };

  const verifyGps = async () => {
    if (!task || !canComplete) return;

    setGpsStatus('requestingPermission');
    setMessage(t('challenge.status.requestingPermission'));

    try {
      setGpsStatus('locating');
      setMessage(t('challenge.status.locating'));
      const position = await getCurrentPosition();
      const result = completeActiveChallenge(progress, task, { lat: position.coords.latitude, lng: position.coords.longitude }, position.coords.accuracy);
      setProgress(result.progress);

      if (result.duplicate) {
        setGpsStatus('idle');
        setMessage(t('challenge.duplicate'));
        return;
      }

      if (!result.completed && result.gps) {
        const nextStatus = result.gps.status === 'inaccurateLocation' ? 'inaccurateLocation' : 'outsideTargetRadius';
        setGpsStatus(nextStatus);
        setMessage(result.gps.status === 'inaccurateLocation' ? t('challenge.status.inaccurateLocation') : t('challenge.status.outsideTargetRadius'));
        return;
      }

      const next = assignRandomChallenge(activeTasks, result.progress);
      setProgress(next);
      setGpsStatus('verified');
      setMessage(t('challenge.verified', { title: localize(task.title, language), meters: result.gps?.meters ?? 0 }));
      if (!next.activeRun) {
        setMessage(t('challenge.allDone'));
      }
    } catch (error) {
      if (error instanceof GeolocationRequestError) {
        const nextStatus = error.code === 1 ? 'permissionDenied' : error.code === 2 ? 'unavailable' : 'unavailable';
        setGpsStatus(nextStatus);
        setMessage(error.code === 1 ? t('challenge.status.permissionDenied') : t('challenge.status.unavailable'));
        return;
      }
      setGpsStatus('unavailable');
      setMessage(t('challenge.status.unavailable'));
    }
  };

  const skipChallenge = () => {
    if (!task || !canComplete) return;
    const shouldSkip = window.confirm(t('challenge.confirmSkip'));
    if (!shouldSkip) return;

    const result = skipActiveChallenge(progress);
    if (!result.skipped) {
      setMessage(t('challenge.duplicate'));
      return;
    }

    const next = assignRandomChallenge(activeTasks, result.progress);
    setProgress(next);
    setGpsStatus('idle');
    setMessage(next.activeRun ? t('challenge.skipped') : t('challenge.allDone'));
  };

  const failChallenge = () => {
    const failedProgress = failActiveChallenge(progress);
    const next = assignRandomChallenge(activeTasks, failedProgress);
    setProgress(next);
    setGpsStatus('idle');
    setMessage(next.activeRun ? t('challenge.failed') : t('challenge.allDone'));
  };

  if (!canPlay) return <Card><p className="text-slate-200">{t('challenge.empty')}</p></Card>;

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
            <div className="mt-5 flex flex-col gap-3">
              <div className="flex flex-wrap gap-3">
                <Button onClick={startGame} variant="secondary"><RotateCcw className="mr-2 inline h-5 w-5" />{t('challenge.newGame')}</Button>
                <Button onClick={startNextChallenge} disabled={canComplete}><Trophy className="mr-2 inline h-5 w-5" />{t('challenge.next')}</Button>
                <Button onClick={verifyGps} disabled={!canComplete}><ShieldCheck className="mr-2 inline h-5 w-5" />{t('challenge.verifyGps')}</Button>
                <Button onClick={skipChallenge} disabled={!canComplete} variant="secondary"><XCircle className="mr-2 inline h-5 w-5" />{t('challenge.skip')}</Button>
                <Button onClick={failChallenge} disabled={!canComplete} variant="secondary"><Flag className="mr-2 inline h-5 w-5" />{t('challenge.fail')}</Button>
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
