/**
 * Grand Livre et Balance comptable
 * Génération des états comptables selon le PCG (Plan Comptable Général)
 */

// TODO: Properly integrate with Prisma from API package
// import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

// const prisma = new PrismaClient();

// ===============================
// TYPES & SCHÉMAS
// ===============================

export const MouvementCompteSchema = z.object({
  date: z.date(),
  numeroEcriture: z.string(),
  libelle: z.string(),
  debit: z.number(),
  credit: z.number(),
  solde: z.number(),
  lettrage: z.string().optional(),
});

export type MouvementCompte = z.infer<typeof MouvementCompteSchema>;

export interface GrandLivreCompte {
  comptePCG: string;
  libelleCompte: string;
  soldeInitial: number;
  mouvements: MouvementCompte[];
  totalDebit: number;
  totalCredit: number;
  soldeFinal: number;
}

export interface GrandLivre {
  exercice: number;
  dateDebut: Date;
  dateFin: Date;
  comptes: GrandLivreCompte[];
}

export interface LigneBalance {
  comptePCG: string;
  libelleCompte: string;
  debit: number;
  credit: number;
  soldeDebiteur: number;
  soldeCrediteur: number;
}

export interface Balance {
  exercice: number;
  dateDebut: Date;
  dateFin: Date;
  lignes: LigneBalance[];
  totaux: {
    debit: number;
    credit: number;
    soldeDebiteur: number;
    soldeCrediteur: number;
  };
  equilibree: boolean;
}

// ===============================
// RÉFÉRENTIEL PCG
// ===============================

/**
 * Référentiel des comptes PCG avec leurs libellés
 */
export const REFERENTIEL_PCG: Record<string, string> = {
  // Classe 1 : Capitaux
  '101000': 'Capital social',
  '106000': 'Réserves',
  '108000': 'Compte de l\'exploitant',
  '110000': 'Report à nouveau',
  '120000': 'Résultat de l\'exercice',
  '164000': 'Emprunts',

  // Classe 2 : Immobilisations
  '205000': 'Logiciels',
  '213000': 'Constructions',
  '213500': 'Installations, agencements',
  '218200': 'Matériel de transport',
  '218300': 'Matériel informatique',
  '218400': 'Mobilier',
  '280500': 'Amortissement logiciels',
  '281300': 'Amortissement constructions',
  '281350': 'Amortissement installations',
  '281820': 'Amortissement matériel transport',
  '281830': 'Amortissement matériel informatique',
  '281840': 'Amortissement mobilier',

  // Classe 3 : Stocks (non utilisé pour une plateforme)
  '370000': 'Stocks de marchandises',

  // Classe 4 : Tiers
  '401000': 'Fournisseurs',
  '411000': 'Clients (créateurs)',
  '421000': 'Personnel - Rémunérations dues',
  '431000': 'Sécurité sociale',
  '437000': 'Autres organismes sociaux',
  '445660': 'TVA déductible',
  '445710': 'TVA collectée',
  '445200': 'TVA à décaisser',
  '467000': 'Autres comptes débiteurs ou créditeurs',

  // Classe 5 : Financier
  '512000': 'Banque',
  '530000': 'Caisse',
  '580000': 'Virements internes',

  // Classe 6 : Charges
  '606000': 'Achats non stockés de matériel',
  '613000': 'Locations',
  '615000': 'Entretien et réparations',
  '623000': 'Publicité',
  '625000': 'Déplacements',
  '626000': 'Frais postaux',
  '627000': 'Services bancaires',
  '628000': 'Charges diverses',
  '628500': 'Frais de commissions',
  '641000': 'Rémunérations du personnel',
  '645000': 'Charges de sécurité sociale',
  '661000': 'Charges d\'intérêts',
  '671000': 'Charges exceptionnelles',
  '675000': 'Valeur nette comptable des immobilisations cédées',
  '681000': 'Dotations aux amortissements',
  '686000': 'Dotations aux provisions',

  // Classe 7 : Produits
  '706000': 'Prestations de services',
  '708000': 'Produits des activités annexes',
  '758000': 'Produits divers de gestion courante',
  '771000': 'Produits exceptionnels',
  '775000': 'Produits des cessions d\'immobilisations',
  '781000': 'Reprises sur amortissements',
  '786000': 'Reprises sur provisions',
};

