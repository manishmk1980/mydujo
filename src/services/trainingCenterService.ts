import { API_BASE } from '../config';
import { getAdminToken } from '../lib/authTokens';

export interface TrainingCenter {
    id: string;
    name: string;
    slug: string;
    address?: string | null;
    instructor_name?: string | null;
    pincode?: string | null;
    city?: string | null;
    state?: string | null;
    status?: string | null;
    status_note?: string | null;
    archived_at?: string | null;
    updated_at?: string | null;
    created_at?: string;
}

function getAuthHeaders() {
    const token = typeof localStorage !== 'undefined' ? getAdminToken() : null;
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

export const trainingCenterService = {
    async getAllTrainingCenters() {
        const res = await fetch(`${API_BASE}/training-centers`, {
            method: 'GET',
            credentials: 'include',
        });
        if (!res.ok) throw new Error(`Failed to fetch training centers: ${res.status}`);
        const data = await res.json();
        return (data.centers || []) as TrainingCenter[];
    },

    async getTrainingCenterBySlug(slug: string) {
        const res = await fetch(`${API_BASE}/training-centers/by-slug/${encodeURIComponent(slug)}`, {
            method: 'GET',
            credentials: 'include',
        });
        if (!res.ok) throw new Error(`Failed to fetch training center by slug: ${res.status}`);
        const data = await res.json();
        return (data.center ?? null) as TrainingCenter | null;
    },

    async createTrainingCenter(payload: {
        name: string;
        slug?: string;
        address?: string;
        instructor_name?: string;
        pincode?: string;
        city?: string;
        state?: string;
    }) {
        const res = await fetch(`${API_BASE}/training-centers`, {
            method: 'POST',
            headers: getAuthHeaders(),
            credentials: 'include',
            body: JSON.stringify(payload),
        });
        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error((data as { error?: string }).error || `Failed to create training center: ${res.status}`);
        }
        const data = await res.json();
        return (data.center ?? data) as TrainingCenter;
    },

    async updateTrainingCenter(id: string, payload: Partial<{
        name: string;
        slug: string;
        address: string;
        instructor_name: string;
        pincode: string;
        city: string;
        state: string;
        status: string;
        pause_reason: string;
    }>) {
        const res = await fetch(`${API_BASE}/training-centers/${encodeURIComponent(id)}`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
            credentials: 'include',
            body: JSON.stringify(payload),
        });
        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error((data as { error?: string }).error || `Failed to update training center: ${res.status}`);
        }
        const data = await res.json();
        return (data.center ?? data) as TrainingCenter;
    },

    /** Update only the status (pause / reactivate / archive). */
    async updateTrainingCenterStatus(id: string, status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED', pauseReason?: string) {
        return trainingCenterService.updateTrainingCenter(id, {
            status,
            ...(pauseReason !== undefined ? { pause_reason: pauseReason } : {}),
        });
    },

    /** Soft-archive a training center (sets status = ARCHIVED). */
    async archiveTrainingCenter(id: string, reason?: string) {
        const res = await fetch(`${API_BASE}/training-centers/${encodeURIComponent(id)}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
            credentials: 'include',
            body: reason ? JSON.stringify({ reason }) : undefined,
        });
        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            if (res.status === 409) {
                const d = data as { message?: string; activeStudents?: number; activeInstructors?: number };
                if (d.activeStudents !== undefined || d.activeInstructors !== undefined) {
                    const s = d.activeStudents ?? 0;
                    const i = d.activeInstructors ?? 0;
                    throw new Error(
                        `Cannot archive: ${s} active student${s !== 1 ? 's' : ''} and ${i} active instructor${i !== 1 ? 's' : ''} assigned to this center. Reassign or pause them before archiving.`
                    );
                }
            }
            throw new Error((data as { error?: string }).error || `Failed to archive training center: ${res.status}`);
        }
        const data = await res.json();
        return (data.center ?? null) as TrainingCenter | null;
    },

    async lookupPincode(pincode: string) {
        const res = await fetch(`${API_BASE}/pincodes/${encodeURIComponent(pincode)}`, {
            method: 'GET',
            credentials: 'include',
        });
        if (!res.ok) throw new Error(`Pincode lookup failed: ${res.status}`);
        const data = await res.json();
        return data.data as { city: string; state: string };
    },
};
