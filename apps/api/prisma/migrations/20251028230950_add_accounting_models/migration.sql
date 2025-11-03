-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "LettrageType" AS ENUM ('AUTO', 'MANUEL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "LettrageStatut" AS ENUM ('LETTRE', 'PARTIEL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "NatureImmobilisation" AS ENUM ('LOGICIEL', 'MATERIEL_INFO', 'MOBILIER', 'VEHICULE', 'AGENCEMENT', 'CONSTRUCTION');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "MethodeAmortissement" AS ENUM ('LINEAIRE', 'DEGRESSIF');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "StatutImmobilisation" AS ENUM ('EN_COURS', 'TOTALEMENT_AMORTI', 'CEDE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "JournalComptable" AS ENUM ('BANQUE', 'CAISSE', 'VENTES', 'ACHATS', 'OD', 'AN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateTable Lettrage
CREATE TABLE IF NOT EXISTS "lettrages" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "LettrageType" NOT NULL DEFAULT 'AUTO',
    "statut" "LettrageStatut" NOT NULL DEFAULT 'LETTRE',
    "montantTotal" INTEGER NOT NULL,
    "dateLettrage" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lettrages_pkey" PRIMARY KEY ("id")
);

-- CreateTable TransactionLettrage
CREATE TABLE IF NOT EXISTS "transaction_lettrages" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "lettrageId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transaction_lettrages_pkey" PRIMARY KEY ("id")
);

-- CreateTable Immobilisation
CREATE TABLE IF NOT EXISTS "immobilisations" (
    "id" TEXT NOT NULL,
    "nature" "NatureImmobilisation" NOT NULL,
    "libelle" TEXT NOT NULL,
    "dateAcquisition" TIMESTAMP(3) NOT NULL,
    "valeurAcquisition" INTEGER NOT NULL,
    "comptePCG" TEXT NOT NULL,
    "compteAmortissement" TEXT NOT NULL,
    "dureeAmortissement" INTEGER NOT NULL,
    "methode" "MethodeAmortissement" NOT NULL DEFAULT 'LINEAIRE',
    "tauxAmortissement" DOUBLE PRECISION NOT NULL,
    "amortissementsCumules" INTEGER NOT NULL DEFAULT 0,
    "vnc" INTEGER NOT NULL,
    "dateCession" TIMESTAMP(3),
    "valeurCession" INTEGER,
    "statut" "StatutImmobilisation" NOT NULL DEFAULT 'EN_COURS',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "immobilisations_pkey" PRIMARY KEY ("id")
);

-- CreateTable EcritureComptable
CREATE TABLE IF NOT EXISTS "ecritures_comptables" (
    "id" TEXT NOT NULL,
    "numeroEcriture" TEXT NOT NULL,
    "journal" "JournalComptable" NOT NULL DEFAULT 'BANQUE',
    "dateEcriture" TIMESTAMP(3) NOT NULL,
    "dateComptable" TIMESTAMP(3) NOT NULL,
    "libelle" TEXT NOT NULL,
    "reference" TEXT,
    "transactionId" TEXT,
    "validated" BOOLEAN NOT NULL DEFAULT false,
    "validatedBy" TEXT,
    "validatedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ecritures_comptables_pkey" PRIMARY KEY ("id")
);

-- CreateTable LigneEcriture
CREATE TABLE IF NOT EXISTS "lignes_ecriture" (
    "id" TEXT NOT NULL,
    "ecritureId" TEXT NOT NULL,
    "comptePCG" TEXT NOT NULL,
    "libelleCompte" TEXT NOT NULL,
    "debit" INTEGER NOT NULL DEFAULT 0,
    "credit" INTEGER NOT NULL DEFAULT 0,
    "lettrage" TEXT,
    "analytique" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lignes_ecriture_pkey" PRIMARY KEY ("id")
);

