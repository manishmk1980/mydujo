import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

function toIso(dt) {
  return dt ? new Date(dt).toISOString() : null;
}

function toDateOnlyIso(dt) {
  if (!dt) return null;
  return new Date(dt).toISOString().slice(0, 10);
}

function serializeAttendance(a) {
  return {
    id: a.id,
    student_id: a.studentId,
    class_session_id: a.classSessionId,
    attendance_date: toDateOnlyIso(a.attendanceDate),
    check_in_time: toIso(a.checkInTime),
    check_out_time: toIso(a.checkOutTime),
    status: a.status,
    source: a.source,
    notes: a.notes,
    validated_at: toIso(a.validatedAt),
    validated_by: a.validatedBy,
    created_at: toIso(a.createdAt),
    updated_at: toIso(a.updatedAt),
    class_session: a.classSession
      ? {
        id: a.classSession.id,
        title: a.classSession.title,
        class_type: a.classSession.classType,
        session_date: toDateOnlyIso(a.classSession.sessionDate),
        start_time: toIso(a.classSession.startTime),
        end_time: toIso(a.classSession.endTime),
        status: a.classSession.status,
      }
      : null,
    student: a.student
      ? {
        id: a.student.id,
        full_name: a.student.fullName,
        email: a.student.email,
      }
      : null,
  };
}

function parseOptionalDateTime(value) {
  if (value == null || value === "") return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function parseRequiredDate(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

// Student/admin create attendance log
router.post("/", requireAuth, async (req, res) => {
  try {
    const b = req.body || {};

    if (!b.student_id) {
      return res.status(400).json({ error: "student_id is required" });
    }

    const attendanceDate = parseRequiredDate(b.attendance_date);
    if (!attendanceDate) {
      return res.status(400).json({ error: "attendance_date is required" });
    }

    const row = await prisma.attendance.create({
      data: {
        studentId: b.student_id,
        classSessionId: b.class_session_id || null,
        attendanceDate,
        checkInTime: parseOptionalDateTime(b.check_in_time),
        checkOutTime: parseOptionalDateTime(b.check_out_time),
        status: "pending",
        source: b.source || "student",
        notes: b.notes || null,
      },
      include: {
        classSession: true,
      },
    });

    return res.status(201).json({ attendance: serializeAttendance(row) });
  } catch (err) {
    console.error("POST /attendance error:", err);
    return res.status(500).json({ error: "Failed to create attendance" });
  }
});

// Student/admin view attendance by student
router.get("/student/:studentId", requireAuth, async (req, res) => {
  try {
    const { studentId } = req.params;

    const rows = await prisma.attendance.findMany({
      where: { studentId },
      orderBy: { attendanceDate: "desc" },
      include: {
        classSession: true,
      },
    });

    return res.json({ attendance: rows.map(serializeAttendance) });
  } catch (err) {
    console.error("GET /attendance/student/:studentId error:", err);
    return res.status(500).json({ error: "Failed to fetch attendance" });
  }
});

// Instructor view attendance for their assigned classes/students
router.get("/instructor", requireAuth, async (req, res) => {
  try {
    const instructor = await prisma.instructor.findUnique({
      where: { userId: req.auth.userId }
    });

    if (!instructor) return res.status(404).json({ error: "Instructor not found" });

    const rows = await prisma.attendance.findMany({
      where: {
        OR: [
          { classSession: { instructorId: instructor.id } },
          { student: { instructorAssignments: { some: { instructorId: instructor.id } } } }
        ]
      },
      orderBy: { attendanceDate: "desc" },
      include: {
        classSession: true,
        student: true,
      },
    });

    return res.json({ attendance: rows.map(serializeAttendance) });
  } catch (err) {
    console.error("GET /attendance/instructor error:", err);
    return res.status(500).json({ error: "Failed to fetch attendance" });
  }
});

// Admin approves/rejects attendance
router.patch("/:id/status", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body || {};

    const allowed = new Set(["pending", "approved", "rejected"]);
    if (!status || !allowed.has(status)) {
      return res.status(400).json({
        error: "Invalid status. Allowed values: pending, approved, rejected",
      });
    }

    const existing = await prisma.attendance.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ error: "Attendance record not found" });
    }

    const updated = await prisma.attendance.update({
      where: { id },
      data: {
        status,
        validatedAt: new Date(),
        validatedBy: req.auth.userId,
      },
      include: {
        classSession: true,
      },
    });

    return res.json({
      message: `Attendance status updated to ${status}`,
      attendance: serializeAttendance(updated),
    });
  } catch (err) {
    console.error("PATCH /attendance/:id/status error:", err);
    return res.status(500).json({ error: "Failed to update attendance status" });
  }
});

export default router;
