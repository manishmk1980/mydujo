import React, { useEffect, useState } from 'react';
import {
    Users,
    Search,
    Plus,
    X,
    Loader2,
    CheckCircle2,
    GraduationCap,
    ArrowLeft,
    UserPlus,
    UserMinus
} from 'lucide-react';
import { instructorService } from '../../services/instructorService';
import { studentService, type DBStudent as Student } from '../../services/studentService';

interface ManagerProps {
    instructorId: string;
    instructorName: string;
    onClose: () => void;
    onUpdated?: () => void;
}

export function InstructorAssignmentManager({ instructorId, instructorName, onClose, onUpdated }: ManagerProps) {
    const [allStudents, setAllStudents] = useState<Student[]>([]);
    const [assignedStudentIds, setAssignedStudentIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [submittingId, setSubmittingId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const [students, assigned] = await Promise.all([
                    studentService.getAllStudents(),
                    instructorService.getInstructorStudents(instructorId)
                ]);

                setAllStudents(students || []);
                setAssignedStudentIds(new Set(assigned.map(s => s.id)));
            } catch (err) {
                console.error("Failed to load assignments", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [instructorId]);

    const handleAssign = async (studentId: string) => {
        setSubmittingId(studentId);
        try {
            await instructorService.assignStudent(instructorId, studentId);
            setAssignedStudentIds(prev => new Set([...prev, studentId]));
            onUpdated?.();
        } catch (err) {
            console.error(err);
        } finally {
            setSubmittingId(null);
        }
    };

    const handleUnassign = async (studentId: string) => {
        setSubmittingId(studentId);
        try {
            await instructorService.unassignStudent(instructorId, studentId);
            setAssignedStudentIds(prev => {
                const next = new Set(prev);
                next.delete(studentId);
                return next;
            });
            onUpdated?.();
        } catch (err) {
            console.error(err);
        } finally {
            setSubmittingId(null);
        }
    };

    const filteredStudents = allStudents.filter(s =>
        s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex h-full flex-col overflow-hidden rounded-[var(--admin-radius-card)] border border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-[var(--admin-shadow-card)]">
            <div className="flex items-center justify-between border-b border-[var(--admin-border)] bg-[var(--admin-surface-soft)] p-6 sm:p-8">
                <div>
                    <h2 className="text-2xl font-black leading-tight text-[var(--admin-text)]">Assign Students</h2>
                    <p className="mt-1 text-sm text-[var(--admin-text-muted)]">
                        Instructor: <span className="font-bold text-[var(--admin-primary)]">{instructorName}</span>
                    </p>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-full p-2 transition-colors hover:bg-[var(--admin-surface-soft)]"
                >
                    <X className="size-6 text-[var(--admin-text-muted)]" />
                </button>
            </div>

            <div className="border-b border-[var(--admin-border)] p-6">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[var(--admin-text-muted)]" />
                    <input
                        type="text"
                        placeholder="Search students to assign..."
                        className="admin-focus-ring w-full rounded-[var(--admin-radius-control)] border border-[var(--admin-border)] bg-[var(--admin-surface-soft)] py-3.5 pl-12 pr-4 text-sm font-medium text-[var(--admin-text)] outline-none transition-all focus:border-[var(--admin-primary-border)]"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="max-h-[min(60vh,520px)] flex-1 space-y-3 overflow-y-auto p-6">
                {loading ? (
                    <div className="flex flex-col items-center justify-center gap-4 py-20">
                        <Loader2 className="size-10 animate-spin text-[var(--admin-primary)]" />
                        <p className="text-sm font-bold text-slate-400">Loading students...</p>
                    </div>
                ) : filteredStudents.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                        <Users className="size-12 mx-auto mb-3 opacity-20" />
                        <p className="font-bold">No students found</p>
                    </div>
                ) : (
                    filteredStudents.map(student => {
                        const isAssigned = assignedStudentIds.has(student.id);
                        const isBusy = submittingId === student.id;

                        return (
                            <div
                                key={student.id}
                                className={`flex items-center justify-between rounded-[var(--admin-radius-control)] border p-4 transition-all ${isAssigned ? 'border-[var(--admin-primary-border)] bg-[var(--admin-primary-soft)] shadow-sm' : 'border-[var(--admin-border)] bg-[var(--admin-surface)] hover:border-[color-mix(in_srgb,var(--admin-text-muted)_35%,var(--admin-border))]'}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`flex size-10 items-center justify-center rounded-xl font-bold ${isAssigned ? 'bg-[var(--admin-primary)] text-white' : 'bg-[var(--admin-surface-soft)] text-[var(--admin-text-muted)]'}`}>
                                        {student.full_name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold leading-tight text-[var(--admin-text)]">{student.full_name}</p>
                                        <p className="mt-0.5 text-[10px] font-medium text-[var(--admin-text-muted)]">{student.email}</p>
                                    </div>
                                </div>

                                {isAssigned ? (
                                    <button
                                        onClick={() => handleUnassign(student.id)}
                                        disabled={isBusy}
                                        className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 transition-all disabled:opacity-50"
                                    >
                                        {isBusy ? <Loader2 className="size-3 animate-spin" /> : <UserMinus className="size-3.5" />}
                                        Unassign
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleAssign(student.id)}
                                        disabled={isBusy}
                                        className="flex items-center gap-1.5 rounded-xl bg-[var(--admin-surface-soft)] px-4 py-2 text-xs font-bold text-[var(--admin-text-muted)] transition-all hover:bg-[var(--admin-primary)] hover:text-white disabled:opacity-50"
                                    >
                                        {isBusy ? <Loader2 className="size-3 animate-spin" /> : <UserPlus className="size-3.5" />}
                                        Assign
                                    </button>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            <div className="border-t border-[var(--admin-border)] bg-[var(--admin-surface-soft)] p-6 sm:p-8">
                <button
                    type="button"
                    onClick={onClose}
                    className="w-full rounded-[var(--admin-radius-control)] bg-[var(--admin-ink)] py-4 text-sm font-bold text-white shadow-lg transition-transform hover:scale-[1.01] hover:opacity-95"
                >
                    Done Managing Assignments
                </button>
            </div>
        </div>
    );
}
