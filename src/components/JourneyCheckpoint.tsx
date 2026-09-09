import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, ExternalLink, MapPin, Navigation } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useJourney } from '../hooks/useJourney';
import { completeJourneyStage, rememberTrainOpened, type JourneyResult } from '../services/journey';
import { distanceMeters, GeolocationRequestError, getCurrentPosition } from '../utils/geo';
import type { ChallengeTask, LanguageCode } from '../types/task';

const messages: Record<string, { vi: string; en: string }> = {
  'experience-required': { vi: 'Hãy trải nghiệm và đánh dấu xác nhận trước khi kiểm tra GPS.', en: 'Experience this chapter and confirm it before checking GPS.' },
  locked: { vi: 'Hãy hoàn thành trải nghiệm tại A1 trước.', en: 'Complete the experience at A1 first.' },
  unavailable: { vi: 'Chưa lấy được vị trí. Bật dịch vụ vị trí rồi thử lại ngoài trời.', en: 'Location is unavailable. Enable location services and try again outdoors.' },
  permission: { vi: 'Quyền vị trí đang bị tắt. Cho phép vị trí trong cài đặt trình duyệt rồi thử lại.', en: 'Location permission is off. Allow it in your browser settings and try again.' },
  'stale-location': { vi: 'Vị trí đã cũ. Hãy thử lại để lấy vị trí mới.', en: 'This location is out of date. Try again for a fresh reading.' },
  inaccurateLocation: { vi: 'Sai số GPS còn lớn. Chờ ở nơi thoáng rồi thử lại; chưa mở khóa.', en: 'GPS accuracy is too low. Wait in an open area and retry; nothing has unlocked yet.' },
  outsideTargetRadius: { vi: 'Bạn chưa ở trong phạm vi địa điểm. Có thể xem chỉ đường bên dưới.', en: 'You are outside this location’s radius. Directions are available below.' },
  storage: { vi: 'Chưa lưu được dấu hành trình. Dữ liệu cũ không bị xoá. Kiểm tra quyền lưu trữ và dùng trình duyệt hỗ trợ Web Locks, rồi thử lại.', en: 'Your stamp could not be saved. Existing data is unchanged. Check storage permissions and use a browser with Web Locks support, then retry.' },
};
export const JourneyCheckpoint = ({ stage, task, language }: { stage: '1954' | 'culture'; task?: ChallengeTask; language: LanguageCode }) => {
  const vi = language === 'vi';
  const { state, storageError } = useJourney();
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [reading, setReading] = useState<{ distance: number; accuracy: number }>();
  const mounted = useRef(true);
  const inFlight = useRef(false);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const done = stage === '1954' ? state.a1 : state.culture;
  const next = stage === '1954' ? '/journey/culture' : '/book';
  const url = task?.externalUrl?.startsWith('https://') ? task.externalUrl : undefined;
  const available = !!task?.enabled && (stage !== '1954' || !!url);
  const verify = async () => {
    if (inFlight.current || !available || storageError || !confirmed) return;
    inFlight.current = true; setBusy(true); setMessage('');
    try {
      const position = await getCurrentPosition();
      if (!mounted.current) return;
      const point = { lat: position.coords.latitude, lng: position.coords.longitude, accuracy: position.coords.accuracy, timestamp: position.timestamp };
      setReading({ distance: Math.round(distanceMeters(point, task.gps)), accuracy: Math.round(point.accuracy) });
      const result: JourneyResult = await completeJourneyStage(stage, task, point, confirmed);
      if (mounted.current && result !== 'completed') setMessage(result);
    } catch (error) {
      if (mounted.current) setMessage(error instanceof GeolocationRequestError ? error.code === 1 ? 'permission' : 'unavailable' : 'storage');
    } finally { inFlight.current = false; if (mounted.current) setBusy(false); }
  };
  return <section className={`journey-checkpoint ${done ? 'is-complete' : ''}`} aria-labelledby={`checkpoint-${stage}`}>
    <div className="journey-checkpoint__heading"><MapPin aria-hidden="true" /><p className="journey-eyebrow">{vi ? 'CÂU CHUYỆN TIẾP TỤC Ở NGOÀI ĐỜI' : 'THE STORY CONTINUES OUTSIDE'}</p></div>
    <h2 id={`checkpoint-${stage}`}>{stage === '1954' ? (vi ? 'Đồi A1 · Chuyến tàu thời gian' : 'A1 Hill · The Time Train') : (vi ? 'Phiêng Lơi · Một cuộc đi chậm' : 'Phieng Loi · A Slow Walk')}</h2>
    <p>{stage === '1954' ? (vi ? 'Đến đồi A1, mở trải nghiệm Chuyến tàu thời gian ở trang riêng. Khi kết thúc, quay về đây để xác nhận và mở chương văn hoá.' : 'Visit A1 Hill and open the Time Train on its separate site. When you finish, return here to confirm and open the cultural chapter.') : (vi ? 'Đến Phiêng Lơi. Đi bộ một đoạn, nghe một âm thanh và tìm một chi tiết đời thường mà bạn muốn nhớ. Không cần diễn, quay video hay đăng bài.' : 'Visit Phieng Loi. Walk a little, listen to a sound and find an everyday detail you want to remember. No performance, filming or social post is required.')}</p>
    {!available && <p role="status">{vi ? 'Điểm trải nghiệm đang tạm ngừng hoặc thiếu cấu hình. Bạn vẫn có thể đọc chương này.' : 'This experience is paused or not configured. You can still read this chapter.'}</p>}
    {available && <div className="journey-checkpoint__actions">
      {stage === '1954' && url && <a className="journey-button" href={url} target="_blank" rel="noopener noreferrer" onClick={() => { void rememberTrainOpened().catch(() => { if (mounted.current) setMessage('storage'); }); }}>
        {vi ? 'Mở Chuyến tàu thời gian' : 'Open the Time Train'}<ExternalLink size={17} />
      </a>}
      <a className="journey-button journey-button--quiet" href={`https://www.google.com/maps/dir/?api=1&destination=${task.gps.lat},${task.gps.lng}`} target="_blank" rel="noopener noreferrer"><Navigation size={17} />{vi ? 'Xem chỉ đường' : 'Get directions'}</a>
    </div>}
    {done ? <div className="journey-unlocked" role="status">
      <Check aria-hidden="true" /><p>{stage === '1954' ? (vi ? 'Một Điện Biên đang sống vừa mở ra.' : 'A living Dien Bien has opened before you.') : (vi ? 'Cuốn sách đã mở hết. Từ đây, hãy đi theo sự tò mò của bạn.' : 'The whole book is open. From here, follow your curiosity.')}</p>
      <Link className="journey-button" to={next}>{stage === '1954' ? (vi ? 'Bước sang chương văn hoá' : 'Enter the cultural chapter') : (vi ? 'Mở toàn bộ Book' : 'Open the complete Book')}<ArrowRight size={18} /></Link>
      {done.source === 'legacy-gps' && <small>{vi ? 'Dấu GPS từ hành trình cũ được giữ lại.' : 'Your previous GPS stamp has been preserved.'}</small>}
    </div> : <>
      <label className="journey-checkpoint__confirm"><input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} disabled={!available || busy} />
        <span>{stage === '1954' ? (vi ? 'Tôi đã trải nghiệm Chuyến tàu thời gian tại A1.' : 'I have experienced the Time Train at A1.') : (vi ? 'Tôi đã đi khám phá Phiêng Lơi theo gợi ý trên.' : 'I have explored Phieng Loi following the prompts above.')}</span>
      </label>
      <button className="journey-button" type="button" disabled={busy || !available || !confirmed || storageError || (stage === '1954' && !state.trainOpenedAt)} onClick={() => void verify()}>
        <MapPin size={18} />{busy ? (vi ? 'Đang kiểm tra GPS…' : 'Checking GPS…') : (vi ? 'Xác nhận vị trí và mở chương tiếp' : 'Verify location & open the next chapter')}
      </button>
      {stage === '1954' && !state.trainOpenedAt && available && <small>{vi ? 'Mở chuyến tàu ở trên trước; quay lại tab này sau trải nghiệm.' : 'Open the train above first; return to this tab after the experience.'}</small>}
    </>}
    {reading && <p className="journey-checkpoint__reading" role="status">{vi ? `Cách điểm này ${reading.distance} m · Sai số khoảng ${reading.accuracy} m` : `${reading.distance} m from this point · Accuracy about ${reading.accuracy} m`}</p>}
    {(message || storageError) && <p role="alert" className="journey-checkpoint__error">{messages[storageError ? 'storage' : message]?.[language]}</p>}
    <p className="journey-fineprint">{vi ? `GPS chỉ được hỏi khi bạn bấm xác nhận${task ? ` (phạm vi ${task.gps.radius} m)` : ''}. Không lưu đường đi. Tiến trình được lưu trên trình duyệt này, chưa đồng bộ giữa thiết bị. App xác nhận vị trí và lời xác nhận của bạn, không tự kiểm chứng việc hoàn thành ở trang chuyến tàu.` : `GPS is requested only when you confirm${task ? ` (${task.gps.radius} m radius)` : ''}. No route is stored. Progress stays in this browser, with no cross-device sync yet. The app checks location and your confirmation; it cannot independently verify completion on the train site.`}</p>
    <p className="journey-fineprint">{vi ? 'Dừng ở nơi an toàn khi dùng điện thoại. Tôn trọng không gian di tích, giờ mở cửa, nhà ở và người dân; xin phép trước khi chụp ảnh.' : 'Stop somewhere safe to use your phone. Respect memorial spaces, opening hours, homes and residents; ask before taking photographs.'}</p>
  </section>;
};
