import { lazy, Suspense } from 'react';
import type { LanguageCode } from '../types/task';

const TemporalScene = lazy(() => import('../components/TemporalScene').then((module) => ({ default: module.TemporalScene })));

type JourneyPageProps = {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
};

export const JourneyPage = ({ language, setLanguage }: JourneyPageProps) => (
  <Suspense fallback={(
    <main className="temporal-loader" aria-label={language === 'vi' ? 'Đang dựng không gian 1954' : 'Building the 1954 space'}>
      <span>BOOK OF DIEN BIEN</span>
      <strong>1954</strong>
      <p>{language === 'vi' ? 'Đang dựng địa hình…' : 'Building the terrain…'}</p>
    </main>
  )}>
    <TemporalScene language={language} setLanguage={setLanguage} />
  </Suspense>
);
