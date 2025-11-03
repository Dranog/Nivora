/**
 * Next.js Router Mock (App Router)
 */

import { vi } from 'vitest';

export const mockRouter = () => ({
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  prefetch: vi.fn(),
});

export const mockParams = { id: 'fan-1' };

export const setupRouterMock = () => {
  vi.mock('next/navigation', () => ({
    useRouter: () => mockRouter(),
    usePathname: () => '/creator/crm/fan-1',
    useSearchParams: () => new URLSearchParams('?tab=notes'),
    useParams: () => mockParams,
  }));
};
