import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';
import { API_BASE } from '../config';
import { clearPortalToken, getPortalToken, setPortalToken } from '../lib/authTokens';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'instructor' | 'admin' | 'super_admin';
  studentId?: string;
  instructorId?: string;
}

interface AuthContextType {
  user: User | null;
  student: { id: string; full_name: string; email: string; registration_id?: string } | null;
  instructor: { id: string; full_name: string; email: string } | null;
  login: (email: string, password: string, role?: 'student' | 'instructor') => Promise<{ error?: any }>;
  logout: () => Promise<void>;
  signInWithOtp: (email: string) => Promise<{ error?: any }>;
  signInWithOAuth: (provider: 'google' | 'facebook' | 'github') => Promise<{ error?: any }>;
  resetPasswordForEmail: (email: string) => Promise<{ error?: any }>;
  updatePassword: (password: string) => Promise<{ error?: any }>;
  isAuthenticated: boolean;
  loading: boolean;
  isStudent: boolean;
  isInstructor: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [student, setStudent] = useState<{ id: string; full_name: string; email: string; registration_id?: string } | null>(null);
  const [instructor, setInstructor] = useState<{ id: string; full_name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const token = getPortalToken();

        if (!token) {
          setUser(null);
          setStudent(null);
          setInstructor(null);
          return;
        }

        const res = await fetch(`${API_BASE}/auth/me`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: 'include',
        });

        if (!res.ok) {
          clearPortalToken();
          setUser(null);
          setStudent(null);
          setInstructor(null);
          return;
        }

        const data = await res.json();
        const roles: string[] = data.roles || [];
        const role =
          roles.includes('SUPER_ADMIN') ? 'super_admin' :
            roles.includes('ADMIN') ? 'admin' :
              roles.includes('INSTRUCTOR') ? 'instructor' :
                'student';

        const studentData = data.student ?? null;
        const instructorData = data.instructor ?? null;

        setUser({
          id: data.user.id,
          email: data.user.email,
          name: data.user.full_name || studentData?.full_name || instructorData?.full_name || data.user.email?.split('@')[0] || 'User',
          role,
          studentId: studentData?.id,
          instructorId: instructorData?.id,
        });

        setStudent(
          studentData
            ? {
              id: studentData.id,
              full_name: studentData.full_name ?? '',
              email: studentData.email ?? data.user.email ?? '',
            }
            : null
        );

        setInstructor(
          instructorData
            ? {
              id: instructorData.id,
              full_name: instructorData.full_name ?? '',
              email: instructorData.email ?? data.user.email ?? '',
            }
            : null
        );
      } catch (err) {
        console.error('Session bootstrap failed', err);
        clearPortalToken();
        setUser(null);
        setStudent(null);
        setInstructor(null);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  const login = async (email: string, password: string, requestedRole: 'student' | 'instructor' = 'student') => {
    try {
      const endpoint = requestedRole === 'instructor' ? '/auth/instructor/login' : '/auth/student/login';
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        return { error: 'Login endpoint returned an invalid response' };
      }

      if (!res.ok) {
        return { error: data?.error || 'Unable to sign in' };
      }

      if (data?.accessToken) {
        setPortalToken(data.accessToken);
      }

      const roles: string[] = data.user?.roles || [];
      const role =
        roles.includes('SUPER_ADMIN') ? 'super_admin' :
          roles.includes('ADMIN') ? 'admin' :
            roles.includes('INSTRUCTOR') ? 'instructor' :
              'student';

      if (data?.user) {
        setUser({
          id: data.user.id,
          email: data.user.email,
          name: data.student?.full_name || data.instructor?.full_name || data.user.email?.split('@')[0] || 'User',
          role,
          studentId: data.student?.id,
          instructorId: data.instructor?.id,
        });
      }

      if (data?.student) {
        setStudent({
          id: data.student.id,
          full_name: data.student.full_name ?? '',
          email: data.user?.email ?? '',
        });
      } else {
        setStudent(null);
      }

      if (data?.instructor) {
        setInstructor({
          id: data.instructor.id,
          full_name: data.instructor.full_name ?? '',
          email: data.user?.email ?? '',
        });
      } else {
        setInstructor(null);
      }

      return {};
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unable to sign in' };
    }
  };

  const logout = async () => {
    await authService.signOutPortal();
    setUser(null);
    setStudent(null);
    setInstructor(null);
  };

  const signInWithOtp = async (email: string) => {
    return authService.signInWithOtp(email);
  };

  const signInWithOAuth = async (provider: 'google' | 'facebook' | 'github') => {
    return authService.signInWithOAuth(provider);
  };

  const resetPasswordForEmail = async (email: string) => {
    return authService.resetPasswordForEmail(email);
  };

  const updatePassword = async (password: string) => {
    return authService.updatePassword(password);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        student,
        instructor,
        login,
        logout,
        signInWithOtp,
        signInWithOAuth,
        resetPasswordForEmail,
        updatePassword,
        isAuthenticated: !!user,
        loading,
        isStudent: user?.role === 'student',
        isInstructor: user?.role === 'instructor',
        isAdmin: user?.role === 'admin',
        isSuperAdmin: user?.role === 'super_admin'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}