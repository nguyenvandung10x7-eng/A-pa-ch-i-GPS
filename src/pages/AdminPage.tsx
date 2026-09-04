import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { isLevelOneTaskId } from '../services/challengeLevels';
import { createEmptyTask, resetTasks } from '../services/tasks';
import type { ChallengeTask } from '../types/task';

type AdminPageProps = { tasks: ChallengeTask[]; setTasks: (tasks: ChallengeTask[]) => void; t: (key: string) => string };
type TextField = 'category' | 'difficulty' | 'image';
type NumberField = 'points';
type GpsField = 'lat' | 'lng' | 'radius';
type IntroField = 'vi' | 'en';

export const AdminPage = ({ tasks, setTasks, t }: AdminPageProps) => {
  const enabledLevelOneTaskCount = tasks.filter((task) => task.enabled && isLevelOneTaskId(task.id)).length;
  const updateTask = (id: string, patch: Partial<ChallengeTask>) => setTasks(tasks.map((task) => task.id === id ? { ...task, ...patch } : task));
  const updateText = (id: string, field: TextField, value: string) => updateTask(id, { [field]: value });
  const updateNumber = (id: string, field: NumberField, value: number) => updateTask(id, { [field]: value });
  const updateGps = (id: string, task: ChallengeTask, field: GpsField, value: number) => updateTask(id, { gps: { ...task.gps, [field]: value } });
  const updateLocationIntro = (id: string, task: ChallengeTask, field: IntroField, value: string) => updateTask(id, {
    locationIntro: {
      ...(task.locationIntro ?? { vi: '', en: '' }),
      [field]: value,
    },
  });
  const updateExperienceNote = (id: string, task: ChallengeTask, field: IntroField, value: string) => updateTask(id, {
    experienceNote: {
      ...(task.experienceNote ?? { vi: '', en: '' }),
      [field]: value,
    },
  });
  const updateAdditionalImages = (id: string, value: string) => {
    const images = value
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    updateTask(id, { images: images.length > 0 ? images : undefined });
  };
  const updateAdditionalImagesDraft = (id: string, value: string) => updateTask(id, { images: value.split(/\r?\n/) });
  const addTask = () => setTasks([createEmptyTask(), ...tasks]);
  const deleteTask = (id: string) => setTasks(tasks.filter((task) => task.id !== id));
  const restoreDefaults = () => setTasks(resetTasks());
  const exportTasks = () => {
    const blob = new Blob([JSON.stringify(tasks, null, 2)], { type: 'application/json;charset=utf-8' });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = 'admin-tasks-export.json';
    link.click();
    URL.revokeObjectURL(downloadUrl);
  };

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
    <div>
      <p className="section-kicker">{t('admin.title')}</p>
      <h1 className="mt-2 text-3xl font-black text-[var(--forest-950)]">{t('admin.title')}</h1>
    </div>
    <div className="flex flex-wrap gap-2"><Button onClick={addTask}>{t('admin.add')}</Button><Button onClick={exportTasks} variant="secondary">{t('admin.export')}</Button><Button onClick={restoreDefaults} variant="secondary">{t('admin.reset')}</Button></div>
      </div>
      <div className="mt-6 grid gap-5">
        {tasks.map((task) => {
          const isLastEnabledLevelOneTask = task.enabled && isLevelOneTaskId(task.id) && enabledLevelOneTaskCount === 1;

          return (
      <article key={task.id} className="grid gap-3 rounded-[1.8rem] bg-[rgba(255,255,255,0.58)] p-4 ring-1 ring-[rgba(61,84,52,0.12)] md:grid-cols-4">
      <label className="text-sm font-semibold text-[var(--forest-900)]">{t('admin.titleVi')}<input value={task.title.vi} onChange={(event) => updateTask(task.id, { title: { ...task.title, vi: event.target.value } })} className="mt-1 w-full rounded-[1.1rem] border border-[rgba(61,84,52,0.14)] bg-[rgba(255,249,236,0.82)] p-3 text-[var(--forest-950)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(220,179,85,0.22)]" /></label>
      <label className="text-sm font-semibold text-[var(--forest-900)]">{t('admin.titleEn')}<input value={task.title.en} onChange={(event) => updateTask(task.id, { title: { ...task.title, en: event.target.value } })} className="mt-1 w-full rounded-[1.1rem] border border-[rgba(61,84,52,0.14)] bg-[rgba(255,249,236,0.82)] p-3 text-[var(--forest-950)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(220,179,85,0.22)]" /></label>
      <label className="text-sm font-semibold text-[var(--forest-900)]">{t('admin.category')}<input value={task.category} onChange={(event) => updateText(task.id, 'category', event.target.value)} className="mt-1 w-full rounded-[1.1rem] border border-[rgba(61,84,52,0.14)] bg-[rgba(255,249,236,0.82)] p-3 text-[var(--forest-950)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(220,179,85,0.22)]" /></label>
      <label className="text-sm font-semibold text-[var(--forest-900)]">{t('admin.difficulty')}<input value={task.difficulty} onChange={(event) => updateText(task.id, 'difficulty', event.target.value)} className="mt-1 w-full rounded-[1.1rem] border border-[rgba(61,84,52,0.14)] bg-[rgba(255,249,236,0.82)] p-3 text-[var(--forest-950)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(220,179,85,0.22)]" /></label>
      <label className="text-sm font-semibold text-[var(--forest-900)] md:col-span-2">{t('admin.descriptionVi')}<textarea value={task.description.vi} onChange={(event) => updateTask(task.id, { description: { ...task.description, vi: event.target.value } })} className="mt-1 w-full rounded-[1.1rem] border border-[rgba(61,84,52,0.14)] bg-[rgba(255,249,236,0.82)] p-3 text-[var(--forest-950)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(220,179,85,0.22)]" /></label>
      <label className="text-sm font-semibold text-[var(--forest-900)] md:col-span-2">{t('admin.descriptionEn')}<textarea value={task.description.en} onChange={(event) => updateTask(task.id, { description: { ...task.description, en: event.target.value } })} className="mt-1 w-full rounded-[1.1rem] border border-[rgba(61,84,52,0.14)] bg-[rgba(255,249,236,0.82)] p-3 text-[var(--forest-950)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(220,179,85,0.22)]" /></label>
      <label className="text-sm font-semibold text-[var(--forest-900)] md:col-span-2">{t('admin.locationIntroVi')}<textarea value={task.locationIntro?.vi ?? ''} onChange={(event) => updateLocationIntro(task.id, task, 'vi', event.target.value)} className="mt-1 w-full rounded-[1.1rem] border border-[rgba(61,84,52,0.14)] bg-[rgba(255,249,236,0.82)] p-3 text-[var(--forest-950)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(220,179,85,0.22)]" /></label>
      <label className="text-sm font-semibold text-[var(--forest-900)] md:col-span-2">{t('admin.locationIntroEn')}<textarea value={task.locationIntro?.en ?? ''} onChange={(event) => updateLocationIntro(task.id, task, 'en', event.target.value)} className="mt-1 w-full rounded-[1.1rem] border border-[rgba(61,84,52,0.14)] bg-[rgba(255,249,236,0.82)] p-3 text-[var(--forest-950)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(220,179,85,0.22)]" /></label>
      <label className="text-sm font-semibold text-[var(--forest-900)] md:col-span-2">{t('admin.experienceNoteVi')}<textarea value={task.experienceNote?.vi ?? ''} onChange={(event) => updateExperienceNote(task.id, task, 'vi', event.target.value)} className="mt-1 w-full rounded-[1.1rem] border border-[rgba(61,84,52,0.14)] bg-[rgba(255,249,236,0.82)] p-3 text-[var(--forest-950)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(220,179,85,0.22)]" /></label>
      <label className="text-sm font-semibold text-[var(--forest-900)] md:col-span-2">{t('admin.experienceNoteEn')}<textarea value={task.experienceNote?.en ?? ''} onChange={(event) => updateExperienceNote(task.id, task, 'en', event.target.value)} className="mt-1 w-full rounded-[1.1rem] border border-[rgba(61,84,52,0.14)] bg-[rgba(255,249,236,0.82)] p-3 text-[var(--forest-950)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(220,179,85,0.22)]" /></label>
      <label className="text-sm font-semibold text-[var(--forest-900)]">{t('admin.points')}<input type="number" value={task.points} onChange={(event) => updateNumber(task.id, 'points', Number(event.target.value))} className="mt-1 w-full rounded-[1.1rem] border border-[rgba(61,84,52,0.14)] bg-[rgba(255,249,236,0.82)] p-3 text-[var(--forest-950)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(220,179,85,0.22)]" /></label>
      <label className="text-sm font-semibold text-[var(--forest-900)]">{t('admin.latitude')}<input type="number" value={task.gps.lat} onChange={(event) => updateGps(task.id, task, 'lat', Number(event.target.value))} className="mt-1 w-full rounded-[1.1rem] border border-[rgba(61,84,52,0.14)] bg-[rgba(255,249,236,0.82)] p-3 text-[var(--forest-950)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(220,179,85,0.22)]" /></label>
      <label className="text-sm font-semibold text-[var(--forest-900)]">{t('admin.longitude')}<input type="number" value={task.gps.lng} onChange={(event) => updateGps(task.id, task, 'lng', Number(event.target.value))} className="mt-1 w-full rounded-[1.1rem] border border-[rgba(61,84,52,0.14)] bg-[rgba(255,249,236,0.82)] p-3 text-[var(--forest-950)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(220,179,85,0.22)]" /></label>
      <label className="text-sm font-semibold text-[var(--forest-900)]">{t('admin.radius')}<input type="number" value={task.gps.radius} onChange={(event) => updateGps(task.id, task, 'radius', Number(event.target.value))} className="mt-1 w-full rounded-[1.1rem] border border-[rgba(61,84,52,0.14)] bg-[rgba(255,249,236,0.82)] p-3 text-[var(--forest-950)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(220,179,85,0.22)]" /></label>
      <label className="text-sm font-semibold text-[var(--forest-900)] md:col-span-2">{t('admin.image')}<input value={task.image} onChange={(event) => updateText(task.id, 'image', event.target.value)} className="mt-1 w-full rounded-[1.1rem] border border-[rgba(61,84,52,0.14)] bg-[rgba(255,249,236,0.82)] p-3 text-[var(--forest-950)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(220,179,85,0.22)]" /></label>
      <label className="text-sm font-semibold text-[var(--forest-900)] md:col-span-2">{t('admin.additionalImages')}<textarea value={(task.images ?? []).join('\n')} onChange={(event) => updateAdditionalImagesDraft(task.id, event.target.value)} onBlur={(event) => updateAdditionalImages(task.id, event.target.value)} className="mt-1 min-h-[8rem] w-full rounded-[1.1rem] border border-[rgba(61,84,52,0.14)] bg-[rgba(255,249,236,0.82)] p-3 text-[var(--forest-950)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(220,179,85,0.22)]" placeholder={t('admin.additionalImagesHint')} /></label>
            <div className="flex items-end gap-2 md:col-span-2"><Button onClick={() => updateTask(task.id, { enabled: !task.enabled })} disabled={isLastEnabledLevelOneTask} variant="secondary">{task.enabled ? t('admin.enabled') : t('admin.disabled')}</Button><Button onClick={() => deleteTask(task.id)} disabled={isLastEnabledLevelOneTask} variant="danger">{t('admin.delete')}</Button></div>
          </article>
          );
        })}
      </div>
    </Card>
  );
};
