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
  const [hasConsent, setHasConsent] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackTone, setFeedbackTone] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitting, setSubmitting] = useState(false);
  const privacyLinkLabel = language === 'vi' ? 'Chính sách quyền riêng tư' : 'Privacy Policy';
  const consentLabel = language === 'vi'
    ? 'Tôi đồng ý để A Pa Chải GPS lưu trữ, kiểm duyệt và công khai liên kết TikTok này nếu nội dung được phê duyệt. Tôi xác nhận có quyền chia sẻ nội dung đã gửi.'
    : 'I agree that A Pa Chai GPS may store, review, and publicly display this TikTok link if approved. I confirm that I have the right to share the submitted content.';

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
    if (!challenge || !user || submitting || !hasConsent) {
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
      setHasConsent(false);
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
        <div className="flex items-center gap-3 text-[var(--forest-900)]">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>{t('tiktok.loading')}</span>
        </div>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card>
        <div className="flex items-center gap-3 text-[var(--earth-800)]">
          <LogIn className="h-5 w-5" />
          <p className="text-lg font-semibold">{t('tiktok.signInRequired')}</p>
        </div>
        <p className="mt-4 text-[var(--forest-800)]">{t('tiktok.signInDescription')}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button onClick={() => { void signIn(redirectTarget); }}>{t('tiktok.signIn')}</Button>
          <Link to="/challenge" className="inline-flex min-h-[3rem] items-center justify-center rounded-full border border-[rgba(61,84,52,0.14)] px-5 py-3 font-black text-[var(--forest-900)] transition hover:bg-[rgba(255,255,255,0.56)]">{t('tiktok.backToChallenges')}</Link>
        </div>
      </Card>
    );
  }

  if (!challenge) {
    return (
      <Card>
        <div className="flex items-center gap-3 text-[var(--earth-800)]">
          <Video className="h-5 w-5" />
          <h1 className="text-2xl font-black">{t('tiktok.emptyTitle')}</h1>
        </div>
        <p className="mt-4 text-[var(--forest-800)]">{t('tiktok.emptyDescription')}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/challenge" className="wood-panel inline-flex min-h-[3rem] items-center justify-center rounded-full px-5 py-3 font-black text-[var(--earth-900)] transition hover:-translate-y-px">{t('tiktok.backToChallenges')}</Link>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center gap-3 text-[var(--earth-800)]">
        <ArrowLeft className="h-5 w-5" />
        <Link to="/challenge" className="font-semibold transition hover:text-[var(--forest-950)]">{t('tiktok.backToChallenges')}</Link>
      </div>
      <div className="mt-6 rounded-[1.6rem] bg-[rgba(255,255,255,0.52)] p-5 ring-1 ring-[rgba(61,84,52,0.12)] sm:p-6">
        <p className="section-kicker">{t('tiktok.title')}</p>
        <h1 className="mt-2 text-3xl font-black text-[var(--forest-950)]">{t('tiktok.title')}</h1>
        <p className="mt-3 text-[var(--forest-800)]">{t('tiktok.description')}</p>

        <div className="mt-6 rounded-[1.25rem] border border-[rgba(112,79,39,0.14)] bg-[rgba(255,247,229,0.72)] p-4">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--earth-800)]">{t('tiktok.challengeLabel')}</p>
          <p className="mt-2 text-xl font-bold text-[var(--forest-950)]">{localize(challenge.title, language)}</p>
          <p className="mt-2 text-sm text-[var(--forest-700)]">{t('tiktok.challengeReadOnly')}</p>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-semibold text-[var(--forest-900)]">
            <span className="mb-2 block">{t('tiktok.urlLabel')}</span>
            <input
              type="text"
              inputMode="url"
              value={url}
              onChange={(event) => handleUrlChange(event.target.value)}
              placeholder={t('tiktok.urlPlaceholder')}
              className="w-full rounded-[1.25rem] border border-[rgba(61,84,52,0.14)] bg-[rgba(255,255,255,0.72)] px-4 py-3 text-[var(--forest-950)] outline-none ring-0 focus-visible:ring-4 focus-visible:ring-[rgba(220,179,85,0.24)]"
              autoComplete="url"
            />
          </label>

          <div
            className={`rounded-[1.25rem] px-4 py-3 text-sm leading-6 ${feedbackTone === 'error' ? 'bg-[rgba(170,85,70,0.12)] text-[var(--brocade-red)]' : feedbackTone === 'success' ? 'bg-[rgba(85,122,72,0.12)] text-[var(--forest-800)]' : 'bg-[rgba(255,255,255,0.56)] text-[var(--forest-700)] ring-1 ring-[rgba(61,84,52,0.08)]'}`}
            role={feedbackTone === 'success' ? 'status' : undefined}
            aria-live={feedbackTone === 'success' ? 'polite' : undefined}
          >
            {feedback ?? t('tiktok.urlHelp')}
          </div>

          <div className="rounded-[1.25rem] border border-[rgba(112,79,39,0.14)] bg-[rgba(255,247,229,0.72)] px-4 py-3 text-sm leading-6 text-[var(--earth-900)]">
            {t('tiktok.publicNotice')}
          </div>

          <label className="flex items-start gap-3 rounded-[1.25rem] border border-[rgba(61,84,52,0.12)] bg-[rgba(255,255,255,0.48)] px-4 py-3 text-sm leading-6 text-[var(--forest-900)]">
            <input
              type="checkbox"
              checked={hasConsent}
              onChange={(event) => setHasConsent(event.target.checked)}
              className="mt-1 h-4 w-4 rounded border-[rgba(61,84,52,0.24)] bg-[rgba(255,255,255,0.9)]"
              required
            />
            <span>{consentLabel}</span>
          </label>

          <p className="text-sm text-[var(--forest-700)]">
            <Link to="/privacy" className="font-semibold text-[var(--forest-900)] underline decoration-[rgba(61,84,52,0.28)] underline-offset-4 transition hover:text-[var(--forest-950)]">
              {privacyLinkLabel}
            </Link>
          </p>

          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={submitting || !url.trim() || !hasConsent}>
              {submitting ? <><Loader2 className="mr-2 inline h-4 w-4 animate-spin" />{t('tiktok.submitting')}</> : <><Video className="mr-2 inline h-4 w-4" />{t('tiktok.submit')}</>}
            </Button>
            <Link to="/challenge" className="inline-flex min-h-[3rem] items-center justify-center rounded-full border border-[rgba(61,84,52,0.14)] px-5 py-3 font-black text-[var(--forest-900)] transition hover:bg-[rgba(255,255,255,0.56)]">{t('tiktok.backToChallenges')}</Link>
          </div>
        </form>
      </div>
    </Card>
  );
};
