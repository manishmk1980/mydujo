import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Medal, 
  History, 
  CreditCard, 
  User,
  Sword,
  LogOut,
  Calendar,
  Target
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export function Sidebar() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { icon: LayoutDashboard, label: t('dashboard'), path: '/dashboard' },
    { icon: Medal, label: t('beltGrading'), path: '/grading' },
    { icon: Target, label: 'Specialized Tracks', path: '/programs' },
    { icon: History, label: t('paymentHistory'), path: '/payments' },
    { icon: CreditCard, label: t('payFee'), path: '/checkout' },
    { icon: Calendar, label: 'Attendance', path: '/instructor/attendance' },
    { icon: User, label: t('profile'), path: '/profile' },
  ];

  return (
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col shrink-0 h-screen sticky top-0">
      <div className="p-6 flex items-center gap-3">
        <div className="size-10 rounded-full bg-primary flex items-center justify-center text-white">
          <Sword className="size-6" />
        </div>
        <div>
          <h1 className="text-slate-900 text-base font-bold leading-none">MyDojo</h1>
          <p className="text-slate-500 text-xs font-medium">Academy Management</p>
        </div>
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
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDrTIYcy2Fr3S9WaKAHzodELcQxKHxBvIW2Blnc6TEl_XvITPkt1AW3gXN5jElC4_Tg0Rnd7SCY0taIwVq9DOk4ojrNCAeYiUhEakrvogI44EHrNQ6Laeqmur538z7hLFXlBDpO095WuuJbPE9d4c5o6NSPlVN9vcjFzDTWKGljv_j3nvkCIJFgxLUDe8JCQ5mC49A4vJMWRS7rGCzzVbiYkyzr4HRR_K3VYE9_IX9zB4OQ3h8ZhZDG1ZKd79uGfFZO7wIvVzhTuSI" 
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">{user?.name || 'Student'}</p>
              <p className="text-xs font-medium text-slate-500 truncate">Brown Belt</p>
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
