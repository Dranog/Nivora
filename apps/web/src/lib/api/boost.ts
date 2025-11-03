import { apiBase } from './client';

async function j<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(apiBase + path, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${msg}`);
  }
  return res.json();
}

export const boostApi = {
  /**
   * Boost a listing
   */
  boostListing: (listingId: string, data: { duration: number; amount: number }) =>
    j(`/boost/${listingId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /**
   * Get user's boosts
   */
  getMyBoosts: () => j('/boost/my-boosts'),

  /**
   * Get active boosts for a listing
   */
  getListingBoosts: (listingId: string) => j(`/boost/listing/${listingId}`),
};
