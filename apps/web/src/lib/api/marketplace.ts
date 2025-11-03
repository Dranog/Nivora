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

export const marketplaceApi = {
  // ============================================================================
  // LISTINGS
  // ============================================================================

  /**
   * Get all active listings
   */
  listListings: (categoryId?: string) =>
    j(`/marketplace/listings${categoryId ? `?categoryId=${categoryId}` : ''}`),

  /**
   * Get a specific listing
   */
  getListing: (id: string) => j(`/marketplace/listings/${id}`),

  /**
   * Get creator's own listings
   */
  getMyListings: () => j('/marketplace/my-listings'),

  /**
   * Create a new listing
   */
  createListing: (data: {
    title: string;
    description: string;
    price: number;
    categoryId?: string;
    mediaUrls?: string[];
  }) =>
    j('/marketplace/listings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /**
   * Update a listing
   */
  updateListing: (id: string, data: any) =>
    j(`/marketplace/listings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  /**
   * Delete a listing
   */
  deleteListing: (id: string) =>
    j(`/marketplace/listings/${id}`, {
      method: 'DELETE',
    }),

  // ============================================================================
  // REQUESTS
  // ============================================================================

  /**
   * Get all requests (fan or creator)
   */
  listRequests: (role: 'fan' | 'creator') =>
    j(`/marketplace/requests?role=${role}`),

  /**
   * Get a specific request
   */
  getRequest: (id: string) => j(`/marketplace/requests/${id}`),

  /**
   * Create a new request
   */
  createRequest: (data: {
    title: string;
    description: string;
    budget?: number;
    creatorId?: string;
    listingId?: string;
  }) =>
    j('/marketplace/requests', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /**
   * Update a request (accept/decline)
   */
  updateRequest: (id: string, data: { status?: string; response?: string }) =>
    j(`/marketplace/requests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};
