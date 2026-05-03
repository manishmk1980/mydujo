/**
 * Post-approval instructor profile completion (not implemented in UI yet).
 * Used to type-check future dashboard flows: profile, certs, documents, center, professional info.
 */

export type InstructorPostApprovalProfile = {
  headline?: string;
  shortBio?: string;
  languages?: string[];
  availabilityNotes?: string;
};

export type InstructorPostApprovalCertification = {
  title: string;
  issuer?: string;
  year?: number;
  documentUrl?: string;
};

export type InstructorPostApprovalDocument = {
  label: string;
  fileUrl: string;
  uploadedAt?: string;
};

export type InstructorPostApprovalCenterAssignment = {
  trainingCenterId: string | null;
  trainingCenterName: string | null;
  primaryLocationCity?: string;
  primaryLocationState?: string;
};

export type InstructorPostApprovalProfessional = {
  yearsExperience?: number;
  primaryDisciplines?: string[];
  teachingCredentials?: string[];
};

export type InstructorPostApprovalCompletion = {
  profile: InstructorPostApprovalProfile;
  certifications: InstructorPostApprovalCertification[];
  documents: InstructorPostApprovalDocument[];
  center: InstructorPostApprovalCenterAssignment;
  professional: InstructorPostApprovalProfessional;
};
