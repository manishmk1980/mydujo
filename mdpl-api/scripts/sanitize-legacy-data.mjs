import { prisma } from "../src/db.js";

const dryRun = process.argv.includes("--dry-run");
const canonicalRoles = ["SUPER_ADMIN", "ADMIN", "INSTRUCTOR", "STUDENT"];
const validUserStatuses = new Set(["ACTIVE", "INACTIVE", "SUSPENDED", "DISABLED"]);

function normalizedEmail(value) {
  return String(value || "").trim().toLowerCase().slice(0, 255);
}

function trimmed(value, max) {
  const result = String(value || "").trim().slice(0, max);
  return result || null;
}

function bump(report, key, amount = 1) {
  report[key] = (report[key] || 0) + amount;
}

function buildUniqueEmailMap(rows) {
  const grouped = new Map();
  for (const row of rows) {
    const email = normalizedEmail(row.email);
    if (!email) continue;
    const values = grouped.get(email) || [];
    values.push(row);
    grouped.set(email, values);
  }
  return new Map([...grouped].filter(([, values]) => values.length === 1));
}

async function buildPlan() {
  const [roles, users, instructors, students, expiredTokens] = await Promise.all([
    prisma.role.findMany({ select: { id: true, name: true } }),
    prisma.user.findMany({
      select: {
        id: true,
        email: true,
        status: true,
        instructor: { select: { id: true } },
        student: { select: { id: true } },
      },
    }),
    prisma.instructor.findMany(),
    prisma.student.findMany(),
    prisma.refreshToken.count({ where: { expiresAt: { lt: new Date() } } }),
  ]);

  const report = {
    missingCanonicalRoles: canonicalRoles.filter((name) => !roles.some((role) => role.name === name)).length,
    expiredRefreshTokens: expiredTokens,
  };
  const plan = {
    userUpdates: [],
    instructorUpdates: [],
    studentUpdates: [],
    instructorLinks: [],
    studentLinks: [],
    disableInstructorPublicProfiles: [],
  };

  const userEmailGroups = new Map();
  for (const user of users) {
    const email = normalizedEmail(user.email);
    const values = userEmailGroups.get(email) || [];
    values.push(user);
    userEmailGroups.set(email, values);
  }

  for (const user of users) {
    const email = normalizedEmail(user.email);
    const data = {};
    if (email && email !== user.email && userEmailGroups.get(email)?.length === 1) {
      data.email = email;
      bump(report, "normalizedUserEmails");
    } else if (email !== user.email) {
      bump(report, "skippedUserEmailCollisions");
    }
    const status = String(user.status || "").trim().toUpperCase();
    if (!validUserStatuses.has(status)) {
      data.status = "ACTIVE";
      bump(report, "repairedUserStatuses");
    } else if (status !== user.status) {
      data.status = status;
      bump(report, "normalizedUserStatuses");
    }
    if (Object.keys(data).length) plan.userUpdates.push({ id: user.id, data });
  }

  const uniqueUsersByEmail = buildUniqueEmailMap(users);
  const uniqueInstructorsByEmail = buildUniqueEmailMap(instructors);
  const uniqueStudentsByEmail = buildUniqueEmailMap(students);
  const occupiedInstructorUsers = new Set(instructors.map((row) => row.userId).filter(Boolean));
  const occupiedStudentUsers = new Set(students.map((row) => row.userId).filter(Boolean));
  const usersById = new Map(users.map((user) => [user.id, user]));

  for (const instructor of instructors) {
    const data = {};
    const linkedUser = instructor.userId ? usersById.get(instructor.userId) : null;
    const email = linkedUser ? normalizedEmail(linkedUser.email) : normalizedEmail(instructor.email);
    const fullName = trimmed(instructor.fullName, 255);
    if (email && email !== instructor.email) {
      data.email = email;
      bump(report, "normalizedInstructorEmails");
    }
    if (fullName && fullName !== instructor.fullName) {
      data.fullName = fullName;
      bump(report, "trimmedInstructorNames");
    }
    const approvalStatus = instructor.isActive && instructor.canLogin ? "APPROVED" : "PENDING_REVIEW";
    if (!["APPROVED", "PENDING_REVIEW", "REJECTED", "SUSPENDED"].includes(instructor.approvalStatus)) {
      data.approvalStatus = approvalStatus;
      bump(report, "repairedInstructorApprovalStatuses");
    }
    if (
      instructor.publicProfileEnabled &&
      (
        !instructor.isActive ||
        instructor.approvalStatus !== "APPROVED" ||
        !instructor.publicConsentConfirmed ||
        !trimmed(instructor.publicDisplayName || instructor.fullName, 255) ||
        !trimmed(instructor.publicBio, 1000) ||
        !trimmed(instructor.publicPhotoUrl, 512) ||
        !trimmed(instructor.publicDiscipline, 128) ||
        !trimmed(instructor.city, 128) ||
        !trimmed(instructor.state, 128)
      )
    ) {
      plan.disableInstructorPublicProfiles.push(instructor.id);
      bump(report, "disabledUnsafeInstructorPublicProfiles");
    }
    if (Object.keys(data).length) plan.instructorUpdates.push({ id: instructor.id, data });

    const candidate = uniqueUsersByEmail.get(normalizedEmail(instructor.email))?.[0];
    if (
      !instructor.userId &&
      candidate &&
      uniqueInstructorsByEmail.has(normalizedEmail(instructor.email)) &&
      !occupiedInstructorUsers.has(candidate.id)
    ) {
      plan.instructorLinks.push({ profileId: instructor.id, userId: candidate.id });
      occupiedInstructorUsers.add(candidate.id);
      bump(report, "linkedInstructorUsers");
    }
  }

  for (const student of students) {
    const data = {};
    const linkedUser = student.userId ? usersById.get(student.userId) : null;
    const email = linkedUser ? normalizedEmail(linkedUser.email) : normalizedEmail(student.email);
    const fullName = trimmed(student.fullName, 255);
    if (email && email !== student.email) {
      data.email = email;
      bump(report, "normalizedStudentEmails");
    }
    if (fullName && fullName !== student.fullName) {
      data.fullName = fullName;
      bump(report, "trimmedStudentNames");
    }
    if (Object.keys(data).length) plan.studentUpdates.push({ id: student.id, data });

    const candidate = uniqueUsersByEmail.get(normalizedEmail(student.email))?.[0];
    if (
      !student.userId &&
      candidate &&
      uniqueStudentsByEmail.has(normalizedEmail(student.email)) &&
      !occupiedStudentUsers.has(candidate.id)
    ) {
      plan.studentLinks.push({ profileId: student.id, userId: candidate.id });
      occupiedStudentUsers.add(candidate.id);
      bump(report, "linkedStudentUsers");
    }
  }

  return { plan, report };
}

