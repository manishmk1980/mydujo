import React from 'react';
import { 
  Users, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Filter, 
  ChevronRight,
  User,
  Medal,
  Calendar,
  MessageSquare,
  History,
  AlertCircle
} from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { cn } from '../lib/utils';

const pendingApprovals = [
  { id: 'STU-102', name: 'Alex Chen', currentBelt: 'Brown', targetBelt: 'Black', progress: 85, attendance: 102, lastGrading: '6 months ago', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDrTIYcy2Fr3S9WaKAHzodELcQxKHxBvIW2Blnc6TEl_XvITPkt1AW3gXN5jElC4_Tg0Rnd7SCY0taIwVq9DOk4ojrNCAeYiUhEakrvogI44EHrNQ6Laeqmur538z7hLFXlBDpO095WuuJbPE9d4c5o6NSPlVN9vcjFzDTWKGljv_j3nvkCIJFgxLUDe8JCQ5mC49A4vJMWRS7rGCzzVbiYkyzr4HRR_K3VYE9_IX9zB4OQ3h8ZhZDG1ZKd79uGfFZO7wIvVzhTuSI' },
  { id: 'STU-105', name: 'Sarah Miller', currentBelt: 'Blue', targetBelt: 'Purple', progress: 92, attendance: 64, lastGrading: '4 months ago', avatar: 'https://picsum.photos/seed/sarah/100/100' },
  { id: 'STU-108', name: 'David Kim', currentBelt: 'Yellow', targetBelt: 'Orange', progress: 78, attendance: 32, lastGrading: '2 months ago', avatar: 'https://picsum.photos/seed/david/100/100' },
  { id: 'STU-112', name: 'Elena Rossi', currentBelt: 'Green', targetBelt: 'Blue', progress: 88, attendance: 48, lastGrading: '5 months ago', avatar: 'https://picsum.photos/seed/elena/100/100' },
];

export default function InstructorQueue() {
  return (
    <div className="flex h-screen overflow-hidden bg-background-light">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">Grading Approval Queue</h2>
              <p className="text-slate-500 mt-1">Review and approve students for the upcoming Winter Grading session.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-white border border-slate-200 rounded-lg flex items-center gap-3">
                <Users className="size-5 text-primary" />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">Total Eligible</p>
                  <p className="text-sm font-bold">24 Students</p>
                </div>
              </div>
              <div className="px-4 py-2 bg-slate-900 text-white rounded-lg flex items-center gap-3">
                <Calendar className="size-5 text-primary" />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">Grading Date</p>
                  <p className="text-sm font-bold">Dec 15, 2024</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Queue Table */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                    <input 
                      type="text" 
                      placeholder="Search students..." 
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border-slate-200 rounded-lg text-sm focus:border-primary focus:ring-0"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 flex items-center gap-2">
                      <Filter className="size-3" /> All Belts
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Student ID</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Student</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Current / Target</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Progress</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Attendance</th>
                        <th className="px-6 py-4"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {pendingApprovals.map((stu) => (
                        <tr key={stu.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer group">
                          <td className="px-6 py-4">
                            <span className="text-xs font-black text-slate-900 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                              {stu.id}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img src={stu.avatar} alt={stu.name} className="size-10 rounded-full object-cover border border-slate-200" />
                              <div>
                                <p className="text-sm font-bold text-slate-900">{stu.name}</p>
                                <p className="text-[10px] text-slate-400 font-medium uppercase">Active Member</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-600">{stu.currentBelt}</span>
                              <ChevronRight className="size-3 text-slate-300" />
                              <span className="text-xs font-bold text-primary">{stu.targetBelt}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-primary" style={{ width: `${stu.progress}%` }}></div>
                              </div>
                              <span className="text-xs font-bold text-slate-900">{stu.progress}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-slate-900">{stu.attendance} hrs</span>
                              <span className="text-[10px] text-slate-400 uppercase font-bold">Logged</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button className="p-2 text-slate-400 hover:text-primary transition-colors">
                              <ChevronRight className="size-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Review Panel */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden sticky top-8">
                <div className="p-6 bg-slate-900 text-white">
                  <div className="flex items-center gap-4 mb-6">
                    <img 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDrTIYcy2Fr3S9WaKAHzodELcQxKHxBvIW2Blnc6TEl_XvITPkt1AW3gXN5jElC4_Tg0Rnd7SCY0taIwVq9DOk4ojrNCAeYiUhEakrvogI44EHrNQ6Laeqmur538z7hLFXlBDpO095WuuJbPE9d4c5o6NSPlVN9vcjFzDTWKGljv_j3nvkCIJFgxLUDe8JCQ5mC49A4vJMWRS7rGCzzVbiYkyzr4HRR_K3VYE9_IX9zB4OQ3h8ZhZDG1ZKd79uGfFZO7wIvVzhTuSI" 
                      alt="Alex Chen" 
                      className="size-16 rounded-full border-2 border-primary object-cover"
                    />
                    <div>
                      <h3 className="text-xl font-bold">Alex Chen</h3>
                      <p className="text-slate-400 text-sm">Brown Belt • 1st Kyu</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Attendance</p>
                      <p className="text-lg font-bold">102/100</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Syllabus</p>
                      <p className="text-lg font-bold">85%</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  <section>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Syllabus Checklist</h4>
                    <div className="space-y-3">
                      {[
                        { label: 'Kanku Dai Kata', status: 'Mastered' },
                        { label: 'Enpi Kata', status: 'Mastered' },
                        { label: 'Bassai Sho Kata', status: 'In Progress' },
                        { label: 'Jiyu Kumite (Sparring)', status: 'Mastered' },
                        { label: 'Technical Kihon', status: 'Mastered' }
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-700">{item.label}</span>
                          {item.status === 'Mastered' ? (
                            <CheckCircle2 className="size-4 text-green-500" />
                          ) : (
                            <Clock className="size-4 text-amber-500" />
                          )}
                        </div>
                      ))}
                    </div>
                  </section>

                  <section>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Instructor Feedback</h4>
                    <textarea 
                      className="w-full bg-slate-50 border-slate-200 rounded-xl p-3 text-sm focus:border-primary focus:ring-0 h-24"
                      placeholder="Add private notes or feedback for the student..."
                    ></textarea>
                  </section>

                  <div className="grid grid-cols-2 gap-3">
                    <button className="py-3 px-4 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2">
                      <XCircle className="size-4" /> Defer
                    </button>
                    <button className="py-3 px-4 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
                      <CheckCircle2 className="size-4" /> Approve
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
