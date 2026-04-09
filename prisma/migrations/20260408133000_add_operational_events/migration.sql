CREATE TABLE "OperationalEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "level" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "route" TEXT NOT NULL DEFAULT '',
    "requestId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OperationalEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "OperationalEvent_userId_idx" ON "OperationalEvent"("userId");
CREATE INDEX "OperationalEvent_level_idx" ON "OperationalEvent"("level");
CREATE INDEX "OperationalEvent_source_idx" ON "OperationalEvent"("source");
CREATE INDEX "OperationalEvent_eventType_idx" ON "OperationalEvent"("eventType");
CREATE INDEX "OperationalEvent_requestId_idx" ON "OperationalEvent"("requestId");
CREATE INDEX "OperationalEvent_createdAt_idx" ON "OperationalEvent"("createdAt");

ALTER TABLE "OperationalEvent"
ADD CONSTRAINT "OperationalEvent_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
