/**
 * API Lettrage comptable
 * Route: /api/accounting/lettrage
 */

import { NextRequest, NextResponse } from 'next/server';
import { autoLettrage, calculerBalanceAgee } from '@/lib/accounting/lettrage';

// Demo data (identique à accounting/page.tsx)
const DEMO_TRANSACTIONS = [
  {
    id: '1',
    type: 'Payment',
    user: { name: 'John Smith', email: 'john@ex.com' },
    amount: 49.99,
    currency: 'EUR',
    status: 'Completed',
    date: '2024-01-22 14:30',
    createdAt: '2024-01-22T14:30:00Z',
  },
  {
    id: '2',
    type: 'Payout',
    user: { name: 'Sarah Creator', email: 'sarah@ex.com' },
    amount: 250.00,
    currency: 'EUR',
    status: 'Completed',
    date: '2024-01-22 12:15',
    createdAt: '2024-01-22T12:15:00Z',
  },
  {
    id: '3',
    type: 'Subscription',
    user: { name: 'Mike Johnson', email: 'mike@ex.com' },
    amount: 19.99,
    currency: 'EUR',
    status: 'Completed',
    date: '2024-01-22 10:45',
    createdAt: '2024-01-22T10:45:00Z',
  },
  {
    id: '4',
    type: 'Tip',
    user: { name: 'Emma Wilson', email: 'emma@ex.com' },
    amount: 5.00,
    currency: 'EUR',
    status: 'Completed',
    date: '2024-01-22 09:20',
    createdAt: '2024-01-22T09:20:00Z',
  },
  {
    id: '5',
    type: 'Refund',
    user: { name: 'David Brown', email: 'david@ex.com' },
    amount: 29.99,
    currency: 'EUR',
    status: 'Pending',
    date: '2024-01-22 08:00',
    createdAt: '2024-01-22T08:00:00Z',
  },
  {
    id: '6',
    type: 'Payment',
    user: { name: 'Lisa Anderson', email: 'lisa@ex.com' },
    amount: 99.99,
    currency: 'EUR',
    status: 'Completed',
    date: '2024-01-21 22:30',
    createdAt: '2024-01-21T22:30:00Z',
  },
  {
    id: '7',
    type: 'Payout',
    user: { name: 'Alex Turner', email: 'alex@ex.com' },
    amount: 150.00,
    currency: 'EUR',
    status: 'Pending',
    date: '2024-01-21 20:15',
    createdAt: '2024-01-21T20:15:00Z',
  },
  {
    id: '8',
    type: 'Payment',
    user: { name: 'Chris Lee', email: 'chris@ex.com' },
    amount: 39.99,
    currency: 'EUR',
    status: 'Completed',
    date: '2024-01-21 18:45',
    createdAt: '2024-01-21T18:45:00Z',
  },
  {
    id: '9',
    type: 'Tip',
    user: { name: 'Rachel Green', email: 'rachel@ex.com' },
    amount: 10.00,
    currency: 'EUR',
    status: 'Completed',
    date: '2024-01-21 16:20',
    createdAt: '2024-01-21T16:20:00Z',
  },
  {
    id: '10',
    type: 'Payment',
    user: { name: 'Tom Anderson', email: 'tom@ex.com' },
    amount: 74.99,
    currency: 'EUR',
    status: 'Completed',
    date: '2024-01-21 14:00',
    createdAt: '2024-01-21T14:00:00Z',
  },
];

/**
 * GET /api/accounting/lettrage
 * Retourne les transactions non lettrées, lettrages existants et balance âgée
 */
export async function GET(req: NextRequest) {
  try {
    // Filtrer les transactions complétées
    const transactionsCompleted = DEMO_TRANSACTIONS.filter((t) => t.status === 'Completed');

    // Auto-lettrage
    const lettrages = autoLettrage(transactionsCompleted);

    // Transactions déjà lettrées
    const idsLettres = new Set(lettrages.flatMap((l) => l.transactionIds));

    // Transactions non lettrées
    const transactionsNonLettrees = transactionsCompleted.filter((t) => !idsLettres.has(t.id));

    // Créances en retard (transactions pending)
    const creances = DEMO_TRANSACTIONS.filter((t) => t.status === 'Pending');

    // Balance âgée
    const balanceAgee = calculerBalanceAgee(creances);

    return NextResponse.json(
      {
        success: true,
        lettrages,
        transactionsNonLettrees,
        balanceAgee,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur lettrage:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors du traitement',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}
