/**
 * Gestion des immobilisations et amortissements
 * Conforme au PCG (Plan Comptable Général) français
 */

import { z } from 'zod';

// ===============================
// SCHÉMAS ZOD
// ===============================

export const ImmobilisationSchema = z.object({
  id: z.string(),
  nature: z.enum(['logiciel', 'materiel_info', 'mobilier', 'vehicule', 'agencement', 'construction']),
  libelle: z.string().min(1).max(200),
  dateAcquisition: z.date(),
  valeurAcquisition: z.number().positive(),
  comptePCG: z.string(),
  compteAmortissement: z.string(),
  dureeAmortissement: z.number().int().positive(),
  methode: z.enum(['lineaire', 'degressif']),
  tauxAmortissement: z.number().positive(),
  amortissementsCumules: z.number().min(0),
  vnc: z.number().min(0), // Valeur Nette Comptable
  dateCession: z.date().optional(),
  valeurCession: z.number().optional(),
  statut: z.enum(['en_cours', 'totalement_amorti', 'cede']).optional(),
});

export type Immobilisation = z.infer<typeof ImmobilisationSchema>;

// ===============================
// CONSTANTES
// ===============================

/**
 * Durées d'amortissement standards selon le PCG
 */
export const DUREES_AMORTISSEMENT: Record<Immobilisation['nature'], number> = {
  logiciel: 3,
  materiel_info: 3,
  mobilier: 10,
  vehicule: 5,
  agencement: 10,
  construction: 20,
};

/**
 * Comptes PCG pour immobilisations et amortissements
 */
export const COMPTES_PCG: Record<
  Immobilisation['nature'],
  { immo: string; amort: string; libelle: string }
> = {
  logiciel: {
    immo: '205000',
    amort: '280500',
    libelle: 'Logiciels',
  },
  materiel_info: {
    immo: '218300',
    amort: '281830',
    libelle: 'Matériel informatique',
  },
  mobilier: {
    immo: '218400',
    amort: '281840',
    libelle: 'Mobilier',
  },
  vehicule: {
    immo: '218200',
    amort: '281820',
    libelle: 'Véhicules',
  },
  agencement: {
    immo: '213500',
    amort: '281350',
    libelle: 'Installations, agencements',
  },
  construction: {
    immo: '213000',
    amort: '281300',
    libelle: 'Constructions',
  },
};

/**
 * Coefficients pour amortissement dégressif selon durée
 */
const COEFFICIENTS_DEGRESSIF: Record<number, number> = {
  3: 1.25,
  4: 1.25,
  5: 1.75,
  6: 2.25,
  7: 2.25,
  8: 2.25,
};

// ===============================
// CRÉATION D'IMMOBILISATION
// ===============================

/**
 * Crée une nouvelle immobilisation avec paramètres par défaut
 */
