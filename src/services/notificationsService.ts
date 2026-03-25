import { API_BASE } from '../config';
import { getPortalToken } from '../lib/authTokens';

function getAuthHeaders() {
  const token = getPortalToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function buildCandidateUrls(path: string): string[] {
  const base = API_BASE.replace(/\/+$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const hasApiSuffix = /\/api$/i.test(base);
  if (hasApiSuffix) {
    return [`${base}${normalizedPath}`, `${base.replace(/\/api$/i, '')}${normalizedPath}`];
  }
  return [`${base}${normalizedPath}`, `${base}/api${normalizedPath}`];
}

export interface NotificationDTO {
  id: string;
  type: string;
  title: string;
  message: string;
  entity_type: string;
  entity_id: string;
  read_at: string | null;
  created_at: string;
}

export const notificationsService = {
  async getUnreadCount(): Promise<number> {
    const urls = buildCandidateUrls('/notifications/unread-count');
    for (const url of urls) {
      const res = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      if (res.ok) {
        const data = (await res.json()) as { unread_count?: number };
        return data.unread_count ?? 0;
      }
      if (res.status !== 404) return 0;
    }
    return 0;
  },

  async getMyNotifications(): Promise<NotificationDTO[]> {
    const res = await fetch(`${API_BASE}/notifications/my`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as { error?: string }).error ?? `Failed to load notifications: ${res.status}`);
    }
    const data = (await res.json()) as { notifications?: NotificationDTO[] };
    return data.notifications ?? [];
  },

  async markRead(id: string): Promise<NotificationDTO> {
    const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error((data as { error?: string }).error ?? `Failed to mark read: ${res.status}`);
    }
    return (data as { notification: NotificationDTO }).notification;
  },
};

