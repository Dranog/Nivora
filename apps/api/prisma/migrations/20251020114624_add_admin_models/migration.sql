-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('TEXT', 'IMAGE', 'VIDEO', 'AUDIO', 'FILE', 'PPV_LOCKED', 'PPV_UNLOCKED');

-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "mediaUrl" TEXT,
ADD COLUMN     "priceCents" INTEGER,
ADD COLUMN     "type" "MessageType" NOT NULL DEFAULT 'TEXT',
ALTER COLUMN "content" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "messages_conversationId_senderId_isRead_idx" ON "messages"("conversationId", "senderId", "isRead");
