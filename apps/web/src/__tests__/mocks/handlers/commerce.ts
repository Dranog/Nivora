/**
 * MSW Handlers for Commerce API
 */

import { http, HttpResponse } from 'msw';
import type {
  PurchaseIntent,
  PurchaseIntentResponse,
  ConfirmPurchaseResponse,
  PromoCodeValidation,
  EarningsSummary,
  LedgerResponse,
  LedgerEntry,
  PurchaseType,
} from '@/types/commerce';

const API_BASE = '/api/commerce';

// Mock promo codes
const VALID_PROMO_CODES: Record<string, number> = {
  PROMO20: 20,
  SAVE10: 10,
  HALF50: 50,
};

// Mock ledger database
let mockLedger: LedgerEntry[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    type: 'ppv',
    itemId: 'video-123',
    amount: 9.99,
    status: 'completed',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    releaseDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // Released 1 day ago
    description: 'PPV: Premium Video',
    isReleased: true,
    releaseIn: 'Released',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    type: 'subscription',
    itemId: 'sub-tier1',
    amount: 29.99,
    status: 'completed',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    releaseDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // In 10 days
    description: 'Subscription: Tier 1',
    isReleased: false,
    releaseIn: '10 days',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    type: 'tip',
    itemId: 'post-456',
    amount: 5.0,
    status: 'completed',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    releaseDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // In 1 day
    description: 'Tip for post',
    isReleased: false,
    releaseIn: '1 day',
  },
];

// Helper to calculate summary from ledger
function calculateSummary(): EarningsSummary {
  const released = mockLedger.filter((e) => e.isReleased && e.status === 'completed');
  const pending = mockLedger.filter((e) => !e.isReleased && e.status === 'completed');

  const availableAmount = released.reduce((sum, e) => sum + e.amount * 0.9, 0); // 90% (minus 10% reserve)
  const reserveAmount = released.reduce((sum, e) => sum + e.amount * 0.1, 0); // 10% reserve
  const pendingAmount = pending.reduce((sum, e) => sum + e.amount, 0);

  return {
    available: parseFloat(availableAmount.toFixed(2)),
    pending: parseFloat(pendingAmount.toFixed(2)),
    reserve: parseFloat(reserveAmount.toFixed(2)),
    total: parseFloat((availableAmount + reserveAmount + pendingAmount).toFixed(2)),
    currency: 'USD',
  };
}

export const commerceHandlers = [
  // POST /api/commerce/intent
  http.post(`${API_BASE}/intent`, async ({ request }) => {
    // Add delay to simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 150));

    const body = (await request.json()) as PurchaseIntent;

    // Validate promo code if provided
    let discount = 0;
    let promoApplied: string | undefined;

    if (body.promoCode && VALID_PROMO_CODES[body.promoCode.toUpperCase()]) {
      discount = VALID_PROMO_CODES[body.promoCode.toUpperCase()];
      promoApplied = body.promoCode.toUpperCase();
    }

    const finalAmount = body.amount - (body.amount * discount) / 100;

    const response: PurchaseIntentResponse = {
      intentId: crypto.randomUUID(),
      amount: body.amount,
      discount,
      finalAmount: parseFloat(finalAmount.toFixed(2)),
      promoApplied,
    };

    return HttpResponse.json(response);
  }),

  // POST /api/commerce/confirm/:intentId
  http.post(`${API_BASE}/confirm/:intentId`, async ({ params }) => {
    // Add delay to simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 200));

    const { intentId } = params;

    // Simulate random failure (disabled for tests - can be overridden)
    // if (Math.random() < 0.1) {
    //   return HttpResponse.json(
    //     { error: 'Payment processing failed. Please try again.' },
    //     { status: 400 }
    //   );
    // }

    // Create new ledger entry
    const newEntry: LedgerEntry = {
      id: crypto.randomUUID(),
      type: 'ppv', // Default to PPV for testing
      itemId: 'test-item',
      amount: 9.99,
      status: 'completed',
      createdAt: new Date().toISOString(),
      releaseDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // 48h from now
      description: 'Test Purchase',
      isReleased: false,
      releaseIn: '2 days',
    };

    mockLedger.unshift(newEntry);

    const response: ConfirmPurchaseResponse = {
      transactionId: newEntry.id,
      status: 'completed',
      itemId: newEntry.itemId,
      message: 'Purchase successful!',
    };

    return HttpResponse.json(response);
  }),

  // POST /api/commerce/promo/validate
  http.post(`${API_BASE}/promo/validate`, async ({ request }) => {
    // Add delay to simulate validation
    await new Promise((resolve) => setTimeout(resolve, 100));

    const body = (await request.json()) as { code: string; purchaseType: PurchaseType };
    const code = body.code.toUpperCase();

    const discount = VALID_PROMO_CODES[code];

    const response: PromoCodeValidation = {
      valid: !!discount,
      code: body.code,
      discount: discount || 0,
      message: discount ? `${discount}% discount applied!` : 'Invalid promo code',
    };

    return HttpResponse.json(response);
  }),

  // GET /api/commerce/earnings/summary
  http.get(`${API_BASE}/earnings/summary`, () => {
    return HttpResponse.json(calculateSummary());
  }),

  // GET /api/commerce/earnings/ledger
  http.get(`${API_BASE}/earnings/ledger`, ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const type = url.searchParams.get('type') as PurchaseType | null;
    const status = url.searchParams.get('status');

    let filtered = [...mockLedger];

    if (type) {
      filtered = filtered.filter((e) => e.type === type);
    }

    if (status) {
      filtered = filtered.filter((e) => e.status === status);
    }

    const start = (page - 1) * limit;
    const end = start + limit;
    const entries = filtered.slice(start, end);

    const response: LedgerResponse = {
      entries,
      total: filtered.length,
      page,
      limit,
      hasMore: end < filtered.length,
    };

    return HttpResponse.json(response);
  }),
];

// Export helper to reset mock data
export function resetMockLedger() {
  mockLedger = [
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      type: 'ppv',
      itemId: 'video-123',
      amount: 9.99,
      status: 'completed',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      releaseDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      description: 'PPV: Premium Video',
      isReleased: true,
      releaseIn: 'Released',
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440002',
      type: 'subscription',
      itemId: 'sub-tier1',
      amount: 29.99,
      status: 'completed',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      releaseDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      description: 'Subscription: Tier 1',
      isReleased: false,
      releaseIn: '10 days',
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440003',
      type: 'tip',
      itemId: 'post-456',
      amount: 5.0,
      status: 'completed',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      releaseDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      description: 'Tip for post',
      isReleased: false,
      releaseIn: '1 day',
    },
  ];
}
