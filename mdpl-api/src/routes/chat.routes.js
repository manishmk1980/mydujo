import { randomBytes, randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { Router } from "express";
import { prisma } from "../db.js";
import { uploadsDir } from "../config/env.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();
const roles = new Set(["PARENT", "STUDENT", "INSTRUCTOR", "ACADEMY", "OTHER"]);
const statuses = new Set(["NEW", "OPEN", "ASSIGNED", "WAITING_FOR_VISITOR", "WAITING_FOR_ADMIN", "RESOLVED", "CLOSED", "SPAM"]);
const priorities = new Set(["LOW", "NORMAL", "HIGH", "URGENT"]);
const publicMessageTypes = new Set(["TEXT", "URL"]);
const maxMessageLength = Number(process.env.CHAT_MAX_MESSAGE_LENGTH || 4000);
const maxFileSize = Number(process.env.CHAT_MAX_FILE_SIZE_BYTES || 8 * 1024 * 1024);
const chatUploadsDir = path.join(uploadsDir, "chat");
const allowedMime = new Map([
  ["image/jpeg", "IMAGE"], ["image/png", "IMAGE"], ["image/webp", "IMAGE"], ["image/gif", "IMAGE"],
  ["application/pdf", "PDF"], ["text/plain", "DOCUMENT"], ["text/csv", "SPREADSHEET"],
  ["application/msword", "DOCUMENT"], ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "DOCUMENT"],
  ["application/vnd.ms-excel", "SPREADSHEET"], ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "SPREADSHEET"],
  ["video/mp4", "VIDEO"], ["audio/mpeg", "AUDIO"], ["audio/wav", "AUDIO"],
]);

const requireAdmin = [
  requireAuth,
  (req, res, next) => req.auth?.roles?.some((r) => r === "ADMIN" || r === "SUPER_ADMIN")
    ? next()
    : res.status(403).json({ error: "Admin access required" }),
];

const clean = (value, max = 255) => {
  const text = String(value ?? "").trim();
  return text ? text.slice(0, max) : null;
};
const validEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const validPhone = (value) => /^[+]?[\d\s().-]{7,20}$/.test(value);
const tokenFrom = (req) => clean(req.headers["x-chat-token"] || req.body?.public_token || req.query?.token, 128);
const messageText = (value) => clean(value, maxMessageLength);
const publicUrl = (storagePath) => `${process.env.API_BASE_URL || "http://localhost:4000"}/uploads/chat/${storagePath.replace(/\\/g, "/")}`;

const attachmentDto = (a) => ({
  id: a.id, message_id: a.messageId, file_name: a.fileName, file_url: a.fileUrl,
  file_mime_type: a.fileMimeType, file_size: a.fileSize, file_category: a.fileCategory, created_at: a.createdAt,
});
const messageDto = (m) => ({
  id: m.id, thread_id: m.threadId, sender_type: m.senderType, sender_admin_id: m.senderAdminId,
  message_type: m.messageType, message_text: m.messageText, metadata_json: m.metadataJson,
  is_internal: m.isInternal, is_read: m.isRead, created_at: m.createdAt,
  attachments: (m.attachments || []).map(attachmentDto),
});
const threadDto = (t, includeToken = false) => ({
  id: t.id, ...(includeToken ? { public_token: t.publicToken } : {}),
  visitor_name: t.visitorName, visitor_email: t.visitorEmail, visitor_phone: t.visitorPhone, visitor_role: t.visitorRole,
  source_type: t.sourceType, source_page: t.sourcePage, campaign_source: t.campaignSource,
  utm_source: t.utmSource, utm_medium: t.utmMedium, utm_campaign: t.utmCampaign, subject: t.subject,
  status: t.status, priority: t.priority, assigned_admin_id: t.assignedAdminId,
  assigned_admin: t.assignedAdmin ? { id: t.assignedAdmin.id, display_name: t.assignedAdmin.displayName, email: t.assignedAdmin.email } : null,
  bot_enabled: t.botEnabled, bot_handoff_required: t.botHandoffRequired,
  last_message_at: t.lastMessageAt, created_at: t.createdAt, updated_at: t.updatedAt, closed_at: t.closedAt,
});
const messageInclude = { attachments: true };

async function publicThread(req, res) {
  const token = tokenFrom(req);
  if (!token) {
    res.status(401).json({ error: "Public token required" });
    return null;
  }
  const thread = await prisma.chatThread.findFirst({ where: { id: req.params.threadId, publicToken: token } });
  if (!thread) {
    res.status(404).json({ error: "Chat thread not found" });
    return null;
  }
  return thread;
}

