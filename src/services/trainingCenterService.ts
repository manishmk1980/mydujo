export interface TrainingCenter {
    id: string;
    name: string;
    slug: string;
    address?: string | null;
    pincode?: string | null;
    city?: string | null;
    state?: string | null;
    created_at?: string;
}

import { API_BASE } from '../config';
import { getAdminToken } from '../lib/authTokens';

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

        if (!res.ok) {
            throw new Error(`Failed to fetch training centers: ${res.status}`);
        }

        const data = await res.json();
        return (data.centers || []) as TrainingCenter[];
    },

    async getTrainingCenterBySlug(slug: string) {
        const res = await fetch(`${API_BASE}/training-centers/by-slug/${encodeURIComponent(slug)}`, {
            method: 'GET',
            credentials: 'include',
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch training center by slug: ${res.status}`);
        }

        const data = await res.json();
        return (data.center ?? null) as TrainingCenter | null;
    },

    async createTrainingCenter(payload: { name: string; slug?: string; address?: string; pincode?: string; city?: string; state?: string }) {
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
    async lookupPincode(pincode: string) {
        const res = await fetch(`${API_BASE}/pincodes/${encodeURIComponent(pincode)}`, {
            method: 'GET',
            credentials: 'include',
        });
        if (!res.ok) {
            throw new Error(`Pincode lookup failed: ${res.status}`);
        }
        const data = await res.json();
        return data.data as { city: string; state: string };
    },
};
