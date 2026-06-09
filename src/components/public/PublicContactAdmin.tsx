import { FormEvent, useState } from "react";
import { Mail, MessageSquareText, Phone, Send, User } from "lucide-react";

import { API_BASE } from "../../config";

const initialForm = { name: "", phone: "", email: "", message: "" };

export default function PublicContactAdmin() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [feedback, setFeedback] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setFeedback("");

    try {
      const response = await fetch(`${API_BASE}/contact-enquiry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Unable to send your message.");
      setForm(initialForm);
      setStatus("success");
      setFeedback("Your message has been sent to the MyDojo admin team.");
    } catch (error) {
      setStatus("error");
      setFeedback(error instanceof Error ? error.message : "Unable to send your message.");
    }
  }

  const update = (field: keyof typeof initialForm, value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  return (
    <section id="contact-admin" className="public-theme-section px-4 py-16 sm:px-5 md:py-24 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.28em] text-orange-600">Contact Admin</p>
          <h2 className="mydojo-display mt-5 break-words text-[clamp(2.4rem,8vw,5rem)] leading-tight text-slate-950 dark:text-white">
            Start a conversation
            <span className="block text-orange-600">with MyDojo</span>
          </h2>
          <p className="public-theme-muted mt-6 max-w-xl text-lg font-medium leading-8">
            Ask about registration, training centers, partnerships, fees, or platform support. Your message goes directly to the MyDojo admin team.
          </p>
          <a href="mailto:mydojo.pvt.ltd@gmail.com" className="mt-7 inline-flex items-center gap-3 font-bold text-orange-600 hover:underline">
            <Mail size={20} />
            mydojo.pvt.ltd@gmail.com
          </a>
        </div>

        <form onSubmit={handleSubmit} className="public-theme-surface grid gap-4 rounded-[2rem] border p-5 shadow-xl backdrop-blur-xl sm:grid-cols-2 sm:p-8">
          <label className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-600" size={18} />
            <input required value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Your name" className="w-full rounded-2xl border border-slate-300 bg-white/80 py-4 pl-12 pr-4 outline-none focus:border-orange-500 dark:border-white/15 dark:bg-white/[0.06]" />
          </label>
          <label className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-600" size={18} />
            <input required type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="Phone number" className="w-full rounded-2xl border border-slate-300 bg-white/80 py-4 pl-12 pr-4 outline-none focus:border-orange-500 dark:border-white/15 dark:bg-white/[0.06]" />
          </label>
          <label className="relative sm:col-span-2">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-600" size={18} />
            <input required type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="Email address" className="w-full rounded-2xl border border-slate-300 bg-white/80 py-4 pl-12 pr-4 outline-none focus:border-orange-500 dark:border-white/15 dark:bg-white/[0.06]" />
          </label>
          <label className="relative sm:col-span-2">
            <MessageSquareText className="absolute left-4 top-5 text-orange-600" size={18} />
            <textarea required value={form.message} onChange={(e) => update("message", e.target.value)} placeholder="How can the admin team help?" className="min-h-36 w-full resize-y rounded-2xl border border-slate-300 bg-white/80 py-4 pl-12 pr-4 outline-none focus:border-orange-500 dark:border-white/15 dark:bg-white/[0.06]" />
          </label>
          {feedback ? (
            <p role={status === "error" ? "alert" : "status"} className={`sm:col-span-2 rounded-xl px-4 py-3 text-sm font-bold ${status === "error" ? "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-200" : "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200"}`}>
              {feedback}
            </p>
          ) : null}
          <button disabled={status === "sending"} className="sm:col-span-2 inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-600 px-6 py-4 text-sm font-black uppercase tracking-[0.16em] text-white shadow-xl shadow-orange-600/25 transition hover:-translate-y-0.5 hover:bg-orange-700 disabled:opacity-60">
            <Send size={18} />
            {status === "sending" ? "Sending..." : "Send to Admin"}
          </button>
        </form>
      </div>
    </section>
  );
}
