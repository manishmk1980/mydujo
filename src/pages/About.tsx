import React from 'react';
import { Users, Shield, Trophy } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { AspectRatio } from '../components/ui/aspect-ratio';

export default function About() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-10 sm:space-y-16">
        <section className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">About MDPL</p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 mb-5">Building disciplined champions across India</h1>
            <p className="text-slate-600 text-lg leading-relaxed">
              MDPL is a martial arts community rooted in Indian values of respect, dedication, and self-mastery.
              From school-age beginners to national-level competitors, we support every learner with structured
              training, qualified mentors, and a strong dojo culture.
            </p>
          </div>
          <div className="rounded-3xl overflow-hidden shadow-xl">
            <AspectRatio ratio={16 / 10}>
              <img
                src="https://source.unsplash.com/1400x900/?karate,dojo,india"
                alt="Indian martial arts training session"
                className="w-full h-full object-cover"
              />
            </AspectRatio>
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-6">
          <article className="bg-white p-7 rounded-2xl border border-slate-200">
            <Users className="size-8 text-primary mb-4" />
            <h2 className="font-bold text-xl text-slate-900 mb-2">Community First</h2>
            <p className="text-slate-600 text-sm">Inclusive batches for kids, teens, women, and working professionals in Indian cities and towns.</p>
          </article>
          <article className="bg-white p-7 rounded-2xl border border-slate-200">
            <Shield className="size-8 text-primary mb-4" />
            <h2 className="font-bold text-xl text-slate-900 mb-2">Practical Training</h2>
            <p className="text-slate-600 text-sm">Self-defense, discipline drills, and conditioning sessions designed for real-life confidence and safety.</p>
          </article>
          <article className="bg-white p-7 rounded-2xl border border-slate-200">
            <Trophy className="size-8 text-primary mb-4" />
            <h2 className="font-bold text-xl text-slate-900 mb-2">Performance Pathway</h2>
            <p className="text-slate-600 text-sm">Belt progression, district tournaments, and national-level preparation with certified instructors.</p>
          </article>
        </section>
      </main>
      <Footer />
    </div>
  );
}
