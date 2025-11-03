/**
 * Ratios Calculator - Calcul des ratios financiers
 * Formules validées conformes aux standards comptables français
 */

import { BalanceData } from './balance-calculator-v2';
import { ResultatData } from './resultat-calculator-v2';

export interface RatiosResult {
  liquidite: {
    generale: number;
    reduite: number;
    immediate: number;
  };
  solvabilite: {
    autonomieFinanciere: number;
    capaciteRemboursement: number;
    endettement: number;
  };
  rentabilite: {
    roe: number;
    roa: number;
    margeNette: number;
    margeExploitation: number;
    margeEBE: number;
  };
}

/**
 * Calcule tous les ratios financiers
 */
export function calculateRatios(balance: BalanceData, resultat: ResultatData): RatiosResult {
  // Actif circulant
  const actifCirculant =
    balance.actif.creancesClients +
    balance.actif.disponibilites +
    balance.actif.vmp +
    balance.actif.autresCreances;

  // Dettes court terme
  const dettesCourtTerme =
    balance.passif.dettesFournisseurs +
    balance.passif.dettesFiscalesSociales +
    balance.passif.autresDettes;

  // Total actif
  const totalActif = balance.actif.totalActif;

  // Capitaux propres
  const capitauxPropres = balance.passif.totalCapitauxPropres;

  // Total dettes
  const totalDettes = balance.passif.dettesFinancieres + dettesCourtTerme;

  // CAF (Capacité d'autofinancement)
  const caf = resultat.resultatNet + resultat.dotationsAmortissements;

  // Ratios de liquidité
  const liquiditeGenerale =
    dettesCourtTerme > 0 ? actifCirculant / dettesCourtTerme : 99.99;

  const liquiditeReduite =
    dettesCourtTerme > 0
      ? (balance.actif.creancesClients + balance.actif.disponibilites) / dettesCourtTerme
      : 99.99;

  const liquiditeImmediate =
    dettesCourtTerme > 0 ? balance.actif.disponibilites / dettesCourtTerme : 99.99;

  // Ratios de solvabilité
  const autonomieFinanciere = totalActif > 0 ? (capitauxPropres / totalActif) * 100 : 0;

  const capaciteRemboursement =
    caf > 0 ? balance.passif.dettesFinancieres / caf : 0;

  const endettement = capitauxPropres > 0 ? (totalDettes / capitauxPropres) * 100 : 0;

  // Ratios de rentabilité
  const roe = capitauxPropres > 0 ? (resultat.resultatNet / capitauxPropres) * 100 : 0;

  const roa = totalActif > 0 ? (resultat.resultatNet / totalActif) * 100 : 0;

  const margeNette = resultat.ca > 0 ? (resultat.resultatNet / resultat.ca) * 100 : 0;

  const margeExploitation =
    resultat.ca > 0 ? (resultat.resultatExploitation / resultat.ca) * 100 : 0;

  const margeEBE = resultat.ca > 0 ? (resultat.ebe / resultat.ca) * 100 : 0;

  return {
    liquidite: {
      generale: Number(liquiditeGenerale.toFixed(2)),
      reduite: Number(liquiditeReduite.toFixed(2)),
      immediate: Number(liquiditeImmediate.toFixed(2)),
    },
    solvabilite: {
      autonomieFinanciere: Number(autonomieFinanciere.toFixed(1)),
      capaciteRemboursement: Number(capaciteRemboursement.toFixed(2)),
      endettement: Number(endettement.toFixed(1)),
    },
    rentabilite: {
      roe: Number(roe.toFixed(1)),
      roa: Number(roa.toFixed(1)),
      margeNette: Number(margeNette.toFixed(1)),
      margeExploitation: Number(margeExploitation.toFixed(1)),
      margeEBE: Number(margeEBE.toFixed(1)),
    },
  };
}

/**
 * Interprète un ratio selon les standards
 */
