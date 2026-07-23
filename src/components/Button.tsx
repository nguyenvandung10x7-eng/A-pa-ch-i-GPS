import type { ReactNode } from 'react';

type ButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary' | 'danger';
};

const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-cyan-300 text-slate-950 shadow-lg shadow-cyan-950/30',
  secondary: 'glass text-white hover:bg-white/20',
  danger: 'bg-rose-300 text-rose-950',
};

export const Button = ({ children, onClick, type = 'button', variant = 'primary' }: ButtonProps) => (
  <button type={type} onClick={onClick} className={`rounded-full px-5 py-3 font-black transition ${variants[variant]}`}>
    {children}
  </button>
);
