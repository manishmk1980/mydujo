import React from 'react';
import {useNavigate, useLocation } from 'react-router-dom';
import { Bell, LogOut, Mail } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useAdminConfirm } from './ui/AdminConfirmProvider';
import { SidebarTrigger } from '../layout/CollapsibleSidebarShell';
import emblemUrl from '@/assets/logo/logo-emblem.svg';

function shortcutLabel(): string {
  if (typeof navigator === 'undefined') return '';
  return /Mac|iPhone|iPod|iPad/i.test(navigator.platform) ? '⌘ K' : '';
}

export function AdminTopbar() {
  const { pathname } = useLocation();

  const pageMeta = (() => {
    if (pathname.includes('/admin/students')) {
      return {
        title: 'Student registrations',
        subtitle: 'Manage and validate student registrations.',
      };
    }

    if (pathname.includes('/admin/training-centers')) {
      return {
        title: 'Training centers',
        subtitle: 'Manage centers, branches and local training operations.',
      };
    }

    if (pathname.includes('/admin/instructors')) {
      return {
        title: 'Instructors',
        subtitle: 'Manage instructor profiles and assignments.',
      };
    }

    if (pathname.includes('/admin/applications')) {
      return {
        title: 'Applications',
        subtitle: 'Review and manage submitted applications.',
      };
    }

    if (pathname.includes('/admin/disciplines')) {
      return {
        title: 'Disciplines',
        subtitle: 'Manage martial arts disciplines and program structure.',
      };
    }

    if (pathname.includes('/admin/fee-requests') || pathname.includes('/admin/fees')) {
      return {
        title: 'Fee requests',
        subtitle: 'Create, review and track student fee requests.',
      };
    }

    if (pathname.includes('/admin/payment-review')) {
      return {
        title: 'Payment review',
        subtitle: 'Review fee payments and transaction status.',
      };
    }

    if (pathname.includes('/admin/users')) {
      return {
        title: 'Users',
        subtitle: 'Manage admin users and access control.',
      };
    }

    if (pathname.includes('/admin/settings')) {
      return {
        title: 'Settings',
        subtitle: 'Manage platform configuration.',
      };
    }

    return {
      title: 'Dashboard',
      subtitle: 'Monitor MDPL operations and key activity.',
    };
  })();


  const navigate = useNavigate();
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

  return (
    <>
      {/* Mobile: emblem + menu + title + logout — no search/mail/bell/profile chip */}
      <div className="md:hidden sticky top-0 z-30 -mx-4 mb-4 border-b border-[var(--admin-border)] bg-[var(--admin-surface)]/95 px-3 py-2.5 backdrop-blur-sm sm:-mx-5 sm:px-4">
        <div className="grid min-w-0 grid-cols-[auto_1fr_auto] items-center gap-2">
          <div className="flex items-center gap-1.5">
            <img
              src={emblemUrl}
              alt=""
              width={36}
              height={36}
              className="h-9 w-9 shrink-0 object-contain"
              aria-hidden
            />
            <SidebarTrigger className="shrink-0 p-2" />
          </div>
          <span className="min-w-0 truncate text-center text-sm font-bold text-[var(--admin-text)] font-['Space_Grotesk',sans-serif]">
            Admin
          </span>
          <button
            type="button"
            onClick={() => void requestLogout()}
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl text-[var(--admin-text-muted)] transition-colors hover:bg-red-50 hover:text-[var(--admin-danger)]"
            title="Log out"
            aria-label="Log out"
          >
            <LogOut className="size-[1.1rem]" />
          </button>
        </div>
      </div>

      {/* Desktop / tablet */}
      <header
        className={cn(
          'hidden md:flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4',
          'rounded-[var(--admin-radius-card)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-4 py-3 shadow-[var(--admin-shadow-card)] sm:px-5 sm:py-3',
          'min-h-[4.5rem] min-w-0'
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-['Space_Grotesk',sans-serif] text-xl font-extrabold leading-tight text-[var(--admin-text)] sm:text-2xl">
              {pageMeta.title}
            </h1>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2 sm:gap-3">
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-[var(--admin-radius-control)] border border-[var(--admin-border)] bg-[var(--admin-surface)] text-[var(--admin-text-muted)] transition-colors hover:bg-[var(--admin-surface-soft)] hover:text-[var(--admin-text)]"
            aria-label="Messages"
          >
            <Mail className="size-[1.15rem]" />
          </button>
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-[var(--admin-radius-control)] border border-[var(--admin-border)] bg-[var(--admin-surface)] text-[var(--admin-text-muted)] transition-colors hover:bg-[var(--admin-surface-soft)] hover:text-[var(--admin-text)]"
            aria-label="Notifications"
          >
            <Bell className="size-[1.15rem]" />
          </button>
          <div
            className={cn(
              'flex max-w-xs min-w-0 items-center gap-3 rounded-[var(--admin-radius-control)] border border-[var(--admin-border)] bg-[var(--admin-surface-soft)] py-1.5 pl-2 pr-2'
            )}
          >
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--admin-ink-mid)] to-[var(--admin-ink-deep)] text-xs font-bold text-white">
              {(displayName[0] || 'A').toUpperCase()}
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="truncate text-sm font-semibold leading-tight text-[var(--admin-text)] font-['Space_Grotesk',sans-serif]">
                {displayName}
              </p>
              <p className="truncate text-xs leading-tight text-[var(--admin-text-muted)]">{email}</p>
            </div>
            <button
              type="button"
              onClick={() => void requestLogout()}
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-[var(--admin-text-muted)] transition-colors hover:bg-red-50 hover:text-[var(--admin-danger)]"
              title="Log out"
              aria-label="Log out"
            >
              <LogOut className="size-[1.1rem]" />
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
