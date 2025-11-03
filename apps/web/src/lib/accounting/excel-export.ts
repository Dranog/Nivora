/**
 * Export Excel Professionnel avec ExcelJS
 * Génère un fichier .xlsx formaté avec multi-feuilles, graphiques et métadonnées
 * @module accounting/excel-export
 */

import * as ExcelJS from 'exceljs';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface TransactionData {
  id: string;
  type: string;
  user: { name: string; email: string };
  amount: number; // en centimes
  fee: number; // en centimes
  net: number; // en centimes
  currency: string;
  status: string;
  date: string;
  createdAt: string;
  description?: string;
}

interface ExportOptions {
  siren: string;
  companyName?: string;
  periodStart?: string;
  periodEnd?: string;
}

/**
 * Génère un fichier Excel professionnel multi-feuilles
 */
export async function genererExcelProfessionnel(
  transactions: TransactionData[],
  options: ExportOptions
): Promise<Buffer> {
  console.log(`📊 [Excel Export] Début génération Excel pour ${transactions.length} transactions`);

  const workbook = new ExcelJS.Workbook();

  // Métadonnées du workbook
  workbook.creator = options.companyName || 'OLIVER SAS';
  workbook.lastModifiedBy = 'OLIVER Accounting System';
  workbook.created = new Date();
  workbook.modified = new Date();
  workbook.company = options.companyName || 'OLIVER SAS';
  workbook.subject = 'Export comptable des transactions';
  workbook.keywords = `comptabilité, transactions, ${options.siren}`;
  workbook.category = 'Finance';
  workbook.description = `Export des transactions comptables - Période: ${options.periodStart || ''} - ${options.periodEnd || ''}`;

  // Calculer les statistiques
  const stats = calculerStatistiques(transactions);

  // FEUILLE 1: Résumé
  await ajouterFeuilleResume(workbook, transactions, stats, options);

  // FEUILLE 2: Détail des transactions
  await ajouterFeuilleDetail(workbook, transactions, stats, options);

  // FEUILLE 3: Analyse par type
  await ajouterFeuilleAnalyse(workbook, transactions, stats, options);

  console.log('✅ [Excel Export] Workbook créé avec 3 feuilles');

  // Générer le buffer
  const buffer = await workbook.xlsx.writeBuffer();
  console.log(`✅ [Excel Export] Buffer généré: ${buffer.byteLength} octets`);

  return Buffer.from(buffer);
}

/**
 * Calcule les statistiques des transactions
 */
function calculerStatistiques(transactions: TransactionData[]) {
  const stats = {
    count: transactions.length,
    totalBrut: 0,
    totalFrais: 0,
    totalNet: 0,
    byType: {} as Record<string, { count: number; montant: number }>,
    byStatus: {} as Record<string, number>,
    byDate: {} as Record<string, number>,
  };

  transactions.forEach((tx) => {
    // Totaux
    stats.totalBrut += tx.amount;
    stats.totalFrais += tx.fee;
    stats.totalNet += tx.net;

    // Par type
    if (!stats.byType[tx.type]) {
      stats.byType[tx.type] = { count: 0, montant: 0 };
    }
    stats.byType[tx.type].count++;
    stats.byType[tx.type].montant += tx.amount;

    // Par statut
    stats.byStatus[tx.status] = (stats.byStatus[tx.status] || 0) + 1;

    // Par date (jour)
    const dateKey = new Date(tx.createdAt).toLocaleDateString('fr-FR');
    stats.byDate[dateKey] = (stats.byDate[dateKey] || 0) + tx.amount;
  });

  return stats;
}

/**
 * FEUILLE 1: Résumé avec statistiques
 */
