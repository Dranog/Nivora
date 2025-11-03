import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import QRCode from 'qrcode';
import type { Transaction } from '@/types/transaction';

// =========================================
// CONFIGURATION DESIGN
// =========================================

const COLORS = {
  primary: [6, 182, 212] as [number, number, number], // Cyan
  primaryDark: [8, 145, 178] as [number, number, number],
  success: [34, 197, 94] as [number, number, number], // Vert
  successDark: [22, 163, 74] as [number, number, number],
  warning: [251, 146, 60] as [number, number, number], // Orange
  gray: [100, 116, 139] as [number, number, number],
  lightGray: [241, 245, 249] as [number, number, number],
  darkGray: [51, 65, 85] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  beige: [254, 252, 232] as [number, number, number], // Yellow-50
};

const FONTS = {
  title: 24,
  subtitle: 14,
  heading: 11,
  body: 9,
  small: 8,
  tiny: 7,
};

// Logo plateforme (SVG simple en base64)
// Remplace par ton vrai logo ou laisse ce placeholder
const PLATFORM_LOGO_BASE64 =
  'data:image/svg+xml;base64,' +
  btoa(`<svg width="200" height="80" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="80" rx="8" fill="#06b6d4"/>
  <text x="100" y="45" font-family="Arial" font-size="32" font-weight="bold" fill="white" text-anchor="middle">
    PLATEFORME
  </text>
</svg>`);

// =========================================
// FONCTIONS UTILITAIRES
// =========================================

const formatEuro = (cents: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(cents / 100);
};

const getCountryFlag = (code: string): string => {
  const flags: Record<string, string> = {
    FR: '🇫🇷',
    DE: '🇩🇪',
    US: '🇺🇸',
    GB: '🇬🇧',
    ES: '🇪🇸',
    IT: '🇮🇹',
    BE: '🇧🇪',
    NL: '🇳🇱',
  };
  return flags[code] || '🌍';
};

const getTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    subscription: 'Abonnement',
    ppv: 'Contenu payant (PPV)',
    tip: 'Pourboire',
    marketplace: 'Achat marketplace',
  };
  return labels[type] || type;
};

const getVATRuleLabel = (
  serviceCountry: string,
  customerCountry: string,
  isB2B: boolean,
  hasVATNumber: boolean
): string => {
  if (serviceCountry === customerCountry) {
    return isB2B
      ? `TVA ${serviceCountry} - Autoliquidation (B2B)`
      : `TVA ${serviceCountry} - Régime normal`;
  }

  const isEU = ['FR', 'DE', 'BE', 'NL', 'ES', 'IT', 'PT', 'PL', 'AT'].includes(customerCountry);

  if (isEU && isB2B && hasVATNumber) {
    return 'TVA intracommunautaire - Autoliquidation';
  }

  if (!isEU) {
    return 'Export hors UE - Exonération de TVA';
  }

  return `TVA ${serviceCountry} - Régime normal`;
};

// =========================================
// FONCTION GÉNÉRATION QR CODE
// =========================================

async function generateQRCode(data: string): Promise<string | null> {
  try {
    return await QRCode.toDataURL(data, {
      width: 200,
      margin: 1,
      color: {
        dark: '#06b6d4',
        light: '#ffffff',
      },
    });
  } catch (error) {
    console.error('Erreur génération QR Code:', error);
    return null;
  }
}

// =========================================
// FONCTION GÉNÉRATION PDF PREMIUM
// =========================================

