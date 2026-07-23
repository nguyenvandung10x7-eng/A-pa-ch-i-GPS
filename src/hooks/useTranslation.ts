import { useCallback, useState } from 'react';
import { loadLanguage, saveLanguage, translate } from '../services/i18n';
import type { LanguageCode } from '../types/task';

export const useTranslation = () => {
  const [language, setLanguageState] = useState<LanguageCode>(() => loadLanguage());
  const setLanguage = useCallback((next: LanguageCode) => { saveLanguage(next); setLanguageState(next); }, []);
  const t = useCallback((key: string, values?: Record<string, string | number>) => translate(language, key, values), [language]);
  return { language, setLanguage, t };
};
