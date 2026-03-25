import "dotenv/config";
import crypto from "node:crypto";
import { prisma } from "../src/db.js";

const DEMO = {
  studentEmail: "jsrmanish123@gmail.com",
  feeTitle: "April Monthly Fee",
  amountPaise: 200000,
};

async function main() {
  const email = DEMO.studentEmail.trim().toLowerCase();
  const user = await prisma.users.findUnique({ where: { email } });
  if (!user) {
    throw new Error(`Demo student user not found for email ${email}. Run: node scripts/seed-test-student.js`);
  }

  const student = await prisma.students.findFirst({ where: { user_id: user.id } });
  if (!student) {
    throw new Error(`Student profile not found for user ${user.id}.`);
  }

  const adminRole = await prisma.roles.findUnique({ where: { name: "ADMIN" } });
  const superRole = await prisma.roles.findUnique({ where: { name: "SUPER_ADMIN" } });
  if (!adminRole && !superRole) {
    throw new Error("ADMIN/SUPER_ADMIN role missing. Run: node scripts/seed-roles.js");
  }

  // Pick any admin user (or fallback to the student user for demo-only environments).
  const adminUserRole = await prisma.user_roles.findFirst({
    where: { role_id: { in: [adminRole?.id, superRole?.id].filter(Boolean) } },
    select: { user_id: true },
  });
  const adminUserId = adminUserRole?.user_id ?? user.id;

  const today = new Date();
  const dueIso = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const dueDate = new Date(`${dueIso}T00:00:00.000Z`);

  const fee = await prisma.fee_requests.create({
    data: {
      id: crypto.randomUUID(),
      student_id: student.id,
      training_center_id: student.training_center_id ?? null,
      title: DEMO.feeTitle,
      description: "Demo fee request for QA verification flow.",
      amount_paise: DEMO.amountPaise,
      currency: "INR",
      due_date: dueDate,
      status: "ISSUED",
      issued_at: today,
      created_by_user_id: adminUserId,
      updated_at: today,
    },
  });

  if (student.user_id) {
    await prisma.notifications.create({
      data: {
        id: crypto.randomUUID(),
        user_id: student.user_id,
        type: "FEE_REQUEST_ISSUED",
        title: "Fee request issued",
        message: `${DEMO.feeTitle} for ₹${(DEMO.amountPaise / 100).toFixed(2)} is due on ${dueIso}.`,
        entity_type: "fee_request",
        entity_id: fee.id,
      },
    });
  }

  const submission = await prisma.payment_submissions.create({
    data: {
      id: crypto.randomUUID(),
      fee_request_id: fee.id,
      student_id: student.id,
      submitted_by_user_id: user.id,
      method: "UPI",
      amount_paise: fee.amount_paise,
      paid_at: today,
      reference: "DEMO-UTR-12345",
      status: "SUBMITTED",
      notes_from_student: "Demo submission created by seed.",
      updated_at: today,
    },
  });

  console.log("✅ Seeded demo fee request + submission");
  console.log({ fee_request_id: fee.id, payment_submission_id: submission.id, student_id: student.id });
}

main()
  .catch((e) => {
    console.error("❌ seed-fees-demo failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

