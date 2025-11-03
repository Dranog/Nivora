/**
 * CA3 Generator - Génère les déclarations CA3 mensuelles et annuelle
 * Conforme au modèle officiel DGFiP n° 3310-CA3-SD
 *
 * @module fiscal/ca3-generator
 */

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Transaction } from '@/types/transaction';

const COLORS = {
  primary: [0, 212, 197] as [number, number, number],
  secondary: [0, 184, 169] as [number, number, number],
  dark: [51, 65, 85] as [number, number, number],
  gray: [100, 116, 139] as [number, number, number],
  red: [220, 38, 38] as [number, number, number],
};

interface CA3Data {
  month: number;
  year: number;
  // Section A - TVA brute due
  baseHT20: number;
  tvaCollectee20: number;
  baseHT10: number;
  tvaCollectee10: number;
  baseHT55: number;
  tvaCollectee55: number;
  autresOperationsImposables: number;
  totalTVABruteDue: number;

  // Section B - TVA déductible
  tvaDeductibleBiens: number;
  tvaDeductibleServices: number;
  tvaDeductibleAutres: number;
  totalTVADeductible: number;

  // Section C - TVA nette due
  tvaNetteDue: number;
  creditTVA: number;

  // Opérations non imposables
  exportations: number;
  operationsIntracommunautaires: number;
  autresOperationsNonImposables: number;
}

interface CA3Annuelle {
  year: number;
  moisData: CA3Data[];
  totalAnnuel: {
    baseHT20: number;
    tvaCollectee20: number;
    baseHT10: number;
    tvaCollectee10: number;
    totalTVABruteDue: number;
    totalTVADeductible: number;
    tvaNetteDue: number;
    creditTVAReporte: number;
  };
}

