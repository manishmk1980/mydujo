import { Router } from "express";
import { randomUUID } from "crypto";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

function cleanRows(rows) {
  return rows.map((r) => ({
    ...r,
    due_date: r.due_date ? new Date(r.due_date).toISOString().slice(0, 10) : null,
    paid_at: r.paid_at ? new Date(r.paid_at).toISOString() : null,
    issued_at: r.issued_at ? new Date(r.issued_at).toISOString() : null,
    reviewed_at: r.reviewed_at ? new Date(r.reviewed_at).toISOString() : null,
    created_at: r.created_at ? new Date(r.created_at).toISOString() : null,
    updated_at: r.updated_at ? new Date(r.updated_at).toISOString() : null,
  }));
}

// Admin: list fee requests
router.get("/requests", requireAuth, async (req, res) => {
  try {
    const rows = await prisma.$queryRawUnsafe(`
      SELECT 
        fr.*,
        s.full_name AS student_full_name,
        s.email AS student_email,
        s.phone AS student_phone,
        tc.name AS training_center_name
      FROM fee_requests fr
      LEFT JOIN students s ON s.id = fr.student_id
      LEFT JOIN training_centers tc ON tc.id = fr.training_center_id
      ORDER BY fr.created_at DESC
    `);

    const requests = cleanRows(rows);
    res.json({ requests, fee_requests: requests });
  } catch (err) {
    console.error("GET /fees/requests error:", err);
    res.status(500).json({ error: "server error" });
  }
});

// Admin: create fee request
router.post("/requests", requireAuth, async (req, res) => {
  try {
    const {
      student_id,
      training_center_id,
      title,
      description,
      amount_paise,
      due_date,
      status = "ISSUED",
    } = req.body;

    if (!student_id || !title || !amount_paise || !due_date) {
      return res.status(400).json({ error: "student_id, title, amount_paise and due_date are required" });
    }

    const id = randomUUID();
    const issuedAt = status === "DRAFT" ? null : new Date();

    await prisma.$executeRawUnsafe(
      `
      INSERT INTO fee_requests
      (id, student_id, training_center_id, title, description, amount_paise, currency, due_date, status, issued_at, created_by_user_id, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, 'INR', ?, ?, ?, ?, NOW())
      `,
      id,
      student_id,
      training_center_id || null,
      title,
      description || null,
      Number(amount_paise),
      due_date,
      status,
      issuedAt,
      req.auth.userId
    );

    const rows = await prisma.$queryRawUnsafe(`SELECT * FROM fee_requests WHERE id = ?`, id);
    res.status(201).json({ request: cleanRows(rows)[0], fee_request: cleanRows(rows)[0] });
  } catch (err) {
    console.error("POST /fees/requests error:", err);
    res.status(500).json({ error: "server error" });
  }
});

// Admin: list payment submissions
router.get("/submissions", requireAuth, async (req, res) => {
  try {
    const rows = await prisma.$queryRawUnsafe(`
      SELECT
        ps.*,
        s.full_name AS student_full_name,
        s.email AS student_email,
        fr.title AS fee_title,
        fr.amount_paise AS fee_amount_paise,
        fr.status AS fee_status
      FROM payment_submissions ps
      LEFT JOIN students s ON s.id = ps.student_id
      LEFT JOIN fee_requests fr ON fr.id = ps.fee_request_id
      ORDER BY ps.created_at DESC
    `);

    const submissions = cleanRows(rows);
    res.json({ submissions });
  } catch (err) {
    console.error("GET /fees/submissions error:", err);
    res.status(500).json({ error: "server error" });
  }
});

// Admin: review payment submission
router.patch("/submissions/:id/review", requireAuth, async (req, res) => {
  try {
    const { status, review_notes } = req.body;

    if (!status) {
      return res.status(400).json({ error: "status is required" });
    }

    await prisma.$executeRawUnsafe(
      `
      UPDATE payment_submissions
      SET status = ?, review_notes = ?, reviewed_by_user_id = ?, reviewed_at = NOW(), updated_at = NOW()
      WHERE id = ?
      `,
      status,
      review_notes || null,
      req.auth.userId,
      req.params.id
    );

    const rows = await prisma.$queryRawUnsafe(`SELECT * FROM payment_submissions WHERE id = ?`, req.params.id);
    res.json({ submission: cleanRows(rows)[0] });
  } catch (err) {
    console.error("PATCH /fees/submissions/:id/review error:", err);
    res.status(500).json({ error: "server error" });
  }
});

export default router;
