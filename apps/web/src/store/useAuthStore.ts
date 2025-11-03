/**
 * Auth Store - F2 Auth & Onboarding
 * Manages authentication state with API integration
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as authApi from '@/lib/api/auth';
import type { AuthInput, User, OnboardingInput } from '@/lib/schemas/auth';

export type UserRole = 'fan' | 'creator' | 'admin';

interface AuthState {
  isAuthenticated: boolean;
  role: UserRole | null;
  onboardingDone: boolean;
  userId: string | null;
  email: string | null;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  // API methods
  login: (input: AuthInput) => Promise<User>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<User>;
  completeOnboarding: (input: OnboardingInput) => Promise<User>;

  // Sync methods
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  isAuthenticated: false,
  role: null,
  onboardingDone: false,
  userId: null,
  email: null,
  isLoading: false,
  error: null,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      ...initialState,

      // Login with API call
      login: async (input: AuthInput) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login(input);
          const { user } = response;

          set({
            isAuthenticated: true,
            role: user.role,
            userId: user.id,
            email: user.email,
            onboardingDone: user.onboardingDone,
            isLoading: false,
            error: null,
          });

          return user;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Login failed';
          set({ isLoading: false, error: message });
          throw error;
        }
      },

      // Logout with API call
      logout: async () => {
        set({ isLoading: true, error: null });
        try {
          await authApi.logout();
          set({ ...initialState });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Logout failed';
          set({ isLoading: false, error: message });
          throw error;
        }
      },

      // Fetch current user
      fetchMe: async () => {
        set({ isLoading: true, error: null });
        try {
          const user = await authApi.fetchMe();

          set({
            isAuthenticated: true,
            role: user.role,
            userId: user.id,
            email: user.email,
            onboardingDone: user.onboardingDone,
            isLoading: false,
            error: null,
          });

          return user;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to fetch user';
          set({ ...initialState, error: message, isLoading: false });
          throw error;
        }
      },

      // Complete onboarding
      completeOnboarding: async (input: OnboardingInput) => {
        set({ isLoading: true, error: null });
        try {
          const user = await authApi.completeOnboarding(input);

          set({
            role: user.role,
            onboardingDone: true,
            isLoading: false,
            error: null,
          });

          return user;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Onboarding failed';
          set({ isLoading: false, error: message });
          throw error;
        }
      },

      // Sync set user (for OAuth or other flows)
      setUser: (user: User) => {
        set({
          isAuthenticated: true,
          role: user.role,
          userId: user.id,
          email: user.email,
          onboardingDone: user.onboardingDone,
          error: null,
        });
      },

      // Set loading state
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      // Set error
      setError: (error: string | null) => {
        set({ error });
      },

      // Reset to initial state
      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        // Only persist these fields
        isAuthenticated: state.isAuthenticated,
        role: state.role,
        onboardingDone: state.onboardingDone,
        userId: state.userId,
        email: state.email,
      }),
    }
  )
);
