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
        <div className="flex flex-col h-full bg-white rounded-[2.5rem] overflow-hidden">
            <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 leading-tight">Assign Students</h2>
                    <p className="text-slate-500 text-sm mt-1">Instructor: <span className="font-bold text-primary">{instructorName}</span></p>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                >
                    <X className="size-6 text-slate-400" />
                </button>
            </div>

            <div className="p-6 border-b border-slate-50">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search students to assign..."
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary/10 transition-all outline-none text-sm font-medium"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-3">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="size-10 animate-spin text-primary" />
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
                                className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${isAssigned ? 'bg-primary/5 border-primary/20 shadow-sm' : 'bg-white border-slate-100 hover:border-slate-300'}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`size-10 rounded-xl flex items-center justify-center font-bold ${isAssigned ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'}`}>
                                        {student.full_name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 leading-tight">{student.full_name}</p>
                                        <p className="text-[10px] font-medium text-slate-500 mt-0.5">{student.email}</p>
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
                                        className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-primary hover:text-white transition-all disabled:opacity-50"
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

            <div className="p-8 border-t border-slate-100 bg-slate-50/30">
                <button
                    onClick={onClose}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:scale-[1.02] transition-transform shadow-lg shadow-slate-900/10"
                >
                    Done Managing Assignments
                </button>
            </div>
        </div>
    );
}
