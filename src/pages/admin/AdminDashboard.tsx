import React from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  TrendingUp,
  Users,
  MapPin,
  UserCheck,
  UserPlus,
  Radio,
  Wallet,
  CircleCheckBig,
  CircleX,
  Hourglass,
  ClipboardList,
} from 'lucide-react';
import { studentService, type StudentDashboardStats } from '../../services/studentService';
import { feesService, type FeeRequestDTO, type PaymentSubmissionDTO } from '../../services/feesService';
import { trainingCenterService } from '../../services/trainingCenterService';

function formatINRFromPaise(paise: number) {
  const rupees = paise / 100;
  return rupees.toLocaleString('en-IN', { style: 'currency', currency: 'INR' });
}
import { AdminErrorState } from '../../components/admin/ui/AdminErrorState';
import { AdminStatCard } from '../../components/admin/dashboard/AdminStatCard';
import { AdminWidgetCard } from '../../components/admin/dashboard/AdminWidgetCard';
import { AdminPendingActions, type PendingActionRow } from '../../components/admin/dashboard/AdminPendingActions';
import { AdminOperationalQueue, type OperationalQueueRow } from '../../components/admin/dashboard/AdminOperationalQueue';
import { AdminProgressRadialChart } from '../../components/admin/dashboard/AdminProgressRadialChart';
import { AdminMonthlyInsights, type MonthlyInsightRow } from '../../components/admin/dashboard/AdminMonthlyInsights';
import { AdminStudentAnalyticsChart } from '../../components/admin/dashboard/AdminStudentAnalyticsChart';
import { AdminFeeStatusChart } from '../../components/admin/dashboard/AdminFeeStatusChart';
import { AdminStudentFeeStatusCard } from '../../components/admin/dashboard/AdminStudentFeeStatusCard';
import { AdminImportMenu } from '../../components/admin/dashboard/AdminImportMenu';

