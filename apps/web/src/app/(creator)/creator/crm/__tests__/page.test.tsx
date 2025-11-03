/**
 * CRM Fans List Page Tests (F8)
 * Tests: filters, pagination, CSV export
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor, cleanup, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CRMPage from '../page';
import { server } from '@/__tests__/mocks/server';
import { http, HttpResponse } from 'msw';
import { resetMockFans } from '@/__tests__/mocks/handlers/fan-crm';

const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    back: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/creator/crm',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

function renderWithQuery(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('CRM Fans List Page', () => {
  beforeEach(() => {
    mockToast.mockClear();
    resetMockFans();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  it('displays fans list', async () => {
    renderWithQuery(<CRMPage />);

    const table = await screen.findByTestId('fan-table', {}, { timeout: 3000 });
    expect(table).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      expect(screen.getByText('Bob Smith')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('filters by stage', async () => {
    const user = userEvent.setup();
    renderWithQuery(<CRMPage />);

    await screen.findByTestId('fan-table', {}, { timeout: 3000 });

    const stageFilter = await screen.findByTestId('stage-filter', {}, { timeout: 2000 });
    await user.click(stageFilter);

    const listbox = await screen.findByRole('listbox', {}, { timeout: 2000 });
    const vipOption = within(listbox).getByRole('option', { name: /vip/i });
    await user.click(vipOption);

    await waitFor(() => {
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      expect(screen.queryByText('Bob Smith')).not.toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('filters by tags', async () => {
    const user = userEvent.setup();
    renderWithQuery(<CRMPage />);

    await screen.findByTestId('fan-table', {}, { timeout: 3000 });

    const tagsFilter = await screen.findByTestId('tags-filter', {}, { timeout: 2000 });
    expect(tagsFilter).toBeInTheDocument();

    const vipTagBtn = await screen.findByTestId('tag-filter-tag-1', {}, { timeout: 2000 });
    await user.click(vipTagBtn);

    await waitFor(() => {
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('searches fans with debounce', async () => {
    const user = userEvent.setup();
    renderWithQuery(<CRMPage />);

    await screen.findByTestId('fan-table', {}, { timeout: 3000 });

    // Wait for initial fans to load
    await waitFor(() => {
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      expect(screen.getByText('Bob Smith')).toBeInTheDocument();
    }, { timeout: 2000 });

    const searchInput = await screen.findByTestId('search-input', {}, { timeout: 2000 });
    await user.type(searchInput, 'Alice');

    // Wait for debounce (300ms) + query time
    await waitFor(() => {
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      expect(screen.queryByText('Bob Smith')).not.toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('paginates fans list', async () => {
    const user = userEvent.setup();

    server.use(
      http.get('/api/crm/fans', () => {
        return HttpResponse.json({
          fans: Array.from({ length: 20 }, (_, i) => ({
            id: `fan-${i}`,
            name: `Fan ${i}`,
            email: `fan${i}@example.com`,
            stage: 'customer',
            tags: [],
            totalSpent: 100,
            joinedAt: new Date().toISOString(),
            notes: [],
            purchases: [],
          })),
          total: 50,
          page: 1,
          limit: 20,
          hasMore: true,
        });
      })
    );

    renderWithQuery(<CRMPage />);

    await screen.findByTestId('fan-table', {}, { timeout: 3000 });

    const nextBtn = await screen.findByTestId('next-page-btn', {}, { timeout: 2000 });
    expect(nextBtn).not.toBeDisabled();

    await user.click(nextBtn);

    await waitFor(() => {
      expect(screen.queryByText('Fan 0')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('exports fans to CSV', async () => {
    const user = userEvent.setup();

    const mockCreateObjectURL = vi.fn().mockReturnValue('blob:csv');
    const mockRevokeObjectURL = vi.fn();
    const mockClick = vi.fn();

    global.URL.createObjectURL = mockCreateObjectURL;
    global.URL.revokeObjectURL = mockRevokeObjectURL;
    HTMLAnchorElement.prototype.click = mockClick;

    renderWithQuery(<CRMPage />);

    await screen.findByTestId('fan-table', {}, { timeout: 3000 });

    const exportBtn = await screen.findByTestId('export-csv-btn', {}, { timeout: 2000 });
    await user.click(exportBtn);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Export Complete',
        })
      );
    }, { timeout: 3000 });

    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(mockClick).toHaveBeenCalled();
  });
});
