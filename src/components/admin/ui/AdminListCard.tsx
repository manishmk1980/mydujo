import React, { type ReactNode } from 'react';
import { cn } from '../../../lib/utils';

export interface AdminListCardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  padding?: 'none' | 'sm' | 'md';
  dividers?: boolean;
}

export function AdminListCard({
  children,
  className,
  title,
  subtitle,
  action,
  padding = 'md',
  dividers = true,
}: AdminListCardProps) {
  const paddingClass = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
  }[padding];

  return (
    <div
      className={cn(
        'rounded-[var(--admin-radius-card)] border border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-[var(--admin-shadow-card)]',
        paddingClass,
        className
      )}
    >
      {(title || subtitle || action) && (
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            {title && (
              <h3 className="text-lg font-bold text-[var(--admin-text)] font-['Space_Grotesk',sans-serif]">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="mt-1 text-sm text-[var(--admin-text-muted)]">{subtitle}</p>
            )}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      )}
      <div className={dividers ? 'divide-y divide-[var(--admin-border)]' : ''}>
        {React.Children.map(children, (child, index) => (
          <div
            key={index}
            className={dividers && index > 0 ? 'pt-4 first:pt-0' : ''}
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}