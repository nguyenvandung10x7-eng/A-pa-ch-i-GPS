import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { useTasks } from './hooks/useTasks';
import { useTranslation } from './hooks/useTranslation';
import { AdminPage } from './pages/AdminPage';
import { ChallengePage } from './pages/ChallengePage';
import { DiscoverPage } from './pages/DiscoverPage';
import { HistoryPage } from './pages/HistoryPage';
import { LandingPage } from './pages/LandingPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { TikTokSubmissionPage } from './pages/TikTokSubmissionPage';

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
        <Route path="/admin" element={<AdminPage tasks={tasks} setTasks={setTasks} t={t} />} />
      </Routes>
    </Layout>
  );
}