async function ajouterFeuilleResume(
  workbook: ExcelJS.Workbook,
  transactions: TransactionData[],
  stats: any,
  options: ExportOptions
) {
  console.log('📄 [Excel] Création feuille Résumé...');

  const sheet = workbook.addWorksheet('Résumé', {
    views: [{ showGridLines: true }],
    properties: { tabColor: { argb: 'FF00D4C5' } },
  });

  let currentRow = 1;

  // EN-TÊTE GÉNÉRAL
  sheet.mergeCells(`A${currentRow}:F${currentRow}`);
  const headerCell = sheet.getCell(`A${currentRow}`);
  headerCell.value = 'OLIVER - Export Comptable';
  headerCell.font = { name: 'Segoe UI', size: 20, bold: true, color: { argb: 'FF334155' } };
  headerCell.alignment = { horizontal: 'center', vertical: 'middle' };
  headerCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF0F9FF' },
  };
  sheet.getRow(currentRow).height = 35;
  currentRow += 2;

  // INFORMATIONS GÉNÉRALES
  const infos = [
    ['SIREN', options.siren],
    ['Société', options.companyName || 'OLIVER SAS'],
    ['Période', options.periodStart && options.periodEnd ? `Du ${new Date(options.periodStart).toLocaleDateString('fr-FR')} au ${new Date(options.periodEnd).toLocaleDateString('fr-FR')}` : 'Année complète'],
    ['Date d\'export', format(new Date(), 'dd MMMM yyyy à HH:mm', { locale: fr })],
    ['Nombre de transactions', stats.count.toString()],
  ];

  infos.forEach(([label, value]) => {
    sheet.getCell(`A${currentRow}`).value = label;
    sheet.getCell(`A${currentRow}`).font = { bold: true, color: { argb: 'FF334155' } };
    sheet.getCell(`B${currentRow}`).value = value;
    sheet.getCell(`B${currentRow}`).font = { color: { argb: 'FF475569' } };
    currentRow++;
  });

  currentRow += 2;

  // TOTAUX FINANCIERS
  sheet.mergeCells(`A${currentRow}:F${currentRow}`);
  const totauxTitle = sheet.getCell(`A${currentRow}`);
  totauxTitle.value = '💰 TOTAUX FINANCIERS';
  totauxTitle.font = { size: 14, bold: true, color: { argb: 'FF334155' } };
  totauxTitle.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0F2FE' },
  };
  totauxTitle.border = {
    bottom: { style: 'medium', color: { argb: 'FF00D4C5' } },
  };
  sheet.getRow(currentRow).height = 25;
  currentRow += 2;

  // Tableau des totaux
  const totauxHeaders = ['Indicateur', 'Montant (€)'];
  totauxHeaders.forEach((header, idx) => {
    const cell = sheet.getCell(currentRow, idx + 1);
    cell.value = header;
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF00D4C5' },
    };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
      bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
      left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
      right: { style: 'thin', color: { argb: 'FFD1D5DB' } },
    };
  });
  currentRow++;

  const totauxData = [
    ['Montant Brut Total', stats.totalBrut / 100],
    ['Total Frais', stats.totalFrais / 100],
    ['Montant Net Total', stats.totalNet / 100],
  ];

  totauxData.forEach(([label, montant], idx) => {
    sheet.getCell(currentRow, 1).value = label;
    sheet.getCell(currentRow, 1).font = { bold: true };
    sheet.getCell(currentRow, 2).value = montant;
    sheet.getCell(currentRow, 2).numFmt = '#,##0.00 €';
    sheet.getCell(currentRow, 2).font = { bold: idx === 2 }; // Net en gras
    if (idx === 2) {
      sheet.getCell(currentRow, 2).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD1FAE5' },
      };
    }

    // Bordures
    [1, 2].forEach((col) => {
      sheet.getCell(currentRow, col).border = {
        top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        right: { style: 'thin', color: { argb: 'FFD1D5DB' } },
      };
    });

    currentRow++;
  });

  currentRow += 2;

  // RÉPARTITION PAR TYPE
  sheet.mergeCells(`A${currentRow}:F${currentRow}`);
  const repartitionTitle = sheet.getCell(`A${currentRow}`);
  repartitionTitle.value = '📊 RÉPARTITION PAR TYPE DE TRANSACTION';
  repartitionTitle.font = { size: 14, bold: true, color: { argb: 'FF334155' } };
  repartitionTitle.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFEF3C7' },
  };
  repartitionTitle.border = {
    bottom: { style: 'medium', color: { argb: 'FFF59E0B' } },
  };
  sheet.getRow(currentRow).height = 25;
  currentRow += 2;

  // Tableau par type
  const typeHeaders = ['Type', 'Nombre', 'Montant Total (€)', 'Pourcentage'];
  typeHeaders.forEach((header, idx) => {
    const cell = sheet.getCell(currentRow, idx + 1);
    cell.value = header;
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF59E0B' },
    };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
      bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
      left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
      right: { style: 'thin', color: { argb: 'FFD1D5DB' } },
    };
  });
  currentRow++;

  Object.entries(stats.byType).forEach(([type, data]: [string, any]) => {
    const percentage = ((data.montant / stats.totalBrut) * 100).toFixed(1);

    sheet.getCell(currentRow, 1).value = type;
    sheet.getCell(currentRow, 2).value = data.count;
    sheet.getCell(currentRow, 2).alignment = { horizontal: 'center' };
    sheet.getCell(currentRow, 3).value = data.montant / 100;
    sheet.getCell(currentRow, 3).numFmt = '#,##0.00 €';
    sheet.getCell(currentRow, 4).value = parseFloat(percentage) / 100;
    sheet.getCell(currentRow, 4).numFmt = '0.0%';

    // Bordures
    [1, 2, 3, 4].forEach((col) => {
      sheet.getCell(currentRow, col).border = {
        top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        right: { style: 'thin', color: { argb: 'FFD1D5DB' } },
      };
    });

    currentRow++;
  });

  currentRow += 3;

  // PIED DE PAGE
  sheet.mergeCells(`A${currentRow}:F${currentRow}`);
  const footer = sheet.getCell(`A${currentRow}`);
  footer.value = '🔒 Document confidentiel - OLIVER SAS - Ne pas diffuser sans autorisation';
  footer.font = { size: 9, italic: true, color: { argb: 'FF94A3B8' } };
  footer.alignment = { horizontal: 'center', vertical: 'middle' };

  // Largeurs des colonnes
  sheet.getColumn(1).width = 30;
  sheet.getColumn(2).width = 20;
  sheet.getColumn(3).width = 20;
  sheet.getColumn(4).width = 15;

  console.log('✅ [Excel] Feuille Résumé créée');
}

