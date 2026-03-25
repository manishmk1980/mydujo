import React from 'react';
import { cn } from '../../lib/utils';

/** Page-level wrapper: consistent padding, spacing, max-width. */
interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div className={cn('w-full max-w-7xl mx-auto space-y-8', className)}>
      {children}
    </div>
  );
}
