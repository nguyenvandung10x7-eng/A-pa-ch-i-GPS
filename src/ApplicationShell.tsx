import { lazy, Suspense, useEffect, useRef, useState, type ReactElement } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigationType } from 'react-router-dom';
import { Loader2, LogIn } from 'lucide-react';
import { Layout } from './components/Layout';
import { MobileAppShell } from './components/MobileAppShell';
import { ProductSurfaceFrame } from './components/ProductSurfaceFrame';
import { Card } from './components/Card';
import { useAuth } from './contexts/AuthContext';
import { useAdminStatus } from './hooks/useAdminStatus';
import { useTasks } from './hooks/useTasks';
import { CHALLENGE_CLEAR_VERSION_KEY, getChallengeClearVersion } from './services/tasks';
import type { LanguageCode } from './types/task';

const AdminPage = lazy(() => import('./pages/AdminPage').then((module) => ({ default: module.AdminPage })));
const NewBookPage = lazy(() => import('./pages/NewBookPage').then((module) => ({ default: module.NewBookPage })));
const BookPageRoute = lazy(() => import('./pages/BookPageRoute').then((module) => ({ default: module.BookPageRoute })));
const BookUtilityPage = lazy(() => import('./pages/BookUtilityPage').then((module) => ({ default: module.BookUtilityPage })));
const ChallengePage = lazy(() => import('./pages/ChallengePage').then((module) => ({ default: module.ChallengePage })));
const CreditsPage = lazy(() => import('./pages/CreditsPage').then((module) => ({ default: module.CreditsPage })));
const DiscoverPage = lazy(() => import('./pages/DiscoverPage').then((module) => ({ default: module.DiscoverPage })));
const GameMapPage = lazy(() => import('./pages/GameMapPage').then((module) => ({ default: module.GameMapPage })));
const LegalSafetyPage = lazy(() => import('./pages/LegalSafetyPage').then((module) => ({ default: module.LegalSafetyPage })));
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage').then((module) => ({ default: module.LeaderboardPage })));
const ModerationPage = lazy(() => import('./pages/ModerationPage').then((module) => ({ default: module.ModerationPage })));
const SavedBookPage = lazy(() => import('./pages/SavedBookPage').then((module) => ({ default: module.SavedBookPage })));
const TikTokSubmissionPage = lazy(() => import('./pages/TikTokSubmissionPage').then((module) => ({ default: module.TikTokSubmissionPage })));

type Translate = (key: string, values?: Record<string, string | number>) => string;

type ApplicationShellProps = {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
  t: Translate;
};

const parseClearVersion = (value: string | null): number => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return parsed;
};

const isBookPath = (pathname: string): boolean => pathname === '/book' || pathname.startsWith('/book/');

const normalizeRoutePath = (pathname: string): string => {
  const normalized = pathname.toLowerCase().replace(/\/+$/, '');
  return normalized || '/';
};

const RouteLoader = ({ language }: { language: LanguageCode }) => (
  <main className="flex min-h-[60dvh] items-center justify-center px-6 text-center" role="status">
    <div>
      <Loader2 className="mx-auto h-7 w-7 animate-spin" aria-hidden="true" />
      <p className="mt-4 font-bold">{language === 'vi' ? 'Đang mở trải nghiệm…' : 'Opening the experience…'}</p>
    </div>
  </main>
);

const AuthenticatedRoute = ({ t, redirectPath, children }: { t: Translate; redirectPath: string; children: ReactElement }) => {
  const { user, loading, signIn } = useAuth();

  if (loading) {
    return (
      <Card>
        <div className="flex items-center gap-3 text-slate-200">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>{t('admin.authLoading')}</span>
        </div>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card>
        <div className="flex items-center gap-3 text-cyan-200">
          <LogIn className="h-5 w-5" />
          <p className="text-lg font-semibold">{t('admin.signInRequired')}</p>
        </div>
        <p className="mt-4 text-slate-300">{t('admin.signInDescription')}</p>
        <button
          type="button"
          onClick={() => { void signIn(`${window.location.origin}${redirectPath}`); }}
          className="mt-6 rounded-full bg-cyan-400 px-5 py-3 font-black text-slate-950 transition hover:bg-cyan-300"
        >
          {t('admin.signIn')}
        </button>
      </Card>
    );
  }

  return children;
};

