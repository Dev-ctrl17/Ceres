-- ============================================================
-- ESTATEOS WEBHOOK — SQL MIGRATION
--
-- Adds webhook delivery tracking to the estateos_property_changes
-- table so a cron job can dispatch unsent events to EstateOS.
--
-- Run this in the Supabase SQL Editor after
-- supabase-estateos-api.sql has been applied.
-- ============================================================

-- ============================================================
-- 1. ADD WEBHOOK DELIVERY COLUMNS
-- ============================================================
ALTER TABLE estateos_property_changes
  ADD COLUMN IF NOT EXISTS webhook_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS webhook_sent_status SMALLINT,
  ADD COLUMN IF NOT EXISTS webhook_response TEXT,
  ADD COLUMN IF NOT EXISTS webhook_attempts INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS webhook_next_retry_at TIMESTAMPTZ;

-- Index for the cron job: fetch unsent changes ordered by changed_at
CREATE INDEX IF NOT EXISTS idx_estateos_changes_webhook_pending
  ON estateos_property_changes(changed_at ASC)
  WHERE webhook_sent_at IS NULL;

-- Index for retry logic
CREATE INDEX IF NOT EXISTS idx_estateos_changes_webhook_retry
  ON estateos_property_changes(webhook_next_retry_at ASC)
  WHERE webhook_sent_at IS NULL AND webhook_attempts > 0;

-- ============================================================
-- 2. ADD WEBHOOK URL TO API KEYS TABLE
-- ============================================================
ALTER TABLE estateos_api_keys
  ADD COLUMN IF NOT EXISTS webhook_url TEXT;

-- ============================================================
-- 3. HELPER: MARK A CHANGE AS SENT
-- ============================================================
CREATE OR REPLACE FUNCTION estateos_mark_webhook_sent(
  p_change_id BIGINT,
  p_status SMALLINT,
  p_response TEXT
)
RETURNS VOID AS $$
BEGIN
  UPDATE estateos_property_changes
  SET
    webhook_sent_at = NOW(),
    webhook_sent_status = p_status,
    webhook_response = LEFT(p_response, 2000)
  WHERE id = p_change_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 4. HELPER: INCREMENT WEBHOOK ATTEMPTS (for retries)
-- ============================================================
CREATE OR REPLACE FUNCTION estateos_increment_webhook_attempt(
  p_change_id BIGINT,
  p_response TEXT
)
RETURNS VOID AS $$
BEGIN
  UPDATE estateos_property_changes
  SET
    webhook_attempts = webhook_attempts + 1,
    webhook_response = LEFT(p_response, 2000),
    webhook_next_retry_at = NOW() + INTERVAL '5 minutes'
  WHERE id = p_change_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 5. VERIFY
-- ============================================================
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'estateos_property_changes'
  AND column_name LIKE 'webhook_%'
ORDER BY ordinal_position;