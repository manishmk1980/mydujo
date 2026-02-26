import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ChevronRight, 
  BookOpen, 
  Dumbbell, 
  Shield, 
  MessageSquare,
  ArrowLeft,
  ChevronDown,
  Trophy,
  Target,
  Users
} from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const beltCriteria = [
  {
    belt: 'Yellow Belt (8th Kyu)',
    color: 'bg-yellow-400',
    attendance: '20 Hours',
    mastery: '70%',
    mockGrading: 'Required',
    requirements: ['Heian Shodan Kata', 'Basic Kihon (Strikes/Blocks)', 'Standard Stances']
  },
  {
    belt: 'Green Belt (6th Kyu)',
    color: 'bg-green-500',
    attendance: '40 Hours',
    mastery: '75%',
    mockGrading: 'Required',
    requirements: ['Heian Sandan Kata', 'Intermediate Kumite Drills', 'Combination Techniques']
  },
  {
    belt: 'Blue Belt (4th Kyu)',
    color: 'bg-blue-500',
    attendance: '60 Hours',
    mastery: '80%',
    mockGrading: 'Required',
    requirements: ['Heian Godan Kata', 'Advanced Kihon Ippon Kumite', 'Focus and Kime Control']
  },
  {
    belt: 'Brown Belt (1st Kyu)',
    color: 'bg-[#634133]',
    attendance: '100 Hours',
    mastery: '85%',
    mockGrading: 'Mandatory',
    requirements: ['Kanku Dai & Enpi Katas', 'Jiyu Kumite (Free Sparring)', 'Technical Leadership']
  },
  {
    belt: 'Black Belt (1st Dan)',
    color: 'bg-black',
    attendance: '200+ Hours',
    mastery: '95%',
    mockGrading: 'Mandatory (Sensei Panel)',
    requirements: ['All Heian Katas + 2 Advanced', 'Advanced Kumite Strategy', 'Dojo Contribution']
  }
];

