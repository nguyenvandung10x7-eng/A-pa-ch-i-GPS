import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { BookOpen, CheckCircle2, Footprints, Leaf, LogIn, RefreshCw, Send, Users, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useAuth } from '../contexts/AuthContext';
import { hasUnlockedAllChallenges } from '../services/challengeLevels';
import { loadOrCreateProgress } from '../services/gameplay';
import {
  GuildError,
  type GuildLeaderboardEntry,
  type GuildMembership,
  type GuildPost,
  type GuildRosterEntry,
  type GuildSlug,
  joinGuild,
  loadGuildLeaderboard,
  loadGuildPosts,
  loadGuildRoster,
  loadMyGuildMembership,
  submitGuildPost,
  syncCompletedChallengeRuns,
} from '../services/guilds';
import { loadHistory } from '../services/history';
import type { ChallengeTask, LanguageCode } from '../types/task';

const guildIcon = (slug: GuildSlug) => {
  if (slug === 'history') return BookOpen;
  if (slug === 'nature') return Leaf;
  if (slug === 'walk') return Footprints;
  return Zap;
};

type GuildPresentation = {
  imageSrc: string;
  imageAlt: Record<LanguageCode, string>;
  chapterHint: Record<LanguageCode, string>;
  story: Record<LanguageCode, string>;
};

const GUILD_PRESENTATION = {
  history: {
    imageSrc: '/images/guilds/history-absurd-postcard.webp',
    imageAlt: {
      vi: 'Postcard phi lý của Team Lịch sử với mô hình thung lũng, bản đồ, radio cũ và những lát ký ức phát sáng.',
      en: 'An absurd postcard for History Team with a valley model, maps, an old radio, and glowing slices of memory.',
    },
    chapterHint: {
      vi: 'Nhặt từ đồi A1, bảo tàng và những cái tên không muốn bị phủ bụi.',
      en: 'Collected from Hill A1, museum rooms, and names that should not gather dust.',
    },
    story: {
      vi: 'Hội của người đi chậm qua bảo tàng, đồi cũ và những cái tên còn ở lại. Không cần trang nghiêm quá; chỉ cần nhặt một mảnh ký ức rồi kể cho đàng hoàng.',
      en: 'For people who walk slowly through museum rooms, old hills, and names that remain. It does not need to be solemn all the time; just pick up one piece of memory and tell it properly.',
    },
  },
  nature: {
    imageSrc: '/images/guilds/nature-absurd-postcard.webp',
    imageAlt: {
      vi: 'Postcard phi lý của Team Thiên nhiên với một chiếc lá chở đôi giày qua ruộng bậc thang và dòng nước.',
      en: 'An absurd postcard for Nature Team with a leaf carrying shoes through terraces and running water.',
    },
    chapterHint: {
      vi: 'Nhặt từ vườn bà nội, cánh đồng sau gặt và những đường rừng phía Tây.',
      en: 'Collected from grandmother gardens, post-harvest fields, and westward forest roads.',
    },
    story: {
      vi: 'Hội của vườn sau nhà, sông sau mưa, con đường lầy và mùi lá. Đi để nghe đất trời nói nhỏ, rồi góp vào cuốn chung một điều rất bé mà sáng.',
      en: 'For gardens behind houses, rivers after rain, muddy paths, and the smell of leaves. Walk until the land speaks softly, then add one small bright thing to the shared book.',
    },
  },
  walk: {
    imageSrc: '/images/guilds/walk-absurd-postcard.webp',
    imageAlt: {
      vi: 'Postcard phi lý của Team Đi dạo với dép nhựa và chiếc ca men đang đi trên một con ngõ nhỏ.',
      en: 'An absurd postcard for Walking Team with plastic sandals and an enamel cup walking down a small lane.',
    },
    chapterHint: {
      vi: 'Nhặt từ phố cũ, quán chè và mùa hè kiếm tiền chơi game.',
      en: 'Collected from old streets, sweet soup shops, and summers earning game money.',
    },
    story: {
      vi: 'Hội của dép lê, phố cũ, quán chè và những cuộc đi không nhất thiết có đích. Thấy gì hay thì ghi lại; vui nhất là một đoạn đường tưởng bình thường bỗng có chuyện.',
      en: 'For slippers, old streets, sweet shops, and walks that do not need a destination. Notice what is good and write it down; the best part is when an ordinary road suddenly has a story.',
    },
  },
  rebellion: {
    imageSrc: '/images/guilds/rebellion-absurd-postcard.webp',
    imageAlt: {
      vi: 'Postcard phi lý của Team Nổi loạn với xe máy ngủ dưới đèn phố và mặt trăng băng cassette.',
      en: 'An absurd postcard for Rebellion Team with a motorbike sleeping under street lights and a cassette moon.',
    },
    chapterHint: {
      vi: 'Nhặt từ đêm thành phố, những cú rẽ ngang và phép thử nhỏ.',
      en: 'Collected from city nights, sideways turns, and a small test.',
    },
    story: {
      vi: 'Hội của những cú rẽ ngang sau khi trời tối: muốn khác đi một chút, nhưng vẫn tử tế. Nổi loạn ở đây là dám bước khỏi thói quen rồi quay lại kể thật.',
      en: 'For sideways turns after dark: wanting to be a little different while staying decent. Rebellion here means stepping out of habit, then coming back to tell it honestly.',
    },
  },
} satisfies Record<GuildSlug, GuildPresentation>;

