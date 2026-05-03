import { Router } from "express";
import crypto from "crypto";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

let disciplinesTableEnsured = false;
async function ensureDisciplinesTable() {
  if (disciplinesTableEnsured) return;
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS discipline_options (
      id CHAR(36) NOT NULL PRIMARY KEY,
      value VARCHAR(64) NOT NULL UNIQUE,
      label VARCHAR(255) NOT NULL,
      display_order INT NOT NULL DEFAULT 0,
      created_at DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
  const count = await prisma.$queryRawUnsafe("SELECT COUNT(*) as c FROM discipline_options");
  if (Array.isArray(count) && count[0]?.c === 0) {
    const seed = [
      { value: "karate_shotokan", label: "Karate (Shotokan)", order: 1 },
      { value: "judo_kodokan", label: "Judo (Kodokan)", order: 2 },
      { value: "self_defense", label: "Self Defense", order: 3 },
    ];
    for (const row of seed) {
      await prisma.$executeRawUnsafe(
        "INSERT INTO discipline_options (id, value, label, display_order) VALUES (?, ?, ?, ?)",
        crypto.randomUUID(),
        row.value,
        row.label,
        row.order
      );
    }
  }
  disciplinesTableEnsured = true;
}

function requireSuperAdmin(req, res, next) {
  const roles = req?.auth?.roles || [];
  if (!roles.includes("SUPER_ADMIN")) {
    return res.status(403).json({ error: "not authorized" });
  }
  return next();
}

router.get("/disciplines", async (req, res) => {
  try {
    await ensureDisciplinesTable();
    const rows = await prisma.$queryRawUnsafe(
      "SELECT id, value, label, display_order FROM discipline_options ORDER BY display_order ASC, label ASC"
    );
    const disciplines = Array.isArray(rows)
      ? rows.map((r) => ({ id: r.id, value: r.value, label: r.label }))
      : [];
    return res.json({ disciplines });
  } catch (err) {
    console.error("GET /meta/disciplines error:", err);
    return res.status(500).json({ error: "Failed to fetch disciplines" });
  }
});

router.post("/disciplines", requireAuth, requireSuperAdmin, async (req, res) => {
  try {
    await ensureDisciplinesTable();
    const b = req.body || {};
    const value = String(b.value || "").trim().toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "") || null;
    const label = String(b.label || "").trim() || null;
    if (!value || !label) return res.status(400).json({ error: "value and label are required" });

    const id = crypto.randomUUID();
    const maxOrder = await prisma.$queryRawUnsafe("SELECT COALESCE(MAX(display_order), 0) + 1 AS next_order FROM discipline_options");
    const nextOrder = Array.isArray(maxOrder) && maxOrder[0]?.next_order != null ? Number(maxOrder[0].next_order) : 1;
    await prisma.$executeRawUnsafe(
      "INSERT INTO discipline_options (id, value, label, display_order) VALUES (?, ?, ?, ?)",
      id,
      value,
      label,
      nextOrder
    );
    return res.status(201).json({ discipline: { id, value, label } });
  } catch (err) {
    console.error("POST /meta/disciplines error:", err);
    return res.status(500).json({ error: "Failed to create discipline" });
  }
});

export default router;
