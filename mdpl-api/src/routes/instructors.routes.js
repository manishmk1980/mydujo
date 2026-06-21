import { Router } from "express";
import argon2 from "argon2";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { notifyAdminRegistration, sendEmailSafely } from "../services/mail.js";
import {
  parseInstructorOwnedPublicProfile,
  parsePublicProfilePayload,
  publicProfileErrorResponse,
} from "../utils/publicProfile.js";
import {
  ensureUniqueInstructorPublicSlug,
  getInstructorPublicProfileCompletion,
  serializeInstructorPublicProfile,
} from "../utils/instructorPublicProfile.js";
import { parseInstructorBioSections } from "../utils/instructorVerification.js";

const router = Router();
const cleanOptional = (value, max) => {
  if (value == null || value === "") return null;
  const text = String(value).trim();
  return text ? text.slice(0, max) : null;
};

/**
 * Middleware to restrict access to Super Admins.
 */
function requireSuperAdmin(req, res, next) {
  const roles = req?.auth?.roles || [];
  if (!roles.includes("SUPER_ADMIN")) {
    return res.status(403).json({ error: "not authorized" });
  }
  return next();
}

function requireAdmin(req, res, next) {
  const roles = req?.auth?.roles || [];
  if (!roles.some((role) => role === "ADMIN" || role === "SUPER_ADMIN")) {
    return res.status(403).json({ error: "not authorized" });
  }
  return next();
}

async function getAuthenticatedInstructor(req) {
  return prisma.instructor.findUnique({
    where: { userId: req.auth.userId },
    include: {
      centerAssignments: {
        include: {
          trainingCenter: {
            select: { id: true, name: true, slug: true, city: true, state: true, status: true },
          },
        },
        orderBy: { assignedAt: "asc" },
      },
    },
  });
}

/**
 * Public: registration dropdown uses this.
 */
router.get("/", async (req, res) => {
  try {
    const instructors = await prisma.instructor.findMany({
      where: { isActive: true },
      orderBy: { fullName: "asc" },
    });

    return res.json({
      instructors: instructors.map(i => ({
        id: i.id,
        name: i.fullName,
      }))
    });
  } catch (err) {
    console.error("GET /instructors error:", err);
    return res.status(500).json({ error: "Failed to fetch instructors" });
  }
});

/**
 * Instructor-only: get my profile
 */
router.get("/me", requireAuth, async (req, res) => {
  try {
    const instructor = await getAuthenticatedInstructor(req);

    if (!instructor) {
      return res.status(404).json({ error: "Instructor profile not found" });
    }

    const { cleanBio, adminReview } = parseInstructorBioSections(instructor.bio);

    return res.json({
      instructor: {
        ...instructor,
        bio: cleanBio,
        applicationReviewNote: adminReview,
        approvalStatus: instructor.approvalStatus,
        publicProfile: serializeInstructorPublicProfile(instructor),
        assignedCenters: instructor.centerAssignments.map((assignment) => ({
          ...assignment.trainingCenter,
          authorities: {
            canViewStudents: assignment.canViewStudents,
            canManageAttendance: assignment.canManageAttendance,
            canManageGrading: assignment.canManageGrading,
            canManageClasses: assignment.canManageClasses,
          },
        })),
      },
    });
  } catch (err) {
    console.error("GET /instructors/me error:", err);
    return res.status(500).json({ error: "Failed to fetch profile" });
  }
});

/**
 * Instructor-only: get assigned students
 */
