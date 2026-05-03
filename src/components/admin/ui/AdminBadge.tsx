import React from 'react';
import { cn } from '../../../lib/utils';

export interface AdminBadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'primary' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  rounded?: 'full' | 'lg' | 'md';
  className?: string;
}

const variantStyles: Record<NonNullable<AdminBadgeProps['variant']>, string> = {
  success: 'bg-[var(--admin-success)]/10 text-[var(--admin-success)] border border-[var(--admin-success)]/20',
  warning: 'bg-[var(--admin-warning)]/10 text-[var(--admin-warning)] border border-[var(--admin-warning)]/20',
  danger: 'bg-[var(--admin-danger)]/10 text-[var(--admin-danger)] border border-[var(--admin-danger)]/20',
  info: 'bg-[var(--admin-info)]/10 text-[var(--admin-info)] border border-[var(--admin-info)]/20',
  primary: 'bg-[var(--admin-primary)]/10 text-[var(--admin-primary)] border border-[var(--admin-primary)]/20',
  neutral: 'bg-[var(--admin-surface-soft)] text-[var(--admin-text-muted)] border border-[var(--admin-border)]',
};

const sizeStyles: Record<NonNullable<AdminBadgeProps['size']>, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-1.5 text-base',
};

const roundedStyles: Record<NonNullable<AdminBadgeProps['rounded']>, string> = {
  full: 'rounded-full',
  lg: 'rounded-lg',
  md: 'rounded-md',
};

export function AdminBadge({
  children,
  variant = 'neutral',
  size = 'md',
  rounded = 'full',
  className,
}: AdminBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center font-medium',
        variantStyles[variant],
        sizeStyles[size],
        roundedStyles[rounded],
        className
      )}
    >
      {children}
    </span>
  );
}