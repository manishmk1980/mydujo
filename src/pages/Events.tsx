import React from 'react';
import { CalendarDays, MapPin } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { AspectRatio } from '../components/ui/aspect-ratio';

const events = [
  {
    title: 'State Karate Championship Camp',
    date: '12 April 2026',
    location: 'Pune Sports Complex, Maharashtra',
    details: 'A one-day intensive camp covering kata refinement and match simulation before state trials.',
  },
  {
    title: 'Girls Self-Defense Awareness Drive',
    date: '27 April 2026',
    location: 'Indore City Hall, Madhya Pradesh',
    details: 'Hands-on safety workshop with certified women instructors, open to students and parents.',
  },
  {
    title: 'Inter-Dojo Kumite League',
    date: '10 May 2026',
    location: 'Bengaluru Dojo Arena, Karnataka',
    details: 'Friendly league format for skill testing, sportsmanship, and ranking points.',
  },
];

export default function Events() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-10 sm:space-y-12">
        <section className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Events</p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 mb-4">Upcoming events and competitions</h1>
            <p className="text-slate-600 text-lg">
              Stay updated with upcoming MDPL camps, city-level seminars, and martial arts events across India.
            </p>
          </div>
          <div className="rounded-3xl overflow-hidden shadow-xl">
            <AspectRatio ratio={16 / 10}>
              <img
                src="https://source.unsplash.com/1400x900/?martial-arts,competition,india"
                alt="Indian martial arts event"
                className="w-full h-full object-cover"
              />
            </AspectRatio>
          </div>
        </section>

        <section className="grid gap-6">
          {events.map((event) => (
            <article key={event.title} className="bg-white border border-slate-200 rounded-2xl p-6">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">{event.title}</h2>
              <div className="flex flex-col md:flex-row md:items-center gap-4 text-slate-600 text-sm mb-3">
                <p className="inline-flex items-center gap-2"><CalendarDays className="size-4 text-primary" />{event.date}</p>
                <p className="inline-flex items-center gap-2"><MapPin className="size-4 text-primary" />{event.location}</p>
              </div>
              <p className="text-slate-600">{event.details}</p>
            </article>
          ))}
        </section>
      </main>
      <Footer />
    </div>
  );
}
