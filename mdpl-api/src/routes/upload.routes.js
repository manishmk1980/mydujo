import { Router } from "express";
import fs from "fs";
import path from "path";
import { uploadsDir } from "../config/env.js";

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
