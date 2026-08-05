import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/Card';
import { loadHistory } from '../services/history';
import { localize } from '../services/i18n';
import type { LanguageCode } from '../types/task';

const formatTime = (value?: string) => (value ? new Date(value).toLocaleString() : '');

export const HistoryPage = ({ clearVersion, language, t }: { clearVersion: number; language: LanguageCode; t: (key: string) => string }) => {
  const history = useMemo(() => {
    void clearVersion;
    return loadHistory();
  }, [clearVersion]);
  return (
  <Card>
    <p className="section-kicker">{t('history.title')}</p>
    <h1 className="mt-2 text-3xl font-black text-[var(--forest-950)]">{t('history.title')}</h1>
    <div className="mt-6 grid gap-4">
    {history.length === 0 && <p className="rounded-[1.4rem] bg-[rgba(255,255,255,0.54)] px-4 py-5 text-[var(--forest-800)] ring-1 ring-[rgba(61,84,52,0.12)]">{t('history.empty')}</p>}
        {history.map((item) => {
          const statusLabel = item.status === 'completed' ? t('history.completed') : item.status === 'skipped' ? t('history.skipped') : item.status === 'failed' ? t('history.failed') : t('history.active');
          const canSubmitTikTok = item.status === 'completed' && item.gpsVerified && Boolean(item.completedAt);
          return (
      <article key={item.id} className="rounded-[1.75rem] bg-[rgba(255,255,255,0.56)] p-5 ring-1 ring-[rgba(61,84,52,0.12)] shadow-[0_14px_26px_rgba(38,52,31,0.08)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="section-kicker">{statusLabel}</p>
          <h2 className="mt-2 break-words text-xl font-bold text-[var(--forest-950)] sm:text-2xl">{localize(item.title, language)}</h2>
          <p className="mt-3 text-sm leading-6 text-[var(--forest-800)]">
                    {t('history.started')} {formatTime(item.startedAt)}
                    {item.completedAt ? ` • ${t('history.completed')} ${formatTime(item.completedAt)}` : ''}
                    {item.skippedAt ? ` • ${t('history.skipped')} ${formatTime(item.skippedAt)}` : ''}
                    {item.failedAt ? ` • ${t('history.failed')} ${formatTime(item.failedAt)}` : ''}
                  </p>
          <p className="mt-3 inline-flex rounded-full bg-[rgba(255,247,229,0.72)] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-[var(--earth-900)] ring-1 ring-[rgba(112,79,39,0.12)]">{t('history.status')}: {statusLabel}</p>
                </div>
        <div className="flex flex-wrap items-center gap-3">
                  {canSubmitTikTok && (
          <Link to={`/submit-tiktok?runId=${encodeURIComponent(item.id)}`} className="wood-panel inline-flex min-h-[3rem] items-center justify-center rounded-full px-4 py-2 font-black text-[var(--earth-900)] transition hover:-translate-y-px">
                      {t('history.submitTikTok')}
                    </Link>
                  )}
          <div className="rounded-[1.25rem] bg-[rgba(236,242,230,0.86)] px-4 py-3 text-center font-black text-[var(--forest-900)] ring-1 ring-[rgba(61,84,52,0.12)]">
          <p className="text-xs uppercase tracking-[0.18em]">{t('challenge.score')}</p>
                    <p>{item.score}</p>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </Card>
  );
};
