/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User } from '@/types';
import { api, getAuthToken, clearAuthToken } from '@/lib/api/client';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PUBLIC_ROUTES = ['/login', '/register'];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const loadUser = async () => {
    const token = getAuthToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.get<{ user: User }>('/auth/me');
      setUser(res.data!.user);
    } catch {
      // Token is invalid/expired
      setUser(null);
      clearAuthToken();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUser();

    // Listen for global 401 unauth events
    const handleUnauthorized = () => {
      setUser(null);
      clearAuthToken();
      router.push('/login');
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [router]);

  useEffect(() => {
    // Route protection logic
    if (!isLoading) {
      const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
      
      if (!user && !isPublicRoute) {
        router.push('/login');
      } else if (user && (pathname === '/login' || pathname === '/register' || pathname === '/')) {
        router.push('/dashboard');
      } else if (!user && pathname === '/') {
        router.push('/login');
      }
    }
  }, [user, isLoading, pathname, router]);

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      console.error('Logout failed');
    } finally {
      clearAuthToken();
      setUser(null);
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, refreshUser: loadUser, logout }}>
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
