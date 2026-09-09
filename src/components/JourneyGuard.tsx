import type { ReactNode } from 'react';
import { ArrowRight, LockKeyhole } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useJourney } from '../hooks/useJourney';
import type { LanguageCode } from '../types/task';

export const JourneyGuard = ({ children, language, cultureOnly = false }: { children: ReactNode; language: LanguageCode; cultureOnly?: boolean }) => {
  const { stage, storageError } = useJourney();
  if (!storageError && (stage === 'book' || (cultureOnly && stage === 'culture'))) return children;
  const vi = language === 'vi';
  return <main className="journey-locked journey-page">
    <p className="journey-eyebrow">BOOK OF DIEN BIEN</p>
    <LockKeyhole size={30} aria-hidden="true" />
    <h1>{storageError ? (vi ? 'Chưa đọc được dấu hành trình' : 'Your journey could not be loaded') : (vi ? 'Câu chuyện còn một lối đi phía trước.' : 'There is another chapter on the way.')}</h1>
    <p>{storageError ? (vi ? 'Dữ liệu cũ chưa bị thay đổi. Hãy cho phép lưu trữ trên trình duyệt hoặc thử tải lại; ứng dụng không tự xoá tiến trình của bạn.' : 'Your existing data has not been changed. Allow browser storage or reload; the app will not erase your progress.') : stage === '1954'
      ? (vi ? 'Bắt đầu từ 1954. Đến đồi A1 và trải nghiệm Chuyến tàu thời gian để mở Nếp sống dưới những ngọn đồi.' : 'Begin with 1954. Visit A1 Hill and experience the Time Train to open Life Beneath the Hills.')
      : (vi ? 'Nếp sống dưới những ngọn đồi đã mở. Khám phá Phiêng Lơi để mở toàn bộ cuốn sách và bản đồ.' : 'Life Beneath the Hills is open. Explore Phieng Loi to open the complete book and atlas.')}</p>
    <Link className="journey-button" to={stage === 'culture' ? '/journey/culture' : '/journey/1954'}>{vi ? 'Tiếp tục hành trình' : 'Continue the journey'}<ArrowRight size={18} /></Link>
    <small>{vi ? 'Dấu trang và tiến trình cũ vẫn được giữ nguyên. Không có bước mở khóa từ xa.' : 'Existing bookmarks and progress are preserved. Unlocking requires an on-site visit.'}</small>
  </main>;
};
