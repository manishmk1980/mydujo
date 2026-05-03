import React, { type ReactNode } from 'react';
import { cn } from '../../../lib/utils';

export interface AdminCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'soft' | 'featured' | 'danger' | 'warning';
  padding?: 'sm' | 'md' | 'lg';
}

const variantStyles: Record<NonNullable<AdminCardProps['variant']>, string> = {
  default: 'bg-[var(--admin-surface)] border-[var(--admin-border)]',
  soft: 'bg-[var(--admin-surface-soft)] border-[var(--admin-border)]',
  featured: 'bg-[var(--admin-primary-soft)] border-[var(--admin-primary-border)]',
  danger: 'bg-[rgba(239,68,68,0.08)] border-[rgba(239,68,68,0.3)]',
  warning: 'bg-[rgba(245,158,11,0.08)] border-[rgba(245,158,11,0.3)]',
};

const paddingStyles: Record<NonNullable<AdminCardProps['padding']>, string> = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function AdminCard({
  children,
  className,
  variant = 'default',
  padding = 'md',
}: AdminCardProps) {
  return (
    <div
      className={cn(
        'rounded-[var(--admin-radius-card)] border shadow-[var(--admin-shadow-card)]',
        variantStyles[variant],
        paddingStyles[padding],
        className
      )}
    >
      {children}
    </div>
  );
}