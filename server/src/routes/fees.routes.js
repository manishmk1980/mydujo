import { Router } from "express";
import crypto from "node:crypto";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
import { createNotification, notifyAdmins } from "../services/notifications.js";

const router = Router();

const ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN"];
const STUDENT_ROLES = ["STUDENT"];

const FEE_REQUEST_STATUS = new Set(["DRAFT", "ISSUED", "OVERDUE", "PAID", "CANCELLED"]);
const SUBMISSION_STATUS = new Set(["SUBMITTED", "NEEDS_INFO", "VERIFIED", "REJECTED", "CANCELLED"]);
const METHODS = new Set(["UPI", "CASH", "BANK_TRANSFER", "CHEQUE", "OTHER"]);
const REF_REQUIRED = new Set(["UPI", "BANK_TRANSFER", "CHEQUE"]);

function toIso(dt) {
  return dt ? new Date(dt).toISOString() : null;
}

function toDateOnlyIso(dt) {
  if (!dt) return null;
  const d = new Date(dt);
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}

function parseOptionalDate(value) {
  if (value == null || value === "") return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function parseDateOnly(value) {
  if (value == null || value === "") return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  const iso = d.toISOString().slice(0, 10);
  return new Date(`${iso}T00:00:00.000Z`);
}

function monthRangeFromDate(dt) {
  const d = new Date(dt);
  if (Number.isNaN(d.getTime())) return null;
  const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
  const end = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1));
  return { start, end };
}

async function findDuplicateMonthlyFeeRequest({ studentId, dueDate, excludeId = null }) {
  const range = monthRangeFromDate(dueDate);
  if (!range) return null;
  return prisma.fee_requests.findFirst({
    where: {
      student_id: String(studentId),
      due_date: {
        gte: range.start,
        lt: range.end,
      },
      ...(excludeId ? { id: { not: String(excludeId) } } : {}),
    },
    select: { id: true, title: true, due_date: true, status: true },
  });
}

function parseIntSafe(v) {
  if (v == null || v === "") return null;
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  return Math.trunc(n);
}

function computeFeeStatus(row) {
  if (!row) return null;
  if (row.status === "ISSUED") {
    const due = row.due_date ? new Date(row.due_date) : null;
    if (due) {
      const today = new Date();
      const todayDateOnly = new Date(today.toISOString().slice(0, 10) + "T00:00:00.000Z");
      if (due < todayDateOnly) return "OVERDUE";
    }
  }
  return row.status;
}

function serializeFeeRequest(r) {
  const computedStatus = computeFeeStatus(r);
  const studentName = r.students?.full_name ?? null;
  const studentEmail = r.students?.email ?? null;
  const createdByEmail = r.created_by?.email ?? null;
  return {
    id: r.id,
    student_id: r.student_id,
    studentId: r.student_id,
    training_center_id: r.training_center_id ?? null,
    trainingCenterId: r.training_center_id ?? null,
    title: r.title,
    description: r.description ?? null,
    amount_paise: r.amount_paise,
    amountPaise: r.amount_paise,
    currency: r.currency,
    due_date: toDateOnlyIso(r.due_date),
    dueDate: toDateOnlyIso(r.due_date),
    status: r.status,
    computed_status: computedStatus,
    computedStatus,
    issued_at: toIso(r.issued_at),
    issuedAt: toIso(r.issued_at),
    created_by_user_id: r.created_by_user_id,
    createdByUserId: r.created_by_user_id,
    created_by_email: createdByEmail,
    createdByEmail: createdByEmail,
    student_name: studentName,
    studentName,
    student_email: studentEmail,
    studentEmail,
    created_at: toIso(r.created_at),
    createdAt: toIso(r.created_at),
    updated_at: toIso(r.updated_at),
    updatedAt: toIso(r.updated_at),
  };
}