const formatDate = (value: string, language: LanguageCode) => new Date(value).toLocaleDateString(
  language === 'vi' ? 'vi-VN' : 'en-US',
  { day: 'numeric', month: 'short', year: 'numeric' },
);

const getGuildName = (guild: GuildLeaderboardEntry, language: LanguageCode) => (
  language === 'vi' ? guild.nameVi : guild.nameEn
);

const getGuildDescription = (guild: GuildLeaderboardEntry, language: LanguageCode) => (
  GUILD_PRESENTATION[guild.slug].story[language] ?? (language === 'vi' ? guild.descriptionVi : guild.descriptionEn)
);

const getGuildChapterHint = (slug: GuildSlug, language: LanguageCode) => (
  GUILD_PRESENTATION[slug].chapterHint[language]
);

const getGuildImageAlt = (slug: GuildSlug, language: LanguageCode) => (
  GUILD_PRESENTATION[slug].imageAlt[language]
);

const getInitialSlug = (membership: GuildMembership | null, options: GuildLeaderboardEntry[]): GuildSlug => (
  membership?.guildSlug ?? options[0]?.slug ?? 'history'
);

export const GuildPage = ({
  tasks,
  language,
  t,
}: {
  tasks: ChallengeTask[];
  language: LanguageCode;
  t: (key: string, values?: Record<string, string | number>) => string;
}) => {
  const { user, loading: authLoading, signIn } = useAuth();
  const userId = user?.id ?? null;
  const [leaderboard, setLeaderboard] = useState<GuildLeaderboardEntry[]>([]);
  const [membership, setMembership] = useState<GuildMembership | null>(null);
  const [roster, setRoster] = useState<GuildRosterEntry[]>([]);
  const [posts, setPosts] = useState<GuildPost[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<GuildSlug>('history');
  const [nickname, setNickname] = useState('');
  const [postBody, setPostBody] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [joining, setJoining] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [syncWarning, setSyncWarning] = useState(false);
  const activeTasks = useMemo(() => tasks.filter((task) => task.enabled), [tasks]);
  const hasCompletedLevelOne = useMemo(
    () => hasUnlockedAllChallenges(loadOrCreateProgress(activeTasks).completedTaskIds),
    [activeTasks],
  );

  const refresh = useCallback(async () => {
    setError(null);
    setNotice(null);
    setSyncWarning(false);
    setRefreshing(true);

    try {
      const [nextLeaderboard, nextMembership] = await Promise.all([
        loadGuildLeaderboard(),
        loadMyGuildMembership(userId),
      ]);

      setLeaderboard(nextLeaderboard);
      setMembership(nextMembership);
      setSelectedSlug(getInitialSlug(nextMembership, nextLeaderboard));
      if (nextMembership) setNickname(nextMembership.nickname);

      if (!nextMembership) {
        setRoster([]);
        setPosts([]);
        return;
      }

      const syncResult = await syncCompletedChallengeRuns({
        userId,
        runs: loadHistory(),
      });
      setSyncWarning(syncResult.failed > 0);

      const [latestLeaderboard, latestMembership, nextRoster, nextPosts] = await Promise.all([
        loadGuildLeaderboard(),
        loadMyGuildMembership(userId),
        loadGuildRoster(nextMembership.guildSlug),
        loadGuildPosts(nextMembership.guildSlug),
      ]);

      setLeaderboard(latestLeaderboard);
      setMembership(latestMembership ?? nextMembership);
      setRoster(nextRoster);
      setPosts(nextPosts);
    } catch (nextError) {
      if (nextError instanceof GuildError) {
        setError(t(nextError.translationKey));
      } else {
        setError(t('guild.error.load'));
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t, userId]);

  useEffect(() => {
    if (authLoading) return;
    const timeoutId = window.setTimeout(() => {
      void refresh();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [authLoading, refresh]);

  const selectedGuild = useMemo(
    () => leaderboard.find((guild) => guild.slug === selectedSlug) ?? leaderboard[0],
    [leaderboard, selectedSlug],
  );

  const currentGuild = useMemo(
    () => membership ? leaderboard.find((guild) => guild.slug === membership.guildSlug) : selectedGuild,
    [leaderboard, membership, selectedGuild],
  );
  const canEnterGuild = Boolean(membership) || hasCompletedLevelOne;
  const currentGuildSlug = membership?.guildSlug ?? currentGuild?.slug ?? selectedSlug;
  const currentPresentation = GUILD_PRESENTATION[currentGuildSlug];

  const handleJoin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || joining) return;

    setJoining(true);
    setError(null);
    setNotice(null);

    try {
      const nextMembership = await joinGuild({
        userId: user.id,
        guildSlug: selectedSlug,
        nickname,
      });
      setMembership(nextMembership);
      setNickname(nextMembership.nickname);
      await refresh();
      setNotice(t('guild.joinSuccess'));
    } catch (nextError) {
      if (nextError instanceof GuildError) {
        setError(t(nextError.translationKey));
      } else {
        setError(t('guild.error.join'));
      }
    } finally {
      setJoining(false);
    }
  };

  const handlePost = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || !membership || posting) return;

    setPosting(true);
    setError(null);
    setNotice(null);

    try {
      const newPost = await submitGuildPost({ userId: user.id, body: postBody });
      setPostBody('');
      setNotice(t('guild.postPending'));
      if (newPost) setPosts(await loadGuildPosts(membership.guildSlug));
    } catch (nextError) {
      if (nextError instanceof GuildError) {
        setError(t(nextError.translationKey));
      } else {
        setError(t('guild.error.submit'));
      }
    } finally {
      setPosting(false);
    }
  };

  const signInToGuild = () => {
    void signIn(window.location.origin + '/guild');
  };

  if (loading || authLoading) {
    return (
      <div className="mx-auto grid w-full max-w-5xl gap-5 px-4 py-8 sm:px-6">
        <Card>
          <div className="flex items-center gap-3 text-[var(--forest-900)]" role="status" aria-live="polite">
            <RefreshCw className="h-5 w-5 animate-spin" aria-hidden="true" />
            <span>{t('guild.loading')}</span>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-5 px-4 py-6 pb-8 sm:px-6 sm:py-10">
      <header className="grid gap-3">
        <p className="section-kicker">{t('guild.kicker')}</p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-black tracking-tight text-[var(--forest-950)] sm:text-5xl">{t('guild.title')}</h1>
            <p className="mt-3 max-w-xl text-[var(--forest-800)]">{t('guild.intro')}</p>
          </div>
          <button
            type="button"
            onClick={() => { void refresh(); }}
            disabled={refreshing}
            className="inline-flex min-h-[3rem] items-center justify-center gap-2 rounded-full border border-[rgba(61,84,52,0.18)] bg-[rgba(255,255,255,0.54)] px-4 py-2 text-sm font-black text-[var(--forest-900)] transition hover:bg-[rgba(255,255,255,0.76)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw className={refreshing ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} aria-hidden="true" />
            {t('guild.refresh')}
          </button>
        </div>
      </header>

      {error ? (
        <div className="rounded-[1.35rem] border border-[rgba(141,64,47,0.22)] bg-[rgba(170,85,70,0.12)] px-4 py-3 text-[var(--brocade-red)]" role="alert">
          {error}
        </div>
      ) : null}

      {notice ? (
        <div className="flex items-start gap-2 rounded-[1.35rem] border border-[rgba(61,84,52,0.15)] bg-[rgba(85,122,72,0.11)] px-4 py-3 text-[var(--forest-800)]" role="status" aria-live="polite">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <span>{notice}</span>
        </div>
      ) : null}

      <Card className="p-4 sm:p-6">
        <div className="flex items-start gap-3">
          <Users className="mt-1 h-6 w-6 shrink-0 text-[var(--earth-800)]" aria-hidden="true" />
          <div>
            <h2 className="text-2xl font-black text-[var(--forest-950)]">{t('guild.leaderboardTitle')}</h2>
            <p className="mt-1 text-[var(--forest-800)]">{t('guild.leaderboardDescription')}</p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {leaderboard.map((guild) => {
            const Icon = guildIcon(guild.slug);
            const isCurrent = membership?.guildSlug === guild.slug;
            return (
              <article
                key={guild.slug}
                className={[
                  'overflow-hidden rounded-[1.5rem] border shadow-[0_12px_24px_rgba(38,52,31,0.08)]',
                  isCurrent
                    ? 'border-[rgba(141,64,47,0.32)] bg-[rgba(255,247,229,0.82)]'
                    : 'border-[rgba(61,84,52,0.12)] bg-[rgba(255,255,255,0.54)]',
                ].join(' ')}
              >
                <div className="relative aspect-[16/8] overflow-hidden bg-[var(--forest-950)]">
                  <img
                    src={GUILD_PRESENTATION[guild.slug].imageSrc}
                    alt={getGuildImageAlt(guild.slug, language)}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[rgba(6,14,10,0.74)] to-transparent p-3">
                    <p className="line-clamp-2 text-xs font-black uppercase tracking-[0.16em] text-[var(--fabric-100)]">
                      {getGuildChapterHint(guild.slug, language)}
                    </p>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="wood-panel flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[var(--earth-900)]" aria-hidden="true">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--earth-800)]">
                          {t('guild.rank', { rank: guild.rank })}
                        </p>
                        <h3 className="truncate text-xl font-black text-[var(--forest-950)]">{getGuildName(guild, language)}</h3>
                      </div>
                    </div>
                    <strong className="shrink-0 text-2xl font-black text-[var(--forest-950)]">{guild.totalPoints}</strong>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[var(--forest-800)]">{getGuildDescription(guild, language)}</p>
                  <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm font-semibold text-[var(--forest-700)]">
                    <span>{t('guild.members', { count: guild.memberCount })}</span>
                    <span>{t('guild.contributors', { count: guild.contributorCount })}</span>
                    <span>{t('guild.pointsLabel')}</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <p className="mt-4 text-sm text-[var(--forest-700)]">{t('guild.scoreNote')}</p>
      </Card>

      {!canEnterGuild ? (
        <Card className="border-[rgba(141,64,47,0.18)] bg-[rgba(255,247,229,0.72)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="section-kicker">{t('guild.lockedKicker')}</p>
              <h2 className="text-xl font-black text-[var(--forest-950)]">{t('guild.lockedTitle')}</h2>
              <p className="mt-1 max-w-2xl text-[var(--forest-800)]">{t('guild.lockedDescription')}</p>
            </div>
            <Link
              to="/challenge"
              className="wood-panel inline-flex min-h-[3rem] items-center justify-center gap-2 rounded-full px-5 py-3 text-center text-[1.03rem] font-black text-amber-950 shadow-[0_14px_26px_rgba(91,67,38,0.18)] transition duration-200 hover:-translate-y-px hover:brightness-[1.02] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(220,179,85,0.32)]"
            >
              {t('guild.lockedAction')}
            </Link>
          </div>
        </Card>
      ) : !user ? (
        <Card className="border-[rgba(141,64,47,0.18)] bg-[rgba(255,247,229,0.72)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-[var(--forest-950)]">{t('guild.signInTitle')}</h2>
              <p className="mt-1 max-w-2xl text-[var(--forest-800)]">{t('guild.signInDescription')}</p>
            </div>
            <Button type="button" onClick={signInToGuild} variant="primary">
              <LogIn className="h-5 w-5" aria-hidden="true" />
              {t('guild.signIn')}
            </Button>
          </div>
        </Card>
      ) : !membership ? (
        <Card>
          <div className="max-w-2xl">
            <p className="section-kicker">{t('guild.chooseKicker')}</p>
            <h2 className="mt-1 text-2xl font-black text-[var(--forest-950)]">{t('guild.chooseTitle')}</h2>
            <p className="mt-2 text-[var(--forest-800)]">{t('guild.chooseDescription')}</p>
          </div>

          <form className="mt-5 grid gap-5" onSubmit={(event) => { void handleJoin(event); }}>
            <fieldset className="grid gap-3 sm:grid-cols-2">
              <legend className="sr-only">{t('guild.chooseLegend')}</legend>
              {leaderboard.map((guild) => {
                const Icon = guildIcon(guild.slug);
                const selected = selectedSlug === guild.slug;
                return (
                  <label
                    key={guild.slug}
                    className={[
                      'grid cursor-pointer overflow-hidden rounded-[1.4rem] border transition',
                      selected
                        ? 'border-[rgba(141,64,47,0.42)] bg-[rgba(255,247,229,0.82)] shadow-[0_12px_24px_rgba(112,79,39,0.1)]'
                        : 'border-[rgba(61,84,52,0.14)] bg-[rgba(255,255,255,0.5)] hover:bg-[rgba(255,255,255,0.74)]',
                    ].join(' ')}
                  >
                    <span className="relative block aspect-[16/7] overflow-hidden bg-[var(--forest-950)]">
                      <img
                        src={GUILD_PRESENTATION[guild.slug].imageSrc}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                      <span className="absolute left-3 top-3 wood-panel flex h-10 w-10 items-center justify-center rounded-full text-[var(--earth-900)]" aria-hidden="true">
                        <Icon className="h-5 w-5" />
                      </span>
                    </span>
                    <span className="flex min-h-[8.5rem] items-start gap-3 p-4">
                      <input
                        type="radio"
                        name="guild"
                        value={guild.slug}
                        checked={selected}
                        onChange={() => setSelectedSlug(guild.slug)}
                        className="mt-1 h-5 w-5 accent-[var(--brocade-red)]"
                      />
                      <span className="min-w-0">
                        <span className="flex items-center gap-2 font-black text-[var(--forest-950)]">
                          {getGuildName(guild, language)}
                        </span>
                        <span className="mt-1 block text-sm font-semibold text-[var(--earth-800)]">{getGuildChapterHint(guild.slug, language)}</span>
                        <span className="mt-2 block text-sm leading-6 text-[var(--forest-800)]">{getGuildDescription(guild, language)}</span>
                      </span>
                    </span>
                  </label>
                );
              })}
            </fieldset>

            <label className="grid gap-2 text-sm font-black text-[var(--forest-900)]">
              <span>{t('guild.nicknameLabel')}</span>
              <input
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
                minLength={2}
                maxLength={24}
                required
                autoComplete="nickname"
                placeholder={t('guild.nicknamePlaceholder')}
                className="min-h-[3.2rem] w-full rounded-[1.1rem] border border-[rgba(61,84,52,0.18)] bg-[rgba(255,255,255,0.74)] px-4 py-3 text-[var(--forest-950)] outline-none focus-visible:ring-4 focus-visible:ring-[rgba(220,179,85,0.3)]"
              />
              <span className="font-normal text-[var(--forest-700)]">{t('guild.nicknameHelp')}</span>
            </label>

            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" disabled={joining || leaderboard.length === 0} variant="gpsPrimary">
                {joining ? <RefreshCw className="h-5 w-5 animate-spin" aria-hidden="true" /> : <Users className="h-5 w-5" aria-hidden="true" />}
                {joining ? t('guild.joining') : t('guild.join')}
              </Button>
              <p className="text-sm text-[var(--forest-700)]">{t('guild.joinNote')}</p>
            </div>
          </form>
        </Card>
      ) : (
        <>
          <Card className="overflow-hidden p-0">
            <div className="grid gap-5 bg-[linear-gradient(135deg,rgba(38,70,42,0.96),rgba(80,103,62,0.92))] p-5 text-[var(--fabric-100)] sm:p-7 lg:grid-cols-[1fr_0.9fr]">
              <div className="grid gap-5">
                <div className="flex flex-wrap items-start justify-between gap-5">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-[rgba(246,239,221,0.72)]">{t('guild.yourGuild')}</p>
                    <h2 className="mt-2 text-3xl font-black">{currentGuild ? getGuildName(currentGuild, language) : membership.guildSlug}</h2>
                    <p className="mt-2 max-w-2xl text-[rgba(246,239,221,0.86)]">{currentGuild ? getGuildDescription(currentGuild, language) : ''}</p>
                    <p className="mt-3 max-w-2xl text-sm font-black uppercase tracking-[0.16em] text-[rgba(246,239,221,0.68)]">
                      {getGuildChapterHint(currentGuildSlug, language)}
                    </p>
                  </div>
                  <div className="rounded-[1.4rem] border border-[rgba(246,239,221,0.2)] bg-[rgba(0,0,0,0.14)] px-5 py-4 text-right">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-[rgba(246,239,221,0.72)]">{t('guild.nicknameLabel')}</p>
                    <p className="mt-1 text-xl font-black">{membership.nickname}</p>
                    <p className="mt-2 text-sm text-[rgba(246,239,221,0.8)]">{t('guild.pointsTotal', { points: membership.totalPoints })}</p>
                  </div>
                </div>
                {syncWarning ? <p className="rounded-[1rem] bg-[rgba(255,247,229,0.14)] px-3 py-2 text-sm text-[rgba(246,239,221,0.9)]">{t('guild.syncPending')}</p> : null}
              </div>
              <div className="relative min-h-[15rem] overflow-hidden rounded-[1.4rem] border border-[rgba(246,239,221,0.18)] bg-[rgba(0,0,0,0.2)] shadow-[0_18px_36px_rgba(0,0,0,0.22)]">
                <img
                  src={currentPresentation.imageSrc}
                  alt={getGuildImageAlt(currentGuildSlug, language)}
                  className="h-full min-h-[15rem] w-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[rgba(6,14,10,0.78)] to-transparent p-4">
                  <p className="text-sm font-black uppercase tracking-[0.16em] text-[rgba(246,239,221,0.9)]">{currentPresentation.chapterHint[language]}</p>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
            <Card>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="section-kicker">{t('guild.rosterKicker')}</p>
                  <h2 className="mt-1 text-2xl font-black text-[var(--forest-950)]">{t('guild.rosterTitle')}</h2>
                </div>
                <Users className="h-6 w-6 text-[var(--earth-800)]" aria-hidden="true" />
              </div>

              {roster.length === 0 ? (
                <p className="mt-5 text-[var(--forest-800)]">{t('guild.rosterEmpty')}</p>
              ) : (
                <ol className="mt-5 grid gap-2">
                  {roster.slice(0, 8).map((entry) => (
                    <li key={entry.rank + '-' + entry.nickname} className="flex items-center justify-between gap-3 rounded-[1rem] bg-[rgba(255,255,255,0.52)] px-3 py-2 ring-1 ring-[rgba(61,84,52,0.1)]">
                      <span className="flex min-w-0 items-center gap-3">
                        <strong className="w-6 text-center text-[var(--earth-800)]">{entry.rank}</strong>
                        <span className="truncate font-semibold text-[var(--forest-950)]">{entry.nickname}</span>
                      </span>
                      <span className="shrink-0 text-sm font-black text-[var(--forest-800)]">{entry.totalPoints}</span>
                    </li>
                  ))}
                </ol>
              )}
            </Card>

            <Card>
              <p className="section-kicker">{t('guild.postKicker')}</p>
              <h2 className="mt-1 text-2xl font-black text-[var(--forest-950)]">{t('guild.postTitle')}</h2>
              <p className="mt-2 text-[var(--forest-800)]">{t('guild.postDescription')}</p>
              <form className="mt-4 grid gap-3" onSubmit={(event) => { void handlePost(event); }}>
                <label className="sr-only" htmlFor="guild-post-body">{t('guild.postLabel')}</label>
                <textarea
                  id="guild-post-body"
                  value={postBody}
                  onChange={(event) => setPostBody(event.target.value)}
                  minLength={10}
                  maxLength={800}
                  required
                  rows={5}
                  placeholder={t('guild.postPlaceholder')}
                  className="w-full resize-y rounded-[1.1rem] border border-[rgba(61,84,52,0.18)] bg-[rgba(255,255,255,0.74)] px-4 py-3 text-[var(--forest-950)] outline-none focus-visible:ring-4 focus-visible:ring-[rgba(220,179,85,0.3)]"
                />
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-[var(--forest-700)]">{t('guild.postHelp')}</p>
                  <Button type="submit" disabled={posting || postBody.trim().length < 10} variant="primary">
                    {posting ? <RefreshCw className="h-5 w-5 animate-spin" aria-hidden="true" /> : <Send className="h-5 w-5" aria-hidden="true" />}
                    {posting ? t('guild.posting') : t('guild.post')}
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          <Card>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="section-kicker">{t('guild.notesKicker')}</p>
                <h2 className="mt-1 text-2xl font-black text-[var(--forest-950)]">{t('guild.notesTitle')}</h2>
              </div>
              <p className="text-sm text-[var(--forest-700)]">{t('guild.notesModerated')}</p>
            </div>

            {posts.length === 0 ? (
              <p className="mt-5 text-[var(--forest-800)]">{t('guild.notesEmpty')}</p>
            ) : (
              <div className="mt-5 grid gap-3">
                {posts.map((post) => (
                  <article key={post.id} className="rounded-[1.3rem] bg-[rgba(255,255,255,0.56)] p-4 ring-1 ring-[rgba(61,84,52,0.12)]">
                    <p className="whitespace-pre-line text-[var(--forest-950)]">{post.body}</p>
                    <p className="mt-3 text-sm font-semibold text-[var(--forest-700)]">
                      {post.nickname} · {formatDate(post.createdAt, language)}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
};
