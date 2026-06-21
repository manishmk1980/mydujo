import { Router } from "express";
import { randomBytes } from "node:crypto";
import argon2 from "argon2";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/requireAuth.js";
import {
  parseInstructorBioSections,
  replaceInstructorCleanBio,
  upsertAdminReviewBlock,
} from "../utils/instructorVerification.js";

const router = Router();
const requireSuperAdmin = (req, res, next) =>
  req.auth?.roles?.includes("SUPER_ADMIN") ? next() : res.status(403).json({ error: "not authorized" });
const requireAdmin = (req, res, next) =>
  req.auth?.roles?.some((role) => role === "ADMIN" || role === "SUPER_ADMIN")
    ? next()
    : res.status(403).json({ error: "not authorized" });

const cleanOptional = (value, max) => {
  if (value == null) return undefined;
  const text = String(value).trim();
  return text ? text.slice(0, max) : null;
};

function validPhone(value) {
  return value == null || value === "" || /^[+]?[\d\s().-]{7,20}$/.test(String(value).trim());
}

function temporaryPassword() {
  return `${randomBytes(9).toString("base64url")}!7a`;
}

function instructorAdminDto(instructor) {
  const { cleanBio, adminReview } = parseInstructorBioSections(instructor.bio);
  return {
    id: instructor.id,
    fullName: instructor.fullName,
    email: instructor.email,
    phone: instructor.phone,
    city: instructor.city,
    state: instructor.state,
    bio: cleanBio,
    applicationReviewNote: adminReview,
    isActive: instructor.isActive,
    canLogin: instructor.canLogin,
    approvalStatus: instructor.approvalStatus,
    approvedAt: instructor.approvedAt,
    lastLoginAt: instructor.user?.lastLoginAt ?? null,
  };
}

const STATUS_MAP = {
  PENDING_REVIEW: "PENDING_REVIEW",
  REQUEST_INFO: "REQUEST_INFO",
  NEEDS_MORE_INFO: "REQUEST_INFO",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  SUSPENDED: "SUSPENDED",
};

router.patch("/instructors/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const existing = await prisma.instructor.findUnique({
      where: { id: req.params.id },
      include: { user: { select: { lastLoginAt: true } } },
    });
    if (!existing) return res.status(404).json({ error: "Instructor not found" });

    const fullName = String(req.body?.fullName || "").trim();
    if (!fullName || fullName.length > 255) {
      return res.status(400).json({ error: "Full name is required and must be 255 characters or fewer" });
    }
    if (!validPhone(req.body?.phone)) {
      return res.status(400).json({ error: "Enter a valid phone number" });
    }

    const updated = await prisma.instructor.update({
      where: { id: existing.id },
      data: {
        fullName,
        phone: cleanOptional(req.body?.phone, 32),
        city: cleanOptional(req.body?.city, 128),
        state: cleanOptional(req.body?.state, 128),
        bio: req.body?.internalNote !== undefined
          ? replaceInstructorCleanBio(existing.bio, cleanOptional(req.body.internalNote, 512))
          : undefined,
      },
      include: { user: { select: { lastLoginAt: true } } },
    });
    return res.json({ instructor: instructorAdminDto(updated) });
  } catch (error) {
    console.error("PATCH /admin/instructors/:id error:", error);
    return res.status(500).json({ error: "Failed to update instructor details" });
  }
});

router.post("/instructors/:id/reset-password", requireAuth, requireSuperAdmin, async (req, res) => {
  try {
    const instructor = await prisma.instructor.findUnique({
      where: { id: req.params.id },
      include: { user: true },
    });
    if (!instructor) return res.status(404).json({ error: "Instructor not found" });
    if (instructor.approvalStatus !== "APPROVED") {
      return res.status(409).json({ error: "Approve the instructor account before creating login credentials" });
    }

    const requested = req.body?.temporaryPassword == null ? "" : String(req.body.temporaryPassword);
    const password = requested || temporaryPassword();
    if (password.length < 10 || password.length > 128) {
      return res.status(400).json({ error: "Temporary password must be between 10 and 128 characters" });
    }
    const passwordHash = await argon2.hash(password);
    let loginUsername = instructor.user?.email || instructor.email;

    await prisma.$transaction(async (tx) => {
      let user = instructor.user;
      if (!user) {
        const existingUser = await tx.user.findUnique({ where: { email: instructor.email } });
        if (existingUser) {
          const linkedInstructor = await tx.instructor.findFirst({ where: { userId: existingUser.id } });
          if (linkedInstructor && linkedInstructor.id !== instructor.id) {
            const error = new Error("Email is already linked to another instructor account");
            error.status = 409;
            throw error;
          }
          user = existingUser;
        } else {
          user = await tx.user.create({
            data: { email: instructor.email, passwordHash, status: "ACTIVE" },
          });
        }
        await tx.instructor.update({
          where: { id: instructor.id },
          data: { userId: user.id },
        });
      }
      loginUsername = user.email;

      await tx.user.update({
        where: { id: user.id },
        data: { passwordHash, status: "ACTIVE" },
      });
      const role = await tx.role.findUnique({ where: { name: "INSTRUCTOR" } });
      if (role) {
        await tx.userRole.upsert({
          where: { userId_roleId: { userId: user.id, roleId: role.id } },
          update: {},
          create: { userId: user.id, roleId: role.id },
        });
      }
      await tx.refreshToken.deleteMany({ where: { userId: user.id } });
      await tx.instructor.update({
        where: { id: instructor.id },
        data: { isActive: true, canLogin: true },
      });
    });

    return res.json({
      username: loginUsername,
      temporaryPassword: password,
      loginUrl: process.env.INSTRUCTOR_LOGIN_URL || "https://mydojo.co.in/instructor/login",
      warning: "This temporary password is returned once and is not stored in readable form.",
    });
  } catch (error) {
    console.error("POST /admin/instructors/:id/reset-password error:", error);
    return res.status(Number(error?.status) || 500).json({
      error: Number(error?.status) ? error.message : "Failed to reset instructor password",
    });
  }
});

router.patch("/instructor-applications/:id", requireAuth, requireSuperAdmin, async (req, res) => {
  const instructor = await prisma.instructor.findUnique({ where: { id: req.params.id } });
  if (!instructor) return res.status(404).json({ error: "Instructor application not found" });

  const rawStatus = String(req.body?.status || "").toUpperCase();
  const status = STATUS_MAP[rawStatus];
  if (!status) return res.status(400).json({ error: "Invalid application status" });

  const reviewNote = String(req.body?.requestedInfoMessage || req.body?.reviewNotes || "").trim().slice(0, 1000);
  const nextBio = status === "REQUEST_INFO" && reviewNote
    ? upsertAdminReviewBlock(instructor.bio, reviewNote)
    : instructor.bio;

  const access = status === "APPROVED"
    ? { isActive: true, canLogin: true }
    : status === "REQUEST_INFO"
      ? { isActive: instructor.isActive, canLogin: instructor.canLogin }
      : { isActive: false, canLogin: false };

  const updated = await prisma.instructor.update({
    where: { id: instructor.id },
    data: {
      ...access,
      approvalStatus: status,
      approvedAt: status === "APPROVED" ? new Date() : status === "REJECTED" ? null : instructor.approvedAt,
      approvedByUserId: status === "APPROVED" ? req.auth.userId : instructor.approvedByUserId,
      bio: nextBio,
    },
  });

  return res.json({ instructor: updated, status });
});

export default router;
