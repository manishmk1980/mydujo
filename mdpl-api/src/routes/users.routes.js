import { Router } from "express";
import argon2 from "argon2";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();
const ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN"];
const USER_STATUSES = ["ACTIVE", "DISABLED", "PENDING_INVITE"];

router.use(requireAuth);
router.use((req, res, next) => {
  if (!req.auth.roles.some((role) => ADMIN_ROLES.includes(role))) {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
});

const includeUser = {
  adminUser: true,
  student: true,
  instructor: true,
  userRoles: { include: { role: true } },
};

function userDto(user) {
  return {
    id: user.id,
    name: user.adminUser?.displayName || user.student?.fullName || user.instructor?.fullName || null,
    email: user.email,
    roles: user.userRoles.map((row) => row.role.name),
    status: user.status,
    created_at: user.createdAt,
    updated_at: user.updatedAt,
    last_login_at: user.lastLoginAt,
  };
}

function isSuperAdmin(req) {
  return req.auth.roles.includes("SUPER_ADMIN");
}

async function protectLastSuperAdmin(targetId, nextRole, nextStatus) {
  const target = await prisma.user.findUnique({ where: { id: targetId }, include: includeUser });
  if (!target) return { error: "User not found", status: 404 };
  const currentlySuper = target.userRoles.some((row) => row.role.name === "SUPER_ADMIN");
  const remainsSuper = nextRole === undefined ? currentlySuper : nextRole === "SUPER_ADMIN";
  const remainsActive = nextStatus === undefined ? target.status === "ACTIVE" : nextStatus === "ACTIVE";
  if (currentlySuper && (!remainsSuper || !remainsActive)) {
    const activeSuperAdmins = await prisma.user.count({
      where: { status: "ACTIVE", userRoles: { some: { role: { name: "SUPER_ADMIN" } } } },
    });
    if (activeSuperAdmins <= 1) return { error: "The only active Super Admin cannot be disabled or demoted", status: 409 };
  }
  return { target };
}

router.get("/", async (req, res) => {
  const search = String(req.query.search || "").trim();
  const role = String(req.query.role || "").trim();
  const status = String(req.query.status || "").trim();
  const where = {
    ...(status && USER_STATUSES.includes(status) ? { status } : {}),
    ...(role ? { userRoles: { some: { role: { name: role } } } } : {}),
    ...(search ? {
      OR: [
        { email: { contains: search } },
        { adminUser: { is: { displayName: { contains: search } } } },
        { student: { is: { fullName: { contains: search } } } },
        { instructor: { is: { fullName: { contains: search } } } },
      ],
    } : {}),
  };
  const [users, roles] = await Promise.all([
    prisma.user.findMany({ where, include: includeUser, orderBy: { createdAt: "desc" } }),
    prisma.role.findMany({ orderBy: { name: "asc" } }),
  ]);
  return res.json({ users: users.map(userDto), roles: roles.map((item) => item.name) });
});

router.post("/", async (req, res) => {
  if (!isSuperAdmin(req)) return res.status(403).json({ error: "Only Super Admin can create admin users" });
  const name = String(req.body?.name || "").trim();
  const email = String(req.body?.email || "").trim().toLowerCase();
  const password = String(req.body?.password || "");
  const roleName = String(req.body?.role || "ADMIN");
  const status = String(req.body?.status || (password ? "ACTIVE" : "PENDING_INVITE"));
  if (!name || !email) return res.status(400).json({ error: "Name and email are required" });
  if (!ADMIN_ROLES.includes(roleName) || !USER_STATUSES.includes(status)) return res.status(400).json({ error: "Invalid role or status" });
  if (status === "ACTIVE" && password.length < 8) return res.status(400).json({ error: "Active users require a password of at least 8 characters" });
  if (await prisma.user.findUnique({ where: { email } })) return res.status(409).json({ error: "Email already registered" });
  const role = await prisma.role.findUnique({ where: { name: roleName } });
  if (!role) return res.status(400).json({ error: "Role is not configured" });
  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({ data: { email, status, passwordHash: password ? await argon2.hash(password) : null } });
    await tx.userRole.create({ data: { userId: created.id, roleId: role.id } });
    await tx.adminUser.create({ data: { userId: created.id, email, displayName: name } });
    return tx.user.findUnique({ where: { id: created.id }, include: includeUser });
  });
  return res.status(201).json({ user: userDto(user) });
});

