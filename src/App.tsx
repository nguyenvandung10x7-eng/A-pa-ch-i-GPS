import { Route, Routes } from 'react-router-dom';
import { Loader2, LogIn, ShieldCheck } from 'lucide-react';
import { Layout } from './components/Layout';
import { Card } from './components/Card';
import { useAuth } from './contexts/AuthContext';
import { useTasks } from './hooks/useTasks';
import { useTranslation } from './hooks/useTranslation';
import { useAdminStatus } from './hooks/useAdminStatus';
import { AdminPage } from './pages/AdminPage';
import { ChallengePage } from './pages/ChallengePage';
import { DiscoverPage } from './pages/DiscoverPage';
import { HistoryPage } from './pages/HistoryPage';
import { LandingPage } from './pages/LandingPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { ModerationPage } from './pages/ModerationPage';
import { TikTokSubmissionPage } from './pages/TikTokSubmissionPage';

const AdminOnlyRoute = ({
  t,
  redirectPath,
  children,
}: {
  t: (key: string, values?: Record<string, string | number>) => string;
  redirectPath: string;
  children: JSX.Element;
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
  return (
    <Layout language={language} setLanguage={setLanguage} t={t}>
      <Routes>
        <Route path="/" element={<LandingPage tasks={tasks} t={t} />} />
        <Route path="/challenge" element={<ChallengePage tasks={activeTasks} language={language} t={t} />} />
        <Route path="/history" element={<HistoryPage language={language} t={t} />} />
        <Route path="/discover" element={<DiscoverPage language={language} t={t} />} />
        <Route path="/leaderboard" element={<LeaderboardPage language={language} t={t} />} />
        <Route path="/submit-tiktok" element={<TikTokSubmissionPage language={language} t={t} />} />
        <Route path="/moderation" element={<ModerationPage language={language} t={t} />} />
        <Route path="/admin" element={<AdminOnlyRoute t={t} redirectPath="/admin"><AdminPage tasks={tasks} setTasks={setTasks} t={t} /></AdminOnlyRoute>} />
      </Routes>
    </Layout>
  );
}
