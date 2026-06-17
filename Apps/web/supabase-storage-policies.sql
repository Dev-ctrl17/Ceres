-- ============================================================
-- SUPABASE STORAGE RLS POLICIES
-- Run this in Supabase SQL Editor AFTER the database policies
-- ============================================================

-- ============================================================
-- 1. PROPERTY-IMAGES BUCKET
-- ============================================================

-- Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-images', 'property-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access (everyone can view property images)
DROP POLICY IF EXISTS "Public can view property images" ON storage.objects;
CREATE POLICY "Public can view property images" ON storage.objects
  FOR SELECT USING (bucket_id = 'property-images');

-- Allow authenticated users to upload property images
DROP POLICY IF EXISTS "Authenticated users can upload property images" ON storage.objects;
CREATE POLICY "Authenticated users can upload property images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'property-images'
    AND auth.role() = 'authenticated'
  );

-- Allow authenticated users to update property images
DROP POLICY IF EXISTS "Authenticated users can update property images" ON storage.objects;
CREATE POLICY "Authenticated users can update property images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'property-images'
    AND auth.role() = 'authenticated'
  );

-- Allow authenticated users to delete property images
DROP POLICY IF EXISTS "Authenticated users can delete property images" ON storage.objects;
CREATE POLICY "Authenticated users can delete property images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'property-images'
    AND auth.role() = 'authenticated'
  );

-- ============================================================
-- 2. AGENT-PHOTOS BUCKET
-- ============================================================

-- Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('agent-photos', 'agent-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access
DROP POLICY IF EXISTS "Public can view agent photos" ON storage.objects;
CREATE POLICY "Public can view agent photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'agent-photos');

-- Allow authenticated users to upload agent photos
DROP POLICY IF EXISTS "Authenticated users can upload agent photos" ON storage.objects;
CREATE POLICY "Authenticated users can upload agent photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'agent-photos'
    AND auth.role() = 'authenticated'
  );

-- Allow authenticated users to update agent photos
DROP POLICY IF EXISTS "Authenticated users can update agent photos" ON storage.objects;
CREATE POLICY "Authenticated users can update agent photos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'agent-photos'
    AND auth.role() = 'authenticated'
  );

-- Allow authenticated users to delete agent photos
DROP POLICY IF EXISTS "Authenticated users can delete agent photos" ON storage.objects;
CREATE POLICY "Authenticated users can delete agent photos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'agent-photos'
    AND auth.role() = 'authenticated'
  );