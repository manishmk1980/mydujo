import React from 'react';
import { cn } from '../../../lib/utils';
import { AdminWidgetCard } from './AdminWidgetCard';

export interface OperationalQueueRow {
  title: string;
  detail: string;
  statusLabel: string;
  statusTone: 'success' | 'warning' | 'neutral' | 'info';
  icon: React.ElementType;
}

const toneClass: Record<OperationalQueueRow['statusTone'], string> = {
  success: 'bg-emerald-100 text-emerald-800 border-emerald-200/80',
  warning: 'bg-amber-100 text-amber-900 border-amber-200/80',
  neutral: 'bg-slate-100 text-slate-700 border-slate-200/80',
  info: 'bg-sky-100 text-sky-800 border-sky-200/80',
};

interface AdminOperationalQueueProps {
  rows: OperationalQueueRow[];
  className?: string;
}

export function AdminOperationalQueue({ rows, className }: AdminOperationalQueueProps) {
  return (
    <AdminWidgetCard className={cn('h-full min-h-0', className)} title="Operational Queue" subtitle="Today's admin focus areas">
      <ul className="space-y-2">
        {rows.map((row) => {
          const Icon = row.icon;
          return (
            <li
              key={row.title}
              className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/30 px-3 py-3"
            >
              <div className="mt-0.5 inline-flex size-9 items-center justify-center rounded-xl bg-white border border-slate-200/80 text-slate-600 shrink-0">
                <Icon className="size-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 font-['Space_Grotesk',sans-serif]">{row.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{row.detail}</p>
              </div>
              <span
                className={cn(
                  'shrink-0 text-[10px] font-bold uppercase tracking-wide rounded-full px-2 py-1 border',
                  toneClass[row.statusTone]
                )}
              >
                {row.statusLabel}
              </span>
            </li>
          );
        })}
      </ul>
    </AdminWidgetCard>
  );
}
