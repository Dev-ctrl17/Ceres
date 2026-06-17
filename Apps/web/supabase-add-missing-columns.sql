-- ============================================================
-- ADD MISSING COLUMNS TO PROPERTIES TABLE
-- Run this in Supabase SQL Editor if columns are missing
-- ============================================================

-- Add is_verified column (for PropertyDetailsPage badge)
ALTER TABLE properties 
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;

-- Add is_featured column (for homepage featured properties)
ALTER TABLE properties 
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- Add images column (JSONB array for multiple images)
ALTER TABLE properties 
  ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;

-- Add purpose column (for filtering Buy/Rent)
ALTER TABLE properties 
  ADD COLUMN IF NOT EXISTS purpose TEXT DEFAULT 'Buy';

-- Add property_type column (for filtering property types)
ALTER TABLE properties 
  ADD COLUMN IF NOT EXISTS property_type TEXT;

-- Add amenities column (for property features)
ALTER TABLE properties 
  ADD COLUMN IF NOT EXISTS amenities JSONB DEFAULT '[]'::jsonb;

-- Add video_tour column (for video embeds)
ALTER TABLE properties 
  ADD COLUMN IF NOT EXISTS video_tour TEXT;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_properties_is_featured ON properties(is_featured);
CREATE INDEX IF NOT EXISTS idx_properties_is_verified ON properties(is_verified);
CREATE INDEX IF NOT EXISTS idx_properties_purpose ON properties(purpose);
CREATE INDEX IF NOT EXISTS idx_properties_property_type ON properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);

-- Update existing rows with default values
UPDATE properties 
SET 
  purpose = 'Buy',
  is_featured = false,
  is_verified = false,
  images = '[]'::jsonb,
  amenities = '[]'::jsonb
WHERE 
  purpose IS NULL 
  OR is_featured IS NULL 
  OR is_verified IS NULL 
  OR images IS NULL 
  OR amenities IS NULL;

-- Verify the columns were added
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'properties' 
  AND table_schema = 'public'
ORDER BY ordinal_position;