/**
 * Auth Hooks - F3 React Query
 */

import { useMutation, useQuery, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import * as authApi from '@/lib/api/auth';
import { authKeys } from '@/lib/api/auth';
import type { User, AuthInput } from '@/types/auth';
import { mapErrorToToast } from '@/lib/errors';
import { useToast } from '@/hooks/use-toast';

/**
 * Get current user
 */
export function useMe() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: authKeys.me(),
    queryFn: authApi.fetchMe,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Login mutation
 */
export function useLogin(options?: UseMutationOptions<{ user: User; token: string }, Error, AuthInput>) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { setUser } = useAuthStore();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: ({ user }) => {
      setUser(user);
      queryClient.setQueryData(authKeys.me(), user);

      toast({
        title: 'Welcome!',
        description: `Logged in as ${user.email}`,
      });

      // Redirect based on onboarding
      if (!user.onboardingDone) {
        router.push('/onboarding');
      } else {
        router.push(`/${user.role}`);
      }
    },
    onError: (error) => {
      const { title, message } = mapErrorToToast(error);
      toast({
        title,
        description: message,
        variant: 'destructive',
      });
    },
    ...options,
  });
}

/**
 * Logout mutation
 */
export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { reset } = useAuthStore();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      reset();
      queryClient.clear();

      toast({
        title: 'Logged out',
        description: 'You have been logged out successfully',
      });

      router.push('/');
    },
    onError: (error) => {
      const { title, message } = mapErrorToToast(error);
      toast({
        title,
        description: message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Complete onboarding mutation
 */
export function useCompleteOnboarding() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: authApi.completeOnboarding,
    onSuccess: (user) => {
      queryClient.setQueryData(authKeys.me(), user);

      toast({
        title: 'Welcome aboard!',
        description: 'Your account is ready',
      });

      router.push(`/${user.role}`);
    },
    onError: (error) => {
      const { title, message } = mapErrorToToast(error);
      toast({
        title,
        description: message,
        variant: 'destructive',
      });
    },
  });
}
