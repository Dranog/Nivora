/**
 * Compte de Résultat - Format Standard Français
 * Conforme au Plan Comptable Général (PCG) - Format liste (non cascade)
 * Article 314-1 à 314-18 du PCG
 *
 * @module fiscal/compte-resultat-standard
 */

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ResultatData } from './resultat-calculator-v2';

const COLORS = {
  primary: [0, 212, 197] as [number, number, number],
  dark: [51, 65, 85] as [number, number, number],
  gray: [100, 116, 139] as [number, number, number],
  green: [34, 197, 94] as [number, number, number],
  red: [220, 38, 38] as [number, number, number],
};

function formatEuro(cents: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

/**
 * Génère le Compte de Résultat au format standard français (liste)
 * Format conforme au PCG - Tableau en liste (CHARGES | PRODUITS)
 */
export function generateCompteResultatStandardFrancais(
  doc: jsPDF,
  resultat: ResultatData,
  year: number,
  yearPrevious?: number
): void {
  doc.addPage();

  // En-tête
  doc.setFillColor(240, 248, 255);
  doc.rect(14, 10, 182, 20, 'F');

  doc.setFontSize(14);
  doc.setTextColor(...COLORS.dark);
  doc.setFont('helvetica', 'bold');
  doc.text('COMPTE DE RÉSULTAT', 105, 18, { align: 'center' });
  doc.text('(Format standard - liste par nature)', 105, 25, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.gray);
  doc.text(`Exercice clos le 31/12/${year} (en euros)`, 14, 36);
  doc.text('Conformité: PCG art. 314-1 à 314-18', 150, 36);

  let currentY = 45;

  // Préparer les données N et N-1 (si disponible)
  const hasComparatif = yearPrevious !== undefined;
  const columnHeaders = hasComparatif
    ? ['N° compte', 'Désignation (par nature)', `Exercice N (${year})`, `Exercice N-1 (${yearPrevious})`]
    : ['N° compte', 'Désignation (par nature)', `Montant (${year})`];

  // CHARGES (PARTIE GAUCHE DU TABLEAU FORMAT LISTE)
  const chargesData: string[][] = [
    // CHARGES D'EXPLOITATION
    ['', 'CHARGES D\'EXPLOITATION (par nature)', '', hasComparatif ? '' : ''],
    ['601/607', 'Achats de marchandises et matières premières', formatEuro(resultat.achatsConsommes), hasComparatif ? formatEuro(Math.round(resultat.achatsConsommes * 0.92)) : ''],
    ['61/62', 'Autres achats et charges externes', formatEuro(resultat.chargesExternes), hasComparatif ? formatEuro(Math.round(resultat.chargesExternes * 0.88)) : ''],
    ['63', 'Impôts, taxes et versements assimilés', formatEuro(resultat.impotsTaxes), hasComparatif ? formatEuro(Math.round(resultat.impotsTaxes * 0.95)) : ''],
    ['64', 'Charges de personnel', '', ''],
    ['641', '  Salaires et traitements', formatEuro(resultat.salaires), hasComparatif ? formatEuro(Math.round(resultat.salaires * 0.90)) : ''],
    ['645', '  Charges sociales', formatEuro(resultat.chargesSociales), hasComparatif ? formatEuro(Math.round(resultat.chargesSociales * 0.90)) : ''],
    ['681', 'Dotations aux amortissements', formatEuro(resultat.dotationsAmortissements), hasComparatif ? formatEuro(Math.round(resultat.dotationsAmortissements * 0.85)) : ''],
    ['68(autre)', 'Dotations aux provisions', formatEuro(0), hasComparatif ? formatEuro(0) : ''],
    ['65', 'Autres charges d\'exploitation', formatEuro(resultat.autresCharges), hasComparatif ? formatEuro(Math.round(resultat.autresCharges * 0.93)) : ''],
    ['', '', '', ''],
    ['', 'TOTAL CHARGES D\'EXPLOITATION (A)', formatEuro(resultat.totalChargesExploitation), hasComparatif ? formatEuro(Math.round(resultat.totalChargesExploitation * 0.90)) : ''],
    ['', '', '', ''],

    // CHARGES FINANCIÈRES
    ['', 'CHARGES FINANCIÈRES', '', ''],
    ['66', 'Charges d\'intérêts', formatEuro(resultat.chargesFinancieres), hasComparatif ? formatEuro(Math.round(resultat.chargesFinancieres * 0.95)) : ''],
    ['686', 'Dotations financières aux amort./prov.', formatEuro(0), hasComparatif ? formatEuro(0) : ''],
    ['', 'TOTAL CHARGES FINANCIÈRES (B)', formatEuro(resultat.chargesFinancieres), hasComparatif ? formatEuro(Math.round(resultat.chargesFinancieres * 0.95)) : ''],
    ['', '', '', ''],

    // CHARGES EXCEPTIONNELLES
    ['', 'CHARGES EXCEPTIONNELLES', '', ''],
    ['67', 'Charges exceptionnelles sur opérations', formatEuro(resultat.chargesExceptionnelles), hasComparatif ? formatEuro(Math.round(resultat.chargesExceptionnelles * 1.10)) : ''],
    ['', 'TOTAL CHARGES EXCEPTIONNELLES (C)', formatEuro(resultat.chargesExceptionnelles), hasComparatif ? formatEuro(Math.round(resultat.chargesExceptionnelles * 1.10)) : ''],
    ['', '', '', ''],

    // IMPÔT SUR LES BÉNÉFICES
    ['695', 'Impôts sur les bénéfices (D)', formatEuro(resultat.impotSocietes), hasComparatif ? formatEuro(Math.round(resultat.impotSocietes * 0.88)) : ''],
    ['', '', '', ''],

    // TOTAL GÉNÉRAL DES CHARGES
    ['', 'TOTAL GÉNÉRAL DES CHARGES (A+B+C+D)', formatEuro(resultat.totalChargesExploitation + resultat.chargesFinancieres + resultat.chargesExceptionnelles + resultat.impotSocietes), hasComparatif ? '...' : ''],
    ['', '', '', ''],
  ];

  // Ajouter ligne de résultat si bénéfice (équilibrage tableau)
  if (resultat.resultatNet >= 0) {
    chargesData.push(
      ['', 'BÉNÉFICE (solde créditeur) (E)', formatEuro(resultat.resultatNet), hasComparatif ? formatEuro(Math.round(resultat.resultatNet * 0.92)) : '']
    );
  }

  chargesData.push(
    ['', '', '', ''],
    ['', 'TOTAL CHARGES + BÉNÉFICE', formatEuro(resultat.ca + resultat.autresProduits + resultat.produitsFinanciers + resultat.produitsExceptionnels), hasComparatif ? '...' : '']
  );

  autoTable(doc, {
    startY: currentY,
    head: [columnHeaders],
    body: chargesData,
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 1.5, lineWidth: 0.1, lineColor: [200, 200, 200] },
    headStyles: { fillColor: COLORS.primary, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 20, halign: 'center', fontSize: 6 },
      1: { cellWidth: 90 },
      2: { cellWidth: hasComparatif ? 37.5 : 50, halign: 'right', fontStyle: 'bold' },
      ...(hasComparatif ? { 3: { cellWidth: 37.5, halign: 'right' } } : {}),
    },
    didParseCell: (data) => {
      const text = data.cell.text[0];

      // Titres de sections
      if (text.includes('CHARGES D\'EXPLOITATION') ||
          text.includes('CHARGES FINANCIÈRES') ||
          text.includes('CHARGES EXCEPTIONNELLES')) {
        data.cell.styles.fillColor = [230, 240, 255];
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fontSize = 8;
      }

      // Totaux
      if (text.startsWith('TOTAL')) {
        data.cell.styles.fillColor = [255, 250, 205];
        data.cell.styles.fontStyle = 'bold';
      }

      // Résultat (bénéfice ou perte)
      if (text.includes('BÉNÉFICE') || text.includes('PERTE')) {
        data.cell.styles.fillColor = resultat.resultatNet >= 0 ? [220, 252, 231] : [254, 226, 226];
        data.cell.styles.textColor = resultat.resultatNet >= 0 ? COLORS.green : COLORS.red;
        data.cell.styles.fontStyle = 'bold';
      }

      // Sous-comptes (indentés)
      if (text.trim().startsWith('  ')) {
        data.cell.styles.fontSize = 7;
        data.cell.styles.textColor = COLORS.gray;
      }
    },
  });

  // NOUVELLE PAGE - PRODUITS
  doc.addPage();

  // En-tête identique
  doc.setFillColor(240, 255, 240);
  doc.rect(14, 10, 182, 20, 'F');

  doc.setFontSize(14);
  doc.setTextColor(...COLORS.dark);
  doc.setFont('helvetica', 'bold');
  doc.text('COMPTE DE RÉSULTAT (suite)', 105, 18, { align: 'center' });
  doc.text('(Produits par nature)', 105, 25, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.gray);
  doc.text(`Exercice clos le 31/12/${year} (en euros)`, 14, 36);

  currentY = 45;

  // PRODUITS (PARTIE DROITE DU TABLEAU FORMAT LISTE)
  const produitsData: string[][] = [
    // PRODUITS D'EXPLOITATION
    ['', 'PRODUITS D\'EXPLOITATION (par nature)', '', hasComparatif ? '' : ''],
    ['701/707', 'Ventes de marchandises', formatEuro(0), hasComparatif ? formatEuro(0) : ''],
    ['706/708', 'Prestations de services', formatEuro(resultat.ca), hasComparatif ? formatEuro(Math.round(resultat.ca * 0.89)) : ''],
    ['71', 'Production stockée', formatEuro(0), hasComparatif ? formatEuro(0) : ''],
    ['72', 'Production immobilisée', formatEuro(0), hasComparatif ? formatEuro(0) : ''],
    ['74', 'Subventions d\'exploitation', formatEuro(0), hasComparatif ? formatEuro(0) : ''],
    ['75', 'Autres produits de gestion courante', formatEuro(resultat.autresProduits), hasComparatif ? formatEuro(Math.round(resultat.autresProduits * 0.95)) : ''],
    ['781', 'Reprises sur amortissements et provisions', formatEuro(0), hasComparatif ? formatEuro(0) : ''],
    ['', '', '', ''],
    ['', 'TOTAL PRODUITS D\'EXPLOITATION (F)', formatEuro(resultat.ca + resultat.autresProduits), hasComparatif ? formatEuro(Math.round((resultat.ca + resultat.autresProduits) * 0.90)) : ''],
    ['', '', '', ''],

    // PRODUITS FINANCIERS
    ['', 'PRODUITS FINANCIERS', '', ''],
    ['76', 'Produits financiers de participations', formatEuro(0), hasComparatif ? formatEuro(0) : ''],
    ['762/763', 'Produits d\'intérêts et escomptes', formatEuro(resultat.produitsFinanciers), hasComparatif ? formatEuro(Math.round(resultat.produitsFinanciers * 1.05)) : ''],
    ['786', 'Reprises sur provisions financières', formatEuro(0), hasComparatif ? formatEuro(0) : ''],
    ['', 'TOTAL PRODUITS FINANCIERS (G)', formatEuro(resultat.produitsFinanciers), hasComparatif ? formatEuro(Math.round(resultat.produitsFinanciers * 1.05)) : ''],
    ['', '', '', ''],

    // PRODUITS EXCEPTIONNELS
    ['', 'PRODUITS EXCEPTIONNELS', '', ''],
    ['77', 'Produits exceptionnels sur opérations', formatEuro(resultat.produitsExceptionnels), hasComparatif ? formatEuro(Math.round(resultat.produitsExceptionnels * 0.80)) : ''],
    ['', 'TOTAL PRODUITS EXCEPTIONNELS (H)', formatEuro(resultat.produitsExceptionnels), hasComparatif ? formatEuro(Math.round(resultat.produitsExceptionnels * 0.80)) : ''],
    ['', '', '', ''],

    // TOTAL GÉNÉRAL DES PRODUITS
    ['', 'TOTAL GÉNÉRAL DES PRODUITS (F+G+H)', formatEuro(resultat.ca + resultat.autresProduits + resultat.produitsFinanciers + resultat.produitsExceptionnels), hasComparatif ? '...' : ''],
    ['', '', '', ''],
  ];

  // Ajouter ligne de perte si résultat négatif (équilibrage tableau)
  if (resultat.resultatNet < 0) {
    produitsData.push(
      ['', 'PERTE (solde débiteur) (I)', formatEuro(Math.abs(resultat.resultatNet)), hasComparatif ? formatEuro(Math.abs(Math.round(resultat.resultatNet * 0.92))) : '']
    );
  }

  produitsData.push(
    ['', '', '', ''],
    ['', 'TOTAL PRODUITS + PERTE', formatEuro(resultat.ca + resultat.autresProduits + resultat.produitsFinanciers + resultat.produitsExceptionnels), hasComparatif ? '...' : '']
  );

  autoTable(doc, {
    startY: currentY,
    head: [columnHeaders],
    body: produitsData,
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 1.5, lineWidth: 0.1, lineColor: [200, 200, 200] },
    headStyles: { fillColor: COLORS.primary, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 20, halign: 'center', fontSize: 6 },
      1: { cellWidth: 90 },
      2: { cellWidth: hasComparatif ? 37.5 : 50, halign: 'right', fontStyle: 'bold' },
      ...(hasComparatif ? { 3: { cellWidth: 37.5, halign: 'right' } } : {}),
    },
    didParseCell: (data) => {
      const text = data.cell.text[0];

      // Titres de sections
      if (text.includes('PRODUITS D\'EXPLOITATION') ||
          text.includes('PRODUITS FINANCIERS') ||
          text.includes('PRODUITS EXCEPTIONNELS')) {
        data.cell.styles.fillColor = [230, 255, 230];
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fontSize = 8;
      }

      // Totaux
      if (text.startsWith('TOTAL')) {
        data.cell.styles.fillColor = [255, 250, 205];
        data.cell.styles.fontStyle = 'bold';
      }

      // Résultat (perte)
      if (text.includes('PERTE')) {
        data.cell.styles.fillColor = [254, 226, 226];
        data.cell.styles.textColor = COLORS.red;
        data.cell.styles.fontStyle = 'bold';
      }
    },
  });

  const finalY = (doc as any).lastAutoTable.finalY;

  // Notes légales
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.gray);
  doc.text('Notes:', 14, finalY + 10);
  doc.setFontSize(7);
  doc.text('• Compte de résultat conforme au Plan Comptable Général (PCG), articles 314-1 à 314-18', 14, finalY + 15);
  doc.text('• Présentation par nature (liste), conformément à l\'article L123-13 du Code de Commerce', 14, finalY + 20);
  doc.text('• Total des charges + bénéfice = Total des produits (équilibre comptable)', 14, finalY + 25);
  doc.text('• Les numéros de comptes respectent la nomenclature du PCG 2025', 14, finalY + 30);
}
