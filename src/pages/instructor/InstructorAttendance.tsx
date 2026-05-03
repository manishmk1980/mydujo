import React, { useEffect, useState } from 'react';
import {
    CalendarCheck,
    ClipboardList,
    Clock,
    CheckCircle2,
    XCircle,
    Filter,
    Search,
    Loader2,
} from 'lucide-react';
import { PageContainer } from '../../components/layout/PageContainer';
import { PageHeader } from '../../components/layout/PageHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { useFlashToast } from '../../components/ui/FlashToast';
import { attendanceService, AttendanceRecord } from '../../services/attendanceService';
import { cn } from '../../lib/utils';

/**
 * Instructor-admin attendance page. Focused on reviewing and marking
 * attendance for assigned classes and students.
 */
export default function InstructorAttendance() {
    const toast = useFlashToast();
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        async function fetchAttendance() {
            try {
                const data = await attendanceService.getInstructorAttendance();
                setRecords(data);
            } catch (err) {
                console.error('Failed to fetch attendance:', err);
                setError('Failed to load attendance records.');
            } finally {
                setLoading(false);
            }
        }
        fetchAttendance();
    }, []);

    const filteredRecords = records.filter(record =>
        (record as any).student?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.notes?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const stats = [
        { label: 'Total Records', value: records.length, icon: ClipboardList, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Pending Review', value: records.filter(r => r.status === 'pending').length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Approved', value: records.filter(r => r.status === 'approved').length, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
        { label: 'Rejected', value: records.filter(r => r.status === 'rejected').length, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
    ];

    if (loading) {
        return (
            <PageContainer>
                <div className="flex flex-col items-center justify-center min-h-[400px]">
                    <Loader2 className="size-8 text-primary animate-spin mb-4" />
                    <p className="text-slate-500 font-medium">Loading attendance data...</p>
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <PageHeader
                title="Attendance Management"
                description="Review and validate student attendance for your assigned classes and training sessions."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className={`size-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
                            <stat.icon className="size-5" />
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                        <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Find record by student..."
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-primary focus:ring-0 focus:scale-[1.01] transition-all"
                            />
                        </div>
                        <button className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 flex items-center gap-2">
                            <Filter className="size-3.5" /> Class
                        </button>
                        <button className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 flex items-center gap-2">
                            <Clock className="size-3.5" /> This Month
                        </button>
                    </div>
                </div>

                <div className="flex-1">
                    {filteredRecords.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        <th className="px-6 py-4">Student</th>
                                        <th className="px-6 py-4">Session</th>
                                        <th className="px-6 py-4">Date / Time</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredRecords.map((record) => (
                                        <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-sm text-slate-900">
                                                {(record as any).student?.full_name || 'Unknown Student'}
                                            </td>
                                            <td className="px-6 py-4 text-xs font-medium text-slate-500">
                                                {record.class_session?.title || 'General Training'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-slate-700">{record.attendance_date}</span>
                                                    <span className="text-[10px] text-slate-400">
                                                        {record.check_in_time ? new Date(record.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className={cn(
                                                    "inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold",
                                                    record.status === 'approved' ? "bg-green-50 text-green-700" :
                                                        record.status === 'rejected' ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"
                                                )}>
                                                    {record.status.toUpperCase()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {record.status === 'pending' && (
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={async () => {
                                                                try {
                                                                    await attendanceService.updateAttendanceStatus(record.id, 'approved');
                                                                    setRecords(prev => prev.map(r => r.id === record.id ? { ...r, status: 'approved' } : r));
                                                                } catch (err) { toast.error('Failed to update status'); }
                                                            }}
                                                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                        >
                                                            <CheckCircle2 className="size-4" />
                                                        </button>
                                                        <button
                                                            onClick={async () => {
                                                                try {
                                                                    await attendanceService.updateAttendanceStatus(record.id, 'rejected');
                                                                    setRecords(prev => prev.map(r => r.id === record.id ? { ...r, status: 'rejected' } : r));
                                                                } catch (err) { toast.error('Failed to update status'); }
                                                            }}
                                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        >
                                                            <XCircle className="size-4" />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="py-24">
                            <EmptyState
                                icon={CalendarCheck}
                                title={searchQuery ? "No results found" : "No attendance records found"}
                                description={searchQuery ? `We couldn't find any records for "${searchQuery}"` : "Your managed attendance history will appear here once you mark or review student attendance."}
                            />
                        </div>
                    )}
                </div>
            </div>
        </PageContainer>
    );
}
