import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { defaultLanguage, resources } from './index';

void i18n.use(initReactI18next).init({
  resources: Object.fromEntries(Object.entries(resources).map(([language, translation]) => [language, { translation }])),
  lng: defaultLanguage,
  fallbackLng: defaultLanguage,
  interpolation: { escapeValue: false },
});

export default i18n;
