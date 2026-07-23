import { supportedLanguages } from '../i18n';
import type { LanguageCode } from '../types/task';

type LanguageSwitchProps = { language: LanguageCode; label: string; onChange: (language: LanguageCode) => void };

export const LanguageSwitch = ({ language, label, onChange }: LanguageSwitchProps) => (
  <div className="flex items-center gap-2 rounded-full bg-white/10 p-1 text-sm font-bold" aria-label={label}>
    {supportedLanguages.map((item) => (
      <button key={item} onClick={() => onChange(item)} className={`rounded-full px-3 py-2 uppercase ${item === language ? 'bg-cyan-300 text-slate-950' : 'text-slate-200'}`}>
        {item}
      </button>
    ))}
  </div>
);
