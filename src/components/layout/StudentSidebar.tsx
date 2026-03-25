import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Medal,
  User,
  LogOut,
  Calendar,
  Target,
  Bell,
  ReceiptText,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useSidebar } from '../../context/SidebarContext';
import { CollapsibleSidebarShell } from './CollapsibleSidebarShell';
import { SidebarNavItem } from './SidebarNavItem';
import { AspectRatio } from '../ui/aspect-ratio';
import { notificationsService } from '../../services/notificationsService';
import mdplLogo from '@/assets/logo/mdpl-hr-logo.svg';
import logoEmblem from '@/assets/logo/logo-emblem.svg';

export function StudentSidebar() {
  const { user, student, logout } = useAuth();
  const { t } = useLanguage();
  const { isCollapsed } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = React.useState(0);

  const refreshUnreadCount = React.useCallback(async () => {
    try {
      const count = await notificationsService.getUnreadCount();
      setUnreadCount(count);
    } catch {
      setUnreadCount(0);
    }
  }, []);

  React.useEffect(() => {
    refreshUnreadCount();
  }, [location.pathname, refreshUnreadCount]);

  React.useEffect(() => {
    const handler = () => refreshUnreadCount();
    window.addEventListener('notifications-updated', handler);
    return () => window.removeEventListener('notifications-updated', handler);
  }, [refreshUnreadCount]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { icon: LayoutDashboard, label: t('dashboard'), path: '/dashboard' },
    { icon: Medal, label: t('beltGrading'), path: '/grading' },
    { icon: Target, label: 'Specialized Tracks', path: '/my-programs' },
    { icon: ReceiptText, label: 'Fee Information', path: '/fees' },
    { icon: Bell, label: 'Notifications', path: '/notifications', badgeCount: unreadCount },
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
              <div className="size-10 rounded-full bg-slate-200 overflow-hidden shrink-0">
                <AspectRatio ratio={1 / 1}>
                  <img
                    src="https://ui-avatars.com/api/?name=Student&background=94a3b8&color=fff"
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </AspectRatio>
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
