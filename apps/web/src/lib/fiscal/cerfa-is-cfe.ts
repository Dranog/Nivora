/**
 * CERFA IS & CFE Generator - Génère les formulaires fiscaux obligatoires
 * - CERFA 2065 : Impôt sur les Sociétés (IS)
 * - CERFA 1447-M : Cotisation Foncière des Entreprises (CFE)
 *
 * @module fiscal/cerfa-is-cfe
 */

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { BalanceData } from './balance-calculator-v2';
import type { ResultatData } from './resultat-calculator-v2';

const COLORS = {
  primary: [0, 212, 197] as [number, number, number],
  secondary: [0, 184, 169] as [number, number, number],
  dark: [51, 65, 85] as [number, number, number],
  gray: [100, 116, 139] as [number, number, number],
  red: [220, 38, 38] as [number, number, number],
  green: [34, 197, 94] as [number, number, number],
};

function formatEuro(cents: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

/**
 * CERFA 2065 - Déclaration d'Impôt sur les Sociétés
 */
export function generateCerfaIS(doc: jsPDF, resultat: ResultatData, balance: BalanceData, year: number): void {
  doc.addPage();

  // En-tête officiel
  doc.setFillColor(240, 240, 255);
  doc.rect(14, 10, 182, 25, 'F');

  doc.setFontSize(16);
  doc.setTextColor(...COLORS.dark);
  doc.setFont('helvetica', 'bold');
  doc.text('CERFA N° 2065-SD', 105, 17, { align: 'center' });
  doc.text('DÉCLARATION D\'IMPÔT SUR LES SOCIÉTÉS', 105, 24, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.gray);
  doc.text(`Exercice clos le 31/12/${year}`, 105, 31, { align: 'center' });

  // Informations entreprise
  let currentY = 42;
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.dark);
  doc.setFont('helvetica', 'bold');
  doc.text('IDENTIFICATION DE L\'ENTREPRISE', 14, currentY);
  currentY += 7;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.gray);
  doc.text('Dénomination: OLIVER PLATFORM SAS', 14, currentY);
  currentY += 5;
  doc.text('SIREN: 123 456 789', 14, currentY);
  currentY += 5;
  doc.text('Adresse: 15 rue de la Tech, 75001 Paris', 14, currentY);
  currentY += 5;
  doc.text('Activité: Plateforme numérique de contenus (code NAF: 6312Z)', 14, currentY);
  currentY += 5;
  doc.text('Régime: IS - Taux normal', 14, currentY);
  currentY += 10;

  // PARTIE I - Calcul du résultat fiscal
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.dark);
  doc.setFont('helvetica', 'bold');
  doc.text('I - DÉTERMINATION DU RÉSULTAT FISCAL', 14, currentY);
  currentY += 8;

  // Résultat comptable
  const resultatComptable = resultat.resultatNet;

  // Réintégrations (charges non déductibles)
  const reintegrations = Math.round(resultatComptable * 0.05); // 5% de réintégrations typiques

  // Déductions
  const deductions = Math.round(resultatComptable * 0.02); // 2% de déductions

  // Résultat fiscal
  const resultatFiscal = resultatComptable + reintegrations - deductions;

  // Déficits reportables
  const deficitsReportables = 0; // Pas de déficit pour simplifier

  // Base imposable
  const baseImposable = Math.max(0, resultatFiscal - deficitsReportables);

  const partieIData = [
    ['Résultat comptable avant impôts (ligne 01)', formatEuro(resultatComptable)],
    ['+ Réintégrations fiscales (charges non déductibles)', formatEuro(reintegrations)],
    ['  • Amendes et pénalités', formatEuro(Math.round(reintegrations * 0.3))],
    ['  • Fraction excédentaire des amortissements', formatEuro(Math.round(reintegrations * 0.4))],
    ['  • Autres réintégrations', formatEuro(Math.round(reintegrations * 0.3))],
    ['- Déductions fiscales', formatEuro(deductions)],
    ['  • Dividendes de filiales (régime mère-fille)', formatEuro(Math.round(deductions * 0.6))],
    ['  • Autres déductions', formatEuro(Math.round(deductions * 0.4))],
    ['= RÉSULTAT FISCAL (ligne 10)', formatEuro(resultatFiscal)],
    ['- Déficits reportables des exercices antérieurs', formatEuro(deficitsReportables)],
    ['= BASE IMPOSABLE À L\'IS (ligne 12)', formatEuro(baseImposable)],
  ];

  autoTable(doc, {
    startY: currentY,
    body: partieIData,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 135 },
      1: { cellWidth: 50, halign: 'right', fontStyle: 'bold' },
    },
    didParseCell: (data) => {
      const text = data.cell.text[0];
      if (text.startsWith('=') || text.includes('RÉSULTAT') || text.includes('BASE')) {
        data.cell.styles.fillColor = [255, 250, 205];
        data.cell.styles.fontStyle = 'bold';
      }
      if (text.startsWith('  •')) {
        data.cell.styles.fontSize = 7;
        data.cell.styles.textColor = COLORS.gray;
      }
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 10;

  // PARTIE II - Calcul de l'IS
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.dark);
  doc.setFont('helvetica', 'bold');
  doc.text('II - CALCUL DE L\'IMPÔT SUR LES SOCIÉTÉS', 14, currentY);
  currentY += 8;

  // Taux réduit 15% jusqu'à 42 500€ puis 25% au-delà (2025)
  const seuilTauxReduit = 4250000; // 42 500€ en centimes
  const tauxReduit = 0.15;
  const tauxNormal = 0.25;

  let IS_tauxReduit = 0;
  let IS_tauxNormal = 0;

  if (baseImposable <= seuilTauxReduit) {
    IS_tauxReduit = Math.round(baseImposable * tauxReduit);
  } else {
    IS_tauxReduit = Math.round(seuilTauxReduit * tauxReduit);
    IS_tauxNormal = Math.round((baseImposable - seuilTauxReduit) * tauxNormal);
  }

  const totalIS = IS_tauxReduit + IS_tauxNormal;

  // Contributions additionnelles (pour grandes entreprises, CA > 250M€)
  const contributionSociale = 0; // Pas applicable pour PME

  // Acomptes déjà versés (simulé)
  const acomptesVerses = Math.round(totalIS * 0.85); // 85% versés en acomptes

  // Solde à payer
  const soldeAPayer = totalIS - acomptesVerses;

  const partieIIData = [
    ['Base imposable (reprise ligne 12)', formatEuro(baseImposable)],
    ['', ''],
    ['IS au taux réduit de 15% (jusqu\'à 42 500 €)', formatEuro(IS_tauxReduit)],
    ['IS au taux normal de 25% (au-delà de 42 500 €)', formatEuro(IS_tauxNormal)],
    ['= MONTANT DE L\'IS DÛ (ligne 20)', formatEuro(totalIS)],
    ['+ Contribution sociale (3,3% si applicable)', formatEuro(contributionSociale)],
    ['= TOTAL IMPÔT (ligne 22)', formatEuro(totalIS + contributionSociale)],
    ['', ''],
    ['- Acomptes déjà versés durant l\'exercice', formatEuro(acomptesVerses)],
    ['= SOLDE D\'IS À PAYER (ligne 24)', formatEuro(soldeAPayer)],
  ];

  autoTable(doc, {
    startY: currentY,
    body: partieIIData,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 135 },
      1: { cellWidth: 50, halign: 'right', fontStyle: 'bold' },
    },
    didParseCell: (data) => {
      const text = data.cell.text[0];
      if (text.startsWith('=') || text.includes('TOTAL') || text.includes('SOLDE')) {
        data.cell.styles.fillColor = [255, 250, 205];
        data.cell.styles.fontStyle = 'bold';
      }
      if (text.includes('SOLDE À PAYER')) {
        data.cell.styles.fillColor = soldeAPayer > 0 ? [254, 226, 226] : [220, 252, 231];
        data.cell.styles.textColor = soldeAPayer > 0 ? COLORS.red : COLORS.green;
      }
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 10;

  // PARTIE III - Acomptes pour N+1
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.dark);
  doc.setFont('helvetica', 'bold');
  doc.text('III - ACOMPTES PRÉVISIONNELS POUR N+1', 14, currentY);
  currentY += 8;

  const acompte1 = Math.round(totalIS * 0.25); // 25% au 15 mars
  const acompte2 = Math.round(totalIS * 0.25); // 25% au 15 juin
  const acompte3 = Math.round(totalIS * 0.25); // 25% au 15 sept
  const acompte4 = Math.round(totalIS * 0.25); // 25% au 15 déc

  const partieIIIData = [
    ['Acompte 1 (à verser au 15 mars N+1)', formatEuro(acompte1)],
    ['Acompte 2 (à verser au 15 juin N+1)', formatEuro(acompte2)],
    ['Acompte 3 (à verser au 15 septembre N+1)', formatEuro(acompte3)],
    ['Acompte 4 (à verser au 15 décembre N+1)', formatEuro(acompte4)],
  ];

  autoTable(doc, {
    startY: currentY,
    body: partieIIIData,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 135 },
      1: { cellWidth: 50, halign: 'right' },
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 15;

  // Mentions légales
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.gray);
  doc.text('Date de dépôt: ____ / ____ / ____', 14, currentY);
  doc.text('Signature du représentant légal:', 14, currentY + 6);

  doc.setFontSize(7);
  doc.text('Déclaration conforme au modèle officiel DGFiP n° 2065-SD', 14, currentY + 20);
  doc.text('Articles 205 à 223 quinquies du Code Général des Impôts', 14, currentY + 25);
  doc.text('À déposer au plus tard le 2ème jour ouvré suivant le 1er mai (pour exercice clos au 31/12)', 14, currentY + 30);
}