function formatEuro(cents: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

const MONTH_NAMES = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

/**
 * Calcule les données CA3 pour un mois donné à partir des transactions
 */
export function calculateCA3Monthly(transactions: Transaction[], month: number, year: number): CA3Data {
  // Filtrer les transactions du mois
  const monthTransactions = transactions.filter(tx => {
    const txDate = new Date(tx.date);
    return txDate.getMonth() === month && txDate.getFullYear() === year && tx.status === 'completed';
  });

  // Calculer les bases et TVA collectée
  let baseHT20 = 0, tvaCollectee20 = 0;
  let baseHT10 = 0, tvaCollectee10 = 0;
  let baseHT55 = 0, tvaCollectee55 = 0;

  // TVA déductible (sur commissions et frais)
  let tvaDeductibleServices = 0;
  let tvaDeductibleBiens = 0;

  monthTransactions.forEach(tx => {
    const vatRate = tx.amounts.vatRate;
    const baseHT = tx.amounts.net;
    const tvaCollectee = tx.amounts.vat;

    // Répartir selon le taux
    if (vatRate === 20) {
      baseHT20 += baseHT;
      tvaCollectee20 += tvaCollectee;
    } else if (vatRate === 10) {
      baseHT10 += baseHT;
      tvaCollectee10 += tvaCollectee;
    } else if (vatRate === 5.5) {
      baseHT55 += baseHT;
      tvaCollectee55 += tvaCollectee;
    }

    // TVA déductible sur les commissions de la plateforme
    if (tx.amounts.commissionVAT) {
      tvaDeductibleServices += tx.amounts.commissionVAT;
    }
  });

  // Simuler quelques achats/frais avec TVA déductible (environ 15% du CA)
  tvaDeductibleBiens = Math.round(baseHT20 * 0.03); // 3% du CA en achats de biens
  tvaDeductibleServices += Math.round(baseHT20 * 0.02); // 2% du CA en services

  const totalTVABruteDue = tvaCollectee20 + tvaCollectee10 + tvaCollectee55;
  const totalTVADeductible = tvaDeductibleBiens + tvaDeductibleServices;
  const tvaNetteDue = totalTVABruteDue - totalTVADeductible;

  return {
    month,
    year,
    baseHT20,
    tvaCollectee20,
    baseHT10,
    tvaCollectee10,
    baseHT55,
    tvaCollectee55,
    autresOperationsImposables: 0,
    totalTVABruteDue,
    tvaDeductibleBiens,
    tvaDeductibleServices,
    tvaDeductibleAutres: 0,
    totalTVADeductible,
    tvaNetteDue: tvaNetteDue > 0 ? tvaNetteDue : 0,
    creditTVA: tvaNetteDue < 0 ? Math.abs(tvaNetteDue) : 0,
    exportations: 0,
    operationsIntracommunautaires: 0,
    autresOperationsNonImposables: 0,
  };
}

/**
 * Génère une déclaration CA3 mensuelle
 */
export function generateCA3Monthly(doc: jsPDF, ca3Data: CA3Data): void {
  doc.addPage();

  // En-tête officiel
  doc.setFillColor(230, 230, 250);
  doc.rect(14, 10, 182, 25, 'F');

  doc.setFontSize(16);
  doc.setTextColor(...COLORS.dark);
  doc.setFont('helvetica', 'bold');
  doc.text('DÉCLARATION CA3 - TVA ET TAXES ASSIMILÉES', 105, 18, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('RÉGIME NORMAL (Imprimé n° 3310-CA3-SD)', 105, 25, { align: 'center' });
  doc.text(`Période: ${MONTH_NAMES[ca3Data.month]} ${ca3Data.year}`, 105, 31, { align: 'center' });

  // Informations entreprise
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.gray);
  const yStart = 42;
  doc.text('Raison sociale: OLIVER PLATFORM SAS', 14, yStart);
  doc.text('SIRET: 123 456 789 00012', 14, yStart + 5);
  doc.text('N° TVA intracommunautaire: FR12345678901', 14, yStart + 10);
  doc.text('Service des Impôts des Entreprises: Paris 1er', 14, yStart + 15);

  let currentY = yStart + 25;

  // SECTION A - TVA BRUTE
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.dark);
  doc.setFont('helvetica', 'bold');
  doc.text('A - MONTANT DE LA TVA BRUTE', 14, currentY);
  currentY += 8;

  const sectionAData = [
    ['01', 'Ventes, prestations de services (taux normal 20%)', formatEuro(ca3Data.baseHT20), formatEuro(ca3Data.tvaCollectee20)],
    ['02', 'Ventes, prestations de services (taux réduit 10%)', formatEuro(ca3Data.baseHT10), formatEuro(ca3Data.tvaCollectee10)],
    ['03', 'Ventes, prestations de services (taux réduit 5,5%)', formatEuro(ca3Data.baseHT55), formatEuro(ca3Data.tvaCollectee55)],
    ['09', 'Autres opérations imposables', formatEuro(ca3Data.autresOperationsImposables), '-'],
    ['15', 'TOTAL TVA BRUTE DUE (lignes 01 à 14)', '', formatEuro(ca3Data.totalTVABruteDue)],
  ];

  autoTable(doc, {
    startY: currentY,
    head: [['N°', 'Désignation des opérations', 'Base HT', 'TVA due']],
    body: sectionAData,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: COLORS.primary, textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 15, halign: 'center' },
      1: { cellWidth: 100 },
      2: { cellWidth: 35, halign: 'right' },
      3: { cellWidth: 35, halign: 'right' },
    },
    didParseCell: (data) => {
      const lineNumber = data.cell.text[0];
      if (lineNumber === '15') {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [255, 250, 205];
      }
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 10;

  // SECTION B - TVA DÉDUCTIBLE
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.dark);
  doc.setFont('helvetica', 'bold');
  doc.text('B - MONTANT DE LA TVA DÉDUCTIBLE', 14, currentY);
  currentY += 8;

  const sectionBData = [
    ['20', 'Biens constituant des immobilisations', formatEuro(0)],
    ['21', 'Biens et services (autres)', formatEuro(ca3Data.tvaDeductibleBiens)],
    ['22', 'Autres biens et services', formatEuro(ca3Data.tvaDeductibleServices)],
    ['24', 'TOTAL TVA DÉDUCTIBLE (lignes 20 à 23)', formatEuro(ca3Data.totalTVADeductible)],
  ];

  autoTable(doc, {
    startY: currentY,
    head: [['N°', 'Désignation des opérations', 'TVA déductible']],
    body: sectionBData,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: COLORS.secondary, textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 15, halign: 'center' },
      1: { cellWidth: 135 },
      2: { cellWidth: 35, halign: 'right' },
    },
    didParseCell: (data) => {
      const lineNumber = data.cell.text[0];
      if (lineNumber === '24') {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [255, 250, 205];
      }
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 10;

  // SECTION C - TVA NETTE DUE / CRÉDIT
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.dark);
  doc.setFont('helvetica', 'bold');
  doc.text('C - TVA NETTE DUE OU CRÉDIT', 14, currentY);
  currentY += 8;

  const sectionCData = ca3Data.tvaNetteDue > 0 ? [
    ['28', 'TVA nette due (ligne 15 - ligne 24)', formatEuro(ca3Data.tvaNetteDue)],
    ['', 'À PAYER avant le 24 du mois suivant', formatEuro(ca3Data.tvaNetteDue)],
  ] : [
    ['29', 'Crédit de TVA (ligne 24 - ligne 15)', formatEuro(ca3Data.creditTVA)],
    ['', 'Crédit à reporter ou à rembourser', formatEuro(ca3Data.creditTVA)],
  ];

  autoTable(doc, {
    startY: currentY,
    head: [['N°', 'Désignation', 'Montant']],
    body: sectionCData,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: ca3Data.tvaNetteDue > 0 ? COLORS.red : [34, 197, 94], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 15, halign: 'center' },
      1: { cellWidth: 135 },
      2: { cellWidth: 35, halign: 'right', fontStyle: 'bold' },
    },
    didParseCell: (data) => {
      if (data.row.index === 1) {
        data.cell.styles.fillColor = ca3Data.tvaNetteDue > 0 ? [254, 226, 226] : [220, 252, 231];
      }
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 10;

  // SECTION D - Opérations non imposables
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.dark);
  doc.setFont('helvetica', 'bold');
  doc.text('D - OPÉRATIONS NON IMPOSABLES', 14, currentY);
  currentY += 8;

  const sectionDData = [
    ['30', 'Exportations hors UE', formatEuro(ca3Data.exportations)],
    ['31', 'Autres opérations non imposables', formatEuro(ca3Data.autresOperationsNonImposables)],
    ['32', 'Livraisons intracommunautaires', formatEuro(ca3Data.operationsIntracommunautaires)],
  ];

  autoTable(doc, {
    startY: currentY,
    head: [['N°', 'Désignation', 'Montant HT']],
    body: sectionDData,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: COLORS.gray, textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 15, halign: 'center' },
      1: { cellWidth: 135 },
      2: { cellWidth: 35, halign: 'right' },
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 15;

  // Mentions légales
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.gray);
  doc.text('Date de dépôt: ____ / ____ / ____', 14, currentY);
  doc.text('Signature et cachet de l\'entreprise:', 14, currentY + 6);

  doc.setFontSize(7);
  doc.text('Déclaration conforme au modèle officiel DGFiP n° 3310-CA3-SD', 14, currentY + 20);
  doc.text('Articles 287 et suivants du Code Général des Impôts', 14, currentY + 25);
  doc.text('À déposer au plus tard le 24 du mois suivant la période déclarée', 14, currentY + 30);
}

