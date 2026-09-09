import { ArrowRight, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getPublishedChapters, getChapterPages } from '../services/bookContent';
import { useBookState } from '../hooks/useBookState';
import { HISTORY_CHAPTER_ID } from '../services/journey';
import type { LanguageCode } from '../types/task';

export const OpenBookPage = ({ language }: { language: LanguageCode }) => {
  const vi = language === 'vi';
  const chapters = getPublishedChapters().filter((chapter) => chapter.id !== HISTORY_CHAPTER_ID);
  const { bookState } = useBookState();
  const unread = chapters.find((chapter) => getChapterPages(chapter.id).some((page) => !bookState.readPageIds.includes(page.id))) ?? chapters[0];
  return <main className="journey-page journey-library">
    <header className="journey-intro"><p className="journey-eyebrow">{vi ? 'TOÀN BỘ CUỐN SÁCH ĐÃ MỞ' : 'THE WHOLE BOOK IS OPEN'}</p><h1>Book of<br />Dien Bien</h1><p className="journey-deck">{vi ? 'Từ đây, không cần đi theo một thứ tự nào nữa.' : 'From here, there is no order you need to follow.'}</p></header>
    <div className="journey-library__actions">{unread && <Link className="journey-button" to={`/book/chapter/${unread.id}`}>{vi ? 'Đọc tiếp' : 'Continue reading'}<ArrowRight size={18} /></Link>}<Link className="journey-button journey-button--quiet" to="/challenge"><Compass size={18} />{vi ? 'Khám phá sa hình' : 'Explore the atlas'}</Link></div>
    <section className="journey-contents" aria-label={vi ? 'Mục lục' : 'Contents'}>
      <Link to="/journey/1954"><span>↶</span><h2>1954</h2><small>{vi ? 'Trở lại mở đầu' : 'Revisit the beginning'}</small><ArrowRight size={17} /></Link>
      <Link to="/journey/culture"><span>↶</span><h2>{vi ? 'Nếp sống dưới những ngọn đồi' : 'Life Beneath the Hills'}</h2><small>{vi ? 'Phiêng Lơi' : 'Phieng Loi'}</small><ArrowRight size={17} /></Link>
      {chapters.map((chapter, index) => <Link to={`/book/chapter/${chapter.id}`} key={chapter.id}><span>{String(index + 1).padStart(2, '0')}</span><h2>{chapter.title[language]}</h2><ArrowRight size={17} /></Link>)}
    </section>
  </main>;
};
