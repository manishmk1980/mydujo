import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../../lib/utils';
import { useSidebar } from '../../../context/SidebarContext';
import { useIsMobile } from '../../../hooks/useMediaQuery';

interface AdminSidebarNavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  badgeCount?: number;
}

/** Admin-specific nav item with orange gradient active state. */
export function AdminSidebarNavItem({ to, icon: Icon, label, isActive, badgeCount }: AdminSidebarNavItemProps) {
  const { isCollapsed, setOpenMobile } = useSidebar();
  const isMobile = useIsMobile();
  const showLabelOnly = !isCollapsed || isMobile; // mobile drawer always shows labels

  return (
    <Link
      to={to}
      onClick={() => isMobile && setOpenMobile(false)}
      className={cn(
        'flex items-center gap-3.5 rounded-2xl transition-all duration-200 group relative active:scale-[0.98]',
        !showLabelOnly ? 'px-2 py-3.5 justify-center' : 'px-5 py-3.5',
        isActive
          ? 'bg-[var(--admin-primary)] text-white shadow-md shadow-[color-mix(in_srgb,var(--admin-text)_12%,transparent)]'
          : 'text-[var(--admin-sidebar-muted)] hover:bg-[color-mix(in_srgb,var(--admin-text)_5%,transparent)] hover:text-[var(--admin-text)]'
      )}
    >
      <Icon className={cn('size-5 shrink-0 transition-transform', !isActive && 'group-hover:scale-105')} />
      {showLabelOnly && (
        <span className="font-medium text-[13px] tracking-tight whitespace-nowrap truncate flex-1 font-['Space_Grotesk',sans-serif]">
          {label}
        </span>
      )}
      {badgeCount != null && badgeCount > 0 && (
        <span
          className={cn(
            'shrink-0 min-w-[1.25rem] h-5 px-1.5 rounded-full flex items-center justify-center text-[10px] font-bold',
            isActive ? 'bg-white/90 text-[var(--admin-primary)]' : 'bg-[var(--admin-primary-soft)] text-[var(--admin-primary)] ring-1 ring-[var(--admin-primary-border)]'
          )}
        >
          {badgeCount > 99 ? '99+' : badgeCount}
        </span>
      )}
      {!showLabelOnly && (
        <span
          className={cn(
            'absolute left-full ml-3 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap z-50',
            'opacity-0 invisible group-hover:opacity-100 group-hover:visible',
            'bg-slate-900 text-white shadow-lg border border-slate-200',
            'transition-opacity duration-200 pointer-events-none'
          )}
        >
          {label}
        </span>
      )}
    </Link>
  );
}