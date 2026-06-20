import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { parsePublicProfilePayload, publicProfileErrorResponse } from "../utils/publicProfile.js";

const router = Router();

function requireSuperAdmin(req, res, next) {
  const roles = req?.auth?.roles || [];
  if (!roles.includes("SUPER_ADMIN")) {
    return res.status(403).json({ error: "not authorized" });
  }
  return next();
}

router.get("/", async (req, res) => {
  try {
    const centers = await prisma.trainingCenter.findMany({
      orderBy: { name: "asc" },
    });
    return res.json({ centers });
  } catch (err) {
    console.error("GET /training-centers error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/by-slug/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const center = await prisma.trainingCenter.findUnique({
      where: { slug },
      select: { id: true, name: true, slug: true, address: true, pincode: true, city: true, state: true, createdAt: true },
    });
    return res.json({ center });
  } catch (err) {
    console.error("GET /training-centers/by-slug/:slug error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", requireAuth, requireSuperAdmin, async (req, res) => {
  try {
    const b = req.body || {};
    const name = String(b.name || "").trim();
    let slug = String(b.slug || "").trim().toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_-]/g, "");
    if (!name) return res.status(400).json({ error: "name is required" });
    if (!slug) slug = name.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_-]/g, "");

    const existing = await prisma.trainingCenter.findUnique({ where: { slug } });
    if (existing) return res.status(409).json({ error: "slug already exists" });

    const center = await prisma.trainingCenter.create({
      data: {
        name,
        slug,
        address: b.address ? String(b.address).trim() || null : null,
        pincode: b.pincode ? String(b.pincode).trim() || null : null,
        city: b.city ? String(b.city).trim() || null : null,
        state: b.state ? String(b.state).trim() || null : null,
        instructorName: b.instructor_name ? String(b.instructor_name).trim() || null : null,
      },
    });
    return res.status(201).json({ center });
  } catch (err) {
    console.error("POST /training-centers error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id", requireAuth, requireSuperAdmin, async (req, res) => {
  const existing = await prisma.trainingCenter.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: "Training center not found" });
  const b = req.body || {};
  const status = b.status ? String(b.status).toUpperCase() : undefined;
  if (status && !["ACTIVE", "PAUSED", "ARCHIVED"].includes(status)) return res.status(400).json({ error: "Invalid status" });
  const center = await prisma.trainingCenter.update({
    where: { id: existing.id },
    data: {
      name: b.name,
      slug: b.slug,
      address: b.address,
      instructorName: b.instructor_name,
      pincode: b.pincode,
      city: b.city,
      state: b.state,
      status,
      statusNote: b.pause_reason,
      archivedAt: status === "ARCHIVED" ? new Date() : status ? null : undefined,
    },
  });
  return res.json({ center });
});

router.patch("/:id/public-profile", requireAuth, requireSuperAdmin, async (req, res) => {
  try {
    const existing = await prisma.trainingCenter.findUnique({
      where: { id: req.params.id },
      select: { id: true, status: true },
    });
    if (!existing) return res.status(404).json({ error: "Training center not found" });

    const data = parsePublicProfilePayload(req.body);
    if (data.publicProfileEnabled && existing.status !== "ACTIVE") {
      return res.status(409).json({ error: "Only active training centers can be published" });
    }

    const now = new Date();
    const publicProfile = await prisma.trainingCenter.update({
      where: { id: existing.id },
      data: {
        ...data,
        publicApprovedByUserId: data.publicProfileEnabled ? req.auth.userId : undefined,
        publicApprovedAt: data.publicProfileEnabled ? now : undefined,
        publicUpdatedAt: now,
      },
      select: {
        publicProfileEnabled: true,
        publicDisplayName: true,
        publicSlug: true,
        publicBio: true,
        publicPhotoUrl: true,
        publicDisplayOrder: true,
        isFeaturedPublic: true,
        publicApprovedAt: true,
        publicUpdatedAt: true,
      },
    });
    return res.json({ publicProfile });
  } catch (error) {
    console.error("PATCH /training-centers/:id/public-profile error:", error);
    const response = publicProfileErrorResponse(error, "Failed to update public profile");
    return res.status(response.status).json({ error: response.message });
  }
});

router.delete("/:id", requireAuth, requireSuperAdmin, async (req, res) => {
  const existing = await prisma.trainingCenter.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: "Training center not found" });
  const activeStudents = await prisma.student.count({ where: { trainingCenterId: existing.id, status: "approved" } });
  if (activeStudents) return res.status(409).json({ error: "Training center has active students", activeStudents, activeInstructors: 0 });
  const center = await prisma.trainingCenter.update({
    where: { id: existing.id },
    data: { status: "ARCHIVED", statusNote: req.body?.reason || null, archivedAt: new Date() },
  });
  return res.json({ center });
});

export default router;
