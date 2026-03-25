import React from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Medal,
  History,
  CreditCard,
  User,
  LogOut,
  Calendar,
  Target,
  ClipboardList
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { AspectRatio } from './ui/aspect-ratio';
import mdplLogo from '@/assets/logo/mdpl-hr-logo.svg';

export function Sidebar() {
  const { user, student, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isInstructor = user?.role === 'instructor' || user?.role === 'admin' || user?.role === 'super_admin';

  const navItems = [
    { icon: LayoutDashboard, label: t('dashboard'), path: '/dashboard' },
    { icon: Medal, label: t('beltGrading'), path: '/grading' },
    { icon: Target, label: 'Specialized Tracks', path: '/my-programs' },
    { icon: History, label: t('paymentHistory'), path: '/payments' },
    { icon: CreditCard, label: t('payFee'), path: '/checkout' },
    { icon: Calendar, label: 'My Attendance', path: '/attendance' },
    ...(isInstructor ? [{ icon: ClipboardList, label: 'Mark Class Attendance', path: '/instructor/attendance' }] : []),
    { icon: User, label: t('profile'), path: '/profile' },
  ];

  return (
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col shrink-0 h-screen sticky top-0">
      <div className="p-6">
        <Link to="/" className="flex items-center">
          <img src={mdplLogo} alt="MyDojo" className="h-16 w-auto" />
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
              isActive
                ? "bg-primary/10 text-primary border border-primary/20"
                : "text-slate-600 hover:bg-slate-100"
            )}
          >
            <item.icon className="size-5" />
            <span className="text-sm font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-200">
        <div className="bg-slate-50 rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="size-10 rounded-full bg-slate-200 overflow-hidden">
              <AspectRatio ratio={1 / 1}>
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDrTIYcy2Fr3S9WaKAHzodELcQxKHxBvIW2Blnc6TEl_XvITPkt1AW3gXN5jElC4_Tg0Rnd7SCY0taIwVq9DOk4ojrNCAeYiUhEakrvogI44EHrNQ6Laeqmur538z7hLFXlBDpO095WuuJbPE9d4c5o6NSPlVN9vcjFzDTWKGljv_j3nvkCIJFgxLUDe8JCQ5mC49A4vJMWRS7rGCzzVbiYkyzr4HRR_K3VYE9_IX9zB4OQ3h8ZhZDG1ZKd79uGfFZO7wIvVzhTuSI"
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </AspectRatio>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">{student?.full_name || user?.name || 'Student'}</p>
              <p className="text-xs font-medium text-slate-500 truncate">Not updated</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="size-4" />
            {t('logout')}
          </button>
        </div>
      </div>
    </aside>
  );
}
