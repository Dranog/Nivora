/**
 * Additional sections for complete fiscal report
 * This file contains all the new PDF generation functions
 */

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const COLORS = {
  primary: [0, 212, 197] as [number, number, number],
  secondary: [0, 184, 169] as [number, number, number],
  dark: [51, 65, 85] as [number, number, number],
  gray: [100, 116, 139] as [number, number, number],
  lightGray: [241, 245, 249] as [number, number, number],
};

function formatEuro(cents: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(cents / 100);
}

type Immobilisation = {
  nature: string;
  valeurBrute: number;
  amortCumules: number;
  vnc: number;
  dotationN: number;
  taux: number;
};

type CreanceDette = {
  nature: string;
  moins1An: number;
  plus1An: number;
  total: number;
};

type TVAMensuelle = {
  mois: string;
  baseHT: number;
  tva20: number;
  tvaDeductible: number;
  tvaNette: number;
};

type Ratios = {
  liquiditeGenerale: number;
  liquiditeReduite: number;
  autonomieFinanciere: number;
  capaciteRemboursement: number;
  roe: number;
  roa: number;
  margeNette: number;
};

/**
 * PAGES 6-8: Annexes - Tableau des immobilisations
 */
export function addAnnexesImmobilisations(doc: jsPDF, immobilisations: Immobilisation[], year: number): void {
  doc.addPage();

  doc.setFontSize(16);
  doc.setTextColor(...COLORS.dark);
  doc.setFont('helvetica', 'bold');
  doc.text('ANNEXE 1 - TABLEAU DES IMMOBILISATIONS', 14, 20);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.gray);
  doc.text(`Exercice ${year} - Mouvements de l'exercice (en euros)`, 14, 27);

  autoTable(doc, {
    head: [['Nature', 'Valeur brute', 'Amort. cumulés', 'VNC', 'Dotation N', 'Taux %']],
    body: immobilisations.map((immo) => [
      immo.nature,
      formatEuro(immo.valeurBrute),
      formatEuro(immo.amortCumules),
      formatEuro(immo.vnc),
      formatEuro(immo.dotationN),
      `${immo.taux.toFixed(1)} %`,
    ]),
    foot: [[
      'TOTAL',
      formatEuro(immobilisations.reduce((sum, i) => sum + i.valeurBrute, 0)),
      formatEuro(immobilisations.reduce((sum, i) => sum + i.amortCumules, 0)),
      formatEuro(immobilisations.reduce((sum, i) => sum + i.vnc, 0)),
      formatEuro(immobilisations.reduce((sum, i) => sum + i.dotationN, 0)),
      '',
    ]],
    startY: 35,
    margin: { left: 14, right: 14 },
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: COLORS.primary, textColor: [255, 255, 255], fontStyle: 'bold' },
    footStyles: { fillColor: COLORS.lightGray, fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { halign: 'right', cellWidth: 30 },
      2: { halign: 'right', cellWidth: 30 },
      3: { halign: 'right', cellWidth: 30 },
      4: { halign: 'right', cellWidth: 25 },
      5: { halign: 'center', cellWidth: 20 },
    },
  });

  const finalY = (doc as any).lastAutoTable.finalY;

  // Notes explicatives
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Notes:', 14, finalY + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const notes = [
    '• VNC : Valeur Nette Comptable (Valeur brute - Amortissements cumulés)',
    '• Dotation N : Dotation aux amortissements de l\'exercice N',
    '• Méthode : Amortissement linéaire selon durées d\'usage fiscales',
  ];

  let y = finalY + 15;
  notes.forEach((note) => {
    doc.text(note, 14, y);
    y += 5;
  });
}

/**
 * PAGES 6-8: Annexes - État des créances et dettes
 */
