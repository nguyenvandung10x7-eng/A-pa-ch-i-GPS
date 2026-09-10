import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useTranslation } from './hooks/useTranslation';

const ExperiencesHubPage = lazy(() => import('./pages/ExperiencesHubPage').then((module) => ({ default: module.ExperiencesHubPage })));
const JourneyPage = lazy(() => import('./pages/JourneyPage').then((module) => ({ default: module.JourneyPage })));
const PhiengLoiGamePage = lazy(() => import('./pages/PhiengLoiGamePage').then((module) => ({ default: module.PhiengLoiGamePage })));
const ApplicationEntry = lazy(() => import('./ApplicationEntry').then((module) => ({ default: module.ApplicationEntry })));

const normalizeRoutePath = (pathname: string): string => {
  const normalized = pathname.toLowerCase().replace(/\/+$/, '');
  return normalized || '/';
};

const EXPERIENCE_ROUTE_PATHS = new Set(['/', '/1954', '/phieng-loi', '/journey/1954', '/experiences']);

const ExperienceLoader = ({ label }: { label: string }) => (
  <main className="experience-route-loader" role="status">
    <span>BOOK OF DIEN BIEN</span>
    <strong>{label}</strong>
    <p>Loading…</p>
  </main>
);

export default function App() {
  const { language, setLanguage, t } = useTranslation();
  const location = useLocation();
  const pathname = normalizeRoutePath(location.pathname);

  if (!EXPERIENCE_ROUTE_PATHS.has(pathname)) {
    return (
      <Suspense fallback={<ExperienceLoader label="BOOK" />}>
        <ApplicationEntry language={language} setLanguage={setLanguage} t={t} />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<ExperienceLoader label="EXPERIENCES" />}>
      <Routes>
        <Route path="/" element={<ExperiencesHubPage language={language} setLanguage={setLanguage} />} />
        <Route path="/1954" element={<JourneyPage language={language} setLanguage={setLanguage} />} />
        <Route path="/phieng-loi" element={<PhiengLoiGamePage language={language} setLanguage={setLanguage} />} />
        <Route path="/journey/1954" element={<Navigate to="/1954" replace />} />
        <Route path="/experiences" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
