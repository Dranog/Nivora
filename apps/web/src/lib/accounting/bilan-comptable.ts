/**
 * Bilan comptable
 * Génération du bilan actif/passif selon le PCG
 */

import { genererBalance, obtenirClasseCompte, type Balance, type LigneBalance } from './grand-livre';

// ===============================
// TYPES
// ===============================

export interface PosteBilan {
  code: string;
  libelle: string;
  montant: number; // in cents
  details: LigneBalance[];
}

export interface CategorieBilan {
  titre: string;
  postes: PosteBilan[];
  sousTotal: number; // in cents
}

export interface Actif {
  immobilisations: CategorieBilan;
  actifCirculant: CategorieBilan;
  tresorerie: CategorieBilan;
  total: number; // in cents
}

export interface Passif {
  capitaux: CategorieBilan;
  dettes: CategorieBilan;
  tresoreriPassif: CategorieBilan;
  total: number; // in cents
}

export interface BilanComptable {
  exercice: number;
  dateDebut: Date;
  dateFin: Date;
  actif: Actif;
  passif: Passif;
  equilibre: boolean;
  ecart: number; // in cents
}

// ===============================
// STRUCTURE DU BILAN
// ===============================

/**
 * Définition de la structure du bilan selon le PCG
 */
const STRUCTURE_ACTIF = {
  immobilisations: {
    titre: 'Immobilisations',
    classes: [2], // Classe 2
    postes: [
      { code: '20', libelle: 'Immobilisations incorporelles' },
      { code: '21', libelle: 'Immobilisations corporelles' },
      { code: '27', libelle: 'Autres immobilisations financières' },
      { code: '28', libelle: 'Amortissements des immobilisations (-)' },
      { code: '29', libelle: 'Provisions pour dépréciation (-)' },
    ],
  },
  actifCirculant: {
    titre: 'Actif circulant',
    classes: [3, 4], // Classes 3 et 4 (débiteurs)
    postes: [
      { code: '37', libelle: 'Stocks' },
      { code: '41', libelle: 'Clients et comptes rattachés' },
      { code: '42', libelle: 'Personnel et comptes rattachés (débiteurs)' },
      { code: '43', libelle: 'Organismes sociaux (débiteurs)' },
      { code: '44', libelle: 'État (débiteurs)' },
      { code: '46', libelle: 'Débiteurs divers' },
      { code: '47', libelle: 'Comptes transitoires (débiteurs)' },
    ],
  },
  tresorerie: {
    titre: 'Trésorerie active',
    classes: [5], // Classe 5
    postes: [
      { code: '51', libelle: 'Banques' },
      { code: '53', libelle: 'Caisse' },
      { code: '58', libelle: 'Virements internes' },
    ],
  },
};

const STRUCTURE_PASSIF = {
  capitaux: {
    titre: 'Capitaux propres',
    classes: [1], // Classe 1
    postes: [
      { code: '10', libelle: 'Capital et réserves' },
      { code: '11', libelle: 'Report à nouveau' },
      { code: '12', libelle: 'Résultat de l\'exercice' },
      { code: '13', libelle: 'Provisions' },
      { code: '16', libelle: 'Emprunts et dettes assimilées' },
    ],
  },
  dettes: {
    titre: 'Dettes',
    classes: [4], // Classe 4 (créditeurs)
    postes: [
      { code: '40', libelle: 'Fournisseurs et comptes rattachés' },
      { code: '42', libelle: 'Personnel (créditeurs)' },
      { code: '43', libelle: 'Organismes sociaux (créditeurs)' },
      { code: '44', libelle: 'État (créditeurs)' },
      { code: '46', libelle: 'Créditeurs divers' },
      { code: '47', libelle: 'Comptes transitoires (créditeurs)' },
    ],
  },
  tresoreriPassif: {
    titre: 'Trésorerie passive',
    classes: [5], // Classe 5 (créditeurs)
    postes: [
      { code: '51', libelle: 'Concours bancaires courants' },
      { code: '52', libelle: 'Banques (créditeurs)' },
    ],
  },
};

// ===============================
// GÉNÉRATION DU BILAN
// ===============================

/**
 * Génère le bilan comptable (Actif/Passif) à partir de la balance
 * @param exercice - Année de l'exercice
 * @param dateDebut - Date de début (optionnel)
 * @param dateFin - Date de fin (optionnel)
 */
