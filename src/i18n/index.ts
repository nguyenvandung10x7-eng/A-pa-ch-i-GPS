import en from './en.json';
import vi from './vi.json';
import type { LanguageCode } from '../types/task';

export const resources: Record<LanguageCode, Record<string, string>> = { en, vi };
export const supportedLanguages = Object.keys(resources) as LanguageCode[];
export const defaultLanguage: LanguageCode = 'vi';
