const VERIFICATION_MARKER = "--- MDPL instructor application ---";
const ADMIN_REVIEW_MARKER = "--- MDPL admin review ---";

function parseKeyValueLines(lines) {
  const data = {};
  for (const line of lines) {
    const match = String(line).match(/^([^:]+):\s*(.+)$/);
    if (match) data[match[1].trim()] = match[2].trim();
  }
  return data;
}

export function maskIdNumber(value) {
  const text = String(value || "").trim();
  if (!text) return "—";
  if (text.length <= 4) return "••••";
  return `${"•".repeat(Math.min(8, Math.max(4, text.length - 4)))}${text.slice(-4)}`;
}

export function parseInstructorBioSections(bio) {
  let remainder = String(bio || "").trim();
  let verification = null;
  let adminReview = null;

  const verificationIndex = remainder.indexOf(VERIFICATION_MARKER);
  if (verificationIndex >= 0) {
    const after = remainder.slice(verificationIndex);
    const nextMarker = after.indexOf("\n--- MDPL ", VERIFICATION_MARKER.length);
    const block = nextMarker >= 0 ? after.slice(0, nextMarker) : after;
    const lines = block.split("\n").slice(1);
    const parsed = parseKeyValueLines(lines);
    verification = {
      idType: parsed["ID Type"] || null,
      idNumber: parsed["ID Number"] || null,
      idDocumentUrl: parsed["ID Document URL"] || null,
      yearsExperience: parsed["Years of experience"] || null,
      declarationAcceptedAt: parsed["Declaration accepted at"] || null,
    };
    remainder = `${remainder.slice(0, verificationIndex)}${nextMarker >= 0 ? after.slice(nextMarker) : ""}`.trim();
  }

  const reviewIndex = remainder.indexOf(ADMIN_REVIEW_MARKER);
  if (reviewIndex >= 0) {
    adminReview = remainder.slice(reviewIndex + ADMIN_REVIEW_MARKER.length).trim();
    remainder = remainder.slice(0, reviewIndex).trim();
  }

  const legacyReview = remainder.match(/\nReview:\s*(.+)$/s);
  if (legacyReview) {
    adminReview = adminReview || legacyReview[1].trim();
    remainder = remainder.replace(/\nReview:\s*.+$/s, "").trim();
  }

  return {
    verification,
    adminReview: adminReview || null,
    cleanBio: remainder || null,
  };
}

export function upsertAdminReviewBlock(bio, note) {
  const { verification, cleanBio } = parseInstructorBioSections(bio);
  const verificationBlock = verification
    ? `${VERIFICATION_MARKER}\n${[
        verification.idType ? `ID Type: ${verification.idType}` : null,
        verification.idNumber ? `ID Number: ${verification.idNumber}` : null,
        verification.idDocumentUrl ? `ID Document URL: ${verification.idDocumentUrl}` : null,
        verification.yearsExperience ? `Years of experience: ${verification.yearsExperience}` : null,
        verification.declarationAcceptedAt ? `Declaration accepted at: ${verification.declarationAcceptedAt}` : null,
      ].filter(Boolean).join("\n")}`
    : null;

  const parts = [verificationBlock];
  if (note) parts.push(`${ADMIN_REVIEW_MARKER}\n${String(note).trim()}`);
  if (cleanBio) parts.push(cleanBio);
  return parts.filter(Boolean).join("\n\n").trim() || null;
}

/** TODO(schema): Move onboarding verification details out of Instructor.bio into dedicated application/verification fields. */
