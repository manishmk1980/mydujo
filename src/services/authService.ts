import { API_BASE } from '../config';
import {
  clearAdminToken,
  clearPortalToken,
  getAdminToken,
  getPortalToken,
  setAdminToken,
  setPortalToken,
} from '../lib/authTokens';

/** Parse response as JSON; if server returns HTML (e.g. 404/500 page), throw a clear error instead of raw JSON.parse. */
async function parseJsonResponse(res: Response): Promise<Record<string, unknown>> {
  const text = await res.text();
  const trimmed = text.trim();
  if (!trimmed || (trimmed[0] !== '{' && trimmed[0] !== '[')) {
    throw new Error(
      'Server returned an invalid response (not JSON). Check that the auth API is running and VITE_API_URL is correct.'
    );
  }
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    throw new Error(
      'Server returned invalid JSON. Check that the auth API is running and VITE_API_URL is correct.'
    );
  }
}

export interface AuthUser {
    id: string;
    email: string | undefined;
    full_name?: string;
    display_name?: string;
    roles?: string[];
  }

export interface AdminSecurityAccount {
  userId: string;
  email: string;
  displayName?: string | null;
  roles: string[];
  isSuperAdmin: boolean;
}

export interface AdminSecurityResponse {
  account: AdminSecurityAccount;
  admin: {
    id: string;
    email: string;
    createdAt?: string;
  };
}

export interface UpdateAdminSecurityPayload {
  currentPassword: string;
  newEmail?: string;
  newPassword?: string;
}

