/**
 * User Detail Hook - DEMO MODE
 * Fetch user detail and provide action mutations
 * 🎭 Uses mock data instead of real API calls
 */

import { useMemo, useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UserDetailDto } from '@/lib/api/types';
import { toast } from 'sonner';

// ============================================================================
// MOCK DATA HELPERS
// ============================================================================

/**
 * Simulates network delay (300-800ms)
 */
function simulateNetworkDelay(): Promise<void> {
  const delay = 300 + Math.random() * 500;
  return new Promise(resolve => setTimeout(resolve, delay));
}

/**
 * Generate mock user detail based on userId
 */
function getMockUserDetail(userId: string): UserDetailDto {
  // Determine role based on userId (for demo purposes)
  const isCreator = userId === '2' || userId.includes('creator');
  const role = isCreator ? 'CREATOR' : 'USER';

  // Mock user data
  const mockUsers: Record<string, Partial<UserDetailDto>> = {
    '1': {
      id: '1',
      email: 'robert.fox@example.com',
      displayName: 'Robert Fox',
      handle: 'robert-fox',
      role: 'USER',
      status: 'active',
      emailVerified: true,
      createdAt: '2024-02-10T10:00:00Z',
      lastLoginAt: new Date().toISOString(),
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Robert',
      bio: 'Fan passionné de fitness et lifestyle',
    },
    '2': {
      id: '2',
      email: 'sarah.creator@example.com',
      displayName: 'Sarah Johnson',
      handle: 'sarah-johnson',
      role: 'CREATOR',
      status: 'active',
      emailVerified: true,
      createdAt: '2023-06-15T10:00:00Z',
      lastLoginAt: new Date().toISOString(),
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      bio: 'Content creator - Fitness & Wellness',
    },
  };

  // Get mock user or create default
  const baseUser = mockUsers[userId] || {
    id: userId,
    email: `user${userId}@example.com`,
    displayName: `User ${userId}`,
    handle: `user-${userId}`,
    role,
    status: 'active',
    emailVerified: true,
    createdAt: new Date('2024-01-01').toISOString(),
    lastLoginAt: new Date().toISOString(),
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=User${userId}`,
    bio: isCreator ? 'Content creator' : 'Platform user',
  };

  // Add computed fields
  return {
    ...baseUser,
    _count: {
      posts: isCreator ? 42 : 0,
      followers: isCreator ? 1250 : 12,
      following: isCreator ? 45 : 25,
    },
  } as UserDetailDto;
}

/**
 * Mock hook for user detail
 */
function useUserDetailAPI(userId: string) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<UserDetailDto | undefined>(undefined);

  useEffect(() => {
    const loadData = async () => {
      console.log(`🎭 [DEMO MODE] useUserDetail - Loading for user ${userId}`);
      setIsLoading(true);
      await simulateNetworkDelay();

      const userData = getMockUserDetail(userId);
      setData(userData);

      console.log(`✅ [DEMO MODE] useUserDetail - User data loaded`, userData);
      setIsLoading(false);
    };

    if (userId) {
      loadData();
    }
  }, [userId]);

  const refetch = async () => {
    console.log(`🔄 [DEMO MODE] useUserDetail - Refetch called`);
    setIsLoading(true);
    await simulateNetworkDelay();
    setData(getMockUserDetail(userId));
    setIsLoading(false);
  };

  return {
    data,
    isLoading,
    isError: !!error,
    error,
    refetch,
  };
}

/**
 * Mock hook for banning user
 */
function useBanUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: any }) => {
      console.log('🎭 [DEMO MODE] useBanUser - Simulating ban', { userId, data });
      await simulateNetworkDelay();
      return { message: 'User banned successfully' };
    },
    onSuccess: (result, variables) => {
      console.log('✅ [DEMO MODE] User banned successfully');
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });

      toast.success('Utilisateur banni', {
        description: 'L\'utilisateur a été banni avec succès.',
      });
    },
    onError: (error: Error) => {
      console.error('❌ [DEMO MODE] Ban failed', error);
      toast.error('Erreur', {
        description: 'Impossible de bannir l\'utilisateur.',
      });
    },
  });
}

/**
 * Mock hook for suspending user
 */
function useSuspendUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: any }) => {
      console.log('🎭 [DEMO MODE] useSuspendUser - Simulating suspension', { userId, data });
      await simulateNetworkDelay();
      return { message: 'User suspended successfully' };
    },
    onSuccess: (result, variables) => {
      console.log('✅ [DEMO MODE] User suspended successfully');
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });

      toast.success('Utilisateur suspendu', {
        description: 'L\'utilisateur a été suspendu avec succès.',
      });
    },
    onError: (error: Error) => {
      console.error('❌ [DEMO MODE] Suspension failed', error);
      toast.error('Erreur', {
        description: 'Impossible de suspendre l\'utilisateur.',
      });
    },
  });
}

/**
 * Mock hook for updating user
 */
function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: any }) => {
      console.log('🎭 [DEMO MODE] useUpdateUser - Simulating update', { userId, data });
      await simulateNetworkDelay();

      // Merge with existing data
      const existing = getMockUserDetail(userId);
      return { ...existing, ...data };
    },
    onSuccess: (result, variables) => {
      console.log('✅ [DEMO MODE] User updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });

      toast.success('Utilisateur modifié', {
        description: 'Les informations ont été mises à jour avec succès.',
      });
    },
    onError: (error: Error) => {
      console.error('❌ [DEMO MODE] Update failed', error);
      toast.error('Erreur', {
        description: 'Impossible de mettre à jour l\'utilisateur.',
      });
    },
  });
}

// ============================================================================
// MAIN HOOK
// ============================================================================

export function useUserDetail(userId: string) {
  const { data, isLoading, isError, error, refetch } = useUserDetailAPI(userId);

  // Derive user type
  const isFan = useMemo(() => {
    if (!data) return false;
    return data.role === 'USER';
  }, [data]);

  const isCreator = useMemo(() => {
    if (!data) return false;
    return data.role === 'CREATOR';
  }, [data]);

  // Mutations
  const banMutation = useBanUser();
  const suspendMutation = useSuspendUser();
  const updateMutation = useUpdateUser();

  return {
    user: data,
    isFan,
    isCreator,
    isLoading,
    isError,
    error,
    refetch,
    // Mutations
    banUser: banMutation.mutate,
    suspendUser: suspendMutation.mutate,
    updateUser: updateMutation.mutate,
    isBanning: banMutation.isPending,
    isSuspending: suspendMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
}
