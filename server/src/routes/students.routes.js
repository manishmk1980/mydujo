import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
import { countActivePortalUserIds, getActivityWindowMs } from "../services/portalActivity.js";

const router = Router();

function toIso(dt) {
  return dt ? new Date(dt).toISOString() : null;
}

function toDateOnlyIso(dt) {
  if (!dt) return null;
  const d = new Date(dt);
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}

function parseOptionalDate(value) {
  if (value == null || value === "") return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

const STATUS_ALLOWED = new Set(["draft", "pending", "approved", "paused", "rejected"]);
const STATUS_PATCH_ALLOWED = new Set(["pending", "approved", "paused", "rejected"]);
const DISCIPLINE_ENUM = new Set(["karate_shotokan", "judo_kodokan", "self_defense"]);

function parseStatus(status) {
  if (status == null || status === "") return undefined;
  const s = String(status).trim();
  return STATUS_ALLOWED.has(s) ? s : null;
}

function parseDiscipline(value) {
  if (value == null || value === "") return undefined;
  const v = String(value).trim();
  return DISCIPLINE_ENUM.has(v) ? v : undefined;
}

function serializeStudent(s, trainingCenter = null) {
  return {
    id: s.id,

    user_id: s.user_id ?? null,
    userId: s.user_id ?? null,

    full_name: s.full_name,
    fullName: s.full_name,

    email: s.email ?? null,
    phone: s.phone ?? null,

    date_of_birth: toDateOnlyIso(s.date_of_birth),
    dateOfBirth: toDateOnlyIso(s.date_of_birth),

    gender: s.gender ?? null,

    blood_group: s.blood_group ?? null,
    bloodGroup: s.blood_group ?? null,

    emergency_contact: s.emergency_contact ?? null,
    emergencyContact: s.emergency_contact ?? null,

    preferred_discipline: s.preferred_discipline ?? null,
    preferredDiscipline: s.preferred_discipline ?? null,

    profile_photo_url: s.profile_photo_url ?? null,
    profilePhotoUrl: s.profile_photo_url ?? null,

    status: s.status ?? null,

    marketing_opt_in: Boolean(s.marketing_opt_in),
    marketingOptIn: Boolean(s.marketing_opt_in),

    terms_accepted_at: toIso(s.terms_accepted_at),
    termsAcceptedAt: toIso(s.terms_accepted_at),

    created_at: toIso(s.created_at),
    createdAt: toIso(s.created_at),

    training_center_id: s.training_center_id ?? null,
    trainingCenterId: s.training_center_id ?? null,

    parent_guardian_name: s.parent_guardian_name ?? null,
    parentGuardianName: s.parent_guardian_name ?? null,

    aadhar_number: s.aadhar_number ?? null,
    aadharNumber: s.aadhar_number ?? null,

    qualification: s.qualification ?? null,
    address: s.address ?? null,
    pincode: s.pincode ?? null,
    city: s.city ?? null,
    state: s.state ?? null,
    locality: s.locality ?? null,

    school_college_name: s.school_college_name ?? null,
    schoolCollegeName: s.school_college_name ?? null,

    school_college_location_city: s.school_college_location_city ?? null,
    schoolCollegeLocationCity: s.school_college_location_city ?? null,

    school_college_location_state: s.school_college_location_state ?? null,
    schoolCollegeLocationState: s.school_college_location_state ?? null,

    school_college_location_pin: s.school_college_location_pin ?? null,
    schoolCollegeLocationPin: s.school_college_location_pin ?? null,

    instructor_name: s.instructor_name ?? null,
    instructorName: s.instructor_name ?? null,

    validated_at: toIso(s.validated_at),
    validatedAt: toIso(s.validated_at),

    validated_by: s.validated_by ?? null,
    validatedBy: s.validated_by ?? null,

    registration_id: s.registration_id ?? null,
    registrationId: s.registration_id ?? null,

    enrollment_id: s.enrollment_id ?? null,
    enrollmentId: s.enrollment_id ?? null,

    training_centers: trainingCenter
      ? {
          id: trainingCenter.id,
          name: trainingCenter.name,
          slug: trainingCenter.slug,
        }
      : null,
  };
}

async function getTrainingCenterMap(studentRows) {
  const ids = [...new Set(studentRows.map((s) => s.training_center_id).filter(Boolean))];
  if (!ids.length) return new Map();

  const centers = await prisma.training_centers.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });

  return new Map(centers.map((c) => [c.id, c]));
}

