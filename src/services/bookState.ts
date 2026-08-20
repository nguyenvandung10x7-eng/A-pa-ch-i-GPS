import type { BookPage, BookStateV1, SavedStateV1 } from '../types/book';
import { getCompletedBookExperienceIdsFromLegacyProgress } from './bookLegacyProgressBridge';

export const BOOK_STATE_STORAGE_KEY = 'book-of-dien-bien-state-v1';
export const SAVED_STATE_STORAGE_KEY = 'book-of-dien-bien-saved-v1';
export const BOOK_STATE_CHANGE_EVENT = 'book-of-dien-bien-state-change';

const emptyBookState = (): BookStateV1 => ({
  version: 1,
  readPageIds: [],
  completedChapterIds: [],
  visitedPageIds: [],
  completedExperienceIds: [],
  updatedAt: new Date(0).toISOString(),
});

const emptySavedState = (): SavedStateV1 => ({
  version: 1,
  pageIds: [],
});

const stringArray = (value: unknown): string[] =>
  Array.isArray(value)
    ? [...new Set(value.filter((entry): entry is string => typeof entry === 'string' && entry.length > 0))]
    : [];

const emitChange = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(BOOK_STATE_CHANGE_EVENT));
  }
};

const readStoredBookState = (): BookStateV1 => {
  if (typeof window === 'undefined') return emptyBookState();

  try {
    const raw = window.localStorage.getItem(BOOK_STATE_STORAGE_KEY);
    if (!raw) return emptyBookState();
    const parsed = JSON.parse(raw) as Partial<BookStateV1>;
    if (parsed.version !== 1) return emptyBookState();

    return {
      version: 1,
      readPageIds: stringArray(parsed.readPageIds),
      completedChapterIds: stringArray(parsed.completedChapterIds),
      visitedPageIds: stringArray(parsed.visitedPageIds),
      completedExperienceIds: stringArray(parsed.completedExperienceIds),
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : new Date(0).toISOString(),
    };
  } catch {
    return emptyBookState();
  }
};

export const readBookState = (): BookStateV1 => {
  const stored = readStoredBookState();
  if (typeof window === 'undefined') return stored;

  const legacyCompletedExperienceIds = getCompletedBookExperienceIdsFromLegacyProgress();
  if (legacyCompletedExperienceIds.length === 0) return stored;

  return {
    ...stored,
    completedExperienceIds: [...new Set([
      ...stored.completedExperienceIds,
      ...legacyCompletedExperienceIds,
    ])],
  };
};

export const readSavedState = (): SavedStateV1 => {
  if (typeof window === 'undefined') return emptySavedState();

  try {
    const raw = window.localStorage.getItem(SAVED_STATE_STORAGE_KEY);
    if (!raw) return emptySavedState();
    const parsed = JSON.parse(raw) as Partial<SavedStateV1>;
    if (parsed.version !== 1) return emptySavedState();
    return { version: 1, pageIds: stringArray(parsed.pageIds) };
  } catch {
    return emptySavedState();
  }
};

const writeBookState = (state: BookStateV1) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(BOOK_STATE_STORAGE_KEY, JSON.stringify(state));
  emitChange();
};

const writeSavedState = (state: SavedStateV1) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(SAVED_STATE_STORAGE_KEY, JSON.stringify(state));
  emitChange();
};

export const markBookPageRead = (pageId: BookPage['id']) => {
  const current = readStoredBookState();
  const readPageIds = [
    ...current.readPageIds.filter((id) => id !== pageId),
    pageId,
  ];

  writeBookState({
    ...current,
    readPageIds,
    updatedAt: new Date().toISOString(),
  });
};

export const isBookPageSaved = (pageId: BookPage['id']): boolean =>
  readSavedState().pageIds.includes(pageId);

export const toggleSavedBookPage = (pageId: BookPage['id']): boolean => {
  const current = readSavedState();
  const isSaved = current.pageIds.includes(pageId);
  const pageIds = isSaved
    ? current.pageIds.filter((id) => id !== pageId)
    : [...current.pageIds, pageId];
  writeSavedState({ version: 1, pageIds });
  return !isSaved;
};