async function applyPlan(plan) {
  await prisma.$transaction(async (tx) => {
    const roleByName = new Map();
    for (const name of canonicalRoles) {
      const role = await tx.role.upsert({
        where: { name },
        create: { name },
        update: {},
      });
      roleByName.set(name, role);
    }

    for (const update of plan.userUpdates) {
      await tx.user.update({ where: { id: update.id }, data: update.data });
    }
    for (const update of plan.instructorUpdates) {
      await tx.instructor.update({ where: { id: update.id }, data: update.data });
    }
    for (const update of plan.studentUpdates) {
      await tx.student.update({ where: { id: update.id }, data: update.data });
    }
    for (const link of plan.instructorLinks) {
      await tx.instructor.update({ where: { id: link.profileId }, data: { userId: link.userId } });
    }
    for (const link of plan.studentLinks) {
      await tx.student.update({ where: { id: link.profileId }, data: { userId: link.userId } });
    }
    for (const instructorId of plan.disableInstructorPublicProfiles) {
      await tx.instructor.update({
        where: { id: instructorId },
        data: {
          publicProfileEnabled: false,
          isFeaturedPublic: false,
          publicReviewStatus: "CHANGES_REQUESTED",
          publicChangesRequestedNote: "Profile was unpublished during data validation because required approval or public information was incomplete.",
          publicApprovedAt: null,
          publicApprovedByUserId: null,
        },
      });
    }

    const linkedProfiles = await Promise.all([
      tx.instructor.findMany({ where: { userId: { not: null } }, select: { userId: true } }),
      tx.student.findMany({ where: { userId: { not: null } }, select: { userId: true } }),
    ]);
    await tx.userRole.createMany({
      data: [
        ...linkedProfiles[0].map(({ userId }) => ({ userId, roleId: roleByName.get("INSTRUCTOR").id })),
        ...linkedProfiles[1].map(({ userId }) => ({ userId, roleId: roleByName.get("STUDENT").id })),
      ],
      skipDuplicates: true,
    });
    await tx.refreshToken.deleteMany({ where: { expiresAt: { lt: new Date() } } });
  });
}

try {
  const { plan, report } = await buildPlan();
  if (!dryRun) await applyPlan(plan);
  console.log(JSON.stringify({ mode: dryRun ? "dry-run" : "applied", report }, null, 2));
} finally {
  await prisma.$disconnect();
}
