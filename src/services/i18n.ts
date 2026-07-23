import { defaultLanguage, resources, supportedLanguages } from '../i18n';
import type { LanguageCode, LocalizedText } from '../types/task';

const LANGUAGE_KEY = 'gps-challenge-language';
const tokenPattern = /{{\s*(\w+)\s*}}/g;

type TranslationValues = Record<string, string | number>;

export const isLanguageCode = (value: string): value is LanguageCode => supportedLanguages.includes(value as LanguageCode);

export const loadLanguage = (): LanguageCode => {
  const stored = localStorage.getItem(LANGUAGE_KEY);
  return stored && isLanguageCode(stored) ? stored : defaultLanguage;
};

export const saveLanguage = (language: LanguageCode) => localStorage.setItem(LANGUAGE_KEY, language);

export const translate = (language: LanguageCode, key: string, values: TranslationValues = {}) => {
  const template = resources[language][key] ?? resources[defaultLanguage][key] ?? key;
  return template.replace(tokenPattern, (_, token: string) => String(values[token] ?? ''));
};

export const localize = (text: LocalizedText, language: LanguageCode) => text[language] || text[defaultLanguage] || Object.values(text)[0] || '';
