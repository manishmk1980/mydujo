import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Loader2, UserCog } from 'lucide-react';

import PublicLayout from '../../components/public/PublicLayout';
import { OnboardingHero } from '../../components/onboarding/OnboardingHero';
import { OnboardingFormCard } from '../../components/onboarding/OnboardingFormCard';
import { OnboardingSection } from '../../components/onboarding/OnboardingSection';
import { InputField } from '../../components/onboarding/InputField';
import { SelectField } from '../../components/onboarding/SelectField';
import { UploadField } from '../../components/onboarding/UploadField';
import { CheckboxField } from '../../components/onboarding/CheckboxField';
import { ConfirmSubmitDialog } from '../../components/onboarding/ConfirmSubmitDialog';
import { API_BASE } from '../../config';
import { storageService } from '../../services/storageService';
import { metaService, type DisciplineOption } from '../../services/metaService';

const ID_TYPE_OPTIONS = [
  { value: 'aadhaar', label: 'Aadhaar' },
  { value: 'pan', label: 'PAN' },
  { value: 'driving_license', label: 'Driving License' },
  { value: 'voter_id', label: 'Voter ID' },
] as const;

type FormState = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  city: string;
  state: string;
  preferredDiscipline: string;
  yearsExperience: string;
  idType: string;
  idNumber: string;
  declaration: boolean;
};

const initialForm: FormState = {
  fullName: '',
  email: '',
  phone: '',
  password: '',
  city: '',
  state: '',
  preferredDiscipline: '',
  yearsExperience: '',
  idType: '',
  idNumber: '',
  declaration: false,
};

