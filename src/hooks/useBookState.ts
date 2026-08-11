import { useEffect, useState } from 'react';
import {
  BOOK_STATE_CHANGE_EVENT,
  BOOK_STATE_STORAGE_KEY,
  SAVED_STATE_STORAGE_KEY,
  readBookState,
  readSavedState,
} from '../services/bookState';

export const useBookState = () => {
  const [bookState, setBookState] = useState(readBookState);
  const [savedState, setSavedState] = useState(readSavedState);

  useEffect(() => {
    const refresh = () => {
      setBookState(readBookState());
      setSavedState(readSavedState());
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.storageArea !== window.localStorage) return;
      if (
        event.key !== null &&
        event.key !== BOOK_STATE_STORAGE_KEY &&
        event.key !== SAVED_STATE_STORAGE_KEY
      ) return;
      refresh();
    };

    window.addEventListener(BOOK_STATE_CHANGE_EVENT, refresh);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener(BOOK_STATE_CHANGE_EVENT, refresh);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  return { bookState, savedState };
};
