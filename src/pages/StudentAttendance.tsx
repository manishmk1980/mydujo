import React from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { Calendar, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { PageHeader } from '../components/layout/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';

/**
 * Student-admin attendance page. Read-only view of the student's official
 * attendance records. Students cannot edit or override attendance data.
 */
export default function StudentAttendance() {
  const { attendance, loading, error, refreshAttendance } = useAttendance();

  const approvedCount = attendance.filter((record) => record.status === 'approved').length;
  const totalCount = attendance.length;
  const attendanceRate =
    totalCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 0;

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
            <CheckCircle2 className="size-3.5" />
            Approved
          </span>
        );

      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
            <XCircle className="size-3.5" />
            Rejected
          </span>
        );

      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
            <Clock className="size-3.5" />
            Pending
          </span>
        );
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="My Attendance"
        description="View your attendance history recorded and validated by your dojo."
        actions={
          <button
            onClick={() => refreshAttendance()}
            disabled={loading}
            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        }
      />

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
            Total Records
          </p>
          <p className="text-2xl font-black text-slate-900">{totalCount}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
            Approved
          </p>
          <p className="text-2xl font-black text-green-600">{approvedCount}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
            Rate
          </p>
          <p className="text-2xl font-black text-slate-900">
            {totalCount > 0 ? `${attendanceRate}%` : '—'}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">Attendance History</h3>
          <p className="text-sm text-slate-500 mt-0.5">
            Your validated attendance records
          </p>
        </div>

        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="p-12 text-center text-slate-400">
              <Clock className="size-12 mx-auto mb-3 animate-pulse" />
              Loading attendance...
            </div>
          ) : attendance.length === 0 ? (
            <div className="py-8">
              <EmptyState
                icon={Calendar}
                title="No attendance records yet"
                description="Your attendance will appear here once your instructor marks and validates it."
              />
            </div>
          ) : (
            attendance.map((record) => (
              <div
                key={record.id}
                className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50"
              >
                <div className="flex gap-4">
                  <div className="size-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                    <Calendar className="size-6 text-slate-500" />
                  </div>

                  <div>
                    <p className="font-bold text-slate-900">
                      {record.class_session?.title || 'Class'}
                    </p>

                    <p className="text-sm text-slate-500">
                      {record.attendance_date &&
                        new Date(record.attendance_date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      {record.source && ` • Source: ${record.source}`}
                    </p>

                    {record.notes && (
                      <p className="text-xs text-slate-400 mt-1">{record.notes}</p>
                    )}
                  </div>
                </div>

                <div className="shrink-0">{renderStatusBadge(record.status)}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </PageContainer>
  );
}