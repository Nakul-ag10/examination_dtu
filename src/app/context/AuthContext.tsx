import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { authApi } from '../lib/api';

export type UserRole = 'admin' | 'hod' | 'ee_incharge' | 'examiner' | 'faculty' | null;

interface User {
  userId: string;
  name: string;
  email: string;
  roles: string[];
  department?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('dtu_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const login = async (email: string, password: string) => {
    const data = await authApi.login(email, password);
    localStorage.setItem('dtu_token', data.access_token);
    const u: User = {
      userId: data.user_id,
      name: data.user_name,
      email: data.email,
      roles: data.roles,
      department: data.department,
    };
    localStorage.setItem('dtu_user', JSON.stringify(u));
    setUser(u);
  };

  const logout = () => {
    authApi.logout().catch(() => {});
    localStorage.removeItem('dtu_token');
    localStorage.removeItem('dtu_user');
    setUser(null);
  };

  const hasRole = (role: string) => user?.roles?.includes(role) ?? false;

  const isAuthenticated = user !== null && !!localStorage.getItem('dtu_token');

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