export async function genererBilanComptable(
  exercice: number,
  dateDebut?: Date,
  dateFin?: Date
): Promise<BilanComptable> {
  console.log(`[BILAN] Génération du bilan pour l'exercice ${exercice}`);

  // Générer la balance
  const balance = await genererBalance(exercice, dateDebut, dateFin);

  if (!balance.equilibree) {
    console.warn('[BILAN] ⚠️  Balance déséquilibrée - le bilan peut être inexact');
  }

  // Construire l'actif
  const actif = construireActif(balance);

  // Construire le passif
  const passif = construirePassif(balance);

  // Vérifier l'équilibre actif = passif
  const ecart = actif.total - passif.total;
  const equilibre = Math.abs(ecart) < 1; // Tolérance d'1 centime

  console.log(`[BILAN] Actif: ${(actif.total / 100).toFixed(2)} € | Passif: ${(passif.total / 100).toFixed(2)} € | Équilibre: ${equilibre ? 'OUI' : 'NON'}`);

  if (!equilibre) {
    console.warn(`[BILAN] ⚠️  Écart actif/passif: ${(ecart / 100).toFixed(2)} €`);
  }

  return {
    exercice,
    dateDebut: balance.dateDebut,
    dateFin: balance.dateFin,
    actif,
    passif,
    equilibre,
    ecart,
  };
}

/**
 * Construit l'actif du bilan à partir de la balance
 */
function construireActif(balance: Balance): Actif {
  const immobilisations = construireCategorie(
    STRUCTURE_ACTIF.immobilisations,
    balance.lignes,
    'debiteur'
  );

  const actifCirculant = construireCategorie(
    STRUCTURE_ACTIF.actifCirculant,
    balance.lignes,
    'debiteur'
  );

  const tresorerie = construireCategorie(
    STRUCTURE_ACTIF.tresorerie,
    balance.lignes,
    'debiteur'
  );

  const total = immobilisations.sousTotal + actifCirculant.sousTotal + tresorerie.sousTotal;

  return {
    immobilisations,
    actifCirculant,
    tresorerie,
    total,
  };
}

/**
 * Construit le passif du bilan à partir de la balance
 */
function construirePassif(balance: Balance): Passif {
  const capitaux = construireCategorie(
    STRUCTURE_PASSIF.capitaux,
    balance.lignes,
    'crediteur'
  );

  const dettes = construireCategorie(
    STRUCTURE_PASSIF.dettes,
    balance.lignes,
    'crediteur'
  );

  const tresoreriPassif = construireCategorie(
    STRUCTURE_PASSIF.tresoreriPassif,
    balance.lignes,
    'crediteur'
  );

  const total = capitaux.sousTotal + dettes.sousTotal + tresoreriPassif.sousTotal;

  return {
    capitaux,
    dettes,
    tresoreriPassif,
    total,
  };
}

/**
 * Construit une catégorie du bilan (ex: Immobilisations, Actif circulant, etc.)
 */
function construireCategorie(
  structure: {
    titre: string;
    classes: number[];
    postes: Array<{ code: string; libelle: string }>;
  },
  lignesBalance: LigneBalance[],
  sens: 'debiteur' | 'crediteur'
): CategorieBilan {
  const postes: PosteBilan[] = [];

  for (const posteStructure of structure.postes) {
    const lignesFiltrees = lignesBalance.filter((ligne) => {
      // Vérifier si le compte commence par le code du poste
      const correspondsPoste = ligne.comptePCG.startsWith(posteStructure.code);

      // Vérifier si le compte appartient aux bonnes classes
      const classe = obtenirClasseCompte(ligne.comptePCG);
      const correspondClasse = structure.classes.includes(classe);

      // Vérifier le sens (débiteur ou créditeur)
      const solde = sens === 'debiteur' ? ligne.soldeDebiteur : ligne.soldeCrediteur;
      const aSolde = solde > 0;

      return correspondsPoste && correspondClasse && aSolde;
    });

    // Calculer le montant du poste
    const montant = lignesFiltrees.reduce((sum, ligne) => {
      return sum + (sens === 'debiteur' ? ligne.soldeDebiteur : ligne.soldeCrediteur);
    }, 0);

    // Ajouter le poste seulement s'il a un montant
    if (montant > 0 || lignesFiltrees.length > 0) {
      postes.push({
        code: posteStructure.code,
        libelle: posteStructure.libelle,
        montant,
        details: lignesFiltrees,
      });
    }
  }

  const sousTotal = postes.reduce((sum, poste) => sum + poste.montant, 0);

  return {
    titre: structure.titre,
    postes,
    sousTotal,
  };
}

// ===============================
// RATIOS & ANALYSE
// ===============================

export interface RatiosBilan {
  fondsDeRoulement: number; // Fonds de roulement = Capitaux permanents - Actif immobilisé
  besoinFondsRoulement: number; // BFR = Actif circulant - Dettes court terme
  tresorerieNette: number; // Trésorerie nette = FR - BFR
  ratioLiquidite: number; // Actif circulant / Dettes court terme
  ratioSolvabilite: number; // Capitaux propres / Total passif
  ratioEndettement: number; // Dettes / Capitaux propres
}

