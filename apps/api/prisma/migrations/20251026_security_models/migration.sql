-- CreateTable
CREATE TABLE "ip_whitelist" (
    "id" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "description" TEXT,
    "adminId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ip_whitelist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT,
    "country" TEXT,
    "city" TEXT,
    "deviceType" TEXT,
    "action" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "failureReason" TEXT,
    "metadata" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "session_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rate_limits" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "requestCount" INTEGER NOT NULL DEFAULT 1,
    "blocked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rate_limits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ip_whitelist_ipAddress_key" ON "ip_whitelist"("ipAddress");

-- CreateIndex
CREATE INDEX "ip_whitelist_enabled_idx" ON "ip_whitelist"("enabled");

-- CreateIndex
CREATE INDEX "ip_whitelist_adminId_idx" ON "ip_whitelist"("adminId");

-- CreateIndex
CREATE INDEX "ip_whitelist_expiresAt_idx" ON "ip_whitelist"("expiresAt");

-- CreateIndex
CREATE INDEX "session_logs_userId_createdAt_idx" ON "session_logs"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "session_logs_sessionId_idx" ON "session_logs"("sessionId");

-- CreateIndex
CREATE INDEX "session_logs_ipAddress_idx" ON "session_logs"("ipAddress");

-- CreateIndex
CREATE INDEX "session_logs_action_createdAt_idx" ON "session_logs"("action", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "rate_limits_identifier_endpoint_idx" ON "rate_limits"("identifier", "endpoint");

-- CreateIndex
CREATE INDEX "rate_limits_windowStart_idx" ON "rate_limits"("windowStart");

-- CreateIndex
CREATE UNIQUE INDEX "rate_limits_identifier_endpoint_windowStart_key" ON "rate_limits"("identifier", "endpoint", "windowStart");

-- AddForeignKey
ALTER TABLE "ip_whitelist" ADD CONSTRAINT "ip_whitelist_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_logs" ADD CONSTRAINT "session_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