export function addAnnexesCreancesDettes(
  doc: jsPDF,
  creances: CreanceDette[],
  dettes: CreanceDette[],
  year: number
): void {
  doc.addPage();

  doc.setFontSize(16);
  doc.setTextColor(...COLORS.dark);
  doc.setFont('helvetica', 'bold');
  doc.text('ANNEXE 2 - ÉTAT DES CRÉANCES ET DETTES', 14, 20);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.gray);
  doc.text(`Exercice ${year} - Échéancier (en euros)`, 14, 27);

  // État des créances
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.dark);
  doc.text('CRÉANCES', 14, 40);

  autoTable(doc, {
    head: [['Nature', '< 1 an', '> 1 an', 'Total']],
    body: creances.map((c) => [
      c.nature,
      formatEuro(c.moins1An),
      formatEuro(c.plus1An),
      formatEuro(c.total),
    ]),
    foot: [[
      'TOTAL CRÉANCES',
      formatEuro(creances.reduce((sum, c) => sum + c.moins1An, 0)),
      formatEuro(creances.reduce((sum, c) => sum + c.plus1An, 0)),
      formatEuro(creances.reduce((sum, c) => sum + c.total, 0)),
    ]],
    startY: 45,
    margin: { left: 14, right: 14 },
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [34, 197, 94], textColor: [255, 255, 255], fontStyle: 'bold' },
    footStyles: { fillColor: COLORS.lightGray, fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { halign: 'right', cellWidth: 40 },
      2: { halign: 'right', cellWidth: 40 },
      3: { halign: 'right', cellWidth: 40 },
    },
  });

  const creancesY = (doc as any).lastAutoTable.finalY;

  // État des dettes
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.dark);
  doc.text('DETTES', 14, creancesY + 15);

  autoTable(doc, {
    head: [['Nature', '< 1 an', '> 1 an', 'Total']],
    body: dettes.map((d) => [
      d.nature,
      formatEuro(d.moins1An),
      formatEuro(d.plus1An),
      formatEuro(d.total),
    ]),
    foot: [[
      'TOTAL DETTES',
      formatEuro(dettes.reduce((sum, d) => sum + d.moins1An, 0)),
      formatEuro(dettes.reduce((sum, d) => sum + d.plus1An, 0)),
      formatEuro(dettes.reduce((sum, d) => sum + d.total, 0)),
    ]],
    startY: creancesY + 20,
    margin: { left: 14, right: 14 },
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [239, 68, 68], textColor: [255, 255, 255], fontStyle: 'bold' },
    footStyles: { fillColor: COLORS.lightGray, fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { halign: 'right', cellWidth: 40 },
      2: { halign: 'right', cellWidth: 40 },
      3: { halign: 'right', cellWidth: 40 },
    },
  });
}

/**
 * PAGES 9-10: TVA détaillée par mois
 */
export function addTVAMensuelle(doc: jsPDF, tvaMensuelle: TVAMensuelle[], year: number): void {
  doc.addPage();

  doc.setFontSize(16);
  doc.setTextColor(...COLORS.dark);
  doc.setFont('helvetica', 'bold');
  doc.text('DÉCLARATIONS TVA - DÉTAIL MENSUEL', 14, 20);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.gray);
  doc.text(`Exercice ${year} - Taux normal 20% (en euros)`, 14, 27);

  autoTable(doc, {
    head: [['Mois', 'Base HT', 'TVA 20%', 'TVA déductible', 'TVA nette']],
    body: tvaMensuelle.map((tva) => [
      tva.mois,
      formatEuro(tva.baseHT),
      formatEuro(tva.tva20),
      formatEuro(tva.tvaDeductible),
      formatEuro(tva.tvaNette),
    ]),
    foot: [[
      'TOTAL ANNUEL',
      formatEuro(tvaMensuelle.reduce((sum, t) => sum + t.baseHT, 0)),
      formatEuro(tvaMensuelle.reduce((sum, t) => sum + t.tva20, 0)),
      formatEuro(tvaMensuelle.reduce((sum, t) => sum + t.tvaDeductible, 0)),
      formatEuro(tvaMensuelle.reduce((sum, t) => sum + t.tvaNette, 0)),
    ]],
    startY: 35,
    margin: { left: 14, right: 14 },
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: COLORS.primary, textColor: [255, 255, 255], fontStyle: 'bold' },
    footStyles: { fillColor: COLORS.lightGray, fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { halign: 'right', cellWidth: 40 },
      2: { halign: 'right', cellWidth: 35 },
      3: { halign: 'right', cellWidth: 40 },
      4: { halign: 'right', cellWidth: 35 },
    },
  });

  const finalY = (doc as any).lastAutoTable.finalY;

  // Régularisations
  doc.addPage();
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.dark);
  doc.text('RÉGULARISATIONS TVA', 14, 20);

  const regularisations = [
    { libelle: 'TVA sur immobilisations', montant: 0 },
    { libelle: 'Coefficient de déduction', montant: 0 },
    { libelle: 'Crédit de TVA reportable', montant: 0 },
    { libelle: 'Remboursement demandé', montant: 0 },
  ];

  autoTable(doc, {
    head: [['Désignation', 'Montant (€)']],
    body: regularisations.map((r) => [r.libelle, formatEuro(r.montant)]),
    startY: 30,
    margin: { left: 14, right: 14 },
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: COLORS.secondary, textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 120 },
      1: { halign: 'right', cellWidth: 60 },
    },
  });
}

