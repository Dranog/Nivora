export type Query = Record<string, string | number | boolean | undefined>;

function qs(q: Query = {}) {
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(q)) {
    if (v !== undefined && v !== null) usp.set(k, String(v));
  }
  return usp.toString();
}

/** Liste des logs d’audit */
export async function fetchAuditLogs(params: Query = {}) {
  const res = await fetch(`/api/admin/audit-log?${qs(params)}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/** Export CSV des logs d’audit */
export async function exportAuditLogsCsv(params: Query = {}) {
  const res = await fetch(`/api/admin/audit-log/export?${qs(params)}`);
  if (!res.ok) throw new Error(`Export failed ${res.status}`);
  return res.blob(); // Blob CSV pour téléchargement
}
