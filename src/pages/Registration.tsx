import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Camera,
  Shield,
  CheckCircle2,
  ArrowRight,
  Sword,
  X,
  RefreshCw,
  Upload,
  Loader2,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';
import PublicLayout from '../components/public/PublicLayout';
import { OnboardingStepper } from '../components/onboarding/OnboardingStepper';
import { OnboardingFormCard } from '../components/onboarding/OnboardingFormCard';
import { OnboardingFooterActions } from '../components/onboarding/OnboardingFooterActions';
import { ConfirmSubmitDialog } from '../components/onboarding/ConfirmSubmitDialog';
import { UnsavedChangesDialog } from '../components/onboarding/UnsavedChangesDialog';
import { ReviewSummaryCard } from '../components/onboarding/ReviewSummaryCard';
import { motion, AnimatePresence } from 'motion/react';
import { storageService } from '../services/storageService';
import type { GenderType } from '../types/registration';
import { AspectRatio } from '../components/ui/aspect-ratio';
import { useFlashToast } from '../components/ui/FlashToast';
import { API_BASE } from '../config';
import { trainingCenterService, type TrainingCenter } from '../services/trainingCenterService';
import { metaService, type DisciplineOption } from '../services/metaService';

const BLOOD_GROUP_OPTIONS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;
const COUNTRY_CODE_OPTIONS = ['+91', '+1', '+44', '+61', '+971', '+880', '+977', '+94'] as const;
const BELT_GRADE_OPTIONS = ['WHITE_BELT', 'COLOUR_BELT', 'BLACK_BELT'] as const;

const TOTAL_STEPS = 4;

const STEPPER_STEPS = [
  { label: 'Personal', description: 'Identity' },
  { label: 'Contact', description: 'Address & login' },
  { label: 'Training', description: 'Center & style' },
  { label: 'Review', description: 'Submit' },
] as const;

type FormData = {
  // Part 1
  fullName: string;
  parentGuardianName: string;
  gender: GenderType | '';
  dateOfBirth: string;
  bloodGroup: string;
  aadharNumber: string;
  isStudent: boolean;
  qualification: string;
  beltGrade: '' | (typeof BELT_GRADE_OPTIONS)[number];
  // Part 2
  address: string;
  pincode: string;
  city: string;
  state: string;
  locality: string;
  email: string;
  password: string;
  phoneCountryCode: (typeof COUNTRY_CODE_OPTIONS)[number];
  phoneNumber: string; // 10 digits
  emergencyCountryCode: (typeof COUNTRY_CODE_OPTIONS)[number];
  emergencyNumber: string; // 10 digits
  // Part 3
  schoolCollegeName: string;
  trainingCenterId: string;
  trainingCenterName: string;
  schoolCollegeLocationCity: string;
  schoolCollegeLocationState: string;
  schoolCollegeLocationPin: string;
  instructorName: string;
  preferredDiscipline: string;
  // Terms
  termsAccepted: boolean;
  marketingOptIn: boolean;
};

function dataUrlToBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return new Blob([u8arr], { type: mime });
}

