-- ============================================================
-- SUPABASE STORAGE POLICIES - PUBLIC UPLOAD FIX
-- ============================================================
-- BUG FIX (July 2026): Allow public users to upload images
-- Previously required auth.role() = 'authenticated', which blocked
-- anonymous users on the Sell page from uploading property images.
-- ============================================================

-- Drop the old authenticated-only policy if it still exists
DROP POLICY IF EXISTS "Public can upload property images" ON storage.objects;

-- Create or replace the public upload policy
-- Uses IF NOT EXISTS to avoid errors if already applied
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Anyone can upload property images'
  ) THEN
    CREATE POLICY "Anyone can upload property images"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'property-images');
  END IF;
END $$;

-- ============================================================
-- STATUS CHECK: Run this to verify the policy is active
-- ============================================================
-- SELECT policyname, roles, cmd, qual, with_check
-- FROM pg_policies
-- WHERE tablename = 'objects' AND policyname = 'Anyone can upload property images';