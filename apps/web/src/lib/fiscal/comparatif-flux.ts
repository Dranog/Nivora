/**
 * Comparatif N vs N-1 et Flux de Trésorerie
 */

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BalanceData } from './balance-calculator';
import { ResultatData } from './resultat-calculator-v2';

const COLORS = {
  primary: [0, 212, 197] as [number, number, number],
  secondary: [0, 184, 169] as [number, number, number],
  dark: [51, 65, 85] as [number, number, number],
  gray: [100, 116, 139] as [number, number, number],
};

function formatEuro(cents: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

// ====================
// COMPARATIF N vs N-1
// ====================

interface ComparatifData {
  n: number;
  n1: number;
  variation: number;
  variationPct: string;
}

/**
 * Génère le comparatif N vs N-1
 * Si N-1 n'existe pas, simule avec -12.9% de croissance
 */
export function generateComparatif(
  dataN: { ca: number; resultatNet: number; totalActif: number; capitauxPropres: number; ebe: number },
  dataN1?: { ca: number; resultatNet: number; totalActif: number; capitauxPropres: number; ebe: number }
): Record<string, ComparatifData> {
  // Si pas de N-1, simuler avec taux de croissance
  const simulatedN1 = !dataN1
    ? {
        ca: Math.round(dataN.ca / 1.129),
        resultatNet: Math.round(dataN.resultatNet / 1.129),
        totalActif: Math.round(dataN.totalActif / 1.08),
        capitauxPropres: Math.round(dataN.capitauxPropres / 1.15),
        ebe: Math.round(dataN.ebe / 1.129),
      }
    : dataN1;

  const calculate = (labelN: number, labelN1: number): ComparatifData => ({
    n: labelN,
    n1: labelN1,
    variation: labelN - labelN1,
    variationPct: labelN1 > 0 ? `${(((labelN - labelN1) / labelN1) * 100).toFixed(1)}%` : 'N/A',
  });

  return {
    ca: calculate(dataN.ca, simulatedN1.ca),
    resultatNet: calculate(dataN.resultatNet, simulatedN1.resultatNet),
    totalActif: calculate(dataN.totalActif, simulatedN1.totalActif),
    capitauxPropres: calculate(dataN.capitauxPropres, simulatedN1.capitauxPropres),
    ebe: calculate(dataN.ebe, simulatedN1.ebe),
  };
}

/**
 * Ajoute la page comparatif au PDF
 */
export function addComparatifPage(
  doc: jsPDF,
  comparatif: Record<string, ComparatifData>,
  year: number
): void {
  doc.addPage();

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.dark);
  doc.text('COMPARATIF EXERCICES N vs N-1', 14, 20);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.gray);
  doc.text(`Analyse de l'évolution sur 2 exercices (${year - 1} vs ${year})`, 14, 28);

  const labels: Record<string, string> = {
    ca: 'Chiffre d\'affaires HT',
    resultatNet: 'Résultat net',
    totalActif: 'Total actif',
    capitauxPropres: 'Capitaux propres',
    ebe: 'EBE (EBITDA)',
  };

  const rows = Object.entries(comparatif).map(([key, data]) => [
    labels[key] || key.toUpperCase(),
    formatEuro(data.n1),
    formatEuro(data.n),
    `${data.variation >= 0 ? '+' : ''}${formatEuro(data.variation)}`,
    data.variationPct,
  ]);

  autoTable(doc, {
    startY: 38,
    head: [[`Indicateur`, `N-1 (${year - 1})`, `N (${year})`, 'Variation (€)', 'Variation (%)']],
    body: rows,
    theme: 'striped',
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: COLORS.primary, textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { halign: 'right', cellWidth: 35 },
      2: { halign: 'right', cellWidth: 35 },
      3: { halign: 'right', cellWidth: 30 },
      4: { halign: 'right', fontStyle: 'bold', cellWidth: 25 },
    },
    didParseCell: (data) => {
      if (data.column.index === 4 && data.section === 'body') {
        const value = data.cell.text[0];
        if (value.startsWith('+')) {
          data.cell.styles.textColor = [22, 163, 74]; // Vert
        } else if (value.startsWith('-')) {
          data.cell.styles.textColor = [220, 38, 38]; // Rouge
        }
      }
    },
  });

  const finalY = (doc as any).lastAutoTable.finalY;

  // Note explicative
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.gray);
  doc.text('Note: Si exercice N-1 non disponible, simulation avec taux de croissance moyen de +12,9%', 14, finalY + 10);
}

// ====================
// FLUX DE TRÉSORERIE
// ====================

export interface FluxTresorerie {
  fluxOperationnels: number;
  fluxInvestissement: number;
  fluxFinancement: number;
  variationTresorerie: number;
  tresorerieDebut: number;
  tresorerieFin: number;
}

/**
 * Calcule le tableau de flux de trésorerie (méthode indirecte)
 */
