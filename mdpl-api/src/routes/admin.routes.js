import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();
const requireSuperAdmin = (req, res, next) =>
  req.auth?.roles?.includes("SUPER_ADMIN") ? next() : res.status(403).json({ error: "not authorized" });

router.patch("/instructor-applications/:id", requireAuth, requireSuperAdmin, async (req, res) => {
  const instructor = await prisma.instructor.findUnique({ where: { id: req.params.id } });
  if (!instructor) return res.status(404).json({ error: "Instructor application not found" });
  const status = String(req.body?.status || "").toUpperCase();
  if (!["PENDING_REVIEW", "REQUEST_INFO", "APPROVED", "REJECTED"].includes(status)) {
    return res.status(400).json({ error: "Invalid application status" });
  }
  const updated = await prisma.instructor.update({
    where: { id: instructor.id },
    data: {
      isActive: status !== "REJECTED",
      canLogin: status === "APPROVED",
      bio: req.body?.reviewNotes ? `${instructor.bio || ""}\nReview: ${req.body.reviewNotes}`.trim() : undefined,
    },
  });
  return res.json({ instructor: updated, status });
});

export default router;
