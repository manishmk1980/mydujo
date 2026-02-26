import React, { createContext, useContext, useState, useEffect } from 'react';

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  date: string;
  status: 'present' | 'absent';
}

interface AttendanceContextType {
  records: AttendanceRecord[];
  markAttendance: (record: Omit<AttendanceRecord, 'id'>) => void;
  removeAttendanceRecord: (studentId: string, classId: string, date: string) => void;
  getStudentAttendance: (studentId: string) => { present: number; total: number };
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

export function AttendanceProvider({ children }: { children: React.ReactNode }) {
  const [records, setRecords] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('mydojo_attendance');
    return saved ? JSON.parse(saved) : [
      // Mock initial data
      { id: '1', studentId: 'demo', studentName: 'Arjun Singh', classId: 'c1', className: 'Advanced Kumite', date: '2024-10-20', status: 'present' },
      { id: '2', studentId: 'demo', studentName: 'Arjun Singh', classId: 'c2', className: 'Kata Review', date: '2024-10-21', status: 'present' },
      { id: '3', studentId: 'demo', studentName: 'Arjun Singh', classId: 'c3', className: 'Fitness', date: '2024-10-22', status: 'absent' },
    ];
  });

  useEffect(() => {
    localStorage.setItem('mydojo_attendance', JSON.stringify(records));
  }, [records]);

  const markAttendance = (record: Omit<AttendanceRecord, 'id'>) => {
    const newRecord = { ...record, id: Math.random().toString(36).substr(2, 9) };
    setRecords(prev => [...prev, newRecord]);
  };

  const removeAttendanceRecord = (studentId: string, classId: string, date: string) => {
    setRecords(prev => prev.filter(r => !(r.studentId === studentId && r.classId === classId && r.date === date)));
  };

  const getStudentAttendance = (studentId: string) => {
    const studentRecords = records.filter(r => r.studentId === studentId);
    const present = studentRecords.filter(r => r.status === 'present').length;
    return { present, total: studentRecords.length };
  };

  return (
    <AttendanceContext.Provider value={{ records, markAttendance, removeAttendanceRecord, getStudentAttendance }}>
      {children}
    </AttendanceContext.Provider>
  );
}

export function useAttendance() {
  const context = useContext(AttendanceContext);
  if (context === undefined) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
}
