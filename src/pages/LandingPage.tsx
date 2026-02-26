import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  ChevronRight, 
  Star, 
  Shield, 
  Dumbbell, 
  Brain,
  MapPin,
  Send,
  Heart,
  Target,
  Trophy,
  Medal,
  Flame,
  Calendar
} from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background-light">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative w-full px-6 py-12 md:py-20 flex flex-col items-center">
          <div className="max-w-7xl w-full grid lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col gap-8"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 w-fit">
                <Star className="size-3 fill-primary" />
                <span className="text-xs font-bold uppercase tracking-widest">Elite Martial Arts Academy</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black leading-[1.1] tracking-tight text-slate-900">
                Build <span className="text-primary">Strength</span>, Discipline, and Character
              </h1>
              <p className="text-lg md:text-xl text-slate-600 max-w-xl">
                Join our world-class Karate and Judo training center. We specialize in transforming lives through traditional techniques and modern physical conditioning.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link to="/register" className="px-8 py-4 bg-primary text-white rounded-xl font-bold text-lg hover:scale-[1.02] transition-transform shadow-xl shadow-primary/30 flex items-center gap-2">
                  Register Now <ArrowRight className="size-5" />
                </Link>
                <Link to="/checkout" className="px-8 py-4 bg-slate-200 text-slate-900 rounded-xl font-bold text-lg hover:bg-slate-300 transition-colors">
                  Pay Fee
                </Link>
              </div>
              <div className="flex items-center gap-4 mt-2">
                <button className="flex items-center gap-2 text-primary font-bold hover:underline">
                  <ChevronRight className="size-5" />
                  Log Today's Attendance
                </button>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative"
            >
              <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl relative group">
                <img 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDQ_Zq-xIcS-0smKQjAd2ynBN6BmSJKWnjJEsVo5ylQFBkGBseaZBuzCASqQXpORrTjwJCkXNBoQrl0xdZCioKkgzOzjBydJySKVDDqR1RZHeZ1EKmVtbQdHRVMPnU3cLgqY-AusuxjnyYEeQ4kfxZMBTGNCKRiqs6SBuaNwtbK8NPe6j2kLJh7sZJgDHgHl2oohuEtKwoKL_-EAlwgASsyUR3IcgREbwRgShW3VqjEcYCRFk1oMtF2MCbuaPTH4VQv-fW_jPaHXys" 
                  alt="Martial arts students"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
                <div className="absolute bottom-8 left-8 right-8 p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-slate-200">
                          <img 
                            className="w-full h-full object-cover" 
                            src={`https://picsum.photos/seed/${i}/100/100`} 
                            alt={`User ${i}`}
                          />
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className="text-white text-sm font-bold">500+ Active Students</p>
                      <div className="flex text-yellow-400">
                        {[1, 2, 3, 4, 5].map((i) => <Star key={i} className="size-3 fill-current" />)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 bg-white px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-black mb-4">Why Choose Martial Arts?</h2>
              <p className="text-slate-600 max-w-2xl mx-auto">
                Beyond learning to fight, martial arts is about learning to live. Our programs are designed to enhance your mental and physical state.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: Dumbbell, title: 'Physical Fitness', desc: 'Improve coordination, strength, and core flexibility through high-intensity drills and traditional forms.' },
                { icon: Shield, title: 'Self-Defense', desc: 'Equip yourself with practical techniques and awareness to stay safe and confident in any environment.' },
                { icon: Brain, title: 'Character Building', desc: 'Develop iron-clad discipline, respect for others, and laser-like focus that translates to every area of life.' }
              ].map((benefit, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ y: -5 }}
                  className="p-8 rounded-2xl bg-background-light border border-slate-200 hover:border-primary transition-colors group"
                >
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-all">
                    <benefit.icon className="size-7" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{benefit.title}</h3>
                  <p className="text-slate-600">{benefit.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Programs Section */}
        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-black mb-4">Our Core Disciplines</h2>
                <p className="text-slate-600">Specialized training programs for all ages and skill levels.</p>
              </div>
              <Link className="text-primary font-bold flex items-center gap-1 hover:gap-2 transition-all" to="#">
                View Full Schedule <ChevronRight className="size-5" />
              </Link>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="relative overflow-hidden rounded-3xl group">
                <img className="w-full h-[400px] object-cover transition-transform duration-500 group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCyP9ZQeR-hSBehsWtYh8TPSjSSyIhM6uPCXnNIf6aJ6zb6LXsbj_5rw4rEMqoHJuC2kY7rhJOe46Z6BnvYlV4yj8qTLNJHStvy2AVyVNKp_iAR2E9-C7EUzNIx4lBnPaITEW2mEzXVMPSSplxURqBEu8RhPj89L4I50ckEzZe5PDH3fKrEPZabtrZYc13jSp8xTIQ4PSifLqWLRrANzkeDcJkpHPDDY40XCdFbDaRVy3yH-X1Sraq0qJwmSFEA09-r1qzyaVARMFQ" alt="Karate" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent flex flex-col justify-end p-8">
                  <div className="bg-primary px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-widest w-fit mb-4">Striking Art</div>
                  <h3 className="text-3xl font-bold text-white mb-2">Traditional Karate</h3>
                  <p className="text-slate-200 mb-6 max-w-sm">Focus on precision strikes, katas, and mental discipline. Perfect for all ages.</p>
                  <button className="px-6 py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-100 transition-colors w-fit">Learn More</button>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-3xl group">
                <img className="w-full h-[400px] object-cover transition-transform duration-500 group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCzEatoQoO855awH0yFUUej-JfDwEEds4FcHI-ZPkMha1QAdT3BJ1Br42Xcoi7eB-cLRSPF-07AxwaxIt1CNOZBSAst3BfiWoKEjAws4YaLfVRhVvZIdhTTIPny-GU-cDUnqwHbOm_tKi5aer-ju52w_K3_3MMi92JlNyuzDFs4lf-GD0BttuCrmOeI0MYh0gu4hv71z0BKa-7b2IHPaBbBdeXfRGlWo6eZYRsinXVmB3TpuSbjdCLwMlKu5qd85b-I4gq4B6yDUag" alt="Judo" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent flex flex-col justify-end p-8">
                  <div className="bg-primary px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-widest w-fit mb-4">Grappling Art</div>
                  <h3 className="text-3xl font-bold text-white mb-2">Kodokan Judo</h3>
                  <p className="text-slate-200 mb-6 max-w-sm">Master the art of throws, joint locks, and ground control. Exceptional for self-defense.</p>
                  <button className="px-6 py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-100 transition-colors w-fit">Learn More</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Specialized Tracks Section */}
        <section className="py-24 bg-slate-50 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16">
              <div className="max-w-2xl">
                <h2 className="text-4xl md:text-5xl font-black mb-6">Specialized <span className="text-primary">Training</span> Tracks</h2>
                <p className="text-slate-600 text-lg">We offer purpose-driven programs designed for specific life goals and career paths, led by expert instructors.</p>
              </div>
              <Link to="/programs" className="px-8 py-4 bg-white border-2 border-slate-200 rounded-2xl font-bold text-slate-900 hover:border-primary hover:text-primary transition-all flex items-center gap-2">
                Explore All Tracks <ChevronRight className="size-5" />
              </Link>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <motion.div 
                whileHover={{ y: -10 }}
                className="bg-white rounded-[3rem] p-10 shadow-xl border border-slate-100 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-pink-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700"></div>
                <div className="relative z-10">
                  <div className="size-14 rounded-2xl bg-pink-50 flex items-center justify-center text-pink-600 mb-8">
                    <Heart className="size-7" />
                  </div>
                  <h3 className="text-2xl font-black mb-4">Women & Girls Empowerment</h3>
                  <p className="text-slate-600 mb-8">Practical self-defense and confidence building in a supportive, female-led environment.</p>
                  <Link to="/programs" className="text-pink-600 font-bold flex items-center gap-2 group-hover:gap-3 transition-all">
                    Learn More <ArrowRight className="size-4" />
                  </Link>
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ y: -10 }}
                className="bg-slate-900 rounded-[3rem] p-10 shadow-xl text-white relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700"></div>
                <div className="relative z-10">
                  <div className="size-14 rounded-2xl bg-primary/20 flex items-center justify-center text-primary mb-8">
                    <Target className="size-7" />
                  </div>
                  <h3 className="text-2xl font-black mb-4">Armed Forces Recruitment Prep</h3>
                  <p className="text-slate-400 mb-8">High-intensity physical and mental training for candidates aspiring to join the forces.</p>
                  <Link to="/programs" className="text-primary font-bold flex items-center gap-2 group-hover:gap-3 transition-all">
                    Learn More <ArrowRight className="size-4" />
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Student Spotlight & Achievements Section */}
        <section className="py-24 bg-white px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-200 mb-6"
              >
                <Trophy className="size-3 fill-amber-700" />
                <span className="text-xs font-bold uppercase tracking-widest">Student Spotlight</span>
              </motion.div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">Celebrating <span className="text-primary">Excellence</span></h2>
              <p className="text-slate-600 max-w-2xl mx-auto text-lg">Recognizing the hard work, discipline, and outstanding achievements of our dedicated practitioners.</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 mb-16">
              {/* Performer of the Month */}
              <motion.div 
                whileHover={{ y: -10 }}
                className="lg:col-span-2 bg-slate-900 rounded-[3rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -mr-32 -mt-32"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                  <div className="relative">
                    <div className="size-48 rounded-full border-4 border-primary overflow-hidden shadow-2xl">
                      <img 
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDrTIYcy2Fr3S9WaKAHzodELcQxKHxBvIW2Blnc6TEl_XvITPkt1AW3gXN5jElC4_Tg0Rnd7SCY0taIwVq9DOk4ojrNCAeYiUhEakrvogI44EHrNQ6Laeqmur538z7hLFXlBDpO095WuuJbPE9d4c5o6NSPlVN9vcjFzDTWKGljv_j3nvkCIJFgxLUDe8JCQ5mC49A4vJMWRS7rGCzzVbiYkyzr4HRR_K3VYE9_IX9zB4OQ3h8ZhZDG1ZKd79uGfFZO7wIvVzhTuSI" 
                        alt="Performer of the Month"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                      Performer of the Month
                    </div>
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-3xl font-black mb-2">Alex Chen</h3>
                    <p className="text-primary font-bold mb-4 uppercase tracking-widest text-sm">Brown Belt • 1st Kyu</p>
                    <p className="text-slate-400 mb-6 leading-relaxed italic">
                      "Alex has demonstrated exceptional leadership this month, mentoring junior students while mastering the complex Kanku Dai kata with remarkable precision and spirit."
                    </p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-4">
                      <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold">
                        100% Attendance
                      </div>
                      <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold">
                        Syllabus Mastery: 92%
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Performers of the Week */}
              <div className="space-y-6">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Flame className="text-orange-500 size-6" />
                  Performers of the Week
                </h3>
                <div className="space-y-4">
                  {[
                    { name: 'Sarah J.', category: 'Technical Excellence', belt: 'Blue Belt', color: 'text-blue-500' },
                    { name: 'Rahul M.', category: 'Spirit & Discipline', belt: 'Orange Belt', color: 'text-orange-500' },
                    { name: 'Elena R.', category: 'Most Improved', belt: 'Green Belt', color: 'text-green-500' }
                  ].map((student, i) => (
                    <motion.div 
                      key={i}
                      whileHover={{ x: 10 }}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-4 group cursor-default"
                    >
                      <div className="size-12 rounded-full bg-white border border-slate-200 overflow-hidden shrink-0">
                        <img src={`https://picsum.photos/seed/${student.name}/100/100`} alt={student.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-black text-slate-900">{student.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{student.category}</p>
                      </div>
                      <div className={cn("text-[10px] font-black uppercase", student.color)}>
                        {student.belt}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Competition Hall of Fame */}
            <div className="bg-slate-50 rounded-[3rem] p-8 md:p-12 border border-slate-200">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2">Competition Hall of Fame</h3>
                  <p className="text-slate-500 text-sm">Recent merits and trophies earned by our competitive team.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-600">
                  <Medal className="size-4 text-primary" /> 12 Medals this Season
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { student: 'David Kim', event: 'National Karate Championship', achievement: 'Gold Medal (Kumite)', icon: Trophy, color: 'text-amber-500', photo: 'https://picsum.photos/seed/david/200/200' },
                  { student: 'Priya S.', event: 'National Karate Championship', achievement: 'Silver Medal (Kata)', icon: Medal, color: 'text-slate-400', photo: 'https://picsum.photos/seed/priya/200/200' },
                  { student: 'Marcus T.', event: 'State Judo Invitational', achievement: '1st Place (Heavyweight)', icon: Trophy, color: 'text-amber-500', photo: 'https://picsum.photos/seed/marcus/200/200' },
                  { student: 'Lisa W.', event: 'State Judo Invitational', achievement: 'Merit Award (Technical)', icon: Star, color: 'text-primary', photo: 'https://picsum.photos/seed/lisa/200/200' }
                ].map((item, i) => (
                  <motion.div 
                    key={i}
                    whileHover={{ scale: 1.05 }}
                    className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center group"
                  >
                    <div className="relative mb-4">
                      <div className="size-20 rounded-2xl overflow-hidden border-2 border-slate-100 group-hover:border-primary transition-colors">
                        <img src={item.photo} alt={item.student} className="w-full h-full object-cover" />
                      </div>
                      <div className={cn("absolute -bottom-2 -right-2 size-8 rounded-xl bg-white shadow-lg flex items-center justify-center border border-slate-50", item.color)}>
                        <item.icon className="size-4" />
                      </div>
                    </div>
                    <h4 className="font-black text-slate-900 mb-1">{item.student}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-3 tracking-wider">{item.event}</p>
                    <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest">
                      {item.achievement}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Upcoming Tournaments Section */}
        <section className="py-24 bg-slate-50 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16">
              <div className="max-w-2xl">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 mb-6"
                >
                  <Calendar className="size-3 fill-primary" />
                  <span className="text-xs font-bold uppercase tracking-widest">Event Calendar</span>
                </motion.div>
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">Upcoming <span className="text-primary">Tournaments</span></h2>
                <p className="text-slate-600 text-lg">Test your skills and represent the dojo in these upcoming regional and national competitions.</p>
              </div>
              <button className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center gap-2">
                Download Tournament Pack <ArrowRight className="size-5" />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  title: 'Regional Karate Open 2026',
                  date: 'March 15, 2026',
                  location: 'City Sports Arena, Downtown',
                  deadline: 'March 1, 2026',
                  eligibility: 'Yellow Belt (8th Kyu) and above',
                  categories: 'Kata, Kumite (Point Sparring)',
                  status: 'Registration Open',
                  color: 'border-primary'
                },
                {
                  title: 'Kodokan Judo Invitational',
                  date: 'April 10, 2026',
                  location: 'Westbay Martial Arts Center',
                  deadline: 'March 25, 2026',
                  eligibility: 'Green Belt (6th Kyu) and above',
                  categories: 'Randori, Ne-waza (Groundwork)',
                  status: 'Limited Slots',
                  color: 'border-amber-500'
                },
                {
                  title: 'National Junior Championship',
                  date: 'May 22, 2026',
                  location: 'National Stadium, Capital City',
                  deadline: 'May 5, 2026',
                  eligibility: 'Ages 8-16, All Belts',
                  categories: 'Kata, Team Sync Kata',
                  status: 'Coming Soon',
                  color: 'border-blue-500'
                },
                {
                  title: 'Elite Black Belt Seminar & Cup',
                  date: 'June 5, 2026',
                  location: 'MyDojo Headquarters',
                  deadline: 'May 20, 2026',
                  eligibility: 'Brown & Black Belts Only',
                  categories: 'Advanced Bunkai, Full Contact Kumite',
                  status: 'Invite Only',
                  color: 'border-slate-900'
                }
              ].map((event, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ y: -5 }}
                  className={cn(
                    "bg-white rounded-[2.5rem] p-8 shadow-xl border-l-8 flex flex-col md:flex-row gap-8 items-start",
                    event.color
                  )}
                >
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 px-3 py-1 rounded-full">
                        {event.status}
                      </span>
                      <div className="flex items-center gap-2 text-slate-400">
                        <Calendar className="size-4" />
                        <span className="text-xs font-bold">{event.date}</span>
                      </div>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900">{event.title}</h3>
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                      <MapPin className="size-4 shrink-0" />
                      {event.location}
                    </div>
                    
                    <div className="pt-4 border-t border-slate-50 space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          <Shield className="size-4 text-slate-400" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Eligibility Criteria</p>
                          <p className="text-sm font-bold text-slate-700">{event.eligibility}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          <Trophy className="size-4 text-slate-400" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Competition Categories</p>
                          <p className="text-sm font-bold text-slate-700">{event.categories}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="w-full md:w-32 flex flex-col gap-3">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Deadline</p>
                      <p className="text-xs font-black text-red-500">{event.deadline}</p>
                    </div>
                    <button className="w-full py-3 bg-primary text-white rounded-xl font-bold text-xs hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                      Register
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Locations Section */}
        <section className="py-20 bg-slate-900 text-white px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-black mb-6">Our Training Centers</h2>
                <p className="text-slate-400 mb-10 text-lg">We have multiple state-of-the-art facilities across the city to make your training journey convenient.</p>
                <div className="space-y-6">
                  {[
                    { title: 'Downtown Headquarters', addr: '123 Warrior Ave, Suite 100, City Center', tag: 'Main Training Hub' },
                    { title: 'Northside Satellite', addr: '852 Summit Drive, North District', tag: 'Kids & Beginners Focus' },
                    { title: 'Westbay Academy', addr: '45 Harbor Street, Westbay Area', tag: 'Advanced Competitive Team' }
                  ].map((loc, i) => (
                    <div key={i} className="flex items-start gap-4 p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/50 transition-colors">
                      <MapPin className="text-primary mt-1 size-6" />
                      <div>
                        <h4 className="font-bold text-xl mb-1">{loc.title}</h4>
                        <p className="text-slate-400 mb-2">{loc.addr}</p>
                        <span className="text-xs text-primary font-bold uppercase tracking-wider">{loc.tag}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative h-[500px] rounded-3xl overflow-hidden shadow-2xl">
                <img className="w-full h-full object-cover grayscale opacity-60" src="https://picsum.photos/seed/map/800/600" alt="Map" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <div className="absolute -inset-4 bg-primary/20 rounded-full animate-pulse"></div>
                    <MapPin className="text-primary size-12 relative z-10 fill-primary" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6">
          <div className="max-w-5xl mx-auto rounded-3xl bg-primary p-12 text-center text-white relative overflow-hidden shadow-2xl shadow-primary/40">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
            <h2 className="text-4xl font-black mb-6 relative z-10">Start Your Martial Arts Journey Today</h2>
            <p className="text-white/80 text-xl mb-10 max-w-2xl mx-auto relative z-10">
              Whether you are a complete beginner or looking to advance your skills, our dojo welcomes you.
            </p>
            <div className="flex flex-wrap justify-center gap-6 relative z-10">
              <Link to="/register" className="px-10 py-4 bg-white text-primary rounded-xl font-black text-lg hover:scale-105 transition-transform shadow-lg">
                Register Your Class
              </Link>
              <button className="px-10 py-4 bg-slate-900/20 backdrop-blur-sm border-2 border-white/40 text-white rounded-xl font-black text-lg hover:bg-white/10 transition-colors">
                Contact Instructor
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
