/**
 * Auth Sync - F1 Shell SPA
 * Synchronizes auth state from localStorage to cookies for middleware
 */

'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';

export function AuthSync() {
  const authState = useAuthStore();

  useEffect(() => {
    // Sync auth state to cookies so middleware can read it
    const authData = {
      state: {
        isAuthenticated: authState.isAuthenticated,
        role: authState.role,
        onboardingDone: authState.onboardingDone,
        userId: authState.userId,
      },
    };

    // Set cookie with auth state
    document.cookie = `auth-storage=${JSON.stringify(authData)}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days
  }, [authState.isAuthenticated, authState.role, authState.onboardingDone, authState.userId]);

  return null;
}