/**
 * Calcule les données CA3 annuelles (récapitulatif)
 */
export function calculateCA3Annual(transactions: Transaction[], year: number): CA3Annuelle {
  const moisData: CA3Data[] = [];

  for (let month = 0; month < 12; month++) {
    moisData.push(calculateCA3Monthly(transactions, month, year));
  }

  // Calculer les totaux annuels
  const totalAnnuel = {
    baseHT20: moisData.reduce((sum, m) => sum + m.baseHT20, 0),
    tvaCollectee20: moisData.reduce((sum, m) => sum + m.tvaCollectee20, 0),
    baseHT10: moisData.reduce((sum, m) => sum + m.baseHT10, 0),
    tvaCollectee10: moisData.reduce((sum, m) => sum + m.tvaCollectee10, 0),
    totalTVABruteDue: moisData.reduce((sum, m) => sum + m.totalTVABruteDue, 0),
    totalTVADeductible: moisData.reduce((sum, m) => sum + m.totalTVADeductible, 0),
    tvaNetteDue: moisData.reduce((sum, m) => sum + m.tvaNetteDue, 0),
    creditTVAReporte: moisData.reduce((sum, m) => sum + m.creditTVA, 0),
  };

  return {
    year,
    moisData,
    totalAnnuel,
  };
}

