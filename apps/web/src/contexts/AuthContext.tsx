'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { auth, type User, type LoginCredentials } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    setIsLoading(true);

    // Timeout rapide : ne pas bloquer l'UI plus de 500ms
    const timeoutId = setTimeout(() => {
      setIsLoading(false);
      setUser(null);
    }, 500);

    try {
      const storedUser = auth.getUser();
      const token = auth.getToken();

      if (storedUser && token) {
        // Ne pas vérifier avec le backend au mount - juste trust localStorage
        // La vérification se fera au premier appel API via l'interceptor
        setUser(storedUser);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      clearTimeout(timeoutId);
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      setIsLoading(true);
      try {
        const authData = await auth.login(credentials);
        setUser(authData.user);
        router.push('/admin/dashboard');
      } catch (error) {
        setIsLoading(false);
        throw error; // Re-throw pour que la page login puisse afficher l'erreur
      }
    },
    [router]
  );

  const logout = useCallback(() => {
    auth.logout();
    setUser(null);
    router.push('/admin/login');
  }, [router]);

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
