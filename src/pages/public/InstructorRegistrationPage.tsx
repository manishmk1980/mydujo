import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import {
  mapInstructorRegistrationError,
  OTHER_DISCIPLINE_VALUE,
  resolveDisciplineValue,
  validateIdDocumentFile,
  validateInstructorRegistration,
  validateProfilePhotoFile,
  type InstructorFormValues,
} from '../../utils/instructorRegistrationValidation';

const ID_TYPE_OPTIONS = [
  { value: 'aadhaar', label: 'Aadhaar' },
  { value: 'pan', label: 'PAN' },
  { value: 'driving_license', label: 'Driving License' },
  { value: 'voter_id', label: 'Voter ID' },
] as const;

const initialForm: InstructorFormValues = {
  fullName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  city: '',
  state: '',
  preferredDiscipline: '',
  customDiscipline: '',
  yearsExperience: '',
  idType: '',
  idNumber: '',
  declaration: false,
};

type FieldKey =
  | keyof InstructorFormValues
  | 'idDocument'
  | 'profilePhoto';

const FIELD_ORDER: FieldKey[] = [
  'fullName',
  'email',
  'phone',
  'password',
  'confirmPassword',
  'city',
  'state',
  'preferredDiscipline',
  'customDiscipline',
  'idType',
  'idNumber',
  'idDocument',
  'declaration',
];

