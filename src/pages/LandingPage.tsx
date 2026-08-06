import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { History, Languages, ListChecks, Sparkles, Trophy } from 'lucide-react';
import { Card } from '../components/Card';
import { supportedLanguages } from '../i18n';
import { loadHistory } from '../services/history';
import type { ChallengeTask } from '../types/task';

const Stat = ({ icon: Icon, label, value }: { icon: typeof Trophy; label: string; value: string }) => (
  <Card className="p-5">
    <div className="flex items-center justify-between gap-3">
    <div className="min-w-0">
      <p className="section-kicker">{label}</p>
      <p className="mt-3 text-3xl font-black text-[var(--forest-950)] sm:text-4xl">{value}</p>
    </div>
    <div className="wood-panel flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.2rem] text-[var(--earth-800)]">
      <Icon className="h-5 w-5" />
    </div>
    </div>
  </Card>
);

export const LandingPage = ({ tasks, clearVersion, t }: { tasks: ChallengeTask[]; clearVersion: number; t: (key: string) => string }) => {
  const history = useMemo(() => {
    void clearVersion;
    return loadHistory();
  }, [clearVersion]);
  const best = Math.max(0, ...history.map((item) => item.score));
  return (
  <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(20rem,.9fr)] xl:items-start">
    <section className="wood-panel textile-border relative overflow-hidden rounded-[2.3rem] px-5 py-8 shadow-[0_28px_54px_rgba(39,52,31,0.14)] sm:px-8 sm:py-10 lg:px-10 lg:py-12">
    <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.35),transparent_52%),linear-gradient(180deg,transparent,rgba(36,55,31,0.16))]" aria-hidden="true" />
    <div className="relative z-10 max-w-4xl">
      <p className="inline-flex items-center gap-2 rounded-full bg-[rgba(255,248,233,0.7)] px-4 py-2 text-sm font-black text-[var(--earth-900)] ring-1 ring-[rgba(91,67,38,0.12)]">
      <Sparkles className="h-4 w-4" />
      {t('landing.badge')}
      </p>
      <h1 className="mt-5 max-w-4xl text-4xl font-black leading-[1.02] text-[var(--forest-950)] sm:text-6xl lg:text-7xl">
      {t('landing.title')}
      </h1>
      <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--forest-800)] sm:text-lg">
      {t('landing.description')}
      </p>
      <p className="mt-5 max-w-2xl rounded-[1.4rem] border border-[rgba(112,79,39,0.16)] bg-[rgba(255,247,229,0.72)] px-4 py-3 text-sm leading-6 text-[var(--earth-900)]">
      {t('landing.pilotDisclaimer')}
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
      <Link
        to="/experiences"
        className="wood-panel inline-flex min-h-[3.2rem] items-center justify-center rounded-full px-6 py-3 text-[1.08rem] font-black text-[var(--earth-900)] shadow-[0_16px_28px_rgba(104,76,41,0.18)] transition hover:-translate-y-px"
      >
        {t('landing.start')}
      </Link>
      <Link to="/admin" className="inline-flex min-h-[3.2rem] items-center justify-center rounded-full bg-[rgba(229,223,210,0.8)] px-6 py-3 text-[1.02rem] font-bold text-[var(--forest-900)] ring-1 ring-[rgba(61,84,52,0.16)] transition hover:bg-[rgba(236,231,219,0.9)]">
        {t('landing.admin')}
      </Link>
      </div>

      <a
        href="https://www.facebook.com/db1954tour"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 flex w-full max-w-2xl items-start gap-3 rounded-[1.45rem] bg-[rgba(232,225,211,0.88)] px-4 py-3 ring-1 ring-[rgba(61,84,52,0.15)] transition hover:bg-[rgba(239,234,223,0.95)]"
      >
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[rgba(24,119,242,0.2)] text-[#1877f2] ring-1 ring-[rgba(24,119,242,0.3)]" aria-hidden="true">
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" focusable="false" aria-hidden="true">
            <path d="M13.5 22v-8.2h2.8l.4-3.2h-3.2V8.6c0-.9.3-1.5 1.6-1.5h1.7V4.2c-.8-.1-1.6-.2-2.4-.2-2.4 0-4 1.5-4 4.1v2.3H8v3.2h2.4V22h3.1Z" />
          </svg>
        </span>
        <span className="min-w-0">
          <span className="block text-[1.01rem] font-black text-[var(--forest-950)]">{t('landing.facebook.title')}</span>
          <span className="mt-1 block text-sm leading-6 text-[var(--forest-800)]">{t('landing.facebook.description')}</span>
        </span>
      </a>
    </div>
    </section>

    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
    <Stat icon={Trophy} label={t('landing.bestScore')} value={String(best)} />
    <Stat icon={History} label={t('landing.savedRuns')} value={String(history.length)} />
    <Stat icon={ListChecks} label={t('landing.enabledTasks')} value={String(tasks.filter((task) => task.enabled).length)} />
    <Stat icon={Languages} label={t('landing.languages')} value={String(supportedLanguages.length)} />
    </section>
  </div>
  );
};
