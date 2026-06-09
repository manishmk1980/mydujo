import crypto from "crypto";
import jwt from "jsonwebtoken";

process.env.EMAIL_ENABLED = "false";

const { default: app } = await import("../src/app.js");
const { prisma } = await import("../src/db.js");

const results = [];
const testUserId = crypto.randomUUID();
const testEmail = `api-smoke-${testUserId}@example.invalid`;
const studentUserId = crypto.randomUUID();
const studentEmail = `api-smoke-student-${studentUserId}@example.invalid`;
let studentId;
let server;

function record(name, passed, detail) {
  results.push({ name, passed, detail });
  console.log(`${passed ? "PASS" : "FAIL"} ${name}: ${detail}`);
}

async function request(baseUrl, name, path, options, expectedStatuses) {
  try {
    const response = await fetch(`${baseUrl}${path}`, options);
    const body = await response.text();
    const passed = expectedStatuses.includes(response.status);
    record(name, passed, `HTTP ${response.status}${passed ? "" : `; ${body.slice(0, 180)}`}`);
  } catch (error) {
    record(name, false, error.message);
  }
}

try {
  const role = await prisma.role.upsert({
    where: { name: "SUPER_ADMIN" },
    update: {},
    create: { id: crypto.randomUUID(), name: "SUPER_ADMIN" },
  });
  await prisma.role.upsert({
    where: { name: "STUDENT" },
    update: {},
    create: { id: crypto.randomUUID(), name: "STUDENT" },
  });
  await prisma.role.upsert({
    where: { name: "INSTRUCTOR" },
    update: {},
    create: { id: crypto.randomUUID(), name: "INSTRUCTOR" },
  });

  await prisma.user.create({
    data: {
      id: testUserId,
      email: testEmail,
      userRoles: { create: { roleId: role.id } },
    },
  });
  const studentRole = await prisma.role.findUnique({ where: { name: "STUDENT" } });
  const studentUser = await prisma.user.create({
    data: {
      id: studentUserId,
      email: studentEmail,
      userRoles: { create: { roleId: studentRole.id } },
      student: {
        create: {
          fullName: "API Smoke Student",
          email: studentEmail,
          status: "approved",
          termsAcceptedAt: new Date(),
        },
      },
    },
    include: { student: true },
  });
  studentId = studentUser.student.id;

  const token = jwt.sign(
    { sub: testUserId, email: testEmail, roles: ["SUPER_ADMIN"] },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: "5m" }
  );
  const authHeaders = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  const tests = [
    ["root", "/", {}, [200]],
    ["health", "/health", {}, [200]],
    ["training centers", "/training-centers", {}, [200]],
    ["training center missing slug", "/training-centers/by-slug/api-smoke-missing", {}, [200]],
    ["instructors public list", "/instructors", {}, [200]],
    ["disciplines", "/meta/disciplines", {}, [200]],
    ["registration validation", "/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" }, [400]],
    ["instructor registration validation", "/register/instructor", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" }, [400]],
    ["contact enquiry validation", "/contact-enquiry", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" }, [400]],
    ["signup validation", "/auth/signup", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" }, [400]],
    ["admin login validation", "/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" }, [400]],
    ["student login validation", "/auth/student/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" }, [400]],
    ["instructor login validation", "/auth/instructor/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" }, [400]],
    ["upload validation", "/upload/profile-photo", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" }, [400]],
    ["payment proof upload validation", "/upload/payment-proof", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" }, [400]],
    ["URL photo upload validation", "/upload/profile-photo-from-url", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" }, [400]],
    ["protected route guard", "/students", {}, [401]],
    ["auth me", "/auth/me", { headers: authHeaders }, [200]],
    ["admin security", "/auth/admin/security", { headers: authHeaders }, [200]],
    ["admin security validation", "/auth/admin/security", { method: "PATCH", headers: authHeaders, body: "{}" }, [401]],
    ["admin profile", "/auth/admin/profile", { headers: authHeaders }, [200]],
    ["admin profile update", "/auth/admin/profile", { method: "PATCH", headers: authHeaders, body: JSON.stringify({ displayName: "API Smoke" }) }, [200]],
    ["student stats", "/students/dashboard-stats", { headers: authHeaders }, [200]],
    ["students list", "/students", { headers: authHeaders }, [200]],
    ["student missing by user", "/students/by-user/api-smoke-missing", { headers: authHeaders }, [404]],
    ["student missing by id", "/students/api-smoke-missing", { headers: authHeaders }, [404]],
    ["student create validation", "/students", { method: "POST", headers: authHeaders, body: "{}" }, [400]],
    ["student update validation", "/students/api-smoke-missing", { method: "PUT", headers: authHeaders, body: JSON.stringify({ status: "invalid" }) }, [400]],
    ["student status validation", "/students/api-smoke-missing/status", { method: "PATCH", headers: authHeaders, body: "{}" }, [400]],
    ["training center create validation", "/training-centers", { method: "POST", headers: authHeaders, body: "{}" }, [400]],
    ["training center update missing", "/training-centers/api-smoke-missing", { method: "PATCH", headers: authHeaders, body: "{}" }, [404]],
    ["training center archive missing", "/training-centers/api-smoke-missing", { method: "DELETE", headers: authHeaders }, [404]],
    ["instructor me missing", "/instructors/me", { headers: authHeaders }, [404]],
    ["instructor students missing", "/instructors/my-students", { headers: authHeaders }, [404]],
    ["instructor stats missing", "/instructors/dashboard-stats", { headers: authHeaders }, [404]],
    ["instructors admin list", "/instructors/admin/all", { headers: authHeaders }, [200]],
    ["instructor create validation", "/instructors", { method: "POST", headers: authHeaders, body: "{}" }, [400]],
    ["instructor update missing", "/instructors/api-smoke-missing", { method: "PATCH", headers: authHeaders, body: "{}" }, [404]],
    ["instructor assignment validation", "/instructors/api-smoke-missing/assignments/students", { method: "POST", headers: authHeaders, body: "{}" }, [400]],
    ["instructor assignments list", "/instructors/api-smoke-missing/assignments/students", { headers: authHeaders }, [200]],
    ["instructor delete missing", "/instructors/api-smoke-missing", { method: "DELETE", headers: authHeaders }, [404]],
    ["instructor application update missing", "/admin/instructor-applications/api-smoke-missing", { method: "PATCH", headers: authHeaders, body: JSON.stringify({ status: "APPROVED" }) }, [404]],
    ["attendance create validation", "/attendance", { method: "POST", headers: authHeaders, body: "{}" }, [400]],
    ["attendance student list", "/attendance/student/api-smoke-missing", { headers: authHeaders }, [200]],
    ["attendance instructor missing", "/attendance/instructor", { headers: authHeaders }, [404]],
    ["attendance status validation", "/attendance/api-smoke-missing/status", { method: "PATCH", headers: authHeaders, body: "{}" }, [400]],
    ["discipline create validation", "/meta/disciplines", { method: "POST", headers: authHeaders, body: "{}" }, [400]],
    ["discipline update missing", "/meta/disciplines/api-smoke-missing", { method: "PATCH", headers: authHeaders, body: "{}" }, [404]],
    ["discipline archive missing", "/meta/disciplines/api-smoke-missing", { method: "DELETE", headers: authHeaders }, [404]],
    ["notifications unread count", "/notifications/unread-count", { headers: authHeaders }, [200]],
    ["notifications list", "/notifications/my", { headers: authHeaders }, [200]],
    ["notification read missing", "/notifications/api-smoke-missing/read", { method: "PATCH", headers: authHeaders, body: "{}" }, [404]],
    ["my fee requests missing profile", "/fees/my/requests", { headers: authHeaders }, [404]],
    ["my fee submissions missing profile", "/fees/my/submissions", { headers: authHeaders }, [404]],
    ["my fee submit missing profile", "/fees/my/submissions", { method: "POST", headers: authHeaders, body: "{}" }, [404]],
    ["my fee update missing profile", "/fees/my/submissions/api-smoke-missing", { method: "PATCH", headers: authHeaders, body: "{}" }, [404]],
    ["fee requests list", "/fees/requests", { headers: authHeaders }, [200]],
    ["fee request create validation", "/fees/requests", { method: "POST", headers: authHeaders, body: "{}" }, [400]],
    ["fee request bulk validation", "/fees/requests/bulk", { method: "POST", headers: authHeaders, body: "{}" }, [400]],
    ["fee request update missing", "/fees/requests/api-smoke-missing", { method: "PATCH", headers: authHeaders, body: "{}" }, [404]],
    ["fee request delete missing", "/fees/requests/api-smoke-missing", { method: "DELETE", headers: authHeaders }, [404]],
    ["fee submissions list", "/fees/submissions", { headers: authHeaders }, [200]],
    ["fee review validation", "/fees/submissions/api-smoke-missing/review", { method: "PATCH", headers: authHeaders, body: "{}" }, [400]],
    ["logout", "/auth/logout", { method: "POST", headers: authHeaders }, [200]],
  ];

  for (const [name, path, options, expected] of tests) {
    await request(baseUrl, name, path, options, expected);
  }

  const feeResponse = await fetch(`${baseUrl}/fees/requests`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      student_id: studentId,
      title: "API Smoke Fee",
      amount_paise: 10000,
      due_date: "2026-12-31",
    }),
  });
  const feeBody = await feeResponse.json();
  record("fee generation", feeResponse.status === 201, `HTTP ${feeResponse.status}`);
  const notification = await prisma.notification.findFirst({
    where: { userId: studentUserId, entityId: feeBody.fee_request?.id },
  });
  record("fee in-app notification", Boolean(notification), notification ? "created" : "missing");
} finally {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  await prisma.notification.deleteMany({ where: { userId: studentUserId } }).catch(() => {});
  await prisma.feeRequest.deleteMany({ where: { createdByUserId: testUserId } }).catch(() => {});
  await prisma.user.delete({ where: { id: studentUserId } }).catch(() => {});
  await prisma.user.delete({ where: { id: testUserId } }).catch(() => {});
  await prisma.$disconnect();
}

const failed = results.filter((result) => !result.passed);
console.log(`\nAPI smoke summary: ${results.length - failed.length}/${results.length} passed`);
if (failed.length) {
  process.exitCode = 1;
}
