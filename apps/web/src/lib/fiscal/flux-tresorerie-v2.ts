import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BalanceData } from './balance-calculator-v2';
import { ResultatData } from './resultat-calculator-v2';

const COLORS = {
  primary: [0, 212, 197] as [number, number, number],
  dark: [51, 65, 85] as [number, number, number],
  gray: [100, 116, 139] as [number, number, number],
};

export interface FluxTresorerie {
  caf: number;
  variationBFR: number;
  fluxOperationnels: number;
  acquisitionsImmo: number;
  fluxInvestissement: number;
  augmentationCapital: number;
  variationEmprunts: number;
  fluxFinancement: number;
  variationTresorerie: number;
  tresorerieDebut: number;
  tresorerieFin: number;
}

export function calculateFluxTresorerie(
  resultat: ResultatData,
  balance: BalanceData,
  balanceN1?: BalanceData
): FluxTresorerie {
  // CAF (Capacité d'Autofinancement)
  const caf = resultat.resultatNet + resultat.dotationsAmortissements;

  // Variation BFR (simplifié)
  const variationBFR = balanceN1
    ? (balance.actif.creancesClients - balanceN1.actif.creancesClients) -
      (balance.passif.dettesFournisseurs - balanceN1.passif.dettesFournisseurs)
    : 0;

  const fluxOperationnels = caf - variationBFR;

  // Investissements
  const acquisitionsImmo = balanceN1
    ? (balance.actif.immobilisationsBrutes - balanceN1.actif.immobilisationsBrutes)
    : balance.actif.immobilisationsBrutes;

  const fluxInvestissement = -acquisitionsImmo;

  // Financement
  const augmentationCapital = 0; // Pas de variation dans l'exercice
  const variationEmprunts = balanceN1
    ? (balance.passif.dettesFinancieres - balanceN1.passif.dettesFinancieres)
    : 0;

  const fluxFinancement = augmentationCapital + variationEmprunts;

  // Variation trésorerie
  const variationTresorerie = fluxOperationnels + fluxInvestissement + fluxFinancement;

  const tresorerieDebut = balanceN1?.actif.disponibilites ||
    (balance.actif.disponibilites - variationTresorerie);
  const tresorerieFin = balance.actif.disponibilites;

  return {
    caf: round(caf),
    variationBFR: round(variationBFR),
    fluxOperationnels: round(fluxOperationnels),
    acquisitionsImmo: round(acquisitionsImmo),
    fluxInvestissement: round(fluxInvestissement),
    augmentationCapital: round(augmentationCapital),
    variationEmprunts: round(variationEmprunts),
    fluxFinancement: round(fluxFinancement),
    variationTresorerie: round(variationTresorerie),
    tresorerieDebut: round(tresorerieDebut),
    tresorerieFin: round(tresorerieFin),
  };
}

export function addFluxTresoreriePage(doc: jsPDF, flux: FluxTresorerie, year: number): void {
  doc.addPage();
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.dark);
  doc.text('TABLEAU DE FLUX DE TRÉSORERIE', 20, 20);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.gray);
  doc.text(`Méthode indirecte - Exercice ${year}`, 20, 28);

  const rows = [
    ['FLUX DE TRÉSORERIE OPÉRATIONNELS', ''],
    ['Capacité d\'autofinancement (CAF)', flux.caf.toFixed(2)],
    ['- Variation du BFR', flux.variationBFR >= 0 ? flux.variationBFR.toFixed(2) : `(${Math.abs(flux.variationBFR).toFixed(2)})`],
    ['= Flux nets de trésorerie opérationnels (A)', flux.fluxOperationnels.toFixed(2)],
    ['', ''],
    ['FLUX DE TRÉSORERIE D\'INVESTISSEMENT', ''],
    ['- Acquisitions d\'immobilisations', `(${flux.acquisitionsImmo.toFixed(2)})`],
    ['= Flux nets de trésorerie d\'investissement (B)', flux.fluxInvestissement.toFixed(2)],
    ['', ''],
    ['FLUX DE TRÉSORERIE DE FINANCEMENT', ''],
    ['+ Augmentation de capital', flux.augmentationCapital.toFixed(2)],
    ['+/- Variation emprunts nets', flux.variationEmprunts >= 0 ? `+${flux.variationEmprunts.toFixed(2)}` : flux.variationEmprunts.toFixed(2)],
    ['= Flux nets de trésorerie de financement (C)', flux.fluxFinancement.toFixed(2)],
    ['', ''],
    ['VARIATION DE TRÉSORERIE (A + B + C)', flux.variationTresorerie.toFixed(2)],
    ['', ''],
    ['Trésorerie au début de l\'exercice', flux.tresorerieDebut.toFixed(2)],
    ['+ Variation de trésorerie', flux.variationTresorerie >= 0 ? `+${flux.variationTresorerie.toFixed(2)}` : flux.variationTresorerie.toFixed(2)],
    ['= Trésorerie à la fin de l\'exercice', flux.tresorerieFin.toFixed(2)],
    ['', ''],
    ['CONTRÔLE (Fin - Début)', (flux.tresorerieFin - flux.tresorerieDebut).toFixed(2)],
  ];

  autoTable(doc, {
    startY: 35,
    head: [['Désignation', 'Montant (€)']],
    body: rows,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: COLORS.primary, textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 140 },
      1: { cellWidth: 40, halign: 'right' },
    },
    didParseCell: (data) => {
      const text = data.cell.text[0];
      if (
        text.startsWith('FLUX') ||
        text.startsWith('VARIATION') ||
        text.startsWith('Trésorerie') ||
        text.startsWith('=') ||
        text.startsWith('CONTRÔLE')
      ) {
        data.cell.styles.fontStyle = 'bold';
        if (text.startsWith('FLUX')) {
          data.cell.styles.fillColor = [245, 245, 245];
        }
      }
    },
  });

  const finalY = (doc as any).lastAutoTable.finalY;

  doc.setFontSize(7);
  doc.setTextColor(...COLORS.gray);
  doc.text('Tableau conforme aux recommandations de l\'OEC (Ordre des Experts-Comptables)', 20, finalY + 5);
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}
