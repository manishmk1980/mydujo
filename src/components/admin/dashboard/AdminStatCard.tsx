import React, { ReactNode } from 'react';
import { cn } from '../../../lib/utils';

export type AdminStatAccent = 'orange' | 'blue' | 'emerald' | 'amber' | 'rose' | 'violet' | 'slate';

const accentMap: Record<AdminStatAccent, { chip: string; ring: string }> = {
  orange: {
    chip: 'bg-[var(--admin-primary-soft)] text-[var(--admin-primary)]',
    ring: 'ring-[color-mix(in_srgb,var(--admin-primary)_18%,transparent)]',
  },
  blue: { chip: 'bg-[rgba(14,165,233,0.10)] text-[#0ea5e9]', ring: 'ring-[#0ea5e9]/15' },
  emerald: { chip: 'bg-[rgba(16,185,129,0.10)] text-[#10b981]', ring: 'ring-[#10b981]/15' },
  amber: { chip: 'bg-[rgba(245,158,11,0.10)] text-[#f59e0b]', ring: 'ring-[#f59e0b]/15' },
  rose: { chip: 'bg-[rgba(239,68,68,0.10)] text-[#ef4444]', ring: 'ring-[#ef4444]/15' },
  violet: { chip: 'bg-[rgba(139,92,246,0.10)] text-[#8b5cf6]', ring: 'ring-[#8b5cf6]/15' },
  slate: { chip: 'bg-[rgba(107,114,128,0.10)] text-[#6b7280]', ring: 'ring-[#6b7280]/20' },
};

interface AdminStatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  accent?: AdminStatAccent;
  featured?: boolean;
  className?: string;
}

export function AdminStatCard({
  title,
  value,
  description,
  icon,
  accent = 'slate',
  featured,
  className,
}: AdminStatCardProps) {
  const a = accentMap[accent];

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-3xl border border-[var(--admin-border)] p-5 sm:p-6 shadow-sm transition-shadow hover:shadow-md',
        featured
          ? 'bg-gradient-to-br from-[var(--admin-ink)] via-[var(--admin-ink-mid)] to-[var(--admin-ink-deep)] text-white ring-2 ring-[var(--admin-primary)]/30'
          : 'bg-[var(--admin-surface)] ring-1 ring-transparent',
        !featured && a.ring,
        className
      )}
    >
      {icon ? (
        <div
          className={cn(
            'inline-flex size-11 items-center justify-center rounded-2xl shrink-0 [&_svg]:size-5',
            featured ? 'bg-white/10 text-[var(--admin-primary)]/80' : a.chip
          )}
        >
          {icon}
        </div>
      ) : null}
      <p
        className={cn(
          'mt-4 text-3xl sm:text-4xl font-bold tabular-nums tracking-tight',
          "font-['Space_Grotesk',sans-serif]",
          featured ? 'text-white' : 'text-[var(--admin-text)]'
        )}
      >
        {value}
      </p>
      <p
        className={cn(
          'mt-2 text-sm font-semibold',
          "font-['Space_Grotesk',sans-serif]",
          featured ? 'text-[var(--admin-text-muted)]/80' : 'text-[var(--admin-text-muted)]'
        )}
      >
        {title}
      </p>
      {description ? (
        <p className={cn('mt-1 text-xs leading-relaxed', featured ? 'text-[var(--admin-text-muted)]/60' : 'text-[var(--admin-text-muted)]/80')}>
          {description}
        </p>
      ) : null}
    </div>
  );
}
