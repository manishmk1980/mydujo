import React from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Trophy,
  Flame,
  Bell,
  Clock,
  CheckCircle2,
  AlertCircle,
  Info
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { useAttendance } from '../context/AttendanceContext';
import { useAuth } from '../context/AuthContext';
import { feesService, type FeeRequestDTO } from '../services/feesService';

function formatRelativeDate(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffMins < 60) return 'Just now';
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

export default function Dashboard() {
  const { attendance: attendanceRecords } = useAttendance();
  const { user, student } = useAuth();

  // Derive present/total: approved = present, total = all records
  const approved = attendanceRecords.filter((r) => r.status === 'approved').length;
  const total = attendanceRecords.length;
  const attendance = { present: approved, total };
  const attendanceRate = (total || 1) > 0 ? (approved / total) * 100 : 0;
  const displayName = student?.full_name || user?.name || 'Student';
  const [feeRequests, setFeeRequests] = React.useState<FeeRequestDTO[]>([]);

  const recentActivityFromAttendance = attendanceRecords
    .filter((r) => r.status === 'approved')
    .sort((a, b) => new Date(b.attendance_date || 0).getTime() - new Date(a.attendance_date || 0).getTime())
    .slice(0, 5)
    .map((r) => ({
      icon: CheckCircle2,
      color: 'text-green-600',
      bg: 'bg-green-50',
      title: 'Attendance Logged',
      desc: r.class_session?.title || 'Class',
      time: r.attendance_date ? formatRelativeDate(r.attendance_date) : '',
    }));

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const rows = await feesService.getMyFeeRequests();
        if (alive) setFeeRequests(rows);
      } catch {
        if (alive) setFeeRequests([]);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const openFeeRequests = feeRequests.filter((r) => {
    const status = r.computed_status ?? r.status;
    return status === 'ISSUED' || status === 'OVERDUE';
  });

  return (
    <div className="space-y-8">
          {/* Greeting — profile and notifications live in the shell header */}
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Osu, {displayName.split(' ')[0]}!</h2>
            <p className="mt-1 text-slate-500">
              {attendance.total > 0 ? 'Keep up your training!' : 'Welcome! Start your training journey.'}
            </p>
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
              <h3 className="text-3xl font-bold text-slate-900 mt-1">
                {attendance.total > 0 ? (
                  <>{attendance.present} <span className="text-slate-400 text-lg font-medium">/ {attendance.total}</span></>
                ) : (
                  <span className="text-slate-400 text-base font-medium">No information available yet</span>
                )}
              </h3>
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
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Belt Progress</span>
                  <p className="text-xs font-black text-slate-900">Based on attendance</p>
                </div>
              </div>

              <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
                <div className="relative size-24 shrink-0">
                  <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="16" fill="none" className="stroke-slate-100" strokeWidth="3" />
                    <motion.circle
                      cx="18" cy="18" r="16" fill="none"
                      className="stroke-orange-500" strokeWidth="3"
                      strokeDasharray="100"
                      initial={{ strokeDashoffset: 100 }}
                      animate={{ strokeDashoffset: 100 - attendanceRate }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-black text-slate-900">{attendance.total > 0 ? Math.round(attendanceRate) : 0}%</span>
                  </div>
                </div>

                <div className="min-w-0 w-full flex-1 space-y-3">
                  <div>
                    <div className="flex justify-between text-[10px] font-bold mb-1">
                      <span className="text-slate-500 uppercase">Attendance</span>
                      <span className="text-slate-900">{attendance.present}/{attendance.total}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${attendanceRate}%` }}
                        className="h-full bg-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] font-bold mb-1">
                      <span className="text-slate-500 uppercase">Skill Mastery</span>
                      <span className="text-slate-400 text-[10px]">—</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden flex items-center px-1">
                      <span className="text-[10px] text-slate-400">No data yet</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="size-3.5 text-slate-400" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Next Grading</span>
                </div>
                <span className="text-xs text-slate-400">—</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="size-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
                  <Flame className="size-6" />
                </div>
              </div>
              <p className="text-slate-500 text-sm font-medium">Training Streak</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {attendance.total > 0 ? (
                  <span>{attendance.present} <span className="text-slate-400 text-lg font-medium">classes attended</span></span>
                ) : (
                  <span className="text-slate-400 text-base font-medium">No information available yet</span>
                )}
              </h3>
              <p className="text-slate-400 text-xs mt-2">Streak tracking coming soon</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-8 space-y-8">
              {/* Training Schedule */}
              <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-bold text-lg">Upcoming Training</h3>
                </div>
                <div className="p-8 flex flex-col items-center justify-center text-center text-slate-500">
                  <Clock className="size-12 mb-3 text-slate-300" />
                  <p className="font-medium">No upcoming sessions</p>
                  <p className="text-sm mt-1">Schedule information will appear here when available.</p>
                </div>
              </section>

              {/* Recent Activity */}
              <section>
                <h3 className="font-bold text-lg mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {recentActivityFromAttendance.length > 0 ? (
                    recentActivityFromAttendance.map((activity, i) => (
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
                    ))
                  ) : (
                    <div className="flex gap-4 p-6 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="size-10 rounded-full flex items-center justify-center shrink-0 bg-slate-200 text-slate-400">
                        <Info className="size-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-600">No recent activity</p>
                        <p className="text-sm text-slate-500 mt-0.5">Your attendance and activity will appear here.</p>
                      </div>
                    </div>
                  )}
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
                <div className="relative z-10">
                  {openFeeRequests.length > 0 ? (
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <p className="text-sm font-semibold text-white">New fee notification</p>
                      <p className="mt-1 text-xs text-slate-300">
                        You have {openFeeRequests.length} pending fee request{openFeeRequests.length > 1 ? 's' : ''}.
                      </p>
                      <Link
                        to="/fees"
                        className="mt-3 inline-flex rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-primary/90"
                      >
                        Go to Fee Information
                      </Link>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                      <p className="text-sm text-slate-400">No notices at the moment.</p>
                      <p className="text-xs text-slate-500 mt-1">Important updates will appear here.</p>
                    </div>
                  )}
                </div>
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
  );
}
