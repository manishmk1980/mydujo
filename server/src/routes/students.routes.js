import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

function toIso(dt) {
  return dt ? new Date(dt).toISOString() : null;
}

function toDateOnlyIso(dt) {
  if (!dt) return null;
  const d = new Date(dt);
  // keep it stable for UI date inputs
  return d.toISOString().slice(0, 10);
}

function serializeStudent(s) {
  return {
    id: s.id,
    user_id: s.userId,
    full_name: s.fullName,
    email: s.email,
    phone: s.phone,
    date_of_birth: toDateOnlyIso(s.dateOfBirth),
    gender: s.gender,
    blood_group: s.bloodGroup,
    emergency_contact: s.emergencyContact,
    preferred_discipline: s.preferredDiscipline,
    profile_photo_url: s.profilePhotoUrl,
    status: s.status,
    marketing_opt_in: s.marketingOptIn,
    terms_accepted_at: toIso(s.termsAcceptedAt),
    created_at: toIso(s.created_at),
    training_center_id: s.training_center_id,
    parent_guardian_name: s.parentGuardianName,
    aadhar_number: s.aadharNumber,
    qualification: s.qualification,
    address: s.address,
    pincode: s.pincode,
    city: s.city,
    state: s.state,
    locality: s.locality,
    school_college_name: s.schoolCollegeName,
    school_college_location_city: s.schoolCollegeLocationCity,
    school_college_location_state: s.schoolCollegeLocationState,
    school_college_location_pin: s.schoolCollegeLocationPin,
    instructor_name: s.instructorName,
    validated_at: toIso(s.validatedAt),
    validated_by: s.validatedBy,
    registration_id: s.registrationId,
    enrollment_id: s.enrollmentId,
    training_centers: s.training_centers
      ? { name: s.training_centers.name, slug: s.training_centers.slug }
      : null,
  };
}

function parseStatus(status) {
  if (status == null) return undefined;
  const allowed = new Set(["draft", "pending", "approved", "paused", "rejected"]);
  if (!allowed.has(status)) return null;
  return status;
}

const STATUS_PATCH_ALLOWED = new Set(["pending", "approved", "paused", "rejected"]);

const DISCIPLINE_ENUM = new Set(["karate_shotokan", "judo_kodokan", "self_defense"]);
function parseDiscipline(value) {
  if (value == null || value === "") return undefined;
  const v = String(value).trim();
  return DISCIPLINE_ENUM.has(v) ? v : undefined;
}

function parseOptionalDate(value) {
  if (value == null || value === "") return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}


