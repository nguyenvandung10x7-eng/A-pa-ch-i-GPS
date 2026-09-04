import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Loader2, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { loadLeaderboardEntries, type LeaderboardEntry } from '../services/voting';
import type { LanguageCode } from '../types/task';

type ChallengeLeaderboardPreviewProps = {
  language: LanguageCode;
  compact?: boolean;
};

const copy = {
  vi: {
    title: 'Có người còn hâm hơn bạn.',
    label: 'BXH',
    votes: 'phiếu',
    view: 'Xem BXH',
    loading: 'Đang gọi tên những người đã chơi…',
    unavailable: 'BXH đang nghỉ một lát.',
    empty: 'Chưa ai xuất hiện ở đây. Có khi bạn là người đầu tiên.',
    unranked: 'Bạn — Chưa xếp hạng',
    yourRank: 'Bạn · hạng',
  },
  en: {
    title: 'Someone is even stranger than you.',
    label: 'RANKS',
    votes: 'votes',
    view: 'View ranks',
    loading: 'Calling up the people who have played…',
    unavailable: 'The rankings are taking a short break.',
    empty: 'Nobody is here yet. You might be the first.',
    unranked: 'You — Not ranked yet',
    yourRank: 'You · rank',
  },
} as const;

const initialsFor = (entry: LeaderboardEntry, fallback: string) => {
  const source = entry.displayName?.trim() || entry.tiktokUsername?.trim() || fallback;
  return source.slice(0, 1).toLocaleUpperCase();
};

export const ChallengeLeaderboardPreview = ({ language, compact = false }: ChallengeLeaderboardPreviewProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const c = copy[language];

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setFailed(false);
      try {
        const nextEntries = await loadLeaderboardEntries();
        if (mounted) setEntries(nextEntries);
      } catch {
        if (mounted) setFailed(true);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const leaders = useMemo(() => entries.slice(0, 3), [entries]);
  const currentUserRank = user ? entries.find((entry) => entry.userId === user.id)?.rank : undefined;
  const openLeaderboard = () => { void navigate('/leaderboard'); };

  if (compact) {
    return (
      <button
        type="button"
        className="challenge-leaderboard-peek"
        onClick={openLeaderboard}
        aria-label={`${c.title} ${c.view}`}
      >
        <Trophy aria-hidden="true" />
        <span>{c.label}</span>
        <span className="challenge-leaderboard-peek__faces" aria-hidden="true">
          {leaders.length > 0 ? leaders.map((entry) => (
            <i key={entry.id}>
              {entry.avatarUrl ? <img src={entry.avatarUrl} alt="" /> : initialsFor(entry, String(entry.rank))}
            </i>
          )) : <i>?</i>}
        </span>
      </button>
    );
  }

  return (
    <section className="challenge-leaderboard-panel" aria-labelledby="challenge-leaderboard-title">
      <header>
        <span aria-hidden="true"><Trophy /></span>
        <div>
          <small>{c.label}</small>
          <h2 id="challenge-leaderboard-title">{c.title}</h2>
        </div>
      </header>

      {loading ? (
        <p className="challenge-leaderboard-panel__state" aria-live="polite"><Loader2 className="animate-spin" aria-hidden="true" />{c.loading}</p>
      ) : failed ? (
        <p className="challenge-leaderboard-panel__state">{c.unavailable}</p>
      ) : leaders.length === 0 ? (
        <p className="challenge-leaderboard-panel__state">{c.empty}</p>
      ) : (
        <ol className="challenge-leaderboard-panel__list">
          {leaders.map((entry) => (
            <li key={entry.id}>
              <b>{entry.rank}</b>
              <span className="challenge-leaderboard-panel__avatar">
                {entry.avatarUrl ? <img src={entry.avatarUrl} alt="" /> : initialsFor(entry, String(entry.rank))}
              </span>
              <span className="challenge-leaderboard-panel__person">
                <strong>{entry.displayName?.trim() || (entry.tiktokUsername ? `@${entry.tiktokUsername}` : language === 'vi' ? 'Người chơi ẩn danh' : 'Anonymous player')}</strong>
                <small>{entry.challengeTitleSnapshot}</small>
              </span>
              <span className="challenge-leaderboard-panel__votes"><strong>{entry.voteCount}</strong><small>{c.votes}</small></span>
            </li>
          ))}
        </ol>
      )}

      <footer>
        <span>{currentUserRank ? `${c.yourRank} ${currentUserRank}` : c.unranked}</span>
        <button type="button" onClick={openLeaderboard}>{c.view}<ArrowRight aria-hidden="true" /></button>
      </footer>
    </section>
  );
};
