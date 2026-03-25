import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

function toIso(dt) {
  return dt ? new Date(dt).toISOString() : null;
}

function serializeNotification(n) {
  return {
    id: n.id,
    user_id: n.user_id,
    userId: n.user_id,
    type: n.type,
    title: n.title,
    message: n.message,
    entity_type: n.entity_type,
    entityType: n.entity_type,
    entity_id: n.entity_id,
    entityId: n.entity_id,
    read_at: toIso(n.read_at),
    readAt: toIso(n.read_at),
    created_at: toIso(n.created_at),
    createdAt: toIso(n.created_at),
  };
}

// GET /notifications/my
router.get("/my", requireAuth, async (req, res) => {
  try {
    const rows = await prisma.notifications.findMany({
      where: { user_id: req.auth.userId },
      orderBy: { created_at: "desc" },
      take: 100,
    });
    const unreadCount = rows.filter((n) => !n.read_at).length;
    return res.json({ notifications: rows.map(serializeNotification), unread_count: unreadCount });
  } catch (err) {
    console.error("GET /notifications/my error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /notifications/unread-count (lightweight for sidebar badge)
router.get("/unread-count", requireAuth, async (req, res) => {
  try {
    const count = await prisma.notifications.count({
      where: {
        user_id: req.auth.userId,
        read_at: null,
      },
    });
    return res.json({ unread_count: count });
  } catch (err) {
    console.error("GET /notifications/unread-count error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /notifications/:id/read
router.patch("/:id/read", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.notifications.findUnique({ where: { id } });
    if (!existing || existing.user_id !== req.auth.userId) {
      return res.status(404).json({ error: "Notification not found" });
    }
    const updated = await prisma.notifications.update({
      where: { id },
      data: { read_at: new Date() },
    });
    return res.json({ notification: serializeNotification(updated) });
  } catch (err) {
    console.error("PATCH /notifications/:id/read error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