router.get("/my-students", requireAuth, async (req, res) => {
  try {
    const instructor = await getAuthenticatedInstructor(req);
    if (!instructor) return res.status(404).json({ error: "Instructor not found" });

    const centerIds = instructor.centerAssignments
      .filter((assignment) => assignment.canViewStudents)
      .map((assignment) => assignment.trainingCenterId);
    const students = await prisma.student.findMany({
      where: {
        OR: [
          { instructorAssignments: { some: { instructorId: instructor.id } } },
          ...(centerIds.length ? [{ trainingCenterId: { in: centerIds } }] : []),
        ],
      },
      include: {
        gradingProgress: true,
        trainingCenter: { select: { id: true, name: true } },
        instructorAssignments: {
          where: { instructorId: instructor.id },
          select: { instructorId: true },
        },
      },
      orderBy: { fullName: "asc" },
    });

    const directIds = new Set(
      students
        .filter((student) => student.instructorAssignments?.some?.((item) => item.instructorId === instructor.id))
        .map((student) => student.id),
    );
    const gradingCenters = new Set(
      instructor.centerAssignments.filter((item) => item.canManageGrading).map((item) => item.trainingCenterId),
    );
    const attendanceCenters = new Set(
      instructor.centerAssignments.filter((item) => item.canManageAttendance).map((item) => item.trainingCenterId),
    );
    return res.json({
      students: students.map((student) => ({
        id: student.id,
        fullName: student.fullName,
        email: student.email,
        phone: student.phone,
        status: student.status,
        currentBelt: student.currentBelt,
        currentRankLabel: student.currentRankLabel,
        nextGradingDate: student.nextGradingDate,
        gradingProgress: student.gradingProgress,
        trainingCenter: student.trainingCenter,
        permissions: {
          canManageGrading: directIds.has(student.id) || gradingCenters.has(student.trainingCenterId),
          canManageAttendance: directIds.has(student.id) || attendanceCenters.has(student.trainingCenterId),
        },
      })),
    });
  } catch (err) {
    console.error("GET /instructors/my-students error:", err);
    return res.status(500).json({ error: "Failed to fetch students" });
  }
});

/**
 * Instructor-only: get dashboard stats
 */
router.get("/dashboard-stats", requireAuth, async (req, res) => {
  try {
    const instructor = await getAuthenticatedInstructor(req);

    if (!instructor) return res.status(404).json({ error: "Instructor not found" });

    const visibleCenterIds = instructor.centerAssignments
      .filter((assignment) => assignment.canViewStudents)
      .map((assignment) => assignment.trainingCenterId);
    const attendanceCenterIds = instructor.centerAssignments
      .filter((assignment) => assignment.canManageAttendance)
      .map((assignment) => assignment.trainingCenterId);

    const [studentsCount, classesCount, pendingAttendance] = await Promise.all([
      prisma.student.count({
        where: {
          OR: [
            { instructorAssignments: { some: { instructorId: instructor.id } } },
            ...(visibleCenterIds.length ? [{ trainingCenterId: { in: visibleCenterIds } }] : []),
          ],
        },
      }),
      prisma.classSession.count({
        where: {
          OR: [
            { instructorId: instructor.id },
            ...(instructor.centerAssignments.length
              ? [{ trainingCenterId: { in: instructor.centerAssignments.map((item) => item.trainingCenterId) } }]
              : []),
          ],
        },
      }),
      prisma.attendance.count({
        where: {
          status: 'pending',
          OR: [
            { classSession: { instructorId: instructor.id } },
            ...(attendanceCenterIds.length
              ? [{ classSession: { trainingCenterId: { in: attendanceCenterIds } } }]
              : []),
          ],
        }
      })
    ]);

    return res.json({
      studentsCount,
      classesCount,
      pendingAttendance,
      pendingGrading: 0,
      centersCount: instructor.centerAssignments.length,
      assignedCenters: instructor.centerAssignments.map((assignment) => ({
        ...assignment.trainingCenter,
        authorities: {
          canViewStudents: assignment.canViewStudents,
          canManageAttendance: assignment.canManageAttendance,
          canManageGrading: assignment.canManageGrading,
          canManageClasses: assignment.canManageClasses,
        },
      })),
    });
  } catch (err) {
    console.error("Dashboard stats error:", err);
    return res.status(500).json({ error: "Failed to fetch stats" });
  }
});