-- CreateTable ParametresComptables
CREATE TABLE IF NOT EXISTS "parametres_comptables" (
    "id" TEXT NOT NULL,
    "exerciceEnCours" INTEGER NOT NULL,
    "dateDebutExercice" TIMESTAMP(3) NOT NULL,
    "dateFinExercice" TIMESTAMP(3) NOT NULL,
    "numeroEcritureActuel" INTEGER NOT NULL DEFAULT 1,
    "numeroJournalActuel" INTEGER NOT NULL DEFAULT 1,
    "compteBanque" TEXT NOT NULL DEFAULT '512000',
    "compteClientCreateur" TEXT NOT NULL DEFAULT '411000',
    "compteFournisseur" TEXT NOT NULL DEFAULT '401000',
    "compteCA" TEXT NOT NULL DEFAULT '706000',
    "compteTVACollectee" TEXT NOT NULL DEFAULT '445710',
    "compteTVADeductible" TEXT NOT NULL DEFAULT '445660',
    "compteCharges" TEXT NOT NULL DEFAULT '628000',
    "compteCommission" TEXT NOT NULL DEFAULT '628500',
    "tauxTVA" DOUBLE PRECISION NOT NULL DEFAULT 20.0,
    "tauxCommission" DOUBLE PRECISION NOT NULL DEFAULT 20.0,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "parametres_comptables_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "lettrages_code_key" ON "lettrages"("code");
CREATE INDEX IF NOT EXISTS "lettrages_code_idx" ON "lettrages"("code");
CREATE INDEX IF NOT EXISTS "lettrages_type_idx" ON "lettrages"("type");
CREATE INDEX IF NOT EXISTS "lettrages_statut_idx" ON "lettrages"("statut");
CREATE INDEX IF NOT EXISTS "lettrages_dateLettrage_idx" ON "lettrages"("dateLettrage" DESC);

CREATE UNIQUE INDEX IF NOT EXISTS "transaction_lettrages_transactionId_lettrageId_key" ON "transaction_lettrages"("transactionId", "lettrageId");
CREATE INDEX IF NOT EXISTS "transaction_lettrages_transactionId_idx" ON "transaction_lettrages"("transactionId");
CREATE INDEX IF NOT EXISTS "transaction_lettrages_lettrageId_idx" ON "transaction_lettrages"("lettrageId");

CREATE INDEX IF NOT EXISTS "immobilisations_nature_idx" ON "immobilisations"("nature");
CREATE INDEX IF NOT EXISTS "immobilisations_statut_idx" ON "immobilisations"("statut");
CREATE INDEX IF NOT EXISTS "immobilisations_dateAcquisition_idx" ON "immobilisations"("dateAcquisition" DESC);

CREATE UNIQUE INDEX IF NOT EXISTS "ecritures_comptables_numeroEcriture_key" ON "ecritures_comptables"("numeroEcriture");
CREATE INDEX IF NOT EXISTS "ecritures_comptables_journal_idx" ON "ecritures_comptables"("journal");
CREATE INDEX IF NOT EXISTS "ecritures_comptables_dateComptable_idx" ON "ecritures_comptables"("dateComptable" DESC);
CREATE INDEX IF NOT EXISTS "ecritures_comptables_dateEcriture_idx" ON "ecritures_comptables"("dateEcriture" DESC);
CREATE INDEX IF NOT EXISTS "ecritures_comptables_transactionId_idx" ON "ecritures_comptables"("transactionId");
CREATE INDEX IF NOT EXISTS "ecritures_comptables_validated_idx" ON "ecritures_comptables"("validated");

CREATE INDEX IF NOT EXISTS "lignes_ecriture_ecritureId_idx" ON "lignes_ecriture"("ecritureId");
CREATE INDEX IF NOT EXISTS "lignes_ecriture_comptePCG_idx" ON "lignes_ecriture"("comptePCG");
CREATE INDEX IF NOT EXISTS "lignes_ecriture_lettrage_idx" ON "lignes_ecriture"("lettrage");

-- AddForeignKey
DO $$ BEGIN
    ALTER TABLE "transaction_lettrages" ADD CONSTRAINT "transaction_lettrages_lettrageId_fkey" FOREIGN KEY ("lettrageId") REFERENCES "lettrages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "lignes_ecriture" ADD CONSTRAINT "lignes_ecriture_ecritureId_fkey" FOREIGN KEY ("ecritureId") REFERENCES "ecritures_comptables"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