/**
 * Retourne le libellé d'un compte PCG
 * Si inconnu, retourne "Compte {numero}"
 */
export function obtenirLibelleCompte(comptePCG: string): string {
  return REFERENTIEL_PCG[comptePCG] || `Compte ${comptePCG}`;
}

/**
 * Détermine la classe d'un compte (1-7)
 */
export function obtenirClasseCompte(comptePCG: string): number {
  return parseInt(comptePCG.charAt(0), 10);
}

// ===============================
// GÉNÉRATION DU GRAND LIVRE
// ===============================

/**
 * Génère le grand livre pour une période donnée
 * @param exercice - Année de l'exercice
 * @param dateDebut - Date de début (optionnel)
 * @param dateFin - Date de fin (optionnel)
 * @param comptesFiltre - Filtrer par comptes spécifiques (optionnel)
 */
export async function genererGrandLivre(
  exercice: number,
  dateDebut?: Date,
  dateFin?: Date,
  comptesFiltre?: string[]
): Promise<GrandLivre> {
  // Dates par défaut : 1er janvier au 31 décembre de l'exercice
  const debut = dateDebut || new Date(exercice, 0, 1);
  const fin = dateFin || new Date(exercice, 11, 31, 23, 59, 59);

  console.log(`[GRAND-LIVRE] Génération pour l'exercice ${exercice} (${debut.toISOString().split('T')[0]} → ${fin.toISOString().split('T')[0]})`);

  // TODO: Integrate with Prisma from API package
  // For now, return empty data structure
  const lignes: any[] = [];

  /*
  const lignes = await prisma.ligneEcriture.findMany({
    where: {
      ecriture: {
        dateComptable: {
          gte: debut,
          lte: fin,
        },
        validated: true,
      },
      ...(comptesFiltre && comptesFiltre.length > 0
        ? { comptePCG: { in: comptesFiltre } }
        : {}),
    },
    include: {
      ecriture: true,
    },
    orderBy: [{ comptePCG: 'asc' }, { ecriture: { dateComptable: 'asc' } }],
  });
  */

  console.log(`[GRAND-LIVRE] ${lignes.length} lignes récupérées`);

  // Regrouper par compte
  const comptesMap = new Map<string, GrandLivreCompte>();

  for (const ligne of lignes) {
    if (!comptesMap.has(ligne.comptePCG)) {
      comptesMap.set(ligne.comptePCG, {
        comptePCG: ligne.comptePCG,
        libelleCompte: ligne.libelleCompte || obtenirLibelleCompte(ligne.comptePCG),
        soldeInitial: 0, // À calculer si nécessaire
        mouvements: [],
        totalDebit: 0,
        totalCredit: 0,
        soldeFinal: 0,
      });
    }

    const compte = comptesMap.get(ligne.comptePCG)!;
    compte.totalDebit += ligne.debit;
    compte.totalCredit += ligne.credit;
  }

  // Calculer les mouvements avec soldes progressifs
  for (const [comptePCG, compte] of comptesMap.entries()) {
    let soldeProgressif = compte.soldeInitial;

    const lignesCompte = lignes.filter((l) => l.comptePCG === comptePCG);

    for (const ligne of lignesCompte) {
      // Le sens du solde dépend de la classe du compte :
      // - Actif (2, 3, 4 débiteurs, 5) : Débit augmente, Crédit diminue
      // - Passif (1, 4 créditeurs) : Crédit augmente, Débit diminue
      // - Charges (6) : Débit augmente
      // - Produits (7) : Crédit augmente

      const classe = obtenirClasseCompte(comptePCG);
      const isDébiteur = [2, 3, 5, 6].includes(classe) || (classe === 4 && comptePCG.startsWith('41'));

      if (isDébiteur) {
        soldeProgressif += ligne.debit - ligne.credit;
      } else {
        soldeProgressif += ligne.credit - ligne.debit;
      }

      compte.mouvements.push({
        date: ligne.ecriture.dateComptable,
        numeroEcriture: ligne.ecriture.numeroEcriture,
        libelle: ligne.ecriture.libelle,
        debit: ligne.debit,
        credit: ligne.credit,
        solde: soldeProgressif,
        lettrage: ligne.lettrage || undefined,
      });
    }

    compte.soldeFinal = soldeProgressif;
  }

  const comptes = Array.from(comptesMap.values()).sort((a, b) => a.comptePCG.localeCompare(b.comptePCG));

  console.log(`[GRAND-LIVRE] ${comptes.length} comptes générés`);

  return {
    exercice,
    dateDebut: debut,
    dateFin: fin,
    comptes,
  };
}

