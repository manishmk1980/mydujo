import React from 'react';
import { Link } from 'react-router-dom';
import { Sword, LogIn } from 'lucide-react';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useAuth } from '../context/AuthContext';

export function Header() {
  const { isAuthenticated, user } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="bg-primary p-2 rounded-lg">
            <Sword className="text-white size-6" />
          </div>
          <h2 className="text-xl font-bold tracking-tight uppercase">MY<span className="text-primary">DOJO</span></h2>
        </Link>
        <nav className="hidden md:flex items-center gap-10">
          <Link to="/dashboard" className="text-sm font-semibold hover:text-primary transition-colors text-slate-600">Dashboard</Link>
          <Link to="/programs" className="text-sm font-semibold hover:text-primary transition-colors text-slate-600">Specialized Tracks</Link>
          <Link to="/instructors" className="text-sm font-semibold hover:text-primary transition-colors text-slate-600">Instructors</Link>
          <Link to="/register" className="text-sm font-semibold hover:text-primary transition-colors text-slate-600">Enroll</Link>
        </nav>
        <div className="flex items-center gap-6">
          <LanguageSwitcher />
          
          {isAuthenticated ? (
            <Link to="/dashboard" className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-900">{user?.name}</p>
                <p className="text-[10px] text-slate-500">Student</p>
              </div>
              <div className="h-10 w-10 rounded-full border-2 border-primary overflow-hidden cursor-pointer">
                <img 
                  alt="Student Profile" 
                  className="w-full h-full object-cover" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDrTIYcy2Fr3S9WaKAHzodELcQxKHxBvIW2Blnc6TEl_XvITPkt1AW3gXN5jElC4_Tg0Rnd7SCY0taIwVq9DOk4ojrNCAeYiUhEakrvogI44EHrNQ6Laeqmur538z7hLFXlBDpO095WuuJbPE9d4c5o6NSPlVN9vcjFzDTWKGljv_j3nvkCIJFgxLUDe8JCQ5mC49A4vJMWRS7rGCzzVbiYkyzr4HRR_K3VYE9_IX9zB4OQ3h8ZhZDG1ZKd79uGfFZO7wIvVzhTuSI"
                />
              </div>
            </Link>
          ) : (
            <Link 
              to="/login" 
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
            >
              <LogIn className="size-4" />
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