export default function InstructorRegistrationPage() {
  const [form, setForm] = useState<InstructorFormValues>(initialForm);
  const [idDocFile, setIdDocFile] = useState<File | null>(null);
  const [idDocPreview, setIdDocPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [idDocUploading, setIdDocUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [validationAttempted, setValidationAttempted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [disciplines, setDisciplines] = useState<DisciplineOption[]>([]);
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);

  const reviewButtonRef = useRef<HTMLButtonElement>(null);

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

  const update = (key: keyof InstructorFormValues, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (typeof value === 'string' && errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
    if (key === 'declaration' && value === true) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.declaration;
        return next;
      });
      setFormError(null);
    }
  };

  const markTouched = (field: FieldKey) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const showError = (field: FieldKey) => {
    if (!validationAttempted && !touched[field]) return undefined;
    return errors[field];
  };

  const disciplineOptions = useMemo(
    () => [
      ...disciplines.map((d) => ({ value: d.value, label: d.label })),
      { value: OTHER_DISCIPLINE_VALUE, label: 'Other / Not listed' },
    ],
    [disciplines],
  );

  const selectedDisciplineLabel = useMemo(() => {
    if (form.preferredDiscipline === OTHER_DISCIPLINE_VALUE) {
      return form.customDiscipline.trim() || 'Other / Not listed';
    }
    return disciplineOptions.find((d) => d.value === form.preferredDiscipline)?.label || form.preferredDiscipline;
  }, [disciplineOptions, form.customDiscipline, form.preferredDiscipline]);

  const focusFirstInvalidField = (nextErrors: Record<string, string>) => {
    const idMap: Record<string, string> = {
      fullName: 'fullName',
      email: 'email',
      phone: 'phone',
      password: 'instructor-password',
      confirmPassword: 'instructor-confirm-password',
      city: 'city',
      state: 'state',
      preferredDiscipline: 'preferredDiscipline',
      customDiscipline: 'customDiscipline',
      idType: 'idType',
      idNumber: 'idNumber',
      idDocument: 'idDocument-input',
      declaration: 'declaration',
      profilePhoto: 'profilePhoto-input',
    };

    const first = FIELD_ORDER.find((field) => nextErrors[field]);
    if (!first) return;
    const targetId = idMap[first];
    const node = targetId ? document.getElementById(targetId) : null;
    node?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    node?.focus();
  };

  const runValidation = () => {
    const next = validateInstructorRegistration(form, idDocFile);
    if (photoFile) {
      const photoError = validateProfilePhotoFile(photoFile);
      if (photoError) next.profilePhoto = photoError;
    }
    setErrors(next);
    return next;
  };

  const onIdDocChange = (file: File | null) => {
    if (!file) {
      setIdDocFile(null);
      setIdDocPreview(null);
      setErrors((prev) => {
        const next = { ...prev };
        delete next.idDocument;
        return next;
      });
      return;
    }

    const fileError = validateIdDocumentFile(file);
    if (fileError) {
      setIdDocFile(null);
      setIdDocPreview(null);
      setErrors((prev) => ({ ...prev, idDocument: fileError }));
      markTouched('idDocument');
      return;
    }

    setIdDocFile(file);
    setErrors((prev) => {
      const next = { ...prev };
      delete next.idDocument;
      return next;
    });

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => setIdDocPreview(String(reader.result || ''));
      reader.readAsDataURL(file);
    } else {
      setIdDocPreview(null);
    }
  };

  const onPhotoChange = (file: File | null) => {
    if (!file) {
      setPhotoFile(null);
      setPhotoPreview(null);
      setErrors((prev) => {
        const next = { ...prev };
        delete next.profilePhoto;
        return next;
      });
      return;
    }

    const photoError = validateProfilePhotoFile(file);
    if (photoError) {
      setPhotoFile(null);
      setPhotoPreview(null);
      setErrors((prev) => ({ ...prev, profilePhoto: photoError }));
      markTouched('profilePhoto');
      return;
    }

    setPhotoFile(file);
    setErrors((prev) => {
      const next = { ...prev };
      delete next.profilePhoto;
      return next;
    });
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(String(reader.result || ''));
    reader.readAsDataURL(file);
  };

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setValidationAttempted(true);

    if (!form.declaration) {
      const next = runValidation();
      setFormError('Please accept the declaration to review and submit your application.');
      focusFirstInvalidField(next);
      return;
    }

    const next = runValidation();
    if (Object.keys(next).length > 0 || submitting) {
      setFormError('Please fix the highlighted fields before reviewing your application.');
      focusFirstInvalidField(next);
      return;
    }

    setConfirmSubmitOpen(true);
  };

  const performSubmit = async () => {
    if (submitting) return;

    setValidationAttempted(true);
    const next = runValidation();
    if (Object.keys(next).length > 0 || !form.declaration) {
      setConfirmSubmitOpen(false);
      setFormError('Please fix the highlighted fields before submitting your application.');
      focusFirstInvalidField(next);
      return;
    }

    if (idDocFile) {
      const fileError = validateIdDocumentFile(idDocFile);
      if (fileError) {
        setConfirmSubmitOpen(false);
        setErrors((prev) => ({ ...prev, idDocument: fileError }));
        setFormError(fileError);
        focusFirstInvalidField({ idDocument: fileError });
        return;
      }
    }

    setSubmitting(true);
    setFormError(null);

    try {
      let idDocumentUrl: string | null = null;
      if (idDocFile) {
        setIdDocUploading(true);
        try {
          const ext = idDocFile.name.split('.').pop() || 'bin';
          const path = `instructor-onboarding/id-${crypto.randomUUID()}.${ext}`;
          const up = await storageService.uploadPaymentProof(idDocFile, path);
          idDocumentUrl = up.url;
        } catch {
          setConfirmSubmitOpen(false);
          setFormError('Unable to upload your ID document. Please check the file and try again.');
          return;
        } finally {
          setIdDocUploading(false);
        }
      }

      let profilePhotoUrl: string | null = null;
      if (photoFile) {
        try {
          const ext = photoFile.name.split('.').pop() || 'png';
          const p = storageService.buildInstructorPhotoPath(`${crypto.randomUUID()}.${ext}`, true);
          await storageService.uploadProfilePhoto(photoFile, p);
          profilePhotoUrl = storageService.getPublicUrl(p);
        } catch {
          setConfirmSubmitOpen(false);
          setFormError('Unable to upload your profile photo. Please choose another image and try again.');
          return;
        }
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
          preferred_discipline: resolveDisciplineValue(form),
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
        setConfirmSubmitOpen(false);
        setFormError(mapInstructorRegistrationError(res.status, data.error || ''));
        return;
      }

      setConfirmSubmitOpen(false);
      setSuccess(true);
      setForm(initialForm);
      setIdDocFile(null);
      setIdDocPreview(null);
      setPhotoFile(null);
      setPhotoPreview(null);
      setTouched({});
      setValidationAttempted(false);
    } catch {
      setConfirmSubmitOpen(false);
      setFormError('Unable to submit your application right now. Please try again shortly.');
    } finally {
      setIdDocUploading(false);
      setSubmitting(false);
    }
  };

  const reviewSummary = (
    <dl className="grid gap-2 text-sm">
      <div><dt className="font-bold text-slate-900">Name</dt><dd>{form.fullName.trim()}</dd></div>
      <div><dt className="font-bold text-slate-900">Email</dt><dd>{form.email.trim()}</dd></div>
      <div><dt className="font-bold text-slate-900">Phone</dt><dd>{form.phone.trim()}</dd></div>
      <div><dt className="font-bold text-slate-900">Location</dt><dd>{form.city.trim()}, {form.state.trim()}</dd></div>
      <div><dt className="font-bold text-slate-900">Discipline</dt><dd>{selectedDisciplineLabel}</dd></div>
      {form.yearsExperience.trim() ? <div><dt className="font-bold text-slate-900">Experience</dt><dd>{form.yearsExperience.trim()} years</dd></div> : null}
      <div><dt className="font-bold text-slate-900">ID</dt><dd>{ID_TYPE_OPTIONS.find((o) => o.value === form.idType)?.label || form.idType} · document attached</dd></div>
      <div><dt className="font-bold text-slate-900">Profile photo</dt><dd>{photoFile ? 'Included' : 'Not provided'}</dd></div>
    </dl>
  );

  const canReviewSubmit = form.declaration && !submitting;

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
              <form onSubmit={onFormSubmit} noValidate className="min-w-0 space-y-8">
                <div aria-live="polite" aria-atomic="true" className="space-y-3">
                  {formError ? (
                    <div
                      className="rounded-2xl border p-4 text-sm font-medium"
                      style={{ borderColor: 'var(--mdpl-danger)', color: 'var(--mdpl-danger)', background: 'rgba(220,38,38,0.06)' }}
                      role="alert"
                    >
                      {formError}
                    </div>
                  ) : null}
                </div>

                <OnboardingSection title="Contact & identity" columns={1} gap="gap-4">
                  <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
                    <InputField
                      label="Full name"
                      name="fullName"
                      value={form.fullName}
                      onChange={(v) => update('fullName', v)}
                      onBlur={() => markTouched('fullName')}
                      error={showError('fullName')}
                      required
                    />
                    <InputField
                      label="Email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={(v) => update('email', v)}
                      onBlur={() => markTouched('email')}
                      error={showError('email')}
                      required
                      autoComplete="email"
                    />
                    <InputField
                      label="Phone number"
                      name="phone"
                      value={form.phone}
                      onChange={(v) => update('phone', v)}
                      onBlur={() => markTouched('phone')}
                      error={showError('phone')}
                      required
                      autoComplete="tel"
                    />
                    <div className="space-y-2">
                      <label htmlFor="instructor-password" className="text-sm font-bold text-slate-700 dark:text-slate-200">
                        Password <span className="text-red-500" aria-hidden="true">*</span>
                        <span className="sr-only"> (required)</span>
                      </label>
                      <div className="relative">
                        <input
                          id="instructor-password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          value={form.password}
                          onChange={(e) => update('password', e.target.value)}
                          onBlur={() => markTouched('password')}
                          placeholder="At least 6 characters"
                          autoComplete="new-password"
                          aria-invalid={showError('password') ? true : undefined}
                          aria-describedby={showError('password') ? 'password-error' : undefined}
                          aria-required="true"
                          className={`mdpl-onboarding-input pr-12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--mdpl-accent)] ${showError('password') ? 'border-red-500' : ''}`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((p) => !p)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--mdpl-accent)] dark:hover:bg-white/10"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                      </div>
                      {showError('password') ? (
                        <p id="password-error" className="text-xs font-medium text-red-600" role="alert">{showError('password')}</p>
                      ) : null}
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="instructor-confirm-password" className="text-sm font-bold text-slate-700 dark:text-slate-200">
                        Confirm password <span className="text-red-500" aria-hidden="true">*</span>
                        <span className="sr-only"> (required)</span>
                      </label>
                      <div className="relative">
                        <input
                          id="instructor-confirm-password"
                          name="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={form.confirmPassword}
                          onChange={(e) => update('confirmPassword', e.target.value)}
                          onBlur={() => markTouched('confirmPassword')}
                          placeholder="Re-enter your password"
                          autoComplete="new-password"
                          aria-invalid={showError('confirmPassword') ? true : undefined}
                          aria-describedby={showError('confirmPassword') ? 'confirmPassword-error' : undefined}
                          aria-required="true"
                          className={`mdpl-onboarding-input pr-12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--mdpl-accent)] ${showError('confirmPassword') ? 'border-red-500' : ''}`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword((p) => !p)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--mdpl-accent)] dark:hover:bg-white/10"
                          aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                        >
                          {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                      </div>
                      {showError('confirmPassword') ? (
                        <p id="confirmPassword-error" className="text-xs font-medium text-red-600" role="alert">{showError('confirmPassword')}</p>
                      ) : null}
                    </div>
                    <InputField
                      label="City"
                      name="city"
                      value={form.city}
                      onChange={(v) => update('city', v)}
                      onBlur={() => markTouched('city')}
                      error={showError('city')}
                      required
                    />
                    <InputField
                      label="State"
                      name="state"
                      value={form.state}
                      onChange={(v) => update('state', v)}
                      onBlur={() => markTouched('state')}
                      error={showError('state')}
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
                      onChange={(v) => {
                        update('preferredDiscipline', v);
                        if (v !== OTHER_DISCIPLINE_VALUE) update('customDiscipline', '');
                      }}
                      onBlur={() => markTouched('preferredDiscipline')}
                      options={disciplineOptions}
                      placeholder="Select discipline"
                      error={showError('preferredDiscipline')}
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
                  {form.preferredDiscipline === OTHER_DISCIPLINE_VALUE ? (
                    <InputField
                      label="Specify discipline / style"
                      name="customDiscipline"
                      value={form.customDiscipline}
                      onChange={(v) => update('customDiscipline', v)}
                      onBlur={() => markTouched('customDiscipline')}
                      placeholder="Enter your martial art style"
                      error={showError('customDiscipline')}
                      required
                    />
                  ) : null}
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
                      onBlur={() => markTouched('idType')}
                      options={ID_TYPE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                      placeholder="Select ID type"
                      error={showError('idType')}
                      required
                    />
                    <InputField
                      label="ID number"
                      name="idNumber"
                      value={form.idNumber}
                      onChange={(v) => update('idNumber', v)}
                      onBlur={() => markTouched('idNumber')}
                      error={showError('idNumber')}
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
                      error={showError('idDocument')}
                      required
                      previewUrl={idDocPreview}
                      uploading={idDocUploading}
                      helperText="JPG, PNG, WebP, or PDF (max 8MB)"
                    />
                  </div>
                </OnboardingSection>

                <OnboardingSection title="Profile photo (optional)" columns={1} gap="gap-4">
                  <UploadField
                    label="Profile photo"
                    name="profilePhoto"
                    value={photoFile}
                    onChange={onPhotoChange}
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    previewUrl={photoPreview}
                    error={showError('profilePhoto')}
                    helperText="Optional. JPG, PNG, or WebP up to 8MB."
                  />
                </OnboardingSection>

                <CheckboxField
                  name="declaration"
                  label="I confirm that the information above is accurate to the best of my knowledge, and I agree to follow MDPL MyDojo policies if my application is approved."
                  checked={form.declaration}
                  onChange={(v) => update('declaration', v)}
                  error={showError('declaration')}
                  required
                  labelClassName="text-[13px] sm:text-sm"
                />

                <div className="space-y-3 border-t border-slate-100 pt-6 dark:border-white/10">
                  {!form.declaration ? (
                    <p className="text-xs font-medium text-slate-600 dark:text-white/70">
                      Please accept the declaration to review and submit your application.
                    </p>
                  ) : null}
                  <div className="flex min-w-0 flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Link
                      to="/join-mydojo"
                      className="inline-flex min-h-[44px] items-center justify-center text-center text-sm font-bold text-slate-600 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--mdpl-accent)] dark:text-white/70 dark:hover:text-white"
                    >
                      Back to Join MyDojo
                    </Link>
                    <button
                      ref={reviewButtonRef}
                      type="submit"
                      disabled={!canReviewSubmit}
                      aria-disabled={!canReviewSubmit}
                      className={`inline-flex min-h-[48px] w-full min-w-0 items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-black uppercase tracking-wide text-white shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--mdpl-accent)] sm:w-auto mdpl-onboarding-accent-bg ${
                        !canReviewSubmit ? 'cursor-not-allowed opacity-50 hover:opacity-50' : ''
                      }`}
                    >
                      {submitting ? <Loader2 className="size-4 shrink-0 animate-spin" /> : null}
                      Review &amp; submit
                      <ArrowRight className="size-4 shrink-0" />
                    </button>
                  </div>
                </div>
              </form>
            </OnboardingFormCard>
          )}

          <ConfirmSubmitDialog
            isOpen={confirmSubmitOpen}
            onClose={() => setConfirmSubmitOpen(false)}
            onConfirm={() => void performSubmit()}
            isSubmitting={submitting}
            returnFocusRef={reviewButtonRef}
            title="Submit instructor application?"
            message="After you submit, this request is sent for MDPL review. You will not be able to edit this submission from this page."
            summary={reviewSummary}
            cancelLabel="Edit application"
            confirmLabel="Submit application"
            submittingLabel="Submitting application…"
          />
        </div>
      </section>
    </PublicLayout>
  );
}
