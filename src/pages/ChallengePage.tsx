import { useMemo, useState } from 'react';
import { CheckCircle2, RotateCcw, ShieldCheck, SkipForward, Trophy } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { TaskMap } from '../components/TaskMap';
import {
  assignRandomChallenge,
  completeActiveChallenge,
  createNewGame,
  getProgressSummary,
  loadOrCreateProgress,
  skipActiveChallenge,
} from '../services/gameplay';
import { localize } from '../services/i18n';
import type { ChallengeTask, LanguageCode } from '../types/task';
import { getCurrentPosition } from '../utils/geo';

const findRunTask = (tasks: ChallengeTask[], taskId?: string) => tasks.find((task) => task.id === taskId);

export const ChallengePage = ({ tasks, language, t }: { tasks: ChallengeTask[]; language: LanguageCode; t: (key: string, values?: Record<string, string | number>) => string }) => {
  const activeTasks = useMemo(() => tasks.filter((task) => task.enabled), [tasks]);
  const [progress, setProgress] = useState(loadOrCreateProgress);
  const [message, setMessage] = useState(() => t('challenge.ready'));
  const [isVerifying, setIsVerifying] = useState(false);
  // Keep an already-assigned challenge playable even if an admin disables it
  // after the assignment was persisted.
  const task = findRunTask(tasks, progress.activeRun?.taskId);
  const summary = getProgressSummary(activeTasks, progress);
  const canPlay = activeTasks.length > 0 || Boolean(task);
  const canComplete = Boolean(task && progress.activeRun?.status === 'active');
  const isFinished = summary.enabledCount > 0 && summary.remainingCount === 0 && !canComplete;

  const startGame = () => {
    const next = createNewGame();
    setProgress(next);
    setMessage(t('challenge.newGameStarted'));
  };

  const startNextChallenge = () => {
    const next = assignRandomChallenge(activeTasks, progress.status === 'completed' && summary.remainingCount === 0 ? createNewGame() : progress);
    setProgress(next);
    setMessage(next.activeRun?.status === 'active' ? t('challenge.active') : t('challenge.allDone'));
  };

  const verifyGps = async () => {
    if (!task) return;

    if (!navigator.geolocation) {
      setMessage(t('challenge.gpsUnsupported'));
      return;
    }

    setIsVerifying(true);
    setMessage(t('challenge.gpsLoading'));
    try {
      const position = await getCurrentPosition();
      const result = completeActiveChallenge(
        progress,
        task,
        { lat: position.coords.latitude, lng: position.coords.longitude },
        position.coords.accuracy,
      );
      setProgress(result.progress);

      if (result.duplicate) {
        setMessage(t('challenge.duplicate'));
        return;
      }

      if (!result.completed && result.gps?.status === 'low-accuracy') {
        setMessage(t('challenge.gpsLowAccuracy', { accuracy: result.gps.accuracy, required: result.gps.requiredAccuracy }));
        return;
      }

      if (!result.completed && result.gps?.status === 'outside-radius') {
        setMessage(t('challenge.tooFar', { meters: result.gps.meters, radius: result.gps.radius }));
        return;
      }

      if (result.completed) {
        setMessage(t('challenge.completed', { title: localize(task.title, language), meters: result.gps.meters, points: task.points }));
      }
    } catch (error) {
      const code = typeof error === 'object' && error !== null && 'code' in error ? Number(error.code) : 0;
      setMessage(t(code === 1 ? 'challenge.gpsPermissionDenied' : 'challenge.gpsUnavailable'));
    } finally {
      setIsVerifying(false);
    }
  };

  const skipChallenge = () => {
    if (!window.confirm(t('challenge.skipConfirm'))) return;
    const next = skipActiveChallenge(progress);
    setProgress(next);
    setMessage(t('challenge.skipped'));
  };

  if (!canPlay) return <Card><p className="text-slate-200">{t('challenge.empty')}</p></Card>;

  return (
    <div className="grid gap-6 lg:grid-cols-[.95fr_1.05fr]">
      <Card>
        <div className="overflow-hidden rounded-[1.5rem] bg-slate-950/30">
          {task?.image && <img src={task.image} alt={localize(task.title, language)} className="h-56 w-full object-cover" />}
          <div className="p-5">
            <p className="text-cyan-200">{t('challenge.title')}</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <div className="rounded-3xl bg-cyan-300 px-5 py-3 text-center text-slate-950"><p className="text-xs font-bold">{t('challenge.score')}</p><p className="text-3xl font-black">{summary.score}</p></div>
              <div className="rounded-3xl bg-white/10 px-5 py-3 text-center"><p className="text-xs font-bold text-slate-300">{t('challenge.progress')}</p><p className="text-3xl font-black">{summary.completedCount}/{summary.enabledCount}</p></div>
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
            <div className="mt-5 flex flex-col gap-3">
              <div className="flex flex-wrap gap-3">
                <Button onClick={startGame} variant="secondary"><RotateCcw className="mr-2 inline h-5 w-5" />{t('challenge.newGame')}</Button>
                <Button onClick={startNextChallenge} disabled={canComplete}><Trophy className="mr-2 inline h-5 w-5" />{t('challenge.next')}</Button>
                <Button onClick={verifyGps} disabled={!canComplete || isVerifying}><ShieldCheck className="mr-2 inline h-5 w-5" />{isVerifying ? t('challenge.gpsLoading') : t('challenge.verifyGps')}</Button>
                <Button onClick={skipChallenge} disabled={!canComplete || isVerifying} variant="secondary"><SkipForward className="mr-2 inline h-5 w-5" />{t('challenge.skip')}</Button>
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