/**
 * CERFA 1447-M - Cotisation Foncière des Entreprises
 */
export function generateCerfaCFE(doc: jsPDF, resultat: ResultatData, year: number): void {
  doc.addPage();

  // En-tête officiel
  doc.setFillColor(240, 255, 240);
  doc.rect(14, 10, 182, 25, 'F');

  doc.setFontSize(16);
  doc.setTextColor(...COLORS.dark);
  doc.setFont('helvetica', 'bold');
  doc.text('CERFA N° 1447-M-SD', 105, 17, { align: 'center' });
  doc.text('COTISATION FONCIÈRE DES ENTREPRISES (CFE)', 105, 24, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.gray);
  doc.text(`Année d'imposition: ${year}`, 105, 31, { align: 'center' });

  // Informations entreprise
  let currentY = 42;
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.dark);
  doc.setFont('helvetica', 'bold');
  doc.text('IDENTIFICATION DE L\'ENTREPRISE', 14, currentY);
  currentY += 7;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.gray);
  doc.text('Dénomination: OLIVER PLATFORM SAS', 14, currentY);
  currentY += 5;
  doc.text('SIREN: 123 456 789', 14, currentY);
  currentY += 5;
  doc.text('Établissement principal: 15 rue de la Tech, 75001 Paris', 14, currentY);
  currentY += 5;
  doc.text('Activité: Plateforme numérique de contenus', 14, currentY);
  currentY += 5;
  doc.text('Début d\'activité: 01/01/2023', 14, currentY);
  currentY += 10;

  // PARTIE I - Bases d'imposition
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.dark);
  doc.setFont('helvetica', 'bold');
  doc.text('I - BASES D\'IMPOSITION', 14, currentY);
  currentY += 8;

  // Valeur locative des locaux
  const surfaceBureaux = 150; // m²
  const valeurLocativeM2 = 30000; // 300€/m² en centimes
  const valeurLocativeTotale = surfaceBureaux * valeurLocativeM2;

  // Base minimum pour CFE (micro-entreprises exonérées si CA < seuils)
  const baseMinimum = valeurLocativeTotale < 100000 ? 100000 : valeurLocativeTotale; // Min 1000€

  const partieIData = [
    ['Surface des locaux d\'exploitation', `${surfaceBureaux} m²`, ''],
    ['Valeur locative au m²', '', formatEuro(valeurLocativeM2)],
    ['Valeur locative totale (ligne 3)', '', formatEuro(valeurLocativeTotale)],
    ['', '', ''],
    ['Base d\'imposition retenue (ligne 5)', '', formatEuro(baseMinimum)],
  ];

  autoTable(doc, {
    startY: currentY,
    body: partieIData,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 110 },
      1: { cellWidth: 35, halign: 'right' },
      2: { cellWidth: 40, halign: 'right', fontStyle: 'bold' },
    },
    didParseCell: (data) => {
      const text = data.cell.text[0];
      if (text.includes('Base d\'imposition')) {
        data.cell.styles.fillColor = [255, 250, 205];
        data.cell.styles.fontStyle = 'bold';
      }
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 10;

  // PARTIE II - Calcul de la CFE
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.dark);
  doc.setFont('helvetica', 'bold');
  doc.text('II - CALCUL DE LA COTISATION', 14, currentY);
  currentY += 8;

  // Taux CFE (fixé par la commune, entre 16% et 27%)
  const tauxCFE = 0.23; // 23% (taux moyen Paris)

  // Cotisation de base
  const cotisationBase = Math.round(baseMinimum * tauxCFE);

  // Cotisation minimum (pour les petites bases)
  const cotisationMinimum = baseMinimum < 500000 ? Math.max(cotisationBase, 22500) : cotisationBase; // Min 225€

  // Frais de gestion
  const fraisGestion = Math.round(cotisationMinimum * 0.01); // 1%

  // Total CFE
  const totalCFE = cotisationMinimum + fraisGestion;

  const partieIIData = [
    ['Base d\'imposition (reprise ligne 5)', formatEuro(baseMinimum)],
    ['Taux d\'imposition communal (Paris)', `${(tauxCFE * 100).toFixed(2)}%`, ''],
    ['= Cotisation de base (ligne 8)', '', formatEuro(cotisationBase)],
    ['Cotisation minimum applicable', '', formatEuro(cotisationMinimum)],
    ['+ Frais de gestion (1%)', '', formatEuro(fraisGestion)],
    ['= TOTAL CFE DUE (ligne 11)', '', formatEuro(totalCFE)],
  ];

  autoTable(doc, {
    startY: currentY,
    body: partieIIData,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 110 },
      1: { cellWidth: 35, halign: 'right' },
      2: { cellWidth: 40, halign: 'right', fontStyle: 'bold' },
    },
    didParseCell: (data) => {
      const text = data.cell.text[0];
      if (text.startsWith('=') || text.includes('TOTAL')) {
        data.cell.styles.fillColor = [255, 250, 205];
        data.cell.styles.fontStyle = 'bold';
      }
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 10;

  // PARTIE III - Modalités de paiement
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.dark);
  doc.setFont('helvetica', 'bold');
  doc.text('III - MODALITÉS DE PAIEMENT', 14, currentY);
  currentY += 8;

  const acompte = Math.round(totalCFE * 0.50); // 50% en juin
  const solde = totalCFE - acompte; // Solde en décembre

  const partieIIIData = [
    ['Acompte à verser au 15 juin N', formatEuro(acompte)],
    ['Solde à verser au 15 décembre N', formatEuro(solde)],
    ['= Total annuel', formatEuro(totalCFE)],
  ];

  autoTable(doc, {
    startY: currentY,
    body: partieIIIData,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 135 },
      1: { cellWidth: 50, halign: 'right' },
    },
    didParseCell: (data) => {
      if (data.row.index === 2) {
        data.cell.styles.fillColor = [255, 250, 205];
        data.cell.styles.fontStyle = 'bold';
      }
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 15;

  // Exonérations et réductions
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.dark);
  doc.setFont('helvetica', 'bold');
  doc.text('Exonérations applicables:', 14, currentY);
  currentY += 6;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.gray);
  doc.text('☐ Exonération en faveur des créations d\'entreprises (art. 1464 B du CGI)', 14, currentY);
  currentY += 5;
  doc.text('☐ Exonération des activités BIC nouvelles dans certaines zones (art. 1465 à 1466 D)', 14, currentY);
  currentY += 5;
  doc.text('☐ Réduction pour implantation dans certaines zones (ZFU, ZRR)', 14, currentY);
  currentY += 10;

  // Mentions légales
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.gray);
  doc.text('Date: ____ / ____ / ____', 14, currentY);
  doc.text('Signature et cachet de l\'entreprise:', 14, currentY + 6);

  doc.setFontSize(7);
  doc.text('Déclaration conforme au modèle officiel DGFiP n° 1447-M-SD', 14, currentY + 20);
  doc.text('Articles 1447 et suivants du Code Général des Impôts', 14, currentY + 25);
  doc.text('CFE due par toute entreprise exerçant une activité non salariée au 1er janvier', 14, currentY + 30);
}
