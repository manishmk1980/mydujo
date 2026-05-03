import React from 'react';
import { cn } from '../../../lib/utils';

export interface AdminIconChipProps {
  icon: React.ReactNode;
  label?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const variantStyles: Record<NonNullable<AdminIconChipProps['variant']>, string> = {
  default: 'bg-[var(--admin-surface-soft)] text-[var(--admin-text-muted)]',
  primary: 'bg-[var(--admin-primary-soft)] text-[var(--admin-primary)]',
  success: 'bg-[var(--admin-success)]/10 text-[var(--admin-success)]',
  warning: 'bg-[var(--admin-warning)]/10 text-[var(--admin-warning)]',
  danger: 'bg-[var(--admin-danger)]/10 text-[var(--admin-danger)]',
  info: 'bg-[var(--admin-info)]/10 text-[var(--admin-info)]',
};

const sizeStyles: Record<NonNullable<AdminIconChipProps['size']>, { chip: string; icon: string; label: string }> = {
  sm: {
    chip: 'h-7 px-2 gap-1.5 rounded-lg',
    icon: 'w-3.5 h-3.5',
    label: 'text-xs',
  },
  md: {
    chip: 'h-9 px-3 gap-2 rounded-xl',
    icon: 'w-4 h-4',
    label: 'text-sm',
  },
  lg: {
    chip: 'h-11 px-4 gap-2.5 rounded-2xl',
    icon: 'w-5 h-5',
    label: 'text-base',
  },
};

export function AdminIconChip({
  icon,
  label,
  variant = 'default',
  size = 'md',
  className,
}: AdminIconChipProps) {
  const sizeConfig = sizeStyles[size];

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center font-medium border border-transparent',
        variantStyles[variant],
        sizeConfig.chip,
        className
      )}
    >
      <div className={cn('flex-shrink-0', sizeConfig.icon)}>{icon}</div>
      {label && <span className={cn('font-bold', sizeConfig.label)}>{label}</span>}
    </div>
  );
}