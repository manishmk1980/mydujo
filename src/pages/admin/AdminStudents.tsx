import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import {
  Users,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  PauseCircle,
  ExternalLink,
  Edit,
  Save,
  Trash2,
  Key,
  HandCoins,
  Search,
  Eye,
  X,
  MapPin,
  BookOpen,
  UserCog,
  Mail,
  Phone,
  ChevronDown,
  UserRound,
  Home,
  GraduationCap,
  ShieldCheck,
  Settings,
  Camera,
} from 'lucide-react';
import { trainingCenterService, type TrainingCenter } from '../../services/trainingCenterService';
import { metaService, type DisciplineOption } from '../../services/metaService';

import { studentService, DBStudent as Student } from '../../services/studentService';
import { useAdminConfirm } from '../../components/admin/ui/AdminConfirmProvider';
import { AdminPageHeader } from '../../components/admin/ui/AdminPageHeader';
import { AdminLoadingState } from '../../components/admin/ui/AdminLoadingState';
import { AdminErrorState } from '../../components/admin/ui/AdminErrorState';
import { AdminEmptyState } from '../../components/admin/ui/AdminEmptyState';
import { pushDataLayer } from '../../lib/dataLayer';

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  paused: 'bg-[color-mix(in_srgb,var(--admin-warning)_18%,transparent)] text-[var(--admin-warning)]',
  rejected: 'bg-red-100 text-red-700',
};

const STATUS_ICONS: Record<string, typeof Clock> = {
  pending: Clock,
  approved: CheckCircle2,
  paused: PauseCircle,
  rejected: XCircle,
};

const BELT_GRADE_OPTIONS = [
  { value: 'WHITE_BELT', label: 'White Belt' },
  { value: 'COLOUR_BELT', label: 'Colour Belt' },
  { value: 'BLACK_BELT', label: 'Black Belt' },
] as const;

function formatBeltGrade(value?: string | null) {
  const match = BELT_GRADE_OPTIONS.find((opt) => opt.value === value);
  if (match) return match.label;
  return value ? value.replace(/_/g, ' ') : 'Not provided';
}

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

function safeText(value: unknown, fallback = 'Not provided') {
  if (value == null) return fallback;
  const text = String(value).trim();
  return text && !/[\uFFFD\u00C3]|\u00E2\u20AC/.test(text) ? text : fallback;
}

function getInitials(value?: string | null) {
  return safeText(value, 'Student')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');
}

