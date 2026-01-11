'use client';
import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { AuthUser } from '@/lib/auth/types';

interface ExtendedAuthUser extends AuthUser {
  name?: string;
  surname?: string;
  phone?: string;
  deliveryAddress?: string;
}

interface AuthContextProps {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<boolean>;
  user: ExtendedAuthUser | null;
}

const AuthContext = createContext<AuthContextProps>({
  isAuthenticated: false,
  isLoading: true,
  login: async () => false,
  logout: async () => {},
  refreshUser: async () => false,
  user: null,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<ExtendedAuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/users/me', {
        method: 'GET',
        credentials: 'include',
      });

      if (res.ok) {
        const userData = await res.json();

        setUser({
          id: userData.id,
          email: userData.email,
          role: userData.role,
          name: userData.name || userData.nome,
          surname: userData.surname || userData.cognome,
          phone: userData.phone,
          deliveryAddress: userData.deliveryAddress,
        });
        setIsAuthenticated(true);
        return true;
      } else {
        // 401 is expected for non-authenticated users - don't log as error
        if (res.status !== 401) {
        }
        setIsAuthenticated(false);
        setUser(null);
        return false;
      }
    } catch (error) {
      console.error('[AuthContext] Error refreshing user:', error);
      setIsAuthenticated(false);
      setUser(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(async (): Promise<boolean> => {
    const result = await refreshUser();
    return result;
  }, [refreshUser]);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // ignore logout errors
    }
    setIsAuthenticated(false);
    setUser(null);
    setIsLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout, refreshUser, user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
