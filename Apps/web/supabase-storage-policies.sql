-- ============================================================
-- SUPABASE STORAGE POLICIES
-- Run this in Supabase SQL Editor to fix storage upload issues
-- ============================================================

-- Storage policies for property-images bucket
-- This allows public uploads to the property-images bucket

-- Update bucket settings if it exists (don't try to create if already exists)
UPDATE storage.buckets 
SET 
  public = true,
  file_size_limit = 52428800, -- 50MB limit
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']::text[]
WHERE id = 'property-images';

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can upload property images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view property images" ON storage.objects;
DROP POLICY IF EXISTS "Public can update property images" ON storage.objects;
DROP POLICY IF EXISTS "Public can delete property images" ON storage.objects;

-- Policy: Allow uploads to property-images bucket
CREATE POLICY "Public can upload property images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'property-images'
  AND auth.role() = 'authenticated'
);

-- Policy: Allow viewing images from property-images bucket
CREATE POLICY "Public can view property images"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'property-images'
);

-- Policy: Allow updates to property-images bucket
CREATE POLICY "Public can update property images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'property-images'
  AND auth.role() = 'authenticated'
);

-- Policy: Allow deletes from property-images bucket
CREATE POLICY "Public can delete property images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'property-images'
  AND auth.role() = 'authenticated'
);

-- Note: Storage policies require manual setup in Supabase Dashboard
-- Go to Storage → property-images bucket → Policies tab
-- Add the following policies manually through the UI
