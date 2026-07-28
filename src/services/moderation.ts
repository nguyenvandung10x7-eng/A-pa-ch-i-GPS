import { supabase } from '../lib/supabase';
import { validateTikTokUrl } from './videoSubmissions';

const isSafeAbsoluteHttpsUrl = (value?: string | null) => {
  if (!value || typeof value !== 'string') return false;

  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' && ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};

const resolveSafeLink = (canonicalUrl?: string | null, submittedUrl?: string | null) => {
  const source = canonicalUrl ?? submittedUrl;
  if (!source) return undefined;

  try {
    return validateTikTokUrl(source).canonicalUrl;
  } catch {
    return undefined;
  }
};

export type ModerationCursor = {
  createdAt: string;
  id: string;
};

export type ModerationSubmission = {
  id: string;
  userId: string;
  challengeId: string;
  challengeTitleSnapshot: string;
  createdAt: string;
  displayName: string | null;
  avatarUrl: string | null;
  tiktokUsername: string | null;
  safeLink?: string;
};

export type ModerationQueuePage = {
  items: ModerationSubmission[];
  nextCursor: ModerationCursor | null;
};

export type ModerationActionResult = {
  submissionId: string;
  status: 'approved' | 'rejected';
  reviewedBy: string;
  reviewedAt: string;
  rejectionReason: string | null;
};

export class ModerationError extends Error {
  code: 'AUTH_REQUIRED' | 'UNAUTHORIZED' | 'STALE_STATUS' | 'INVALID_REASON' | 'REASON_TOO_LONG' | 'NOT_FOUND' | 'SUPABASE_ERROR';
  translationKey: string;

  constructor(code: ModerationError['code'], translationKey: string, message?: string) {
    super(message ?? translationKey);
    this.code = code;
    this.translationKey = translationKey;
  }
}

type ModerationProfile = {
  display_name?: string | null;
  avatar_url?: string | null;
  tiktok_username?: string | null;
};

type ModerationRow = {
  id: string;
  user_id: string;
  challenge_id: string;
  challenge_title_snapshot: string;
  canonical_url?: string | null;
  submitted_url?: string | null;
  created_at: string;
  profiles?: ModerationProfile | ModerationProfile[] | null;
};

type ModerationRpcRow = {
  submission_id: string;
  status: 'approved' | 'rejected';
  reviewed_by: string;
  reviewed_at: string;
  rejection_reason: string | null;
};

const resolveProfile = (profiles: ModerationRow['profiles']): ModerationProfile | null => {
  if (!profiles) return null;
  if (Array.isArray(profiles)) return profiles[0] ?? null;
  return profiles;
};

const mapModerationRpcError = (message: string): ModerationError => {
  if (message.includes('MODERATION_AUTH_REQUIRED')) {
    return new ModerationError('AUTH_REQUIRED', 'moderation.error.authRequired');
  }
  if (message.includes('MODERATION_FORBIDDEN')) {
    return new ModerationError('UNAUTHORIZED', 'moderation.error.unauthorized');
  }
  if (message.includes('MODERATION_STALE_STATUS')) {
    return new ModerationError('STALE_STATUS', 'moderation.error.staleStatus');
  }
  if (message.includes('MODERATION_REASON_TOO_LONG')) {
    return new ModerationError('REASON_TOO_LONG', 'moderation.error.reasonTooLong');
  }
  if (message.includes('MODERATION_INVALID_REASON') || message.includes('MODERATION_REASON_NOT_ALLOWED') || message.includes('MODERATION_INVALID_ACTION')) {
    return new ModerationError('INVALID_REASON', 'moderation.error.invalidReason');
  }
  if (message.includes('MODERATION_NOT_FOUND')) {
    return new ModerationError('NOT_FOUND', 'moderation.error.notFound');
  }
  return new ModerationError('SUPABASE_ERROR', 'moderation.error.actionFailed');
};

export const checkCurrentUserIsAdmin = async (): Promise<boolean> => {
  const { data, error } = await supabase.rpc<boolean>('is_current_user_admin');

  if (error) {
    throw new ModerationError('SUPABASE_ERROR', 'moderation.error.adminCheckFailed');
  }

  return Boolean(data);
};

export const loadPendingSubmissions = async ({
  cursor = null,
  pageSize = 20,
}: {
  cursor?: ModerationCursor | null;
  pageSize?: number;
} = {}): Promise<ModerationQueuePage> => {
  const limit = Math.max(1, Math.min(pageSize, 100));
  let query = supabase
    .from('video_submissions')
    .select('id,user_id,challenge_id,challenge_title_snapshot,canonical_url,submitted_url,created_at,profiles!video_submissions_user_id_fkey(display_name,avatar_url,tiktok_username)')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .order('id', { ascending: true })
    .limit(limit + 1);

  if (cursor) {
    query = query.or(`created_at.gt.${cursor.createdAt},and(created_at.eq.${cursor.createdAt},id.gt.${cursor.id})`);
  }

  const { data, error } = await query;

  if (error) {
    const text = (error.message || '').toLowerCase();
    if (/permission|policy|row-level security|not authorized|forbidden/.test(text)) {
      throw new ModerationError('UNAUTHORIZED', 'moderation.error.unauthorized');
    }
    throw new ModerationError('SUPABASE_ERROR', 'moderation.error.queueLoadFailed');
  }

  const rows = (data as ModerationRow[] | null ?? []);
  const hasMore = rows.length > limit;
  const pageRows = hasMore ? rows.slice(0, limit) : rows;

  const items = pageRows.map((row) => {
    const profile = resolveProfile(row.profiles);
    return {
      id: row.id,
      userId: row.user_id,
      challengeId: row.challenge_id,
      challengeTitleSnapshot: row.challenge_title_snapshot,
      createdAt: row.created_at,
      displayName: profile?.display_name ?? null,
      avatarUrl: isSafeAbsoluteHttpsUrl(profile?.avatar_url) ? profile?.avatar_url ?? null : null,
      tiktokUsername: profile?.tiktok_username ?? null,
      safeLink: resolveSafeLink(row.canonical_url ?? null, row.submitted_url ?? null),
    } as ModerationSubmission;
  });

  const last = items[items.length - 1];
  return {
    items,
    nextCursor: hasMore && last ? { createdAt: last.createdAt, id: last.id } : null,
  };
};

const moderateSubmission = async ({
  submissionId,
  action,
  rejectionReason,
}: {
  submissionId: string;
  action: 'approve' | 'reject';
  rejectionReason?: string;
}): Promise<ModerationActionResult> => {
  const { data, error } = await supabase.rpc<ModerationRpcRow>('moderate_video_submission', {
    p_submission_id: submissionId,
    p_action: action,
    p_rejection_reason: rejectionReason ?? null,
  });

  if (error) {
    throw mapModerationRpcError(error.message ?? '');
  }

  const row = Array.isArray(data) ? data[0] : null;
  if (!row) {
    throw new ModerationError('SUPABASE_ERROR', 'moderation.error.actionFailed');
  }

  return {
    submissionId: row.submission_id,
    status: row.status,
    reviewedBy: row.reviewed_by,
    reviewedAt: row.reviewed_at,
    rejectionReason: row.rejection_reason,
  };
};

export const approveSubmission = async (submissionId: string): Promise<ModerationActionResult> => moderateSubmission({
  submissionId,
  action: 'approve',
});

export const rejectSubmission = async ({
  submissionId,
  rejectionReason,
}: {
  submissionId: string;
  rejectionReason: string;
}): Promise<ModerationActionResult> => moderateSubmission({
  submissionId,
  action: 'reject',
  rejectionReason,
});
