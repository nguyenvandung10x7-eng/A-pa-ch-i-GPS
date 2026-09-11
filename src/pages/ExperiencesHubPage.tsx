import type { CSSProperties } from 'react';
import { ArrowUpRight, Languages } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FEATURED_EXPERIENCES, getExperienceCopy } from '../data/experienceRegistry';
import type { LanguageCode } from '../types/task';
import '../experiences-hub.css';

type ExperiencesHubPageProps = {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
};

export const ExperiencesHubPage = ({ language, setLanguage }: ExperiencesHubPageProps) => {
  const vi = language === 'vi';

  return (
    <main className="experience-hub" aria-labelledby="experience-hub-title">
      <header className="experience-hub__header">
        <Link to="/" className="experience-hub__brand" aria-label="Book of Dien Bien — Experiences">
          <span>BOOK OF DIEN BIEN</span>
          <small>EXPERIENCES</small>
        </Link>
        <button
          type="button"
          className="experience-hub__language"
          onClick={() => setLanguage(vi ? 'en' : 'vi')}
          aria-label={vi ? 'Switch to English' : 'Chuyển sang tiếng Việt'}
        >
          <Languages aria-hidden="true" />
          <strong>{language.toUpperCase()}</strong>
        </button>
      </header>

      <section className="experience-hub__intro">
        <p>{vi ? 'BA CÁCH ĐỂ BƯỚC VÀO ĐIỆN BIÊN' : 'THREE WAYS INTO DIEN BIEN'}</p>
        <h1 id="experience-hub-title">
          {vi ? 'Chọn điểm bắt đầu của bạn.' : 'Choose where your journey begins.'}
        </h1>
        <div>
          {vi
            ? 'Không cần mở khoá. Mỗi trải nghiệm là một cánh cửa độc lập và bạn có thể quay lại đây bất cứ lúc nào.'
            : 'Nothing is locked. Each experience is an independent doorway, and you can return here at any time.'}
        </div>
      </section>

      <section className="experience-hub__grid" aria-label={vi ? 'Ba trải nghiệm' : 'Three experiences'}>
        {FEATURED_EXPERIENCES.map((experience, index) => {
          const copy = getExperienceCopy(experience, language);
          return (
            <Link
              key={experience.id}
              to={experience.route}
              className={`experience-card experience-card--${experience.tone}`}
              style={{ '--experience-image': `url("${experience.image}")` } as CSSProperties}
              aria-label={`${copy.title}: ${copy.action}`}
            >
              <div className="experience-card__image" aria-hidden="true" />
              <div className="experience-card__veil" aria-hidden="true" />
              <div className="experience-card__number" aria-hidden="true">0{index + 1}</div>
              <div className="experience-card__copy">
                <p>{copy.eyebrow}</p>
                <h2>{copy.title}</h2>
                <div>{copy.description}</div>
                <span>{copy.action}<ArrowUpRight aria-hidden="true" /></span>
              </div>
            </Link>
          );
        })}
      </section>

      <footer className="experience-hub__footer">
        <span>21.386° N · 103.023° E</span>
        <span>{vi ? 'ĐIỆN BIÊN · VIỆT NAM' : 'DIEN BIEN · VIETNAM'}</span>
      </footer>
    </main>
  );
};
