/**
 * Cart Store - F11 Shopping Cart
 * Manages shopping cart state with localStorage persistence
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Cart,
  CartItem,
  MarketOffer,
  AddToCartParams,
  UpdateCartItemParams,
  RemoveFromCartParams,
} from '@/types/market';
import { calculateCartTotals } from '@/types/market';

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  currency: string;
  updatedAt: string;
}

interface CartActions {
  // Cart operations
  addItem: (params: AddToCartParams) => void;
  removeItem: (params: RemoveFromCartParams) => void;
  updateQuantity: (params: UpdateCartItemParams) => void;
  clearCart: () => void;

  // Query helpers
  getItem: (offerId: string) => CartItem | undefined;
  hasItem: (offerId: string) => boolean;
}

type CartStore = CartState & CartActions;

const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  currency: 'USD',
  updatedAt: new Date().toISOString(),
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Add item to cart
      addItem: ({ offer, quantity = 1 }) => {
        set((state) => {
          const existingItem = state.items.find((item) => item.offerId === offer.id);

          let newItems: CartItem[];

          if (existingItem) {
            // Update quantity if item already exists
            newItems = state.items.map((item) =>
              item.offerId === offer.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            );
          } else {
            // Add new item
            const newItem: CartItem = {
              offerId: offer.id,
              offer,
              quantity,
              addedAt: new Date().toISOString(),
            };
            newItems = [...state.items, newItem];
          }

          const totals = calculateCartTotals(newItems);

          return {
            items: newItems,
            totalItems: totals.totalItems,
            totalPrice: totals.totalPrice,
            currency: totals.currency,
            updatedAt: new Date().toISOString(),
          };
        });
      },

      // Remove item from cart
      removeItem: ({ offerId }) => {
        set((state) => {
          const newItems = state.items.filter((item) => item.offerId !== offerId);
          const totals = calculateCartTotals(newItems);

          return {
            items: newItems,
            totalItems: totals.totalItems,
            totalPrice: totals.totalPrice,
            currency: totals.currency,
            updatedAt: new Date().toISOString(),
          };
        });
      },

      // Update item quantity
      updateQuantity: ({ offerId, quantity }) => {
        set((state) => {
          if (quantity <= 0) {
            // Remove item if quantity is 0 or negative
            const newItems = state.items.filter((item) => item.offerId !== offerId);
            const totals = calculateCartTotals(newItems);

            return {
              items: newItems,
              totalItems: totals.totalItems,
              totalPrice: totals.totalPrice,
              currency: totals.currency,
              updatedAt: new Date().toISOString(),
            };
          }

          const newItems = state.items.map((item) =>
            item.offerId === offerId ? { ...item, quantity } : item
          );
          const totals = calculateCartTotals(newItems);

          return {
            items: newItems,
            totalItems: totals.totalItems,
            totalPrice: totals.totalPrice,
            currency: totals.currency,
            updatedAt: new Date().toISOString(),
          };
        });
      },

      // Clear entire cart
      clearCart: () => {
        set({
          ...initialState,
          updatedAt: new Date().toISOString(),
        });
      },

      // Get item by offer ID
      getItem: (offerId: string) => {
        return get().items.find((item) => item.offerId === offerId);
      },

      // Check if item is in cart
      hasItem: (offerId: string) => {
        return get().items.some((item) => item.offerId === offerId);
      },
    }),
    {
      name: 'cart-storage',
      // Persist all cart state to localStorage
      partialize: (state) => ({
        items: state.items,
        totalItems: state.totalItems,
        totalPrice: state.totalPrice,
        currency: state.currency,
        updatedAt: state.updatedAt,
      }),
    }
  )
);

/**
 * Hook to get cart as Cart object (for compatibility with cart types)
 */
export function useCart(): Cart & CartActions {
  const store = useCartStore();

  return {
    items: store.items,
    totalItems: store.totalItems,
    totalPrice: store.totalPrice,
    currency: store.currency,
    updatedAt: store.updatedAt,
    addItem: store.addItem,
    removeItem: store.removeItem,
    updateQuantity: store.updateQuantity,
    clearCart: store.clearCart,
    getItem: store.getItem,
    hasItem: store.hasItem,
  };
}
