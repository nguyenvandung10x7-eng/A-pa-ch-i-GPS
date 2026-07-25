import { Card } from '../components/Card';
import { loadHistory } from '../services/history';
import { localize } from '../services/i18n';
import type { LanguageCode } from '../types/task';

const formatTime = (value?: string) => (value ? new Date(value).toLocaleString() : '');

export const HistoryPage = ({ language, t }: { language: LanguageCode; t: (key: string) => string }) => {
  const history = loadHistory();
  return (
    <Card>
      <h1 className="text-3xl font-black">{t('history.title')}</h1>
      <div className="mt-6 grid gap-4">
        {history.length === 0 && <p className="text-slate-300">{t('history.empty')}</p>}
        {history.map((item) => {
          const statusLabel = item.status === 'completed' ? t('history.completed') : item.status === 'skipped' ? t('history.skipped') : item.status === 'failed' ? t('history.failed') : t('history.active');
          return (
            <article key={item.id} className="rounded-3xl bg-white/10 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold">{localize(item.title, language)}</h2>
                  <p className="mt-2 text-slate-300">
                    {t('history.started')} {formatTime(item.startedAt)}
                    {item.completedAt ? ` • ${t('history.completed')} ${formatTime(item.completedAt)}` : ''}
                    {item.skippedAt ? ` • ${t('history.skipped')} ${formatTime(item.skippedAt)}` : ''}
                    {item.failedAt ? ` • ${t('history.failed')} ${formatTime(item.failedAt)}` : ''}
                  </p>
                  <p className="mt-3 text-sm uppercase tracking-[0.2em] text-cyan-200">{t('history.status')}: {statusLabel}</p>
                </div>
                <div className="rounded-2xl bg-cyan-300 px-4 py-2 text-center font-black text-slate-950">
                  <p className="text-xs uppercase">{t('challenge.score')}</p>
                  <p>{item.score}</p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </Card>
  );
};
