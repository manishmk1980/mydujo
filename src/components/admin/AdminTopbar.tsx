import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, LogOut, Mail } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useAdminConfirm } from './ui/AdminConfirmProvider';
import { SidebarTrigger } from '../layout/CollapsibleSidebarShell';
import emblemUrl from '@/assets/logo/logo-emblem.svg';

function getAdminPageTitle(pathname: string): string {
  if (pathname === '/admin' || pathname === '/admin/' || pathname.startsWith('/admin/dashboard')) return 'Dashboard';
  if (pathname.startsWith('/admin/students')) return 'Student registrations';
  if (pathname.startsWith('/admin/training-centers')) return 'Training Centers';
  if (pathname.startsWith('/admin/instructor-applications') || pathname.startsWith('/admin/applications')) return 'Applications';
  if (pathname.startsWith('/admin/instructors')) return 'Instructors';
  if (pathname.startsWith('/admin/disciplines')) return 'Disciplines';
  if (pathname.startsWith('/admin/fee-requests') || pathname.startsWith('/admin/fees')) return 'Fee Requests';
  if (pathname.startsWith('/admin/payment-review') || pathname.startsWith('/admin/payments')) return 'Payment Review';
  if (pathname.startsWith('/admin/chat')) return 'Chat & Enquiries';
  if (pathname.startsWith('/admin/users')) return 'Users';
  if (pathname.startsWith('/admin/settings')) return 'Settings';
  if (pathname.startsWith('/admin/profile')) return 'Profile';
  return 'Dashboard';
}

export function AdminTopbar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { adminUser, logout } = useAdminAuth();
  const confirm = useAdminConfirm();

  const requestLogout = async () => {
    const ok = await confirm({
      title: 'Confirm logout',
      description: 'You will be signed out of the MDPL admin panel.',
      confirmLabel: 'Logout',
      cancelLabel: 'Stay signed in',
      variant: 'warning',
    });
    if (!ok) return;
    await logout();
    navigate('/admin/login');
  };

  const displayName = adminUser?.full_name?.trim() || 'MDPL Admin';
  const email = adminUser?.email?.trim() || 'admin@mydojo.co.in';
  const pageTitle = getAdminPageTitle(pathname);

  return (
    <>
      <div className="md:hidden sticky top-0 z-30 -mx-4 mb-4 border-b border-[var(--admin-border)] bg-[var(--admin-surface)]/95 px-3 py-2.5 backdrop-blur-sm sm:-mx-5 sm:px-4">
        <div className="grid min-w-0 grid-cols-[auto_1fr_auto] items-center gap-2">
          <div className="flex items-center gap-1.5">
            <img src={emblemUrl} alt="" width={36} height={36} className="h-9 w-9 shrink-0 object-contain" aria-hidden />
            <SidebarTrigger className="shrink-0 p-2" />
          </div>
          <span className="min-w-0 truncate text-center text-sm font-bold text-[var(--admin-text)] font-['Space_Grotesk',sans-serif]">
            {pageTitle}
          </span>
          <button type="button" onClick={() => void requestLogout()} className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl text-[var(--admin-text-muted)] transition-colors hover:bg-red-50 hover:text-[var(--admin-danger)]" title="Log out" aria-label="Log out">
            <LogOut className="size-[1.1rem]" />
          </button>
        </div>
      </div>

      <header className={cn('hidden md:flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4', 'rounded-[var(--admin-radius-card)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-4 py-3 shadow-[var(--admin-shadow-card)] sm:px-5 sm:py-3', 'min-h-[4.5rem] min-w-0')}>
        <h1 className="min-w-0 flex-1 truncate text-xl font-black tracking-tight text-[var(--admin-text)] font-['Space_Grotesk',sans-serif]">
          {pageTitle}
        </h1>
        <div className="flex shrink-0 items-center justify-end gap-2 sm:gap-3">
          <button type="button" className="inline-flex size-10 items-center justify-center rounded-[var(--admin-radius-control)] border border-[var(--admin-border)] bg-[var(--admin-surface)] text-[var(--admin-text-muted)] transition-colors hover:bg-[var(--admin-surface-soft)] hover:text-[var(--admin-text)]" aria-label="Messages">
            <Mail className="size-[1.15rem]" />
          </button>
          <button type="button" className="inline-flex size-10 items-center justify-center rounded-[var(--admin-radius-control)] border border-[var(--admin-border)] bg-[var(--admin-surface)] text-[var(--admin-text-muted)] transition-colors hover:bg-[var(--admin-surface-soft)] hover:text-[var(--admin-text)]" aria-label="Notifications">
            <Bell className="size-[1.15rem]" />
          </button>
          <div className={cn('flex max-w-xs min-w-0 items-center gap-3 rounded-[var(--admin-radius-control)] border border-[var(--admin-border)] bg-[var(--admin-surface-soft)] py-1.5 pl-2 pr-2')}>
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--admin-ink-mid)] to-[var(--admin-ink-deep)] text-xs font-bold text-white">
              {(displayName[0] || 'A').toUpperCase()}
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="truncate text-sm font-semibold leading-tight text-[var(--admin-text)] font-['Space_Grotesk',sans-serif]">{displayName}</p>
              <p className="truncate text-xs leading-tight text-[var(--admin-text-muted)]">{email}</p>
            </div>
            <button type="button" onClick={() => void requestLogout()} className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-[var(--admin-text-muted)] transition-colors hover:bg-red-50 hover:text-[var(--admin-danger)]" title="Log out" aria-label="Log out">
              <LogOut className="size-[1.1rem]" />
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
