import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.join(__dirname, "..");

const envLocalPath = path.join(appRoot, ".env.local");
const envPath = path.join(appRoot, ".env");

// Local first, if present
if (fs.existsSync(envLocalPath) && process.env.NODE_ENV !== "production") {
  config({ path: envLocalPath, override: true });
}

// Fallback
if (fs.existsSync(envPath)) {
  config({ path: envPath, override: false });
}

const adapter = new PrismaMariaDb({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 5,
});

export const prisma = new PrismaClient({ adapter });