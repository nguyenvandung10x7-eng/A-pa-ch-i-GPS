import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, Loader2, LogIn, RefreshCw, ShieldCheck } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Card } from '../components/Card';
import { useAuth } from '../contexts/AuthContext';
import {
  GuildError,
  loadPendingGuildPosts,
  moderateGuildPost,
  type GuildModerationPost,
} from '../services/guilds';
import type { LanguageCode } from '../types/task';

const formatDate = (value: string, language: LanguageCode) => new Date(value).toLocaleDateString(
  language === 'vi' ? 'vi-VN' : 'en-US',
  { day: 'numeric', month: 'short', year: 'numeric' },
);

export const GuildModerationPage = ({
  language,
  t,
  isAdmin,
  checkingAdmin,
  adminCheckFailed,
}: {
  language: LanguageCode;
  t: (key: string, values?: Record<string, string | number>) => string;
  isAdmin: boolean;
  checkingAdmin: boolean;
  adminCheckFailed: boolean;
}) => {
  const location = useLocation();
  const { user, loading: authLoading, signIn } = useAuth();
  const [posts, setPosts] = useState<GuildModerationPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [busy, setBusy] = useState<Record<string, 'approve' | 'reject'>>({});
  const [reasons, setReasons] = useState<Record<string, string>>({});

  const loadQueue = useCallback(async () => {
    if (!isAdmin) return;
    setRefreshing(true);
    setError(null);
    try {
      setPosts(await loadPendingGuildPosts());
    } catch (nextError) {
      if (nextError instanceof GuildError) {
        setError(t(nextError.translationKey));
      } else {
        setError(t('moderation.error.queueLoadFailed'));
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAdmin, t]);

  useEffect(() => {
    if (authLoading || checkingAdmin || !isAdmin) return;
    const timeoutId = window.setTimeout(() => {
      void loadQueue();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [authLoading, checkingAdmin, isAdmin, loadQueue]);

  const handleAction = async (postId: string, action: 'approve' | 'reject') => {
    if (busy[postId]) return;

    const reason = reasons[postId]?.trim() ?? '';
    if (action === 'reject' && !reason) {
      setError(t('moderation.error.invalidReason'));
      return;
    }

    setBusy((current) => ({ ...current, [postId]: action }));
    setError(null);
    setSuccess(null);

    try {
      await moderateGuildPost({ postId, action, rejectionReason: action === 'reject' ? reason : undefined });
      setPosts((current) => current.filter((post) => post.id !== postId));
      setSuccess(action === 'approve' ? t('moderation.guild.approved') : t('moderation.guild.rejected'));
    } catch (nextError) {
      if (nextError instanceof GuildError) {
        setError(t(nextError.translationKey));
        if (nextError.code === 'STALE_STATUS' || nextError.code === 'NOT_FOUND') {
          setPosts((current) => current.filter((post) => post.id !== postId));
        }
      } else {
        setError(t('moderation.error.actionFailed'));
      }
    } finally {
      setBusy((current) => {
        const next = { ...current };
        delete next[postId];
        return next;
      });
    }
  };

  const signInRedirect = window.location.origin + location.pathname + location.search;

  if (authLoading) {
    return (
      <Card>
        <div className="flex items-center gap-3 text-[var(--forest-900)]" role="status">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          <span>{t('moderation.authLoading')}</span>
        </div>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card>
        <div className="flex items-center gap-3 text-[var(--earth-800)]">
          <LogIn className="h-5 w-5" aria-hidden="true" />
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
        <div className="flex items-center gap-3 text-[var(--forest-900)]" role="status">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          <span>{t('moderation.checkingAuthorization')}</span>
        </div>
      </Card>
    );
  }

  if (adminCheckFailed) {
    return (
      <Card>
        <div className="flex items-center gap-3 text-[var(--brocade-red)]">
          <AlertCircle className="h-5 w-5" aria-hidden="true" />
          <p className="text-lg font-semibold">{t('moderation.error.adminCheckFailed')}</p>
        </div>
      </Card>
    );
  }

  if (!isAdmin) {
    return (
      <Card>
        <div className="flex items-center gap-3 text-[var(--brocade-red)]">
          <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          <p className="text-lg font-semibold">{t('moderation.unauthorizedTitle')}</p>
        </div>
        <p className="mt-4 text-[var(--forest-800)]">{t('moderation.unauthorizedDescription')}</p>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="section-kicker">{t('moderation.guild.kicker')}</p>
          <h1 className="text-3xl font-black text-[var(--forest-950)]">{t('moderation.guild.title')}</h1>
          <p className="mt-2 max-w-2xl text-[var(--forest-800)]">{t('moderation.guild.description')}</p>
        </div>
        <button
          type="button"
          onClick={() => { void loadQueue(); }}
          disabled={refreshing}
          className="rounded-full border border-[rgba(61,84,52,0.14)] bg-[rgba(255,255,255,0.52)] px-4 py-2 text-sm font-semibold text-[var(--forest-900)] transition hover:bg-[rgba(255,255,255,0.72)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw className={refreshing ? 'mr-2 inline h-4 w-4 animate-spin' : 'mr-2 inline h-4 w-4'} aria-hidden="true" />
          {t('moderation.retry')}
        </button>
      </div>

      {success ? <div className="mt-4 rounded-[1.25rem] bg-[rgba(85,122,72,0.1)] px-4 py-3 text-sm text-[var(--forest-800)]" role="status">{success}</div> : null}
      {error ? (
        <div className="mt-4 flex items-center gap-2 rounded-[1.25rem] border border-[rgba(141,64,47,0.2)] bg-[rgba(170,85,70,0.12)] px-4 py-3 text-[var(--brocade-red)]" role="alert">
          <AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      ) : null}

      {loading ? (
        <div className="mt-6 flex items-center gap-3 rounded-[1.4rem] bg-[rgba(255,255,255,0.62)] px-4 py-4 text-[var(--forest-900)]" role="status">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          <span>{t('moderation.guild.loading')}</span>
        </div>
      ) : posts.length === 0 ? (
        <div className="mt-6 rounded-[1.4rem] bg-[rgba(255,255,255,0.58)] px-4 py-6 text-[var(--forest-800)]">
          <p className="text-lg font-semibold">{t('moderation.guild.emptyTitle')}</p>
          <p className="mt-2">{t('moderation.guild.emptyDescription')}</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4">
          {posts.map((post) => {
            const isBusy = Boolean(busy[post.id]);
            return (
              <article key={post.id} className="rounded-[1.6rem] border border-[rgba(61,84,52,0.12)] bg-[rgba(255,255,255,0.58)] p-5 shadow-[0_14px_28px_rgba(38,52,31,0.08)]">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--earth-800)]">
                      {t('guild.team.' + post.guildSlug)}
                    </p>
                    <p className="mt-1 font-black text-[var(--forest-950)]">{post.nickname}</p>
                  </div>
                  <p className="text-sm text-[var(--forest-700)]">{formatDate(post.createdAt, language)}</p>
                </div>
                <p className="mt-4 whitespace-pre-line rounded-[1.2rem] bg-[rgba(255,247,229,0.74)] p-4 text-[var(--forest-950)]">{post.body}</p>

                <label className="mt-4 grid gap-2 text-sm font-semibold text-[var(--forest-900)]">
                  <span>{t('moderation.rejectionReasonLabel')}</span>
                  <textarea
                    value={reasons[post.id] ?? ''}
                    onChange={(event) => setReasons((current) => ({ ...current, [post.id]: event.target.value }))}
                    placeholder={t('moderation.rejectionReasonPlaceholder')}
                    maxLength={1000}
                    rows={2}
                    disabled={isBusy}
                    className="w-full rounded-[1.1rem] border border-[rgba(61,84,52,0.14)] bg-[rgba(255,255,255,0.72)] px-4 py-3 text-[var(--forest-950)] outline-none focus-visible:ring-4 focus-visible:ring-[rgba(220,179,85,0.24)]"
                  />
                </label>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => { void handleAction(post.id, 'approve'); }}
                    disabled={isBusy}
                    className="rounded-full bg-[rgba(85,122,72,0.18)] px-4 py-2 text-sm font-black text-[var(--forest-900)] transition hover:bg-[rgba(85,122,72,0.24)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {busy[post.id] === 'approve' ? <Loader2 className="mr-2 inline h-4 w-4 animate-spin" aria-hidden="true" /> : null}
                    {busy[post.id] === 'approve' ? t('moderation.approving') : t('moderation.approve')}
                  </button>
                  <button
                    type="button"
                    onClick={() => { void handleAction(post.id, 'reject'); }}
                    disabled={isBusy}
                    className="rounded-full bg-[rgba(141,64,47,0.16)] px-4 py-2 text-sm font-black text-[var(--brocade-red)] transition hover:bg-[rgba(141,64,47,0.22)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {busy[post.id] === 'reject' ? <Loader2 className="mr-2 inline h-4 w-4 animate-spin" aria-hidden="true" /> : null}
                    {busy[post.id] === 'reject' ? t('moderation.rejecting') : t('moderation.reject')}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <Link to="/moderation" className="inline-flex min-h-[3rem] items-center justify-center rounded-full border border-[rgba(61,84,52,0.14)] px-4 py-2 text-sm font-semibold text-[var(--forest-900)] transition hover:bg-[rgba(255,255,255,0.56)]">
          {t('moderation.backToTikTok')}
        </Link>
        <Link to="/guild" className="inline-flex min-h-[3rem] items-center justify-center rounded-full border border-[rgba(61,84,52,0.14)] px-4 py-2 text-sm font-semibold text-[var(--forest-900)] transition hover:bg-[rgba(255,255,255,0.56)]">
          {t('moderation.backToGuild')}
        </Link>
      </div>
    </Card>
  );
};
