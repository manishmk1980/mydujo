import React from 'react';
import { Link } from 'react-router-dom';
import { Wallet, Hourglass, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { AdminWidgetCard } from './AdminWidgetCard';

export interface PendingActionRow {
  label: string;
  value: number;
  icon: React.ElementType;
  accent: 'violet' | 'amber' | 'blue' | 'emerald' | 'rose';
}

const accentChip: Record<PendingActionRow['accent'], string> = {
  violet: 'bg-violet-100 text-violet-700',
  amber: 'bg-amber-100 text-amber-800',
  blue: 'bg-sky-100 text-sky-700',
  emerald: 'bg-emerald-100 text-emerald-700',
  rose: 'bg-rose-100 text-rose-700',
};

interface AdminPendingActionsProps {
  rows: PendingActionRow[];
  loading?: boolean;
  className?: string;
}

export function AdminPendingActions({ rows, loading, className }: AdminPendingActionsProps) {
  const queueHref =
    rows.some((r) => r.label === 'Pending Review' && r.value > 0) ||
    rows.some((r) => r.label === 'Pending Payment' && r.value > 0)
      ? '/admin/payments'
      : '/admin/fees';

  return (
    <AdminWidgetCard
      className={cn('h-full min-h-0', className)}
      title="Pending Actions"
      subtitle="Fee and review items needing admin attention"
      action={
        <Link
          to={queueHref}
          className={cn(
            'inline-flex items-center justify-center rounded-xl px-3 py-2 text-xs font-bold',
            'bg-[var(--admin-primary)] text-white shadow-sm transition-colors hover:bg-[var(--admin-primary-hover)]',
            "font-['Space_Grotesk',sans-serif]"
          )}
        >
          Review Queue
        </Link>
      }
    >
      <ul className="space-y-2">
        {rows.map((row) => {
          const Icon = row.icon;
          const attention = !loading && row.value > 0;
          return (
            <li
              key={row.label}
              className={cn(
                'flex items-center gap-3 rounded-2xl border px-3 py-3 sm:px-4',
                attention
                  ? 'border-[var(--admin-primary-border)] bg-[var(--admin-primary-soft)]'
                  : 'border-[var(--admin-border)] bg-[var(--admin-surface-soft)]'
              )}
            >
              <div className={cn('inline-flex size-10 items-center justify-center rounded-xl shrink-0', accentChip[row.accent])}>
                <Icon className="size-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-semibold text-[var(--admin-text)] font-['Space_Grotesk',sans-serif]">{row.label}</p>
              </div>
              <span
                className={cn(
                  'tabular-nums text-sm font-bold rounded-full px-2.5 py-1 shrink-0',
                  attention
                    ? 'bg-[var(--admin-primary)] text-white'
                    : 'border border-[var(--admin-border)] bg-[var(--admin-surface)] text-[var(--admin-text)]'
                )}
              >
                {loading ? '—' : row.value}
              </span>
            </li>
          );
        })}
      </ul>
    </AdminWidgetCard>
  );
}
