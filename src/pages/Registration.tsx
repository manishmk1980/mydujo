import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Mail,
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
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { motion, AnimatePresence } from 'motion/react';
import { storageService } from '../services/storageService';
import type { GenderType } from '../types/registration';
import { AspectRatio } from '../components/ui/aspect-ratio';
import { API_BASE } from '../config';

const BLOOD_GROUP_OPTIONS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;
const COUNTRY_CODE_OPTIONS = ['+91', '+1', '+44', '+61', '+971', '+880', '+977', '+94'] as const;

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
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [successCredentials, setSuccessCredentials] = useState<{ email: string; password: string } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);

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
      // Training center and preferred discipline are optional for now as per user instructions
      if (!form.termsAccepted) newErrors.termsAccepted = 'You must accept the terms';
    }

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
    alert('Progress saved to draft!');
  };

  const updateForm = (field: keyof FormData, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  React.useEffect(() => {
    localStorage.setItem('registration_draft', JSON.stringify(form));
  }, [form]);

  const [stream, setStream] = useState<MediaStream | null>(null);

  const startCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      alert('Your browser does not support camera access.');
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
      alert(message);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
          training_center_id: null,
          training_center_name: form.trainingCenterName.trim() || null,
          marketing_opt_in: form.marketingOptIn,
          terms_accepted_at: new Date().toISOString(),
          blood_group: form.bloodGroup.trim() || null,
          aadhar_number: form.aadharNumber.trim() || null,
          qualification: form.qualification.trim() || null,
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
        setSubmitError((data as { error?: string }).error || 'Registration failed');
        return;
      }

      localStorage.removeItem('registration_draft');
      setSuccessCredentials({ email: form.email.trim(), password: form.password });
      setSubmitSuccess(true);
      setForm({
        fullName: '',
        parentGuardianName: '',
        gender: '',
        dateOfBirth: '',
        bloodGroup: '',
        aadharNumber: '',
        isStudent: false,
        qualification: '',
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
      if (err && typeof err === 'object') {
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
      <div className="min-h-screen bg-background-light">
        <Header />
        <main className="max-w-2xl mx-auto w-full px-6 py-24 text-center">
          <div className="inline-flex items-center justify-center p-6 bg-green-100 rounded-full text-green-600 mb-6">
            <CheckCircle2 className="size-16" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-4">Registration Complete!</h1>
          <p className="text-slate-600 mb-6">
            Registration submitted successfully. Awaiting admin approval.
          </p>
          {successCredentials && (
            <div className="mb-8 mx-auto max-w-md text-left bg-slate-50 border border-slate-200 rounded-2xl p-6">
              <p className="text-sm font-bold text-slate-700 mb-3">Save your login details:</p>
              <div className="space-y-3">
                <div>
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Email</span>
                  <p className="text-slate-900 font-mono break-all">{successCredentials.email}</p>
                </div>
                <div>
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Password</span>
                  <p className="text-slate-900 font-mono break-all">{successCredentials.password}</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-4">
                Store these safely. You can sign in after admin approves your registration.
              </p>
            </div>
          )}
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-2xl font-bold"
          >
            Sign In <ArrowRight className="size-5" />
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light">
      <Header />

      <main className="max-w-4xl mx-auto w-full px-6 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl text-primary mb-4">
            <Sword className="size-8" />
          </div>
          <h1 className="text-4xl font-black text-slate-900">Join MyDojo</h1>
          <p className="text-slate-500 mt-2 text-lg">Begin your journey to mastery. Fill out the form below to register.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="h-2 bg-slate-100 relative">
            <motion.div
              className="absolute left-0 top-0 h-full bg-primary"
              initial={{ width: '0%' }}
              animate={{ width: `${(currentStep / 3) * 100}%` }}
            />
          </div>

          <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center px-8">
            <div className="flex gap-4">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`size-8 rounded-full flex items-center justify-center font-bold text-sm ${currentStep === s ? 'bg-primary text-white' : s < currentStep ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                    {s < currentStep ? '✓' : s}
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-wider hidden sm:block ${currentStep === s ? 'text-primary' : 'text-slate-400'}`}>
                    {s === 1 ? 'Personal' : s === 2 ? 'Contact' : 'Training'}
                  </span>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={saveDraft}
              className="flex items-center gap-2 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-all"
            >
              <Lock className="size-3" /> Save Draft
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-10">
            {submitError && (
              <div className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 text-sm font-medium">
                {submitError}
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
                  <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                      <div className="size-40 rounded-full bg-slate-100 border-4 border-white shadow-2xl flex items-center justify-center text-slate-400 overflow-hidden relative group">
                        <AspectRatio ratio={1 / 1}>
                          {photo ? (
                            <img src={photo} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <User className="size-20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                          )}
                        </AspectRatio>
                        {photo && (
                          <button
                            type="button"
                            onClick={() => {
                              setPhoto(null);
                              setPhotoFile(null);
                            }}
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                          >
                            <RefreshCw className="size-8" />
                          </button>
                        )}
                      </div>
                      <div className="absolute -bottom-2 -right-2 flex gap-2">
                        <button type="button" onClick={startCamera} className="p-3 bg-primary text-white rounded-full shadow-xl hover:scale-110 active:scale-95" title="Take Photo">
                          <Camera className="size-5" />
                        </button>
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="p-3 bg-slate-800 text-white rounded-full shadow-xl hover:scale-110 active:scale-95" title="Upload Photo">
                          <Upload className="size-5" />
                        </button>
                      </div>
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                    </div>
                    <p className="text-sm font-bold text-slate-900">Student Profile Photo</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Full Name *</label>
                      <input
                        className={`w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-0 ${errors.fullName ? 'border-red-500' : ''}`}
                        placeholder="e.g. John Doe"
                        value={form.fullName}
                        onChange={(e) => updateForm('fullName', e.target.value)}
                      />
                      {errors.fullName && <p className="text-red-500 text-xs font-medium">{errors.fullName}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Parents/Guardian Name *</label>
                      <input
                        className={`w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-0 ${errors.parentGuardianName ? 'border-red-500' : ''}`}
                        placeholder="Full Name (e.g. Robert Smith)"
                        value={form.parentGuardianName}
                        onChange={(e) => updateForm('parentGuardianName', e.target.value)}
                      />
                      {errors.parentGuardianName && <p className="text-red-500 text-xs font-medium">{errors.parentGuardianName}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Gender *</label>
                      <select
                        className={`w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-0 ${errors.gender ? 'border-red-500' : ''}`}
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
                        className={`w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-0 ${errors.dateOfBirth ? 'border-red-500' : ''}`}
                        value={form.dateOfBirth}
                        onChange={(e) => updateForm('dateOfBirth', e.target.value)}
                      />
                      {errors.dateOfBirth && <p className="text-red-500 text-xs font-medium">{errors.dateOfBirth}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Blood Group</label>
                      <select
                        className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-0"
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
                        className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-0"
                        placeholder="0000 0000 0000"
                        value={form.aadharNumber}
                        onChange={(e) => updateForm('aadharNumber', e.target.value)}
                      />
                    </div>

                    <div className="md:col-span-2 flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                      <input
                        type="checkbox"
                        id="isStudent"
                        checked={form.isStudent}
                        onChange={(e) => updateForm('isStudent', e.target.checked)}
                        className="size-4 text-primary rounded"
                      />
                      <label htmlFor="isStudent" className="text-sm font-bold text-slate-700 select-none">Are you studying(School/Collage/University)</label>
                    </div>

                    {form.isStudent && (
                      <div className="md:col-span-2 grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">Class / Standard</label>
                          <input
                            className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-0"
                            placeholder="e.g. 10th Standard or Graduation"
                            value={form.qualification}
                            onChange={(e) => updateForm('qualification', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">School / University Name</label>
                          <input
                            className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-0"
                            placeholder="e.g. St. Xavier's College"
                            value={form.schoolCollegeName}
                            onChange={(e) => updateForm('schoolCollegeName', e.target.value)}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end pt-6">
                    <button
                      type="button"
                      onClick={handleNext}
                      className="px-8 py-4 bg-primary text-white rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition-all"
                    >
                      Next: Address & Contact <ArrowRight className="size-5" />
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
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-sm font-bold text-slate-700">Home Address *</label>
                      <textarea
                        className={`w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-0 ${errors.address ? 'border-red-500' : ''}`}
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
                        className={`w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-0 ${errors.pincode ? 'border-red-500' : ''}`}
                        placeholder="700001"
                        value={form.pincode}
                        onChange={(e) => updateForm('pincode', e.target.value)}
                      />
                      {errors.pincode && <p className="text-red-500 text-xs font-medium">{errors.pincode}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">City *</label>
                      <input
                        className={`w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-0 ${errors.city ? 'border-red-500' : ''}`}
                        placeholder="City Name"
                        value={form.city}
                        onChange={(e) => updateForm('city', e.target.value)}
                      />
                      {errors.city && <p className="text-red-500 text-xs font-medium">{errors.city}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">State *</label>
                      <input
                        className={`w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-0 ${errors.state ? 'border-red-500' : ''}`}
                        placeholder="State Name"
                        value={form.state}
                        onChange={(e) => updateForm('state', e.target.value)}
                      />
                      {errors.state && <p className="text-red-500 text-xs font-medium">{errors.state}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Locality</label>
                      <input
                        className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-0"
                        placeholder="Area / Neighborhood"
                        value={form.locality}
                        onChange={(e) => updateForm('locality', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Email Address *</label>
                      <input
                        type="email"
                        className={`w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-0 ${errors.email ? 'border-red-500' : ''}`}
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
                          className={`w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 pr-12 text-sm focus:border-primary focus:ring-0 ${errors.password ? 'border-red-500' : ''}`}
                          placeholder="At least 6 characters"
                          value={form.password}
                          onChange={(e) => updateForm('password', e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((p) => !p)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                        </button>
                      </div>
                      {errors.password && <p className="text-red-500 text-xs font-medium">{errors.password}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Phone Number *</label>
                      <div className="flex gap-2">
                        <select
                          className={`bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-0 ${errors.phone ? 'border-red-500' : ''}`}
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
                          className={`w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-0 ${errors.phone ? 'border-red-500' : ''}`}
                          placeholder="10-digit mobile number"
                          value={form.phoneNumber}
                          onChange={(e) => updateForm('phoneNumber', onlyDigits(e.target.value).slice(0, 10))}
                        />
                      </div>
                      {errors.phone && <p className="text-red-500 text-xs font-medium">{errors.phone}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Emergency Contact *</label>
                      <div className="flex gap-2">
                        <select
                          className={`bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-0 ${errors.emergencyContact ? 'border-red-500' : ''}`}
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
                          className={`w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-0 ${errors.emergencyContact ? 'border-red-500' : ''}`}
                          placeholder="10-digit mobile number"
                          value={form.emergencyNumber}
                          onChange={(e) => updateForm('emergencyNumber', onlyDigits(e.target.value).slice(0, 10))}
                        />
                      </div>
                      {errors.emergencyContact && <p className="text-red-500 text-xs font-medium">{errors.emergencyContact}</p>}
                    </div>
                  </div>

                  <div className="flex justify-between pt-6">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="px-8 py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      className="px-8 py-4 bg-primary text-white rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition-all"
                    >
                      Next: Training Info <ArrowRight className="size-5" />
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
                  <div className="grid md:grid-cols-2 gap-6">
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

                    <div className={`space-y-2 ${!form.isStudent ? 'md:col-span-2' : ''}`}>
                      <label className="text-sm font-bold text-slate-700">Training Center Name</label>
                      <input
                        type="text"
                        className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-0"
                        placeholder="e.g. Downtown Dojo"
                        value={form.trainingCenterName}
                        onChange={(e) => updateForm('trainingCenterName', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Instructor Name</label>
                      <input
                        type="text"
                        className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-0"
                        placeholder="e.g. Sensei Kumar"
                        value={form.instructorName}
                        onChange={(e) => updateForm('instructorName', e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-sm font-bold text-slate-700">Preferred Discipline</label>
                      <input
                        type="text"
                        className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-0"
                        placeholder="e.g. Karate, Judo, MMA"
                        value={form.preferredDiscipline}
                        onChange={(e) => updateForm('preferredDiscipline', e.target.value)}
                      />
                    </div>
                  </div>

                  <section className={`p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4 ${errors.termsAccepted ? 'border-red-500 shadow-lg shadow-red-100' : ''}`}>
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="terms"
                        className="mt-1 text-primary focus:ring-primary h-4 w-4 rounded"
                        checked={form.termsAccepted}
                        onChange={(e) => updateForm('termsAccepted', e.target.checked)}
                      />
                      <label htmlFor="terms" className="text-sm text-slate-600 leading-relaxed">
                        I agree to the <Link className="text-primary font-bold underline" to="#">Terms of Service</Link> and understand the physical nature of martial arts training. I confirm that I am medically fit to participate. {errors.termsAccepted && <span className="text-red-500 font-bold ml-2">({errors.termsAccepted})</span>}
                      </label>
                    </div>
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="marketing"
                        className="mt-1 text-primary focus:ring-primary h-4 w-4 rounded"
                        checked={form.marketingOptIn}
                        onChange={(e) => updateForm('marketingOptIn', e.target.checked)}
                      />
                      <label htmlFor="marketing" className="text-sm text-slate-600 leading-relaxed">
                        I would like to receive updates about dojo events, seminars, and grading schedules.
                      </label>
                    </div>
                  </section>

                  <div className="flex justify-between pt-6">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="px-8 py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                    >
                      Previous
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-8 py-4 bg-primary text-white rounded-2xl font-black text-lg hover:scale-[1.05] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed shadow-2xl shadow-primary/30 flex items-center justify-center gap-3"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="size-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Complete Registration <ArrowRight className="size-5" />
                        </>
                      )}
                    </button>
                  </div>
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
                        <div className="size-12 bg-primary rounded-full"></div>
                      </button>
                    </div>
                    <canvas ref={canvasRef} className="hidden" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>


        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="flex items-center gap-3 text-slate-500">
            <Shield className="size-5 text-primary" />
            <span className="text-xs font-bold uppercase tracking-wider">Secure Enrollment</span>
          </div>
          <div className="flex items-center gap-3 text-slate-500">
            <CheckCircle2 className="size-5 text-primary" />
            <span className="text-xs font-bold uppercase tracking-wider">Certified Instructors</span>
          </div>
          <div className="flex items-center gap-3 text-slate-500">
            <Sword className="size-5 text-primary" />
            <span className="text-xs font-bold uppercase tracking-wider">Traditional Lineage</span>
          </div>
        </div>
      </main >
      <Footer />
    </div >
  );
}
