import { useEffect, useRef, useState, type ReactElement } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigationType } from 'react-router-dom';
import { Loader2, LogIn, ShieldCheck } from 'lucide-react';
import { Layout } from './components/Layout';
import { MobileAppShell } from './components/MobileAppShell';
import { ProductSurfaceFrame } from './components/ProductSurfaceFrame';
import { Card } from './components/Card';
import { useAuth } from './contexts/AuthContext';
import { useTasks } from './hooks/useTasks';
import { useTranslation } from './hooks/useTranslation';
import { useAdminStatus } from './hooks/useAdminStatus';
import { AdminPage } from './pages/AdminPage';
import { NewBookPage } from './pages/NewBookPage';
import { BookPageRoute } from './pages/BookPageRoute';
import { BookUtilityPage } from './pages/BookUtilityPage';
import { ChallengePage } from './pages/ChallengePage';
import { CreditsPage } from './pages/CreditsPage';
import { DiscoverPage } from './pages/DiscoverPage';
import { LegalSafetyPage } from './pages/LegalSafetyPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { ModerationPage } from './pages/ModerationPage';
import { SavedBookPage } from './pages/SavedBookPage';
import { TikTokSubmissionPage } from './pages/TikTokSubmissionPage';
import { CHALLENGE_CLEAR_VERSION_KEY, getChallengeClearVersion } from './services/tasks';

const parseClearVersion = (value: string | null): number => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return parsed;
};

const isBookPath = (pathname: string): boolean =>
  pathname === '/book' || pathname.startsWith('/book/');

const normalizeRoutePath = (pathname: string): string => {
  const normalized = pathname.toLowerCase().replace(/\/+$/, '');
  return normalized || '/';
};

const AdminOnlyRoute = ({
  t,
  redirectPath,
  children,
}: {
  t: (key: string, values?: Record<string, string | number>) => string;
  redirectPath: string;
  children: ReactElement;
}) => {
  const { user, loading, signIn } = useAuth();
  const { isAdmin, checkingAdmin } = useAdminStatus();

  if (loading) {
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
          onClick={() => { void signIn(`${window.location.origin}${redirectPath}`); }}
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

  return children;
};

export default function App() {
  const { language, setLanguage, t } = useTranslation();
  const { tasks, setTasks, activeTasks } = useTasks();
  const [clearVersion, setClearVersion] = useState(() => getChallengeClearVersion());
  const location = useLocation();
  const navigationType = useNavigationType();
  const previousPathRef = useRef(location.pathname);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.storageArea !== window.localStorage) return;
      if (event.key !== CHALLENGE_CLEAR_VERSION_KEY) return;
      if (event.newValue === null) return;
      if (event.newValue === event.oldValue) return;
      const nextVersion = parseClearVersion(event.newValue);
      const previousVersion = parseClearVersion(event.oldValue);
      if (nextVersion === previousVersion) return;
      setClearVersion(nextVersion);
    };

    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  useEffect(() => {
    const previousPath = previousPathRef.current;
    previousPathRef.current = location.pathname;

    if (navigationType === 'POP') return;
    if (!isBookPath(previousPath) && !isBookPath(location.pathname)) return;

    const frameId = window.requestAnimationFrame(() => {
      const targetId = location.hash.startsWith('#') ? location.hash.slice(1) : '';
      const target = targetId ? document.getElementById(targetId) : null;
      if (target) {
        target.scrollIntoView({ block: 'start', behavior: 'auto' });
        return;
      }
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [location.hash, location.pathname, navigationType]);

  const publicRoutes = (
    <Routes>
      <Route path="/" element={<Navigate to="/book" replace />} />
      <Route path="/book" element={<NewBookPage language={language} />} />
      <Route path="/book/chapter/:chapterId" element={<NewBookPage language={language} />} />
      <Route path="/book/page/:pageId" element={<BookPageRoute language={language} />} />
      <Route path="/recent" element={<Navigate to="/book" replace />} />
      <Route path="/saved" element={<SavedBookPage language={language} />} />
      <Route path="/nearby" element={<BookUtilityPage language={language} mode="near-me" />} />
      <Route path="/credits" element={<CreditsPage language={language} />} />
      <Route path="/challenge" element={<ChallengePage tasks={activeTasks} clearVersion={clearVersion} language={language} t={t} />} />
      <Route path="/near-me" element={<Navigate to="/nearby" replace />} />
      <Route path="/history" element={<Navigate to="/book" replace />} />
      <Route path="/experiences" element={<Navigate to="/challenge" replace />} />
      <Route path="/discover" element={<ProductSurfaceFrame surface="challenge"><DiscoverPage language={language} t={t} /></ProductSurfaceFrame>} />
      <Route path="/leaderboard" element={<ProductSurfaceFrame surface="challenge"><LeaderboardPage language={language} t={t} /></ProductSurfaceFrame>} />
      <Route path="/submit-tiktok" element={<ProductSurfaceFrame surface="challenge"><TikTokSubmissionPage clearVersion={clearVersion} language={language} t={t} /></ProductSurfaceFrame>} />
    </Routes>
  );

  const normalizedPathname = normalizeRoutePath(location.pathname);
  const staffOrLegalRoute = ['/admin', '/moderation', '/privacy', '/legal'].includes(normalizedPathname);

  return (
    <Layout language={language} setLanguage={setLanguage} t={t}>
      {staffOrLegalRoute ? (
        <Routes>
          <Route path="/privacy" element={<LegalSafetyPage t={t} />} />
          <Route path="/legal" element={<LegalSafetyPage t={t} />} />
          <Route path="/moderation" element={<ModerationPage language={language} t={t} />} />
          <Route path="/admin" element={<AdminOnlyRoute t={t} redirectPath="/admin"><AdminPage tasks={tasks} setTasks={setTasks} t={t} /></AdminOnlyRoute>} />
        </Routes>
      ) : (
        <MobileAppShell language={language} setLanguage={setLanguage}>{publicRoutes}</MobileAppShell>
      )}
    </Layout>
  );
}
