import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.join(__dirname, "..");

const envLocalPath = path.join(appRoot, ".env.local");
const envPath = path.join(appRoot, ".env");

if (fs.existsSync(envLocalPath) && process.env.NODE_ENV !== "production") {
  config({ path: envLocalPath, override: true });
}

if (fs.existsSync(envPath)) {
  config({ path: envPath, override: false });
}

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

const app = express();

const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:3000";
const corsOptions = {
  origin: corsOrigin,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

app.use(express.json());
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
app.use("/", publicRoutes);

const uploadsDir = path.join(__dirname, "..", "uploads");
app.use("/uploads", express.static(uploadsDir));

export default app;
