import { supabase } from '../lib/supabase';
import type { ChallengeRun } from '../types/task';

export type CompletedGpsVerifiedRun = ChallengeRun & {
  status: 'completed';
  gpsVerified: true;
  completedAt: string;
};

export type TikTokSubmissionPayload = {
  user_id: string;
  challenge_id: string;
  challenge_title_snapshot: string;
  gps_verified: true;
  gps_verified_at: string;
  submitted_url: string;
  canonical_url: string;
  tiktok_video_id: string;
};

export type TikTokValidationResult = {
  normalizedUrl: string;
  canonicalUrl: string;
  tiktokVideoId: string;
};

export class TikTokSubmissionError extends Error {
  code: 'INVALID_TIKTOK_URL' | 'DUPLICATE_TIKTOK_VIDEO' | 'SUPABASE_ERROR';
  translationKey: string;

  constructor(code: TikTokSubmissionError['code'], translationKey: string, message?: string) {
    super(message ?? translationKey);
    this.code = code;
    this.translationKey = translationKey;
  }
}

const isEligibleCompletedRun = (run: ChallengeRun): run is CompletedGpsVerifiedRun => (
  run.status === 'completed' && run.gpsVerified === true && typeof run.completedAt === 'string' && run.completedAt.length > 0
);

const normalizeInput = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new TikTokSubmissionError('INVALID_TIKTOK_URL', 'tiktok.validation.required');
  }

  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  let url: URL;

  try {
    url = new URL(withScheme);
  } catch {
    throw new TikTokSubmissionError('INVALID_TIKTOK_URL', 'tiktok.validation.invalid');
  }

  const hostname = url.hostname.toLowerCase();
  if (!['www.tiktok.com', 'tiktok.com'].includes(hostname)) {
    throw new TikTokSubmissionError('INVALID_TIKTOK_URL', 'tiktok.validation.invalid');
  }

  const path = url.pathname.replace(/\/+$/, '');
  const match = /^\/@[^/]+\/video\/(\d+)$/.exec(path);
  if (!match) {
    throw new TikTokSubmissionError('INVALID_TIKTOK_URL', 'tiktok.validation.invalid');
  }

  url.search = '';
  url.hash = '';
  const canonicalUrl = `https://www.tiktok.com${path}`;

  return {
    normalizedUrl: canonicalUrl,
    canonicalUrl,
    tiktokVideoId: match[1],
  };
};

export const validateTikTokUrl = (value: string): TikTokValidationResult => normalizeInput(value);

export const submitTikTokVideo = async ({
  userId,
  challengeId,
  challengeTitleSnapshot,
  gpsVerifiedAt,
  submittedUrl,
  canonicalUrl,
  tiktokVideoId,
}: {
  userId: string;
  challengeId: string;
  challengeTitleSnapshot: string;
  gpsVerifiedAt: string;
  submittedUrl: string;
  canonicalUrl: string;
  tiktokVideoId: string;
}) => {
  const payload: TikTokSubmissionPayload = {
    user_id: userId,
    challenge_id: challengeId,
    challenge_title_snapshot: challengeTitleSnapshot,
    gps_verified: true,
    gps_verified_at: gpsVerifiedAt,
    submitted_url: submittedUrl,
    canonical_url: canonicalUrl,
    tiktok_video_id: tiktokVideoId,
  };

  const { error } = await supabase.from('video_submissions').insert(payload);

  if (!error) {
    return payload;
  }

  if (error.code === '23505' || /duplicate|unique/i.test(error.message)) {
    throw new TikTokSubmissionError('DUPLICATE_TIKTOK_VIDEO', 'tiktok.error.duplicate');
  }

  throw new TikTokSubmissionError('SUPABASE_ERROR', 'tiktok.error.supabase');
};

export const resolveSubmissionChallenge = (history: ChallengeRun[], requestedRunId?: string | null): CompletedGpsVerifiedRun | undefined => {
  const completedRuns = history.filter(isEligibleCompletedRun).sort((left, right) => new Date(right.completedAt).getTime() - new Date(left.completedAt).getTime());
  if (!completedRuns.length) return undefined;
  if (!requestedRunId) return completedRuns[0];
  return completedRuns.find((run) => run.id === requestedRunId);
};
