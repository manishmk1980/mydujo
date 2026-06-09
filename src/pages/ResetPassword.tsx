import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, AlertCircle, ArrowRight, Loader2, CheckCircle2, Eye, EyeOff } from 'lucide-react';

import PublicAuthLayout from '../components/public/PublicAuthLayout';
import PublicAuthCard from '../components/public/PublicAuthCard';
import { useAuth } from '../context/AuthContext';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { updatePassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setSubmitting(true);
    try {
      const { error: err } = await updatePassword(password);
      if (err) {
        setError(err.message || 'Could not update password');
      } else {
        setSuccess('Password updated successfully! Redirecting to sign in...');
        setTimeout(() => {
          navigate('/student/login');
        }, 3000);
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const sidePanel = (
    <div className="rounded-3xl border border-slate-200/80 bg-white/70 p-6 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.05] sm:p-7">
      <div className="text-[10px] font-black uppercase tracking-[0.28em] text-orange-600">
        Password tips
      </div>
      <ul className="mt-3 space-y-2 text-sm font-medium leading-6 text-slate-600 dark:text-white/70 sm:text-base">
        <li className="flex items-start gap-2">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-orange-600" />
          Use at least 6 characters
        </li>
        <li className="flex items-start gap-2">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-orange-600" />
          Mix letters, numbers, and symbols
        </li>
        <li className="flex items-start gap-2">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-orange-600" />
          Avoid reusing previous passwords
        </li>
      </ul>
    </div>
  );

  return (
    <PublicAuthLayout
      eyebrow="Account Security"
      title={
        <>
          Choose a new
          <span className="block text-orange-600">password</span>
        </>
      }
      description="Pick a strong password you don't use anywhere else. We'll sign you in after the update."
      sidePanel={sidePanel}
    >
      <PublicAuthCard
        eyebrow="Reset Password"
        title="Update your credentials"
        description="Both fields must match before we save your new password."
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

          {success ? (
            <div
              role="status"
              className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-200"
            >
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
              <span>{success}</span>
            </div>
          ) : null}

          <div className="space-y-2">
            <label htmlFor="reset-password" className="ml-1 text-[11px] font-black uppercase tracking-[0.2em] text-slate-700 dark:text-white/80">
              New Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 dark:text-white/50" />
              <input
                id="reset-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                autoComplete="new-password"
                required
                className="w-full rounded-2xl border border-slate-300 bg-white py-4 pl-12 pr-12 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/25 dark:border-white/15 dark:bg-white/[0.06] dark:text-white dark:placeholder:text-white/40"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="reset-password-confirm" className="ml-1 text-[11px] font-black uppercase tracking-[0.2em] text-slate-700 dark:text-white/80">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 dark:text-white/50" />
              <input
                id="reset-password-confirm"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your new password"
                autoComplete="new-password"
                required
                className="w-full rounded-2xl border border-slate-300 bg-white py-4 pl-12 pr-12 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/25 dark:border-white/15 dark:bg-white/[0.06] dark:text-white dark:placeholder:text-white/40"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-600 px-5 py-4 text-sm font-black uppercase tracking-[0.14em] text-white shadow-xl shadow-orange-600/30 transition hover:-translate-y-0.5 hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 sm:tracking-[0.18em]"
          >
            {submitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Updating password...
              </>
            ) : (
              <>
                Update Password
                <ArrowRight className="h-5 w-5" strokeWidth={3} />
              </>
            )}
          </button>

          <div className="border-t border-slate-100 pt-5 text-center text-sm dark:border-white/10">
            <Link
              to="/student/login"
              className="text-sm font-bold text-slate-700 transition hover:text-orange-600 dark:text-white/80 dark:hover:text-orange-400"
            >
              Back to sign in
            </Link>
          </div>
        </form>
      </PublicAuthCard>
    </PublicAuthLayout>
  );
}
