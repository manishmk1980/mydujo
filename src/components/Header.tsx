import React from 'react';
import { Link } from 'react-router-dom';
import { LogIn, Menu, X } from 'lucide-react';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useAuth } from '../context/AuthContext';
import { AspectRatio } from './ui/aspect-ratio';
import mdplLogo from '@/assets/logo/mdpl-hr-logo.svg';

export function Header() {
  const { isAuthenticated, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-3 sm:gap-4">
        <Link to="/" className="flex items-center shrink-0">
          <img
            src={mdplLogo}
            alt="MyDojo"
            className="h-10 sm:h-14 md:h-16 w-auto object-contain transition-all duration-300"
          />
        </Link>
        <nav className="hidden md:flex items-center gap-10">
          <Link to="/about" className="text-sm font-semibold hover:text-primary transition-colors text-slate-600">About</Link>
          <Link to="/programs" className="text-sm font-semibold hover:text-primary transition-colors text-slate-600">Programs</Link>
          <Link to="/instructors" className="text-sm font-semibold hover:text-primary transition-colors text-slate-600">Instructors</Link>
          <Link to="/events" className="text-sm font-semibold hover:text-primary transition-colors text-slate-600">Events</Link>
          <Link to="/contact" className="text-sm font-semibold hover:text-primary transition-colors text-slate-600">Contact</Link>
        </nav>
        <div className="flex items-center gap-2 sm:gap-6">
          {false && <LanguageSwitcher />}

          {isAuthenticated ? (
            <Link to="/dashboard" className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-900">{user?.name}</p>
                <p className="text-[10px] text-slate-500">Student</p>
              </div>
              <div className="h-10 w-10 rounded-full border-2 border-primary overflow-hidden cursor-pointer">
                <AspectRatio ratio={1 / 1}>
                  <img
                    alt="Student Profile"
                    className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDrTIYcy2Fr3S9WaKAHzodELcQxKHxBvIW2Blnc6TEl_XvITPkt1AW3gXN5jElC4_Tg0Rnd7SCY0taIwVq9DOk4ojrNCAeYiUhEakrvogI44EHrNQ6Laeqmur538z7hLFXlBDpO095WuuJbPE9d4c5o6NSPlVN9vcjFzDTWKGljv_j3nvkCIJFgxLUDe8JCQ5mC49A4vJMWRS7rGCzzVbiYkyzr4HRR_K3VYE9_IX9zB4OQ3h8ZhZDG1ZKd79uGfFZO7wIvVzhTuSI"
                  />
                </AspectRatio>
              </div>
            </Link>
          ) : (
            <Link
              to="/login"
              className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
            >
              <LogIn className="size-4" />
              Sign In
            </Link>
          )}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden inline-flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-700"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white">
          <nav className="max-w-7xl mx-auto px-3 py-3 flex flex-col">
            <Link onClick={() => setMobileMenuOpen(false)} to="/about" className="px-2 py-2 text-sm font-semibold text-slate-700">About</Link>
            <Link onClick={() => setMobileMenuOpen(false)} to="/programs" className="px-2 py-2 text-sm font-semibold text-slate-700">Programs</Link>
            <Link onClick={() => setMobileMenuOpen(false)} to="/instructors" className="px-2 py-2 text-sm font-semibold text-slate-700">Instructors</Link>
            <Link onClick={() => setMobileMenuOpen(false)} to="/events" className="px-2 py-2 text-sm font-semibold text-slate-700">Events</Link>
            <Link onClick={() => setMobileMenuOpen(false)} to="/contact" className="px-2 py-2 text-sm font-semibold text-slate-700">Contact</Link>
            {!isAuthenticated && (
              <Link
                onClick={() => setMobileMenuOpen(false)}
                to="/login"
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white"
              >
                <LogIn className="size-4" />
                Sign In
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
