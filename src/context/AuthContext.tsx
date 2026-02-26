import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  username: string;
  name: string;
  role: 'student' | 'instructor';
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('mydojo_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (username: string, password: string) => {
    if (username === 'demo' && password === 'demo') {
      const newUser: User = { username: 'demo', name: 'Arjun Singh', role: 'student' };
      setUser(newUser);
      localStorage.setItem('mydojo_user', JSON.stringify(newUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('mydojo_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
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
