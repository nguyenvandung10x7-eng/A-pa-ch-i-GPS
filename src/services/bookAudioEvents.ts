import type { BookMusicTrack } from '../data/music';

export const BOOK_SOUND_STORAGE_KEY = 'book-of-dien-bien-sound-enabled-v1';
export const BOOK_AUDIO_START_EVENT = 'book-of-dien-bien:audio-start';

export type BookAudioStartDetail = {
  trackId: string;
  fileName: string;
};

type BookAudioTrack = Pick<BookMusicTrack, 'id' | 'fileName'>;

export const readBookSoundEnabled = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(BOOK_SOUND_STORAGE_KEY) === '1';
};

export const persistBookSoundEnabled = (enabled: boolean) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(BOOK_SOUND_STORAGE_KEY, enabled ? '1' : '0');
};

export const requestBookAudioStart = (track: BookAudioTrack | undefined) => {
  if (typeof window === 'undefined') return;

  persistBookSoundEnabled(true);
  if (!track) return;

  window.dispatchEvent(new CustomEvent<BookAudioStartDetail>(BOOK_AUDIO_START_EVENT, {
    detail: {
      trackId: track.id,
      fileName: track.fileName,
    },
  }));
};
