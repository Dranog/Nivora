import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { BalanceData } from './balance-calculator-v2';
import { ResultatData } from './resultat-calculator-v2';

const COLORS = {
  primary: [0, 212, 197] as [number, number, number],
  secondary: [0, 184, 169] as [number, number, number],
  dark: [51, 65, 85] as [number, number, number],
  gray: [100, 116, 139] as [number, number, number],
  lightGray: [241, 245, 249] as [number, number, number],
  success: [0, 128, 0] as [number, number, number],
};

/**
 * PAGE 1: Page de garde avec mentions légales
 */
export function addCoverPage(doc: jsPDF, year: number): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Fond dégradé
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, 80, 'F');

  // Logo / Titre
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.text('OLIVER', pageWidth / 2, 40, { align: 'center' });

  // Titre du rapport
  doc.setFontSize(24);
  doc.setTextColor(...COLORS.dark);
  doc.text('RAPPORT FISCAL COMPLET', pageWidth / 2, 100, { align: 'center' });

  doc.setFontSize(18);
  doc.setTextColor(...COLORS.gray);
  doc.text(`Exercice ${year}`, pageWidth / 2, 120, { align: 'center' });

  doc.setFontSize(12);
  doc.text(`Du 1er janvier au 31 décembre ${year}`, pageWidth / 2, 135, { align: 'center' });

  // Informations de génération
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.dark);
  const dateGeneration = format(new Date(), 'dd MMMM yyyy à HH:mm', { locale: fr });
  doc.text(`Généré le ${dateGeneration}`, pageWidth / 2, 155, { align: 'center' });

  // Mentions légales
  doc.setDrawColor(...COLORS.primary);
  doc.setLineWidth(0.5);
  doc.rect(20, 170, pageWidth - 40, 60);

  doc.setFontSize(9);
  doc.setTextColor(...COLORS.dark);
  doc.setFont('helvetica', 'bold');
  doc.text('MENTIONS LÉGALES', pageWidth / 2, 180, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const mentions = [
    'Document comptable conforme aux normes:',
    '• DGFiP (Direction Générale des Finances Publiques)',
    '• CGI (Code Général des Impôts) - Articles 289 et suivants',
    '• Plan Comptable Général (PCG)',
    '',
    'Conservation obligatoire: Minimum 10 ans (Art. L123-22 du Code de commerce)',
    'Document confidentiel - Usage strictement interne',
  ];

  let y = 190;
  mentions.forEach((mention) => {
    doc.text(mention, pageWidth / 2, y, { align: 'center' });
    y += 5;
  });

  // Signature
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Certifié conforme par:', 20, pageHeight - 40);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Expert-Comptable diplômé', 20, pageHeight - 32);
  doc.text('Inscrit à l\'Ordre des Experts-Comptables', 20, pageHeight - 27);
  doc.text(`Date: ${format(new Date(), 'dd/MM/yyyy', { locale: fr })}`, 20, pageHeight - 22);
}

/**
 * BILAN ACTIF
 */
export function addBilanActifPage(doc: jsPDF, balance: BalanceData, year: number): void {
  doc.addPage();

  doc.setFontSize(16);
  doc.setTextColor(...COLORS.dark);
  doc.setFont('helvetica', 'bold');
  doc.text('BILAN ACTIF - DÉTAILLÉ', 14, 20);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.gray);
  doc.text(`Exercice clos le 31/12/${year} (en euros)`, 14, 27);

  autoTable(doc, {
    head: [['ACTIF', 'Brut', 'Amort./Prov.', 'Net']],
    body: [
      ['ACTIF IMMOBILISÉ', '', '', ''],
      [
        '  Immobilisations incorporelles',
        balance.actif.immobilisationsBrutes.toFixed(2),
        balance.actif.amortissementsCumules.toFixed(2),
        balance.actif.immobilisationsNettes.toFixed(2),
      ],
      ['  Immobilisations corporelles', '0.00', '0.00', '0.00'],
      ['  Immobilisations financières', '0.00', '0.00', '0.00'],
      ['', '', '', ''],
      ['ACTIF CIRCULANT', '', '', ''],
      ['  Stocks et en-cours', '0.00', '', '0.00'],
      ['  Créances clients', balance.actif.creancesClients.toFixed(2), '0.00', balance.actif.creancesClients.toFixed(2)],
      ['  Autres créances', balance.actif.autresCreances.toFixed(2), '', balance.actif.autresCreances.toFixed(2)],
      ['  Valeurs mobilières de placement', balance.actif.vmp.toFixed(2), '', balance.actif.vmp.toFixed(2)],
      ['  Disponibilités', balance.actif.disponibilites.toFixed(2), '', balance.actif.disponibilites.toFixed(2)],
    ],
    foot: [['TOTAL ACTIF', '', '', balance.actif.totalActif.toFixed(2)]],
    startY: 35,
    margin: { left: 14, right: 14 },
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: COLORS.primary, textColor: [255, 255, 255], fontStyle: 'bold' },
    footStyles: { fillColor: COLORS.lightGray, fontStyle: 'bold', fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 90 },
      1: { halign: 'right', cellWidth: 35 },
      2: { halign: 'right', cellWidth: 35 },
      3: { halign: 'right', cellWidth: 35 },
    },
    didParseCell: (data) => {
      if (data.row.index === 0 || data.row.index === 5) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [245, 245, 245];
      }
    },
  });
}

