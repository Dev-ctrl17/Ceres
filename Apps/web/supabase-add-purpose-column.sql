-- ============================================================
-- ADD PURPOSE COLUMN TO PROPERTIES TABLE
-- Run this in Supabase SQL Editor if the purpose column doesn't exist
-- ============================================================

-- Add purpose column with default 'Buy'
ALTER TABLE properties 
  ADD COLUMN IF NOT EXISTS purpose TEXT DEFAULT 'Buy';

-- Update any existing rows that don't have a purpose value
UPDATE properties 
SET purpose = 'Buy' 
WHERE purpose IS NULL;

-- Create an index for faster filtering by purpose
CREATE INDEX IF NOT EXISTS idx_properties_purpose ON properties(purpose);

-- Verify the column was added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'properties' 
  AND column_name = 'purpose';