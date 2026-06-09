import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, AlertCircle, ArrowRight, Loader2, CheckCircle2, GraduationCap, UserCog } from 'lucide-react';

import PublicAuthLayout from '../components/public/PublicAuthLayout';
import PublicAuthCard from '../components/public/PublicAuthCard';
import { useAuth } from '../context/AuthContext';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { resetPasswordForEmail } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const emailTrimmed = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(emailTrimmed)) {
      setError('Please enter a valid email address (e.g. name@domain.com).');
      return;
    }

    setSubmitting(true);
    try {
      const { error: err } = await resetPasswordForEmail(emailTrimmed);
      if (err) {
        setError(err.message || 'Could not send reset link');
      } else {
        setSuccess('Password reset link sent! Please check your inbox.');
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
        Sign in instead
      </div>
      <p className="mt-3 text-sm font-medium leading-6 text-slate-600 dark:text-white/70 sm:text-base sm:leading-7">
        Remembered your password? Head straight to your portal sign-in.
      </p>

      <div className="mt-5 flex flex-col gap-2.5">
        <Link
          to="/student/login"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white/80 px-5 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-slate-800 transition hover:border-orange-500 hover:text-orange-600 dark:border-white/15 dark:bg-white/10 dark:text-white dark:hover:text-orange-400"
        >
          <GraduationCap size={14} strokeWidth={2.8} />
          Student sign in
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
      eyebrow="Password Help"
      title={
        <>
          Reset your
          <span className="block text-orange-600">password</span>
        </>
      }
      description="Enter the email associated with your MyDojo account and we'll send a secure reset link."
      sidePanel={sidePanel}
    >
      <PublicAuthCard
        eyebrow="Forgot Password"
        title="Send reset link"
        description="We'll email you instructions to choose a new password."
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
            <label htmlFor="forgot-email" className="ml-1 text-[11px] font-black uppercase tracking-[0.2em] text-slate-700 dark:text-white/80">
              Email Address
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 dark:text-white/50" />
              <input
                id="forgot-email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. yourname@domain.com"
                autoComplete="email"
                required
                className="w-full rounded-2xl border border-slate-300 bg-white py-4 pl-12 pr-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/25 dark:border-white/15 dark:bg-white/[0.06] dark:text-white dark:placeholder:text-white/40"
              />
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
                Sending link...
              </>
            ) : (
              <>
                Send Reset Link
                <ArrowRight className="h-5 w-5" strokeWidth={3} />
              </>
            )}
          </button>

          <div className="flex flex-col items-stretch gap-3 border-t border-slate-100 pt-5 text-center text-sm dark:border-white/10 sm:flex-row sm:items-center sm:justify-between sm:text-left">
            <p className="text-sm font-medium text-slate-600 dark:text-white/70">
              Remember your password?{' '}
              <Link to="/student/login" className="font-black text-orange-600 hover:underline dark:text-orange-400">
                Sign in
              </Link>
            </p>
            <Link
              to="/join-mydojo"
              className="text-sm font-bold text-slate-700 transition hover:text-orange-600 dark:text-white/80 dark:hover:text-orange-400"
            >
              All sign-in options
            </Link>
          </div>
        </form>
      </PublicAuthCard>
    </PublicAuthLayout>
  );
}
