import React from 'react';
import { Sidebar } from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { useAttendance } from '../context/AttendanceContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Trophy, 
  Calendar, 
  CreditCard, 
  ChevronRight,
  Shield,
  Award,
  Clock
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export default function Profile() {
  const { user } = useAuth();
  const { getStudentAttendance } = useAttendance();
  const { t } = useLanguage();
  
  const attendance = getStudentAttendance(user?.username || 'demo');
  const attendanceRate = Math.round((attendance.present / (attendance.total || 1)) * 100);

  const beltHistory = [
    { belt: 'White Belt', date: 'Jan 2023', status: 'completed' },
    { belt: 'Yellow Belt', date: 'Apr 2023', status: 'completed' },
    { belt: 'Green Belt', date: 'Aug 2023', status: 'completed' },
    { belt: 'Blue Belt', date: 'Dec 2023', status: 'completed' },
    { belt: 'Brown Belt', date: 'May 2024', status: 'current' },
    { belt: 'Black Belt', date: 'Expected Dec 2024', status: 'upcoming' },
  ];

  const transactions = [
    { id: 'TX-9021', date: 'Oct 15, 2024', amount: '₹4,500', status: 'Paid', desc: 'Monthly Training Fee' },
    { id: 'TX-8842', date: 'Sep 12, 2024', amount: '₹4,500', status: 'Paid', desc: 'Monthly Training Fee' },
    { id: 'TX-8710', date: 'Aug 10, 2024', amount: '₹1,500', status: 'Paid', desc: 'Grading Fee (Blue to Brown)' },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Profile Header */}
          <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32"></div>
            <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
              <div className="relative">
                <div className="size-32 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-slate-100">
                  <img 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDrTIYcy2Fr3S9WaKAHzodELcQxKHxBvIW2Blnc6TEl_XvITPkt1AW3gXN5jElC4_Tg0Rnd7SCY0taIwVq9DOk4ojrNCAeYiUhEakrvogI44EHrNQ6Laeqmur538z7hLFXlBDpO095WuuJbPE9d4c5o6NSPlVN9vcjFzDTWKGljv_j3nvkCIJFgxLUDe8JCQ5mC49A4vJMWRS7rGCzzVbiYkyzr4HRR_K3VYE9_IX9zB4OQ3h8ZhZDG1ZKd79uGfFZO7wIvVzhTuSI" 
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 size-10 bg-primary rounded-full border-4 border-white flex items-center justify-center text-white shadow-lg">
                  <Award className="size-5" />
                </div>
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-3xl font-black text-slate-900">{user?.name || 'Arjun Singh'}</h2>
                <p className="text-slate-500 font-bold flex items-center justify-center md:justify-start gap-2 mt-1">
                  <Shield className="size-4 text-primary" />
                  Brown Belt • 1st Kyu • Karate (Shotokan)
                </p>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-6">
                  <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                    <Mail className="size-4 text-slate-400" />
                    {user?.email || 'arjun@example.com'}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                    <Phone className="size-4 text-slate-400" />
                    +91 98765 43210
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                    <MapPin className="size-4 text-slate-400" />
                    Mumbai, India
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Belt Progression & Attendance */}
            <div className="lg:col-span-7 space-y-8">
              {/* Belt Progression */}
              <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
                <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
                  <Trophy className="text-primary size-6" />
                  Belt Progression
                </h3>
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-100"></div>
                  <div className="space-y-8 relative">
                    {beltHistory.map((item, i) => (
                      <div key={i} className="flex items-start gap-6">
                        <div className={cn(
                          "size-8 rounded-full border-4 border-white shadow-md flex items-center justify-center relative z-10 shrink-0",
                          item.status === 'completed' ? "bg-green-500" : 
                          item.status === 'current' ? "bg-primary animate-pulse" : "bg-slate-200"
                        )}>
                          {item.status === 'completed' && <CheckCircle2 className="size-4 text-white" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h4 className={cn(
                              "font-bold text-sm",
                              item.status === 'upcoming' ? "text-slate-400" : "text-slate-900"
                            )}>{item.belt}</h4>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">{item.date}</span>
                          </div>
                          {item.status === 'current' && (
                            <p className="text-xs text-primary font-bold mt-1">Current Rank • 85% Mastery</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Attendance Summary */}
              <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Calendar className="text-primary size-6" />
                    Attendance Summary
                  </h3>
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">Last 30 Days</span>
                </div>
                
                <div className="grid grid-cols-3 gap-6 text-center">
                  <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">Total Classes</p>
                    <p className="text-2xl font-black text-blue-900">{attendance.total}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-green-50 border border-green-100">
                    <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest mb-1">Present</p>
                    <p className="text-2xl font-black text-green-900">{attendance.present}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-orange-50 border border-orange-100">
                    <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest mb-1">Rate</p>
                    <p className="text-2xl font-black text-orange-900">{attendanceRate}%</p>
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 font-medium">Training Consistency</span>
                    <span className="text-slate-900 font-bold">Excellent</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${attendanceRate}%` }}
                      className="h-full bg-primary"
                    />
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column: Transaction History */}
            <div className="lg:col-span-5">
              <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 h-full">
                <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
                  <CreditCard className="text-primary size-6" />
                  Transaction History
                </h3>
                
                <div className="space-y-6">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="group cursor-pointer">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">{tx.desc}</p>
                          <p className="text-[10px] text-slate-400 font-medium mt-0.5">{tx.date} • {tx.id}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-slate-900">{tx.amount}</p>
                          <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                            {tx.status}
                          </span>
                        </div>
                      </div>
                      <div className="h-px bg-slate-50 group-last:hidden"></div>
                    </div>
                  ))}
                </div>

                <button className="w-full mt-8 py-4 bg-slate-50 text-slate-600 rounded-2xl text-xs font-bold hover:bg-slate-100 transition-all flex items-center justify-center gap-2">
                  View Full Statement <ChevronRight className="size-4" />
                </button>

                <div className="mt-12 p-6 rounded-2xl bg-slate-900 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/20 rounded-full -mr-12 -mt-12"></div>
                  <div className="relative z-10">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Membership Status</p>
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-xl bg-white/10 flex items-center justify-center">
                        <Shield className="size-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">Active Member</p>
                        <p className="text-[10px] text-slate-400">Next renewal: Nov 15, 2024</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function CheckCircle2({ className, size }: { className?: string, size?: number }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size || 24} 
      height={size || 24} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
