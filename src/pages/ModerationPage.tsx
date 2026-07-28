import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, Loader2, LogIn, RefreshCw, ShieldCheck } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Card } from '../components/Card';
import { useAuth } from '../contexts/AuthContext';
import { useAdminStatus } from '../hooks/useAdminStatus';
import {
  approveSubmission,
  loadPendingSubmissions,
  ModerationError,
  type ModerationCursor,
  type ModerationSubmission,
  rejectSubmission,
} from '../services/moderation';
import type { LanguageCode } from '../types/task';

const formatDate = (value: string, language: LanguageCode) => new Date(value).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US');

export const ModerationPage = ({ language, t }: { language: LanguageCode; t: (key: string, values?: Record<string, string | number>) => string }) => {
  const location = useLocation();
  const { user, loading: authLoading, signIn } = useAuth();
  const { isAdmin, checkingAdmin } = useAdminStatus();
  const [submissions, setSubmissions] = useState<ModerationSubmission[]>([]);
  const [nextCursor, setNextCursor] = useState<ModerationCursor | null>(null);
  const [queueLoading, setQueueLoading] = useState(true);
  const [queueLoadingMore, setQueueLoadingMore] = useState(false);
  const [queueError, setQueueError] = useState<string | null>(null);
  const [actionBusy, setActionBusy] = useState<Record<string, 'approve' | 'reject'>>({});
  const [actionError, setActionError] = useState<Record<string, string | null>>({});
  const [rejectReasons, setRejectReasons] = useState<Record<string, string>>({});
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const requestIdRef = useRef(0);
  const busySubmissionIdsRef = useRef<Set<string>>(new Set());
  const actionSessionRef = useRef<{ userId: string | null; generation: number }>({ userId: null, generation: 0 });
  const activeUserId = user?.id ?? null;
  const signInRedirect = `${window.location.origin}${location.pathname}${location.search}`;

  useLayoutEffect(() => {
    actionSessionRef.current = {
      userId: activeUserId,
      generation: actionSessionRef.current.generation + 1,
    };
    busySubmissionIdsRef.current = new Set();

    setSubmissions([]);
    setNextCursor(null);
    setQueueError(null);
    setActionBusy({});
    setActionError({});
    setRejectReasons({});
    setActionSuccess(null);
    setQueueLoading(true);
    requestIdRef.current += 1;
  }, [activeUserId]);

  const loadQueue = useCallback(async (mode: 'replace' | 'append') => {
    if (!isAdmin) return;

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    if (mode === 'replace') {
      setQueueLoading(true);
      setQueueError(null);
      setActionSuccess(null);
    } else {
      setQueueLoadingMore(true);
    }

    try {
      const page = await loadPendingSubmissions({
        cursor: mode === 'append' ? nextCursor : null,
        pageSize: 20,
      });

      if (requestIdRef.current !== requestId) return;

      if (mode === 'replace') {
        setSubmissions(page.items);
      } else {
        setSubmissions((current) => {
          const seen = new Set(current.map((item) => item.id));
          const merged = [...current];
          page.items.forEach((item) => {
            if (!seen.has(item.id)) {
              seen.add(item.id);
              merged.push(item);
            }
          });
          return merged;
        });
      }

      setNextCursor(page.nextCursor);
      setQueueError(null);
    } catch (error) {
      if (requestIdRef.current !== requestId) return;

      if (error instanceof ModerationError) {
        setQueueError(t(error.translationKey));
      } else {
        setQueueError(t('moderation.error.queueLoadFailed'));
      }
    } finally {
      if (requestIdRef.current === requestId) {
        setQueueLoading(false);
        setQueueLoadingMore(false);
      }
    }
  }, [isAdmin, nextCursor, t]);

  useEffect(() => {
    if (authLoading || !user || checkingAdmin || !isAdmin) {
      return;
    }

    if (!queueLoading || submissions.length > 0 || queueError) {
      return;
    }

    void loadQueue('replace');
  }, [authLoading, checkingAdmin, isAdmin, loadQueue, queueError, queueLoading, submissions.length, user]);

  const setBusy = (submissionId: string, value?: 'approve' | 'reject') => {
    setActionBusy((current) => {
      if (!value) {
        const next = { ...current };
        delete next[submissionId];
        return next;
      }
      return { ...current, [submissionId]: value };
    });
  };

  const invalidateQueueRequests = () => {
    requestIdRef.current += 1;
    setQueueLoading(false);
    setQueueLoadingMore(false);
  };

  const canApplyActionResult = (userId: string | null, generation: number) => (
    actionSessionRef.current.userId === userId
    && actionSessionRef.current.generation === generation
  );

  const beginAction = (submissionId: string, action: 'approve' | 'reject') => {
    if (busySubmissionIdsRef.current.has(submissionId)) {
      return null;
    }

    busySubmissionIdsRef.current.add(submissionId);
    setBusy(submissionId, action);
    return {
      userId: activeUserId,
      generation: actionSessionRef.current.generation,
      action,
    };
  };

  const handleApprove = async (submissionId: string) => {
    const actionContext = beginAction(submissionId, 'approve');
    if (!actionContext) return;

    setActionError((current) => ({ ...current, [submissionId]: null }));
    setActionSuccess(null);

    try {
      await approveSubmission(submissionId);

      if (!canApplyActionResult(actionContext.userId, actionContext.generation)) {
        return;
      }

      invalidateQueueRequests();
      setSubmissions((current) => current.filter((item) => item.id !== submissionId));
      setActionSuccess(t('moderation.success.approved'));
    } catch (error) {
      if (!canApplyActionResult(actionContext.userId, actionContext.generation)) {
        return;
      }

      if (error instanceof ModerationError) {
        setActionError((current) => ({ ...current, [submissionId]: t(error.translationKey) }));
        if (error.code === 'STALE_STATUS' || error.code === 'NOT_FOUND') {
          setSubmissions((current) => current.filter((item) => item.id !== submissionId));
        }
      } else {
        setActionError((current) => ({ ...current, [submissionId]: t('moderation.error.actionFailed') }));
      }
    } finally {
      if (canApplyActionResult(actionContext.userId, actionContext.generation)) {
        busySubmissionIdsRef.current.delete(submissionId);
        setBusy(submissionId);
      }
    }
  };

  const handleReject = async (submissionId: string) => {
    const actionContext = beginAction(submissionId, 'reject');
    if (!actionContext) return;

    const reason = rejectReasons[submissionId]?.trim() ?? '';
    if (!reason) {
      setActionError((current) => ({ ...current, [submissionId]: t('moderation.error.invalidReason') }));
      if (canApplyActionResult(actionContext.userId, actionContext.generation)) {
        busySubmissionIdsRef.current.delete(submissionId);
        setBusy(submissionId);
      }
      return;
    }

    if (reason.length > 1000) {
      setActionError((current) => ({ ...current, [submissionId]: t('moderation.error.reasonTooLong') }));
      if (canApplyActionResult(actionContext.userId, actionContext.generation)) {
        busySubmissionIdsRef.current.delete(submissionId);
        setBusy(submissionId);
      }
      return;
    }

    setActionError((current) => ({ ...current, [submissionId]: null }));
    setActionSuccess(null);

    try {
      await rejectSubmission({ submissionId, rejectionReason: reason });

      if (!canApplyActionResult(actionContext.userId, actionContext.generation)) {
        return;
      }

      invalidateQueueRequests();
      setSubmissions((current) => current.filter((item) => item.id !== submissionId));
      setActionSuccess(t('moderation.success.rejected'));
    } catch (error) {
      if (!canApplyActionResult(actionContext.userId, actionContext.generation)) {
        return;
      }

      if (error instanceof ModerationError) {
        setActionError((current) => ({ ...current, [submissionId]: t(error.translationKey) }));
        if (error.code === 'STALE_STATUS' || error.code === 'NOT_FOUND') {
          setSubmissions((current) => current.filter((item) => item.id !== submissionId));
        }
      } else {
        setActionError((current) => ({ ...current, [submissionId]: t('moderation.error.actionFailed') }));
      }
    } finally {
      if (canApplyActionResult(actionContext.userId, actionContext.generation)) {
        busySubmissionIdsRef.current.delete(submissionId);
        setBusy(submissionId);
      }
    }
  };

  const hasMore = useMemo(() => nextCursor !== null, [nextCursor]);

  if (authLoading) {
    return (
      <Card>
        <div className="flex items-center gap-3 text-slate-200">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>{t('moderation.authLoading')}</span>
        </div>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card>
        <div className="flex items-center gap-3 text-cyan-200">
          <LogIn className="h-5 w-5" />
          <p className="text-lg font-semibold">{t('moderation.signInRequired')}</p>
        </div>
        <p className="mt-4 text-slate-300">{t('moderation.signInDescription')}</p>
        <button
          type="button"
          onClick={() => { void signIn(signInRedirect); }}
          className="mt-6 rounded-full bg-cyan-400 px-5 py-3 font-black text-slate-950 transition hover:bg-cyan-300"
        >
          {t('moderation.signIn')}
        </button>
      </Card>
    );
  }

  if (checkingAdmin) {
    return (
      <Card>
        <div className="flex items-center gap-3 text-slate-200">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>{t('moderation.checkingAuthorization')}</span>
        </div>
      </Card>
    );
  }

  if (!isAdmin) {
    return (
      <Card>
        <div className="flex items-center gap-3 text-rose-200">
          <ShieldCheck className="h-5 w-5" />
          <p className="text-lg font-semibold">{t('moderation.unauthorizedTitle')}</p>
        </div>
        <p className="mt-4 text-slate-300">{t('moderation.unauthorizedDescription')}</p>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-200">{t('moderation.heading')}</p>
          <h1 className="text-3xl font-black">{t('moderation.title')}</h1>
        </div>
        <button type="button" onClick={() => { void loadQueue('replace'); }} className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10">
          <RefreshCw className="mr-2 inline h-4 w-4" />{t('moderation.retry')}
        </button>
      </div>

      {actionSuccess ? (
        <div className="mt-4 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{actionSuccess}</div>
      ) : null}

      {queueLoading && (
        <div className="mt-6 flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-4 text-slate-200">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>{t('moderation.loadingQueue')}</span>
        </div>
      )}

      {!queueLoading && queueError && (
        <div className="mt-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-4 text-rose-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <span>{queueError}</span>
          </div>
          <button type="button" onClick={() => { void loadQueue('replace'); }} className="mt-3 rounded-full bg-rose-400 px-4 py-2 text-sm font-black text-rose-950">{t('moderation.retry')}</button>
        </div>
      )}

      {!queueLoading && !queueError && submissions.length === 0 && (
        <div className="mt-6 rounded-2xl bg-white/10 px-4 py-6 text-slate-300">
          <p className="text-lg font-semibold">{t('moderation.emptyTitle')}</p>
          <p className="mt-2">{t('moderation.emptyDescription')}</p>
        </div>
      )}

      {!queueLoading && !queueError && submissions.length > 0 && (
        <div className="mt-6 grid gap-4">
          {submissions.map((submission) => {
            const displayName = submission.displayName?.trim() || t('moderation.anonymous');
            const username = submission.tiktokUsername?.trim();
            const busyAction = actionBusy[submission.id];
            const isBusy = Boolean(busyAction);

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
                  <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">{t('moderation.challengeLabel')}</p>
                  <p className="mt-2 font-semibold text-white">{submission.challengeTitleSnapshot || t('moderation.unknownChallenge')}</p>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-300">
                  <div>
                    <p className="font-semibold">{t('moderation.submittedLabel')}</p>
                    <p>{formatDate(submission.createdAt, language)}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {submission.safeLink ? (
                      <a href={submission.safeLink} target="_blank" rel="noopener noreferrer" className="rounded-full bg-cyan-300 px-4 py-2 font-black text-slate-950 transition hover:bg-cyan-200">
                        {t('moderation.openTikTok')}
                      </a>
                    ) : (
                      <span className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-slate-300">
                        {t('moderation.unavailableLink')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 grid gap-3">
                  <label className="text-sm font-semibold text-slate-200">
                    <span className="mb-2 block">{t('moderation.rejectionReasonLabel')}</span>
                    <textarea
                      value={rejectReasons[submission.id] ?? ''}
                      onChange={(event) => setRejectReasons((current) => ({ ...current, [submission.id]: event.target.value }))}
                      placeholder={t('moderation.rejectionReasonPlaceholder')}
                      className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none ring-0"
                      rows={2}
                      maxLength={1000}
                      disabled={isBusy}
                    />
                  </label>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => { void handleApprove(submission.id); }}
                      disabled={isBusy}
                      className="rounded-full bg-emerald-400 px-4 py-2 text-sm font-black text-emerald-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {busyAction === 'approve' ? <Loader2 className="mr-2 inline h-4 w-4 animate-spin" /> : null}
                      {busyAction === 'approve' ? t('moderation.approving') : t('moderation.approve')}
                    </button>
                    <button
                      type="button"
                      onClick={() => { void handleReject(submission.id); }}
                      disabled={isBusy}
                      className="rounded-full bg-rose-400 px-4 py-2 text-sm font-black text-rose-950 transition hover:bg-rose-300 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {busyAction === 'reject' ? <Loader2 className="mr-2 inline h-4 w-4 animate-spin" /> : null}
                      {busyAction === 'reject' ? t('moderation.rejecting') : t('moderation.reject')}
                    </button>
                  </div>

                  {actionError[submission.id] ? (
                    <p className="text-sm text-rose-200">{actionError[submission.id]}</p>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {!queueLoading && !queueError && hasMore && (
        <div className="mt-6">
          <button
            type="button"
            onClick={() => { void loadQueue('append'); }}
            disabled={queueLoadingMore}
            className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {queueLoadingMore ? <Loader2 className="mr-2 inline h-4 w-4 animate-spin" /> : null}
            {queueLoadingMore ? t('moderation.loadingMore') : t('moderation.loadMore')}
          </button>
        </div>
      )}

      <div className="mt-6">
        <Link to="/discover" className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10">
          {t('moderation.backToDiscover')}
        </Link>
      </div>
    </Card>
  );
};
