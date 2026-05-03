import React, { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface AdminMetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  accent?: 'orange' | 'blue' | 'emerald' | 'amber' | 'slate' | 'indigo' | 'rose' | 'sky';
  eyebrow?: string;
  className?: string;
}

const accentMap = {
  orange: {
    bg: 'bg-[var(--admin-primary-soft)]',
    text: 'text-[var(--admin-primary)]',
    border: 'border-[var(--admin-primary-border)]',
  },
  blue: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    border: 'border-blue-200',
  },
  emerald: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
  },
  amber: {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    border: 'border-amber-200',
  },
  slate: {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
  },
  indigo: {
    bg: 'bg-indigo-100',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
  },
  rose: {
    bg: 'bg-rose-100',
    text: 'text-rose-700',
    border: 'border-rose-200',
  },
  sky: {
    bg: 'bg-sky-100',
    text: 'text-sky-700',
    border: 'border-sky-200',
  },
};

export function AdminMetricCard({
  title,
  value,
  description,
  icon: Icon,
  accent = 'orange',
  eyebrow,
  className,
}: AdminMetricCardProps) {
  const accentStyle = accentMap[accent];

  return (
    <div
      className={cn(
        'border-[var(--admin-border)] bg-[var(--admin-surface)] p-6 rounded-[var(--admin-radius-card)] shadow-[var(--admin-shadow-card)] transition-all hover:shadow-md group',
        accentStyle.border,
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        {Icon && (
          <div className={cn('p-3 rounded-2xl', accentStyle.bg, accentStyle.text)}>
            <Icon className="size-6" />
          </div>
        )}
        {eyebrow && (
          <span className="text-xs font-bold text-[var(--admin-text-muted)] uppercase tracking-widest leading-none">
            {eyebrow}
          </span>
        )}
      </div>
      <p className="text-3xl font-black leading-none tabular-nums text-[var(--admin-text)]">
        {value}
      </p>
      <p className="mt-2 text-sm font-bold text-[var(--admin-text-muted)]">{title}</p>
      {description && (
        <p className="mt-1 text-xs text-[var(--admin-text-muted)]">{description}</p>
      )}
    </div>
  );
}