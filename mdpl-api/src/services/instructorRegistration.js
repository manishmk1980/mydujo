import argon2 from "argon2";

function makeError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function cleanText(value, max = 255) {
  if (value == null) return "";
  return String(value).trim().slice(0, max);
}

function cleanOptional(value, max = 255) {
  const v = cleanText(value, max);
  return v || null;
}

function normalizeEmail(value) {
  return cleanText(value, 255).toLowerCase();
}

function normalizeProfilePhotoUrl(value) {
  const url = cleanOptional(value, 512);
  if (!url) return null;
  const normalized = url.replace(/\\/g, "/");
  const allowed = [
    "/uploads/profile-photos/instructors/",
    "/uploads/profile-photos/instructors/onboarding/",
  ];
  if (!allowed.some((fragment) => normalized.includes(fragment))) {
    throw makeError(400, "Invalid profile_photo_url path");
  }
  return normalized;
}

function normalizeIdDocumentUrl(value) {
  const url = cleanOptional(value, 512);
  if (!url) return null;
  const normalized = url.replace(/\\/g, "/");
  if (!normalized.includes("/uploads/payment-proofs/")) {
    throw makeError(400, "Invalid id_document_url path");
  }
  return normalized;
}

function buildInstructorBioExtras(payload) {
  const idType = cleanOptional(payload.id_type ?? payload.idType, 64);
  const idNumber = cleanOptional(payload.id_number ?? payload.idNumber, 64);
  const idDocumentUrl = normalizeIdDocumentUrl(payload.id_document_url ?? payload.idDocumentUrl);
  const yearsExperience = cleanOptional(payload.years_experience ?? payload.yearsExperience, 16);
  const declarationAt = cleanOptional(payload.declaration_accepted_at ?? payload.declarationAcceptedAt, 64);
  const lines = [];
  if (idType) lines.push(`ID Type: ${idType}`);
  if (idNumber) lines.push(`ID Number: ${idNumber}`);
  if (idDocumentUrl) lines.push(`ID Document URL: ${idDocumentUrl}`);
  if (yearsExperience) lines.push(`Years of experience: ${yearsExperience}`);
  if (declarationAt) lines.push(`Declaration accepted at: ${declarationAt}`);
  if (!lines.length) return "";
  return `\n--- MDPL instructor application ---\n${lines.join("\n")}`;
}

function mergeInstructorBio(baseBio, payload) {
  const base = cleanOptional(baseBio, 12000) || "";
  const extras = buildInstructorBioExtras(payload);
  const merged = `${base}${extras}`.trim();
  return merged ? merged.slice(0, 16000) : null;
}

function slugifyCenterName(name) {
  const raw = String(name || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_-]/g, "");
  return raw || "center";
}

async function ensureUniqueCenterSlug(tx, baseSlug) {
  let candidate = baseSlug;
  let i = 1;
  while (true) {
    const existing = await tx.training_centers.findUnique({ where: { slug: candidate } });
    if (!existing) return candidate;
    candidate = `${baseSlug}_${i++}`;
  }
}

async function ensureTrainingCenter(tx, payload) {
  const trainingCenterId = cleanOptional(
    payload.training_center_id ?? payload.trainingCenterId ?? payload.center_id ?? null,
    64
  );
  const trainingCenterName = cleanOptional(
    payload.training_center_name ?? payload.trainingCenterName ?? payload.center_name ?? payload.centerName ?? null,
    255
  );
  const city = cleanOptional(payload.city ?? null, 128);
  const state = cleanOptional(payload.state ?? null, 128);
  const instructorName = cleanOptional(payload.instructor_name ?? payload.full_name ?? payload.fullName ?? null, 255);

  let center = null;
  if (trainingCenterId) {
    center = await tx.training_centers.findUnique({ where: { id: trainingCenterId } });
    if (!center) throw makeError(400, "training_center_id not found");
  } else if (trainingCenterName) {
    center = await tx.training_centers.findFirst({
      where: { name: trainingCenterName },
    });

    if (!center) {
      const slugBase = slugifyCenterName(trainingCenterName);
      const slug = await ensureUniqueCenterSlug(tx, slugBase);
      center = await tx.training_centers.create({
        data: {
          name: trainingCenterName,
          slug,
          city,
          state,
          instructor_name: instructorName,
        },
      });
    } else if (instructorName && !center.instructor_name) {
      center = await tx.training_centers.update({
        where: { id: center.id },
        data: { instructor_name: instructorName },
      });
    }
  }

  return center;
}

