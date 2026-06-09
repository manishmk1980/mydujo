import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();
const requireSuperAdmin = (req, res, next) =>
  req.auth?.roles?.includes("SUPER_ADMIN") ? next() : res.status(403).json({ error: "not authorized" });

async function seedDisciplines() {
  if (await prisma.disciplineOption.count()) return;
  await prisma.disciplineOption.createMany({
    data: [
      { value: "karate_shotokan", label: "Karate (Shotokan)", displayOrder: 1 },
      { value: "judo_kodokan", label: "Judo (Kodokan)", displayOrder: 2 },
      { value: "self_defense", label: "Self Defense", displayOrder: 3 },
    ],
    skipDuplicates: true,
  });
}

router.get("/disciplines", async (req, res) => {
  await seedDisciplines();
  const status = String(req.query.status || "").toUpperCase();
  const where = !status ? { status: "ACTIVE" } : status === "ALL" ? {} : { status };
  const disciplines = await prisma.disciplineOption.findMany({ where, orderBy: [{ displayOrder: "asc" }, { label: "asc" }] });
  return res.json({ disciplines });
});

router.post("/disciplines", requireAuth, requireSuperAdmin, async (req, res) => {
  const value = String(req.body?.value || "").trim().toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
  const label = String(req.body?.label || "").trim();
  if (!value || !label) return res.status(400).json({ error: "value and label are required" });
  const displayOrder = (await prisma.disciplineOption.aggregate({ _max: { displayOrder: true } }))._max.displayOrder || 0;
  const discipline = await prisma.disciplineOption.create({ data: { value, label, imageUrl: req.body?.image_url || null, displayOrder: displayOrder + 1 } });
  return res.status(201).json({ discipline });
});

router.patch("/disciplines/:id", requireAuth, requireSuperAdmin, async (req, res) => {
  const existing = await prisma.disciplineOption.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: "Discipline not found" });
  const status = req.body?.status ? String(req.body.status).toUpperCase() : undefined;
  if (status && !["ACTIVE", "PAUSED", "ARCHIVED"].includes(status)) return res.status(400).json({ error: "Invalid status" });
  const discipline = await prisma.disciplineOption.update({
    where: { id: existing.id },
    data: {
      value: req.body?.value,
      label: req.body?.label,
      imageUrl: req.body?.image_url ?? req.body?.imageUrl,
      status,
      statusNote: req.body?.pause_reason,
      archivedAt: status === "ARCHIVED" ? new Date() : status ? null : undefined,
    },
  });
  return res.json({ discipline });
});

router.delete("/disciplines/:id", requireAuth, requireSuperAdmin, async (req, res) => {
  const existing = await prisma.disciplineOption.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: "Discipline not found" });
  const discipline = await prisma.disciplineOption.update({ where: { id: existing.id }, data: { status: "ARCHIVED", archivedAt: new Date() } });
  return res.json({ discipline });
});

export default router;
