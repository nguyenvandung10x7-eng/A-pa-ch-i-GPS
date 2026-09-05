import { supabase } from '../lib/supabase';
import type { ChallengeRun } from '../types/task';

export type GuildSlug = 'history' | 'nature' | 'walk' | 'rebellion';

export type GuildDefinition = {
  slug: GuildSlug;
  nameVi: string;
  nameEn: string;
  descriptionVi: string;
  descriptionEn: string;
};

export type GuildLeaderboardEntry = GuildDefinition & {
  rank: number;
  totalPoints: number;
  memberCount: number;
  contributorCount: number;
};

export type GuildMembership = {
  guildSlug: GuildSlug;
  nickname: string;
  joinedAt: string;
  totalPoints: number;
};

export type GuildRosterEntry = {
  rank: number;
  nickname: string;
  totalPoints: number;
  joinedAt: string;
};

export type GuildPost = {
  id: string;
  guildSlug: GuildSlug;
  nickname: string;
  body: string;
  chapterId?: string | null;
  challengeId?: string | null;
  status?: 'pending' | 'approved' | 'rejected' | 'hidden';
  createdAt: string;
  reviewedAt?: string | null;
};

export type GuildModerationPost = GuildPost & {
  rejectionReason?: string | null;
};

export type GuildContributionResult = {
  accepted: boolean;
  duplicate: boolean;
  points: number;
  guildSlug: GuildSlug;
};

export type GuildErrorCode =
  | 'AUTH_REQUIRED'
  | 'MEMBERSHIP_REQUIRED'
  | 'MEMBERSHIP_EXISTS'
  | 'INVALID_NICKNAME'
  | 'INVALID_EVENT'
  | 'CHALLENGE_NOT_SCORABLE'
  | 'INVALID_POST'
  | 'POST_LIMIT'
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'STALE_STATUS'
  | 'INVALID_REASON'
  | 'REASON_TOO_LONG'
  | 'SUPABASE_ERROR';

export class GuildError extends Error {
  code: GuildErrorCode;
  translationKey: string;

  constructor(code: GuildErrorCode, translationKey: string, message?: string) {
    super(message ?? translationKey);
    this.code = code;
    this.translationKey = translationKey;
  }
}

type RawGuildLeaderboardEntry = {
  rank: number;
  guild_slug: string;
  name_vi: string;
  name_en: string;
  description_vi: string;
  description_en: string;
  total_points: number;
  member_count: number;
  contributor_count: number;
};

type RawMembership = {
  guild_slug: string;
  nickname: string;
  joined_at: string;
  total_points: number;
};

type RawRosterEntry = {
  rank: number;
  nickname: string;
  total_points: number;
  joined_at: string;
};

type RawPost = {
  id: string;
  guild_slug: string;
  nickname_snapshot: string;
  body: string;
  chapter_id?: string | null;
  challenge_id?: string | null;
  status?: GuildPost['status'];
  created_at: string;
  reviewed_at?: string | null;
  rejection_reason?: string | null;
};

type RawContribution = {
  accepted: boolean;
  duplicate: boolean;
  points: number;
  guild_slug: string;
};

const rowsFrom = <T>(value: unknown): T[] => (
  Array.isArray(value) ? value as T[] : value ? [value as T] : []
);

const firstRow = <T>(value: unknown): T | null => rowsFrom<T>(value)[0] ?? null;

const asGuildSlug = (value: string): GuildSlug => (
  value === 'history' || value === 'nature' || value === 'walk' || value === 'rebellion'
    ? value
    : 'history'
);

const mapLeaderboardEntry = (row: RawGuildLeaderboardEntry): GuildLeaderboardEntry => ({
  rank: Number(row.rank ?? 0),
  slug: asGuildSlug(row.guild_slug),
  nameVi: row.name_vi,
  nameEn: row.name_en,
  descriptionVi: row.description_vi,
  descriptionEn: row.description_en,
  totalPoints: Number(row.total_points ?? 0),
  memberCount: Number(row.member_count ?? 0),
  contributorCount: Number(row.contributor_count ?? 0),
});

const mapMembership = (row: RawMembership): GuildMembership => ({
  guildSlug: asGuildSlug(row.guild_slug),
  nickname: row.nickname,
  joinedAt: row.joined_at,
  totalPoints: Number(row.total_points ?? 0),
});

