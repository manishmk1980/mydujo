import React, { type ReactNode } from 'react';
import { cn } from '../../../lib/utils';

export function AdminTableCard({
  title,
  subtitle,
  action,
  children,
  className,
}: {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        'rounded-[var(--admin-radius-card)] border border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-[var(--admin-shadow-card)] overflow-hidden',
        className
      )}
    >
      {(title || subtitle || action) && (
        <div className="flex flex-col gap-3 border-b border-[var(--admin-border)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="min-w-0">
            {title ? (
              <h2 className="text-base font-bold break-words text-[var(--admin-text)] font-['Space_Grotesk',sans-serif]">{title}</h2>
            ) : null}
            {subtitle ? <p className="mt-0.5 text-sm text-[var(--admin-text-muted)]">{subtitle}</p> : null}
          </div>
          {action ? <div className="shrink-0 flex flex-wrap gap-2">{action}</div> : null}
        </div>
      )}
      <div className="overflow-x-auto">{children}</div>
    </section>
  );
}