async function currentAdmin(userId) {
  return prisma.adminUser.findUnique({ where: { userId } });
}

function parseUpload(body) {
  const fileName = path.basename(clean(body?.file_name, 255) || "");
  const mime = clean(body?.file_mime_type, 128)?.toLowerCase();
  const content = clean(body?.content, Math.ceil(maxFileSize * 1.5));
  if (!fileName || !mime || !content || !allowedMime.has(mime)) throw new Error("Unsupported or incomplete file");
  const bytes = Buffer.from(content, "base64");
  if (!bytes.length || bytes.length > maxFileSize) throw new Error(`File must be smaller than ${Math.round(maxFileSize / 1024 / 1024)}MB`);
  return { fileName, mime, bytes, category: allowedMime.get(mime) };
}

async function saveAttachment(thread, body, senderType, senderAdminId = null) {
  const upload = parseUpload(body);
  const ext = path.extname(upload.fileName).slice(0, 12);
  const storagePath = path.join(thread.id, `${randomUUID()}${ext}`);
  const fullPath = path.resolve(chatUploadsDir, storagePath);
  if (!fullPath.startsWith(path.resolve(chatUploadsDir) + path.sep)) throw new Error("Invalid file path");
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, upload.bytes);
  return prisma.$transaction(async (tx) => {
    const message = await tx.chatMessage.create({
      data: {
        threadId: thread.id, senderType, senderAdminId,
        messageType: upload.category === "IMAGE" ? "IMAGE" : "DOCUMENT",
        messageText: clean(body?.message_text, maxMessageLength) || upload.fileName,
        isRead: senderType === "ADMIN",
      },
    });
    await tx.chatAttachment.create({
      data: {
        messageId: message.id, threadId: thread.id, uploadedByType: senderType,
        fileName: upload.fileName, fileUrl: publicUrl(storagePath), fileMimeType: upload.mime,
        fileSize: upload.bytes.length, fileCategory: upload.category, storagePath,
      },
    });
    await tx.chatThread.update({
      where: { id: thread.id },
      data: { lastMessageAt: new Date(), status: senderType === "ADMIN" ? "WAITING_FOR_VISITOR" : "WAITING_FOR_ADMIN" },
    });
    return tx.chatMessage.findUnique({ where: { id: message.id }, include: messageInclude });
  });
}

router.post("/public/threads", async (req, res) => {
  try {
    const name = clean(req.body?.visitor_name);
    const email = clean(req.body?.visitor_email)?.toLowerCase() || null;
    const phone = clean(req.body?.visitor_phone, 32);
    const text = messageText(req.body?.message_text);
    const role = roles.has(String(req.body?.visitor_role || "").toUpperCase()) ? String(req.body.visitor_role).toUpperCase() : "OTHER";
    if (!name || (!email && !phone) || !text) return res.status(400).json({ error: "Name, message, and phone or email are required" });
    if (email && !validEmail(email)) return res.status(400).json({ error: "Invalid email address" });
    if (phone && !validPhone(phone)) return res.status(400).json({ error: "Invalid phone number" });
    const publicToken = randomBytes(32).toString("hex");
    const thread = await prisma.$transaction(async (tx) => {
      const created = await tx.chatThread.create({
        data: {
          publicToken, visitorName: name, visitorEmail: email, visitorPhone: phone, visitorRole: role,
          sourceType: clean(req.body?.source_type, 64), sourcePage: clean(req.body?.source_page, 512),
          campaignSource: clean(req.body?.campaign_source, 128), utmSource: clean(req.body?.utm_source, 128),
          utmMedium: clean(req.body?.utm_medium, 128), utmCampaign: clean(req.body?.utm_campaign, 128),
          subject: clean(req.body?.subject), status: "NEW",
        },
      });
      await tx.chatMessage.create({ data: { threadId: created.id, senderType: "VISITOR", messageType: "TEXT", messageText: text } });
      await tx.chatMessage.create({
        data: {
          threadId: created.id, senderType: "BOT", messageType: "BOT_SUGGESTION", isRead: true,
          messageText: "Thanks for contacting MDPL. Our team will reply here. You can also use the quick links while you wait.",
          metadataJson: { links: ["/register/student", "/register/instructor", "/student/login", "/instructor/login", "/join-mydojo"] },
        },
      });
      return created;
    });
    const messages = await prisma.chatMessage.findMany({ where: { threadId: thread.id, isInternal: false }, include: messageInclude, orderBy: { createdAt: "asc" } });
    return res.status(201).json({ thread: threadDto(thread, true), messages: messages.map(messageDto) });
  } catch (err) {
    console.error("POST /chat/public/threads error:", err);
    return res.status(500).json({ error: "Unable to create chat thread" });
  }
});

