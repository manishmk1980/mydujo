import React, { ReactNode } from 'react';
import { cn } from '../../../lib/utils';

interface AdminSectionProps {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function AdminSection({ title, subtitle, action, children, className }: AdminSectionProps) {
  return (
    <section className={cn('admin-section', className)}>
      {(title || subtitle || action) && (
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="min-w-0">
            {title && (
              <h2 className="text-sm font-black text-[var(--admin-text)] uppercase tracking-widest">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-xs text-[var(--admin-text-muted)] mt-0.5">{subtitle}</p>
            )}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </section>
  );
}