/**
 * FEUILLE 2: Détail des transactions avec formatage professionnel
 */
async function ajouterFeuilleDetail(
  workbook: ExcelJS.Workbook,
  transactions: TransactionData[],
  stats: any,
  options: ExportOptions
) {
  console.log('📄 [Excel] Création feuille Détail...');

  const sheet = workbook.addWorksheet('Détail des Transactions', {
    views: [
      {
        state: 'frozen',
        xSplit: 0,
        ySplit: 3, // Figer les 3 premières lignes (en-tête + sous-en-tête + headers)
        showGridLines: true,
      },
    ],
    properties: { tabColor: { argb: 'FF3B82F6' } },
  });

  let currentRow = 1;

  // EN-TÊTE
  sheet.mergeCells(`A${currentRow}:I${currentRow}`);
  const header = sheet.getCell(`A${currentRow}`);
  header.value = `DÉTAIL DES TRANSACTIONS - ${transactions.length} opération(s)`;
  header.font = { size: 14, bold: true, color: { argb: 'FF1E40AF' } };
  header.alignment = { horizontal: 'center', vertical: 'middle' };
  header.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFDBEAFE' },
  };
  sheet.getRow(currentRow).height = 30;
  currentRow++;

  // Sous-en-tête avec période
  sheet.mergeCells(`A${currentRow}:I${currentRow}`);
  const subheader = sheet.getCell(`A${currentRow}`);
  subheader.value = options.periodStart && options.periodEnd
    ? `Période: ${new Date(options.periodStart).toLocaleDateString('fr-FR')} - ${new Date(options.periodEnd).toLocaleDateString('fr-FR')}`
    : 'Toutes les transactions';
  subheader.font = { size: 10, italic: true, color: { argb: 'FF64748B' } };
  subheader.alignment = { horizontal: 'center', vertical: 'middle' };
  sheet.getRow(currentRow).height = 20;
  currentRow++;

  // EN-TÊTES DE COLONNES
  const headers = [
    { key: 'date', label: 'Date', width: 12 },
    { key: 'id', label: 'ID Transaction', width: 15 },
    { key: 'type', label: 'Type', width: 15 },
    { key: 'user', label: 'Utilisateur', width: 25 },
    { key: 'description', label: 'Description', width: 35 },
    { key: 'montantBrut', label: 'Montant Brut', width: 15 },
    { key: 'frais', label: 'Frais', width: 12 },
    { key: 'montantNet', label: 'Montant Net', width: 15 },
    { key: 'status', label: 'Statut', width: 12 },
  ];

  headers.forEach((header, idx) => {
    const cell = sheet.getCell(currentRow, idx + 1);
    cell.value = header.label;
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF3B82F6' },
    };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFFFFFFF' } },
      bottom: { style: 'thin', color: { argb: 'FFFFFFFF' } },
      left: { style: 'thin', color: { argb: 'FFFFFFFF' } },
      right: { style: 'thin', color: { argb: 'FFFFFFFF' } },
    };
    sheet.getColumn(idx + 1).width = header.width;
  });
  sheet.getRow(currentRow).height = 25;
  currentRow++;

  // DONNÉES (lignes alternées)
  transactions.forEach((tx, idx) => {
    const isEven = idx % 2 === 0;
    const fillColor = isEven ? 'FFFFFFFF' : 'FFF1F5F9';

    const rowData = [
      new Date(tx.createdAt).toLocaleDateString('fr-FR'),
      tx.id,
      tx.type,
      tx.user?.name || 'N/A',
      tx.description || '',
      tx.amount / 100,
      tx.fee / 100,
      tx.net / 100,
      tx.status,
    ];

    rowData.forEach((value, colIdx) => {
      const cell = sheet.getCell(currentRow, colIdx + 1);
      cell.value = value;

      // Format monétaire pour les colonnes de montant
      if ([5, 6, 7].includes(colIdx)) {
        cell.numFmt = '#,##0.00 €';
        cell.alignment = { horizontal: 'right' };

        // Mise en forme conditionnelle: montants négatifs en rouge
        if (typeof value === 'number' && value < 0) {
          cell.font = { color: { argb: 'FFDC2626' }, bold: true };
        }
      } else {
        cell.alignment = { horizontal: colIdx === 4 ? 'left' : 'center' }; // Description à gauche
      }

      // Couleur de fond alternée
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: fillColor },
      };

      // Bordures légères
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      };
    });

    currentRow++;
  });

  // LIGNE DE TOTAUX
  const totauxRow = currentRow;
  sheet.getCell(totauxRow, 1).value = 'TOTAUX';
  sheet.getCell(totauxRow, 1).font = { bold: true, size: 11 };
  sheet.getCell(totauxRow, 1).alignment = { horizontal: 'center' };
  sheet.mergeCells(totauxRow, 1, totauxRow, 5);

  // Formules de somme
  sheet.getCell(totauxRow, 6).value = { formula: `SUM(F4:F${totauxRow - 1})` };
  sheet.getCell(totauxRow, 7).value = { formula: `SUM(G4:G${totauxRow - 1})` };
  sheet.getCell(totauxRow, 8).value = { formula: `SUM(H4:H${totauxRow - 1})` };

  // Formatage de la ligne de totaux
  [1, 6, 7, 8].forEach((col) => {
    const cell = sheet.getCell(totauxRow, col);
    cell.font = { bold: true, size: 11, color: { argb: 'FF1E40AF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E7FF' },
    };
    cell.border = {
      top: { style: 'double', color: { argb: 'FF3B82F6' } },
      bottom: { style: 'double', color: { argb: 'FF3B82F6' } },
    };
    if ([6, 7, 8].includes(col)) {
      cell.numFmt = '#,##0.00 €';
      cell.alignment = { horizontal: 'right' };
    }
  });

  // FILTRES AUTOMATIQUES (sur les en-têtes)
  sheet.autoFilter = {
    from: { row: 3, column: 1 },
    to: { row: 3, column: 9 },
  };

  console.log('✅ [Excel] Feuille Détail créée avec filtres et totaux');
}

