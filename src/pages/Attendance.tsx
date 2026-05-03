import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { attendanceService } from '../services/attendanceService';
import { Check, X, User, Calendar, Search, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { useFlashToast } from '../components/ui/FlashToast';

import { studentService, DBStudent } from '../services/studentService';
import { metaService, type DisciplineOption } from '../services/metaService';

const classes = [
  { id: 'c1', name: 'Advanced Kumite' },
  { id: 'c2', name: 'Kata Technical Review' },
  { id: 'c3', name: 'General Fitness' },
];

export default function AttendancePage() {
  const toast = useFlashToast();
  const [students, setStudents] = useState<DBStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<Array<{ studentId: string; attendanceDate: string; notes: string | null; status: string; id: string }>>([]);
  const [selectedClass, setSelectedClass] = useState(classes[0].id);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [disciplineOptions, setDisciplineOptions] = useState<DisciplineOption[]>([]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const data = await studentService.getAllStudents();
        setStudents(data);
      } catch (err) {
        console.error('Failed to fetch students', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  useEffect(() => {
    metaService
      .getDisciplines()
      .then((data) => setDisciplineOptions(data || []))
      .catch(() => setDisciplineOptions([]));
  }, []);

  const getDisciplineMeta = (value: string | null) => {
    if (!value) return null;
    return disciplineOptions.find((d) => d.value === value) || null;
  };

  const fetchRecordsForDate = async () => {
    if (students.length === 0) return;
    setRefreshing(true);
    try {
      const all = await Promise.all(
        students.map((s) => attendanceService.getStudentAttendance(s.id))
      );
      const dateStr = date;
      const merged: typeof records = [];
      all.forEach((list, i) => {
        const studentId = students[i].id;
        list
          .filter((r) => (r.attendance_date || '').slice(0, 10) === dateStr && (r.notes || '').includes(selectedClass))
          .forEach((r) => merged.push({
            studentId,
            attendanceDate: r.attendance_date || '',
            notes: r.notes,
            status: r.status,
            id: r.id,
          }));
      });
      setRecords(merged);
    } catch (err) {
      console.error('Failed to fetch attendance', err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRecordsForDate();
  }, [students, date, selectedClass]);

  const handleMark = async (studentId: string, _studentName: string, status: 'present' | 'absent') => {
    const className = classes.find((c) => c.id === selectedClass)?.name || '';
    try {
      const created = await attendanceService.createAttendance({
        student_id: studentId,
        attendance_date: date,
        source: 'instructor',
        notes: `${selectedClass}: ${className}`,
      });
      const newStatus = status === 'present' ? 'approved' : 'rejected';
      await attendanceService.updateAttendanceStatus(created.id, newStatus);
      setRecords((prev) => [
        ...prev.filter((r) => !(r.studentId === studentId && (r.notes || '').includes(selectedClass))),
        {
          studentId,
          attendanceDate: date,
          notes: `${selectedClass}: ${className}`,
          status: newStatus,
          id: created.id,
        },
      ]);
    } catch (err) {
      toast.error('Failed to mark attendance');
    }
  };

  const handleReset = async (studentId: string) => {
    const rec = records.find((r) => r.studentId === studentId && (r.notes || '').includes(selectedClass));
    if (!rec) return;
    try {
      await attendanceService.updateAttendanceStatus(rec.id, 'rejected');
      setRecords((prev) => prev.filter((r) => r.id !== rec.id));
    } catch (err) {
      toast.error('Failed to reset attendance');
    }
  };

  const isMarked = (studentId: string) => {
    return records.some((r) => r.studentId === studentId && (r.notes || '').includes(selectedClass));
  };

  const getStatus = (studentId: string) => {
    const rec = records.find((r) => r.studentId === studentId && (r.notes || '').includes(selectedClass));
    if (!rec) return undefined;
    return rec.status === 'approved' ? 'present' : 'absent';
  };

  const filteredStudents = students.filter(s => s.full_name.toLowerCase().includes(searchTerm.toLowerCase()));

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
                  {loading ? (
                    <tr>
                      <td colSpan={3} className="px-8 py-12 text-center text-slate-400">
                        <div className="flex items-center justify-center gap-2">
                          <RefreshCw className="size-4 animate-spin" />
                          Loading students...
                        </div>
                      </td>
                    </tr>
                  ) : filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-8 py-12 text-center text-slate-400">
                        No students found.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student) => {
                      const marked = isMarked(student.id);
                      const status = getStatus(student.id);

                      return (
                        <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                              <div className="size-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                <User className="size-5" />
                              </div>
                              <span className="text-sm font-bold text-slate-900">{student.full_name}</span>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            {(() => {
                              const discipline = getDisciplineMeta(student.preferred_discipline);
                              return (
                                <div className="flex items-center gap-2">
                                  {(discipline?.imageUrl || discipline?.image_url) ? (
                                    <img
                                      src={discipline.imageUrl || discipline.image_url || ''}
                                      alt={discipline.label}
                                      className="size-6 rounded-md object-cover border border-slate-200"
                                    />
                                  ) : null}
                                  <span className="text-xs font-medium text-slate-500 uppercase tracking-tighter">
                                    {discipline?.label || student.preferred_discipline?.replace('_', ' ') || 'General'}
                                  </span>
                                </div>
                              );
                            })()}
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
                                    onClick={() => handleMark(student.id, student.full_name, 'present')}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-green-500 text-green-600 hover:bg-green-500 hover:text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-sm active:scale-95"
                                  >
                                    <Check className="size-4 stroke-[3]" /> Present
                                  </button>
                                  <button
                                    onClick={() => handleMark(student.id, student.full_name, 'absent')}
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
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
