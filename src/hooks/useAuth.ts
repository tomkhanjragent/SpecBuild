import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CurrentUser } from '../types/app.types';
import {
  fetchCurrentUser,
  getSetupStatus,
  signIn,
  createFirstAdmin,
  signOut,
  getStoredUser,
  getStoredToken,
} from '../lib/auth';

interface AuthContextType {
  user: CurrentUser | null;
  isLoading: boolean;
  needsSetup: boolean;
  login: (params: { email: string; password: string }) => Promise<void>;
  setupAdmin: (params: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(() => getStoredUser());
  const [isLoading, setIsLoading] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);

  const refreshAuth = useCallback(async () => {
    try {
      const status = await getSetupStatus();
      setNeedsSetup(status.needsSetup);

      if (status.needsSetup) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      const token = getStoredToken();
      if (token) {
        const currentUser = await fetchCurrentUser();
        setUser(currentUser);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('refreshAuth error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  const login = async (params: { email: string; password: string }) => {
    const data = await signIn(params);
    setUser(data.user);
    setNeedsSetup(false);
  };

  const setupAdmin = async (params: { email: string; password: string }) => {
    const data = await createFirstAdmin(params);
    setUser(data.user);
    setNeedsSetup(false);
  };

  const logout = async () => {
    await signOut();
    setUser(null);
  };

  return React.createElement(
    AuthContext.Provider,
    {
      value: {
        user,
        isLoading,
        needsSetup,
        login,
        setupAdmin,
        logout,
        refreshAuth,
      },
    },
    children
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
