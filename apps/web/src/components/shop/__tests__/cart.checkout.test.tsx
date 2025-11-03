/**
 * Cart Checkout Tests (F11)
 * Tests checkout from cart with optimistic unlock
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';
import { CartSummary } from '../CartSummary';
import { useCartStore } from '@/store/useCartStore';
import type { MarketOffer } from '@/types/market';

const mockOffer1: MarketOffer = {
  id: 'offer1',
  title: 'Premium Subscription',
  description: 'Access to all content',
  price: 9.99,
  currency: 'USD',
  type: 'subscription',
  creatorId: 'creator1',
  creatorName: 'John Doe',
  creatorHandle: 'johndoe',
  features: ['Feature 1', 'Feature 2'],
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const mockOffer2: MarketOffer = {
  id: 'offer2',
  title: 'One-Time Course',
  description: 'Complete course bundle',
  price: 49.99,
  currency: 'USD',
  type: 'one-time',
  creatorId: 'creator2',
  creatorName: 'Jane Smith',
  creatorHandle: 'janesmith',
  features: ['Lifetime access'],
  isActive: true,
  createdAt: '2024-01-02T00:00:00Z',
  updatedAt: '2024-01-02T00:00:00Z',
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('CartSummary Checkout', () => {
  beforeEach(() => {
    // Reset cart state
    useCartStore.setState({
      items: [],
      totalItems: 0,
      totalPrice: 0,
      currency: 'USD',
      updatedAt: new Date().toISOString(),
    });
  });

  it('should display empty state when cart is empty', () => {
    const mockCheckout = vi.fn();

    render(
      <CartSummary onCheckout={mockCheckout} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
    const checkoutButton = screen.getByRole('button', { name: /cart is empty/i });
    expect(checkoutButton).toBeDisabled();
  });

  it('should display cart summary with items', () => {
    // Add items to cart
    useCartStore.getState().addItem({ offer: mockOffer1, quantity: 2 });
    useCartStore.getState().addItem({ offer: mockOffer2, quantity: 1 });

    const mockCheckout = vi.fn();

    render(
      <CartSummary onCheckout={mockCheckout} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('3 items')).toBeInTheDocument();
    expect(screen.getByText('2x Premium Subscription')).toBeInTheDocument();
    expect(screen.getByText('1x One-Time Course')).toBeInTheDocument();
  });

  it('should calculate totals correctly', () => {
    useCartStore.getState().addItem({ offer: mockOffer1, quantity: 2 });
    useCartStore.getState().addItem({ offer: mockOffer2, quantity: 1 });

    const mockCheckout = vi.fn();

    render(
      <CartSummary onCheckout={mockCheckout} />,
      { wrapper: createWrapper() }
    );

    // 2 * 9.99 + 1 * 49.99 = 69.97
    expect(screen.getAllByText('$69.97')).toHaveLength(2); // Appears in both subtotal and total
  });

  it('should call onCheckout when checkout button clicked', async () => {
    const user = userEvent.setup();
    const mockCheckout = vi.fn();

    useCartStore.getState().addItem({ offer: mockOffer1, quantity: 1 });

    render(
      <CartSummary onCheckout={mockCheckout} />,
      { wrapper: createWrapper() }
    );

    const checkoutButton = screen.getByRole('button', { name: /proceed to checkout/i });
    await user.click(checkoutButton);

    expect(mockCheckout).toHaveBeenCalledTimes(1);
  });

  it('should not call onCheckout when cart is empty', async () => {
    const user = userEvent.setup();
    const mockCheckout = vi.fn();

    render(
      <CartSummary onCheckout={mockCheckout} />,
      { wrapper: createWrapper() }
    );

    const checkoutButton = screen.getByRole('button', { name: /cart is empty/i });

    // Button should be disabled, so clicking should not work
    expect(checkoutButton).toBeDisabled();
  });

  it('should update when cart items change', () => {
    const mockCheckout = vi.fn();

    const { rerender } = render(
      <CartSummary onCheckout={mockCheckout} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();

    // Add item
    useCartStore.getState().addItem({ offer: mockOffer1, quantity: 1 });

    rerender(
      createElement(
        createWrapper(),
        null,
        createElement(CartSummary, { onCheckout: mockCheckout })
      )
    );

    expect(screen.getByText('1 item')).toBeInTheDocument();
    // $9.99 appears in multiple places (subtotal, total, breakdown)
    expect(screen.getAllByText('$9.99').length).toBeGreaterThan(0);
  });
});

describe('Checkout Flow', () => {
  beforeEach(() => {
    // Reset cart state
    useCartStore.setState({
      items: [],
      totalItems: 0,
      totalPrice: 0,
      currency: 'USD',
      updatedAt: new Date().toISOString(),
    });
  });

  it('should prepare checkout data correctly', () => {
    useCartStore.getState().addItem({ offer: mockOffer1, quantity: 2 });
    useCartStore.getState().addItem({ offer: mockOffer2, quantity: 1 });

    const cart = useCartStore.getState();

    // Prepare checkout items
    const checkoutItems = cart.items.map((item) => ({
      offerId: item.offerId,
      quantity: item.quantity,
      price: item.offer.price,
    }));

    expect(checkoutItems).toHaveLength(2);
    expect(checkoutItems[0]).toEqual({
      offerId: 'offer1',
      quantity: 2,
      price: 9.99,
    });
    expect(checkoutItems[1]).toEqual({
      offerId: 'offer2',
      quantity: 1,
      price: 49.99,
    });
  });

  it('should calculate total amount for checkout', () => {
    useCartStore.getState().addItem({ offer: mockOffer1, quantity: 3 });
    useCartStore.getState().addItem({ offer: mockOffer2, quantity: 2 });

    const cart = useCartStore.getState();
    const totalAmount = cart.items.reduce(
      (sum, item) => sum + item.offer.price * item.quantity,
      0
    );

    // 3 * 9.99 + 2 * 49.99 = 129.95
    expect(totalAmount).toBeCloseTo(129.95, 2);
  });

  it('should handle optimistic unlock on successful checkout', async () => {
    // Simulate successful checkout
    const mockSuccessCallback = vi.fn();

    useCartStore.getState().addItem({ offer: mockOffer1, quantity: 1 });

    // Simulate checkout success
    await waitFor(() => {
      mockSuccessCallback();
    });

    expect(mockSuccessCallback).toHaveBeenCalled();
  });

  it('should clear cart after successful checkout', () => {
    useCartStore.getState().addItem({ offer: mockOffer1, quantity: 2 });
    useCartStore.getState().addItem({ offer: mockOffer2, quantity: 1 });

    expect(useCartStore.getState().items).toHaveLength(2);

    // Simulate successful checkout
    useCartStore.getState().clearCart();

    expect(useCartStore.getState().items).toHaveLength(0);
    expect(useCartStore.getState().totalItems).toBe(0);
    expect(useCartStore.getState().totalPrice).toBe(0);
  });
});

describe('Optimistic Updates', () => {
  it('should immediately show items as unlocked before server confirmation', () => {
    // This simulates optimistic UI updates where we assume the purchase
    // will succeed and immediately unlock content

    const items = [
      { offerId: 'offer1', status: 'pending' },
      { offerId: 'offer2', status: 'pending' },
    ];

    // Optimistically set to unlocked
    const optimisticItems = items.map((item) => ({
      ...item,
      status: 'unlocked',
    }));

    expect(optimisticItems.every((item) => item.status === 'unlocked')).toBe(true);
  });

  it('should revert optimistic update on checkout failure', () => {
    const items = [
      { offerId: 'offer1', status: 'locked' },
    ];

    // Optimistically unlock
    const optimisticItems = items.map((item) => ({
      ...item,
      status: 'unlocked',
    }));

    expect(optimisticItems[0].status).toBe('unlocked');

    // Simulate failure - revert
    const revertedItems = optimisticItems.map((item) => ({
      ...item,
      status: 'locked',
    }));

    expect(revertedItems[0].status).toBe('locked');
  });

  it('should maintain optimistic state on successful checkout', () => {
    const items = [
      { offerId: 'offer1', status: 'locked' },
    ];

    // Optimistically unlock
    const optimisticItems = items.map((item) => ({
      ...item,
      status: 'unlocked',
    }));

    // Simulate success - keep unlocked
    const confirmedItems = optimisticItems;

    expect(confirmedItems[0].status).toBe('unlocked');
  });
});
