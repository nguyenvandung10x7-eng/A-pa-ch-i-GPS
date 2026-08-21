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
    description: 'Nguồn, tác giả và licence của các hình ảnh công khai đang được dùng trong Book và Field. Chỉ trạng thái CLEARED trong release ledger mới xác nhận exact asset đủ căn cứ phát hành; các nguồn candidate khác vẫn đang được xác minh.',
    cleared: 'CLEARED theo release ledger',
    sourceRecorded: 'Đã ghi nhận nguồn/licence',
    pending: 'Đang xác minh',
    source: 'Nguồn',
    note: 'Ghi chú',
  },
  en: {
    back: 'Back to Book',
    eyebrow: 'BOOK OF DIEN BIEN · IMAGE SOURCES',
    title: 'Credits',
    description: 'Sources, authors and licences for public images used across Book and Field. Only CLEARED status in the release ledger confirms that the exact shipped asset has sufficient release evidence; other candidate sources remain under verification.',
    cleared: 'CLEARED in release ledger',
    sourceRecorded: 'Source/licence recorded',
    pending: 'Pending verification',
    source: 'Source',
    note: 'Note',
  },
} as const;

export const CreditsPage = ({ language }: { language: LanguageCode }) => {
  const c = copy[language];

  const statusLabel = (status: (typeof ASSET_CREDITS)[number]['status']) => {
    if (status === 'cleared') return c.cleared;
    if (status === 'source-recorded') return c.sourceRecorded;
    return c.pending;
  };

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
                <p className="book-utility-v2__meta">{statusLabel(credit.status)}</p>
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
