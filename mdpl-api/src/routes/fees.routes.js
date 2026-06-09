import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();
const feeStatuses = new Set(["DRAFT", "ISSUED", "OVERDUE", "PAID", "CANCELLED"]);
const paymentStatuses = new Set(["SUBMITTED", "NEEDS_INFO", "VERIFIED", "REJECTED", "CANCELLED"]);
const paymentMethods = new Set(["UPI", "CASH", "BANK_TRANSFER", "CHEQUE", "OTHER"]);

const feeDto = (r) => ({
  id: r.id, student_id: r.studentId, training_center_id: r.trainingCenterId, title: r.title,
  description: r.description, amount_paise: r.amountPaise, currency: r.currency,
  due_date: r.dueDate?.toISOString().slice(0, 10), status: r.status, issued_at: r.issuedAt,
  created_by_user_id: r.createdByUserId, created_at: r.createdAt, updated_at: r.updatedAt,
  student_full_name: r.student?.fullName, student_email: r.student?.email,
  student_phone: r.student?.phone, training_center_name: r.trainingCenter?.name,
});
const submissionDto = (r) => ({
  id: r.id, fee_request_id: r.feeRequestId, student_id: r.studentId, submitted_by_user_id: r.submittedByUserId,
  method: r.method, amount_paise: r.amountPaise, paid_at: r.paidAt, reference: r.reference, proof_url: r.proofUrl,
  notes_from_student: r.notesFromStudent, status: r.status, reviewed_by_user_id: r.reviewedByUserId,
  reviewed_at: r.reviewedAt, review_notes: r.reviewNotes, created_at: r.createdAt, updated_at: r.updatedAt,
  student_full_name: r.student?.fullName, student_email: r.student?.email, fee_title: r.feeRequest?.title,
  fee_amount_paise: r.feeRequest?.amountPaise, fee_status: r.feeRequest?.status,
});
const feeInclude = { student: true, trainingCenter: true };
const submissionInclude = { student: true, feeRequest: true };
async function currentStudent(userId) {
  return prisma.student.findUnique({ where: { userId } });
}

router.get("/my/requests", requireAuth, async (req, res) => {
  const student = await currentStudent(req.auth.userId);
  if (!student) return res.status(404).json({ error: "Student profile not found" });
  const rows = await prisma.feeRequest.findMany({ where: { studentId: student.id }, include: feeInclude, orderBy: { createdAt: "desc" } });
  return res.json({ fee_requests: rows.map(feeDto) });
});

router.get("/my/submissions", requireAuth, async (req, res) => {
  const student = await currentStudent(req.auth.userId);
  if (!student) return res.status(404).json({ error: "Student profile not found" });
  const rows = await prisma.paymentSubmission.findMany({ where: { studentId: student.id }, include: submissionInclude, orderBy: { createdAt: "desc" } });
  return res.json({ submissions: rows.map(submissionDto) });
});

router.post("/my/submissions", requireAuth, async (req, res) => {
  const student = await currentStudent(req.auth.userId);
  if (!student) return res.status(404).json({ error: "Student profile not found" });
  const b = req.body || {};
  if (!b.fee_request_id || !paymentMethods.has(b.method) || !Number(b.amount_paise)) return res.status(400).json({ error: "fee_request_id, valid method and amount_paise are required" });
  const fee = await prisma.feeRequest.findFirst({ where: { id: b.fee_request_id, studentId: student.id } });
  if (!fee) return res.status(404).json({ error: "Fee request not found" });
  const row = await prisma.paymentSubmission.create({
    data: { feeRequestId: fee.id, studentId: student.id, submittedByUserId: req.auth.userId, method: b.method, amountPaise: Number(b.amount_paise), paidAt: b.paid_at ? new Date(b.paid_at) : null, reference: b.reference || null, proofUrl: b.proof_url || null, notesFromStudent: b.notes_from_student || null },
    include: submissionInclude,
  });
  return res.status(201).json({ submission: submissionDto(row) });
});

router.patch("/my/submissions/:id", requireAuth, async (req, res) => {
  const student = await currentStudent(req.auth.userId);
  const existing = student && await prisma.paymentSubmission.findFirst({ where: { id: req.params.id, studentId: student.id } });
  if (!existing) return res.status(404).json({ error: "Submission not found" });
  if (!["SUBMITTED", "NEEDS_INFO"].includes(existing.status)) return res.status(409).json({ error: "Submission can no longer be edited" });
  const b = req.body || {};
  const row = await prisma.paymentSubmission.update({
    where: { id: existing.id },
    data: { method: b.method, paidAt: b.paid_at === undefined ? undefined : b.paid_at ? new Date(b.paid_at) : null, reference: b.reference, proofUrl: b.proof_url, notesFromStudent: b.notes_from_student },
    include: submissionInclude,
  });
  return res.json({ submission: submissionDto(row) });
});

