/**
 * Utilitaires fiscaux conformes CGI
 * @module lib/utils/fiscal
 */

import { FiscalStatus } from '@/types/transaction-fiscale';

/**
 * Calcule le montant de TVA à partir d'un montant HT
 */
export function calculateVAT(amountHT: number, vatRate: number): number {
  return Math.round(amountHT * (vatRate / 100));
}

/**
 * Calcule le montant TTC à partir d'un montant HT
 */
export function calculateTTC(amountHT: number, vatRate: number): number {
  return amountHT + calculateVAT(amountHT, vatRate);
}

/**
 * Calcule le montant HT à partir d'un montant TTC
 */
export function calculateHT(amountTTC: number, vatRate: number): number {
  return Math.round(amountTTC / (1 + vatRate / 100));
}

/**
 * Détermine le taux de TVA applicable selon les règles UE
 */
export function getVATRate(
  serviceCountry: string,
  customerCountry: string,
  isB2B: boolean,
  hasVATNumber: boolean
): number {
  // France → France : TVA standard 20%
  if (serviceCountry === 'FR' && customerCountry === 'FR') {
    return 20;
  }

  // B2B UE avec N° TVA valide → Autoliquidation (0%)
  if (isB2B && hasVATNumber && isEUCountry(customerCountry)) {
    return 0;
  }

  // Export hors-UE → 0%
  if (!isEUCountry(customerCountry)) {
    return 0;
  }

  // B2C UE → TVA pays de prestation (France)
  if (serviceCountry === 'FR') {
    return 20;
  }

  return 0;
}

/**
 * Génère un numéro de facture séquentiel conforme
 */
export function generateInvoiceNumber(fiscalYear: number, sequence: number): string {
  return `${fiscalYear}-${sequence.toString().padStart(6, '0')}`;
}

/**
 * Formate un montant en centimes en euros
 */
export function formatEuro(cents: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(cents / 100);
}

/**
 * Formate un pourcentage
 */
export function formatPercent(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  }).format(value / 100);
}

/**
 * Retourne le label du statut fiscal
 */
export function getFiscalStatusLabel(status: FiscalStatus): string {
  const labels: Record<FiscalStatus, string> = {
    auto_entrepreneur: 'Auto-entrepreneur',
    ei: 'Entreprise Individuelle',
    eirl: 'EIRL',
    eurl: 'EURL',
    sarl: 'SARL',
    sas: 'SAS',
    sasu: 'SASU',
  };
  return labels[status];
}

/**
 * Retourne le drapeau emoji d'un pays
 */
export function getCountryFlag(code: string): string {
  if (!code || code.length !== 2) return '🏳️';
  return String.fromCodePoint(
    ...code
      .toUpperCase()
      .split('')
      .map((c) => 127397 + c.charCodeAt(0))
  );
}

/**
 * Vérifie si un pays fait partie de l'UE
 */
export function isEUCountry(code: string): boolean {
  const euCountries = [
    'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
    'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
    'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
  ];
  return euCountries.includes(code.toUpperCase());
}

/**
 * Valide un numéro SIRET français
 */
export function validateSIRET(siret: string): boolean {
  if (!/^\d{14}$/.test(siret)) return false;

  // Algorithme de Luhn
  let sum = 0;
  for (let i = 0; i < 14; i++) {
    let digit = parseInt(siret[i]);
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  return sum % 10 === 0;
}

/**
 * Valide un numéro de TVA intracommunautaire français
 */
export function validateVATNumber(vat: string): boolean {
  if (!/^FR\d{11}$/.test(vat)) return false;

  const siren = vat.substring(4, 13);
  const key = parseInt(vat.substring(2, 4));
  const calculatedKey = (12 + 3 * (parseInt(siren) % 97)) % 97;

  return key === calculatedKey;
}

/**
 * Détermine la règle de TVA applicable
 */
export function getVATRule(
  serviceCountry: string,
  customerCountry: string,
  isB2B: boolean,
  hasVATNumber: boolean
): string {
  if (serviceCountry === 'FR' && customerCountry === 'FR') {
    return 'Standard FR 20%';
  }

  if (isB2B && hasVATNumber && isEUCountry(customerCountry)) {
    return `Autoliquidation B2B UE (${customerCountry})`;
  }

  if (!isEUCountry(customerCountry)) {
    return `Export hors-UE (${customerCountry}) - 0%`;
  }

  return `B2C UE (${customerCountry}) - TVA FR 20%`;
}

/**
 * Retourne le nom du pays à partir du code ISO
 */
export function getCountryName(code: string): string {
  const countries: Record<string, string> = {
    FR: 'France',
    DE: 'Allemagne',
    ES: 'Espagne',
    IT: 'Italie',
    BE: 'Belgique',
    NL: 'Pays-Bas',
    PT: 'Portugal',
    AT: 'Autriche',
    SE: 'Suède',
    DK: 'Danemark',
    FI: 'Finlande',
    IE: 'Irlande',
    PL: 'Pologne',
    RO: 'Roumanie',
    GR: 'Grèce',
    CZ: 'République tchèque',
    HU: 'Hongrie',
    GB: 'Royaume-Uni',
    US: 'États-Unis',
    CA: 'Canada',
    CH: 'Suisse',
  };
  return countries[code.toUpperCase()] || code;
}
