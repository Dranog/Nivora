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

export const categoriesApi = {
  /**
   * Get all active categories
   */
  list: () => j('/categories'),

  /**
   * Get a specific category
   */
  get: (id: string) => j(`/categories/${id}`),

  /**
   * Create a new category (admin only)
   */
  create: (data: { name: string; slug: string; description?: string; icon?: string }) =>
    j('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /**
   * Seed default categories (admin only)
   */
  seed: () =>
    j('/categories/seed', {
      method: 'POST',
    }),
};
