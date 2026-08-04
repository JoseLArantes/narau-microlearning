-- CreateTable
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "domain" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- Insert default tenants
INSERT INTO "Tenant" ("id", "slug", "name", "language", "isDefault", "updatedAt")
VALUES
  ('en', 'en', 'English', 'en', true, CURRENT_TIMESTAMP),
  ('es', 'es', 'Español', 'es', false, CURRENT_TIMESTAMP),
  ('pt', 'pt', 'Português', 'pt', false, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_slug_key" ON "Tenant"("slug");

-- AlterTable User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "tenantId" TEXT NOT NULL DEFAULT 'en';

-- AlterTable Area
ALTER TABLE "Area" ADD COLUMN IF NOT EXISTS "tenantId" TEXT NOT NULL DEFAULT 'en';

-- AlterTable Subject
ALTER TABLE "Subject" ADD COLUMN IF NOT EXISTS "tenantId" TEXT NOT NULL DEFAULT 'en';

-- DropIndex
DROP INDEX IF EXISTS "Area_name_key";
DROP INDEX IF EXISTS "Area_slug_key";
DROP INDEX IF EXISTS "Subject_canonicalUrl_key";
DROP INDEX IF EXISTS "Subject_contentHash_key";

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Area_slug_tenantId_key" ON "Area"("slug", "tenantId");
CREATE UNIQUE INDEX IF NOT EXISTS "Area_name_tenantId_key" ON "Area"("name", "tenantId");
CREATE UNIQUE INDEX IF NOT EXISTS "Subject_canonicalUrl_tenantId_key" ON "Subject"("canonicalUrl", "tenantId");
CREATE UNIQUE INDEX IF NOT EXISTS "Subject_contentHash_tenantId_key" ON "Subject"("contentHash", "tenantId");

-- AddForeignKey
ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_tenantId_fkey";
ALTER TABLE "User" ADD CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Area" DROP CONSTRAINT IF EXISTS "Area_tenantId_fkey";
ALTER TABLE "Area" ADD CONSTRAINT "Area_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subject" DROP CONSTRAINT IF EXISTS "Subject_tenantId_fkey";
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
