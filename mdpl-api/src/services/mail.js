import nodemailer from "nodemailer";
import "../config/env.js";

export const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || "mydojo.pvt.ltd@gmail.com";
const emailFrom = process.env.EMAIL_FROM || `MyDojo <${ADMIN_EMAIL}>`;

let transporter;

function getTransporter() {
  if (transporter) return transporter;
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return null;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT || 465),
    secure: String(process.env.SMTP_SECURE ?? "true").toLowerCase() === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return transporter;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function sendEmail({ to, subject, text, html, replyTo }) {
  if (String(process.env.EMAIL_ENABLED ?? "true").toLowerCase() === "false") {
    return { skipped: true };
  }
  const mailer = getTransporter();
  if (!mailer) {
    console.warn(`Email skipped (${subject}): SMTP_USER and SMTP_PASS are not configured`);
    return { skipped: true };
  }
  return mailer.sendMail({ from: emailFrom, to, subject, text, html, replyTo });
}

export async function notifyAdminRegistration({ role, name, email, phone }) {
  return sendEmail({
    to: ADMIN_EMAIL,
    subject: `New ${role} registration: ${name}`,
    replyTo: email,
    text: `A new ${role} registration was submitted.\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone || "Not provided"}`,
    html: `<h2>New ${escapeHtml(role)} registration</h2><p><strong>Name:</strong> ${escapeHtml(name)}</p><p><strong>Email:</strong> ${escapeHtml(email)}</p><p><strong>Phone:</strong> ${escapeHtml(phone || "Not provided")}</p>`,
  });
}

export async function notifyAdminContact({ name, email, phone, message }) {
  return sendEmail({
    to: ADMIN_EMAIL,
    subject: `New MyDojo contact enquiry from ${name}`,
    replyTo: email,
    text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\n\n${message}`,
    html: `<h2>New contact enquiry</h2><p><strong>Name:</strong> ${escapeHtml(name)}</p><p><strong>Email:</strong> ${escapeHtml(email)}</p><p><strong>Phone:</strong> ${escapeHtml(phone)}</p><p>${escapeHtml(message).replaceAll("\n", "<br>")}</p>`,
  });
}

export async function notifyFeeGenerated({ student, fee }) {
  const amount = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(fee.amountPaise / 100);
  const dueDate = new Date(fee.dueDate).toLocaleDateString("en-IN");
  const subject = `Fee generated for ${student.fullName}: ${fee.title}`;
  const text = `Hello ${student.fullName},\n\nA fee has been generated for your MyDojo account.\nTitle: ${fee.title}\nAmount: ${amount}\nDue date: ${dueDate}\nStatus: ${fee.status}`;
  const html = `<h2>New MyDojo fee request</h2><p>Hello ${escapeHtml(student.fullName)},</p><p>A fee has been generated for your account.</p><p><strong>Title:</strong> ${escapeHtml(fee.title)}<br><strong>Amount:</strong> ${escapeHtml(amount)}<br><strong>Due date:</strong> ${escapeHtml(dueDate)}<br><strong>Status:</strong> ${escapeHtml(fee.status)}</p>`;

  await Promise.allSettled([
    sendEmail({ to: student.email, subject, text, html }),
    sendEmail({ to: ADMIN_EMAIL, subject: `[Admin copy] ${subject}`, text, html }),
  ]);
}

export function sendEmailSafely(promise, context) {
  promise.catch((error) => console.error(`Email notification failed (${context}):`, error));
}