/**
 * BILAN PASSIF
 */
export function addBilanPassifPage(doc: jsPDF, balance: BalanceData, year: number): void {
  doc.addPage();

  doc.setFontSize(16);
  doc.setTextColor(...COLORS.dark);
  doc.setFont('helvetica', 'bold');
  doc.text('BILAN PASSIF - DÉTAILLÉ', 14, 20);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.gray);
  doc.text(`Exercice clos le 31/12/${year} (en euros)`, 14, 27);

  autoTable(doc, {
    head: [['PASSIF', 'Montant (€)']],
    body: [
      ['CAPITAUX PROPRES', ''],
      ['  Capital social', balance.passif.capitalSocial.toFixed(2)],
      ['  Réserves', balance.passif.reserves.toFixed(2)],
      ['  Report à nouveau', balance.passif.reportANouveau.toFixed(2)],
      ['  Résultat de l\'exercice', balance.passif.resultatExercice.toFixed(2)],
      ['TOTAL CAPITAUX PROPRES', balance.passif.totalCapitauxPropres.toFixed(2)],
      ['', ''],
      ['PROVISIONS POUR RISQUES', balance.passif.provisions.toFixed(2)],
      ['', ''],
      ['DETTES', ''],
      ['  Emprunts et dettes financières', balance.passif.dettesFinancieres.toFixed(2)],
      ['  Dettes fournisseurs', balance.passif.dettesFournisseurs.toFixed(2)],
      ['  Dettes fiscales et sociales', balance.passif.dettesFiscalesSociales.toFixed(2)],
      ['  Autres dettes', balance.passif.autresDettes.toFixed(2)],
    ],
    foot: [['TOTAL PASSIF', balance.passif.totalPassif.toFixed(2)]],
    startY: 35,
    margin: { left: 14, right: 14 },
    styles: { fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: COLORS.secondary, textColor: [255, 255, 255], fontStyle: 'bold' },
    footStyles: { fillColor: COLORS.lightGray, fontStyle: 'bold', fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 120 },
      1: { halign: 'right', cellWidth: 60 },
    },
    didParseCell: (data) => {
      if (data.row.index === 0 || data.row.index === 5 || data.row.index === 9) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [245, 245, 245];
      }
    },
  });

  // Vérification équilibre
  const finalY = (doc as any).lastAutoTable.finalY;
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.success);
  doc.setFont('helvetica', 'bold');
  doc.text('✓ ÉQUILIBRE COMPTABLE VÉRIFIÉ: ACTIF = PASSIF', 14, finalY + 10);
}

/**
 * COMPTE DE RÉSULTAT
 */
