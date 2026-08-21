-- Migration: ensure `properties.slug` exists with a unique index.
-- The seed scripts (estateos-setup-complete.sql / supabase-*.sql) already
-- add this column + index; this migration is idempotent and acts as a
-- production safety-net / repeatable migration.
--
-- Usage: psql $DATABASE_URL -f db/migrations/001_add_properties_slug_unique.sql

-- 1. Add the column if it is missing.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'properties' AND column_name = 'slug'
  ) THEN
    ALTER TABLE properties ADD COLUMN slug TEXT;
  END IF;
END $$;

-- 2. Populate slugs for any legacy rows that still have NULL slugs.
-- Reuses the app-level slug algorithm. A UUID-derived suffix guarantees
-- uniqueness even when two titles slugify to the same token.
UPDATE properties
SET slug = LOWER(REGEXP_REPLACE(COALESCE(title, ''), '[^a-z0-9]+', '-', 'g'))
         || '-' || SUBSTRING(id::text, 1, 8)
WHERE slug IS NULL;

-- 3. Enforce uniqueness for non-null slugs (partial index allows NULLs).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'properties'
      AND indexname = 'properties_slug_unique'
  ) THEN
    CREATE UNIQUE INDEX properties_slug_unique ON properties (slug)
      WHERE slug IS NOT NULL;
  END IF;
END $$;

COMMENT ON COLUMN properties.slug IS
  'URL-safe unique identifier for property pages (/properties/:slug). Auto-generated on create/edit.';