const mapPost = (row: RawPost): GuildPost => ({
  id: row.id,
  guildSlug: asGuildSlug(row.guild_slug),
  nickname: row.nickname_snapshot,
  body: row.body,
  chapterId: row.chapter_id ?? null,
  challengeId: row.challenge_id ?? null,
  status: row.status,
  createdAt: row.created_at,
  reviewedAt: row.reviewed_at ?? null,
});

const mapModerationPost = (row: RawPost): GuildModerationPost => ({
  ...mapPost(row),
  rejectionReason: row.rejection_reason ?? null,
});

const mapRpcError = (message: string): GuildError => {
  if (message.includes('GUILD_AUTH_REQUIRED')) return new GuildError('AUTH_REQUIRED', 'guild.error.authRequired');
  if (message.includes('GUILD_MEMBERSHIP_REQUIRED')) return new GuildError('MEMBERSHIP_REQUIRED', 'guild.error.membershipRequired');
  if (message.includes('GUILD_MEMBERSHIP_EXISTS')) return new GuildError('MEMBERSHIP_EXISTS', 'guild.error.membershipExists');
  if (message.includes('GUILD_INVALID_NICKNAME')) return new GuildError('INVALID_NICKNAME', 'guild.error.invalidNickname');
  if (message.includes('GUILD_INVALID_EVENT')) return new GuildError('INVALID_EVENT', 'guild.error.score');
  if (message.includes('GUILD_CHALLENGE_NOT_SCORABLE')) return new GuildError('CHALLENGE_NOT_SCORABLE', 'guild.error.score');
  if (message.includes('GUILD_INVALID_POST')) return new GuildError('INVALID_POST', 'guild.error.invalidPost');
  if (message.includes('GUILD_POST_LIMIT')) return new GuildError('POST_LIMIT', 'guild.error.postLimit');
  if (message.includes('GUILD_NOT_FOUND')) return new GuildError('NOT_FOUND', 'guild.error.notFound');
  if (message.includes('GUILD_MODERATION_AUTH_REQUIRED')) return new GuildError('AUTH_REQUIRED', 'moderation.error.authRequired');
  if (message.includes('GUILD_MODERATION_FORBIDDEN')) return new GuildError('UNAUTHORIZED', 'moderation.error.unauthorized');
  if (message.includes('GUILD_MODERATION_STALE_STATUS')) return new GuildError('STALE_STATUS', 'moderation.error.staleStatus');
  if (message.includes('GUILD_MODERATION_REASON_TOO_LONG')) return new GuildError('REASON_TOO_LONG', 'moderation.error.reasonTooLong');
  if (message.includes('GUILD_MODERATION_INVALID_REASON') || message.includes('GUILD_MODERATION_REASON_NOT_ALLOWED') || message.includes('GUILD_MODERATION_INVALID_ACTION')) {
    return new GuildError('INVALID_REASON', 'moderation.error.invalidReason');
  }
  if (message.includes('GUILD_MODERATION_NOT_FOUND')) return new GuildError('NOT_FOUND', 'moderation.error.notFound');
  return new GuildError('SUPABASE_ERROR', 'guild.error.load');
};

export const loadGuildLeaderboard = async (): Promise<GuildLeaderboardEntry[]> => {
  const { data, error } = await supabase.rpc('get_guild_leaderboard');

  if (error) {
    throw new GuildError('SUPABASE_ERROR', 'guild.error.load');
  }

  return rowsFrom<RawGuildLeaderboardEntry>(data).map(mapLeaderboardEntry);
};

export const loadMyGuildMembership = async (userId?: string | null): Promise<GuildMembership | null> => {
  if (!userId) return null;

  const { data, error } = await supabase.rpc('get_my_guild_membership');

  if (error) {
    throw new GuildError('SUPABASE_ERROR', 'guild.error.load');
  }

  const row = firstRow<RawMembership>(data);
  return row ? mapMembership(row) : null;
};

export const joinGuild = async ({
  userId,
  guildSlug,
  nickname,
}: {
  userId?: string | null;
  guildSlug: GuildSlug;
  nickname: string;
}): Promise<GuildMembership> => {
  if (!userId) {
    throw new GuildError('AUTH_REQUIRED', 'guild.error.authRequired');
  }

  const { data, error } = await supabase.rpc('join_guild', {
    p_guild_slug: guildSlug,
    p_nickname: nickname,
  });

  if (error) throw mapRpcError(error.message ?? '');

  const row = firstRow<RawMembership>(data);
  if (!row) throw new GuildError('SUPABASE_ERROR', 'guild.error.join');
  return mapMembership(row);
};

