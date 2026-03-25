import { Router } from "express";
import { prisma } from "../db.js";

const router = Router();

function serializeInstructor(row) {
  if (!row) return null;

  return {
    id: row.id,

    // keep both styles so frontend does not break
    userId: row.user_id,
    user_id: row.user_id,

    fullName: row.full_name,
    full_name: row.full_name,

    email: row.email,

    isActive: row.is_active,
    is_active: row.is_active,

    canLogin: row.can_login,
    can_login: row.can_login,

    phone: row.phone ?? null,
    bio: row.bio ?? null,
    city: row.city ?? null,
    state: row.state ?? null,
    profile_photo_url: row.profile_photo_url ?? null,

    createdAt: row.created_at ?? null,
    created_at: row.created_at ?? null,

    updatedAt: row.updated_at ?? null,
    updated_at: row.updated_at ?? null,
  };
}

/**
 * GET /instructors/admin/all
 * Returns full instructor list for admin panel (same as GET /)
 */
router.get("/admin/all", async (_req, res) => {
  try {
    const rows = await prisma.instructors.findMany({
      select: {
        id: true,
        user_id: true,
        full_name: true,
        email: true,
        phone: true,
        bio: true,
        city: true,
        state: true,
        profile_photo_url: true,
        is_active: true,
        can_login: true,
        created_at: true,
        updated_at: true,
      },
      orderBy: {
        full_name: "asc",
      },
    });

    return res.json(rows.map(serializeInstructor));
  } catch (err) {
    console.error("GET /instructors/admin/all error:", err);
    return res.status(500).json({ error: "Failed to fetch instructors" });
  }
});

/**
 * GET /instructors
 * Returns basic instructor list
 */
router.get("/", async (_req, res) => {
  try {
    const rows = await prisma.instructors.findMany({
      select: {
        id: true,
        user_id: true,
        full_name: true,
        email: true,
        phone: true,
        bio: true,
        city: true,
        state: true,
        profile_photo_url: true,
        is_active: true,
        can_login: true,
        created_at: true,
        updated_at: true,
      },
      orderBy: {
        full_name: "asc",
      },
    });

    return res.json(rows.map(serializeInstructor));
  } catch (err) {
    console.error("GET /instructors error:", err);
    return res.status(500).json({ error: "Failed to fetch instructors" });
  }
});

/**
 * GET /instructors/:id
 * Returns one instructor by id
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const row = await prisma.instructors.findUnique({
      where: { id },
      select: {
        id: true,
        user_id: true,
        full_name: true,
        email: true,
        phone: true,
        bio: true,
        city: true,
        state: true,
        profile_photo_url: true,
        is_active: true,
        can_login: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!row) {
      return res.status(404).json({ error: "Instructor not found" });
    }

    return res.json(serializeInstructor(row));
  } catch (err) {
    console.error("GET /instructors/:id error:", err);
    return res.status(500).json({ error: "Failed to fetch instructor" });
  }
});

export default router;