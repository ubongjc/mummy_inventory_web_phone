-- CreateTable
CREATE TABLE "NigerianEvent" (
    "id" TEXT NOT NULL,
    "eventId" VARCHAR(100) NOT NULL,
    "eventType" VARCHAR(50) NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "dateStart" TIMESTAMP(3) NOT NULL,
    "dateEnd" TIMESTAMP(3),
    "locationRaw" VARCHAR(300),
    "locationState" VARCHAR(50),
    "locationCityLga" VARCHAR(100),
    "venueName" VARCHAR(200),
    "contactName" VARCHAR(100),
    "contactRole" VARCHAR(100),
    "contactPhone" VARCHAR(20),
    "contactEmail" VARCHAR(254),
    "organizerOrg" VARCHAR(200),
    "organizerSocial" VARCHAR(500),
    "sourcePlatform" VARCHAR(100) NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "sourcePublishedAt" TIMESTAMP(3),
    "extractedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confidence" DECIMAL(3,2) NOT NULL DEFAULT 0.6,
    "notes" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NigerianEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventSourceLog" (
    "id" TEXT NOT NULL,
    "runAtUtc" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sourcePlatform" VARCHAR(100) NOT NULL,
    "sourceUrl" TEXT,
    "eventsAdded" INTEGER NOT NULL DEFAULT 0,
    "eventsUpdated" INTEGER NOT NULL DEFAULT 0,
    "eventsRemoved" INTEGER NOT NULL DEFAULT 0,
    "errors" TEXT,
    "totalActive" INTEGER NOT NULL DEFAULT 0,
    "executionTimeMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventSourceLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NigerianEvent_eventId_key" ON "NigerianEvent"("eventId");

-- CreateIndex
CREATE INDEX "NigerianEvent_eventType_idx" ON "NigerianEvent"("eventType");

-- CreateIndex
CREATE INDEX "NigerianEvent_dateStart_idx" ON "NigerianEvent"("dateStart");

-- CreateIndex
CREATE INDEX "NigerianEvent_locationState_idx" ON "NigerianEvent"("locationState");

-- CreateIndex
CREATE INDEX "NigerianEvent_sourcePlatform_idx" ON "NigerianEvent"("sourcePlatform");

-- CreateIndex
CREATE INDEX "NigerianEvent_createdAt_idx" ON "NigerianEvent"("createdAt");

-- CreateIndex
CREATE INDEX "EventSourceLog_sourcePlatform_idx" ON "EventSourceLog"("sourcePlatform");

-- CreateIndex
CREATE INDEX "EventSourceLog_runAtUtc_idx" ON "EventSourceLog"("runAtUtc");
