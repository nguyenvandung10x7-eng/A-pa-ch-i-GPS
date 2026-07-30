import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Loader2, Trophy } from 'lucide-react';
import { Card } from '../components/Card';
import { useAuth } from '../contexts/AuthContext';
import type { LanguageCode } from '../types/task';
import { loadLeaderboardEntries, type LeaderboardEntry, VoteError } from '../services/voting';

const formatDate = (value: string, language: LanguageCode) => new Date(value).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US');

export const LeaderboardPage = ({ language, t }: { language: LanguageCode; t: (key: string) => string }) => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await loadLeaderboardEntries();
        if (!isMounted) return;
        setEntries(data);
      } catch (err) {
        if (!isMounted) return;
        if (err instanceof VoteError) {
          setError(t(err.translationKey));
        } else {
          setError(t('leaderboard.error'));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadData();
    return () => {
      isMounted = false;
    };
  }, [t]);

  const emptyState = useMemo(() => !loading && !error && entries.length === 0, [entries.length, error, loading]);

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-200">{t('leaderboard.heading')}</p>
          <h1 className="text-3xl font-black">{t('leaderboard.title')}</h1>
        </div>
        <div className="rounded-full border border-cyan-300/30 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100">
          {user ? t('leaderboard.authenticated') : t('leaderboard.anonymous')}
        </div>
      </div>

      <p className="mt-4 rounded-2xl border border-amber-300/35 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
        {t('leaderboard.pointsNotice')}
      </p>

      {loading && (
        <div className="mt-6 flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-4 text-slate-200">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>{t('leaderboard.loading')}</span>
        </div>
      )}

      {!loading && error && (
        <div className="mt-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-4 text-rose-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {!loading && !error && emptyState && (
        <div className="mt-6 rounded-2xl bg-white/10 px-4 py-6 text-slate-300">
          <p className="text-lg font-semibold">{t('leaderboard.emptyTitle')}</p>
          <p className="mt-2">{t('leaderboard.emptyDescription')}</p>
        </div>
      )}

      {!loading && !error && !emptyState && (
        <div className="mt-6 space-y-3">
          {entries.map((entry) => (
            <article key={entry.id} className="rounded-[1.5rem] border border-white/10 bg-slate-950/40 p-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-300 font-black text-slate-950">
                    {entry.rank}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-cyan-300" />
                      <p className="font-black text-white">{entry.challengeTitleSnapshot || t('discover.unknownChallenge')}</p>
                    </div>
                    <p className="text-sm text-slate-300">{entry.displayName?.trim() || t('discover.anonymous')}</p>
                    {entry.tiktokUsername ? <p className="text-sm text-cyan-200">@{entry.tiktokUsername}</p> : null}
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 text-sm text-slate-300">
                  <div className="rounded-2xl bg-white/10 px-3 py-2">
                    <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">{t('leaderboard.voteCount')}</p>
                    <p className="font-black text-white">{entry.voteCount}</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 px-3 py-2">
                    <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">{t('leaderboard.submitted')}</p>
                    <p>{formatDate(entry.createdAt, language)}</p>
                  </div>
                  {entry.safeLink ? (
                    <a href={entry.safeLink} target="_blank" rel="noopener noreferrer" className="rounded-full bg-cyan-300 px-4 py-2 font-black text-slate-950 transition hover:bg-cyan-200">
                      {t('discover.openTikTok')}
                    </a>
                  ) : (
                    <span className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-slate-300">{t('discover.unavailableLink')}</span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </Card>
  );
};
