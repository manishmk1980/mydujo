import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { config as loadDotenv } from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const apiRoot = path.resolve(__dirname, "..", "..");
export const repositoryRoot = path.resolve(apiRoot, "..");

const environmentFile =
  process.env.NODE_ENV === "production" ? ".env.production" : ".env.local";
const configuredEnvFile = process.env.ENV_FILE
  ? path.resolve(process.cwd(), process.env.ENV_FILE)
  : null;

const candidates = [
  configuredEnvFile,
  path.join(apiRoot, environmentFile),
  path.join(repositoryRoot, environmentFile),
  path.join(apiRoot, ".env"),
  path.join(repositoryRoot, ".env"),
].filter(Boolean);

for (const envFile of [...new Set(candidates)]) {
  if (fs.existsSync(envFile)) {
    loadDotenv({ path: envFile, override: false });
  }
}

export function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
}

export function resolveRuntimePath(value, fallback) {
  return path.resolve(apiRoot, value || fallback);
}

export const uploadsDir = resolveRuntimePath(process.env.UPLOAD_DIR, "uploads");
