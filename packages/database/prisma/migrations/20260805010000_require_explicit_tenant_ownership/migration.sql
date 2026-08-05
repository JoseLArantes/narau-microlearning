-- Tenant ownership is mandatory. New rows must always receive an explicit tenant.
ALTER TABLE "User" ALTER COLUMN "tenantId" DROP DEFAULT;
ALTER TABLE "Area" ALTER COLUMN "tenantId" DROP DEFAULT;
ALTER TABLE "Subject" ALTER COLUMN "tenantId" DROP DEFAULT;
