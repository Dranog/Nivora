// apps/web/src/hooks/useAuditLog.ts
import { useQuery, keepPreviousData, useMutation } from "@tanstack/react-query";
import { z } from "zod";

const item = z.object({
  id: z.string(),
  createdAt: z.string(),
  userId: z.string().nullable(),
  event: z.string(),
  resource: z.string().nullable(),
  meta: z.record(z.string(), z.unknown()).nullable().optional(),
  ipHash: z.string().nullable(),
  ua: z.string().nullable(),
  user: z.object({ id: z.string(), email: z.string(), username: z.string().nullable() }).optional(),
});
const listSchema = z.object({
  items: z.array(item),
  total: z.number().int(),
  page: z.number().int(),
  pageSize: z.number().int(),
  knownEvents: z.array(z.string()).optional(),
});
export type AuditList = z.infer<typeof listSchema>;

type Params = {
  page: number;
  pageSize: number;
  q?: string;
  event?: string;
  userId?: string;
  from?: string;
  to?: string;
};

function buildQS(input: Record<string, string | number | undefined>): string {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(input)) if (v !== undefined && String(v).length) p.set(k, String(v));
  return p.toString();
}

async function fetchAudit(params: Params): Promise<AuditList> {
  const res = await fetch(`/api/admin/audit-logs?${buildQS(params)}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Audit logs HTTP ${res.status}`);
  const json = await res.json();
  return listSchema.parse(json);
}

async function doExport(params: Params): Promise<Blob> {
  const url = `/api/admin/audit-logs/export?${buildQS(params)}`;
  const res = await fetch(url, { method: "POST" });
  if (!res.ok) throw new Error(`Export HTTP ${res.status}`);
  const ct = res.headers.get("content-type") ?? "";
  if (ct.includes("text/csv") || ct.includes("application/octet-stream")) {
    return await res.blob();
  }
  const j = (await res.json()) as { url?: string };
  if (!j?.url) throw new Error("URL d’export manquante");
  const res2 = await fetch(j.url, { cache: "no-store" });
  if (!res2.ok) throw new Error(`Téléchargement export HTTP ${res2.status}`);
  return await res2.blob();
}

export function useAuditLog(params: Params) {
  const query = useQuery({
    queryKey: ["audit-logs", params],
    queryFn: () => fetchAudit(params),
    placeholderData: keepPreviousData,
    retry: 1,
  });

  const mExport = useMutation({
    mutationFn: (override?: Partial<Params>) => doExport({ ...params, ...(override ?? {}) } as Params),
  });

  return {
    ...query,
    exportCsv: mExport.mutateAsync, // (override?: Partial<Params>) => Promise<Blob>
    isExporting: mExport.isPending,
  };
}
