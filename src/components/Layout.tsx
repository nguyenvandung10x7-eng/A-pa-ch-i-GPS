import { useState, type ReactNode } from 'react';
import { Compass, Loader2 } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAdminStatus } from '../hooks/useAdminStatus';
import { LanguageSwitch } from './LanguageSwitch';
import type { LanguageCode } from '../types/task';

type LayoutProps = { children: ReactNode; language: LanguageCode; setLanguage: (language: LanguageCode) => void; t: (key: string) => string };

export const Layout = ({ children, language, setLanguage, t }: LayoutProps) => {
  const { user, loading, signIn, signOutUser } = useAuth();
  const { isAdmin, checkingAdmin } = useAdminStatus();
  const [authBusy, setAuthBusy] = useState(false);
  const navItems: Array<[string, string]> = [
    ['/challenge', 'nav.challenge'],
    ['/history', 'nav.history'],
    ['/discover', 'nav.discover'],
    ['/leaderboard', 'nav.leaderboard'],
  ];

  if (user && !checkingAdmin && isAdmin) {
    navItems.push(['/moderation', 'nav.moderation']);
    navItems.push(['/admin', 'nav.admin']);
  }

  const handleSignIn = async () => {
    try {
      setAuthBusy(true);
      await signIn();
    } finally {
      setAuthBusy(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setAuthBusy(true);
      await signOutUser();
    } finally {
      setAuthBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#1f7aff55,transparent_32rem),linear-gradient(135deg,#06111f,#10223d_50%,#09101c)] text-white">
      <nav className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between">
        <Link to="/" className="flex items-center gap-3 text-xl font-black tracking-tight">
          <span className="rounded-2xl bg-cyan-400 p-2 text-slate-950"><Compass /></span>{t('app.name')}
        </Link>
        <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-200">
          {navItems.map(([to, key]) => (
            <NavLink key={to} to={to} className={({ isActive }) => `rounded-full px-4 py-2 transition ${isActive ? 'bg-cyan-300 text-slate-950' : 'glass hover:bg-white/20'}`}>
              {t(key)}
            </NavLink>
          ))}
          <LanguageSwitch language={language} label={t('language.switch')} onChange={setLanguage} />
          {loading ? (
            <span className="rounded-full border border-white/20 px-3 py-2 text-slate-200">
              <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
              {t('app.loading')}
            </span>
          ) : user ? (
            <div className="flex items-center gap-2 rounded-full border border-cyan-300/40 bg-cyan-400/10 px-3 py-2">
              {user.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url as string} alt={user.user_metadata?.full_name ?? user.email ?? 'User'} className="h-8 w-8 rounded-full border border-white/20" />
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-300 text-sm font-black text-slate-950">
                  {user.email?.charAt(0).toUpperCase() ?? 'U'}
                </span>
              )}
              <span className="max-w-[8rem] truncate text-sm text-cyan-50">{user.user_metadata?.full_name ?? user.email ?? 'User'}</span>
              <button type="button" onClick={handleSignOut} disabled={authBusy} className="rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-white transition hover:bg-white/20 disabled:opacity-60">
                {authBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Logout'}
              </button>
            </div>
          ) : (
            <button type="button" onClick={handleSignIn} disabled={authBusy} className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-black text-slate-950 transition hover:bg-cyan-300 disabled:opacity-60">
              {authBusy ? <Loader2 className="mr-2 inline h-4 w-4 animate-spin" /> : null}
              Login with Google
            </button>
          )}
        </div>
      </nav>
      <main className="mx-auto max-w-7xl px-4 pb-12">{children}</main>
    </div>
  );
};