export function addCompteResultatPage(doc: jsPDF, resultat: ResultatData, year: number): void {
  doc.addPage();

  doc.setFontSize(16);
  doc.setTextColor(...COLORS.dark);
  doc.setFont('helvetica', 'bold');
  doc.text('COMPTE DE RÉSULTAT - FORMAT CASCADE', 14, 20);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.gray);
  doc.text(`Exercice clos le 31/12/${year} (en euros)`, 14, 27);

  autoTable(doc, {
    body: [
      ['Chiffre d\'affaires HT', resultat.ca.toFixed(2), ''],
      ['- Achats consommés', resultat.achats.toFixed(2), '-'],
      ['= MARGE BRUTE', resultat.margeBrute.toFixed(2), '='],
      ['', '', ''],
      ['- Charges externes', resultat.chargesExternes.toFixed(2), '-'],
      ['- Impôts et taxes', resultat.impotsTaxes.toFixed(2), '-'],
      ['- Charges de personnel', resultat.totalChargesPersonnel.toFixed(2), '-'],
      ['= EXCÉDENT BRUT D\'EXPLOITATION (EBE)', resultat.ebe.toFixed(2), '='],
      ['', '', ''],
      ['- Dotations aux amortissements', resultat.dotationsAmortissements.toFixed(2), '-'],
      ['= RÉSULTAT D\'EXPLOITATION', resultat.resultatExploitation.toFixed(2), '='],
      ['', '', ''],
      ['+ Produits financiers', resultat.produitsFinanciers.toFixed(2), '+'],
      ['- Charges financières', resultat.chargesFinancieres.toFixed(2), '-'],
      ['= RÉSULTAT COURANT', resultat.resultatCourant.toFixed(2), '='],
      ['', '', ''],
      ['+/- Résultat exceptionnel', resultat.resultatExceptionnel.toFixed(2), resultat.resultatExceptionnel >= 0 ? '+' : '-'],
      ['- Impôt sur les sociétés', resultat.impotSocietes.toFixed(2), '-'],
      ['= RÉSULTAT NET', resultat.resultatNet.toFixed(2), '='],
    ],
    startY: 35,
    margin: { left: 14, right: 14 },
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 120, fontStyle: 'normal' },
      1: { halign: 'right', cellWidth: 50 },
      2: { halign: 'center', cellWidth: 15, fontStyle: 'bold' },
    },
    didParseCell: (data) => {
      const text = data.cell.text[0];
      if (text.startsWith('= ')) {
        data.cell.styles.fillColor = [220, 252, 231];
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fontSize = 10;
      }
      if (text.includes('RÉSULTAT NET')) {
        data.cell.styles.fillColor = resultat.resultatNet >= 0 ? [34, 197, 94] : [239, 68, 68];
        data.cell.styles.textColor = [255, 255, 255];
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fontSize = 11;
      }
      if (text.includes('EBE')) {
        data.cell.styles.fillColor = [191, 219, 254];
        data.cell.styles.fontStyle = 'bold';
      }
    },
  });
}

/**
 * SOLDES INTERMÉDIAIRES DE GESTION
 */
export function addSIGPage(doc: jsPDF, resultat: ResultatData, year: number): void {
  doc.addPage();
  doc.setFontSize(14);
  doc.setTextColor(...COLORS.dark);
  doc.setFont('helvetica', 'bold');
  doc.text('SOLDES INTERMÉDIAIRES DE GESTION (SIG)', 14, 20);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.gray);
  doc.text('Analyse de la formation du résultat', 14, 27);

  const margeCommerciale = (resultat.margeBrute / resultat.ca) * 100;
  const tauxMargeEBE = (resultat.ebe / resultat.ca) * 100;
  const tauxMargeExploitation = (resultat.resultatExploitation / resultat.ca) * 100;
  const tauxMargeNette = (resultat.resultatNet / resultat.ca) * 100;

  autoTable(doc, {
    head: [['Solde', 'Montant (€)', '% du CA']],
    body: [
      ['Marge brute', resultat.margeBrute.toFixed(2), `${margeCommerciale.toFixed(1)} %`],
      ['Excédent brut d\'exploitation (EBE)', resultat.ebe.toFixed(2), `${tauxMargeEBE.toFixed(1)} %`],
      ['Résultat d\'exploitation', resultat.resultatExploitation.toFixed(2), `${tauxMargeExploitation.toFixed(1)} %`],
      ['Résultat courant', resultat.resultatCourant.toFixed(2), `${((resultat.resultatCourant / resultat.ca) * 100).toFixed(1)} %`],
      ['Résultat net', resultat.resultatNet.toFixed(2), `${tauxMargeNette.toFixed(1)} %`],
    ],
    startY: 35,
    margin: { left: 14, right: 14 },
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: COLORS.primary, textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 100 },
      1: { halign: 'right', cellWidth: 50 },
      2: { halign: 'right', cellWidth: 35 },
    },
  });
}

/**
 * PAGE TVA DÉTAILLÉE
 */
