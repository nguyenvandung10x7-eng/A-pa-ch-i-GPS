import { useMemo, useState, type FormEvent } from 'react';
import { ArrowLeft, Loader2, LogIn, Video } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useAuth } from '../contexts/AuthContext';
import { loadHistory } from '../services/history';
import { localize } from '../services/i18n';
import { resolveSubmissionChallenge, submitTikTokVideo, TikTokSubmissionError, validateTikTokUrl } from '../services/videoSubmissions';
import type { LanguageCode } from '../types/task';

const getRunId = (search: string) => new URLSearchParams(search).get('runId');

export const TikTokSubmissionPage = ({ clearVersion, language, t }: { clearVersion: number; language: LanguageCode; t: (key: string, values?: Record<string, string | number>) => string }) => {
  const location = useLocation();
  const { user, loading: authLoading, signIn } = useAuth();
  const history = useMemo(() => {
    void clearVersion;
    return loadHistory();
  }, [clearVersion]);
  const redirectTarget = `${window.location.origin}${location.pathname}${location.search}`;
  const challenge = useMemo(() => resolveSubmissionChallenge(history, getRunId(location.search)), [history, location.search]);
  const [url, setUrl] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackTone, setFeedbackTone] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitting, setSubmitting] = useState(false);

  const handleUrlChange = (value: string) => {
    setUrl(value);
    setFeedback(null);
    setFeedbackTone('idle');

    if (!value.trim()) {
      return;
    }

    try {
      const result = validateTikTokUrl(value);
      setFeedback(t('tiktok.validation.normalized', { url: result.canonicalUrl }));
      setFeedbackTone('success');
    } catch (error) {
      if (error instanceof TikTokSubmissionError) {
        setFeedback(t(error.translationKey));
      } else {
        setFeedback(t('tiktok.validation.invalid'));
      }
      setFeedbackTone('error');
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!challenge || !user || submitting) {
      return;
    }

    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      setFeedback(t('tiktok.validation.required'));
      setFeedbackTone('error');
      return;
    }

    try {
      const validation = validateTikTokUrl(trimmedUrl);
      setSubmitting(true);
      setFeedback(null);
      setFeedbackTone('idle');
      await submitTikTokVideo({
        userId: user.id,
        challengeId: challenge.taskId,
        challengeTitleSnapshot: localize(challenge.title, language),
        gpsVerifiedAt: challenge.completedAt,
        submittedUrl: trimmedUrl,
        canonicalUrl: validation.canonicalUrl,
        tiktokVideoId: validation.tiktokVideoId,
      });
      setFeedback(t('tiktok.success'));
      setFeedbackTone('success');
      setUrl('');
    } catch (error) {
      if (error instanceof TikTokSubmissionError) {
        setFeedback(t(error.translationKey));
      } else {
        setFeedback(t('tiktok.error.supabase'));
      }
      setFeedbackTone('error');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <Card>
        <div className="flex items-center gap-3 text-slate-200">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>{t('tiktok.loading')}</span>
        </div>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card>
        <div className="flex items-center gap-3 text-cyan-200">
          <LogIn className="h-5 w-5" />
          <p className="text-lg font-semibold">{t('tiktok.signInRequired')}</p>
        </div>
        <p className="mt-4 text-slate-300">{t('tiktok.signInDescription')}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button onClick={() => { void signIn(redirectTarget); }}>{t('tiktok.signIn')}</Button>
          <Link to="/history" className="rounded-full border border-white/20 px-5 py-3 font-black text-white transition hover:bg-white/10">{t('tiktok.backToHistory')}</Link>
        </div>
      </Card>
    );
  }

  if (!challenge) {
    return (
      <Card>
        <div className="flex items-center gap-3 text-cyan-200">
          <Video className="h-5 w-5" />
          <h1 className="text-2xl font-black">{t('tiktok.emptyTitle')}</h1>
        </div>
        <p className="mt-4 text-slate-300">{t('tiktok.emptyDescription')}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/history" className="rounded-full bg-cyan-300 px-5 py-3 font-black text-slate-950 transition hover:bg-cyan-200">{t('tiktok.backToHistory')}</Link>
          <Link to="/challenge" className="rounded-full border border-white/20 px-5 py-3 font-black text-white transition hover:bg-white/10">{t('tiktok.backToChallenges')}</Link>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center gap-3 text-cyan-200">
        <ArrowLeft className="h-5 w-5" />
        <Link to="/history" className="font-semibold transition hover:text-white">{t('tiktok.backToHistory')}</Link>
      </div>
      <div className="mt-6 rounded-[1.5rem] bg-white/10 p-6">
        <p className="text-sm uppercase tracking-[0.2em] text-cyan-200">{t('tiktok.title')}</p>
        <h1 className="mt-2 text-3xl font-black">{t('tiktok.title')}</h1>
        <p className="mt-3 text-slate-300">{t('tiktok.description')}</p>

        <div className="mt-6 rounded-[1.25rem] border border-cyan-400/25 bg-slate-950/50 p-4">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200">{t('tiktok.challengeLabel')}</p>
          <p className="mt-2 text-xl font-bold">{localize(challenge.title, language)}</p>
          <p className="mt-2 text-sm text-slate-300">{t('tiktok.challengeReadOnly')}</p>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-semibold text-slate-200">
            <span className="mb-2 block">{t('tiktok.urlLabel')}</span>
            <input
              type="text"
              inputMode="url"
              value={url}
              onChange={(event) => handleUrlChange(event.target.value)}
              placeholder={t('tiktok.urlPlaceholder')}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none ring-0"
              autoComplete="url"
            />
          </label>

          <div
            className={`rounded-2xl px-4 py-3 text-sm ${feedbackTone === 'error' ? 'bg-rose-500/15 text-rose-200' : feedbackTone === 'success' ? 'bg-emerald-500/15 text-emerald-200' : 'bg-white/10 text-slate-300'}`}
            role={feedbackTone === 'success' ? 'status' : undefined}
            aria-live={feedbackTone === 'success' ? 'polite' : undefined}
          >
            {feedback ?? t('tiktok.urlHelp')}
          </div>

          <div className="rounded-2xl border border-amber-300/35 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
            {t('tiktok.publicNotice')}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={submitting || !url.trim()}>
              {submitting ? <><Loader2 className="mr-2 inline h-4 w-4 animate-spin" />{t('tiktok.submitting')}</> : <><Video className="mr-2 inline h-4 w-4" />{t('tiktok.submit')}</>}
            </Button>
            <Link to="/history" className="rounded-full border border-white/20 px-5 py-3 font-black text-white transition hover:bg-white/10">{t('tiktok.backToHistory')}</Link>
          </div>
        </form>

      </div>
    </Card>
  );
};
