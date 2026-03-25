/**
 * Public routes — no auth required.
 * POST /register: single atomic student registration (users + user_roles + students in one transaction).
 */
import { Router } from "express";
import argon2 from "argon2";
import { prisma } from "../db.js";

const router = Router();

const DISCIPLINE_ENUM = new Set(["karate_shotokan", "judo_kodokan", "self_defense"]);
function parseDiscipline(value) {
  if (value == null || value === "") return null;
  const v = String(value).trim();
  if (!v) return null;
  return DISCIPLINE_ENUM.has(v) ? v : v; // allow enum or free text
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

    const existingUser = await prisma.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const passwordHash = await argon2.hash(password);

    const studentRole = await prisma.roles.findUnique({
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
    const training_center_name = body.training_center_name != null && body.training_center_name !== "" ? String(body.training_center_name).trim() : null;
    const marketing_opt_in = !!body.marketing_opt_in;
    const terms_accepted_at = body.terms_accepted_at ? parseOptionalDate(body.terms_accepted_at) : new Date();
    if (!terms_accepted_at) {
      return res.status(400).json({ error: "Terms must be accepted" });
    }

    const result = await prisma.$transaction(async (tx) => {
      const now = new Date();
      const user = await tx.users.create({
        data: {
          email,
          password_hash: passwordHash,
          updated_at: now,
        },
      });

      await tx.user_roles.create({
        data: {
          user_id: user.id,
          role_id: studentRole.id,
        },
      });

      const student = await tx.students.create({
        data: {
          user_id: user.id,
          full_name,
          email,
          phone,
          training_center_id,
          gender,
          date_of_birth,
          parent_guardian_name,
          emergency_contact,
          preferred_discipline: preferred_discipline ?? null,
          training_center_name,
          marketing_opt_in,
          terms_accepted_at,
          status: "pending",
          blood_group: body.blood_group != null && body.blood_group !== "" ? String(body.blood_group).trim() : null,
          aadhar_number: body.aadhar_number != null && body.aadhar_number !== "" ? String(body.aadhar_number).trim() : null,
          qualification: body.qualification != null && body.qualification !== "" ? String(body.qualification).trim() : null,
          address: body.address != null && body.address !== "" ? String(body.address).trim() : null,
          pincode: body.pincode != null && body.pincode !== "" ? String(body.pincode).trim() : null,
          city: body.city != null && body.city !== "" ? String(body.city).trim() : null,
          state: body.state != null && body.state !== "" ? String(body.state).trim() : null,
          locality: body.locality != null && body.locality !== "" ? String(body.locality).trim() : null,
          school_college_name: body.school_college_name != null && body.school_college_name !== "" ? String(body.school_college_name).trim() : null,
          school_college_location_city: body.school_college_location_city != null && body.school_college_location_city !== "" ? String(body.school_college_location_city).trim() : null,
          school_college_location_state: body.school_college_location_state != null && body.school_college_location_state !== "" ? String(body.school_college_location_state).trim() : null,
          school_college_location_pin: body.school_college_location_pin != null && body.school_college_location_pin !== "" ? String(body.school_college_location_pin).trim() : null,
          instructor_name: body.instructor_name != null && body.instructor_name !== "" ? String(body.instructor_name).trim() : null,
          profile_photo_url: body.profile_photo_url != null && body.profile_photo_url !== "" ? String(body.profile_photo_url).trim() : null,
        },
      });

      return { user, student };
    });

    return res.status(201).json({
      message: "Registration submitted successfully",
      student: {
        id: result.student.id,
        user_id: result.user.id,
        full_name: result.student.full_name,
        email: result.student.email,
        phone: result.student.phone,
        training_center_id: result.student.training_center_id,
        status: result.student.status,
      },
    });
  } catch (err) {
    console.error("POST /register error:", err);
    const msg = err?.message || "Unknown error";
    return res.status(500).json({
      error: "Failed to complete registration",
      ...(process.env.NODE_ENV === "development" && { debug: msg }),
    });
  }
});

export default router;
