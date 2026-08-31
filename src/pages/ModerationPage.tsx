import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, Loader2, LogIn, RefreshCw, ShieldCheck } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Card } from '../components/Card';
import { useAuth } from '../contexts/AuthContext';
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

type ModerationPageProps = {
  language: LanguageCode;
  t: (key: string, values?: Record<string, string | number>) => string;
  isAdmin: boolean;
  checkingAdmin: boolean;
  adminCheckFailed: boolean;
};

export const ModerationPage = ({
  language,
  t,
  isAdmin,
  checkingAdmin,
  adminCheckFailed,
}: ModerationPageProps) => {
  const location = useLocation();
  const { user, loading: authLoading, signIn } = useAuth();
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
    <div className="flex items-center gap-3 text-[var(--forest-900)]">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>{t('moderation.authLoading')}</span>
        </div>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card>
    <div className="flex items-center gap-3 text-[var(--earth-800)]">
          <LogIn className="h-5 w-5" />
          <p className="text-lg font-semibold">{t('moderation.signInRequired')}</p>
        </div>
    <p className="mt-4 text-[var(--forest-800)]">{t('moderation.signInDescription')}</p>
        <button
          type="button"
          onClick={() => { void signIn(signInRedirect); }}
      className="wood-panel mt-6 rounded-full px-5 py-3 font-black text-[var(--earth-900)] transition hover:-translate-y-px"
        >
          {t('moderation.signIn')}
        </button>
      </Card>
    );
  }

  if (checkingAdmin) {
    return (
      <Card>
    <div className="flex items-center gap-3 text-[var(--forest-900)]">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>{t('moderation.checkingAuthorization')}</span>
        </div>
      </Card>
    );
  }

  if (adminCheckFailed) {
    return (
      <Card>
        <div className="flex items-center gap-3 text-[var(--brocade-red)]">
          <AlertCircle className="h-5 w-5" />
          <p className="text-lg font-semibold">{t('moderation.error.adminCheckFailed')}</p>
        </div>
      </Card>
    );
  }

  if (!isAdmin) {
    return (
      <Card>
    <div className="flex items-center gap-3 text-[var(--brocade-red)]">
          <ShieldCheck className="h-5 w-5" />
          <p className="text-lg font-semibold">{t('moderation.unauthorizedTitle')}</p>
        </div>
    <p className="mt-4 text-[var(--forest-800)]">{t('moderation.unauthorizedDescription')}</p>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
      <p className="section-kicker">{t('moderation.heading')}</p>
      <h1 className="text-3xl font-black text-[var(--forest-950)]">{t('moderation.title')}</h1>
        </div>
    <button type="button" onClick={() => { void loadQueue('replace'); }} className="rounded-full border border-[rgba(61,84,52,0.14)] bg-[rgba(255,255,255,0.52)] px-4 py-2 text-sm font-semibold text-[var(--forest-900)] transition hover:bg-[rgba(255,255,255,0.72)]">
          <RefreshCw className="mr-2 inline h-4 w-4" />{t('moderation.retry')}
        </button>
      </div>

      {actionSuccess ? (
    <div className="mt-4 rounded-[1.25rem] border border-[rgba(61,84,52,0.14)] bg-[rgba(85,122,72,0.1)] px-4 py-3 text-sm text-[var(--forest-800)]">{actionSuccess}</div>
      ) : null}

      {queueLoading && (
    <div className="mt-6 flex items-center gap-3 rounded-[1.4rem] bg-[rgba(255,255,255,0.62)] px-4 py-4 text-[var(--forest-900)] ring-1 ring-[rgba(61,84,52,0.12)]">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>{t('moderation.loadingQueue')}</span>
        </div>
      )}

      {!queueLoading && queueError && (
    <div className="mt-6 rounded-[1.4rem] border border-[rgba(141,64,47,0.22)] bg-[rgba(170,85,70,0.12)] px-4 py-4 text-[var(--brocade-red)]">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <span>{queueError}</span>
          </div>
      <button type="button" onClick={() => { void loadQueue('replace'); }} className="mt-3 rounded-full bg-[rgba(141,64,47,0.16)] px-4 py-2 text-sm font-black text-[var(--brocade-red)]">{t('moderation.retry')}</button>
        </div>
      )}

      {!queueLoading && !queueError && submissions.length === 0 && (
    <div className="mt-6 rounded-[1.4rem] bg-[rgba(255,255,255,0.58)] px-4 py-6 text-[var(--forest-800)] ring-1 ring-[rgba(61,84,52,0.12)]">
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
            <article key={submission.id} className="rounded-[1.6rem] border border-[rgba(61,84,52,0.12)] bg-[rgba(255,255,255,0.58)] p-5 shadow-[0_14px_28px_rgba(38,52,31,0.08)]">
                <div className="flex items-center gap-3">
              {submission.avatarUrl ? <img src={submission.avatarUrl} alt={displayName} className="h-12 w-12 rounded-full border border-[rgba(91,67,38,0.14)] object-cover" /> : <div className="wood-panel flex h-12 w-12 items-center justify-center rounded-full font-black text-[var(--earth-900)]">{displayName.charAt(0).toUpperCase()}</div>}
              <div className="min-w-0">
              <p className="truncate font-black text-[var(--forest-950)]">{displayName}</p>
              {username ? <p className="truncate text-sm text-[var(--forest-700)]">@{username}</p> : null}
                  </div>
                </div>

            <div className="mt-4 rounded-[1.3rem] bg-[rgba(255,247,229,0.72)] p-4 ring-1 ring-[rgba(112,79,39,0.12)]">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--earth-800)]">{t('moderation.challengeLabel')}</p>
              <p className="mt-2 break-words font-semibold text-[var(--forest-950)]">{submission.challengeTitleSnapshot || t('moderation.unknownChallenge')}</p>
                </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-[var(--forest-800)]">
                  <div>
                    <p className="font-semibold">{t('moderation.submittedLabel')}</p>
                    <p>{formatDate(submission.createdAt, language)}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {submission.safeLink ? (
                <a href={submission.safeLink} target="_blank" rel="noopener noreferrer" className="wood-panel inline-flex min-h-[3rem] items-center justify-center rounded-full px-4 py-2 font-black text-[var(--earth-900)] transition hover:-translate-y-px">
                        {t('moderation.openTikTok')}
                      </a>
                    ) : (
                <span className="rounded-full border border-[rgba(61,84,52,0.12)] px-4 py-2 text-sm font-semibold text-[var(--forest-700)]">
                        {t('moderation.unavailableLink')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 grid gap-3">
              <label className="text-sm font-semibold text-[var(--forest-900)]">
                    <span className="mb-2 block">{t('moderation.rejectionReasonLabel')}</span>
                    <textarea
                      value={rejectReasons[submission.id] ?? ''}
                      onChange={(event) => setRejectReasons((current) => ({ ...current, [submission.id]: event.target.value }))}
                      placeholder={t('moderation.rejectionReasonPlaceholder')}
                className="w-full rounded-[1.2rem] border border-[rgba(61,84,52,0.14)] bg-[rgba(255,255,255,0.72)] px-4 py-3 text-[var(--forest-950)] outline-none ring-0 focus-visible:ring-4 focus-visible:ring-[rgba(220,179,85,0.24)]"
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
                    className="rounded-full bg-[rgba(85,122,72,0.18)] px-4 py-2 text-sm font-black text-[var(--forest-900)] transition hover:bg-[rgba(85,122,72,0.24)] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {busyAction === 'approve' ? <Loader2 className="mr-2 inline h-4 w-4 animate-spin" /> : null}
                      {busyAction === 'approve' ? t('moderation.approving') : t('moderation.approve')}
                    </button>
                    <button
                      type="button"
                      onClick={() => { void handleReject(submission.id); }}
                      disabled={isBusy}
                      className="rounded-full bg-[rgba(141,64,47,0.16)] px-4 py-2 text-sm font-black text-[var(--brocade-red)] transition hover:bg-[rgba(141,64,47,0.22)] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {busyAction === 'reject' ? <Loader2 className="mr-2 inline h-4 w-4 animate-spin" /> : null}
                      {busyAction === 'reject' ? t('moderation.rejecting') : t('moderation.reject')}
                    </button>
                  </div>

                  {actionError[submission.id] ? (
                    <p className="text-sm text-[var(--brocade-red)]">{actionError[submission.id]}</p>
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
      className="rounded-full border border-[rgba(61,84,52,0.14)] bg-[rgba(255,255,255,0.52)] px-4 py-2 text-sm font-semibold text-[var(--forest-900)] transition hover:bg-[rgba(255,255,255,0.72)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {queueLoadingMore ? <Loader2 className="mr-2 inline h-4 w-4 animate-spin" /> : null}
            {queueLoadingMore ? t('moderation.loadingMore') : t('moderation.loadMore')}
          </button>
        </div>
      )}

      <div className="mt-6">
    <Link to="/discover" className="inline-flex min-h-[3rem] items-center justify-center rounded-full border border-[rgba(61,84,52,0.14)] px-4 py-2 text-sm font-semibold text-[var(--forest-900)] transition hover:bg-[rgba(255,255,255,0.56)]">
          {t('moderation.backToDiscover')}
        </Link>
      </div>
    </Card>
  );
};
