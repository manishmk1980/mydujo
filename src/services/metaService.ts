import { API_BASE } from '../config';
import { getAdminToken } from '../lib/authTokens';

export type DisciplineOption = {
  id?: string;
  value: string;
  label: string;
  image_url?: string | null;
  imageUrl?: string | null;
  status?: string | null;
  status_note?: string | null;
  archived_at?: string | null;
};

function getAuthHeaders() {
  const token = typeof localStorage !== 'undefined' ? getAdminToken() : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const metaService = {
  /**
   * Fetch disciplines from the server.
   * - No argument (default): returns only ACTIVE disciplines — safe for public registration forms.
   * - Pass 'ALL' to get every status — use this for admin pages that need to show all disciplines.
   * - Pass 'PAUSED' or 'ARCHIVED' for filtered admin views.
   */
  async getDisciplines(statusFilter?: string) {
    const url = statusFilter
      ? `${API_BASE}/meta/disciplines?status=${encodeURIComponent(statusFilter)}`
      : `${API_BASE}/meta/disciplines`;
    const res = await fetch(url, {
      method: 'GET',
      credentials: 'include',
    });
    if (res.status === 404) return [] as DisciplineOption[];
    if (!res.ok) throw new Error(`Failed to fetch disciplines: ${res.status}`);
    const data = await res.json();
    return (data.disciplines || []) as DisciplineOption[];
  },

  async createDiscipline(payload: { value: string; label: string; imageUrl?: string }) {
    const res = await fetch(`${API_BASE}/meta/disciplines`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({
        value: payload.value,
        label: payload.label,
        image_url: payload.imageUrl || null,
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error((data as { error?: string }).error || `Failed to create discipline: ${res.status}`);
    }
    const data = await res.json();
    return (data.discipline ?? data) as DisciplineOption & { id: string };
  },

  async updateDiscipline(id: string, payload: Partial<{
    value: string;
    label: string;
    image_url: string | null;
    imageUrl: string | null;
    status: string;
    pause_reason: string;
  }>) {
    const res = await fetch(`${API_BASE}/meta/disciplines/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error((data as { error?: string }).error || `Failed to update discipline: ${res.status}`);
    }
    const data = await res.json();
    return (data.discipline ?? data) as DisciplineOption & { id: string };
  },

  /** Update only the status (pause / reactivate / archive). */
  async updateDisciplineStatus(id: string, status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED', pauseReason?: string) {
    return metaService.updateDiscipline(id, {
      status,
      ...(pauseReason !== undefined ? { pause_reason: pauseReason } : {}),
    });
  },

  /** Soft-archive a discipline (sets status = ARCHIVED). */
  async archiveDiscipline(id: string) {
    const res = await fetch(`${API_BASE}/meta/disciplines/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      if (res.status === 409) {
        const d = data as { message?: string; activeStudents?: number; activeInstructors?: number };
        if (d.activeStudents !== undefined || d.activeInstructors !== undefined) {
          const s = d.activeStudents ?? 0;
          const i = d.activeInstructors ?? 0;
          throw new Error(
            `Cannot archive: ${s} active student${s !== 1 ? 's' : ''} and ${i} active instructor${i !== 1 ? 's' : ''} assigned to this discipline. Reassign or pause them before archiving.`
          );
        }
      }
      throw new Error((data as { error?: string }).error || `Failed to archive discipline: ${res.status}`);
    }
    const data = await res.json();
    return (data.discipline ?? null) as (DisciplineOption & { id: string }) | null;
  },
};
