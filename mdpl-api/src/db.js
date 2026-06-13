import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import prismaPkg from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const { PrismaClient } = prismaPkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Force this service to use mdpl-api/.env values, even if process manager
// has stale DB_* vars from another environment.
dotenv.config({ path: path.resolve(__dirname, "../.env"), override: true });

const requiredEnv = ["DB_HOST", "DB_PORT", "DB_USER", "DB_PASSWORD", "DB_NAME"];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing required env var: ${key}`);
  }
}

const adapter = new PrismaMariaDb({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 5),
  allowPublicKeyRetrieval: true,
});

export const prisma = new PrismaClient({ adapter });
export default prisma;