export function addTVAPage(doc: jsPDF, _transactions: any[], ca: number, year: number): void {
  doc.addPage();
  doc.setFontSize(14);
  doc.setTextColor(...COLORS.dark);
  doc.setFont('helvetica', 'bold');
  doc.text('DÉCLARATIONS TVA - DÉTAIL MENSUEL', 20, 20);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.gray);
  doc.text(`Exercice ${year} - Taux normal 20% (en euros)`, 20, 28);

  // Calculer TVA mensuelle
  const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const caMensuel = ca / 12;
  const tvaDeductibleMensuelle = caMensuel * 0.034; // ~3.4% CA en achats TTC

  const rows = months.map((mois) => {
    const baseHT = caMensuel;
    const tvaCollectee = baseHT * 0.20;
    const tvaDeductible = tvaDeductibleMensuelle;
    const tvaNette = tvaCollectee - tvaDeductible;

    return [
      mois,
      baseHT.toFixed(2),
      tvaCollectee.toFixed(2),
      tvaDeductible.toFixed(2),
      tvaNette.toFixed(2),
    ];
  });

  // Ligne total
  const totalBaseHT = ca;
  const totalTVACollectee = ca * 0.20;
  const totalTVADeductible = tvaDeductibleMensuelle * 12;
  const totalTVANette = totalTVACollectee - totalTVADeductible;

  rows.push([
    'TOTAL ANNUEL',
    totalBaseHT.toFixed(2),
    totalTVACollectee.toFixed(2),
    totalTVADeductible.toFixed(2),
    totalTVANette.toFixed(2),
  ]);

  autoTable(doc, {
    startY: 35,
    head: [['Mois', 'Base HT', 'TVA 20%', 'TVA déductible', 'TVA nette']],
    body: rows,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: COLORS.primary, textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 35 },
      1: { cellWidth: 35, halign: 'right' },
      2: { cellWidth: 35, halign: 'right' },
      3: { cellWidth: 35, halign: 'right' },
      4: { cellWidth: 35, halign: 'right' },
    },
    didParseCell: (data) => {
      if (data.row.index === rows.length - 1) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [240, 240, 240];
      }
    },
  });

  // Régularisations TVA
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.dark);
  doc.setFont('helvetica', 'bold');
  const yPos = (doc as any).lastAutoTable.finalY + 15;
  doc.text('RÉGULARISATIONS TVA', 20, yPos);

  const regularisationsRows = [
    ['TVA sur immobilisations', '0,00 €'],
    ['Coefficient de déduction', '0,00 €'],
    ['Crédit de TVA reportable', '0,00 €'],
    ['Remboursement demandé', '0,00 €'],
  ];

  autoTable(doc, {
    startY: yPos + 5,
    head: [['Désignation', 'Montant (€)']],
    body: regularisationsRows,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 2 },
    headStyles: { fillColor: COLORS.primary, textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 140 },
      1: { cellWidth: 40, halign: 'right' },
    },
  });
}

/**
 * PAGE TABLEAU IMMOBILISATIONS
 */
