import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import request from "supertest";

import app from "../src/app.js";
import { prisma } from "../src/db.js";

function signToken({ userId, email, roles }) {
  return jwt.sign(
    { sub: userId, email, roles },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: "30m" }
  );
}

async function ensureRole(name) {
  return prisma.roles.upsert({
    where: { name },
    update: {},
    create: { id: crypto.randomUUID(), name },
  });
}

async function createUser(email) {
  return prisma.users.create({
    data: {
      id: crypto.randomUUID(),
      email,
      password_hash: null,
      updated_at: new Date(),
    },
  });
}

async function attachRole(userId, roleId) {
  await prisma.user_roles.create({ data: { user_id: userId, role_id: roleId } }).catch(() => {});
}

async function createStudent({ userId, email }) {
  return prisma.students.create({
    data: {
      id: crypto.randomUUID(),
      user_id: userId,
      full_name: "QA Test Student",
      email,
      status: "approved",
      terms_accepted_at: new Date(),
    },
  });
}

test("fees: student cannot submit for another student's fee request", async (t) => {
  if (!process.env.JWT_ACCESS_SECRET) t.skip("JWT_ACCESS_SECRET not set");

  const roleStudent = await ensureRole("STUDENT");
  const roleAdmin = await ensureRole("ADMIN");

  const u1 = await createUser(`qa-student1-${crypto.randomUUID()}@example.com`);
  const u2 = await createUser(`qa-student2-${crypto.randomUUID()}@example.com`);
  const admin = await createUser(`qa-admin-${crypto.randomUUID()}@example.com`);
  await attachRole(u1.id, roleStudent.id);
  await attachRole(u2.id, roleStudent.id);
  await attachRole(admin.id, roleAdmin.id);

  const s1 = await createStudent({ userId: u1.id, email: u1.email });
  const s2 = await createStudent({ userId: u2.id, email: u2.email });

  const fee = await prisma.fee_requests.create({
    data: {
      id: crypto.randomUUID(),
      student_id: s1.id,
      training_center_id: null,
      title: "Test Fee",
      description: null,
      amount_paise: 10000,
      currency: "INR",
      due_date: new Date(new Date().toISOString().slice(0, 10) + "T00:00:00.000Z"),
      status: "ISSUED",
      issued_at: new Date(),
      created_by_user_id: admin.id,
    },
  });

  const tokenStudent2 = signToken({ userId: u2.id, email: u2.email, roles: ["STUDENT"] });

  const res = await request(app)
    .post("/fees/my/submissions")
    .set("Authorization", `Bearer ${tokenStudent2}`)
    .send({
      fee_request_id: fee.id,
      method: "UPI",
      amount_paise: 10000,
      reference: "UTR123",
    });

  assert.equal(res.status, 403);
  assert.match(res.body?.error ?? "", /another student/i);

  // Cleanup best-effort
  await prisma.payment_submissions.deleteMany({ where: { fee_request_id: fee.id } }).catch(() => {});
  await prisma.fee_requests.delete({ where: { id: fee.id } }).catch(() => {});
  await prisma.students.deleteMany({ where: { id: { in: [s1.id, s2.id] } } }).catch(() => {});
  await prisma.user_roles.deleteMany({ where: { user_id: { in: [u1.id, u2.id, admin.id] } } }).catch(() => {});
  await prisma.users.deleteMany({ where: { id: { in: [u1.id, u2.id, admin.id] } } }).catch(() => {});
});

