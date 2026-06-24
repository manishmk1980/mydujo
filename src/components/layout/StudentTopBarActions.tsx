import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import { notificationsService } from '../../services/notificationsService';
import { AspectRatio } from '../ui/aspect-ratio';

const PLACEHOLDER_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDrTIYcy2Fr3S9WaKAHzodELcQxKHxBvIW2Blnc6TEl_XvITPkt1AW3gXN5jElC4_Tg0Rnd7SCY0taIwVq9DOk4ojrNCAeYiUhEakrvogI44EHrNQ6Laeqmur538z7hLFXlBDpO095WuuJbPE9d4c5o6NSPlVN9vcjFzDTWKGljv_j3nvkCIJFgxLUDe8JCQ5mC49A4vJMWRS7rGCzzVbiYkyzr4HRR_K3VYE9_IX9zB4OQ3h8ZhZDG1ZKd79uGfFZO7wIvVzhTuSI';

/** Top bar: profile (links to /profile) + notifications bell with unread badge */
export function StudentTopBarActions() {
  const { user, student } = useAuth();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = React.useState(0);

  const displayName = student?.full_name || user?.name || 'Student';
  const email = student?.email || user?.email || '';

  const refresh = React.useCallback(async () => {
    try {
      const count = await notificationsService.getUnreadCount();
      setUnreadCount(count);
    } catch {
      setUnreadCount(0);
    }
  }, []);

  React.useEffect(() => {
    refresh();
  }, [location.pathname, refresh]);

  React.useEffect(() => {
    const handler = () => refresh();
    window.addEventListener('notifications-updated', handler);
    return () => window.removeEventListener('notifications-updated', handler);
  }, [refresh]);

  return (
    <div className="flex items-center gap-3 sm:gap-4">
      <Link
        to="/profile"
        aria-label={`Profile: ${displayName}`}
        className="flex min-w-0 items-center gap-2 sm:gap-3 rounded-xl border border-transparent py-1 pr-1 transition-colors hover:border-slate-200 hover:bg-slate-50"
      >
        <div className="hidden min-w-0 text-right sm:block">
          <p className="truncate text-sm font-bold text-slate-900">{displayName}</p>
          {email ? <p className="truncate text-xs text-slate-500">{email}</p> : null}
        </div>
        <div className="size-9 shrink-0 overflow-hidden rounded-full border-2 border-primary sm:size-10">
          <AspectRatio ratio={1 / 1}>
            <img src={PLACEHOLDER_AVATAR} alt="" className="size-full object-cover" aria-hidden />
          </AspectRatio>
        </div>
      </Link>

      <Link
        to="/notifications"
        className={cn(
          'relative flex size-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white',
          'text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:text-primary',
          location.pathname === '/notifications' && 'border-primary/40 bg-primary/5 text-primary'
        )}
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
      >
        <Bell className="size-5" />
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex min-w-[1.125rem] h-[1.125rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        ) : null}
      </Link>
    </div>
  );
}
