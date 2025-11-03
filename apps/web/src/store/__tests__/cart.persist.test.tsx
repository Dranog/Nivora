/**
 * Cart Persistence Tests (F11)
 * Tests cart add/remove and localStorage persistence
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCartStore, useCart } from '../useCartStore';
import type { MarketOffer } from '@/types/market';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

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

describe('useCartStore', () => {
  beforeEach(() => {
    localStorage.clear();
    // Reset store state
    useCartStore.setState({
      items: [],
      totalItems: 0,
      totalPrice: 0,
      currency: 'USD',
      updatedAt: new Date().toISOString(),
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Add to Cart', () => {
    it('should add item to cart', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addItem({ offer: mockOffer1, quantity: 1 });
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].offerId).toBe('offer1');
      expect(result.current.items[0].quantity).toBe(1);
      expect(result.current.totalItems).toBe(1);
      expect(result.current.totalPrice).toBe(9.99);
    });

    it('should add multiple items to cart', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addItem({ offer: mockOffer1, quantity: 1 });
        result.current.addItem({ offer: mockOffer2, quantity: 1 });
      });

      expect(result.current.items).toHaveLength(2);
      expect(result.current.totalItems).toBe(2);
      expect(result.current.totalPrice).toBeCloseTo(59.98, 2);
    });

    it('should increase quantity when adding same item', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addItem({ offer: mockOffer1, quantity: 1 });
        result.current.addItem({ offer: mockOffer1, quantity: 2 });
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].quantity).toBe(3);
      expect(result.current.totalItems).toBe(3);
      expect(result.current.totalPrice).toBeCloseTo(29.97, 2);
    });

    it('should add item with custom quantity', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addItem({ offer: mockOffer1, quantity: 5 });
      });

      expect(result.current.items[0].quantity).toBe(5);
      expect(result.current.totalItems).toBe(5);
      expect(result.current.totalPrice).toBeCloseTo(49.95, 2);
    });
  });

  describe('Remove from Cart', () => {
    it('should remove item from cart', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addItem({ offer: mockOffer1, quantity: 1 });
        result.current.addItem({ offer: mockOffer2, quantity: 1 });
      });

      expect(result.current.items).toHaveLength(2);

      act(() => {
        result.current.removeItem({ offerId: 'offer1' });
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].offerId).toBe('offer2');
      expect(result.current.totalItems).toBe(1);
      expect(result.current.totalPrice).toBe(49.99);
    });

    it('should handle removing non-existent item', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addItem({ offer: mockOffer1, quantity: 1 });
      });

      act(() => {
        result.current.removeItem({ offerId: 'non-existent' });
      });

      expect(result.current.items).toHaveLength(1);
    });
  });

  describe('Update Quantity', () => {
    it('should update item quantity', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addItem({ offer: mockOffer1, quantity: 1 });
      });

      act(() => {
        result.current.updateQuantity({ offerId: 'offer1', quantity: 5 });
      });

      expect(result.current.items[0].quantity).toBe(5);
      expect(result.current.totalItems).toBe(5);
      expect(result.current.totalPrice).toBeCloseTo(49.95, 2);
    });

    it('should remove item when quantity set to 0', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addItem({ offer: mockOffer1, quantity: 3 });
      });

      act(() => {
        result.current.updateQuantity({ offerId: 'offer1', quantity: 0 });
      });

      expect(result.current.items).toHaveLength(0);
      expect(result.current.totalItems).toBe(0);
      expect(result.current.totalPrice).toBe(0);
    });

    it('should remove item when quantity set to negative', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addItem({ offer: mockOffer1, quantity: 3 });
      });

      act(() => {
        result.current.updateQuantity({ offerId: 'offer1', quantity: -1 });
      });

      expect(result.current.items).toHaveLength(0);
    });
  });

  describe('Clear Cart', () => {
    it('should clear all items from cart', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addItem({ offer: mockOffer1, quantity: 2 });
        result.current.addItem({ offer: mockOffer2, quantity: 3 });
      });

      expect(result.current.items).toHaveLength(2);

      act(() => {
        result.current.clearCart();
      });

      expect(result.current.items).toHaveLength(0);
      expect(result.current.totalItems).toBe(0);
      expect(result.current.totalPrice).toBe(0);
    });
  });

  describe('Helper Functions', () => {
    it('should check if item is in cart', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addItem({ offer: mockOffer1, quantity: 1 });
      });

      expect(result.current.hasItem('offer1')).toBe(true);
      expect(result.current.hasItem('offer2')).toBe(false);
    });

    it('should get item by ID', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addItem({ offer: mockOffer1, quantity: 2 });
      });

      const item = result.current.getItem('offer1');
      expect(item).toBeDefined();
      expect(item?.offerId).toBe('offer1');
      expect(item?.quantity).toBe(2);

      const nonExistent = result.current.getItem('offer2');
      expect(nonExistent).toBeUndefined();
    });
  });

  describe('LocalStorage Persistence', () => {
    it('should persist cart to localStorage', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addItem({ offer: mockOffer1, quantity: 2 });
      });

      const stored = localStorage.getItem('cart-storage');
      expect(stored).toBeDefined();

      const parsed = JSON.parse(stored!);
      expect(parsed.state.items).toHaveLength(1);
      expect(parsed.state.items[0].offerId).toBe('offer1');
      expect(parsed.state.totalItems).toBe(2);
    });

    it('should load cart from localStorage on init', () => {
      // Set up localStorage with cart data
      const cartData = {
        state: {
          items: [
            {
              offerId: 'offer1',
              offer: mockOffer1,
              quantity: 3,
              addedAt: new Date().toISOString(),
            },
          ],
          totalItems: 3,
          totalPrice: 29.97,
          currency: 'USD',
          updatedAt: new Date().toISOString(),
        },
      };

      localStorage.setItem('cart-storage', JSON.stringify(cartData));

      // Create new hook instance
      const { result } = renderHook(() => useCart());

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].offerId).toBe('offer1');
      expect(result.current.totalItems).toBe(3);
    });

    it('should update localStorage when cart changes', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addItem({ offer: mockOffer1, quantity: 1 });
      });

      let stored = JSON.parse(localStorage.getItem('cart-storage')!);
      expect(stored.state.items).toHaveLength(1);

      act(() => {
        result.current.addItem({ offer: mockOffer2, quantity: 1 });
      });

      stored = JSON.parse(localStorage.getItem('cart-storage')!);
      expect(stored.state.items).toHaveLength(2);

      act(() => {
        result.current.clearCart();
      });

      stored = JSON.parse(localStorage.getItem('cart-storage')!);
      expect(stored.state.items).toHaveLength(0);
    });
  });
});
