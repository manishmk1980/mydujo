import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Loader2, UserCog, RefreshCw, Eye, EyeOff, Upload } from 'lucide-react';
import { PageContainer } from '../../components/layout/PageContainer';
import { PageHeader } from '../../components/layout/PageHeader';
import { instructorService, type Instructor } from '../../services/instructorService';
import { cn } from '../../lib/utils';
import { storageService } from '../../services/storageService';
import { trainingCenterService, type TrainingCenter } from '../../services/trainingCenterService';
import { metaService, type DisciplineOption } from '../../services/metaService';

export default function AdminInstructors() {
  const [instructors, setInstructors] = useState<(Instructor & { _count?: { students: number; classes: number } })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [trainingCenters, setTrainingCenters] = useState<TrainingCenter[]>([]);
  const [disciplines, setDisciplines] = useState<DisciplineOption[]>([]);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    trainingCenterId: '',
    trainingCenterName: '',
    preferredDiscipline: '',
    bio: '',
    password: '',
    isActive: true,
    canLogin: true,
  });

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
      setInstructors([]);
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

  useEffect(() => {
    fetchAll();
    fetchOptions();
  }, []);

  const create = async () => {
    if (!canSubmit) return;
    try {
      setSubmitting(true);
      setError(null);
      let profilePhotoUrl: string | undefined;
      if (photoFile) {
        const ext = photoFile.name.split('.').pop() || 'png';
        const path = storageService.buildInstructorPhotoPath(`${crypto.randomUUID()}.${ext}`);
        await storageService.uploadProfilePhoto(photoFile, path);
        profilePhotoUrl = storageService.getPublicUrl(path);
      }
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
        profilePhotoUrl,
        isActive: form.isActive,
        canLogin: form.canLogin,
      });
      setShowForm(false);
      setPhotoFile(null);
      setPhotoPreview(null);
      setForm({
        fullName: '',
        email: '',
        phone: '',
        city: '',
        state: '',
        trainingCenterId: '',
        trainingCenterName: '',
        preferredDiscipline: '',
        bio: '',
        password: '',
        isActive: true,
        canLogin: true,
      });
      await fetchAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create instructor');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Instructors"
        description="Create and manage instructor accounts and access."
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fetchAll()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-sm hover:bg-slate-50"
            >
              <RefreshCw className="size-4" />
              Refresh
            </button>
            <button
              type="button"
              onClick={() => setShowForm((s) => !s)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90"
            >
              <Plus className="size-4" />
              Add Instructor
            </button>
          </div>
        }
      />

      {error && (
        <div className="p-4 rounded-2xl border border-red-200 bg-red-50 text-red-700 font-medium">
          {error}
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200">
              <UserCog className="size-5 text-slate-600" />
            </div>
            <div className="min-w-0">
              <p className="font-extrabold text-slate-900">New Instructor</p>
              <p className="text-sm text-slate-600">Creates an instructor profile and (optionally) login access.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Full name">
              <input className={inputCls} value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} />
            </Field>
            <Field label="Email">
              <input className={inputCls} value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            </Field>
            <Field label="Phone (optional)">
              <input className={inputCls} value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
            </Field>
            <Field label="Password (optional)">
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={cn(inputCls, 'pr-12')}
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder={form.canLogin ? 'At least 6 characters' : 'Optional'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </Field>
            <Field label="City (optional)">
              <input className={inputCls} value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} />
            </Field>
            <Field label="State (optional)">
              <input className={inputCls} value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))} />
            </Field>
            <Field label="Training center (optional)">
              <select
                className={inputCls}
                value={form.trainingCenterId}
                onChange={(e) => {
                  const center = trainingCenters.find((c) => c.id === e.target.value);
                  setForm((f) => ({
                    ...f,
                    trainingCenterId: center?.id || '',
                    trainingCenterName: center?.name || '',
                  }));
                }}
              >
                <option value="">Select training center</option>
                {trainingCenters.map((center) => (
                  <option key={center.id} value={center.id}>
                    {center.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Discipline (optional)">
              <select
                className={inputCls}
                value={form.preferredDiscipline}
                onChange={(e) => setForm((f) => ({ ...f, preferredDiscipline: e.target.value }))}
              >
                <option value="">Select discipline</option>
                {disciplines.map((discipline) => (
                  <option key={discipline.value} value={discipline.value}>
                    {discipline.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Profile picture (optional)">
              <label className={cn(inputCls, 'cursor-pointer flex items-center justify-between')}>
                <span className="text-sm text-slate-600 truncate">
                  {photoFile?.name || 'Upload image'}
                </span>
                <Upload className="size-4 text-slate-500" />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0] || null;
                    setPhotoFile(f);
                    if (!f) {
                      setPhotoPreview(null);
                      return;
                    }
                    const reader = new FileReader();
                    reader.onloadend = () => setPhotoPreview(String(reader.result || ''));
                    reader.readAsDataURL(f);
                  }}
                />
              </label>
              {photoPreview && (
                <img src={photoPreview} alt="Preview" className="mt-2 size-16 rounded-full object-cover border border-slate-200" />
              )}
            </Field>
            <div className="md:col-span-2">
              <Field label="Bio (optional)">
                <textarea className={cn(inputCls, 'min-h-24')} value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} />
              </Field>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
              <input
                type="checkbox"
                checked={form.canLogin}
                onChange={(e) => setForm((f) => ({ ...f, canLogin: e.target.checked }))}
                className="size-4 accent-primary"
              />
              Allow login
            </label>
            <button
              type="button"
              disabled={!canSubmit || submitting}
              onClick={create}
              className={cn(
                'inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-extrabold text-sm',
                !canSubmit || submitting
                  ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                  : 'bg-primary text-white hover:bg-primary/90'
              )}
            >
              {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
              Create
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <p className="font-extrabold text-slate-900">All instructors</p>
          <p className="text-sm text-slate-600">{instructors.length} total</p>
        </div>

        {loading ? (
          <div className="p-10 flex items-center justify-center text-slate-600">
            <Loader2 className="size-5 animate-spin mr-2" />
            Loading…
          </div>
        ) : instructors.length === 0 ? (
          <div className="p-10 text-center text-slate-600">No instructors found.</div>
        ) : (
          <div className="divide-y divide-slate-200">
            {instructors.map((i) => (
              <div key={i.id} className="px-6 py-4 flex items-center justify-between gap-6">
                <div className="min-w-0">
                  <p className="font-extrabold text-slate-900 truncate">{i.fullName}</p>
                  <p className="text-sm text-slate-600 truncate">{i.email}</p>
                </div>
                <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
                  <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200">
                    Students: {i._count?.students ?? 0}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200">
                    Classes: {i._count?.classes ?? 0}
                  </span>
                  <span
                    className={cn(
                      'px-3 py-1 rounded-full border',
                      i.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                    )}
                  >
                    {i.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageContainer>
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

const inputCls =
  'w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary';