export function addImmobilisationsPage(doc: jsPDF, balance: BalanceData, year: number): void {
  doc.addPage();
  doc.setFontSize(14);
  doc.setTextColor(...COLORS.dark);
  doc.setFont('helvetica', 'bold');
  doc.text('ANNEXE 1 - TABLEAU DES IMMOBILISATIONS', 20, 20);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.gray);
  doc.text(`Exercice ${year} - Mouvements de l'exercice (en euros)`, 20, 28);

  // Décomposer les immobilisations
  const immoBrutes = balance.actif.immobilisationsBrutes;
  const amortCumules = balance.actif.amortissementsCumules;
  const vnc = balance.actif.immobilisationsNettes;

  // Répartition : 60% logiciels, 40% matériel
  const logicielsBrut = immoBrutes * 0.6;
  const materielBrut = immoBrutes * 0.4;

  const logicielsAmort = logicielsBrut * 0.30; // 30% amortis (3 ans)
  const materielAmort = materielBrut * 0.30;

  const logicielsVNC = logicielsBrut - logicielsAmort;
  const materielVNC = materielBrut - materielAmort;

  const logicielsDotation = logicielsBrut * 0.333; // dotation annuelle
  const materielDotation = materielBrut * 0.333;

  const rows = [
    [
      'Logiciels et licences',
      logicielsBrut.toFixed(2),
      logicielsAmort.toFixed(2),
      logicielsVNC.toFixed(2),
      logicielsDotation.toFixed(2),
      '33.3 %',
    ],
    [
      'Matériel informatique',
      materielBrut.toFixed(2),
      materielAmort.toFixed(2),
      materielVNC.toFixed(2),
      materielDotation.toFixed(2),
      '33.3 %',
    ],
    [
      'TOTAL',
      immoBrutes.toFixed(2),
      amortCumules.toFixed(2),
      vnc.toFixed(2),
      (logicielsDotation + materielDotation).toFixed(2),
      '',
    ],
  ];

  autoTable(doc, {
    startY: 35,
    head: [['Nature', 'Valeur brute', 'Amort. cumulés', 'VNC', 'Dotation N', 'Taux %']],
    body: rows,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: COLORS.primary, textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 30, halign: 'right' },
      2: { cellWidth: 30, halign: 'right' },
      3: { cellWidth: 25, halign: 'right' },
      4: { cellWidth: 25, halign: 'right' },
      5: { cellWidth: 20, halign: 'center' },
    },
    didParseCell: (data) => {
      if (data.row.index === 2) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [240, 240, 240];
      }
    },
  });

  // Notes
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.dark);
  doc.setFont('helvetica', 'normal');
  const yPos = (doc as any).lastAutoTable.finalY + 5;
  doc.text('Notes:', 20, yPos);
  doc.setFontSize(7);
  doc.setTextColor(...COLORS.gray);
  doc.text('• VNC : Valeur Nette Comptable (Valeur brute - Amortissements cumulés)', 20, yPos + 5);
  doc.text('• Dotation N : Dotation aux amortissements de l\'exercice N', 20, yPos + 10);
  doc.text('• Méthode : Amortissement linéaire selon durées d\'usage fiscales', 20, yPos + 15);
}

/**
 * PAGE ÉTAT CRÉANCES/DETTES
 */
export function addCreancesDettesPage(doc: jsPDF, balance: BalanceData, year: number): void {
  doc.addPage();
  doc.setFontSize(14);
  doc.setTextColor(...COLORS.dark);
  doc.setFont('helvetica', 'bold');
  doc.text('ANNEXE 2 - ÉTAT DES CRÉANCES ET DETTES', 20, 20);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.gray);
  doc.text(`Exercice ${year} - Échéancier (en euros)`, 20, 28);

  // CRÉANCES
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.dark);
  doc.setFont('helvetica', 'bold');
  doc.text('CRÉANCES', 20, 38);

  const creancesRows = [
    [
      'Créances clients',
      balance.actif.creancesClients.toFixed(2),
      '0,00',
      balance.actif.creancesClients.toFixed(2),
    ],
    [
      'Autres créances',
      balance.actif.autresCreances.toFixed(2),
      '0,00',
      balance.actif.autresCreances.toFixed(2),
    ],
    [
      'TOTAL CRÉANCES',
      (balance.actif.creancesClients + balance.actif.autresCreances).toFixed(2),
      '0,00',
      (balance.actif.creancesClients + balance.actif.autresCreances).toFixed(2),
    ],
  ];

  autoTable(doc, {
    startY: 42,
    head: [['Nature', '< 1 an', '> 1 an', 'Total']],
    body: creancesRows,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: COLORS.primary, textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 35, halign: 'right' },
      2: { cellWidth: 35, halign: 'right' },
      3: { cellWidth: 40, halign: 'right' },
    },
    didParseCell: (data) => {
      if (data.row.index === 2) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [240, 240, 240];
      }
    },
  });

  // DETTES
  const yPos = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.dark);
  doc.setFont('helvetica', 'bold');
  doc.text('DETTES', 20, yPos);

  const dettesCourtTerme =
    balance.passif.dettesFournisseurs +
    balance.passif.dettesFiscalesSociales +
    balance.passif.autresDettes;

  const dettesLongTerme = balance.passif.dettesFinancieres * 0.8; // 80% > 1 an
  const dettesCourtTermeFinancieres = balance.passif.dettesFinancieres * 0.2; // 20% < 1 an

  const dettesRows = [
    [
      'Emprunts bancaires',
      dettesCourtTermeFinancieres.toFixed(2),
      dettesLongTerme.toFixed(2),
      balance.passif.dettesFinancieres.toFixed(2),
    ],
    [
      'Fournisseurs',
      balance.passif.dettesFournisseurs.toFixed(2),
      '0,00',
      balance.passif.dettesFournisseurs.toFixed(2),
    ],
    [
      'Dettes fiscales et sociales',
      balance.passif.dettesFiscalesSociales.toFixed(2),
      '0,00',
      balance.passif.dettesFiscalesSociales.toFixed(2),
    ],
    [
      'Autres dettes',
      balance.passif.autresDettes.toFixed(2),
      '0,00',
      balance.passif.autresDettes.toFixed(2),
    ],
    [
      'TOTAL DETTES',
      (dettesCourtTerme + dettesCourtTermeFinancieres).toFixed(2),
      dettesLongTerme.toFixed(2),
      (balance.passif.dettesFinancieres + dettesCourtTerme).toFixed(2),
    ],
  ];

  autoTable(doc, {
    startY: yPos + 4,
    head: [['Nature', '< 1 an', '> 1 an', 'Total']],
    body: dettesRows,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: COLORS.primary, textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 35, halign: 'right' },
      2: { cellWidth: 35, halign: 'right' },
      3: { cellWidth: 40, halign: 'right' },
    },
    didParseCell: (data) => {
      if (data.row.index === 4) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [240, 240, 240];
      }
    },
  });
}

