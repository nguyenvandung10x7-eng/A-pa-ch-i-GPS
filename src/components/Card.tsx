import type { ReactNode } from 'react';

export const Card = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <section className={`glass textile-border ban-flower relative z-10 overflow-visible rounded-[2rem] p-5 shadow-[0_22px_48px_rgba(38,52,31,0.12)] sm:p-6 ${className}`}>{children}</section>
);
