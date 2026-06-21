/**
 * Instructor Service
 * Handles data fetching and management for the instructor admin panel.
 */
import { API_BASE } from '../config';
import { getAdminToken, getPortalToken } from '../lib/authTokens';

export interface Instructor {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  bio?: string;
  city?: string;
  state?: string;
  profilePhotoUrl?: string;
  trainingCenterId?: string | null;
  trainingCenterName?: string | null;
  preferredDiscipline?: string | null;
  isActive: boolean;
  canLogin: boolean;
  approvalStatus?: string;
  approvedAt?: string | null;
  createdAt?: string;
  lastLoginAt?: string | null;
  applicationReviewNote?: string | null;
  publicProfileEnabled?: boolean;
  publicDisplayName?: string | null;
  publicSlug?: string | null;
  publicBio?: string | null;
  publicPhotoUrl?: string | null;
  publicDiscipline?: string | null;
  publicConsentConfirmed?: boolean;
  publicReviewStatus?: string;
  publicChangesRequestedNote?: string | null;
  publicDisplayOrder?: number | null;
  isFeaturedPublic?: boolean;
  publicApprovedAt?: string | null;
  publicUpdatedAt?: string | null;
  publicProfile?: InstructorPublicProfile;
  assignedCenters?: InstructorCenterAssignment[];
}

export interface InstructorProfileCompletion {
  percentage: number;
  completed: number;
  total: number;
  missing: string[];
  isReadyForReview: boolean;
}

export interface InstructorPublicProfile {
  publicDisplayName: string;
  publicSlug: string | null;
  publicBio: string | null;
  publicPhotoUrl: string | null;
  publicDiscipline: string | null;
  publicConsentConfirmed: boolean;
  publicProfileEnabled: boolean;
  publicDisplayOrder: number | null;
  isFeaturedPublic: boolean;
  publicReviewStatus: string;
  publicChangesRequestedNote: string | null;
  publicReviewSubmittedAt: string | null;
  publicApprovedAt: string | null;
  city: string | null;
  state: string | null;
  status: 'DRAFT' | 'INCOMPLETE' | 'READY_FOR_REVIEW' | 'PUBLISHED' | 'CHANGES_REQUESTED';
  completion: InstructorProfileCompletion;
}

export interface InstructorCenterAssignment {
  id: string;
  name: string;
  city?: string | null;
  state?: string | null;
  status?: string;
  authorities: {
    canViewStudents: boolean;
    canManageAttendance: boolean;
    canManageGrading: boolean;
    canManageClasses: boolean;
  };
}

export interface PublicInstructor {
  publicSlug: string | null;
  displayName: string;
  publicBio: string | null;
  city: string | null;
  state: string | null;
  publicPhotoUrl: string | null;
  isFeaturedPublic: boolean;
  publicDisplayOrder: number | null;
  discipline?: string | null;
}

export interface AssignedStudent {
  id: string;
  fullName: string;
  email: string;
  currentBelt?: string;
  currentRankLabel?: string;
  status: string;
  gradingProgress?: {
    syllabusCompletionPercent: number;
    readinessStatus?: string;
    instructorNotes?: string;
  };
  trainingCenter?: { id: string; name: string } | null;
  permissions?: {
    canManageGrading: boolean;
    canManageAttendance: boolean;
  };
}

export interface DashboardStats {
  studentsCount: number;
  classesCount: number;
  pendingAttendance: number;
  pendingGrading: number;
  centersCount?: number;
  assignedCenters?: InstructorCenterAssignment[];
}

