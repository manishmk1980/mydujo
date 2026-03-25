import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import {
  Users,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  PauseCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Edit,
  Save,
  Trash2,
  Key,
  HandCoins,
} from 'lucide-react';
import { AspectRatio } from '../../components/ui/aspect-ratio';

import { studentService, DBStudent as Student } from '../../services/studentService';

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  paused: 'bg-orange-100 text-orange-700',
  rejected: 'bg-red-100 text-red-700',
};

const STATUS_ICONS: Record<string, typeof Clock> = {
  pending: Clock,
  approved: CheckCircle2,
  paused: PauseCircle,
  rejected: XCircle,
};

function renderStatusBadge(status: string) {
  const styles = STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-700';
  const Icon = STATUS_ICONS[status];
  const label = status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown';

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-sm font-medium ${styles}`}>
      {Icon && <Icon className="size-3.5" />}
      {label}
    </span>
  );
}

export default function AdminStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [validatingId, setValidatingId] = useState<string | null>(null);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await studentService.getAllStudents();
      setStudents(data || []);
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Unable to load students');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleStatusChange = async (
    studentId: string,
    newStatus: 'pending' | 'approved' | 'paused' | 'rejected'
  ) => {
    setValidatingId(studentId);

    try {
      const updated = await studentService.updateStudentStatus(studentId, newStatus);

      setStudents((prev) =>
        prev.map((s) =>
          s.id === studentId
            ? ({ ...s, ...(updated as Record<string, unknown>), status: (updated as { status: string }).status } as Student)
            : s
        )
      );

      setFlashMessage({
        message: `Student status updated to ${newStatus}`,
        type: 'success',
      });
    } catch (err: unknown) {
      console.error(err);
      setFlashMessage({
        message: err instanceof Error ? err.message : 'Failed to update student status',
        type: 'error',
      });
    } finally {
      setValidatingId(null);
    }
  };

  const pendingCount = students.filter((s) => s.status === 'pending').length;
  const approvedCount = students.filter((s) => s.status === 'approved').length;
  const rejectedCount = students.filter((s) => s.status === 'rejected').length;
  const pausedCount = students.filter((s) => s.status === 'paused').length;

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Student>>({});
  const [isUpdating, setIsUpdating] = useState(false);

  type ConfirmPayload = { id?: string; email?: string };
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    variant: 'danger' | 'primary';
    confirmLabel: string;
    cancelLabel: string;
    onConfirm: () => void | Promise<void>;
    payload?: ConfirmPayload;
  }>({ open: false, title: '', message: '', variant: 'primary', confirmLabel: 'Confirm', cancelLabel: 'Cancel', onConfirm: () => {} });

  const [flashMessage, setFlashMessage] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  const startEditing = (student: Student) => {
    setEditingId(student.id);
    setEditForm(student);
  };

  const updateStudent = async () => {
    if (!editingId) return;
    setIsUpdating(true);
    try {
      // Admin can edit these; Instructor, Training Center, Belt/Rank, Payment are super-admin only
      await studentService.updateStudent(editingId, {
        full_name: editForm.full_name,
        phone: editForm.phone,
        date_of_birth: editForm.date_of_birth,
        gender: editForm.gender,
        blood_group: editForm.blood_group,
        emergency_contact: editForm.emergency_contact,
        preferred_discipline: editForm.preferred_discipline,
        parent_guardian_name: editForm.parent_guardian_name,
        aadhar_number: editForm.aadhar_number,
        qualification: editForm.qualification,
        address: editForm.address,
        pincode: editForm.pincode,
        city: editForm.city,
        state: editForm.state,
        locality: editForm.locality,
        school_college_name: editForm.school_college_name,
        school_college_location_city: editForm.school_college_location_city,
        school_college_location_state: editForm.school_college_location_state,
        school_college_location_pin: editForm.school_college_location_pin,
        // instructor_name, training_center_id: super admin only - not sent
      });
      setEditingId(null);
      await fetchStudents();
    } catch (error: unknown) {
      setFlashMessage({
        message: error instanceof Error ? 'Update failed: ' + error.message : 'Update failed',
        type: 'error',
      });
    }
    setIsUpdating(false);
  };

  const confirmDeleteStudent = (id: string) => {
    setConfirmDialog({
      open: true,
      title: 'Delete student record?',
      message: 'This will permanently delete this student record and all associated data.',
      variant: 'danger',
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      payload: { id },
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, open: false }));
        try {
          await studentService.deleteStudent(id);
          if (expandedId === id) setExpandedId(null);
          if (editingId === id) setEditingId(null);
          await fetchStudents();
        } catch (err) {
          console.error(err);
          setFlashMessage({ message: 'Failed to delete student', type: 'error' });
        }
      },
    });
  };

  const deleteStudent = (id: string) => confirmDeleteStudent(id);

  const confirmStatusChange = (
    student: Student,
    newStatus: 'pending' | 'approved' | 'paused' | 'rejected'
  ) => {
    const statusLabels: Record<string, string> = {
      pending: 'mark as pending',
      approved: 'approve',
      paused: 'pause',
      rejected: 'reject',
    };

    const isDanger = newStatus === 'rejected' || newStatus === 'paused';

    setConfirmDialog({
      open: true,
      title: `${statusLabels[newStatus].charAt(0).toUpperCase() + statusLabels[newStatus].slice(1)} student?`,
      message: `Are you sure you want to ${statusLabels[newStatus]} "${student.full_name}"?`,
      variant: isDanger ? 'danger' : 'primary',
      confirmLabel:
        newStatus === 'approved'
          ? 'Approve'
          : newStatus === 'paused'
            ? 'Pause'
            : newStatus === 'rejected'
              ? 'Reject'
              : 'Confirm',
      cancelLabel: 'Cancel',
      payload: { id: student.id },
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, open: false }));
        await handleStatusChange(student.id, newStatus);
      },
    });
  };

  const confirmSendPasswordReset = (email: string) => {
    setConfirmDialog({
      open: true,
      title: 'Send password reset link?',
      message: `Do you want to send a password reset link to ${email}?`,
      variant: 'primary',
      confirmLabel: 'Send link',
      cancelLabel: 'Cancel',
      payload: { email },
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, open: false }));
        const { error } = await authService.resetPasswordForEmail(email);
        if (error) {
          setFlashMessage({ message: 'Error: ' + error.message, type: 'error' });
        } else {
          setFlashMessage({ message: 'Password reset link sent successfully!', type: 'success' });
        }
      },
    });
  };

  const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  const formatDiscipline = (d: string | null) =>
    d
      ? d
        .split('_')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
      : '—';

  return (
    <div className="space-y-8">
      {flashMessage && (
        <div
          role="alert"
          className={`rounded-2xl border p-4 flex items-center justify-between ${
            flashMessage.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-700'
              : 'bg-green-50 border-green-200 text-green-700'
          }`}
        >
          <span className="font-medium">{flashMessage.message}</span>
          <button
            onClick={() => setFlashMessage(null)}
            className="text-current opacity-70 hover:opacity-100 p-1 -mr-1"
            aria-label="Dismiss"
          >
            <XCircle className="size-5" />
          </button>
        </div>
      )}

      {confirmDialog.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
        >
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 max-w-md w-full">
            {confirmDialog.variant === 'danger' ? (
              <div className="flex flex-col items-center text-center">
                <div className="size-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                  <Trash2 className="size-6 text-red-600" />
                </div>
                <h2 id="confirm-title" className="text-lg font-bold text-slate-900">
                  {confirmDialog.title}
                </h2>
                <p className="mt-2 text-slate-600">{confirmDialog.message}</p>
                <div className="mt-6 flex gap-3 w-full">
                  <button
                    onClick={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}
                    className="flex-1 px-4 py-2.5 rounded-xl font-medium text-slate-900 bg-white border border-slate-200 hover:bg-slate-50"
                  >
                    {confirmDialog.cancelLabel}
                  </button>
                  <button
                    onClick={() => confirmDialog.onConfirm()}
                    className="flex-1 px-4 py-2.5 rounded-xl font-medium text-white bg-red-600 hover:bg-red-700"
                  >
                    {confirmDialog.confirmLabel}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-center mb-4">
                  <div className="size-12 rounded-full bg-slate-100 flex items-center justify-center">
                    <Key className="size-6 text-slate-600" />
                  </div>
                </div>
                <h2 id="confirm-title" className="text-lg font-bold text-slate-900 text-center">
                  {confirmDialog.title}
                </h2>
                <p className="mt-2 text-slate-600 text-center">{confirmDialog.message}</p>
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}
                    className="flex-1 px-4 py-2.5 rounded-xl font-medium text-slate-900 bg-white border border-slate-200 hover:bg-slate-50"
                  >
                    {confirmDialog.cancelLabel}
                  </button>
                  <button
                    onClick={() => confirmDialog.onConfirm()}
                    className="flex-1 px-4 py-2.5 rounded-xl font-medium text-white bg-slate-900 hover:bg-slate-800"
                  >
                    {confirmDialog.confirmLabel}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-black text-slate-900">Student Registrations</h1>
        <p className="text-slate-500 mt-1">Manage and validate student registrations</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="size-12 animate-spin text-amber-500" />
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-600">
          {error}
        </div>
      ) : students.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-16 text-center text-slate-500">
            <Users className="size-16 mx-auto mb-4 text-slate-300" />
            <p className="font-medium">No student added yet.</p>
            <p className="text-sm mt-1">Student registrations will appear here.</p>
          </div>
        </div>
      ) : (
        <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-100 rounded-xl">
              <Clock className="size-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{pendingCount}</p>
              <p className="text-sm text-slate-500">Pending</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-xl">
              <CheckCircle2 className="size-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{approvedCount}</p>
              <p className="text-sm text-slate-500">Approved</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 rounded-xl">
              <PauseCircle className="size-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{pausedCount}</p>
              <p className="text-sm text-slate-500">Paused</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-xl">
              <XCircle className="size-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{rejectedCount}</p>
              <p className="text-sm text-slate-500">Rejected</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100">
            {students.map((s) => {
              const isExpanded = expandedId === s.id;
              const isValidatingRow = validatingId === s.id;

              return (
                <div key={s.id} className="p-6 hover:bg-slate-50/50 transition-colors">
                  <div
                    className="flex flex-col sm:flex-row sm:items-center gap-4 cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : s.id)}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="size-14 rounded-full bg-slate-200 overflow-hidden shrink-0">
                        <AspectRatio ratio={1 / 1}>
                          {s.profile_photo_url ? (
                            <img src={s.profile_photo_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <Users className="size-7" />
                            </div>
                          )}
                        </AspectRatio>
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{s.full_name}</p>
                        <p className="text-sm text-slate-500">{s.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {renderStatusBadge(s.status)}
                          <span className="text-xs text-slate-400">{formatDate(s.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {s.status === 'pending' && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              confirmStatusChange(s, 'approved');
                            }}
                            disabled={isValidatingRow}
                            className="px-4 py-2 bg-green-600 text-white rounded-xl font-medium text-sm hover:bg-green-700 disabled:opacity-60 flex items-center gap-2"
                          >
                            {isValidatingRow ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              <CheckCircle2 className="size-4" />
                            )}
                            Approve
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              confirmStatusChange(s, 'rejected');
                            }}
                            disabled={isValidatingRow}
                            className="px-4 py-2 bg-red-600 text-white rounded-xl font-medium text-sm hover:bg-red-700 disabled:opacity-60 flex items-center gap-2"
                          >
                            <XCircle className="size-4" />
                            Reject
                          </button>
                        </>
                      )}
                      {s.status === 'approved' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            confirmStatusChange(s, 'paused');
                          }}
                          disabled={isValidatingRow}
                          className="px-4 py-2 bg-amber-500 text-white rounded-xl font-medium text-sm hover:bg-amber-600 disabled:opacity-60 flex items-center gap-2"
                        >
                          {isValidatingRow ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <PauseCircle className="size-4" />
                          )}
                          Pause
                        </button>
                      )}
                      {s.status === 'paused' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            confirmStatusChange(s, 'approved');
                          }}
                          disabled={isValidatingRow}
                          className="px-4 py-2 bg-green-600 text-white rounded-xl font-medium text-sm hover:bg-green-700 disabled:opacity-60 flex items-center gap-2"
                        >
                          {isValidatingRow ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="size-4" />
                          )}
                          Reactivate
                        </button>
                      )}
                      {s.status === 'rejected' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            confirmStatusChange(s, 'approved');
                          }}
                          disabled={isValidatingRow}
                          className="px-4 py-2 bg-green-600 text-white rounded-xl font-medium text-sm hover:bg-green-700 disabled:opacity-60 flex items-center gap-2"
                        >
                          {isValidatingRow ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="size-4" />
                          )}
                          Approve Now
                        </button>
                      )}
                      <button className="p-2 text-slate-400 hover:text-slate-600">
                        {isExpanded ? <ChevronUp className="size-5" /> : <ChevronDown className="size-5" />}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-6 pt-6 border-t border-slate-100 space-y-8">
                      {editingId === s.id ? (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {/* Edit Form Fields */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Full Name</label>
                            <input
                              className="w-full bg-slate-50 border-slate-200 rounded-lg px-3 py-2 text-sm"
                              value={editForm.full_name || ''}
                              onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Phone</label>
                            <input
                              className="w-full bg-slate-50 border-slate-200 rounded-lg px-3 py-2 text-sm"
                              value={editForm.phone || ''}
                              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Date of Birth</label>
                            <input
                              type="date"
                              className="w-full bg-slate-50 border-slate-200 rounded-lg px-3 py-2 text-sm"
                              value={editForm.date_of_birth || ''}
                              onChange={(e) => setEditForm({ ...editForm, date_of_birth: e.target.value })}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Gender</label>
                            <select
                              className="w-full bg-slate-50 border-slate-200 rounded-lg px-3 py-2 text-sm"
                              value={editForm.gender || ''}
                              onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                            >
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Blood Group</label>
                            <input
                              className="w-full bg-slate-50 border-slate-200 rounded-lg px-3 py-2 text-sm"
                              value={editForm.blood_group || ''}
                              onChange={(e) => setEditForm({ ...editForm, blood_group: e.target.value })}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Emergency Contact</label>
                            <input
                              className="w-full bg-slate-50 border-slate-200 rounded-lg px-3 py-2 text-sm"
                              value={editForm.emergency_contact || ''}
                              onChange={(e) => setEditForm({ ...editForm, emergency_contact: e.target.value })}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Parents/Guardian Name</label>
                            <input
                              className="w-full bg-slate-50 border-slate-200 rounded-lg px-3 py-2 text-sm"
                              value={editForm.parent_guardian_name || ''}
                              onChange={(e) => setEditForm({ ...editForm, parent_guardian_name: e.target.value })}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Aadhar Number</label>
                            <input
                              className="w-full bg-slate-50 border-slate-200 rounded-lg px-3 py-2 text-sm"
                              value={editForm.aadhar_number || ''}
                              onChange={(e) => setEditForm({ ...editForm, aadhar_number: e.target.value })}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Class / Standard</label>
                            <input
                              className="w-full bg-slate-50 border-slate-200 rounded-lg px-3 py-2 text-sm"
                              value={editForm.qualification || ''}
                              onChange={(e) => setEditForm({ ...editForm, qualification: e.target.value })}
                            />
                          </div>
                          <div className="sm:col-span-2 space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Home Address</label>
                            <textarea
                              className="w-full bg-slate-50 border-slate-200 rounded-lg px-3 py-2 text-sm"
                              rows={2}
                              value={editForm.address || ''}
                              onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">City</label>
                            <input
                              className="w-full bg-slate-50 border-slate-200 rounded-lg px-3 py-2 text-sm"
                              value={editForm.city || ''}
                              onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">State</label>
                            <input
                              className="w-full bg-slate-50 border-slate-200 rounded-lg px-3 py-2 text-sm"
                              value={editForm.state || ''}
                              onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">PIN Code</label>
                            <input
                              className="w-full bg-slate-50 border-slate-200 rounded-lg px-3 py-2 text-sm"
                              value={editForm.pincode || ''}
                              onChange={(e) => setEditForm({ ...editForm, pincode: e.target.value })}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Institution Name</label>
                            <input
                              className="w-full bg-slate-50 border-slate-200 rounded-lg px-3 py-2 text-sm"
                              value={editForm.school_college_name || ''}
                              onChange={(e) => setEditForm({ ...editForm, school_college_name: e.target.value })}
                            />
                          </div>
                          {/* Super admin only - read-only */}
                          <div className="sm:col-span-2 space-y-2 p-4 rounded-xl bg-slate-50 border border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Super admin only (read-only)</p>
                            <div className="grid sm:grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-slate-500 text-[10px] font-bold uppercase mb-0.5">Assigned Instructor</p>
                                <p className="font-medium text-slate-700">{s.instructor_name || '—'}</p>
                              </div>
                              <div>
                                <p className="text-slate-500 text-[10px] font-bold uppercase mb-0.5">Center location</p>
                                <p className="font-medium text-slate-700">{(s.training_centers as { name?: string })?.name ?? '—'}</p>
                              </div>
                            </div>
                          </div>

                          <div className="sm:col-span-2 lg:col-span-3 flex justify-end gap-3 pt-4">
                            <button
                              onClick={() => setEditingId(null)}
                              className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={updateStudent}
                              disabled={isUpdating}
                              className="px-6 py-2 bg-primary text-white rounded-xl font-bold text-sm flex items-center gap-2"
                            >
                              {isUpdating ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                              Save Changes
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
                            <div>
                              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Phone</p>
                              <p className="font-medium text-slate-900">{s.phone || '—'}</p>
                            </div>
                            <div>
                              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Date of Birth</p>
                              <p className="font-medium text-slate-900">{formatDate(s.date_of_birth)}</p>
                            </div>
                            <div>
                              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Gender</p>
                              <p className="font-medium text-slate-900 capitalize">{s.gender || '—'}</p>
                            </div>
                            <div>
                              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Blood Group</p>
                              <p className="font-medium text-slate-900">{s.blood_group || '—'}</p>
                            </div>
                            <div>
                              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Emergency Contact</p>
                              <p className="font-medium text-slate-900">{s.emergency_contact || '—'}</p>
                            </div>
                            <div>
                              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Discipline</p>
                              <p className="font-medium text-slate-900">{formatDiscipline(s.preferred_discipline)}</p>
                            </div>
                            <div>
                              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Center location (super admin)</p>
                              <p className="font-medium text-slate-900">{(s.training_centers as { name?: string })?.name ?? '—'}</p>
                            </div>
                            <div>
                              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Parent/Guardian</p>
                              <p className="font-medium text-slate-900">{s.parent_guardian_name || '—'}</p>
                            </div>
                            <div>
                              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Aadhar Number</p>
                              <p className="font-medium text-slate-900">{s.aadhar_number || '—'}</p>
                            </div>
                            <div>
                              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Qualification (Class)</p>
                              <p className="font-medium text-slate-900">{s.qualification || '—'}</p>
                            </div>
                            <div className="sm:col-span-2">
                              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Address</p>
                              <p className="font-medium text-slate-900">
                                {s.address && `${s.address}, `}
                                {s.locality && `${s.locality}, `}
                                {s.city && `${s.city}, `}
                                {s.state && `${s.state} `}
                                {s.pincode && `- ${s.pincode}`}
                                {!s.address && '—'}
                              </p>
                            </div>
                            <div>
                              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Assigned Instructor (super admin)</p>
                              <p className="font-medium text-slate-900">{s.instructor_name || '—'}</p>
                            </div>
                            <div>
                              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Institution</p>
                              <p className="font-medium text-slate-900">{s.school_college_name || '—'}</p>
                            </div>
                            <div>
                              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Marketing Opt-in</p>
                              <p className="font-medium text-slate-900">{s.marketing_opt_in ? 'Yes' : 'No'}</p>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-50">
                            <div className="flex flex-wrap items-center gap-4">
                              <button
                                onClick={() => startEditing(s)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all shadow-md"
                              >
                                <Edit className="size-3.5" />
                                Edit Student Record
                              </button>
                              <button
                                onClick={() => confirmSendPasswordReset(s.email)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100 transition-all font-bold"
                              >
                                <Key className="size-3.5" />
                                Send Password Reset Link
                              </button>
                              <button
                                onClick={() => deleteStudent(s.id)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 transition-all"
                              >
                                <Trash2 className="size-3.5" />
                                Delete
                              </button>
                              {s.profile_photo_url && (
                                <a
                                  href={s.profile_photo_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all"
                                >
                                  <ExternalLink className="size-3.5" />
                                  View Full Photo
                                </a>
                              )}
                            </div>

                            <div className="ml-auto">
                              <Link
                                to={`/admin/fees?studentId=${encodeURIComponent(s.id)}`}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm border border-emerald-700/20 transition-all"
                              >
                                <HandCoins className="size-3.5" />
                                Raise Fee Request
                              </Link>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
      </div>
        </>
      )}
    </div>
  );
}