test("fees: student my/requests returns only own fee requests", async (t) => {
  if (!process.env.JWT_ACCESS_SECRET) t.skip("JWT_ACCESS_SECRET not set");

  const roleStudent = await ensureRole("STUDENT");
  const roleAdmin = await ensureRole("ADMIN");

  const u1 = await createUser(`qa-own-1-${crypto.randomUUID()}@example.com`);
  const u2 = await createUser(`qa-own-2-${crypto.randomUUID()}@example.com`);
  const admin = await createUser(`qa-own-admin-${crypto.randomUUID()}@example.com`);
  await attachRole(u1.id, roleStudent.id);
  await attachRole(u2.id, roleStudent.id);
  await attachRole(admin.id, roleAdmin.id);

  const s1 = await createStudent({ userId: u1.id, email: u1.email });
  const s2 = await createStudent({ userId: u2.id, email: u2.email });

  const fee1 = await prisma.fee_requests.create({
    data: {
      id: crypto.randomUUID(),
      student_id: s1.id,
      training_center_id: null,
      title: "Own Fee",
      description: null,
      amount_paise: 10000,
      currency: "INR",
      due_date: new Date(new Date().toISOString().slice(0, 10) + "T00:00:00.000Z"),
      status: "ISSUED",
      issued_at: new Date(),
      created_by_user_id: admin.id,
    },
  });

  const fee2 = await prisma.fee_requests.create({
    data: {
      id: crypto.randomUUID(),
      student_id: s2.id,
      training_center_id: null,
      title: "Other Fee",
      description: null,
      amount_paise: 20000,
      currency: "INR",
      due_date: new Date(new Date().toISOString().slice(0, 10) + "T00:00:00.000Z"),
      status: "ISSUED",
      issued_at: new Date(),
      created_by_user_id: admin.id,
    },
  });

  const tokenStudent1 = signToken({ userId: u1.id, email: u1.email, roles: ["STUDENT"] });
  const res = await request(app)
    .get("/fees/my/requests")
    .set("Authorization", `Bearer ${tokenStudent1}`);

  assert.equal(res.status, 200);
  const ids = (res.body?.fee_requests ?? []).map((r) => r.id);
  assert.deepEqual(ids, [fee1.id]);

  // Cleanup best-effort
  await prisma.fee_requests.deleteMany({ where: { id: { in: [fee1.id, fee2.id] } } }).catch(() => {});
  await prisma.students.deleteMany({ where: { id: { in: [s1.id, s2.id] } } }).catch(() => {});
  await prisma.user_roles.deleteMany({ where: { user_id: { in: [u1.id, u2.id, admin.id] } } }).catch(() => {});
  await prisma.users.deleteMany({ where: { id: { in: [u1.id, u2.id, admin.id] } } }).catch(() => {});
});

test("fees: admin review VERIFIED marks fee request PAID", async (t) => {
  if (!process.env.JWT_ACCESS_SECRET) t.skip("JWT_ACCESS_SECRET not set");

  const roleStudent = await ensureRole("STUDENT");
  const roleAdmin = await ensureRole("ADMIN");

  const u = await createUser(`qa-student-${crypto.randomUUID()}@example.com`);
  const admin = await createUser(`qa-admin-${crypto.randomUUID()}@example.com`);
  await attachRole(u.id, roleStudent.id);
  await attachRole(admin.id, roleAdmin.id);

  const s = await createStudent({ userId: u.id, email: u.email });

  const fee = await prisma.fee_requests.create({
    data: {
      id: crypto.randomUUID(),
      student_id: s.id,
      training_center_id: null,
      title: "Test Fee 2",
      description: null,
      amount_paise: 25000,
      currency: "INR",
      due_date: new Date(new Date().toISOString().slice(0, 10) + "T00:00:00.000Z"),
      status: "ISSUED",
      issued_at: new Date(),
      created_by_user_id: admin.id,
    },
  });

  const sub = await prisma.payment_submissions.create({
    data: {
      id: crypto.randomUUID(),
      fee_request_id: fee.id,
      student_id: s.id,
      submitted_by_user_id: u.id,
      method: "UPI",
      amount_paise: fee.amount_paise,
      paid_at: new Date(),
      reference: "UTR-OK",
      status: "SUBMITTED",
    },
  });

  const tokenAdmin = signToken({ userId: admin.id, email: admin.email, roles: ["ADMIN"] });
  const res = await request(app)
    .patch(`/fees/submissions/${sub.id}/review`)
    .set("Authorization", `Bearer ${tokenAdmin}`)
    .send({ status: "VERIFIED", review_notes: "ok" });

  assert.equal(res.status, 200);
  assert.equal(res.body?.submission?.status, "VERIFIED");

  const feeAfter = await prisma.fee_requests.findUnique({ where: { id: fee.id } });
  assert.equal(feeAfter?.status, "PAID");

  // Cleanup best-effort
  await prisma.notifications.deleteMany({ where: { entity_id: sub.id } }).catch(() => {});
  await prisma.payment_submissions.delete({ where: { id: sub.id } }).catch(() => {});
  await prisma.fee_requests.delete({ where: { id: fee.id } }).catch(() => {});
  await prisma.students.delete({ where: { id: s.id } }).catch(() => {});
  await prisma.user_roles.deleteMany({ where: { user_id: { in: [u.id, admin.id] } } }).catch(() => {});
  await prisma.users.deleteMany({ where: { id: { in: [u.id, admin.id] } } }).catch(() => {});
});