router.get("/requests", requireAuth, async (req, res) => {
  const where = {};
  if (req.query.status) where.status = String(req.query.status);
  if (req.query.student_id) where.studentId = String(req.query.student_id);
  if (req.query.training_center_id) where.trainingCenterId = String(req.query.training_center_id);
  const rows = await prisma.feeRequest.findMany({ where, include: feeInclude, orderBy: { createdAt: "desc" } });
  const requests = rows.map(feeDto);
  return res.json({ requests, fee_requests: requests });
});

router.post("/requests", requireAuth, async (req, res) => {
  const b = req.body || {};
  if (!b.student_id || !b.title || !Number(b.amount_paise) || !b.due_date) return res.status(400).json({ error: "student_id, title, amount_paise and due_date are required" });
  const status = String(b.status || "ISSUED").toUpperCase();
  if (!feeStatuses.has(status)) return res.status(400).json({ error: "Invalid status" });
  const row = await prisma.feeRequest.create({ data: { studentId: b.student_id, trainingCenterId: b.training_center_id || null, title: b.title, description: b.description || null, amountPaise: Number(b.amount_paise), dueDate: new Date(b.due_date), status, issuedAt: status === "DRAFT" ? null : new Date(), createdByUserId: req.auth.userId }, include: feeInclude });
  return res.status(201).json({ request: feeDto(row), fee_request: feeDto(row) });
});

router.post("/requests/bulk", requireAuth, async (req, res) => {
  const b = req.body || {};
  if (!b.title || !Number(b.amount_paise) || !b.due_date) return res.status(400).json({ error: "title, amount_paise and due_date are required" });
  const students = await prisma.student.findMany({ where: { status: "approved", trainingCenterId: b.training_center_id || undefined } });
  const created = [];
  for (const student of students) {
    created.push(await prisma.feeRequest.create({ data: { studentId: student.id, trainingCenterId: student.trainingCenterId, title: b.title, description: b.description || null, amountPaise: Number(b.amount_paise), dueDate: new Date(b.due_date), status: b.issue_now ? "ISSUED" : "DRAFT", issuedAt: b.issue_now ? new Date() : null, createdByUserId: req.auth.userId }, include: feeInclude }));
  }
  return res.status(201).json({ count: created.length, fee_requests: created.map(feeDto) });
});

router.patch("/requests/:id", requireAuth, async (req, res) => {
  const existing = await prisma.feeRequest.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: "Fee request not found" });
  const b = req.body || {};
  const status = b.status ? String(b.status).toUpperCase() : undefined;
  if (status && !feeStatuses.has(status)) return res.status(400).json({ error: "Invalid status" });
  const row = await prisma.feeRequest.update({ where: { id: existing.id }, data: { title: b.title, amountPaise: b.amount_paise === undefined ? undefined : Number(b.amount_paise), dueDate: b.due_date ? new Date(b.due_date) : undefined, status }, include: feeInclude });
  return res.json({ fee_request: feeDto(row) });
});

router.delete("/requests/:id", requireAuth, async (req, res) => {
  const existing = await prisma.feeRequest.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: "Fee request not found" });
  await prisma.feeRequest.delete({ where: { id: existing.id } });
  return res.json({ ok: true });
});

router.get("/submissions", requireAuth, async (req, res) => {
  const rows = await prisma.paymentSubmission.findMany({ include: submissionInclude, orderBy: { createdAt: "desc" } });
  return res.json({ submissions: rows.map(submissionDto) });
});

router.patch("/submissions/:id/review", requireAuth, async (req, res) => {
  const status = String(req.body?.status || "").toUpperCase();
  if (!paymentStatuses.has(status)) return res.status(400).json({ error: "valid status is required" });
  const existing = await prisma.paymentSubmission.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: "Submission not found" });
  const row = await prisma.paymentSubmission.update({ where: { id: existing.id }, data: { status, reviewNotes: req.body?.review_notes || null, reviewedByUserId: req.auth.userId, reviewedAt: new Date() }, include: submissionInclude });
  if (status === "VERIFIED") await prisma.feeRequest.update({ where: { id: row.feeRequestId }, data: { status: "PAID" } });
  return res.json({ submission: submissionDto(row) });
});

export default router;
