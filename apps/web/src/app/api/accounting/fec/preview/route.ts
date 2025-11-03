/**
 * API Preview FEC - Compte le nombre de transactions
 * Route: /api/accounting/fec/preview
 */

import { NextRequest, NextResponse } from 'next/server';

// Demo data (même que dans route.ts principal)
const DEMO_TRANSACTIONS = [
  {
    id: '1',
    type: 'Payment',
    user: { name: 'John Smith', email: 'john@ex.com' },
    amount: 4999,
    currency: 'EUR',
    status: 'Completed',
    date: '2024-01-22 14:30',
    createdAt: '2024-01-22T14:30:00Z',
    fee: 150,
    net: 4849,
    description: 'Monthly subscription payment',
  },
  {
    id: '2',
    type: 'Payout',
    user: { name: 'Sarah Creator', email: 'sarah@ex.com' },
    amount: 25000,
    currency: 'EUR',
    status: 'Completed',
    date: '2024-01-22 12:15',
    createdAt: '2024-01-22T12:15:00Z',
    fee: 500,
    net: 24500,
    description: 'Creator earnings withdrawal',
  },
  {
    id: '3',
    type: 'Subscription',
    user: { name: 'Mike Johnson', email: 'mike@ex.com' },
    amount: 1999,
    currency: 'EUR',
    status: 'Completed',
    date: '2024-01-22 10:45',
    createdAt: '2024-01-22T10:45:00Z',
    fee: 60,
    net: 1939,
    description: 'Premium tier subscription',
  },
  {
    id: '4',
    type: 'Tip',
    user: { name: 'Emma Wilson', email: 'emma@ex.com' },
    amount: 500,
    currency: 'EUR',
    status: 'Completed',
    date: '2024-01-22 09:20',
    createdAt: '2024-01-22T09:20:00Z',
    fee: 25,
    net: 475,
    description: 'Tip for exclusive content',
  },
  {
    id: '6',
    type: 'Payment',
    user: { name: 'Lisa Anderson', email: 'lisa@ex.com' },
    amount: 9999,
    currency: 'EUR',
    status: 'Completed',
    date: '2024-01-21 22:30',
    createdAt: '2024-01-21T22:30:00Z',
    fee: 200,
    net: 9799,
    description: 'Premium content purchase',
  },
  {
    id: '8',
    type: 'Payment',
    user: { name: 'Chris Lee', email: 'chris@ex.com' },
    amount: 3999,
    currency: 'EUR',
    status: 'Completed',
    date: '2024-01-21 18:45',
    createdAt: '2024-01-21T18:45:00Z',
    fee: 120,
    net: 3879,
    description: 'Content purchase',
  },
  {
    id: '9',
    type: 'Tip',
    user: { name: 'Rachel Green', email: 'rachel@ex.com' },
    amount: 1000,
    currency: 'EUR',
    status: 'Completed',
    date: '2024-01-21 16:20',
    createdAt: '2024-01-21T16:20:00Z',
    fee: 50,
    net: 950,
    description: 'Appreciation tip for creator',
  },
  {
    id: '10',
    type: 'Payment',
    user: { name: 'Tom Anderson', email: 'tom@ex.com' },
    amount: 7499,
    currency: 'EUR',
    status: 'Completed',
    date: '2024-01-21 14:00',
    createdAt: '2024-01-21T14:00:00Z',
    fee: 225,
    net: 7274,
    description: 'Annual subscription payment',
  },
];

/**
 * GET /api/accounting/fec/preview
 * Retourne le nombre de transactions disponibles pour export
 */
export async function GET(req: NextRequest) {
  try {
    console.log('🔍 [FEC Preview] Début prévisualisation');

    const { searchParams } = new URL(req.url);
    const siren = searchParams.get('siren') || '';
    const year = searchParams.get('year');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    console.log('📅 [FEC Preview] Paramètres:', { siren, year, startDate, endDate });

    // Valider le SIREN
    if (!/^\d{9}$/.test(siren)) {
      console.error('❌ [FEC Preview] SIREN invalide:', siren);
      return NextResponse.json(
        { success: false, error: 'SIREN invalide (9 chiffres requis)', count: 0 },
        { status: 400 }
      );
    }

    // Filtrer les transactions
    let transactions = DEMO_TRANSACTIONS.filter((t) => t.status === 'Completed');

    if (year) {
      // Filtrer par année
      const yearNum = parseInt(year);
      transactions = transactions.filter((t) => {
        const txYear = new Date(t.createdAt).getFullYear();
        return txYear === yearNum;
      });
      console.log(`📊 [FEC Preview] Filtré par année ${year}: ${transactions.length} transactions`);
    } else if (startDate && endDate) {
      // Filtrer par plage de dates
      const start = new Date(startDate);
      const end = new Date(endDate);
      transactions = transactions.filter((t) => {
        const txDate = new Date(t.createdAt);
        return txDate >= start && txDate <= end;
      });
      console.log(`📊 [FEC Preview] Filtré par plage ${startDate} - ${endDate}: ${transactions.length} transactions`);
    }

    console.log(`✅ [FEC Preview] Résultat: ${transactions.length} transactions`);

    return NextResponse.json({
      success: true,
      count: transactions.length,
      siren,
      period: year ? { year: parseInt(year) } : { startDate, endDate },
    });
  } catch (error) {
    console.error('❌ [FEC Preview] Erreur:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la prévisualisation',
        count: 0,
        details: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}
