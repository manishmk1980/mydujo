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
    ArrowRight,
    X
} from 'lucide-react';
import { PageContainer } from '../../components/layout/PageContainer';
import { PageHeader } from '../../components/layout/PageHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { instructorService, AssignedStudent } from '../../services/instructorService';
import { cn } from '../../lib/utils';
import { useFlashToast } from '../../components/ui/FlashToast';

/**
 * Instructor-admin grading page. Review student readiness for rank tests
 * and update grading-related progress for assigned students.
 */
export default function InstructorGrading() {
    const toast = useFlashToast();
    const [students, setStudents] = useState<AssignedStudent[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [editing, setEditing] = useState<AssignedStudent | null>(null);
    const [saving, setSaving] = useState(false);
    const [gradingForm, setGradingForm] = useState({ percentage: 0, readinessStatus: '', instructorNotes: '' });

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

    const openGrading = (student: AssignedStudent) => {
        setEditing(student);
        setGradingForm({
            percentage: student.gradingProgress?.syllabusCompletionPercent ?? 0,
            readinessStatus: student.gradingProgress?.readinessStatus || '',
            instructorNotes: student.gradingProgress?.instructorNotes || '',
        });
    };

    const saveGrading = async () => {
        if (!editing) return;
        setSaving(true);
        try {
            const progress = await instructorService.updateStudentGrading(editing.id, {
                syllabusCompletionPercent: gradingForm.percentage,
                readinessStatus: gradingForm.readinessStatus || null,
                instructorNotes: gradingForm.instructorNotes || null,
            });
            setStudents((previous) => previous.map((student) => student.id === editing.id ? { ...student, gradingProgress: progress } : student));
            setEditing(null);
            toast.success('Grading progress updated.');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to update grading');
        } finally {
            setSaving(false);
        }
    };

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
                                                <button disabled={student.permissions?.canManageGrading === false} onClick={() => openGrading(student)} className="p-2 text-slate-400 hover:text-primary transition-colors group-hover:translate-x-1 duration-200 disabled:cursor-not-allowed disabled:opacity-30" aria-label={`Update grading for ${student.fullName}`}>
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
            {editing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4" onClick={() => setEditing(null)}>
                    <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
                        <div className="flex items-start justify-between gap-3"><div><h2 className="font-black text-slate-900">Update grading</h2><p className="text-sm text-slate-500">{editing.fullName}</p></div><button onClick={() => setEditing(null)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X className="size-4" /></button></div>
                        <div className="mt-5 space-y-4">
                            <label className="block space-y-1 text-sm font-bold text-slate-700">Syllabus completion ({gradingForm.percentage}%)<input type="range" min="0" max="100" value={gradingForm.percentage} onChange={(e) => setGradingForm((value) => ({ ...value, percentage: Number(e.target.value) }))} className="block w-full accent-orange-600" /></label>
                            <label className="block space-y-1 text-sm font-bold text-slate-700">Readiness status<select value={gradingForm.readinessStatus} onChange={(e) => setGradingForm((value) => ({ ...value, readinessStatus: e.target.value }))} className="block w-full rounded-xl border border-slate-200 px-4 py-3"><option value="">Select status</option><option value="BUILDING_SKILLS">Building skills</option><option value="NEEDS_REVIEW">Needs review</option><option value="READY">Ready</option><option value="NOT_READY">Not ready</option></select></label>
                            <label className="block space-y-1 text-sm font-bold text-slate-700">Instructor notes<textarea maxLength={512} value={gradingForm.instructorNotes} onChange={(e) => setGradingForm((value) => ({ ...value, instructorNotes: e.target.value }))} className="block min-h-24 w-full rounded-xl border border-slate-200 px-4 py-3" /></label>
                        </div>
                        <div className="mt-5 flex justify-end gap-2"><button onClick={() => setEditing(null)} className="min-h-11 rounded-xl border border-slate-200 px-4 text-sm font-bold">Cancel</button><button disabled={saving} onClick={() => void saveGrading()} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-orange-600 px-5 text-sm font-black text-white disabled:opacity-50">{saving && <Loader2 className="size-4 animate-spin" />} Save grading</button></div>
                    </div>
                </div>
            )}
        </PageContainer>
    );
}