export interface AdminProfileResponse {
  profile: {
    userId: string;
    email: string;
    displayName?: string | null;
    roles: string[];
    isSuperAdmin: boolean;
  };
}
  
  export type AuthChangeEvent = 'SIGNED_IN' | 'SIGNED_OUT' | 'USER_UPDATED' | 'PASSWORD_RECOVERY';
  
  export interface AuthService {
    getSession: () => Promise<{ user: AuthUser | null; error: any }>;
    onAuthStateChange: (callback: (event: AuthChangeEvent, user: AuthUser | null) => void) => { unsubscribe: () => void };
    signUp: (email: string, password: string) => Promise<{ user: AuthUser | null; error: any }>;
    signInWithPassword: (email: string, password: string) => Promise<{ user: AuthUser | null; error: any }>;
    signInWithOtp: (email: string, redirectTo?: string) => Promise<{ error: any }>;
    signInWithOAuth: (provider: 'google' | 'facebook' | 'github', redirectTo?: string) => Promise<{ error: any }>;
    resetPasswordForEmail: (email: string, redirectTo?: string) => Promise<{ error: any }>;
    updatePassword: (password: string) => Promise<{ error: any }>;
    signOut: () => Promise<{ error: any }>;
    signOutPortal: () => Promise<{ error: any }>;
    checkIsAdmin: (userId: string) => Promise<boolean>;
    getAdminSecurity: () => Promise<{ data: AdminSecurityResponse | null; error: any }>;
    updateAdminSecurity: (
      payload: UpdateAdminSecurityPayload
    ) => Promise<{ data: { ok: boolean; message?: string; requireRelogin?: boolean } | null; error: any }>;
    getAdminProfile: () => Promise<{ data: AdminProfileResponse | null; error: any }>;
    updateAdminProfile: (payload: { displayName?: string | null }) => Promise<{ data: { ok: boolean; profile?: { displayName?: string | null } } | null; error: any }>;
  }
  
  export const authService: AuthService = {
    async getSession() {
      try {
        const token = getAdminToken();

        if (!token) {
          return { user: null, error: null };
        }

        const res = await fetch(`${API_BASE}/auth/me`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: 'include',
        });

        if (!res.ok) {
          clearAdminToken();
          return { user: null, error: 'Session expired or invalid' };
        }
  
        const data = (await parseJsonResponse(res)) as { user: { id: string; email?: string; full_name?: string; display_name?: string }; roles?: string[] };
  
        return {
          user: {
            id: data.user.id,
            email: data.user.email,
            full_name: data.user.full_name,
            display_name: data.user.display_name,
            roles: data.roles || [],
          },
          error: null,
        };
      } catch (error) {
        return { user: null, error };
      }
    },
  
    onAuthStateChange(callback) {
      // Temporary replacement for Supabase auth listener
      // No real backend push-based auth listener yet
      return {
        unsubscribe: () => {},
      };
    },
  
    async signUp(email, password) {
      try {
        const res = await fetch(`${API_BASE}/auth/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ email, password }),
        });

        const data = (await parseJsonResponse(res)) as { accessToken?: string; user?: AuthUser; error?: string };
        if (!res.ok) {
          return {
            user: null,
            error: { message: data?.error || `Signup failed: ${res.status}` },
          };
        }

        if (data.accessToken) {
          setPortalToken(data.accessToken);
        }

        return {
          user: data.user as AuthUser,
          error: null,
        };
      } catch (error) {
        return { user: null, error };
      }
    },
  
    async signInWithPassword(email, password) {
      try {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ email, password }),
        });
  
        const data = (await parseJsonResponse(res)) as {
          accessToken?: string;
          user?: { id: string; email?: string; full_name?: string; display_name?: string; roles?: string[] };
          roles?: string[];
          error?: string;
        };
  
        if (!res.ok) {
          const msg = typeof data.error === 'string' ? data.error : (data as { message?: string }).message || 'Login failed';
          return { user: null, error: { message: msg } };
        }
  
        if (data.accessToken) {
          setAdminToken(data.accessToken);
        }

        return {
          user: {
            id: data.user.id,
            email: data.user.email,
            full_name: data.user.full_name,
            display_name: data.user.display_name ?? data.user.full_name,
            roles: data.user.roles || data.roles || [],
          },
          error: null,
        };
      } catch (error) {
        return { user: null, error };
      }
    },
  
    async signInWithOtp(email, redirectTo) {
      return { error: 'OTP login is not implemented in custom backend auth yet' };
    },
  
    async signInWithOAuth(provider, redirectTo) {
      return { error: 'OAuth login is not implemented in custom backend auth yet' };
    },
  
    async resetPasswordForEmail(email, redirectTo) {
      return { error: 'Password reset is not implemented in custom backend auth yet' };
    },
  
    async updatePassword(password) {
      return { error: 'Password update is not implemented in custom backend auth yet' };
    },
  
    /** Clears admin panel session only (does not log out student/instructor). */
    async signOut() {
      try {
        const token = getAdminToken();
        clearAdminToken();
        await fetch(`${API_BASE}/auth/logout`, {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          credentials: 'include',
        }).catch(() => {});
        return { error: null };
      } catch (error) {
        return { error };
      }
    },

    /** Clears student/instructor portal session only (does not log out admin). */
    async signOutPortal() {
      try {
        const token = getPortalToken();
        clearPortalToken();
        await fetch(`${API_BASE}/auth/logout`, {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          credentials: 'include',
        }).catch(() => {});
        return { error: null };
      } catch (error) {
        return { error };
      }
    },
  
    async checkIsAdmin(userId: string) {
      try {
        const session = await this.getSession();
  
        if (!session.user) return false;
  
        const roles = session.user.roles || [];
        return roles.includes('SUPER_ADMIN') || roles.includes('ADMIN');
      } catch (e) {
        return false;
      }
    },

    async getAdminSecurity() {
      try {
        const token = getAdminToken();
        if (!token) return { data: null, error: { message: 'No active admin session' } };

        const res = await fetch(`${API_BASE}/auth/admin/security`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: 'include',
        });

        const data = await parseJsonResponse(res);
        if (!res.ok) {
          return { data: null, error: { message: (data.error as string) || 'Failed to load admin security settings' } };
        }

        return { data: data as unknown as AdminSecurityResponse, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },

    async updateAdminSecurity(payload) {
      try {
        const token = getAdminToken();
        if (!token) return { data: null, error: { message: 'No active admin session' } };

        const body: UpdateAdminSecurityPayload = {
          currentPassword: payload.currentPassword,
        };
        if (payload.newEmail !== undefined) body.newEmail = payload.newEmail;
        if (payload.newPassword !== undefined) body.newPassword = payload.newPassword;

        const res = await fetch(`${API_BASE}/auth/admin/security`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          credentials: 'include',
          body: JSON.stringify(body),
        });

        const data = await parseJsonResponse(res);
        if (!res.ok) {
          return { data: null, error: { message: (data.error as string) || 'Failed to update admin security settings' } };
        }

        return {
          data: data as unknown as { ok: boolean; message?: string; requireRelogin?: boolean },
          error: null,
        };
      } catch (error) {
        return { data: null, error };
      }
    },
    async getAdminProfile() {
      try {
        const token = getAdminToken();
        if (!token) return { data: null, error: { message: 'No active admin session' } };
        const res = await fetch(`${API_BASE}/auth/admin/profile`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: 'include',
        });
        const data = await parseJsonResponse(res);
        if (!res.ok) {
          return { data: null, error: { message: (data.error as string) || 'Failed to load admin profile' } };
        }
        return { data: data as unknown as AdminProfileResponse, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },
    async updateAdminProfile(payload) {
      try {
        const token = getAdminToken();
        if (!token) return { data: null, error: { message: 'No active admin session' } };
        const res = await fetch(`${API_BASE}/auth/admin/profile`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          credentials: 'include',
          body: JSON.stringify({
            displayName: payload.displayName ?? null,
          }),
        });
        const data = await parseJsonResponse(res);
        if (!res.ok) {
          return { data: null, error: { message: (data.error as string) || 'Failed to update admin profile' } };
        }
        return {
          data: data as unknown as { ok: boolean; profile?: { displayName?: string | null } },
          error: null,
        };
      } catch (error) {
        return { data: null, error };
      }
    },
  };