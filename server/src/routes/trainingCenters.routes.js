import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

function requireSuperAdmin(req, res, next) {
  const roles = req?.auth?.roles || [];
  if (!roles.includes("SUPER_ADMIN")) {
    return res.status(403).json({ error: "not authorized" });
  }
  return next();
}

function serializeCenter(row) {
  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    address: row.address ?? null,
    city: row.city ?? null,
    state: row.state ?? null,
    created_at: row.created_at ? new Date(row.created_at).toISOString() : null,
  };
}

router.get("/", async (_req, res) => {
  try {
    const rows = await prisma.training_centers.findMany({
      orderBy: { name: "asc" },
    });

    return res.json({ centers: rows.map(serializeCenter) });
  } catch (err) {
    console.error("GET /training-centers error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/by-slug/:slug", async (req, res) => {
  try {
    const { slug } = req.params;

    const row = await prisma.training_centers.findUnique({
      where: { slug },
    });

    if (!row) {
      return res.status(404).json({ error: "Training center not found" });
    }

    return res.json({ center: serializeCenter(row) });
  } catch (err) {
    console.error("GET /training-centers/by-slug/:slug error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", requireAuth, requireSuperAdmin, async (req, res) => {
  try {
    const b = req.body || {};
    const name = String(b.name || "").trim();
    let slug = String(b.slug || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_-]/g, "");

    if (!name) return res.status(400).json({ error: "name is required" });
    if (!slug) {
      slug = name.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_-]/g, "");
    }

    const existing = await prisma.training_centers.findUnique({
      where: { slug },
    });

    if (existing) {
      return res.status(409).json({ error: "slug already exists" });
    }

    const row = await prisma.training_centers.create({
      data: {
        name,
        slug,
        address: b.address ? String(b.address).trim() || null : null,
        city: b.city ? String(b.city).trim() || null : null,
        state: b.state ? String(b.state).trim() || null : null,
      },
    });

    return res.status(201).json({ center: serializeCenter(row) });
  } catch (err) {
    console.error("POST /training-centers error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;