/**
 * Admin: Training Centers
 * Full operational management — view, add, edit, pause, reactivate, archive.
 * All status changes persist to backend via PATCH /training-centers/:id
 * and DELETE /training-centers/:id (soft archive).
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  MapPin, Plus, Loader2, RefreshCw, Search, Edit, Pause, Archive,
  CheckCircle2, MoreHorizontal, X, Users, UserCog,
} from 'lucide-react';
import { AdminPageHeader } from '../../components/admin/ui/AdminPageHeader';
import { AdminErrorState } from '../../components/admin/ui/AdminErrorState';
import { AdminLoadingState } from '../../components/admin/ui/AdminLoadingState';
import { AdminEmptyState } from '../../components/admin/ui/AdminEmptyState';
import { AdminBadge } from '../../components/admin/ui/AdminBadge';
import { useAdminConfirm } from '../../components/admin/ui/AdminConfirmProvider';
import { trainingCenterService, type TrainingCenter } from '../../services/trainingCenterService';
import { instructorService } from '../../services/instructorService';

// ─── Types ────────────────────────────────────────────────────────────────────

type CenterStatus = 'ACTIVE' | 'PAUSED' | 'ARCHIVED';

const emptyForm = { name: '', slug: '', address: '', instructorName: '', pincode: '', city: '', state: '' };

function resolveStatus(c: TrainingCenter): CenterStatus {
  const s = (c.status || 'ACTIVE').toUpperCase();
  if (s === 'PAUSED') return 'PAUSED';
  if (s === 'ARCHIVED') return 'ARCHIVED';
  return 'ACTIVE';
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${accent ? 'border-[var(--admin-primary)]/30 bg-[color-mix(in_srgb,var(--admin-primary)_5%,white)]' : 'border-slate-200 bg-white'}`}>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="mt-0.5 text-xs font-medium text-slate-500">{label}</p>
    </div>
  );
}

// ─── Center form modal ────────────────────────────────────────────────────────

interface CenterFormModalProps {
  title: string;
  form: typeof emptyForm;
  onChange: (f: typeof emptyForm) => void;
  onSubmit: () => void;
  onCancel: () => void;
  submitting: boolean;
  instructorNames: string[];
}

function CenterFormModal({ title, form, onChange, onSubmit, onCancel, submitting, instructorNames }: CenterFormModalProps) {
  const f = (k: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...form, [k]: e.target.value });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 backdrop-blur-sm sm:p-4" onClick={onCancel}>
      <div className="w-full max-w-2xl overflow-y-auto max-h-[94dvh] rounded-2xl border border-slate-200 bg-white shadow-2xl sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
          <h3 className="font-bold text-slate-900">{title}</h3>
          <button onClick={onCancel} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><X className="size-4" /></button>
        </div>
        <div className="p-5 sm:p-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Name *</label>
              <input className={inputCls} value={form.name} onChange={f('name')} placeholder="e.g. Kolkata North Dojo" required />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Slug (optional)</label>
              <input className={inputCls} value={form.slug} onChange={f('slug')} placeholder="e.g. kolkata_north" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Primary Instructor</label>
              <input className={inputCls} value={form.instructorName} onChange={f('instructorName')} placeholder="e.g. Sensei Arjun" list="tc-instructor-opts" />
              <datalist id="tc-instructor-opts">{instructorNames.map((n) => <option key={n} value={n} />)}</datalist>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Address</label>
              <input className={inputCls} value={form.address} onChange={f('address')} placeholder="Full address" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wide text-slate-500">PIN Code</label>
              <input className={inputCls} value={form.pincode} onChange={(e) => onChange({ ...form, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })} placeholder="6-digit PIN" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wide text-slate-500">City</label>
              <input className={inputCls} value={form.city} onChange={f('city')} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wide text-slate-500">State</label>
              <input className={inputCls} value={form.state} onChange={f('state')} />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 border-t border-slate-200 px-5 py-4 sm:px-6">
          <button onClick={onCancel} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">Cancel</button>
          <button onClick={onSubmit} disabled={submitting || !form.name.trim()} className="inline-flex items-center gap-2 rounded-xl bg-[var(--admin-primary)] px-5 py-2.5 text-sm font-bold text-white hover:bg-[var(--admin-primary-hover)] disabled:opacity-50">
            {submitting && <Loader2 className="size-4 animate-spin" />} Save
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Center detail drawer ─────────────────────────────────────────────────────

function CenterDetailDrawer({ center, onClose, onEdit, onPause, onArchive }: {
  center: TrainingCenter; onClose: () => void;
  onEdit: () => void; onPause: () => void; onArchive: () => void;
}) {
  const status = resolveStatus(center);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 p-2 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--admin-warning)_15%,transparent)]">
              <MapPin className="size-5 text-[var(--admin-warning)]" />
            </div>
            <div>
              <p className="font-bold text-slate-900">{center.name}</p>
              <StatusBadge status={status} />
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><X className="size-4" /></button>
        </div>
        <div className="divide-y divide-slate-100 px-5 py-4 space-y-0">
          <InfoRow label="Slug" value={center.slug || '—'} />
          <InfoRow label="Address" value={[center.address, center.pincode, center.city, center.state].filter(Boolean).join(', ') || '—'} />
          <InfoRow label="Primary Instructor" value={center.instructor_name || '—'} />
          <InfoRow label="Created" value={center.created_at ? new Date(center.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'} />
          {center.status_note && <InfoRow label="Status Note" value={center.status_note} />}
          <div className="py-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Assignments</p>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-1.5 text-slate-500"><Users className="size-4" /> Students: —</div>
              <div className="flex items-center gap-1.5 text-slate-500"><UserCog className="size-4" /> Instructors: —</div>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 border-t border-slate-200 px-5 py-4">
          {status !== 'ARCHIVED' && (
            <button onClick={onEdit} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"><Edit className="size-3.5" /> Edit</button>
          )}
          {status === 'ACTIVE' ? (
            <button onClick={onPause} className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700 hover:bg-amber-100"><Pause className="size-3.5" /> Pause</button>
          ) : status === 'PAUSED' ? (
            <button onClick={onPause} className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100"><CheckCircle2 className="size-3.5" /> Reactivate</button>
          ) : null}
          {status !== 'ARCHIVED' && (
            <button onClick={onArchive} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50"><Archive className="size-3.5" /> Archive</button>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="py-2.5">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: CenterStatus }) {
  if (status === 'PAUSED') return <AdminBadge variant="warning" size="sm">Paused</AdminBadge>;
  if (status === 'ARCHIVED') return <AdminBadge variant="neutral" size="sm">Archived</AdminBadge>;
  return <AdminBadge variant="success" size="sm">Active</AdminBadge>;
}

// ─── Action dropdown ──────────────────────────────────────────────────────────

function ActionMenu({ onView, onEdit, onPause, onArchive, status }: {
  onView: () => void; onEdit: () => void;
  onPause: () => void; onArchive: () => void;
  status: CenterStatus;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-700"
        aria-label="Actions"
      >
        <MoreHorizontal className="size-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-[9999] mt-1 w-44 overflow-visible rounded-xl border border-slate-200 bg-white shadow-lg">
          {([
            { label: 'View details', action: onView, icon: MapPin, show: true },
            { label: 'Edit center', action: onEdit, icon: Edit, show: status !== 'ARCHIVED' },
            { label: status === 'PAUSED' ? 'Reactivate' : 'Pause center', action: onPause, icon: status === 'PAUSED' ? CheckCircle2 : Pause, show: status !== 'ARCHIVED' },
            { label: 'Archive', action: onArchive, icon: Archive, show: status !== 'ARCHIVED' },
          ] as const).filter((x) => x.show).map(({ label, action, icon: Icon }) => (
            <button
              key={label}
              onClick={() => { action(); setOpen(false); }}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <Icon className="size-4 text-slate-400" /> {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

const inputCls = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-[var(--admin-primary)] focus:outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--admin-primary)_15%,transparent)]';

export default function AdminTrainingCenters() {
  const [centers, setCenters] = useState<TrainingCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [instructorNames, setInstructorNames] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | CenterStatus>('ALL');

  const [addOpen, setAddOpen] = useState(false);
  const [editCenter, setEditCenter] = useState<TrainingCenter | null>(null);
  const [detailCenter, setDetailCenter] = useState<TrainingCenter | null>(null);
  const [addForm, setAddForm] = useState(emptyForm);
  const [editForm, setEditForm] = useState(emptyForm);
  const [flash, setFlash] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [pauseDialog, setPauseDialog] = useState<{ center: TrainingCenter } | null>(null);
  const [pauseReason, setPauseReason] = useState('');

  const confirm = useAdminConfirm();

  const showFlash = (text: string, type: 'success' | 'error' = 'success') => {
    setFlash({ text, type });
    setTimeout(() => setFlash(null), 4000);
  };

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await trainingCenterService.getAllTrainingCenters();
      setCenters(data || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load training centers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    instructorService.getAllInstructorsAdmin().then((list) => {
      const names = Array.from(new Set((list || []).map((i) => i.fullName?.trim()).filter(Boolean) as string[]));
      setInstructorNames(names);
    }).catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return centers.filter((c) => {
      if (statusFilter !== 'ALL' && resolveStatus(c) !== statusFilter) return false;
      if (!q) return true;
      return (
        c.name?.toLowerCase().includes(q) ||
        c.city?.toLowerCase().includes(q) ||
        c.state?.toLowerCase().includes(q) ||
        c.instructor_name?.toLowerCase().includes(q)
      );
    });
  }, [centers, search, statusFilter]);

  const counts = {
    total: centers.length,
    active: centers.filter((c) => resolveStatus(c) === 'ACTIVE').length,
    paused: centers.filter((c) => resolveStatus(c) === 'PAUSED').length,
    archived: centers.filter((c) => resolveStatus(c) === 'ARCHIVED').length,
  };

  const handleAdd = async () => {
    if (!addForm.name.trim()) return;
    setSubmitting(true);
    try {
      await trainingCenterService.createTrainingCenter({
        name: addForm.name.trim(),
        slug: addForm.slug.trim() || undefined,
        address: addForm.address.trim() || undefined,
        instructor_name: addForm.instructorName.trim() || undefined,
        pincode: addForm.pincode.trim() || undefined,
        city: addForm.city.trim() || undefined,
        state: addForm.state.trim() || undefined,
      });
      setAddForm(emptyForm);
      setAddOpen(false);
      await load();
      showFlash('Training center added successfully.');
    } catch (e) {
      showFlash(e instanceof Error ? e.message : 'Failed to add center', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!editCenter || !editForm.name.trim()) return;
    setSubmitting(true);
    try {
      const updated = await trainingCenterService.updateTrainingCenter(editCenter.id, {
        name: editForm.name.trim(),
        slug: editForm.slug.trim() || undefined,
        address: editForm.address.trim() || undefined,
        instructor_name: editForm.instructorName.trim() || undefined,
        pincode: editForm.pincode.trim() || undefined,
        city: editForm.city.trim() || undefined,
        state: editForm.state.trim() || undefined,
      });
      setCenters((prev) => prev.map((c) => c.id === editCenter.id ? updated : c));
      setEditCenter(null);
      showFlash('Center updated.');
    } catch (e) {
      showFlash(e instanceof Error ? e.message : 'Update failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (c: TrainingCenter) => {
    setEditForm({ name: c.name, slug: c.slug || '', address: c.address || '', instructorName: c.instructor_name || '', pincode: c.pincode || '', city: c.city || '', state: c.state || '' });
    setEditCenter(c);
    setDetailCenter(null);
  };

  const openPause = (c: TrainingCenter) => {
    setPauseReason('');
    setPauseDialog({ center: c });
    setDetailCenter(null);
  };

  const confirmPause = async () => {
    if (!pauseDialog) return;
    const c = pauseDialog.center;
    const isReactivating = resolveStatus(c) === 'PAUSED';
    const newStatus: CenterStatus = isReactivating ? 'ACTIVE' : 'PAUSED';
    setSubmitting(true);
    try {
      const updated = await trainingCenterService.updateTrainingCenterStatus(
        c.id,
        newStatus,
        isReactivating ? undefined : (pauseReason || undefined),
      );
      setCenters((prev) => prev.map((x) => x.id === c.id ? updated : x));
      showFlash(isReactivating ? 'Center reactivated.' : 'Center paused.');
      setPauseDialog(null);
    } catch (e) {
      showFlash(e instanceof Error ? e.message : 'Status update failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleArchive = async (c: TrainingCenter) => {
    const ok = await confirm({
      title: 'Archive center?',
      description: `"${c.name}" will be archived and removed from active assignment lists. Students and instructors remain assigned but the center will no longer appear as active.`,
      confirmLabel: 'Archive',
      cancelLabel: 'Cancel',
      variant: 'danger',
    });
    if (!ok) return;
    setSubmitting(true);
    try {
      const updated = await trainingCenterService.archiveTrainingCenter(c.id);
      if (updated) {
        setCenters((prev) => prev.map((x) => x.id === c.id ? updated : x));
      } else {
        setCenters((prev) => prev.map((x) => x.id === c.id ? { ...x, status: 'ARCHIVED' } : x));
      }
      setDetailCenter(null);
      showFlash('Center archived.');
    } catch (e) {
      showFlash(e instanceof Error ? e.message : 'Archive failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-w-0 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <AdminPageHeader
        title="Training centers"
        subtitle="Manage academy locations, assignments, and operational status."
        actions={
          <div className="flex w-full gap-2 sm:w-auto">
            <button type="button" onClick={() => void load()} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">
              <RefreshCw className="size-4" />
            </button>
            <button type="button" onClick={() => setAddOpen(true)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--admin-primary)] px-5 py-2.5 text-sm font-bold text-white hover:bg-[var(--admin-primary-hover)] sm:flex-none">
              <Plus className="size-4" /> Add center
            </button>
          </div>
        }
      />

      {flash && (
        <div className={`rounded-2xl border p-4 text-sm font-medium ${flash.type === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
          {flash.text}
        </div>
      )}

      {error && <AdminErrorState message={error} />}

      {/* Stats */}
      {!loading && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Total Centers" value={counts.total} />
          <StatCard label="Active" value={counts.active} accent />
          <StatCard label="Paused" value={counts.paused} />
          <StatCard label="Archived" value={counts.archived} />
        </div>
      )}

      {/* Search + Filter */}
      {!loading && (
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, city, state, instructor…" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm focus:border-[var(--admin-primary)] focus:outline-none" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:outline-none">
            <option value="ALL">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="PAUSED">Paused</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      )}

      {/* List */}
      {loading ? (
        <AdminLoadingState label="Loading centers…" className="min-h-[40vh]" />
      ) : filtered.length === 0 ? (
        <AdminEmptyState title="No training centers found" description="Add a center or adjust your filters." />
      ) : (
        <div className="overflow-visible rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
            <p className="text-sm font-bold text-slate-900">All locations</p>
            <p className="text-xs text-slate-500">{filtered.length} shown</p>
          </div>
          <div className="divide-y divide-slate-100">
            {filtered.map((c) => {
              const status = resolveStatus(c);
              return (
                <div key={c.id} className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-slate-50/70">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--admin-warning)_15%,transparent)]">
                    <MapPin className="size-5 text-[var(--admin-warning)]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-slate-900">{c.name}</p>
                    <p className="truncate text-xs text-slate-500">
                      {[c.address, c.city, c.state, c.pincode].filter(Boolean).join(' · ') || c.slug || '—'}
                    </p>
                    {c.instructor_name && <p className="mt-0.5 text-xs text-slate-400">Instructor: {c.instructor_name}</p>}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <StatusBadge status={status} />
                    <button onClick={() => setDetailCenter(c)} className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">View</button>
                    <ActionMenu
                      onView={() => setDetailCenter(c)}
                      onEdit={() => openEdit(c)}
                      onPause={() => openPause(c)}
                      onArchive={() => void handleArchive(c)}
                      status={status}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add modal */}
      {addOpen && (
        <CenterFormModal
          title="New Training Center"
          form={addForm}
          onChange={setAddForm}
          onSubmit={() => void handleAdd()}
          onCancel={() => { setAddOpen(false); setAddForm(emptyForm); }}
          submitting={submitting}
          instructorNames={instructorNames}
        />
      )}

      {/* Edit modal */}
      {editCenter && (
        <CenterFormModal
          title={`Edit: ${editCenter.name}`}
          form={editForm}
          onChange={setEditForm}
          onSubmit={() => void handleEdit()}
          onCancel={() => setEditCenter(null)}
          submitting={submitting}
          instructorNames={instructorNames}
        />
      )}

      {/* Detail drawer */}
      {detailCenter && (
        <CenterDetailDrawer
          center={detailCenter}
          onClose={() => setDetailCenter(null)}
          onEdit={() => openEdit(detailCenter)}
          onPause={() => openPause(detailCenter)}
          onArchive={() => void handleArchive(detailCenter)}
        />
      )}

      {/* Pause / Reactivate dialog */}
      {pauseDialog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm" onClick={() => setPauseDialog(null)}>
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-slate-900">
              {resolveStatus(pauseDialog.center) === 'PAUSED' ? 'Reactivate center?' : 'Pause center?'}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {resolveStatus(pauseDialog.center) === 'PAUSED'
                ? `"${pauseDialog.center.name}" will be marked as active again.`
                : `"${pauseDialog.center.name}" will be paused. Students and instructors remain assigned.`}
            </p>
            {resolveStatus(pauseDialog.center) !== 'PAUSED' && (
              <div className="mt-4 space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Reason (required)</label>
                <textarea rows={3} value={pauseReason} onChange={(e) => setPauseReason(e.target.value)} placeholder="Briefly explain why this center is being paused…" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none" />
              </div>
            )}
            <div className="mt-5 flex justify-end gap-3">
              <button onClick={() => setPauseDialog(null)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">Cancel</button>
              <button
                disabled={submitting || (resolveStatus(pauseDialog.center) !== 'PAUSED' && !pauseReason.trim())}
                onClick={() => void confirmPause()}
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--admin-warning)] px-5 py-2.5 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50"
              >
                {submitting && <Loader2 className="size-4 animate-spin" />}
                {resolveStatus(pauseDialog.center) === 'PAUSED' ? 'Reactivate' : 'Pause center'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
