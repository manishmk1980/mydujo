/**
 * Admin: Instructor Application Review
 *
 * Displays instructor applications submitted via /register/instructor.
 * Statuses: PENDING_REVIEW | NEEDS_MORE_INFO | APPROVED | REJECTED | ARCHIVED
 *
 * Super Admin has final authority to approve/reject and assign center/discipline.
 * Admin users with scoped permissions may review and request more info.
 *
 * Backend model (InstructorApplication) pending — UI shell ready.
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  UserCog,
  Loader2,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Info,
  Archive,
  ExternalLink,
  Eye,
  X,
  MessageSquare,
  MapPin,
  BookOpen,
  Trash2,
} from 'lucide-react';
import { PageContainer } from '../../components/layout/PageContainer';
import { AdminPageHeader } from '../../components/admin/ui/AdminPageHeader';
import { AdminBadge } from '../../components/admin/ui/AdminBadge';
import { AdminEmptyState } from '../../components/admin/ui/AdminEmptyState';
import { AdminLoadingState } from '../../components/admin/ui/AdminLoadingState';
import { AdminErrorState } from '../../components/admin/ui/AdminErrorState';
import { useAdminConfirm } from '../../components/admin/ui/AdminConfirmProvider';
import { trainingCenterService, type TrainingCenter } from '../../services/trainingCenterService';
import { metaService, type DisciplineOption } from '../../services/metaService';
import { instructorService } from '../../services/instructorService';
import { API_BASE } from '../../config';

// ─── Status definitions ───────────────────────────────────────────────────────

export type ApplicationStatus =
  | 'PENDING_REVIEW'
  | 'NEEDS_MORE_INFO'
  | 'APPROVED'
  | 'REJECTED'
  | 'ARCHIVED';

const STATUS_META: Record<
  ApplicationStatus,
  { label: string; variant: 'warning' | 'info' | 'success' | 'danger' | 'neutral'; icon: React.ElementType }
> = {
  PENDING_REVIEW: { label: 'Pending Review', variant: 'warning', icon: Clock },
  NEEDS_MORE_INFO: { label: 'Needs More Info', variant: 'info', icon: Info },
  APPROVED: { label: 'Approved', variant: 'success', icon: CheckCircle2 },
  REJECTED: { label: 'Rejected', variant: 'danger', icon: XCircle },
  ARCHIVED: { label: 'Archived', variant: 'neutral', icon: Archive },
};

function StatusBadge({ status }: { status: ApplicationStatus }) {
  const meta = STATUS_META[status] ?? STATUS_META.PENDING_REVIEW;
  const Icon = meta.icon;
  return (
    <AdminBadge variant={meta.variant} size="sm">
      <Icon className="mr-1 size-3 shrink-0" />
      {meta.label}
    </AdminBadge>
  );
}

// ─── Application type ─────────────────────────────────────────────────────────

export interface InstructorApplication {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  city: string | null;
  state: string | null;
  discipline: string | null;
  experienceYears: string | null;
  idType: string | null;
  idNumber: string | null;
  idDocumentUrl: string | null;
  profilePhotoUrl: string | null;
  declarationAcceptedAt: string | null;
  status: ApplicationStatus;
  reviewNotes: string | null;
  requestedInfoMessage: string | null;
  createdAt: string;
  updatedAt: string;
  assignedCenterId: string | null;
  assignedCenterName: string | null;
  assignedDiscipline: string | null;
}

// ─── API helpers (backend pending — returns empty list gracefully) ─────────────

async function fetchApplications(): Promise<InstructorApplication[]> {
  // Temporary live bridge:
  // Until a dedicated InstructorApplication API/table exists, show unassigned
  // instructor onboarding records as applications.
  try {
    const token = localStorage.getItem('mdpl_access_token_admin');
    const res = await fetch(`${API_BASE}/instructors/admin/all`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!res.ok) return [];

    const data = await res.json().catch(() => ({}));
    const instructors = Array.isArray(data) ? data : (data.instructors || []);

    return instructors
      .filter((i: any) => !i.trainingCenterId && !i.training_center_id)
      .map((i: any): InstructorApplication => ({
        id: i.id,
        fullName: i.fullName || i.full_name || i.email || 'Unnamed Instructor',
        email: i.email || '',
        phone: i.phone || null,
        city: i.city || null,
        state: i.state || null,
        discipline: i.preferredDiscipline || i.preferred_discipline || null,
        experienceYears: null,
        idType: null,
        idNumber: null,
        idDocumentUrl: null,
        profilePhotoUrl: i.profilePhotoUrl || i.profile_photo_url || null,
        declarationAcceptedAt: null,
        status: 'PENDING_REVIEW',
        reviewNotes: null,
        requestedInfoMessage: null,
        createdAt: i.createdAt || i.created_at || new Date().toISOString(),
        updatedAt: i.updatedAt || i.updated_at || i.createdAt || i.created_at || new Date().toISOString(),
        assignedCenterId: i.trainingCenterId || i.training_center_id || null,
        assignedCenterName: i.trainingCenterName || i.training_center_name || null,
        assignedDiscipline: i.preferredDiscipline || i.preferred_discipline || null,
      }));
  } catch {
    return [];
  }
}

async function updateApplicationStatus(
  id: string,
  status: ApplicationStatus,
  extra?: { reviewNotes?: string; requestedInfoMessage?: string; assignedCenterId?: string; assignedDiscipline?: string },
): Promise<void> {
  const res = await fetch(`${API_BASE}/admin/instructor-applications/${id}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(localStorage.getItem('mdpl_access_token_admin')
        ? { Authorization: `Bearer ${localStorage.getItem('mdpl_access_token_admin')}` }
        : {}),
    },
    body: JSON.stringify({ status, ...extra }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { error?: string }).error || `Failed to update status`);
  }
}

// ─── Masking helper ───────────────────────────────────────────────────────────

function maskId(id: string | null): string {
  if (!id) return '—';
  if (id.length <= 4) return '••••';
  return '••••' + id.slice(-4);
}

// ─── Request More Info dialog ─────────────────────────────────────────────────

interface RequestInfoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (message: string) => void;
  isSubmitting: boolean;
}

function RequestInfoDialog({ isOpen, onClose, onConfirm, isSubmitting }: RequestInfoDialogProps) {
  const [message, setMessage] = useState('');
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Request more information</h3>
            <p className="mt-1 text-sm text-slate-500">
              Describe what the applicant needs to provide before the application can be approved.
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
            <X className="size-4" />
          </button>
        </div>
        <textarea
          rows={4}
          placeholder="e.g. Please upload a clearer copy of your ID document."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-[var(--admin-primary)] focus:outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--admin-primary)_20%,transparent)]"
        />
        <div className="mt-4 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">
            Cancel
          </button>
          <button
            disabled={!message.trim() || isSubmitting}
            onClick={() => onConfirm(message.trim())}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--admin-info,#0ea5e9)] px-5 py-2.5 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50"
          >
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            Send request
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Assign dialog ────────────────────────────────────────────────────────────

interface AssignDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (centerId: string, discipline: string) => void;
  isSubmitting: boolean;
  trainingCenters: TrainingCenter[];
  disciplines: DisciplineOption[];
  current: { centerId: string; discipline: string };
}

function AssignDialog({ isOpen, onClose, onConfirm, isSubmitting, trainingCenters, disciplines, current }: AssignDialogProps) {
  const [centerId, setCenterId] = useState(current.centerId);
  const [discipline, setDiscipline] = useState(current.discipline);

  useEffect(() => {
    if (isOpen) {
      setCenterId(current.centerId);
      setDiscipline(current.discipline);
    }
  }, [isOpen, current.centerId, current.discipline]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Assign center &amp; discipline</h3>
            <p className="mt-1 text-sm text-slate-500">
              Official assignment is confirmed by MDPL admin after approval.
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
            <X className="size-4" />
          </button>
        </div>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Training Center</label>
            <select
              value={centerId}
              onChange={(e) => setCenterId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-[var(--admin-primary)] focus:outline-none"
            >
              <option value="">— No center assigned —</option>
              {trainingCenters.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Discipline</label>
            <select
              value={discipline}
              onChange={(e) => setDiscipline(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-[var(--admin-primary)] focus:outline-none"
            >
              <option value="">— No discipline assigned —</option>
              {disciplines.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">
            Cancel
          </button>
          <button
            disabled={isSubmitting}
            onClick={() => onConfirm(centerId, discipline)}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--admin-primary)] px-5 py-2.5 text-sm font-bold text-white hover:bg-[var(--admin-primary-hover)] disabled:opacity-50"
          >
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            Save assignment
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Application detail drawer ────────────────────────────────────────────────

interface DetailDrawerProps {
  app: InstructorApplication;
  onClose: () => void;
  onAction: (action: 'approve' | 'reject' | 'request_info' | 'archive' | 'assign') => void;
  onDelete: (app: InstructorApplication) => void;
  actionInProgress: boolean;
  trainingCenters: TrainingCenter[];
  disciplines: DisciplineOption[];
}

function DetailDrawer({ app, onClose, onAction, onDelete, actionInProgress, trainingCenters, disciplines }: DetailDrawerProps) {
  const centerName =
    app.assignedCenterName ||
    trainingCenters.find((c) => c.id === app.assignedCenterId)?.name ||
    '—';
  const disciplineLabel =
    disciplines.find((d) => d.value === (app.assignedDiscipline || app.discipline))?.label ||
    app.assignedDiscipline ||
    app.discipline ||
    '—';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 p-2 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:max-h-[88dvh] sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            {app.profilePhotoUrl ? (
              <img src={app.profilePhotoUrl} alt="" className="size-11 shrink-0 rounded-full object-cover border border-slate-200" />
            ) : (
              <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <UserCog className="size-5" />
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate font-bold text-slate-900">{app.fullName}</p>
              <p className="truncate text-sm text-slate-500">{app.email}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <StatusBadge status={app.status} />
            <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          <div className="grid gap-3 sm:grid-cols-2 text-sm">
            <InfoRow label="Phone" value={app.phone || '—'} />
            <InfoRow label="Location" value={[app.city, app.state].filter(Boolean).join(', ') || '—'} />
            <InfoRow label="Discipline / Style" value={app.discipline || '—'} />
            <InfoRow label="Experience" value={app.experienceYears ? `${app.experienceYears} years` : '—'} />
            <InfoRow label="ID Type" value={app.idType || '—'} />
            <InfoRow label="ID Number" value={maskId(app.idNumber)} />
            <InfoRow label="Applied" value={app.createdAt ? new Date(app.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'} />
            <InfoRow label="Declaration accepted" value={app.declarationAcceptedAt ? '✓ Yes' : '—'} />

            {/* Assignment */}
            <div className="sm:col-span-2 rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Official Assignment (admin only)</p>
              <div className="grid gap-2 sm:grid-cols-2 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="size-4 shrink-0 text-slate-400" />
                  <span className="text-slate-700 font-medium">{centerName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="size-4 shrink-0 text-slate-400" />
                  <span className="text-slate-700 font-medium">{disciplineLabel}</span>
                </div>
              </div>
            </div>

            {app.reviewNotes && (
              <div className="sm:col-span-2 rounded-xl border border-slate-100 bg-slate-50 p-4">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Review Notes</p>
                <p className="text-sm text-slate-700">{app.reviewNotes}</p>
              </div>
            )}
            {app.requestedInfoMessage && (
              <div className="sm:col-span-2 rounded-xl border border-sky-100 bg-sky-50 p-4">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-sky-500">Info Requested from Applicant</p>
                <p className="text-sm text-sky-800">{app.requestedInfoMessage}</p>
              </div>
            )}

            {app.idDocumentUrl && (
              <div className="sm:col-span-2">
                <a
                  href={app.idDocumentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  <ExternalLink className="size-4" /> View ID Document
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Action bar */}
        <div className="sticky bottom-0 flex flex-wrap items-center gap-2 border-t border-slate-200 bg-white/95 px-5 py-3 backdrop-blur sm:px-6">
          {(app.status === 'PENDING_REVIEW' || app.status === 'NEEDS_MORE_INFO') && (
            <button
              disabled={actionInProgress}
              onClick={() => onAction('approve')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {actionInProgress ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />}
              Approve
            </button>
          )}
          {(app.status === 'PENDING_REVIEW' || app.status === 'NEEDS_MORE_INFO') && (
            <button
              disabled={actionInProgress}
              onClick={() => onAction('reject')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-60"
            >
              <XCircle className="size-3.5" /> Reject
            </button>
          )}
          {(app.status === 'PENDING_REVIEW' || app.status === 'NEEDS_MORE_INFO') && (
            <button
              disabled={actionInProgress}
              onClick={() => onAction('request_info')}
              className="inline-flex items-center gap-1.5 rounded-xl border border-sky-200 bg-sky-50 px-4 py-2.5 text-xs font-bold text-sky-700 hover:bg-sky-100 disabled:opacity-60"
            >
              <MessageSquare className="size-3.5" /> Request Info
            </button>
          )}
          <button
            disabled={actionInProgress}
            onClick={() => onAction('assign')}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            <MapPin className="size-3.5" /> Assign Center / Discipline
          </button>
          {app.status !== 'ARCHIVED' && (
            <button
              disabled={actionInProgress}
              onClick={() => onAction('archive')}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-50 disabled:opacity-60"
            >
              <Archive className="size-3.5" /> Archive
            </button>
          )}
          <button
            disabled={actionInProgress}
            onClick={() => onDelete(app)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-bold text-red-700 hover:bg-red-100 disabled:opacity-60"
          >
            {actionInProgress ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
      <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="font-semibold text-slate-900">{value}</p>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminInstructorApplications() {
  const [applications, setApplications] = useState<InstructorApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'ALL'>('ALL');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [flashMessage, setFlashMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [requestInfoOpen, setRequestInfoOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [trainingCenters, setTrainingCenters] = useState<TrainingCenter[]>([]);
  const [disciplines, setDisciplines] = useState<DisciplineOption[]>([]);

  const confirm = useAdminConfirm();

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchApplications();
      setApplications(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteApplication = async (app: InstructorApplication) => {
    const ok = await confirm({
      title: 'Delete instructor application?',
      description: `This will permanently delete ${app.fullName || app.email || 'this instructor'} from instructor records. This action cannot be undone.`,
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      variant: 'danger',
    });

    if (!ok) return;

    setActionInProgress(true);
    try {
      await instructorService.deleteInstructor(app.id);
      setApplications((prev) => prev.filter((item) => item.id !== app.id));
      setSelectedId(null);
      setFlashMessage({ text: 'Instructor application deleted.', type: 'success' });
    } catch (e) {
      setFlashMessage({
        text: e instanceof Error ? e.message : 'Failed to delete instructor application',
        type: 'error',
      });
    } finally {
      setActionInProgress(false);
    }
  };

  useEffect(() => {
    load();
    Promise.all([
      trainingCenterService.getAllTrainingCenters().catch(() => [] as TrainingCenter[]),
      metaService.getDisciplines().catch(() => [] as DisciplineOption[]),
    ]).then(([centers, opts]) => {
      setTrainingCenters(centers || []);
      setDisciplines(opts || []);
    });
  }, []);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return applications.filter((a) => {
      if (statusFilter !== 'ALL' && a.status !== statusFilter) return false;
      if (!q) return true;
      return (
        a.fullName?.toLowerCase().includes(q) ||
        a.email?.toLowerCase().includes(q) ||
        a.phone?.toLowerCase().includes(q) ||
        a.city?.toLowerCase().includes(q) ||
        a.discipline?.toLowerCase().includes(q)
      );
    });
  }, [applications, searchTerm, statusFilter]);

  const selectedApp = applications.find((a) => a.id === selectedId) ?? null;

  const flash = (text: string, type: 'success' | 'error' = 'success') => {
    setFlashMessage({ text, type });
    setTimeout(() => setFlashMessage(null), 4000);
  };

  const doStatusUpdate = async (
    id: string,
    status: ApplicationStatus,
    extra?: Parameters<typeof updateApplicationStatus>[2],
  ) => {
    setActionInProgress(true);
    try {
      await updateApplicationStatus(id, status, extra);
      await load();
      flash(`Status updated to ${STATUS_META[status].label}`);
    } catch (e) {
      flash(e instanceof Error ? e.message : 'Update failed', 'error');
    } finally {
      setActionInProgress(false);
    }
  };

  const handleAction = async (action: 'approve' | 'reject' | 'request_info' | 'archive' | 'assign') => {
    if (!selectedApp) return;

    if (action === 'approve') {
      const ok = await confirm({
        title: 'Approve instructor?',
        description:
          'This will approve the instructor application. The instructor account can be created and access details sent after approval. Note: Account creation / email setup pending backend support.',
        confirmLabel: 'Approve',
        cancelLabel: 'Cancel',
        variant: 'default',
      });
      if (!ok) return;
      await doStatusUpdate(selectedApp.id, 'APPROVED');
      setSelectedId(null);
      return;
    }

    if (action === 'reject') {
      const ok = await confirm({
        title: 'Reject application?',
        description: `This will reject "${selectedApp.fullName}"'s instructor application. They will not receive automatic notification unless you contact them separately.`,
        confirmLabel: 'Reject',
        cancelLabel: 'Cancel',
        variant: 'danger',
      });
      if (!ok) return;
      await doStatusUpdate(selectedApp.id, 'REJECTED');
      setSelectedId(null);
      return;
    }

    if (action === 'archive') {
      const ok = await confirm({
        title: 'Archive application?',
        description: 'This will archive the application. It will no longer appear in the active review queue.',
        confirmLabel: 'Archive',
        cancelLabel: 'Cancel',
        variant: 'danger',
      });
      if (!ok) return;
      await doStatusUpdate(selectedApp.id, 'ARCHIVED');
      setSelectedId(null);
      return;
    }

    if (action === 'request_info') {
      setRequestInfoOpen(true);
      return;
    }

    if (action === 'assign') {
      setAssignOpen(true);
      return;
    }
  };

  const handleRequestInfoConfirm = async (message: string) => {
    if (!selectedApp) return;
    await doStatusUpdate(selectedApp.id, 'NEEDS_MORE_INFO', { requestedInfoMessage: message });
    setRequestInfoOpen(false);
    setSelectedId(null);
  };

  const handleAssignConfirm = async (centerId: string, discipline: string) => {
    if (!selectedApp) return;
    const center = trainingCenters.find((c) => c.id === centerId);
    setActionInProgress(true);
    try {
      await updateApplicationStatus(selectedApp.id, selectedApp.status, {
        assignedCenterId: centerId || undefined,
        assignedDiscipline: discipline || undefined,
      });
      await load();
      flash(`Assignment updated${center ? ` → ${center.name}` : ''}`);
    } catch (e) {
      flash(e instanceof Error ? e.message : 'Assignment failed', 'error');
    } finally {
      setActionInProgress(false);
      setAssignOpen(false);
      setSelectedId(null);
    }
  };

  const counts = useMemo(
    () => ({
      total: applications.length,
      pending: applications.filter((a) => a.status === 'PENDING_REVIEW').length,
      needsInfo: applications.filter((a) => a.status === 'NEEDS_MORE_INFO').length,
      approved: applications.filter((a) => a.status === 'APPROVED').length,
      rejected: applications.filter((a) => a.status === 'REJECTED').length,
      archived: applications.filter((a) => a.status === 'ARCHIVED').length,
    }),
    [applications],
  );

  const isBackendPending = !loading && !error && applications.length === 0;

  return (
    <PageContainer>
      <AdminPageHeader
        title="Instructor Applications"
        subtitle="Review, approve, and assign incoming instructor applications."
        actions={
          <button
            type="button"
            onClick={() => void load()}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className="size-4" /> Refresh
          </button>
        }
      />

      {/* Flash */}
      {flashMessage && (
        <div
          className={`rounded-2xl border p-4 text-sm font-medium ${
            flashMessage.type === 'error'
              ? 'border-red-200 bg-red-50 text-red-700'
              : 'border-emerald-200 bg-emerald-50 text-emerald-700'
          }`}
        >
          {flashMessage.text}
        </div>
      )}

      {/* Backend pending notice */}
      {isBackendPending && !loading && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
          <p className="font-bold">Instructor onboarding queue</p>
          <p className="mt-1 text-amber-700">
            Until the dedicated application workflow is enabled, unassigned instructor registrations are shown here for review and assignment.
          </p>
        </div>
      )}

      {/* Stat row */}
      {!loading && !error && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { label: 'Total', value: counts.total, filter: 'ALL' as const },
            { label: 'Pending', value: counts.pending, filter: 'PENDING_REVIEW' as const },
            { label: 'Needs Info', value: counts.needsInfo, filter: 'NEEDS_MORE_INFO' as const },
            { label: 'Approved', value: counts.approved, filter: 'APPROVED' as const },
            { label: 'Rejected', value: counts.rejected, filter: 'REJECTED' as const },
            { label: 'Archived', value: counts.archived, filter: 'ARCHIVED' as const },
          ].map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => setStatusFilter(s.filter)}
              className={`rounded-2xl border p-4 text-left shadow-sm transition-all hover:shadow-md ${
                statusFilter === s.filter
                  ? 'border-[var(--admin-primary)] bg-[color-mix(in_srgb,var(--admin-primary)_8%,white)]'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <p className="text-2xl font-bold text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </button>
          ))}
        </div>
      )}

      {/* Search / filter */}
      {!loading && !error && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, email, phone, city, discipline…"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm focus:border-[var(--admin-primary)] focus:outline-none"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:outline-none"
            >
              <option value="ALL">All statuses</option>
              {(Object.keys(STATUS_META) as ApplicationStatus[]).map((s) => (
                <option key={s} value={s}>{STATUS_META[s].label}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <AdminLoadingState label="Loading applications…" className="min-h-[40vh]" />
      ) : error ? (
        <AdminErrorState message={error} />
      ) : filtered.length === 0 && !isBackendPending ? (
        <AdminEmptyState title="No applications found" description="Adjust your filters or check back later." />
      ) : (
        <div className="overflow-visible rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
            <p className="text-sm font-bold text-slate-900">Applications</p>
            <p className="text-xs text-slate-500">{filtered.length} shown</p>
          </div>
          <div className="divide-y divide-slate-100">
            {filtered.map((app) => {
              const disciplineLabel = disciplines.find((d) => d.value === app.discipline)?.label || app.discipline || '—';
              return (
                <div key={app.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:gap-4">
                  {/* Avatar */}
                  {app.profilePhotoUrl ? (
                    <img src={app.profilePhotoUrl} alt="" className="size-10 shrink-0 rounded-full object-cover border border-slate-200" />
                  ) : (
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                      <UserCog className="size-5" />
                    </div>
                  )}

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-slate-900">{app.fullName}</p>
                    <p className="truncate text-xs text-slate-500">{app.email}</p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {[app.city, app.state].filter(Boolean).join(', ')} · {disciplineLabel}
                      {app.experienceYears ? ` · ${app.experienceYears} yrs` : ''}
                    </p>
                  </div>

                  {/* Status + action */}
                  <div className="flex shrink-0 items-center gap-3">
                    <StatusBadge status={app.status} />
                    <button
                      onClick={() => setSelectedId(app.id)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <Eye className="size-3.5" /> Review
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Detail drawer */}
      {selectedApp && (
        <DetailDrawer
          app={selectedApp}
          onClose={() => {
            setSelectedId(null);
            setRequestInfoOpen(false);
            setAssignOpen(false);
          }}
          onAction={(a) => void handleAction(a)}
          onDelete={(app) => void handleDeleteApplication(app)}
          actionInProgress={actionInProgress}
          trainingCenters={trainingCenters}
          disciplines={disciplines}
        />
      )}

      {/* Request info dialog */}
      <RequestInfoDialog
        isOpen={requestInfoOpen}
        onClose={() => setRequestInfoOpen(false)}
        onConfirm={(msg) => void handleRequestInfoConfirm(msg)}
        isSubmitting={actionInProgress}
      />

      {/* Assign dialog */}
      {selectedApp && (
        <AssignDialog
          isOpen={assignOpen}
          onClose={() => setAssignOpen(false)}
          onConfirm={(centerId, discipline) => void handleAssignConfirm(centerId, discipline)}
          isSubmitting={actionInProgress}
          trainingCenters={trainingCenters}
          disciplines={disciplines}
          current={{
            centerId: selectedApp.assignedCenterId || '',
            discipline: selectedApp.assignedDiscipline || selectedApp.discipline || '',
          }}
        />
      )}
    </PageContainer>
  );
}
