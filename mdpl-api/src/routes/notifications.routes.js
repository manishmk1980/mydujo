import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();
const serialize = (row) => ({
  id: row.id,
  type: row.type,
  title: row.title,
  message: row.message,
  entity_type: row.entityType,
  entity_id: row.entityId,
  read_at: row.readAt,
  created_at: row.createdAt,
});

router.get("/unread-count", requireAuth, async (req, res) => {
  const unread_count = await prisma.notification.count({ where: { userId: req.auth.userId, readAt: null } });
  return res.json({ unread_count });
});

router.get("/my", requireAuth, async (req, res) => {
  const rows = await prisma.notification.findMany({ where: { userId: req.auth.userId }, orderBy: { createdAt: "desc" } });
  return res.json({ notifications: rows.map(serialize) });
});

router.patch("/:id/read", requireAuth, async (req, res) => {
  const existing = await prisma.notification.findFirst({ where: { id: req.params.id, userId: req.auth.userId } });
  if (!existing) return res.status(404).json({ error: "Notification not found" });
  const notification = await prisma.notification.update({ where: { id: existing.id }, data: { readAt: existing.readAt || new Date() } });
  return res.json({ notification: serialize(notification) });
});

export default router;
