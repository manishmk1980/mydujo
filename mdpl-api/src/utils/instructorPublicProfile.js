const REQUIRED_ITEMS = [
  ["publicDisplayName", "Public display name"],
  ["publicBio", "Public bio"],
  ["publicPhotoUrl", "Profile photo"],
  ["location", "City and state"],
  ["publicDiscipline", "Discipline or style"],
  ["publicConsentConfirmed", "Public profile consent"],
];

function hasValue(value) {
  return typeof value === "string" ? Boolean(value.trim()) : Boolean(value);
}

export function getInstructorPublicProfileCompletion(instructor) {
  const values = {
    publicDisplayName: instructor.publicDisplayName || instructor.fullName,
    publicBio: instructor.publicBio,
    publicPhotoUrl: instructor.publicPhotoUrl,
    location: instructor.city && instructor.state,
    publicDiscipline: instructor.publicDiscipline,
    publicConsentConfirmed: instructor.publicConsentConfirmed,
  };
  const missing = REQUIRED_ITEMS
    .filter(([key]) => !hasValue(values[key]))
    .map(([, label]) => label);
  const total = REQUIRED_ITEMS.length;
  const completed = total - missing.length;
  return {
    percentage: Math.round((completed / total) * 100),
    completed,
    total,
    missing,
    isReadyForReview: missing.length === 0,
  };
}

export function slugifyPublicName(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 220) || "instructor";
}

export async function ensureUniqueInstructorPublicSlug(tx, instructorId, displayName) {
  const base = slugifyPublicName(displayName);
  let candidate = base;
  let suffix = 2;
  while (await tx.instructor.findFirst({
    where: {
      publicSlug: candidate,
      NOT: { id: instructorId },
    },
    select: { id: true },
  })) {
    candidate = `${base}-${suffix++}`;
  }
  return candidate;
}

export function serializeInstructorPublicProfile(instructor) {
  const completion = getInstructorPublicProfileCompletion(instructor);
  const status = instructor.publicProfileEnabled
    ? "PUBLISHED"
    : instructor.publicReviewStatus === "CHANGES_REQUESTED"
      ? "CHANGES_REQUESTED"
      : instructor.publicReviewStatus === "READY_FOR_REVIEW"
        ? "READY_FOR_REVIEW"
        : completion.percentage === 0
          ? "DRAFT"
          : "INCOMPLETE";
  return {
    publicDisplayName: instructor.publicDisplayName || instructor.fullName,
    publicSlug: instructor.publicSlug,
    publicBio: instructor.publicBio,
    publicPhotoUrl: instructor.publicPhotoUrl,
    publicDiscipline: instructor.publicDiscipline,
    publicConsentConfirmed: instructor.publicConsentConfirmed,
    publicProfileEnabled: instructor.publicProfileEnabled,
    publicDisplayOrder: instructor.publicDisplayOrder,
    isFeaturedPublic: instructor.isFeaturedPublic,
    publicReviewStatus: instructor.publicReviewStatus,
    publicChangesRequestedNote: instructor.publicChangesRequestedNote,
    publicReviewSubmittedAt: instructor.publicReviewSubmittedAt,
    publicApprovedAt: instructor.publicApprovedAt,
    city: instructor.city,
    state: instructor.state,
    status,
    completion,
  };
}
