// path: apps/web/src/hooks/useKycDetail.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

export type KycStatus = "NOT_STARTED" | "PENDING" | "UNDER_REVIEW" | "VERIFIED" | "REJECTED" | "EXPIRED";
export type KycLevel = "NONE" | "BASIC" | "INTERMEDIATE" | "FULL" | "ENHANCED";
const kycSchema = z.object({
  id: z.string(),
  userId: z.string(),
  provider: z.string(),
  status: z.custom<KycStatus>(),
  level: z.custom<KycLevel>(),
  documents: z.record(z.string(), z.unknown()),
  documentKeys: z.record(z.string(), z.unknown()),
  personalData: z.record(z.string(), z.unknown()),
  piiEncrypted: z.boolean(),
  aiScores: z.record(z.string(), z.union([z.number(), z.string(), z.boolean(), z.null()])),
  riskScore: z.number().nullable(),
  selfieMatchScore: z.number().nullable(),
  livenessResult: z.string().nullable(),
  country: z.string().nullable(),
  dateOfBirth: z.string().nullable(),
  reviewedById: z.string().nullable(),
  reviewedAt: z.string().nullable(),
  approvedAt: z.string().nullable(),
  rejectedAt: z.string().nullable(),
  rejectionReason: z.string().nullable(),
  expiresAt: z.string(),
  recheckAt: z.string().nullable(),
  webhookEvents: z.array(z.unknown()),
  createdAt: z.string(),
  updatedAt: z.string(),
  user: z.object({
    id: z.string(),
    email: z.string(),
    username: z.string().nullable(),
    displayName: z.string().nullable(),
    avatar: z.string().nullable(),
    kycStatus: z.custom<KycStatus>(),
    kycLevel: z.custom<KycLevel>(),
  }).optional(),
});
export type KycDetail = z.infer<typeof kycSchema>;

const updateSchema = z.object({ level: z.enum(["NONE","BASIC","INTERMEDIATE","FULL","ENHANCED"]), note: z.string().max(500).optional() });
const decisionSchema = z.object({ action: z.enum(["APPROVE","REJECT"]), reason: z.string().min(3).max(500).optional() });

export function useKycDetail(id: string) {
  return useQuery({
    queryKey: ["kyc", id],
    queryFn: async () => {
      const r = await fetch(`/api/admin/kyc/${id}`, { cache: "no-store" });
      if (!r.ok) throw new Error(`KYC HTTP ${r.status}`);
      const j = await r.json();
      return kycSchema.parse(j);
    },
    retry: 1,
  });
}

export function useKycUpdateLevel(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: z.infer<typeof updateSchema>) => {
      const body = updateSchema.parse(payload);
      const r = await fetch(`/api/admin/kyc/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!r.ok) throw new Error(`PATCH HTTP ${r.status}`);
      const j = await r.json();
      return kycSchema.parse(j);
    },
    onSuccess: (data) => qc.setQueryData(["kyc", id], data),
  });
}

export function useKycDecision(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: z.infer<typeof decisionSchema>) => {
      const body = decisionSchema.parse(payload);
      const r = await fetch(`/api/admin/kyc/${id}/decision`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!r.ok) throw new Error(`Decision HTTP ${r.status}`);
      const j = await r.json();
      return kycSchema.parse(j);
    },
    onSuccess: (data) => qc.setQueryData(["kyc", id], data),
  });
}
