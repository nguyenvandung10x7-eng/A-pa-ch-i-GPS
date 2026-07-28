import { useEffect, useLayoutEffect, useMemo, useRef, useState, useCallback } from 'react';
import { AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { Card } from '../components/Card';
import { useAuth } from '../contexts/AuthContext';
import { loadApprovedSubmissions, type DiscoverySubmission, DiscoveryError } from '../services/discovery';
import { castVote, loadUserVoteSubmissionIds, loadVoteCountMap, VoteError } from '../services/voting';
import type { LanguageCode } from '../types/task';

const formatDate = (value: string, language: LanguageCode) => new Date(value).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US');

type UserVoteState = {
  userId: string | null;
  submissionIds: Set<string>;
};

export const DiscoverPage = ({ language, t }: { language: LanguageCode; t: (key: string, values?: Record<string, string | number>) => string }) => {
  const [submissions, setSubmissions] = useState<DiscoverySubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [voteCounts, setVoteCounts] = useState<Record<string, number>>({});
  const [userVoteState, setUserVoteState] = useState<UserVoteState>({ userId: null, submissionIds: new Set() });
  const [voteBusy, setVoteBusy] = useState<Record<string, boolean>>({});
  const [voteFeedback, setVoteFeedback] = useState<Record<string, string | null>>({});
  const requestIdRef = useRef(0);
  const { user, signIn } = useAuth();
  const activeUserId = user?.id ?? null;
  const authUserIdRef = useRef<string | null>(activeUserId);
  const userVoteStateRef = useRef<UserVoteState>({ userId: null, submissionIds: new Set() });
  const userVotes = userVoteState.userId === activeUserId ? userVoteState.submissionIds : new Set<string>();

  useLayoutEffect(() => {
    authUserIdRef.current = activeUserId;
    const resetState: UserVoteState = { userId: activeUserId, submissionIds: new Set() };
    userVoteStateRef.current = resetState;
    setUserVoteState(resetState);
    setVoteBusy({});
    setVoteFeedback({});
  }, [activeUserId]);

  const applyMergedServerVotesForUser = useCallback((requestUserId: string | null, submittedVotes: string[]) => {
    const current = userVoteStateRef.current;
    const base = current.userId === requestUserId ? current.submissionIds : new Set<string>();
    const merged = new Set(base);
    for (const submissionId of submittedVotes) {
      merged.add(submissionId);
    }

    const nextState: UserVoteState = { userId: requestUserId, submissionIds: merged };
    userVoteStateRef.current = nextState;
    setUserVoteState(nextState);
  }, []);

  const loadData = useCallback(async () => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    const requestUserId = activeUserId;

    setLoading(true);
    setError(null);
    try {
      const [data, counts, submittedVotes] = await Promise.all([
        loadApprovedSubmissions(),
        loadVoteCountMap(),
        loadUserVoteSubmissionIds(requestUserId),
      ]);
      if (requestIdRef.current !== requestId) {
        return;
      }
      setSubmissions(data);
      setVoteCounts((current) => {
        const merged: Record<string, number> = { ...current };
        for (const [submissionId, fetchedCount] of Object.entries(counts)) {
          merged[submissionId] = Math.max(current[submissionId] ?? 0, fetchedCount ?? 0);
        }
        return merged;
      });
      if (authUserIdRef.current === requestUserId) {
        applyMergedServerVotesForUser(requestUserId, submittedVotes);
      }
    } catch (err) {
      if (requestIdRef.current !== requestId) {
        return;
      }
      if (authUserIdRef.current !== requestUserId && err instanceof VoteError) {
        return;
      }
      if (err instanceof DiscoveryError) {
        setError(t(err.translationKey));
      } else if (err instanceof VoteError) {
        setError(t(err.translationKey));
      } else {
        setError(t('discover.error'));
      }
    } finally {
      if (requestIdRef.current === requestId) {
        setLoading(false);
      }
    }
  }, [activeUserId, applyMergedServerVotesForUser, t]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadData();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
      requestIdRef.current += 1;
    };
  }, [loadData]);

  const refreshVoteDataInBackground = useCallback(async (requestUserId: string | null = activeUserId) => {

    try {
      const [counts, submittedVotes] = await Promise.all([
        loadVoteCountMap(),
        loadUserVoteSubmissionIds(requestUserId),
      ]);

      setVoteCounts((current) => {
        const merged: Record<string, number> = { ...current };
        for (const [submissionId, fetchedCount] of Object.entries(counts)) {
          merged[submissionId] = Math.max(current[submissionId] ?? 0, fetchedCount ?? 0);
        }
        return merged;
      });

      if (authUserIdRef.current === requestUserId) {
        applyMergedServerVotesForUser(requestUserId, submittedVotes);
      }
    } catch {
      // Keep optimistic UI and success feedback even if background reconciliation fails.
    }
  }, [activeUserId, applyMergedServerVotesForUser]);

  const handleVote = async (submissionId: string, ownerUserId: string) => {
    if (!user?.id) {
      setVoteFeedback((current) => ({ ...current, [submissionId]: t('discover.voteSignIn') }));
      return;
    }

  const votingUserId = user.id;
  const voteCountBefore = voteCounts[submissionId] ?? 0;

    if (voteBusy[submissionId]) {
      return;
    }

    if (votingUserId === ownerUserId) {
      setVoteFeedback((current) => ({ ...current, [submissionId]: t('discover.voteOwnSubmission') }));
      return;
    }

    if (userVotes.has(submissionId)) {
      setVoteFeedback((current) => ({ ...current, [submissionId]: t('discover.voteDuplicate') }));
      return;
    }

    setVoteBusy((current) => ({ ...current, [submissionId]: true }));
    setVoteFeedback((current) => ({ ...current, [submissionId]: null }));

    try {
      await castVote({ userId: votingUserId, submissionId });
      void refreshVoteDataInBackground(votingUserId);

      if (authUserIdRef.current !== votingUserId) {
        return;
      }

      const authoritativeState = userVoteStateRef.current;
      const alreadyCounted = authoritativeState.userId === votingUserId && authoritativeState.submissionIds.has(submissionId);

      if (!alreadyCounted) {
        const nextSubmissionIds = authoritativeState.userId === votingUserId ? new Set(authoritativeState.submissionIds) : new Set<string>();
        nextSubmissionIds.add(submissionId);
        const nextState: UserVoteState = { userId: votingUserId, submissionIds: nextSubmissionIds };
        userVoteStateRef.current = nextState;
        setUserVoteState(nextState);
        setVoteCounts((current) => ({
          ...current,
          [submissionId]: Math.max(current[submissionId] ?? 0, voteCountBefore + 1),
        }));
      }

      setVoteFeedback((current) => ({ ...current, [submissionId]: t('discover.voteSuccess') }));
    } catch (err) {
      if (authUserIdRef.current !== votingUserId) {
        return;
      }

      if (err instanceof VoteError) {
        setVoteFeedback((current) => ({ ...current, [submissionId]: t(err.translationKey) }));
      } else {
        setVoteFeedback((current) => ({ ...current, [submissionId]: t('discover.voteError') }));
      }
    } finally {
      if (authUserIdRef.current === votingUserId) {
        setVoteBusy((current) => ({ ...current, [submissionId]: false }));
      }
    }
  };

  const challengeOptions = useMemo(() => {
    const uniqueEntries = new Map<string, string>();
    submissions.forEach((item) => {
      if (!uniqueEntries.has(item.challengeId)) {
        uniqueEntries.set(item.challengeId, item.challengeTitleSnapshot || t('discover.unknownChallenge'));
      }
    });
    return [{ value: 'all', label: t('discover.filterAll') }, ...Array.from(uniqueEntries.entries()).map(([value, label]) => ({ value, label }))];
  }, [submissions, t]);
  const filtered = useMemo(() => (filter === 'all' ? submissions : submissions.filter((item) => item.challengeId === filter)), [filter, submissions]);

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-200">{t('discover.heading')}</p>
          <h1 className="text-3xl font-black">{t('discover.title')}</h1>
        </div>
        <button type="button" onClick={() => { void loadData(); }} className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10">
          <RefreshCw className="mr-2 inline h-4 w-4" />{t('discover.retry')}
        </button>
      </div>

      <label className="mt-6 block text-sm font-semibold text-slate-200">
        <span className="mb-2 block">{t('discover.filterLabel')}</span>
        <select value={filter} onChange={(event) => setFilter(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none ring-0">
          {challengeOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </label>

      {loading && (
        <div className="mt-6 flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-4 text-slate-200">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>{t('discover.loading')}</span>
        </div>
      )}

      {!loading && error && (
        <div className="mt-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-4 text-rose-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
          <button type="button" onClick={() => { void loadData(); }} className="mt-3 rounded-full bg-rose-400 px-4 py-2 text-sm font-black text-rose-950">{t('discover.retry')}</button>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="mt-6 rounded-2xl bg-white/10 px-4 py-6 text-slate-300">
          <p className="text-lg font-semibold">{t('discover.emptyTitle')}</p>
          <p className="mt-2">{t('discover.emptyDescription')}</p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {filtered.map((submission) => {
            const displayName = submission.displayName?.trim() || t('discover.anonymous');
            const username = submission.tiktokUsername?.trim();
            return (
              <article key={submission.id} className="rounded-[1.5rem] border border-white/10 bg-slate-950/40 p-5">
                <div className="flex items-center gap-3">
                  {submission.avatarUrl ? <img src={submission.avatarUrl} alt={displayName} className="h-12 w-12 rounded-full border border-cyan-400/30 object-cover" /> : <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-300 font-black text-slate-950">{displayName.charAt(0).toUpperCase()}</div>}
                  <div>
                    <p className="font-black text-white">{displayName}</p>
                    {username ? <p className="text-sm text-cyan-200">@{username}</p> : null}
                  </div>
                </div>

                <div className="mt-4 rounded-2xl bg-white/10 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">{t('discover.challengeLabel')}</p>
                  <p className="mt-2 font-semibold text-white">{submission.challengeTitleSnapshot || t('discover.unknownChallenge')}</p>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-300">
                  <div>
                    <p className="font-semibold">{t('discover.submittedLabel')}</p>
                    <p>{formatDate(submission.createdAt, language)}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="rounded-full border border-white/15 px-3 py-2 text-sm font-semibold text-slate-200">
                      {t('discover.voteCount')}: {voteCounts[submission.id] ?? 0}
                    </div>
                    {submission.safeLink ? (
                      <a href={submission.safeLink} target="_blank" rel="noopener noreferrer" className="rounded-full bg-cyan-300 px-4 py-2 font-black text-slate-950 transition hover:bg-cyan-200">
                        {t('discover.openTikTok')}
                      </a>
                    ) : (
                      <span className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-slate-300">
                        {t('discover.unavailableLink')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-200">{t('discover.voteHelp')}</p>
                      {user ? (
                        <p className="text-sm text-slate-400">{userVotes.has(submission.id) ? t('discover.voteDuplicate') : submission.userId === user.id ? t('discover.voteOwnSubmission') : t('discover.vote')}</p>
                      ) : (
                        <p className="text-sm text-slate-400">{t('discover.voteSignIn')}</p>
                      )}
                    </div>
                    {user ? (
                      <button type="button" onClick={() => { void handleVote(submission.id, submission.userId); }} disabled={voteBusy[submission.id] || userVotes.has(submission.id) || submission.userId === user.id} className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-black text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60">
                        {voteBusy[submission.id] ? <Loader2 className="mr-2 inline h-4 w-4 animate-spin" /> : null}
                        {voteBusy[submission.id] ? t('discover.voting') : t('discover.vote')}
                      </button>
                    ) : (
                      <button type="button" onClick={() => { void signIn('/discover'); }} className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-black text-slate-950 transition hover:bg-cyan-300">
                        {t('discover.voteSignIn')}
                      </button>
                    )}
                  </div>
                  {voteFeedback[submission.id] ? <p className="mt-3 text-sm text-cyan-200">{voteFeedback[submission.id]}</p> : null}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </Card>
  );
};
