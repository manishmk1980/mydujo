import React, { ReactNode } from 'react';
import { cn } from '../../../lib/utils';

interface AdminDashboardHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function AdminDashboardHeader({ title, subtitle, actions }: AdminDashboardHeaderProps) {
  return (
    <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0 flex-1">
        <h1
          className={cn(
            'text-xl font-bold tracking-tight text-slate-900 break-words sm:text-2xl md:text-3xl',
            "font-['Space_Grotesk',sans-serif]"
          )}
        >
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1 max-w-2xl text-sm text-slate-500 sm:text-base break-words">{subtitle}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end lg:w-auto lg:shrink-0">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