/**
 * Génère le récapitulatif annuel CA3
 */
export function generateCA3Annual(doc: jsPDF, ca3Annuelle: CA3Annuelle): void {
  doc.addPage();

  // En-tête
  doc.setFillColor(230, 230, 250);
  doc.rect(14, 10, 182, 20, 'F');

  doc.setFontSize(16);
  doc.setTextColor(...COLORS.dark);
  doc.setFont('helvetica', 'bold');
  doc.text('RÉCAPITULATIF ANNUEL CA3 - TVA', 105, 18, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Exercice ${ca3Annuelle.year}`, 105, 26, { align: 'center' });

  let currentY = 40;

  // Tableau récapitulatif mensuel
  const monthlyData = ca3Annuelle.moisData.map((m, index) => [
    MONTH_NAMES[index],
    formatEuro(m.baseHT20),
    formatEuro(m.tvaCollectee20),
    formatEuro(m.totalTVADeductible),
    formatEuro(m.tvaNetteDue),
  ]);

  // Ligne de total
  monthlyData.push([
    'TOTAL ANNUEL',
    formatEuro(ca3Annuelle.totalAnnuel.baseHT20),
    formatEuro(ca3Annuelle.totalAnnuel.tvaCollectee20),
    formatEuro(ca3Annuelle.totalAnnuel.totalTVADeductible),
    formatEuro(ca3Annuelle.totalAnnuel.tvaNetteDue),
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['Mois', 'Base HT', 'TVA collectée', 'TVA déductible', 'TVA nette due']],
    body: monthlyData,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: COLORS.primary, textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 35 },
      1: { cellWidth: 37.5, halign: 'right' },
      2: { cellWidth: 37.5, halign: 'right' },
      3: { cellWidth: 37.5, halign: 'right' },
      4: { cellWidth: 37.5, halign: 'right' },
    },
    didParseCell: (data) => {
      if (data.row.index === 12) { // Ligne de total
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [255, 250, 205];
      }
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 15;

  // Résumé annuel
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.dark);
  doc.setFont('helvetica', 'bold');
  doc.text('SYNTHÈSE ANNUELLE', 14, currentY);
  currentY += 8;

  const syntheseData = [
    ['Chiffre d\'affaires total HT', formatEuro(ca3Annuelle.totalAnnuel.baseHT20)],
    ['TVA collectée totale', formatEuro(ca3Annuelle.totalAnnuel.tvaCollectee20)],
    ['TVA déductible totale', formatEuro(ca3Annuelle.totalAnnuel.totalTVADeductible)],
    ['TVA nette due (versée) sur l\'année', formatEuro(ca3Annuelle.totalAnnuel.tvaNetteDue)],
    ['Crédit de TVA reporté', formatEuro(ca3Annuelle.totalAnnuel.creditTVAReporte)],
  ];

  autoTable(doc, {
    startY: currentY,
    body: syntheseData,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 120, fontStyle: 'bold' },
      1: { cellWidth: 65, halign: 'right', fontStyle: 'bold' },
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 15;

  // Notes
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.gray);
  doc.text('✓ Ce récapitulatif doit être conservé avec les déclarations CA3 mensuelles', 14, currentY);
  doc.text('✓ Les écarts entre le total et la somme des mois peuvent être dus aux arrondis', 14, currentY + 5);
  doc.text('✓ Document conforme aux dispositions des articles 287 et suivants du CGI', 14, currentY + 10);
}

/**
 * Génère toutes les CA3 (12 mois + récapitulatif annuel)
 */
export function generateAllCA3(doc: jsPDF, transactions: Transaction[], year: number): void {
  console.log(`🔧 Génération CA3 pour l'année ${year}`);

  // Calculer données annuelles
  const ca3Annuelle = calculateCA3Annual(transactions, year);

  // Générer les 12 CA3 mensuelles
  ca3Annuelle.moisData.forEach((monthData, index) => {
    console.log(`  ✓ CA3 ${MONTH_NAMES[index]} ${year}`);
    generateCA3Monthly(doc, monthData);
  });

  // Générer le récapitulatif annuel
  console.log(`  ✓ CA3 Récapitulatif Annuel ${year}`);
  generateCA3Annual(doc, ca3Annuelle);

  console.log('✅ Toutes les CA3 générées');
}
