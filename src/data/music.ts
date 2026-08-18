export type MusicTrack = {
  id: string;
  fileName: string;
  labelKey: string;
};

export type BookMusicTrack = {
  id: string;
  fileName: string;
  label: { vi: string; en: string };
};

/**
 * Global Challenge/background music. Keep this list isolated from Book chapter
 * audio so Challenge shuffle behavior does not change when Book assets are added.
 */
export const MUSIC_TRACKS: MusicTrack[] = [
  { id: 'hmong-ballad-1', fileName: 'hmong-ballad-1.mp3', labelKey: 'music.track.hmongBallad1' },
  { id: 'hmong-ballad-2', fileName: 'hmong-ballad-2.mp3', labelKey: 'music.track.hmongBallad2' },
  { id: 'thai-epic-1', fileName: 'thai-epic-1.mp3', labelKey: 'music.track.thaiEpic1' },
  { id: 'thai-epic-2', fileName: 'thai-epic-2.mp3', labelKey: 'music.track.thaiEpic2' },
  { id: 'thai-street-1', fileName: 'thai-street-1.mp3', labelKey: 'music.track.thaiStreet1' },
  { id: 'thai-street-2', fileName: 'thai-street-2.mp3', labelKey: 'music.track.thaiStreet2' },
  { id: 'hmongdisco', fileName: 'HMONGdisco.mp3', labelKey: 'music.track.hmongdisco' },
  { id: 'hmongdisco2', fileName: 'HMONGdisco2.mp3', labelKey: 'music.track.hmongdisco2' },
  { id: 'hatthai', fileName: 'HATTHAI.mp3', labelKey: 'music.track.hatthai' },
  { id: 'hmong', fileName: 'HMONG.mp3', labelKey: 'music.track.hmong' },
  { id: 'hmongrock2', fileName: 'HMONGrock2.mp3', labelKey: 'music.track.hmongrock2' },
];

/** Audio selected specifically for Book of Dien Bien chapters. */
export const BOOK_MUSIC_TRACKS: BookMusicTrack[] = [
  { id: 'chapter-01-dong-song-track-01', fileName: 'chapter-01-dong-song-track-01.mp3', label: { vi: 'Chương 01 · Dòng sông', en: 'Chapter 01 · The River' } },
  { id: 'chapter-02-mua-he-track-01', fileName: 'chapter-02-mua-he-track-01.mp3', label: { vi: 'Chương 02 · Mùa hè', en: 'Chapter 02 · Summer' } },
  { id: 'chapter-03-nha-ba-noi-track-01', fileName: 'chapter-03-nha-ba-noi-track-01.mp3', label: { vi: 'Chương 03 · Một Điện Biên rất nhỏ', en: 'Chapter 03 · A Very Small Dien Bien' } },
  { id: 'chapter-04-pho-cu-track-01', fileName: 'chapter-04-pho-cu-track-01.mp3', label: { vi: 'Chương 04 · Phố cũ', en: 'Chapter 04 · The Old Quarter' } },
  { id: 'chapter-05-thi-xa-track-01', fileName: 'chapter-05-thi-xa-track-01.mp3', label: { vi: 'Chương 05 · Thị xã', en: 'Chapter 05 · The Town' } },
  { id: 'chapter-06-nhung-nam-2000-track-01', fileName: 'chapter-06-nhung-nam-2000-track-01.mp3', label: { vi: 'Chương 06 · Những năm 2000', en: 'Chapter 06 · The 2000s' } },
  { id: 'chapter-07-long-chao-track-01', fileName: 'chapter-07-long-chao-track-01.mp3', label: { vi: 'Chương 07 · Lòng chảo', en: 'Chapter 07 · The Basin' } },
  { id: 'chapter-08-nhung-ngon-doi-track-01', fileName: 'chapter-08-nhung-ngon-doi-track-01.mp3', label: { vi: 'Chương 08 · Những ngọn đồi', en: 'Chapter 08 · The Hills' } },
  { id: 'chapter-09-1954-track-01', fileName: 'chapter-09-1954-track-01.mp3', label: { vi: 'Chương 09 · 1954 · Track 1', en: 'Chapter 09 · 1954 · Track 1' } },
  { id: 'chapter-09-1954-track-02', fileName: 'chapter-09-1954-track-02.mp3', label: { vi: 'Chương 09 · 1954 · Track 2', en: 'Chapter 09 · 1954 · Track 2' } },
  { id: 'chapter-10-con-vat-track-01', fileName: 'chapter-10-con-vat-track-01.mp3', label: { vi: 'Chương 10 · Những thứ khó quên', en: 'Chapter 10 · Things Hard to Forget' } },
  { id: 'chapter-11-nguoi-song-nguoi-chet-track-01', fileName: 'chapter-11-nguoi-song-nguoi-chet-track-01.mp3', label: { vi: 'Chương 11 · Người sống, người chết', en: 'Chapter 11 · The Living, the Dead' } },
  { id: 'chapter-12-di-ve-phia-tay-track-01', fileName: 'chapter-12-di-ve-phia-tay-track-01.mp3', label: { vi: 'Chương 12 · Đi về phía Tây', en: 'Chapter 12 · Go West' } },
  {
    id: 'chapter-13-su-noi-loan-va-thanh-pho-ban-dem-track-01',
    fileName: 'book/chapter-13-su-noi-loan-va-thanh-pho-ban-dem/chapter-13-su-noi-loan-va-thanh-pho-ban-dem-track-01.mp3',
    label: { vi: 'Chương 13 · Sự nổi loạn và thành phố ban đêm · Track 1', en: 'Chapter 13 · Rebellion and the City at Night · Track 1' },
  },
  {
    id: 'chapter-13-su-noi-loan-va-thanh-pho-ban-dem-track-02',
    fileName: 'book/chapter-13-su-noi-loan-va-thanh-pho-ban-dem/chapter-13-su-noi-loan-va-thanh-pho-ban-dem-track-02.mp3',
    label: { vi: 'Chương 13 · Sự nổi loạn và thành phố ban đêm · Track 2', en: 'Chapter 13 · Rebellion and the City at Night · Track 2' },
  },
];

export const ALL_MUSIC_TRACK_IDS = new Set([
  ...MUSIC_TRACKS.map((track) => track.id),
  ...BOOK_MUSIC_TRACKS.map((track) => track.id),
]);