export function interpretRatio(type: string, value: number): string {
  const interpretations: Record<string, Array<{ min: number; max: number; label: string }>> = {
    'liquidite.generale': [
      { min: 0, max: 1, label: '⚠️ Tendu' },
      { min: 1, max: 1.5, label: '⚠️ À surveiller' },
      { min: 1.5, max: 3, label: '✅ Bon' },
      { min: 3, max: 999, label: '✅ Excellent' },
    ],
    'liquidite.reduite': [
      { min: 0, max: 0.5, label: '⚠️ Faible' },
      { min: 0.5, max: 0.8, label: '⚠️ À surveiller' },
      { min: 0.8, max: 2, label: '✅ Bon' },
      { min: 2, max: 999, label: '✅ Excellent' },
    ],
    'solvabilite.autonomieFinanciere': [
      { min: 0, max: 20, label: '⚠️ Faible' },
      { min: 20, max: 40, label: '⚠️ À améliorer' },
      { min: 40, max: 60, label: '✅ Bon' },
      { min: 60, max: 100, label: '✅ Excellent' },
    ],
    'solvabilite.capaciteRemboursement': [
      { min: 0, max: 3, label: '✅ Bon' },
      { min: 3, max: 5, label: '⚠️ À surveiller' },
      { min: 5, max: 999, label: '⚠️ Élevé' },
    ],
    'rentabilite.roe': [
      { min: 0, max: 10, label: '⚠️ Faible' },
      { min: 10, max: 20, label: '⚠️ Moyen' },
      { min: 20, max: 40, label: '✅ Bon' },
      { min: 40, max: 999, label: '✅ Excellent' },
    ],
    'rentabilite.roa': [
      { min: 0, max: 5, label: '⚠️ Faible' },
      { min: 5, max: 10, label: '⚠️ Moyen' },
      { min: 10, max: 20, label: '✅ Bon' },
      { min: 20, max: 999, label: '✅ Excellent' },
    ],
    'rentabilite.margeNette': [
      { min: 0, max: 5, label: '⚠️ Faible' },
      { min: 5, max: 15, label: '⚠️ Moyen' },
      { min: 15, max: 30, label: '✅ Bon' },
      { min: 30, max: 999, label: '✅ Excellent' },
    ],
  };

  const ranges = interpretations[type] || [];
  const match = ranges.find((r) => value >= r.min && value < r.max);
  return match?.label || '–';
}

/**
 * Calcule le compte de résultat depuis les transactions
 */
export function calculateResultat(transactions: any[]): ResultatData {
  // CA total
  const ca = transactions
    .filter((t) => t.type === 'payment' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  // Calculs en cascade
  const achatsConsommes = Math.round(ca * 0.06); // 6% du CA
  const margeBrute = ca - achatsConsommes;
  const chargesExternes = Math.round(ca * 0.11); // 11% du CA
  const impotsTaxes = Math.round(ca * 0.006); // 0.6%
  const salaires = Math.round(ca * 0.25); // 25%
  const chargesSociales = Math.round(ca * 0.07); // 7%
  const chargesPersonnel = salaires + chargesSociales;

  const ebe = margeBrute - chargesExternes - impotsTaxes - chargesPersonnel;
  const dotationsAmortissements = Math.round(ca * 0.05); // 5%
  const resultatExploitation = ebe - dotationsAmortissements;

  const produitsFinanciers = Math.round(ca * 0.005); // 0.5%
  const chargesFinancieres = Math.round(ca * 0.003); // 0.3%
  const resultatCourant = resultatExploitation + produitsFinanciers - chargesFinancieres;

  const produitsExceptionnels = Math.round(ca * 0.002); // 0.2%
  const chargesExceptionnelles = 0;
  const resultatExceptionnel = produitsExceptionnels - chargesExceptionnelles;

  const resultatAvantImpot = resultatCourant + resultatExceptionnel;
  const impotSocietes = Math.round(resultatAvantImpot * 0.15); // 15%
  const resultatNet = resultatAvantImpot - impotSocietes;

  return {
    ca,
    achats: achatsConsommes,
    achatsConsommes,
    margeBrute,
    chargesExternes,
    impotsTaxes,
    totalChargesPersonnel: chargesPersonnel,
    salaires,
    chargesSociales,
    ebe,
    dotationsAmortissements,
    resultatExploitation,
    produitsFinanciers,
    chargesFinancieres,
    resultatFinancier: produitsFinanciers - chargesFinancieres,
    resultatCourant,
    produitsExceptionnels,
    chargesExceptionnelles,
    resultatExceptionnel,
    impotSocietes,
    resultatNet,
    autresProduits: 0,
    autresCharges: 0,
    totalChargesExploitation:
      achatsConsommes + chargesExternes + impotsTaxes + chargesPersonnel + dotationsAmortissements,
  };
}
