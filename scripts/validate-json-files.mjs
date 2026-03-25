#!/usr/bin/env node
/**
 * Validates all project JSON fixture/config files.
 * Run: node scripts/validate-json-files.mjs
 */

import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
const FILES = Array.isArray(pkg.jsonFixtures) && pkg.jsonFixtures.length > 0
  ? pkg.jsonFixtures
  : [
      "login.json",
      "metadata.json",
      "disciplines.json",
      "training-centers.json",
      "instructors.json",
      "roles.json",
    ];

const SCHEMAS = {
  "login.json": (data) => {
    if (typeof data !== "object" || data === null) return "Must be an object";
    if (typeof data.email !== "string") return "Missing or invalid email";
    if (typeof data.password !== "string") return "Missing or invalid password";
    return null;
  },
  "metadata.json": (data) => {
    if (typeof data !== "object" || data === null) return "Must be an object";
    if (typeof data.name !== "string") return "Missing or invalid name";
    return null;
  },
  "disciplines.json": (data) => {
    if (!Array.isArray(data)) return "Must be an array";
    const required = ["id", "name"];
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      if (typeof item !== "object" || item === null) return `[${i}] must be an object`;
      for (const key of required) {
        if (typeof item[key] !== "string") return `[${i}] missing or invalid "${key}"`;
      }
    }
    return null;
  },
  "training-centers.json": (data) => {
    if (!Array.isArray(data)) return "Must be an array";
    const required = ["id", "slug", "name"];
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      if (typeof item !== "object" || item === null) return `[${i}] must be an object`;
      for (const key of required) {
        if (typeof item[key] !== "string") return `[${i}] missing or invalid "${key}"`;
      }
    }
    return null;
  },
  "instructors.json": (data) => {
    if (!Array.isArray(data)) return "Must be an array";
    const required = ["id", "fullName", "email"];
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      if (typeof item !== "object" || item === null) return `[${i}] must be an object`;
      for (const key of required) {
        if (typeof item[key] !== "string") return `[${i}] missing or invalid "${key}"`;
      }
    }
    return null;
  },
  "roles.json": (data) => {
    if (!Array.isArray(data)) return "Must be an array";
    const required = ["id", "name"];
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      if (typeof item !== "object" || item === null) return `[${i}] must be an object`;
      for (const key of required) {
        if (typeof item[key] !== "string") return `[${i}] missing or invalid "${key}"`;
      }
    }
    return null;
  },
};

let failed = 0;

for (const file of FILES) {
  const path = join(ROOT, file);
  process.stdout.write(`Checking ${file} ... `);

  if (!existsSync(path)) {
    console.log("FAIL (file not found)");
    failed++;
    continue;
  }

  let raw, data;
  try {
    raw = readFileSync(path, "utf8").replace(/^\uFEFF/, "");
  } catch (err) {
    console.log("FAIL (read error: " + err.message + ")");
    failed++;
    continue;
  }

  try {
    data = JSON.parse(raw);
  } catch (err) {
    console.log("FAIL (invalid JSON: " + err.message + ")");
    failed++;
    continue;
  }

  const validate = SCHEMAS[file];
  if (validate) {
    const err = validate(data);
    if (err) {
      console.log("FAIL (schema: " + err + ")");
      failed++;
      continue;
    }
  }

  console.log("OK");
}

if (failed > 0) {
  process.exit(1);
}
console.log("\nAll JSON files are valid and pass schema checks.");