export async function generateInvoicePDF(tx: Transaction): Promise<Blob> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const platformInfo = tx.platform || {
    name: 'Nom Plateforme SAS',
    siret: '123 456 789 00012',
    vatNumber: 'FR12345678901',
    rcs: 'RCS Paris B 123 456 789',
    capital: '100 000',
    address: {
      street: '15 rue de la Tech',
      postalCode: '75001',
      city: 'Paris',
      country: 'France',
    },
    email: 'contact@plateforme.com',
    phone: '+33 1 23 45 67 89',
    website: 'www.plateforme.com',
  };

  // =========================================
  // WATERMARK "PAYÉ" DIAGONAL
  // =========================================

  doc.saveGraphicsState();
  doc.setGState(new (doc as any).GState({ opacity: 0.08 }));
  doc.setTextColor(...COLORS.success);
  doc.setFontSize(120);
  doc.setFont('helvetica', 'bold');

  // Rotation 45° au centre de la page
  const centerX = pageWidth / 2;
  const centerY = pageHeight / 2;
  doc.text('PAYÉ', centerX, centerY, {
    align: 'center',
    angle: 45,
  });

  doc.restoreGraphicsState();

  // =========================================
  // BANDEAU HEADER CYAN
  // =========================================

  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, 45, 'F');

  // Logo plateforme (coin supérieur gauche)
  try {
    doc.addImage(PLATFORM_LOGO_BASE64, 'PNG', 15, 10, 50, 20);
  } catch (error) {
    // Fallback: texte si image fail
    doc.setTextColor(...COLORS.white);
    doc.setFontSize(FONTS.heading);
    doc.setFont('helvetica', 'bold');
    doc.text(platformInfo.name, 15, 22);
  }

  // Titre "FACTURE" (centre)
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(FONTS.title);
  doc.setFont('helvetica', 'bold');
  doc.text('FACTURE', pageWidth / 2, 25, { align: 'center' });

  // Numéro de facture (centre)
  doc.setFontSize(FONTS.subtitle);
  doc.setFont('helvetica', 'normal');
  doc.text(`N° ${tx.invoiceNumber}`, pageWidth / 2, 35, { align: 'center' });

  // Badge "✓ PAYÉ" (coin supérieur droit)
  if (tx.status === 'completed') {
    doc.setFillColor(...COLORS.success);
    doc.roundedRect(pageWidth - 40, 12, 25, 10, 2, 2, 'F');
    doc.setTextColor(...COLORS.white);
    doc.setFontSize(FONTS.body);
    doc.setFont('helvetica', 'bold');
    doc.text('✓ PAYÉ', pageWidth - 27.5, 18.5, { align: 'center' });
  }

  // QR Code (coin supérieur droit, sous le badge)
  const qrData = `https://plateforme.com/verify/${tx.invoiceNumber}`;
  const qrCodeDataURL = await generateQRCode(qrData);
  if (qrCodeDataURL) {
    try {
      doc.addImage(qrCodeDataURL, 'PNG', pageWidth - 35, 25, 25, 25);
      doc.setTextColor(...COLORS.gray);
      doc.setFontSize(FONTS.tiny);
      doc.text('Scanner pour vérifier', pageWidth - 22.5, 52, { align: 'center' });
    } catch (error) {
      console.warn('QR Code non ajouté:', error);
    }
  }

  // =========================================
  // DATE D'ÉMISSION
  // =========================================

  let yPos = 55;

  doc.setTextColor(...COLORS.gray);
  doc.setFontSize(FONTS.body);
  doc.setFont('helvetica', 'normal');
  doc.text(`📅 Date d'émission : ${format(tx.date, 'dd MMMM yyyy', { locale: fr })}`, 15, yPos);

  yPos += 10;

  // =========================================
  // CARTE ÉMETTEUR (gris clair avec ombre)
  // =========================================

  doc.setFillColor(...COLORS.lightGray);
  doc.setDrawColor(200, 200, 200);
  doc.roundedRect(15, yPos, 85, 45, 3, 3, 'FD');

  // Ombre (simulation)
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.line(16, yPos + 45, 100, yPos + 45);
  doc.line(100, yPos + 1, 100, yPos + 45);

  yPos += 5;

  doc.setTextColor(...COLORS.darkGray);
  doc.setFontSize(FONTS.heading);
  doc.setFont('helvetica', 'bold');
  doc.text('ÉMETTEUR (Plateforme)', 18, yPos);

  yPos += 6;
  doc.setFontSize(FONTS.body);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.gray);

  doc.text(platformInfo.name, 18, yPos);
  yPos += 4;
  doc.text(`SIRET : ${platformInfo.siret}`, 18, yPos);
  yPos += 4;
  doc.text(`N° TVA : ${platformInfo.vatNumber}`, 18, yPos);
  yPos += 4;
  if (platformInfo.rcs) {
    doc.text(platformInfo.rcs, 18, yPos);
    yPos += 4;
  }
  doc.text(platformInfo.address.street, 18, yPos);
  yPos += 4;
  doc.text(`${platformInfo.address.postalCode} ${platformInfo.address.city}`, 18, yPos);
  yPos += 4;
  doc.text(`📧 ${platformInfo.email}`, 18, yPos);
  yPos += 4;
  doc.text(`📞 ${platformInfo.phone}`, 18, yPos);

  // =========================================
  // CARTE DESTINATAIRE (blanc avec bordure cyan)
  // =========================================

  const clientYPos = 65;
  const clientXPos = 108;

  doc.setFillColor(...COLORS.white);
  doc.setDrawColor(...COLORS.primary);
  doc.setLineWidth(0.5);
  doc.roundedRect(clientXPos, clientYPos, 87, 45, 3, 3, 'FD');

  // Ombre
  doc.setDrawColor(220, 220, 220);
  doc.line(clientXPos + 1, clientYPos + 45, clientXPos + 87, clientYPos + 45);
  doc.line(clientXPos + 87, clientYPos + 1, clientXPos + 87, clientYPos + 45);

  let clientY = clientYPos + 5;

  doc.setTextColor(...COLORS.darkGray);
  doc.setFontSize(FONTS.heading);
  doc.setFont('helvetica', 'bold');
  doc.text('DESTINATAIRE (Client)', clientXPos + 3, clientY);

  clientY += 6;
  doc.setFontSize(FONTS.body);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.gray);

  doc.text(`👤 ${tx.fan.name}`, clientXPos + 3, clientY);
  clientY += 4;
  if (tx.fan.email) {
    doc.text(`📧 ${tx.fan.email}`, clientXPos + 3, clientY);
    clientY += 4;
  }
  doc.text(`🌍 ${getCountryFlag(tx.fan.country)} ${tx.fan.country}`, clientXPos + 3, clientY);
  clientY += 4;
  if (tx.fan.type === 'business' && tx.fan.vatNumber) {
    doc.text(`N° TVA : ${tx.fan.vatNumber}`, clientXPos + 3, clientY);
    clientY += 4;
  }
  doc.setFont('helvetica', 'bold');
  doc.text(
    `Type : ${tx.fan.type === 'business' ? '🏢 Professionnel (B2B)' : '👤 Particulier (B2C)'}`,
    clientXPos + 3,
    clientY
  );

  // =========================================
  // CARTE CRÉATEUR (beige clair avec ombre)
  // =========================================

  yPos = 120;

  doc.setFillColor(...COLORS.beige);
  doc.setDrawColor(200, 200, 200);
  doc.roundedRect(15, yPos, pageWidth - 30, 40, 3, 3, 'FD');

  // Ombre
  doc.setDrawColor(220, 220, 220);
  doc.line(16, yPos + 40, pageWidth - 15, yPos + 40);

  yPos += 5;

  doc.setTextColor(...COLORS.darkGray);
  doc.setFontSize(FONTS.heading);
  doc.setFont('helvetica', 'bold');
  doc.text('CRÉATEUR / PRESTATAIRE DE SERVICE', 18, yPos);

  yPos += 6;
  doc.setFontSize(FONTS.body);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.gray);

  doc.text(`👤 ${tx.creator.name}`, 18, yPos);
  yPos += 4;
  doc.text(`Statut fiscal : ${tx.creator.fiscalStatus}`, 18, yPos);
  yPos += 4;

  if (tx.creator.siret) {
    doc.text(`SIRET : ${tx.creator.siret}`, 18, yPos);
    yPos += 4;
  }

  if (tx.creator.vatNumber) {
    doc.text(`N° TVA : ${tx.creator.vatNumber}`, 18, yPos);
    yPos += 4;
  }

  if (tx.creator.address) {
    doc.text(
      `📍 ${tx.creator.address.street}, ${tx.creator.address.postalCode} ${tx.creator.address.city}`,
      18,
      yPos
    );
    yPos += 4;
  }

  // =========================================
  // TABLE DES PRESTATIONS
  // =========================================

  yPos += 10;

  autoTable(doc, {
    startY: yPos,
    head: [['Description', 'Montant HT', 'TVA', 'Montant TTC']],
    body: [
      [
        `${getTypeLabel(tx.type)}\nDate: ${format(tx.date, 'dd/MM/yyyy à HH:mm', { locale: fr })}\nClient: ${tx.fan.name}`,
        formatEuro(tx.amounts.net),
        `${formatEuro(tx.amounts.vat)}\n(${tx.amounts.vatRate}%)`,
        formatEuro(tx.amounts.gross),
      ],
    ],
    foot: [['TOTAL', formatEuro(tx.amounts.net), formatEuro(tx.amounts.vat), formatEuro(tx.amounts.gross)]],
    theme: 'grid',
    headStyles: {
      fillColor: COLORS.primary,
      textColor: COLORS.white,
      fontStyle: 'bold',
      fontSize: FONTS.body,
      halign: 'center',
    },
    footStyles: {
      fillColor: COLORS.lightGray,
      textColor: COLORS.darkGray,
      fontStyle: 'bold',
      fontSize: FONTS.body,
    },
    bodyStyles: {
      fontSize: FONTS.body,
      textColor: COLORS.gray,
    },
    columnStyles: {
      0: { cellWidth: 90, valign: 'middle' },
      1: { halign: 'right', cellWidth: 30 },
      2: { halign: 'right', cellWidth: 30 },
      3: { halign: 'right', cellWidth: 35, fontStyle: 'bold' },
    },
    margin: { left: 15, right: 15 },
  });

  // =========================================
  // CARTE COMMISSION (orange clair)
  // =========================================

  const finalY = (doc as any).lastAutoTable.finalY + 10;

  // Commission card
  doc.setFillColor(254, 243, 199); // Orange-100
  doc.setDrawColor(251, 146, 60); // Orange-400
  doc.setLineWidth(0.5);
  doc.roundedRect(15, finalY, 85, 25, 3, 3, 'FD');

  let commissionY = finalY + 5;
  doc.setTextColor(...COLORS.darkGray);
  doc.setFontSize(FONTS.heading);
  doc.setFont('helvetica', 'bold');
  doc.text('💰 COMMISSION PLATEFORME', 18, commissionY);

  commissionY += 6;
  doc.setFontSize(FONTS.body);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.gray);

  doc.text(`Commission HT (15%) : ${formatEuro(tx.amounts.commission)}`, 18, commissionY);
  commissionY += 4;
  doc.text(`TVA commission (20%) : ${formatEuro(tx.amounts.commissionVAT)}`, 18, commissionY);
  commissionY += 4;
  doc.setFont('helvetica', 'bold');
  doc.text(
    `Commission TTC : ${formatEuro(tx.amounts.commission + tx.amounts.commissionVAT)}`,
    18,
    commissionY
  );

  // =========================================
  // CARTE NET CRÉATEUR (vert clair)
  // =========================================

  const netXPos = 108;

  doc.setFillColor(220, 252, 231); // Green-100
  doc.setDrawColor(...COLORS.success);
  doc.setLineWidth(0.5);
  doc.roundedRect(netXPos, finalY, 87, 25, 3, 3, 'FD');

  let netY = finalY + 5;
  doc.setTextColor(...COLORS.successDark);
  doc.setFontSize(FONTS.heading);
  doc.setFont('helvetica', 'bold');
  doc.text('✨ NET VERSÉ AU CRÉATEUR', netXPos + 3, netY);

  netY += 10;
  doc.setFontSize(20);
  doc.setTextColor(...COLORS.success);
  doc.text(formatEuro(tx.amounts.creatorNet), netXPos + 43.5, netY, { align: 'center' });

  netY += 5;
  doc.setFontSize(FONTS.small);
  doc.setTextColor(...COLORS.gray);
  doc.setFont('helvetica', 'normal');
  doc.text('Montant après commission et frais', netXPos + 43.5, netY, { align: 'center' });

  // =========================================
  // RÈGLE TVA DÉTAILLÉE
  // =========================================

  let vatRuleY = finalY + 30;

  doc.setFillColor(239, 246, 255); // Blue-50
  doc.setDrawColor(...COLORS.primary);
  doc.setLineWidth(0.5);
  doc.roundedRect(15, vatRuleY, pageWidth - 30, 15, 3, 3, 'FD');

  vatRuleY += 5;
  doc.setTextColor(...COLORS.darkGray);
  doc.setFontSize(FONTS.body);
  doc.setFont('helvetica', 'bold');
  doc.text('📋 RÈGLE TVA APPLICABLE', 18, vatRuleY);

  vatRuleY += 5;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.gray);
  doc.setFontSize(FONTS.small);

  const vatRule = getVATRuleLabel(
    'FR',
    tx.fan.country,
    tx.fan.type === 'business',
    Boolean(tx.fan.vatNumber)
  );
  doc.text(vatRule, 18, vatRuleY);

  vatRuleY += 4;
  if (tx.creator.fiscalStatus === 'Auto-entrepreneur') {
    doc.setFont('helvetica', 'italic');
    doc.text('TVA non applicable, art. 293 B du CGI (régime micro-entreprise)', 18, vatRuleY);
  } else {
    doc.text('TVA récupérable sur justificatif pour les assujettis', 18, vatRuleY);
  }

  // =========================================
  // PAGE 2 - MENTIONS LÉGALES
  // =========================================

  doc.addPage();

  let legalY = 20;

  // Header page 2
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, 15, 'F');
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(FONTS.subtitle);
  doc.setFont('helvetica', 'bold');
  doc.text(`FACTURE N° ${tx.invoiceNumber} - PAGE 2/2`, pageWidth / 2, 10, { align: 'center' });

  legalY = 25;

  doc.setFillColor(254, 249, 195); // Yellow-100
  doc.roundedRect(15, legalY, pageWidth - 30, 8, 2, 2, 'F');
  doc.setFontSize(FONTS.heading);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.darkGray);
  doc.text('📜 MENTIONS LÉGALES OBLIGATOIRES (CGI art. 289)', pageWidth / 2, legalY + 5.5, {
    align: 'center',
  });

  legalY += 14;
  doc.setFontSize(FONTS.small);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.gray);

  const legalMentions = [
    `✓ Facture émise conformément aux dispositions de l'article 289 du Code Général des Impôts`,
    `✓ ${tx.creator.fiscalStatus === 'Auto-entrepreneur' ? 'TVA non applicable, art. 293 B du CGI (régime micro-entreprise)' : 'TVA récupérable sur justificatif pour les assujettis'}`,
    `✓ Paiement comptant effectué le ${format(tx.date, 'dd/MM/yyyy à HH:mm', { locale: fr })}`,
    `✓ Pas d'escompte pour paiement anticipé`,
    `✓ Pénalités de retard : taux appliqué = taux BCE + 10 points (art. L441-10 du Code de commerce)`,
    `✓ Indemnité forfaitaire pour frais de recouvrement en cas de retard de paiement : 40 € (art. D441-5)`,
    `✓ En cas de litige, compétence exclusive des tribunaux de Paris`,
    `✓ Conditions Générales disponibles sur ${platformInfo.email}`,
    `✓ Cette facture est générée électroniquement et peut être vérifiée via le QR code`,
  ];

  legalMentions.forEach((mention) => {
    const lines = doc.splitTextToSize(mention, pageWidth - 35);
    doc.text(lines, 18, legalY);
    legalY += 5;
  });

  // Informations complémentaires
  legalY += 5;

  doc.setFillColor(239, 246, 255); // Blue-50
  doc.roundedRect(15, legalY, pageWidth - 30, 30, 2, 2, 'F');

  legalY += 5;
  doc.setFontSize(FONTS.body);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.darkGray);
  doc.text('ℹ️ INFORMATIONS COMPLÉMENTAIRES', 18, legalY);

  legalY += 6;
  doc.setFontSize(FONTS.small);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.gray);

  doc.text(`Société : ${platformInfo.name}`, 18, legalY);
  legalY += 4;
  doc.text(`SIRET : ${platformInfo.siret}`, 18, legalY);
  legalY += 4;
  doc.text(`N° TVA intracommunautaire : ${platformInfo.vatNumber}`, 18, legalY);
  legalY += 4;
  if (platformInfo.rcs) {
    doc.text(platformInfo.rcs, 18, legalY);
    legalY += 4;
  }
  if (platformInfo.capital) {
    doc.text(`Capital social : ${platformInfo.capital} €`, 18, legalY);
    legalY += 4;
  }
  doc.text(
    `Siège social : ${platformInfo.address.street}, ${platformInfo.address.postalCode} ${platformInfo.address.city}`,
    18,
    legalY
  );
  legalY += 4;
  if (platformInfo.website) {
    doc.text(`Site web : ${platformInfo.website}`, 18, legalY);
  }

  // =========================================
  // FOOTER
  // =========================================

  const footerY = pageHeight - 15;

  doc.setFontSize(FONTS.tiny);
  doc.setTextColor(...COLORS.gray);
  doc.text(
    `${platformInfo.name} - ${platformInfo.siret} - ${platformInfo.vatNumber}`,
    pageWidth / 2,
    footerY,
    { align: 'center' }
  );

  doc.text(
    `${platformInfo.address.street}, ${platformInfo.address.postalCode} ${platformInfo.address.city} - ${platformInfo.email}`,
    pageWidth / 2,
    footerY + 4,
    { align: 'center' }
  );

  // Retourner le blob
  return doc.output('blob');
}

// Fonction helper pour télécharger directement
export async function downloadInvoicePDF(tx: Transaction): Promise<void> {
  const blob = await generateInvoicePDF(tx);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Facture-${tx.invoiceNumber}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