export async function ensureInstructorDisciplineColumn(tx) {
  const schemaName = process.env.DB_NAME;
  if (!schemaName) return;
  const rows = await tx.$queryRawUnsafe(
    `
      SELECT COLUMN_NAME
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = ?
        AND TABLE_NAME = 'instructors'
        AND COLUMN_NAME = 'preferred_discipline'
      LIMIT 1
    `,
    schemaName
  );
  if (Array.isArray(rows) && rows.length > 0) return;

  await tx.$executeRawUnsafe(
    "ALTER TABLE instructors ADD COLUMN preferred_discipline VARCHAR(64) NULL AFTER training_center_name"
  );
}

async function ensureInstructorRole(tx) {
  const role = await tx.roles.findUnique({ where: { name: "INSTRUCTOR" } });
  if (!role) throw makeError(500, "INSTRUCTOR role not found");
  return role;
}

export async function createInstructorWithSync(tx, payload, opts = {}) {
  const fullName = cleanText(payload.full_name ?? payload.fullName, 255);
  const email = normalizeEmail(payload.email);
  const password = String(payload.password ?? "");
  const phone = cleanOptional(payload.phone, 32);
  const city = cleanOptional(payload.city, 128);
  const state = cleanOptional(payload.state, 128);
  const profilePhotoUrl = normalizeProfilePhotoUrl(payload.profile_photo_url ?? payload.profilePhotoUrl);
  const bio = mergeInstructorBio(payload.bio, payload);
  const preferredDiscipline = cleanOptional(payload.preferred_discipline ?? payload.preferredDiscipline, 64);
  const canLogin = payload.can_login ?? payload.canLogin ?? true;
  const isActive = payload.is_active ?? payload.isActive ?? true;

  if (!fullName) throw makeError(400, "full_name is required");
  if (!email) throw makeError(400, "email is required");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw makeError(400, "invalid email format");

  const loginRequired = opts.loginRequired === true || Boolean(canLogin);
  if (loginRequired && password.length < 6) {
    throw makeError(400, "password must be at least 6 characters");
  }

  const existingByEmail = await tx.instructors.findFirst({ where: { email } });
  if (existingByEmail) {
    throw makeError(409, "Instructor profile already exists for this email");
  }

  let user = await tx.users.findUnique({ where: { email } });
  if (user && opts.disallowExistingUser) {
    throw makeError(409, "Email already registered");
  }

  if (!user && loginRequired) {
    const passwordHash = await argon2.hash(password);
    user = await tx.users.create({
      data: {
        email,
        password_hash: passwordHash,
        updated_at: new Date(),
      },
    });
  }

  if (user) {
    const existingByUserId = await tx.instructors.findFirst({
      where: { user_id: user.id },
    });
    if (existingByUserId) {
      throw makeError(409, "Instructor profile already exists for this user");
    }
  }

  const center = await ensureTrainingCenter(tx, {
    ...payload,
    full_name: fullName,
    city,
    state,
  });

  const instructor = await tx.instructors.create({
    data: {
      user_id: user?.id ?? null,
      full_name: fullName,
      email,
      phone,
      bio,
      city,
      state,
      profile_photo_url: profilePhotoUrl,
      is_active: Boolean(isActive),
      can_login: Boolean(canLogin),
      training_center_id: center?.id ?? null,
      training_center_name: center?.name ?? cleanOptional(payload.training_center_name ?? payload.trainingCenterName, 255),
      preferred_discipline: preferredDiscipline,
    },
  });

  if (user) {
    const instructorRole = await ensureInstructorRole(tx);
    await tx.user_roles.create({
      data: {
        user_id: user.id,
        role_id: instructorRole.id,
      },
    }).catch(async (err) => {
      // Ignore duplicate role assignment errors from unique constraint.
      if (String(err?.code || "").includes("P2002")) return;
      throw err;
    });
  }

  return { instructor, user, center };
}
