import path from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Load root .env so one file works for both client and server
config({ path: path.join(__dirname, "..", "..", ".env") });
config(); // fallback: .env in cwd

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes.js";
import trainingCentersRoutes from "./routes/trainingCenters.routes.js";
import studentsRoutes from "./routes/students.routes.js";
import instructorsRoutes from "./routes/instructors.routes.js";
import metaRoutes from "./routes/meta.routes.js";
import pincodesRoutes from "./routes/pincodes.routes.js";
import publicRoutes from "./routes/public.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import feesRoutes from "./routes/fees.routes.js";
import notificationsRoutes from "./routes/notifications.routes.js";

const app = express();

// CORS_ORIGIN: comma-separated list (e.g. "http://localhost:3000,https://kreatorbox.com") for local + production
const corsOriginRaw = process.env.CORS_ORIGIN || "http://localhost:3000";
const corsOrigins = corsOriginRaw.split(",").map((o) => o.trim()).filter(Boolean);
const corsOptions = {
  origin: corsOrigins.length > 1 ? corsOrigins : corsOrigins[0] || "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// Payment proof uploads are sent as base64 JSON, so body limit must be higher than default 100kb.
// Keep this comfortably above the upload route's own file-size validation.
app.use(express.json({ limit: "35mb" }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({
    ok: true,
    service: "mdpl-qa-api",
    message: "Server is running",
  });
});

app.get("/health", (req, res) => res.json({ ok: true }));
app.use("/auth", authRoutes);
app.use("/api/auth", authRoutes);
app.use("/training-centers", trainingCentersRoutes);
app.use("/students", studentsRoutes);
app.use("/instructors", instructorsRoutes);
app.use("/meta", metaRoutes);
app.use("/pincodes", pincodesRoutes);
app.use("/attendance", attendanceRoutes);
app.use("/upload", uploadRoutes);
app.use("/fees", feesRoutes);
app.use("/notifications", notificationsRoutes);
app.use("/api/instructors", instructorsRoutes);
app.use("/api/fees", feesRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/", publicRoutes);

const uploadsDir = path.join(__dirname, "..", "uploads");
app.use("/uploads", express.static(uploadsDir));

app.use((err, req, res, next) => {
  if (err?.type === "entity.too.large") {
    return res.status(413).json({
      error: "Upload payload too large. Please use a smaller image or PDF.",
    });
  }
  return next(err);
});

export default app;
