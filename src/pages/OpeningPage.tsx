import { ArrowRight, BookOpen, Compass, Languages } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { LanguageCode } from '../types/task';
import './opening-page.css';

type OpeningPageProps = {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
  t: (key: string) => string;
};

export const OpeningPage = ({ language, setLanguage, t }: OpeningPageProps) => (
  <main className="book-opening" aria-labelledby="book-opening-title">
    <div className="book-opening__art" aria-hidden="true" />
    <div className="book-opening__veil" aria-hidden="true" />
    <div className="book-opening__grain" aria-hidden="true" />

    <header className="book-opening__topline">
      <span>{t('opening.edition')}</span>
      <button
        type="button"
        className="book-opening__language"
        onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
        aria-label={language === 'vi' ? 'Switch to English' : 'Chuyển sang tiếng Việt'}
      >
        <Languages aria-hidden="true" />
        <strong>{language.toUpperCase()}</strong>
      </button>
    </header>

    <div className="book-opening__content">
      <p className="book-opening__eyebrow">{t('opening.eyebrow')}</p>
      <h1 id="book-opening-title">
        <span>BOOK OF</span>
        <span>DIEN BIEN</span>
      </h1>
      <p className="book-opening__introduction">{t('opening.introduction')}</p>

      <ol className="book-opening__sequence" aria-label={t('opening.sequenceLabel')}>
        <li>
          <BookOpen aria-hidden="true" />
          <span><strong>BOOK</strong>{t('opening.bookStep')}</span>
        </li>
        <li>
          <Compass aria-hidden="true" />
          <span><strong>FIELD</strong>{t('opening.fieldStep')}</span>
        </li>
      </ol>

      <div className="book-opening__actions">
        <Link to="/book" className="book-opening__primary">
          <span>{t('opening.openBook')}</span>
          <ArrowRight aria-hidden="true" />
        </Link>
        <Link to="/challenge" className="book-opening__secondary">
          {t('opening.stepOutside')}
        </Link>
      </div>

      <p className="book-opening__atlas-note">{t('opening.atlasNote')}</p>
    </div>
  </main>
);
