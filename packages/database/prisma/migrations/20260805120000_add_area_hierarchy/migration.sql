ALTER TYPE "AreaStatus" ADD VALUE IF NOT EXISTS 'DRAFT';

CREATE TYPE "AreaLevel" AS ENUM ('AREA', 'TOPIC', 'SPECIALTY');

ALTER TABLE "Area"
  ADD COLUMN "parentId" TEXT,
  ADD COLUMN "level" "AreaLevel" NOT NULL DEFAULT 'AREA';

ALTER TABLE "UserArea"
  DROP COLUMN "preferenceWeight";

CREATE INDEX "Area_tenantId_parentId_status_displayOrder_idx"
  ON "Area"("tenantId", "parentId", "status", "displayOrder");

ALTER TABLE "Area"
  ADD CONSTRAINT "Area_parentId_tenantId_fkey"
  FOREIGN KEY ("parentId", "tenantId") REFERENCES "Area"("id", "tenantId")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Area"
  ADD CONSTRAINT "Area_level_parent_check"
  CHECK (("level" = 'AREA' AND "parentId" IS NULL) OR ("level" <> 'AREA' AND "parentId" IS NOT NULL));
