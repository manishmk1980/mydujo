import React, { type ReactNode } from 'react';
import { Inbox } from 'lucide-react';
import { cn } from '../../../lib/utils';

export function AdminEmptyState({
  title = 'Nothing here yet',
  description,
  action,
  className,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-[var(--admin-radius-card)] border border-dashed border-[var(--admin-border)] bg-[var(--admin-surface-soft)] px-6 py-14 text-center',
        className
      )}
    >
      <Inbox className="size-10 text-[var(--admin-text-muted)] opacity-50" aria-hidden />
      <div>
        <p className="text-sm font-bold text-[var(--admin-text)]">{title}</p>
        {description ? (
          <p className="mx-auto mt-1 max-w-sm text-sm text-[var(--admin-text-muted)]">{description}</p>
        ) : null}
      </div>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
