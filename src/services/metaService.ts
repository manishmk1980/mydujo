export type DisciplineOption = {
  id?: string;
  value: string;
  label: string;
  image_url?: string | null;
  imageUrl?: string | null;
};

import { API_BASE } from '../config';
import { getAdminToken } from '../lib/authTokens';

function getAuthHeaders() {
  const token = typeof localStorage !== 'undefined' ? getAdminToken() : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const metaService = {
  async getDisciplines() {
    const res = await fetch(`${API_BASE}/meta/disciplines`, {
      method: 'GET',
      credentials: 'include',
    });

    if (res.status === 404) {
      return [] as DisciplineOption[];
    }

    if (!res.ok) {
      throw new Error(`Failed to fetch disciplines: ${res.status}`);
    }

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
};

