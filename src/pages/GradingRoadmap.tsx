import React from 'react';
import { 
  CheckCircle2, 
  TrendingUp, 
  Lock, 
  Info, 
  Calendar,
  MessageSquare,
  FileText,
  Download,
  ChevronRight
} from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export default function GradingRoadmap() {
  return (
    <div className="flex h-screen overflow-hidden bg-background-light">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">Belt Grading Step-by-Step Roadmap</h2>
              <p className="text-slate-500 mt-1">Navigate your journey to Shodan mastery.</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Global Progress</span>
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold border border-primary/20">65% Overall</span>
            </div>
          </div>

          {/* Current Level Card */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <div className="size-12 rounded bg-[#634133] border-2 border-slate-300 flex items-center justify-center shadow-inner cursor-help">
                    <div className="w-full h-1 bg-black opacity-20"></div>
                  </div>
                  <Info className="absolute -top-2 -right-2 text-slate-400 size-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Current Level</p>
                  <p className="font-bold text-lg">Brown Belt (1st Kyu)</p>
                </div>
              </div>
              <div className="flex-1 max-w-xs mx-8 hidden md:block">
                <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="absolute inset-y-0 left-0 bg-primary w-2/3 rounded-full"></div>
                </div>
                <p className="text-center text-[10px] font-bold text-slate-400 uppercase mt-2">Next Grading Window: Dec 15th</p>
              </div>
              <div className="flex items-center gap-4 text-right">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Next Goal</p>
                  <p className="font-bold text-lg">Black Belt (1st Dan)</p>
                </div>
                <div className="relative group">
                  <div className="size-12 rounded bg-black border-2 border-slate-300 flex items-center justify-center shadow-inner cursor-help">
                    <div className="w-full h-1 bg-white opacity-20"></div>
                  </div>
                  <Info className="absolute -top-2 -right-2 text-slate-400 size-4" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-4 relative">
              <div className="roadmap-line"></div>
              
              {/* Step 1 */}
              <div className="relative pl-16">
                <div className="absolute left-3 top-0 size-8 rounded-full bg-green-500 border-4 border-white flex items-center justify-center text-white z-10">
                  <CheckCircle2 className="size-4" />
                </div>
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-green-600 uppercase">Step 1</span>
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded">Completed</span>
                        </div>
                        <h3 className="text-lg font-bold">Minimum Attendance (Hours)</h3>
                        <p className="text-sm text-slate-500">Requirement: 100 hours of training at current grade.</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-slate-900">100/100</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Hours Logged</p>
                      </div>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 w-full"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative pl-16">
                <div className="absolute left-3 top-0 size-8 rounded-full bg-primary border-4 border-white flex items-center justify-center text-white z-10">
                  <TrendingUp className="size-4" />
                </div>
                <div className="bg-white rounded-xl border-2 border-primary/30 shadow-md overflow-hidden ring-4 ring-primary/5">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-primary uppercase">Step 2</span>
                          <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded">In Progress</span>
                        </div>
                        <h3 className="text-lg font-bold">Skill Mastery (Katas & Techniques)</h3>
                        <p className="text-sm text-slate-500">Mastery of the 1st Kyu syllabus components.</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">72%</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Syllabus Completion</p>
                      </div>
                    </div>

                    {/* Interactive Progress Bar */}
                    <div className="relative mb-8 group/mastery">
                      <div className="h-4 bg-slate-100 rounded-full overflow-hidden cursor-help relative">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: '72%' }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full bg-primary relative"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20 animate-pulse" />
                        </motion.div>
                      </div>

                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-72 bg-slate-900 text-white p-5 rounded-[2rem] shadow-2xl opacity-0 invisible group-hover/mastery:opacity-100 group-hover/mastery:visible transition-all duration-300 z-50 pointer-events-none">
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-[10px] font-black text-primary uppercase tracking-widest mb-3">Katas</h4>
                            <div className="space-y-2">
                              {[
                                { name: 'Kanku Dai', status: 'completed' },
                                { name: 'Enpi', status: 'completed' },
                                { name: 'Bassai Sho', status: 'in-progress' },
                                { name: 'Unsu', status: 'locked' }
                              ].map((item) => (
                                <div key={item.name} className="flex items-center justify-between text-xs">
                                  <span className={cn(item.status === 'locked' ? "text-slate-500" : "text-white")}>{item.name}</span>
                                  {item.status === 'completed' && <CheckCircle2 className="size-3 text-green-500" />}
                                  {item.status === 'in-progress' && <TrendingUp className="size-3 text-primary" />}
                                  {item.status === 'locked' && <Lock className="size-3 text-slate-700" />}
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="h-px bg-white/10" />
                          <div>
                            <h4 className="text-[10px] font-black text-primary uppercase tracking-widest mb-3">Techniques</h4>
                            <div className="space-y-2">
                              {[
                                { name: 'Striking Combos', status: 'completed' },
                                { name: 'Footwork', status: 'completed' },
                                { name: 'O-Soto-Gari', status: 'in-progress' },
                                { name: 'Weapon Defense', status: 'locked' }
                              ].map((item) => (
                                <div key={item.name} className="flex items-center justify-between text-xs">
                                  <span className={cn(item.status === 'locked' ? "text-slate-500" : "text-white")}>{item.name}</span>
                                  {item.status === 'completed' && <CheckCircle2 className="size-3 text-green-500" />}
                                  {item.status === 'in-progress' && <TrendingUp className="size-3 text-primary" />}
                                  {item.status === 'locked' && <Lock className="size-3 text-slate-700" />}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        {/* Tooltip Arrow */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                        <div className="flex justify-between mb-2">
                          <span className="text-xs font-bold uppercase">Katas</span>
                          <span className="text-xs font-bold">2/3</span>
                        </div>
                        <div className="space-y-2">
                          {['Kanku Dai', 'Enpi'].map(kata => (
                            <div key={kata} className="flex items-center gap-2 text-xs">
                              <CheckCircle2 className="text-green-500 size-4" />
                              <span className="flex-1">{kata}</span>
                            </div>
                          ))}
                          <div className="flex items-center gap-2 text-xs opacity-50">
                            <div className="size-4 rounded-full border border-slate-400" />
                            <span className="flex-1">Bassai Sho</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                        <div className="flex justify-between mb-2">
                          <span className="text-xs font-bold uppercase">Techniques</span>
                          <span className="text-xs font-bold">4/6</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-xs">
                            <CheckCircle2 className="text-green-500 size-4" />
                            <span>Striking Combos</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <TrendingUp className="text-amber-500 size-4" />
                            <span>Grappling / O-Soto-Gari</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs opacity-50">
                            <div className="size-4 rounded-full border border-slate-400" />
                            <span>Weapon Defense</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative pl-16">
                <div className="absolute left-3 top-0 size-8 rounded-full bg-slate-200 border-4 border-white flex items-center justify-center text-slate-400 z-10">
                  <Lock className="size-4" />
                </div>
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden opacity-60">
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-slate-500 uppercase">Step 3</span>
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded">Locked</span>
                        </div>
                        <h3 className="text-lg font-bold">Pre-Grading Mock Exam</h3>
                        <p className="text-sm text-slate-500">Instructor evaluation to confirm readiness for the formal exam.</p>
                      </div>
                      <div className="text-right">
                        <button className="px-4 py-2 bg-slate-100 text-slate-400 rounded-lg text-xs font-bold cursor-not-allowed" disabled>
                          Req. Skill Mastery
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <MessageSquare className="size-5" />
                  </div>
                  <h4 className="font-bold text-slate-900">Sensei's Notes</h4>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed mb-4 italic">
                  "Alex, your Kanku Dai flow is excellent. Your transitions in Enpi are sharp. Focus on completing Bassai Sho study this week and your Mock Exam slot will open."
                </p>
                <p className="text-[10px] font-bold text-slate-400 uppercase">— Sensei Sato (Oct 12)</p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50/50">
                  <h3 className="font-bold text-sm flex items-center gap-2">
                    <Info className="text-primary size-4" />
                    Grading Hierarchy
                  </h3>
                </div>
                <div className="p-4 space-y-3">
                  {[
                    { rank: '9th - 7th Kyu', label: 'Beginner (White/Yellow/Orange)' },
                    { rank: '6th - 4th Kyu', label: 'Intermediate (Green/Blue/Purple)' },
                    { rank: '3rd - 1st Kyu', label: 'Advanced (Brown)', active: true },
                    { rank: '1st - 10th Dan', label: 'Mastery (Black)' }
                  ].map((item, i) => (
                    <div key={i} className={cn("flex items-center justify-between text-xs", item.active ? "font-bold text-primary" : "text-slate-500")}>
                      <span>{item.rank}</span>
                      <span className={cn(!item.active && "font-medium text-slate-900")}>{item.label}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-[10px] text-slate-400 leading-tight">Grading requires consistent spirit (Kokoro), technique (Gi), and physical strength (Tai).</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg">
                <h4 className="font-bold mb-2">Ready for Mock?</h4>
                <p className="text-xs text-slate-300 mb-4 leading-relaxed">You need to master 1 more Kata and 2 more Techniques to unlock the Pre-Grading request.</p>
                <button className="w-full bg-white text-slate-900 py-3 rounded-lg text-sm font-bold hover:bg-slate-100 transition-colors">
                  View Syllabus Guide
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <FileText className="size-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Download Technical Requirements</h4>
                <p className="text-sm text-slate-600">PDF guide including Embusen diagrams and Kumite rules.</p>
              </div>
            </div>
            <button className="whitespace-nowrap bg-primary text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-all flex items-center gap-2">
              <Download className="size-4" /> Download PDF
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
