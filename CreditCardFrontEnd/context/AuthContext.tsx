import * as SecureStore from 'expo-secure-store';
import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';

import { apiRequest, AuthResponse, User } from '@/lib/api';

type AuthContextValue = {
  token: string | null;
  user: User | null;
  isReady: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: { name: string; email: string; phone: string; password: string }) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refreshMe: (tokenOverride?: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const TOKEN_KEY = 'nexa_api_token';

async function saveToken(token: string | null) {
  if (Platform.OS === 'web') {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
    return;
  }

  if (token) {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } else {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
}

async function loadToken() {
  if (Platform.OS === 'web') {
    return localStorage.getItem(TOKEN_KEY);
  }

  return SecureStore.getItemAsync(TOKEN_KEY);
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [isReady, setIsReady] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let mounted = true;

    loadToken()
      .then(async (storedToken) => {
        if (!storedToken || !mounted) return;
        const response = await apiRequest<{ user: User }>('/me', { token: storedToken });
        if (!mounted) return;
        setToken(storedToken);
        setUser(response.user);
      })
      .catch(() => saveToken(null))
      .finally(() => {
        if (mounted) setIsReady(true);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      isReady,
      isAuthenticated: Boolean(token && user),
      async login(email, password) {
        const response = await apiRequest<AuthResponse>('/login', {
          method: 'POST',
          body: { email, password },
        });
        setToken(response.token);
        setUser(response.user);
        await saveToken(response.token);
      },
      async register(payload) {
        const response = await apiRequest<AuthResponse>('/register', {
          method: 'POST',
          body: payload,
        });
        setToken(response.token);
        setUser(response.user);
        await saveToken(response.token);
        return response;
      },
      async logout() {
        if (token) {
          await apiRequest('/logout', { method: 'POST', token });
        }
        setToken(null);
        setUser(null);
        await saveToken(null);
      },
      async refreshMe(tokenOverride) {
        const activeToken = tokenOverride ?? token;
        if (!activeToken) return;
        const response = await apiRequest<{ user: User }>('/me', { token: activeToken });
        setUser(response.user);
      },
    }),
    [isReady, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider');
  }

  return context;
}
