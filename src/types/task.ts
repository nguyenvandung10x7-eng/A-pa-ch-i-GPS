export type LanguageCode = 'vi' | 'en';

export type LocalizedText = Record<LanguageCode, string> & Record<string, string>;

export type GpsPoint = {
  lat: number;
  lng: number;
  radius: number;
};

export type ChallengeTask = {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  category: string;
  difficulty: string;
  points: number;
  gps: GpsPoint;
  image: string;
  enabled: boolean;
};

export type ChallengeStatus = 'pending' | 'active' | 'completed' | 'failed' | 'skipped';

export type ChallengeRun = {
  id: string;
  taskId: string;
  title: LocalizedText;
  clearVersion?: number;
  points: number;
  category: string;
  difficulty: string;
  status: ChallengeStatus;
  outcome?: ChallengeStatus;
  startedAt: string;
  completedAt?: string;
  failedAt?: string;
  skippedAt?: string;
  gpsVerified: boolean;
  qrVerified: boolean;
  score: number;
};
