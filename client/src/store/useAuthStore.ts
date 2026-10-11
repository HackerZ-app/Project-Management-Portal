import { create } from 'zustand';
import { User, UserRole } from '../types/auth.types';
import authService from '../services/auth.service';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  // Actions
  initializeAuth: () => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<boolean>;
  devLogin: (params: { email: string; name?: string; role?: UserRole; department?: string }) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('auth_token'),
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,

  /**
   * Safeguard 4: On-mount session hydration
   * Validates stored token with backend /api/auth/me to fetch fresh database attributes.
   * Cleans up stale tokens on 401/expiry.
   */
  initializeAuth: async () => {
    const token = localStorage.getItem('auth_token');

    if (!token) {
      set({ isInitialized: true, isAuthenticated: false, user: null, token: null });
      return;
    }

    try {
      set({ isLoading: true });
      const response = await authService.getMe();

      if (response.success && response.user) {
        localStorage.setItem('auth_user', JSON.stringify(response.user));
        set({
          user: response.user,
          token,
          isAuthenticated: true,
          isLoading: false,
          isInitialized: true,
          error: null,
        });
      } else {
        throw new Error('Invalid user session');
      }
    } catch (err: any) {
      // Stale or expired token: clear storage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
      });
    }
  },

  /**
   * Handle Google OAuth credential submission
   */
  loginWithGoogle: async (credential: string): Promise<boolean> => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.loginWithGoogle(credential);

      if (response.token && response.user) {
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('auth_user', JSON.stringify(response.user));

        set({
          user: response.user,
          token: response.token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return true;
      }
      throw new Error('Malformed login response');
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        'Authentication failed. Please ensure you are using an official @srmap.edu.in account.';
      set({ error: errorMsg, isLoading: false, isAuthenticated: false });
      return false;
    }
  },

  /**
   * Dev sandbox login for local testing
   */
  devLogin: async (params): Promise<boolean> => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.devLogin(params);

      if (response.token && response.user) {
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('auth_user', JSON.stringify(response.user));

        set({
          user: response.user,
          token: response.token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return true;
      }
      return false;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Dev login failed';
      set({ error: errorMsg, isLoading: false });
      return false;
    }
  },

  /**
   * Logout user and clear local session
   */
  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },

  clearError: () => set({ error: null }),
  setUser: (user: User) => set({ user }),
}));
