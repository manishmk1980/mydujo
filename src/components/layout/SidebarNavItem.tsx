import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useSidebar } from '../../context/SidebarContext';
import { useIsMobile } from '../../hooks/useMediaQuery';

interface SidebarNavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  badgeCount?: number;
}

/** Nav item with icon + label; tooltip when collapsed (desktop only). Optional unread badge. */
export function SidebarNavItem({ to, icon: Icon, label, isActive, badgeCount }: SidebarNavItemProps) {
  const { isCollapsed } = useSidebar();
  const isMobile = useIsMobile();
  const showLabelOnly = !isCollapsed || isMobile; // mobile drawer always shows labels

  return (
    <Link
      to={to}
      className={cn(
        'flex items-center gap-3 rounded-xl transition-all duration-200 group relative active:scale-[0.98]',
        !showLabelOnly ? 'px-2 py-3 justify-center' : 'px-4 py-3',
        isActive
          ? 'bg-primary text-white shadow-md shadow-primary/20'
          : 'text-slate-600 hover:bg-slate-100 hover:text-primary'
      )}
    >
      <Icon className={cn('size-5 shrink-0 transition-transform', !isActive && 'group-hover:scale-105')} />
      {showLabelOnly && (
        <span className="font-medium text-sm whitespace-nowrap truncate flex-1">{label}</span>
      )}
      {badgeCount != null && badgeCount > 0 && (
        <span
          className={cn(
            'shrink-0 min-w-[1.25rem] h-5 px-1.5 rounded-full flex items-center justify-center text-[10px] font-bold',
            isActive ? 'bg-white/90 text-primary' : 'bg-red-500 text-white'
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
