import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  MapPin,
  UserCog,
  ClipboardList,
  Settings,
  User,
  BookOpen,
  ReceiptText,
  CreditCard,
  LogOut,
  MessageSquare,
} from 'lucide-react';
import { CollapsibleSidebarShell } from '../layout/CollapsibleSidebarShell';
import { AdminSidebarNavItem } from './layout/AdminSidebarNavItem';
import mdplLogo from '@/assets/logo/mdpl-hr-logo.svg';
import emblem from '@/assets/logo/logo-emblem.svg';
import { AdminImportMenu } from './dashboard/AdminImportMenu';
import { useSidebar } from '../../context/SidebarContext';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { cn } from '../../lib/utils';
import { useAdminConfirm } from './ui/AdminConfirmProvider';
import { useAdminAuth } from '../../context/AdminAuthContext';

type NavItem = {
  to: string;
  label: string;
  icon: React.ElementType;
  match: (p: string) => boolean;
};

const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: 'MAIN',
    items: [
      { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, match: (p) => p === '/admin' || p === '/admin/' },
      { to: '/admin/students', label: 'Students', icon: Users, match: (p) => p.startsWith('/admin/students') },
      { to: '/admin/training-centers', label: 'Training Centers', icon: MapPin, match: (p) => p.startsWith('/admin/training-centers') },
      { to: '/admin/instructors', label: 'Instructors', icon: UserCog, match: (p) => p.startsWith('/admin/instructors') && !p.startsWith('/admin/instructor-applications') },
      { to: '/admin/instructor-applications', label: 'Applications', icon: ClipboardList, match: (p) => p.startsWith('/admin/instructor-applications') },
      { to: '/admin/disciplines', label: 'Disciplines', icon: BookOpen, match: (p) => p.startsWith('/admin/disciplines') },
    ],
  },
  {
    label: 'OPERATIONS',
    items: [
      { to: '/admin/chat', label: 'Chat & Enquiries', icon: MessageSquare, match: (p) => p.startsWith('/admin/chat') },
      {
        to: '/admin/fees',
        label: 'Fee Requests',
        icon: ReceiptText,
        match: (p) => p.startsWith('/admin/fees') || p.startsWith('/admin/fee-requests'),
      },
      {
        to: '/admin/payments',
        label: 'Payment Review',
        icon: CreditCard,
        match: (p) => p.startsWith('/admin/payments') || p.startsWith('/admin/payment-review'),
      },
    ],
  },
  {
    label: 'SYSTEM',
    items: [
      { to: '/admin/users', label: 'Users', icon: Users, match: (p) => p.startsWith('/admin/users') },
      { to: '/admin/settings', label: 'Settings', icon: Settings, match: (p) => p.startsWith('/admin/settings') },
      { to: '/admin/profile', label: 'Profile', icon: User, match: (p) => p.startsWith('/admin/profile') },
    ],
  },
];

export function SuperAdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAdminAuth();
  const confirm = useAdminConfirm();
  const { isCollapsed, setOpenMobile } = useSidebar();
  const isMobile = useIsMobile();
  const compactSidebar = isCollapsed && !isMobile;

  const requestLogout = async () => {
    const ok = await confirm({
      title: 'Confirm logout',
      description: 'You will be signed out of the MDPL admin panel.',
      confirmLabel: 'Logout',
      cancelLabel: 'Stay signed in',
      variant: 'warning',
    });
    if (!ok) return;
    setOpenMobile(false);
    await logout();
    navigate('/admin/login');
  };

  return (
    <CollapsibleSidebarShell
      className="border-r border-[var(--admin-border)] bg-[var(--admin-sidebar-bg)] text-[var(--admin-sidebar-muted)]"
      headerClassName="border-b border-[var(--admin-border)] bg-[var(--admin-sidebar-bg)] py-4 px-4"
      toggleButtonClassName="text-[var(--admin-sidebar-muted)] hover:bg-[color-mix(in_srgb,var(--admin-text)_6%,transparent)] hover:text-[var(--admin-text)]"
      logo={
        <Link to="/admin" className="flex items-center gap-3 min-w-0">
          <img src={mdplLogo} alt="MDPL" className="h-10 w-auto max-w-[200px] object-contain object-left" />
        </Link>
      }
      logoCollapsed={
        <Link to="/admin" className="flex items-center justify-center w-full">
          <img src={emblem} alt="MDPL" className="h-9 w-9" />
        </Link>
      }
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className={cn('flex-1 space-y-6 overflow-y-auto overflow-x-hidden py-4', compactSidebar ? 'px-2' : 'px-4')}>
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p
                className={cn(
                  "mb-3 px-1 text-[10px] font-bold uppercase text-[var(--admin-sidebar-muted)] font-['Space_Grotesk',sans-serif]",
                  compactSidebar ? 'sr-only' : 'tracking-widest'
                )}
              >
                {group.label}
              </p>
              <div className="space-y-2">
                {group.items.map((item) => (
                  <AdminSidebarNavItem
                    key={item.to}
                    to={item.to}
                    icon={item.icon}
                    label={item.label}
                    isActive={item.match(location.pathname)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className={cn('shrink-0 pb-4', compactSidebar ? 'px-2' : 'px-4')}>
          <div
            className={cn(
              'rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-[var(--admin-shadow-card)]',
              compactSidebar ? 'flex flex-col items-center p-2' : 'p-4'
            )}
          >
            {!compactSidebar ? (
              <>
                <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-[var(--admin-primary)] font-['Space_Grotesk',sans-serif]">
                  Import Data Hub
                </p>
                <p className="mb-3 text-xs leading-relaxed text-[var(--admin-text-muted)]">
                  Quickly upload student records and fee lists to keep operations updated.
                </p>
              </>
            ) : null}
            <AdminImportMenu
              variant="inline"
              collapsed={compactSidebar}
              inlineButtonClassName="w-full justify-center gap-2 border border-[var(--admin-border)] bg-[var(--admin-surface-soft)] text-[var(--admin-text)] hover:bg-[var(--admin-surface)]"
            />
          </div>
        </div>
      </div>

      {isMobile ? (
        <div className="shrink-0 border-t border-[var(--admin-border)] p-4">
          <button
            type="button"
            onClick={() => void requestLogout()}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface-soft)] py-3 text-sm font-bold text-[var(--admin-danger)] transition-colors hover:bg-[color-mix(in_srgb,var(--admin-danger)_10%,var(--admin-surface))]"
          >
            <LogOut className="size-4" />
            Logout
          </button>
        </div>
      ) : null}
    </CollapsibleSidebarShell>
  );
}

