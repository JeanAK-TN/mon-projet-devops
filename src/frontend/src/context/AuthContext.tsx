import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api } from '../api/client';
import type { User } from '../types';

interface AuthContextValue {
  token: string | null;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) { setUser(null); return; }
    setLoading(true);
    api.me(token)
      .then(setUser)
      .catch(() => { setToken(null); localStorage.removeItem('token'); })
      .finally(() => setLoading(false));
  }, [token]);

  const login = async (email: string, password: string) => {
    const { token: t, user: u } = await api.login({ email, password });
    localStorage.setItem('token', t);
    setToken(t);
    setUser(u);
  };

  const register = async (email: string, password: string, name: string) => {
    const { token: t, user: u } = await api.register({ email, password, name });
    localStorage.setItem('token', t);
    setToken(t);
    setUser(u);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
