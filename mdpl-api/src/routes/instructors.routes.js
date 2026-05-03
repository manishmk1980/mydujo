import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

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
        email: i.email,
        phone: i.phone,
        profilePhotoUrl: i.profilePhotoUrl
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
    const instructor = await prisma.instructor.findUnique({
      where: { userId: req.auth.userId },
    });

    if (!instructor) {
      return res.status(404).json({ error: "Instructor profile not found" });
    }

    return res.json({ instructor });
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
    const instructor = await prisma.instructor.findUnique({
      where: { userId: req.auth.userId }
    });
    if (!instructor) return res.status(404).json({ error: "Instructor not found" });

    const assignments = await prisma.instructorStudentAssignment.findMany({
      where: { instructorId: instructor.id },
      include: {
        student: {
          include: {
            gradingProgress: true
          }
        }
      }
    });

    return res.json({
      students: assignments.map(a => a.student)
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
    const instructor = await prisma.instructor.findUnique({
      where: { userId: req.auth.userId }
    });

    if (!instructor) return res.status(404).json({ error: "Instructor not found" });

    const [studentsCount, classesCount, pendingAttendance] = await Promise.all([
      prisma.instructorStudentAssignment.count({ where: { instructorId: instructor.id } }),
      prisma.classSession.count({ where: { instructorId: instructor.id } }),
      prisma.attendance.count({
        where: {
          status: 'pending',
          classSession: { instructorId: instructor.id }
        }
      })
    ]);

    return res.json({
      studentsCount,
      classesCount,
      pendingAttendance,
      pendingGrading: 0
    });
  } catch (err) {
    console.error("Dashboard stats error:", err);
    return res.status(500).json({ error: "Failed to fetch stats" });
  }
});

/**
 * Super admin can fetch all instructors with stats
 */
router.get("/admin/all", requireAuth, requireSuperAdmin, async (req, res) => {
  try {
    const instructors = await prisma.instructor.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
          }
        },
        _count: {
          select: {
            assignments: true,
            classSessions: true,
          }
        }
      },
      orderBy: { fullName: "asc" },
    });

    return res.json({
      instructors: instructors.map(i => ({
        ...i,
        _count: {
          students: i._count.assignments,
          classes: i._count.classSessions,
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

    return res.status(201).json({ instructor });
  } catch (err) {
    console.error("POST /instructors error:", err);
    return res.status(500).json({ error: err.message || "Failed to create instructor" });
  }
});

/**
 * Super admin can update instructors
 */
router.patch("/:id", requireAuth, requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      fullName,
      email,
      phone,
      bio,
      city,
      state,
      isActive,
      canLogin
    } = req.body || {};

    const existing = await prisma.instructor.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!existing) return res.status(404).json({ error: "Instructor not found" });

    const instructor = await prisma.$transaction(async (tx) => {
      // If enabling login for the first time and user doesn't exist...
      // For now, let's keep it simple: profile update only.
      // Complex user management can be handled in a dedicated route if needed.

      return await tx.instructor.update({
        where: { id },
        data: {
          fullName,
          email,
          phone,
          bio,
          city,
          state,
          isActive,
          canLogin
        }
      });
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
        studentId
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

export default router;
