-- Enforce the tenant boundary across every content aggregate and join.
CREATE TYPE "TenantStatus" AS ENUM ('ACTIVE', 'DISABLED');

ALTER TABLE "AreaSubjectCandidate" DROP CONSTRAINT IF EXISTS "AreaSubjectCandidate_areaId_fkey";
ALTER TABLE "AreaSubjectCandidate" DROP CONSTRAINT IF EXISTS "AreaSubjectCandidate_subjectId_fkey";
ALTER TABLE "DailyAreaSubject" DROP CONSTRAINT IF EXISTS "DailyAreaSubject_areaId_fkey";
ALTER TABLE "DailyAreaSubject" DROP CONSTRAINT IF EXISTS "DailyAreaSubject_subjectId_fkey";
ALTER TABLE "InaccuracyReport" DROP CONSTRAINT IF EXISTS "InaccuracyReport_subjectId_fkey";
ALTER TABLE "InaccuracyReport" DROP CONSTRAINT IF EXISTS "InaccuracyReport_userDailyItemId_fkey";
ALTER TABLE "InaccuracyReport" DROP CONSTRAINT IF EXISTS "InaccuracyReport_userId_fkey";
ALTER TABLE "UserArea" DROP CONSTRAINT IF EXISTS "UserArea_areaId_fkey";
ALTER TABLE "UserArea" DROP CONSTRAINT IF EXISTS "UserArea_userId_fkey";
ALTER TABLE "UserDailyItem" DROP CONSTRAINT IF EXISTS "UserDailyItem_areaId_fkey";
ALTER TABLE "UserDailyItem" DROP CONSTRAINT IF EXISTS "UserDailyItem_dailyAreaSubjectId_fkey";
ALTER TABLE "UserDailyItem" DROP CONSTRAINT IF EXISTS "UserDailyItem_subjectId_fkey";
ALTER TABLE "UserDailyItem" DROP CONSTRAINT IF EXISTS "UserDailyItem_userId_fkey";

DROP INDEX IF EXISTS "AreaSubjectCandidate_areaId_generatedForDate_status_idx";
DROP INDEX IF EXISTS "AreaSubjectCandidate_areaId_subjectId_generatedForDate_key";
DROP INDEX IF EXISTS "DailyAreaSubject_contentDate_areaId_key";
DROP INDEX IF EXISTS "DailyAreaSubject_contentDate_status_idx";
DROP INDEX IF EXISTS "InaccuracyReport_status_createdAt_idx";
DROP INDEX IF EXISTS "UserDailyItem_userId_status_contentDate_idx";

ALTER TABLE "AnalyticsEvent" ADD COLUMN "tenantId" TEXT;
ALTER TABLE "AuditLog" ADD COLUMN "tenantId" TEXT;
ALTER TABLE "Tenant" ADD COLUMN "status" "TenantStatus" NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE "AreaSubjectCandidate" ADD COLUMN "tenantId" TEXT;
ALTER TABLE "DailyAreaSubject" ADD COLUMN "tenantId" TEXT;
ALTER TABLE "InaccuracyReport" ADD COLUMN "tenantId" TEXT;
ALTER TABLE "UserArea" ADD COLUMN "tenantId" TEXT;
ALTER TABLE "UserDailyItem" ADD COLUMN "tenantId" TEXT;

UPDATE "AreaSubjectCandidate" AS candidate
SET "tenantId" = area."tenantId"
FROM "Area" AS area
WHERE candidate."areaId" = area."id";

UPDATE "DailyAreaSubject" AS daily
SET "tenantId" = area."tenantId"
FROM "Area" AS area
WHERE daily."areaId" = area."id";

UPDATE "InaccuracyReport" AS report
SET "tenantId" = subject."tenantId"
FROM "Subject" AS subject
WHERE report."subjectId" = subject."id";

UPDATE "UserArea" AS user_area
SET "tenantId" = area."tenantId"
FROM "Area" AS area
WHERE user_area."areaId" = area."id";

UPDATE "UserDailyItem" AS item
SET "tenantId" = app_user."tenantId"
FROM "User" AS app_user
WHERE item."userId" = app_user."id";

ALTER TABLE "AreaSubjectCandidate" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "DailyAreaSubject" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "InaccuracyReport" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "UserArea" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "UserDailyItem" ALTER COLUMN "tenantId" SET NOT NULL;

