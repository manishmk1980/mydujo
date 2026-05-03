import React, { ReactNode } from 'react';
import { cn } from '../../../lib/utils';

interface AdminWidgetCardProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function AdminWidgetCard({ title, subtitle, action, children, className }: AdminWidgetCardProps) {
  return (
    <section
      className={cn(
        'flex flex-col rounded-[var(--admin-radius-card)] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-5 shadow-[var(--admin-shadow-card)] sm:p-6',
        className
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4 mb-4">
        <div className="min-w-0">
          <h2 className="text-lg font-bold tracking-tight text-[var(--admin-text)] font-['Space_Grotesk',sans-serif]">
            {title}
          </h2>
          {subtitle ? <p className="mt-0.5 text-sm text-[var(--admin-text-muted)]">{subtitle}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="flex-1 min-h-0">{children}</div>
    </section>
  );
}
