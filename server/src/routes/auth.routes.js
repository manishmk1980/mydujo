import { Router } from "express";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

const columnCache = new Map();
const schemaName = process.env.DB_NAME || null;

function parseTTL(ttl) {
  return ttl;
}

function daysToMs(days) {
  return Number(days) * 24 * 60 * 60 * 1000;
}

function qi(identifier) {
  if (!/^[A-Za-z0-9_]+$/.test(String(identifier))) {
    throw new Error(`Unsafe SQL identifier: ${identifier}`);
  }
  return `\`${identifier}\``;
}

function firstDefined(obj, keys, fallback = null) {
  for (const key of keys) {
    if (obj && Object.prototype.hasOwnProperty.call(obj, key) && obj[key] != null) {
      return obj[key];
    }
  }
  return fallback;
}

function toBool(value, fallback = false) {
  if (value == null) return fallback;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const v = value.trim().toLowerCase();
    return v === "1" || v === "true" || v === "yes" || v === "y";
  }
  return fallback;
}

async function getColumns(tableName) {
  if (columnCache.has(tableName)) return columnCache.get(tableName);

  if (!schemaName) {
    throw new Error("DB_NAME is missing in environment");
  }

  const rows = await prisma.$queryRawUnsafe(
    `
      SELECT COLUMN_NAME
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = ?
        AND TABLE_NAME = ?
      ORDER BY ORDINAL_POSITION
    `,
    schemaName,
    tableName
  );

  const cols = rows.map((r) => r.COLUMN_NAME);
  columnCache.set(tableName, cols);
  return cols;
}

function pickColumn(columns, candidates, opts = {}) {
  const { required = true, tableName = "unknown_table" } = opts;
  const lookup = new Map(columns.map((c) => [String(c).toLowerCase(), c]));

  for (const candidate of candidates) {
    const found = lookup.get(String(candidate).toLowerCase());
    if (found) return found;
  }

  if (!required) return null;

  throw new Error(
    `Missing expected column in ${tableName}. Tried: ${candidates.join(", ")}. Available: ${columns.join(", ")}`
  );
}

function normalizeUser(row) {
  if (!row) return null;

  return {
    id: firstDefined(row, ["id"]),
    email: firstDefined(row, ["email"]),
    passwordHash: firstDefined(row, ["password_hash", "passwordHash", "password"]),
    createdAt: firstDefined(row, ["created_at", "createdAt"]),
    raw: row,
  };
}

function normalizeStudent(row) {
  if (!row) return null;

  return {
    id: firstDefined(row, ["id"]),
    userId: firstDefined(row, ["user_id", "userId"]),
    email: firstDefined(row, ["email"]),
    status: firstDefined(row, ["status"], "approved"),
    fullName: firstDefined(row, ["full_name", "fullName"]),
    raw: row,
  };
}

function normalizeInstructor(row) {
  if (!row) return null;

  return {
    id: firstDefined(row, ["id"]),
    userId: firstDefined(row, ["user_id", "userId"]),
    email: firstDefined(row, ["email"]),
    fullName: firstDefined(row, ["full_name", "fullName"]),
    isActive: toBool(firstDefined(row, ["is_active", "isActive"], 1), true),
    canLogin: toBool(firstDefined(row, ["can_login", "canLogin"], 1), true),
    raw: row,
  };
}

async function findUserByEmail(email) {
  const userCols = await getColumns("users");
  const emailCol = pickColumn(userCols, ["email"], { tableName: "users" });

  const rows = await prisma.$queryRawUnsafe(
    `SELECT * FROM ${qi("users")} WHERE ${qi(emailCol)} = ? LIMIT 1`,
    email
  );

  return normalizeUser(rows[0] || null);
}

async function findUserById(userId) {
  const userCols = await getColumns("users");
  const idCol = pickColumn(userCols, ["id"], { tableName: "users" });

  const rows = await prisma.$queryRawUnsafe(
    `SELECT * FROM ${qi("users")} WHERE ${qi(idCol)} = ? LIMIT 1`,
    userId
  );

  return normalizeUser(rows[0] || null);
}

async function findRoleByName(roleName) {
  const roleCols = await getColumns("roles");
  const nameCol = pickColumn(roleCols, ["name", "role_name", "roleName"], { tableName: "roles" });

  const rows = await prisma.$queryRawUnsafe(
    `SELECT * FROM ${qi("roles")} WHERE ${qi(nameCol)} = ? LIMIT 1`,
    roleName
  );

  return rows[0] || null;
}

