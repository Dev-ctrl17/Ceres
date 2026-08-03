-- ============================================================
-- INSERT ESTATEOS API KEY (Production)
--
-- Paste this into Supabase SQL Editor and click Run.
--
-- This stores the SHA-256 HASH of your key — NEVER the raw key.
-- The raw key is only shared with EstateOS and stored nowhere.
-- ============================================================

INSERT INTO estateos_api_keys (name, key_hash, key_prefix, key_suffix)
VALUES (
  'EstateOS Production',                                           -- name (admin label)
  'aa182bc744cfb9f6e51115973d659faf4e67aa564dc703106c4b0dafe2baf266', -- SHA-256 hash of your key
  'estateos_',                                                    -- key prefix
  'a5e1'                                                          -- last 4 chars of your key
);

-- ============================================================
-- Verify the insert worked
-- ============================================================
SELECT id, name, key_prefix, key_suffix, is_active, is_read_only, created_at
FROM estateos_api_keys
ORDER BY created_at DESC;

-- ============================================================
-- YOUR RAW KEY — SHARE THIS WITH ESTATEOS ONLY
-- ============================================================
-- estateos_live_c440d4596ca80129c9f3796c7affa5e1
-- 
-- They will call:
--   GET https://luxurypropertiesltd.com.ng/api/estateos/properties
--   Authorization: Bearer estateos_live_c440d4596ca80129c9f3796c7affa5e1
-- ============================================================