router.get("/me/classes", requireAuth, async (req, res) => {
  try {
    const instructor = await getAuthenticatedInstructor(req);
    if (!instructor) return res.status(404).json({ error: "Instructor not found" });
    const centerIds = instructor.centerAssignments.map((item) => item.trainingCenterId);
    const classes = await prisma.classSession.findMany({
      where: {
        OR: [
          { instructorId: instructor.id },
          ...(centerIds.length ? [{ trainingCenterId: { in: centerIds } }] : []),
        ],
      },
      include: {
        trainingCenter: { select: { id: true, name: true } },
        _count: { select: { attendance: true } },
      },
      orderBy: [{ sessionDate: "desc" }, { startTime: "desc" }],
      take: 200,
    });
    return res.json({ classes });
  } catch (error) {
    console.error("GET /instructors/me/classes error:", error);
    return res.status(500).json({ error: "Failed to load classes" });
  }
});

router.post("/me/classes", requireAuth, async (req, res) => {
  try {
    const instructor = await getAuthenticatedInstructor(req);
    if (!instructor) return res.status(404).json({ error: "Instructor not found" });
    const title = String(req.body?.title || "").trim().slice(0, 255);
    const trainingCenterId = String(req.body?.trainingCenterId || "");
    const sessionDate = new Date(req.body?.sessionDate);
    if (!title || !trainingCenterId || Number.isNaN(sessionDate.getTime())) {
      return res.status(400).json({ error: "Title, training center, and session date are required" });
    }
    const authority = instructor.centerAssignments.find((item) =>
      item.trainingCenterId === trainingCenterId && item.canManageClasses
    );
    if (!authority) return res.status(403).json({ error: "You are not authorized to manage classes for this center" });

    const startTime = req.body?.startTime ? new Date(req.body.startTime) : null;
    const endTime = req.body?.endTime ? new Date(req.body.endTime) : null;
    if ((startTime && Number.isNaN(startTime.getTime())) || (endTime && Number.isNaN(endTime.getTime()))) {
      return res.status(400).json({ error: "Class start or end time is invalid" });
    }
    const row = await prisma.classSession.create({
      data: {
        title,
        classType: cleanOptional(req.body?.classType, 64),
        trainingCenterId,
        instructorId: instructor.id,
        instructorName: instructor.fullName,
        discipline: cleanOptional(req.body?.discipline, 64),
        sessionDate,
        startTime,
        endTime,
        notes: cleanOptional(req.body?.notes, 512),
      },
      include: { trainingCenter: { select: { id: true, name: true } } },
    });
    return res.status(201).json({ classSession: row });
  } catch (error) {
    console.error("POST /instructors/me/classes error:", error);
    return res.status(500).json({ error: "Failed to create class" });
  }
});

router.patch("/me/students/:studentId/grading", requireAuth, async (req, res) => {
  try {
    const instructor = await getAuthenticatedInstructor(req);
    if (!instructor) return res.status(404).json({ error: "Instructor not found" });
    const student = await prisma.student.findUnique({
      where: { id: req.params.studentId },
      select: {
        id: true,
        trainingCenterId: true,
        instructorAssignments: { where: { instructorId: instructor.id }, select: { id: true } },
      },
    });
    if (!student) return res.status(404).json({ error: "Student not found" });
    const direct = student.instructorAssignments.length > 0;
    const centerAuthority = instructor.centerAssignments.some((item) =>
      item.trainingCenterId === student.trainingCenterId && item.canManageGrading
    );
    if (!direct && !centerAuthority) {
      return res.status(403).json({ error: "You are not authorized to update grading for this student" });
    }
    const percentage = Number(req.body?.syllabusCompletionPercent);
    if (!Number.isInteger(percentage) || percentage < 0 || percentage > 100) {
      return res.status(400).json({ error: "Syllabus completion must be a whole number from 0 to 100" });
    }
    const gradingProgress = await prisma.gradingProgress.upsert({
      where: { studentId: student.id },
      update: {
        syllabusCompletionPercent: percentage,
        readinessStatus: cleanOptional(req.body?.readinessStatus, 64),
        instructorNotes: cleanOptional(req.body?.instructorNotes, 512),
        reviewedByInstructorId: instructor.id,
        reviewedAt: new Date(),
      },
      create: {
        studentId: student.id,
        syllabusCompletionPercent: percentage,
        readinessStatus: cleanOptional(req.body?.readinessStatus, 64),
        instructorNotes: cleanOptional(req.body?.instructorNotes, 512),
        reviewedByInstructorId: instructor.id,
        reviewedAt: new Date(),
      },
    });
    return res.json({ gradingProgress });
  } catch (error) {
    console.error("PATCH /instructors/me/students/:studentId/grading error:", error);
    return res.status(500).json({ error: "Failed to update grading progress" });
  }
});

