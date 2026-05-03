import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, AlertCircle, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import AdminAuthShell from '../../components/admin/auth/AdminAuthShell';
import AdminAuthLogo from '../../components/admin/auth/AdminAuthLogo';
import AdminAuthCard from '../../components/admin/auth/AdminAuthCard';
import AdminAuthField from '../../components/admin/auth/AdminAuthField';
import AdminAuthButton from '../../components/admin/auth/AdminAuthButton';
import AdminAuthLink from '../../components/admin/auth/AdminAuthLink';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [securityNotice, setSecurityNotice] = useState('');
  const { login, isAdmin, loading: authLoading } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const savedEmail = localStorage.getItem('remembered_admin_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  useEffect(() => {
    const notice = sessionStorage.getItem('admin_security_notice');
    if (notice) {
      setSecurityNotice(notice);
      sessionStorage.removeItem('admin_security_notice');
    }
  }, []);

  useEffect(() => {
    if (!authLoading && isAdmin) navigate('/admin', { replace: true });
  }, [isAdmin, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const emailTrimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      setError('Please enter a valid admin email address.');
      return;
    }
    setSubmitting(true);
    try {
      if (rememberMe) {
        localStorage.setItem('remembered_admin_email', emailTrimmed);
      } else {
        localStorage.removeItem('remembered_admin_email');
      }

      const { error: err } = await login(emailTrimmed, password);
      if (err) {
        setError(err.message);
      } else {
        navigate('/admin');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminAuthShell
      eyebrow="SECURE ACCESS"
      title="MDPL Admin Login"
      subtitle="Sign in to manage registrations, academy operations, and platform activity."
    >
      <AdminAuthLogo size="md" />
      <AdminAuthCard>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-900/30 text-red-400 rounded-2xl flex items-center gap-3 text-sm font-medium border border-red-800/50">
              <AlertCircle className="size-5 shrink-0" />
              {error}
            </div>
          )}
          {securityNotice && (
            <div className="p-4 bg-emerald-900/30 text-emerald-300 rounded-2xl flex items-center gap-3 text-sm font-medium border border-emerald-800/50">
              <AlertCircle className="size-5 shrink-0" />
              {securityNotice}
            </div>
          )}

          <AdminAuthField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@mydojo.com"
            icon={<Mail className="size-5 text-slate-500" />}
            autoComplete="email"
            required
          />

          <AdminAuthField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            icon={<Lock className="size-5 text-slate-500" />}
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="rounded-lg p-1.5 text-slate-500 hover:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--admin-primary)_45%,transparent)]"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
              </button>
            }
            autoComplete="current-password"
            required
          />

          <div className="flex items-center px-1">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="size-4 rounded border-white/20 bg-white/10 accent-[var(--admin-primary)] text-[var(--admin-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--admin-primary)_25%,transparent)]"
              />
              <span className="text-sm font-bold text-slate-400 group-hover:text-slate-200 transition-colors">
                Remember Password
              </span>
            </label>
          </div>

          <AdminAuthButton type="submit" disabled={submitting} loading={submitting} iconRight={<ArrowRight className="size-5" />}>
            Sign In
          </AdminAuthButton>
        </form>
      </AdminAuthCard>

      <div className="mt-8 text-center">
        <AdminAuthLink to="/" iconLeft="←">
          Back to site
        </AdminAuthLink>
      </div>
    </AdminAuthShell>
  );
}
