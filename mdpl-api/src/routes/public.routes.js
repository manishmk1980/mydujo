/**
 * Public routes — no auth required.
 * POST /register: single atomic student registration (users + user_roles + students in one transaction).
 */
import { Router } from "express";
import argon2 from "argon2";
import nodemailer from "nodemailer";
import { prisma } from "../db.js";
import { createInstructorWithSync, ensureInstructorDisciplineColumn } from "../services/instructorRegistration.js";

const router = Router();

function sanitizeText(value, maxLength) {
  if (value == null) return "";
  return String(value).trim().slice(0, maxLength);
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPhone(value) {
  // Allows +, digits, spaces, dashes, and parentheses, with reasonable length.
  return /^\+?[0-9()\-\s]{7,20}$/.test(value);
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

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

router.get("/public/instructors", async (req, res) => {
  try {
    const instructors = await prisma.instructor.findMany({
      where: {
        isActive: true,
        publicProfileEnabled: true,
        publicConsentConfirmed: true,
        publicBio: { not: null },
        publicPhotoUrl: { not: null },
        publicDiscipline: { not: null },
      },
      select: {
        fullName: true,
        city: true,
        state: true,
        publicSlug: true,
        publicDisplayName: true,
        publicBio: true,
        publicPhotoUrl: true,
        publicDiscipline: true,
        publicDisplayOrder: true,
        isFeaturedPublic: true,
      },
      orderBy: [
        { isFeaturedPublic: "desc" },
        { publicDisplayOrder: { sort: "asc", nulls: "last" } },
        { publicDisplayName: "asc" },
        { fullName: "asc" },
      ],
    });

    return res.json({
      instructors: instructors.map((instructor) => ({
        publicSlug: instructor.publicSlug,
        displayName: instructor.publicDisplayName || instructor.fullName,
        publicBio: instructor.publicBio,
        city: instructor.city,
        state: instructor.state,
        publicPhotoUrl: instructor.publicPhotoUrl,
        discipline: instructor.publicDiscipline,
        isFeaturedPublic: instructor.isFeaturedPublic,
        publicDisplayOrder: instructor.publicDisplayOrder,
      })),
    });
  } catch (error) {
    console.error("GET /public/instructors error:", error);
    return res.status(500).json({ error: "Failed to load public instructors" });
  }
});

router.post("/register", async (req, res) => {
  try {
    const body = req.body || {};
    const full_name = body.full_name != null ? String(body.full_name).trim() : "";
    const email = body.email != null ? String(body.email).trim().toLowerCase() : "";
    const password = body.password != null ? String(body.password) : "";

    if (!full_name || !email || !password) {
      return res.status(400).json({ error: "full_name, email and password are required" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Please enter a valid email address" });
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
    const training_center_name = body.training_center_name != null && body.training_center_name !== "" ? String(body.training_center_name).trim() : null;
    const marketing_opt_in = !!body.marketing_opt_in;
    const terms_accepted_at = body.terms_accepted_at ? parseOptionalDate(body.terms_accepted_at) : new Date();
    if (!terms_accepted_at) {
      return res.status(400).json({ error: "Terms must be accepted" });
    }

    const result = await prisma.$transaction(async (tx) => {
      const now = new Date();
      const user = await tx.user.create({
        data: {
          email,
          password_hash: passwordHash,
          updated_at: now,
        },
      });

      await tx.userRole.create({
        data: {
          user_id: user.id,
          role_id: studentRole.id,
        },
      });

      const student = await tx.student.create({
        data: {
          users: {
            connect: { id: user.id },
          },
          ...(training_center_id
            ? {
                training_centers: {
                  connect: { id: training_center_id },
                },
              }
            : {}),
          full_name,
          email,
          phone,
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

/**
 * POST /register/instructor
 * Public instructor onboarding.
 */
router.post("/register/instructor", async (req, res) => {
  try {
    await ensureInstructorDisciplineColumn(prisma);
    const body = req.body || {};
    const idType = body.id_type != null ? String(body.id_type).trim() : "";
    const idNumber = body.id_number != null ? String(body.id_number).trim() : "";
    const idDocumentUrl = body.id_document_url != null ? String(body.id_document_url).trim() : "";
    const declarationAt = body.declaration_accepted_at != null ? String(body.declaration_accepted_at).trim() : "";
    const phone = body.phone != null ? String(body.phone).trim() : "";
    const city = body.city != null ? String(body.city).trim() : "";
    const state = body.state != null ? String(body.state).trim() : "";
    const preferredDiscipline =
      body.preferred_discipline != null ? String(body.preferred_discipline).trim() : "";
    if (!idType || !idNumber || !idDocumentUrl || !declarationAt) {
      return res.status(400).json({
        error: "id_type, id_number, id_document_url, and declaration_accepted_at are required",
      });
    }
    if (!phone) {
      return res.status(400).json({ error: "phone is required" });
    }
    if (!city || !state) {
      return res.status(400).json({ error: "city and state are required" });
    }
    if (!preferredDiscipline) {
      return res.status(400).json({ error: "preferred_discipline is required" });
    }
    const result = await prisma.$transaction((tx) =>
      createInstructorWithSync(
        tx,
        {
          ...body,
          // Account credentials are prepared at registration, but portal access
          // begins only after explicit Super Admin approval.
          can_login: false,
          is_active: false,
          approval_status: "PENDING_REVIEW",
        },
        {
          disallowExistingUser: true,
          loginRequired: true,
        }
      )
    );

    return res.status(201).json({
      message: "Instructor onboarding submitted successfully",
      instructor: {
        id: result.instructor.id,
        user_id: result.user?.id ?? null,
        full_name: result.instructor.full_name,
        email: result.instructor.email,
        training_center_id: result.instructor.training_center_id ?? null,
        training_center_name: result.instructor.training_center_name ?? null,
        preferred_discipline: result.instructor.preferred_discipline ?? null,
      },
    });
  } catch (err) {
    console.error("POST /register/instructor error:", err);
    const status = Number(err?.status || 500);
    return res.status(status).json({
      error: err?.message || "Failed to complete instructor onboarding",
    });
  }
});

router.post("/contact-enquiry", async (req, res) => {
  try {
    const body = req.body || {};
    const name = sanitizeText(body.name, 120);
    const phone = sanitizeText(body.phone, 40);
    const email = sanitizeText(body.email, 160).toLowerCase();
    const message = sanitizeText(body.message, 5000);

    if (!name || !phone || !email || !message) {
      return res.status(400).json({ error: "name, phone, email and message are required" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Please provide a valid email address" });
    }

    if (!isValidPhone(phone)) {
      return res.status(400).json({ error: "Please provide a valid phone number" });
    }

    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = Number(process.env.SMTP_PORT || 587);
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpSecure = String(process.env.SMTP_SECURE || "false").toLowerCase() === "true";
    const smtpFrom = process.env.SMTP_FROM || smtpUser;

    if (!smtpHost || !smtpUser || !smtpPass || !smtpFrom) {
      console.error("Contact enquiry mail config missing: SMTP_HOST/SMTP_USER/SMTP_PASS/SMTP_FROM");
      return res.status(500).json({ error: "Email service is not configured" });
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const recipients = process.env.CONTACT_ENQUIRY_TO || "sarjuram312@gmail.com, ui.manishmishra@gmail.com, mydojo.pvt.ltd@gmail.com";

    const safeName = escapeHtml(name);
    const safePhone = escapeHtml(phone);
    const safeEmail = escapeHtml(email);
    const safeMessage = escapeHtml(message).replace(/\n/g, "<br />");

    await transporter.sendMail({
      from: smtpFrom,
      to: recipients,
      replyTo: email,
      subject: `New Contact Enquiry from ${name}`,
      text: [
        "You have received a new contact enquiry.",
        "",
        `Name: ${name}`,
        `Phone: ${phone}`,
        `Email: ${email}`,
        "",
        "Message:",
        message,
      ].join("\n"),
      html: `
        <h2>New Contact Enquiry</h2>
        <p><strong>Name:</strong> ${safeName}</p>
        <p><strong>Phone:</strong> ${safePhone}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        <p><strong>Message:</strong></p>
        <p>${safeMessage}</p>
      `,
    });

    return res.status(200).json({ ok: true, message: "Enquiry sent successfully" });
  } catch (err) {
    console.error("POST /contact-enquiry error:", err);
    return res.status(500).json({ error: "Failed to send enquiry" });
  }
});

export default router;
