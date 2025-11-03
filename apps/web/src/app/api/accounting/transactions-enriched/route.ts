/**
 * API parallèle : Transactions enrichies avec données comptables
 * Route: /api/accounting/transactions-enriched
 * Ne modifie PAS les endpoints existants
 */

import { NextRequest, NextResponse } from 'next/server';
import { enrichirTransactions, calculerStatsComptables } from '@/lib/accounting/enrichment';

// Demo data (identique à accounting/page.tsx)
const DEMO_TRANSACTIONS = [
  {
    id: '1',
    type: 'Payment',
    user: { name: 'John Smith', email: 'john@ex.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John' },
    amount: 4999,
    currency: 'EUR',
    status: 'Completed',
    method: 'Credit Card',
    date: '2024-01-22 14:30',
    fee: 150,
    net: 4849,
    description: 'Monthly subscription payment',
    transactionId: 'TXN-2024-001-ABC',
  },
  {
    id: '2',
    type: 'Payout',
    user: { name: 'Sarah Creator', email: 'sarah@ex.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
    amount: 25000,
    currency: 'EUR',
    status: 'Completed',
    method: 'Bank Transfer',
    date: '2024-01-22 12:15',
    fee: 500,
    net: 24500,
    description: 'Creator earnings withdrawal',
    transactionId: 'TXN-2024-002-XYZ',
  },
  {
    id: '3',
    type: 'Subscription',
    user: { name: 'Mike Johnson', email: 'mike@ex.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike' },
    amount: 1999,
    currency: 'EUR',
    status: 'Completed',
    method: 'PayPal',
    date: '2024-01-22 10:45',
    fee: 60,
    net: 1939,
    description: 'Premium tier subscription',
    transactionId: 'TXN-2024-003-DEF',
  },
  {
    id: '4',
    type: 'Tip',
    user: { name: 'Emma Wilson', email: 'emma@ex.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma' },
    amount: 500,
    currency: 'EUR',
    status: 'Completed',
    method: 'Credit Card',
    date: '2024-01-22 09:20',
    fee: 25,
    net: 475,
    description: 'Tip for exclusive content',
    transactionId: 'TXN-2024-004-GHI',
  },
  {
    id: '5',
    type: 'Refund',
    user: { name: 'David Brown', email: 'david@ex.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David' },
    amount: 2999,
    currency: 'EUR',
    status: 'Processing',
    method: 'Credit Card',
    date: '2024-01-22 08:00',
    fee: 0,
    net: -2999,
    description: 'Subscription refund request',
    transactionId: 'TXN-2024-005-JKL',
  },
  {
    id: '6',
    type: 'Payment',
    user: { name: 'Lisa Anderson', email: 'lisa@ex.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa' },
    amount: 9999,
    currency: 'EUR',
    status: 'Completed',
    method: 'Crypto',
    date: '2024-01-21 22:30',
    fee: 200,
    net: 9799,
    description: 'Premium content purchase',
    transactionId: 'TXN-2024-006-MNO',
  },
  {
    id: '7',
    type: 'Payout',
    user: { name: 'Alex Turner', email: 'alex@ex.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex' },
    amount: 15000,
    currency: 'EUR',
    status: 'Pending',
    method: 'Bank Transfer',
    date: '2024-01-21 20:15',
    fee: 300,
    net: 14700,
    description: 'Weekly earnings payout',
    transactionId: 'TXN-2024-007-PQR',
  },
  {
    id: '8',
    type: 'Subscription',
    user: { name: 'Chris Lee', email: 'chris@ex.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chris' },
    amount: 3999,
    currency: 'EUR',
    status: 'Failed',
    method: 'Credit Card',
    date: '2024-01-21 18:45',
    fee: 0,
    net: 0,
    description: 'Payment declined - insufficient funds',
    transactionId: 'TXN-2024-008-STU',
  },
  {
    id: '9',
    type: 'Tip',
    user: { name: 'Rachel Green', email: 'rachel@ex.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rachel' },
    amount: 1000,
    currency: 'EUR',
    status: 'Completed',
    method: 'PayPal',
    date: '2024-01-21 16:20',
    fee: 50,
    net: 950,
    description: 'Appreciation tip for creator',
    transactionId: 'TXN-2024-009-VWX',
  },
  {
    id: '10',
    type: 'Payment',
    user: { name: 'Tom Anderson', email: 'tom@ex.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tom' },
    amount: 7499,
    currency: 'EUR',
    status: 'Completed',
    method: 'Credit Card',
    date: '2024-01-21 14:00',
    fee: 225,
    net: 7274,
    description: 'Annual subscription payment',
    transactionId: 'TXN-2024-010-YZA',
  },
  {
    id: '11',
    type: 'Payout',
    user: { name: 'Nina Patel', email: 'nina@ex.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nina' },
    amount: 32000,
    currency: 'EUR',
    status: 'Completed',
    method: 'Bank Transfer',
    date: '2024-01-21 11:30',
    fee: 640,
    net: 31360,
    description: 'Monthly creator earnings',
    transactionId: 'TXN-2024-011-BCD',
  },
  {
    id: '12',
    type: 'Subscription',
    user: { name: 'Kevin Clark', email: 'kevin@ex.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kevin' },
    amount: 2499,
    currency: 'EUR',
    status: 'Completed',
    method: 'PayPal',
    date: '2024-01-21 09:15',
    fee: 75,
    net: 2424,
    description: 'Standard tier subscription',
    transactionId: 'TXN-2024-012-EFG',
  },
  {
    id: '13',
    type: 'Refund',
    user: { name: 'Amy Rodriguez', email: 'amy@ex.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amy' },
    amount: 1999,
    currency: 'EUR',
    status: 'Completed',
    method: 'Credit Card',
    date: '2024-01-20 20:45',
    fee: 0,
    net: -1999,
    description: 'Content not as described',
    transactionId: 'TXN-2024-013-HIJ',
  },
  {
    id: '14',
    type: 'Payment',
    user: { name: 'Brian Taylor', email: 'brian@ex.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Brian' },
    amount: 5999,
    currency: 'EUR',
    status: 'Processing',
    method: 'Bank Transfer',
    date: '2024-01-20 18:20',
    fee: 120,
    net: 5879,
    description: 'Premium content bundle',
    transactionId: 'TXN-2024-014-KLM',
  },
  {
    id: '15',
    type: 'Tip',
    user: { name: 'Jessica Moore', email: 'jessica@ex.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica' },
    amount: 2500,
    currency: 'EUR',
    status: 'Completed',
    method: 'Crypto',
    date: '2024-01-20 15:00',
    fee: 100,
    net: 2400,
    description: 'Large tip for exceptional content',
    transactionId: 'TXN-2024-015-NOP',
  },
  {
    id: '16',
    type: 'Payout',
    user: { name: 'Tyler Scott', email: 'tyler@ex.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tyler' },
    amount: 18500,
    currency: 'EUR',
    status: 'Failed',
    method: 'Bank Transfer',
    date: '2024-01-20 12:30',
    fee: 0,
    net: 0,
    description: 'Bank account verification failed',
    transactionId: 'TXN-2024-016-QRS',
  },
  {
    id: '17',
    type: 'Subscription',
    user: { name: 'Amanda Wright', email: 'amanda@ex.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amanda' },
    amount: 6999,
    currency: 'EUR',
    status: 'Completed',
    method: 'Credit Card',
    date: '2024-01-20 10:15',
    fee: 210,
    net: 6789,
    description: 'VIP tier subscription',
    transactionId: 'TXN-2024-017-TUV',
  },
  {
    id: '18',
    type: 'Payment',
    user: { name: 'Marcus Hill', email: 'marcus@ex.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus' },
    amount: 12999,
    currency: 'EUR',
    status: 'Completed',
    method: 'PayPal',
    date: '2024-01-20 08:00',
    fee: 390,
    net: 12609,
    description: 'Exclusive content package',
    transactionId: 'TXN-2024-018-WXY',
  },
];

/**
 * GET /api/accounting/transactions-enriched
 * Retourne les transactions avec enrichissement comptable
 */
export async function GET(req: NextRequest) {
  try {
    // Params query (filtres optionnels)
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    let transactions = [...DEMO_TRANSACTIONS];

    // Filtrage
    if (type) {
      transactions = transactions.filter((t) => t.type === type);
    }
    if (status) {
      transactions = transactions.filter((t) => t.status === status);
    }

    // Enrichissement comptable
    const enriched = enrichirTransactions(transactions);

    // Calcul des stats
    const stats = calculerStatsComptables(enriched);

    return NextResponse.json(
      {
        success: true,
        data: {
          transactions: enriched,
          stats,
          meta: {
            total: enriched.length,
            filtered: transactions.length,
            timestamp: new Date().toISOString(),
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur API transactions-enriched:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de l\'enrichissement des transactions',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/accounting/transactions-enriched
 * Enrichit des transactions custom (utile pour tests)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.transactions || !Array.isArray(body.transactions)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Le champ "transactions" est requis et doit être un tableau',
        },
        { status: 400 }
      );
    }

    const enriched = enrichirTransactions(body.transactions);
    const stats = calculerStatsComptables(enriched);

    return NextResponse.json(
      {
        success: true,
        data: {
          transactions: enriched,
          stats,
          meta: {
            total: enriched.length,
            timestamp: new Date().toISOString(),
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur POST transactions-enriched:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors du traitement de la requête',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}
