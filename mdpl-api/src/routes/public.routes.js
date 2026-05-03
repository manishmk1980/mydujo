/**
 * Public routes — no auth required.
 * POST /register: single atomic student registration (User + UserRole + Student in one transaction).
 */
import { Router } from "express";
import argon2 from "argon2";
import { prisma } from "../db.js";

const router = Router();

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

router.post("/register", async (req, res) => {
  try {
    const body = req.body || {};
    const full_name = body.full_name != null ? String(body.full_name).trim() : "";
    const email = body.email != null ? String(body.email).trim().toLowerCase() : "";
    const password = body.password != null ? String(body.password) : "";

    if (!full_name || !email || !password) {
      return res.status(400).json({ error: "full_name, email and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "password must be at least 6 characters" });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const passwordHash = await argon2.hash(password);

    const studentRole = await prisma.role.findUnique({
      where: { name: "STUDENT" },
    });

    if (!studentRole) {
      return res.status(500).json({ error: "STUDENT role not found" });
    }

    const phone = body.phone != null && body.phone !== "" ? String(body.phone).trim() : null;
    const gender = body.gender != null && ["male", "female", "other"].includes(body.gender) ? body.gender : null;
    const date_of_birth = parseOptionalDate(body.date_of_birth);
    const parent_guardian_name = body.parent_guardian_name != null && body.parent_guardian_name !== "" ? String(body.parent_guardian_name).trim() : null;
    const emergency_contact = body.emergency_contact != null && body.emergency_contact !== "" ? String(body.emergency_contact).trim() : null;
    const preferred_discipline = parseDiscipline(body.preferred_discipline);
    const training_center_id = body.training_center_id != null && body.training_center_id !== "" ? String(body.training_center_id).trim() : null;
    const marketing_opt_in = !!body.marketing_opt_in;
    const terms_accepted_at = body.terms_accepted_at ? parseOptionalDate(body.terms_accepted_at) : new Date();
    if (!terms_accepted_at) {
      return res.status(400).json({ error: "Terms must be accepted" });
    }

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
        },
      });

      await tx.userRole.create({
        data: {
          userId: user.id,
          roleId: studentRole.id,
        },
      });

      const student = await tx.student.create({
        data: {
          userId: user.id,
          fullName: full_name,
          email,
          phone,
          trainingCenterId: training_center_id,
          gender,
          dateOfBirth: date_of_birth,
          parentGuardianName: parent_guardian_name,
          emergencyContact: emergency_contact,
          preferredDiscipline: preferred_discipline ?? undefined,
          marketingOptIn: marketing_opt_in,
          termsAcceptedAt: terms_accepted_at,
          status: "pending",
          bloodGroup: body.blood_group != null && body.blood_group !== "" ? String(body.blood_group).trim() : null,
          aadharNumber: body.aadhar_number != null && body.aadhar_number !== "" ? String(body.aadhar_number).trim() : null,
          qualification: body.qualification != null && body.qualification !== "" ? String(body.qualification).trim() : null,
          address: body.address != null && body.address !== "" ? String(body.address).trim() : null,
          pincode: body.pincode != null && body.pincode !== "" ? String(body.pincode).trim() : null,
          city: body.city != null && body.city !== "" ? String(body.city).trim() : null,
          state: body.state != null && body.state !== "" ? String(body.state).trim() : null,
          locality: body.locality != null && body.locality !== "" ? String(body.locality).trim() : null,
          schoolCollegeName: body.school_college_name != null && body.school_college_name !== "" ? String(body.school_college_name).trim() : null,
          schoolCollegeLocationCity: body.school_college_location_city != null && body.school_college_location_city !== "" ? String(body.school_college_location_city).trim() : null,
          schoolCollegeLocationState: body.school_college_location_state != null && body.school_college_location_state !== "" ? String(body.school_college_location_state).trim() : null,
          schoolCollegeLocationPin: body.school_college_location_pin != null && body.school_college_location_pin !== "" ? String(body.school_college_location_pin).trim() : null,
          instructorName: body.instructor_name != null && body.instructor_name !== "" ? String(body.instructor_name).trim() : null,
          profilePhotoUrl: body.profile_photo_url != null && body.profile_photo_url !== "" ? String(body.profile_photo_url).trim() : null,
        },
      });

      return { user, student };
    });

    return res.status(201).json({
      message: "Registration submitted successfully",
      student: {
        id: result.student.id,
        user_id: result.user.id,
        full_name: result.student.fullName,
        email: result.student.email,
        phone: result.student.phone,
        training_center_id: result.student.trainingCenterId,
        status: result.student.status,
      },
    });
  } catch (err) {
    console.error("POST /register error:", err);
    return res.status(500).json({ error: "Failed to complete registration" });
  }
});

export default router;
