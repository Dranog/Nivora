/**
 * Attestations Légales et Signatures
 * Conformité DGFiP, CGI, PCG pour dépôt officiel
 * @module fiscal/legal-attestation
 */

import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const COLORS = {
  primary: [0, 212, 197] as [number, number, number],
  dark: [51, 65, 85] as [number, number, number],
  gray: [100, 116, 139] as [number, number, number],
  blue: [37, 99, 235] as [number, number, number],
};

interface CompanyInfo {
  name: string;
  siret: string;
  address: string;
  legalForm: string;
  capital: number;
}

/**
 * Génère la page d'attestation légale avec signatures
 */
export function generateLegalAttestation(
  doc: jsPDF,
  year: number,
  companyInfo?: Partial<CompanyInfo>
): void {
  doc.addPage();

  const defaultCompany: CompanyInfo = {
    name: companyInfo?.name || 'OLIVER SAS',
    siret: companyInfo?.siret || '123 456 789 00012',
    address: companyInfo?.address || '123 Avenue des Champs-Élysées, 75008 Paris',
    legalForm: companyInfo?.legalForm || 'SAS (Société par Actions Simplifiée)',
    capital: companyInfo?.capital || 100000,
  };

  // En-tête avec fond
  doc.setFillColor(240, 253, 250);
  doc.rect(14, 10, 182, 30, 'F');

  doc.setFontSize(16);
  doc.setTextColor(...COLORS.dark);
  doc.setFont('helvetica', 'bold');
  doc.text('ATTESTATION DE CONFORMITÉ COMPTABLE', 105, 20, { align: 'center' });

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.gray);
  doc.text(`Exercice comptable clos le 31 décembre ${year}`, 105, 30, { align: 'center' });

  let currentY = 50;

  // Section 1: Identification de l'entreprise
  doc.setFillColor(240, 248, 255);
  doc.rect(14, currentY, 182, 8, 'F');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.dark);
  doc.setFont('helvetica', 'bold');
  doc.text('I. IDENTIFICATION DE L\'ENTREPRISE', 16, currentY + 5.5);

  currentY += 12;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.dark);

  const companyData = [
    ['Dénomination sociale :', defaultCompany.name],
    ['Forme juridique :', defaultCompany.legalForm],
    ['N° SIRET :', defaultCompany.siret],
    ['Adresse du siège social :', defaultCompany.address],
    ['Capital social :', `${(defaultCompany.capital / 100).toLocaleString('fr-FR')} €`],
    ['Exercice comptable :', `Du 01/01/${year} au 31/12/${year}`],
  ];

  companyData.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, 18, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 75, currentY);
    currentY += 6;
  });

  currentY += 4;

  // Section 2: Références légales et conformité
  doc.setFillColor(240, 248, 255);
  doc.rect(14, currentY, 182, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.text('II. RÉFÉRENCES LÉGALES ET CONFORMITÉ', 16, currentY + 5.5);

  currentY += 12;
  doc.setFont('helvetica', 'normal');

  const legalRefs = [
    'Code Général des Impôts (CGI) - Articles 38 à 41, 205 à 223',
    'Plan Comptable Général (PCG) 2025 - Règlement ANC n°2014-03',
    'Code de Commerce - Articles L123-12 à L123-28 (obligations comptables)',
    'Directive DGFiP - BOI-BIC-DECLA-30-70 (liasse fiscale)',
    'Norme CERFA - Formulaires 2050, 2051, 2065, 2058, 1447-M',
    'Déclarations TVA - Formulaire CA3 (3310-CA3-SD)',
  ];

  legalRefs.forEach((ref) => {
    doc.setFontSize(8);
    doc.text('•', 18, currentY);
    doc.text(ref, 23, currentY);
    currentY += 5;
  });

  currentY += 6;

  // Section 3: Attestation de conformité
  doc.setFillColor(240, 248, 255);
  doc.rect(14, currentY, 182, 8, 'F');
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('III. ATTESTATION DE CONFORMITÉ', 16, currentY + 5.5);

  currentY += 12;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');

  const attestationText = [
    'Je soussigné(e), représentant légal de la société susmentionnée, atteste sur l\'honneur que :',
    '',
    '1. Les documents comptables ci-joints ont été établis conformément aux dispositions du Plan',
    '   Comptable Général en vigueur et aux prescriptions du Code de Commerce.',
    '',
    '2. Les comptes annuels (bilan, compte de résultat, annexes) reflètent de manière sincère et',
    '   fidèle le patrimoine, la situation financière et le résultat de l\'exercice écoulé.',
    '',
    '3. Les déclarations fiscales (TVA, IS, CFE) sont conformes aux réglementations en vigueur',
    '   et aux instructions de la Direction Générale des Finances Publiques (DGFiP).',
    '',
    '4. Les états financiers respectent les principes comptables fondamentaux : continuité',
    '   d\'exploitation, permanence des méthodes, indépendance des exercices, prudence.',
    '',
    '5. L\'inventaire physique et comptable a été réalisé au 31 décembre ' + year + '.',
  ];

  attestationText.forEach((line) => {
    if (line === '') {
      currentY += 3;
    } else if (line.startsWith(' ')) {
      doc.setFontSize(8);
      doc.text(line.trim(), 23, currentY);
      currentY += 4;
    } else {
      doc.setFontSize(9);
      doc.text(line, 18, currentY);
      currentY += 5;
    }
  });

  currentY += 8;

  // Section 4: Signatures
  doc.setFillColor(240, 248, 255);
  doc.rect(14, currentY, 182, 8, 'F');
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('IV. SIGNATURES', 16, currentY + 5.5);

  currentY += 12;

  // Cadre signatures (2 colonnes)
  const signatureBoxWidth = 85;
  const signatureBoxHeight = 35;
  const leftBoxX = 18;
  const rightBoxX = 113;

  // Cadre gauche - Dirigeant
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.rect(leftBoxX, currentY, signatureBoxWidth, signatureBoxHeight);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Le Représentant Légal', leftBoxX + 3, currentY + 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Président / Directeur Général', leftBoxX + 3, currentY + 10);

  doc.setFontSize(7);
  doc.setTextColor(...COLORS.gray);
  doc.text(`Fait à Paris, le ${format(new Date(), 'dd MMMM yyyy', { locale: fr })}`, leftBoxX + 3, currentY + 16);

  doc.setFontSize(8);
  doc.setTextColor(...COLORS.dark);
  doc.text('Signature et cachet :', leftBoxX + 3, currentY + 23);
  doc.setDrawColor(150, 150, 150);
  doc.setLineWidth(0.2);
  doc.line(leftBoxX + 30, currentY + 30, leftBoxX + 75, currentY + 30); // Ligne signature

  // Cadre droit - Expert-comptable
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.rect(rightBoxX, currentY, signatureBoxWidth, signatureBoxHeight);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.dark);
  doc.text('L\'Expert-Comptable (si applicable)', rightBoxX + 3, currentY + 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Ordre des Experts-Comptables', rightBoxX + 3, currentY + 10);

  doc.setFontSize(7);
  doc.setTextColor(...COLORS.gray);
  doc.text(`Fait à ______, le ${format(new Date(), 'dd MMMM yyyy', { locale: fr })}`, rightBoxX + 3, currentY + 16);

  doc.setFontSize(8);
  doc.setTextColor(...COLORS.dark);
  doc.text('Signature et cachet :', rightBoxX + 3, currentY + 23);
  doc.setDrawColor(150, 150, 150);
  doc.setLineWidth(0.2);
  doc.line(rightBoxX + 30, currentY + 30, rightBoxX + 75, currentY + 30); // Ligne signature

  currentY += signatureBoxHeight + 10;

  // Section 5: Mentions légales
  doc.setFillColor(255, 251, 240);
  doc.rect(14, currentY, 182, 40, 'F');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.dark);
  doc.text('MENTIONS LÉGALES', 16, currentY + 5);

  currentY += 9;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...COLORS.gray);

  const legalMentions = [
    'Article 441-1 du Code pénal : "Constitue un faux toute altération frauduleuse de la vérité, de nature à causer',
    'un préjudice et accomplie par quelque moyen que ce soit." Peine : 3 ans d\'emprisonnement et 45 000 € d\'amende.',
    '',
    'Article L123-14 du Code de Commerce : Les comptes annuels doivent être réguliers, sincères et donner une image',
    'fidèle du patrimoine, de la situation financière et du résultat de l\'entreprise.',
    '',
    'Article 1741 du CGI : Toute personne qui a frauduleusement soustrait ou tenté de se soustraire frauduleusement',
    'à l\'établissement ou au paiement de l\'impôt encourt une amende de 500 000 € et un emprisonnement de 5 ans.',
  ];

  legalMentions.forEach((line) => {
    if (line === '') {
      currentY += 3;
    } else {
      doc.text(line, 16, currentY);
      currentY += 4;
    }
  });

  currentY += 5;

  // Pied de page
  doc.setFontSize(7);
  doc.setTextColor(...COLORS.blue);
  doc.text('Document généré automatiquement - Veuillez vérifier et signer avant dépôt officiel', 105, currentY, { align: 'center' });
}

