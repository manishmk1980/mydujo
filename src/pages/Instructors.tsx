import React from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { motion } from 'motion/react';
import { Award, Star, BookOpen, ShieldCheck } from 'lucide-react';

const instructors = [
  {
    name: 'Sensei Vikram Rathore',
    role: 'Chief Instructor',
    rank: '5th Dan Black Belt, Shotokan Karate',
    bio: 'With over 25 years of experience in traditional Shotokan Karate, Sensei Vikram has trained thousands of students across India. He is a certified international referee and a member of the National Karate Federation.',
    expertise: ['Traditional Kata', 'Advanced Kumite', 'Dojo Management'],
    image: 'https://picsum.photos/seed/vikram/400/500',
    achievements: 'National Gold Medalist (2005-2010)'
  },
  {
    name: 'Sempai Anjali Sharma',
    role: 'Senior Instructor',
    rank: '3rd Dan Black Belt, Judo',
    bio: 'Anjali is a former national-level Judo champion. She specializes in ground techniques and throwing mechanics. Her teaching style focuses on the principle of "Maximum Efficiency, Minimum Effort".',
    expertise: ['Ne-waza (Groundwork)', 'Nage-waza (Throwing)', 'Women\'s Self Defense'],
    image: 'https://picsum.photos/seed/anjali/400/500',
    achievements: 'South Asian Games Silver Medalist'
  },
  {
    name: 'Sensei Rajesh Kumar',
    role: 'Head of Self Defense',
    rank: '4th Dan Black Belt, Krav Maga & Karate',
    bio: 'Sensei Rajesh brings a practical approach to martial arts. He has worked with security agencies and corporate groups, teaching realistic self-defense scenarios and situational awareness.',
    expertise: ['Krav Maga', 'Street Self Defense', 'Tactical Training'],
    image: 'https://picsum.photos/seed/rajesh/400/500',
    achievements: 'Certified Tactical Combat Instructor'
  },
  {
    name: 'Sempai Rohan Deshmukh',
    role: 'Junior Instructor',
    rank: '2nd Dan Black Belt, Karate',
    bio: 'Rohan is our lead instructor for the kids\' programs. His energetic and patient approach makes him a favorite among our youngest warriors. He focuses on building discipline through fun and engagement.',
    expertise: ['Youth Programs', 'Basic Kihon', 'Agility Training'],
    image: 'https://picsum.photos/seed/rohan/400/500',
    achievements: 'Best Youth Coach Award 2023'
  }
];

export default function Instructors() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black text-slate-900 mb-4"
          >
            Meet Our <span className="text-primary">Masters</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-500 text-lg max-w-2xl mx-auto"
          >
            Our instructors are more than just teachers; they are mentors dedicated to your personal growth and martial arts journey.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {instructors.map((instructor, index) => (
            <motion.div 
              key={instructor.name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col lg:flex-row"
            >
              <div className="lg:w-2/5 relative">
                <img 
                  src={instructor.image} 
                  alt={instructor.name}
                  className="w-full h-full object-cover min-h-[300px]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent lg:hidden"></div>
                <div className="absolute bottom-4 left-4 text-white lg:hidden">
                  <p className="text-xs font-bold uppercase tracking-widest text-primary">{instructor.role}</p>
                  <h3 className="text-xl font-bold">{instructor.name}</h3>
                </div>
              </div>
              
              <div className="lg:w-3/5 p-8 flex flex-col">
                <div className="hidden lg:block mb-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">{instructor.role}</p>
                  <h3 className="text-2xl font-bold text-slate-900">{instructor.name}</h3>
                  <p className="text-sm font-semibold text-slate-500">{instructor.rank}</p>
                </div>
                
                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                  {instructor.bio}
                </p>

                <div className="space-y-4 mt-auto">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <Star className="size-3 text-primary" /> Expertise
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {instructor.expertise.map(skill => (
                        <span key={skill} className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-full uppercase">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-50 flex items-center gap-3">
                    <Award className="size-5 text-primary shrink-0" />
                    <p className="text-xs font-bold text-slate-700">{instructor.achievements}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <section className="mt-24 bg-slate-900 rounded-[3rem] p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-primary/10 rounded-full -ml-32 -mt-32"></div>
          <div className="relative z-10">
            <h2 className="text-3xl font-bold text-white mb-4">Want to train with the best?</h2>
            <p className="text-slate-400 mb-8 max-w-xl mx-auto">
              Join our academy today and start your journey under the guidance of our expert instructors.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="px-8 py-4 bg-primary text-white rounded-2xl font-bold hover:scale-105 transition-transform shadow-lg shadow-primary/20">
                Book a Trial Class
              </button>
              <button className="px-8 py-4 bg-white/10 text-white border border-white/20 rounded-2xl font-bold hover:bg-white/20 transition-all">
                View Class Schedule
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