async function getRolesForUser(userId) {
  const userRoleCols = await getColumns("user_roles");
  const roleCols = await getColumns("roles");

  const urUserIdCol = pickColumn(userRoleCols, ["user_id", "userId"], { tableName: "user_roles" });
  const urRoleIdCol = pickColumn(userRoleCols, ["role_id", "roleId"], { tableName: "user_roles" });
  const roleIdCol = pickColumn(roleCols, ["id"], { tableName: "roles" });
  const roleNameCol = pickColumn(roleCols, ["name", "role_name", "roleName"], { tableName: "roles" });

  const rows = await prisma.$queryRawUnsafe(
    `
      SELECT r.*
      FROM ${qi("user_roles")} ur
      INNER JOIN ${qi("roles")} r
        ON ur.${qi(urRoleIdCol)} = r.${qi(roleIdCol)}
      WHERE ur.${qi(urUserIdCol)} = ?
    `,
    userId
  );

  return rows
    .map((r) => firstDefined(r, [roleNameCol, "name", "role_name", "roleName"]))
    .filter(Boolean);
}

async function userHasAdminRole(userId) {
  const roles = await getRolesForUser(userId);
  return roles.includes("SUPER_ADMIN") || roles.includes("ADMIN");
}

async function assignRoleToUser(userId, roleId) {
  const userRoleCols = await getColumns("user_roles");
  const urUserIdCol = pickColumn(userRoleCols, ["user_id", "userId"], { tableName: "user_roles" });
  const urRoleIdCol = pickColumn(userRoleCols, ["role_id", "roleId"], { tableName: "user_roles" });

  await prisma.$executeRawUnsafe(
    `
      INSERT IGNORE INTO ${qi("user_roles")} (${qi(urUserIdCol)}, ${qi(urRoleIdCol)})
      VALUES (?, ?)
    `,
    userId,
    roleId
  );
}

async function createUser(email, passwordHash) {
  const userCols = await getColumns("users");
  const emailCol = pickColumn(userCols, ["email"], { tableName: "users" });
  const passwordCol = pickColumn(userCols, ["password_hash", "passwordHash", "password"], { tableName: "users" });
  const createdAtCol = pickColumn(userCols, ["created_at", "createdAt"], {
    tableName: "users",
    required: false,
  });

  if (createdAtCol) {
    await prisma.$executeRawUnsafe(
      `
        INSERT INTO ${qi("users")} (${qi(emailCol)}, ${qi(passwordCol)}, ${qi(createdAtCol)})
        VALUES (?, ?, NOW())
      `,
      email,
      passwordHash
    );
  } else {
    await prisma.$executeRawUnsafe(
      `
        INSERT INTO ${qi("users")} (${qi(emailCol)}, ${qi(passwordCol)})
        VALUES (?, ?)
      `,
      email,
      passwordHash
    );
  }

  return findUserByEmail(email);
}

async function saveRefreshToken({ userId, refreshToken, expiresAt }) {
  const tokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  await prisma.refresh_tokens.create({
    data: {
      id: crypto.randomUUID(),
      user_id: userId,
      token_hash: tokenHash,
      expires_at: new Date(expiresAt),
    },
  });
}

async function findStudentByUserId(userId) {
  const studentCols = await getColumns("students");
  const userIdCol = pickColumn(studentCols, ["user_id", "userId"], { tableName: "students" });

  const rows = await prisma.$queryRawUnsafe(
    `SELECT * FROM ${qi("students")} WHERE ${qi(userIdCol)} = ? LIMIT 1`,
    userId
  );

  return normalizeStudent(rows[0] || null);
}

async function findInstructorByUserId(userId) {
  const instructorCols = await getColumns("instructors");
  const userIdCol = pickColumn(instructorCols, ["user_id", "userId"], { tableName: "instructors" });

  const rows = await prisma.$queryRawUnsafe(
    `SELECT * FROM ${qi("instructors")} WHERE ${qi(userIdCol)} = ? LIMIT 1`,
    userId
  );

  return normalizeInstructor(rows[0] || null);
}

router.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const cleanEmail = String(email || "").trim().toLowerCase();
    const cleanPassword = String(password || "");

    if (!cleanEmail || !cleanPassword) {
      return res.status(400).json({ error: "email and password required" });
    }

    if (cleanPassword.length < 6) {
      return res.status(400).json({ error: "password must be at least 6 characters" });
    }

    const existing = await findUserByEmail(cleanEmail);
    if (existing) {
      return res.status(409).json({ error: "email already registered" });
    }

    const passwordHash = await argon2.hash(cleanPassword);
    const user = await createUser(cleanEmail, passwordHash);

    const studentRole = await findRoleByName("STUDENT");
    if (studentRole?.id && user?.id) {
      await assignRoleToUser(user.id, studentRole.id);
    }

    const roles = ["STUDENT"];
    const accessToken = jwt.sign(
      { sub: user.id, email: user.email, roles },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: parseTTL(process.env.ACCESS_TOKEN_TTL || "15m") }
    );

    return res.status(201).json({
      user: { id: user.id, email: user.email },
      accessToken,
    });
  } catch (e) {
    console.error("POST /auth/signup error:", e);
    return res.status(500).json({ error: "server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: "email and password required" });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const user = await findUserByEmail(cleanEmail);

    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: "invalid credentials" });
    }

    const ok = await argon2.verify(user.passwordHash, password);
    if (!ok) {
      return res.status(401).json({ error: "invalid credentials" });
    }

    const isAdmin = await userHasAdminRole(user.id);
    if (!isAdmin) {
      return res.status(403).json({ error: "not authorized" });
    }

    const roles = await getRolesForUser(user.id);

    const accessToken = jwt.sign(
      { sub: user.id, email: user.email, roles },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: parseTTL(process.env.ACCESS_TOKEN_TTL || "15m") }
    );

    const refreshToken = jwt.sign(
      { sub: user.id, email: user.email, jti: crypto.randomUUID() },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: `${process.env.REFRESH_TOKEN_TTL_DAYS || 30}d` }
    );

    const expiresAt = new Date(Date.now() + daysToMs(process.env.REFRESH_TOKEN_TTL_DAYS || 30));

    try {
      await saveRefreshToken({
        userId: user.id,
        refreshToken,
        expiresAt,
      });
    } catch (tokenErr) {
      console.error("refresh token save failed:", tokenErr);
    }

    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: String(process.env.COOKIE_SECURE).toLowerCase() === "true",
      expires: expiresAt,
      path: "/",
    });

    return res.json({
      accessToken,
      user: { id: user.id, email: user.email },
    });
  } catch (e) {
    console.error("POST /auth/login error:", e);
    return res.status(500).json({ error: "server error" });
  }
});

