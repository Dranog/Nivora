/**
 * Admin KYC Hooks
 * React Query hooks for KYC verification management
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import { http } from '@/lib/http';
import { toast } from 'sonner';
import type {
  KycVerification,
  KycStatus,
  KycLevel,
} from '@/lib/api/types';

// ============================================================================
// Query Keys
// ============================================================================

export const kycKeys = {
  all: ['admin', 'kyc'] as const,
  lists: () => [...kycKeys.all, 'list'] as const,
  list: (status?: KycStatus) => [...kycKeys.lists(), status] as const,
  details: () => [...kycKeys.all, 'detail'] as const,
  detail: (id: string) => [...kycKeys.details(), id] as const,
};

// ============================================================================
// Query Types
// ============================================================================

interface KycSubmissionsQuery {
  page?: number;
  limit?: number;
  status?: KycStatus;
}

interface KycSubmissionsResponse {
  submissions: KycVerification[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * GET /admin/kyc
 * Get KYC submissions list
 */
async function getKycSubmissions(query: KycSubmissionsQuery = {}): Promise<KycSubmissionsResponse> {
  const response = await http.get<KycSubmissionsResponse>('/admin/kyc', {
    params: query,
  });
  return response;
}

/**
 * GET /admin/kyc/:id
 * Get KYC submission detail
 */
async function getKycSubmission(submissionId: string): Promise<KycVerification> {
  const response = await http.get<KycVerification>(`/admin/kyc/${submissionId}`);
  return response;
}

/**
 * PATCH /admin/kyc/:id
 * Update KYC verification level
 */
async function updateKycLevel(
  submissionId: string,
  data: { level: KycLevel; note?: string }
): Promise<KycVerification> {
  const response = await http.patch<KycVerification>(`/admin/kyc/${submissionId}`, data);
  return response;
}

/**
 * POST /admin/kyc/:id/decision
 * Make decision on KYC submission (approve or reject)
 */
async function makeKycDecision(
  submissionId: string,
  data: { action: 'APPROVE' | 'REJECT'; reason?: string }
): Promise<KycVerification> {
  const response = await http.post<KycVerification>(`/admin/kyc/${submissionId}/decision`, data);
  return response;
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook: Get KYC submissions list
 */
export function useKycSubmissions(
  query: KycSubmissionsQuery = {},
  options?: Omit<UseQueryOptions<KycSubmissionsResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: kycKeys.list(query.status),
    queryFn: () => getKycSubmissions(query),
    staleTime: 30 * 1000, // 30 seconds
    ...options,
  });
}

/**
 * Hook: Get KYC submission detail
 */
export function useKycSubmission(
  submissionId: string,
  options?: Omit<UseQueryOptions<KycVerification, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: kycKeys.detail(submissionId),
    queryFn: () => getKycSubmission(submissionId),
    enabled: !!submissionId,
    staleTime: 30 * 1000, // 30 seconds
    ...options,
  });
}

/**
 * Hook: Approve KYC submission
 */
export function useApproveKyc(
  options?: Omit<UseMutationOptions<KycVerification, Error, string>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (submissionId: string) =>
      makeKycDecision(submissionId, { action: 'APPROVE' }),
    onSuccess: (data, submissionId) => {
      queryClient.invalidateQueries({ queryKey: kycKeys.lists() });
      queryClient.invalidateQueries({ queryKey: kycKeys.detail(submissionId) });

      toast.success('KYC approuvé', {
        description: 'La vérification KYC a été approuvée avec succès.',
      });
    },
    ...options,
  });
}

/**
 * Hook: Reject KYC submission
 */
export function useRejectKyc(
  options?: Omit<
    UseMutationOptions<KycVerification, Error, { submissionId: string; reason: string }>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ submissionId, reason }: { submissionId: string; reason: string }) =>
      makeKycDecision(submissionId, { action: 'REJECT', reason }),
    onSuccess: (data, { submissionId }) => {
      queryClient.invalidateQueries({ queryKey: kycKeys.lists() });
      queryClient.invalidateQueries({ queryKey: kycKeys.detail(submissionId) });

      toast.success('KYC rejeté', {
        description: 'La vérification KYC a été rejetée.',
      });
    },
    ...options,
  });
}

/**
 * Hook: Update KYC level
 */
export function useUpdateKycLevel(
  options?: Omit<
    UseMutationOptions<
      KycVerification,
      Error,
      { submissionId: string; level: KycLevel; note?: string }
    >,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ submissionId, level, note }: { submissionId: string; level: KycLevel; note?: string }) =>
      updateKycLevel(submissionId, { level, note }),
    onSuccess: (data, { submissionId }) => {
      queryClient.invalidateQueries({ queryKey: kycKeys.lists() });
      queryClient.invalidateQueries({ queryKey: kycKeys.detail(submissionId) });

      toast.success('Niveau KYC mis à jour', {
        description: 'Le niveau de vérification a été mis à jour avec succès.',
      });
    },
    ...options,
  });
}
