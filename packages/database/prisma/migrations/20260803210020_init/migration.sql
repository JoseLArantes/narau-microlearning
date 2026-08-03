-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN', 'MODERATOR');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('INVITED', 'ACTIVE', 'DISABLED');

-- CreateEnum
CREATE TYPE "AreaStatus" AS ENUM ('ACTIVE', 'DISABLED');

-- CreateEnum
CREATE TYPE "SubjectSource" AS ENUM ('WIKIPEDIA', 'FALLBACK', 'MANUAL');

-- CreateEnum
CREATE TYPE "SubjectStatus" AS ENUM ('ACTIVE', 'UNDER_REVIEW', 'HIDDEN');

-- CreateEnum
CREATE TYPE "CandidateStatus" AS ENUM ('CANDIDATE', 'SELECTED', 'REJECTED', 'USED');

-- CreateEnum
CREATE TYPE "DailySubjectStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'HIDDEN', 'REPLACED');

-- CreateEnum
CREATE TYPE "UserDailyItemStatus" AS ENUM ('PENDING', 'VIEWED', 'LEARNED', 'SKIPPED', 'MISSED', 'REPLACED');

-- CreateEnum
CREATE TYPE "ReportReason" AS ENUM ('INACCURATE', 'OUTDATED', 'OFFENSIVE', 'MISLEADING_SUMMARY', 'BROKEN_SOURCE', 'COPYRIGHT', 'OTHER');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('NEW', 'REVIEWING', 'RESOLVED', 'DISMISSED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Area" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "iconUrl" TEXT,
    "color" TEXT,
    "status" "AreaStatus" NOT NULL DEFAULT 'ACTIVE',
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "sourceConfig" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Area_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subject" (
    "id" TEXT NOT NULL,
    "source" "SubjectSource" NOT NULL DEFAULT 'WIKIPEDIA',
    "sourcePageId" TEXT,
    "title" TEXT NOT NULL,
    "canonicalUrl" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "hook" TEXT,
    "imageUrl" TEXT,
    "imageLicense" TEXT,
    "imageAttribution" TEXT,
    "contentHash" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "revisionId" TEXT,
    "retrievedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "license" TEXT,
    "qualityScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "safetyScore" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "status" "SubjectStatus" NOT NULL DEFAULT 'ACTIVE',
    "raw" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AreaSubjectCandidate" (
    "id" TEXT NOT NULL,
    "areaId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "generatedForDate" DATE NOT NULL,
    "candidateScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "CandidateStatus" NOT NULL DEFAULT 'CANDIDATE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AreaSubjectCandidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyAreaSubject" (
    "id" TEXT NOT NULL,
    "contentDate" DATE NOT NULL,
    "areaId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "status" "DailySubjectStatus" NOT NULL DEFAULT 'PUBLISHED',
    "selectedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyAreaSubject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserArea" (
    "userId" TEXT NOT NULL,
    "areaId" TEXT NOT NULL,
    "preferenceWeight" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "assignedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserArea_pkey" PRIMARY KEY ("userId","areaId")
);

-- CreateTable
CREATE TABLE "UserDailyItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "contentDate" DATE NOT NULL,
    "userLocalDate" DATE NOT NULL,
    "areaId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "dailyAreaSubjectId" TEXT,
    "status" "UserDailyItemStatus" NOT NULL DEFAULT 'PENDING',
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "viewedAt" TIMESTAMP(3),
    "learnedAt" TIMESTAMP(3),
    "rating" INTEGER,
    "ratingComment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserDailyItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InaccuracyReport" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "userDailyItemId" TEXT,
    "subjectId" TEXT NOT NULL,
    "reason" "ReportReason" NOT NULL,
    "details" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "resolutionNote" TEXT,

    CONSTRAINT "InaccuracyReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticsEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Area_name_key" ON "Area"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Area_slug_key" ON "Area"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_canonicalUrl_key" ON "Subject"("canonicalUrl");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_contentHash_key" ON "Subject"("contentHash");

-- CreateIndex
CREATE INDEX "Subject_source_sourcePageId_idx" ON "Subject"("source", "sourcePageId");

-- CreateIndex
CREATE INDEX "Subject_status_idx" ON "Subject"("status");

-- CreateIndex
CREATE INDEX "AreaSubjectCandidate_areaId_generatedForDate_status_idx" ON "AreaSubjectCandidate"("areaId", "generatedForDate", "status");

-- CreateIndex
CREATE UNIQUE INDEX "AreaSubjectCandidate_areaId_subjectId_generatedForDate_key" ON "AreaSubjectCandidate"("areaId", "subjectId", "generatedForDate");

-- CreateIndex
CREATE INDEX "DailyAreaSubject_contentDate_status_idx" ON "DailyAreaSubject"("contentDate", "status");

-- CreateIndex
CREATE UNIQUE INDEX "DailyAreaSubject_contentDate_areaId_key" ON "DailyAreaSubject"("contentDate", "areaId");

-- CreateIndex
CREATE INDEX "UserDailyItem_userId_status_contentDate_idx" ON "UserDailyItem"("userId", "status", "contentDate");

-- CreateIndex
CREATE UNIQUE INDEX "UserDailyItem_userId_contentDate_key" ON "UserDailyItem"("userId", "contentDate");

-- CreateIndex
CREATE INDEX "InaccuracyReport_status_createdAt_idx" ON "InaccuracyReport"("status", "createdAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_name_createdAt_idx" ON "AnalyticsEvent"("name", "createdAt");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AreaSubjectCandidate" ADD CONSTRAINT "AreaSubjectCandidate_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AreaSubjectCandidate" ADD CONSTRAINT "AreaSubjectCandidate_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyAreaSubject" ADD CONSTRAINT "DailyAreaSubject_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyAreaSubject" ADD CONSTRAINT "DailyAreaSubject_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserArea" ADD CONSTRAINT "UserArea_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserArea" ADD CONSTRAINT "UserArea_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDailyItem" ADD CONSTRAINT "UserDailyItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDailyItem" ADD CONSTRAINT "UserDailyItem_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDailyItem" ADD CONSTRAINT "UserDailyItem_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDailyItem" ADD CONSTRAINT "UserDailyItem_dailyAreaSubjectId_fkey" FOREIGN KEY ("dailyAreaSubjectId") REFERENCES "DailyAreaSubject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InaccuracyReport" ADD CONSTRAINT "InaccuracyReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InaccuracyReport" ADD CONSTRAINT "InaccuracyReport_userDailyItemId_fkey" FOREIGN KEY ("userDailyItemId") REFERENCES "UserDailyItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InaccuracyReport" ADD CONSTRAINT "InaccuracyReport_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
