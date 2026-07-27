import { supabase } from '../lib/supabase';
import { loadApprovedSubmissions, type DiscoverySubmission } from './discovery';

export type VoteCountMap = Record<string, number>;

export type LeaderboardEntry = DiscoverySubmission & {
  voteCount: number;
  rank: number;
};

export class VoteError extends Error {
  code: 'AUTH_REQUIRED' | 'SELF_VOTE' | 'DUPLICATE_VOTE' | 'NOT_APPROVED' | 'SUPABASE_ERROR';
  translationKey: string;

  constructor(code: VoteError['code'], translationKey: string, message?: string) {
    super(message ?? translationKey);
    this.code = code;
    this.translationKey = translationKey;
  }
}

type VoteCountRow = {
  submission_id: string;
  vote_count: number;
};

type VoteRow = {
  submission_id: string;
};

export const loadVoteCountMap = async (): Promise<VoteCountMap> => {
  const pageSize = 1000;
  const allRows: VoteCountRow[] = [];
  let cursor: string | null = null;

  while (true) {
    const { data, error } = await supabase.rpc<VoteCountRow>('get_submission_vote_counts', {
      p_cursor: cursor,
      p_limit: pageSize,
    });

    if (error) {
      throw new VoteError('SUPABASE_ERROR', 'discover.voteError');
    }

    const pageRows = (data ?? []) as VoteCountRow[];
    if (pageRows.length === 0) {
      break;
    }

    allRows.push(...pageRows);

    if (pageRows.length < pageSize) {
      break;
    }

    cursor = pageRows[pageRows.length - 1]?.submission_id ?? null;
  }

  return allRows.reduce<VoteCountMap>((accumulator, row) => {
    accumulator[row.submission_id] = Number(row.vote_count ?? 0);
    return accumulator;
  }, {});
};

export const loadUserVoteSubmissionIds = async (userId?: string | null): Promise<string[]> => {
  if (!userId) return [];

  const pageSize = 1000;
  const allRows: VoteRow[] = [];
  let cursor: string | null = null;

  while (true) {
    let query = supabase.from('votes').select('submission_id').eq('user_id', userId).order('submission_id', { ascending: true }).limit(pageSize);

    if (cursor) {
      query = query.gt('submission_id', cursor);
    }

    const { data, error } = await query;
    if (error) {
      throw new VoteError('SUPABASE_ERROR', 'discover.voteError');
    }

    const pageRows = (data as VoteRow[] | null ?? []);
    if (pageRows.length === 0) {
      break;
    }

    allRows.push(...pageRows);

    if (pageRows.length < pageSize) {
      break;
    }

    cursor = pageRows[pageRows.length - 1]?.submission_id ?? null;
  }

  return allRows.map((row) => row.submission_id);
};

export const castVote = async ({ userId, submissionId }: { userId: string; submissionId: string }) => {
  if (!userId) {
    throw new VoteError('AUTH_REQUIRED', 'discover.voteSignIn');
  }

  const { data: submission, error: lookupError } = await supabase
    .from('video_submissions')
    .select('id,status,user_id')
    .eq('id', submissionId)
    .maybeSingle();

  if (lookupError) {
    throw new VoteError('SUPABASE_ERROR', 'discover.voteError');
  }

  if (!submission) {
    throw new VoteError('NOT_APPROVED', 'discover.voteNotFound');
  }

  if (submission.status !== 'approved') {
    throw new VoteError('NOT_APPROVED', 'discover.voteNotApproved');
  }

  if (submission.user_id === userId) {
    throw new VoteError('SELF_VOTE', 'discover.voteOwnSubmission');
  }

  const { error } = await supabase.from('votes').insert({ user_id: userId, submission_id: submissionId });

  if (!error) {
    return;
  }

  if (error.code === '23505' || /duplicate|unique/i.test(error.message)) {
    throw new VoteError('DUPLICATE_VOTE', 'discover.voteDuplicate');
  }

  if (/row-level security|permission|policy/i.test(error.message)) {
    throw new VoteError('SUPABASE_ERROR', 'discover.voteUnauthorized');
  }

  throw new VoteError('SUPABASE_ERROR', 'discover.voteError');
};

export const loadLeaderboardEntries = async (): Promise<LeaderboardEntry[]> => {
  const submissions = await loadApprovedSubmissions();
  const voteCounts = await loadVoteCountMap();

  const entries = submissions.map((submission) => ({
    ...submission,
    voteCount: voteCounts[submission.id] ?? 0,
    rank: 0,
  }));

  entries.sort((left, right) => {
    if (right.voteCount !== left.voteCount) {
      return right.voteCount - left.voteCount;
    }

    const leftTime = new Date(left.createdAt).getTime();
    const rightTime = new Date(right.createdAt).getTime();
    if (rightTime !== leftTime) {
      return rightTime - leftTime;
    }

    return right.id.localeCompare(left.id);
  });

  return entries.map((entry, index) => ({ ...entry, rank: index + 1 }));
};
