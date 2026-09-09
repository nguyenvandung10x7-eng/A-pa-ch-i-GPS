import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Headphones, Volume2, VolumeX } from 'lucide-react';
import type { LanguageCode } from '../types/task';
import { createTemporalAudio } from '../services/temporalAudio';

export const TemporalScene = ({ language }: { language: LanguageCode }) => {
  const vi = language === 'vi';
  const [time, setTime] = useState(45);
  const [angle, setAngle] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(false);
  const audio = useRef<ReturnType<typeof createTemporalAudio> | null>(null);
  const stop = () => { audio.current?.dispose(); audio.current = null; setPlaying(false); };
  useEffect(() => {
    const hidden = () => { if (document.hidden) stop(); };
    const otherAudio = () => stop();
    document.addEventListener('visibilitychange', hidden);
    document.addEventListener('play', otherAudio, true);
    return () => {
      document.removeEventListener('visibilitychange', hidden);
      document.removeEventListener('play', otherAudio, true);
      audio.current?.dispose();
      audio.current = null;
    };
  }, []);
  useEffect(() => { audio.current?.move(time / 100, angle / 35); }, [time, angle]);
  const toggle = async () => {
    if (audio.current) { stop(); return; }
    setError(false);
    try {
      document.querySelectorAll('audio').forEach((element) => element.pause());
      const engine = createTemporalAudio();
      audio.current = engine;
      engine.move(time / 100, angle / 35);
      await engine.start();
      if (audio.current === engine) setPlaying(true);
    } catch { stop(); setError(true); }
  };
  return <section className="temporal" aria-labelledby="temporal-title">
    <div className="temporal__head">
      <div><p className="journey-eyebrow">01 / {vi ? 'KHÔNG GIAN TƯƠNG TÁC' : 'INTERACTIVE SPACE'}</p><h2 id="temporal-title">{vi ? 'Vùng thời gian giao thoa' : 'Where Times Overlap'}</h2></div>
      <Headphones size={24} aria-hidden="true" />
    </div>
    <div className="temporal__viewport" style={{ '--time': time / 100, '--yaw': `${angle}deg` } as CSSProperties} role="img"
      aria-label={vi ? 'Sa hình 3D minh hoạ: lòng chảo, đồi, con đường và những mái nhà; hai lớp thời gian chồng lên nhau.' : 'An illustrative 3D diorama: a basin, hills, a road and rooftops, with two overlapping layers of time.'}>
      <div className="temporal__horizon" />
      <span className="temporal__date" aria-hidden="true">1954</span>
      <div className="temporal__world" aria-hidden="true">
        <div className="temporal__ground" />
        {[0,1,2,3,4,5,6].map((n) => <i className={`temporal__hill temporal__hill--${n}`} key={n} />)}
        <div className="temporal__road" />
        {[0,1,2,3,4,5,6,7,8].map((n) => <i className="temporal__house" key={n} style={{ left: 155 + (n % 3) * 63, top: 95 + Math.floor(n / 3) * 62 }}><b /><em /></i>)}
        <div className="temporal__seam" /><div className="temporal__echo temporal__echo--one" /><div className="temporal__echo temporal__echo--two" />
      </div>
      <span className="temporal__caption">{vi ? 'CÙNG MỘT MẶT ĐẤT. HAI LỚP THỜI GIAN.' : 'THE SAME GROUND. TWO LAYERS OF TIME.'}</span>
    </div>
    <div className="temporal__controls">
      <label><span>{vi ? 'Hôm nay' : 'Today'}<span>1954</span></span><input aria-label={vi ? 'Giao thoa thời gian' : 'Time overlap'} type="range" min="0" max="100" value={time} onChange={(event) => setTime(Number(event.target.value))} /></label>
      <label><span>{vi ? 'Góc nhìn sa hình' : 'Diorama viewpoint'}</span><input aria-label={vi ? 'Góc nhìn sa hình' : 'Diorama viewpoint'} type="range" min="-35" max="35" value={angle} onChange={(event) => setAngle(Number(event.target.value))} /></label>
      <button className="journey-button journey-button--quiet" type="button" onClick={() => void toggle()} aria-pressed={playing}>{playing ? <VolumeX size={18} /> : <Volume2 size={18} />}{playing ? (vi ? 'Tắt âm thanh' : 'Stop sound') : (vi ? 'Nghe bản thử không gian' : 'Hear the spatial study')}</button>
    </div>
    <p className="temporal__note">{vi ? 'Dùng tai nghe, để âm lượng nhỏ. Sa hình mang tính gợi tả, không phải bản đồ di tích. Âm thanh tổng hợp đang là bản thử; chưa có các lớp ghi âm, radio và âm thanh lịch sử của bản hoàn thiện.' : 'Use headphones at a low volume. This is an evocative diorama, not a site map. The synthesised sound is a study; the final recordings, radio and historical sound layers are not yet included.'}</p>
    {error && <p role="alert">{vi ? 'Chưa phát được âm thanh. Bạn vẫn có thể khám phá sa hình và đọc tiếp.' : 'Sound could not start. You can still explore the diorama and continue reading.'}</p>}
  </section>;
};
