import { supportedLanguages } from '../i18n';
import type { LanguageCode } from '../types/task';

type LanguageSwitchProps = { language: LanguageCode; label: string; onChange: (language: LanguageCode) => void };

export const LanguageSwitch = ({ language, label, onChange }: LanguageSwitchProps) => (
  <div className="flex min-w-0 items-center gap-1 rounded-full border border-[rgba(69,89,60,0.14)] bg-[rgba(247,241,228,0.88)] p-1 text-sm font-bold text-[var(--forest-900)] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]" aria-label={label}>
    {supportedLanguages.map((item) => (
      <button
        key={item}
        type="button"
        onClick={() => onChange(item)}
        className={`rounded-full px-3 py-2 uppercase transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(220,179,85,0.32)] ${item === language ? 'wood-panel text-[var(--earth-900)] shadow-[0_8px_18px_rgba(109,79,45,0.18)]' : 'text-[var(--forest-700)] hover:bg-[rgba(255,255,255,0.56)]'}`}
      >
        {item}
      </button>
    ))}
  </div>
);