/**
 * Calcule les ratios financiers à partir du bilan
 */
export function calculerRatios(bilan: BilanComptable): RatiosBilan {
  const actifImmobilise = bilan.actif.immobilisations.sousTotal;
  const actifCirculant = bilan.actif.actifCirculant.sousTotal;
  const tresorerieActive = bilan.actif.tresorerie.sousTotal;

  const capitauxPropres = bilan.passif.capitaux.sousTotal;
  const dettes = bilan.passif.dettes.sousTotal;
  const tresoreriePassive = bilan.passif.tresoreriPassif.sousTotal;

  const capitauxPermanents = capitauxPropres; // Simplifié (devrait inclure dettes LT)
  const dettesCourtTerme = dettes + tresoreriePassive;

  const fondsDeRoulement = capitauxPermanents - actifImmobilise;
  const besoinFondsRoulement = actifCirculant - dettesCourtTerme;
  const tresorerieNette = tresorerieActive - tresoreriePassive;

  const ratioLiquidite = dettesCourtTerme > 0 ? actifCirculant / dettesCourtTerme : 0;
  const ratioSolvabilite = bilan.passif.total > 0 ? capitauxPropres / bilan.passif.total : 0;
  const ratioEndettement = capitauxPropres > 0 ? dettes / capitauxPropres : 0;

  return {
    fondsDeRoulement,
    besoinFondsRoulement,
    tresorerieNette,
    ratioLiquidite,
    ratioSolvabilite,
    ratioEndettement,
  };
}

// ===============================
// EXPORTS
// ===============================

/**
 * Exporte le bilan au format CSV
 */
export function exporterBilanCSV(bilan: BilanComptable): string {
  let csv = `BILAN COMPTABLE - Exercice ${bilan.exercice}\n`;
  csv += `Période: ${bilan.dateDebut.toISOString().split('T')[0]} au ${bilan.dateFin.toISOString().split('T')[0]}\n\n`;

  // Actif
  csv += 'ACTIF\n';
  csv += 'Catégorie;Poste;Montant (€)\n';

  for (const categorie of [bilan.actif.immobilisations, bilan.actif.actifCirculant, bilan.actif.tresorerie]) {
    csv += `${categorie.titre};;${(categorie.sousTotal / 100).toFixed(2)}\n`;
    for (const poste of categorie.postes) {
      csv += `;${poste.libelle};${(poste.montant / 100).toFixed(2)}\n`;
    }
  }

  csv += `\nTOTAL ACTIF;;${(bilan.actif.total / 100).toFixed(2)}\n\n`;

  // Passif
  csv += 'PASSIF\n';
  csv += 'Catégorie;Poste;Montant (€)\n';

  for (const categorie of [bilan.passif.capitaux, bilan.passif.dettes, bilan.passif.tresoreriPassif]) {
    csv += `${categorie.titre};;${(categorie.sousTotal / 100).toFixed(2)}\n`;
    for (const poste of categorie.postes) {
      csv += `;${poste.libelle};${(poste.montant / 100).toFixed(2)}\n`;
    }
  }

  csv += `\nTOTAL PASSIF;;${(bilan.passif.total / 100).toFixed(2)}\n\n`;

  // Équilibre
  csv += `Équilibre:;${bilan.equilibre ? 'OUI' : 'NON'}\n`;
  if (!bilan.equilibre) {
    csv += `Écart:;${(bilan.ecart / 100).toFixed(2)} €\n`;
  }

  return csv;
}

/**
 * Exporte les ratios au format CSV
 */
export function exporterRatiosCSV(ratios: RatiosBilan): string {
  let csv = 'RATIOS FINANCIERS\n';
  csv += 'Ratio;Valeur\n';
  csv += `Fonds de roulement;${(ratios.fondsDeRoulement / 100).toFixed(2)} €\n`;
  csv += `Besoin en fonds de roulement;${(ratios.besoinFondsRoulement / 100).toFixed(2)} €\n`;
  csv += `Trésorerie nette;${(ratios.tresorerieNette / 100).toFixed(2)} €\n`;
  csv += `Ratio de liquidité;${ratios.ratioLiquidite.toFixed(2)}\n`;
  csv += `Ratio de solvabilité;${(ratios.ratioSolvabilite * 100).toFixed(2)}%\n`;
  csv += `Ratio d'endettement;${(ratios.ratioEndettement * 100).toFixed(2)}%\n`;
  return csv;
}
