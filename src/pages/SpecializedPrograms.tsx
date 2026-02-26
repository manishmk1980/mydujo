import React from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { 
  Shield, 
  Users, 
  Target, 
  Award, 
  Heart, 
  Zap, 
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  User,
  Home,
  Settings,
  Clock,
  Star
} from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

export default function SpecializedPrograms() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 mb-6"
            >
              <Award className="size-3 fill-primary" />
              <span className="text-xs font-bold uppercase tracking-widest">Specialized Training Tracks</span>
            </motion.div>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6">
              Purpose-Driven <span className="text-primary">Excellence</span>
            </h1>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg">
              Beyond traditional martial arts, we offer specialized tracks designed for specific life goals and career paths.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 mb-24">
            {/* Women & Girls Track */}
            <motion.section 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-[3rem] p-8 md:p-12 shadow-xl border border-slate-100 flex flex-col"
            >
              <div className="size-16 rounded-3xl bg-pink-50 flex items-center justify-center text-pink-600 mb-8">
                <Heart className="size-8" />
              </div>
              <h2 className="text-3xl font-black text-slate-900 mb-4">Women & Girls Empowerment</h2>
              <p className="text-slate-600 mb-8 leading-relaxed">
                Our specialized program for women and girls focuses on practical self-defense, situational awareness, and building unbreakable confidence in a supportive, female-led environment.
              </p>
              
              <div className="space-y-4 mb-10 flex-1">
                {[
                  { title: 'Practical Self-Defense', desc: 'Techniques designed for real-world scenarios, focusing on leverage over strength.' },
                  { title: 'Situational Awareness', desc: 'Mental training to identify and avoid potential threats before they escalate.' },
                  { title: 'Confidence Building', desc: 'Overcoming mental barriers and finding your inner strength through discipline.' },
                  { title: 'Supportive Community', desc: 'Join a network of strong women dedicated to mutual growth and safety.' }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="mt-1">
                      <CheckCircle2 className="size-5 text-pink-500" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{item.title}</h4>
                      <p className="text-sm text-slate-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Link to="/register" className="w-full py-4 bg-pink-500 text-white rounded-2xl font-bold hover:bg-pink-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-pink-200">
                Join Women's Track <ArrowRight className="size-5" />
              </Link>
            </motion.section>

            {/* Armed Forces Track */}
            <motion.section 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-slate-900 rounded-[3rem] p-8 md:p-12 shadow-xl text-white flex flex-col"
            >
              <div className="size-16 rounded-3xl bg-primary/20 flex items-center justify-center text-primary mb-8">
                <Target className="size-8" />
              </div>
              <h2 className="text-3xl font-black mb-4">Armed Forces Recruitment Prep</h2>
              <p className="text-slate-400 mb-8 leading-relaxed">
                A high-intensity training track specifically designed for candidates aspiring to join the Army, Navy, Air Force, or Police Services. We focus on the physical and mental rigors of recruitment.
              </p>
              
              <div className="space-y-4 mb-10 flex-1">
                {[
                  { title: 'Physical Endurance (PET)', desc: 'Rigorous training for running, long jump, high jump, and obstacle courses.' },
                  { title: 'Unarmed Combat (UAC)', desc: 'Mastering close-quarters combat techniques essential for service personnel.' },
                  { title: 'Mental Toughness', desc: 'Developing the psychological resilience required for military training and service.' },
                  { title: 'Discipline & Protocol', desc: 'Learning the core values of service: honor, integrity, and absolute discipline.' }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="mt-1">
                      <CheckCircle2 className="size-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">{item.title}</h4>
                      <p className="text-sm text-slate-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Link to="/register" className="w-full py-4 bg-primary text-white rounded-2xl font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
                Join Forces Track <ArrowRight className="size-5" />
              </Link>
            </motion.section>
          </div>

          {/* Flexible Training Options Section */}
          <div className="mb-24">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black text-slate-900 mb-4">Flexible Training Options</h2>
              <p className="text-slate-600 max-w-2xl mx-auto">
                Can't make it to the dojo? No problem. We bring the training to you with our flexible learning modules.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: User,
                  title: 'Individual Training',
                  desc: 'One-on-one sessions with a dedicated Sensei for rapid skill acquisition.',
                  benefits: ['100% Personalized Attention', 'Accelerated Belt Progression', 'Flexible Scheduling'],
                  color: 'bg-blue-50 text-blue-600'
                },
                {
                  icon: Home,
                  title: 'Train at Home',
                  desc: 'Guided virtual sessions and home-study modules for the busy practitioner.',
                  benefits: ['Zero Commute Time', 'Comfort of Your Own Space', 'On-Demand Video Access'],
                  color: 'bg-emerald-50 text-emerald-600'
                },
                {
                  icon: Settings,
                  title: 'Custom Training',
                  desc: 'Bespoke curriculum tailored to your specific physical goals or limitations.',
                  benefits: ['Tailored Technical Focus', 'Injury-Safe Modifications', 'Goal-Specific Drills'],
                  color: 'bg-purple-50 text-purple-600'
                }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ y: -10 }}
                  className="bg-white rounded-[2.5rem] p-8 shadow-lg border border-slate-100 flex flex-col"
                >
                  <div className={cn("size-14 rounded-2xl flex items-center justify-center mb-6", item.color)}>
                    <item.icon className="size-7" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">{item.title}</h3>
                  <p className="text-slate-500 text-sm mb-6 leading-relaxed">{item.desc}</p>
                  
                  <div className="space-y-3 mb-8 flex-1">
                    {item.benefits.map((benefit, j) => (
                      <div key={j} className="flex items-center gap-2 text-xs font-bold text-slate-700">
                        <Star className="size-3 text-primary fill-primary" />
                        {benefit}
                      </div>
                    ))}
                  </div>

                  <button className="w-full py-3 bg-slate-50 text-slate-900 rounded-xl font-bold text-sm hover:bg-slate-100 transition-all">
                    Inquire Now
                  </button>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Additional Info Section */}
          <div className="mt-20 bg-white rounded-[3rem] p-8 md:p-16 border border-slate-200 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full -mr-48 -mt-48"></div>
            <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl font-black text-slate-900 mb-6">Why Specialized Training?</h3>
                <p className="text-slate-600 mb-8">
                  We believe that martial arts should be accessible and applicable to everyone's unique journey. Whether you're seeking personal safety or a career in service, our instructors are certified to guide you.
                </p>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                      <Users className="size-5" />
                    </div>
                    <span className="font-bold text-slate-700">Dedicated Female Instructors</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                      <Shield className="size-5" />
                    </div>
                    <span className="font-bold text-slate-700">Ex-Military Mentors</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                      <Zap className="size-5" />
                    </div>
                    <span className="font-bold text-slate-700">Intensive Bootcamp Modules</span>
                  </div>
                </div>
              </div>
              <div className="rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src="https://picsum.photos/seed/training/800/600" 
                  alt="Specialized training"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