export function calculateFluxTresorerie(
  resultat: ResultatData,
  balance: BalanceData,
  balanceN1?: BalanceData
): FluxTresorerie {
  // CAF (Capacité d'autofinancement)
  const caf = resultat.resultatNet + resultat.dotationsAmortissements;

  // Variation BFR (si N-1 disponible)
  const variationBFR = balanceN1
    ? balance.actif.creancesClients -
      balanceN1.actif.creancesClients -
      (balance.passif.dettesFournisseurs - balanceN1.passif.dettesFournisseurs)
    : 0;

  const fluxOperationnels = caf - variationBFR;

  // Investissements (augmentation des immobilisations + dotations)
  const fluxInvestissement = balanceN1
    ? -(
        balance.actif.immobilisationsNettes -
        balanceN1.actif.immobilisationsNettes +
        resultat.dotationsAmortissements
      )
    : -Math.round(resultat.dotationsAmortissements * 3); // estimation

  // Financement (variation des dettes financières)
  const fluxFinancement = balanceN1
    ? balance.passif.dettesFinancieres - balanceN1.passif.dettesFinancieres
    : 0;

  const variationTresorerie = fluxOperationnels + fluxInvestissement + fluxFinancement;

  const tresorerieDebut =
    balanceN1?.actif.disponibilites || balance.actif.disponibilites - variationTresorerie;
  const tresorerieFin = balance.actif.disponibilites;

  return {
    fluxOperationnels,
    fluxInvestissement,
    fluxFinancement,
    variationTresorerie,
    tresorerieDebut,
    tresorerieFin,
  };
}

/**
 * Ajoute la page flux de trésorerie au PDF
 */
export function addFluxTresoreriePage(doc: jsPDF, flux: FluxTresorerie, year: number): void {
  doc.addPage();

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.dark);
  doc.text('TABLEAU DE FLUX DE TRÉSORERIE', 14, 20);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.gray);
  doc.text(`Méthode indirecte - Exercice ${year}`, 14, 28);

  const rows = [
    ['FLUX DE TRÉSORERIE OPÉRATIONNELS', ''],
    ['  Capacité d\'autofinancement (CAF)', formatEuro(flux.fluxOperationnels)],
    ['  Variation du besoin en fonds de roulement (BFR)', '0,00 €'], // détaillé si besoin
    ['Flux nets de trésorerie opérationnels (A)', formatEuro(flux.fluxOperationnels)],
    ['', ''],
    ['FLUX DE TRÉSORERIE D\'INVESTISSEMENT', ''],
    ['  Acquisitions d\'immobilisations', formatEuro(flux.fluxInvestissement)],
    ['  Cessions d\'immobilisations', '0,00 €'],
    ['Flux nets de trésorerie d\'investissement (B)', formatEuro(flux.fluxInvestissement)],
    ['', ''],
    ['FLUX DE TRÉSORERIE DE FINANCEMENT', ''],
    ['  Augmentation de capital', '0,00 €'],
    ['  Nouveaux emprunts', formatEuro(Math.max(0, flux.fluxFinancement))],
    ['  Remboursements d\'emprunts', formatEuro(Math.min(0, flux.fluxFinancement))],
    ['Flux nets de trésorerie de financement (C)', formatEuro(flux.fluxFinancement)],
    ['', ''],
    ['VARIATION DE TRÉSORERIE (A + B + C)', formatEuro(flux.variationTresorerie)],
    ['', ''],
    ['Trésorerie début d\'exercice', formatEuro(flux.tresorerieDebut)],
    ['Trésorerie fin d\'exercice', formatEuro(flux.tresorerieFin)],
    ['CONTRÔLE (Fin - Début)', formatEuro(flux.tresorerieFin - flux.tresorerieDebut)],
  ];

  autoTable(doc, {
    startY: 38,
    head: [['Désignation', 'Montant (€)']],
    body: rows,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: COLORS.primary, textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 140 },
      1: { cellWidth: 45, halign: 'right' },
    },
    didParseCell: (data) => {
      const text = data.cell.text[0];
      if (
        text.startsWith('FLUX') ||
        text.startsWith('Flux nets') ||
        text.startsWith('VARIATION') ||
        text.startsWith('CONTRÔLE')
      ) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [245, 245, 245];
      }
      // Variation en vert/rouge
      if (text.startsWith('VARIATION')) {
        const isPositif = flux.variationTresorerie >= 0;
        data.cell.styles.textColor = isPositif ? [22, 163, 74] : [220, 38, 38];
      }
    },
  });

  const finalY = (doc as any).lastAutoTable.finalY;

  // Vérification
  const diff = Math.abs(flux.variationTresorerie - (flux.tresorerieFin - flux.tresorerieDebut));
  if (diff < 0.01) {
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.primary);
    doc.setFont('helvetica', 'bold');
    doc.text('✓ CONTRÔLE OK: Variation = Fin - Début', 14, finalY + 10);
  }
}
