import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { uploadsDir } from "./config/env.js";

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
import adminRoutes from "./routes/admin.routes.js";
import chatRoutes from "./routes/chat.routes.js";

const app = express();

const defaultCorsOrigins =
  "http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173";
const corsOriginRaw = process.env.CORS_ORIGIN || defaultCorsOrigins;
let corsOrigins = corsOriginRaw.split(",").map((s) => s.trim()).filter(Boolean);
if (!corsOrigins.length) {
  corsOrigins = defaultCorsOrigins.split(",").map((s) => s.trim()).filter(Boolean);
}
const corsOptions = {
  origin:
    corsOrigins.length > 1
      ? (origin, cb) => {
          if (!origin) return cb(null, true);
          if (corsOrigins.includes(origin)) return cb(null, true);
          return cb(null, false);
        }
      : corsOrigins[0],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Chat-Token"],
};

app.use(cors(corsOptions));

app.use(express.json({ limit: process.env.JSON_BODY_LIMIT || "12mb" }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({
    ok: true,
    service: "mdpl-api",
    message: "Server is running",
  });
});

app.get("/health", (req, res) => res.json({ ok: true }));
app.use("/auth", authRoutes);
app.use("/training-centers", trainingCentersRoutes);
app.use("/students", studentsRoutes);
app.use("/instructors", instructorsRoutes);
app.use("/meta", metaRoutes);
app.use("/pincodes", pincodesRoutes);
app.use("/attendance", attendanceRoutes);
app.use("/upload", uploadRoutes);
app.use("/fees", feesRoutes);
app.use("/notifications", notificationsRoutes);
app.use("/admin", adminRoutes);
app.use("/chat", chatRoutes);
app.use("/", publicRoutes);

app.use("/uploads", express.static(uploadsDir));

export default app;