export default function GradingRequirements() {
  const [expandedBelt, setExpandedBelt] = useState<string | null>('Brown Belt (1st Kyu)');

  return (
    <div className="flex h-screen overflow-hidden bg-background-light">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <Link to="/grading" className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary transition-colors mb-2">
                <ArrowLeft className="size-4" /> Back to Roadmap
              </Link>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">Grading Criteria & Requirements</h2>
              <p className="text-slate-500 mt-1">Comprehensive standards for each belt rank progression.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-8">
              {/* Belt Rank Criteria Section */}
              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-6">
                  <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Trophy className="size-5" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Belt Rank Standards</h3>
                </div>

                <div className="space-y-3">
                  {beltCriteria.map((item) => (
                    <div 
                      key={item.belt}
                      className={cn(
                        "bg-white rounded-2xl border transition-all duration-300 overflow-hidden",
                        expandedBelt === item.belt ? "border-primary shadow-md" : "border-slate-200 shadow-sm"
                      )}
                    >
                      <button 
                        onClick={() => setExpandedBelt(expandedBelt === item.belt ? null : item.belt)}
                        className="w-full p-5 flex items-center justify-between text-left"
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn("size-4 rounded-full shadow-inner", item.color)}></div>
                          <span className="font-bold text-slate-900">{item.belt}</span>
                        </div>
                        <ChevronDown className={cn(
                          "size-5 text-slate-400 transition-transform duration-300",
                          expandedBelt === item.belt && "rotate-180"
                        )} />
                      </button>

                      <AnimatePresence>
                        {expandedBelt === item.belt && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="px-5 pb-6 pt-2 border-t border-slate-50">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Clock className="size-3.5 text-blue-500" />
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Min. Attendance</span>
                                  </div>
                                  <p className="text-sm font-bold text-slate-900">{item.attendance}</p>
                                </div>
                                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Target className="size-3.5 text-emerald-500" />
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Skill Mastery</span>
                                  </div>
                                  <p className="text-sm font-bold text-slate-900">{item.mastery}</p>
                                </div>
                                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Users className="size-3.5 text-amber-500" />
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mock Grading</span>
                                  </div>
                                  <p className="text-sm font-bold text-slate-900">{item.mockGrading}</p>
                                </div>
                              </div>

                              <div className="space-y-3">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Key Requirements</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {item.requirements.map((req, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                                      <CheckCircle2 className="size-4 text-green-500 shrink-0" />
                                      {req}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </section>

              {/* Technical Syllabus Breakdown */}
              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <BookOpen className="size-5" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Technical Syllabus (Current Grade)</h3>
                </div>
                
                <div className="space-y-6">
                  {[
                    { 
                      icon: BookOpen, 
                      title: 'Kata & Forms', 
                      desc: 'Traditional patterns demonstrating flow, power, and focus.',
                      items: [
                        { name: 'Kanku Dai', status: 'Mastered', feedback: 'Excellent rhythm and focus.' },
                        { name: 'Enpi', status: 'Mastered', feedback: 'Sharp transitions, good height on jump.' },
                        { name: 'Bassai Sho', status: 'In Progress', feedback: 'Need to focus on the slow movements in the middle section.' }
                      ]
                    },
                    { 
                      icon: Dumbbell, 
                      title: 'Kihon & Waza', 
                      desc: 'Basic techniques and combinations performed with maximum efficiency.',
                      items: [
                        { name: 'Advanced Striking Combos', status: 'Mastered', feedback: 'Strong kime in all strikes.' },
                        { name: 'Grappling / O-Soto-Gari', status: 'In Progress', feedback: 'Work on off-balancing the opponent earlier.' },
                        { name: 'Counter-Attacking Drills', status: 'Mastered', feedback: 'Great timing on the counter-gyaku-zuki.' }
                      ]
                    },
                    { 
                      icon: Shield, 
                      title: 'Sparring & Kumite', 
                      desc: 'Practical application of techniques in a controlled combat environment.',
                      items: [
                        { name: 'Jiyu Kumite (Free Sparring)', status: 'Mastered', feedback: 'Good distance control and spirit.' },
                        { name: 'Weapon Defense (Tanto)', status: 'Not Started', feedback: 'Scheduled for next month\'s seminar.' }
                      ]
                    }
                  ].map((section, i) => (
                    <section key={i} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                      <div className="p-6 border-b border-slate-100 flex items-center gap-4">
                        <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                          <section.icon className="size-6" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{section.title}</h3>
                          <p className="text-sm text-slate-500">{section.desc}</p>
                        </div>
                      </div>
                      <div className="divide-y divide-slate-100">
                        {section.items.map((item, j) => (
                          <div key={j} className="p-6 hover:bg-slate-50 transition-colors">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-bold text-slate-900">{item.name}</h4>
                              <span className={cn(
                                "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                item.status === 'Mastered' ? "bg-green-100 text-green-700" : 
                                item.status === 'In Progress' ? "bg-amber-100 text-amber-700" : 
                                "bg-slate-100 text-slate-500"
                              )}>
                                {item.status}
                              </span>
                            </div>
                            <div className="flex items-start gap-2">
                              <MessageSquare className="size-3 text-slate-400 mt-1 shrink-0" />
                              <p className="text-xs text-slate-500 italic">{item.feedback}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="font-bold text-lg mb-4">Training Hours</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-500">Required Hours</span>
                      <span className="font-bold">100 hrs</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-500">Logged Hours</span>
                      <span className="font-bold text-primary">102 hrs</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 w-full"></div>
                    </div>
                    <p className="text-[10px] text-green-600 font-bold mt-2 flex items-center gap-1">
                      <CheckCircle2 className="size-3" /> Requirement Met
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-lg">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <AlertCircle className="size-5 text-primary" />
                  Sensei's Verdict
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-6">
                  "Alex is showing great technical proficiency. The only remaining hurdle is the mastery of Bassai Sho and the weapon defense seminar. Once these are checked, he is ready for the Shodan exam."
                </p>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">Status</p>
                  <p className="text-sm font-bold text-amber-500">Pending Final Review</p>
                </div>
              </div>

              <button className="w-full py-4 bg-white border-2 border-slate-200 text-slate-900 rounded-2xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                Request Technical Review
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
