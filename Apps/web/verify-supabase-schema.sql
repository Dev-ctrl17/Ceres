-- ============================================================
-- SUPABASE SCHEMA VERIFICATION SCRIPT
-- Run this in Supabase SQL Editor to verify your database
-- ============================================================

-- 1. Check all columns in properties table
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'properties' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Check if purpose column exists (required by useProperties.js)
SELECT 
  COUNT(*) as purpose_column_exists
FROM information_schema.columns 
WHERE table_name = 'properties' 
  AND column_name = 'purpose';

-- 3. Check if images column exists (required for multiple image support)
SELECT 
  COUNT(*) as images_column_exists
FROM information_schema.columns 
WHERE table_name = 'properties' 
  AND column_name = 'images';

-- 4. Check if is_featured column exists (required for homepage)
SELECT 
  COUNT(*) as is_featured_column_exists
FROM information_schema.columns 
WHERE table_name = 'properties' 
  AND column_name = 'is_featured';

-- 5. Check if is_verified column exists (required for PropertyDetailsPage)
SELECT 
  COUNT(*) as is_verified_column_exists
FROM information_schema.columns 
WHERE table_name = 'properties' 
  AND column_name = 'is_verified';

-- 6. Check if property_type column exists (required for filtering)
SELECT 
  COUNT(*) as property_type_column_exists
FROM information_schema.columns 
WHERE table_name = 'properties' 
  AND column_name = 'property_type';

-- 7. Check if storage bucket exists
SELECT 
  id, 
  name, 
  public, 
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id = 'property-images';

-- 8. Check sample property data to see what columns are populated
SELECT 
  id,
  title,
  property_type,
  purpose,
  status,
  is_featured,
  is_verified,
  image_url,
  images,
  amenities,
  video_tour
FROM properties 
LIMIT 5;

-- 9. Check RLS policies on properties table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'properties';

-- ============================================================
-- FIXES: Run these if columns are missing
-- ============================================================

-- Add purpose column if missing
-- ALTER TABLE properties ADD COLUMN IF NOT EXISTS purpose TEXT DEFAULT 'Buy';

-- Add images column if missing (JSONB array for multiple images)
-- ALTER TABLE properties ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;

-- Add is_featured column if missing
-- ALTER TABLE properties ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- Add is_verified column if missing
-- ALTER TABLE properties ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;

-- Add property_type column if missing
-- ALTER TABLE properties ADD COLUMN IF NOT EXISTS property_type TEXT;

-- Create property-images bucket if missing (run in Storage section)
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES ('property-images', 'property-images', true, 10485760, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'])
-- ON CONFLICT (id) DO NOTHING;