import React from 'react';
import { 
  Calendar, 
  Trophy, 
  Flame, 
  Bell, 
  ChevronRight, 
  Clock, 
  CheckCircle2,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { useAttendance } from '../context/AttendanceContext';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { getStudentAttendance } = useAttendance();
  const { user } = useAuth();
  const attendance = getStudentAttendance(user?.username || 'demo');
  const attendanceRate = (attendance.present / (attendance.total || 1)) * 100;
  const skillMastery = 78; // Mock for now
  const overallProgress = Math.round((attendanceRate + skillMastery) / 2);

  return (
    <div className="flex h-screen overflow-hidden bg-background-light">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">Osu, Arjun!</h2>
              <p className="text-slate-500 mt-1">You're on a 12-day training streak. Keep it up!</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 text-slate-400 hover:text-primary transition-colors relative">
                <Bell className="size-6" />
                <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              <div className="h-10 w-px bg-slate-200 mx-2"></div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-bold">Arjun Singh</p>
                  <p className="text-xs text-slate-500">Brown Belt • 1st Kyu</p>
                </div>
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDrTIYcy2Fr3S9WaKAHzodELcQxKHxBvIW2Blnc6TEl_XvITPkt1AW3gXN5jElC4_Tg0Rnd7SCY0taIwVq9DOk4ojrNCAeYiUhEakrvogI44EHrNQ6Laeqmur538z7hLFXlBDpO095WuuJbPE9d4c5o6NSPlVN9vcjFzDTWKGljv_j3nvkCIJFgxLUDe8JCQ5mC49A4vJMWRS7rGCzzVbiYkyzr4HRR_K3VYE9_IX9zB4OQ3h8ZhZDG1ZKd79uGfFZO7wIvVzhTuSI" 
                  alt="Profile"
                  className="size-10 rounded-full object-cover border-2 border-primary"
                />
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="size-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <Calendar className="size-6" />
                </div>
                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">Real-time</span>
              </div>
              <p className="text-slate-500 text-sm font-medium">Classes This Month</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">{attendance.present} <span className="text-slate-400 text-lg font-medium">/ {attendance.total}</span></h3>
              <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(attendance.present / (attendance.total || 1)) * 100}%` }}
                  className="h-full bg-blue-500"
                />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
              <div className="flex items-center justify-between mb-6">
                <div className="size-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                  <Trophy className="size-6" />
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Next Belt</span>
                  <p className="text-xs font-black text-slate-900">Black Belt (1st Dan)</p>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="relative size-24 shrink-0">
                  <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="16" fill="none" className="stroke-slate-100" strokeWidth="3" />
                    <motion.circle 
                      cx="18" cy="18" r="16" fill="none" 
                      className="stroke-orange-500" strokeWidth="3" 
                      strokeDasharray="100"
                      initial={{ strokeDashoffset: 100 }}
                      animate={{ strokeDashoffset: 100 - overallProgress }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-black text-slate-900">{overallProgress}%</span>
                  </div>
                </div>
                
                <div className="flex-1 space-y-3">
                  <div>
                    <div className="flex justify-between text-[10px] font-bold mb-1">
                      <span className="text-slate-500 uppercase">Attendance</span>
                      <span className="text-slate-900">{attendance.present}/{attendance.total}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(attendance.present / (attendance.total || 1)) * 100}%` }}
                        className="h-full bg-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] font-bold mb-1">
                      <span className="text-slate-500 uppercase">Skill Mastery</span>
                      <span className="text-slate-900">78%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '78%' }}
                        className="h-full bg-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="size-3.5 text-slate-400" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Next Grading</span>
                </div>
                <span className="text-xs font-black text-primary">Dec 15, 2024</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="size-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
                  <Flame className="size-6" />
                </div>
                <span className="text-xs font-bold text-red-600">Personal Best!</span>
              </div>
              <p className="text-slate-500 text-sm font-medium">Training Streak</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">12 <span className="text-slate-400 text-lg font-medium">Days</span></h3>
              <div className="mt-4 flex gap-1">
                {[1, 1, 1, 1, 1, 1, 0].map((active, i) => (
                  <div key={i} className={cn("flex-1 h-1.5 rounded-full", active ? "bg-red-500" : "bg-slate-100")} />
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-8 space-y-8">
              {/* Training Schedule */}
              <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-bold text-lg">Upcoming Training</h3>
                  <button className="text-primary text-sm font-bold hover:underline">View Calendar</button>
                </div>
                <div className="divide-y divide-slate-100">
                  {[
                    { title: 'Advanced Kumite Drill', time: 'Today, 18:30', instructor: 'Sensei Sato', type: 'Sparring' },
                    { title: 'Kata Technical Review', time: 'Tomorrow, 17:00', instructor: 'Sensei Tanaka', type: 'Technical' },
                    { title: 'General Fitness & Conditioning', time: 'Fri, 19:00', instructor: 'Sempai Lee', type: 'Fitness' }
                  ].map((session, i) => (
                    <div key={i} className="p-6 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                      <div className="size-12 rounded-xl bg-slate-100 flex flex-col items-center justify-center text-slate-500 shrink-0">
                        <Clock className="size-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-900 truncate">{session.title}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Calendar className="size-3" /> {session.time}
                          </span>
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <CheckCircle2 className="size-3" /> {session.instructor}
                          </span>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-full uppercase tracking-wider">
                        {session.type}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Recent Activity */}
              <section>
                <h3 className="font-bold text-lg mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {[
                    { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', title: 'Attendance Logged', desc: 'Advanced Kumite Drill (Oct 14)', time: '2 hours ago' },
                    { icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50', title: 'Skill Mastered', desc: 'Kanku Dai Kata approved by Sensei', time: 'Yesterday' },
                    { icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50', title: 'Payment Reminder', desc: 'Monthly fee for November is due', time: '2 days ago' }
                  ].map((activity, i) => (
                    <div key={i} className="flex gap-4">
                      <div className={cn("size-10 rounded-full flex items-center justify-center shrink-0", activity.bg, activity.color)}>
                        <activity.icon className="size-5" />
                      </div>
                      <div className="flex-1 pb-4 border-b border-slate-100">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-slate-900 text-sm">{activity.title}</h4>
                          <span className="text-xs text-slate-400">{activity.time}</span>
                        </div>
                        <p className="text-sm text-slate-500 mt-0.5">{activity.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Sidebar Content */}
            <div className="lg:col-span-4 space-y-8">
              {/* Dojo Notices */}
              <section className="bg-slate-900 text-white rounded-2xl p-6 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -mr-16 -mt-16"></div>
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2 relative z-10">
                  <Bell className="size-5 text-primary" />
                  Dojo Notices
                </h3>
                <div className="space-y-4 relative z-10">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-xs font-bold text-primary uppercase mb-1">Grading Alert</p>
                    <p className="text-sm font-medium">Winter Belt Grading starts Dec 15th. Check eligibility now.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Holiday Notice</p>
                    <p className="text-sm font-medium">Dojo closed for Diwali from Oct 31st to Nov 2nd.</p>
                  </div>
                </div>
                <button className="w-full mt-6 py-3 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
                  Read All Notices <ChevronRight className="size-4" />
                </button>
              </section>

              {/* Quick Actions */}
              <section className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="font-bold text-lg mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-primary transition-all text-center group">
                    <Calendar className="size-6 mx-auto mb-2 text-slate-400 group-hover:text-primary" />
                    <span className="text-xs font-bold text-slate-600">Book Class</span>
                  </button>
                  <button className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-primary transition-all text-center group">
                    <Trophy className="size-6 mx-auto mb-2 text-slate-400 group-hover:text-primary" />
                    <span className="text-xs font-bold text-slate-600">Grading Req</span>
                  </button>
                  <button className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-primary transition-all text-center group">
                    <Clock className="size-6 mx-auto mb-2 text-slate-400 group-hover:text-primary" />
                    <span className="text-xs font-bold text-slate-600">Attendance</span>
                  </button>
                  <button className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-primary transition-all text-center group">
                    <AlertCircle className="size-6 mx-auto mb-2 text-slate-400 group-hover:text-primary" />
                    <span className="text-xs font-bold text-slate-600">Support</span>
                  </button>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
