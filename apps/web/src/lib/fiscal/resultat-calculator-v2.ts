import { harmonizeFiscalData } from './data-harmonizer';

export interface ResultatData {
  ca: number;
  achats: number;
  achatsConsommes: number; // Alias pour achats (comptabilité française)
  margeBrute: number;
  chargesExternes: number;
  impotsTaxes: number;
  salaires: number;
  chargesSociales: number;
  totalChargesPersonnel: number;
  autresCharges: number; // Autres charges d'exploitation
  totalChargesExploitation: number; // Total des charges d'exploitation
  ebe: number;
  dotationsAmortissements: number;
  resultatExploitation: number;
  produitsFinanciers: number;
  chargesFinancieres: number;
  resultatFinancier: number;
  resultatCourant: number;
  autresProduits: number; // Autres produits d'exploitation
  produitsExceptionnels: number;
  chargesExceptionnelles: number;
  resultatExceptionnel: number;
  impotSocietes: number;
  resultatNet: number;
}

export function calculateResultatV2(
  totalActif: number,
  dotationsAmortissements: number
): ResultatData {
  // Harmoniser à partir de l'actif
  const harmonized = harmonizeFiscalData(totalActif);

  const ca = harmonized.ca;
  const resultatNet = harmonized.resultatNet;
  const ebe = harmonized.ebe;

  // Décomposer le compte de résultat (ratios réalistes plateforme)
  const achats = ca * 0.12; // 12% CA (achats/services consommés)
  const margeBrute = ca - achats; // 88% CA

  const chargesExternes = ca * 0.24; // 24% CA (hosting, marketing, commissions bancaires, etc.)
  const impotsTaxes = ca * 0.015; // 1.5% CA (CFE, CVAE, taxes diverses)

  // Personnel = pour arriver à l'EBE (marge EBE 22%)
  const totalChargesPersonnel = margeBrute - chargesExternes - impotsTaxes - ebe;
  const salaires = totalChargesPersonnel * 0.68; // ~68% salaires bruts
  const chargesSociales = totalChargesPersonnel * 0.32; // ~32% charges sociales (FR réel)

  const resultatExploitation = ebe - dotationsAmortissements;

  const produitsFinanciers = ca * 0.008; // 0.8% CA (intérêts, placements)
  const chargesFinancieres = ca * 0.012; // 1.2% CA (intérêts emprunts, agios)
  const resultatFinancier = produitsFinanciers - chargesFinancieres;

  const resultatCourant = resultatExploitation + resultatFinancier;

  const produitsExceptionnels = ca * 0.003; // 0.3% CA (cessions, reprises)
  const chargesExceptionnelles = ca * 0.001; // 0.1% CA (litiges, amendes)
  const resultatExceptionnel = produitsExceptionnels - chargesExceptionnelles;

  const resultatAvantIS = resultatCourant + resultatExceptionnel;
  const impotSocietes = resultatAvantIS > 0 ? resultatAvantIS * 0.25 : 0; // Taux IS 25% (taux réduit PME)

  const resultatNetCalcule = resultatAvantIS - impotSocietes;

  // Ajustement final pour garantir cohérence
  const ajustement = resultatNet - resultatNetCalcule;

  // Calculs supplémentaires pour conformité PCG
  const autresCharges = ca * 0.008; // 0.8% CA (autres charges d'exploitation)
  const autresProduits = ca * 0.012; // 1.2% CA (autres produits gestion courante)
  const totalChargesExploitation = achats + chargesExternes + impotsTaxes + totalChargesPersonnel + dotationsAmortissements + autresCharges;

  return {
    ca: round(ca),
    achats: round(achats),
    achatsConsommes: round(achats), // Même valeur (alias comptable)
    margeBrute: round(margeBrute),
    chargesExternes: round(chargesExternes),
    impotsTaxes: round(impotsTaxes),
    salaires: round(salaires),
    chargesSociales: round(chargesSociales),
    totalChargesPersonnel: round(totalChargesPersonnel),
    autresCharges: round(autresCharges),
    totalChargesExploitation: round(totalChargesExploitation),
    ebe: round(ebe),
    dotationsAmortissements: round(dotationsAmortissements),
    resultatExploitation: round(resultatExploitation),
    autresProduits: round(autresProduits),
    produitsFinanciers: round(produitsFinanciers),
    chargesFinancieres: round(chargesFinancieres),
    resultatFinancier: round(resultatFinancier),
    resultatCourant: round(resultatCourant),
    produitsExceptionnels: round(produitsExceptionnels + ajustement), // ajustement ici
    chargesExceptionnelles: round(chargesExceptionnelles),
    resultatExceptionnel: round(resultatExceptionnel + ajustement),
    impotSocietes: round(impotSocietes),
    resultatNet: round(resultatNet), // Garanti cohérent avec bilan
  };
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}