/**
 * Super admin can fetch all instructors with stats
 */
router.get("/admin/all", requireAuth, requireAdmin, async (req, res) => {
  try {
    const instructors = await prisma.instructor.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            lastLoginAt: true,
          }
        },
        _count: {
          select: {
            assignments: true,
            classSessions: true,
          }
        },
        centerAssignments: {
          include: {
            trainingCenter: {
              select: { id: true, name: true, city: true, state: true, status: true },
            },
          },
        },
      },
      orderBy: { fullName: "asc" },
    });

    return res.json({
      instructors: instructors.map(i => ({
        ...i,
        approvalStatus: i.approvalStatus,
        approvedAt: i.approvedAt,
        lastLoginAt: i.user?.lastLoginAt ?? null,
        createdAt: i.createdAt,
        publicProfile: serializeInstructorPublicProfile(i),
        assignedCenters: i.centerAssignments.map((assignment) => ({
          ...assignment.trainingCenter,
          authorities: {
            canViewStudents: assignment.canViewStudents,
            canManageAttendance: assignment.canManageAttendance,
            canManageGrading: assignment.canManageGrading,
            canManageClasses: assignment.canManageClasses,
          },
        })),
        _count: {
          students: i._count.assignments,
          classes: i._count.classSessions,
          centers: i.centerAssignments.length,
        }
      }))
    });
  } catch (err) {
    console.error("GET /instructors/admin/all error:", err);
    return res.status(500).json({ error: "Failed to fetch instructors" });
  }
});

/**
 * Super admin can create instructors
 */
router.post("/", requireAuth, requireSuperAdmin, async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      bio,
      city,
      state,
      isActive = true,
      canLogin = false,
      password
    } = req.body || {};

    if (!fullName || !email) {
      return res.status(400).json({ error: "fullName and email are required" });
    }

    const instructor = await prisma.$transaction(async (tx) => {
      let userId = null;

      if (canLogin) {
        if (!password) {
          throw new Error("Password is required if login is enabled");
        }

        const existingUser = await tx.user.findUnique({ where: { email } });
        if (existingUser) {
          throw new Error("A user with this email already exists");
        }

        const passwordHash = await argon2.hash(password);
        const user = await tx.user.create({
          data: {
            email,
            passwordHash,
          }
        });

        const instructorRole = await tx.role.findUnique({ where: { name: "INSTRUCTOR" } });
        if (instructorRole) {
          await tx.userRole.create({
            data: {
              userId: user.id,
              roleId: instructorRole.id,
            }
          });
        }
        userId = user.id;
      }

      return await tx.instructor.create({
        data: {
          fullName,
          email,
          phone: phone || null,
          bio: bio || null,
          city: city || null,
          state: state || null,
          isActive,
          canLogin,
          userId
        },
      });
    });

    sendEmailSafely(
      notifyAdminRegistration({
        role: canLogin ? "instructor account created by admin" : "instructor record created by admin",
        name: instructor.fullName,
        email: instructor.email,
        phone: instructor.phone,
      }),
      "admin-created instructor"
    );
    return res.status(201).json({ instructor });
  } catch (err) {
    console.error("POST /instructors error:", err);
    return res.status(500).json({ error: err.message || "Failed to create instructor" });
  }
});

/**
 * Super admin account-access toggle. Internal profile details use /admin/instructors/:id.
 */
