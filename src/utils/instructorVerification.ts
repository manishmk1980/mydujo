export const VERIFICATION_MARKER = '--- MDPL instructor application ---';
export const ADMIN_REVIEW_MARKER = '--- MDPL admin review ---';

export type InstructorVerificationDetails = {
  idType: string | null;
  idNumber: string | null;
  idDocumentUrl: string | null;
  yearsExperience: string | null;
  declarationAcceptedAt: string | null;
};

export type InstructorBioSections = {
  verification: InstructorVerificationDetails | null;
  adminReview: string | null;
  cleanBio: string | null;
};

function parseKeyValueLines(lines: string[]) {
  const data: Record<string, string> = {};
  for (const line of lines) {
    const match = String(line).match(/^([^:]+):\s*(.+)$/);
    if (match) data[match[1].trim()] = match[2].trim();
  }
  return data;
}

export function maskIdNumber(value: string | null | undefined): string {
  const text = String(value || '').trim();
  if (!text) return '—';
  if (text.length <= 4) return '••••';
  return `${'•'.repeat(Math.min(8, Math.max(4, text.length - 4)))}${text.slice(-4)}`;
}

export function parseInstructorBioSections(bio?: string | null): InstructorBioSections {
  let remainder = String(bio || '').trim();
  let verification: InstructorVerificationDetails | null = null;
  let adminReview: string | null = null;

  const verificationIndex = remainder.indexOf(VERIFICATION_MARKER);
  if (verificationIndex >= 0) {
    const after = remainder.slice(verificationIndex);
    const nextMarker = after.indexOf('\n--- MDPL ', VERIFICATION_MARKER.length);
    const block = nextMarker >= 0 ? after.slice(0, nextMarker) : after;
    const parsed = parseKeyValueLines(block.split('\n').slice(1));
    verification = {
      idType: parsed['ID Type'] || null,
      idNumber: parsed['ID Number'] || null,
      idDocumentUrl: parsed['ID Document URL'] || null,
      yearsExperience: parsed['Years of experience'] || null,
      declarationAcceptedAt: parsed['Declaration accepted at'] || null,
    };
    remainder = `${remainder.slice(0, verificationIndex)}${nextMarker >= 0 ? after.slice(nextMarker) : ''}`.trim();
  }

  const reviewIndex = remainder.indexOf(ADMIN_REVIEW_MARKER);
  if (reviewIndex >= 0) {
    adminReview = remainder.slice(reviewIndex + ADMIN_REVIEW_MARKER.length).trim();
    remainder = remainder.slice(0, reviewIndex).trim();
  }

  const legacyReview = remainder.match(/\nReview:\s*(.+)$/s);
  if (legacyReview) {
    adminReview = adminReview || legacyReview[1].trim();
    remainder = remainder.replace(/\nReview:\s*.+$/s, '').trim();
  }

  return { verification, adminReview, cleanBio: remainder || null };
}

export function formatApprovalStatus(status?: string | null): string {
  const map: Record<string, string> = {
    PENDING_REVIEW: 'Pending Review',
    REQUEST_INFO: 'More Info Requested',
    NEEDS_MORE_INFO: 'More Info Requested',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
    SUSPENDED: 'Suspended',
  };
  return map[String(status || 'PENDING_REVIEW').toUpperCase()] || 'Pending Review';
}

export function approvalBadgeVariant(status?: string | null): 'success' | 'warning' | 'info' | 'danger' | 'neutral' {
  const value = String(status || 'PENDING_REVIEW').toUpperCase();
  if (value === 'APPROVED') return 'success';
  if (value === 'REJECTED') return 'danger';
  if (value === 'SUSPENDED') return 'warning';
  if (value === 'REQUEST_INFO' || value === 'NEEDS_MORE_INFO') return 'info';
  return 'warning';
}

/** TODO(schema): Move onboarding verification details out of Instructor.bio into dedicated application/verification fields. */
