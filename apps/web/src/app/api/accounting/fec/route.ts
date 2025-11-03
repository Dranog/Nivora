/**
 * API Export FEC (Fichier des Écritures Comptables)
 * Route: /api/accounting/fec
 * Conforme à l'article A47 A-1 du LPF
 * Supports: FEC (txt), CSV, Excel (xlsx)
 */

import { NextRequest, NextResponse } from 'next/server';
import { genererFEC } from '@/lib/accounting/fec-export';
import { genererExcelProfessionnel, genererNomFichierExcel } from '@/lib/accounting/excel-export';

// Demo data avec enrichissement
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
 * Génère un fichier CSV des transactions pour Excel
 */
function genererCSV(transactions: any[], siren: string): string {
  console.log(`🔄 [CSV Export] Génération CSV pour ${transactions.length} transactions`);

  // En-têtes CSV (séparateur point-virgule pour Excel français)
  const headers = [
    'Date',
    'Type',
    'Utilisateur',
    'Description',
    'Montant Brut',
    'Frais',
    'Montant Net',
    'Statut',
    'ID Transaction',
  ];

  let csv = headers.join(';') + '\n';

  // Ajouter chaque transaction
  transactions.forEach((tx) => {
    const date = new Date(tx.createdAt).toLocaleDateString('fr-FR');
    const montantBrut = (tx.amount / 100).toFixed(2).replace('.', ',');
    const frais = (tx.fee / 100).toFixed(2).replace('.', ',');
    const montantNet = (tx.net / 100).toFixed(2).replace('.', ',');

    const row = [
      date,
      tx.type,
      tx.user?.name || 'N/A',
      `"${tx.description || ''}"`, // Guillemets pour protéger les virgules
      montantBrut,
      frais,
      montantNet,
      tx.status,
      tx.id,
    ];

    csv += row.join(';') + '\n';
  });

  console.log(`✅ [CSV Export] CSV généré: ${csv.length} caractères`);

  return csv;
}

/**
 * GET /api/accounting/fec
 * Génère et télécharge le fichier FEC ou CSV
 * Query params: year (année), siren (9 chiffres), format (fec|csv)
 */
export async function GET(req: NextRequest) {
  try {
    console.log('🔵 [FEC] Début génération export');

    const { searchParams } = new URL(req.url);
    const siren = searchParams.get('siren') || '000000000';
    const format = searchParams.get('format') || 'fec'; // 'fec' ou 'csv'
    const year = searchParams.get('year');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    console.log('📅 [FEC] Paramètres reçus:', { siren, format, year, startDate, endDate });

    // Valider le SIREN
    if (!/^\d{9}$/.test(siren)) {
      console.error('❌ [FEC] SIREN invalide:', siren);
      return NextResponse.json(
        {
          success: false,
          error: 'SIREN invalide (9 chiffres requis)',
        },
        { status: 400 }
      );
    }

    console.log('✅ [FEC] SIREN valide');

    // Filtrer les transactions
    let transactions = DEMO_TRANSACTIONS.filter((t) => t.status === 'Completed');

    if (year) {
      // Filtrer par année
      const yearNum = parseInt(year);
      transactions = transactions.filter((t) => {
        const txYear = new Date(t.createdAt).getFullYear();
        return txYear === yearNum;
      });
      console.log(`📊 [FEC] Filtré par année ${year}: ${transactions.length} transactions`);
    } else if (startDate && endDate) {
      // Filtrer par plage de dates
      const start = new Date(startDate);
      const end = new Date(endDate);
      transactions = transactions.filter((t) => {
        const txDate = new Date(t.createdAt);
        return txDate >= start && txDate <= end;
      });
      console.log(`📊 [FEC] Filtré par plage ${startDate} - ${endDate}: ${transactions.length} transactions`);
    }

    if (transactions.length === 0) {
      console.error('❌ [FEC] Aucune transaction trouvée');
      return NextResponse.json(
        {
          success: false,
          error: 'Aucune transaction trouvée pour la période sélectionnée',
        },
        { status: 404 }
      );
    }

    // Générer le contenu selon le format
    console.log(`🔄 [FEC] Génération du contenu ${format.toUpperCase()}...`);

    let fileContent: Buffer | string;
    let filename: string;
    let contentType: string;

    if (format === 'xlsx') {
      // Export Excel professionnel
      console.log('📊 [Excel] Génération du fichier Excel...');
      fileContent = await genererExcelProfessionnel(transactions, {
        siren,
        companyName: 'OLIVER SAS',
        periodStart: startDate || undefined,
        periodEnd: endDate || undefined,
      });
      filename = genererNomFichierExcel(siren);
      contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      console.log(`✅ [Excel] Fichier Excel généré: ${fileContent.length} octets`);
    } else {
      // FEC ou CSV
      const textContent = format === 'csv'
        ? genererCSV(transactions, siren)
        : genererFEC(transactions, siren, parseInt(year || new Date().getFullYear().toString()));

      console.log(`✅ [FEC] Contenu généré: ${textContent.length} caractères`);

      // Nom du fichier pour FEC/CSV
      const now = new Date();
      const timestamp =
        String(year || now.getFullYear()) +
        String(now.getMonth() + 1).padStart(2, '0') +
        String(now.getDate()).padStart(2, '0') +
        String(now.getHours()).padStart(2, '0') +
        String(now.getMinutes()).padStart(2, '0') +
        String(now.getSeconds()).padStart(2, '0');

      const extension = format === 'csv' ? 'csv' : 'txt';
      filename = format === 'csv'
        ? `${siren}_Export_${timestamp}.${extension}`
        : `${siren}FEC${timestamp}.${extension}`;

      contentType = format === 'csv'
        ? 'text/csv;charset=utf-8'
        : 'text/plain;charset=utf-8';

      // Ajouter BOM UTF-8 pour les fichiers texte
      fileContent = '\ufeff' + textContent;
    }

    console.log(`📄 [FEC] Nom du fichier: ${filename}`);
    console.log(`✅ [FEC] Envoi du fichier`);

    // Retourner le fichier
    // Convertir Buffer en format compatible avec NextResponse
    const responseBody = typeof fileContent === 'string' ? fileContent : new Uint8Array(fileContent);

    return new NextResponse(responseBody, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('❌ [FEC] Erreur génération FEC:', error);
    console.error('❌ [FEC] Stack:', error instanceof Error ? error.stack : 'N/A');
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la génération du FEC',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}