router.patch("/:id", requireAuth, requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive, canLogin } = req.body || {};

    const existing = await prisma.instructor.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!existing) return res.status(404).json({ error: "Instructor not found" });
    if (typeof isActive !== "boolean" && typeof canLogin !== "boolean") {
      return res.status(400).json({ error: "Account access update is required" });
    }

    if (canLogin === true && existing.approvalStatus !== "APPROVED") {
      return res.status(409).json({ error: "Approve the instructor account before enabling login" });
    }
    const instructor = await prisma.$transaction(async (tx) => {
      const updated = await tx.instructor.update({
        where: { id },
        data: { isActive, canLogin },
      });
      if (existing.userId && isActive === false) {
        await tx.refreshToken.deleteMany({ where: { userId: existing.userId } });
      }
      return updated;
    });

    return res.json({ instructor });
  } catch (err) {
    console.error("PATCH /instructors error:", err);
    return res.status(500).json({ error: "Failed to update instructor" });
  }
});

/**
 * Super admin: assign student
 */
router.post("/:id/assignments/students", requireAuth, requireSuperAdmin, async (req, res) => {
  try {
    const { id: instructorId } = req.params;
    const { studentId } = req.body;

    if (!studentId) return res.status(400).json({ error: "studentId required" });

    const assignment = await prisma.instructorStudentAssignment.upsert({
      where: {
        instructorId_studentId: {
          instructorId,
          studentId
        }
      },
      update: {},
      create: {
        instructorId,
        studentId,
        assignedByUserId: req.auth.userId,
      }
    });

    return res.json({ assignment });
  } catch (err) {
    console.error("Assignment error:", err);
    return res.status(500).json({ error: "Failed to assign student" });
  }
});

/**
 * Super admin: unassign student
 */
router.delete("/:id/assignments/students/:studentId", requireAuth, requireSuperAdmin, async (req, res) => {
  try {
    const { id: instructorId, studentId } = req.params;

    await prisma.instructorStudentAssignment.delete({
      where: {
        instructorId_studentId: {
          instructorId,
          studentId
        }
      }
    });

    return res.json({ success: true });
  } catch (err) {
    console.error("Unassignment error:", err);
    return res.status(500).json({ error: "Failed to unassign student" });
  }
});

/**
 * Super admin: get assigned students for an instructor
 */
router.get("/:id/assignments/students", requireAuth, requireSuperAdmin, async (req, res) => {
  try {
    const { id: instructorId } = req.params;

    const assignments = await prisma.instructorStudentAssignment.findMany({
      where: { instructorId },
      include: {
        student: true
      }
    });

    return res.json({
      students: assignments.map(a => a.student)
    });
  } catch (err) {
    console.error("Fetch assignments error:", err);
    return res.status(500).json({ error: "Failed to fetch assignments" });
  }
});

router.put("/:id/assignments/centers", requireAuth, requireSuperAdmin, async (req, res) => {
  try {
    const instructor = await prisma.instructor.findUnique({ where: { id: req.params.id } });
    if (!instructor) return res.status(404).json({ error: "Instructor not found" });
    const assignments = Array.isArray(req.body?.assignments) ? req.body.assignments : [];
    const centerIds = [...new Set(assignments.map((item) => String(item.trainingCenterId || "")).filter(Boolean))];
    const existingCenters = await prisma.trainingCenter.findMany({
      where: { id: { in: centerIds }, status: "ACTIVE" },
      select: { id: true },
    });
    if (existingCenters.length !== centerIds.length) {
      return res.status(400).json({ error: "One or more training centers are invalid or inactive" });
    }

    await prisma.$transaction(async (tx) => {
      await tx.instructorTrainingCenterAssignment.deleteMany({
        where: { instructorId: instructor.id },
      });
      if (assignments.length) {
        await tx.instructorTrainingCenterAssignment.createMany({
          data: assignments.map((assignment) => ({
            instructorId: instructor.id,
            trainingCenterId: String(assignment.trainingCenterId),
            canViewStudents: assignment.canViewStudents !== false,
            canManageAttendance: assignment.canManageAttendance === true,
            canManageGrading: assignment.canManageGrading === true,
            canManageClasses: assignment.canManageClasses === true,
            assignedByUserId: req.auth.userId,
          })),
        });
      }
    });
    return res.json({ ok: true });
  } catch (error) {
    console.error("PUT /instructors/:id/assignments/centers error:", error);
    return res.status(500).json({ error: "Failed to update training center responsibilities" });
  }
});

