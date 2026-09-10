import { ApplicationShell } from './ApplicationShell';
import { AuthProvider } from './contexts/AuthContext';
import type { LanguageCode } from './types/task';
import './book-soundtrack.css';
import './field-v2.css';
import './typography-v2.css';

type ApplicationEntryProps = {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
  t: (key: string, values?: Record<string, string | number>) => string;
};

export const ApplicationEntry = ({ language, setLanguage, t }: ApplicationEntryProps) => (
  <AuthProvider>
    <ApplicationShell language={language} setLanguage={setLanguage} t={t} />
  </AuthProvider>
);
