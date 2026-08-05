-- Normalize existing child slugs to the same full-path convention enforced by
-- the admin create/update services. Area IDs and relationships are preserved.
CREATE TEMP TABLE "AreaSlugMigration" ON COMMIT DROP AS
WITH RECURSIVE area_paths AS (
  SELECT
    a."id",
    a."tenantId",
    a."parentId",
    a."slug" AS "newSlug"
  FROM "Area" a
  WHERE a."parentId" IS NULL

  UNION ALL

  SELECT
    child."id",
    child."tenantId",
    child."parentId",
    parent."newSlug" || '-' || COALESCE(
      NULLIF(
        trim(both '-' FROM regexp_replace(
          lower(
            CASE
              WHEN child."slug" LIKE parent."newSlug" || '-%'
                THEN substring(child."slug" FROM char_length(parent."newSlug") + 2)
              ELSE child."slug"
            END
          ),
          '[^a-z0-9]+',
          '-',
          'g'
        )),
        ''
      ),
      'node'
    ) AS "newSlug"
  FROM "Area" child
  INNER JOIN area_paths parent
    ON parent."id" = child."parentId"
   AND parent."tenantId" = child."tenantId"
)
SELECT "id", "tenantId", "newSlug"
FROM area_paths;

UPDATE "Area" area
SET "slug" = '__area_slug_migration__' || area."id"
FROM "AreaSlugMigration" migration
WHERE migration."id" = area."id";

UPDATE "Area" area
SET "slug" = migration."newSlug"
FROM "AreaSlugMigration" migration
WHERE migration."id" = area."id";
