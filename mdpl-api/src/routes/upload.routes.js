import { Router } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const router = Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_DIR = path.join(__dirname, "..", "..", "uploads", "profile-photos");

/** POST /upload/profile-photo - body: { path: string, content: string } (content = base64) */
router.post("/profile-photo", (req, res) => {
  try {
    const { path: filePath, content } = req.body || {};
    if (!filePath || !content) {
      return res.status(400).json({ error: "path and content (base64) are required" });
    }
    const safePath = path.normalize(filePath).replace(/^(\.\.(\/|\\|$))+/, "");
    if (!safePath) {
      return res.status(400).json({ error: "invalid path" });
    }
    const fullPath = path.join(BASE_DIR, safePath);
    if (!fullPath.startsWith(path.resolve(BASE_DIR))) {
      return res.status(400).json({ error: "invalid path" });
    }
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    const buf = Buffer.from(content, "base64");
    fs.writeFileSync(fullPath, buf);
    const baseUrl = process.env.API_BASE_URL || "http://localhost:4000";
    const url = `${baseUrl}/uploads/profile-photos/${safePath.replace(/\\/g, "/")}`;
    return res.json({ url });
  } catch (err) {
    console.error("POST /upload/profile-photo error:", err);
    return res.status(500).json({ error: "Failed to upload" });
  }
});

export default router;
