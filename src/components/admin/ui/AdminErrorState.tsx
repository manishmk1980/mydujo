import React, { type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { cn } from '../../../lib/utils';

export function AdminErrorState({
  message,
  action,
  className,
}: {
  message: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn('rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3', className)}
    >
      <div className="flex items-start gap-2 min-w-0">
        <AlertTriangle className="size-5 shrink-0 text-red-600 mt-0.5" aria-hidden />
        <span className="break-words">{message}</span>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
