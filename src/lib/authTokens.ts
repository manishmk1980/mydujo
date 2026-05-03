import { API_BASE } from '../config';

/** @deprecated Legacy single token — migrated on startup */
export const LEGACY_ACCESS_TOKEN_KEY = 'accessToken';

/** Student + instructor JWT (portal app) */
export const PORTAL_ACCESS_TOKEN_KEY = 'mdpl_access_token_portal';

/** Super admin / admin panel JWT */
export const ADMIN_ACCESS_TOKEN_KEY = 'mdpl_access_token_admin';

export function getPortalToken(): string | null {
  return localStorage.getItem(PORTAL_ACCESS_TOKEN_KEY);
}

export function setPortalToken(token: string): void {
  localStorage.setItem(PORTAL_ACCESS_TOKEN_KEY, token);
  localStorage.removeItem(LEGACY_ACCESS_TOKEN_KEY);
}

export function clearPortalToken(): void {
  localStorage.removeItem(PORTAL_ACCESS_TOKEN_KEY);
  localStorage.removeItem(LEGACY_ACCESS_TOKEN_KEY);
}

export function getAdminToken(): string | null {
  return localStorage.getItem(ADMIN_ACCESS_TOKEN_KEY);
}

export function setAdminToken(token: string): void {
  localStorage.setItem(ADMIN_ACCESS_TOKEN_KEY, token);
  localStorage.removeItem(LEGACY_ACCESS_TOKEN_KEY);
}

export function clearAdminToken(): void {
  localStorage.removeItem(ADMIN_ACCESS_TOKEN_KEY);
  localStorage.removeItem(LEGACY_ACCESS_TOKEN_KEY);
}

/**
 * One-time migration: old builds used a single `accessToken` for everyone.
 * Split into portal vs admin bucket based on /auth/me roles.
 */
export async function migrateLegacyAccessToken(): Promise<void> {
  if (typeof localStorage === 'undefined') return;

  const legacy = localStorage.getItem(LEGACY_ACCESS_TOKEN_KEY);
  if (!legacy) return;

  if (localStorage.getItem(PORTAL_ACCESS_TOKEN_KEY) || localStorage.getItem(ADMIN_ACCESS_TOKEN_KEY)) {
    localStorage.removeItem(LEGACY_ACCESS_TOKEN_KEY);
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${legacy}` },
      credentials: 'include',
    });
    if (!res.ok) {
      localStorage.removeItem(LEGACY_ACCESS_TOKEN_KEY);
      return;
    }
    const data = (await res.json()) as { roles?: string[] };
    const roles: string[] = data.roles || [];
    const isAdmin = roles.includes('ADMIN') || roles.includes('SUPER_ADMIN');
    if (isAdmin) {
      localStorage.setItem(ADMIN_ACCESS_TOKEN_KEY, legacy);
    } else {
      localStorage.setItem(PORTAL_ACCESS_TOKEN_KEY, legacy);
    }
    localStorage.removeItem(LEGACY_ACCESS_TOKEN_KEY);
  } catch {
    localStorage.removeItem(LEGACY_ACCESS_TOKEN_KEY);
  }
}
