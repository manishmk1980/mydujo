import React from 'react';
import { LayoutDashboard, TrendingUp, Users, MapPin, GraduationCap, UserCheck, UserPlus, Radio, ReceiptText, Wallet, CircleCheckBig, CircleX, Hourglass } from 'lucide-react';
import { studentService, type StudentDashboardStats } from '../../services/studentService';
import { feesService, type FeeRequestDTO, type PaymentSubmissionDTO } from '../../services/feesService';

export default function AdminDashboard() {
  const [studentStats, setStudentStats] = React.useState<StudentDashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = React.useState(true);
  const [statsError, setStatsError] = React.useState<string | null>(null);
  const [feeRequests, setFeeRequests] = React.useState<FeeRequestDTO[]>([]);
  const [submissions, setSubmissions] = React.useState<PaymentSubmissionDTO[]>([]);
  const [feesLoading, setFeesLoading] = React.useState(true);
  const [feesError, setFeesError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setStatsLoading(true);
        const data = await studentService.getDashboardStudentStats();
        if (!alive) return;
        setStudentStats(data);
        setStatsError(null);
      } catch (e) {
        if (!alive) return;
        setStatsError(e instanceof Error ? e.message : 'Failed to load student stats');
        setStudentStats(null);
      } finally {
        if (alive) setStatsLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setFeesLoading(true);
        const [allFeeRequests, allSubmissions] = await Promise.all([
          feesService.listFeeRequests(),
          feesService.listSubmissions(),
        ]);
        if (!alive) return;
        setFeeRequests(allFeeRequests);
        setSubmissions(allSubmissions);
        setFeesError(null);
      } catch (e) {
        if (!alive) return;
        setFeesError(e instanceof Error ? e.message : 'Failed to load fee KPIs');
        setFeeRequests([]);
        setSubmissions([]);
      } finally {
        if (alive) setFeesLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const stats = [
    { label: 'Total Revenue', value: '₹12.4L', icon: TrendingUp, color: 'text-rose-600', bg: 'bg-rose-100' },
    { label: 'Active Students', value: '842', icon: Users, color: 'text-sky-600', bg: 'bg-sky-100' },
    { label: 'Training Centers', value: '12', icon: MapPin, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Top Instructor', value: 'Sensei Joe', icon: GraduationCap, color: 'text-rose-600', bg: 'bg-rose-100' },
  ];

  const totalFeeRequests = feeRequests.length;
  const pendingPaymentCount = feeRequests.filter((r) => {
    const status = r.computed_status ?? r.status;
    return status === 'ISSUED' || status === 'OVERDUE';
  }).length;
  const pendingReviewCount = submissions.filter((s) => s.status === 'SUBMITTED' || s.status === 'NEEDS_INFO').length;
  const acceptedPaymentsCount = submissions.filter((s) => s.status === 'VERIFIED').length;
  const rejectedPaymentsCount = submissions.filter((s) => s.status === 'REJECTED').length;

  const feeKpis = [
    {
      label: 'Fee Requests Raised',
      value: feesLoading ? '—' : totalFeeRequests.toString(),
      hint: 'All fee requests issued/drafted for students',
      icon: ReceiptText,
      color: 'text-indigo-700',
      bg: 'bg-indigo-100',
    },
    {
      label: 'Pending Payment',
      value: feesLoading ? '—' : pendingPaymentCount.toString(),
      hint: 'ISSUED or OVERDUE requests not yet settled',
      icon: Wallet,
      color: 'text-amber-700',
      bg: 'bg-amber-100',
    },
    {
      label: 'Pending Review',
      value: feesLoading ? '—' : pendingReviewCount.toString(),
      hint: 'Submitted payments awaiting admin closure',
      icon: Hourglass,
      color: 'text-sky-700',
      bg: 'bg-sky-100',
    },
    {
      label: 'Accepted Payments',
      value: feesLoading ? '—' : acceptedPaymentsCount.toString(),
      hint: 'Submissions marked VERIFIED',
      icon: CircleCheckBig,
      color: 'text-emerald-700',
      bg: 'bg-emerald-100',
    },
    {
      label: 'Rejected Payments',
      value: feesLoading ? '—' : rejectedPaymentsCount.toString(),
      hint: 'Submissions marked REJECTED',
      icon: CircleX,
      color: 'text-rose-700',
      bg: 'bg-rose-100',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">DASHBOARD</h1>
        <p className="text-slate-500 mt-1">Real-time performance matrices and academy overview</p>
      </div>

      <section className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Student matrix</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Registration pipeline and approximate portal activity (students calling the app while logged in).
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-2xl bg-violet-100 text-violet-700">
                <UserPlus className="size-6" />
              </div>
            </div>
            <p className="text-3xl font-black text-slate-900 leading-none tabular-nums">
              {statsLoading ? '—' : statsError ? '—' : (studentStats?.registered ?? 0)}
            </p>
            <p className="text-sm font-bold text-slate-500 mt-2">Registered</p>
            <p className="text-xs text-slate-400 mt-1">All student records in the system</p>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-700">
                <UserCheck className="size-6" />
              </div>
            </div>
            <p className="text-3xl font-black text-slate-900 leading-none tabular-nums">
              {statsLoading ? '—' : statsError ? '—' : (studentStats?.approved ?? 0)}
            </p>
            <p className="text-sm font-bold text-slate-500 mt-2">Approved</p>
            <p className="text-xs text-slate-400 mt-1">Status approved (can use the student portal when linked)</p>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-2xl bg-amber-100 text-amber-700">
                <Radio className="size-6" />
              </div>
            </div>
            <p className="text-3xl font-black text-slate-900 leading-none tabular-nums">
              {statsLoading ? '—' : statsError ? '—' : (studentStats?.active_portal ?? 0)}
            </p>
            <p className="text-sm font-bold text-slate-500 mt-2">Active in portal</p>
            <p className="text-xs text-slate-400 mt-1">
              Approved students with login, seen using the API in the last{' '}
              {studentStats?.active_within_minutes ?? '—'} min (server-side estimate; resets if API restarts).
            </p>
          </div>
        </div>
        {statsError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{statsError}</div>
        ) : null}
      </section>

      <section className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Fee KPI Matrix</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Crucial fee-request and payment-review counts for operations visibility.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
          {feeKpis.map((kpi) => (
            <div key={kpi.label} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl ${kpi.bg} ${kpi.color}`}>
                  <kpi.icon className="size-6" />
                </div>
              </div>
              <p className="text-3xl font-black text-slate-900 leading-none tabular-nums">{kpi.value}</p>
              <p className="text-sm font-bold text-slate-500 mt-2">{kpi.label}</p>
              <p className="text-xs text-slate-400 mt-1">{kpi.hint}</p>
            </div>
          ))}
        </div>
        {feesError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{feesError}</div>
        ) : null}
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon className="size-6" />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">Monthly</span>
            </div>
            <p className="text-3xl font-black text-slate-900 leading-none">{stat.value}</p>
            <p className="text-sm font-bold text-slate-500 mt-2">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm h-64 flex items-center justify-center">
          <p className="text-slate-400 font-bold uppercase tracking-widest italic">Revenue Flow Chart Placeholder</p>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm h-64 flex items-center justify-center">
          <p className="text-slate-400 font-bold uppercase tracking-widest italic">Enrollment Trends Placeholder</p>
        </div>
      </div>
    </div>
  );
}