/**
 * PAGES 11-12: Ratios financiers
 */
export function addRatiosFinanciers(doc: jsPDF, ratios: Ratios, year: number): void {
  doc.addPage();

  doc.setFontSize(16);
  doc.setTextColor(...COLORS.dark);
  doc.setFont('helvetica', 'bold');
  doc.text('RATIOS FINANCIERS - ANALYSE DE PERFORMANCE', 14, 20);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.gray);
  doc.text(`Exercice ${year} - Indicateurs clés`, 14, 27);

  // Ratios de liquidité
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.dark);
  doc.text('RATIOS DE LIQUIDITÉ', 14, 40);

  autoTable(doc, {
    head: [['Ratio', 'Valeur', 'Interprétation']],
    body: [
      [
        'Liquidité générale',
        ratios.liquiditeGenerale.toFixed(2),
        ratios.liquiditeGenerale >= 1 ? '✓ Bon' : '⚠ À surveiller',
      ],
      [
        'Liquidité réduite',
        ratios.liquiditeReduite.toFixed(2),
        ratios.liquiditeReduite >= 0.7 ? '✓ Bon' : '⚠ À surveiller',
      ],
    ],
    startY: 45,
    margin: { left: 14, right: 14 },
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [34, 197, 94], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { halign: 'right', cellWidth: 40 },
      2: { halign: 'center', cellWidth: 60 },
    },
  });

  const liquiditeY = (doc as any).lastAutoTable.finalY;

  // Ratios de solvabilité
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.dark);
  doc.text('RATIOS DE SOLVABILITÉ', 14, liquiditeY + 15);

  autoTable(doc, {
    head: [['Ratio', 'Valeur', 'Interprétation']],
    body: [
      [
        'Autonomie financière',
        `${ratios.autonomieFinanciere.toFixed(1)} %`,
        ratios.autonomieFinanciere >= 30 ? '✓ Bon' : '⚠ À améliorer',
      ],
      [
        'Capacité de remboursement',
        `${ratios.capaciteRemboursement.toFixed(1)} ans`,
        ratios.capaciteRemboursement <= 3 ? '✓ Bon' : '⚠ À surveiller',
      ],
    ],
    startY: liquiditeY + 20,
    margin: { left: 14, right: 14 },
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { halign: 'right', cellWidth: 40 },
      2: { halign: 'center', cellWidth: 60 },
    },
  });

  const solvabiliteY = (doc as any).lastAutoTable.finalY;

  // Ratios de rentabilité
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.dark);
  doc.text('RATIOS DE RENTABILITÉ', 14, solvabiliteY + 15);

  autoTable(doc, {
    head: [['Ratio', 'Valeur', 'Interprétation']],
    body: [
      [
        'ROE (Return on Equity)',
        `${ratios.roe.toFixed(1)} %`,
        ratios.roe >= 10 ? '✓ Excellent' : ratios.roe >= 5 ? '✓ Bon' : '⚠ Faible',
      ],
      [
        'ROA (Return on Assets)',
        `${ratios.roa.toFixed(1)} %`,
        ratios.roa >= 5 ? '✓ Excellent' : ratios.roa >= 2 ? '✓ Bon' : '⚠ Faible',
      ],
      [
        'Marge nette',
        `${ratios.margeNette.toFixed(1)} %`,
        ratios.margeNette >= 10 ? '✓ Excellent' : ratios.margeNette >= 5 ? '✓ Bon' : '⚠ Faible',
      ],
    ],
    startY: solvabiliteY + 20,
    margin: { left: 14, right: 14 },
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: COLORS.primary, textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { halign: 'right', cellWidth: 40 },
      2: { halign: 'center', cellWidth: 60 },
    },
  });

  // Explications
  const rentabiliteY = (doc as any).lastAutoTable.finalY;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.gray);
  const explications = [
    'ROE = Résultat Net / Capitaux Propres × 100',
    'ROA = Résultat Net / Total Actif × 100',
    'Marge nette = Résultat Net / CA × 100',
    'Liquidité générale = Actif circulant / Dettes court terme',
    'Autonomie financière = Capitaux propres / Total bilan × 100',
  ];

  let y = rentabiliteY + 10;
  explications.forEach((exp) => {
    doc.text(`• ${exp}`, 14, y);
    y += 4;
  });
}

