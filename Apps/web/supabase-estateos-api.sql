-- ============================================================
-- ESTATEOS PRIVATE API — SUPABASE SCHEMA
-- Run this entire script in Supabase SQL Editor
--
-- Creates:
--   1. estateos_api_keys          — revocable, read-only API keys
--   2. estateos_property_changes  — change log so EstateOS can
--                                   detect new / updated / deleted
--                                   listings via updatedSince
-- ============================================================

-- ============================================================
-- 1. API KEYS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS estateos_api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,                       -- e.g. 'EstateOS Production'
  key_hash TEXT NOT NULL UNIQUE,            -- SHA-256 of the raw key (never store raw)
  key_prefix TEXT NOT NULL,                 -- first 8 chars, for admin identification
  key_suffix TEXT NOT NULL,                 -- last 4 chars, for admin identification
  is_active BOOLEAN DEFAULT TRUE,           -- set FALSE to revoke immediately
  is_read_only BOOLEAN DEFAULT TRUE,        -- only allow GET requests
  created_at TIMESTAMPTZ DEFAULT NOW(),
  revoked_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  last_used_ip TEXT,
  request_count BIGINT DEFAULT 0,
  created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_estateos_api_keys_active
  ON estateos_api_keys(is_active);
CREATE INDEX IF NOT EXISTS idx_estateos_api_keys_key_hash
  ON estateos_api_keys(key_hash);

-- RLS: API keys are sensitive — admin-only
ALTER TABLE estateos_api_keys ENABLE ROW LEVEL SECURITY;

-- Only authenticated admins can view/manage keys
DROP POLICY IF EXISTS "Admins can view API keys" ON estateos_api_keys;
CREATE POLICY "Admins can view API keys" ON estateos_api_keys
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can create API keys" ON estateos_api_keys;
CREATE POLICY "Admins can create API keys" ON estateos_api_keys
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can update API keys" ON estateos_api_keys;
CREATE POLICY "Admins can update API keys" ON estateos_api_keys
  FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can delete API keys" ON estateos_api_keys;
CREATE POLICY "Admins can delete API keys" ON estateos_api_keys
  FOR DELETE USING (auth.role() = 'authenticated');

-- Service-role helper: the edge function reads keys with the service
-- role key, which bypasses RLS. The RLS policies above protect the
-- table from the anon key / browser clients.

-- ============================================================
-- 2. PROPERTY CHANGES TABLE (change detection)
-- ============================================================
CREATE TABLE IF NOT EXISTS estateos_property_changes (
  id BIGSERIAL PRIMARY KEY,
  property_id UUID NOT NULL,                 -- stable property id
  change_type TEXT NOT NULL CHECK (
    change_type IN ('created', 'updated', 'sold', 'rented', 'price_changed', 'media_changed', 'deleted', 'status_changed')
  ),
  old_status TEXT,
  new_status TEXT,
  old_price NUMERIC,
  new_price NUMERIC,
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_estateos_property_changes_property
  ON estateos_property_changes(property_id);
CREATE INDEX IF NOT EXISTS idx_estateos_property_changes_changed_at
  ON estateos_property_changes(changed_at DESC);

-- RLS: change log is for the private EstateOS API only
ALTER TABLE estateos_property_changes ENABLE ROW LEVEL SECURITY;

-- No public access. Only the service-role / authenticated admins.
DROP POLICY IF EXISTS "Admins can view property changes" ON estateos_property_changes;
CREATE POLICY "Admins can view property changes" ON estateos_property_changes
  FOR SELECT USING (auth.role() = 'authenticated');

-- ============================================================
-- 3. TRIGGERS — record property changes automatically
-- ============================================================

-- Trigger function: log create/update/status/price/media changes
CREATE OR REPLACE FUNCTION estateos_log_property_change()
RETURNS TRIGGER AS $$
DECLARE
  change_type TEXT;
  old_images JSONB;
  new_images JSONB;
BEGIN
  -- Determine change type
  IF TG_OP = 'INSERT' THEN
    change_type := 'created';
    INSERT INTO estateos_property_changes
      (property_id, change_type, new_status, new_price, changed_at)
    VALUES (NEW.id, change_type, NEW.status, NEW.price, NOW());

  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO estateos_property_changes
      (property_id, change_type, old_status, old_price, changed_at)
    VALUES (OLD.id, 'deleted', OLD.status, OLD.price, NOW());

  ELSIF TG_OP = 'UPDATE' THEN
    -- Status change (sold / rented / other)
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      change_type := CASE
        WHEN UPPER(NEW.status) IN ('SOLD', 'SOLD OUT') THEN 'sold'
        WHEN UPPER(NEW.status) IN ('RENTED', 'LEASED') THEN 'rented'
        ELSE 'status_changed'
      END;
      INSERT INTO estateos_property_changes
        (property_id, change_type, old_status, new_status, old_price, new_price, changed_at)
      VALUES (NEW.id, change_type, OLD.status, NEW.status, OLD.price, NEW.price, NOW());
    END IF;

    -- Price change
    IF OLD.price IS DISTINCT FROM NEW.price THEN
      INSERT INTO estateos_property_changes
        (property_id, change_type, old_status, new_status, old_price, new_price, changed_at)
      VALUES (NEW.id, 'price_changed', OLD.status, NEW.status, OLD.price, NEW.price, NOW());
    END IF;

    -- Media change
    old_images := COALESCE(OLD.images, '[]'::jsonb);
    new_images := COALESCE(NEW.images, '[]'::jsonb);
    IF old_images IS DISTINCT FROM new_images THEN
      INSERT INTO estateos_property_changes
        (property_id, change_type, old_status, new_status, old_price, new_price, changed_at)
      VALUES (NEW.id, 'media_changed', OLD.status, NEW.status, OLD.price, NEW.price, NOW());
    END IF;

    -- Generic update marker (if none of the above, still record updated)
    IF NOT EXISTS (
      SELECT 1 FROM estateos_property_changes
      WHERE property_id = NEW.id
        AND changed_at > NOW() - INTERVAL '1 second'
        AND change_type IN ('created', 'price_changed', 'media_changed', 'sold', 'rented', 'status_changed')
    ) THEN
      INSERT INTO estateos_property_changes
        (property_id, change_type, old_status, new_status, old_price, new_price, changed_at)
      VALUES (NEW.id, 'updated', OLD.status, NEW.status, OLD.price, NEW.price, NOW());
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to properties table
DROP TRIGGER IF EXISTS trg_estateos_log_property_change ON properties;
CREATE TRIGGER trg_estateos_log_property_change
  AFTER INSERT OR UPDATE OR DELETE ON properties
  FOR EACH ROW EXECUTE FUNCTION estateos_log_property_change();

-- ============================================================
-- 4. HELPER: UPDATE last_used_at for an API key
-- ============================================================
CREATE OR REPLACE FUNCTION estateos_touch_api_key(p_key_hash TEXT, p_ip TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE estateos_api_keys
  SET last_used_at = NOW(),
      last_used_ip = p_ip,
      request_count = request_count + 1
  WHERE key_hash = p_key_hash;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- VERIFY: list created objects
-- ============================================================
SELECT tablename, policyname
FROM pg_policies
WHERE tablename IN ('estateos_api_keys', 'estateos_property_changes')
ORDER BY tablename, policyname;