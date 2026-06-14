import { API_BASE } from '../config';
import { getAdminToken } from '../lib/authTokens';

export type PlatformUserStatus = 'ACTIVE' | 'DISABLED' | 'PENDING_INVITE';
export interface PlatformUser {
  id: string;
  name: string | null;
  email: string;
  roles: string[];
  status: PlatformUserStatus;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
}

async function request(path: string, init: RequestInit = {}) {
  const response = await fetch(`${API_BASE}/users${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAdminToken() || ''}`,
      ...init.headers,
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error((data as { error?: string }).error || `Request failed: ${response.status}`);
  return data;
}

export const usersService = {
  async list(): Promise<{ users: PlatformUser[]; roles: string[] }> {
    return request('') as Promise<{ users: PlatformUser[]; roles: string[] }>;
  },
  async create(input: { name: string; email: string; role: string; status: PlatformUserStatus; password?: string }): Promise<PlatformUser> {
    const data = await request('', { method: 'POST', body: JSON.stringify(input) }) as { user: PlatformUser };
    return data.user;
  },
  async update(id: string, patch: { name?: string; role?: string; status?: PlatformUserStatus }): Promise<PlatformUser> {
    const data = await request(`/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }) as { user: PlatformUser };
    return data.user;
  },
  async resetPassword(id: string, password: string): Promise<void> {
    await request(`/${id}/password-reset`, { method: 'POST', body: JSON.stringify({ password }) });
  },
  async archive(id: string): Promise<void> {
    await request(`/${id}`, { method: 'DELETE' });
  },
};
