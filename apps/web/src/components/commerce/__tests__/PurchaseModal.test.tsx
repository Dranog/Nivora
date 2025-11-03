/**
 * PurchaseModal Tests
 * Test 1: PPV purchase success → toast + optimistic unlock
 * Test 2: PPV purchase fail → error toast + rollback
 * Test 3: Valid/invalid promo code → discount applied / error message
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PurchaseModal } from '../PurchaseModal';
import { server } from '@/__tests__/mocks/server';
import { http, HttpResponse } from 'msw';
import type { ConfirmPurchaseResponse } from '@/types/commerce';

// Mock toast
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

// Helper to wrap component with React Query provider
function renderWithQuery(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return {
    ...render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>),
    queryClient,
  };
}

describe('PurchaseModal - Commerce Tests', () => {
  beforeEach(() => {
    mockToast.mockClear();
    localStorage.clear();
  });

  afterEach(() => {
    cleanup(); // Force unmount all components including Dialog portals
    localStorage.clear();
  });

  describe('Test 1: PPV purchase success', () => {
    it('shows success toast and triggers onSuccess callback', async () => {
      const user = userEvent.setup();
      const onSuccess = vi.fn();
      const onOpenChange = vi.fn();

      renderWithQuery(
        <PurchaseModal
          open={true}
          onOpenChange={onOpenChange}
          type="ppv"
          itemId="video-123"
          amount={9.99}
          title="Premium Video"
          onSuccess={onSuccess}
        />
      );

      // Wait for intent to be created and confirm button to appear (use findByText)
      const payButtonText = await screen.findByText(/pay \$9\.99/i, {}, { timeout: 3000 });
      expect(payButtonText).toBeInTheDocument();

      // Find and click confirm button
      const buttons = screen.getAllByRole('button');
      const confirmButton = buttons.find((btn) => btn.textContent?.includes('Pay $'))!;
      await user.click(confirmButton);

      // Wait for success toast
      await waitFor(
        () => {
          expect(mockToast).toHaveBeenCalledWith(
            expect.objectContaining({
              title: 'Purchase Successful',
              variant: 'default',
            })
          );
        },
        { timeout: 3000 }
      );

      // onSuccess callback should be called
      expect(onSuccess).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'completed',
        })
      );

      // Modal should show success state
      await screen.findByText(/your purchase was successful/i, {}, { timeout: 2000 });
    });

    it('displays optimistic UI update (success state immediately)', async () => {
      const user = userEvent.setup();

      renderWithQuery(
        <PurchaseModal
          open={true}
          onOpenChange={vi.fn()}
          type="ppv"
          itemId="video-123"
          amount={9.99}
        />
      );
      

      // Wait for pay button
      await screen.findByText(/pay \$9\.99/i, {}, { timeout: 3000 });

      const buttons = screen.getAllByRole('button');
      const confirmButton = buttons.find((btn) => btn.textContent?.includes('Pay $'))!;
      await user.click(confirmButton);

      // Success checkmark should appear
      await screen.findByText(/your purchase was successful/i, {}, { timeout: 3000 });
    });
  });

  describe('Test 2: PPV purchase fail', () => {
    it('shows error toast when purchase fails', async () => {
      const user = userEvent.setup();
      const onSuccess = vi.fn();

      // Mock failure response
      server.use(
        http.post('/api/commerce/confirm/:intentId', async () => {
          await new Promise((resolve) => setTimeout(resolve, 100)); // Add delay
          return HttpResponse.json(
            { error: 'Payment processing failed. Please try again.' },
            { status: 400 }
          );
        })
      );

      renderWithQuery(
        <PurchaseModal
          open={true}
          onOpenChange={vi.fn()}
          type="ppv"
          itemId="video-123"
          amount={9.99}
          onSuccess={onSuccess}
        />
      );
      

      // Wait for pay button
      await screen.findByText(/pay \$9\.99/i, {}, { timeout: 3000 });

      const buttons = screen.getAllByRole('button');
      const confirmButton = buttons.find((btn) => btn.textContent?.includes('Pay $'))!;
      await user.click(confirmButton);

      // Wait for error toast
      await waitFor(
        () => {
          expect(mockToast).toHaveBeenCalledWith(
            expect.objectContaining({
              title: 'Purchase Failed',
              variant: 'destructive',
            })
          );
        },
        { timeout: 3000 }
      );

      // onSuccess should NOT be called
      expect(onSuccess).not.toHaveBeenCalled();

      // Should stay on confirm step (not show success)
      expect(screen.queryByText(/your purchase was successful/i)).not.toBeInTheDocument();
    });

    it('stays in confirm state and allows retry after failure', async () => {
      const user = userEvent.setup();

      // First call fails, second succeeds
      let callCount = 0;
      server.use(
        http.post('/api/commerce/confirm/:intentId', async () => {
          await new Promise((resolve) => setTimeout(resolve, 100));
          callCount++;
          if (callCount === 1) {
            return HttpResponse.json({ error: 'Payment failed' }, { status: 400 });
          }
          const response: ConfirmPurchaseResponse = {
            transactionId: 'tx-456',
            status: 'completed',
            itemId: 'video-123',
            message: 'Purchase successful!',
          };
          return HttpResponse.json(response);
        })
      );

      renderWithQuery(
        <PurchaseModal
          open={true}
          onOpenChange={vi.fn()}
          type="ppv"
          itemId="video-123"
          amount={9.99}
        />
      );
      

      // Wait for pay button
      await screen.findByText(/pay \$9\.99/i, {}, { timeout: 3000 });

      // First attempt - fails
      const buttons = screen.getAllByRole('button');
      const confirmButton = buttons.find((btn) => btn.textContent?.includes('Pay $'))!;
      await user.click(confirmButton);

      await waitFor(
        () => {
          expect(mockToast).toHaveBeenCalledWith(
            expect.objectContaining({
              title: 'Purchase Failed',
            })
          );
        },
        { timeout: 3000 }
      );

      // Clear mock for second attempt
      mockToast.mockClear();

      // Second attempt - succeeds
      await user.click(confirmButton);

      await waitFor(
        () => {
          expect(mockToast).toHaveBeenCalledWith(
            expect.objectContaining({
              title: 'Purchase Successful',
            })
          );
        },
        { timeout: 3000 }
      );
    });
  });

  describe('Test 3: Promo code validation', () => {
    it('applies valid promo code and shows discount', async () => {
      const user = userEvent.setup();

      renderWithQuery(
        <PurchaseModal
          open={true}
          onOpenChange={vi.fn()}
          type="ppv"
          itemId="video-123"
          amount={10.0}
        />
      );
      

      // Wait for promo input to appear
      const promoInput = await screen.findByLabelText(/promo code input/i, {}, { timeout: 3000 });

      // Enter valid promo code
      await user.type(promoInput, 'PROMO20');

      // Click apply button
      const applyButton = screen.getByRole('button', { name: /apply/i });
      await user.click(applyButton);

      // Wait for success toast
      await waitFor(
        () => {
          expect(mockToast).toHaveBeenCalledWith(
            expect.objectContaining({
              title: 'Promo Code Applied',
              description: '20% discount applied!',
            })
          );
        },
        { timeout: 3000 }
      );

      // Check discount is displayed (20% off $10 = $2 discount)
      await waitFor(
        () => {
          expect(screen.getByText(/discount \(20%\)/i)).toBeInTheDocument();
          expect(screen.getByText(/-\$2\.00/i)).toBeInTheDocument();
          const finalAmounts = screen.getAllByText(/\$8\.00/i);
          expect(finalAmounts.length).toBeGreaterThan(0); // Final amount appears in total and button
        },
        { timeout: 2000 }
      );
    });

    it('shows error for invalid promo code', async () => {
      const user = userEvent.setup();

      renderWithQuery(
        <PurchaseModal
          open={true}
          onOpenChange={vi.fn()}
          type="ppv"
          itemId="video-123"
          amount={10.0}
        />
      );
      

      // Wait for promo input
      const promoInput = await screen.findByLabelText(/promo code input/i, {}, { timeout: 3000 });

      // Enter invalid promo code
      await user.type(promoInput, 'INVALID');

      // Click apply button
      const applyButton = screen.getByRole('button', { name: /apply/i });
      await user.click(applyButton);

      // Wait for error toast
      await waitFor(
        () => {
          expect(mockToast).toHaveBeenCalledWith(
            expect.objectContaining({
              title: 'Invalid Promo Code',
              description: 'Invalid promo code',
              variant: 'destructive',
            })
          );
        },
        { timeout: 3000 }
      );

      // Error message should be displayed
      await screen.findByText(/invalid promo code/i, {}, { timeout: 2000 });

      // Original amount should still be displayed (no discount)
      const amounts = screen.getAllByText(/\$10\.00/i);
      expect(amounts.length).toBeGreaterThan(0);
    });

    it('disables promo input after successful application', async () => {
      const user = userEvent.setup();

      renderWithQuery(
        <PurchaseModal
          open={true}
          onOpenChange={vi.fn()}
          type="ppv"
          itemId="video-123"
          amount={10.0}
        />
      );
      

      // Wait for promo input
      const promoInput = (await screen.findByLabelText(
        /promo code input/i,
        {},
        { timeout: 3000 }
      )) as HTMLInputElement;

      await user.type(promoInput, 'PROMO20');

      const applyButton = screen.getByRole('button', { name: /apply/i });
      await user.click(applyButton);

      // Wait for promo to be applied
      await screen.findByText(/promo20 applied/i, {}, { timeout: 3000 });

      // Input and button should be disabled
      expect(promoInput).toBeDisabled();
      expect(applyButton).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels and roles', async () => {
      renderWithQuery(
        <PurchaseModal
          open={true}
          onOpenChange={vi.fn()}
          type="ppv"
          itemId="video-123"
          amount={9.99}
        />
      );
      

      // Wait for dialog to be ready
      await screen.findByRole('dialog', {}, { timeout: 3000 });

      expect(await screen.findByLabelText(/promo code input/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/apply promo code/i)).toBeInTheDocument();
    });

    it('has proper description for screen readers', async () => {
      renderWithQuery(
        <PurchaseModal
          open={true}
          onOpenChange={vi.fn()}
          type="ppv"
          itemId="video-123"
          amount={9.99}
          description="Test description"
        />
      );
      

      await screen.findByText('Test description', {}, { timeout: 3000 });
    });
  });
});