router.get("/public/threads/:threadId", async (req, res) => {
  const thread = await publicThread(req, res);
  if (!thread) return;
  const messages = await prisma.chatMessage.findMany({ where: { threadId: thread.id, isInternal: false }, include: messageInclude, orderBy: { createdAt: "asc" } });
  return res.json({ thread: threadDto(thread), messages: messages.map(messageDto) });
});

router.post("/public/threads/:threadId/messages", async (req, res) => {
  const thread = await publicThread(req, res);
  if (!thread) return;
  const type = String(req.body?.message_type || "TEXT").toUpperCase();
  const text = messageText(req.body?.message_text);
  if (!publicMessageTypes.has(type) || !text) return res.status(400).json({ error: "A valid text or URL message is required" });
  if (type === "URL") {
    try { new URL(text); } catch { return res.status(400).json({ error: "Invalid URL" }); }
  }
  const message = await prisma.chatMessage.create({
    data: { threadId: thread.id, senderType: "VISITOR", messageType: type, messageText: text, metadataJson: req.body?.metadata_json || undefined },
    include: messageInclude,
  });
  await prisma.chatThread.update({ where: { id: thread.id }, data: { status: "WAITING_FOR_ADMIN", lastMessageAt: new Date() } });
  return res.status(201).json({ message: messageDto(message) });
});

router.post("/public/threads/:threadId/attachments", async (req, res) => {
  const thread = await publicThread(req, res);
  if (!thread) return;
  try {
    const message = await saveAttachment(thread, req.body, "VISITOR");
    return res.status(201).json({ message: messageDto(message) });
  } catch (err) {
    return res.status(400).json({ error: err.message || "Upload failed" });
  }
});

router.post("/public/threads/:threadId/handoff", async (req, res) => {
  const thread = await publicThread(req, res);
  if (!thread) return;
  await prisma.$transaction([
    prisma.chatThread.update({ where: { id: thread.id }, data: { botHandoffRequired: true, status: "WAITING_FOR_ADMIN", lastMessageAt: new Date() } }),
    prisma.chatMessage.create({ data: { threadId: thread.id, senderType: "BOT", messageType: "BOT_HANDOFF", messageText: "A member of the MDPL team has been requested.", isRead: true } }),
  ]);
  return res.json({ ok: true });
});

router.get("/admin/threads", ...requireAdmin, async (req, res) => {
  const where = {};
  if (statuses.has(String(req.query.status || "").toUpperCase())) where.status = String(req.query.status).toUpperCase();
  else if (req.query.open === "true") where.status = { notIn: ["RESOLVED", "CLOSED", "SPAM"] };
  if (priorities.has(String(req.query.priority || "").toUpperCase())) where.priority = String(req.query.priority).toUpperCase();
  if (roles.has(String(req.query.visitor_role || "").toUpperCase())) where.visitorRole = String(req.query.visitor_role).toUpperCase();
  if (req.query.assigned_admin_id === "self") where.assignedAdminId = (await currentAdmin(req.auth.userId))?.id || "__none__";
  else if (req.query.assigned_admin_id) where.assignedAdminId = String(req.query.assigned_admin_id);
  if (req.query.date_from || req.query.date_to) {
    where.createdAt = {};
    if (req.query.date_from) where.createdAt.gte = new Date(String(req.query.date_from));
    if (req.query.date_to) where.createdAt.lte = new Date(String(req.query.date_to));
  }
  if (req.query.search) {
    const q = String(req.query.search).slice(0, 255);
    where.OR = [{ visitorName: { contains: q } }, { visitorEmail: { contains: q } }, { visitorPhone: { contains: q } }, { messages: { some: { messageText: { contains: q } } } }];
  }
  if (req.query.unread === "true") where.messages = { some: { isRead: false, isInternal: false, senderType: { not: "ADMIN" } } };
  const threads = await prisma.chatThread.findMany({
    where, include: { assignedAdmin: true, messages: { where: { isInternal: false }, orderBy: { createdAt: "desc" }, take: 1 } },
    orderBy: { lastMessageAt: "desc" }, take: 100,
  });
  const unread = await prisma.chatMessage.groupBy({ by: ["threadId"], where: { threadId: { in: threads.map((t) => t.id) }, isRead: false, isInternal: false, senderType: { not: "ADMIN" } }, _count: true });
  const unreadMap = new Map(unread.map((r) => [r.threadId, r._count]));
  return res.json({ threads: threads.map((t) => ({ ...threadDto(t), latest_message: t.messages[0] ? messageDto(t.messages[0]) : null, unread_count: unreadMap.get(t.id) || 0 })) });
});