export const loadGuildRoster = async (guildSlug: GuildSlug): Promise<GuildRosterEntry[]> => {
  const { data, error } = await supabase.rpc('get_guild_roster', { p_guild_slug: guildSlug });

  if (error) throw new GuildError('SUPABASE_ERROR', 'guild.error.load');

  return rowsFrom<RawRosterEntry>(data).map((row) => ({
    rank: Number(row.rank ?? 0),
    nickname: row.nickname,
    totalPoints: Number(row.total_points ?? 0),
    joinedAt: row.joined_at,
  }));
};

export const loadGuildPosts = async (guildSlug: GuildSlug): Promise<GuildPost[]> => {
  const { data, error } = await supabase
    .from('guild_posts')
    .select('id,guild_slug,nickname_snapshot,body,chapter_id,challenge_id,status,created_at,reviewed_at')
    .eq('guild_slug', guildSlug)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw new GuildError('SUPABASE_ERROR', 'guild.error.load');

  return ((data ?? []) as RawPost[]).map(mapPost);
};

export const submitGuildPost = async ({
  userId,
  body,
}: {
  userId?: string | null;
  body: string;
}): Promise<GuildPost> => {
  if (!userId) {
    throw new GuildError('AUTH_REQUIRED', 'guild.error.authRequired');
  }

  const { data, error } = await supabase.rpc('submit_guild_post', {
    p_body: body,
    p_chapter_id: null,
    p_challenge_id: null,
  });

  if (error) throw mapRpcError(error.message ?? '');

  const row = firstRow<RawPost>(data);
  if (!row) throw new GuildError('SUPABASE_ERROR', 'guild.error.submit');
  return mapPost(row);
};

export const recordGuildChallengeEvent = async ({
  userId,
  clientEventId,
  challengeId,
}: {
  userId?: string | null;
  clientEventId: string;
  challengeId: string;
}): Promise<GuildContributionResult | null> => {
  if (!userId) return null;

  const { data, error } = await supabase.rpc('record_guild_challenge_event', {
    p_client_event_id: clientEventId,
    p_challenge_id: challengeId,
  });

  if (error) throw mapRpcError(error.message ?? '');

  const row = firstRow<RawContribution>(data);
  if (!row) throw new GuildError('SUPABASE_ERROR', 'guild.error.score');

  return {
    accepted: Boolean(row.accepted),
    duplicate: Boolean(row.duplicate),
    points: Number(row.points ?? 0),
    guildSlug: asGuildSlug(row.guild_slug),
  };
};

export const syncCompletedChallengeRuns = async ({
  userId,
  runs,
}: {
  userId?: string | null;
  runs: ChallengeRun[];
}): Promise<{ accepted: number; failed: number }> => {
  if (!userId) return { accepted: 0, failed: 0 };

  let accepted = 0;
  let failed = 0;

  for (const run of runs) {
    if (run.status !== 'completed' || !run.gpsVerified) continue;

    try {
      const result = await recordGuildChallengeEvent({
        userId,
        clientEventId: run.id,
        challengeId: run.taskId,
      });
      if (result?.accepted && !result.duplicate) accepted += 1;
    } catch (error) {
      if (error instanceof GuildError && error.code === 'CHALLENGE_NOT_SCORABLE') continue;
      failed += 1;
    }
  }

  return { accepted, failed };
};

export const loadPendingGuildPosts = async (): Promise<GuildModerationPost[]> => {
  const { data, error } = await supabase
    .from('guild_posts')
    .select('id,guild_slug,nickname_snapshot,body,chapter_id,challenge_id,status,created_at,reviewed_at,rejection_reason')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(100);

  if (error) {
    const message = error.message ?? '';
    if (/permission|policy|row-level security|not authorized|forbidden/i.test(message)) {
      throw new GuildError('UNAUTHORIZED', 'moderation.error.unauthorized');
    }
    throw new GuildError('SUPABASE_ERROR', 'moderation.error.queueLoadFailed');
  }

  return ((data ?? []) as RawPost[]).map(mapModerationPost);
};

export const moderateGuildPost = async ({
  postId,
  action,
  rejectionReason,
}: {
  postId: string;
  action: 'approve' | 'reject';
  rejectionReason?: string;
}): Promise<void> => {
  const { data, error } = await supabase.rpc('moderate_guild_post', {
    p_post_id: postId,
    p_action: action,
    p_rejection_reason: rejectionReason ?? null,
  });

  if (error) throw mapRpcError(error.message ?? '');

  if (rowsFrom<unknown>(data).length === 0) {
    throw new GuildError('SUPABASE_ERROR', 'moderation.error.actionFailed');
  }
};
