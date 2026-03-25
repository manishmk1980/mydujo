import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

function isRecoverableAttendanceReadError(err) {
  if (!err) return false;
  const code = typeof err.code === "string" ? err.code : "";
  const msg = typeof err.message === "string" ? err.message.toLowerCase() : "";

  // Schema drift / missing table-column issues should not break student UI.
  if (code === "P2021" || code === "P2022") return true;
  if (msg.includes("doesn't exist") || msg.includes("does not exist")) return true;
  if (msg.includes("unknown column")) return true;
  if (msg.includes("no such table")) return true;

  return false;
}

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
    student_id: a.student_id,
    student_name: a.student_name ?? null,
    class_id: a.class_id,
    class_name: a.class_name,
    date: toDateOnlyIso(a.date),
    status: a.status,
    created_at: toIso(a.created_at),
  };
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

    const date = parseRequiredDate(b.date || b.attendance_date);
    if (!date) {
      return res.status(400).json({ error: "date (or attendance_date) is required" });
    }

    const class_id = b.class_id || b.class_session_id || "default";
    const class_name = b.class_name || b.class_session_name || "Session";
    const status = ["present", "absent"].includes(b.status) ? b.status : "present";

    const row = await prisma.attendance.create({
      data: {
        student_id: b.student_id,
        student_name: b.student_name ?? null,
        class_id,
        class_name,
        date,
        status,
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
      where: { student_id: studentId },
      orderBy: { date: "desc" },
    });

    return res.json({ attendance: rows.map(serializeAttendance) });
  } catch (err) {
    if (isRecoverableAttendanceReadError(err)) {
      console.warn("GET /attendance/student/:studentId recoverable error:", err.message);
      return res.json({ attendance: [] });
    }
    console.error("GET /attendance/student/:studentId error:", err);
    return res.status(500).json({ error: "Failed to fetch attendance" });
  }
});

// Instructor view attendance - simplified (no class_session relation in schema)
router.get("/instructor", requireAuth, async (req, res) => {
  try {
    const instructor = await prisma.instructors.findFirst({
      where: { user_id: req.auth.userId },
    });

    if (!instructor) return res.status(404).json({ error: "Instructor not found" });

    // Without instructor-student assignment relation, return empty or all for now
    const rows = await prisma.attendance.findMany({
      orderBy: { date: "desc" },
      take: 100,
    });

    return res.json({ attendance: rows.map(serializeAttendance) });
  } catch (err) {
    if (isRecoverableAttendanceReadError(err)) {
      console.warn("GET /attendance/instructor recoverable error:", err.message);
      return res.json({ attendance: [] });
    }
    console.error("GET /attendance/instructor error:", err);
    return res.status(500).json({ error: "Failed to fetch attendance" });
  }
});

// Admin patch attendance status - migration schema has present/absent only
router.patch("/:id/status", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body || {};

    const allowed = new Set(["present", "absent"]);
    if (!status || !allowed.has(status)) {
      return res.status(400).json({
        error: "Invalid status. Allowed values: present, absent",
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
      data: { status },
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
