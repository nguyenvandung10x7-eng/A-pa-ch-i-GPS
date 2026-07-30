import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { History, Languages, ListChecks, Sparkles, Trophy } from 'lucide-react';
import { Card } from '../components/Card';
import { supportedLanguages } from '../i18n';
import { loadHistory } from '../services/history';
import type { ChallengeTask } from '../types/task';

const Stat = ({ icon: Icon, label, value }: { icon: typeof Trophy; label: string; value: string }) => (
  <Card><Icon className="mb-3 text-cyan-200" /><p className="text-sm text-slate-300">{label}</p><p className="text-2xl font-black">{value}</p></Card>
);

export const LandingPage = ({ tasks, clearVersion, t }: { tasks: ChallengeTask[]; clearVersion: number; t: (key: string) => string }) => {
  const history = useMemo(() => {
    void clearVersion;
    return loadHistory();
  }, [clearVersion]);
  const best = Math.max(0, ...history.map((item) => item.score));
  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
      <section className="py-16">
        <p className="mb-4 inline-flex rounded-full bg-cyan-300/15 px-4 py-2 text-cyan-100 ring-1 ring-cyan-200/30"><Sparkles className="mr-2 h-5 w-5" />{t('landing.badge')}</p>
        <h1 className="max-w-4xl text-5xl font-black leading-tight sm:text-7xl">{t('landing.title')}</h1>
        <p className="mt-6 max-w-2xl text-lg text-slate-300">{t('landing.description')}</p>
        <p className="mt-4 max-w-2xl rounded-2xl border border-cyan-300/30 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">
          {t('landing.pilotDisclaimer')}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/challenge" className="rounded-full bg-cyan-300 px-6 py-3 font-black text-slate-950 shadow-xl shadow-cyan-950/30">{t('landing.start')}</Link>
          <Link to="/admin" className="rounded-full glass px-6 py-3 font-bold">{t('landing.admin')}</Link>
        </div>
      </section>
      <section className="grid gap-4 sm:grid-cols-2">
        <Stat icon={Trophy} label={t('landing.bestScore')} value={String(best)} />
        <Stat icon={History} label={t('landing.savedRuns')} value={String(history.length)} />
        <Stat icon={ListChecks} label={t('landing.enabledTasks')} value={String(tasks.filter((task) => task.enabled).length)} />
        <Stat icon={Languages} label={t('landing.languages')} value={String(supportedLanguages.length)} />
      </section>
    </div>
  );
};
