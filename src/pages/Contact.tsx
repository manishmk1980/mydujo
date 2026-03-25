import React from 'react';
import { Mail, MapPin, Phone } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export default function Contact() {
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
              2nd Floor, Viman Nagar Community Complex, Pune, Maharashtra 411014
            </p>
            <p className="flex items-center gap-3 text-slate-600">
              <Phone className="size-5 text-primary shrink-0" />
              +91 98765 43210
            </p>
            <p className="flex items-center gap-3 text-slate-600">
              <Mail className="size-5 text-primary shrink-0" />
              hello@mdpl.in
            </p>
          </section>

          <section className="bg-white p-8 rounded-2xl border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-5">Send an Enquiry</h2>
            <form className="space-y-4">
              <input className="w-full rounded-xl border border-slate-200 px-4 py-3" placeholder="Your Name" />
              <input className="w-full rounded-xl border border-slate-200 px-4 py-3" placeholder="Phone Number" />
              <input className="w-full rounded-xl border border-slate-200 px-4 py-3" placeholder="Email Address" />
              <textarea className="w-full rounded-xl border border-slate-200 px-4 py-3 min-h-28" placeholder="Your Message" />
              <button type="button" className="rounded-xl bg-primary text-white px-6 py-3 font-bold hover:bg-primary/90">
                Submit
              </button>
            </form>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