function getPortalAuthHeaders() {
  const token = typeof localStorage !== 'undefined' ? getPortalToken() : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function getAdminAuthHeaders() {
  const token = typeof localStorage !== 'undefined' ? getAdminToken() : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const instructorService = {
  /**
   * Fetch current instructor profile
   */
  async getMyProfile() {
    const res = await fetch(`${API_BASE}/instructors/me`, {
      headers: getPortalAuthHeaders(),
      credentials: 'include',
    });

    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`Failed to fetch profile: ${res.status}`);
    }

    const data = await res.json();
    return data.instructor as Instructor;
  },

  /**
   * Fetch students assigned to the logged-in instructor
   */
  async getMyStudents() {
    const res = await fetch(`${API_BASE}/instructors/my-students`, {
      headers: getPortalAuthHeaders(),
      credentials: 'include',
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch students: ${res.status}`);
    }

    const data = await res.json();
    return (data.students || []) as AssignedStudent[];
  },

  /**
   * Fetch dashboard overview stats
   */
  async getDashboardStats() {
    const res = await fetch(`${API_BASE}/instructors/dashboard-stats`, {
      headers: getPortalAuthHeaders(),
      credentials: 'include',
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch stats: ${res.status}`);
    }

    return await res.json() as DashboardStats;
  },

  /**
   * Super Admin: Fetch all instructors with detailed stats
   */
  async getAllInstructorsAdmin() {
    const res = await fetch(`${API_BASE}/instructors/admin/all`, {
      headers: getAdminAuthHeaders(),
      credentials: 'include',
    });

    if (!res.ok) throw new Error(`Failed to fetch instructors: ${res.status}`);
    const data = await res.json();
    const list = Array.isArray(data) ? data : (data.instructors || []);
    return list as (Instructor & {
      _count?: { students: number; classes: number },
      user?: { id: string, email: string }
    })[];
  },

  /**
   * Super Admin: Create a new instructor
   */
  async createInstructor(data: {
    fullName: string;
    email: string;
    phone?: string;
    bio?: string;
    city?: string;
    state?: string;
    trainingCenterId?: string;
    trainingCenterName?: string;
    preferredDiscipline?: string;
    profilePhotoUrl?: string;
    isActive?: boolean;
    canLogin?: boolean;
    password?: string;
  }) {
    const res = await fetch(`${API_BASE}/instructors`, {
      method: 'POST',
      headers: getAdminAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to create instructor');
    return result.instructor as Instructor;
  },

  /**
   * Super Admin: Update instructor profile
   */
  async updateInstructor(id: string, data: Partial<Instructor & { canLogin?: boolean }>) {
    const res = await fetch(`${API_BASE}/instructors/${id}`, {
      method: 'PATCH',
      headers: getAdminAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to update instructor');
    return result.instructor as Instructor;
  },

  async getMyClasses() {
    const res = await fetch(`${API_BASE}/instructors/me/classes`, {
      headers: getPortalAuthHeaders(),
      credentials: 'include',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Failed to load classes');
    return (data.classes || []) as Array<{
      id: string;
      title: string;
      classType?: string | null;
      discipline?: string | null;
      sessionDate: string;
      startTime?: string | null;
      endTime?: string | null;
      status: string;
      notes?: string | null;
      trainingCenter?: { id: string; name: string } | null;
      _count?: { attendance: number };
    }>;
  },

  async createMyClass(data: {
    title: string;
    trainingCenterId: string;
    sessionDate: string;
    startTime?: string | null;
    endTime?: string | null;
    classType?: string | null;
    discipline?: string | null;
    notes?: string | null;
  }) {
    const res = await fetch(`${API_BASE}/instructors/me/classes`, {
      method: 'POST',
      headers: getPortalAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });
    const result = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(result.error || 'Failed to create class');
    return result.classSession;
  },

  async updateStudentGrading(studentId: string, data: {
    syllabusCompletionPercent: number;
    readinessStatus?: string | null;
    instructorNotes?: string | null;
  }) {
    const res = await fetch(`${API_BASE}/instructors/me/students/${encodeURIComponent(studentId)}/grading`, {
      method: 'PATCH',
      headers: getPortalAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });
    const result = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(result.error || 'Failed to update grading progress');
    return result.gradingProgress;
  },

  async updateInstructorDetails(id: string, data: {
    fullName: string;
    phone?: string | null;
    city?: string | null;
    state?: string | null;
    internalNote?: string | null;
  }) {
    const res = await fetch(`${API_BASE}/admin/instructors/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: getAdminAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });
    const result = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(result.error || 'Failed to update instructor');
    return result.instructor as Partial<Instructor>;
  },

  async resetInstructorPassword(id: string, temporaryPassword?: string) {
    const res = await fetch(`${API_BASE}/admin/instructors/${encodeURIComponent(id)}/reset-password`, {
      method: 'POST',
      headers: getAdminAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(temporaryPassword ? { temporaryPassword } : {}),
    });
    const result = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(result.error || 'Failed to reset instructor password');
    return result as {
      username: string;
      temporaryPassword: string;
      loginUrl: string;
      warning: string;
    };
  },

  async updateApplicationStatus(
    id: string,
    status: 'PENDING_REVIEW' | 'REQUEST_INFO' | 'NEEDS_MORE_INFO' | 'APPROVED' | 'REJECTED' | 'SUSPENDED',
    extra?: { reviewNotes?: string; requestedInfoMessage?: string },
  ) {
    const res = await fetch(`${API_BASE}/admin/instructor-applications/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: getAdminAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ status, ...extra }),
    });
    const result = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(result.error || 'Failed to update application status');
    const instructor = result.instructor || {};
    return {
      id: instructor.id,
      fullName: instructor.fullName || instructor.full_name,
      email: instructor.email,
      bio: instructor.bio,
      isActive: instructor.isActive ?? instructor.is_active,
      canLogin: instructor.canLogin ?? instructor.can_login,
      approvalStatus: instructor.approvalStatus || instructor.approval_status,
      approvedAt: instructor.approvedAt || instructor.approved_at,
    } as Partial<Instructor>;
  },

  async updatePublicProfile(id: string, data: {
    publicProfileEnabled: boolean;
    publicDisplayOrder?: number | null;
    isFeaturedPublic?: boolean;
    requestChanges?: boolean;
    changesRequestedNote?: string | null;
  }) {
    const res = await fetch(`${API_BASE}/instructors/${encodeURIComponent(id)}/public-profile`, {
      method: 'PATCH',
      headers: getAdminAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });
    const result = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(result.error || 'Failed to update public profile');
    return result.publicProfile as InstructorPublicProfile;
  },

  async getMyPublicProfile() {
    const res = await fetch(`${API_BASE}/instructors/me/public-profile`, {
      headers: getPortalAuthHeaders(),
      credentials: 'include',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Failed to load public profile');
    return data.publicProfile as InstructorPublicProfile;
  },

  async saveMyPublicProfile(data: {
    publicDisplayName: string;
    publicBio: string;
    publicPhotoUrl: string | null;
    publicDiscipline: string;
    publicConsentConfirmed: boolean;
  }) {
    const res = await fetch(`${API_BASE}/instructors/me/public-profile`, {
      method: 'PATCH',
      headers: getPortalAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });
    const result = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(result.error || 'Failed to save public profile');
    return result.publicProfile as InstructorPublicProfile;
  },

  async submitMyPublicProfileForReview() {
    const res = await fetch(`${API_BASE}/instructors/me/public-profile/submit-review`, {
      method: 'POST',
      headers: getPortalAuthHeaders(),
      credentials: 'include',
    });
    const result = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(result.error || 'Failed to submit public profile');
    return result.publicProfile as InstructorPublicProfile;
  },

  async updateCenterAssignments(id: string, assignments: Array<{
    trainingCenterId: string;
    canViewStudents: boolean;
    canManageAttendance: boolean;
    canManageGrading: boolean;
    canManageClasses: boolean;
  }>) {
    const res = await fetch(`${API_BASE}/instructors/${encodeURIComponent(id)}/assignments/centers`, {
      method: 'PUT',
      headers: getAdminAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ assignments }),
    });
    const result = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(result.error || 'Failed to update center responsibilities');
    return true;
  },

  /**
   * Super Admin: Assign student to instructor
   */
  async assignStudent(instructorId: string, studentId: string) {
    const res = await fetch(`${API_BASE}/instructors/${instructorId}/assignments/students`, {
      method: 'POST',
      headers: getAdminAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ studentId }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to assign student');
    }
    return true;
  },

  /**
   * Super Admin: Unassign student from instructor
   */
  async unassignStudent(instructorId: string, studentId: string) {
    const res = await fetch(`${API_BASE}/instructors/${instructorId}/assignments/students/${studentId}`, {
      method: 'DELETE',
      headers: getAdminAuthHeaders(),
      credentials: 'include',
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to unassign student');
    }
    return true;
  },

  /**
   * Super Admin: Fetch students assigned to any specific instructor
   */
  async getInstructorStudents(id: string) {
    const res = await fetch(`${API_BASE}/instructors/${id}/assignments/students`, {
      headers: getAdminAuthHeaders(),
      credentials: 'include',
    });

    if (!res.ok) throw new Error(`Failed to fetch assignments: ${res.status}`);
    const data = await res.json();
    return (data.students || []) as AssignedStudent[];
  },

  /**
   * Super Admin: Delete instructor profile
   */
  async deleteInstructor(id: string) {
    const res = await fetch(`${API_BASE}/instructors/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: getAdminAuthHeaders(),
      credentials: 'include',
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({} as { error?: string }));
      throw new Error(data.error || `Failed to delete instructor: ${res.status}`);
    }

    return true;
  },

  /**
   * Legacy: get all instructors (public/admin use)
   */
  async getAllInstructors() {
    const res = await fetch(`${API_BASE}/instructors`, {
      method: 'GET',
      credentials: 'include',
    });

    if (res.status === 404) return [];
    if (!res.ok) throw new Error(`Failed to fetch instructors: ${res.status}`);

    const data = await res.json();
    return (Array.isArray(data) ? data : (data.instructors || [])) as any[];
  },

  async getPublicInstructors() {
    const res = await fetch(`${API_BASE}/public/instructors`);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Failed to load public instructors');
    return (data.instructors || []) as PublicInstructor[];
  },
};
