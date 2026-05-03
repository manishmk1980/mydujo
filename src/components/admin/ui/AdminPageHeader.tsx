import React, { type ReactNode } from 'react';
import { cn } from '../../../lib/utils';

export interface AdminPageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
  eyebrow?: string;
}

/** Shared page title row for all admin routes — stacks on narrow screens, truncates safely at 320px. */
export function AdminPageHeader({ title, subtitle, actions, className, eyebrow }: AdminPageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 min-w-0 mb-6 sm:mb-8 md:flex-row md:items-end md:justify-between',
        className
      )}
    >
      <div className="min-w-0 flex-1">
        {eyebrow && (
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--admin-primary)] mb-1">
            {eyebrow}
          </p>
        )}
        <h1 className="text-xl font-black tracking-tight text-[var(--admin-text)] break-words font-['Space_Grotesk',sans-serif] sm:text-2xl md:text-3xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="text-[var(--admin-text-muted)] mt-1 text-sm sm:text-base max-w-2xl break-words">{subtitle}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-col gap-2 shrink-0 w-full min-w-0 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:w-auto">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
