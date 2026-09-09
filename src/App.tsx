import { lazy, Suspense, useEffect, useState, type ReactElement } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigationType } from 'react-router-dom';
import { Loader2, LogIn } from 'lucide-react';
import { Layout } from './components/Layout';
import { MobileAppShell } from './components/MobileAppShell';
import { ProductSurfaceFrame } from './components/ProductSurfaceFrame';
import { Card } from './components/Card';
import { useAuth } from './contexts/AuthContext';
import { useAdminStatus } from './hooks/useAdminStatus';
import { useTasks } from './hooks/useTasks';
import { useTranslation } from './hooks/useTranslation';
import { AdminPage } from './pages/AdminPage';
import { BookPageRoute } from './pages/BookPageRoute';
import { BookUtilityPage } from './pages/BookUtilityPage';
import { CreditsPage } from './pages/CreditsPage';
import { LegalSafetyPage } from './pages/LegalSafetyPage';
import { ModerationPage } from './pages/ModerationPage';
import { SavedBookPage } from './pages/SavedBookPage';
import { TikTokSubmissionPage } from './pages/TikTokSubmissionPage';
import { CHALLENGE_CLEAR_VERSION_KEY, getChallengeClearVersion } from './services/tasks';
import { JourneyPage } from './pages/JourneyPage';
import { JourneyGuard } from './components/JourneyGuard';
import { OpenBookPage } from './pages/OpenBookPage';
import { HISTORY_CHAPTER_ID } from './services/journey';
import './journey.css';

const NewBookPage = lazy(() => import('./pages/NewBookPage').then((module) => ({ default: module.NewBookPage })));
const ChallengePage = lazy(() => import('./pages/ChallengePage').then((module) => ({ default: module.ChallengePage })));
const GameMapPage = lazy(() => import('./pages/GameMapPage').then((module) => ({ default: module.GameMapPage })));

const SIGNATURE_EXPERIENCE_IDS = new Set([
  'nhin-xuong-long-chao-cua-chung-ta',
  'tim-cay-xoai-co-thu',
  'thac-ke-nenh-mthen',
  'de-xe-may-ngoai-troi-qua-dem',
]);

const parseClearVersion = (value: string | null): number => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return parsed;
};

const normalizeRoutePath = (pathname: string): string => {
  const normalized = pathname.toLowerCase().replace(/\/+$/, '');
  return normalized || '/';
};

const AuthenticatedRoute = ({
  t,
  redirectPath,
  children,
}: {
  t: (key: string, values?: Record<string, string | number>) => string;
  redirectPath: string;
  children: ReactElement;
}) => {
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

export default function App() {
  const { language, setLanguage, t } = useTranslation();
  const { tasks, setTasks } = useTasks();
  const { isAdmin, checkingAdmin, adminCheckFailed } = useAdminStatus();
  const [clearVersion, setClearVersion] = useState(() => getChallengeClearVersion());
  const location = useLocation();
  const navigationType = useNavigationType();

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
    if (navigationType === 'POP') return;

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

  const guard = (children: ReactElement) => <JourneyGuard language={language}>{children}</JourneyGuard>;
  const publicRoutes = (
    <Suspense fallback={<p className="journey-page" role="status">{language === 'vi' ? 'Đang mở câu chuyện…' : 'Opening the story…'}</p>}>
    <Routes>
      <Route path="/" element={<JourneyPage language={language} tasks={tasks} />} />
      <Route path="/journey/1954" element={<JourneyPage language={language} tasks={tasks} />} />
      <Route path="/journey/culture" element={<JourneyGuard language={language} cultureOnly><JourneyPage language={language} tasks={tasks} culture /></JourneyGuard>} />
      <Route path="/book" element={guard(<OpenBookPage language={language} />)} />
      <Route path={`/book/chapter/${HISTORY_CHAPTER_ID}`} element={<Navigate to="/journey/1954" replace />} />
      <Route path="/book/page/1954-duoi-mot-thanh-pho-dang-song" element={<Navigate to="/journey/1954" replace />} />
      <Route path="/book/chapter/:chapterId" element={guard(<NewBookPage language={language} />)} />
      <Route path="/book/page/:pageId" element={guard(<BookPageRoute />)} />
      <Route path="/recent" element={<Navigate to="/book" replace />} />
      <Route path="/saved" element={guard(<SavedBookPage language={language} />)} />
      <Route path="/nearby" element={guard(<BookUtilityPage language={language} mode="near-me" />)} />
      <Route path="/credits" element={<CreditsPage language={language} />} />
      <Route path="/challenge" element={guard(<ChallengePage tasks={tasks.filter((task) => SIGNATURE_EXPERIENCE_IDS.has(task.id))} clearVersion={clearVersion} language={language} t={t} />)} />
      <Route path="/map" element={guard(<GameMapPage tasks={tasks.filter((task) => SIGNATURE_EXPERIENCE_IDS.has(task.id))} language={language} t={t} />)} />
      <Route path="/near-me" element={<Navigate to="/nearby" replace />} />
      <Route path="/history" element={<Navigate to="/book" replace />} />
      <Route path="/experiences" element={<Navigate to="/challenge" replace />} />
      <Route path="/discover" element={<Navigate to="/challenge" replace />} />
      <Route path="/leaderboard" element={<Navigate to="/challenge" replace />} />
      <Route path="/submit-tiktok" element={guard(<ProductSurfaceFrame surface="challenge"><TikTokSubmissionPage clearVersion={clearVersion} language={language} t={t} /></ProductSurfaceFrame>)} />
      <Route path="/guilds" element={<Navigate to="/" replace />} />
      <Route path="/guild" element={<Navigate to="/" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </Suspense>
  );

  const normalizedPathname = normalizeRoutePath(location.pathname);
  const staffOrLegalRoute = ['/admin', '/moderation', '/privacy', '/legal'].includes(normalizedPathname);

  if (staffOrLegalRoute) {
    return (
      <Layout
        language={language}
        setLanguage={setLanguage}
        t={t}
        isAdmin={isAdmin}
        checkingAdmin={checkingAdmin}
      >
        <Routes>
          <Route path="/privacy" element={<LegalSafetyPage t={t} />} />
          <Route path="/legal" element={<LegalSafetyPage t={t} />} />
          <Route path="/moderation" element={(
            <ModerationPage
              language={language}
              t={t}
              isAdmin={isAdmin}
              checkingAdmin={checkingAdmin}
              adminCheckFailed={adminCheckFailed}
            />
          )} />
          <Route path="/admin" element={<AuthenticatedRoute t={t} redirectPath="/admin"><AdminPage tasks={tasks} setTasks={setTasks} t={t} /></AuthenticatedRoute>} />
        </Routes>
      </Layout>
    );
  }

  return (
    <MobileAppShell
      language={language}
      setLanguage={setLanguage}
      isAdmin={isAdmin}
      checkingAdmin={checkingAdmin}
    >
      {publicRoutes}
    </MobileAppShell>
  );
}
