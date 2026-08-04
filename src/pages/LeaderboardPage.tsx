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
      <p className="section-kicker">{t('leaderboard.heading')}</p>
      <h1 className="text-3xl font-black text-[var(--forest-950)]">{t('leaderboard.title')}</h1>
        </div>
    <div className="rounded-full border border-[rgba(61,84,52,0.14)] bg-[rgba(255,255,255,0.62)] px-4 py-2 text-sm font-semibold text-[var(--forest-800)]">
          {user ? t('leaderboard.authenticated') : t('leaderboard.anonymous')}
        </div>
      </div>

    <p className="mt-4 rounded-[1.4rem] border border-[rgba(112,79,39,0.16)] bg-[rgba(255,247,229,0.72)] px-4 py-3 text-sm leading-6 text-[var(--earth-900)]">
        {t('leaderboard.pointsNotice')}
      </p>

      {loading && (
    <div className="mt-6 flex items-center gap-3 rounded-[1.4rem] bg-[rgba(255,255,255,0.62)] px-4 py-4 text-[var(--forest-900)] ring-1 ring-[rgba(61,84,52,0.12)]">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>{t('leaderboard.loading')}</span>
        </div>
      )}

      {!loading && error && (
    <div className="mt-6 rounded-[1.4rem] border border-[rgba(141,64,47,0.22)] bg-[rgba(170,85,70,0.12)] px-4 py-4 text-[var(--brocade-red)]">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {!loading && !error && emptyState && (
    <div className="mt-6 rounded-[1.4rem] bg-[rgba(255,255,255,0.62)] px-4 py-6 text-[var(--forest-800)] ring-1 ring-[rgba(61,84,52,0.12)]">
          <p className="text-lg font-semibold">{t('leaderboard.emptyTitle')}</p>
          <p className="mt-2">{t('leaderboard.emptyDescription')}</p>
        </div>
      )}

      {!loading && !error && !emptyState && (
        <div className="mt-6 space-y-3">
          {entries.map((entry) => (
        <article key={entry.id} className="rounded-[1.6rem] border border-[rgba(61,84,52,0.12)] bg-[rgba(255,255,255,0.58)] p-4 shadow-[0_14px_28px_rgba(38,52,31,0.08)]">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
            <div className="wood-panel flex h-12 w-12 items-center justify-center rounded-full font-black text-[var(--earth-900)]">
                    {entry.rank}
                  </div>
            <div className="min-w-0">
                    <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-[var(--forest-700)]" />
              <p className="break-words font-black text-[var(--forest-950)]">{entry.challengeTitleSnapshot || t('discover.unknownChallenge')}</p>
                    </div>
            <p className="text-sm text-[var(--forest-800)]">{entry.displayName?.trim() || t('discover.anonymous')}</p>
            {entry.tiktokUsername ? <p className="text-sm text-[var(--forest-700)]">@{entry.tiktokUsername}</p> : null}
                  </div>
                </div>
          <div className="flex flex-wrap gap-3 text-sm text-[var(--forest-800)]">
            <div className="rounded-[1.2rem] bg-[rgba(255,255,255,0.72)] px-3 py-2 ring-1 ring-[rgba(61,84,52,0.12)]">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--forest-700)]">{t('leaderboard.voteCount')}</p>
            <p className="font-black text-[var(--forest-950)]">{entry.voteCount}</p>
                  </div>
            <div className="rounded-[1.2rem] bg-[rgba(255,255,255,0.72)] px-3 py-2 ring-1 ring-[rgba(61,84,52,0.12)]">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--forest-700)]">{t('leaderboard.submitted')}</p>
                    <p>{formatDate(entry.createdAt, language)}</p>
                  </div>
                  {entry.safeLink ? (
            <a href={entry.safeLink} target="_blank" rel="noopener noreferrer" className="wood-panel inline-flex min-h-[3rem] items-center justify-center rounded-full px-4 py-2 font-black text-[var(--earth-900)] transition hover:-translate-y-px">
                      {t('discover.openTikTok')}
                    </a>
                  ) : (
            <span className="rounded-full border border-[rgba(61,84,52,0.14)] px-4 py-2 text-sm font-semibold text-[var(--forest-700)]">{t('discover.unavailableLink')}</span>
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
