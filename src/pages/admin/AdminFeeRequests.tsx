import React from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  CalendarDays,
  Eye,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UserPlus,
  X,
} from 'lucide-react';
import { PageContainer } from '../../components/layout/PageContainer';
import { AdminPageHeader } from '../../components/admin/ui/AdminPageHeader';
import { AdminErrorState } from '../../components/admin/ui/AdminErrorState';
import { AdminLoadingState } from '../../components/admin/ui/AdminLoadingState';
import { AdminEmptyState } from '../../components/admin/ui/AdminEmptyState';
import { useAdminConfirm } from '../../components/admin/ui/AdminConfirmProvider';
import { AttachmentPreviewModal } from '../../components/ui/AttachmentPreviewModal';
import { feesService, type FeeRequestDTO, type FeeRequestStatus, type PaymentSubmissionDTO } from '../../services/feesService';
import { studentService, type DBStudent } from '../../services/studentService';
import { resolveAttachmentUrl } from '../../utils/attachments';

function formatINRFromPaise(paise: number) {
  const rupees = paise / 100;
  return rupees.toLocaleString('en-IN', { style: 'currency', currency: 'INR' });
}

function formatMonthYear(year: number, monthIndex: number) {
  const d = new Date(Date.UTC(year, monthIndex, 1));
  if (Number.isNaN(d.getTime())) return 'Unknown period';
  return d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

function formatDateForLabel(dateStr?: string | null) {
  if (!dateStr) return 'N/A';
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatFeeRequestPeriod(dateStr?: string | null) {
  if (!dateStr) return 'N/A';
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return 'N/A';
  return d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }).replace(' ', '-');
}

function formatDateWithOrdinal(dateStr?: string | null) {
  if (!dateStr) return 'N/A';
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return 'N/A';
  const day = d.getDate();
  const mod10 = day % 10;
  const mod100 = day % 100;
  const suffix = mod10 === 1 && mod100 !== 11 ? 'st' : mod10 === 2 && mod100 !== 12 ? 'nd' : mod10 === 3 && mod100 !== 13 ? 'rd' : 'th';
  const monthYear = d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
  return `${day}${suffix} ${monthYear}`;
}

function formatRequestedBy(displayName?: string | null, email?: string | null) {
  const normalizedDisplayName = typeof displayName === 'string' ? displayName.trim() : '';
  if (normalizedDisplayName) return normalizedDisplayName;
  const normalized = typeof email === 'string' ? email.trim() : '';
  return normalized || 'Admin';
}

function toStatusLabel(status: string) {
  return status.replace(/_/g, ' ');
}

function getFeeStatusBadgeClass(status: string) {
  if (status === 'PAID') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (status === 'ISSUED') return 'bg-blue-50 text-blue-700 border-blue-200';
  if (status === 'REJECTED') return 'bg-red-50 text-red-700 border-red-200';
  if (status === 'OVERDUE')
    return 'border-[color-mix(in_srgb,var(--admin-warning)_35%,var(--admin-border))] bg-[color-mix(in_srgb,var(--admin-warning)_12%,transparent)] text-[var(--admin-warning)]';
  if (status === 'CANCELLED') return 'bg-slate-100 text-slate-600 border-slate-200';
  return 'bg-slate-50 text-slate-700 border-slate-200';
}

function getPaymentStatusBadgeClass(status: string) {
  if (status === 'VERIFIED') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (status === 'SUBMITTED') return 'bg-blue-50 text-blue-700 border-blue-200';
  if (status === 'REJECTED') return 'bg-red-50 text-red-700 border-red-200';
  if (status === 'NEEDS_INFO') return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-slate-50 text-slate-700 border-slate-200';
}

function parseDateParts(isoDate: string) {
  const [y, m, d] = isoDate.split('-').map((v) => Number(v));
  return {
    year: Number.isFinite(y) ? y : new Date().getFullYear(),
    monthIndex: Number.isFinite(m) ? m - 1 : new Date().getMonth(),
    day: Number.isFinite(d) ? d : new Date().getDate(),
  };
}