/**
 * Génère une page récapitulative des documents joints
 */
export function generateDocumentChecklist(doc: jsPDF, year: number): void {
  doc.addPage();

  doc.setFillColor(250, 250, 250);
  doc.rect(14, 10, 182, 15, 'F');

  doc.setFontSize(14);
  doc.setTextColor(...COLORS.dark);
  doc.setFont('helvetica', 'bold');
  doc.text('LISTE RÉCAPITULATIVE DES DOCUMENTS JOINTS', 105, 19, { align: 'center' });

  let currentY = 35;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');

  const documents = [
    { section: 'DOCUMENTS COMPTABLES OBLIGATOIRES', items: [
      'Bilan actif (CERFA 2050)',
      'Bilan passif (CERFA 2051)',
      'Compte de résultat (format PCG par nature)',
      'Soldes Intermédiaires de Gestion (SIG)',
      'Tableau des flux de trésorerie',
      'Comparatif N vs N-1',
    ]},
    { section: 'DÉCLARATIONS FISCALES', items: [
      'Déclaration IS - CERFA 2065',
      'Déclaration CFE - CERFA 1447-M',
      'CA3 mensuelles (12 déclarations)',
      'CA3 annuelle récapitulative',
      'Synthèse TVA annuelle',
    ]},
    { section: 'ANNEXES LÉGALES DÉTAILLÉES', items: [
      'Annexe Clients (liste nominative)',
      'Annexe Fournisseurs (liste nominative)',
      'Annexe Personnel et charges sociales',
      'Annexe Immobilisations et amortissements',
      'Annexe Créances et dettes',
    ]},
    { section: 'ANALYSES FINANCIÈRES', items: [
      'Ratios financiers (rentabilité, liquidité, structure)',
      'Notes annexes et méthodes comptables',
    ]},
  ];

  documents.forEach(({ section, items }) => {
    // Titre de section
    doc.setFillColor(230, 240, 255);
    doc.rect(14, currentY, 182, 7, 'F');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(section, 16, currentY + 5);
    currentY += 10;

    // Items
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    items.forEach((item) => {
      doc.text('☑', 18, currentY);
      doc.text(item, 25, currentY);
      currentY += 6;
    });

    currentY += 3;
  });

  currentY += 5;

  // Note finale
  doc.setFillColor(255, 251, 235);
  doc.rect(14, currentY, 182, 20, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(...COLORS.dark);
  doc.text('Note : Ce dossier constitue la liasse fiscale complète à déposer auprès de la Direction', 16, currentY + 6);
  doc.text('Générale des Finances Publiques (DGFiP) conformément à l\'article 53 A du CGI.', 16, currentY + 11);
  doc.text(`Date limite de dépôt pour l'exercice ${year} : 3 mai ${year + 1} (dépôt électronique).`, 16, currentY + 16);
}
