import type { ReactNode } from 'react';

type ButtonProps = {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary' | 'danger';
};

const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'wood-panel text-amber-950 shadow-[0_14px_26px_rgba(91,67,38,0.18)] hover:-translate-y-px hover:brightness-[1.02]',
  secondary: 'bg-[rgba(245,240,227,0.86)] text-emerald-950 ring-1 ring-[rgba(61,84,52,0.16)] hover:bg-[rgba(250,246,236,0.96)]',
  danger: 'bg-[rgba(170,85,70,0.14)] text-[var(--brocade-red)] ring-1 ring-[rgba(141,64,47,0.14)] hover:bg-[rgba(170,85,70,0.2)]',
};

export const Button = ({ children, className = '', disabled = false, onClick, type = 'button', variant = 'primary' }: ButtonProps) => (
  <button
    type={type}
    disabled={disabled}
    onClick={onClick}
    className={`inline-flex min-h-[3rem] items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-black tracking-[0.01em] transition duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(220,179,85,0.32)] disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
  >
    {children}
  </button>
);
