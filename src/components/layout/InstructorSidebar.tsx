import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, ClipboardList, Medal, User, LogOut, MessageSquareText, CalendarDays } from 'lucide-react';
import { CollapsibleSidebarShell } from './CollapsibleSidebarShell';
import { SidebarNavItem } from './SidebarNavItem';
import mdplLogo from '@/assets/logo/mdpl-hr-logo.svg';
import emblem from '@/assets/logo/logo-emblem.svg';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

const NAV = [
  { to: '/instructor', label: 'Dashboard', icon: LayoutDashboard, match: (p: string) => p === '/instructor' || p === '/instructor/' },
  { to: '/instructor/students', label: 'Students', icon: Users, match: (p: string) => p.startsWith('/instructor/students') },
  { to: '/instructor/classes', label: 'Classes', icon: CalendarDays, match: (p: string) => p.startsWith('/instructor/classes') },
  { to: '/instructor/attendance', label: 'Attendance', icon: ClipboardList, match: (p: string) => p.startsWith('/instructor/attendance') },
  { to: '/instructor/grading', label: 'Grading', icon: Medal, match: (p: string) => p.startsWith('/instructor/grading') },
  { to: '/instructor/messages', label: 'Messages', icon: MessageSquareText, match: (p: string) => p.startsWith('/instructor/messages') },
  { to: '/instructor/profile', label: 'Profile', icon: User, match: (p: string) => p.startsWith('/instructor/profile') },
];

export function InstructorSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, instructor, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/instructor/login');
  };

  const displayName = instructor?.full_name || user?.name || user?.email || 'Instructor';

  return (
    <CollapsibleSidebarShell
      logo={
        <Link to="/instructor" className="flex items-center gap-3 min-w-0">
          <img src={mdplLogo} alt="MDPL" className="h-10 w-auto" />
        </Link>
      }
      logoCollapsed={
        <Link to="/instructor" className="flex items-center justify-center w-full">
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
            <p className="text-sm font-bold text-slate-900 truncate">{displayName}</p>
            <p className="text-xs font-medium text-slate-500 truncate">Instructor Panel</p>
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

