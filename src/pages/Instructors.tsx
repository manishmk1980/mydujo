import React, { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { motion } from 'motion/react';
import { Award, Star, BookOpen, ShieldCheck } from 'lucide-react';
import { AspectRatio } from '../components/ui/aspect-ratio';
import { instructorService } from '../services/instructorService';

export default function Instructors() {
  const [instructors, setInstructors] = useState<any[]>([]);

  useEffect(() => {
    instructorService
      .getAllInstructors()
      .then((data) => setInstructors(Array.isArray(data) ? data : []))
      .catch(() => setInstructors([]));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <div className="text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 mb-4"
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
              key={instructor.id || `${instructor.fullName || instructor.full_name}-${index}`}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col lg:flex-row"
            >
              <div className="lg:w-2/5 relative">
                <AspectRatio ratio={4 / 5}>
                  <img
                    src={instructor.profilePhotoUrl || instructor.profile_photo_url || 'https://picsum.photos/seed/instructor-default/800/1000'}
                    alt={instructor.fullName || instructor.full_name}
                    className="w-full h-full object-cover"
                  />
                </AspectRatio>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent lg:hidden"></div>
                <div className="absolute bottom-4 left-4 text-white lg:hidden">
                  <p className="text-xs font-bold uppercase tracking-widest text-primary">{instructor.role}</p>
                  <h3 className="text-xl font-bold">{instructor.fullName || instructor.full_name}</h3>
                </div>
              </div>

              <div className="lg:w-3/5 p-8 flex flex-col">
                <div className="hidden lg:block mb-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">Instructor</p>
                  <h3 className="text-2xl font-bold text-slate-900">{instructor.fullName || instructor.full_name}</h3>
                  <p className="text-sm font-semibold text-slate-500">{instructor.email || 'MDPL Instructor'}</p>
                </div>

                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                  {instructor.bio || 'Dedicated martial arts trainer focused on student growth and discipline.'}
                </p>

                <div className="space-y-4 mt-auto">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <Star className="size-3 text-primary" /> Expertise
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {[
                        instructor.preferredDiscipline || instructor.preferred_discipline || 'General',
                        instructor.trainingCenterName || instructor.training_center_name || 'Training Center',
                      ].map((skill: string) => (
                        <span key={skill} className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-full uppercase">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-50 flex items-center gap-3">
                    <Award className="size-5 text-primary shrink-0" />
                    <p className="text-xs font-bold text-slate-700">{instructor.trainingCenterName || instructor.training_center_name || 'Certified Instructor'}</p>
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
