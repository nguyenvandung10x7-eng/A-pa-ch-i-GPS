import { FormEvent, useMemo, useState } from 'react';
import { CheckCircle2, QrCode, ShieldCheck } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { TaskMap } from '../components/TaskMap';
import { saveRun } from '../services/history';
import { localize } from '../services/i18n';
import type { ChallengeRun, ChallengeTask, LanguageCode } from '../types/task';
import { distanceMeters, getCurrentPosition } from '../utils/geo';

const pickTask = (tasks: ChallengeTask[]) => tasks[Math.floor(Math.random() * tasks.length)];
const qrForTask = (task: ChallengeTask) => `GPS-${task.id.toUpperCase()}`;

export const ChallengePage = ({ tasks, language, t }: { tasks: ChallengeTask[]; language: LanguageCode; t: (key: string, values?: Record<string, string | number>) => string }) => {
  const activeTasks = useMemo(() => tasks.filter((task) => task.enabled), [tasks]);
  const [task, setTask] = useState<ChallengeTask | undefined>(() => pickTask(activeTasks));
  const [message, setMessage] = useState(() => t('challenge.ready'));
  const [run, setRun] = useState<ChallengeRun | undefined>(() => task ? { id: crypto.randomUUID(), taskId: task.id, title: task.title, category: task.category, difficulty: task.difficulty, points: task.points, startedAt: new Date().toISOString(), gpsVerified: false, qrVerified: false, score: 0 } : undefined);

  const randomize = () => {
    const nextTask = pickTask(activeTasks);
    setTask(nextTask);
    setRun(nextTask ? { id: crypto.randomUUID(), taskId: nextTask.id, title: nextTask.title, category: nextTask.category, difficulty: nextTask.difficulty, points: nextTask.points, startedAt: new Date().toISOString(), gpsVerified: false, qrVerified: false, score: 0 } : undefined);
    setMessage(t('challenge.ready'));
  };

  const verifyGps = async () => {
    if (!task || !run) return;
    try {
      const position = await getCurrentPosition();
      const meters = Math.round(distanceMeters({ lat: position.coords.latitude, lng: position.coords.longitude }, task.gps));
      if (meters > task.gps.radius) {
        setMessage(t('challenge.tooFar', { meters, radius: task.gps.radius }));
        return;
      }
      const next = { ...run, gpsVerified: true, score: run.score + (run.gpsVerified ? 0 : task.points) };
      setRun(next);
      saveRun(next);
      setMessage(t('challenge.verified', { title: localize(task.title, language), meters }));
    } catch {
      setMessage(t('challenge.gpsUnavailable'));
    }
  };

  const checkQr = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!task || !run) return;
    const code = String(new FormData(event.currentTarget).get('qr') ?? '').trim();
    if (code !== qrForTask(task)) {
      setMessage(t('challenge.qrRejected'));
      return;
    }
    const next = { ...run, qrVerified: true, score: run.score + (run.qrVerified ? 0 : Math.round(task.points / 2)) };
    setRun(next);
    saveRun(next);
    event.currentTarget.reset();
    setMessage(t('challenge.qrAccepted'));
  };

  const finish = () => { if (run) saveRun({ ...run, completedAt: new Date().toISOString() }); };

  if (!task || !run) return <Card><p className="text-slate-200">{t('challenge.empty')}</p></Card>;

  return (
    <div className="grid gap-6 lg:grid-cols-[.95fr_1.05fr]">
      <Card>
        <div className="overflow-hidden rounded-[1.5rem] bg-slate-950/30">
          {task.image && <img src={task.image} alt={localize(task.title, language)} className="h-56 w-full object-cover" />}
          <div className="p-5">
            <p className="text-cyan-200">{task.category} • {task.difficulty}</p>
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-3xl font-black">{localize(task.title, language)}</h1>
              <div className="rounded-3xl bg-cyan-300 px-5 py-3 text-center text-slate-950"><p className="text-xs font-bold">{t('challenge.score')}</p><p className="text-3xl font-black">{run.score}</p></div>
            </div>
            <p className="mt-3 text-slate-300">{localize(task.description, language)}</p>
            <p className="mt-4 rounded-2xl bg-slate-950/50 p-4 text-cyan-50">{message}</p>
            <p className="mt-3 text-sm text-slate-400">{t('challenge.radius')} {task.gps.radius}m • {task.points} {t('challenge.points')}</p>
            <div className="mt-5 flex flex-col gap-3">
              <Button onClick={verifyGps}><ShieldCheck className="mr-2 inline h-5 w-5" />{t('challenge.verifyGps')}</Button>
              <form onSubmit={checkQr} className="flex gap-2"><input name="qr" placeholder={t('challenge.qrPlaceholder', { code: qrForTask(task) })} className="min-w-0 grow rounded-full border border-white/10 bg-slate-950/60 px-4 py-3 outline-none focus:border-cyan-300" /><Button type="submit" variant="secondary"><QrCode className="mr-2 inline h-5 w-5" />{t('challenge.checkIn')}</Button></form>
              <div className="flex flex-wrap gap-3"><Button onClick={randomize} variant="secondary">{t('challenge.randomize')}</Button><Button onClick={finish}>{t('challenge.finish')}</Button></div>
              <div className="flex gap-3 text-sm text-slate-200">{run.gpsVerified && <span><CheckCircle2 className="inline h-4 w-4 text-emerald-300" /> {t('challenge.gpsStatus')}</span>}{run.qrVerified && <span><CheckCircle2 className="inline h-4 w-4 text-cyan-300" /> {t('challenge.qrStatus')}</span>}</div>
            </div>
          </div>
        </div>
      </Card>
      <TaskMap tasks={[task]} language={language} />
    </div>
  );
};
