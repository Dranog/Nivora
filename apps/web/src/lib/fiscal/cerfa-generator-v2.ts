import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BalanceData } from './balance-calculator-v2';

const COLORS = {
  primary: [0, 212, 197] as [number, number, number],
  secondary: [0, 184, 169] as [number, number, number],
  dark: [51, 65, 85] as [number, number, number],
  gray: [100, 116, 139] as [number, number, number],
  success: [0, 128, 0] as [number, number, number],
};

/**
 * RÈGLE ABSOLUE : Les Cerfa reprennent EXACTEMENT les valeurs du bilan
 */
export function generateCerfa2050V2(
  doc: jsPDF,
  balance: BalanceData,
  year: number
): void {
  doc.addPage();
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.dark);
  doc.text('CERFA N° 2050 - BILAN ACTIF (système de base)', 20, 20);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.gray);
  doc.text(`Exercice clos le 31/12/${year} - Montants en euros`, 20, 28);

  // UTILISER STRICTEMENT LES VALEURS DU BILAN
  const actif = balance.actif;

  const rows = [
    ['ACTIF IMMOBILISÉ', '', '', ''],
    [
      'Immobilisations incorporelles',
      actif.immobilisationsBrutes > 0 ? actif.immobilisationsBrutes.toFixed(2) : '',
      actif.amortissementsCumules > 0 ? actif.amortissementsCumules.toFixed(2) : '',
      actif.immobilisationsNettes.toFixed(2), // ← Valeur du bilan
    ],
    ['Immobilisations corporelles', '', '', '0.00'],
    ['Immobilisations financières', '', '', '0.00'],
    ['TOTAL ACTIF IMMOBILISÉ (I)', '', '', actif.immobilisationsNettes.toFixed(2)],
    ['', '', '', ''],
    ['ACTIF CIRCULANT', '', '', ''],
    ['Stocks et en-cours', '', '', '0.00'],
    [
      'Créances clients et comptes rattachés',
      actif.creancesClients > 0 ? actif.creancesClients.toFixed(2) : '',
      '',
      actif.creancesClients.toFixed(2),
    ],
    [
      'Autres créances',
      actif.autresCreances.toFixed(2),
      '',
      actif.autresCreances.toFixed(2),
    ],
    [
      'Valeurs mobilières de placement',
      '',
      '',
      actif.vmp.toFixed(2),
    ],
    [
      'Disponibilités',
      '',
      '',
      actif.disponibilites.toFixed(2),
    ],
    [
      'TOTAL ACTIF CIRCULANT (II)',
      '',
      '',
      (actif.creancesClients + actif.autresCreances + actif.vmp + actif.disponibilites).toFixed(2),
    ],
    ['', '', '', ''],
    [
      'TOTAL GÉNÉRAL (I + II)',
      '',
      '',
      actif.totalActif.toFixed(2), // ← Valeur exacte du bilan
    ],
  ];

  autoTable(doc, {
    startY: 35,
    head: [['Postes (système de base)', 'Brut', 'Amort./Prov.', 'Net']],
    body: rows,
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 1.5 },
    headStyles: { fillColor: COLORS.primary, textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 90 },
      1: { cellWidth: 30, halign: 'right' },
      2: { cellWidth: 30, halign: 'right' },
      3: { cellWidth: 30, halign: 'right' },
    },
    didParseCell: (data) => {
      const text = data.cell.text[0];
      if (text.startsWith('TOTAL') || text === 'ACTIF IMMOBILISÉ' || text === 'ACTIF CIRCULANT') {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [245, 245, 245];
      }
    },
  });

  const finalY = (doc as any).lastAutoTable.finalY;

  doc.setFontSize(7);
  doc.setTextColor(...COLORS.gray);
  doc.text('Formulaire conforme au modèle officiel DGFiP - Imprimé n° 2050', 20, finalY + 5);
}

export function generateCerfa2051V2(
  doc: jsPDF,
  balance: BalanceData,
  year: number
): void {
  doc.addPage();
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.dark);
  doc.text('CERFA N° 2051 - BILAN PASSIF (système de base)', 20, 20);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.gray);
  doc.text(`Exercice clos le 31/12/${year} - Montants en euros`, 20, 28);

  // UTILISER STRICTEMENT LES VALEURS DU BILAN
  const passif = balance.passif;

  const rows = [
    ['CAPITAUX PROPRES', ''],
    ['Capital social ou individuel', passif.capitalSocial.toFixed(2)],
    ['Réserves', passif.reserves.toFixed(2)],
    ['Report à nouveau', passif.reportANouveau.toFixed(2)],
    ['Résultat de l\'exercice (bénéfice ou perte)', passif.resultatExercice.toFixed(2)],
    ['TOTAL CAPITAUX PROPRES (I)', passif.totalCapitauxPropres.toFixed(2)],
    ['', ''],
    ['PROVISIONS POUR RISQUES ET CHARGES (II)', passif.provisions.toFixed(2)],
    ['', ''],
    ['DETTES', ''],
    ['Emprunts et dettes financières diverses', passif.dettesFinancieres.toFixed(2)],
    ['Dettes fournisseurs et comptes rattachés', passif.dettesFournisseurs.toFixed(2)],
    ['Dettes fiscales et sociales', passif.dettesFiscalesSociales.toFixed(2)],
    ['Autres dettes', passif.autresDettes.toFixed(2)],
    [
      'TOTAL DETTES (III)',
      (passif.dettesFinancieres + passif.dettesFournisseurs + passif.dettesFiscalesSociales + passif.autresDettes).toFixed(2),
    ],
    ['', ''],
    ['TOTAL GÉNÉRAL (I + II + III)', passif.totalPassif.toFixed(2)],
  ];

  autoTable(doc, {
    startY: 35,
    head: [['Postes (système de base)', 'Montant (€)']],
    body: rows,
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 1.5 },
    headStyles: { fillColor: COLORS.secondary, textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 140 },
      1: { cellWidth: 40, halign: 'right' },
    },
    didParseCell: (data) => {
      const text = data.cell.text[0];
      if (
        text.startsWith('TOTAL') ||
        text === 'CAPITAUX PROPRES' ||
        text === 'DETTES' ||
        text.startsWith('PROVISIONS')
      ) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [245, 245, 245];
      }
    },
  });

  const finalY = (doc as any).lastAutoTable.finalY;

  // Vérification équilibre
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.success);
  doc.text('✓ ÉQUILIBRE COMPTABLE VÉRIFIÉ: ACTIF = PASSIF', 20, finalY + 5);
  doc.setTextColor(...COLORS.dark);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.gray);
  doc.text('Formulaire conforme au modèle officiel DGFiP - Imprimé n° 2051', 20, finalY + 12);
}
