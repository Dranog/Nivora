/**
 * Support Tickets Page Tests (F8)
 * Tests: create, close, reply, assign
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor, cleanup, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SupportPage from '../page';
import { resetMockTickets } from '@/__tests__/mocks/handlers/tickets';

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
  usePathname: () => '/creator/support',
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

describe('Support Tickets Page', () => {
  beforeEach(() => {
    mockToast.mockClear();
    mockPush.mockClear();
    resetMockTickets();
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  it('displays tickets list', async () => {
    renderWithQuery(<SupportPage />);

    const ticketList = await screen.findByTestId('ticket-list', {}, { timeout: 3000 });
    expect(ticketList).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Payment issue with subscription')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('creates new ticket', async () => {
    const user = userEvent.setup();
    renderWithQuery(<SupportPage />);

    await screen.findByTestId('ticket-list', {}, { timeout: 3000 });

    const newTicketBtn = await screen.findByTestId('new-ticket-btn', {}, { timeout: 2000 });
    await user.click(newTicketBtn);

    const modal = await screen.findByTestId('new-ticket-modal', {}, { timeout: 2000 });
    expect(modal).toBeInTheDocument();

    const subjectInput = await screen.findByTestId('ticket-subject-input', {}, { timeout: 2000 });
    await user.type(subjectInput, 'Test Issue');

    const contentTextarea = await screen.findByTestId('ticket-content-textarea', {}, { timeout: 2000 });
    await user.type(contentTextarea, 'This is a test issue description with enough characters');

    const submitBtn = await screen.findByTestId('submit-ticket-btn', {}, { timeout: 2000 });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Ticket Created',
        })
      );
    }, { timeout: 3000 });
  });

  it('filters tickets by status', async () => {
    const user = userEvent.setup();
    renderWithQuery(<SupportPage />);

    await screen.findByTestId('ticket-list', {}, { timeout: 3000 });

    const statusFilter = await screen.findByTestId('status-filter', {}, { timeout: 2000 });
    await user.click(statusFilter);

    const listbox = await screen.findByRole('listbox', {}, { timeout: 2000 });
    const openOption = within(listbox).getByRole('option', { name: /^open$/i });
    await user.click(openOption);

    await waitFor(() => {
      expect(screen.getByText('Payment issue with subscription')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('filters tickets by assigned status', async () => {
    const user = userEvent.setup();
    renderWithQuery(<SupportPage />);

    await screen.findByTestId('ticket-list', {}, { timeout: 3000 });

    const assignedFilter = await screen.findByTestId('assigned-filter', {}, { timeout: 2000 });
    await user.click(assignedFilter);

    const listbox = await screen.findByRole('listbox', {}, { timeout: 2000 });
    const assignedOption = within(listbox).getByRole('option', { name: /assigned to me/i });
    await user.click(assignedOption);

    await waitFor(() => {
      expect(screen.queryByText('Payment issue with subscription')).not.toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('validates ticket form fields', async () => {
    const user = userEvent.setup();
    renderWithQuery(<SupportPage />);

    await screen.findByTestId('ticket-list', {}, { timeout: 3000 });

    const newTicketBtn = await screen.findByTestId('new-ticket-btn', {}, { timeout: 2000 });
    await user.click(newTicketBtn);

    // Wait for modal and form fields
    await screen.findByRole('dialog', {}, { timeout: 2000 });
    const subjectInput = await screen.findByTestId('ticket-subject-input', {}, { timeout: 2000 });
    const contentTextarea = await screen.findByTestId('ticket-content-textarea', {}, { timeout: 2000 });

    // Try to submit empty form - button should be enabled but form shouldn't submit
    const submitBtn = await screen.findByTestId('submit-ticket-btn', {}, { timeout: 2000 });
    expect(submitBtn).toBeEnabled();

    // Fill form with invalid data (too short)
    await user.type(subjectInput, 'Hi');
    await user.type(contentTextarea, 'Short');
    await user.click(submitBtn);

    // Modal should still be open (form didn't submit)
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeInTheDocument();
    }, { timeout: 1000 });
  });
});