export default function AdminDashboard() {
  const [studentStats, setStudentStats] = React.useState<StudentDashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = React.useState(true);
  const [statsError, setStatsError] = React.useState<string | null>(null);
  const [feeRequests, setFeeRequests] = React.useState<FeeRequestDTO[]>([]);
  const [submissions, setSubmissions] = React.useState<PaymentSubmissionDTO[]>([]);
  const [feesLoading, setFeesLoading] = React.useState(true);
  const [feesError, setFeesError] = React.useState<string | null>(null);
  const [centersCount, setCentersCount] = React.useState<number | null>(null);
  const [centersLoading, setCentersLoading] = React.useState(true);

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

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setCentersLoading(true);
        const data = await trainingCenterService.getAllTrainingCenters();
        if (!alive) return;
        setCentersCount(Array.isArray(data) ? data.length : 0);
      } catch {
        if (!alive) return;
        setCentersCount(null);
      } finally {
        if (alive) setCentersLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const totalFeeRequests = feeRequests.length;
  const pendingPaymentCount = feeRequests.filter((r) => {
    const status = r.computed_status ?? r.status;
    return status === 'ISSUED' || status === 'OVERDUE';
  }).length;
  const pendingReviewCount = submissions.filter((s) => s.status === 'SUBMITTED' || s.status === 'NEEDS_INFO').length;
  const acceptedPaymentsCount = submissions.filter((s) => s.status === 'VERIFIED').length;
  const rejectedPaymentsCount = submissions.filter((s) => s.status === 'REJECTED').length;

  const registered = studentStats?.registered ?? 0;
  const approved = studentStats?.approved ?? 0;
  const activePortal = studentStats?.active_portal ?? 0;
  const trainingCentersValue: number | string =
    centersLoading ? '—' : centersCount ?? '—';

  const centersNum = typeof trainingCentersValue === 'number' ? trainingCentersValue : 0;

  const verifiedRevenuePaise = submissions.reduce((total, submission) => {
    if (submission.status !== 'VERIFIED') return total;
    const fee = feeRequests.find((r) => r.id === submission.fee_request_id);
    return total + (fee?.amount_paise ?? 0);
  }, 0);
  const verifiedRevenueLabel = feesLoading
    ? '—'
    : verifiedRevenuePaise > 0
      ? formatINRFromPaise(verifiedRevenuePaise)
      : '₹0';

  const studentChartData = [
    { name: 'Registered', value: registered, fill: '#ea580c' },
    { name: 'Approved', value: approved, fill: '#059669' },
    { name: 'Active', value: activePortal, fill: '#f59e0b' },
    { name: 'Centers', value: centersNum, fill: '#64748b' },
  ];

  const feePipelineChartData = [
    { name: 'Raised', count: totalFeeRequests, fill: '#8b5cf6' },
    { name: 'Pending pay', count: pendingPaymentCount, fill: '#f59e0b' },
    { name: 'In review', count: pendingReviewCount, fill: '#0ea5e9' },
    { name: 'Accepted', count: acceptedPaymentsCount, fill: '#10b981' },
    { name: 'Rejected', count: rejectedPaymentsCount, fill: '#f43f5e' },
  ];

  const pendingRows: PendingActionRow[] = [
    { label: 'Fee Requests Raised', value: totalFeeRequests, icon: ClipboardList, accent: 'violet' },
    { label: 'Pending Payment', value: pendingPaymentCount, icon: Wallet, accent: 'amber' },
    { label: 'Pending Review', value: pendingReviewCount, icon: Hourglass, accent: 'blue' },
    { label: 'Accepted Payments', value: acceptedPaymentsCount, icon: CircleCheckBig, accent: 'emerald' },
    { label: 'Rejected Payments', value: rejectedPaymentsCount, icon: CircleX, accent: 'rose' },
  ];

  const operationalRows: OperationalQueueRow[] = [
    {
      title: 'Review fee requests',
      detail: `${totalFeeRequests} request${totalFeeRequests === 1 ? '' : 's'} raised`,
      statusLabel: totalFeeRequests > 0 ? 'Needs review' : 'Clear',
      statusTone: totalFeeRequests > 0 ? 'warning' : 'success',
      icon: ClipboardList,
    },
    {
      title: 'Student approvals',
      detail: statsLoading ? 'Loading registration counts…' : `${approved} approved of ${registered} registered`,
      statusLabel: statsLoading ? '…' : registered > 0 && approved === registered ? 'Complete' : 'In progress',
      statusTone: statsLoading ? 'neutral' : registered > 0 && approved === registered ? 'success' : 'info',
      icon: UserCheck,
    },
    {
      title: 'Portal activity',
      detail: statsLoading ? 'Loading portal activity…' : `${activePortal} active students currently estimated`,
      statusLabel: 'Monitor',
      statusTone: 'neutral',
      icon: Radio,
    },
    {
      title: 'Training center data',
      detail: `${trainingCentersValue} centers listed`,
      statusLabel: 'Keep updated',
      statusTone: 'neutral',
      icon: MapPin,
    },
  ];

  const monthlyRows: MonthlyInsightRow[] = [
    {
      label: 'Verified Revenue',
      value: verifiedRevenueLabel,
      detail:
        verifiedRevenuePaise > 0
          ? `${acceptedPaymentsCount} verified payment${acceptedPaymentsCount === 1 ? '' : 's'} recorded`
          : 'No verified payment revenue recorded yet',
      icon: TrendingUp,
      color: 'text-rose-600',
      bg: 'bg-rose-100',
    },
    {
      label: 'Active Students',
      value: activePortal,
      detail: 'Live active portal count from student records',
      icon: Users,
      color: 'text-sky-600',
      bg: 'bg-sky-100',
    },
    {
      label: 'Centers',
      value: trainingCentersValue,
      detail: 'Training center coverage from available records',
      icon: Building2,
      color: 'text-amber-600',
      bg: 'bg-amber-100',
    },
  ];

  return (
    <div className="min-w-0 space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
          <>
            <Link
              to="/admin/students"
              className="inline-flex w-full min-w-0 items-center justify-center rounded-[var(--admin-radius-control)] bg-[var(--admin-primary)] px-4 py-2.5 text-center text-sm font-bold text-white shadow-sm transition-colors hover:bg-[var(--admin-primary-hover)] sm:w-auto font-['Space_Grotesk',sans-serif]"
            >
              <span className="md:hidden">Students</span>
              <span className="hidden md:inline">View Students</span>
            </Link>
            <AdminImportMenu variant="dropdown" className="w-full min-w-0 sm:w-auto" />
          </>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        <AdminStatCard
          featured
          title="Registered Students"
          value={statsLoading ? '—' : statsError ? '—' : registered}
          description="Total student records in the system"
          accent="violet"
          icon={<UserPlus className="size-5" />}
        />
        <AdminStatCard
          title="Approved Students"
          value={statsLoading ? '—' : statsError ? '—' : approved}
          description="Students approved for portal readiness"
          accent="emerald"
          icon={<UserCheck className="size-5" />}
        />
        <AdminStatCard
          title="Active in Portal"
          value={statsLoading ? '—' : statsError ? '—' : activePortal}
          description={
            statsLoading || statsError
              ? 'Students recently active in the portal'
              : `Students recently active in the portal (last ${studentStats?.active_within_minutes ?? '—'} min estimate).`
          }
          accent="amber"
          icon={<Radio className="size-5" />}
        />
        <AdminStatCard
          title="Training Centers"
          value={trainingCentersValue}
          description="Active training centers across regions"
          accent="orange"
          icon={<MapPin className="size-5" />}
        />
      </div>

      {statsError ? <AdminErrorState message={statsError} /> : null}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
        <div className="lg:col-span-5">
          <AdminWidgetCard
            title="Student Analytics"
            subtitle="Registration, approval, and portal activity overview"
            className="h-full"
          >
            <AdminStudentAnalyticsChart
              data={studentChartData}
              footnote="Current operational distribution from live counts — not a historical time series."
            />
          </AdminWidgetCard>
        </div>
        <div className="lg:col-span-4">
          <AdminPendingActions className="h-full" rows={pendingRows} loading={feesLoading} />
        </div>
        <div className="lg:col-span-3">
          <AdminOperationalQueue className="h-full" rows={operationalRows} />
        </div>
      </div>

      <AdminWidgetCard
        title="Fee pipeline overview"
        subtitle="Raised, pending, review, and settlement counts"
        className="rounded-3xl"
      >
        <AdminFeeStatusChart data={feePipelineChartData} />
      </AdminWidgetCard>

      {feesError ? <AdminErrorState message={feesError} /> : null}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
        <div className="lg:col-span-5">
          <AdminStudentFeeStatusCard
            feeRequests={feeRequests}
            loading={feesLoading}
            error={feesError}
            maxRows={6}
          />
        </div>
        <div className="lg:col-span-4">
          <AdminProgressRadialChart registered={registered} approved={approved} activePortal={activePortal} />
        </div>
        <div className="lg:col-span-3">
          <AdminMonthlyInsights rows={monthlyRows} />
        </div>
      </div>
    </div>
  );
}
