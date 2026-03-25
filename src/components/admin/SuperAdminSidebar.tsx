import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  MapPin,
  UserCog,
  Settings,
  User,
  LogOut,
  BookOpen,
  ReceiptText,
  CreditCard,
} from 'lucide-react';
import { CollapsibleSidebarShell } from '../layout/CollapsibleSidebarShell';
import { SidebarNavItem } from '../layout/SidebarNavItem';
import mdplLogo from '@/assets/logo/mdpl-hr-logo.svg';
import emblem from '@/assets/logo/logo-emblem.svg';
import { cn } from '../../lib/utils';
import { useAdminAuth } from '../../context/AdminAuthContext';

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, match: (p: string) => p === '/admin' || p === '/admin/' },
  { to: '/admin/students', label: 'Students', icon: Users, match: (p: string) => p.startsWith('/admin/students') },
  { to: '/admin/training-centers', label: 'Training Centers', icon: MapPin, match: (p: string) => p.startsWith('/admin/training-centers') },
  { to: '/admin/instructors', label: 'Instructors', icon: UserCog, match: (p: string) => p.startsWith('/admin/instructors') },
  { to: '/admin/disciplines', label: 'Disciplines', icon: BookOpen, match: (p: string) => p.startsWith('/admin/disciplines') },
  { to: '/admin/fees', label: 'Fee Requests', icon: ReceiptText, match: (p: string) => p.startsWith('/admin/fees') },
  { to: '/admin/payments', label: 'Payment Review', icon: CreditCard, match: (p: string) => p.startsWith('/admin/payments') },
  { to: '/admin/users', label: 'Users', icon: Users, match: (p: string) => p.startsWith('/admin/users') },
  { to: '/admin/settings', label: 'Settings', icon: Settings, match: (p: string) => p.startsWith('/admin/settings') },
  { to: '/admin/profile', label: 'Profile', icon: User, match: (p: string) => p.startsWith('/admin/profile') },
];

export function SuperAdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, adminUser } = useAdminAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <CollapsibleSidebarShell
      logo={
        <Link to="/admin" className="flex items-center gap-3 min-w-0">
          <img src={mdplLogo} alt="MDPL" className="h-10 w-auto" />
        </Link>
      }
      logoCollapsed={
        <Link to="/admin" className="flex items-center justify-center w-full">
          <img src={emblem} alt="MDPL" className="h-9 w-9" />
        </Link>
      }
    >
      <div className="flex-1 p-3 space-y-2 overflow-y-auto">
        {NAV.map((item) => (
          <SidebarNavItem
            key={item.to}
            to={item.to}
            icon={item.icon}
            label={item.label}
            isActive={item.match(location.pathname)}
          />
        ))}
      </div>

      <div className="p-3 border-t border-slate-200">
        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="mb-3">
            <p className="text-sm font-bold text-slate-900 truncate">{adminUser?.email || 'Admin'}</p>
            <p className="text-xs font-medium text-slate-500 truncate">Admin Panel</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className={cn(
              'w-full flex items-center justify-center gap-2 py-2',
              'text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors'
            )}
          >
            <LogOut className="size-4" />
            Logout
          </button>
        </div>
      </div>
    </CollapsibleSidebarShell>
  );
}

