import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Loader2, Trophy } from 'lucide-react';
import { Card } from '../components/Card';
import { useAuth } from '../contexts/AuthContext';
import type { LanguageCode } from '../types/task';
import { loadLeaderboardEntries, type LeaderboardEntry, VoteError } from '../services/voting';
import './leaderboard-page.css';

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
    <Card className="leaderboard-page">
      <div className="leaderboard-page__top">
        <div>
          <p className="leaderboard-page__kicker">{t('leaderboard.heading')}</p>
          <h1 className="leaderboard-page__title">{t('leaderboard.title')}</h1>
        </div>
        <div className="leaderboard-page__access">
          {user ? t('leaderboard.authenticated') : t('leaderboard.anonymous')}
        </div>
      </div>

      <p className="leaderboard-page__notice">
        {t('leaderboard.pointsNotice')}
      </p>

      {loading && (
        <div className="leaderboard-page__state">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>{t('leaderboard.loading')}</span>
        </div>
      )}

      {!loading && error && (
        <div className="leaderboard-page__state is-error">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && emptyState && (
        <div className="leaderboard-page__state">
          <div>
            <strong>{t('leaderboard.emptyTitle')}</strong>
            <p>{t('leaderboard.emptyDescription')}</p>
          </div>
        </div>
      )}

      {!loading && !error && !emptyState && (
        <div className="leaderboard-page__list">
          {entries.map((entry) => (
            <article key={entry.id} className="leaderboard-page__entry">
              <div className="leaderboard-page__entry-inner">
                <div className="leaderboard-page__identity">
                  <div className="leaderboard-page__rank">{entry.rank}</div>
                  <div className="leaderboard-page__identity-copy">
                    <div className="leaderboard-page__challenge">
                      <Trophy aria-hidden="true" />
                      <span>{entry.challengeTitleSnapshot || t('discover.unknownChallenge')}</span>
                    </div>
                    <div className="leaderboard-page__name">{entry.displayName?.trim() || t('discover.anonymous')}</div>
                    {entry.tiktokUsername ? <div className="leaderboard-page__tiktok">@{entry.tiktokUsername}</div> : null}
                  </div>
                </div>

                <div className="leaderboard-page__metrics">
                  <div className="leaderboard-page__metric">
                    <small>{t('leaderboard.voteCount')}</small>
                    <strong>{entry.voteCount}</strong>
                  </div>
                  <div className="leaderboard-page__metric">
                    <small>{t('leaderboard.submitted')}</small>
                    <span>{formatDate(entry.createdAt, language)}</span>
                  </div>
                  {entry.safeLink ? (
                    <a href={entry.safeLink} target="_blank" rel="noopener noreferrer" className="leaderboard-page__link">
                      {t('discover.openTikTok')}
                    </a>
                  ) : (
                    <span className="leaderboard-page__link-unavailable">{t('discover.unavailableLink')}</span>
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
