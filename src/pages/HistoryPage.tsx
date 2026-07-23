import { Card } from '../components/Card';
import { loadHistory } from '../services/history';
import { localize } from '../services/i18n';
import type { LanguageCode } from '../types/task';

export const HistoryPage = ({ language, t }: { language: LanguageCode; t: (key: string) => string }) => {
  const history = loadHistory();
  return (
    <Card>
      <h1 className="text-3xl font-black">{t('history.title')}</h1>
      <div className="mt-6 grid gap-4">
        {history.length === 0 && <p className="text-slate-300">{t('history.empty')}</p>}
        {history.map((item) => (
          <article key={item.id} className="rounded-3xl bg-white/10 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><h2 className="text-xl font-bold">{localize(item.title, language)}</h2><p className="text-slate-300">{t('history.started')} {new Date(item.startedAt).toLocaleString()}{item.completedAt ? ` • ${t('history.finished')} ${new Date(item.completedAt).toLocaleString()}` : ''}</p></div>
              <p className="rounded-2xl bg-cyan-300 px-4 py-2 font-black text-slate-950">{item.score}</p>
            </div>
          </article>
        ))}
      </div>
    </Card>
  );
};
