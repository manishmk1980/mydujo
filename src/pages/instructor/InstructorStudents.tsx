import React, { useEffect, useState } from 'react';
import {
    Users,
    Search,
    Filter,
    Medal,
    Clock,
    User,
    Loader2,
    ArrowRight,
    BadgeCheck
} from 'lucide-react';
import { PageContainer } from '../../components/layout/PageContainer';
import { PageHeader } from '../../components/layout/PageHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { instructorService, AssignedStudent } from '../../services/instructorService';
import { cn } from '../../lib/utils';

/**
 * Instructor-admin assigned students page. Provides a list of students
 * managed by the logged-in instructor with high-level summaries.
 */
export default function InstructorStudents() {
    const [students, setStudents] = useState<AssignedStudent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        async function fetchStudents() {
            try {
                const data = await instructorService.getMyStudents();
                setStudents(data);
            } catch (err) {
                console.error('Failed to fetch students:', err);
                setError('Failed to load students.');
            } finally {
                setLoading(false);
            }
        }
        fetchStudents();
    }, []);

    const filteredStudents = students.filter(student =>
        student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const stats = [
        { label: 'Total Assigned', value: students.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Active This Term', value: students.filter(s => s.status === 'active' || s.status === 'approved').length, icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'Grading Eligible', value: students.filter(s => s.gradingProgress?.syllabusCompletionPercent === 100).length, icon: Medal, color: 'text-green-600', bg: 'bg-green-50' },
    ];

    if (loading) {
        return (
            <PageContainer>
                <div className="flex flex-col items-center justify-center min-h-[400px]">
                    <Loader2 className="size-8 text-primary animate-spin mb-4" />
                    <p className="text-slate-500 font-medium">Loading your students...</p>
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <PageHeader
                title="My Students"
                description="View and manage only the students assigned to your classes and training sessions."
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
                        <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg} ${stat.color} opacity-10 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110`} />
                        <div className="relative z-10">
                            <div className={`size-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
                                <stat.icon className="size-5" />
                            </div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                            <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px] flex flex-col">
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search assigned students..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-primary focus:ring-0 focus:bg-white transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 flex items-center gap-2 hover:bg-slate-100 transition-colors">
                            <Filter className="size-3.5" /> Filter by Rank
                        </button>
                    </div>
                </div>

                <div className="flex-1">
                    {filteredStudents.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        <th className="px-6 py-4">Student</th>
                                        <th className="px-6 py-4">Rank / Belt</th>
                                        <th className="px-6 py-4">Attendance Rate</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredStudents.map((student) => (
                                        <tr key={student.id} className="hover:bg-slate-50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                                                        {student.fullName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900 truncate max-w-[150px]">{student.fullName}</p>
                                                        <p className="text-[10px] text-slate-400 font-medium">{student.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className={cn(
                                                        "px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter border",
                                                        "bg-white text-slate-600 border-slate-200"
                                                    )}>
                                                        {student.currentBelt || 'White Belt'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                        <div className="h-full bg-blue-500 rounded-full" style={{ width: '85%' }} />
                                                    </div>
                                                    <span className="text-[10px] font-bold text-slate-600 tracking-tighter">85%</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className={cn(
                                                    "inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold",
                                                    student.status === 'active' || student.status === 'approved' ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-600"
                                                )}>
                                                    <BadgeCheck className="size-3" />
                                                    {student.status.toUpperCase()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="p-2 text-slate-400 hover:text-primary transition-colors">
                                                    <ArrowRight className="size-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                            <EmptyState
                                icon={User}
                                title={searchQuery ? "No results found" : "No students assigned yet"}
                                description={searchQuery ? `We couldn't find any students matching "${searchQuery}"` : "Your assigned student list will appear here once the dojo admin links students to your profile."}
                            />
                        </div>
                    )}
                </div>
            </div>
        </PageContainer>
    );
}
