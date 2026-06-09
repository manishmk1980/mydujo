import React, { useState } from 'react';
import { Mail, MapPin, Phone } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { API_BASE } from '../config';

export default function Contact() {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitError, setSubmitError] = useState('');

  function isValidEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function isValidPhone(value: string) {
    return /^\+?[0-9()\-\s]{7,20}$/.test(value);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSubmitMessage('');
    setSubmitError('');

    const name = form.name.trim();
    const phone = form.phone.trim();
    const email = form.email.trim().toLowerCase();
    const message = form.message.trim();

    if (!name || !phone || !email || !message) {
      setSubmitError('Please fill all fields before submitting.');
      return;
    }

    if (!isValidEmail(email)) {
      setSubmitError('Please enter a valid email address.');
      return;
    }

    if (!isValidPhone(phone)) {
      setSubmitError('Please enter a valid phone number.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch(`${API_BASE}/contact-enquiry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          phone,
          email,
          message,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSubmitError(data?.error || 'Failed to send enquiry. Please try again.');
        return;
      }

      setSubmitMessage("Thanks! Your enquiry has been submitted successfully. We'll get back to you shortly.");
      setForm({
        name: '',
        phone: '',
        email: '',
        message: '',
      });
    } catch {
      setSubmitError('Failed to send enquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <div className="mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Contact</p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 mb-4">Talk to our team</h1>
          <p className="text-slate-600 text-lg">
            Reach out for admissions, batch timings, tournament queries, or franchise opportunities across India.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <section className="bg-white p-8 rounded-2xl border border-slate-200 space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Contact Information</h2>
            <p className="flex items-start gap-3 text-slate-600">
              <MapPin className="size-5 text-primary mt-0.5 shrink-0" />
              <span>
                Resident of H/No-736, Block-B, Lohar Line, Near Gudri Bazar, Sonari,
                <br />
                Jamshedpur, East Singhbhum, Jharkhand - 831011
              </span>
            </p>
            <p className="flex items-center gap-3 text-slate-600">
              <Phone className="size-5 text-primary shrink-0" />
              +91 91224 66212 / +91 90408 20704
            </p>
            <p className="flex items-center gap-3 text-slate-600">
              <Mail className="size-5 text-primary shrink-0" />
              mydojo.pvt.ltd@gmail.com
            </p>
          </section>

          <section className="bg-white p-8 rounded-2xl border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-5">Send an Enquiry</h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <input
                className="w-full rounded-xl border border-slate-200 px-4 py-3"
                placeholder="Your Name"
                required
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              />
              <input
                className="w-full rounded-xl border border-slate-200 px-4 py-3"
                placeholder="Phone Number"
                type="tel"
                required
                value={form.phone}
                onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
              />
              <input
                className="w-full rounded-xl border border-slate-200 px-4 py-3"
                placeholder="Email Address"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              />
              <textarea
                className="w-full rounded-xl border border-slate-200 px-4 py-3 min-h-28"
                placeholder="Your Message"
                required
                value={form.message}
                onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
              />
              {submitError ? <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{submitError}</p> : null}
              {submitMessage ? <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">{submitMessage}</p> : null}
              <button
                type="submit"
                className="rounded-xl bg-primary text-white px-6 py-3 font-bold hover:bg-primary/90 disabled:opacity-70"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Submit'}
              </button>
            </form>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
