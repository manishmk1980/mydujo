import React from 'react';
import { cn } from '../../lib/utils';
import { SidebarTrigger } from './CollapsibleSidebarShell';
import { useIsMobile } from '../../hooks/useMediaQuery';

interface AppShellProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  /** Optional title for mobile header */
  title?: string;
}

export function AppShell({ sidebar, children, className, title }: AppShellProps) {
  const isMobile = useIsMobile();

  return (
    <div className={cn('min-h-screen bg-slate-50 flex flex-col md:flex-row', className)}>
      {sidebar}

      {/* Mobile header: hamburger + title */}
      {isMobile && (
        <header className="md:hidden sticky top-0 z-30 flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-200 shadow-sm">
          <SidebarTrigger className="-ml-1" />
          {title && (
            <h1 className="text-base font-bold text-slate-900 truncate flex-1">{title}</h1>
          )}
        </header>
      )}

      <main
        className={cn(
          'flex-1 min-w-0 overflow-x-hidden overflow-y-auto',
          'transition-all duration-300 ease-out'
        )}
      >
        <div
          className={cn(
            'px-4 py-4 sm:px-5 sm:py-5 md:px-6 md:py-6 lg:px-8 lg:py-6',
            'max-w-[1600px] mx-auto'
          )}
        >
          {children}
        </div>
      </main>
    </div>
  );
}
