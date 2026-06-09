import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Medal,
  User,
  LogOut,
  Calendar,
  Target,
  ReceiptText,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useSidebar } from '../../context/SidebarContext';
import { CollapsibleSidebarShell } from './CollapsibleSidebarShell';
import { SidebarNavItem } from './SidebarNavItem';
import { feesService, countActionableStudentFeeRequests } from '../../services/feesService';
import mdplLogo from '@/assets/logo/mdpl-hr-logo.svg';
import logoEmblem from '@/assets/logo/logo-emblem.svg';

function getInitials(name?: string | null) {
  if (!name) return 'S';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'S';
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return ((parts[0]?.[0] ?? '') + (parts[parts.length - 1]?.[0] ?? '')).toUpperCase();
}

export function StudentSidebar() {
  const { user, student, logout } = useAuth();
  const { t } = useLanguage();
  const { isCollapsed } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();
  const [feeActionCount, setFeeActionCount] = React.useState(0);

  const refreshFeeActionCount = React.useCallback(async () => {
    try {
      const [requests, payments] = await Promise.all([
        feesService.getMyFeeRequests(),
        feesService.getMySubmissions(),
      ]);
      setFeeActionCount(countActionableStudentFeeRequests(requests, payments));
    } catch {
      setFeeActionCount(0);
    }
  }, []);

  React.useEffect(() => {
    refreshFeeActionCount();
  }, [location.pathname, refreshFeeActionCount]);

  React.useEffect(() => {
    const handler = () => refreshFeeActionCount();
    window.addEventListener('fee-requests-updated', handler);
    return () => window.removeEventListener('fee-requests-updated', handler);
  }, [refreshFeeActionCount]);

  const handleLogout = async () => {
    await logout();
    navigate('/student/login');
  };

  const navItems = [
    { icon: LayoutDashboard, label: t('dashboard'), path: '/dashboard' },
    { icon: Medal, label: t('beltGrading'), path: '/grading' },
    { icon: Target, label: 'Specialized Tracks', path: '/my-programs' },
    { icon: ReceiptText, label: 'Fee Information', path: '/fees', badgeCount: feeActionCount },
    { icon: Calendar, label: 'My Attendance', path: '/attendance' },
    { icon: User, label: t('profile'), path: '/profile' },
  ];

  return (
    <CollapsibleSidebarShell
      logo={
        <Link to="/dashboard" className="flex items-center gap-3 overflow-hidden">
          <img src={mdplLogo} alt="MyDojo" className="h-12 w-auto" />
        </Link>
      }
      logoCollapsed={
        <Link to="/dashboard" className="flex items-center justify-center">
          <img src={logoEmblem} alt="MyDojo" className="h-10 w-10" />
        </Link>
      }
    >
      <nav className={cn('flex-1 p-4 space-y-1 overflow-y-auto', isCollapsed && 'px-2')}>
        {navItems.map((item, idx) => (
          <SidebarNavItem
            key={idx}
            to={item.path}
            icon={item.icon}
            label={item.label}
            isActive={item.path === '/fees' ? location.pathname.startsWith('/fees') : location.pathname === item.path}
            badgeCount={'badgeCount' in item ? item.badgeCount : undefined}
          />
        ))}
      </nav>

      <div className={cn('p-4 border-t border-slate-200 shrink-0', isCollapsed ? 'px-2' : '')}>
        {!isCollapsed ? (
          <div className="bg-slate-50 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-xs font-bold text-white"
                aria-hidden
              >
                {getInitials(student?.full_name || user?.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">
                  {student?.full_name || user?.name || 'Student'}
                </p>
                <p className="text-xs text-slate-500 truncate">{student?.email || user?.email || ''}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="size-4" />
              {t('logout')}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center justify-center w-full p-2 rounded-xl text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
            title={t('logout')}
          >
            <LogOut className="size-5" />
          </button>
        )}
      </div>
    </CollapsibleSidebarShell>
  );
}
