// apps/web/src/lib/api/client.ts
// Client API minimal (stub). Remplace au besoin par tes vraies routes plus tard.

export const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

async function j<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(apiBase + path, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export const api = {
  // Exemples; tes shims _api/* peuvent appeler ici plus tard
  posts: {
    listMine: () => j<any[]>("/api/_mock/posts"),
    create: (body: any) => j("/api/_mock/posts", { method: "POST", body: JSON.stringify(body) }),
  },
  storage: {
    getSignedUrl: (body: any) => j("/api/_mock/signed-url", { method: "POST", body: JSON.stringify(body) }),
    complete: (body: any) => j("/api/_mock/complete", { method: "POST", body: JSON.stringify(body) }),
    playback: (body: any) => Promise.resolve({ playUrl: "/video/mock.m3u8", ...body }),
  },
  payouts: {
    me: () => Promise.resolve({
      wallet: { available: 113400, pendingClear: 89000, inReserve: 24500 },
      nextReleases: [{ date: "2025-10-17", amount: 89000 }, { date: "2025-10-30", amount: 24500 }],
      eligibleModes: ["STANDARD", "EXPRESS_FIAT", "EXPRESS_CRYPTO"],
    }),
  },
};
