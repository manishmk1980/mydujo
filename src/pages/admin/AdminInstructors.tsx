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
  MoreHorizontal, Edit, Pause, CheckCircle2, MapPin, BookOpen,
  Users, Key, X, Search, ClipboardList, ExternalLink, Trash2,
} from 'lucide-react';
import { PageContainer } from '../../components/layout/PageContainer';
import { AdminErrorState } from '../../components/admin/ui/AdminErrorState';
import { AdminLoadingState } from '../../components/admin/ui/AdminLoadingState';
import { AdminEmptyState } from '../../components/admin/ui/AdminEmptyState';
import { AdminBadge } from '../../components/admin/ui/AdminBadge';
import { useAdminConfirm } from '../../components/admin/ui/AdminConfirmProvider';
import { instructorService, type Instructor } from '../../services/instructorService';
import { trainingCenterService, type TrainingCenter } from '../../services/trainingCenterService';
import { metaService, type DisciplineOption } from '../../services/metaService';
import { storageService } from '../../services/storageService';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { cn } from '../../lib/utils';
import { InstructorDetailModal } from '../../components/admin/instructors/InstructorDetailModal';
import { parseInstructorBioSections } from '../../utils/instructorVerification';

type InstructorExt = Instructor & { _count?: { students: number; classes: number; centers?: number } };

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

