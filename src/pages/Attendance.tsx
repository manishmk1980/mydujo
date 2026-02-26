import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { useAttendance } from '../context/AttendanceContext';
import { Check, X, User, Calendar, Search, Filter, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

const students = [
  { id: 'demo', name: 'Arjun Singh', belt: 'Brown Belt' },
  { id: 's2', name: 'Priya Sharma', belt: 'Blue Belt' },
  { id: 's3', name: 'Rahul Verma', belt: 'Green Belt' },
  { id: 's4', name: 'Ananya Iyer', belt: 'Yellow Belt' },
  { id: 's5', name: 'Vikram Malhotra', belt: 'White Belt' },
];

const classes = [
  { id: 'c1', name: 'Advanced Kumite' },
  { id: 'c2', name: 'Kata Technical Review' },
  { id: 'c3', name: 'General Fitness' },
];

export default function AttendancePage() {
  const { markAttendance, removeAttendanceRecord, records } = useAttendance();
  const [selectedClass, setSelectedClass] = useState(classes[0].id);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');

  const handleMark = (studentId: string, studentName: string, status: 'present' | 'absent') => {
    const className = classes.find(c => c.id === selectedClass)?.name || '';
    markAttendance({
      studentId,
      studentName,
      classId: selectedClass,
      className,
      date,
      status
    });
  };

  const handleReset = (studentId: string) => {
    removeAttendanceRecord(studentId, selectedClass, date);
  };

  const isMarked = (studentId: string) => {
    return records.some(r => r.studentId === studentId && r.classId === selectedClass && r.date === date);
  };

  const getStatus = (studentId: string) => {
    return records.find(r => r.studentId === studentId && r.classId === selectedClass && r.date === date)?.status;
  };

  const filteredStudents = students.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">Class Attendance</h2>
              <p className="text-slate-500 mt-1">Mark daily attendance for your students.</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Select Class</label>
              <select 
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-0"
              >
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Date</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <input 
                  type="date" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border-slate-200 rounded-xl text-sm focus:border-primary focus:ring-0"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Search Student</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border-slate-200 rounded-xl text-sm focus:border-primary focus:ring-0"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Student</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Belt</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((student) => {
                    const marked = isMarked(student.id);
                    const status = getStatus(student.id);

                    return (
                      <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className="size-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                              <User className="size-5" />
                            </div>
                            <span className="text-sm font-bold text-slate-900">{student.name}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className="text-xs font-medium text-slate-500">{student.belt}</span>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center justify-center gap-3">
                            {marked ? (
                              <motion.div 
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="flex items-center gap-3"
                              >
                                <div className={cn(
                                  "flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider shadow-sm",
                                  status === 'present' 
                                    ? "bg-green-500 text-white shadow-green-200" 
                                    : "bg-red-500 text-white shadow-red-200"
                                )}>
                                  {status === 'present' ? <Check className="size-4 stroke-[3]" /> : <X className="size-4 stroke-[3]" />}
                                  {status === 'present' ? 'Present' : 'Absent'}
                                </div>
                                <button 
                                  onClick={() => handleReset(student.id)}
                                  className="p-2 text-slate-300 hover:text-slate-600 transition-colors"
                                  title="Change Status"
                                >
                                  <RefreshCw className="size-4" />
                                </button>
                              </motion.div>
                            ) : (
                              <div className="flex items-center gap-3">
                                <button 
                                  onClick={() => handleMark(student.id, student.name, 'present')}
                                  className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-green-500 text-green-600 hover:bg-green-500 hover:text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-sm active:scale-95"
                                >
                                  <Check className="size-4 stroke-[3]" /> Present
                                </button>
                                <button 
                                  onClick={() => handleMark(student.id, student.name, 'absent')}
                                  className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-red-500 text-red-600 hover:bg-red-500 hover:text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-sm active:scale-95"
                                >
                                  <X className="size-4 stroke-[3]" /> Absent
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