router.patch("/:id", async (req, res) => {
  const roleName = req.body?.role === undefined ? undefined : String(req.body.role);
  const status = req.body?.status === undefined ? undefined : String(req.body.status);
  const name = req.body?.name === undefined ? undefined : String(req.body.name).trim();
  if (roleName && !ADMIN_ROLES.includes(roleName)) return res.status(400).json({ error: "Invalid admin role" });
  if (status && !USER_STATUSES.includes(status)) return res.status(400).json({ error: "Invalid status" });
  if ((roleName === "SUPER_ADMIN" || roleName !== undefined) && !isSuperAdmin(req)) return res.status(403).json({ error: "Only Super Admin can change admin roles" });
  if (req.params.id === req.auth.userId && status === "DISABLED") return res.status(409).json({ error: "You cannot disable your own account" });
  const protection = await protectLastSuperAdmin(req.params.id, roleName, status);
  if (protection.error) return res.status(protection.status).json({ error: protection.error });
  if (!isSuperAdmin(req) && protection.target.userRoles.some((row) => row.role.name === "SUPER_ADMIN")) {
    return res.status(403).json({ error: "Only Super Admin can manage a Super Admin account" });
  }
  const user = await prisma.$transaction(async (tx) => {
    if (status) {
      await tx.user.update({ where: { id: req.params.id }, data: { status } });
      if (status === "DISABLED") await tx.refreshToken.deleteMany({ where: { userId: req.params.id } });
    }
    if (name !== undefined) {
      await tx.adminUser.upsert({
        where: { userId: req.params.id },
        create: { userId: req.params.id, email: protection.target.email, displayName: name || null },
        update: { displayName: name || null },
      });
    }
    if (roleName) {
      const role = await tx.role.findUnique({ where: { name: roleName } });
      if (!role) throw new Error("Role is not configured");
      await tx.userRole.deleteMany({ where: { userId: req.params.id, role: { name: { in: ADMIN_ROLES } } } });
      await tx.userRole.create({ data: { userId: req.params.id, roleId: role.id } });
    }
    return tx.user.findUnique({ where: { id: req.params.id }, include: includeUser });
  });
  return res.json({ user: userDto(user) });
});

router.post("/:id/password-reset", async (req, res) => {
  const password = String(req.body?.password || "");
  if (password.length < 8) return res.status(400).json({ error: "Temporary password must be at least 8 characters" });
  const target = await prisma.user.findUnique({ where: { id: req.params.id }, include: includeUser });
  if (!target) return res.status(404).json({ error: "User not found" });
  if (!isSuperAdmin(req) && target.userRoles.some((row) => row.role.name === "SUPER_ADMIN")) {
    return res.status(403).json({ error: "Only Super Admin can manage a Super Admin account" });
  }
  await prisma.$transaction([
    prisma.user.update({ where: { id: req.params.id }, data: { passwordHash: await argon2.hash(password), status: "ACTIVE" } }),
    prisma.refreshToken.deleteMany({ where: { userId: req.params.id } }),
  ]);
  return res.json({ ok: true });
});

router.delete("/:id", async (req, res) => {
  if (req.params.id === req.auth.userId) return res.status(409).json({ error: "You cannot archive your own account" });
  const protection = await protectLastSuperAdmin(req.params.id, undefined, "DISABLED");
  if (protection.error) return res.status(protection.status).json({ error: protection.error });
  if (!isSuperAdmin(req) && protection.target.userRoles.some((row) => row.role.name === "SUPER_ADMIN")) {
    return res.status(403).json({ error: "Only Super Admin can manage a Super Admin account" });
  }
  await prisma.$transaction([
    prisma.user.update({ where: { id: req.params.id }, data: { status: "DISABLED" } }),
    prisma.refreshToken.deleteMany({ where: { userId: req.params.id } }),
  ]);
  return res.json({ ok: true });
});

export default router;