export function creerImmobilisation(
  nature: Immobilisation['nature'],
  libelle: string,
  dateAcquisition: Date,
  valeurAcquisition: number,
  methode: 'lineaire' | 'degressif' = 'lineaire'
): Immobilisation {
  const duree = DUREES_AMORTISSEMENT[nature];
  const tauxLineaire = 1 / duree;
  const comptes = COMPTES_PCG[nature];

  return {
    id: `IMM-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    nature,
    libelle,
    dateAcquisition,
    valeurAcquisition,
    comptePCG: comptes.immo,
    compteAmortissement: comptes.amort,
    dureeAmortissement: duree,
    methode,
    tauxAmortissement: tauxLineaire,
    amortissementsCumules: 0,
    vnc: valeurAcquisition,
    statut: 'en_cours',
  };
}

// ===============================
// CALCUL D'AMORTISSEMENTS
// ===============================

/**
 * Calcule la dotation aux amortissements pour une année donnée
 * Gère le prorata temporis et les limites
 */
export function calculerDotationAnnuelle(immo: Immobilisation, annee: number): number {
  // Si déjà totalement amorti
  if (immo.amortissementsCumules >= immo.valeurAcquisition) {
    return 0;
  }

  const dateDebut = new Date(immo.dateAcquisition);
  const anneeAcquisition = dateDebut.getFullYear();

  if (immo.methode === 'lineaire') {
    return calculerAmortissementLineaire(immo, annee, anneeAcquisition, dateDebut);
  } else {
    return calculerAmortissementDegressif(immo, annee, anneeAcquisition, dateDebut);
  }
}

/**
 * Amortissement linéaire avec prorata temporis
 */
function calculerAmortissementLineaire(
  immo: Immobilisation,
  annee: number,
  anneeAcquisition: number,
  dateDebut: Date
): number {
  const dotationAnnuelle = immo.valeurAcquisition * immo.tauxAmortissement;

  // Prorata temporis première année
  if (annee === anneeAcquisition) {
    const finAnnee = new Date(annee, 11, 31, 23, 59, 59);
    const joursRestants = Math.ceil((finAnnee.getTime() - dateDebut.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const totalJours = isLeapYear(annee) ? 366 : 365;
    return (dotationAnnuelle * joursRestants) / totalJours;
  }

  // Dernière année : ne pas dépasser la valeur d'acquisition
  const dotationRestante = immo.valeurAcquisition - immo.amortissementsCumules;
  return Math.min(dotationAnnuelle, dotationRestante);
}

/**
 * Amortissement dégressif avec bascule vers linéaire
 */
function calculerAmortissementDegressif(
  immo: Immobilisation,
  annee: number,
  anneeAcquisition: number,
  dateDebut: Date
): number {
  const coefficient = COEFFICIENTS_DEGRESSIF[immo.dureeAmortissement] || 1.25;
  const tauxDegressif = immo.tauxAmortissement * coefficient;

  // Prorata temporis première année (en mois)
  if (annee === anneeAcquisition) {
    const moisRestants = 12 - dateDebut.getMonth();
    return (immo.valeurAcquisition * tauxDegressif * moisRestants) / 12;
  }

  // VNC = Valeur résiduelle
  const vnc = immo.valeurAcquisition - immo.amortissementsCumules;

  // Calcul dégressif
  const dotationDegressive = vnc * tauxDegressif;

  // Calcul linéaire sur durée restante
  const anneesEcoulees = annee - anneeAcquisition;
  const dureeRestante = Math.max(1, immo.dureeAmortissement - anneesEcoulees);
  const dotationLineaire = vnc / dureeRestante;

  // Bascule vers linéaire si plus avantageux
  return Math.max(dotationDegressive, dotationLineaire);
}

// ===============================
// PLAN D'AMORTISSEMENT
// ===============================

export interface LignePlanAmortissement {
  annee: number;
  vncDebut: number;
  dotation: number;
  amortCumules: number;
  vncFin: number;
}

/**
 * Génère le plan d'amortissement complet sur toute la durée
 */
export function genererPlanAmortissement(immo: Immobilisation): LignePlanAmortissement[] {
  const plan: LignePlanAmortissement[] = [];
  const anneeDebut = new Date(immo.dateAcquisition).getFullYear();

  let amortCumules = 0;
  let vnc = immo.valeurAcquisition;

  for (let i = 0; i <= immo.dureeAmortissement + 1; i++) {
    const annee = anneeDebut + i;
    const vncDebut = vnc;

    // Créer une copie de l'immobilisation avec les cumuls actuels
    const immoTemp: Immobilisation = {
      ...immo,
      amortissementsCumules: amortCumules,
      vnc,
    };

    const dotation = calculerDotationAnnuelle(immoTemp, annee);

    amortCumules += dotation;
    vnc = immo.valeurAcquisition - amortCumules;

    // Arrondir pour éviter les problèmes de précision
    vnc = Math.max(0, vnc);

    plan.push({
      annee,
      vncDebut: round(vncDebut),
      dotation: round(dotation),
      amortCumules: round(amortCumules),
      vncFin: round(vnc),
    });

    // Arrêter si totalement amorti
    if (amortCumules >= immo.valeurAcquisition || dotation === 0) {
      break;
    }
  }

  return plan;
}

// ===============================
// CESSION D'IMMOBILISATION
// ===============================

export interface ResultatCession {
  vnc: number;
  valeurCession: number;
  resultat: number;
  type: 'plus-value' | 'moins-value' | 'neutre';
  comptesImpactes: {
    compte: string;
    libelle: string;
    debit: number;
    credit: number;
  }[];
}

/**
 * Calcule le résultat d'une cession d'immobilisation
 * Plus-value si prix de cession > VNC
 * Moins-value si prix de cession < VNC
 */
export function calculerPlusOuMoinsValue(
  immo: Immobilisation,
  valeurCession: number
): ResultatCession {
  const vnc = immo.vnc;
  const resultat = valeurCession - vnc;

  const comptesImpactes = [
    // Sortie de l'immobilisation
    {
      compte: immo.compteAmortissement,
      libelle: 'Amortissements cumulés',
      debit: immo.amortissementsCumules,
      credit: 0,
    },
    {
      compte: immo.comptePCG,
      libelle: 'Immobilisation (sortie)',
      debit: 0,
      credit: immo.valeurAcquisition,
    },
    // Encaissement
    {
      compte: '512000',
      libelle: 'Banque',
      debit: valeurCession,
      credit: 0,
    },
  ];

  // Plus-value ou moins-value
  if (resultat > 0) {
    comptesImpactes.push({
      compte: '775000',
      libelle: 'Produits des cessions d\'immobilisations',
      debit: 0,
      credit: vnc,
    });
    comptesImpactes.push({
      compte: '775000',
      libelle: 'Plus-value de cession',
      debit: 0,
      credit: resultat,
    });
  } else if (resultat < 0) {
    comptesImpactes.push({
      compte: '675000',
      libelle: 'Valeur nette comptable des immobilisations cédées',
      debit: vnc,
      credit: 0,
    });
    comptesImpactes.push({
      compte: '675000',
      libelle: 'Moins-value de cession',
      debit: Math.abs(resultat),
      credit: 0,
    });
  } else {
    comptesImpactes.push({
      compte: '775000',
      libelle: 'Produits des cessions (neutre)',
      debit: 0,
      credit: vnc,
    });
  }

  return {
    vnc: round(vnc),
    valeurCession: round(valeurCession),
    resultat: round(resultat),
    type: resultat > 0 ? 'plus-value' : resultat < 0 ? 'moins-value' : 'neutre',
    comptesImpactes: comptesImpactes.map((c) => ({
      ...c,
      debit: round(c.debit),
      credit: round(c.credit),
    })),
  };
}

/**
 * Enregistre une cession d'immobilisation
 */
export function cederImmobilisation(
  immo: Immobilisation,
  dateCession: Date,
  valeurCession: number
): Immobilisation {
  return {
    ...immo,
    dateCession,
    valeurCession,
    statut: 'cede',
  };
}

// ===============================
// UTILITAIRES
// ===============================

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Calcule le total des VNC de toutes les immobilisations
 */
export function calculerTotalVNC(immobilisations: Immobilisation[]): number {
  return round(immobilisations.reduce((sum, immo) => sum + immo.vnc, 0));
}

/**
 * Calcule la dotation totale pour un exercice
 */
export function calculerDotationTotale(immobilisations: Immobilisation[], annee: number): number {
  return round(
    immobilisations
      .filter((immo) => immo.statut === 'en_cours')
      .reduce((sum, immo) => sum + calculerDotationAnnuelle(immo, annee), 0)
  );
}

/**
 * Exporte les immobilisations au format CSV
 */
export function exporterImmobilisationsCSV(immobilisations: Immobilisation[]): string {
  const header =
    'ID;Libellé;Nature;Date Acquisition;Valeur Acquisition;Méthode;Durée;VNC;Amort. Cumulés;Statut\n';

  const rows = immobilisations
    .map(
      (immo) =>
        `${immo.id};${immo.libelle};${immo.nature};${immo.dateAcquisition.toISOString().split('T')[0]};${immo.valeurAcquisition.toFixed(2)};${immo.methode};${immo.dureeAmortissement};${immo.vnc.toFixed(2)};${immo.amortissementsCumules.toFixed(2)};${immo.statut || 'en_cours'}`
    )
    .join('\n');

  return header + rows;
}
