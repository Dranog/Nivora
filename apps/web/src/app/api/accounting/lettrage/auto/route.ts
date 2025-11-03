/**
 * API Auto-lettrage
 * Route: /api/accounting/lettrage/auto
 */

import { NextRequest, NextResponse } from 'next/server';
import { autoLettrage } from '@/lib/accounting/lettrage';

// Demo data
const DEMO_TRANSACTIONS = [
  {
    id: '1',
    type: 'Payment',
    user: { name: 'John Smith', email: 'john@ex.com' },
    amount: 49.99,
    date: '2024-01-22 14:30',
    createdAt: '2024-01-22T14:30:00Z',
  },
  {
    id: '2',
    type: 'Payout',
    user: { name: 'Sarah Creator', email: 'sarah@ex.com' },
    amount: 250.0,
    date: '2024-01-22 12:15',
    createdAt: '2024-01-22T12:15:00Z',
  },
  {
    id: '3',
    type: 'Subscription',
    user: { name: 'Mike Johnson', email: 'mike@ex.com' },
    amount: 19.99,
    date: '2024-01-22 10:45',
    createdAt: '2024-01-22T10:45:00Z',
  },
  {
    id: '4',
    type: 'Tip',
    user: { name: 'Emma Wilson', email: 'emma@ex.com' },
    amount: 5.0,
    date: '2024-01-22 09:20',
    createdAt: '2024-01-22T09:20:00Z',
  },
  {
    id: '6',
    type: 'Payment',
    user: { name: 'Lisa Anderson', email: 'lisa@ex.com' },
    amount: 99.99,
    date: '2024-01-21 22:30',
    createdAt: '2024-01-21T22:30:00Z',
  },
  {
    id: '8',
    type: 'Payment',
    user: { name: 'Chris Lee', email: 'chris@ex.com' },
    amount: 39.99,
    date: '2024-01-21 18:45',
    createdAt: '2024-01-21T18:45:00Z',
  },
  {
    id: '9',
    type: 'Tip',
    user: { name: 'Rachel Green', email: 'rachel@ex.com' },
    amount: 10.0,
    date: '2024-01-21 16:20',
    createdAt: '2024-01-21T16:20:00Z',
  },
  {
    id: '10',
    type: 'Payment',
    user: { name: 'Tom Anderson', email: 'tom@ex.com' },
    amount: 74.99,
    date: '2024-01-21 14:00',
    createdAt: '2024-01-21T14:00:00Z',
  },
];

/**
 * POST /api/accounting/lettrage/auto
 * Lance le lettrage automatique
 */
export async function POST(req: NextRequest) {
  try {
    const lettrages = autoLettrage(DEMO_TRANSACTIONS);

    return NextResponse.json(
      {
        success: true,
        lettrages,
        message: `${lettrages.length} lettrage(s) créé(s)`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur auto-lettrage:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de l\'auto-lettrage',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}
