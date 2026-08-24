import tasksJson from '../data/tasks.json';
import type { BookPage, ContentBlock } from '../types/book';
import type { ChallengeTask } from '../types/task';

const tasks = tasksJson as ChallengeTask[];
const taskById = new Map(tasks.map((task) => [task.id, task]));

const blockArtwork = (block: ContentBlock): string | undefined => {
  if (block.type === 'image') return block.image.src;
  if (block.type === 'gallery') return block.images[0]?.src;
  return undefined;
};

export const getBookPageArtwork = (page: BookPage): string | undefined => {
  for (const taskId of page.legacyTaskIds ?? []) {
    const image = taskById.get(taskId)?.image;
    if (image) return image;
  }

  if (page.coverImage) return page.coverImage;
  if (page.gallery?.[0]?.src) return page.gallery[0].src;

  for (const block of page.blocks) {
    const image = blockArtwork(block);
    if (image) return image;
  }

  return undefined;
};

/**
 * Book pages remain the persistence/routing unit, but the public IA presents
 * every page as a story. A page with GPS metadata can additionally appear as a
 * place card without becoming another navigation level under the chapter.
 */
export const getChapterStories = (pages: BookPage[]): BookPage[] => pages;

export const getChapterPlaces = (pages: BookPage[]): BookPage[] =>
  pages.filter((page) => Boolean(page.location));
