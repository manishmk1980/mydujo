import React from 'react';
import { cn } from '../../lib/utils';

/** Section within a page: card-style container with optional title. */
interface PageSectionProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function PageSection({ title, children, className }: PageSectionProps) {
  return (
    <section
      className={cn(
        'rounded-2xl border border-slate-200 bg-white shadow-sm p-6',
        className
      )}
    >
      {title && (
        <h3 className="text-lg font-semibold text-slate-900 mb-4">{title}</h3>
      )}
      {children}
    </section>
  );
}
