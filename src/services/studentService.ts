import type { Student as UIStudent } from '../types';

export type StudentStatus = 'draft' | 'pending' | 'approved' | 'paused' | 'rejected' | 'active' | 'inactive';

export type StudentDashboardStats = {
  registered: number;
  approved: number;
  active_portal: number;
  active_within_minutes: number;
};

export interface DBStudent {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  date_of_birth: string | null;
  gender: string | null;
  blood_group: string | null;
  emergency_contact: string | null;
  preferred_discipline: string | null;
  profile_photo_url: string | null;
  status: StudentStatus;
  marketing_opt_in?: boolean;
  terms_accepted_at?: string | null;
  created_at?: string;
  training_center_id: string | null;
  parent_guardian_name?: string | null;
  aadhar_number?: string | null;
  qualification?: string | null;
  belt_grade?: string | null;
  address?: string | null;
  pincode?: string | null;
  city?: string | null;
  state?: string | null;
  locality?: string | null;
  school_college_name?: string | null;
  school_college_location_city?: string | null;
  school_college_location_state?: string | null;
  school_college_location_pin?: string | null;
  instructor_name?: string | null;
  validated_at?: string | null;
  validated_by?: string | null;
  enrollment_id?: string | null;
  training_centers?: { name: string; slug: string } | null;
}

import { API_BASE } from '../config';
import { getAdminToken, getPortalToken } from '../lib/authTokens';

function getAdminAuthHeaders() {
  const token = getAdminToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function getPortalAuthHeaders() {
  const token = getPortalToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const studentService = {
  async getDashboardStudentStats(): Promise<StudentDashboardStats> {
    const res = await fetch(`${API_BASE}/students/dashboard-stats`, {
      method: 'GET',
      headers: getAdminAuthHeaders(),
      credentials: 'include',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({} as { error?: string }));
      throw new Error(err.error ?? `Failed to load dashboard stats: ${res.status}`);
    }
    return (await res.json()) as StudentDashboardStats;
  },

  async getAllStudents() {
    const res = await fetch(`${API_BASE}/students`, {
      method: 'GET',
      headers: getAdminAuthHeaders(),
      credentials: 'include',
    });

    if (res.status === 404) {
      return [];
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({} as { error?: string }));
      throw new Error(err.error ?? `Failed to fetch students: ${res.status}`);
    }

    const data = await res.json();
    return (data.students || []) as DBStudent[];
  },

  async getStudentById(id: string) {
    const res = await fetch(`${API_BASE}/students/${id}`, {
      method: 'GET',
      headers: getAdminAuthHeaders(),
      credentials: 'include',
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({} as { error?: string }));
      throw new Error(err.error ?? `Failed to fetch student: ${res.status}`);
    }

    const data = await res.json();
    return data.student as DBStudent;
  },

  async getStudentByAuthId(authId: string) {
    // Temporary compatibility method during migration
    // Old code calls this with auth user id; new backend uses user_id
    const res = await fetch(`${API_BASE}/students/by-user/${authId}`, {
      method: 'GET',
      headers: getPortalAuthHeaders(),
      credentials: 'include',
    });

    if (res.status === 404) {
      return null;
    }

    if (!res.ok) {
      throw new Error(`Failed to fetch student by user id: ${res.status}`);
    }

    const data = await res.json();
    return data.student as DBStudent | null;
  },

  async updateStudentStatus(id: string, status: 'pending' | 'approved' | 'paused' | 'rejected') {
    const res = await fetch(`${API_BASE}/students/${id}/status`, {
      method: 'PATCH',
      headers: getAdminAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ status }),
    });

    let data: { error?: string; student?: unknown } | null = null;
    try {
      data = await res.json();
    } catch {}

    if (!res.ok) {
      throw new Error(data?.error ?? `Failed to update student status: ${res.status}`);
    }

    return data!.student;
  },

  async updateStudent(id: string, updates: Partial<DBStudent>) {
    const res = await fetch(`${API_BASE}/students/${id}`, {
      method: 'PUT',
      headers: getAdminAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(updates),
    });

    if (!res.ok) {
      throw new Error(`Failed to update student: ${res.status}`);
    }

    const data = await res.json();
    return data.student;
  },

  async deleteStudent(id: string) {
    const res = await fetch(`${API_BASE}/students/${id}`, {
      method: 'DELETE',
      headers: getAdminAuthHeaders(),
      credentials: 'include',
    });

    if (!res.ok) {
      throw new Error(`Failed to delete student: ${res.status}`);
    }

    return true;
  },

  async createStudent(student: Partial<DBStudent>) {
    const res = await fetch(`${API_BASE}/students`, {
      method: 'POST',
      headers: getAdminAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(student),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.error || `Failed to create student: ${res.status}`);
    }

    const data = await res.json();
    return data.student;
  },
};