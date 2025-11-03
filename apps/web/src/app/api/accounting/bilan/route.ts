/**
 * API Route: Bilan Comptable
 * GET /api/accounting/bilan
 * Retourne le bilan comptable (Actif/Passif) avec ratios
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  genererBilanComptable,
  calculerRatios,
  exporterBilanCSV,
  exporterRatiosCSV,
} from '@/lib/accounting/bilan-comptable';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Paramètres
    const exercice = parseInt(searchParams.get('exercice') || String(new Date().getFullYear()));
    const format = searchParams.get('format') || 'json'; // 'json' ou 'csv'
    const includeRatios = searchParams.get('includeRatios') === 'true';

    // Filtres optionnels
    const dateDebut = searchParams.get('dateDebut')
      ? new Date(searchParams.get('dateDebut')!)
      : undefined;
    const dateFin = searchParams.get('dateFin') ? new Date(searchParams.get('dateFin')!) : undefined;

    console.log(
      `[API] Bilan - Exercice: ${exercice}, Format: ${format}, Ratios: ${includeRatios}`
    );

    // Génération du bilan
    const bilan = await genererBilanComptable(exercice, dateDebut, dateFin);

    // Calcul des ratios si demandé
    const ratios = includeRatios ? calculerRatios(bilan) : undefined;

    // Export CSV
    if (format === 'csv') {
      let csv = exporterBilanCSV(bilan);

      if (ratios) {
        csv += '\n\n' + exporterRatiosCSV(ratios);
      }

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="bilan-${exercice}.csv"`,
        },
      });
    }

    // Réponse JSON
    return NextResponse.json({
      bilan,
      ratios,
    });
  } catch (error) {
    console.error('[API] Erreur Bilan:', error);
    return NextResponse.json(
      {
        error: 'Erreur lors de la génération du bilan',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
