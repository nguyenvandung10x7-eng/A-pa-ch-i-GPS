import { ArrowRight, BookOpen, Check, LockKeyhole } from 'lucide-react';
import { Link } from 'react-router-dom';
import { JourneyCheckpoint } from '../components/JourneyCheckpoint';
import { TemporalScene } from '../components/TemporalScene';
import { useJourney } from '../hooks/useJourney';
import { getChapterPages } from '../services/bookContent';
import { A1_TASK_ID, CULTURE_TASK_ID, HISTORY_CHAPTER_ID } from '../services/journey';
import type { ChallengeTask, LanguageCode } from '../types/task';

export const JourneyPage = ({ language, tasks, culture = false }: { language: LanguageCode; tasks: ChallengeTask[]; culture?: boolean }) => {
  const vi = language === 'vi';
  const { stage, state } = useJourney();
  const task = tasks.find((item) => item.id === (culture ? CULTURE_TASK_ID : A1_TASK_ID));
  const chapter = getChapterPages(HISTORY_CHAPTER_ID);
  return <main className={`journey-page ${culture ? 'journey-page--culture' : ''}`}>
    <nav className="journey-path" aria-label={vi ? 'Các phần của câu chuyện' : 'Chapters of the journey'}>
      <Link to="/journey/1954" aria-current={!culture ? 'page' : undefined}><span>{state.a1 ? <Check size={14} /> : '01'}</span>1954</Link>
      <Link to="/journey/culture" aria-current={culture ? 'page' : undefined}><span>{state.culture ? <Check size={14} /> : state.a1 ? '02' : <LockKeyhole size={13} />}</span>{vi ? 'Nếp sống' : 'Living culture'}</Link>
      <Link to="/book"><span>{stage === 'book' ? <BookOpen size={14} /> : <LockKeyhole size={13} />}</span>Book</Link>
    </nav>
    <header className="journey-intro">
      <p className="journey-eyebrow">BOOK OF DIEN BIEN / {culture ? (vi ? 'PHẦN TIẾP THEO' : 'THE NEXT CHAPTER') : (vi ? 'MỞ ĐẦU CUỐN SÁCH' : 'THE BOOK BEGINS HERE')}</p>
      <h1>{culture ? (vi ? 'Nếp sống dưới những ngọn đồi' : 'Life Beneath the Hills') : '1954'}</h1>
      <p className="journey-deck">{culture ? (vi ? 'Rời những âm vang của quá khứ, chúng ta bước vào một Điện Biên đang sống.' : 'Leaving the echoes of the past, we step into a Dien Bien that is still unfolding.') : (vi ? 'Dưới một thành phố đang sống, một thời gian khác vẫn ở đó.' : 'Beneath a living city, another time is still there.')}</p>
      {!culture && <p className="journey-intro__invitation">{vi ? 'Đọc và khám phá không gian bên dưới. Khi đến Điện Biên, chuyến tàu tại A1 sẽ mở lối sang chương tiếp theo.' : 'Read and explore the space below. When you reach Dien Bien, the train at A1 opens the way to the next chapter.'}</p>}
    </header>
    {culture ? <>
      <div className="culture-landscape" role="img" aria-label={vi ? 'Minh hoạ những nếp nhà dưới đồi, không phải ảnh tư liệu Phiêng Lơi' : 'An illustration of homes beneath hills, not a documentary image of Phieng Loi'}>
        <span className="culture-landscape__sun" /><i /><i /><i /><div className="culture-landscape__homes"><b /><b /><b /></div>
        <p>PHIÊNG LƠI<span>{vi ? 'Một cuộc đi chậm' : 'A slow walk'}</span></p>
      </div>
      <div className="journey-prose">
        <p>{vi ? 'Sau một câu chuyện về chiến tranh, có lẽ chúng ta cần nghe tiếng của một ngày bình thường. Một tiếng gọi từ phía nhà, một chiếc xe đi qua, tiếng chuyện trò chưa rõ lời. Điện Biên không chỉ nằm trong những điều đã xảy ra.' : 'After a story of war, perhaps we need the sound of an ordinary day. A voice from a house, a passing vehicle, a conversation whose words we cannot quite catch. Dien Bien does not exist only in what has already happened.'}</p>
        <p>{vi ? 'Ở Phiêng Lơi, hãy thử đi chậm một đoạn. Không cần tìm ngay điều gì đặc biệt. Nhìn cách một mái nhà gặp khoảng sân, một lối nhỏ nối với con đường. Văn hoá cũng ở trong cách người ta sống với nhau, chứ không chỉ trong những thứ được đặt ra để giới thiệu.' : 'In Phieng Loi, try walking slowly for a while. There is no need to find something remarkable straight away. Notice how a roof meets a yard, how a small path joins the road. Culture also lives in the way people share a day, not only in what is arranged to be presented.'}</p>
      </div>
      <section className="culture-prompts" aria-label={vi ? 'Ba gợi ý khám phá' : 'Three ways to notice'}>
        {[
          ['01', vi ? 'Nghe' : 'Listen', vi ? 'Dừng một chút. Âm thanh nào ở gần, âm thanh nào vọng từ xa?' : 'Pause. Which sound is close, and which reaches you from a distance?'],
          ['02', vi ? 'Nhìn' : 'Notice', vi ? 'Tìm một chi tiết bình thường bạn hay bỏ qua: bóng mái hiên, một lối đi, một đồ vật.' : 'Find an ordinary detail you might overlook: a porch shadow, a path, an object.'],
          ['03', vi ? 'Nhớ' : 'Remember', vi ? 'Giữ lại một điều bằng trí nhớ hoặc một dòng riêng. Không cần biến người dân thành nhân vật cho máy quay.' : 'Keep one detail in memory or a private note. There is no need to turn residents into subjects for a camera.'],
        ].map(([n, title, body]) => <article key={n}><span>{n}</span><h2>{title}</h2><p>{body}</p></article>)}
      </section>
    </> : <>
      <TemporalScene language={language} />
      <div className="journey-prose">
        {chapter.flatMap((page) => page.blocks).filter((block) => block.type === 'text').map((block, index) => block.type === 'text' && <p key={index}>{block.body[language] ?? block.body.vi}</p>)}
      </div>
      <aside className="journey-bridge"><span>02 / {vi ? 'BƯỚC RA NGOÀI' : 'STEP OUTSIDE'}</span><p>{vi ? 'Không gian giao thoa ở trên là một phần của chương 1954. Chuyến tàu thời gian bên dưới là trải nghiệm riêng, gắn với đồi A1.' : 'The overlapping-time space above belongs to the 1954 chapter. The Time Train below is a separate experience connected to A1 Hill.'}</p></aside>
    </>}
    <JourneyCheckpoint key={culture ? 'culture' : '1954'} stage={culture ? 'culture' : '1954'} task={task} language={language} />
    <footer className="journey-endnote"><p>{culture ? (vi ? 'Sau Phiêng Lơi, không còn chương nào bị khoá.' : 'After Phieng Loi, no chapter remains locked.') : (vi ? 'Sau A1: những nếp sống dưới những ngọn đồi.' : 'After A1: life beneath the hills.')}</p><ArrowRight size={20} aria-hidden="true" /></footer>
  </main>;
};
