/**
 * Admin: Instructors
 * Tabs: Approved Instructors | Applications
 * Applications tab links to /admin/instructor-applications.
 *
 * Super Admin controls assignment of center, discipline, and students.
 * Assignment write-through to backend is pending for some fields.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Loader2, UserCog, RefreshCw, Eye, EyeOff, Upload,
  MoreHorizontal, Edit, Pause, Archive, CheckCircle2, MapPin, BookOpen,
  Users, Key, X, Search, ClipboardList, ExternalLink,
} from 'lucide-react';
import { PageContainer } from '../../components/layout/PageContainer';
import { AdminPageHeader } from '../../components/admin/ui/AdminPageHeader';
import { AdminErrorState } from '../../components/admin/ui/AdminErrorState';
import { AdminLoadingState } from '../../components/admin/ui/AdminLoadingState';
import { AdminEmptyState } from '../../components/admin/ui/AdminEmptyState';
import { AdminBadge } from '../../components/admin/ui/AdminBadge';
import { useAdminConfirm } from '../../components/admin/ui/AdminConfirmProvider';
import { instructorService, type Instructor } from '../../services/instructorService';
import { trainingCenterService, type TrainingCenter } from '../../services/trainingCenterService';
import { metaService, type DisciplineOption } from '../../services/metaService';
import { storageService } from '../../services/storageService';
import { authService } from '../../services/authService';
import { cn } from '../../lib/utils';

type InstructorExt = Instructor & { _count?: { students: number; classes: number } };

const inputCls = 'w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 outline-none focus:border-[var(--admin-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--admin-primary)_25%,transparent)]';
const emptyForm = { fullName: '', email: '', phone: '', city: '', state: '', trainingCenterId: '', trainingCenterName: '', preferredDiscipline: '', bio: '', password: '', isActive: true, canLogin: true };

// ─── Create instructor form ───────────────────────────────────────────────────

function CreateInstructorPanel({
  form, setForm, trainingCenters, disciplines, canSubmit, submitting, onSubmit, onCancel,
}: {
  form: typeof emptyForm;
  setForm: React.Dispatch<React.SetStateAction<typeof emptyForm>>;
  trainingCenters: TrainingCenter[];
  disciplines: DisciplineOption[];
  canSubmit: boolean;
  submitting: boolean;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 sm:p-6">
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200"><UserCog className="size-5 text-slate-600" /></div>
        <div><p className="font-extrabold text-slate-900">New Instructor</p><p className="text-sm text-slate-600">Creates an instructor profile and (optionally) login access.</p></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Full name"><input className={inputCls} value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} /></Field>
        <Field label="Email"><input className={inputCls} value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} /></Field>
        <Field label="Phone (optional)"><input className={inputCls} value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} /></Field>
        <Field label="Password (optional)">
          <div className="relative">
            <input type={showPassword ? 'text' : 'password'} className={cn(inputCls, 'pr-12')} value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} placeholder={form.canLogin ? 'At least 6 characters' : 'Optional'} />
            <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700" aria-label={showPassword ? 'Hide' : 'Show'}>
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </Field>
        <Field label="City (optional)"><input className={inputCls} value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} /></Field>
        <Field label="State (optional)"><input className={inputCls} value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))} /></Field>
        <Field label="Training center (optional)">
          <select className={inputCls} value={form.trainingCenterId} onChange={(e) => {
            const c = trainingCenters.find((x) => x.id === e.target.value);
            setForm((f) => ({ ...f, trainingCenterId: c?.id || '', trainingCenterName: c?.name || '' }));
          }}>
            <option value="">Select training center</option>
            {trainingCenters.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
        <Field label="Discipline (optional)">
          <select className={inputCls} value={form.preferredDiscipline} onChange={(e) => setForm((f) => ({ ...f, preferredDiscipline: e.target.value }))}>
            <option value="">Select discipline</option>
            {disciplines.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
        </Field>
        <Field label="Profile picture (optional)">
          <label className={cn(inputCls, 'cursor-pointer flex items-center justify-between')}>
            <span className="text-sm text-slate-600 truncate">{photoFile?.name || 'Upload image'}</span>
            <Upload className="size-4 text-slate-500" />
            <input type="file" className="hidden" accept="image/*" onChange={(e) => {
              const f = e.target.files?.[0] || null;
              setPhotoFile(f);
              if (f) { const r = new FileReader(); r.onloadend = () => setPhotoPreview(String(r.result || '')); r.readAsDataURL(f); }
              else setPhotoPreview(null);
            }} />
          </label>
          {photoPreview && <img src={photoPreview} alt="Preview" className="mt-2 size-16 rounded-full object-cover border border-slate-200" />}
        </Field>
        <div className="md:col-span-2">
          <Field label="Bio (optional)"><textarea className={cn(inputCls, 'min-h-24')} value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} /></Field>
        </div>
      </div>
      <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
          <input type="checkbox" checked={form.canLogin} onChange={(e) => setForm((f) => ({ ...f, canLogin: e.target.checked }))} className="size-4 accent-[var(--admin-primary)]" />
          Allow login
        </label>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={onCancel} className="min-h-11 flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 sm:flex-none">Cancel</button>
          <button type="button" disabled={!canSubmit || submitting} onClick={onSubmit}
            className={cn('inline-flex min-h-11 flex-1 items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-extrabold text-sm sm:flex-none', !canSubmit || submitting ? 'bg-slate-200 text-slate-500 cursor-not-allowed' : 'bg-[var(--admin-primary)] text-white hover:bg-[var(--admin-primary-hover)]')}>
            {submitting && <Loader2 className="size-4 animate-spin" />} Create
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Action menu ──────────────────────────────────────────────────────────────

function InstructorMenu({ onView, onEdit, onAssign, onPause, onArchive, isActive }: {
  onView: () => void; onEdit: () => void; onAssign: () => void;
  onPause: () => void; onArchive: () => void; isActive: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const items = [
    { label: 'View profile', icon: Eye, action: onView },
    { label: 'Edit', icon: Edit, action: onEdit },
    { label: 'Assign center / discipline', icon: MapPin, action: onAssign },
    { label: isActive ? 'Pause instructor' : 'Reactivate', icon: isActive ? Pause : CheckCircle2, action: onPause },
    { label: 'Archive', icon: Archive, action: onArchive },
  ];

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((v) => !v)} className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50" aria-label="Actions">
        <MoreHorizontal className="size-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-[9999] mt-1 w-52 overflow-visible rounded-xl border border-slate-200 bg-white shadow-lg">
          {items.map(({ label, icon: Icon, action }) => (
            <button key={label} onClick={() => { action(); setOpen(false); }} className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50">
              <Icon className="size-4 text-slate-400" /> {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Assign modal ─────────────────────────────────────────────────────────────

function AssignModal({ instructor, onClose, onSave, trainingCenters, disciplines, submitting }: {
  instructor: InstructorExt; onClose: () => void;
  onSave: (centerId: string, discipline: string) => void;
  trainingCenters: TrainingCenter[]; disciplines: DisciplineOption[];
  submitting: boolean;
}) {
  const [centerId, setCenterId] = useState(instructor.trainingCenterId || '');
  const [discipline, setDiscipline] = useState(instructor.preferredDiscipline || '');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900">Assign: {instructor.fullName}</h3>
            <p className="mt-0.5 text-xs text-slate-500">Super admin controlled. Assignment pending backend write-through.</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><X className="size-4" /></button>
        </div>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500"><MapPin className="size-3.5" /> Training Center</label>
            <select value={centerId} onChange={(e) => setCenterId(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none">
              <option value="">— None —</option>
              {trainingCenters.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500"><BookOpen className="size-3.5" /> Discipline</label>
            <select value={discipline} onChange={(e) => setDiscipline(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none">
              <option value="">— None —</option>
              {disciplines.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">Cancel</button>
          <button disabled={submitting} onClick={() => onSave(centerId, discipline)} className="inline-flex items-center gap-2 rounded-xl bg-[var(--admin-primary)] px-5 py-2.5 text-sm font-bold text-white hover:bg-[var(--admin-primary-hover)] disabled:opacity-50">
            {submitting && <Loader2 className="size-4 animate-spin" />} Save assignment
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Instructor detail drawer ─────────────────────────────────────────────────

function InstructorDetailDrawer({ instructor, onClose, onEdit, onAssign, onPause, onResetPassword, trainingCenters, disciplines }: {
  instructor: InstructorExt; onClose: () => void;
  onEdit: () => void; onAssign: () => void; onPause: () => void;
  onResetPassword: () => void;
  trainingCenters: TrainingCenter[]; disciplines: DisciplineOption[];
}) {
  const centerName = trainingCenters.find((c) => c.id === instructor.trainingCenterId)?.name || instructor.trainingCenterName || '—';
  const disciplineLabel = disciplines.find((d) => d.value === instructor.preferredDiscipline)?.label || instructor.preferredDiscipline || '—';

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 p-2 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
      <div className="flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:max-h-[85dvh] sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            {instructor.profilePhotoUrl ? (
              <img src={instructor.profilePhotoUrl} alt="" className="size-11 shrink-0 rounded-full object-cover border border-slate-200" />
            ) : (
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400"><UserCog className="size-5" /></div>
            )}
            <div className="min-w-0">
              <p className="truncate font-bold text-slate-900">{instructor.fullName}</p>
              <p className="truncate text-xs text-slate-500">{instructor.email}</p>
              <AdminBadge variant={instructor.isActive ? 'success' : 'warning'} size="sm">{instructor.isActive ? 'Active' : 'Inactive'}</AdminBadge>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" className="shrink-0 rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X className="size-4" /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            {[
              { label: 'Phone', value: instructor.phone || '—' },
              { label: 'Location', value: [instructor.city, instructor.state].filter(Boolean).join(', ') || '—' },
              { label: 'Center', value: centerName },
              { label: 'Discipline', value: disciplineLabel },
              { label: 'Students', value: String(instructor._count?.students ?? '—') },
              { label: 'Classes', value: String(instructor._count?.classes ?? '—') },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
                <p className="mt-0.5 font-semibold text-slate-900">{value}</p>
              </div>
            ))}
            {instructor.bio && (
              <div className="sm:col-span-2 rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Bio</p>
                <p className="text-sm text-slate-700">{instructor.bio}</p>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 border-t border-slate-200 px-5 py-4">
          <button onClick={onEdit} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"><Edit className="size-3.5" /> Edit</button>
          <button onClick={onAssign} className="inline-flex items-center gap-1.5 rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-bold text-violet-700 hover:bg-violet-100"><MapPin className="size-3.5" /> Assign</button>
          <button onClick={onPause} className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700 hover:bg-amber-100">
            {instructor.isActive ? <><Pause className="size-3.5" /> Pause</> : <><CheckCircle2 className="size-3.5" /> Reactivate</>}
          </button>
          <button onClick={onResetPassword} className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100"><Key className="size-3.5" /> Reset Password</button>
          {instructor.profilePhotoUrl && (
            <a href={instructor.profilePhotoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"><ExternalLink className="size-3.5" /> View Photo</a>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-extrabold text-slate-700">{label}</span>
      {children}
    </label>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminInstructors() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'approved' | 'applications'>('approved');
  const [instructors, setInstructors] = useState<InstructorExt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [trainingCenters, setTrainingCenters] = useState<TrainingCenter[]>([]);
  const [disciplines, setDisciplines] = useState<DisciplineOption[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [flash, setFlash] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [detailInstructor, setDetailInstructor] = useState<InstructorExt | null>(null);
  const [assignInstructor, setAssignInstructor] = useState<InstructorExt | null>(null);
  const [assignSubmitting, setAssignSubmitting] = useState(false);

  const confirm = useAdminConfirm();

  const showFlash = (text: string, type: 'success' | 'error' = 'success') => {
    setFlash({ text, type });
    setTimeout(() => setFlash(null), 4000);
  };

  const canSubmit = useMemo(() => {
    const email = form.email.trim();
    if (!(form.fullName.trim().length > 1 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) return false;
    if (form.canLogin && form.password.trim().length < 6) return false;
    return true;
  }, [form.canLogin, form.email, form.fullName, form.password]);

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await instructorService.getAllInstructorsAdmin();
      setInstructors(data || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load instructors');
    } finally {
      setLoading(false);
    }
  };

  const fetchOptions = async () => {
    const [centers, disciplineOptions] = await Promise.all([
      trainingCenterService.getAllTrainingCenters().catch(() => [] as TrainingCenter[]),
      metaService.getDisciplines().catch(() => [] as DisciplineOption[]),
    ]);
    setTrainingCenters(centers || []);
    setDisciplines(disciplineOptions || []);
  };

  useEffect(() => { fetchAll(); fetchOptions(); }, []);

  const create = async () => {
    if (!canSubmit) return;
    try {
      setSubmitting(true);
      setError(null);
      await instructorService.createInstructor({
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim() || undefined,
        city: form.city.trim() || undefined,
        state: form.state.trim() || undefined,
        trainingCenterId: form.trainingCenterId || undefined,
        trainingCenterName: form.trainingCenterName.trim() || undefined,
        preferredDiscipline: form.preferredDiscipline || undefined,
        bio: form.bio.trim() || undefined,
        password: form.password.trim() || undefined,
        isActive: form.isActive,
        canLogin: form.canLogin,
      });
      setShowForm(false);
      setForm(emptyForm);
      await fetchAll();
      showFlash('Instructor created successfully.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create instructor');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePause = async (i: InstructorExt) => {
    const isActive = i.isActive;
    const ok = await confirm({
      title: isActive ? 'Pause instructor?' : 'Reactivate instructor?',
      description: isActive
        ? `"${i.fullName}" will be paused. They remain assigned to students but cannot actively teach. Backend update pending.`
        : `"${i.fullName}" will be reactivated. Backend update pending.`,
      confirmLabel: isActive ? 'Pause' : 'Reactivate',
      cancelLabel: 'Cancel',
      variant: isActive ? 'warning' : 'default',
    });
    if (!ok) return;
    setInstructors((prev) => prev.map((x) => x.id === i.id ? { ...x, isActive: !i.isActive } : x));
    setDetailInstructor(null);
    showFlash(`${i.fullName} ${isActive ? 'paused' : 'reactivated'} (local — backend update pending).`);
  };

  const handleArchive = async (i: InstructorExt) => {
    const ok = await confirm({
      title: 'Archive instructor?',
      description: `"${i.fullName}" will be archived. Backend archive endpoint is pending.`,
      confirmLabel: 'Archive',
      cancelLabel: 'Cancel',
      variant: 'danger',
    });
    if (!ok) return;
    setInstructors((prev) => prev.filter((x) => x.id !== i.id));
    setDetailInstructor(null);
    showFlash(`${i.fullName} archived (local — backend API pending).`);
  };

  const handleAssignSave = async (centerId: string, discipline: string) => {
    if (!assignInstructor) return;
    setAssignSubmitting(true);
    try {
      const center = trainingCenters.find((c) => c.id === centerId);
      setInstructors((prev) => prev.map((x) => x.id === assignInstructor.id ? { ...x, trainingCenterId: centerId, trainingCenterName: center?.name || '', preferredDiscipline: discipline } : x));
      showFlash('Assignment updated (local — backend write-through pending).');
    } finally {
      setAssignSubmitting(false);
      setAssignInstructor(null);
      setDetailInstructor(null);
    }
  };

  const handleResetPassword = async (i: InstructorExt) => {
    const ok = await confirm({
      title: 'Send password reset?',
      description: `Send a password reset link to ${i.email}?`,
      confirmLabel: 'Send link',
      cancelLabel: 'Cancel',
      variant: 'default',
    });
    if (!ok) return;
    try {
      const { error } = await authService.resetPasswordForEmail(i.email);
      if (error) throw new Error(error.message);
      showFlash('Password reset link sent.');
    } catch (e) {
      showFlash(e instanceof Error ? e.message : 'Failed to send reset link.', 'error');
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return instructors;
    return instructors.filter((i) =>
      i.fullName?.toLowerCase().includes(q) ||
      i.email?.toLowerCase().includes(q) ||
      i.city?.toLowerCase().includes(q) ||
      i.preferredDiscipline?.toLowerCase().includes(q)
    );
  }, [instructors, search]);

  return (
    <PageContainer>
      <AdminPageHeader
        title="Instructors"
        subtitle="Create and manage instructor accounts, assignments, and applications."
        actions={
          <div className="flex w-full gap-2 sm:w-auto">
            <button type="button" onClick={() => void fetchAll()} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">
              <RefreshCw className="size-4" /> Refresh
            </button>
            <button type="button" onClick={() => setShowForm((s) => !s)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--admin-primary)] px-4 py-2 text-sm font-bold text-white hover:bg-[var(--admin-primary-hover)]">
              <Plus className="size-4" /> Add instructor
            </button>
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        {[
          { key: 'approved', label: 'Approved Instructors', icon: UserCog },
          { key: 'applications', label: 'Applications', icon: ClipboardList },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              if (key === 'applications') { navigate('/admin/instructor-applications'); return; }
              setTab(key as 'approved');
            }}
            className={cn(
              'flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition-colors',
              tab === key && key !== 'applications'
                ? 'border-[var(--admin-primary)] text-[var(--admin-primary)]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            )}
          >
            <Icon className="size-4" /> {label}
            {key === 'applications' && (
              <ExternalLink className="size-3 opacity-50" />
            )}
          </button>
        ))}
      </div>

      {flash && (
        <div className={`rounded-2xl border p-4 text-sm font-medium ${flash.type === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
          {flash.text}
        </div>
      )}

      {error && <AdminErrorState message={error} className="mb-4 rounded-2xl font-medium" />}

      {/* Stats */}
      {!loading && (
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xl font-bold text-slate-900">{instructors.length}</p><p className="text-xs text-slate-500">Total</p></div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xl font-bold text-slate-900">{instructors.filter((i) => i.isActive).length}</p><p className="text-xs text-slate-500">Active</p></div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xl font-bold text-slate-900">{instructors.filter((i) => !i.isActive).length}</p><p className="text-xs text-slate-500">Inactive</p></div>
        </div>
      )}

      {showForm && (
        <CreateInstructorPanel
          form={form} setForm={setForm}
          trainingCenters={trainingCenters} disciplines={disciplines}
          canSubmit={canSubmit} submitting={submitting}
          onSubmit={() => void create()}
          onCancel={() => { setShowForm(false); setForm(emptyForm); }}
        />
      )}

      {/* Search */}
      {!loading && instructors.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, email, city, discipline…" className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm shadow-sm focus:border-[var(--admin-primary)] focus:outline-none" />
        </div>
      )}

      {/* List */}
      {loading ? (
        <AdminLoadingState label="Loading instructors…" className="min-h-[30vh]" />
      ) : filtered.length === 0 ? (
        <AdminEmptyState title="No instructors found" description="Add an instructor or adjust your search." />
      ) : (
        <div className="overflow-visible rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
            <p className="text-sm font-bold text-slate-900">All instructors</p>
            <p className="text-xs text-slate-500">{filtered.length} shown</p>
          </div>
          <div className="divide-y divide-slate-100">
            {filtered.map((i) => {
              const centerName = trainingCenters.find((c) => c.id === i.trainingCenterId)?.name || i.trainingCenterName || '—';
              const disciplineLabel = disciplines.find((d) => d.value === i.preferredDiscipline)?.label || i.preferredDiscipline || '—';
              return (
                <div key={i.id} className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-slate-50/70">
                  {i.profilePhotoUrl ? (
                    <img src={i.profilePhotoUrl} alt="" className="size-11 shrink-0 rounded-full object-cover border border-slate-200" />
                  ) : (
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                      <UserCog className="size-5" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-slate-900">{i.fullName}</p>
                    <p className="truncate text-xs text-slate-500">{i.email}</p>
                    <p className="mt-0.5 text-xs text-slate-400">{centerName} · {disciplineLabel}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <div className="hidden sm:flex items-center gap-2">
                      <span className="text-xs text-slate-500"><Users className="inline size-3.5 mr-0.5" />{i._count?.students ?? 0}</span>
                      <AdminBadge variant={i.isActive ? 'success' : 'warning'} size="sm">{i.isActive ? 'Active' : 'Inactive'}</AdminBadge>
                    </div>
                    <button onClick={() => setDetailInstructor(i)} className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">View</button>
                    <InstructorMenu
                      isActive={i.isActive}
                      onView={() => setDetailInstructor(i)}
                      onEdit={() => showFlash('Edit form — coming soon (backend update endpoint pending).', 'error')}
                      onAssign={() => { setAssignInstructor(i); setDetailInstructor(null); }}
                      onPause={() => void handlePause(i)}
                      onArchive={() => void handleArchive(i)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Detail drawer */}
      {detailInstructor && (
        <InstructorDetailDrawer
          instructor={detailInstructor}
          onClose={() => setDetailInstructor(null)}
          onEdit={() => showFlash('Edit form — coming soon (backend update endpoint pending).', 'error')}
          onAssign={() => { setAssignInstructor(detailInstructor); setDetailInstructor(null); }}
          onPause={() => void handlePause(detailInstructor)}
          onResetPassword={() => void handleResetPassword(detailInstructor)}
          trainingCenters={trainingCenters}
          disciplines={disciplines}
        />
      )}

      {/* Assign modal */}
      {assignInstructor && (
        <AssignModal
          instructor={assignInstructor}
          onClose={() => setAssignInstructor(null)}
          onSave={(c, d) => void handleAssignSave(c, d)}
          trainingCenters={trainingCenters}
          disciplines={disciplines}
          submitting={assignSubmitting}
        />
      )}
    </PageContainer>
  );
}