function normalizeMediaUrl(raw?: string | null) {
  const value = raw?.trim();
  if (!value) return null;
  if (/^\/(?:api\/)?uploads\//i.test(value)) return value;
  try {
    const parsed = new URL(value);
    if (!['http:', 'https:'].includes(parsed.protocol) || typeof window === 'undefined') return null;
    const currentHost = window.location.hostname.toLowerCase();
    const mediaHost = parsed.hostname.toLowerCase();
    if (mediaHost !== currentHost && !['localhost', '127.0.0.1'].includes(mediaHost)) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

function buildAddress(student: Student) {
  return [student.address, student.locality, student.city, student.state, student.pincode]
    .filter((part) => safeText(part, ''))
    .join(', ') || 'Not provided';
}

function displayDate(value?: string | null) {
  if (!value) return 'Not provided';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Not provided'
    : date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function studentAnalyticsPayload(student: Student) {
  return {
    student_id: student.id,
    status: student.status,
    preferred_discipline: student.preferred_discipline || undefined,
    training_center_id: student.training_center_id || undefined,
    has_profile_photo: Boolean(normalizeMediaUrl(student.profile_photo_url)),
  };
}

function SafeAvatar({ student, className = '' }: { student: Student; className?: string }) {
  const [failed, setFailed] = useState(false);
  const url = normalizeMediaUrl(student.profile_photo_url);
  useEffect(() => setFailed(false), [student.id, url]);
  return (
    <div className={`relative flex shrink-0 items-center justify-center overflow-hidden bg-orange-50 font-black text-orange-700 ${className}`}>
      <span aria-hidden="true">{getInitials(student.full_name || student.email)}</span>
      {url && !failed ? (
        <img src={url} alt={`${safeText(student.full_name, 'Student')} profile`} className="absolute inset-0 size-full object-cover" onError={() => setFailed(true)} />
      ) : null}
    </div>
  );
}

type DetailItem = { label: string; value: React.ReactNode };
type DetailSection = { key: string; title: string; icon: typeof UserRound; items: DetailItem[]; preview?: string };

function DetailItems({ items, columns = 'sm:grid-cols-2' }: { items: DetailItem[]; columns?: string }) {
  return (
    <div className={`grid grid-cols-1 gap-x-5 gap-y-4 ${columns}`}>
      {items.map((item) => (
        <div key={item.label} className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{item.label}</p>
          <div className="mt-1 break-words text-sm font-semibold leading-5 text-slate-900">{item.value}</div>
        </div>
      ))}
    </div>
  );
}

function DetailCard({ section, columns }: { section: DetailSection; columns?: string }) {
  const Icon = section.icon;
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-black text-slate-950">
        <span className="flex size-7 items-center justify-center rounded-lg bg-violet-50 text-violet-700"><Icon className="size-4" /></span>
        {section.title}
      </h3>
      <DetailItems items={section.items} columns={columns} />
    </section>
  );
}

function MobileDetailAccordion({ sections }: { sections: DetailSection[] }) {
  const [openKey, setOpenKey] = useState('training');
  return (
    <div className="space-y-2 lg:hidden">
      {sections.map((section) => {
        const Icon = section.icon;
        const open = openKey === section.key;
        return (
          <section key={section.key} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <button type="button" aria-expanded={open} onClick={() => setOpenKey(open ? '' : section.key)} className="flex min-h-12 w-full items-center gap-3 px-3 py-2.5 text-left">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-700"><Icon className="size-4" /></span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-black text-slate-950">{section.title}</span>
                {section.preview && !open ? <span className="mt-0.5 block truncate text-[10px] font-medium text-slate-500">{section.preview}</span> : null}
              </span>
              <ChevronDown className={`size-4 shrink-0 text-slate-400 transition ${open ? 'rotate-180' : ''}`} />
            </button>
            {open ? <div className="border-t border-slate-100 bg-slate-50/60 p-4"><DetailItems items={section.items} /></div> : null}
          </section>
        );
      })}
    </div>
  );
}

function StudentDetailsReadOnly({
  student,
  discipline,
  onEdit,
  onAssign,
  onReset,
  onDelete,
}: {
  student: Student;
  discipline: DisciplineOption | null;
  onEdit: () => void;
  onAssign: () => void;
  onReset: () => void;
  onDelete: () => void;
}) {
  const photoUrl = normalizeMediaUrl(student.profile_photo_url);
  const disciplineImage = normalizeMediaUrl(discipline?.imageUrl || discipline?.image_url);
  const centerName = student.training_center_name || (student.training_centers as { name?: string } | null)?.name;
  const disciplineLabel = discipline?.label || safeText(student.preferred_discipline, 'Not provided').replace(/_/g, ' ');
  const schoolLocation = [student.school_college_location_city, student.school_college_location_state, student.school_college_location_pin].filter(Boolean).join(', ');
  const payload = studentAnalyticsPayload(student);
  const sections: DetailSection[] = [
    {
      key: 'personal', title: 'Personal Details', icon: UserRound,
      items: [
        { label: 'Full Name', value: safeText(student.full_name) },
        { label: 'Date of Birth', value: displayDate(student.date_of_birth) },
        { label: 'Gender', value: safeText(student.gender) },
        { label: 'Blood Group', value: safeText(student.blood_group) },
        { label: 'Aadhar Number', value: safeText(student.aadhar_number) },
      ],
    },
    {
      key: 'contact', title: 'Contact & Guardian', icon: Phone,
      items: [
        { label: 'Email', value: safeText(student.email) },
        { label: 'Phone', value: safeText(student.phone) },
        { label: 'Emergency Contact', value: safeText(student.emergency_contact) },
        { label: 'Parent / Guardian', value: safeText(student.parent_guardian_name) },
      ],
    },
    {
      key: 'training', title: 'Training & Assignment', icon: ShieldCheck,
      preview: `${disciplineLabel} · ${safeText(student.current_belt || student.belt_grade)} · ${safeText(student.current_rank_label)}`,
      items: [
        {
          label: 'Preferred Discipline',
          value: <span className="flex items-center gap-2">{disciplineImage ? <img src={disciplineImage} alt="" className="size-8 rounded-lg border border-slate-200 object-cover" /> : null}<span className="capitalize">{disciplineLabel}</span></span>,
        },
        { label: 'Training Center', value: safeText(centerName) },
        { label: 'Assigned Instructor', value: safeText(student.instructor_name) },
        { label: 'Belt / Grade', value: formatBeltGrade(student.belt_grade) },
        { label: 'Current Belt', value: safeText(student.current_belt) },
        { label: 'Current Rank', value: safeText(student.current_rank_label) },
        { label: 'Stripe Level', value: safeText(student.current_stripe_level) },
        { label: 'Next Grading Date', value: displayDate(student.next_grading_date) },
      ],
    },
    {
      key: 'education', title: 'Education', icon: GraduationCap,
      items: [
        { label: 'Qualification / Class', value: safeText(student.qualification) },
        { label: 'Institution', value: safeText(student.school_college_name) },
        { label: 'School / College Location', value: safeText(schoolLocation) },
      ],
    },
    {
      key: 'address', title: 'Address', icon: Home,
      items: [
        { label: 'Full Address', value: buildAddress(student) },
        { label: 'Locality', value: safeText(student.locality) },
        { label: 'City', value: safeText(student.city) },
        { label: 'State', value: safeText(student.state) },
        { label: 'PIN Code', value: safeText(student.pincode) },
      ],
    },
    {
      key: 'status', title: 'Status Summary', icon: ShieldCheck,
      items: [
        { label: 'Status', value: renderStatusBadge(student.status) },
        { label: 'Marketing Opt-in', value: student.marketing_opt_in ? 'Yes' : 'No' },
        { label: 'Terms Accepted', value: student.terms_accepted_at ? 'Yes' : 'No' },
        { label: 'Validated At', value: displayDate(student.validated_at) },
      ],
    },
    {
      key: 'system', title: 'System Information', icon: Settings,
      items: [
        { label: 'Registration ID', value: safeText(student.registration_id) },
        { label: 'Enrollment ID', value: safeText(student.enrollment_id) },
        { label: 'Registered On', value: displayDate(student.created_at) },
        { label: 'Last Updated', value: displayDate(student.updated_at) },
      ],
    },
    {
      key: 'photo', title: 'Profile Photo', icon: Camera,
      items: [{
        label: 'Photo',
        value: photoUrl ? (
          <a href={photoUrl} target="_blank" rel="noopener noreferrer" onClick={() => pushDataLayer('admin_student_photo_opened', payload)} className="inline-flex items-center gap-1.5 text-blue-700 underline">
            View Photo <ExternalLink className="size-3.5" />
          </a>
        ) : 'No valid profile photo available',
      }],
    },
  ];

  const actionClass = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-3 text-xs font-bold transition sm:px-4 sm:text-sm';

  return (
    <>
      <MobileDetailAccordion sections={sections} />

      <div className="hidden grid-cols-[minmax(0,1fr)_17rem] gap-4 lg:grid">
        <div className="space-y-4">
          <DetailCard section={sections[0]} columns="sm:grid-cols-3 xl:grid-cols-5" />
          <DetailCard section={sections[1]} columns="sm:grid-cols-2 xl:grid-cols-4" />
          <DetailCard section={sections[2]} columns="sm:grid-cols-2 xl:grid-cols-4" />
          <div className="grid grid-cols-2 gap-4">
            <DetailCard section={sections[3]} />
            <DetailCard section={sections[4]} />
          </div>
        </div>
        <aside className="space-y-4">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-black text-slate-950"><Camera className="size-4 text-violet-700" /> Profile Photo</h3>
            <SafeAvatar student={student} className="aspect-[4/3] w-full rounded-xl text-3xl" />
            {photoUrl ? (
              <a href={photoUrl} target="_blank" rel="noopener noreferrer" onClick={() => pushDataLayer('admin_student_photo_opened', payload)} className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 text-xs font-bold text-blue-700 hover:bg-blue-50">
                View Photo <ExternalLink className="size-3.5" />
              </a>
            ) : null}
          </section>
          <DetailCard section={sections[5]} columns="grid-cols-1" />
          <DetailCard section={sections[6]} columns="grid-cols-1" />
        </aside>
      </div>

      <div className="sticky bottom-0 z-20 -mx-3 mt-5 border-t border-slate-200 bg-white/95 px-3 py-3 shadow-[0_-10px_24px_rgba(15,23,42,0.06)] backdrop-blur-md sm:-mx-6 sm:px-6">
        <div className="grid grid-cols-2 gap-2 lg:flex lg:flex-wrap lg:items-center">
          <button onClick={onEdit} className={`${actionClass} border-slate-900 bg-slate-900 text-white hover:bg-slate-800`}><Edit className="size-3.5" /><span className="max-[360px]:hidden">Edit Record</span><span className="min-[361px]:hidden">Edit</span></button>
          <button onClick={onAssign} className={`${actionClass} border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100`}><MapPin className="size-3.5" />Assign</button>
          <button onClick={onReset} className={`${actionClass} border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100`}><Key className="size-3.5" /><span className="max-[360px]:hidden">Password Reset</span><span className="min-[361px]:hidden">Reset</span></button>
          {photoUrl ? <a href={photoUrl} target="_blank" rel="noopener noreferrer" onClick={() => pushDataLayer('admin_student_photo_opened', payload)} className={`${actionClass} hidden border-slate-200 bg-white text-slate-700 hover:bg-slate-50 lg:inline-flex`}><ExternalLink className="size-3.5" />View Photo</a> : null}
          <Link onClick={() => pushDataLayer('admin_student_fee_request_clicked', payload)} to={`/admin/fees?studentId=${encodeURIComponent(student.id)}&studentName=${encodeURIComponent(student.full_name)}`} className={`${actionClass} border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 lg:ml-auto`}><HandCoins className="size-3.5" />Fee Request</Link>
          <button onClick={onDelete} className={`${actionClass} col-span-2 mt-1 border-red-200 bg-red-50 text-red-700 hover:bg-red-100 lg:col-span-1 lg:mt-0`}><Trash2 className="size-3.5" /><span className="max-[360px]:hidden">Delete Student</span><span className="min-[361px]:hidden">Delete</span></button>
        </div>
      </div>
    </>
  );
}

export default function AdminStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [disciplineOptions, setDisciplineOptions] = useState<DisciplineOption[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [validatingId, setValidatingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'paused' | 'rejected'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 24;

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
    metaService
      .getDisciplines()
      .then((data) => setDisciplineOptions(data || []))
      .catch(() => setDisciplineOptions([]));
    trainingCenterService
      .getAllTrainingCenters()
      .then((data) => setTrainingCenters(data || []))
      .catch(() => setTrainingCenters([]));
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
  const totalCount = students.length;

  const filteredStudents = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return students.filter((s) => {
      const matchesStatus = statusFilter === 'all' ? true : s.status === statusFilter;
      if (!matchesStatus) return false;
      if (!q) return true;
      const centerName = (s.training_centers as { name?: string } | null)?.name || '';
      return (
        s.full_name?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        s.phone?.toLowerCase().includes(q) ||
        centerName.toLowerCase().includes(q)
      );
    });
  }, [students, searchTerm, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedStudents = filteredStudents.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);
  const selectedStudent = students.find((s) => s.id === selectedStudentId) || null;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Student>>({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [trainingCenters, setTrainingCenters] = useState<TrainingCenter[]>([]);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [assignForm, setAssignForm] = useState({ centerId: '', discipline: '', instructorName: '' });
  const [isAssigning, setIsAssigning] = useState(false);

  const confirm = useAdminConfirm();

  const [flashMessage, setFlashMessage] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  const startEditing = (student: Student) => {
    pushDataLayer('admin_student_edit_started', studentAnalyticsPayload(student));
    setEditingId(student.id);
    setEditForm(student);
  };

  const openStudentDetails = (student: Student) => {
    pushDataLayer('admin_student_detail_opened', studentAnalyticsPayload(student));
    setSelectedStudentId(student.id);
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
        belt_grade: editForm.belt_grade,
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

  const deleteStudent = async (id: string) => {
    const student = students.find((item) => item.id === id);
    if (student) pushDataLayer('admin_student_delete_clicked', studentAnalyticsPayload(student));
    const ok = await confirm({
      title: 'Delete record?',
      description:
        'This action cannot be undone. Please confirm before deleting this student record and all associated data.',
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await studentService.deleteStudent(id);
      if (selectedStudentId === id) setSelectedStudentId(null);
      if (editingId === id) setEditingId(null);
      await fetchStudents();
    } catch (err) {
      console.error(err);
      setFlashMessage({ message: 'Failed to delete student', type: 'error' });
    }
  };

  const confirmStatusChange = async (
    student: Student,
    newStatus: 'pending' | 'approved' | 'paused' | 'rejected'
  ) => {
    const statusLabels: Record<string, string> = {
      pending: 'mark as pending',
      approved: 'approve',
      paused: 'pause',
      rejected: 'reject',
    };
    const verb = statusLabels[newStatus];
    const title = `${verb.charAt(0).toUpperCase() + verb.slice(1)} student?`;
    const isDanger = newStatus === 'rejected' || newStatus === 'paused';
    const confirmLabel =
      newStatus === 'approved'
        ? 'Approve'
        : newStatus === 'paused'
          ? 'Pause'
          : newStatus === 'rejected'
            ? 'Reject'
            : 'Confirm';

    const ok = await confirm({
      title,
      description: `Are you sure you want to ${verb} "${student.full_name}"?`,
      confirmLabel,
      cancelLabel: 'Cancel',
      variant: isDanger ? 'danger' : 'default',
    });
    if (!ok) return;
    await handleStatusChange(student.id, newStatus);
  };

  const confirmSendPasswordReset = async (email: string) => {
    if (selectedStudent) pushDataLayer('admin_student_password_reset_clicked', studentAnalyticsPayload(selectedStudent));
    const ok = await confirm({
      title: 'Send password reset link?',
      description: `Do you want to send a password reset link to ${email}?`,
      confirmLabel: 'Send link',
      cancelLabel: 'Cancel',
      variant: 'default',
    });
    if (!ok) return;
    const { error } = await authService.resetPasswordForEmail(email);
    if (error) {
      setFlashMessage({ message: 'Error: ' + error.message, type: 'error' });
    } else {
      setFlashMessage({ message: 'Password reset link sent successfully!', type: 'success' });
    }
  };

  const openAssignDialog = (student: Student) => {
    pushDataLayer('admin_student_assign_clicked', studentAnalyticsPayload(student));
    setAssignForm({
      centerId: (student.training_centers as { id?: string } | null)?.id ?? '',
      discipline: student.preferred_discipline ?? '',
      instructorName: student.instructor_name ?? '',
    });
    setAssignDialogOpen(true);
  };

  const saveAssignment = async () => {
    if (!selectedStudentId) return;
    const ok = await confirm({
      title: 'Update student assignment?',
      description: "This will update the student's official center, discipline, or instructor assignment. This action is confirmed by MDPL admin/super admin only.",
      confirmLabel: 'Save assignment',
      cancelLabel: 'Cancel',
      variant: 'default',
    });
    if (!ok) return;
    setIsAssigning(true);
    try {
      await studentService.updateStudent(selectedStudentId, {
        preferred_discipline: assignForm.discipline || undefined,
        instructor_name: assignForm.instructorName || undefined,
        training_center_id: assignForm.centerId || undefined,
      });
      setAssignDialogOpen(false);
      await fetchStudents();
      setFlashMessage({ message: 'Assignment updated successfully.', type: 'success' });
    } catch (err) {
      setFlashMessage({ message: err instanceof Error ? err.message : 'Assignment failed', type: 'error' });
    } finally {
      setIsAssigning(false);
    }
  };

  const formatDate = (d: string | null) => displayDate(d);

  const formatDiscipline = (d: string | null) =>
    d
      ? d
        .split('_')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
      : 'Not provided';

  const getDisciplineMeta = (value: string | null) => {
    if (!value) return null;
    return disciplineOptions.find((d) => d.value === value) || null;
  };

  return (
    <div className="min-w-0 space-y-8">
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

      <AdminPageHeader
        title="Student registrations"
        subtitle="Manage and validate student registrations."
      />

      {loading ? (
        <AdminLoadingState label="Loading students…" className="min-h-[40vh]" />
      ) : error ? (
        <AdminErrorState message={error} />
      ) : students.length === 0 ? (
        <AdminEmptyState
          title="No students yet"
          description="Student registrations will appear here."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <p className="text-2xl font-bold text-slate-900">{totalCount}</p>
              <p className="text-sm text-slate-500">Total Students</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <p className="text-2xl font-bold text-slate-900">{pendingCount}</p>
              <p className="text-sm text-slate-500">Pending</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <p className="text-2xl font-bold text-slate-900">{approvedCount}</p>
              <p className="text-sm text-slate-500">Approved</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <p className="text-2xl font-bold text-slate-900">{pausedCount}</p>
              <p className="text-sm text-slate-500">Paused</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <p className="text-2xl font-bold text-slate-900">{rejectedCount}</p>
              <p className="text-sm text-slate-500">Rejected</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, email, phone, center..."
                  className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15"
              >
                <option value="all">All statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="paused">Paused</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="mt-3 text-xs text-slate-500">
              Showing {paginatedStudents.length} of {filteredStudents.length} filtered students ({totalCount} total).
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {paginatedStudents.map((s) => {
              const isValidatingRow = validatingId === s.id;
              const centerName = (s.training_centers as { name?: string } | null)?.name ?? 'Not provided';
              return (
                <div key={s.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col gap-4">
                  <div className="flex items-start gap-3">
                    <SafeAvatar student={s} className="size-14 rounded-full text-sm" />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-900 truncate">{s.full_name}</p>
                      <p className="text-sm text-slate-500 truncate">{s.email}</p>
                      <p className="text-xs text-slate-400 mt-1">Center: {centerName}</p>
                    </div>
                    {renderStatusBadge(s.status)}
                  </div>

                  <div className="text-xs text-slate-500 flex items-center justify-between">
                    <span>Joined: {formatDate(s.created_at || null)}</span>
                    <span className="flex items-center gap-1.5">
                      {(() => {
                        const discipline = getDisciplineMeta(s.preferred_discipline);
                        if (discipline?.imageUrl || discipline?.image_url) {
                          return (
                            <img
                              src={discipline.imageUrl || discipline.image_url || ''}
                              alt={discipline.label}
                              className="size-4 rounded object-cover border border-slate-200"
                            />
                          );
                        }
                        return null;
                      })()}
                      Discipline: {getDisciplineMeta(s.preferred_discipline)?.label || formatDiscipline(s.preferred_discipline)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => openStudentDetails(s)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
                    >
                      <Eye className="size-3.5" />
                      View Details
                    </button>

                    {s.status === 'pending' && (
                      <>
                        <button
                          onClick={() => void confirmStatusChange(s, 'approved')}
                          disabled={isValidatingRow}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-green-600 text-white text-xs font-semibold hover:bg-green-700 disabled:opacity-60"
                        >
                          {isValidatingRow ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />}
                          Approve
                        </button>
                        <button
                          onClick={() => void confirmStatusChange(s, 'rejected')}
                          disabled={isValidatingRow}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-700 disabled:opacity-60"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {s.status === 'approved' && (
                      <button
                        onClick={() => void confirmStatusChange(s, 'paused')}
                        disabled={isValidatingRow}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 text-white text-xs font-semibold hover:bg-amber-600 disabled:opacity-60"
                      >
                        {isValidatingRow ? <Loader2 className="size-3.5 animate-spin" /> : <PauseCircle className="size-3.5" />}
                        Pause
                      </button>
                    )}

                    {(s.status === 'paused' || s.status === 'rejected') && (
                      <button
                        onClick={() => void confirmStatusChange(s, 'approved')}
                        disabled={isValidatingRow}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-green-600 text-white text-xs font-semibold hover:bg-green-700 disabled:opacity-60"
                      >
                        {isValidatingRow ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />}
                        Reactivate
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-500">
              Page {safePage} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                className="px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-700 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                className="px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-700 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>

          {/* Assignment dialog */}
          {assignDialogOpen && selectedStudent && (
            <div
              className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
              onClick={() => setAssignDialogOpen(false)}
            >
              <div
                className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-slate-900">Assign: {selectedStudent.full_name}</h3>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Super admin / admin controlled. Final assignment will be saved on confirmation.
                    </p>
                  </div>
                  <button onClick={() => setAssignDialogOpen(false)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
                    <X className="size-4" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">
                      <MapPin className="size-3.5" /> Training Center
                    </label>
                    <select
                      value={assignForm.centerId}
                      onChange={(e) => setAssignForm((f) => ({ ...f, centerId: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-[var(--admin-primary)] focus:outline-none"
                    >
                      <option value="">No center assigned</option>
                      {trainingCenters.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">
                      <BookOpen className="size-3.5" /> Discipline
                    </label>
                    <select
                      value={assignForm.discipline}
                      onChange={(e) => setAssignForm((f) => ({ ...f, discipline: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-[var(--admin-primary)] focus:outline-none"
                    >
                      <option value="">No discipline assigned</option>
                      {disciplineOptions.map((d) => (
                        <option key={d.value} value={d.value}>{d.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">
                      <UserCog className="size-3.5" /> Instructor
                    </label>
                    <input
                      value={assignForm.instructorName}
                      onChange={(e) => setAssignForm((f) => ({ ...f, instructorName: e.target.value }))}
                      placeholder="Instructor name (optional)"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-[var(--admin-primary)] focus:outline-none"
                    />
                  </div>
                </div>
                <div className="mt-5 flex justify-end gap-3">
                  <button onClick={() => setAssignDialogOpen(false)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">
                    Cancel
                  </button>
                  <button
                    disabled={isAssigning}
                    onClick={() => void saveAssignment()}
                    className="inline-flex items-center gap-2 rounded-xl bg-[var(--admin-primary)] px-5 py-2.5 text-sm font-bold text-white hover:bg-[var(--admin-primary-hover)] disabled:opacity-50"
                  >
                    {isAssigning ? <Loader2 className="size-4 animate-spin" /> : null}
                    Save assignment
                  </button>
                </div>
              </div>
            </div>
          )}

          {selectedStudent && (
            <div
              className="fixed inset-0 z-50 flex items-end justify-center overflow-hidden bg-slate-900/60 p-0 backdrop-blur-sm sm:items-center sm:p-4 md:p-6"
              onClick={() => {
                setSelectedStudentId(null);
                setEditingId(null);
              }}
            >
              <div
                className="flex max-h-[100dvh] w-full max-w-6xl flex-col overflow-hidden rounded-none border border-slate-200 bg-slate-50 shadow-2xl sm:max-h-[calc(100dvh-2rem)] sm:rounded-3xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-3 py-3 backdrop-blur sm:px-6 sm:py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-3 sm:items-center sm:gap-4">
                      <SafeAvatar student={selectedStudent} className="size-14 rounded-2xl text-sm sm:size-20 sm:text-xl" />
                      <div className="min-w-0 pt-0.5">
                        <div className="flex min-w-0 flex-wrap items-center gap-2">
                          <h2 className="max-w-full break-words text-base font-black text-slate-950 sm:text-2xl">
                            {safeText(selectedStudent.full_name, selectedStudent.email || selectedStudent.phone || 'Unnamed Student')}
                          </h2>
                          {renderStatusBadge(selectedStudent.status)}
                        </div>
                        <div className="mt-1.5 flex min-w-0 flex-col gap-1 text-[11px] font-medium text-slate-500 sm:flex-row sm:flex-wrap sm:gap-x-4 sm:text-xs">
                          <span className="flex min-w-0 items-center gap-1.5"><Mail className="size-3.5 shrink-0" /><span className="truncate">{safeText(selectedStudent.email)}</span></span>
                          <span className="flex items-center gap-1.5"><Phone className="size-3.5 shrink-0" />{safeText(selectedStudent.phone)}</span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {selectedStudent.registration_id ? <span className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[9px] font-bold text-slate-600 sm:text-[10px]">Reg. ID&nbsp; {selectedStudent.registration_id}</span> : null}
                          {selectedStudent.enrollment_id ? <span className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[9px] font-bold text-slate-600 sm:text-[10px]">Enrollment ID&nbsp; {selectedStudent.enrollment_id}</span> : null}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedStudentId(null);
                        setEditingId(null);
                      }}
                      className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                      aria-label="Close details"
                    >
                      <X className="size-5" />
                    </button>
                  </div>
                </div>

                <div className="min-h-0 overflow-x-hidden overflow-y-auto px-3 pb-40 pt-3 sm:px-6 sm:pb-40 sm:pt-5 lg:pb-28">
                  {editingId === selectedStudent.id ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Full Name</label>
                        <input className="w-full bg-slate-50 border-slate-200 rounded-lg px-3 py-2 text-sm" value={editForm.full_name || ''} onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Phone</label>
                        <input className="w-full bg-slate-50 border-slate-200 rounded-lg px-3 py-2 text-sm" value={editForm.phone || ''} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Date of Birth</label>
                        <input type="date" className="w-full bg-slate-50 border-slate-200 rounded-lg px-3 py-2 text-sm" value={editForm.date_of_birth || ''} onChange={(e) => setEditForm({ ...editForm, date_of_birth: e.target.value })} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Gender</label>
                        <select className="w-full bg-slate-50 border-slate-200 rounded-lg px-3 py-2 text-sm" value={editForm.gender || ''} onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Blood Group</label>
                        <input className="w-full bg-slate-50 border-slate-200 rounded-lg px-3 py-2 text-sm" value={editForm.blood_group || ''} onChange={(e) => setEditForm({ ...editForm, blood_group: e.target.value })} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Emergency Contact</label>
                        <input className="w-full bg-slate-50 border-slate-200 rounded-lg px-3 py-2 text-sm" value={editForm.emergency_contact || ''} onChange={(e) => setEditForm({ ...editForm, emergency_contact: e.target.value })} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Parents/Guardian Name</label>
                        <input className="w-full bg-slate-50 border-slate-200 rounded-lg px-3 py-2 text-sm" value={editForm.parent_guardian_name || ''} onChange={(e) => setEditForm({ ...editForm, parent_guardian_name: e.target.value })} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Aadhar Number</label>
                        <input className="w-full bg-slate-50 border-slate-200 rounded-lg px-3 py-2 text-sm" value={editForm.aadhar_number || ''} onChange={(e) => setEditForm({ ...editForm, aadhar_number: e.target.value })} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Class / Standard</label>
                        <input className="w-full bg-slate-50 border-slate-200 rounded-lg px-3 py-2 text-sm" value={editForm.qualification || ''} onChange={(e) => setEditForm({ ...editForm, qualification: e.target.value })} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Belt / Grade</label>
                        <select className="w-full bg-slate-50 border-slate-200 rounded-lg px-3 py-2 text-sm" value={editForm.belt_grade || ''} onChange={(e) => setEditForm({ ...editForm, belt_grade: e.target.value || null })}>
                          <option value="">Select Belt / Grade</option>
                          {BELT_GRADE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Home Address</label>
                        <textarea className="w-full bg-slate-50 border-slate-200 rounded-lg px-3 py-2 text-sm" rows={2} value={editForm.address || ''} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">City</label>
                        <input className="w-full bg-slate-50 border-slate-200 rounded-lg px-3 py-2 text-sm" value={editForm.city || ''} onChange={(e) => setEditForm({ ...editForm, city: e.target.value })} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">State</label>
                        <input className="w-full bg-slate-50 border-slate-200 rounded-lg px-3 py-2 text-sm" value={editForm.state || ''} onChange={(e) => setEditForm({ ...editForm, state: e.target.value })} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">PIN Code</label>
                        <input className="w-full bg-slate-50 border-slate-200 rounded-lg px-3 py-2 text-sm" value={editForm.pincode || ''} onChange={(e) => setEditForm({ ...editForm, pincode: e.target.value })} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Institution Name</label>
                        <input className="w-full bg-slate-50 border-slate-200 rounded-lg px-3 py-2 text-sm" value={editForm.school_college_name || ''} onChange={(e) => setEditForm({ ...editForm, school_college_name: e.target.value })} />
                      </div>
                      <div className="sm:col-span-2 space-y-2 p-4 rounded-xl bg-slate-50 border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Super admin only (read-only)</p>
                        <div className="grid sm:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-slate-500 text-[10px] font-bold uppercase mb-0.5">Assigned Instructor</p>
                            <p className="font-medium text-slate-700">{safeText(selectedStudent.instructor_name)}</p>
                          </div>
                          <div>
                            <p className="text-slate-500 text-[10px] font-bold uppercase mb-0.5">Center location</p>
                            <p className="font-medium text-slate-700">{safeText((selectedStudent.training_centers as { name?: string })?.name)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="sm:col-span-2 lg:col-span-3 flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <button onClick={() => setEditingId(null)} className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200">Cancel</button>
                        <button onClick={updateStudent} disabled={isUpdating} className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-slate-800 disabled:opacity-60">
                          {isUpdating ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                          Save Changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    <StudentDetailsReadOnly
                      student={selectedStudent}
                      discipline={getDisciplineMeta(selectedStudent.preferred_discipline)}
                      onEdit={() => startEditing(selectedStudent)}
                      onAssign={() => openAssignDialog(selectedStudent)}
                      onReset={() => void confirmSendPasswordReset(selectedStudent.email)}
                      onDelete={() => void deleteStudent(selectedStudent.id)}
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