/** Calendar date in local timezone as YYYY-MM-DD (avoids UTC off-by-one from toISOString). */
function buildDateFromParts(year: number, monthIndex: number, day: number) {
  const max = getDaysInMonth(year, monthIndex);
  const dayInRange = Math.max(1, Math.min(max, day));
  const dt = new Date(year, monthIndex, dayInRange);
  const y = dt.getFullYear();
  const m = dt.getMonth();
  const d = dt.getDate();
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function getDaysInMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function startOfLocalDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addLocalDays(d: Date, n: number) {
  const t = startOfLocalDay(d);
  return new Date(t.getFullYear(), t.getMonth(), t.getDate() + n);
}

function defaultDueDatePartsAfterDays(daysFromToday: number) {
  const t = addLocalDays(new Date(), daysFromToday);
  return { year: t.getFullYear(), monthIndex: t.getMonth(), day: t.getDate() };
}

/** Day-of-month numbers that are on or after today (local) for the given calendar month. */
function getValidDueDayNumbers(year: number, monthIndex: number, todayStart: Date) {
  const max = getDaysInMonth(year, monthIndex);
  const out: number[] = [];
  for (let d = 1; d <= max; d += 1) {
    const cand = new Date(year, monthIndex, d);
    if (cand >= todayStart) out.push(d);
  }
  return out;
}

const MONTH_OPTIONS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const FEE_TYPE_OPTIONS = [
  { id: 'WHITE_BELT', label: 'White Belt', amountRupees: 200 },
  { id: 'COLOUR_BELT', label: 'Colour Belt', amountRupees: 300 },
  { id: 'BLACK_BELT', label: 'Black Belt', amountRupees: 500 },
] as const;

type FeeTypeOptionId = typeof FEE_TYPE_OPTIONS[number]['id'];

function normalizeBeltGrade(value?: string | null): FeeTypeOptionId | null {
  if (value === 'WHITE_BELT' || value === 'COLOUR_BELT' || value === 'BLACK_BELT') return value;
  return null;
}

function getAmountByBeltGrade(value?: string | null): number | null {
  const belt = normalizeBeltGrade(value);
  const option = FEE_TYPE_OPTIONS.find((opt) => opt.id === belt);
  return option ? option.amountRupees : null;
}

function formatBeltGradeLabel(value?: string | null) {
  const belt = normalizeBeltGrade(value);
  const option = FEE_TYPE_OPTIONS.find((opt) => opt.id === belt);
  return option?.label ?? 'No Belt';
}

export default function AdminFeeRequests() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [items, setItems] = React.useState<FeeRequestDTO[]>([]);
  const [submissionsByFeeId, setSubmissionsByFeeId] = React.useState<Record<string, PaymentSubmissionDTO | null>>({});
  const [students, setStudents] = React.useState<DBStudent[]>([]);

  const [studentId, setStudentId] = React.useState(() => searchParams.get('studentId')?.trim() ?? '');
  const [selectedStudentIds, setSelectedStudentIds] = React.useState<string[]>([]);
  const [studentSearchQuery, setStudentSearchQuery] = React.useState('');
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [isSubmittingCreate, setIsSubmittingCreate] = React.useState(false);
  const [detailsItem, setDetailsItem] = React.useState<FeeRequestDTO | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const confirm = useAdminConfirm();
  const now = new Date();
  const initialDue = defaultDueDatePartsAfterDays(10);
  const [periodMonthIndex, setPeriodMonthIndex] = React.useState(now.getMonth());
  const [periodYear, setPeriodYear] = React.useState(now.getFullYear());
  const [dueYear, setDueYear] = React.useState(initialDue.year);
  const [dueMonthIndex, setDueMonthIndex] = React.useState(initialDue.monthIndex);
  const [dueDay, setDueDay] = React.useState(initialDue.day);
  const [amountRupees, setAmountRupees] = React.useState(2000);
  const [selectedFeeType, setSelectedFeeType] = React.useState<FeeTypeOptionId | ''>('');
  const [status, setStatus] = React.useState<FeeRequestStatus>('ISSUED');
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editMonthIndex, setEditMonthIndex] = React.useState(now.getMonth());
  const [editYear, setEditYear] = React.useState(now.getFullYear());
  const [editDueDay, setEditDueDay] = React.useState(1);
  const [editAmountRupees, setEditAmountRupees] = React.useState(2000);
  const [editStatus, setEditStatus] = React.useState<FeeRequestStatus>('DRAFT');

  React.useEffect(() => {
    const prefillStudentId = searchParams.get('studentId')?.trim();
    if (prefillStudentId) setStudentId(prefillStudentId);
    if (prefillStudentId) {
      setSelectedStudentIds((prev) => (prev.includes(prefillStudentId) ? prev : [prefillStudentId, ...prev]));
    }
  }, [searchParams]);

  const loadStudents = async () => {
    const rows = await studentService.getAllStudents();
    setStudents(rows);
  };

  const loadFeeRequests = React.useCallback(async (sid: string, abortSignal?: AbortSignal) => {
    try {
      setLoading(true);
      const normalizedStudentId = sid.trim();
      const [rows, submissions] = await Promise.all([
        feesService.listFeeRequests(normalizedStudentId ? { studentId: normalizedStudentId } : undefined),
        feesService.listSubmissions(),
      ]);
      if (abortSignal?.aborted) return;
      setItems(rows);
      const latestByFee: Record<string, PaymentSubmissionDTO | null> = {};
      for (const submission of submissions) {
        const current = latestByFee[submission.fee_request_id];
        if (!current) {
          latestByFee[submission.fee_request_id] = submission;
          continue;
        }
        const currentTs = new Date(current.created_at ?? 0).getTime();
        const nextTs = new Date(submission.created_at ?? 0).getTime();
        if (nextTs >= currentTs) {
          latestByFee[submission.fee_request_id] = submission;
        }
      }
      setSubmissionsByFeeId(latestByFee);
      setError(null);
    } catch (e) {
      if (abortSignal?.aborted) return;
      setError(e instanceof Error ? e.message : 'Failed to load fee requests');
    } finally {
      if (!abortSignal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  React.useEffect(() => {
    loadStudents().catch(console.error);
  }, []);

  React.useEffect(() => {
    const abortController = new AbortController();
    const timer = setTimeout(() => {
      loadFeeRequests(studentId, abortController.signal);
    }, 300);
    return () => {
      clearTimeout(timer);
      abortController.abort();
    };
  }, [studentId, loadFeeRequests]);

  const dueDate = React.useMemo(
    () => buildDateFromParts(dueYear, dueMonthIndex, dueDay),
    [dueYear, dueMonthIndex, dueDay]
  );
  const feeTitle = React.useMemo(
    () => `Fee Request for: ${formatMonthYear(periodYear, periodMonthIndex)}`,
    [periodYear, periodMonthIndex]
  );
  const dueDateForEdit = React.useMemo(
    () => buildDateFromParts(editYear, editMonthIndex, editDueDay),
    [editYear, editMonthIndex, editDueDay]
  );
  const editFeeTitle = React.useMemo(
    () => `Fee Request for: ${formatMonthYear(editYear, editMonthIndex)}`,
    [editYear, editMonthIndex]
  );

  const yearOptions = React.useMemo(() => {
    const years: number[] = [];
    const y0 = new Date().getFullYear();
    for (let y = y0 - 1; y <= y0 + 2; y += 1) years.push(y);
    return years;
  }, []);

  const dueYearOptions = React.useMemo(() => {
    const years: number[] = [];
    const y0 = new Date().getFullYear();
    for (let y = y0; y <= y0 + 3; y += 1) years.push(y);
    return years;
  }, []);

  const selectedStudents = React.useMemo(
    () => selectedStudentIds.map((id) => students.find((s) => s.id === id)).filter(Boolean) as DBStudent[],
    [selectedStudentIds, students]
  );
  const selectedBelts = React.useMemo(
    () => [...new Set(selectedStudents.map((s) => normalizeBeltGrade(s.belt_grade)).filter(Boolean))] as FeeTypeOptionId[],
    [selectedStudents]
  );
  const hasMixedSelectedBelts = selectedBelts.length > 1;
  const selectedStudentNameFromUrl = searchParams.get('studentName')?.trim() ?? '';
  const highlightedStudent = React.useMemo(
    () => (studentId.trim() ? students.find((s) => s.id === studentId.trim()) ?? null : null),
    [studentId, students]
  );
  const highlightedStudentName = highlightedStudent?.full_name || selectedStudentNameFromUrl || '';
  const filteredStudents = React.useMemo(() => {
    const q = studentSearchQuery.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s) => {
      const hay = `${s.full_name} ${s.email} ${s.id}`.toLowerCase();
      return hay.includes(q);
    });
  }, [students, studentSearchQuery]);

  const dueValidDays = React.useMemo(() => {
    const t0 = startOfLocalDay(new Date());
    return getValidDueDayNumbers(dueYear, dueMonthIndex, t0);
  }, [dueYear, dueMonthIndex]);

  React.useEffect(() => {
    const t0 = startOfLocalDay(new Date());
    let y = dueYear;
    let m = dueMonthIndex;
    let days = getValidDueDayNumbers(y, m, t0);
    let guard = 0;
    while (days.length === 0 && guard < 48) {
      guard += 1;
      m += 1;
      if (m > 11) {
        m = 0;
        y += 1;
      }
      days = getValidDueDayNumbers(y, m, t0);
    }
    if (guard > 0 && days.length > 0) {
      setDueYear(y);
      setDueMonthIndex(m);
      setDueDay(days[0]!);
      return;
    }
    if (days.length > 0 && !days.includes(dueDay)) {
      setDueDay(days[0]!);
    }
  }, [dueYear, dueMonthIndex, dueDay]);

  const editDayOptions = React.useMemo(() => {
    const max = getDaysInMonth(editYear, editMonthIndex);
    return Array.from({ length: max }, (_, i) => i + 1);
  }, [editYear, editMonthIndex]);

  React.useEffect(() => {
    const max = getDaysInMonth(editYear, editMonthIndex);
    if (editDueDay > max) setEditDueDay(max);
  }, [editYear, editMonthIndex, editDueDay]);

  React.useEffect(() => {
    if (selectedStudents.length === 0) return;
    if (hasMixedSelectedBelts) return;

    const belt = selectedBelts[0];
    if (!belt) return;
    const amount = getAmountByBeltGrade(belt);
    if (!amount) return;

    setSelectedFeeType(belt);
    setAmountRupees(amount);
  }, [selectedStudents, selectedBelts, hasMixedSelectedBelts]);

  const confirmDeleteFeeRequest = async (r: FeeRequestDTO) => {
    const ok = await confirm({
      title: 'Delete record?',
      description: `Student: ${r.student_name ?? 'student'}. Period: ${formatFeeRequestPeriod(r.due_date)}. Amount: ${formatINRFromPaise(r.amount_paise)}. This action cannot be undone. Please confirm before deleting this record.`,
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      setError(null);
      await feesService.deleteFeeRequest(r.id);
      await loadFeeRequests(studentId);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete fee request');
    }
  };

  return (
    <PageContainer>
      <AdminPageHeader
        title="Fee Requests"
        subtitle="Create and manage fee requests for students."
      />

      {error ? <AdminErrorState message={error} className="mb-4" /> : null}

      <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="text-sm font-bold text-slate-900">Create fee request</div>
          <div className="text-xs text-slate-500">Generate requests for one or many students.</div>
        </div>
        <div className="flex w-full min-w-0 flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
          {highlightedStudentName ? (
            <div className="inline-flex min-w-0 max-w-full items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 sm:max-w-[280px]">
              <UserPlus className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{highlightedStudentName}</span>
            </div>
          ) : null}
          <button
            type="button"
            onClick={() => {
              const n = new Date();
              const d = defaultDueDatePartsAfterDays(10);
              setPeriodMonthIndex(n.getMonth());
              setPeriodYear(n.getFullYear());
              setDueYear(d.year);
              setDueMonthIndex(d.monthIndex);
              setDueDay(d.day);
              setIsCreateOpen(true);
            }}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[var(--admin-primary)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--admin-primary-hover)] sm:w-auto"
          >
            <Plus className="h-4 w-4 shrink-0" />
            <span className="truncate">Create Fee Request</span>
          </button>
        </div>
      </div>

      <div className="mt-4 min-w-0 rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-2 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 text-sm font-bold text-slate-900">Recent requests</div>
          <button
            type="button"
            onClick={async () => {
              try {
                setLoading(true);
                await loadFeeRequests(studentId);
              } catch (e) {
                setError(e instanceof Error ? e.message : 'Failed to refresh');
              } finally {
                setLoading(false);
              }
            }}
            className="inline-flex shrink-0 items-center gap-1 self-start text-sm font-semibold text-[var(--admin-primary)] hover:underline sm:self-auto"
          >
            <RefreshCw className="h-4 w-4 shrink-0" />
            Refresh
          </button>
        </div>
        <div className="overflow-x-auto">
          {loading ? <AdminLoadingState label="Loading fee requests…" className="py-10" /> : null}
          {!loading && items.length === 0 ? (
            <AdminEmptyState
              title={studentId.trim() ? 'No fee requests for this student' : 'No fee requests yet'}
              description={
                studentId.trim()
                  ? 'Create a fee request to start billing this student.'
                  : 'Generated fee requests will appear here once you raise them.'
              }
            />
          ) : null}
          {!loading && items.length > 0 ? (() => {
            const renderEditForm = (r: FeeRequestDTO) => (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 grid gap-2 sm:grid-cols-5">
                <select value={editMonthIndex} onChange={(ev) => setEditMonthIndex(Number(ev.target.value))} className="min-h-11 w-full rounded border border-slate-200 px-2 py-1 text-sm">
                  {MONTH_OPTIONS.map((m, idx) => (
                    <option key={`edit-${m}`} value={idx}>{m}</option>
                  ))}
                </select>
                <select value={editYear} onChange={(ev) => setEditYear(Number(ev.target.value))} className="min-h-11 w-full rounded border border-slate-200 px-2 py-1 text-sm">
                  {yearOptions.map((y) => (
                    <option key={`edit-year-${y}`} value={y}>{y}</option>
                  ))}
                </select>
                <select value={editDueDay} onChange={(ev) => setEditDueDay(Number(ev.target.value))} className="min-h-11 w-full rounded border border-slate-200 px-2 py-1 text-sm">
                  {editDayOptions.map((d) => (
                    <option key={`edit-day-${d}`} value={d}>{d}</option>
                  ))}
                </select>
                <input type="number" min={1} value={editAmountRupees} onChange={(ev) => setEditAmountRupees(Number(ev.target.value))} className="min-h-11 w-full rounded border border-slate-200 px-2 py-1 text-sm" placeholder="Amount ₹" />
                <select value={editStatus} onChange={(ev) => setEditStatus(ev.target.value as FeeRequestStatus)} className="min-h-11 w-full rounded border border-slate-200 px-2 py-1 text-sm">
                  {['DRAFT', 'ISSUED', 'PAID', 'CANCELLED'].map((s) => (
                    <option key={`status-${s}`} value={s}>{s}</option>
                  ))}
                </select>
                <div className="break-words text-xs text-slate-600 sm:col-span-5">Title will be: {editFeeTitle} | Due: {formatDateForLabel(dueDateForEdit)}</div>
                <div className="flex flex-wrap gap-2 sm:col-span-5">
                  <button
                    type="button"
                    className="inline-flex min-h-11 items-center justify-center rounded bg-[var(--admin-primary)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--admin-primary-hover)]"
                    onClick={async () => {
                      try {
                        setError(null);
                        await feesService.updateFeeRequest(r.id, {
                          title: editFeeTitle,
                          dueDate: dueDateForEdit,
                          amountPaise: Math.round(editAmountRupees * 100),
                          status: editStatus,
                        });
                        setEditingId(null);
                        await loadFeeRequests(studentId);
                      } catch (e) {
                        setError(e instanceof Error ? e.message : 'Failed to update fee request');
                      }
                    }}
                  >
                    Save
                  </button>
                  <button type="button" className="inline-flex min-h-11 items-center justify-center rounded border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-white" onClick={() => setEditingId(null)}>
                    Cancel
                  </button>
                </div>
              </div>
            );

            const beginEdit = (r: FeeRequestDTO) => {
              const parts = parseDateParts(r.due_date);
              setEditingId(r.id);
              setEditMonthIndex(parts.monthIndex);
              setEditYear(parts.year);
              setEditDueDay(parts.day);
              setEditAmountRupees(Math.round(r.amount_paise / 100));
              setEditStatus(r.status);
            };

            return (
              <>
                {/* Mobile: stacked cards */}
                <ul className="divide-y divide-slate-100 sm:hidden">
                  {items.map((r) => {
                    const latestSubmission = submissionsByFeeId[r.id];
                    const feeStatus = r.computed_status ?? r.status;
                    const paymentStatus = latestSubmission?.status ?? (feeStatus === 'PAID' ? 'VERIFIED' : 'NO_SUBMISSION');
                    const isEditing = editingId === r.id;
                    return (
                      <li key={r.id} className="min-w-0 px-4 py-4">
                        <div className="flex flex-col gap-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold text-slate-900">{r.student_name ?? 'Unknown'}</p>
                              <p className="truncate text-xs text-slate-500">{r.student_email ?? 'N/A'}</p>
                            </div>
                            <div className="shrink-0 text-right">
                              <p className="text-sm font-bold text-slate-900">{formatINRFromPaise(r.amount_paise)}</p>
                              <p className="text-[10px] uppercase tracking-wide text-slate-400">Amount</p>
                            </div>
                          </div>

                          <dl className="grid grid-cols-2 gap-2 text-xs">
                            <div className="min-w-0">
                              <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">For</dt>
                              <dd className="break-words text-slate-700">{r.title || formatFeeRequestPeriod(r.due_date)}</dd>
                            </div>
                            <div className="min-w-0">
                              <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Due</dt>
                              <dd className="break-words text-slate-700">{formatDateWithOrdinal(r.due_date)}</dd>
                            </div>
                            <div className="min-w-0 col-span-2">
                              <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Requested by</dt>
                              <dd className="break-words text-slate-700">{formatRequestedBy(r.created_by_display_name, r.created_by_email)}</dd>
                            </div>
                          </dl>

                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`inline-flex rounded-full border px-2 py-1 text-[11px] font-semibold ${getFeeStatusBadgeClass(feeStatus)}`}>
                              {toStatusLabel(feeStatus)}
                            </span>
                            <span className={`inline-flex rounded-full border px-2 py-1 text-[11px] font-semibold ${getPaymentStatusBadgeClass(paymentStatus)}`}>
                              {toStatusLabel(paymentStatus)}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                              onClick={() => setDetailsItem(r)}
                            >
                              <Eye className="h-4 w-4" /> View
                            </button>
                            {feeStatus !== 'PAID' ? (
                              <>
                                <button
                                  type="button"
                                  className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                                  onClick={() => (isEditing ? setEditingId(null) : beginEdit(r))}
                                >
                                  <Pencil className="h-4 w-4" /> {isEditing ? 'Close' : 'Edit'}
                                </button>
                                <button
                                  type="button"
                                  className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-md border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                                  onClick={() => void confirmDeleteFeeRequest(r)}
                                >
                                  <Trash2 className="h-4 w-4" /> Delete
                                </button>
                              </>
                            ) : null}
                          </div>

                          {isEditing ? <div className="mt-1">{renderEditForm(r)}</div> : null}
                        </div>
                      </li>
                    );
                  })}
                </ul>

                {/* Desktop: full data table */}
                <div className="hidden overflow-x-auto sm:block">
                  <table className="min-w-[1150px] w-full text-sm">
                    <thead className="bg-slate-50 text-slate-700">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold">Student Name</th>
                        <th className="px-4 py-3 text-left font-semibold">Email</th>
                        <th className="px-4 py-3 text-left font-semibold">Fee Request for</th>
                        <th className="px-4 py-3 text-left font-semibold">Due Date</th>
                        <th className="px-4 py-3 text-left font-semibold">Fee Status</th>
                        <th className="px-4 py-3 text-left font-semibold">Payment Status</th>
                        <th className="px-4 py-3 text-left font-semibold">Requested by</th>
                        <th className="px-4 py-3 text-left font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {items.map((r) => {
                        const latestSubmission = submissionsByFeeId[r.id];
                        const feeStatus = r.computed_status ?? r.status;
                        const paymentStatus = latestSubmission?.status ?? (feeStatus === 'PAID' ? 'VERIFIED' : 'NO_SUBMISSION');
                        return (
                          <React.Fragment key={r.id}>
                            <tr className="align-top">
                              <td className="px-4 py-3 font-medium text-slate-900">{r.student_name ?? 'Unknown'}</td>
                              <td className="px-4 py-3 text-slate-600">{r.student_email ?? 'N/A'}</td>
                              <td className="px-4 py-3 text-slate-700">{r.title || formatFeeRequestPeriod(r.due_date)}</td>
                              <td className="px-4 py-3 text-slate-700">{formatDateWithOrdinal(r.due_date)}</td>
                              <td className="px-4 py-3 text-slate-700">
                                <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${getFeeStatusBadgeClass(feeStatus)}`}>
                                  {toStatusLabel(feeStatus)}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-slate-700">
                                <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${getPaymentStatusBadgeClass(paymentStatus)}`}>
                                  {toStatusLabel(paymentStatus)}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-slate-700">{formatRequestedBy(r.created_by_display_name, r.created_by_email)}</td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    title="View details"
                                    aria-label="View details"
                                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-700 hover:bg-slate-100"
                                    onClick={() => setDetailsItem(r)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </button>
                                  {feeStatus !== 'PAID' ? (
                                    <>
                                      <button
                                        type="button"
                                        title="Edit"
                                        aria-label="Edit"
                                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-700 hover:bg-slate-100"
                                        onClick={() => beginEdit(r)}
                                      >
                                        <Pencil className="h-4 w-4" />
                                      </button>
                                      <button
                                        type="button"
                                        title="Delete"
                                        aria-label="Delete"
                                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-red-200 text-red-600 hover:bg-red-50"
                                        onClick={() => void confirmDeleteFeeRequest(r)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </>
                                  ) : null}
                                </div>
                              </td>
                            </tr>
                            {editingId === r.id ? (
                              <tr>
                                <td colSpan={8} className="px-4 pb-4">
                                  {renderEditForm(r)}
                                </td>
                              </tr>
                            ) : null}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            );
          })() : null}
        </div>
      </div>
      {isCreateOpen ? (
        <div className="fixed inset-0 z-50 bg-slate-900/50" onClick={() => setIsCreateOpen(false)}>
          <div className="flex h-full w-full justify-end">
            <div className="h-full w-full max-w-xl overflow-y-auto bg-white shadow-xl" onClick={(ev) => ev.stopPropagation()}>
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white p-4">
                <div>
                  <div className="text-base font-bold text-slate-900">Create Fee Request</div>
                  <div className="text-xs text-slate-500">Search and select one or more students.</div>
                  {selectedStudents.length > 0 ? (
                    <div className="mt-2 text-xs text-slate-600">
                      Selected: <span className="font-semibold">{selectedStudents.map((s) => s.full_name).join(', ')}</span>
                    </div>
                  ) : null}
                </div>
                <button
                  type="button"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100"
                  onClick={() => setIsCreateOpen(false)}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form
                className="grid gap-3 p-4 sm:grid-cols-2"
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (isSubmittingCreate) return;
                  try {
                    setIsSubmittingCreate(true);
                    setError(null);
                    if (selectedStudentIds.length === 0) throw new Error('Please select at least one student');
                    if (!amountRupees || amountRupees <= 0) throw new Error('Amount must be greater than 0');

                    const todayStart = startOfLocalDay(new Date());
                    const dueAsLocal = startOfLocalDay(new Date(`${dueDate}T12:00:00`));
                    if (dueAsLocal < todayStart) {
                      throw new Error('Due date cannot be in the past');
                    }

                    const payload = {
                      title: feeTitle,
                      dueDate,
                      status,
                    };
                    const results = await Promise.allSettled(
                      selectedStudentIds.map((sid) => {
                        const student = students.find((s) => s.id === sid);
                        const autoAmountRupees = getAmountByBeltGrade(student?.belt_grade);
                        const finalAmountRupees = autoAmountRupees ?? amountRupees;
                        return feesService.createFeeRequest({
                          studentId: sid,
                          amountPaise: Math.round(finalAmountRupees * 100),
                          ...payload,
                        });
                      })
                    );
                    const failed = results.filter((r) => r.status === 'rejected');
                    await loadFeeRequests(studentId);
                    if (failed.length > 0) {
                      const first = failed[0] as PromiseRejectedResult;
                      throw new Error(first.reason instanceof Error ? first.reason.message : 'Some requests failed to create');
                    }
                    setIsCreateOpen(false);
                    setSelectedStudentIds([]);
                    setStudentSearchQuery('');
                  } catch (e) {
                    setError(e instanceof Error ? e.message : 'Failed to create fee request');
                  } finally {
                    setIsSubmittingCreate(false);
                  }
                }}
              >
                <div className="sm:col-span-2">
                  <div className="text-xs font-semibold text-slate-600 mb-1">Student full name</div>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      value={studentSearchQuery}
                      disabled={isSubmittingCreate}
                      onChange={(ev) => setStudentSearchQuery(ev.target.value)}
                      className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2 text-sm"
                      placeholder="Search by name, email or student ID..."
                    />
                  </div>
                  <div className="mt-2 max-h-44 overflow-y-auto rounded-lg border border-slate-200">
                    {filteredStudents.length === 0 ? (
                      <div className="p-3 text-xs text-slate-500">No matching students found.</div>
                    ) : (
                      filteredStudents.slice(0, 100).map((s) => {
                        const checked = selectedStudentIds.includes(s.id);
                        return (
                          <label key={s.id} className="flex cursor-pointer items-start gap-2 border-b border-slate-100 p-2 last:border-b-0 hover:bg-slate-50">
                            <input
                              type="checkbox"
                              checked={checked}
                              disabled={isSubmittingCreate}
                              onChange={(ev) => {
                                setSelectedStudentIds((prev) => {
                                  if (ev.target.checked) return prev.includes(s.id) ? prev : [...prev, s.id];
                                  return prev.filter((id) => id !== s.id);
                                });
                              }}
                              className="mt-0.5"
                            />
                            <div className="min-w-0">
                              <div className="text-sm font-medium text-slate-900 truncate">{s.full_name}</div>
                              <div className="text-xs text-slate-500 truncate">{s.email}</div>
                            </div>
                          </label>
                        );
                      })
                    )}
                  </div>
                  {selectedStudents.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedStudents.map((s) => (
                        <span key={s.id} className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-700">
                          <UserPlus className="h-3.5 w-3.5" />
                          {s.full_name} ({formatBeltGradeLabel(s.belt_grade)})
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>

                <label className="block sm:col-span-2">
                  <div className="text-xs font-semibold text-slate-600 mb-1">Fee request for</div>
                  <input value={feeTitle} readOnly className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm" />
                </label>

                <label className="block">
                  <div className="text-xs font-semibold text-slate-600 mb-1">Amount (Rupees)</div>
                  <input
                    type="number"
                    value={amountRupees}
                    disabled={isSubmittingCreate}
                    onChange={(ev) => {
                      const nextAmount = Number(ev.target.value);
                      setAmountRupees(nextAmount);
                      const matched = FEE_TYPE_OPTIONS.find((opt) => opt.amountRupees === nextAmount);
                      setSelectedFeeType(matched?.id ?? '');
                    }}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    min={1}
                  />
                  <div className="mt-1 text-xs text-slate-500">{formatINRFromPaise(Math.round(amountRupees * 100))}</div>
                </label>

                <div className="block sm:col-span-2">
                  <div className="text-xs font-semibold text-slate-600 mb-1">Quick fee type</div>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {FEE_TYPE_OPTIONS.map((option) => (
                      <label
                        key={option.id}
                        className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                          selectedFeeType === option.id
                            ? 'border-[var(--admin-primary-border)] bg-[var(--admin-primary-soft)] text-[var(--admin-primary)]'
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="quickFeeType"
                          checked={selectedFeeType === option.id}
                          disabled={isSubmittingCreate}
                          onChange={() => {
                            setSelectedFeeType(option.id);
                            setAmountRupees(option.amountRupees);
                          }}
                        />
                        <span className="font-medium">{option.label}: {option.amountRupees}/-</span>
                      </label>
                    ))}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    {hasMixedSelectedBelts
                      ? 'Mixed belt grades selected: fee amount is auto-assigned per student during generation.'
                      : 'Fee amount auto-fills from selected student belt grade when available.'}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <div className="text-xs font-semibold text-slate-600 mb-2">Fee period (title)</div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block">
                      <div className="text-xs font-semibold text-slate-500 mb-1">Month</div>
                      <select
                        value={periodMonthIndex}
                        disabled={isSubmittingCreate}
                        onChange={(ev) => setPeriodMonthIndex(Number(ev.target.value))}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      >
                        {MONTH_OPTIONS.map((m, idx) => (
                          <option key={m} value={idx}>{m}</option>
                        ))}
                      </select>
                    </label>
                    <label className="block">
                      <div className="text-xs font-semibold text-slate-500 mb-1">Year</div>
                      <select
                        value={periodYear}
                        disabled={isSubmittingCreate}
                        onChange={(ev) => setPeriodYear(Number(ev.target.value))}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      >
                        {yearOptions.map((y) => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <div className="text-xs font-semibold text-slate-600 mb-2">Due date</div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <label className="block">
                      <div className="text-xs font-semibold text-slate-500 mb-1">Month</div>
                      <select
                        value={dueMonthIndex}
                        disabled={isSubmittingCreate}
                        onChange={(ev) => setDueMonthIndex(Number(ev.target.value))}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      >
                        {MONTH_OPTIONS.map((m, idx) => {
                          const cy = new Date().getFullYear();
                          const cm = new Date().getMonth();
                          const monthDisabled = dueYear < cy || (dueYear === cy && idx < cm);
                          return (
                            <option key={`due-m-${m}`} value={idx} disabled={monthDisabled}>
                              {m}
                            </option>
                          );
                        })}
                      </select>
                    </label>
                    <label className="block">
                      <div className="text-xs font-semibold text-slate-500 mb-1">Year</div>
                      <select
                        value={dueYear}
                        disabled={isSubmittingCreate}
                        onChange={(ev) => setDueYear(Number(ev.target.value))}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      >
                        {dueYearOptions.map((y) => (
                          <option key={`due-y-${y}`} value={y}>{y}</option>
                        ))}
                      </select>
                    </label>
                    <label className="block">
                      <div className="text-xs font-semibold text-slate-500 mb-1">Day</div>
                      <select
                        value={dueDay}
                        disabled={isSubmittingCreate || dueValidDays.length === 0}
                        onChange={(ev) => setDueDay(Number(ev.target.value))}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      >
                        {dueValidDays.map((d) => (
                          <option key={`due-day-${d}`} value={d}>{d}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <div className="mt-1 text-xs text-slate-500 inline-flex flex-wrap items-start gap-1">
                    <CalendarDays className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                    <span>
                      Selected: <span className="font-medium text-slate-700">{formatDateForLabel(dueDate)}</span>
                      {' · '}
                      Today:{' '}
                      {formatDateForLabel(
                        buildDateFromParts(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())
                      )}
                      {' · '}
                      Opens with due date 10 days from today (no past dates).
                    </span>
                  </div>
                </div>

                <label className="block sm:col-span-2">
                  <div className="text-xs font-semibold text-slate-600 mb-1">Status</div>
                  <select
                    value={status}
                    disabled={isSubmittingCreate}
                    onChange={(ev) => setStatus(ev.target.value as FeeRequestStatus)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  >
                    {['DRAFT', 'ISSUED', 'PAID', 'CANCELLED'].map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="sm:col-span-2 flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    disabled={isSubmittingCreate}
                    onClick={() => setIsCreateOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingCreate}
                    className="inline-flex items-center gap-2 rounded-lg bg-[var(--admin-primary)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--admin-primary-hover)] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSubmittingCreate ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        Generate Fee Requests
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : null}

      {detailsItem ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          onClick={() => setDetailsItem(null)}
        >
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-xl" onClick={(ev) => ev.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div className="text-base font-bold text-slate-900">Fee Request Details</div>
              <button
                type="button"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100"
                onClick={() => setDetailsItem(null)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {(() => {
              const latestSubmission = submissionsByFeeId[detailsItem.id];
              const feeStatus = detailsItem.computed_status ?? detailsItem.status;
              const proofAttachmentUrl = resolveAttachmentUrl(latestSubmission?.proof_url, { feeRequestId: detailsItem.id });
              return (
                <div className="mt-3 grid gap-3 sm:grid-cols-2 text-sm">
                  <div><span className="font-semibold text-slate-900">Student:</span> {detailsItem.student_name ?? 'Unknown'}</div>
                  <div><span className="font-semibold text-slate-900">Email:</span> {detailsItem.student_email ?? 'N/A'}</div>
                  <div><span className="font-semibold text-slate-900">Fee Request For:</span> {formatFeeRequestPeriod(detailsItem.due_date)}</div>
                  <div><span className="font-semibold text-slate-900">Due Date:</span> {formatDateWithOrdinal(detailsItem.due_date)}</div>
                  <div><span className="font-semibold text-slate-900">Amount:</span> {formatINRFromPaise(detailsItem.amount_paise)}</div>
                  <div><span className="font-semibold text-slate-900">Requested By:</span> {formatRequestedBy(detailsItem.created_by_display_name, detailsItem.created_by_email)}</div>
                  <div>
                    <span className="font-semibold text-slate-900">Fee Status:</span>{' '}
                    <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${getFeeStatusBadgeClass(feeStatus)}`}>
                      {toStatusLabel(feeStatus)}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900">Payment Status:</span>{' '}
                    <span
                      className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${getPaymentStatusBadgeClass(
                        latestSubmission?.status ?? (feeStatus === 'PAID' ? 'VERIFIED' : 'NO_SUBMISSION')
                      )}`}
                    >
                      {toStatusLabel(latestSubmission?.status ?? (feeStatus === 'PAID' ? 'VERIFIED' : 'NO_SUBMISSION'))}
                    </span>
                  </div>
                  <div className="sm:col-span-2"><span className="font-semibold text-slate-900">Submission ID:</span> {latestSubmission?.id ?? 'N/A'}</div>
                  <div><span className="font-semibold text-slate-900">Method:</span> {latestSubmission?.method ?? 'N/A'}</div>
                  <div><span className="font-semibold text-slate-900">Reference:</span> {latestSubmission?.reference ?? 'N/A'}</div>
                  <div className="sm:col-span-2">
                    <span className="font-semibold text-slate-900">Student Notes:</span> {latestSubmission?.notes_from_student || 'N/A'}
                  </div>
                  <div className="sm:col-span-2">
                    <span className="font-semibold text-slate-900">Payment Proof:</span>{' '}
                    {proofAttachmentUrl ? (
                      <button
                        type="button"
                        onClick={() => setPreviewUrl(proofAttachmentUrl)}
                        className="font-semibold text-[var(--admin-primary)] hover:underline"
                      >
                        View Attachment
                      </button>
                    ) : (
                      'Not submitted'
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      ) : null}
      {previewUrl ? <AttachmentPreviewModal url={previewUrl} onClose={() => setPreviewUrl(null)} title="Payment Attachment" /> : null}
    </PageContainer>
  );
}