// ===============================
// GÉNÉRATION DE LA BALANCE
// ===============================

/**
 * Génère la balance comptable
 * @param exercice - Année de l'exercice
 * @param dateDebut - Date de début (optionnel)
 * @param dateFin - Date de fin (optionnel)
 */
export async function genererBalance(
  exercice: number,
  dateDebut?: Date,
  dateFin?: Date
): Promise<Balance> {
  const debut = dateDebut || new Date(exercice, 0, 1);
  const fin = dateFin || new Date(exercice, 11, 31, 23, 59, 59);

  console.log(`[BALANCE] Génération pour l'exercice ${exercice}`);

  // TODO: Integrate with Prisma from API package
  // For now, return empty data structure
  const lignes: any[] = [];

  /*
  const lignes = await prisma.ligneEcriture.findMany({
    where: {
      ecriture: {
        dateComptable: {
          gte: debut,
          lte: fin,
        },
        validated: true,
      },
    },
    include: {
      ecriture: true,
    },
  });
  */

  console.log(`[BALANCE] ${lignes.length} lignes à traiter`);

  // Agréger par compte
  const comptesMap = new Map<string, LigneBalance>();

  for (const ligne of lignes) {
    if (!comptesMap.has(ligne.comptePCG)) {
      comptesMap.set(ligne.comptePCG, {
        comptePCG: ligne.comptePCG,
        libelleCompte: ligne.libelleCompte || obtenirLibelleCompte(ligne.comptePCG),
        debit: 0,
        credit: 0,
        soldeDebiteur: 0,
        soldeCrediteur: 0,
      });
    }

    const compte = comptesMap.get(ligne.comptePCG)!;
    compte.debit += ligne.debit;
    compte.credit += ligne.credit;
  }

  // Calculer les soldes
  for (const compte of comptesMap.values()) {
    const solde = compte.debit - compte.credit;
    if (solde > 0) {
      compte.soldeDebiteur = solde;
      compte.soldeCrediteur = 0;
    } else {
      compte.soldeDebiteur = 0;
      compte.soldeCrediteur = Math.abs(solde);
    }
  }

  const lignesBalance = Array.from(comptesMap.values()).sort((a, b) =>
    a.comptePCG.localeCompare(b.comptePCG)
  );

  // Calculer les totaux
  const totaux = {
    debit: lignesBalance.reduce((sum, l) => sum + l.debit, 0),
    credit: lignesBalance.reduce((sum, l) => sum + l.credit, 0),
    soldeDebiteur: lignesBalance.reduce((sum, l) => sum + l.soldeDebiteur, 0),
    soldeCrediteur: lignesBalance.reduce((sum, l) => sum + l.soldeCrediteur, 0),
  };

  // Vérifier l'équilibre (tolérance d'1 centime)
  const equilibree =
    Math.abs(totaux.debit - totaux.credit) < 1 &&
    Math.abs(totaux.soldeDebiteur - totaux.soldeCrediteur) < 1;

  console.log(`[BALANCE] Balance ${equilibree ? 'équilibrée' : 'DÉSÉQUILIBRÉE'}`);

  return {
    exercice,
    dateDebut: debut,
    dateFin: fin,
    lignes: lignesBalance,
    totaux,
    equilibree,
  };
}