export default function InstructorRegistrationPage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [idDocFile, setIdDocFile] = useState<File | null>(null);
  const [idDocPreview, setIdDocPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [idDocUploading, setIdDocUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [disciplines, setDisciplines] = useState<DisciplineOption[]>([]);
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    metaService
      .getDisciplines()
      .catch(() => [] as DisciplineOption[])
      .then((opts) => {
        if (mounted) setDisciplines(opts || []);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const update = (key: keyof FormState, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const disciplineOptions = useMemo(
    () => disciplines.map((d) => ({ value: d.value, label: d.label })),
    [disciplines],
  );

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!form.fullName.trim()) next.fullName = 'Full name is required';
    if (!form.email.trim()) next.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) next.email = 'Invalid email';
    if (!form.phone.trim()) next.phone = 'Phone number is required';
    if (!form.city.trim()) next.city = 'City is required';
    if (!form.state.trim()) next.state = 'State is required';
    if (!form.preferredDiscipline) next.preferredDiscipline = 'Discipline / style is required';
    if (form.password.length < 6) next.password = 'Password must be at least 6 characters';
    if (!form.idType) next.idType = 'ID type is required';
    if (!form.idNumber.trim()) next.idNumber = 'ID number is required';
    if (!idDocFile) next.idDocument = 'ID document upload is required';
    if (!form.declaration) next.declaration = 'You must confirm the declaration';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onIdDocChange = (file: File | null) => {
    setIdDocFile(file);
    setErrors((e) => ({ ...e, idDocument: '' }));
    if (!file) {
      setIdDocPreview(null);
      return;
    }
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => setIdDocPreview(String(reader.result || ''));
      reader.readAsDataURL(file);
    } else {
      setIdDocPreview(null);
    }
  };

  const onPhotoChange = (file: File | null) => {
    setPhotoFile(file);
    if (!file) {
      setPhotoPreview(null);
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(String(reader.result || ''));
    reader.readAsDataURL(file);
  };

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!validate() || submitting) return;
    setConfirmSubmitOpen(true);
  };

  const performSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    setFormError(null);
    try {
      let idDocumentUrl: string | null = null;
      if (idDocFile) {
        setIdDocUploading(true);
        const ext = idDocFile.name.split('.').pop() || 'bin';
        const path = `instructor-onboarding/id-${crypto.randomUUID()}.${ext}`;
        const up = await storageService.uploadPaymentProof(idDocFile, path);
        idDocumentUrl = up.url;
        setIdDocUploading(false);
      }

      let profilePhotoUrl: string | null = null;
      if (photoFile) {
        const ext = photoFile.name.split('.').pop() || 'png';
        const p = storageService.buildInstructorPhotoPath(`${crypto.randomUUID()}.${ext}`, true);
        await storageService.uploadProfilePhoto(photoFile, p);
        profilePhotoUrl = storageService.getPublicUrl(p);
      }

      const res = await fetch(`${API_BASE}/register/instructor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: form.fullName.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
          phone: form.phone.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          preferred_discipline: form.preferredDiscipline,
          years_experience: form.yearsExperience.trim() || null,
          id_type: form.idType,
          id_number: form.idNumber.trim(),
          id_document_url: idDocumentUrl,
          declaration_accepted_at: new Date().toISOString(),
          profile_photo_url: profilePhotoUrl,
          bio: null,
        }),
      });

      const data = await res.json().catch(() => ({} as { error?: string }));
      if (!res.ok) {
        setFormError(data.error || 'Failed to submit instructor registration');
        return;
      }

      setConfirmSubmitOpen(false);
      setSuccess(true);
      setForm(initialForm);
      setIdDocFile(null);
      setIdDocPreview(null);
      setPhotoFile(null);
      setPhotoPreview(null);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIdDocUploading(false);
      setSubmitting(false);
    }
  };

  return (
    <PublicLayout>
      <section className="relative min-w-0 px-3 pb-12 pt-4 sm:px-5 sm:pb-16 sm:pt-6 lg:px-8">
        <div className="mx-auto min-w-0 max-w-3xl">
          <OnboardingHero
            icon={UserCog}
            title="Instructor registration"
            subtitle="Apply to teach with MDPL MyDojo. This short form collects the minimum we need to review your application."
          />

          {success ? (
            <div className="mdpl-onboarding-card rounded-[1.75rem] p-6 sm:p-10">
              <div className="mb-5 flex items-center gap-4">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--mdpl-accent-soft)] text-[color:var(--mdpl-accent)]">
                  <UserCog className="size-7" />
                </div>
                <h2 className="text-xl font-black text-[var(--mdpl-text)] sm:text-2xl">Application submitted</h2>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-[var(--mdpl-text-muted)] sm:text-base">
                <p>
                  Your instructor application has been received by MDPL. Our admin team will review your details, ID document, discipline, and location.
                </p>
                <p>
                  If approved, you will receive your instructor login details or a password setup link by email. You may be asked to provide additional documents before approval.
                </p>
              </div>
              <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
                <Link
                  to="/join-mydojo"
                  className="inline-flex min-h-[44px] min-w-0 items-center justify-center rounded-xl px-5 py-2.5 text-sm font-bold text-[var(--mdpl-text-muted)] underline decoration-[var(--mdpl-border)] underline-offset-4"
                >
                  Back to Join MyDojo
                </Link>
                <div className="flex flex-col gap-1">
                  <Link
                    to="/instructor/login"
                    className="inline-flex min-h-[44px] min-w-0 items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-black uppercase tracking-wide text-white mdpl-onboarding-accent-bg"
                  >
                    Instructor sign in <ArrowRight className="size-4 shrink-0" />
                  </Link>
                  <p className="text-center text-[11px] text-[var(--mdpl-text-muted)]">Use this after your account is approved.</p>
                </div>
              </div>
            </div>
          ) : (
            <OnboardingFormCard padding="p-5 sm:p-8">
              <form onSubmit={onFormSubmit} className="min-w-0 space-y-8">
                {formError ? (
                  <div
                    className="rounded-2xl border p-4 text-sm font-medium"
                    style={{ borderColor: 'var(--mdpl-danger)', color: 'var(--mdpl-danger)', background: 'rgba(220,38,38,0.06)' }}
                  >
                    {formError}
                  </div>
                ) : null}

                <OnboardingSection title="Contact & identity" columns={1} gap="gap-4">
                  <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
                    <InputField
                      label="Full name"
                      name="fullName"
                      value={form.fullName}
                      onChange={(v) => update('fullName', v)}
                      error={errors.fullName}
                      required
                    />
                    <InputField
                      label="Email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={(v) => update('email', v)}
                      error={errors.email}
                      required
                    />
                    <InputField
                      label="Phone number"
                      name="phone"
                      value={form.phone}
                      onChange={(v) => update('phone', v)}
                      error={errors.phone}
                      required
                    />
                    <div className="space-y-2">
                      <label htmlFor="instructor-password" className="text-sm font-bold text-slate-700 dark:text-slate-200">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          id="instructor-password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          value={form.password}
                          onChange={(e) => update('password', e.target.value)}
                          placeholder="At least 6 characters"
                          className={`mdpl-onboarding-input pr-12 ${errors.password ? 'border-red-500' : ''}`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((p) => !p)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                      </div>
                      {errors.password ? <p className="text-xs font-medium text-red-600">{errors.password}</p> : null}
                    </div>
                    <InputField
                      label="City"
                      name="city"
                      value={form.city}
                      onChange={(v) => update('city', v)}
                      error={errors.city}
                      required
                    />
                    <InputField
                      label="State"
                      name="state"
                      value={form.state}
                      onChange={(v) => update('state', v)}
                      error={errors.state}
                      required
                    />
                  </div>
                </OnboardingSection>

                <OnboardingSection title="Teaching background" columns={1} gap="gap-4">
                  <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
                    <SelectField
                      label="Discipline / style"
                      name="preferredDiscipline"
                      value={form.preferredDiscipline}
                      onChange={(v) => update('preferredDiscipline', v)}
                      options={disciplineOptions}
                      placeholder="Select discipline"
                      error={errors.preferredDiscipline}
                      required
                    />
                    <InputField
                      label="Years of experience"
                      name="yearsExperience"
                      type="number"
                      value={form.yearsExperience}
                      onChange={(v) => update('yearsExperience', v)}
                      helperText="Optional"
                    />
                  </div>
                </OnboardingSection>

                <OnboardingSection
                  title="Government ID"
                  description="Required: choose ID type, enter the number, then upload a clear scan or photo (JPG, PNG, WebP, or PDF)."
                  columns={1}
                  gap="gap-4"
                >
                  <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
                    <SelectField
                      label="ID type"
                      name="idType"
                      value={form.idType}
                      onChange={(v) => update('idType', v)}
                      options={ID_TYPE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                      placeholder="Select ID type"
                      error={errors.idType}
                      required
                    />
                    <InputField
                      label="ID number"
                      name="idNumber"
                      value={form.idNumber}
                      onChange={(v) => update('idNumber', v)}
                      error={errors.idNumber}
                      required
                    />
                  </div>
                  <div className="mt-4 min-w-0">
                    <UploadField
                      label="ID document"
                      name="idDocument"
                      value={idDocFile}
                      onChange={onIdDocChange}
                      accept="image/jpeg,image/png,image/webp,application/pdf"
                      error={errors.idDocument}
                      required
                      previewUrl={idDocPreview}
                      uploading={idDocUploading}
                      helperText="JPG, PNG, WebP, or PDF (max 8MB on upload)"
                    />
                  </div>
                </OnboardingSection>

                <OnboardingSection title="Profile photo (optional)" columns={1} gap="gap-4">
                  <UploadField
                    label="Profile photo"
                    name="profilePhoto"
                    value={photoFile}
                    onChange={onPhotoChange}
                    accept="image/*"
                    previewUrl={photoPreview}
                    helperText="Optional. If you skip this, admins will still review your application using your ID document."
                  />
                </OnboardingSection>

                <CheckboxField
                  name="declaration"
                  label="I confirm that the information above is accurate to the best of my knowledge, and I agree to follow MDPL MyDojo policies if my application is approved."
                  checked={form.declaration}
                  onChange={(v) => update('declaration', v)}
                  error={errors.declaration}
                  required
                  labelClassName="text-[13px] sm:text-sm"
                />

                <div className="flex min-w-0 flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between dark:border-white/10">
                  <Link
                    to="/join-mydojo"
                    className="inline-flex min-h-[44px] items-center justify-center text-center text-sm font-bold text-slate-600 hover:text-slate-900 dark:text-white/70 dark:hover:text-white"
                  >
                    Back to Join MyDojo
                  </Link>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex min-h-[48px] w-full min-w-0 items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-black uppercase tracking-wide text-white shadow-lg sm:w-auto mdpl-onboarding-accent-bg"
                  >
                    {submitting ? <Loader2 className="size-4 shrink-0 animate-spin" /> : null}
                    Review &amp; submit
                    <ArrowRight className="size-4 shrink-0" />
                  </button>
                </div>
              </form>
            </OnboardingFormCard>
          )}

          <ConfirmSubmitDialog
            isOpen={confirmSubmitOpen}
            onClose={() => setConfirmSubmitOpen(false)}
            onConfirm={() => void performSubmit()}
            isSubmitting={submitting}
            title="Submit instructor application?"
            message="After you submit, this request is sent for MDPL review. You will not be able to edit this submission from this page."
            confirmLabel="Submit application"
          />
        </div>
      </section>
    </PublicLayout>
  );
}
