import type { ReactNode } from 'react';

export const Card = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <section className={`glass rounded-[2rem] p-6 ${className}`}>{children}</section>
);