CREATE UNIQUE INDEX "Area_id_tenantId_key" ON "Area"("id", "tenantId");
CREATE INDEX "AreaSubjectCandidate_tenantId_areaId_generatedForDate_statu_idx" ON "AreaSubjectCandidate"("tenantId", "areaId", "generatedForDate", "status");
CREATE UNIQUE INDEX "AreaSubjectCandidate_areaId_subjectId_generatedForDate_tena_key" ON "AreaSubjectCandidate"("areaId", "subjectId", "generatedForDate", "tenantId");
CREATE INDEX "DailyAreaSubject_tenantId_contentDate_status_idx" ON "DailyAreaSubject"("tenantId", "contentDate", "status");
CREATE UNIQUE INDEX "DailyAreaSubject_contentDate_areaId_tenantId_key" ON "DailyAreaSubject"("contentDate", "areaId", "tenantId");
CREATE UNIQUE INDEX "DailyAreaSubject_id_tenantId_key" ON "DailyAreaSubject"("id", "tenantId");
CREATE INDEX "InaccuracyReport_tenantId_status_createdAt_idx" ON "InaccuracyReport"("tenantId", "status", "createdAt");
CREATE UNIQUE INDEX "Subject_id_tenantId_key" ON "Subject"("id", "tenantId");
CREATE UNIQUE INDEX "User_id_tenantId_key" ON "User"("id", "tenantId");
CREATE INDEX "UserDailyItem_tenantId_userId_status_contentDate_idx" ON "UserDailyItem"("tenantId", "userId", "status", "contentDate");
CREATE UNIQUE INDEX "UserDailyItem_id_tenantId_key" ON "UserDailyItem"("id", "tenantId");

ALTER TABLE "AreaSubjectCandidate" ADD CONSTRAINT "AreaSubjectCandidate_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AreaSubjectCandidate" ADD CONSTRAINT "AreaSubjectCandidate_areaId_tenantId_fkey" FOREIGN KEY ("areaId", "tenantId") REFERENCES "Area"("id", "tenantId") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AreaSubjectCandidate" ADD CONSTRAINT "AreaSubjectCandidate_subjectId_tenantId_fkey" FOREIGN KEY ("subjectId", "tenantId") REFERENCES "Subject"("id", "tenantId") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DailyAreaSubject" ADD CONSTRAINT "DailyAreaSubject_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DailyAreaSubject" ADD CONSTRAINT "DailyAreaSubject_areaId_tenantId_fkey" FOREIGN KEY ("areaId", "tenantId") REFERENCES "Area"("id", "tenantId") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DailyAreaSubject" ADD CONSTRAINT "DailyAreaSubject_subjectId_tenantId_fkey" FOREIGN KEY ("subjectId", "tenantId") REFERENCES "Subject"("id", "tenantId") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserArea" ADD CONSTRAINT "UserArea_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserArea" ADD CONSTRAINT "UserArea_userId_tenantId_fkey" FOREIGN KEY ("userId", "tenantId") REFERENCES "User"("id", "tenantId") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserArea" ADD CONSTRAINT "UserArea_areaId_tenantId_fkey" FOREIGN KEY ("areaId", "tenantId") REFERENCES "Area"("id", "tenantId") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserDailyItem" ADD CONSTRAINT "UserDailyItem_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserDailyItem" ADD CONSTRAINT "UserDailyItem_userId_tenantId_fkey" FOREIGN KEY ("userId", "tenantId") REFERENCES "User"("id", "tenantId") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserDailyItem" ADD CONSTRAINT "UserDailyItem_areaId_tenantId_fkey" FOREIGN KEY ("areaId", "tenantId") REFERENCES "Area"("id", "tenantId") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserDailyItem" ADD CONSTRAINT "UserDailyItem_subjectId_tenantId_fkey" FOREIGN KEY ("subjectId", "tenantId") REFERENCES "Subject"("id", "tenantId") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserDailyItem" ADD CONSTRAINT "UserDailyItem_dailyAreaSubjectId_tenantId_fkey" FOREIGN KEY ("dailyAreaSubjectId", "tenantId") REFERENCES "DailyAreaSubject"("id", "tenantId") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InaccuracyReport" ADD CONSTRAINT "InaccuracyReport_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InaccuracyReport" ADD CONSTRAINT "InaccuracyReport_userId_tenantId_fkey" FOREIGN KEY ("userId", "tenantId") REFERENCES "User"("id", "tenantId") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InaccuracyReport" ADD CONSTRAINT "InaccuracyReport_userDailyItemId_tenantId_fkey" FOREIGN KEY ("userDailyItemId", "tenantId") REFERENCES "UserDailyItem"("id", "tenantId") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InaccuracyReport" ADD CONSTRAINT "InaccuracyReport_subjectId_tenantId_fkey" FOREIGN KEY ("subjectId", "tenantId") REFERENCES "Subject"("id", "tenantId") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