function serializeSubmission(s) {
  return {
    id: s.id,
    fee_request_id: s.fee_request_id,
    feeRequestId: s.fee_request_id,
    student_id: s.student_id,
    studentId: s.student_id,
    submitted_by_user_id: s.submitted_by_user_id ?? null,
    submittedByUserId: s.submitted_by_user_id ?? null,
    method: s.method,
    amount_paise: s.amount_paise,
    amountPaise: s.amount_paise,
    paid_at: toIso(s.paid_at),
    paidAt: toIso(s.paid_at),
    reference: s.reference ?? null,
    proof_url: s.proof_url ?? null,
    proofUrl: s.proof_url ?? null,
    notes_from_student: s.notes_from_student ?? null,
    notesFromStudent: s.notes_from_student ?? null,
    status: s.status,
    reviewed_by_user_id: s.reviewed_by_user_id ?? null,
    reviewedByUserId: s.reviewed_by_user_id ?? null,
    reviewed_at: toIso(s.reviewed_at),
    reviewedAt: toIso(s.reviewed_at),
    review_notes: s.review_notes ?? null,
    reviewNotes: s.review_notes ?? null,
    created_at: toIso(s.created_at),
    createdAt: toIso(s.created_at),
    updated_at: toIso(s.updated_at),
    updatedAt: toIso(s.updated_at),
  };
}

async function requireStudentRow(req) {
  const userId = req.auth.userId;
  const student = await prisma.students.findFirst({
    where: { user_id: userId },
    select: { id: true, user_id: true, status: true, training_center_id: true },
  });
  return student || null;
}

function validateMethod(method) {
  const m = String(method || "").trim().toUpperCase();
  if (!METHODS.has(m)) return null;
  return m;
}

function validateStatus(status, allowed) {
  const s = String(status || "").trim().toUpperCase();
  if (!allowed.has(s)) return null;
  return s;
}

async function safeCreateNotification(payload, contextLabel) {
  try {
    await createNotification(payload);
  } catch (err) {
    console.warn(`${contextLabel}: notification failed`, err);
  }
}

async function safeNotifyAdmins(payload, contextLabel) {
  try {
    await notifyAdmins(payload);
  } catch (err) {
    console.warn(`${contextLabel}: admin notification failed`, err);
  }
}

// =========================
// Admin endpoints
// =========================

