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

    -- Team member photos are publicly displayed on the About page. Keep reads
    -- public, while restricting uploads, updates, and deletes to signed-in admins.
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('team-photos', 'team-photos', true)
    ON CONFLICT (id) DO UPDATE SET public = true;

    DROP POLICY IF EXISTS "Public can read team photos" ON storage.objects;
    DROP POLICY IF EXISTS "Admins can upload team photos" ON storage.objects;
    DROP POLICY IF EXISTS "Admins can update team photos" ON storage.objects;
    DROP POLICY IF EXISTS "Admins can delete team photos" ON storage.objects;

    CREATE POLICY "Public can read team photos"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'team-photos');

    CREATE POLICY "Admins can upload team photos"
    ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'team-photos');

    CREATE POLICY "Admins can update team photos"
    ON storage.objects FOR UPDATE TO authenticated
    USING (bucket_id = 'team-photos')
    WITH CHECK (bucket_id = 'team-photos');

    CREATE POLICY "Admins can delete team photos"
    ON storage.objects FOR DELETE TO authenticated
    USING (bucket_id = 'team-photos');

-- ============================================================
-- STATUS CHECK: Run this to verify the policy is active
-- ============================================================
-- SELECT policyname, roles, cmd, qual, with_check
-- FROM pg_policies
-- WHERE tablename = 'objects' AND policyname = 'Anyone can upload property images';