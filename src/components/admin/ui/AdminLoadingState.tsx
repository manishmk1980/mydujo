import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../../lib/utils';

export function AdminLoadingState({ label = 'Loading…', className }: { label?: string; className?: string }) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 py-16 text-slate-500', className)}>
      <Loader2 className="size-8 animate-spin text-[var(--admin-primary)]" aria-hidden />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}
