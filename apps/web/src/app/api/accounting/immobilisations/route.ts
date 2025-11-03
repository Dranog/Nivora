/**
 * API Immobilisations
 * Route: /api/accounting/immobilisations
 */

import { NextRequest, NextResponse } from 'next/server';
import { creerImmobilisation, calculerDotationAnnuelle } from '@/lib/accounting/immobilisations';
import type { Immobilisation } from '@/lib/accounting/immobilisations';

// Mock data (stockage en mémoire - à remplacer par DB)
let immobilisationsMock: Immobilisation[] = [
  creerImmobilisation('logiciel', 'Licence Adobe Creative Cloud 2024', new Date('2024-01-15'), 2500, 'lineaire'),
  creerImmobilisation('materiel_info', 'MacBook Pro M3 16" 32GB', new Date('2024-03-20'), 3500, 'lineaire'),
  creerImmobilisation('mobilier', 'Bureau électrique ajustable', new Date('2023-06-10'), 1200, 'lineaire'),
  creerImmobilisation('vehicule', 'Tesla Model 3 (Véhicule de société)', new Date('2023-01-05'), 45000, 'degressif'),
];

// Mettre à jour les amortissements cumulés et VNC
function mettreAJourAmortissements(immo: Immobilisation): Immobilisation {
  const anneeActuelle = new Date().getFullYear();
  const anneeAcquisition = new Date(immo.dateAcquisition).getFullYear();

  let cumulAmort = 0;
  for (let annee = anneeAcquisition; annee <= anneeActuelle; annee++) {
    const immoTemp = { ...immo, amortissementsCumules: cumulAmort };
    const dotation = calculerDotationAnnuelle(immoTemp, annee);
    cumulAmort += dotation;
  }

  const vnc = Math.max(0, immo.valeurAcquisition - cumulAmort);

  return {
    ...immo,
    amortissementsCumules: cumulAmort,
    vnc,
    statut: vnc === 0 ? 'totalement_amorti' : 'en_cours',
  };
}

// Initialiser les amortissements
immobilisationsMock = immobilisationsMock.map(mettreAJourAmortissements);

/**
 * GET /api/accounting/immobilisations
 * Retourne toutes les immobilisations
 */
export async function GET(req: NextRequest) {
  try {
    // Mettre à jour les amortissements avant de retourner
    const immosAJour = immobilisationsMock.map(mettreAJourAmortissements);

    return NextResponse.json(
      {
        success: true,
        immobilisations: immosAJour,
        meta: {
          total: immosAJour.length,
          totalVNC: immosAJour.reduce((sum, i) => sum + i.vnc, 0),
          totalAmort: immosAJour.reduce((sum, i) => sum + i.amortissementsCumules, 0),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur GET immobilisations:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/accounting/immobilisations
 * Crée une nouvelle immobilisation
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validation
    if (!body.nature || !body.libelle || !body.valeurAcquisition || !body.dateAcquisition) {
      return NextResponse.json(
        {
          success: false,
          error: 'Champs requis : nature, libelle, valeurAcquisition, dateAcquisition',
        },
        { status: 400 }
      );
    }

    // Créer l'immobilisation
    const immo = creerImmobilisation(
      body.nature,
      body.libelle,
      new Date(body.dateAcquisition),
      body.valeurAcquisition,
      body.methode || 'lineaire'
    );

    // Mettre à jour les amortissements
    const immoAJour = mettreAJourAmortissements(immo);

    // Ajouter à la liste (mock)
    immobilisationsMock.push(immoAJour);

    return NextResponse.json(
      {
        success: true,
        immobilisation: immoAJour,
        message: 'Immobilisation créée avec succès',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erreur POST immobilisation:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la création',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/accounting/immobilisations
 * Supprime une immobilisation
 * Query param: id
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID requis',
        },
        { status: 400 }
      );
    }

    const index = immobilisationsMock.findIndex((i) => i.id === id);

    if (index === -1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Immobilisation non trouvée',
        },
        { status: 404 }
      );
    }

    // Supprimer
    const deleted = immobilisationsMock.splice(index, 1)[0];

    return NextResponse.json(
      {
        success: true,
        message: `Immobilisation supprimée : ${deleted.libelle}`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur DELETE immobilisation:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la suppression',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}
