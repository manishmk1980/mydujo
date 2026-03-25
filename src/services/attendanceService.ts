import { API_BASE } from '../config';
import { getPortalToken } from '../lib/authTokens';

export type AttendanceStatus = 'pending' | 'approved' | 'rejected';

export interface AttendanceRecord {
  id: string;
  student_id: string;
  class_session_id: string | null;
  attendance_date: string | null;
  check_in_time: string | null;
  check_out_time: string | null;
  status: AttendanceStatus;
  source: string;
  notes: string | null;
  validated_at: string | null;
  validated_by: string | null;
  created_at: string | null;
  updated_at: string | null;
  class_session?: {
    id: string;
    title: string;
    class_type: string | null;
    session_date: string | null;
    start_time: string | null;
    end_time: string | null;
    status: string;
  } | null;
}

function getAuthHeaders() {
  const token = getPortalToken();

  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function parseJsonSafe(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export const attendanceService = {
  async getStudentAttendance(studentId: string): Promise<AttendanceRecord[]> {
    const res = await fetch(`${API_BASE}/attendance/student/${studentId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (res.status === 404) {
      return [];
    }

    const data = await parseJsonSafe(res);

    if (!res.ok) {
      throw new Error(data?.error || `Failed to fetch attendance: ${res.status}`);
    }

    return data?.attendance || [];
  },

  async createAttendance(payload: {
    student_id: string;
    class_session_id?: string | null;
    attendance_date: string;
    check_in_time?: string | null;
    check_out_time?: string | null;
    source?: string;
    notes?: string | null;
  }): Promise<AttendanceRecord> {
    const res = await fetch(`${API_BASE}/attendance`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    const data = await parseJsonSafe(res);

    if (!res.ok) {
      throw new Error(data?.error || `Failed to create attendance: ${res.status}`);
    }

    return data.attendance;
  },

  async updateAttendanceStatus(
    id: string,
    status: AttendanceStatus
  ): Promise<AttendanceRecord> {
    const res = await fetch(`${API_BASE}/attendance/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ status }),
    });

    const data = await parseJsonSafe(res);

    if (!res.ok) {
      throw new Error(data?.error || `Failed to update attendance status: ${res.status}`);
    }

    return data.attendance;
  },

  async getInstructorAttendance(): Promise<AttendanceRecord[]> {
    const res = await fetch(`${API_BASE}/attendance/instructor`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (res.status === 404) {
      return [];
    }

    const data = await parseJsonSafe(res);

    if (!res.ok) {
      throw new Error(data?.error || `Failed to fetch instructor attendance: ${res.status}`);
    }

    return data?.attendance || [];
  },
};