export default function Registration() {
  const toast = useFlashToast();
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [successCredentials, setSuccessCredentials] = useState<{
    fullName: string;
    email: string;
    password: string;
  } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);
  const [confirmExitOpen, setConfirmExitOpen] = useState(false);

  function onlyDigits(s: string) {
    return String(s || '').replace(/\D/g, '');
  }

  function splitPhone(value: unknown): { cc: (typeof COUNTRY_CODE_OPTIONS)[number]; num: string } {
    const v = typeof value === 'string' ? value.trim() : '';
    const digits = onlyDigits(v);

    // Prefer recognizing a known country code prefix from the original string
    for (const cc of COUNTRY_CODE_OPTIONS) {
      if (v.startsWith(cc)) {
        const restDigits = onlyDigits(v.slice(cc.length));
        const last10 = restDigits.slice(-10);
        return { cc, num: last10 };
      }
    }

    // Otherwise, assume last 10 digits are the mobile number
    const last10 = digits.slice(-10);
    return { cc: '+91', num: last10 };
  }

  function normalizeDraft(saved: any): FormData {
    const phoneSplit = splitPhone(saved?.phone ?? saved?.phoneNumber);
    const emergencySplit = splitPhone(saved?.emergencyContact ?? saved?.emergencyNumber);

    const asCountryCode = (v: any): (typeof COUNTRY_CODE_OPTIONS)[number] => {
      return (COUNTRY_CODE_OPTIONS as readonly string[]).includes(v) ? v : '+91';
    };

    return {
      fullName: saved?.fullName ?? '',
      parentGuardianName: saved?.parentGuardianName ?? '',
      gender: saved?.gender ?? '',
      dateOfBirth: saved?.dateOfBirth ?? '',
      bloodGroup: saved?.bloodGroup ?? '',
      aadharNumber: saved?.aadharNumber ?? '',
      isStudent: Boolean(saved?.isStudent),
      qualification: saved?.qualification ?? '',
      beltGrade: (BELT_GRADE_OPTIONS as readonly string[]).includes(saved?.beltGrade) ? saved.beltGrade : '',
      address: saved?.address ?? '',
      pincode: saved?.pincode ?? '',
      city: saved?.city ?? '',
      state: saved?.state ?? '',
      locality: saved?.locality ?? '',
      email: saved?.email ?? '',
      password: saved?.password ?? '',
      phoneCountryCode: asCountryCode(saved?.phoneCountryCode ?? phoneSplit.cc),
      phoneNumber: onlyDigits(saved?.phoneNumber ?? phoneSplit.num).slice(0, 10),
      emergencyCountryCode: asCountryCode(saved?.emergencyCountryCode ?? emergencySplit.cc),
      emergencyNumber: onlyDigits(saved?.emergencyNumber ?? emergencySplit.num).slice(0, 10),
      schoolCollegeName: saved?.schoolCollegeName ?? '',
      trainingCenterId: saved?.trainingCenterId ?? '',
      trainingCenterName: saved?.trainingCenterName ?? '',
      schoolCollegeLocationCity: saved?.schoolCollegeLocationCity ?? '',
      schoolCollegeLocationState: saved?.schoolCollegeLocationState ?? '',
      schoolCollegeLocationPin: saved?.schoolCollegeLocationPin ?? '',
      instructorName: saved?.instructorName ?? '',
      preferredDiscipline: saved?.preferredDiscipline ?? '',
      termsAccepted: Boolean(saved?.termsAccepted),
      marketingOptIn: Boolean(saved?.marketingOptIn),
    };
  }

  const [form, setForm] = useState<FormData>(() => {
    const saved = localStorage.getItem('registration_draft');
    if (saved) {
      try {
        return normalizeDraft(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved draft', e);
      }
    }
    return {
      fullName: '',
      parentGuardianName: '',
      gender: '',
      dateOfBirth: '',
      bloodGroup: '',
      aadharNumber: '',
      isStudent: false,
      qualification: '',
      beltGrade: '',
      address: '',
      pincode: '',
      city: '',
      state: '',
      locality: '',
      email: '',
      password: '',
      phoneCountryCode: '+91',
      phoneNumber: '',
      emergencyCountryCode: '+91',
      emergencyNumber: '',
      schoolCollegeName: '',
      trainingCenterId: '',
      trainingCenterName: '',
      schoolCollegeLocationCity: '',
      schoolCollegeLocationState: '',
      schoolCollegeLocationPin: '',
      instructorName: '',
      preferredDiscipline: '',
      termsAccepted: false,
      marketingOptIn: false,
    };
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [trainingCenters, setTrainingCenters] = useState<TrainingCenter[]>([]);
  const [disciplines, setDisciplines] = useState<DisciplineOption[]>([]);

  const hasUnsavedChanges = useMemo(() => {
    if (submitSuccess) return false;
    return (
      currentStep > 1 ||
      Boolean(form.fullName.trim()) ||
      Boolean(form.email.trim()) ||
      Boolean(photo) ||
      Boolean(form.phoneNumber.trim())
    );
  }, [submitSuccess, currentStep, form.fullName, form.email, form.phoneNumber, photo]);

  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!form.fullName.trim()) newErrors.fullName = 'Full Name is required';
      if (!form.parentGuardianName.trim()) newErrors.parentGuardianName = 'Parents/Guardian Name is required';
      if (!form.gender) newErrors.gender = 'Gender is required';
      if (!form.dateOfBirth) newErrors.dateOfBirth = 'Date of Birth is required';
    } else if (step === 2) {
      if (!form.address.trim()) newErrors.address = 'Address is required';
      if (!form.pincode.trim()) newErrors.pincode = 'PIN Code is required';
      if (!/^\d{6}$/.test(form.pincode)) newErrors.pincode = 'PIN Code must be 6 digits';
      if (!form.city.trim()) newErrors.city = 'City is required';
      if (!form.state.trim()) newErrors.state = 'State is required';
      if (!form.email.trim()) newErrors.email = 'Email is required';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Invalid email format (phone numbers are not allowed here)';
      if (!form.password || form.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
      if (!/^\d{10}$/.test(form.phoneNumber)) newErrors.phone = 'Mobile number must be 10 digits';
      if (!/^\d{10}$/.test(form.emergencyNumber)) newErrors.emergencyContact = 'Emergency contact must be 10 digits';
    } else if (step === 3) {
      // Training fields optional; terms are confirmed on the Review step
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateForFinalSubmit = () => {
    const newErrors: Record<string, string> = {};
    if (!form.fullName.trim()) newErrors.fullName = 'Full Name is required';
    if (!form.parentGuardianName.trim()) newErrors.parentGuardianName = 'Parents/Guardian Name is required';
    if (!form.gender) newErrors.gender = 'Gender is required';
    if (!form.dateOfBirth) newErrors.dateOfBirth = 'Date of Birth is required';
    if (!form.address.trim()) newErrors.address = 'Address is required';
    if (!form.pincode.trim()) newErrors.pincode = 'PIN Code is required';
    if (!/^\d{6}$/.test(form.pincode)) newErrors.pincode = 'PIN Code must be 6 digits';
    if (!form.city.trim()) newErrors.city = 'City is required';
    if (!form.state.trim()) newErrors.state = 'State is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Invalid email format (phone numbers are not allowed here)';
    if (!form.password || form.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!/^\d{10}$/.test(form.phoneNumber)) newErrors.phone = 'Mobile number must be 10 digits';
    if (!/^\d{10}$/.test(form.emergencyNumber)) newErrors.emergencyContact = 'Emergency contact must be 10 digits';
    if (!form.termsAccepted) newErrors.termsAccepted = 'You must accept the terms';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
    window.scrollTo(0, 0);
  };

  const saveDraft = () => {
    localStorage.setItem('registration_draft', JSON.stringify(form));
    toast.success('Progress saved to draft.');
  };

  const updateForm = (field: keyof FormData, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  React.useEffect(() => {
    localStorage.setItem('registration_draft', JSON.stringify(form));
  }, [form]);

  React.useEffect(() => {
    let mounted = true;
    Promise.all([
      trainingCenterService.getAllTrainingCenters().catch(() => [] as TrainingCenter[]),
      metaService.getDisciplines().catch(() => [] as DisciplineOption[]),
    ]).then(([centers, disciplineOptions]) => {
      if (!mounted) return;
      // Show only ACTIVE centers in the public registration form.
      setTrainingCenters((centers || []).filter((c) => (c.status || 'ACTIVE').toUpperCase() === 'ACTIVE'));
      // getDisciplines() with no arg returns only ACTIVE disciplines from the server.
      setDisciplines(disciplineOptions || []);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const [stream, setStream] = useState<MediaStream | null>(null);

  const startCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error('Your browser does not support camera access.');
      return;
    }
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      setStream(s);
      setIsCameraOpen(true);
    } catch (err: unknown) {
      const e = err as { name?: string };
      let message = 'Could not access camera.';
      if (e?.name === 'NotAllowedError') message = 'Camera access denied.';
      else if (e?.name === 'NotFoundError') message = 'No camera found.';
      toast.error(message);
      setIsCameraOpen(false);
    }
  };

  React.useEffect(() => {
    if (isCameraOpen && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [isCameraOpen, stream]);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const dataUrl = canvas.toDataURL('image/png');
      setPhoto(dataUrl);
      setPhotoFile(null);
    }
    stopCamera();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const uploadPhoto = async (): Promise<string | null> => {
    let blob: Blob;
    let ext = 'png';

    if (photoFile) {
      blob = photoFile;
      ext = photoFile.name.split('.').pop() || 'png';
    } else if (photo?.startsWith('data:')) {
      blob = dataUrlToBlob(photo);
    } else {
      return null;
    }

    const filename = `${crypto.randomUUID()}.${ext}`;
    const path = `registrations/${filename}`;

    await storageService.uploadProfilePhoto(blob, path);
    return storageService.getPublicUrl(path);
  };

  const submittingRef = useRef(false);

  const performSubmit = async () => {
    setSubmitError(null);

    if (submittingRef.current) return;
    if (isSubmitting) return;
    submittingRef.current = true;
    setIsSubmitting(true);

    if (!form.termsAccepted) {
      setSubmitError('You must accept the Terms of Service to register.');
      submittingRef.current = false;
      setIsSubmitting(false);
      return;
    }

    if (!form.fullName.trim()) {
      setSubmitError('Full name is required.');
      submittingRef.current = false;
      setIsSubmitting(false);
      return;
    }

    if (!form.email.trim()) {
      setSubmitError('Email is required.');
      submittingRef.current = false;
      setIsSubmitting(false);
      return;
    }

    if (!form.password || form.password.length < 6) {
      setSubmitError('Password must be at least 6 characters.');
      submittingRef.current = false;
      setIsSubmitting(false);
      return;
    }

    try {
      let profilePhotoUrl: string | null = null;
      if (photo) {
        profilePhotoUrl = await uploadPhoto();
      }

      const res = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: form.fullName.trim(),
          email: form.email.trim(),
          password: form.password,
          phone: form.phoneNumber ? `${form.phoneCountryCode}${form.phoneNumber}` : null,
          gender: form.gender || null,
          date_of_birth: form.dateOfBirth || null,
          parent_guardian_name: form.parentGuardianName.trim() || null,
          emergency_contact: form.emergencyNumber ? `${form.emergencyCountryCode}${form.emergencyNumber}` : null,
          preferred_discipline: form.preferredDiscipline.trim() || null,
          training_center_id: form.trainingCenterId || null,
          training_center_name: form.trainingCenterName.trim() || null,
          marketing_opt_in: form.marketingOptIn,
          terms_accepted_at: new Date().toISOString(),
          blood_group: form.bloodGroup.trim() || null,
          aadhar_number: form.aadharNumber.trim() || null,
          qualification: form.qualification.trim() || null,
          belt_grade: form.beltGrade || null,
          address: form.address.trim() || null,
          pincode: form.pincode.trim() || null,
          city: form.city.trim() || null,
          state: form.state.trim() || null,
          locality: form.locality.trim() || null,
          school_college_name: form.isStudent ? form.schoolCollegeName.trim() || null : null,
          school_college_location_city: form.isStudent ? form.schoolCollegeLocationCity.trim() || null : null,
          school_college_location_state: form.isStudent ? form.schoolCollegeLocationState.trim() || null : null,
          school_college_location_pin: form.isStudent ? form.schoolCollegeLocationPin.trim() || null : null,
          instructor_name: form.instructorName.trim() || null,
          profile_photo_url: profilePhotoUrl,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const apiError = (data as { error?: string }).error || 'Registration failed';

        if (res.status === 409 || apiError.toLowerCase().includes('email already registered')) {
          setSubmitError('This email is already registered. Please sign in to continue.');
        } else {
          setSubmitError(apiError);
        }

        return;
      }

      localStorage.removeItem('registration_draft');
      setSuccessCredentials({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      setSubmitSuccess(true);
      setConfirmSubmitOpen(false);
      setForm({
        fullName: '',
        parentGuardianName: '',
        gender: '',
        dateOfBirth: '',
        bloodGroup: '',
        aadharNumber: '',
        isStudent: false,
        qualification: '',
        beltGrade: '',
        address: '',
        pincode: '',
        city: '',
        state: '',
        locality: '',
        email: '',
        password: '',
        phoneCountryCode: '+91',
        phoneNumber: '',
        emergencyCountryCode: '+91',
        emergencyNumber: '',
        schoolCollegeName: '',
        trainingCenterId: '',
        trainingCenterName: '',
        schoolCollegeLocationCity: '',
        schoolCollegeLocationState: '',
        schoolCollegeLocationPin: '',
        instructorName: '',
        preferredDiscipline: '',
        termsAccepted: false,
        marketingOptIn: false,
      });
      setPhoto(null);
      setPhotoFile(null);
    } catch (err: unknown) {
      let msg = 'Registration failed. Please try again.';
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        msg =
          'Could not reach the server (it may be down or returning 503). If you use www and non-www, ensure /api is not redirected between them—or remove VITE_API_URL so the app uses same-origin /api.';
      } else if (err && typeof err === 'object') {
        const e = err as { message?: string; code?: string };
        if (typeof e.message === 'string') msg = e.message;
      } else if (err instanceof Error) {
        msg = err.message;
      }
      setSubmitError(msg);
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <PublicLayout>
        <section className="mx-auto max-w-2xl min-w-0 px-4 py-16 text-center sm:px-6 sm:py-24">
          <div className="mb-6 inline-flex items-center justify-center rounded-full bg-emerald-100 p-6 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300">
            <CheckCircle2 className="size-16" />
          </div>
          <h1 className="mydojo-display text-2xl font-black text-slate-950 dark:text-white sm:text-3xl">
            Registration complete
          </h1>
          <p className="mb-6 mt-3 text-slate-600 dark:text-white/70">Registration submitted successfully. Awaiting admin approval.</p>
          {successCredentials && (
            <div className="mx-auto mb-8 max-w-md rounded-2xl border border-slate-200 bg-slate-50 p-6 text-left dark:border-white/10 dark:bg-white/5">
              <p className="mb-3 text-sm font-bold text-slate-700 dark:text-white/90">Save your login details:</p>
              <div className="space-y-3">
                <div>
                  <span className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-white/50">Name</span>
                  <p className="break-words font-medium text-slate-900 dark:text-white">{successCredentials.fullName}</p>
                </div>
                <div>
                  <span className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-white/50">Email</span>
                  <p className="break-all font-mono text-slate-900 dark:text-white">{successCredentials.email}</p>
                </div>
                <div>
                  <span className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-white/50">Password</span>
                  <p className="break-all font-mono text-slate-900 dark:text-white">{successCredentials.password}</p>
                </div>
              </div>
              <p className="mt-4 text-xs text-slate-500 dark:text-white/60">
                Store these safely. You can sign in after admin approves your registration.
              </p>
            </div>
          )}
          <Link
            to="/student/login"
            className="inline-flex min-h-[48px] items-center gap-2 rounded-2xl px-8 py-4 font-bold text-white mdpl-onboarding-accent-bg"
          >
            Student sign in <ArrowRight className="size-5" />
          </Link>
        </section>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <section className="mx-auto w-full max-w-4xl min-w-0 px-4 py-8 sm:px-6 lg:py-12">
        <div className="mb-8 text-center md:mb-10">
          <div className="mb-4 inline-flex items-center justify-center rounded-2xl bg-[var(--mdpl-accent-soft)] p-3 text-[color:var(--mdpl-accent)]">
            <Sword className="size-8" />
          </div>
          <h1 className="mydojo-display text-[clamp(1.65rem,6vw,2.5rem)] font-black text-slate-950 dark:text-white">
            Student registration
          </h1>
          <p className="mt-2 text-sm font-semibold text-slate-600 dark:text-white/70 sm:text-lg">
            Begin your journey to mastery. Your answers are saved as a draft on this device as you type.
          </p>
        </div>

        <OnboardingFormCard className="mdpl-onboarding-card border-slate-200 dark:border-white/10" padding="p-0">
          <div className="border-b border-slate-100 bg-slate-50 px-4 py-4 dark:border-white/10 dark:bg-white/5 sm:px-6">
            <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 w-full overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:pb-0 [&::-webkit-scrollbar]:hidden">
                <OnboardingStepper
                  steps={[...STEPPER_STEPS]}
                  currentStep={currentStep}
                  showLabels
                  showProgressBar
                />
              </div>
              <button
                type="button"
                onClick={saveDraft}
                className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-slate-200 px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-300 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
              >
                <Lock className="size-3 shrink-0" /> Save draft
              </button>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
            }}
            className="space-y-10 p-5 sm:p-8 md:p-12"
          >
            {submitError && (
              <div className="space-y-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-600">
                <p>{submitError}</p>

                {submitError === 'This email is already registered. Please sign in to continue.' && (
                  <Link
                    to="/student/login"
                    className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:bg-slate-800"
                  >
                    Sign in as Student
                  </Link>
                )}
              </div>
            )}

            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  {/* Student Photo */}
                  <div className="flex flex-col items-center gap-4 sm:gap-6">
                    <div className="flex w-full max-w-[10rem] flex-col items-center gap-4 sm:max-w-none">
                      <div className="relative w-full">
                        <div className="relative flex aspect-square w-full max-w-[10rem] shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-slate-100 text-slate-400 shadow-2xl group sm:max-w-[11rem]">
                          <AspectRatio ratio={1 / 1}>
                            {photo ? (
                              <img src={photo} alt="Preview" className="h-full w-full object-cover" />
                            ) : (
                              <User className="absolute left-1/2 top-1/2 size-16 -translate-x-1/2 -translate-y-1/2 sm:size-20" />
                            )}
                          </AspectRatio>
                          {photo && (
                            <button
                              type="button"
                              onClick={() => {
                                setPhoto(null);
                                setPhotoFile(null);
                              }}
                              className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100"
                            >
                              <RefreshCw className="size-8" />
                            </button>
                          )}
                        </div>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                      </div>
                      <div className="flex w-full min-w-0 justify-center gap-2 sm:max-w-[11rem]">
                        <button
                          type="button"
                          onClick={startCamera}
                          className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full p-3 text-white shadow-xl mdpl-onboarding-accent-bg active:scale-95 hover:scale-105"
                          title="Take Photo"
                        >
                          <Camera className="size-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full bg-slate-800 p-3 text-white shadow-xl active:scale-95 hover:scale-105"
                          title="Upload Photo"
                        >
                          <Upload className="size-5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-center text-sm font-bold text-slate-900 dark:text-white">Student profile photo</p>
                  </div>

                  <div className="grid min-w-0 grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Full Name *</label>
                      <input
                        className={`w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[color:var(--mdpl-accent)] focus:ring-0 ${errors.fullName ? 'border-red-500' : ''}`}
                        placeholder="e.g. John Doe"
                        value={form.fullName}
                        onChange={(e) => updateForm('fullName', e.target.value)}
                      />
                      {errors.fullName && <p className="text-red-500 text-xs font-medium">{errors.fullName}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Parents/Guardian Name *</label>
                      <input
                        className={`w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[color:var(--mdpl-accent)] focus:ring-0 ${errors.parentGuardianName ? 'border-red-500' : ''}`}
                        placeholder="Full Name (e.g. Robert Smith)"
                        value={form.parentGuardianName}
                        onChange={(e) => updateForm('parentGuardianName', e.target.value)}
                      />
                      {errors.parentGuardianName && <p className="text-red-500 text-xs font-medium">{errors.parentGuardianName}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Gender *</label>
                      <select
                        className={`w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[color:var(--mdpl-accent)] focus:ring-0 ${errors.gender ? 'border-red-500' : ''}`}
                        value={form.gender}
                        onChange={(e) => updateForm('gender', e.target.value as GenderType | '')}
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                      {errors.gender && <p className="text-red-500 text-xs font-medium">{errors.gender}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Date of Birth *</label>
                      <input
                        type="date"
                        className={`w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[color:var(--mdpl-accent)] focus:ring-0 ${errors.dateOfBirth ? 'border-red-500' : ''}`}
                        value={form.dateOfBirth}
                        onChange={(e) => updateForm('dateOfBirth', e.target.value)}
                      />
                      {errors.dateOfBirth && <p className="text-red-500 text-xs font-medium">{errors.dateOfBirth}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Blood Group</label>
                      <select
                        className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[color:var(--mdpl-accent)] focus:ring-0"
                        value={form.bloodGroup}
                        onChange={(e) => updateForm('bloodGroup', e.target.value)}
                      >
                        <option value="">Select Blood Group</option>
                        {BLOOD_GROUP_OPTIONS.map((bg) => (
                          <option key={bg} value={bg}>
                            {bg}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Aadhar Number</label>
                      <input
                        className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[color:var(--mdpl-accent)] focus:ring-0"
                        placeholder="0000 0000 0000"
                        value={form.aadharNumber}
                        onChange={(e) => updateForm('aadharNumber', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Current Belt / Grade</label>
                      <select
                        className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[color:var(--mdpl-accent)] focus:ring-0"
                        value={form.beltGrade}
                        onChange={(e) => updateForm('beltGrade', e.target.value as FormData['beltGrade'])}
                      >
                        <option value="">Select Belt / Grade</option>
                        <option value="WHITE_BELT">White Belt</option>
                        <option value="COLOUR_BELT">Colour Belt</option>
                        <option value="BLACK_BELT">Black Belt</option>
                      </select>
                    </div>

                    <div className="md:col-span-2 flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                      <input
                        type="checkbox"
                        id="isStudent"
                        checked={form.isStudent}
                        onChange={(e) => updateForm('isStudent', e.target.checked)}
                        className="size-4 rounded text-[color:var(--mdpl-accent)]"
                      />
                      <label htmlFor="isStudent" className="text-sm font-bold text-slate-700 select-none">Are you studying(School/Collage/University)</label>
                    </div>

                    {form.isStudent && (
                      <div className="md:col-span-2 grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">Class / Standard</label>
                          <input
                            className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[color:var(--mdpl-accent)] focus:ring-0"
                            placeholder="e.g. 10th Standard or Graduation"
                            value={form.qualification}
                            onChange={(e) => updateForm('qualification', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">School / University Name</label>
                          <input
                            className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[color:var(--mdpl-accent)] focus:ring-0"
                            placeholder="e.g. St. Xavier's College"
                            value={form.schoolCollegeName}
                            onChange={(e) => updateForm('schoolCollegeName', e.target.value)}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex w-full min-w-0 justify-end pt-6">
                    <button
                      type="button"
                      onClick={handleNext}
                      className="flex min-h-[48px] w-full max-w-md items-center justify-center gap-2 rounded-2xl px-6 py-3 text-center text-sm font-bold text-white transition-all hover:opacity-95 sm:w-auto mdpl-onboarding-accent-bg"
                    >
                      <span className="text-balance">Next: Contact</span>
                      <ArrowRight className="size-5 shrink-0" />
                    </button>
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="grid min-w-0 grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-bold text-slate-700">Home Address *</label>
                      <textarea
                        className={`w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[color:var(--mdpl-accent)] focus:ring-0 ${errors.address ? 'border-red-500' : ''}`}
                        placeholder="Full residential address"
                        rows={3}
                        value={form.address}
                        onChange={(e) => updateForm('address', e.target.value)}
                      />
                      {errors.address && <p className="text-red-500 text-xs font-medium">{errors.address}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">PIN Code *</label>
                      <input
                        className={`w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[color:var(--mdpl-accent)] focus:ring-0 ${errors.pincode ? 'border-red-500' : ''}`}
                        placeholder="700001"
                        value={form.pincode}
                        onChange={(e) => updateForm('pincode', e.target.value)}
                      />
                      {errors.pincode && <p className="text-red-500 text-xs font-medium">{errors.pincode}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">City *</label>
                      <input
                        className={`w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[color:var(--mdpl-accent)] focus:ring-0 ${errors.city ? 'border-red-500' : ''}`}
                        placeholder="City Name"
                        value={form.city}
                        onChange={(e) => updateForm('city', e.target.value)}
                      />
                      {errors.city && <p className="text-red-500 text-xs font-medium">{errors.city}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">State *</label>
                      <input
                        className={`w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[color:var(--mdpl-accent)] focus:ring-0 ${errors.state ? 'border-red-500' : ''}`}
                        placeholder="State Name"
                        value={form.state}
                        onChange={(e) => updateForm('state', e.target.value)}
                      />
                      {errors.state && <p className="text-red-500 text-xs font-medium">{errors.state}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Locality</label>
                      <input
                        className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[color:var(--mdpl-accent)] focus:ring-0"
                        placeholder="Area / Neighborhood"
                        value={form.locality}
                        onChange={(e) => updateForm('locality', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Email Address *</label>
                      <input
                        type="email"
                        className={`w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[color:var(--mdpl-accent)] focus:ring-0 ${errors.email ? 'border-red-500' : ''}`}
                        placeholder="e.g. john@example.com"
                        required
                        value={form.email}
                        onChange={(e) => updateForm('email', e.target.value)}
                      />
                      {errors.email && <p className="text-red-500 text-xs font-medium">{errors.email}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Password *</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          className={`w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 pr-12 text-sm focus:border-[color:var(--mdpl-accent)] focus:ring-0 ${errors.password ? 'border-red-500' : ''}`}
                          placeholder="At least 6 characters"
                          value={form.password}
                          onChange={(e) => updateForm('password', e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((p) => !p)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--mdpl-accent)]/30"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                        </button>
                      </div>
                      {errors.password && <p className="text-red-500 text-xs font-medium">{errors.password}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Phone Number *</label>
                      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-stretch">
                        <select
                          className={`min-h-[44px] w-full shrink-0 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm focus:border-[color:var(--mdpl-accent)] focus:ring-0 sm:w-auto sm:min-w-[5.5rem] ${errors.phone ? 'border-red-500' : ''}`}
                          value={form.phoneCountryCode}
                          onChange={(e) => updateForm('phoneCountryCode', e.target.value)}
                        >
                          {COUNTRY_CODE_OPTIONS.map((cc) => (
                            <option key={cc} value={cc}>
                              {cc}
                            </option>
                          ))}
                        </select>
                        <input
                          inputMode="numeric"
                          pattern="\d{10}"
                          maxLength={10}
                          className={`min-h-[44px] min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-[color:var(--mdpl-accent)] focus:ring-0 ${errors.phone ? 'border-red-500' : ''}`}
                          placeholder="10-digit mobile number"
                          value={form.phoneNumber}
                          onChange={(e) => updateForm('phoneNumber', onlyDigits(e.target.value).slice(0, 10))}
                        />
                      </div>
                      {errors.phone && <p className="text-red-500 text-xs font-medium">{errors.phone}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Emergency Contact *</label>
                      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-stretch">
                        <select
                          className={`min-h-[44px] w-full shrink-0 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm focus:border-[color:var(--mdpl-accent)] focus:ring-0 sm:w-auto sm:min-w-[5.5rem] ${errors.emergencyContact ? 'border-red-500' : ''}`}
                          value={form.emergencyCountryCode}
                          onChange={(e) => updateForm('emergencyCountryCode', e.target.value)}
                        >
                          {COUNTRY_CODE_OPTIONS.map((cc) => (
                            <option key={cc} value={cc}>
                              {cc}
                            </option>
                          ))}
                        </select>
                        <input
                          inputMode="numeric"
                          pattern="\d{10}"
                          maxLength={10}
                          className={`min-h-[44px] min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-[color:var(--mdpl-accent)] focus:ring-0 ${errors.emergencyContact ? 'border-red-500' : ''}`}
                          placeholder="10-digit mobile number"
                          value={form.emergencyNumber}
                          onChange={(e) => updateForm('emergencyNumber', onlyDigits(e.target.value).slice(0, 10))}
                        />
                      </div>
                      {errors.emergencyContact && <p className="text-red-500 text-xs font-medium">{errors.emergencyContact}</p>}
                    </div>
                  </div>

                  <div className="flex w-full min-w-0 flex-col-reverse gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="min-h-[48px] w-full rounded-2xl bg-slate-100 px-6 py-3 font-bold text-slate-700 transition-all hover:bg-slate-200 sm:w-auto dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl px-6 py-3 text-center text-sm font-bold text-white transition-all hover:opacity-95 sm:w-auto mdpl-onboarding-accent-bg"
                    >
                      <span className="text-balance">Next: Training</span>
                      <ArrowRight className="size-5 shrink-0" />
                    </button>
                  </div>
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="grid min-w-0 grid-cols-1 gap-6 md:grid-cols-2">
                    {form.isStudent && (
                      <>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">Name of School/College</label>
                          <input
                            disabled
                            className="w-full bg-slate-100 border-slate-200 rounded-xl px-4 py-3 text-sm cursor-not-allowed opacity-60"
                            placeholder="e.g. St. Xavier's College"
                            value={form.schoolCollegeName}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">Institution City</label>
                          <input
                            disabled
                            className="w-full bg-slate-100 border-slate-200 rounded-xl px-4 py-3 text-sm cursor-not-allowed opacity-60"
                            placeholder="City"
                            value={form.schoolCollegeLocationCity}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">Institution State</label>
                          <input
                            disabled
                            className="w-full bg-slate-100 border-slate-200 rounded-xl px-4 py-3 text-sm cursor-not-allowed opacity-60"
                            placeholder="State"
                            value={form.schoolCollegeLocationState}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">Institution PIN Code</label>
                          <input
                            disabled
                            className="w-full bg-slate-100 border-slate-200 rounded-xl px-4 py-3 text-sm cursor-not-allowed opacity-60"
                            placeholder="700001"
                            value={form.schoolCollegeLocationPin}
                          />
                        </div>
                      </>
                    )}

                    <div className="md:col-span-2 rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3 text-xs text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-white/50">
                      These are <span className="font-bold text-slate-700 dark:text-white/80">preferences only</span>. Final assignment to a center, discipline, and instructor will be confirmed by the MDPL admin team after reviewing your application.
                    </div>

                    <div className={`space-y-2 ${!form.isStudent ? 'md:col-span-2' : ''}`}>
                      <label className="text-sm font-bold text-slate-700">Preferred Center</label>
                      <select
                        className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[color:var(--mdpl-accent)] focus:ring-0"
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
                        <option value="">Select preferred center</option>
                        {trainingCenters.map((center) => (
                          <option key={center.id} value={center.id}>
                            {center.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Preferred Instructor</label>
                      <input
                        type="text"
                        className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[color:var(--mdpl-accent)] focus:ring-0"
                        placeholder="e.g. Sensei Kumar (optional)"
                        value={form.instructorName}
                        onChange={(e) => updateForm('instructorName', e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-sm font-bold text-slate-700">Preferred Discipline</label>
                      <select
                        className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[color:var(--mdpl-accent)] focus:ring-0"
                        value={form.preferredDiscipline}
                        onChange={(e) => updateForm('preferredDiscipline', e.target.value)}
                      >
                        <option value="">Select discipline</option>
                        {disciplines.map((discipline) => (
                          <option key={discipline.value} value={discipline.value}>
                            {discipline.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <OnboardingFooterActions
                    onBack={handleBack}
                    onNext={handleNext}
                    nextLabel="Next: Review & submit"
                    backLabel="Previous"
                    showSubmit={false}
                  />
                </motion.div>
              )}

              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <ReviewSummaryCard
                    title="Personal"
                    items={[
                      { label: 'Full name', value: form.fullName },
                      { label: 'Parent / guardian', value: form.parentGuardianName },
                      { label: 'Gender', value: form.gender },
                      { label: 'Date of birth', value: form.dateOfBirth },
                      { label: 'Blood group', value: form.bloodGroup || '—' },
                      { label: 'Aadhaar', value: form.aadharNumber || '—' },
                      { label: 'Belt / grade', value: form.beltGrade || '—' },
                    ]}
                  />
                  <ReviewSummaryCard
                    title="Contact & account"
                    items={[
                      { label: 'Address', value: form.address },
                      { label: 'PIN', value: form.pincode },
                      { label: 'City / state', value: `${form.city}, ${form.state}` },
                      { label: 'Email', value: form.email },
                      { label: 'Phone', value: `${form.phoneCountryCode} ${form.phoneNumber}` },
                      { label: 'Emergency', value: `${form.emergencyCountryCode} ${form.emergencyNumber}` },
                    ]}
                  />
                  <ReviewSummaryCard
                    title="Training"
                    items={[
                      { label: 'Training center', value: form.trainingCenterName || '—' },
                      { label: 'Instructor', value: form.instructorName || '—' },
                      {
                        label: 'Preferred discipline',
                        value:
                          disciplines.find((d) => d.value === form.preferredDiscipline)?.label ||
                          form.preferredDiscipline ||
                          '—',
                      },
                      { label: 'Student at school/college', value: form.isStudent ? 'Yes' : 'No' },
                    ]}
                  />

                  <section
                    className={`space-y-4 rounded-2xl border border-slate-100 bg-slate-50 p-6 dark:border-white/10 dark:bg-white/5 ${
                      errors.termsAccepted ? 'border-red-500 shadow-lg shadow-red-100' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="terms"
                        className="mt-1 h-4 w-4 rounded text-[color:var(--mdpl-accent)] focus:ring-[color:var(--mdpl-accent)]"
                        checked={form.termsAccepted}
                        onChange={(e) => updateForm('termsAccepted', e.target.checked)}
                      />
                      <label htmlFor="terms" className="text-sm leading-relaxed text-slate-600 dark:text-white/75">
                        I agree to the{' '}
                        <Link className="font-bold text-[color:var(--mdpl-accent)] underline" to="#">
                          Terms of Service
                        </Link>{' '}
                        and understand the physical nature of martial arts training. I confirm that I am medically fit
                        to participate.
                        {errors.termsAccepted && (
                          <span className="ml-2 font-bold text-red-500">({errors.termsAccepted})</span>
                        )}
                      </label>
                    </div>
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="marketing"
                        className="mt-1 h-4 w-4 rounded text-[color:var(--mdpl-accent)] focus:ring-[color:var(--mdpl-accent)]"
                        checked={form.marketingOptIn}
                        onChange={(e) => updateForm('marketingOptIn', e.target.checked)}
                      />
                      <label htmlFor="marketing" className="text-sm leading-relaxed text-slate-600 dark:text-white/75">
                        I would like to receive updates about dojo events, seminars, and grading schedules.
                      </label>
                    </div>
                  </section>

                  <OnboardingFooterActions
                    onBack={handleBack}
                    showNext={false}
                    showSubmit
                    onSubmit={() => {
                      if (validateForFinalSubmit()) setConfirmSubmitOpen(true);
                    }}
                    submitLabel="Submit registration"
                    isSubmitting={isSubmitting}
                    isSubmitDisabled={isSubmitting}
                  />
                </motion.div>
              )}
            </AnimatePresence>
            {/* Camera Modal */}
            <AnimatePresence>
              {isCameraOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-6"
                >
                  <div className="relative w-full max-w-2xl bg-slate-900 rounded-3xl overflow-hidden shadow-2xl">
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full"
                    >
                      <X className="size-6" />
                    </button>
                    <div className="bg-black flex items-center justify-center">
                      <AspectRatio ratio={16 / 9} className="w-full">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          className="w-full h-full object-cover"
                        />
                      </AspectRatio>
                    </div>
                    <div className="p-8 flex justify-center">
                      <button
                        type="button"
                        onClick={capturePhoto}
                        className="size-20 bg-white rounded-full border-8 border-white/20 hover:scale-110 active:scale-90 flex items-center justify-center"
                      >
                        <div className="size-12 rounded-full mdpl-onboarding-accent-bg" />
                      </button>
                    </div>
                    <canvas ref={canvasRef} className="hidden" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          <ConfirmSubmitDialog
            isOpen={confirmSubmitOpen}
            onClose={() => setConfirmSubmitOpen(false)}
            onConfirm={() => void performSubmit()}
            isSubmitting={isSubmitting}
            title="Submit registration?"
            message="You are about to send your registration to MDPL for review. After submission you cannot edit this form from this device unless you start again."
          />

          <UnsavedChangesDialog
            isOpen={confirmExitOpen}
            onClose={() => setConfirmExitOpen(false)}
            onSaveDraft={() => {
              saveDraft();
              setConfirmExitOpen(false);
            }}
            onDiscard={() => setConfirmExitOpen(false)}
            title="Leave registration?"
            message="Your answers are auto-saved as a draft in this browser. Save an explicit copy, discard and leave, or stay to keep editing."
            saveLabel="Save draft & leave"
            discardLabel="Leave without saving again"
          />
        </OnboardingFormCard>

        <div className="mt-10 grid min-w-0 grid-cols-1 gap-4 text-slate-500 sm:mt-12 md:grid-cols-3 md:gap-6 dark:text-white/60">
          <div className="flex min-w-0 items-center gap-3">
            <Shield className="size-5 shrink-0 text-[color:var(--mdpl-accent)]" />
            <span className="text-xs font-bold uppercase tracking-wider">Secure enrollment</span>
          </div>
          <div className="flex min-w-0 items-center gap-3">
            <CheckCircle2 className="size-5 shrink-0 text-[color:var(--mdpl-accent)]" />
            <span className="text-xs font-bold uppercase tracking-wider">Certified instructors</span>
          </div>
          <div className="flex min-w-0 items-center gap-3">
            <Sword className="size-5 shrink-0 text-[color:var(--mdpl-accent)]" />
            <span className="text-xs font-bold uppercase tracking-wider">Traditional lineage</span>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