// ===============================
// VÉRIFICATIONS
// ===============================

/**
 * Vérifie l'équilibre de la balance
 * Retourne les écarts détectés
 */
export async function verifierEquilibreBalance(exercice: number): Promise<{
  equilibree: boolean;
  ecarts: string[];
}> {
  const balance = await genererBalance(exercice);
  const ecarts: string[] = [];

  // Vérifier débit = crédit
  const diffDebitCredit = Math.abs(balance.totaux.debit - balance.totaux.credit);
  if (diffDebitCredit >= 1) {
    ecarts.push(
      `Débit (${(balance.totaux.debit / 100).toFixed(2)} €) ≠ Crédit (${(balance.totaux.credit / 100).toFixed(2)} €) - Écart: ${(diffDebitCredit / 100).toFixed(2)} €`
    );
  }

  // Vérifier soldes débiteurs = soldes créditeurs
  const diffSoldes = Math.abs(balance.totaux.soldeDebiteur - balance.totaux.soldeCrediteur);
  if (diffSoldes >= 1) {
    ecarts.push(
      `Soldes débiteurs (${(balance.totaux.soldeDebiteur / 100).toFixed(2)} €) ≠ Soldes créditeurs (${(balance.totaux.soldeCrediteur / 100).toFixed(2)} €) - Écart: ${(diffSoldes / 100).toFixed(2)} €`
    );
  }

  return {
    equilibree: ecarts.length === 0,
    ecarts,
  };
}

// ===============================
// EXPORTS
// ===============================

/**
 * Exporte le grand livre au format CSV
 */
export function exporterGrandLivreCSV(grandLivre: GrandLivre): string {
  let csv = 'Compte PCG;Libellé Compte;Date;N° Écriture;Libellé;Débit;Crédit;Solde;Lettrage\n';

  for (const compte of grandLivre.comptes) {
    csv += `${compte.comptePCG};${compte.libelleCompte};Solde initial;;;0;0;${(compte.soldeInitial / 100).toFixed(2)};\n`;

    for (const mouvement of compte.mouvements) {
      csv += `${compte.comptePCG};${compte.libelleCompte};${mouvement.date.toISOString().split('T')[0]};${mouvement.numeroEcriture};${mouvement.libelle};${(mouvement.debit / 100).toFixed(2)};${(mouvement.credit / 100).toFixed(2)};${(mouvement.solde / 100).toFixed(2)};${mouvement.lettrage || ''}\n`;
    }

    csv += `${compte.comptePCG};${compte.libelleCompte};Totaux;;;${(compte.totalDebit / 100).toFixed(2)};${(compte.totalCredit / 100).toFixed(2)};${(compte.soldeFinal / 100).toFixed(2)};\n`;
    csv += '\n';
  }

  return csv;
}

/**
 * Exporte la balance au format CSV
 */
export function exporterBalanceCSV(balance: Balance): string {
  let csv = 'Compte PCG;Libellé;Débit;Crédit;Solde Débiteur;Solde Créditeur\n';

  for (const ligne of balance.lignes) {
    csv += `${ligne.comptePCG};${ligne.libelleCompte};${(ligne.debit / 100).toFixed(2)};${(ligne.credit / 100).toFixed(2)};${(ligne.soldeDebiteur / 100).toFixed(2)};${(ligne.soldeCrediteur / 100).toFixed(2)}\n`;
  }

  csv += `\nTOTAUX;;${(balance.totaux.debit / 100).toFixed(2)};${(balance.totaux.credit / 100).toFixed(2)};${(balance.totaux.soldeDebiteur / 100).toFixed(2)};${(balance.totaux.soldeCrediteur / 100).toFixed(2)}\n`;
  csv += `\nÉquilibre:;${balance.equilibree ? 'OUI' : 'NON'}\n`;

  return csv;
}
