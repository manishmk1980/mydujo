import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import mdplLogo from '@/assets/logo/mdpl-vr-logo.svg';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { motion } from 'motion/react';

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
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex justify-center mb-6">
            <img src={mdplLogo} alt="MYDOJO Admin" className="h-24 w-auto brightness-0 invert" />
          </Link>
          <h2 className="text-xl font-bold text-white">Admin Login</h2>
          <p className="text-slate-400 mt-2">Sign in to manage student registrations</p>
        </div>

        <div className="bg-slate-800/80 p-8 rounded-3xl shadow-xl border border-slate-700">
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

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-300 ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-900/50 border border-slate-600 rounded-2xl text-white placeholder-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none"
                  placeholder="admin@mydojo.com"
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
            <div className="flex items-center px-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="size-4 rounded border-slate-600 bg-slate-900/50 text-amber-500 focus:ring-amber-500/20 accent-amber-500"
                />
                <span className="text-sm font-bold text-slate-400 group-hover:text-slate-200 transition-colors">Remember Password</span>
              </label>
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
          <Link to="/" className="text-slate-400 hover:text-white text-sm">
            ← Back to site
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
