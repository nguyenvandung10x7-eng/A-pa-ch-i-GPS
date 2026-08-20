import { ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ASSET_CREDITS } from '../data/assetCredits';
import type { LanguageCode } from '../types/task';
import './book-utility-v2.css';

const copy = {
  vi: {
    back: 'Về Book',
    eyebrow: 'BOOK OF DIEN BIEN · NGUỒN ẢNH',
    title: 'Credits',
    description: 'Nguồn, tác giả và giấy phép của các hình ảnh công khai đang được dùng trong Book và Field. Mục “đang xác minh” chưa được coi là clearance phát hành.',
    verified: 'Đã xác minh licence',
    pending: 'Đang xác minh',
    source: 'Nguồn',
    license: 'Giấy phép',
    note: 'Ghi chú',
  },
  en: {
    back: 'Back to Book',
    eyebrow: 'BOOK OF DIEN BIEN · IMAGE SOURCES',
    title: 'Credits',
    description: 'Sources, authors and licences for public images currently used across Book and Field. “Pending” entries are not treated as release clearance.',
    verified: 'Licence verified',
    pending: 'Pending verification',
    source: 'Source',
    license: 'Licence',
    note: 'Note',
  },
} as const;

export const CreditsPage = ({ language }: { language: LanguageCode }) => {
  const c = copy[language];

  return (
    <div className="book-utility-v2">
      <Link to="/book" className="book-utility-v2__back">← {c.back}</Link>

      <header className="book-utility-v2__header">
        <p className="book-utility-v2__eyebrow">{c.eyebrow}</p>
        <h1>{c.title}</h1>
        <p>{c.description}</p>
      </header>

      <section className="book-utility-v2__section">
        <div className="book-utility-v2__list">
          {ASSET_CREDITS.map((credit) => (
            <article key={credit.id} className="book-utility-v2__row">
              <div>
                <p className="book-utility-v2__meta">
                  {credit.status === 'verified' ? c.verified : c.pending}
                </p>
                <h3>{credit.usage[language]}</h3>
                <p>{credit.author}</p>

                <div className="book-utility-v2__row-actions">
                  {credit.sourceUrl ? (
                    <a href={credit.sourceUrl} target="_blank" rel="noreferrer">
                      {c.source}<ExternalLink />
                    </a>
                  ) : null}
                  {credit.licenseUrl && credit.licenseName ? (
                    <a href={credit.licenseUrl} target="_blank" rel="noreferrer">
                      {credit.licenseName}<ExternalLink />
                    </a>
                  ) : null}
                </div>

                {credit.note ? <p className="book-utility-v2__meta">{c.note}: {credit.note[language]}</p> : null}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};
