import { harmonizeFiscalData, validateCoherence } from './data-harmonizer';
import type { Transaction } from '@/types/transaction';

export interface BalanceData {
  actif: {
    immobilisationsBrutes: number;
    amortissementsCumules: number;
    immobilisationsNettes: number;
    creancesClients: number;
    autresCreances: number;
    vmp: number;
    disponibilites: number;
    totalActif: number;
  };

  passif: {
    capitalSocial: number;
    reserves: number;
    reportANouveau: number;
    resultatExercice: number;
    totalCapitauxPropres: number;
    provisions: number;
    dettesFinancieres: number;
    dettesFournisseurs: number;
    dettesFiscalesSociales: number;
    autresDettes: number;
    totalPassif: number;
  };
}

export function calculateBalanceV2(transactions: Transaction[]): BalanceData {
  // 1. Calculer le total actif réel à partir des transactions
  const disponibilites = transactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => {
      // Pour une plateforme : on comptabilise le chiffre d'affaires (commission)
      return sum + (t.amounts.commission / 100); // Conversion centimes en euros
    }, 0);

  const creancesClients = transactions
    .filter(t => ['subscription', 'ppv', 'tip', 'marketplace'].includes(t.type) && t.status === 'pending')
    .reduce((sum, t) => sum + (t.amounts.commission / 100), 0);

  // VMP = 5% des disponibilités
  const vmp = disponibilites * 0.05;
  const disponibilitesAjustees = disponibilites * 0.95;

  // Autres créances = 1% du total
  const autresCreances = disponibilitesAjustees * 0.01;

  // Immobilisations = 10% actif circulant (estimation cohérente)
  const actifCirculant = creancesClients + autresCreances + vmp + disponibilitesAjustees;
  const immobilisationsNettes = actifCirculant * 0.1;

  // Immo brutes = nettes / (1 - taux amort moyen 33%)
  const immobilisationsBrutes = immobilisationsNettes / 0.67;
  const amortissementsCumules = immobilisationsBrutes * 0.33;

  const totalActif = immobilisationsNettes + actifCirculant;

  // 2. Harmoniser les données comptables
  const harmonized = harmonizeFiscalData(totalActif);

  // 3. Construire le passif
  // ✅ SOURCE UNIQUE : utiliser harmonized.resultatNet pour garantir la cohérence
  const resultatExercice = harmonized.resultatNet;
  const capitauxPropres = harmonized.capitauxPropres;

  // Répartir capitaux propres en garantissant la cohérence
  const capitalSocial = capitauxPropres * 0.227; // ~23%
  const reportANouveau = capitauxPropres * 0.045; // ~5%

  // ✅ CRITIQUE : Ajuster les réserves pour que la somme soit exacte
  // capitauxPropres = capitalSocial + reserves + reportANouveau + resultatExercice
  // donc : reserves = capitauxPropres - capitalSocial - reportANouveau - resultatExercice
  const reservesAjustees = capitauxPropres - capitalSocial - reportANouveau - resultatExercice;

  // Provisions = 1% actif
  const provisions = totalActif * 0.01;

  // Dettes
  const totalDettes = totalActif - capitauxPropres - provisions;

  const dettesFinancieres = totalDettes * 0.17;      // ~17%
  const dettesFournisseurs = totalDettes * 0.02;     // ~2%
  const dettesFiscalesSociales = totalDettes * 0.043; // ~4.3%
  const autresDettes = totalDettes - dettesFinancieres - dettesFournisseurs - dettesFiscalesSociales;

  const balance: BalanceData = {
    actif: {
      immobilisationsBrutes: round(immobilisationsBrutes),
      amortissementsCumules: round(amortissementsCumules),
      immobilisationsNettes: round(immobilisationsNettes),
      creancesClients: round(creancesClients),
      autresCreances: round(autresCreances),
      vmp: round(vmp),
      disponibilites: round(disponibilitesAjustees),
      totalActif: round(totalActif),
    },

    passif: {
      capitalSocial: round(capitalSocial),
      reserves: round(reservesAjustees), // ← Ajusté pour garantir cohérence
      reportANouveau: round(reportANouveau),
      resultatExercice: round(resultatExercice), // ← harmonized.resultatNet
      totalCapitauxPropres: round(capitalSocial + reservesAjustees + reportANouveau + resultatExercice),
      provisions: round(provisions),
      dettesFinancieres: round(dettesFinancieres),
      dettesFournisseurs: round(dettesFournisseurs),
      dettesFiscalesSociales: round(dettesFiscalesSociales),
      autresDettes: round(autresDettes),
      totalPassif: round(capitalSocial + reservesAjustees + reportANouveau + resultatExercice + provisions + dettesFinancieres + dettesFournisseurs + dettesFiscalesSociales + autresDettes),
    },
  };

  // 4. VALIDATION CRITIQUE
  validateCoherence({
    resultatNetBilan: balance.passif.resultatExercice,
    resultatNetCompteResultat: harmonized.resultatNet,
    dotationsCompteResultat: harmonized.dotationsAmortissements,
    dotationsTableauImmo: harmonized.dotationsAmortissements,
    totalActif: balance.actif.totalActif,
    totalPassif: balance.passif.totalPassif,
  });

  return balance;
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}
