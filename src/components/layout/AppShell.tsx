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
  /** Shown in the top bar (e.g. notifications bell); on mobile, appended to the compact header */
  headerActions?: React.ReactNode;
  /** When true, skip the default mobile header (e.g. admin uses AdminTopbar mobile row instead). */
  suppressMobileHeader?: boolean;
}

export function AppShell({
  sidebar,
  children,
  className,
  title,
  headerActions,
  suppressMobileHeader,
}: AppShellProps) {
  const isMobile = useIsMobile();

  return (
    <div className={cn('flex min-h-screen flex-col md:flex-row', className)}>
      {sidebar}

      <div className="flex flex-1 flex-col min-w-0">
        {/* Mobile header: hamburger + title + actions */}
        {isMobile && !suppressMobileHeader && (
          <header className="md:hidden sticky top-0 z-30 flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-200 shadow-sm">
            <SidebarTrigger className="-ml-1 shrink-0" />
            {title ? (
              <h1 className="text-base font-bold text-slate-900 truncate flex-1 min-w-0">{title}</h1>
            ) : (
              <div className="flex-1" />
            )}
            {headerActions ? <div className="shrink-0 flex items-center">{headerActions}</div> : null}
          </header>
        )}

        {/* Desktop: top bar with actions (e.g. notifications) */}
        {!isMobile && headerActions ? (
          <header className="hidden md:flex sticky top-0 z-30 items-center justify-end gap-2 px-6 py-3 bg-white border-b border-slate-200">
            {headerActions}
          </header>
        ) : null}

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
    </div>
  );
}
