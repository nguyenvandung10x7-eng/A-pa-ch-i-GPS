export type BookLanguageCode = 'vi' | 'en';

export type BookLocalizedText = Record<BookLanguageCode, string> & Record<string, string>;

export type PublicationStatus = 'draft' | 'published' | 'hidden';

export type ChapterMusicMood = 'piano' | 'epic-slow';
export type ExperienceMusicMode = 'inherit-chapter' | 'fun';

export type MusicTrack = {
  id: string;
  src: string;
  title?: string;
  artist?: string;
};

export type ChapterMusic = {
  mood: ChapterMusicMood;
  trackId: MusicTrack['id'];
};

export type BookChapter = {
  id: string;
  number: string;
  title: BookLocalizedText;
  subtitle?: BookLocalizedText;
  intro?: BookLocalizedText;
  coverImage?: string;
  music: ChapterMusic;
  order: number;
  status: PublicationStatus;
};

export type MediaItem = {
  src: string;
  alt?: BookLocalizedText;
  caption?: BookLocalizedText;
  credit?: BookLocalizedText;
};

export type AudioAsset = {
  src?: string;
  externalUrl?: string;
  title?: BookLocalizedText;
  caption?: BookLocalizedText;
  durationSeconds?: number;
};

export type GeoPoint = {
  lat: number;
  lng: number;
  label?: BookLocalizedText;
};

export type Location = GeoPoint & {
  radius?: number;
};

export type TextBlock = {
  type: 'text';
  body: BookLocalizedText;
};

export type ImageBlock = {
  type: 'image';
  image: MediaItem;
};

export type GalleryBlock = {
  type: 'gallery';
  images: MediaItem[];
};

export type QuoteBlock = {
  type: 'quote';
  body: BookLocalizedText;
  attribution?: BookLocalizedText;
};

export type AudioBlock = {
  type: 'audio';
  audio: AudioAsset;
};

export type NoteBlock = {
  type: 'note';
  body: BookLocalizedText;
};

export type DividerBlock = {
  type: 'divider';
};

export type ContentBlock =
  | TextBlock
  | ImageBlock
  | GalleryBlock
  | QuoteBlock
  | AudioBlock
  | NoteBlock
  | DividerBlock;

export type BookPageType = 'story' | 'place';

export type BookPage = {
  id: string;
  chapterId: BookChapter['id'];
  type: BookPageType;
  title: BookLocalizedText;
  subtitle?: BookLocalizedText;
  intro?: BookLocalizedText;
  blocks: ContentBlock[];
  coverImage?: string;
  gallery?: MediaItem[];
  location?: Location;
  ambience?: AudioAsset;
  audio?: AudioAsset[];
  tags?: string[];
  order: number;
  status: PublicationStatus;
  legacyTaskIds?: string[];
};

export type RouteDefinition = {
  start: GeoPoint;
  end?: GeoPoint;
  waypoints?: GeoPoint[];
  distanceMeters?: number;
  estimatedDurationMinutes?: number;
};

export type BookExperienceType = 'sideQuest' | 'walk' | 'location' | 'audio' | 'external';

export type BookExperience = {
  id: string;
  chapterId: BookChapter['id'];
  pageId?: BookPage['id'];
  type: BookExperienceType;
  title: BookLocalizedText;
  description?: BookLocalizedText;
  instruction?: BookLocalizedText;
  location?: Location;
  route?: RouteDefinition;
  audio?: AudioAsset;
  externalUrl?: string;
  estimatedDurationMinutes?: number;
  recommendedTime?: BookLocalizedText;
  requirements?: BookLocalizedText[];
  tags?: string[];
  musicMode?: ExperienceMusicMode;
  order?: number;
  status: PublicationStatus;
  legacyTaskId?: string;
};

export type SavedStateV1 = {
  version: 1;
  pageIds: BookPage['id'][];
};

export type BookStateV1 = {
  version: 1;
  readPageIds: BookPage['id'][];
  visitedPageIds: BookPage['id'][];
  completedExperienceIds: BookExperience['id'][];
  updatedAt: string;
};

export type LegacyTaskTarget =
  | { type: 'page'; pageId: BookPage['id'] }
  | { type: 'experience'; experienceId: BookExperience['id'] };

export type LegacyTaskMapping = {
  taskId: string;
  target: LegacyTaskTarget;
};
