/**
 * CRM Fan Detail Page Tests (F8)
 * Tests: add note, add/remove tag, change stage
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor, cleanup, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FanDetailPageComponent } from '../page.component';
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
  usePathname: () => '/creator/crm/fan-1',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({ id: 'fan-1' }),
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

describe('CRM Fan Detail Page', () => {
  beforeEach(() => {
    mockToast.mockClear();
    mockPush.mockClear();
    resetMockFans();
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  it('adds note to fan', async () => {
    const user = userEvent.setup();

    renderWithQuery(<FanDetailPageComponent fanId="fan-1" />);

    await screen.findByTestId('fan-detail', {}, { timeout: 3000 });

    const notesTab = await screen.findByRole('tab', { name: /notes/i }, {}, { timeout: 2000 });
    await user.click(notesTab);

    const textarea = await screen.findByTestId('new-note-textarea', {}, { timeout: 2000 });
    await user.type(textarea, 'Great customer!');

    const addBtn = await screen.findByTestId('add-note-btn', {}, { timeout: 2000 });
    await user.click(addBtn);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Note Added',
        })
      );
    }, { timeout: 3000 });
  });

  it('displays tags and allows removing them', async () => {
    const user = userEvent.setup();

    renderWithQuery(<FanDetailPageComponent fanId="fan-1" />);

    await screen.findByTestId('fan-detail', {}, { timeout: 3000 });

    // Verify tag picker is rendered
    const tagPicker = await screen.findByTestId('tag-picker', {}, { timeout: 2000 });
    expect(tagPicker).toBeInTheDocument();

    // Verify add tag button exists
    const addTagBtn = await screen.findByTestId('add-tag-btn', {}, { timeout: 2000 });
    expect(addTagBtn).toBeEnabled();

    // Test removing an existing tag
    const removeTagBtn = await screen.findByTestId('remove-tag-tag-1', {}, { timeout: 2000 });
    await user.click(removeTagBtn);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Tag Removed',
        })
      );
    }, { timeout: 3000 });
  });

  it('changes fan stage', async () => {
    const user = userEvent.setup();

    renderWithQuery(<FanDetailPageComponent fanId="fan-1" />);

    await screen.findByTestId('fan-detail', {}, { timeout: 3000 });

    const stageSelect = await screen.findByTestId('stage-select', {}, { timeout: 2000 });
    await user.click(stageSelect);

    const listbox = await screen.findByRole('listbox', {}, { timeout: 2000 });
    const customerOption = within(listbox).getByRole('option', { name: /customer/i });
    await user.click(customerOption);

    const confirmBtn = await screen.findByTestId('confirm-stage-change', {}, { timeout: 2000 });
    await user.click(confirmBtn);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Stage Changed',
        })
      );
    }, { timeout: 3000 });
  });
});
