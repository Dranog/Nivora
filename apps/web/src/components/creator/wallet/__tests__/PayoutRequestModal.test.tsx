/**
 * PayoutRequestModal Tests
 * Test 1: Success - fills form and submits
 * Test 2: IBAN validation error
 * Test 3: Amount validation error when below minimum
 * Test 4: KYC warning for crypto
 * Test 5: Failed payout
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PayoutRequestModal } from '../PayoutRequestModal';
import { server } from '@/__tests__/mocks/server';
import { http, HttpResponse } from 'msw';
import { setMockKycStatus } from '@/__tests__/mocks/handlers/wallet';

// Mock toast
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
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

describe('PayoutRequestModal', () => {
  beforeEach(() => {
    mockToast.mockClear();
    setMockKycStatus('verified');
  });

  afterEach(() => {
    cleanup();
  });

  // Test 1: Success - fills form and submits
  it('creates payout successfully', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    renderWithQuery(
      <PayoutRequestModal
        open={true}
        onOpenChange={onOpenChange}
        availableBalance={100}
      />
    );

    // Wait for form to load
    const form = await screen.findByTestId('payout-form', {}, { timeout: 2000 });
    expect(form).toBeInTheDocument();

    // Step 1: Select mode (standard)
    const standardRadio = await screen.findByRole('radio', { name: /standard/i }, {}, { timeout: 2000 });
    await user.click(standardRadio);

    const nextBtn = await screen.findByTestId('next-btn', {}, { timeout: 2000 });
    await user.click(nextBtn);

    // Step 2: Enter IBAN
    const ibanInput = await screen.findByLabelText(/iban/i, {}, { timeout: 2000 });
    await user.clear(ibanInput);
    await user.type(ibanInput, 'FR7630006000011234567890189');

    await user.click(await screen.findByTestId('next-btn', {}, { timeout: 2000 }));

    // Step 3: Enter amount
    const amountInput = await screen.findByLabelText(/amount/i, {}, { timeout: 2000 });
    await user.clear(amountInput);
    await user.type(amountInput, '50');

    await user.click(await screen.findByTestId('next-btn', {}, { timeout: 2000 }));

    // Step 4: Verify summary and submit
    const summary = await screen.findByTestId('summary', {}, { timeout: 2000 });
    expect(summary).toBeInTheDocument();

    const submitBtn = await screen.findByTestId('submit-btn', {}, { timeout: 2000 });
    await user.click(submitBtn);

    // Wait for success toast
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Payout Request Created',
        })
      );
    }, { timeout: 3000 });

    // Modal should close
    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    }, { timeout: 3000 });
  });

  // Test 2: IBAN validation error
  it('shows IBAN validation error', async () => {
    const user = userEvent.setup();

    renderWithQuery(
      <PayoutRequestModal
        open={true}
        onOpenChange={vi.fn()}
        availableBalance={100}
      />
    );

    // Select standard mode
    const standardRadio = await screen.findByRole('radio', { name: /standard/i }, {}, { timeout: 2000 });
    await user.click(standardRadio);
    await user.click(await screen.findByTestId('next-btn', {}, { timeout: 2000 }));

    // Enter invalid IBAN
    const ibanInput = await screen.findByLabelText(/iban/i, {}, { timeout: 2000 });
    await user.type(ibanInput, 'INVALID');

    // Trigger validation (blur)
    await user.tab();

    // Wait for error alert
    const errorAlert = await screen.findByRole('alert', {}, { timeout: 2000 });
    expect(errorAlert).toHaveTextContent(/invalid iban/i);

    // Next button should be disabled
    const nextBtn = await screen.findByTestId('next-btn', {}, { timeout: 2000 });
    expect(nextBtn).toBeDisabled();
  });

  // Test 3: Amount validation error
  it('shows amount validation error when below minimum', async () => {
    const user = userEvent.setup();

    renderWithQuery(
      <PayoutRequestModal
        open={true}
        onOpenChange={vi.fn()}
        availableBalance={100}
      />
    );

    // Navigate to amount step (standard + valid IBAN)
    const standardRadio = await screen.findByRole('radio', { name: /standard/i }, {}, { timeout: 2000 });
    await user.click(standardRadio);
    await user.click(await screen.findByTestId('next-btn', {}, { timeout: 2000 }));

    const ibanInput = await screen.findByLabelText(/iban/i, {}, { timeout: 2000 });
    await user.type(ibanInput, 'FR7630006000011234567890189');
    await user.click(await screen.findByTestId('next-btn', {}, { timeout: 2000 }));

    // Enter amount < 10
    const amountInput = await screen.findByLabelText(/amount/i, {}, { timeout: 2000 });
    await user.type(amountInput, '5');
    await user.tab();

    // Wait for error
    const errorAlert = await screen.findByRole('alert', {}, { timeout: 2000 });
    expect(errorAlert).toHaveTextContent(/minimum.*10/i);
  });

  // Test 4: KYC warning for crypto
  it('shows KYC warning when crypto selected without verification', async () => {
    setMockKycStatus('not_started');
    const user = userEvent.setup();

    renderWithQuery(
      <PayoutRequestModal
        open={true}
        onOpenChange={vi.fn()}
        availableBalance={100}
      />
    );

    const cryptoRadio = await screen.findByRole('radio', { name: /crypto/i }, {}, { timeout: 2000 });
    await user.click(cryptoRadio);

    // Should show KYC warning
    const warning = await screen.findByText(/kyc verification required/i, {}, { timeout: 2000 });
    expect(warning).toBeInTheDocument();
  });

  // Test 5: Failed payout
  it('shows error toast on payout failure', async () => {
    // Override handler to fail
    server.use(
      http.post('/api/wallet/payouts', async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return HttpResponse.json(
          { error: 'Insufficient balance' },
          { status: 400 }
        );
      })
    );

    const user = userEvent.setup();

    renderWithQuery(
      <PayoutRequestModal
        open={true}
        onOpenChange={vi.fn()}
        availableBalance={100}
      />
    );

    // Fill form quickly
    const standardRadio = await screen.findByRole('radio', { name: /standard/i }, {}, { timeout: 2000 });
    await user.click(standardRadio);
    await user.click(await screen.findByTestId('next-btn', {}, { timeout: 2000 }));

    const ibanInput = await screen.findByLabelText(/iban/i, {}, { timeout: 2000 });
    await user.type(ibanInput, 'FR7630006000011234567890189');
    await user.click(await screen.findByTestId('next-btn', {}, { timeout: 2000 }));

    const amountInput = await screen.findByLabelText(/amount/i, {}, { timeout: 2000 });
    await user.type(amountInput, '50');
    await user.click(await screen.findByTestId('next-btn', {}, { timeout: 2000 }));

    await screen.findByTestId('summary', {}, { timeout: 2000 });
    const submitBtn = await screen.findByTestId('submit-btn', {}, { timeout: 2000 });
    await user.click(submitBtn);

    // Wait for error toast
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Payout Request Failed',
          variant: 'destructive',
        })
      );
    }, { timeout: 3000 });
  });
});