/**
 * FEUILLE 3: Analyse et graphiques par type
 */
async function ajouterFeuilleAnalyse(
  workbook: ExcelJS.Workbook,
  transactions: TransactionData[],
  stats: any,
  options: ExportOptions
) {
  console.log('📄 [Excel] Création feuille Analyse...');

  const sheet = workbook.addWorksheet('Analyse par Type', {
    views: [{ showGridLines: true }],
    properties: { tabColor: { argb: 'FF10B981' } },
  });

  let currentRow = 1;

  // EN-TÊTE
  sheet.mergeCells(`A${currentRow}:E${currentRow}`);
  const header = sheet.getCell(`A${currentRow}`);
  header.value = '📊 ANALYSE PAR TYPE DE TRANSACTION';
  header.font = { size: 16, bold: true, color: { argb: 'FF065F46' } };
  header.alignment = { horizontal: 'center', vertical: 'middle' };
  header.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFD1FAE5' },
  };
  sheet.getRow(currentRow).height = 35;
  currentRow += 2;

  // TABLEAU D'ANALYSE PAR TYPE
  const analysisHeaders = ['Type', 'Nombre', 'Montant Total (€)', 'Moyenne (€)', 'Part (%)'];
  analysisHeaders.forEach((header, idx) => {
    const cell = sheet.getCell(currentRow, idx + 1);
    cell.value = header;
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF10B981' },
    };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = {
      top: { style: 'thin' },
      bottom: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' },
    };
  });
  sheet.getRow(currentRow).height = 25;
  currentRow++;

  const dataStartRow = currentRow;

  Object.entries(stats.byType).forEach(([type, data]: [string, any], idx) => {
    const average = data.montant / data.count / 100;
    const percentage = (data.montant / stats.totalBrut) * 100;

    sheet.getCell(currentRow, 1).value = type;
    sheet.getCell(currentRow, 2).value = data.count;
    sheet.getCell(currentRow, 2).alignment = { horizontal: 'center' };
    sheet.getCell(currentRow, 3).value = data.montant / 100;
    sheet.getCell(currentRow, 3).numFmt = '#,##0.00 €';
    sheet.getCell(currentRow, 4).value = average;
    sheet.getCell(currentRow, 4).numFmt = '#,##0.00 €';
    sheet.getCell(currentRow, 5).value = percentage / 100;
    sheet.getCell(currentRow, 5).numFmt = '0.0%';

    // Bordures
    [1, 2, 3, 4, 5].forEach((col) => {
      sheet.getCell(currentRow, col).border = {
        top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        right: { style: 'thin', color: { argb: 'FFD1D5DB' } },
      };
    });

    currentRow++;
  });

  const dataEndRow = currentRow - 1;

  // Note: ExcelJS ne supporte pas les graphiques nativement de manière simple
  // On peut ajouter une note pour indiquer que les graphiques doivent être créés manuellement
  currentRow += 2;

  sheet.mergeCells(`A${currentRow}:E${currentRow + 2}`);
  const chartNote = sheet.getCell(`A${currentRow}`);
  chartNote.value = '📈 Graphiques\n\nPour visualiser les données sous forme de graphiques:\n1. Sélectionnez les données ci-dessus\n2. Insertion > Graphiques > Graphique en secteurs ou Histogramme\n3. Personnalisez selon vos besoins';
  chartNote.font = { size: 10, italic: true, color: { argb: 'FF64748B' } };
  chartNote.alignment = { horizontal: 'left', vertical: 'top', wrapText: true };
  chartNote.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFEF3C7' },
  };
  chartNote.border = {
    top: { style: 'thin', color: { argb: 'FFF59E0B' } },
    bottom: { style: 'thin', color: { argb: 'FFF59E0B' } },
    left: { style: 'thin', color: { argb: 'FFF59E0B' } },
    right: { style: 'thin', color: { argb: 'FFF59E0B' } },
  };
  sheet.getRow(currentRow).height = 80;

  // Largeurs des colonnes
  sheet.getColumn(1).width = 20;
  sheet.getColumn(2).width = 15;
  sheet.getColumn(3).width = 20;
  sheet.getColumn(4).width = 20;
  sheet.getColumn(5).width = 15;

  console.log('✅ [Excel] Feuille Analyse créée');
}

/**
 * Génère le nom de fichier Excel
 */
export function genererNomFichierExcel(siren: string): string {
  const now = new Date();
  const timestamp = format(now, 'yyyyMMdd_HHmmss');
  return `Export_${siren}_${timestamp}.xlsx`;
}