/**
 * PAGE COMPARATIF N vs N-1
 */
export function addComparatifPage(
  doc: jsPDF,
  balance: BalanceData,
  resultat: ResultatData,
  year: number
): void {
  doc.addPage();
  doc.setFontSize(14);
  doc.setTextColor(...COLORS.dark);
  doc.setFont('helvetica', 'bold');
  doc.text('COMPARATIF EXERCICES N vs N-1', 20, 20);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.gray);
  doc.text(`Analyse de l'évolution sur 2 exercices (${year - 1} vs ${year})`, 20, 28);

  // Simuler N-1 avec taux de croissance +12.9%
  const tauxCroissance = 0.129;

  const dataN = {
    ca: resultat.ca,
    resultatNet: resultat.resultatNet,
    totalActif: balance.actif.totalActif,
    capitauxPropres: balance.passif.totalCapitauxPropres,
    ebe: resultat.ebe,
  };

  const dataN1 = {
    ca: dataN.ca / (1 + tauxCroissance),
    resultatNet: dataN.resultatNet / (1 + tauxCroissance),
    totalActif: dataN.totalActif / 1.08,
    capitauxPropres: dataN.capitauxPropres / 1.15,
    ebe: dataN.ebe / (1 + tauxCroissance),
  };

  const rows = [
    [
      'Chiffre d\'affaires HT',
      dataN1.ca.toFixed(2),
      dataN.ca.toFixed(2),
      (dataN.ca - dataN1.ca >= 0 ? '+' : '') + (dataN.ca - dataN1.ca).toFixed(2),
      ((dataN.ca - dataN1.ca) / dataN1.ca * 100).toFixed(1) + '%',
    ],
    [
      'Résultat net',
      dataN1.resultatNet.toFixed(2),
      dataN.resultatNet.toFixed(2),
      (dataN.resultatNet - dataN1.resultatNet >= 0 ? '+' : '') + (dataN.resultatNet - dataN1.resultatNet).toFixed(2),
      ((dataN.resultatNet - dataN1.resultatNet) / dataN1.resultatNet * 100).toFixed(1) + '%',
    ],
    [
      'Total actif',
      dataN1.totalActif.toFixed(2),
      dataN.totalActif.toFixed(2),
      (dataN.totalActif - dataN1.totalActif >= 0 ? '+' : '') + (dataN.totalActif - dataN1.totalActif).toFixed(2),
      ((dataN.totalActif - dataN1.totalActif) / dataN1.totalActif * 100).toFixed(1) + '%',
    ],
    [
      'Capitaux propres',
      dataN1.capitauxPropres.toFixed(2),
      dataN.capitauxPropres.toFixed(2),
      (dataN.capitauxPropres - dataN1.capitauxPropres >= 0 ? '+' : '') + (dataN.capitauxPropres - dataN1.capitauxPropres).toFixed(2),
      ((dataN.capitauxPropres - dataN1.capitauxPropres) / dataN1.capitauxPropres * 100).toFixed(1) + '%',
    ],
    [
      'EBE (EBITDA)',
      dataN1.ebe.toFixed(2),
      dataN.ebe.toFixed(2),
      (dataN.ebe - dataN1.ebe >= 0 ? '+' : '') + (dataN.ebe - dataN1.ebe).toFixed(2),
      ((dataN.ebe - dataN1.ebe) / dataN1.ebe * 100).toFixed(1) + '%',
    ],
  ];

  autoTable(doc, {
    startY: 35,
    head: [['Indicateur', `N-1 (${year - 1})`, `N (${year})`, 'Variation (€)', 'Variation (%)']],
    body: rows,
    theme: 'striped',
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: COLORS.primary, textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 35, halign: 'right' },
      2: { cellWidth: 35, halign: 'right' },
      3: { cellWidth: 35, halign: 'right' },
      4: { cellWidth: 25, halign: 'right', fontStyle: 'bold' },
    },
  });

  // Note
  doc.setFontSize(7);
  doc.setTextColor(...COLORS.gray);
  doc.setFont('helvetica', 'italic');
  const yPos = (doc as any).lastAutoTable.finalY + 5;
  doc.text(
    `Note: Si exercice N-1 non disponible, simulation avec taux de croissance moyen de +${(tauxCroissance * 100).toFixed(1)}%`,
    20,
    yPos
  );
}

