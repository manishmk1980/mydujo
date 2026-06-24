import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Loader2, Upload, UserCog } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { API_BASE } from '../config';
import { storageService } from '../services/storageService';
import { trainingCenterService, type TrainingCenter } from '../services/trainingCenterService';
import { metaService, type DisciplineOption } from '../services/metaService';

type FormState = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  city: string;
  state: string;
  trainingCenterId: string;
  trainingCenterName: string;
  preferredDiscipline: string;
  bio: string;
};

const initialForm: FormState = {
  fullName: '',
  email: '',
  phone: '',
  password: '',
  city: '',
  state: '',
  trainingCenterId: '',
  trainingCenterName: '',
  preferredDiscipline: '',
  bio: '',
};

export default function InstructorOnboarding() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [trainingCenters, setTrainingCenters] = useState<TrainingCenter[]>([]);
  const [disciplines, setDisciplines] = useState<DisciplineOption[]>([]);

  const canSubmit =
    form.fullName.trim().length > 1 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) &&
    form.password.length >= 6 &&
    Boolean(photoFile);

  const update = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    let mounted = true;
    Promise.all([
      trainingCenterService.getAllTrainingCenters().catch(() => [] as TrainingCenter[]),
      metaService.getDisciplines().catch(() => [] as DisciplineOption[]),
    ]).then(([centers, disciplineOptions]) => {
      if (!mounted) return;
      setTrainingCenters(centers || []);
      setDisciplines(disciplineOptions || []);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      let profilePhotoUrl: string | null = null;
      if (photoFile) {
        const ext = photoFile.name.split('.').pop() || 'png';
        const path = storageService.buildInstructorPhotoPath(`${crypto.randomUUID()}.${ext}`, true);
        await storageService.uploadProfilePhoto(photoFile, path);
        profilePhotoUrl = storageService.getPublicUrl(path);
      }

      const res = await fetch(`${API_BASE}/register/instructor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: form.fullName.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
          phone: form.phone.trim() || null,
          city: form.city.trim() || null,
          state: form.state.trim() || null,
          bio: form.bio.trim() || null,
          training_center_id: form.trainingCenterId || null,
          training_center_name: form.trainingCenterName.trim() || null,
          preferred_discipline: form.preferredDiscipline || null,
          profile_photo_url: profilePhotoUrl,
        }),
      });

      const data = await res.json().catch(() => ({} as { error?: string }));
      if (!res.ok) {
        setError(data.error || 'Failed to submit instructor onboarding');
        return;
      }

      setSuccess(true);
      setForm(initialForm);
      setPhotoFile(null);
      setPhotoPreview(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit instructor onboarding');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center size-14 rounded-2xl bg-primary/10 text-primary mb-4">
            <UserCog className="size-7" />
          </div>
          <h1 className="text-3xl font-black text-slate-900">Instructor Onboarding</h1>
          <p className="text-slate-500 mt-2">Create your instructor profile and login access.</p>
        </div>

        {success && (
          <div className="mb-6 p-4 rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-700 font-medium">
            Onboarding submitted successfully. You can now sign in as instructor.
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 rounded-2xl border border-red-200 bg-red-50 text-red-700 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Full name *">
              <input className={inputCls} value={form.fullName} onChange={(e) => update('fullName', e.target.value)} />
            </Field>
            <Field label="Email *">
              <input className={inputCls} type="email" value={form.email} onChange={(e) => update('email', e.target.value)} />
            </Field>
            <Field label="Phone (optional)">
              <input className={inputCls} value={form.phone} onChange={(e) => update('phone', e.target.value)} />
            </Field>
            <Field label="Password *">
              <div className="relative">
                <input
                  className={`${inputCls} pr-12`}
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => update('password', e.target.value)}
                  placeholder="At least 6 characters"
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
              <input className={inputCls} value={form.city} onChange={(e) => update('city', e.target.value)} />
            </Field>
            <Field label="State (optional)">
              <input className={inputCls} value={form.state} onChange={(e) => update('state', e.target.value)} />
            </Field>
            <Field label="Training center (optional)">
              <select
                className={inputCls}
                value={form.trainingCenterId}
                onChange={(e) => {
                  const center = trainingCenters.find((c) => c.id === e.target.value);
                  setForm((prev) => ({
                    ...prev,
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
                onChange={(e) => update('preferredDiscipline', e.target.value)}
              >
                <option value="">Select discipline</option>
                {disciplines.map((discipline) => (
                  <option key={discipline.value} value={discipline.value}>
                    {discipline.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Profile picture *">
              <label className={`${inputCls} flex items-center justify-between cursor-pointer`}>
                <span className="truncate text-slate-600">{photoFile?.name || 'Upload image (required)'}</span>
                <Upload className="size-4 text-slate-500" />
                <input
                  className="hidden"
                  type="file"
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
                <img src={photoPreview} alt="Profile preview" className="mt-2 size-16 rounded-full object-cover border border-slate-200" />
              )}
            </Field>
            <div className="md:col-span-2">
              <Field label="Bio (optional)">
                <textarea className={`${inputCls} min-h-24`} value={form.bio} onChange={(e) => update('bio', e.target.value)} />
              </Field>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 pt-2">
            <Link to="/login" className="text-sm font-bold text-slate-600 hover:text-slate-900">
              Back to sign in
            </Link>
            <button
              type="submit"
              disabled={!canSubmit || submitting}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-extrabold text-white bg-primary disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
              Submit onboarding
              <ArrowRight className="size-4" />
            </button>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-bold text-slate-700">{label}</span>
      {children}
    </label>
  );
}

const inputCls =
  'w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary';
