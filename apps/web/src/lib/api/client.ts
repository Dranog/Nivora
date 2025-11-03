// apps/web/src/lib/api/client.ts
export const apiBase =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

/** petit helper JSON */
async function j<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(apiBase + path, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${msg}`);
  }
  return res.json();
}

/** API minimale utilisée par tes panneaux (aucune logique backend modifiée) */
export const api = {
  auth: {
    login: (email: string) =>
      j<{ user: any }>(`/auth/login`, {
        method: "POST",
        body: JSON.stringify({ email }),
      }),
    me: () => j(`/users/me`),
  },
  posts: {
    listMine: () => j(`/posts/mine`),
    create: (body: {
      caption?: string;
      isPaid: boolean;
      price?: number;
      mediaIds?: string[];
    }) => j(`/posts`, { method: "POST", body: JSON.stringify(body) }),
  },
  storage: {
    getSignedUrl: (body: {
      contentType: string;
      contentLength: number;
      purpose: "PAID" | "TEASER";
    }) => j(`/storage/signed-url`, { method: "POST", body: JSON.stringify(body) }),
    complete: (body: { objectKey: string; checksum: string }) =>
      j(`/storage/complete`, { method: "POST", body: JSON.stringify(body) }),
    playback: (body: { mediaId: string }) =>
      j<{ playUrl: string }>(`/storage/playback`, {
        method: "POST",
        body: JSON.stringify(body),
      }),
  },
  payouts: {
    me: () => j(`/payouts/me`),
  },
};
