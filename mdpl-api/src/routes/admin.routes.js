import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { upsertAdminReviewBlock } from "../utils/instructorVerification.js";

const router = Router();
const requireSuperAdmin = (req, res, next) =>
  req.auth?.roles?.includes("SUPER_ADMIN") ? next() : res.status(403).json({ error: "not authorized" });

const STATUS_MAP = {
  PENDING_REVIEW: "PENDING_REVIEW",
  REQUEST_INFO: "REQUEST_INFO",
  NEEDS_MORE_INFO: "REQUEST_INFO",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  SUSPENDED: "SUSPENDED",
};

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
