import React from 'react';
import {
  Clock,
  CheckCircle2,
  XCircle,
  PauseCircle,
  HelpCircle,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '../../lib/utils';

type StatusVariant = 'pending' | 'approved' | 'rejected' | 'paused' | 'draft' | 'default';

const STATUS_CONFIG: Record<
  StatusVariant,
  { className: string; icon: LucideIcon }
> = {
  pending: {
    className: 'bg-amber-100 text-amber-800 border-amber-200',
    icon: Clock,
  },
  approved: {
    className: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    icon: CheckCircle2,
  },
  rejected: {
    className: 'bg-red-100 text-red-700 border-red-200',
    icon: XCircle,
  },
  paused: {
    className: 'bg-orange-100 text-orange-700 border-orange-200',
    icon: PauseCircle,
  },
  draft: {
    className: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: HelpCircle,
  },
  default: {
    className: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: HelpCircle,
  },
};

function normalizeStatus(value: string): StatusVariant {
  const v = String(value || '').toLowerCase();
  if (['pending', 'approved', 'rejected', 'paused', 'draft'].includes(v)) {
    return v as StatusVariant;
  }
  return 'default';
}

interface StatusBadgeProps {
  status: string;
  label?: string;
  showIcon?: boolean;
  className?: string;
}

/** Reusable status badge for student/admin/instructor panels. */
export function StatusBadge({
  status,
  label,
  showIcon = true,
  className,
}: StatusBadgeProps) {
  const variant = normalizeStatus(status);
  const config = STATUS_CONFIG[variant];
  const displayLabel = label ?? (status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown');
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
        config.className,
        className
      )}
    >
      {showIcon && <Icon className="size-3.5 shrink-0" />}
      {displayLabel}
    </span>
  );
}
