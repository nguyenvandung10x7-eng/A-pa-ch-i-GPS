import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { History, Languages, ListChecks, Sparkles, Trophy } from 'lucide-react';
import { Card } from '../components/Card';
import { supportedLanguages } from '../i18n';
import { loadHistory } from '../services/history';
import type { ChallengeTask } from '../types/task';

const Stat = ({ icon: Icon, label, value }: { icon: typeof Trophy; label: string; value: string }) => (
  <Card className="!p-4 sm:!p-4">
    <div className="flex items-center justify-between gap-3">
    <div className="min-w-0">
      <p className="section-kicker text-[0.68rem] text-[var(--forest-700)]">{label}</p>
      <p className="mt-2 text-2xl font-black text-[var(--forest-900)] sm:text-3xl">{value}</p>
    </div>
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[1rem] bg-[rgba(236,229,214,0.62)] text-[var(--earth-700)] ring-1 ring-[rgba(91,67,38,0.1)]">
      <Icon className="h-4 w-4" />
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
  <div className="grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(18rem,.75fr)] xl:items-start xl:gap-6">
    <section className="wood-panel textile-border relative overflow-hidden rounded-[2.3rem] px-5 py-8 shadow-[0_24px_40px_rgba(39,52,31,0.12)] sm:px-8 sm:py-10 lg:px-10 lg:py-12">
    <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.35),transparent_52%),linear-gradient(180deg,transparent,rgba(36,55,31,0.16))]" aria-hidden="true" />
    <div className="relative z-10 max-w-4xl">
      <p className="inline-flex items-center gap-2 rounded-full bg-[rgba(255,248,233,0.7)] px-4 py-2 text-sm font-black text-[var(--earth-900)] ring-1 ring-[rgba(91,67,38,0.12)]">
      <Sparkles className="h-4 w-4" />
      {t('landing.badge')}
      </p>
      <h1 className="mt-5 max-w-4xl text-[2.55rem] font-black leading-[1.01] text-[var(--forest-950)] sm:text-6xl lg:text-7xl">
      {t('landing.title')}
      </h1>
      <p className="mt-4 max-w-xl text-sm leading-6 text-[var(--forest-700)] sm:text-[0.98rem]">
      {t('landing.description')}
      </p>
      <p className="mt-4 max-w-xl rounded-[1.1rem] bg-[rgba(255,247,229,0.42)] px-3 py-2 text-xs leading-5 text-[var(--earth-800)] ring-1 ring-[rgba(112,79,39,0.1)] sm:text-sm">
      {t('landing.pilotDisclaimer')}
      </p>
      <div className="mt-7 flex flex-wrap gap-3">
      <Link
        to="/experiences"
        className="wood-panel inline-flex min-h-[3.25rem] items-center justify-center rounded-full px-7 py-3 text-[1.1rem] font-black text-[var(--earth-900)] shadow-[0_18px_30px_rgba(104,76,41,0.2)] transition hover:-translate-y-px"
      >
        {t('landing.start')}
      </Link>
      <Link to="/admin" className="inline-flex min-h-[3.25rem] items-center justify-center rounded-full bg-[rgba(235,230,220,0.46)] px-5 py-3 text-base font-semibold text-[var(--forest-800)] ring-1 ring-[rgba(61,84,52,0.12)] transition hover:bg-[rgba(239,234,223,0.62)]">
        {t('landing.admin')}
      </Link>
      </div>

      <a
        href="https://www.facebook.com/db1954tour"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 flex w-full max-w-xl items-start gap-3 rounded-[1.25rem] bg-[rgba(232,225,211,0.52)] px-3 py-2.5 ring-1 ring-[rgba(61,84,52,0.1)] transition hover:bg-[rgba(239,234,223,0.7)]"
      >
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgba(24,119,242,0.15)] text-[#1877f2] ring-1 ring-[rgba(24,119,242,0.25)]" aria-hidden="true">
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" focusable="false" aria-hidden="true">
            <path d="M13.5 22v-8.2h2.8l.4-3.2h-3.2V8.6c0-.9.3-1.5 1.6-1.5h1.7V4.2c-.8-.1-1.6-.2-2.4-.2-2.4 0-4 1.5-4 4.1v2.3H8v3.2h2.4V22h3.1Z" />
          </svg>
        </span>
        <span className="min-w-0">
          <span className="block text-[0.96rem] font-bold text-[var(--forest-900)]">{t('landing.facebook.title')}</span>
          <span className="mt-0.5 block text-xs leading-5 text-[var(--forest-700)] sm:text-sm">{t('landing.facebook.description')}</span>
        </span>
      </a>
    </div>
    </section>

    <section className="grid gap-3 sm:grid-cols-2 xl:mt-2 xl:grid-cols-1">
    <Stat icon={Trophy} label={t('landing.bestScore')} value={String(best)} />
    <Stat icon={History} label={t('landing.savedRuns')} value={String(history.length)} />
    <Stat icon={ListChecks} label={t('landing.enabledTasks')} value={String(tasks.filter((task) => task.enabled).length)} />
    <Stat icon={Languages} label={t('landing.languages')} value={String(supportedLanguages.length)} />
    </section>
  </div>
  );
};
