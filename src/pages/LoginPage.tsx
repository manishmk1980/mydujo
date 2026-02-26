import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sword, Lock, User, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(username, password)) {
      navigate('/dashboard');
    } else {
      setError('Invalid credentials. Use demo/demo');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-6">
            <div className="bg-primary p-2 rounded-xl">
              <Sword className="text-white size-8" />
            </div>
            <h1 className="text-3xl font-black tracking-tight uppercase">MY<span className="text-primary">DOJO</span></h1>
          </Link>
          <h2 className="text-2xl font-bold text-slate-900">Student Login</h2>
          <p className="text-slate-500 mt-2">Enter your credentials to access your dojo</p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 text-sm font-medium border border-red-100">
                <AlertCircle className="size-5 shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-transparent focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-2xl transition-all outline-none text-slate-900 font-medium"
                  placeholder="e.g. demo"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-transparent focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-2xl transition-all outline-none text-slate-900 font-medium"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-lg shadow-lg shadow-primary/25 hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
            >
              Sign In
              <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100 text-center">
            <p className="text-slate-500 text-sm">
              New student? <Link to="/register" className="text-primary font-bold hover:underline">Register here</Link>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">
            India's Premier Martial Arts Platform
          </p>
        </div>
      </motion.div>
    </div>
  );
}
