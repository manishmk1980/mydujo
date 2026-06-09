import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight, Eye, EyeOff, GraduationCap, Lock, Mail, UserCog } from 'lucide-react';

import PublicAuthLayout from '../../components/public/PublicAuthLayout';
import PublicAuthCard from '../../components/public/PublicAuthCard';
import { useAuth } from '../../context/AuthContext';

export default function StudentLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const emailTrimmed = email.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!password.trim()) {
      setError('Please enter your password.');
      return;
    }

    setSubmitting(true);

    try {
      const { error: loginError } = await login(emailTrimmed, password, 'student');

      if (loginError) {
        setError(
          typeof loginError === 'string'
            ? loginError
            : loginError?.message || 'Student login failed.'
        );
        return;
      }

      navigate(from || '/dashboard', { replace: true });
    } finally {
      setSubmitting(false);
    }
  };

  const sidePanel = (
    <div className="rounded-3xl border border-slate-200/80 bg-white/70 p-6 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.05] sm:p-7">
      <div className="text-[10px] font-black uppercase tracking-[0.28em] text-orange-600">
        Need help?
      </div>
      <p className="mt-3 text-sm font-medium leading-6 text-slate-600 dark:text-white/70 sm:text-base sm:leading-7">
        New to MyDojo? Create a student profile to enrol in academies and track your training journey.
      </p>

      <div className="mt-5 flex flex-col gap-2.5">
        <Link
          to="/register/student"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-orange-500/50 bg-orange-50 px-5 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-orange-700 transition hover:border-orange-600 hover:bg-orange-100 dark:border-orange-400/30 dark:bg-orange-500/10 dark:text-orange-300 dark:hover:bg-orange-500/20"
        >
          Create student account
          <ArrowRight size={14} strokeWidth={3} />
        </Link>

        <Link
          to="/instructor/login"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white/80 px-5 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-slate-800 transition hover:border-orange-500 hover:text-orange-600 dark:border-white/15 dark:bg-white/10 dark:text-white dark:hover:text-orange-400"
        >
          <UserCog size={14} strokeWidth={2.8} />
          Instructor sign in
        </Link>
      </div>
    </div>
  );

  return (
    <PublicAuthLayout
      eyebrow="Student Access"
      title={
        <>
          Welcome
          <span className="block text-orange-600">back, student</span>
        </>
      }
      description="Sign in to access your profile, fee requests, attendance, events, and progression records."
      sidePanel={sidePanel}
    >
      <PublicAuthCard
        eyebrow="Student Sign In"
        title="Sign in to your portal"
        description="Use the email and password linked to your student profile."
      >
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {error ? (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 dark:border-red-400/30 dark:bg-red-500/10 dark:text-red-200"
            >
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          ) : null}

          <div className="space-y-2">
            <label htmlFor="student-email" className="ml-1 text-[11px] font-black uppercase tracking-[0.2em] text-slate-700 dark:text-white/80">
              Email
            </label>

            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 dark:text-white/50" />

              <input
                id="student-email"
                name="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="student@example.com"
                autoComplete="email"
                required
                className="w-full rounded-2xl border border-slate-300 bg-white py-4 pl-12 pr-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/25 dark:border-white/15 dark:bg-white/[0.06] dark:text-white dark:placeholder:text-white/40"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="student-password" className="ml-1 text-[11px] font-black uppercase tracking-[0.2em] text-slate-700 dark:text-white/80">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="rounded-md text-xs font-bold text-orange-600 underline-offset-4 transition hover:underline dark:text-orange-400"
              >
                Forgot password?
              </Link>
            </div>

            <div className="relative">
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 dark:text-white/50" />

              <input
                id="student-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                className="w-full rounded-2xl border border-slate-300 bg-white py-4 pl-12 pr-12 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/25 dark:border-white/15 dark:bg-white/[0.06] dark:text-white dark:placeholder:text-white/40"
              />

              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-600 px-5 py-4 text-sm font-black uppercase tracking-[0.14em] text-white shadow-xl shadow-orange-600/30 transition hover:-translate-y-0.5 hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 sm:tracking-[0.18em]"
          >
            <GraduationCap className="h-5 w-5" strokeWidth={2.5} />
            {submitting ? 'Signing in...' : 'Sign in as student'}
            <ArrowRight className="h-5 w-5" strokeWidth={3} />
          </button>

          <div className="flex flex-col items-stretch gap-3 border-t border-slate-100 pt-5 text-center text-sm dark:border-white/10 sm:flex-row sm:items-center sm:justify-between sm:text-left">
            <p className="text-sm font-medium text-slate-600 dark:text-white/70">
              Don&apos;t have an account?{' '}
              <Link to="/register/student" className="font-black text-orange-600 hover:underline dark:text-orange-400">
                Create one
              </Link>
            </p>
            <Link
              to="/instructor/login"
              className="text-sm font-bold text-slate-700 transition hover:text-orange-600 dark:text-white/80 dark:hover:text-orange-400"
            >
              Are you an instructor?
            </Link>
          </div>
        </form>
      </PublicAuthCard>
    </PublicAuthLayout>
  );
}