function InstructorMenu({ onView, onEdit, onAssign, onPause, onDelete, isActive, canManageAccount }: {
  onView: () => void; onEdit: () => void; onAssign: () => void;
  onPause: () => void; onDelete: () => void; isActive: boolean; canManageAccount: boolean;
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
    ...(canManageAccount ? [
      { label: 'Assign centers', icon: MapPin, action: onAssign },
      { label: isActive ? 'Suspend access' : 'Restore access', icon: isActive ? Pause : CheckCircle2, action: onPause },
      { label: 'Delete', icon: Trash2, action: onDelete },
    ] : []),
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

function AssignModal({ instructor, onClose, onSave, trainingCenters, submitting }: {
  instructor: InstructorExt; onClose: () => void;
  onSave: (assignments: Array<{ trainingCenterId: string; canViewStudents: boolean; canManageAttendance: boolean; canManageGrading: boolean; canManageClasses: boolean }>) => void;
  trainingCenters: TrainingCenter[];
  submitting: boolean;
}) {
  const [assignments, setAssignments] = useState<Record<string, { canViewStudents: boolean; canManageAttendance: boolean; canManageGrading: boolean; canManageClasses: boolean }>>(
    Object.fromEntries((instructor.assignedCenters || []).map((center) => [center.id, { ...center.authorities }]))
  );
  const toggleCenter = (id: string) => setAssignments((current) => {
    const next = { ...current };
    if (next[id]) delete next[id];
    else next[id] = { canViewStudents: true, canManageAttendance: false, canManageGrading: false, canManageClasses: false };
    return next;
  });
  const toggleAuthority = (centerId: string, key: keyof (typeof assignments)[string]) => setAssignments((current) => ({
    ...current,
    [centerId]: { ...current[centerId], [key]: !current[centerId][key] },
  }));
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900">Assign: {instructor.fullName}</h3>
            <p className="mt-0.5 text-xs text-slate-500">Assign multiple centers and grant responsibilities progressively.</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><X className="size-4" /></button>
        </div>
        <div className="space-y-3">
          {trainingCenters.map((center) => {
            const selected = assignments[center.id];
            return (
              <div key={center.id} className={cn('rounded-xl border p-4', selected ? 'border-violet-300 bg-violet-50/50' : 'border-slate-200')}>
                <label className="flex cursor-pointer items-center gap-3 font-bold text-slate-900">
                  <input type="checkbox" checked={Boolean(selected)} onChange={() => toggleCenter(center.id)} className="size-4 accent-violet-600" />
                  <span>{center.name}</span>
                  <span className="ml-auto text-xs font-medium text-slate-500">{[center.city, center.state].filter(Boolean).join(', ')}</span>
                </label>
                {selected && (
                  <div className="mt-3 grid gap-2 border-t border-violet-200 pt-3 sm:grid-cols-2">
                    {([
                      ['canViewStudents', 'View center students'],
                      ['canManageAttendance', 'Manage attendance'],
                      ['canManageGrading', 'Manage grading'],
                      ['canManageClasses', 'Manage classes'],
                    ] as const).map(([key, label]) => (
                      <label key={key} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                        <input type="checkbox" checked={selected[key]} onChange={() => toggleAuthority(center.id, key)} className="size-4 accent-violet-600" /> {label}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {trainingCenters.length === 0 && <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">No active training centers are available.</p>}
        </div>
        <div className="mt-5 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">Cancel</button>
          <button disabled={submitting} onClick={() => onSave(Object.entries(assignments).map(([trainingCenterId, authorities]) => ({ trainingCenterId, ...authorities })))} className="inline-flex items-center gap-2 rounded-xl bg-[var(--admin-primary)] px-5 py-2.5 text-sm font-bold text-white hover:bg-[var(--admin-primary-hover)] disabled:opacity-50">
            {submitting && <Loader2 className="size-4 animate-spin" />} Save responsibilities
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-extrabold text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function EditInstructorModal({ instructor, saving, onClose, onSave }: {
  instructor: InstructorExt;
  saving: boolean;
  onClose: () => void;
  onSave: (data: { fullName: string; phone: string; city: string; state: string; internalNote: string }) => void;
}) {
  const [form, setForm] = useState({
    fullName: instructor.fullName,
    phone: instructor.phone || '',
    city: instructor.city || '',
    state: instructor.state || '',
    internalNote: parseInstructorBioSections(instructor.bio).cleanBio || '',
  });
  const valid = form.fullName.trim().length > 1
    && (!form.phone.trim() || /^[+]?[\d\s().-]{7,20}$/.test(form.phone.trim()));
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 p-4" onClick={onClose}>
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="edit-instructor-title">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="edit-instructor-title" className="text-lg font-black text-slate-900">Edit instructor details</h2>
            <p className="mt-1 text-sm text-slate-500">Login email and center responsibilities use separate secured flows.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100" aria-label="Close"><X className="size-5" /></button>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Full name"><input maxLength={255} className={inputCls} value={form.fullName} onChange={(e) => setForm((value) => ({ ...value, fullName: e.target.value }))} /></Field>
          <Field label="Phone"><input maxLength={32} className={inputCls} value={form.phone} onChange={(e) => setForm((value) => ({ ...value, phone: e.target.value }))} /></Field>
          <Field label="City"><input maxLength={128} className={inputCls} value={form.city} onChange={(e) => setForm((value) => ({ ...value, city: e.target.value }))} /></Field>
          <Field label="State"><input maxLength={128} className={inputCls} value={form.state} onChange={(e) => setForm((value) => ({ ...value, state: e.target.value }))} /></Field>
          <div className="sm:col-span-2"><Field label="Internal note"><textarea maxLength={512} className={cn(inputCls, 'min-h-24')} value={form.internalNote} onChange={(e) => setForm((value) => ({ ...value, internalNote: e.target.value }))} /></Field></div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="min-h-11 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-700">Cancel</button>
          <button type="button" disabled={!valid || saving} onClick={() => onSave(form)} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--admin-primary)] px-5 text-sm font-black text-white disabled:opacity-50">
            {saving && <Loader2 className="size-4 animate-spin" />} Save details
          </button>
        </div>
      </div>
    </div>
  );
}

function TemporaryCredentialsModal({ credentials, onClose }: {
  credentials: { username: string; temporaryPassword: string; loginUrl: string };
  onClose: () => void;
}) {
  const copyText = `Your MDPL MyDojo instructor login has been enabled.\n\nLogin URL: ${credentials.loginUrl}\nUsername: ${credentials.username}\nTemporary password: ${credentials.temporaryPassword}\n\nPlease sign in and update your profile details.`;
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/70 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
        <h2 className="text-lg font-black text-slate-900">Temporary instructor credentials</h2>
        <p className="mt-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-900">This password is shown only once. Copy it now and ask the instructor to change it after login.</p>
        <div className="mt-4 space-y-3 rounded-xl bg-slate-950 p-4 font-mono text-sm text-white">
          <div><span className="text-slate-400">Username</span><p className="break-all">{credentials.username}</p></div>
          <div><span className="text-slate-400">Temporary password</span><p className="break-all text-orange-300">{credentials.temporaryPassword}</p></div>
        </div>
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button type="button" onClick={() => void navigator.clipboard.writeText(copyText)} className="min-h-11 rounded-xl bg-orange-600 px-4 text-sm font-black text-white">Copy credentials</button>
          <button type="button" onClick={onClose} className="min-h-11 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-700">I have copied them</button>
        </div>
      </div>
    </div>
  );
}

export default function AdminInstructors() {
  const navigate = useNavigate();
  const { adminUser } = useAdminAuth();
  const canPublish = Boolean(adminUser?.roles?.includes('SUPER_ADMIN'));
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
  const [editInstructor, setEditInstructor] = useState<InstructorExt | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [temporaryCredentials, setTemporaryCredentials] = useState<{ username: string; temporaryPassword: string; loginUrl: string } | null>(null);

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
      title: isActive ? 'Suspend account access?' : 'Restore account access?',
      description: isActive
        ? 'This will prevent the instructor from logging in but will not delete their profile. Continue?'
        : `"${i.fullName}" will be able to log in again when access is restored and the account is approved.`,
      confirmLabel: isActive ? 'Suspend access' : 'Restore access',
      cancelLabel: 'Cancel',
      variant: isActive ? 'warning' : 'default',
    });
    if (!ok) return;
    try {
      if (isActive) {
        if (i.approvalStatus === 'APPROVED') {
          await instructorService.updateApplicationStatus(i.id, 'SUSPENDED');
        } else {
          await instructorService.updateInstructor(i.id, { isActive: false, canLogin: false });
        }
      } else if (i.approvalStatus === 'SUSPENDED') {
        await instructorService.updateApplicationStatus(i.id, 'APPROVED');
      } else {
        await instructorService.updateInstructor(i.id, { isActive: true, canLogin: true });
      }
      await fetchAll();
      setDetailInstructor((current) => (current?.id === i.id ? null : current));
      showFlash(`${i.fullName} ${isActive ? 'access suspended' : 'access restored'}.`);
    } catch (error) {
      showFlash(error instanceof Error ? error.message : 'Failed to update instructor status.', 'error');
    }
  };

  const handleDelete = async (i: InstructorExt) => {
    const ok = await confirm({
      title: 'Delete instructor permanently?',
      description: `"${i.fullName}" and their instructor login will be permanently deleted. Student records remain, but instructor assignments are removed. This cannot be undone.`,
      confirmLabel: 'Delete instructor',
      cancelLabel: 'Cancel',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await instructorService.deleteInstructor(i.id);
      setInstructors((prev) => prev.filter((x) => x.id !== i.id));
      setDetailInstructor(null);
      showFlash(`${i.fullName} was deleted.`);
    } catch (error) {
      showFlash(error instanceof Error ? error.message : 'Failed to delete instructor.', 'error');
    }
  };

  const handleAssignSave = async (assignments: Array<{ trainingCenterId: string; canViewStudents: boolean; canManageAttendance: boolean; canManageGrading: boolean; canManageClasses: boolean }>) => {
    if (!assignInstructor) return;
    setAssignSubmitting(true);
    try {
      await instructorService.updateCenterAssignments(assignInstructor.id, assignments);
      await fetchAll();
      showFlash('Center responsibilities updated.');
    } catch (error) {
      showFlash(error instanceof Error ? error.message : 'Failed to update responsibilities.', 'error');
    } finally {
      setAssignSubmitting(false);
      setAssignInstructor(null);
      setDetailInstructor(null);
    }
  };

  const handleResetPassword = async (i: InstructorExt) => {
    const ok = await confirm({
      title: 'Create a temporary password?',
      description: 'This creates a new secure temporary password. The old password and active sessions will stop working. Continue?',
      confirmLabel: 'Reset password',
      cancelLabel: 'Cancel',
      variant: 'warning',
    });
    if (!ok) return;
    try {
      const credentials = await instructorService.resetInstructorPassword(i.id);
      setTemporaryCredentials(credentials);
      setInstructors((previous) => previous.map((item) => item.id === i.id ? { ...item, isActive: true, canLogin: true } : item));
      setDetailInstructor((current) => current?.id === i.id ? { ...current, isActive: true, canLogin: true } : current);
    } catch (e) {
      showFlash(e instanceof Error ? e.message : 'Failed to reset password.', 'error');
    }
  };

  const handleEditSave = async (data: { fullName: string; phone: string; city: string; state: string; internalNote: string }) => {
    if (!editInstructor) return;
    setEditSubmitting(true);
    try {
      const updated = await instructorService.updateInstructorDetails(editInstructor.id, {
        fullName: data.fullName.trim(),
        phone: data.phone.trim() || null,
        city: data.city.trim() || null,
        state: data.state.trim() || null,
        internalNote: data.internalNote.trim() || null,
      });
      const next = { ...editInstructor, ...updated };
      setInstructors((previous) => previous.map((item) => item.id === next.id ? { ...item, ...next } : item));
      setDetailInstructor((current) => current?.id === next.id ? { ...current, ...next } : current);
      setEditInstructor(null);
      showFlash('Instructor details updated.');
    } catch (error) {
      showFlash(error instanceof Error ? error.message : 'Failed to update instructor.', 'error');
    } finally {
      setEditSubmitting(false);
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
      <div className="mb-4 flex justify-end">
          <div className="flex w-full gap-2 sm:w-auto">
            <button type="button" onClick={() => void fetchAll()} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">
              <RefreshCw className="size-4" /> Refresh
            </button>
            {canPublish && <button type="button" onClick={() => setShowForm((s) => !s)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--admin-primary)] px-4 py-2 text-sm font-bold text-white hover:bg-[var(--admin-primary-hover)]">
              <Plus className="size-4" /> Add instructor
            </button>}
          </div>
      </div>

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
                      canManageAccount={canPublish}
                      onView={() => setDetailInstructor(i)}
                      onEdit={() => setEditInstructor(i)}
                      onAssign={() => { setAssignInstructor(i); setDetailInstructor(null); }}
                      onPause={() => void handlePause(i)}
                      onDelete={() => void handleDelete(i)}
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
        <InstructorDetailModal
          instructor={detailInstructor}
          onClose={() => setDetailInstructor(null)}
          onEdit={() => setEditInstructor(detailInstructor)}
          onAssign={() => { setAssignInstructor(detailInstructor); setDetailInstructor(null); }}
          onSuspend={() => void handlePause(detailInstructor)}
          onResetPassword={() => void handleResetPassword(detailInstructor)}
          onDelete={() => void handleDelete(detailInstructor)}
          onPublicSaved={(updated) => {
            setInstructors((previous) => previous.map((item) => item.id === updated.id ? updated : item));
            setDetailInstructor(updated);
          }}
          onApplicationUpdated={(updated) => {
            setInstructors((previous) => previous.map((item) => item.id === updated.id ? { ...item, ...updated } : item));
            setDetailInstructor((current) => current?.id === updated.id ? { ...current, ...updated } : current);
          }}
          canPublish={canPublish}
          trainingCenters={trainingCenters}
          disciplines={disciplines}
        />
      )}

      {/* Assign modal */}
      {assignInstructor && (
        <AssignModal
          instructor={assignInstructor}
          onClose={() => setAssignInstructor(null)}
          onSave={(assignments) => void handleAssignSave(assignments)}
          trainingCenters={trainingCenters}
          submitting={assignSubmitting}
        />
      )}
      {editInstructor && (
        <EditInstructorModal
          instructor={editInstructor}
          saving={editSubmitting}
          onClose={() => setEditInstructor(null)}
          onSave={(data) => void handleEditSave(data)}
        />
      )}
      {temporaryCredentials && (
        <TemporaryCredentialsModal credentials={temporaryCredentials} onClose={() => setTemporaryCredentials(null)} />
      )}
    </PageContainer>
  );
}
