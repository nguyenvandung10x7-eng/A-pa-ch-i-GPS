import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, ArrowUpRight, Loader2, Trophy } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import type { LanguageCode } from '../types/task';
import { loadLeaderboardEntries, type LeaderboardEntry, VoteError } from '../services/voting';
import './leaderboard-page.css';

const formatDate = (value: string, language: LanguageCode) =>
  new Date(value).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US');

const copy = {
  vi: {
    field: 'FIELD / CỘNG ĐỒNG',
    mode: 'ĐIỂM ĐẾN · BẢNG XẾP HẠNG',
    noticeLabel: 'MỖI LẦN ĐẾN LÀ MỘT DẤU VẾT',
    boardLabel: 'BẢNG ĐIỂM',
    boardTitle: 'Những người đã để lại dấu vết.',
    live: 'ĐANG CẬP NHẬT',
    rank: 'HẠNG',
    votes: 'phiếu',
    submitted: 'Gửi ngày',
    open: 'Mở khoảnh khắc',
    unavailable: 'Chưa có liên kết',
  },
  en: {
    field: 'FIELD / COMMUNITY',
    mode: 'DESTINATION · LEADERBOARD',
    noticeLabel: 'EVERY ARRIVAL LEAVES A TRACE',
    boardLabel: 'SCOREBOARD',
    boardTitle: 'People who left a trace.',
    live: 'LIVE',
    rank: 'RANK',
    votes: 'votes',
    submitted: 'Submitted',
    open: 'Open moment',
    unavailable: 'No link available',
  },
} as const;

const displayNameFor = (entry: LeaderboardEntry, language: LanguageCode) => (
  entry.displayName?.trim()
  || (entry.tiktokUsername ? '@' + entry.tiktokUsername : language === 'vi' ? 'Người chơi ẩn danh' : 'Anonymous player')
);

export const LeaderboardPage = ({ language, t }: { language: LanguageCode; t: (key: string) => string }) => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const c = copy[language];

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
        if (isMounted) setLoading(false);
      }
    };

    void loadData();
    return () => {
      isMounted = false;
    };
  }, [t]);

  const emptyState = useMemo(() => !loading && !error && entries.length === 0, [entries.length, error, loading]);

  return (
    <section className="leaderboard-page" aria-labelledby="leaderboard-page-title">
      <header className="leaderboard-page__masthead">
        <div className="leaderboard-page__eyebrow">
          <span className="leaderboard-page__mark" aria-hidden="true"><Trophy /></span>
          <span>{c.field}</span>
          <i>{c.mode}</i>
        </div>

        <div className="leaderboard-page__title-row">
          <div>
            <p className="leaderboard-page__kicker">{t('leaderboard.heading')}</p>
            <h1 id="leaderboard-page-title" className="leaderboard-page__title">{t('leaderboard.title')}</h1>
          </div>
          <div className="leaderboard-page__access">
            <span aria-hidden="true" />
            {user ? t('leaderboard.authenticated') : t('leaderboard.anonymous')}
          </div>
        </div>

        <div className="leaderboard-page__notice">
          <small>{c.noticeLabel}</small>
          <p>{t('leaderboard.pointsNotice')}</p>
        </div>
      </header>

      {loading ? (
        <div className="leaderboard-page__state" aria-live="polite">
          <Loader2 className="animate-spin" aria-hidden="true" />
          <span>{t('leaderboard.loading')}</span>
        </div>
      ) : error ? (
        <div className="leaderboard-page__state is-error" role="alert">
          <AlertCircle aria-hidden="true" />
          <span>{error}</span>
        </div>
      ) : emptyState ? (
        <div className="leaderboard-page__state leaderboard-page__state--empty">
          <Trophy aria-hidden="true" />
          <div>
            <strong>{t('leaderboard.emptyTitle')}</strong>
            <p>{t('leaderboard.emptyDescription')}</p>
          </div>
        </div>
      ) : (
        <section className="leaderboard-page__board" aria-labelledby="leaderboard-board-title">
          <header className="leaderboard-page__board-head">
            <div>
              <small>{c.boardLabel}</small>
              <h2 id="leaderboard-board-title">{c.boardTitle}</h2>
            </div>
            <span>{c.live}</span>
          </header>

          <div className="leaderboard-page__list">
            {entries.map((entry) => (
              <article
                key={entry.id}
                className={[
                  'leaderboard-page__entry',
                  entry.rank <= 3 ? 'is-top-' + entry.rank : '',
                ].filter(Boolean).join(' ')}
              >
                <div className="leaderboard-page__rank">
                  <small>{c.rank}</small>
                  <strong>{String(entry.rank).padStart(2, '0')}</strong>
                </div>

                <div className="leaderboard-page__identity">
                  <div className="leaderboard-page__challenge">
                    <Trophy aria-hidden="true" />
                    <span>{entry.challengeTitleSnapshot || t('discover.unknownChallenge')}</span>
                  </div>
                  <strong className="leaderboard-page__name">{displayNameFor(entry, language)}</strong>
                  {entry.tiktokUsername && entry.displayName?.trim() ? (
                    <small className="leaderboard-page__tiktok">@{entry.tiktokUsername}</small>
                  ) : null}
                </div>

                <div className="leaderboard-page__score">
                  <strong>{entry.voteCount}</strong>
                  <small>{c.votes}</small>
                </div>

                <div className="leaderboard-page__entry-meta">
                  <span>{c.submitted} · {formatDate(entry.createdAt, language)}</span>
                  {entry.safeLink ? (
                    <a href={entry.safeLink} target="_blank" rel="noopener noreferrer" className="leaderboard-page__link">
                      {c.open}<ArrowUpRight aria-hidden="true" />
                    </a>
                  ) : (
                    <span className="leaderboard-page__link-unavailable">{c.unavailable}</span>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </section>
  );
};