// POST /fees/requests
router.post("/requests", requireAuth, requireRole(ADMIN_ROLES), async (req, res) => {
  try {
    const b = req.body || {};
    const studentId = b.student_id ?? b.studentId ?? null;
    const trainingCenterId = b.training_center_id ?? b.trainingCenterId ?? null;
    const title = b.title != null ? String(b.title).trim() : "";
    const description = b.description != null && String(b.description).trim() !== "" ? String(b.description).trim() : null;
    const amountPaise = parseIntSafe(b.amount_paise ?? b.amountPaise);
    const dueDate = parseDateOnly(b.due_date ?? b.dueDate);
    const status = b.status ? validateStatus(b.status, FEE_REQUEST_STATUS) : "DRAFT";

    if (!studentId) return res.status(400).json({ error: "student_id is required" });
    if (!title) return res.status(400).json({ error: "title is required" });
    if (amountPaise == null || amountPaise <= 0) return res.status(400).json({ error: "amount_paise must be > 0" });
    if (!dueDate) return res.status(400).json({ error: "due_date is required (YYYY-MM-DD)" });
    if (!status) return res.status(400).json({ error: "Invalid status" });

    const existsStudent = await prisma.students.findUnique({ where: { id: String(studentId) }, select: { id: true, user_id: true } });
    if (!existsStudent) return res.status(404).json({ error: "Student not found" });
    const duplicate = await findDuplicateMonthlyFeeRequest({ studentId: existsStudent.id, dueDate });
    if (duplicate) {
      return res.status(409).json({
        error: `Fee request already exists for ${toDateOnlyIso(duplicate.due_date)?.slice(0, 7)}. Delete it before creating a new one.`,
      });
    }

    const id = crypto.randomUUID();
    const issuedAt = status === "ISSUED" ? new Date() : null;
    const now = new Date();
    const row = await prisma.fee_requests.create({
      data: {
        id,
        student_id: String(studentId),
        training_center_id: trainingCenterId ? String(trainingCenterId) : null,
        title,
        description,
        amount_paise: amountPaise,
        currency: "INR",
        due_date: dueDate,
        status,
        issued_at: issuedAt,
        created_by_user_id: req.auth.userId,
        updated_at: now,
      },
    });

    if (row.status === "ISSUED" && existsStudent.user_id) {
      await safeCreateNotification({
        userId: existsStudent.user_id,
        type: "FEE_REQUEST_ISSUED",
        title: "Fee request issued",
        message: `${row.title} for ₹${(row.amount_paise / 100).toFixed(2)} is due on ${toDateOnlyIso(row.due_date)}.`,
        entityType: "fee_request",
        entityId: row.id,
      }, "POST /fees/requests");
    }

    return res.status(201).json({ fee_request: serializeFeeRequest(row) });
  } catch (err) {
    console.error("POST /fees/requests error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /fees/requests/bulk
router.post("/requests/bulk", requireAuth, requireRole(ADMIN_ROLES), async (req, res) => {
  try {
    const b = req.body || {};
    const trainingCenterId = b.training_center_id ?? b.trainingCenterId ?? null;
    const title = b.title != null ? String(b.title).trim() : "";
    const description = b.description != null && String(b.description).trim() !== "" ? String(b.description).trim() : null;
    const amountPaise = parseIntSafe(b.amount_paise ?? b.amountPaise);
    const dueDate = parseDateOnly(b.due_date ?? b.dueDate);
    const issueNow = b.issue_now ?? b.issueNow ?? false;

    if (!title) return res.status(400).json({ error: "title is required" });
    if (amountPaise == null || amountPaise <= 0) return res.status(400).json({ error: "amount_paise must be > 0" });
    if (!dueDate) return res.status(400).json({ error: "due_date is required (YYYY-MM-DD)" });

    const students = await prisma.students.findMany({
      where: {
        ...(trainingCenterId ? { training_center_id: String(trainingCenterId) } : {}),
        status: "approved",
      },
      select: { id: true, user_id: true, training_center_id: true },
    });

    const now = new Date();
    const created = [];
    let skippedDuplicateCount = 0;
    for (const s of students) {
      const duplicate = await findDuplicateMonthlyFeeRequest({ studentId: s.id, dueDate });
      if (duplicate) {
        skippedDuplicateCount += 1;
        continue;
      }
      const row = await prisma.fee_requests.create({
        data: {
          id: crypto.randomUUID(),
          student_id: s.id,
          training_center_id: s.training_center_id ?? null,
          title,
          description,
          amount_paise: amountPaise,
          currency: "INR",
          due_date: dueDate,
          status: issueNow ? "ISSUED" : "DRAFT",
          issued_at: issueNow ? now : null,
          created_by_user_id: req.auth.userId,
          updated_at: now,
        },
      });
      created.push(row);

      if (issueNow && s.user_id) {
        await safeCreateNotification({
          userId: s.user_id,
          type: "FEE_REQUEST_ISSUED",
          title: "Fee request issued",
          message: `${row.title} for ₹${(row.amount_paise / 100).toFixed(2)} is due on ${toDateOnlyIso(row.due_date)}.`,
          entityType: "fee_request",
          entityId: row.id,
        }, "POST /fees/requests/bulk");
      }
    }

    return res.status(201).json({
      count: created.length,
      skipped_duplicates: skippedDuplicateCount,
      fee_requests: created.map(serializeFeeRequest),
    });
  } catch (err) {
    console.error("POST /fees/requests/bulk error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /fees/requests
router.get("/requests", requireAuth, requireRole(ADMIN_ROLES), async (req, res) => {
  try {
    const q = req.query || {};
    const statusRaw = q.status;
    const status = statusRaw ? validateStatus(statusRaw, FEE_REQUEST_STATUS) : null;
    const studentId = q.student_id ?? q.studentId ?? null;
    const trainingCenterId = q.training_center_id ?? q.trainingCenterId ?? null;
    const dueFrom = parseDateOnly(q.due_from ?? q.dueFrom);
    const dueTo = parseDateOnly(q.due_to ?? q.dueTo);

    const where = {};
    if (studentId) where.student_id = String(studentId);
    if (trainingCenterId) where.training_center_id = String(trainingCenterId);
    if (status) {
      if (status === "OVERDUE") {
        const today = new Date();
        const todayDateOnly = new Date(today.toISOString().slice(0, 10) + "T00:00:00.000Z");
        where.status = "ISSUED";
        where.due_date = { lt: todayDateOnly };
      } else {
        where.status = status;
      }
    }
    if (dueFrom || dueTo) {
      where.due_date = {
        ...(where.due_date || {}),
        ...(dueFrom ? { gte: dueFrom } : {}),
        ...(dueTo ? { lte: dueTo } : {}),
      };
    }

    const rows = await prisma.fee_requests.findMany({
      where,
      include: {
        students: { select: { full_name: true, email: true } },
        created_by: { select: { email: true } },
      },
      orderBy: [{ due_date: "desc" }, { created_at: "desc" }],
      take: 500,
    });
    return res.json({ fee_requests: rows.map(serializeFeeRequest) });
  } catch (err) {
    console.error("GET /fees/requests error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /fees/requests/:id
router.patch("/requests/:id", requireAuth, requireRole(ADMIN_ROLES), async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.fee_requests.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "Fee request not found" });

    const b = req.body || {};
    const data = {};

    if (b.title !== undefined) data.title = String(b.title).trim();
    if (b.description !== undefined) data.description = b.description != null && String(b.description).trim() !== "" ? String(b.description).trim() : null;
    if (b.amount_paise !== undefined || b.amountPaise !== undefined) {
      const amountPaise = parseIntSafe(b.amount_paise ?? b.amountPaise);
      if (amountPaise == null || amountPaise <= 0) return res.status(400).json({ error: "amount_paise must be > 0" });
      if (existing.status === "PAID") return res.status(400).json({ error: "Cannot edit amount for PAID fee request" });
      data.amount_paise = amountPaise;
    }
    if (b.due_date !== undefined || b.dueDate !== undefined) {
      const dueDate = parseDateOnly(b.due_date ?? b.dueDate);
      if (!dueDate) return res.status(400).json({ error: "Invalid due_date" });
      if (existing.status === "PAID") return res.status(400).json({ error: "Cannot edit due_date for PAID fee request" });
      const duplicate = await findDuplicateMonthlyFeeRequest({ studentId: existing.student_id, dueDate, excludeId: existing.id });
      if (duplicate) {
        return res.status(409).json({
          error: `Another fee request already exists for ${toDateOnlyIso(duplicate.due_date)?.slice(0, 7)}. Delete it before changing month.`,
        });
      }
      data.due_date = dueDate;
    }
    if (b.status !== undefined) {
      const status = validateStatus(b.status, FEE_REQUEST_STATUS);
      if (!status) return res.status(400).json({ error: "Invalid status" });
      if (existing.status === "PAID" && status !== "PAID") {
        return res.status(400).json({ error: "Cannot change status of a PAID fee request" });
      }
      data.status = status;
      if (existing.status !== "ISSUED" && status === "ISSUED") {
        data.issued_at = new Date();
      }
    }

    data.updated_at = new Date();
    const updated = await prisma.fee_requests.update({ where: { id }, data });

    if (existing.status !== "ISSUED" && updated.status === "ISSUED") {
      const student = await prisma.students.findUnique({ where: { id: updated.student_id }, select: { user_id: true } });
      if (student?.user_id) {
        await safeCreateNotification({
          userId: student.user_id,
          type: "FEE_REQUEST_ISSUED",
          title: "Fee request issued",
          message: `${updated.title} for ₹${(updated.amount_paise / 100).toFixed(2)} is due on ${toDateOnlyIso(updated.due_date)}.`,
          entityType: "fee_request",
          entityId: updated.id,
        }, "PATCH /fees/requests/:id");
      }
    }

    return res.json({ fee_request: serializeFeeRequest(updated) });
  } catch (err) {
    console.error("PATCH /fees/requests/:id error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /fees/requests/:id
router.delete("/requests/:id", requireAuth, requireRole(ADMIN_ROLES), async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.fee_requests.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "Fee request not found" });
    await prisma.fee_requests.delete({ where: { id } });
    return res.json({ ok: true, deleted_id: id });
  } catch (err) {
    console.error("DELETE /fees/requests/:id error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /fees/submissions
router.get("/submissions", requireAuth, requireRole(ADMIN_ROLES), async (req, res) => {
  try {
    const q = req.query || {};
    const statusRaw = q.status;
    const status = statusRaw ? validateStatus(statusRaw, SUBMISSION_STATUS) : null;
    const studentId = q.student_id ?? q.studentId ?? null;
    const feeRequestId = q.fee_request_id ?? q.feeRequestId ?? null;
    const from = parseOptionalDate(q.from);
    const to = parseOptionalDate(q.to);

    const where = {};
    if (status) where.status = status;
    if (studentId) where.student_id = String(studentId);
    if (feeRequestId) where.fee_request_id = String(feeRequestId);
    if (from || to) {
      where.created_at = {
        ...(from ? { gte: from } : {}),
        ...(to ? { lte: to } : {}),
      };
    }

    const rows = await prisma.payment_submissions.findMany({
      where,
      orderBy: { created_at: "desc" },
      take: 500,
    });
    return res.json({ submissions: rows.map(serializeSubmission) });
  } catch (err) {
    console.error("GET /fees/submissions error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /fees/submissions/:id/review
router.patch("/submissions/:id/review", requireAuth, requireRole(ADMIN_ROLES), async (req, res) => {
  try {
    const { id } = req.params;
    const b = req.body || {};
    const status = validateStatus(b.status, new Set(["VERIFIED", "REJECTED", "NEEDS_INFO"]));
    const reviewNotes = b.review_notes ?? b.reviewNotes ?? null;
    if (!status) return res.status(400).json({ error: "Invalid status. Allowed: VERIFIED, REJECTED, NEEDS_INFO" });

    const existing = await prisma.payment_submissions.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "Submission not found" });
    if (existing.status === "VERIFIED") return res.status(400).json({ error: "Submission is already VERIFIED" });

    const updated = await prisma.payment_submissions.update({
      where: { id },
      data: {
        status,
        reviewed_by_user_id: req.auth.userId,
        reviewed_at: new Date(),
        review_notes: reviewNotes != null && String(reviewNotes).trim() !== "" ? String(reviewNotes).trim() : null,
        updated_at: new Date(),
      },
    });

    const fee = await prisma.fee_requests.findUnique({ where: { id: updated.fee_request_id } });
    if (fee && status === "VERIFIED") {
      await prisma.fee_requests.update({
        where: { id: fee.id },
        data: { status: "PAID" },
      });
    }

    const student = await prisma.students.findUnique({
      where: { id: updated.student_id },
      select: { user_id: true },
    });

    if (student?.user_id) {
      const type =
        status === "VERIFIED"
          ? "PAYMENT_VERIFIED"
          : status === "NEEDS_INFO"
            ? "PAYMENT_NEEDS_INFO"
            : "PAYMENT_REJECTED";
      const title =
        status === "VERIFIED"
          ? "Payment verified"
          : status === "NEEDS_INFO"
            ? "Payment needs info"
            : "Payment rejected";
      const msg =
        status === "VERIFIED"
          ? `Your payment has been verified for "${fee?.title || "fee request"}".`
          : status === "NEEDS_INFO"
            ? `More information is needed for your payment for "${fee?.title || "fee request"}".`
            : `Your payment was rejected for "${fee?.title || "fee request"}".`;

      await safeCreateNotification({
        userId: student.user_id,
        type,
        title,
        message: msg,
        entityType: "payment_submission",
        entityId: updated.id,
      }, "PATCH /fees/submissions/:id/review");
    }

    return res.json({ submission: serializeSubmission(updated) });
  } catch (err) {
    console.error("PATCH /fees/submissions/:id/review error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// =========================
// Student endpoints
// =========================

// GET /fees/my/requests
router.get("/my/requests", requireAuth, requireRole(STUDENT_ROLES), async (req, res) => {
  try {
    const student = await requireStudentRow(req);
    if (!student) return res.status(403).json({ error: "Student profile not found" });

    const rows = await prisma.fee_requests.findMany({
      where: { student_id: student.id },
      orderBy: [{ due_date: "desc" }, { created_at: "desc" }],
      take: 200,
    });
    return res.json({ fee_requests: rows.map(serializeFeeRequest) });
  } catch (err) {
    console.error("GET /fees/my/requests error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /fees/my/submissions
router.post("/my/submissions", requireAuth, requireRole(STUDENT_ROLES), async (req, res) => {
  try {
    const student = await requireStudentRow(req);
    if (!student) return res.status(403).json({ error: "Student profile not found" });

    const b = req.body || {};
    const feeRequestId = b.fee_request_id ?? b.feeRequestId ?? null;
    const method = validateMethod(b.method);
    const amountPaise = parseIntSafe(b.amount_paise ?? b.amountPaise);
    const reference = b.reference != null && String(b.reference).trim() !== "" ? String(b.reference).trim() : null;
    const proofUrl = b.proof_url ?? b.proofUrl ?? null;
    const notesFromStudent =
      b.notes_from_student ?? b.notesFromStudent ?? null;
    const paidAt = parseOptionalDate(b.paid_at ?? b.paidAt);

    if (!feeRequestId) return res.status(400).json({ error: "fee_request_id is required" });
    if (!method) return res.status(400).json({ error: `Invalid method. Allowed: ${[...METHODS].join(", ")}` });
    if (amountPaise == null || amountPaise <= 0) return res.status(400).json({ error: "amount_paise must be > 0" });

    if (REF_REQUIRED.has(method) && !reference) {
      return res.status(400).json({ error: `reference is required for method ${method}` });
    }

    const fee = await prisma.fee_requests.findUnique({ where: { id: String(feeRequestId) } });
    if (!fee) return res.status(404).json({ error: "Fee request not found" });
    if (fee.student_id !== student.id) return res.status(403).json({ error: "Cannot submit for another student" });

    const existingPendingSubmission = await prisma.payment_submissions.findFirst({
      where: {
        fee_request_id: fee.id,
        student_id: student.id,
        status: { in: ["SUBMITTED", "NEEDS_INFO"] },
      },
      orderBy: { created_at: "desc" },
      select: { id: true, status: true, created_at: true },
    });
    if (existingPendingSubmission) {
      return res.status(409).json({
        error:
          "A payment submission for this fee is already under review. Wait for admin action before submitting again.",
      });
    }

    const computedStatus = computeFeeStatus(fee);
    if (!(fee.status === "ISSUED" || computedStatus === "OVERDUE")) {
      return res.status(400).json({ error: "Fee request is not open for payment submission" });
    }

    if (amountPaise !== fee.amount_paise) {
      return res.status(400).json({ error: "For Month 2, amount_paise must exactly match the fee request amount" });
    }

    const row = await prisma.payment_submissions.create({
      data: {
        id: crypto.randomUUID(),
        fee_request_id: fee.id,
        student_id: student.id,
        submitted_by_user_id: req.auth.userId,
        method,
        amount_paise: amountPaise,
        paid_at: paidAt,
        reference,
        proof_url: proofUrl != null && String(proofUrl).trim() !== "" ? String(proofUrl).trim() : null,
        notes_from_student:
          notesFromStudent != null && String(notesFromStudent).trim() !== "" ? String(notesFromStudent).trim() : null,
        status: "SUBMITTED",
        updated_at: new Date(),
      },
    });

    await safeNotifyAdmins({
      type: "PAYMENT_SUBMITTED",
      title: "Payment submitted",
      message: `A payment was submitted for "${fee.title}" (₹${(fee.amount_paise / 100).toFixed(2)}).`,
      entityType: "payment_submission",
      entityId: row.id,
    }, "POST /fees/my/submissions");

    return res.status(201).json({ submission: serializeSubmission(row) });
  } catch (err) {
    console.error("POST /fees/my/submissions error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /fees/my/submissions
router.get("/my/submissions", requireAuth, requireRole(STUDENT_ROLES), async (req, res) => {
  try {
    const student = await requireStudentRow(req);
    if (!student) return res.status(403).json({ error: "Student profile not found" });

    const rows = await prisma.payment_submissions.findMany({
      where: { student_id: student.id },
      orderBy: { created_at: "desc" },
      take: 200,
    });
    return res.json({ submissions: rows.map(serializeSubmission) });
  } catch (err) {
    console.error("GET /fees/my/submissions error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /fees/my/submissions/:id
router.patch("/my/submissions/:id", requireAuth, requireRole(STUDENT_ROLES), async (req, res) => {
  try {
    const student = await requireStudentRow(req);
    if (!student) return res.status(403).json({ error: "Student profile not found" });

    const { id } = req.params;
    const existing = await prisma.payment_submissions.findUnique({ where: { id } });
    if (!existing || existing.student_id !== student.id) {
      return res.status(404).json({ error: "Submission not found" });
    }
    if (existing.status !== "NEEDS_INFO") {
      return res.status(400).json({ error: "Only NEEDS_INFO submissions can be updated" });
    }

    const anotherPendingSubmission = await prisma.payment_submissions.findFirst({
      where: {
        fee_request_id: existing.fee_request_id,
        student_id: student.id,
        id: { not: existing.id },
        status: { in: ["SUBMITTED", "NEEDS_INFO"] },
      },
      orderBy: { created_at: "desc" },
      select: { id: true, status: true, created_at: true },
    });
    if (anotherPendingSubmission) {
      return res.status(409).json({
        error:
          "Another submission for this fee is already under review. Please wait for admin review before resubmitting.",
      });
    }

    const b = req.body || {};
    const data = {};

    if (b.method !== undefined) {
      const method = validateMethod(b.method);
      if (!method) return res.status(400).json({ error: `Invalid method. Allowed: ${[...METHODS].join(", ")}` });
      data.method = method;
    }
    if (b.reference !== undefined) {
      const reference = b.reference != null && String(b.reference).trim() !== "" ? String(b.reference).trim() : null;
      data.reference = reference;
    }
    if (b.proof_url !== undefined || b.proofUrl !== undefined) {
      const proofUrl = b.proof_url ?? b.proofUrl ?? null;
      data.proof_url = proofUrl != null && String(proofUrl).trim() !== "" ? String(proofUrl).trim() : null;
    }
    if (b.notes_from_student !== undefined || b.notesFromStudent !== undefined) {
      const notes = b.notes_from_student ?? b.notesFromStudent ?? null;
      data.notes_from_student = notes != null && String(notes).trim() !== "" ? String(notes).trim() : null;
    }
    if (b.paid_at !== undefined || b.paidAt !== undefined) {
      data.paid_at = parseOptionalDate(b.paid_at ?? b.paidAt);
    }

    // Method change may require reference.
    const nextMethod = data.method || existing.method;
    const nextReference = data.reference !== undefined ? data.reference : existing.reference;
    if (REF_REQUIRED.has(nextMethod) && !nextReference) {
      return res.status(400).json({ error: `reference is required for method ${nextMethod}` });
    }

    const updated = await prisma.payment_submissions.update({
      where: { id },
      data: {
        ...data,
        status: "SUBMITTED",
        reviewed_by_user_id: null,
        reviewed_at: null,
        review_notes: null,
        updated_at: new Date(),
      },
    });

    await safeNotifyAdmins({
      type: "PAYMENT_SUBMITTED",
      title: "Payment resubmitted",
      message: `A payment was resubmitted for review.`,
      entityType: "payment_submission",
      entityId: updated.id,
    }, "PATCH /fees/my/submissions/:id");

    return res.json({ submission: serializeSubmission(updated) });
  } catch (err) {
    console.error("PATCH /fees/my/submissions/:id error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

