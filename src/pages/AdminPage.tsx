import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { createEmptyTask, resetTasks } from '../services/tasks';
import type { ChallengeTask } from '../types/task';

type AdminPageProps = { tasks: ChallengeTask[]; setTasks: (tasks: ChallengeTask[]) => void; t: (key: string) => string };
type TextField = 'category' | 'difficulty' | 'image';
type NumberField = 'points';
type GpsField = 'lat' | 'lng' | 'radius';

export const AdminPage = ({ tasks, setTasks, t }: AdminPageProps) => {
  const updateTask = (id: string, patch: Partial<ChallengeTask>) => setTasks(tasks.map((task) => task.id === id ? { ...task, ...patch } : task));
  const updateText = (id: string, field: TextField, value: string) => updateTask(id, { [field]: value });
  const updateNumber = (id: string, field: NumberField, value: number) => updateTask(id, { [field]: value });
  const updateGps = (id: string, task: ChallengeTask, field: GpsField, value: number) => updateTask(id, { gps: { ...task.gps, [field]: value } });
  const addTask = () => setTasks([createEmptyTask(), ...tasks]);
  const deleteTask = (id: string) => setTasks(tasks.filter((task) => task.id !== id));
  const restoreDefaults = () => setTasks(resetTasks());

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-black">{t('admin.title')}</h1>
        <div className="flex gap-2"><Button onClick={addTask}>{t('admin.add')}</Button><Button onClick={restoreDefaults} variant="secondary">{t('admin.reset')}</Button></div>
      </div>
      <div className="mt-6 grid gap-5">
        {tasks.map((task) => (
          <article key={task.id} className="grid gap-3 rounded-3xl bg-white/10 p-4 md:grid-cols-4">
            <label className="text-sm text-slate-300">{t('admin.titleVi')}<input value={task.title.vi} onChange={(event) => updateTask(task.id, { title: { ...task.title, vi: event.target.value } })} className="mt-1 w-full rounded-2xl bg-slate-950/60 p-3 text-white" /></label>
            <label className="text-sm text-slate-300">{t('admin.titleEn')}<input value={task.title.en} onChange={(event) => updateTask(task.id, { title: { ...task.title, en: event.target.value } })} className="mt-1 w-full rounded-2xl bg-slate-950/60 p-3 text-white" /></label>
            <label className="text-sm text-slate-300">{t('admin.category')}<input value={task.category} onChange={(event) => updateText(task.id, 'category', event.target.value)} className="mt-1 w-full rounded-2xl bg-slate-950/60 p-3 text-white" /></label>
            <label className="text-sm text-slate-300">{t('admin.difficulty')}<input value={task.difficulty} onChange={(event) => updateText(task.id, 'difficulty', event.target.value)} className="mt-1 w-full rounded-2xl bg-slate-950/60 p-3 text-white" /></label>
            <label className="text-sm text-slate-300 md:col-span-2">{t('admin.descriptionVi')}<textarea value={task.description.vi} onChange={(event) => updateTask(task.id, { description: { ...task.description, vi: event.target.value } })} className="mt-1 w-full rounded-2xl bg-slate-950/60 p-3 text-white" /></label>
            <label className="text-sm text-slate-300 md:col-span-2">{t('admin.descriptionEn')}<textarea value={task.description.en} onChange={(event) => updateTask(task.id, { description: { ...task.description, en: event.target.value } })} className="mt-1 w-full rounded-2xl bg-slate-950/60 p-3 text-white" /></label>
            <label className="text-sm text-slate-300">{t('admin.points')}<input type="number" value={task.points} onChange={(event) => updateNumber(task.id, 'points', Number(event.target.value))} className="mt-1 w-full rounded-2xl bg-slate-950/60 p-3 text-white" /></label>
            <label className="text-sm text-slate-300">{t('admin.latitude')}<input type="number" value={task.gps.lat} onChange={(event) => updateGps(task.id, task, 'lat', Number(event.target.value))} className="mt-1 w-full rounded-2xl bg-slate-950/60 p-3 text-white" /></label>
            <label className="text-sm text-slate-300">{t('admin.longitude')}<input type="number" value={task.gps.lng} onChange={(event) => updateGps(task.id, task, 'lng', Number(event.target.value))} className="mt-1 w-full rounded-2xl bg-slate-950/60 p-3 text-white" /></label>
            <label className="text-sm text-slate-300">{t('admin.radius')}<input type="number" value={task.gps.radius} onChange={(event) => updateGps(task.id, task, 'radius', Number(event.target.value))} className="mt-1 w-full rounded-2xl bg-slate-950/60 p-3 text-white" /></label>
            <label className="text-sm text-slate-300 md:col-span-2">{t('admin.image')}<input value={task.image} onChange={(event) => updateText(task.id, 'image', event.target.value)} className="mt-1 w-full rounded-2xl bg-slate-950/60 p-3 text-white" /></label>
            <div className="flex items-end gap-2 md:col-span-2"><Button onClick={() => updateTask(task.id, { enabled: !task.enabled })} variant="secondary">{task.enabled ? t('admin.enabled') : t('admin.disabled')}</Button><Button onClick={() => deleteTask(task.id)} variant="danger">{t('admin.delete')}</Button></div>
          </article>
        ))}
      </div>
    </Card>
  );
};
