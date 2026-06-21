import prismaPkg from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import "./config/env.js";

const { PrismaClient } = prismaPkg;
const requiredEnv = ["DB_HOST", "DB_PORT", "DB_USER", "DB_PASSWORD", "DB_NAME"];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing required env var: ${key}`);
  }
}

const port = Number(process.env.DB_PORT);
const connectionLimit = Number(process.env.DB_CONNECTION_LIMIT || 5);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("DB_PORT must be a valid TCP port");
}
if (!Number.isInteger(connectionLimit) || connectionLimit < 1 || connectionLimit > 100) {
  throw new Error("DB_CONNECTION_LIMIT must be between 1 and 100");
}

const adapter = new PrismaMariaDb({
  host: process.env.DB_HOST,
  port,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit,
  allowPublicKeyRetrieval: true,
});

export const prisma = new PrismaClient({ adapter });
export default prisma;
