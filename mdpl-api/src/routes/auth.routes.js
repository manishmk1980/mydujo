import { Router } from "express";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

function parseTTL(ttl) {
  // supports "15m", "1h"
  return ttl;
}

function daysToMs(days) {
  return Number(days) * 24 * 60 * 60 * 1000;
}

async function userHasAdminRole(userId) {
  const roles = await prisma.userRole.findMany({
    where: { userId },
    include: { role: true },
  });

  const names = roles.map((r) => r.role.name);
  return names.includes("SUPER_ADMIN") || names.includes("ADMIN");
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

    const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existing) {
      return res.status(409).json({ error: "email already registered" });
    }

    const passwordHash = await argon2.hash(cleanPassword);

    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          email: cleanEmail,
          passwordHash,
        },
      });

      const studentRole = await tx.role.findUnique({ where: { name: "STUDENT" } });
      if (studentRole) {
        await tx.userRole.create({
          data: {
            userId: created.id,
            roleId: studentRole.id,
          },
        });
      }

      return created;
    });

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
    const user = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: "invalid credentials" });
    }

    const ok = await argon2.verify(user.passwordHash, password);
    if (!ok) {
      return res.status(401).json({ error: "invalid credentials" });
    }

    // admin-only login for now (you can relax later for student login)
    const isAdmin = await userHasAdminRole(user.id);
    if (!isAdmin) {
      return res.status(403).json({ error: "not authorized" });
    }

    const roleRows = await prisma.userRole.findMany({
      where: { userId: user.id },
      include: { role: true },
    });
    const roles = roleRows.map((r) => r.role.name);

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

    // store hash of refresh token
    const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
    const expiresAt = new Date(Date.now() + daysToMs(process.env.REFRESH_TOKEN_TTL_DAYS || 30));

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

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
    console.error(e);
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

    console.log("Student login attempt:", cleanEmail);

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const valid = await argon2.verify(user.passwordHash, password);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const roles = user.userRoles.map((ur) => ur.role.name);
    if (!roles.includes("STUDENT")) {
      console.log(`Student login blocked: ${cleanEmail} (no STUDENT role)`);
      return res.status(403).json({ error: "This account is not enabled for student login" });
    }

    const student = await prisma.student.findUnique({
      where: { userId: user.id },
    });

    if (!student) {
      console.log(`Student login blocked: ${cleanEmail} (no student profile)`);
      return res.status(403).json({ error: "Student profile not found. Please contact support" });
    }

    if (student.status === "pending") {
      console.log(`Student login blocked: ${cleanEmail} status=pending`);
      return res.status(403).json({ error: "Your registration is awaiting admin approval" });
    }

    if (student.status === "paused") {
      console.log(`Student login blocked: ${cleanEmail} status=paused`);
      return res.status(403).json({ error: "Your account is currently paused. Please contact support" });
    }

    if (student.status === "rejected") {
      console.log(`Student login blocked: ${cleanEmail} status=rejected`);
      return res.status(403).json({ error: "Your registration was not approved. Please contact support" });
    }

    if (student.status !== "approved") {
      console.log(`Student login blocked: ${cleanEmail} status=${student.status}`);
      return res.status(403).json({ error: `Login is not allowed for status: ${student.status}` });
    }

    const accessToken = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        roles,
      },
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

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: {
        userRoles: { include: { role: true } },
      },
    });

    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const valid = await argon2.verify(user.passwordHash, password);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const roles = user.userRoles.map((ur) => ur.role.name);
    if (!roles.includes("INSTRUCTOR") && !roles.includes("SUPER_ADMIN") && !roles.includes("ADMIN")) {
      return res.status(403).json({ error: "This account does not have instructor access" });
    }

    const instructor = await prisma.instructor.findUnique({
      where: { userId: user.id },
    });

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

router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.auth.userId },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
        student: true,
        instructor: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const roles = user.userRoles.map((ur) => ur.role.name);
    const payload = {
      user: {
        id: user.id,
        email: user.email,
        full_name: user.student?.fullName ?? null,
        createdAt: user.createdAt,
      },
      roles,
    };

    if (user.student) {
      payload.student = {
        id: user.student.id,
        full_name: user.student.fullName,
        email: user.student.email,
        status: user.student.status,
      };
    }

    if (user.instructor) {
      payload.instructor = {
        id: user.instructor.id,
        full_name: user.instructor.fullName,
        email: user.instructor.email,
        isActive: user.instructor.isActive,
      };
    }

    return res.json(payload);
  } catch (err) {
    console.error("GET /auth/me error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