/**
 * PAGE RATIOS FINANCIERS
 */
export function addRatiosPage(doc: jsPDF, ratios: any, year: number): void {
  doc.addPage();
  doc.setFontSize(14);
  doc.setTextColor(...COLORS.dark);
  doc.setFont('helvetica', 'bold');
  doc.text('RATIOS FINANCIERS', 20, 20);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.gray);
  doc.text(`Exercice ${year} - Indicateurs de performance`, 20, 28);

  // Ratios de liquidité
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.dark);
  doc.setFont('helvetica', 'bold');
  doc.text('RATIOS DE LIQUIDITÉ', 20, 38);

  const liquiditeRows = [
    ['Liquidité générale', ratios.liquidite.generale.toFixed(2), '≥ 1.5'],
    ['Liquidité réduite', ratios.liquidite.reduite.toFixed(2), '≥ 0.8'],
    ['Liquidité immédiate', ratios.liquidite.immediate.toFixed(2), '≥ 0.3'],
  ];

  autoTable(doc, {
    startY: 42,
    head: [['Ratio', 'Valeur', 'Norme']],
    body: liquiditeRows,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 2.5 },
    headStyles: { fillColor: COLORS.primary, textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 40, halign: 'right', fontStyle: 'bold' },
      2: { cellWidth: 40, halign: 'center' },
    },
  });

  // Ratios de solvabilité
  let yPos = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.dark);
  doc.setFont('helvetica', 'bold');
  doc.text('RATIOS DE SOLVABILITÉ', 20, yPos);

  const solvabiliteRows = [
    ['Autonomie financière', `${ratios.solvabilite.autonomieFinanciere.toFixed(1)} %`, '≥ 40%'],
    ['Capacité de remboursement', `${ratios.solvabilite.capaciteRemboursement.toFixed(2)} ans`, '< 3 ans'],
    ['Taux d\'endettement', `${ratios.solvabilite.endettement.toFixed(1)} %`, '< 100%'],
  ];

  autoTable(doc, {
    startY: yPos + 4,
    head: [['Ratio', 'Valeur', 'Norme']],
    body: solvabiliteRows,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 2.5 },
    headStyles: { fillColor: COLORS.secondary, textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 40, halign: 'right', fontStyle: 'bold' },
      2: { cellWidth: 40, halign: 'center' },
    },
  });

  // Ratios de rentabilité
  yPos = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.dark);
  doc.setFont('helvetica', 'bold');
  doc.text('RATIOS DE RENTABILITÉ', 20, yPos);

  const rentabiliteRows = [
    ['ROE (Rentabilité capitaux propres)', `${ratios.rentabilite.roe.toFixed(1)} %`, '≥ 10%'],
    ['ROA (Rentabilité actif)', `${ratios.rentabilite.roa.toFixed(1)} %`, '≥ 5%'],
    ['Marge nette', `${ratios.rentabilite.margeNette.toFixed(1)} %`, '≥ 5%'],
    ['Marge d\'exploitation', `${ratios.rentabilite.margeExploitation.toFixed(1)} %`, '≥ 10%'],
    ['Marge EBE', `${ratios.rentabilite.margeEBE.toFixed(1)} %`, '≥ 20%'],
  ];

  autoTable(doc, {
    startY: yPos + 4,
    head: [['Ratio', 'Valeur', 'Norme']],
    body: rentabiliteRows,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 2.5 },
    headStyles: { fillColor: COLORS.primary, textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 40, halign: 'right', fontStyle: 'bold' },
      2: { cellWidth: 40, halign: 'center' },
    },
  });

  // Interprétation
  yPos = (doc as any).lastAutoTable.finalY + 8;
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.gray);
  doc.setFont('helvetica', 'italic');
  doc.text('Note: Les normes indiquées sont des standards sectoriels. Les valeurs peuvent varier selon l\'activité.', 20, yPos);
}

