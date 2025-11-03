/**
 * API Lettrage manuel
 * Route: /api/accounting/lettrage/manuel
 */

import { NextRequest, NextResponse } from 'next/server';
import { lettrerManuellement } from '@/lib/accounting/lettrage';

// Demo data
const DEMO_TRANSACTIONS = [
  {
    id: '1',
    type: 'Payment',
    amount: 49.99,
    date: '2024-01-22 14:30',
    createdAt: '2024-01-22T14:30:00Z',
  },
  {
    id: '2',
    type: 'Payout',
    amount: 250.0,
    date: '2024-01-22 12:15',
    createdAt: '2024-01-22T12:15:00Z',
  },
  {
    id: '3',
    type: 'Subscription',
    amount: 19.99,
    date: '2024-01-22 10:45',
    createdAt: '2024-01-22T10:45:00Z',
  },
  {
    id: '4',
    type: 'Tip',
    amount: 5.0,
    date: '2024-01-22 09:20',
    createdAt: '2024-01-22T09:20:00Z',
  },
  {
    id: '6',
    type: 'Payment',
    amount: 99.99,
    date: '2024-01-21 22:30',
    createdAt: '2024-01-21T22:30:00Z',
  },
  {
    id: '8',
    type: 'Payment',
    amount: 39.99,
    date: '2024-01-21 18:45',
    createdAt: '2024-01-21T18:45:00Z',
  },
  {
    id: '9',
    type: 'Tip',
    amount: 10.0,
    date: '2024-01-21 16:20',
    createdAt: '2024-01-21T16:20:00Z',
  },
  {
    id: '10',
    type: 'Payment',
    amount: 74.99,
    date: '2024-01-21 14:00',
    createdAt: '2024-01-21T14:00:00Z',
  },
];

/**
 * POST /api/accounting/lettrage/manuel
 * Crée un lettrage manuel pour les transactions sélectionnées
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.transactionIds || !Array.isArray(body.transactionIds)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Le champ "transactionIds" est requis et doit être un tableau',
        },
        { status: 400 }
      );
    }

    if (body.transactionIds.length < 2) {
      return NextResponse.json(
        {
          success: false,
          error: 'Minimum 2 transactions requises pour le lettrage',
        },
        { status: 400 }
      );
    }

    const lettrage = lettrerManuellement(body.transactionIds, DEMO_TRANSACTIONS);

    return NextResponse.json(
      {
        success: true,
        lettrage,
        message: `Lettrage manuel créé : ${lettrage.code}`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur lettrage manuel:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors du lettrage manuel',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}
