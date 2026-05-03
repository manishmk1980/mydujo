import React, { type ReactNode } from 'react';
import { cn } from '../../../lib/utils';

export function AdminFormCard({
  title,
  subtitle,
  children,
  className,
}: {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        'rounded-[var(--admin-radius-card)] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-6 shadow-[var(--admin-shadow-card)]',
        className
      )}
    >
      {(title || subtitle) && (
        <div className="mb-6 min-w-0">
          {title ? (
            <h2 className="text-lg font-bold break-words text-[var(--admin-text)] font-['Space_Grotesk',sans-serif]">{title}</h2>
          ) : null}
          {subtitle ? <p className="mt-1 text-sm text-[var(--admin-text-muted)]">{subtitle}</p> : null}
        </div>
      )}
      {children}
    </section>
  );
}
