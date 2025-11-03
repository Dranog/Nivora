// path: apps/web/src/hooks/useTransactionsTrends.ts
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

const point = z.object({
  date: z.string(),            // ISO date
  volumeCents: z.number().int(),
  count: z.number().int(),
});
const trendSchema = z.object({
  range: z.string(),           // e.g. "7d" | "30d"
  currency: z.string(),        // e.g. "EUR"
  points: z.array(point),
  totals: z.object({
    volumeCents: z.number().int(),
    count: z.number().int(),
  }),
});
export type TransactionsTrend = z.infer<typeof trendSchema>;

export function useTransactionsTrends(params: { range: "7d" | "30d" | "90d"; userId?: string }) {
  return useQuery({
    queryKey: ["transactions-trends", params],
    queryFn: async () => {
      const p = new URLSearchParams({ range: params.range, ...(params.userId ? { userId: params.userId } : {}) });
      const r = await fetch(`/api/admin/transactions/trends?${p.toString()}`, { cache: "no-store" });
      if (!r.ok) throw new Error(`Trends HTTP ${r.status}`);
      const j = await r.json();
      return trendSchema.parse(j);
    },
    staleTime: 60_000,
    retry: 1,
  });
}
