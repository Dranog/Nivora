/**
 * Market & Cart Types (F11)
 * Types for marketplace offers and shopping cart
 */

import { z } from 'zod';

// ============================================================================
// Market Offer Types
// ============================================================================

export const MarketOfferSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  price: z.number().min(0),
  currency: z.string().default('USD'),
  type: z.enum(['subscription', 'one-time', 'bundle']),
  creatorId: z.string(),
  creatorName: z.string(),
  creatorHandle: z.string(),
  creatorAvatar: z.string().optional(),
  imageUrl: z.string().optional(),
  images: z.array(z.string()).optional(),
  features: z.array(z.string()),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type MarketOffer = z.infer<typeof MarketOfferSchema>;

// ============================================================================
// Market Filters
// ============================================================================

export const MarketSortSchema = z.enum(['newest', 'oldest', 'price-asc', 'price-desc', 'popular']);
export type MarketSort = z.infer<typeof MarketSortSchema>;

export const OfferTypeSchema = z.enum(['all', 'subscription', 'one-time', 'bundle']);
export type OfferType = z.infer<typeof OfferTypeSchema>;

export const MarketFiltersSchema = z.object({
  search: z.string().optional(),
  type: OfferTypeSchema.default('all'),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  creatorId: z.string().optional(),
  category: z.string().optional(),
  sort: MarketSortSchema.default('newest'),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(12),
});

export type MarketFilters = z.infer<typeof MarketFiltersSchema>;

// ============================================================================
// Pagination
// ============================================================================

export const PaginationMetaSchema = z.object({
  currentPage: z.number(),
  totalPages: z.number(),
  totalItems: z.number(),
  itemsPerPage: z.number(),
  hasNextPage: z.boolean(),
  hasPreviousPage: z.boolean(),
});

export type PaginationMeta = z.infer<typeof PaginationMetaSchema>;

export const MarketOffersResponseSchema = z.object({
  offers: z.array(MarketOfferSchema),
  meta: PaginationMetaSchema,
});

export type MarketOffersResponse = z.infer<typeof MarketOffersResponseSchema>;

// ============================================================================
// Cart Types
// ============================================================================

export const CartItemSchema = z.object({
  offerId: z.string(),
  offer: MarketOfferSchema,
  quantity: z.number().min(1).default(1),
  addedAt: z.string().datetime(),
});

export type CartItem = z.infer<typeof CartItemSchema>;

export const CartSchema = z.object({
  items: z.array(CartItemSchema),
  totalItems: z.number(),
  totalPrice: z.number(),
  currency: z.string().default('USD'),
  updatedAt: z.string().datetime(),
});

export type Cart = z.infer<typeof CartSchema>;

// ============================================================================
// Cart Actions
// ============================================================================

export interface AddToCartParams {
  offer: MarketOffer;
  quantity?: number;
}

export interface UpdateCartItemParams {
  offerId: string;
  quantity: number;
}

export interface RemoveFromCartParams {
  offerId: string;
}

// ============================================================================
// Checkout Types
// ============================================================================

export const CheckoutItemSchema = z.object({
  offerId: z.string(),
  quantity: z.number(),
  price: z.number(),
});

export type CheckoutItem = z.infer<typeof CheckoutItemSchema>;

export const CheckoutRequestSchema = z.object({
  items: z.array(CheckoutItemSchema),
  paymentMethodId: z.string().optional(),
  successUrl: z.string().optional(),
  cancelUrl: z.string().optional(),
});

export type CheckoutRequest = z.infer<typeof CheckoutRequestSchema>;

export const CheckoutResponseSchema = z.object({
  sessionId: z.string(),
  checkoutUrl: z.string().optional(),
  status: z.enum(['pending', 'completed', 'failed']),
});

export type CheckoutResponse = z.infer<typeof CheckoutResponseSchema>;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calculate cart totals
 */
export function calculateCartTotals(items: CartItem[]): {
  totalItems: number;
  totalPrice: number;
  currency: string;
} {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.offer.price * item.quantity, 0);
  const currency = items[0]?.offer.currency || 'USD';

  return { totalItems, totalPrice, currency };
}

/**
 * Format price for display
 */
export function formatPrice(price: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
}

/**
 * Check if offer is in cart
 */
export function isOfferInCart(offerId: string, cart: Cart): boolean {
  return cart.items.some((item) => item.offerId === offerId);
}

/**
 * Get cart item by offer ID
 */
export function getCartItem(offerId: string, cart: Cart): CartItem | undefined {
  return cart.items.find((item) => item.offerId === offerId);
}