router.get("/me/public-profile", requireAuth, async (req, res) => {
  try {
    const instructor = await getAuthenticatedInstructor(req);
    if (!instructor) return res.status(404).json({ error: "Instructor profile not found" });
    return res.json({ publicProfile: serializeInstructorPublicProfile(instructor) });
  } catch (error) {
    console.error("GET /instructors/me/public-profile error:", error);
    return res.status(500).json({ error: "Failed to load public profile" });
  }
});

router.patch("/me/public-profile", requireAuth, async (req, res) => {
  try {
    const instructor = await prisma.instructor.findUnique({ where: { userId: req.auth.userId } });
    if (!instructor) return res.status(404).json({ error: "Instructor profile not found" });

    const owned = parseInstructorOwnedPublicProfile(req.body);
    if (owned.publicPhotoUrl && !owned.publicPhotoUrl.includes(`/instructors/public/${instructor.id}.`)) {
      return res.status(400).json({ error: "Upload your public photo through the instructor profile uploader" });
    }
    const publicDisplayName = owned.publicDisplayName || instructor.fullName;
    const publicSlug = instructor.publicSlug || await ensureUniqueInstructorPublicSlug(
      prisma,
      instructor.id,
      publicDisplayName,
    );
    const changedAfterSubmission = ["READY_FOR_REVIEW", "CHANGES_REQUESTED"].includes(instructor.publicReviewStatus);
    const updated = await prisma.instructor.update({
      where: { id: instructor.id },
      data: {
        ...owned,
        publicDisplayName,
        publicSlug,
        publicReviewStatus: changedAfterSubmission ? "DRAFT" : undefined,
        publicChangesRequestedNote: changedAfterSubmission ? null : undefined,
        publicUpdatedAt: new Date(),
      },
    });
    return res.json({ publicProfile: serializeInstructorPublicProfile(updated) });
  } catch (error) {
    console.error("PATCH /instructors/me/public-profile error:", error);
    const response = publicProfileErrorResponse(error, "Failed to save public profile");
    return res.status(response.status).json({ error: response.message });
  }
});

router.post("/me/public-profile/submit-review", requireAuth, async (req, res) => {
  try {
    const instructor = await prisma.instructor.findUnique({ where: { userId: req.auth.userId } });
    if (!instructor) return res.status(404).json({ error: "Instructor profile not found" });
    const completion = getInstructorPublicProfileCompletion(instructor);
    if (!completion.isReadyForReview) {
      return res.status(409).json({
        error: `Complete your public profile before submitting. Missing: ${completion.missing.join(", ")}.`,
        completion,
      });
    }
    const updated = await prisma.instructor.update({
      where: { id: instructor.id },
      data: {
        publicReviewStatus: "READY_FOR_REVIEW",
        publicReviewSubmittedAt: new Date(),
        publicChangesRequestedNote: null,
        publicUpdatedAt: new Date(),
      },
    });
    return res.json({ publicProfile: serializeInstructorPublicProfile(updated) });
  } catch (error) {
    console.error("POST /instructors/me/public-profile/submit-review error:", error);
    return res.status(500).json({ error: "Failed to submit public profile for review" });
  }
});

/**
 * Super admin can explicitly publish or unpublish an instructor profile.
 * Public copy fields are intentionally separate from operational profile fields.
 */
