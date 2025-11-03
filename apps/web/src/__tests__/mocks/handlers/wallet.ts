/**
 * MSW Handlers for Wallet API
 */

import { http, HttpResponse } from 'msw';
import type {
  PayoutRequest,
  PayoutsListResponse,
  CreatePayoutRequest,
  PayoutRequestResponse,
  KycStatusResponse,
  PayoutStatus,
  KycStatus,
} from '@/types/wallet';
import { calculatePayoutFees, calculateNetAmount, getPayoutEta } from '@/lib/api/wallet';

const API_BASE = '/api/wallet';

// Mock KYC status (can be changed for testing)
let mockKycStatus: KycStatus = 'verified';

// Mock payout requests database
let mockPayouts: PayoutRequest[] = [
  {
    id: 'payout-001',
    mode: 'standard',
    amount: 100.0,
    fees: 1.5,
    net: 98.5,
    destination: {
      type: 'iban',
      iban: 'FR7630006000011234567890189',
    },
    status: 'completed',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    processedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    eta: '3-5 business days',
  },
  {
    id: 'payout-002',
    mode: 'express',
    amount: 50.0,
    fees: 2.0,
    net: 48.0,
    destination: {
      type: 'iban',
      iban: 'FR7612345678901234567890123',
    },
    status: 'processing',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    eta: '24 hours',
  },
  {
    id: 'payout-003',
    mode: 'crypto',
    amount: 200.0,
    fees: 2.9,
    net: 197.1,
    destination: {
      type: 'crypto',
      cryptoAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb5',
      cryptoNetwork: 'ETH',
    },
    status: 'pending',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    eta: '1-2 hours',
  },
];

export const walletHandlers = [
  // GET /api/wallet/payouts - List payout requests
  http.get(`${API_BASE}/payouts`, ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const status = url.searchParams.get('status') as PayoutStatus | null;

    let filtered = [...mockPayouts];

    // Filter by status if provided
    if (status) {
      filtered = filtered.filter((p) => p.status === status);
    }

    // Sort by createdAt desc
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const start = (page - 1) * limit;
    const end = start + limit;
    const payouts = filtered.slice(start, end);

    const response: PayoutsListResponse = {
      payouts,
      total: filtered.length,
      page,
      limit,
      hasMore: end < filtered.length,
    };

    return HttpResponse.json(response);
  }),

  // POST /api/wallet/payouts - Create payout request
  http.post(`${API_BASE}/payouts`, async ({ request }) => {
    await new Promise((resolve) => setTimeout(resolve, 200)); // Simulate delay

    const body = (await request.json()) as CreatePayoutRequest;

    // Calculate fees and net
    const fees = calculatePayoutFees(body.amount, body.mode);
    const net = calculateNetAmount(body.amount, body.mode);
    const eta = getPayoutEta(body.mode);

    // Validation: Check if crypto mode requires KYC
    if (body.mode === 'crypto' && mockKycStatus !== 'verified') {
      return HttpResponse.json(
        { error: 'KYC verification required for crypto payouts' },
        { status: 403 }
      );
    }

    // Validation: Min amount
    if (body.amount < 10) {
      return HttpResponse.json(
        { error: 'Minimum payout amount is €10.00' },
        { status: 400 }
      );
    }

    // Create new payout
    const newPayout: PayoutRequest = {
      id: `payout-${Date.now()}`,
      mode: body.mode,
      amount: body.amount,
      fees,
      net,
      destination: body.destination,
      status: 'pending',
      createdAt: new Date().toISOString(),
      eta,
    };

    // Add to mock database
    mockPayouts.unshift(newPayout);

    const response: PayoutRequestResponse = {
      ...newPayout,
      message: 'Payout request created successfully',
    };

    return HttpResponse.json(response);
  }),

  // GET /api/wallet/kyc/status - Get KYC status
  http.get(`${API_BASE}/kyc/status`, () => {
    const response: KycStatusResponse = {
      status: mockKycStatus,
      message:
        mockKycStatus === 'verified'
          ? 'Your account is verified'
          : mockKycStatus === 'pending'
            ? 'Your verification is being reviewed'
            : mockKycStatus === 'rejected'
              ? 'Your verification was rejected. Please try again.'
              : 'Please complete KYC verification to unlock all features',
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json(response);
  }),

  // POST /api/wallet/kyc/start - Start KYC verification
  http.post(`${API_BASE}/kyc/start`, async () => {
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Mock KYC URL
    const response = {
      url: 'https://verify.example.com/kyc/start?token=mock-token-123',
    };

    // Update mock status to pending
    mockKycStatus = 'pending';

    return HttpResponse.json(response);
  }),
];

// Helper to reset mock data
export function resetMockPayouts() {
  mockPayouts = [
    {
      id: 'payout-001',
      mode: 'standard',
      amount: 100.0,
      fees: 1.5,
      net: 98.5,
      destination: {
        type: 'iban',
        iban: 'FR7630006000011234567890189',
      },
      status: 'completed',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      processedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      eta: '3-5 business days',
    },
    {
      id: 'payout-002',
      mode: 'express',
      amount: 50.0,
      fees: 2.0,
      net: 48.0,
      destination: {
        type: 'iban',
        iban: 'FR7612345678901234567890123',
      },
      status: 'processing',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      eta: '24 hours',
    },
    {
      id: 'payout-003',
      mode: 'crypto',
      amount: 200.0,
      fees: 2.9,
      net: 197.1,
      destination: {
        type: 'crypto',
        cryptoAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb5',
        cryptoNetwork: 'ETH',
      },
      status: 'pending',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      eta: '1-2 hours',
    },
  ];
}

// Helper to set KYC status for testing
export function setMockKycStatus(status: KycStatus) {
  mockKycStatus = status;
}