// Dashboard student statistics (admin)
router.get("/dashboard-stats", requireAuth, async (req, res) => {
  try {
    const [registered, approved] = await Promise.all([
      prisma.students.count(),
      prisma.students.count({ where: { status: "approved" } }),
    ]);

    let activeInPortal = 0;

    try {
      const activeRows = await prisma.$queryRawUnsafe(`
        SELECT COUNT(DISTINCT s.user_id) AS active
        FROM students s
        INNER JOIN refresh_tokens rt ON rt.user_id = s.user_id
        WHERE s.user_id IS NOT NULL
          AND s.status = 'approved'
      `);

      activeInPortal = Number(activeRows?.[0]?.active || 0);
    } catch (activeErr) {
      console.warn("dashboard-stats active portal count fallback:", activeErr.message);
    }

    return res.json({
      registered,
      approved,
      activeInPortal,

      // Compatibility aliases for frontend naming differences
      registeredCount: registered,
      approvedCount: approved,
      activePortalCount: activeInPortal,
      totalStudents: registered,
      approvedStudents: approved,
      activeStudents: activeInPortal,
    });
  } catch (err) {
    console.error("GET /students/dashboard-stats error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// List students (admin)
router.get("/", requireAuth, async (req, res) => {
  try {
    const rows = await prisma.students.findMany({
      orderBy: { created_at: "desc" },
      include: {
        training_centers: { select: { name: true, slug: true } },
      },
    });

    return res.json({ students: rows.map(serializeStudent) });
  } catch (err) {
    console.error("GET /students error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/by-user/:userId", requireAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const row = await prisma.students.findUnique({
      where: { userId },
      include: {
        training_centers: { select: { name: true, slug: true } },
      },
    });

    if (!row) return res.status(404).json({ error: "Student not found" });
    return res.json({ student: serializeStudent(row) });
  } catch (err) {
    console.error("GET /students/by-user/:userId error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const row = await prisma.students.findUnique({
      where: { id },
      include: {
        training_centers: { select: { name: true, slug: true } },
      },
    });

    if (!row) return res.status(404).json({ error: "Student not found" });
    return res.json({ student: serializeStudent(row) });
  } catch (err) {
    console.error("GET /students/:id error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

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
        userId: b.user_id ?? null,
        fullName: String(b.full_name).trim(),
        email: String(b.email).trim(),
        phone: b.phone ?? null,
        dateOfBirth: parseOptionalDate(b.date_of_birth),
        gender: b.gender ?? null,
        bloodGroup: b.blood_group ?? null,
        emergencyContact: b.emergency_contact ?? null,
        preferredDiscipline: parseDiscipline(b.preferred_discipline) ?? undefined,
        training_center_id: b.training_center_id ?? null,
        profilePhotoUrl: b.profile_photo_url ?? null,
        status: status ?? undefined,
        marketingOptIn: Boolean(b.marketing_opt_in),
        termsAcceptedAt: parseOptionalDate(b.terms_accepted_at),
        parentGuardianName: b.parent_guardian_name ?? null,
        aadharNumber: b.aadhar_number ?? null,
        qualification: b.qualification ?? null,
        address: b.address ?? null,
        pincode: b.pincode ?? null,
        city: b.city ?? null,
        state: b.state ?? null,
        locality: b.locality ?? null,
        schoolCollegeName: b.school_college_name ?? null,
        schoolCollegeLocationCity: b.school_college_location_city ?? null,
        schoolCollegeLocationState: b.school_college_location_state ?? null,
        schoolCollegeLocationPin: b.school_college_location_pin ?? null,
        instructorName: b.instructor_name ?? null,
      },
      include: {
        training_centers: { select: { name: true, slug: true } },
      },
    });

    return res.status(201).json({ student: serializeStudent(row) });
  } catch (err) {
    console.error("POST /students error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const b = req.body || {};

    const status = parseStatus(b.status);
    if (status === null) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const row = await prisma.students.update({
      where: { id },
      data: {
        fullName: b.full_name != null ? String(b.full_name).trim() : undefined,
        phone: b.phone ?? undefined,
        dateOfBirth: b.date_of_birth !== undefined ? parseOptionalDate(b.date_of_birth) : undefined,
        gender: b.gender ?? undefined,
        bloodGroup: b.blood_group ?? undefined,
        emergencyContact: b.emergency_contact ?? undefined,
        preferredDiscipline: parseDiscipline(b.preferred_discipline) ?? undefined,
        training_center_id: b.training_center_id ?? undefined,
        profilePhotoUrl: b.profile_photo_url ?? undefined,
        status: status ?? undefined,
        marketingOptIn: b.marketing_opt_in !== undefined ? Boolean(b.marketing_opt_in) : undefined,
        termsAcceptedAt: b.terms_accepted_at !== undefined ? parseOptionalDate(b.terms_accepted_at) : undefined,
        parentGuardianName: b.parent_guardian_name ?? undefined,
        aadharNumber: b.aadhar_number ?? undefined,
        qualification: b.qualification ?? undefined,
        address: b.address ?? undefined,
        pincode: b.pincode ?? undefined,
        city: b.city ?? undefined,
        state: b.state ?? undefined,
        locality: b.locality ?? undefined,
        schoolCollegeName: b.school_college_name ?? undefined,
        schoolCollegeLocationCity: b.school_college_location_city ?? undefined,
        schoolCollegeLocationState: b.school_college_location_state ?? undefined,
        schoolCollegeLocationPin: b.school_college_location_pin ?? undefined,
        instructorName: b.instructor_name ?? undefined,
      },
      include: {
        training_centers: { select: { name: true, slug: true } },
      },
    });

    return res.json({ student: serializeStudent(row) });
  } catch (err) {
    console.error("PUT /students/:id error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id/status", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body || {};

    if (!status || !STATUS_PATCH_ALLOWED.has(status)) {
      return res.status(400).json({
        error: `Invalid status. Allowed values: ${[...STATUS_PATCH_ALLOWED].join(", ")}`,
      });
    }

    const existingStudent = await prisma.students.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!existingStudent) {
      return res.status(404).json({ error: "Student not found" });
    }

    const updatedStudent = await prisma.students.update({
      where: { id },
      data: { status },
      include: {
        user: true,
        training_centers: true,
      },
    });

    return res.json({
      message: `Student status updated to ${status}`,
      student: serializeStudent({
        ...updatedStudent,
        email: updatedStudent.email ?? updatedStudent.user?.email ?? "",
      }),
    });
  } catch (err) {
    console.error("PATCH /students/:id/status error:", err);
    return res.status(500).json({ error: "Failed to update student status" });
  }
});

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
