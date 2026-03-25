import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight, Eye, EyeOff, Lock, Mail, UserCog } from 'lucide-react';
import { motion } from 'motion/react';
import mdplLogo from '@/assets/logo/mdpl-vr-logo.svg';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'instructor'>('student');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname as string | undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const emailTrimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      setError('Please enter a valid email address.');
      return;
    }
    setSubmitting(true);
    try {
      const { error: err } = await login(emailTrimmed, password, role === 'instructor' ? 'instructor' : 'student');
      if (err) {
        setError(typeof err === 'string' ? err : err?.message || 'Login failed.');
        return;
      }
      navigate(from || (role === 'instructor' ? '/instructor' : '/dashboard'), { replace: true });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex justify-center mb-6">
            <img src={mdplLogo} alt="MyDojo" className="h-24 w-auto brightness-0 invert" />
          </Link>
          <h2 className="text-xl font-bold text-white">Sign In</h2>
          <p className="text-slate-400 mt-2">Access your dashboard and training tools</p>
        </div>

        <div className="bg-slate-800/80 p-8 rounded-3xl shadow-xl border border-slate-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-900/30 text-red-400 rounded-2xl flex items-center gap-3 text-sm font-medium border border-red-800/50">
                <AlertCircle className="size-5 shrink-0" />
                {error}
              </div>
            )}

            <div className="flex items-center gap-2 bg-slate-900/40 border border-slate-700 rounded-2xl p-2">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={cn(
                  'flex-1 px-4 py-2 rounded-xl text-sm font-extrabold transition-colors',
                  role === 'student' ? 'bg-amber-500 text-slate-900' : 'text-slate-300 hover:bg-slate-800'
                )}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => setRole('instructor')}
                className={cn(
                  'flex-1 px-4 py-2 rounded-xl text-sm font-extrabold transition-colors inline-flex items-center justify-center gap-2',
                  role === 'instructor' ? 'bg-amber-500 text-slate-900' : 'text-slate-300 hover:bg-slate-800'
                )}
              >
                <UserCog className="size-4" />
                Instructor
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-300 ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-900/50 border border-slate-600 rounded-2xl text-white placeholder-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-300 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 bg-slate-900/50 border border-slate-600 rounded-2xl text-white placeholder-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between px-1">
              <Link to="/forgot-password" className="text-sm font-bold text-slate-400 hover:text-white">
                Forgot password?
              </Link>
              <Link to="/register" className="text-sm font-bold text-slate-400 hover:text-white">
                Create account
              </Link>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-amber-500 text-slate-900 rounded-2xl font-bold text-lg shadow-lg hover:bg-amber-400 disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.99] flex items-center justify-center gap-2"
            >
              {submitting ? 'Signing in...' : 'Sign In'}
              <ArrowRight className="size-5" />
            </button>
          </form>
        </div>

        <div className="mt-6 text-center">
          <Link to="/admin/login" className="text-slate-400 hover:text-white text-sm">
            Admin login →
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

