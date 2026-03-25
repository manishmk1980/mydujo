import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { AspectRatio } from '../components/ui/aspect-ratio';

const programs = [
  {
    title: 'Karate Foundation (Kids 6-12)',
    description: 'Basics of stances, strikes, discipline routines, and confidence-building activities for children.',
    image: 'https://source.unsplash.com/1200x800/?kids,karate,dojo',
  },
  {
    title: 'Judo & Grappling (Teens/Adults)',
    description: 'Throwing mechanics, break-fall safety, and controlled sparring for fitness and practical defense.',
    image: 'https://source.unsplash.com/1200x800/?judo,training',
  },
  {
    title: 'Women Self-Defense Bootcamp',
    description: 'Scenario-based training with awareness drills, escape techniques, and situational confidence.',
    image: 'https://source.unsplash.com/1200x800/?women,self-defense,martial-arts',
  },
  {
    title: 'Competition Squad Training',
    description: 'Advanced kata, kumite strategy, match conditioning, and tournament preparation.',
    image: 'https://source.unsplash.com/1200x800/?karate,tournament',
  },
];

export default function Programs() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <div className="mb-12 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Programs</p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 mb-4">Training programs for every stage</h1>
          <p className="text-slate-600 text-lg max-w-3xl mx-auto">
            Structured martial arts programs inspired by Indian academy models, with clear progression and
            instructor guidance at every level.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {programs.map((program) => (
            <article key={program.title} className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm">
              <AspectRatio ratio={16 / 9}>
                <img src={program.image} alt={program.title} className="w-full h-full object-cover" />
              </AspectRatio>
              <div className="p-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">{program.title}</h2>
                <p className="text-slate-600 mb-5">{program.description}</p>
                <Link to="/contact" className="inline-flex rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary/90">
                  Enquire Now
                </Link>
              </div>
            </article>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