// GET /students
router.get("/", requireAuth, async (_req, res) => {
  try {
    const rows = await prisma.students.findMany({
      orderBy: { created_at: "desc" },
    });

    const centerMap = await getTrainingCenterMap(rows);
    const students = rows.map((row) =>
      serializeStudent(row, centerMap.get(row.training_center_id) || null)
    );

    return res.json({ students });
  } catch (err) {
    console.error("GET /students error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /students/dashboard-stats — admin overview (must be before /:id)
router.get("/dashboard-stats", requireAuth, requireRole(["ADMIN", "SUPER_ADMIN"]), async (_req, res) => {
  try {
    const windowMs = getActivityWindowMs();
    const [registered, approved, approvedWithLogin] = await Promise.all([
      prisma.students.count(),
      prisma.students.count({ where: { status: "approved" } }),
      prisma.students.findMany({
        where: { status: "approved", user_id: { not: null } },
        select: { user_id: true },
      }),
    ]);
    const userIds = approvedWithLogin.map((s) => s.user_id).filter(Boolean);
    const activePortal = countActivePortalUserIds(userIds, windowMs);

    return res.json({
      registered,
      approved,
      active_portal: activePortal,
      active_within_ms: windowMs,
      active_within_minutes: Math.round(windowMs / 60000),
    });
  } catch (err) {
    console.error("GET /students/dashboard-stats error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /students/by-user/:userId
router.get("/by-user/:userId", requireAuth, async (req, res) => {
  try {
    const { userId } = req.params;

    const row = await prisma.students.findFirst({
      where: { user_id: userId },
    });

    if (!row) {
      return res.status(404).json({ error: "Student not found" });
    }

    let center = null;
    if (row.training_center_id) {
      center = await prisma.training_centers.findUnique({
        where: { id: row.training_center_id },
        select: { id: true, name: true, slug: true },
      });
    }

    return res.json({ student: serializeStudent(row, center) });
  } catch (err) {
    console.error("GET /students/by-user/:userId error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /students/:id
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const row = await prisma.students.findUnique({
      where: { id },
    });

    if (!row) {
      return res.status(404).json({ error: "Student not found" });
    }

    let center = null;
    if (row.training_center_id) {
      center = await prisma.training_centers.findUnique({
        where: { id: row.training_center_id },
        select: { id: true, name: true, slug: true },
      });
    }

    return res.json({ student: serializeStudent(row, center) });
  } catch (err) {
    console.error("GET /students/:id error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /students
router.post("/", requireAuth, async (req, res) => {
  try {
    const b = req.body || {};

    const status = parseStatus(b.status);
    if (status === null) {
      return res.status(400).json({ error: "Invalid status" });
    }

    if (!b.full_name || !String(b.full_name).trim()) {
      return res.status(400).json({ error: "full_name is required" });
    }

    if (!b.email || !String(b.email).trim()) {
      return res.status(400).json({ error: "email is required" });
    }

    const row = await prisma.students.create({
      data: {
        user_id: b.user_id ?? null,
        full_name: String(b.full_name).trim(),
        email: String(b.email).trim(),
        phone: b.phone ?? null,
        date_of_birth: parseOptionalDate(b.date_of_birth),
        gender: b.gender ?? null,
        blood_group: b.blood_group ?? null,
        emergency_contact: b.emergency_contact ?? null,
        preferred_discipline: parseDiscipline(b.preferred_discipline) ?? null,
        training_center_id: b.training_center_id ?? null,
        profile_photo_url: b.profile_photo_url ?? null,
        status: status ?? "pending",
        marketing_opt_in:
          b.marketing_opt_in !== undefined ? Boolean(b.marketing_opt_in) : false,
        terms_accepted_at: parseOptionalDate(b.terms_accepted_at),
        parent_guardian_name: b.parent_guardian_name ?? null,
        aadhar_number: b.aadhar_number ?? null,
        qualification: b.qualification ?? null,
        address: b.address ?? null,
        pincode: b.pincode ?? null,
        city: b.city ?? null,
        state: b.state ?? null,
        locality: b.locality ?? null,
        school_college_name: b.school_college_name ?? null,
        school_college_location_city: b.school_college_location_city ?? null,
        school_college_location_state: b.school_college_location_state ?? null,
        school_college_location_pin: b.school_college_location_pin ?? null,
        instructor_name: b.instructor_name ?? null,
      },
    });

    let center = null;
    if (row.training_center_id) {
      center = await prisma.training_centers.findUnique({
        where: { id: row.training_center_id },
        select: { id: true, name: true, slug: true },
      });
    }

    return res.status(201).json({ student: serializeStudent(row, center) });
  } catch (err) {
    console.error("POST /students error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /students/:id
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const b = req.body || {};

    const status = parseStatus(b.status);
    if (status === null) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const data = {};

    if (b.full_name != null) data.full_name = String(b.full_name).trim();
    if (b.email != null) data.email = String(b.email).trim();
    if (b.phone !== undefined) data.phone = b.phone ?? null;
    if (b.date_of_birth !== undefined) data.date_of_birth = parseOptionalDate(b.date_of_birth);
    if (b.gender !== undefined) data.gender = b.gender ?? null;
    if (b.blood_group !== undefined) data.blood_group = b.blood_group ?? null;
    if (b.emergency_contact !== undefined) data.emergency_contact = b.emergency_contact ?? null;
    if (b.preferred_discipline !== undefined) {
      data.preferred_discipline = parseDiscipline(b.preferred_discipline) ?? null;
    }
    if (b.training_center_id !== undefined) data.training_center_id = b.training_center_id ?? null;
    if (b.profile_photo_url !== undefined) data.profile_photo_url = b.profile_photo_url ?? null;
    if (status !== undefined) data.status = status;
    if (b.marketing_opt_in !== undefined) data.marketing_opt_in = Boolean(b.marketing_opt_in);
    if (b.terms_accepted_at !== undefined) data.terms_accepted_at = parseOptionalDate(b.terms_accepted_at);
    if (b.parent_guardian_name !== undefined) data.parent_guardian_name = b.parent_guardian_name ?? null;
    if (b.aadhar_number !== undefined) data.aadhar_number = b.aadhar_number ?? null;
    if (b.qualification !== undefined) data.qualification = b.qualification ?? null;
    if (b.address !== undefined) data.address = b.address ?? null;
    if (b.pincode !== undefined) data.pincode = b.pincode ?? null;
    if (b.city !== undefined) data.city = b.city ?? null;
    if (b.state !== undefined) data.state = b.state ?? null;
    if (b.locality !== undefined) data.locality = b.locality ?? null;
    if (b.school_college_name !== undefined) data.school_college_name = b.school_college_name ?? null;
    if (b.school_college_location_city !== undefined) {
      data.school_college_location_city = b.school_college_location_city ?? null;
    }
    if (b.school_college_location_state !== undefined) {
      data.school_college_location_state = b.school_college_location_state ?? null;
    }
    if (b.school_college_location_pin !== undefined) {
      data.school_college_location_pin = b.school_college_location_pin ?? null;
    }
    if (b.instructor_name !== undefined) data.instructor_name = b.instructor_name ?? null;

    const row = await prisma.students.update({
      where: { id },
      data,
    });

    let center = null;
    if (row.training_center_id) {
      center = await prisma.training_centers.findUnique({
        where: { id: row.training_center_id },
        select: { id: true, name: true, slug: true },
      });
    }

    return res.json({ student: serializeStudent(row, center) });
  } catch (err) {
    console.error("PUT /students/:id error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /students/:id/status
router.patch("/:id/status", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body || {};

    if (!status || !STATUS_PATCH_ALLOWED.has(String(status))) {
      return res.status(400).json({
        error: `Invalid status. Allowed values: ${[...STATUS_PATCH_ALLOWED].join(", ")}`,
      });
    }

    const existing = await prisma.students.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ error: "Student not found" });
    }

    const updated = await prisma.students.update({
      where: { id },
      data: { status: String(status) },
    });

    let center = null;
    if (updated.training_center_id) {
      center = await prisma.training_centers.findUnique({
        where: { id: updated.training_center_id },
        select: { id: true, name: true, slug: true },
      });
    }

    return res.json({
      message: `Student status updated to ${status}`,
      student: serializeStudent(updated, center),
    });
  } catch (err) {
    console.error("PATCH /students/:id/status error:", err);
    return res.status(500).json({ error: "Failed to update student status" });
  }
});

// DELETE /students/:id
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.students.delete({ where: { id } });
    return res.json({ ok: true });
  } catch (err) {
    console.error("DELETE /students/:id error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;