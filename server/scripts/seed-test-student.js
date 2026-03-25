import "dotenv/config";
import crypto from "node:crypto";
import argon2 from "argon2";
import { prisma } from "../src/db.js";

const TEST_STUDENT = {
  fullName: "Manish Kumar Mishra",
  email: "jsrmanish123@gmail.com",
  password: "12345678",
  phone: "9044921176",
};

async function main() {
  const studentRole = await prisma.roles.findUnique({ where: { name: "STUDENT" } });
  if (!studentRole) {
    throw new Error('Role "STUDENT" not found. Run: node scripts/seed-roles.js');
  }

  const cleanEmail = TEST_STUDENT.email.trim().toLowerCase();
  const now = new Date();

  const existingUser = await prisma.users.findUnique({
    where: { email: cleanEmail },
  });

  const user =
    existingUser ??
    (await prisma.users.create({
      data: {
        id: crypto.randomUUID(),
        email: cleanEmail,
        password_hash: await argon2.hash(TEST_STUDENT.password),
        updated_at: now,
      },
    }));

  if (existingUser) {
    await prisma.users.update({
      where: { id: user.id },
      data: {
        password_hash: await argon2.hash(TEST_STUDENT.password),
        updated_at: now,
      },
    });
  }

  await prisma.user_roles.create({
    data: {
      user_id: user.id,
      role_id: studentRole.id,
    },
  }).catch(() => {});

  const existingStudent = await prisma.students.findFirst({
    where: { user_id: user.id },
  });

  if (existingStudent) {
    await prisma.students.update({
      where: { id: existingStudent.id },
      data: {
        full_name: TEST_STUDENT.fullName,
        phone: TEST_STUDENT.phone,
        status: "approved",
      },
    });
    console.log("✅ Test student updated:", { email: cleanEmail, student_id: existingStudent.id });
    return;
  }

  const student = await prisma.students.create({
    data: {
      id: crypto.randomUUID(),
      user_id: user.id,
      full_name: TEST_STUDENT.fullName,
      email: cleanEmail,
      phone: TEST_STUDENT.phone,
      status: "approved",
      terms_accepted_at: now,
    },
  });

  console.log("✅ Test student created successfully");
  console.log("\n--- TEST STUDENT CREDENTIALS ---");
  console.log(`Name:     ${TEST_STUDENT.fullName}`);
  console.log(`Email:    ${TEST_STUDENT.email}`);
  console.log(`Phone:    ${TEST_STUDENT.phone}`);
  console.log(`Password: ${TEST_STUDENT.password}`);
  console.log(`StudentId:${student.id}`);
  console.log("---------------------------------\n");
}

main()
  .catch((e) => {
    console.error("❌ seed-test-student failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
