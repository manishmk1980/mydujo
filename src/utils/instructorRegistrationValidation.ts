export const OTHER_DISCIPLINE_VALUE = '__other__';
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
export const ID_DOCUMENT_ACCEPTED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
] as const;

export type InstructorFormValues = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  city: string;
  state: string;
  preferredDiscipline: string;
  customDiscipline: string;
  yearsExperience: string;
  idType: string;
  idNumber: string;
  declaration: boolean;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+]?[\d\s().-]{7,20}$/;

export function validateIdDocumentFile(file: File | null): string | null {
  if (!file) return 'ID document upload is required';
  if (file.size > MAX_UPLOAD_BYTES) return 'File is too large. Maximum allowed size is 8MB.';
  if (!ID_DOCUMENT_ACCEPTED_TYPES.includes(file.type as (typeof ID_DOCUMENT_ACCEPTED_TYPES)[number])) {
    return 'Unsupported file type. Use JPG, PNG, WebP, or PDF.';
  }
  return null;
}

export function validateProfilePhotoFile(file: File | null): string | null {
  if (!file) return null;
  if (file.size > MAX_UPLOAD_BYTES) return 'File is too large. Maximum allowed size is 8MB.';
  if (!file.type.startsWith('image/')) return 'Profile photo must be an image file.';
  return null;
}

export function validateInstructorRegistration(
  form: InstructorFormValues,
  idDocFile: File | null,
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!form.fullName.trim()) errors.fullName = 'Full name is required';
  if (!form.email.trim()) errors.email = 'Email is required';
  else if (!EMAIL_RE.test(form.email.trim())) errors.email = 'Enter a valid email address';
  if (!form.phone.trim()) errors.phone = 'Phone number is required';
  else if (!PHONE_RE.test(form.phone.trim())) errors.phone = 'Enter a valid phone number';
  if (!form.password) errors.password = 'Password is required';
  else if (form.password.length < 6) errors.password = 'Password must be at least 6 characters';
  if (!form.confirmPassword) errors.confirmPassword = 'Please confirm your password';
  else if (form.password !== form.confirmPassword) errors.confirmPassword = 'Passwords do not match';
  if (!form.city.trim()) errors.city = 'City is required';
  if (!form.state.trim()) errors.state = 'State is required';

  if (!form.preferredDiscipline) {
    errors.preferredDiscipline = 'Discipline / style is required';
  } else if (form.preferredDiscipline === OTHER_DISCIPLINE_VALUE && !form.customDiscipline.trim()) {
    errors.customDiscipline = 'Please specify your discipline / style';
  }

  if (!form.idType) errors.idType = 'ID type is required';
  if (!form.idNumber.trim()) errors.idNumber = 'ID number is required';

  const idDocError = validateIdDocumentFile(idDocFile);
  if (idDocError && idDocFile) errors.idDocument = idDocError;
  else if (!idDocFile) errors.idDocument = 'ID document upload is required';

  if (!form.declaration) errors.declaration = 'You must accept the declaration to continue';

  return errors;
}

export function resolveDisciplineValue(form: InstructorFormValues): string {
  // Sent via preferred_discipline in POST /register/instructor. Backend column sync is handled server-side.
  if (form.preferredDiscipline === OTHER_DISCIPLINE_VALUE) {
    return form.customDiscipline.trim().slice(0, 64);
  }
  return form.preferredDiscipline;
}

export function mapInstructorRegistrationError(status: number, message: string): string {
  const normalized = String(message || '').toLowerCase();
  if (status === 409 && (normalized.includes('email already registered') || normalized.includes('instructor profile already exists'))) {
    return 'This email is already registered. Please sign in or use another email.';
  }
  if (status === 400) {
    if (normalized.includes('invalid email')) return 'Enter a valid email address.';
    if (normalized.includes('password must be at least')) return 'Password must be at least 6 characters.';
    if (normalized.includes('phone is required')) return 'Phone number is required.';
    if (normalized.includes('preferred_discipline')) return 'Discipline / style is required.';
    if (normalized.includes('id_type') || normalized.includes('id_number') || normalized.includes('id_document')) {
      return 'Please complete all government ID fields and upload your ID document.';
    }
    return 'Please check your application details and try again.';
  }
  return 'Unable to submit your application right now. Please try again shortly.';
}

/** TODO(server): Add optional WebP optimization on upload for JPG/PNG instructor ID docs and profile photos.
 *  Keep PDF unchanged; preserve response shape { url }; do not break /upload/payment-proof consumers. */
export const WEBP_UPLOAD_OPTIMIZATION_TODO = true;
