import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { PanelLeft, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useSidebar } from '../../context/SidebarContext';
import { useIsMobile } from '../../hooks/useMediaQuery';

interface CollapsibleSidebarShellProps {
  children: React.ReactNode;
  logo: React.ReactNode;
  logoCollapsed: React.ReactNode;
  expandedWidth?: number;
  collapsedWidth?: number;
}

const SIDEBAR_WIDTH_MOBILE = 288;

/** Shared collapsible sidebar: desktop inline, mobile overlay drawer. */
export function CollapsibleSidebarShell({
  children,
  logo,
  logoCollapsed,
  expandedWidth = 280,
  collapsedWidth = 80,
}: CollapsibleSidebarShellProps) {
  const { isCollapsed, toggleSidebar, openMobile, setOpenMobile } = useSidebar();
  const isMobile = useIsMobile();
  const location = useLocation();

  // Close mobile drawer on route change
  useEffect(() => {
    setOpenMobile(false);
  }, [location.pathname, setOpenMobile]);

  const sidebarContent = (
    <>
      <div
        className={cn(
          'p-4 flex items-center justify-between border-b border-slate-200 shrink-0',
          isMobile ? 'flex-row' : isCollapsed && 'flex-col gap-4 px-3 py-4'
        )}
      >
        <div className={cn('flex items-center gap-3 overflow-hidden min-w-0', isMobile ? 'flex-1' : 'flex-1')}>
          {isMobile ? logo : isCollapsed ? logoCollapsed : logo}
        </div>
        <button
          type="button"
          onClick={() => (isMobile ? setOpenMobile(false) : toggleSidebar())}
          className={cn(
            'shrink-0 p-2 rounded-xl transition-colors duration-200',
            'text-slate-500 hover:text-primary hover:bg-slate-100',
            isCollapsed && !isMobile && 'bg-transparent'
          )}
          title={isMobile ? 'Close menu' : isCollapsed ? 'Expand sidebar (Ctrl+B)' : 'Collapse sidebar (Ctrl+B)'}
          aria-label={isMobile ? 'Close menu' : 'Toggle sidebar'}
        >
          {isMobile ? <X className="size-5" /> : <PanelLeft className={cn('size-5 transition-transform duration-300', !isCollapsed && 'rotate-180')} />}
        </button>
      </div>
      {children}
    </>
  );

  // Mobile: overlay drawer
  if (isMobile) {
    return (
      <>
        {/* Backdrop */}
        <div
          role="button"
          tabIndex={-1}
          onClick={() => setOpenMobile(false)}
          onKeyDown={(e) => e.key === 'Escape' && setOpenMobile(false)}
          className={cn(
            'fixed inset-0 z-40 bg-black/50 backdrop-blur-sm',
            'transition-opacity duration-300 ease-out',
            openMobile ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
          )}
          aria-hidden="true"
        />
        {/* Drawer */}
        <aside
          style={{ width: SIDEBAR_WIDTH_MOBILE }}
          className={cn(
            'fixed inset-y-0 left-0 z-50 flex flex-col h-screen',
            'bg-white border-r border-slate-200 shadow-2xl',
            'transition-transform duration-300 ease-out will-change-transform',
            openMobile ? 'translate-x-0' : '-translate-x-full'
          )}
          aria-hidden={!openMobile}
        >
          {sidebarContent}
        </aside>
      </>
    );
  }

  // Desktop: inline sidebar
  return (
    <aside
      style={{ width: isCollapsed ? collapsedWidth : expandedWidth }}
      className={cn(
        'hidden md:flex shrink-0 overflow-hidden flex-col h-screen sticky top-0 z-30',
        'bg-white border-r border-slate-200 shadow-sm',
        'transition-[width] duration-300 ease-out'
      )}
    >
      {sidebarContent}
    </aside>
  );
}

/** Toggle button for mobile menu / desktop collapse. */
export function SidebarTrigger({ className }: { className?: string }) {
  const { toggleMobile, toggleSidebar } = useSidebar();
  const isMobile = useIsMobile();

  return (
    <button
      type="button"
      onClick={() => (isMobile ? toggleMobile() : toggleSidebar())}
      className={cn(
        'p-2.5 rounded-xl transition-all duration-200',
        'text-slate-600 hover:text-primary hover:bg-slate-100 active:scale-95',
        className
      )}
      aria-label="Toggle sidebar"
    >
      <PanelLeft className="size-5" />
    </button>
  );
}