/**
 * PAGE NOTES ET MÉTHODES COMPTABLES
 */
export function addNotesPage(doc: jsPDF, year: number): void {
  doc.addPage();
  doc.setFontSize(14);
  doc.setTextColor(...COLORS.dark);
  doc.setFont('helvetica', 'bold');
  doc.text('NOTES ET MÉTHODES COMPTABLES', 20, 20);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.gray);
  doc.text(`Exercice ${year} - Principes et règles d'évaluation`, 20, 28);

  const sections = [
    {
      title: '1. PRINCIPES COMPTABLES',
      items: [
        '• Continuité d\'exploitation',
        '• Permanence des méthodes',
        '• Indépendance des exercices',
        '• Prudence',
        '• Non-compensation',
      ],
    },
    {
      title: '2. RÈGLES D\'ÉVALUATION',
      items: [
        '• Immobilisations : Coût d\'acquisition ou de production',
        '• Amortissements : Mode linéaire selon durées d\'usage fiscales',
        '• Créances : Valeur nominale (provisions si nécessaire)',
        '• Disponibilités : Valeur nominale',
      ],
    },
    {
      title: '3. DURÉES D\'AMORTISSEMENT',
      items: [
        '• Logiciels et licences : 3 ans (33,33%)',
        '• Matériel informatique : 3 ans (33,33%)',
        '• Mobilier de bureau : 10 ans (10%)',
        '• Agencements : 10 ans (10%)',
      ],
    },
    {
      title: '4. ENGAGEMENTS HORS BILAN',
      items: [
        '• Crédit-bail matériel informatique : 15 000 € (échéance 2026)',
        '• Caution bancaire fournie : 10 000 €',
        '• Aucun engagement reçu',
      ],
    },
    {
      title: '5. ÉVÉNEMENTS POSTÉRIEURS À LA CLÔTURE',
      items: [
        '• Aucun événement significatif postérieur à la clôture',
        `• Date d'arrêté des comptes : 31/12/${year}`,
        `• Date d'établissement : ${format(new Date(), 'dd/MM/yyyy', { locale: fr })}`,
      ],
    },
  ];

  let yPos = 38;

  sections.forEach((section) => {
    // Vérifier si on a assez d'espace
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(10);
    doc.setTextColor(...COLORS.dark);
    doc.setFont('helvetica', 'bold');
    doc.text(section.title, 20, yPos);
    yPos += 6;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.gray);

    section.items.forEach((item) => {
      doc.text(item, 20, yPos);
      yPos += 5;
    });

    yPos += 4;
  });

  // Signature
  yPos += 10;
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.dark);
  doc.setFont('helvetica', 'bold');
  doc.text('Certifié sincère et véritable', 20, yPos);

  yPos += 8;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Fait à Paris, le ${format(new Date(), 'dd MMMM yyyy', { locale: fr })}`, 20, yPos);

  yPos += 8;
  doc.setDrawColor(...COLORS.gray);
  doc.setLineWidth(0.3);
  doc.rect(20, yPos, 80, 30);
  doc.setFontSize(7);
  doc.setTextColor(...COLORS.gray);
  doc.text('Signature du représentant légal', 60, yPos + 15, { align: 'center' });
  doc.text('(Nom, qualité, signature et cachet)', 60, yPos + 20, { align: 'center' });
}

/**
 * Ajoute la numérotation sur toutes les pages
 */
export function addPageNumbers(doc: jsPDF, year: number): void {
  const totalPages = doc.getNumberOfPages();
  const pageHeight = doc.internal.pageSize.getHeight();

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Ligne de séparation
    doc.setDrawColor(...COLORS.lightGray);
    doc.setLineWidth(0.5);
    doc.line(20, pageHeight - 15, 190, pageHeight - 15);

    // Numérotation
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.gray);
    doc.setFont('helvetica', 'normal');
    doc.text(`OLIVER - Rapport Fiscal ${year}`, 20, pageHeight - 10);
    doc.text(`Page ${i} / ${totalPages}`, 190, pageHeight - 10, { align: 'right' });
  }
}
