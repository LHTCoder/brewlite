'use client';
import { create } from 'zustand';
import type { User } from '@/lib/types';

interface AuthState {
  user: User | null;
  token: string | null;
  hydrated: boolean;
  hydrate: () => void;
  login: (token: string, user: User) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

const TOKEN_KEY = 'brewlite.token';
const USER_KEY = 'brewlite.user';

/** FR-04 Phiên đăng nhập – token JWT lưu localStorage, gửi qua header Authorization */
export const useAuth = create<AuthState>()((set) => ({
  user: null,
  token: null,
  hydrated: false,
  hydrate: () => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const user = localStorage.getItem(USER_KEY);
      set({ token, user: user ? (JSON.parse(user) as User) : null, hydrated: true });
    } catch {
      set({ hydrated: true });
    }
  },
  login: (token, user) => {
    try {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch {
      /* private mode */
    }
    set({ token, user });
  },
  setUser: (user) => {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch {
      /* ignore */
    }
    set({ user });
  },
  logout: () => {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch {
      /* ignore */
    }
    set({ token: null, user: null });
  },
}));
