import "dotenv/config";
import argon2 from "argon2";
import { prisma } from "../src/db.js";

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error("Missing ADMIN_EMAIL / ADMIN_PASSWORD in .env");
  }

  // 1) Ensure SUPER_ADMIN role exists
  const superRole = await prisma.role.findUnique({ where: { name: "SUPER_ADMIN" } });
  if (!superRole) {
    throw new Error('Role "SUPER_ADMIN" not found. Run: node scripts/seed-roles.js');
  }

  // 2) Create or reuse user
  const existingUser = await prisma.user.findUnique({ where: { email } });
  const user =
    existingUser ??
    (await prisma.user.create({
      data: {
        email,
        passwordHash: await argon2.hash(password),
        emailVerifiedAt: new Date(),
      },
    }));

  // 3) Assign SUPER_ADMIN role (idempotent)
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: user.id, roleId: superRole.id } },
    update: {},
    create: { userId: user.id, roleId: superRole.id },
  });

  // 4) Ensure admin_users row exists (idempotent)
  await prisma.adminUser.upsert({
    where: { userId: user.id },
    update: { email },
    create: { userId: user.id, email },
  });

  console.log("✅ SUPER_ADMIN ready:", { email, userId: user.id });
}

main()
  .catch((e) => {
    console.error("❌ setup-super-admin failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
