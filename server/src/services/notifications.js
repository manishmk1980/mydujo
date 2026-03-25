import crypto from "node:crypto";
import { prisma } from "../db.js";

export async function createNotification({
  userId,
  type,
  title,
  message,
  entityType,
  entityId,
}) {
  return prisma.notifications.create({
    data: {
      id: crypto.randomUUID(),
      user_id: userId,
      type,
      title,
      message,
      entity_type: entityType,
      entity_id: entityId,
    },
  });
}

export async function listAdminUserIds() {
  const rows = await prisma.user_roles.findMany({
    where: {
      roles: { name: { in: ["ADMIN", "SUPER_ADMIN"] } },
    },
    select: { user_id: true },
  });
  return [...new Set(rows.map((r) => r.user_id).filter(Boolean))];
}

export async function notifyAdmins(payload) {
  const adminUserIds = await listAdminUserIds();
  await Promise.all(
    adminUserIds.map((userId) =>
      createNotification({
        ...payload,
        userId,
      })
    )
  );
}

