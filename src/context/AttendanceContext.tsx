import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { attendanceService, type AttendanceRecord } from '../services/attendanceService';
import { useAuth } from './AuthContext';

interface AttendanceContextType {
  attendance: AttendanceRecord[];
  loading: boolean;
  error: string | null;
  refreshAttendance: () => Promise<void>;
  logAttendance: (payload: {
    attendance_date: string;
    class_session_id?: string | null;
    check_in_time?: string | null;
    check_out_time?: string | null;
    source?: string;
    notes?: string | null;
  }) => Promise<{ error?: string }>;
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

export function AttendanceProvider({ children }: { children: React.ReactNode }) {
  const { student, isAuthenticated } = useAuth();
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const studentId = student?.id || null;

  const refreshAttendance = async () => {
    if (!isAuthenticated || !studentId) {
      setAttendance([]);
      setError(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const rows = await attendanceService.getStudentAttendance(studentId);
      setAttendance(rows || []);
    } catch (err: unknown) {
      console.error('Failed to fetch attendance', err);
      setAttendance([]);
      setError(err instanceof Error ? err.message : 'Unable to load attendance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAttendance();
  }, [isAuthenticated, studentId]);

  const logAttendance = async (payload: {
    attendance_date: string;
    class_session_id?: string | null;
    check_in_time?: string | null;
    check_out_time?: string | null;
    source?: string;
    notes?: string | null;
  }) => {
    if (!studentId) {
      return { error: 'Student profile not found' };
    }

    try {
      setError(null);

      const created = await attendanceService.createAttendance({
        student_id: studentId,
        attendance_date: payload.attendance_date,
        class_session_id: payload.class_session_id || null,
        check_in_time: payload.check_in_time || null,
        check_out_time: payload.check_out_time || null,
        source: payload.source || 'student',
        notes: payload.notes || null,
      });

      setAttendance((prev) => [created, ...prev]);
      return {};
    } catch (err: unknown) {
      console.error('Failed to log attendance', err);
      const message = err instanceof Error ? err.message : 'Unable to log attendance';
      setError(message);
      return { error: message };
    }
  };

  const value = useMemo(
    () => ({
      attendance,
      loading,
      error,
      refreshAttendance,
      logAttendance,
    }),
    [attendance, loading, error]
  );

  return <AttendanceContext.Provider value={value}>{children}</AttendanceContext.Provider>;
}

export function useAttendance() {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
}
