import { z } from 'zod';

/**
 * Structure de données harmonisée pour garantir la cohérence comptable
 */
export interface HarmonizedFiscalData {
  // Base de calcul : Total Actif
  totalActif: number;

  // Dérivés cohérents
  resultatNet: number;
  ca: number;
  capitauxPropres: number;
  ebe: number;
  dotationsAmortissements: number;
}

const RATIOS_STANDARDS = {
  RESULTAT_NET_SUR_ACTIF: 0.12,      // 12% ROA (rentabilité réaliste)
  CA_SUR_ACTIF: 1.8,                  // ratio turnover = 1.8x (plateforme tech)
  CAPITAUX_PROPRES_SUR_ACTIF: 0.52,   // 52% autonomie financière
  EBE_SUR_CA: 0.22,                   // 22% EBE (marge EBITDA réaliste)
  DOTATIONS_SUR_IMMO_BRUTES: 0.25,    // amortissement 4 ans moyen
  MARGE_BRUTE: 0.88,                  // 88% marge brute (après achats)
  IS_RATE: 0.25,                      // taux IS 25% (taux réduit PME)
};

/**
 * Génère des données comptables cohérentes à partir du total actif
 */
export function harmonizeFiscalData(totalActif: number): HarmonizedFiscalData {
  // 1. CA proportionnel à l'actif (Asset Turnover réaliste pour plateforme)
  const ca = totalActif * RATIOS_STANDARDS.CA_SUR_ACTIF;

  // 2. EBE réaliste (22% du CA pour une plateforme)
  const ebe = ca * RATIOS_STANDARDS.EBE_SUR_CA;

  // 3. Capitaux propres (autonomie financière 52%)
  const capitauxPropres = totalActif * RATIOS_STANDARDS.CAPITAUX_PROPRES_SUR_ACTIF;

  // 4. Dotations aux amortissements (basées sur immobilisations)
  const immobilisationsBrutes = totalActif * 0.12; // ~12% actif en immo (plateforme légère)
  const dotationsAmortissements = immobilisationsBrutes * RATIOS_STANDARDS.DOTATIONS_SUR_IMMO_BRUTES;

  // 5. Résultat net cohérent (ROA 12%)
  // Pour une marge nette de ~8-10% du CA, soit 12% du totalActif
  const resultatNet = totalActif * RATIOS_STANDARDS.RESULTAT_NET_SUR_ACTIF;

  return {
    totalActif,
    resultatNet: Math.round(resultatNet * 100) / 100,
    ca: Math.round(ca * 100) / 100,
    capitauxPropres: Math.round(capitauxPropres * 100) / 100,
    ebe: Math.round(ebe * 100) / 100,
    dotationsAmortissements: Math.round(dotationsAmortissements * 100) / 100,
  };
}

/**
 * Valide la cohérence des données comptables
 */
const CoherenceSchema = z.object({
  resultatNetBilan: z.number(),
  resultatNetCompteResultat: z.number(),
  dotationsCompteResultat: z.number(),
  dotationsTableauImmo: z.number(),
  totalActif: z.number(),
  totalPassif: z.number(),
}).refine(
  (data) => Math.abs(data.resultatNetBilan - data.resultatNetCompteResultat) < 0.01,
  { message: "Résultat net bilan ≠ résultat net compte de résultat" }
).refine(
  (data) => Math.abs(data.dotationsCompteResultat - data.dotationsTableauImmo) < 0.01,
  { message: "Dotations compte résultat ≠ dotations tableau immobilisations" }
).refine(
  (data) => Math.abs(data.totalActif - data.totalPassif) < 0.01,
  { message: "Actif ≠ Passif (bilan non équilibré)" }
);

export function validateCoherence(data: z.infer<typeof CoherenceSchema>): void {
  const result = CoherenceSchema.safeParse(data);

  if (!result.success) {
    const errors = result.error.issues.map(e => e.message).join('\n');
    throw new Error(`Incohérences comptables détectées:\n${errors}`);
  }
}
