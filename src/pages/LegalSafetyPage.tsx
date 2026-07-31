import { useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { Card } from '../components/Card';
import { ChallengeStorageLockUnavailableError } from '../services/challengeStorageLock';
import { clearLocalChallengeData } from '../services/tasks';

export const LegalSafetyPage = ({ t }: { t: (key: string) => string }) => {
  const [clearFeedback, setClearFeedback] = useState<string | null>(null);

  const handleClearLocalData = async () => {
    const confirmed = window.confirm(t('legal.clear.confirm'));
    if (!confirmed) {
      return;
    }

    try {
      await clearLocalChallengeData();
      setClearFeedback(t('legal.clear.success'));
    } catch (error) {
      if (error instanceof ChallengeStorageLockUnavailableError) {
        setClearFeedback(t('legal.clear.lockUnavailable'));
        return;
      }
      setClearFeedback(t('legal.clear.failed'));
    }
  };

  return (
    <div className="grid gap-5">
      <Card>
        <p className="text-sm uppercase tracking-[0.2em] text-cyan-200">{t('legal.heading')}</p>
        <h1 className="mt-2 text-3xl font-black">{t('legal.title')}</h1>
        <p className="mt-3 text-slate-300">{t('legal.updated')}</p>
        <div className="mt-5 rounded-2xl border border-cyan-300/30 bg-cyan-400/10 p-4">
          <p className="font-semibold text-cyan-100">{t('legal.operatorLabel')}</p>
          <p className="mt-1 text-white">{t('legal.operatorName')}</p>
          <p className="mt-3 font-semibold text-cyan-100">{t('legal.contactLabel')}</p>
          <a href="mailto:apachaigps@gmail.com" className="mt-1 inline-block text-white underline decoration-cyan-300/50 underline-offset-4 transition hover:text-cyan-100">
            apachaigps@gmail.com
          </a>
        </div>
      </Card>

      <Card>
        <h2 className="text-2xl font-black">{t('legal.privacy.title')}</h2>
        <p className="mt-3 text-slate-300">{t('legal.privacy.intro')}</p>
        <div className="mt-4 grid gap-3">
          <article className="rounded-2xl bg-white/10 p-4">
            <p className="font-semibold text-cyan-100">{t('legal.privacy.dataCategoriesTitle')}</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-200">
              <li>{t('legal.privacy.dataCategories.identity')}</li>
              <li>{t('legal.privacy.dataCategories.profile')}</li>
              <li>{t('legal.privacy.dataCategories.gpsTransient')}</li>
              <li>{t('legal.privacy.dataCategories.gpsResult')}</li>
              <li>{t('legal.privacy.dataCategories.localProgress')}</li>
              <li>{t('legal.privacy.dataCategories.tiktok')}</li>
              <li>{t('legal.privacy.dataCategories.votes')}</li>
              <li>{t('legal.privacy.dataCategories.moderation')}</li>
            </ul>
          </article>

          <article className="rounded-2xl bg-white/10 p-4">
            <p className="font-semibold text-cyan-100">{t('legal.privacy.gpsStatementTitle')}</p>
            <p className="mt-2 text-slate-200">{t('legal.privacy.gpsStatementBody')}</p>
          </article>

          <article className="rounded-2xl bg-white/10 p-4">
            <p className="font-semibold text-cyan-100">{t('legal.privacy.publicVisibilityTitle')}</p>
            <p className="mt-2 text-slate-200">{t('legal.privacy.publicVisibilityBody')}</p>
          </article>

          <article className="rounded-2xl bg-white/10 p-4">
            <p className="font-semibold text-cyan-100">{t('legal.privacy.storageTitle')}</p>
            <p className="mt-2 text-slate-200">{t('legal.privacy.storageBody')}</p>
          </article>

          <article className="rounded-2xl bg-white/10 p-4">
            <p className="font-semibold text-cyan-100">{t('legal.privacy.externalServicesTitle')}</p>
            <p className="mt-2 text-slate-200">{t('legal.privacy.externalServicesBody')}</p>
          </article>

          <article className="rounded-2xl bg-white/10 p-4">
            <p className="font-semibold text-cyan-100">{t('legal.privacy.retentionTitle')}</p>
            <p className="mt-2 text-slate-200">{t('legal.privacy.retentionBody')}</p>
          </article>

          <article className="rounded-2xl bg-white/10 p-4">
            <p className="font-semibold text-cyan-100">{t('legal.privacy.rightsTitle')}</p>
            <p className="mt-2 text-slate-200">{t('legal.privacy.rightsBody')}</p>
          </article>
        </div>
      </Card>

      <Card>
        <h2 className="text-2xl font-black">{t('legal.terms.title')}</h2>
        <div className="mt-4 grid gap-3">
          <article className="rounded-2xl bg-white/10 p-4">
            <p className="font-semibold text-cyan-100">{t('legal.terms.pilotScopeTitle')}</p>
            <p className="mt-2 text-slate-200">{t('legal.terms.pilotScopeBody')}</p>
          </article>

          <article className="rounded-2xl bg-white/10 p-4">
            <p className="font-semibold text-cyan-100">{t('legal.terms.ageTitle')}</p>
            <p className="mt-2 text-slate-200">{t('legal.terms.ageBody')}</p>
          </article>

          <article className="rounded-2xl bg-white/10 p-4">
            <p className="font-semibold text-cyan-100">{t('legal.terms.communityTitle')}</p>
            <p className="mt-2 text-slate-200">{t('legal.terms.communityBody')}</p>
          </article>

          <article className="rounded-2xl bg-white/10 p-4">
            <p className="font-semibold text-cyan-100">{t('legal.terms.safetyTitle')}</p>
            <p className="mt-2 text-slate-200">{t('legal.terms.safetyBody')}</p>
          </article>

          <article className="rounded-2xl bg-white/10 p-4">
            <p className="font-semibold text-cyan-100">{t('legal.terms.moderationTitle')}</p>
            <p className="mt-2 text-slate-200">{t('legal.terms.moderationBody')}</p>
          </article>

          <article className="rounded-2xl bg-white/10 p-4">
            <p className="font-semibold text-cyan-100">{t('legal.terms.serviceScopeTitle')}</p>
            <p className="mt-2 text-slate-200">{t('legal.terms.serviceScopeBody')}</p>
          </article>

          <article className="rounded-2xl border border-amber-300/40 bg-amber-300/10 p-4">
            <div className="flex items-start gap-3">
              <ShieldAlert className="mt-0.5 h-5 w-5 text-amber-200" />
              <p className="text-amber-100">{t('legal.terms.noComplianceGuarantee')}</p>
            </div>
          </article>
        </div>
      </Card>

      <Card>
        <h2 className="text-2xl font-black">{t('legal.clear.title')}</h2>
        <p className="mt-3 text-slate-300">{t('legal.clear.description')}</p>
        <p className="mt-2 text-slate-300">{t('legal.clear.keys')}</p>
        <p className="mt-2 text-slate-300">{t('legal.clear.note')}</p>

        <button
          type="button"
          onClick={() => { void handleClearLocalData(); }}
          className="mt-5 rounded-full bg-cyan-300 px-5 py-3 font-black text-slate-950 transition hover:bg-cyan-200"
        >
          {t('legal.clear.action')}
        </button>

        {clearFeedback ? (
          <div className="mt-4 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-emerald-200" role="status" aria-live="polite">
            {clearFeedback}
          </div>
        ) : null}
      </Card>
    </div>
  );
};
