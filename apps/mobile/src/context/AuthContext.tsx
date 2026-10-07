import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Alert } from 'react-native';
import { api, unauthorizedEmitter } from '../api/client';
import { getToken, removeToken } from '../storage/authStorage';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitializing: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  const loadUser = async () => {
    try {
      setIsLoading(true);
      const res = await api.get<{ user: User }>('/auth/me');
      if (res.data?.user) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setIsLoading(false);
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = await getToken();
      if (token) {
        await loadUser();
      } else {
        setIsInitializing(false);
      }
    };
    initAuth();
  }, []);

  useEffect(() => {
    // Listen for 401 Unauthorized events from the API client
    const unsubscribe = unauthorizedEmitter.subscribe(() => {
      setUser((prevUser) => {
        if (prevUser) {
          Alert.alert('Session Expired', 'Your session has expired. Please log in again.');
        }
        return null;
      });
    });
    return unsubscribe;
  }, []);

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore network errors on logout
    } finally {
      await removeToken();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        isInitializing,
        refreshUser: loadUser,
        logout,
      }}
    >
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
