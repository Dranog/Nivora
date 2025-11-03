/**
 * API Route: Grand Livre
 * GET /api/accounting/grand-livre
 * Retourne le grand livre comptable avec filtres
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  genererGrandLivre,
  genererBalance,
  exporterGrandLivreCSV,
  exporterBalanceCSV,
} from '@/lib/accounting/grand-livre';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Paramètres
    const exercice = parseInt(searchParams.get('exercice') || String(new Date().getFullYear()));
    const type = searchParams.get('type') || 'grand-livre'; // 'grand-livre' ou 'balance'
    const format = searchParams.get('format') || 'json'; // 'json' ou 'csv'

    // Filtres optionnels
    const dateDebut = searchParams.get('dateDebut')
      ? new Date(searchParams.get('dateDebut')!)
      : undefined;
    const dateFin = searchParams.get('dateFin') ? new Date(searchParams.get('dateFin')!) : undefined;
    const comptes = searchParams.get('comptes')?.split(',').filter(Boolean) || [];

    console.log(
      `[API] Grand Livre - Type: ${type}, Exercice: ${exercice}, Format: ${format}, Comptes: ${comptes.length}`
    );

    // Génération selon le type
    if (type === 'balance') {
      const balance = await genererBalance(exercice, dateDebut, dateFin);

      if (format === 'csv') {
        const csv = exporterBalanceCSV(balance);
        return new NextResponse(csv, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="balance-${exercice}.csv"`,
          },
        });
      }

      return NextResponse.json(balance);
    } else {
      // Grand livre
      const grandLivre = await genererGrandLivre(
        exercice,
        dateDebut,
        dateFin,
        comptes.length > 0 ? comptes : undefined
      );

      if (format === 'csv') {
        const csv = exporterGrandLivreCSV(grandLivre);
        return new NextResponse(csv, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="grand-livre-${exercice}.csv"`,
          },
        });
      }

      return NextResponse.json(grandLivre);
    }
  } catch (error) {
    console.error('[API] Erreur Grand Livre:', error);
    return NextResponse.json(
      {
        error: 'Erreur lors de la génération du grand livre',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