router.post("/student/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const cleanEmail = email != null ? String(email).trim().toLowerCase() : "";

    if (!cleanEmail || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await findUserByEmail(cleanEmail);

    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const valid = await argon2.verify(user.passwordHash, password);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const roles = await getRolesForUser(user.id);
    if (!roles.includes("STUDENT")) {
      return res.status(403).json({ error: "This account is not enabled for student login" });
    }

    const student = await findStudentByUserId(user.id);
    if (!student) {
      return res.status(403).json({ error: "Student profile not found. Please contact support" });
    }

    if (student.status === "pending") {
      return res.status(403).json({
        error:
          "Your registration is awaiting admin approval. You can sign in once an administrator approves your account. Please contact your training center administrator for approval status.",
      });
    }

    if (student.status === "paused") {
      return res.status(403).json({
        error: "Your account is currently paused. Please contact your training center administrator to reactivate your account.",
      });
    }

    if (student.status === "rejected") {
      return res.status(403).json({
        error: "Your registration was not approved. Please contact your training center administrator for more information.",
      });
    }

    if (student.status !== "approved") {
      return res.status(403).json({ error: `Login is not allowed for status: ${student.status}` });
    }

    const accessToken = jwt.sign(
      { sub: user.id, email: user.email, roles },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: parseTTL(process.env.ACCESS_TOKEN_TTL || "15m") }
    );

    return res.json({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        roles,
      },
      student: {
        id: student.id,
        status: student.status,
        full_name: student.fullName,
      },
    });
  } catch (err) {
    console.error("POST /auth/student/login error:", err);
    return res.status(500).json({ error: "Failed to login" });
  }
});

router.post("/instructor/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const cleanEmail = email != null ? String(email).trim().toLowerCase() : "";

    if (!cleanEmail || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await findUserByEmail(cleanEmail);

    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const valid = await argon2.verify(user.passwordHash, password);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const roles = await getRolesForUser(user.id);
    if (!roles.includes("INSTRUCTOR") && !roles.includes("SUPER_ADMIN") && !roles.includes("ADMIN")) {
      return res.status(403).json({ error: "This account does not have instructor access" });
    }

    const instructor = await findInstructorByUserId(user.id);
    if (!instructor) {
      return res.status(403).json({ error: "Instructor profile not found. Please contact support" });
    }

    if (!instructor.isActive || !instructor.canLogin) {
      return res.status(403).json({ error: "Your account is currently disabled" });
    }

    const accessToken = jwt.sign(
      { sub: user.id, email: user.email, roles },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: parseTTL(process.env.ACCESS_TOKEN_TTL || "15m") }
    );

    return res.json({
      accessToken,
      user: { id: user.id, email: user.email, roles },
      instructor: {
        id: instructor.id,
        full_name: instructor.fullName,
      },
    });
  } catch (err) {
    console.error("POST /auth/instructor/login error:", err);
    return res.status(500).json({ error: "Failed to login" });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("refresh_token", { path: "/" });
  return res.json({ ok: true });
});

router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await findUserById(req.auth.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const roles = await getRolesForUser(user.id);
    const student = await findStudentByUserId(user.id);
    const instructor = await findInstructorByUserId(user.id);

    const payload = {
      user: {
        id: user.id,
        email: user.email,
        full_name: student?.fullName ?? instructor?.fullName ?? null,
        createdAt: user.createdAt,
      },
      roles,
    };

    if (student) {
      payload.student = {
        id: student.id,
        full_name: student.fullName,
        email: student.email,
        status: student.status,
      };
    }

    if (instructor) {
      payload.instructor = {
        id: instructor.id,
        full_name: instructor.fullName,
        email: instructor.email,
        isActive: instructor.isActive,
      };
    }

    return res.json(payload);
  } catch (err) {
    console.error("GET /auth/me error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;