router.patch("/:id/public-profile", requireAuth, requireSuperAdmin, async (req, res) => {
  try {
    const existing = await prisma.instructor.findUnique({
      where: { id: req.params.id },
    });
    if (!existing) return res.status(404).json({ error: "Instructor not found" });

    const data = parsePublicProfilePayload(req.body);
    const requestChanges = req.body?.requestChanges === true;
    const changesRequestedNote = requestChanges
      ? String(req.body?.changesRequestedNote || "").trim().slice(0, 1000)
      : null;
    if (requestChanges && !changesRequestedNote) {
      return res.status(400).json({ error: "Please explain what the instructor needs to complete" });
    }

    const completion = getInstructorPublicProfileCompletion(existing);
    if (data.publicProfileEnabled) {
      if (!existing.isActive) {
        return res.status(409).json({ error: "Only active instructors can be published" });
      }
      if (!completion.isReadyForReview) {
        return res.status(409).json({
          error: `This profile is not ready for public publishing. Missing: ${completion.missing.join(", ")}.`,
          completion,
        });
      }
      if (existing.publicReviewStatus !== "READY_FOR_REVIEW" && !existing.publicProfileEnabled) {
        return res.status(409).json({ error: "The instructor must submit the completed profile for review first" });
      }
    }

    const now = new Date();
    const publicSlug = existing.publicSlug || await ensureUniqueInstructorPublicSlug(
      prisma,
      existing.id,
      existing.publicDisplayName || existing.fullName,
    );
    await prisma.instructor.update({
      where: { id: existing.id },
      data: {
        ...data,
        publicSlug,
        publicReviewStatus: requestChanges
          ? "CHANGES_REQUESTED"
          : data.publicProfileEnabled
            ? "PUBLISHED"
            : existing.publicReviewStatus === "PUBLISHED"
              ? "READY_FOR_REVIEW"
              : undefined,
        publicChangesRequestedNote: requestChanges ? changesRequestedNote : undefined,
        publicProfileEnabled: requestChanges ? false : data.publicProfileEnabled,
        publicApprovedByUserId: data.publicProfileEnabled ? req.auth.userId : undefined,
        publicApprovedAt: data.publicProfileEnabled ? now : undefined,
        publicUpdatedAt: now,
      },
    });

    const updated = await prisma.instructor.findUnique({ where: { id: existing.id } });
    return res.json({ publicProfile: serializeInstructorPublicProfile(updated) });
  } catch (error) {
    console.error("PATCH /instructors/:id/public-profile error:", error);
    const response = publicProfileErrorResponse(error, "Failed to update public profile");
    return res.status(response.status).json({ error: response.message });
  }
});

router.delete("/:id", requireAuth, requireSuperAdmin, async (req, res) => {
  try {
    const existing = await prisma.instructor.findUnique({
      where: { id: req.params.id },
      include: {
        user: {
          include: {
            student: { select: { id: true } },
            adminUser: { select: { id: true } },
            userRoles: { include: { role: { select: { name: true } } } },
          },
        },
      },
    });
    if (!existing) return res.status(404).json({ error: "Instructor not found" });
    await prisma.$transaction(async (tx) => {
      await tx.instructor.delete({ where: { id: existing.id } });
      if (!existing.userId || !existing.user) return;

      const hasOtherProfile = Boolean(existing.user.student || existing.user.adminUser);
      const otherRoles = existing.user.userRoles.filter(({ role }) => role.name !== "INSTRUCTOR");
      if (!hasOtherProfile && otherRoles.length === 0) {
        await tx.user.delete({ where: { id: existing.userId } });
        return;
      }

      const instructorRole = existing.user.userRoles.find(({ role }) => role.name === "INSTRUCTOR");
      if (instructorRole) {
        await tx.userRole.delete({
          where: {
            userId_roleId: {
              userId: existing.userId,
              roleId: instructorRole.roleId,
            },
          },
        });
      }
    });
    return res.json({ ok: true });
  } catch (error) {
    console.error("DELETE /instructors/:id error:", error);
    return res.status(500).json({ error: "Failed to delete instructor" });
  }
});

export default router;