router.get("/admin/threads/:threadId", ...requireAdmin, async (req, res) => {
  const thread = await prisma.chatThread.findUnique({ where: { id: req.params.threadId }, include: { assignedAdmin: true } });
  if (!thread) return res.status(404).json({ error: "Chat thread not found" });
  await prisma.chatMessage.updateMany({ where: { threadId: thread.id, senderType: { not: "ADMIN" } }, data: { isRead: true } });
  const messages = await prisma.chatMessage.findMany({ where: { threadId: thread.id }, include: messageInclude, orderBy: { createdAt: "asc" } });
  return res.json({ thread: threadDto(thread), messages: messages.map(messageDto) });
});

router.post("/admin/threads/:threadId/messages", ...requireAdmin, async (req, res) => {
  const thread = await prisma.chatThread.findUnique({ where: { id: req.params.threadId } });
  const admin = await currentAdmin(req.auth.userId);
  const text = messageText(req.body?.message_text);
  const type = publicMessageTypes.has(String(req.body?.message_type || "TEXT").toUpperCase()) ? String(req.body?.message_type || "TEXT").toUpperCase() : "TEXT";
  if (!thread || !admin || !text) return res.status(400).json({ error: "Valid thread, admin, and message are required" });
  const internal = Boolean(req.body?.is_internal);
  const message = await prisma.chatMessage.create({
    data: { threadId: thread.id, senderType: "ADMIN", senderAdminId: admin.id, messageType: type, messageText: text, metadataJson: req.body?.metadata_json || undefined, isInternal: internal, isRead: true },
    include: messageInclude,
  });
  await prisma.chatThread.update({ where: { id: thread.id }, data: { status: internal ? thread.status : "WAITING_FOR_VISITOR", lastMessageAt: new Date() } });
  return res.status(201).json({ message: messageDto(message) });
});

router.post("/admin/threads/:threadId/attachments", ...requireAdmin, async (req, res) => {
  const thread = await prisma.chatThread.findUnique({ where: { id: req.params.threadId } });
  const admin = await currentAdmin(req.auth.userId);
  if (!thread || !admin) return res.status(404).json({ error: "Chat thread or admin not found" });
  try {
    const message = await saveAttachment(thread, req.body, "ADMIN", admin.id);
    return res.status(201).json({ message: messageDto(message) });
  } catch (err) {
    return res.status(400).json({ error: err.message || "Upload failed" });
  }
});

router.patch("/admin/threads/:threadId/assign", ...requireAdmin, async (req, res) => {
  const assignedAdminId = req.body?.assigned_admin_id === "self" ? (await currentAdmin(req.auth.userId))?.id : clean(req.body?.assigned_admin_id, 36);
  if (!assignedAdminId || !(await prisma.adminUser.findUnique({ where: { id: assignedAdminId } }))) return res.status(400).json({ error: "Valid assigned_admin_id required" });
  const thread = await prisma.chatThread.update({ where: { id: req.params.threadId }, data: { assignedAdminId, status: "ASSIGNED" }, include: { assignedAdmin: true } });
  await prisma.chatMessage.create({ data: { threadId: thread.id, senderType: "SYSTEM", messageType: "SYSTEM", messageText: `Assigned to ${thread.assignedAdmin?.displayName || thread.assignedAdmin?.email || "admin"}`, isInternal: true, isRead: true } });
  return res.json({ thread: threadDto(thread) });
});

router.patch("/admin/threads/:threadId/status", ...requireAdmin, async (req, res) => {
  const status = String(req.body?.status || "").toUpperCase();
  const priority = String(req.body?.priority || "").toUpperCase();
  if (!statuses.has(status) || (priority && !priorities.has(priority))) return res.status(400).json({ error: "Invalid status or priority" });
  const thread = await prisma.chatThread.update({
    where: { id: req.params.threadId },
    data: { status, ...(priority ? { priority } : {}), closedAt: ["CLOSED", "RESOLVED"].includes(status) ? new Date() : null },
    include: { assignedAdmin: true },
  });
  return res.json({ thread: threadDto(thread) });
});

router.get("/admin/admins", ...requireAdmin, async (_req, res) => {
  const admins = await prisma.adminUser.findMany({ orderBy: { email: "asc" } });
  return res.json({ admins: admins.map((a) => ({ id: a.id, display_name: a.displayName, email: a.email })) });
});

export default router;
