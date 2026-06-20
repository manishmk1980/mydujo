import { Router } from "express";
import fs from "fs";
import path from "path";
import { uploadsDir } from "../config/env.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { prisma } from "../db.js";

const router = Router();
const BASE_DIR = path.join(uploadsDir, "profile-photos");
const PAYMENT_DIR = path.join(uploadsDir, "payment-proofs");

function safeDestination(baseDir, filePath) {
  const safePath = path.normalize(String(filePath || "")).replace(/^(\.\.(\/|\\|$))+/, "");
  if (!safePath) return null;
  const fullPath = path.resolve(baseDir, safePath);
  const relativePath = path.relative(baseDir, fullPath);
  return relativePath.startsWith("..") || path.isAbsolute(relativePath) ? null : { safePath, fullPath };
}

function publicUrl(folder, safePath) {
  const baseUrl = process.env.API_BASE_URL || "http://localhost:4000";
  return `${baseUrl}/uploads/${folder}/${safePath.replace(/\\/g, "/")}`;
}

const PUBLIC_PROFILE_IMAGE_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

function matchesImageSignature(bytes, mimeType) {
  if (mimeType === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (mimeType === "image/png") return bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (mimeType === "image/webp") return bytes.subarray(0, 4).toString("ascii") === "RIFF"
    && bytes.subarray(8, 12).toString("ascii") === "WEBP";
  return false;
}

router.post("/instructor-public-photo", requireAuth, async (req, res) => {
  try {
    const instructor = await prisma.instructor.findUnique({
      where: { userId: req.auth.userId },
      select: { id: true },
    });
    if (!instructor) return res.status(403).json({ error: "Instructor profile not found" });

    const mimeType = String(req.body?.mimeType || "").toLowerCase();
    const extension = PUBLIC_PROFILE_IMAGE_TYPES.get(mimeType);
    if (!extension) return res.status(400).json({ error: "Use a JPG, PNG, or WebP image" });
    const bytes = Buffer.from(String(req.body?.content || ""), "base64");
    if (!bytes.length) return res.status(400).json({ error: "Image content is required" });
    if (bytes.length > 5 * 1024 * 1024) return res.status(413).json({ error: "Image must be 5 MB or smaller" });
    if (!matchesImageSignature(bytes, mimeType)) {
      return res.status(400).json({ error: "Image content does not match its file type" });
    }

    const safePath = `instructors/public/${instructor.id}.${extension}`;
    const destination = safeDestination(BASE_DIR, safePath);
    if (!destination) return res.status(400).json({ error: "Invalid image destination" });
    fs.mkdirSync(path.dirname(destination.fullPath), { recursive: true });
    fs.writeFileSync(destination.fullPath, bytes);
    return res.json({ url: `/uploads/profile-photos/${destination.safePath.replace(/\\/g, "/")}` });
  } catch (error) {
    console.error("POST /upload/instructor-public-photo error:", error);
    return res.status(500).json({ error: "Failed to upload public profile photo" });
  }
});

/** POST /upload/profile-photo - body: { path: string, content: string } (content = base64) */
router.post("/profile-photo", (req, res) => {
  try {
    const { path: filePath, content } = req.body || {};
    if (!filePath || !content) {
      return res.status(400).json({ error: "path and content (base64) are required" });
    }
    const destination = safeDestination(BASE_DIR, filePath);
    if (!destination) return res.status(400).json({ error: "invalid path" });
    const { safePath, fullPath } = destination;
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    const buf = Buffer.from(content, "base64");
    fs.writeFileSync(fullPath, buf);
    return res.json({ url: publicUrl("profile-photos", safePath) });
  } catch (err) {
    console.error("POST /upload/profile-photo error:", err);
    return res.status(500).json({ error: "Failed to upload" });
  }
});

router.post("/payment-proof", (req, res) => {
  try {
    const { path: filePath, content } = req.body || {};
    if (!filePath || !content) return res.status(400).json({ error: "path and content (base64) are required" });
    const destination = safeDestination(PAYMENT_DIR, filePath);
    if (!destination) return res.status(400).json({ error: "invalid path" });
    fs.mkdirSync(path.dirname(destination.fullPath), { recursive: true });
    fs.writeFileSync(destination.fullPath, Buffer.from(content, "base64"));
    return res.json({ url: publicUrl("payment-proofs", destination.safePath) });
  } catch (err) {
    console.error("POST /upload/payment-proof error:", err);
    return res.status(500).json({ error: "Failed to upload" });
  }
});

router.post("/profile-photo-from-url", async (req, res) => {
  try {
    const { path: filePath, sourceUrl } = req.body || {};
    const destination = safeDestination(BASE_DIR, filePath);
    if (!destination || !sourceUrl) return res.status(400).json({ error: "valid path and sourceUrl are required" });
    const source = new URL(sourceUrl);
    if (!["http:", "https:"].includes(source.protocol)) return res.status(400).json({ error: "valid path and sourceUrl are required" });
    const response = await fetch(source, { signal: AbortSignal.timeout(10000) });
    if (!response.ok) return res.status(400).json({ error: "Unable to download source image" });
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length > 10 * 1024 * 1024) return res.status(413).json({ error: "Source image is too large" });
    fs.mkdirSync(path.dirname(destination.fullPath), { recursive: true });
    fs.writeFileSync(destination.fullPath, bytes);
    return res.json({ url: publicUrl("profile-photos", destination.safePath) });
  } catch (err) {
    console.error("POST /upload/profile-photo-from-url error:", err);
    return res.status(400).json({ error: "Import from URL failed" });
  }
});

export default router;
