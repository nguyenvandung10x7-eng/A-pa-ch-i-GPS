export type MusicTrack = {
  id: string;
  fileName: string;
  labelKey: string;
};

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
