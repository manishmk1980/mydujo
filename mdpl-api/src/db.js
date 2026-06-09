import prismaClientPackage from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { requireEnv } from "./config/env.js";

const { PrismaClient } = prismaClientPackage;
const databaseUrl = new URL(requireEnv("DATABASE_URL"));
if (!["mysql:", "mariadb:"].includes(databaseUrl.protocol)) {
  throw new Error("DATABASE_URL must use the mysql:// or mariadb:// protocol");
}

const adapter = new PrismaMariaDb({
  host: databaseUrl.hostname,
  port: Number(databaseUrl.port || 3306),
  user: decodeURIComponent(databaseUrl.username),
  password: decodeURIComponent(databaseUrl.password),
  database: decodeURIComponent(databaseUrl.pathname.replace(/^\//, "")),
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 5),
});

export const prisma = new PrismaClient({ adapter });