/**
 * PAGE 16: Notes et méthodes comptables
 */
export function addNotesMethodes(doc: jsPDF, engagements: string[], effectif: number, year: number): void {
  doc.addPage();

  doc.setFontSize(16);
  doc.setTextColor(...COLORS.dark);
  doc.setFont('helvetica', 'bold');
  doc.text('NOTES ANNEXES ET MÉTHODES COMPTABLES', 14, 20);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.gray);
  doc.text(`Exercice ${year}`, 14, 27);

  let y = 40;

  // 1. Règles et méthodes comptables
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.dark);
  doc.text('1. RÈGLES ET MÉTHODES COMPTABLES', 14, y);
  y += 8;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const regles = [
    'Principes généraux: Les comptes annuels sont établis conformément aux règles générales',
    'd\'établissement et de présentation des comptes annuels (PCG - Plan Comptable Général).',
    '',
    'Immobilisations: Valorisées au coût d\'acquisition. Amortissement linéaire selon',
    'les durées d\'usage fiscales (logiciels: 3 ans, matériel: 3-5 ans, mobilier: 10 ans).',
    '',
    'Stocks: Valorisés au coût d\'acquisition selon la méthode FIFO (premier entré, premier sorti).',
    '',
    'Créances: Valorisées à leur valeur nominale. Provision pour dépréciation si nécessaire.',
    '',
    'Produits: Comptabilisés au moment de la livraison ou de la réalisation de la prestation.',
  ];

  regles.forEach((regle) => {
    doc.text(regle, 14, y);
    y += 4;
  });

  y += 5;

  // 2. Faits caractéristiques
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.dark);
  doc.text('2. FAITS CARACTÉRISTIQUES DE L\'EXERCICE', 14, y);
  y += 8;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`L'exercice ${year} s'est déroulé dans un contexte de croissance soutenue.`, 14, y);
  y += 5;
  doc.text('Aucun événement majeur à signaler.', 14, y);
  y += 10;

  // 3. Engagements hors bilan
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.dark);
  doc.text('3. ENGAGEMENTS HORS BILAN', 14, y);
  y += 8;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  if (engagements.length > 0) {
    engagements.forEach((eng) => {
      doc.text(`• ${eng}`, 14, y);
      y += 5;
    });
  } else {
    doc.text('Aucun engagement hors bilan à signaler.', 14, y);
    y += 5;
  }

  y += 5;

  // 4. Effectif moyen
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.dark);
  doc.text('4. EFFECTIF MOYEN', 14, y);
  y += 8;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Effectif moyen de l'exercice: ${effectif} salarié(s) en équivalent temps plein.`, 14, y);
  y += 10;

  // 5. Événements postérieurs à la clôture
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.dark);
  doc.text('5. ÉVÉNEMENTS POSTÉRIEURS À LA CLÔTURE', 14, y);
  y += 8;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Aucun événement postérieur à la clôture susceptible d\'avoir', 14, y);
  y += 4;
  doc.text('une incidence significative sur les comptes.', 14, y);
}
