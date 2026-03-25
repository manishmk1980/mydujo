import React, { useEffect, useState } from 'react';
import {
    Medal,
    Clock,
    ClipboardList,
    CheckCircle2,
    Search,
    Filter,
    Users,
    Loader2,
    ArrowRight
} from 'lucide-react';
import { PageContainer } from '../../components/layout/PageContainer';
import { PageHeader } from '../../components/layout/PageHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { instructorService, AssignedStudent } from '../../services/instructorService';
import { cn } from '../../lib/utils';

/**
 * Instructor-admin grading page. Review student readiness for rank tests
 * and update grading-related progress for assigned students.
 */
export default function InstructorGrading() {
    const [students, setStudents] = useState<AssignedStudent[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        async function fetchGradingData() {
            try {
                const data = await instructorService.getMyStudents();
                setStudents(data);
            } catch (err) {
                console.error('Failed to fetch grading data:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchGradingData();
    }, []);

    const filteredStudents = students.filter(s =>
        s.fullName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const stats = [
        { label: 'Ready for Review', value: students.filter(s => (s.gradingProgress?.syllabusCompletionPercent ?? 0) >= 80).length, icon: ClipboardList, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Pending Notes', value: students.filter(s => !s.gradingProgress?.readinessStatus).length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Upcoming Candidates', value: students.length, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    ];

    if (loading) {
        return (
            <PageContainer>
                <div className="flex flex-col items-center justify-center min-h-[400px]">
                    <Loader2 className="size-8 text-primary animate-spin mb-4" />
                    <p className="text-slate-500 font-medium">Loading grading progress...</p>
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <PageHeader
                title="Grading Review"
                description="Monitor student grading readiness and update syllabus completion for assigned trainees."
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
                        <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg} ${stat.color} opacity-10 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110`} />
                        <div className={`relative z-10 size-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
                            <stat.icon className="size-5" />
                        </div>
                        <div className="relative z-10">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                            <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search grading candidates..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-primary focus:ring-0 transition-all font-medium"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 flex items-center gap-2 hover:bg-slate-100 transition-colors">
                            <Filter className="size-3.5" /> Target Belt
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
                                        <th className="px-6 py-4">Syllabus %</th>
                                        <th className="px-6 py-4">Current Belt</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right pr-6">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredStudents.map((student) => (
                                        <tr key={student.id} className="hover:bg-slate-50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-slate-900">{student.fullName}</span>
                                                    <span className="text-[10px] text-slate-400 uppercase font-black tracking-tighter">Candidate</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                        <div
                                                            className={cn(
                                                                "h-full rounded-full transition-all",
                                                                (student.gradingProgress?.syllabusCompletionPercent ?? 0) >= 80 ? "bg-green-500" : "bg-blue-500"
                                                            )}
                                                            style={{ width: `${student.gradingProgress?.syllabusCompletionPercent ?? 0}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-[10px] font-black text-slate-700">{student.gradingProgress?.syllabusCompletionPercent ?? 0}%</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-[10px] font-black text-slate-600 uppercase border border-slate-200 px-2 py-1 rounded-md bg-white">
                                                    {student.currentBelt || 'White Belt'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className={cn(
                                                    "inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tighter",
                                                    (student.gradingProgress?.syllabusCompletionPercent ?? 0) >= 80 ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-600"
                                                )}>
                                                    {(student.gradingProgress?.syllabusCompletionPercent ?? 0) >= 80 ? <CheckCircle2 className="size-3" /> : <Clock className="size-3" />}
                                                    {student.gradingProgress?.readinessStatus ?? 'Building Skills'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right pr-6">
                                                <button className="p-2 text-slate-300 hover:text-primary transition-colors group-hover:translate-x-1 duration-200">
                                                    <ArrowRight className="size-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="py-24 max-w-lg mx-auto">
                            <EmptyState
                                icon={Medal}
                                title={searchQuery ? "No matching students" : "No grading reviews pending"}
                                description={searchQuery ? `No grading records found for "${searchQuery}"` : "When your assigned students approach their next rank test, their eligibility status will appear here for review."}
                            />
                        </div>
                    )}
                </div>
            </div>
        </PageContainer>
    );
}
