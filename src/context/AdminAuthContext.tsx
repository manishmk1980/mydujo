import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, type AuthUser } from '../services/authService';

const ADMIN_CHECK_TIMEOUT_MS = 25000;
const isDev = import.meta.env.DEV;

interface AdminAuthContextType {
  adminUser: AuthUser | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error: Error | null }>;
  logout: () => Promise<void>;
  refreshAdminUser: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [adminUser, setAdminUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let initDone = false;

    const init = async () => {
      if (isDev) console.log('[AdminAuth] Initializing session...');
      try {
        const { user: authUser } = await authService.getSession();
        if (cancelled) return;
        if (authUser) {
          const ok = await authService.checkIsAdmin(authUser.id);
          if (cancelled) return;
          setAdminUser(ok ? authUser : null);
          if (isDev) console.log('[AdminAuth] Session found, is admin:', ok);
        } else {
          setAdminUser(null);
          if (isDev) console.log('[AdminAuth] No session found.');
        }
      } catch (err) {
        if (isDev) console.error('[AdminAuth] Init error:', err);
        if (!cancelled) setAdminUser(null);
      } finally {
        if (!cancelled) {
          initDone = true;
          setLoading(false);
        }
      }
    };
    init();

    const { unsubscribe } = authService.onAuthStateChange(async (event, authUser) => {
      // Skip duplicate check during initial load - init() already handles it
      if (!initDone) return;
      if (cancelled) return;
      if (authUser) {
        const ok = await authService.checkIsAdmin(authUser.id);
        if (!cancelled) setAdminUser(ok ? authUser : null);
      } else {
        if (!cancelled) setAdminUser(null);
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { user: authUser, error } = await authService.signInWithPassword(email, password);
      if (error) return { error: error as unknown as Error };
      if (!authUser) return { error: new Error('Login failed') };

      const ok = await Promise.race([
        authService.checkIsAdmin(authUser.id),
        new Promise<boolean>((_, reject) => setTimeout(() => reject(new Error('Admin verification timed out')), ADMIN_CHECK_TIMEOUT_MS))
      ]);

      if (!ok) {
        await authService.signOut();
        return { error: new Error('Access denied. You are not an admin.') };
      }

      setAdminUser(authUser);
      return { error: null };
    } catch (e: any) {
      await authService.signOut();
      return { error: e };
    }
  };

  const logout = async () => {
    await authService.signOut();
    setAdminUser(null);
  };

  const refreshAdminUser = async () => {
    const { user: authUser } = await authService.getSession();
    if (!authUser) {
      setAdminUser(null);
      return;
    }
    const ok = await authService.checkIsAdmin(authUser.id);
    setAdminUser(ok ? authUser : null);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        adminUser,
        isAdmin: !!adminUser,
        loading,
        login,
        logout,
        refreshAdminUser,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (ctx === undefined) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
}
