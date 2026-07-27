import { supabase } from '../lib/supabase';
import { validateTikTokUrl } from './videoSubmissions';

const isSafeAbsoluteHttpsUrl = (value?: string | null) => {
  if (!value) return false;
  if (typeof value !== 'string') return false;

  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' && ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};

export type DiscoverySubmission = {
  id: string;
  userId: string;
  challengeId: string;
  challengeTitleSnapshot: string;
  canonicalUrl?: string | null;
  submittedUrl?: string | null;
  tiktokVideoId?: string | null;
  createdAt: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  tiktokUsername?: string | null;
  safeLink?: string;
};

export class DiscoveryError extends Error {
  code: 'SUPABASE_ERROR';
  translationKey: string;

  constructor(translationKey: string, message?: string) {
    super(message ?? translationKey);
    this.code = 'SUPABASE_ERROR';
    this.translationKey = translationKey;
  }
}

type DiscoveryProfile = {
  display_name?: string | null;
  avatar_url?: string | null;
  tiktok_username?: string | null;
};

type DiscoveryRow = {
  id: string;
  user_id: string;
  challenge_id: string;
  challenge_title_snapshot: string;
  canonical_url?: string | null;
  submitted_url?: string | null;
  tiktok_video_id?: string | null;
  created_at: string;
  profiles?: DiscoveryProfile | DiscoveryProfile[] | null;
};

const resolveProfile = (profiles: DiscoveryRow['profiles']): DiscoveryProfile | null => {
  if (!profiles) return null;
  if (Array.isArray(profiles)) return profiles[0] ?? null;
  return profiles;
};

const resolveSafeLink = (value?: string | null) => {
  if (!value) return undefined;
  try {
    const result = validateTikTokUrl(value);
    return result.canonicalUrl;
  } catch {
    return undefined;
  }
};

export const loadApprovedSubmissions = async (): Promise<DiscoverySubmission[]> => {
  const pageSize = 1000;
  const allRows: DiscoveryRow[] = [];
  let cursor: { createdAt: string; id: string } | null = null;

  while (true) {
    let query = supabase
      .from('video_submissions')
      .select('id,user_id,challenge_id,challenge_title_snapshot,canonical_url,submitted_url,tiktok_video_id,created_at,profiles!video_submissions_user_id_fkey(display_name,avatar_url,tiktok_username)')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(pageSize);

    if (cursor) {
      query = query.or(`created_at.lt.${cursor.createdAt},and(created_at.eq.${cursor.createdAt},id.lt.${cursor.id})`);
    }

    const { data, error } = await query;

    if (error) {
      throw new DiscoveryError('discover.error', 'Unable to load approved submissions.');
    }

    const pageRows = (data as DiscoveryRow[] | null ?? []);
    if (pageRows.length === 0) {
      break;
    }

    allRows.push(...pageRows);

    if (pageRows.length < pageSize) {
      break;
    }

    const lastRow = pageRows[pageRows.length - 1];
    cursor = { createdAt: lastRow.created_at, id: lastRow.id };
  }

  return allRows.map((row) => {
    const profile = resolveProfile(row.profiles);
    return {
      id: row.id,
      userId: row.user_id,
      challengeId: row.challenge_id,
      challengeTitleSnapshot: row.challenge_title_snapshot,
      canonicalUrl: row.canonical_url,
      submittedUrl: row.submitted_url,
      tiktokVideoId: row.tiktok_video_id,
      createdAt: row.created_at,
      displayName: profile?.display_name ?? null,
      avatarUrl: isSafeAbsoluteHttpsUrl(profile?.avatar_url) ? profile?.avatar_url ?? null : null,
      tiktokUsername: profile?.tiktok_username ?? null,
      safeLink: resolveSafeLink(row.canonical_url ?? row.submitted_url),
    };
  });
};
