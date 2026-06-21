import React from 'react';
import { cn } from '../../lib/utils';

/** Page-level wrapper: consistent padding, spacing, max-width. */
interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div className={cn('mx-auto w-full min-w-0 max-w-7xl space-y-8 overflow-x-hidden', className)}>
      {children}
    </div>
  );
}
