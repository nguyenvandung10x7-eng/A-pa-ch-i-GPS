import type { ReactNode } from 'react';
import { Compass } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import { LanguageSwitch } from './LanguageSwitch';
import type { LanguageCode } from '../types/task';

type LayoutProps = { children: ReactNode; language: LanguageCode; setLanguage: (language: LanguageCode) => void; t: (key: string) => string };

export const Layout = ({ children, language, setLanguage, t }: LayoutProps) => (
  <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#1f7aff55,transparent_32rem),linear-gradient(135deg,#06111f,#10223d_50%,#09101c)] text-white">
    <nav className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between">
      <Link to="/" className="flex items-center gap-3 text-xl font-black tracking-tight">
        <span className="rounded-2xl bg-cyan-400 p-2 text-slate-950"><Compass /></span>{t('app.name')}
      </Link>
      <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-200">
        {[['/challenge', 'nav.challenge'], ['/history', 'nav.history'], ['/admin', 'nav.admin']].map(([to, key]) => (
          <NavLink key={to} to={to} className={({ isActive }) => `rounded-full px-4 py-2 transition ${isActive ? 'bg-cyan-300 text-slate-950' : 'glass hover:bg-white/20'}`}>
            {t(key)}
          </NavLink>
        ))}
        <LanguageSwitch language={language} label={t('language.switch')} onChange={setLanguage} />
      </div>
    </nav>
    <main className="mx-auto max-w-7xl px-4 pb-12">{children}</main>
  </div>
);
