/*
  Warnings:

  - Added the required column `updatedAt` to the `FanEmail` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "ReactionType" ADD VALUE 'STAR';

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'SUPPORT';

-- DropIndex
DROP INDEX "public"."FanEmail_creatorId_idx";

-- DropIndex
DROP INDEX "public"."Ticket_status_idx";

-- DropIndex
DROP INDEX "public"."Ticket_userId_idx";

-- AlterTable
ALTER TABLE "FanEmail" ADD COLUMN     "confirmToken" TEXT,
ADD COLUMN     "confirmedAt" TIMESTAMP(3),
ADD COLUMN     "consentIp" TEXT,
ADD COLUMN     "consentTimestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "unsubscribedAt" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Payout" ADD COLUMN     "amount" INTEGER,
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "estimatedCompletionAt" TIMESTAMP(3),
ADD COLUMN     "failureReason" TEXT,
ADD COLUMN     "fee" INTEGER,
ADD COLUMN     "requestedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "isPPV" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Purchase" ADD COLUMN     "stripePaymentIntentId" TEXT;

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "stripePaymentIntentId" TEXT;

-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "assignedTo" TEXT,
ADD COLUMN     "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN     "resolution" TEXT,
ADD COLUMN     "resolvedAt" TIMESTAMP(3),
ADD COLUMN     "resolvedBy" TEXT;

-- AlterTable
ALTER TABLE "Tip" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PAID',
ADD COLUMN     "stripePaymentIntentId" TEXT;

-- AlterTable
ALTER TABLE "creator_profiles" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "kycLevel" "KycLevel" NOT NULL DEFAULT 'NONE';

-- CreateTable
CREATE TABLE "StripeEvent" (
    "id" TEXT NOT NULL,
    "stripeEventId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StripeEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StripeEvent_stripeEventId_key" ON "StripeEvent"("stripeEventId");

-- CreateIndex
CREATE INDEX "StripeEvent_stripeEventId_idx" ON "StripeEvent"("stripeEventId");

-- CreateIndex
CREATE INDEX "StripeEvent_type_idx" ON "StripeEvent"("type");

-- CreateIndex
CREATE INDEX "StripeEvent_processed_idx" ON "StripeEvent"("processed");

-- CreateIndex
CREATE INDEX "FanEmail_creatorId_optIn_idx" ON "FanEmail"("creatorId", "optIn");

-- CreateIndex
CREATE INDEX "Ticket_userId_status_idx" ON "Ticket"("userId", "status");

-- CreateIndex
CREATE INDEX "Ticket_status_priority_idx" ON "Ticket"("status", "priority");
