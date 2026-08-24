import en from './en.json';
import vi from './vi.json';
import type { LanguageCode } from '../types/task';

const bookNavigationResources: Record<LanguageCode, Record<string, string>> = {
  en: {
    'nav.book': 'BOOK',
    'nav.challenge': 'FUN CHALLENGES',
    'nav.nearMe': 'NEAR ME',
    'nav.saved': 'SAVED',
  },
  vi: {
    'nav.book': 'SÁCH',
    'nav.challenge': 'THỬ THÁCH THÚ VỊ',
    'nav.nearMe': 'GẦN TÔI',
    'nav.saved': 'ĐÃ LƯU',
  },
};

export const resources: Record<LanguageCode, Record<string, string>> = {
  en: { ...en, ...bookNavigationResources.en },
  vi: { ...vi, ...bookNavigationResources.vi },
};
export const supportedLanguages = Object.keys(resources) as LanguageCode[];
export const defaultLanguage: LanguageCode = 'vi';