export const ApplicationShell = ({ language, setLanguage, t }: ApplicationShellProps) => {
  const { tasks, setTasks } = useTasks();
  const { isAdmin, checkingAdmin, adminCheckFailed } = useAdminStatus();
  const [clearVersion, setClearVersion] = useState(() => getChallengeClearVersion());
  const location = useLocation();
  const navigationType = useNavigationType();
  const previousPathRef = useRef(location.pathname);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.storageArea !== window.localStorage) return;
      if (event.key !== CHALLENGE_CLEAR_VERSION_KEY) return;
      if (event.newValue === null || event.newValue === event.oldValue) return;
      const nextVersion = parseClearVersion(event.newValue);
      const previousVersion = parseClearVersion(event.oldValue);
      if (nextVersion !== previousVersion) setClearVersion(nextVersion);
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
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
    <Suspense fallback={<RouteLoader language={language} />}>
      <Routes>
        <Route path="/book" element={<NewBookPage language={language} />} />
        <Route path="/book/chapter/:chapterId" element={<NewBookPage language={language} />} />
        <Route path="/book/page/:pageId" element={<BookPageRoute />} />
        <Route path="/recent" element={<Navigate to="/book" replace />} />
        <Route path="/saved" element={<SavedBookPage language={language} />} />
        <Route path="/nearby" element={<BookUtilityPage language={language} mode="near-me" />} />
        <Route path="/credits" element={<CreditsPage language={language} />} />
        <Route path="/challenge" element={<ChallengePage tasks={tasks} clearVersion={clearVersion} language={language} t={t} />} />
        <Route path="/map" element={<GameMapPage tasks={tasks} language={language} t={t} />} />
        <Route path="/near-me" element={<Navigate to="/nearby" replace />} />
        <Route path="/history" element={<Navigate to="/book" replace />} />
        <Route path="/discover" element={<ProductSurfaceFrame surface="challenge"><DiscoverPage language={language} t={t} /></ProductSurfaceFrame>} />
        <Route path="/leaderboard" element={<ProductSurfaceFrame surface="challenge"><LeaderboardPage language={language} t={t} /></ProductSurfaceFrame>} />
        <Route path="/submit-tiktok" element={<ProductSurfaceFrame surface="challenge"><TikTokSubmissionPage clearVersion={clearVersion} language={language} t={t} /></ProductSurfaceFrame>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );

  const normalizedPathname = normalizeRoutePath(location.pathname);
  const staffOrLegalRoute = ['/admin', '/moderation', '/privacy', '/legal'].includes(normalizedPathname);

  return (
    <Layout language={language} setLanguage={setLanguage} t={t} isAdmin={isAdmin} checkingAdmin={checkingAdmin}>
      {staffOrLegalRoute ? (
        <Suspense fallback={<RouteLoader language={language} />}>
          <Routes>
            <Route path="/privacy" element={<LegalSafetyPage t={t} />} />
            <Route path="/legal" element={<LegalSafetyPage t={t} />} />
            <Route path="/moderation" element={<ModerationPage language={language} t={t} isAdmin={isAdmin} checkingAdmin={checkingAdmin} adminCheckFailed={adminCheckFailed} />} />
            <Route path="/admin" element={<AuthenticatedRoute t={t} redirectPath="/admin"><AdminPage tasks={tasks} setTasks={setTasks} t={t} /></AuthenticatedRoute>} />
          </Routes>
        </Suspense>
      ) : (
        <MobileAppShell language={language} setLanguage={setLanguage} isAdmin={isAdmin} checkingAdmin={checkingAdmin}>
          {publicRoutes}
        </MobileAppShell>
      )}
    </Layout>
  );
};
