-- Migration: Convert legacy storage paths to full public URLs
-- Run this in Supabase SQL Editor
-- 
-- Project: lrmljudwbzjawafuztwp
-- Bucket: proposal-files
-- Base URL: https://lrmljudwbzjawafuztwp.supabase.co/storage/v1/object/public/proposal-files/

-- ============================================
-- STEP 1: Identify proposals with legacy paths
-- ============================================
-- This will show you how many records need migration

SELECT 
  COUNT(*) as total_proposals,
  COUNT(CASE WHEN cover_image_url NOT LIKE 'http%' AND cover_image_url IS NOT NULL AND cover_image_url != '' THEN 1 END) as legacy_cover_images,
  COUNT(CASE WHEN document_url NOT LIKE 'http%' AND document_url IS NOT NULL AND document_url != '' THEN 1 END) as legacy_documents,
  COUNT(CASE WHEN gallery IS NOT NULL AND EXISTS (SELECT 1 FROM unnest(gallery) AS url WHERE url NOT LIKE 'http%') THEN 1 END) as legacy_galleries
FROM proposals;

-- ============================================
-- STEP 2: Update cover_image_url
-- ============================================
-- Converts bare paths to full public URLs

UPDATE proposals 
SET cover_image_url = 'https://lrmljudwbzjawafuztwp.supabase.co/storage/v1/object/public/proposal-files/' || cover_image_url
WHERE cover_image_url NOT LIKE 'http%'
  AND cover_image_url IS NOT NULL
  AND cover_image_url != '';

-- ============================================
-- STEP 3: Update document_url
-- ============================================
-- Converts bare paths to full public URLs

UPDATE proposals 
SET document_url = 'https://lrmljudwbzjawafuztwp.supabase.co/storage/v1/object/public/proposal-files/' || document_url
WHERE document_url NOT LIKE 'http%'
  AND document_url IS NOT NULL
  AND document_url != '';

-- ============================================
-- STEP 4: Update gallery array
-- ============================================
-- Updates each element in the gallery array that's not a full URL

UPDATE proposals
SET gallery = (
  SELECT array_agg(
    CASE 
      WHEN elem LIKE 'http%' THEN elem
      ELSE 'https://lrmljudwbzjawafuztwp.supabase.co/storage/v1/object/public/proposal-files/' || elem
    END
  )
  FROM unnest(gallery) AS elem
)
WHERE gallery IS NOT NULL
  AND EXISTS (SELECT 1 FROM unnest(gallery) AS url WHERE url NOT LIKE 'http%');

-- ============================================
-- STEP 5: Verify the migration
-- ============================================
-- This should return 0 rows if migration was successful

SELECT 
  id,
  title,
  cover_image_url,
  gallery,
  document_url,
  created_at
FROM proposals
WHERE 
  cover_image_url NOT LIKE 'http%'
  OR (gallery IS NOT NULL AND EXISTS (SELECT 1 FROM unnest(gallery) AS url WHERE url NOT LIKE 'http%'))
  OR (document_url NOT LIKE 'http%')
ORDER BY created_at DESC;

-- ============================================
-- STEP 6: Verify successful migrations
-- ============================================
-- This shows proposals that now have full URLs

SELECT 
  id,
  title,
  LEFT(cover_image_url, 80) as cover_image_preview,
  array_length(gallery, 1) as gallery_count,
  LEFT(document_url, 80) as document_preview,
  created_at
FROM proposals
WHERE 
  cover_image_url LIKE 'http%'
  OR (gallery IS NOT NULL AND array_length(gallery, 1) > 0)
ORDER BY created_at DESC
LIMIT 20;

-- ============================================
-- NOTES:
-- ============================================
-- Project reference: lrmljudwbzjawafuztwp
-- Full URL prefix: https://lrmljudwbzjawafuztwp.supabase.co/storage/v1/object/public/proposal-files/
--
-- 2. Run this script in sections (Step 1, then Step 2, etc.) to verify each step
--
-- 3. After migration, all new uploads will automatically save full URLs
--    (this was fixed in AdminDashboard.jsx)
--
-- 4. The bucket 'proposal-files' must be public for images to display
--    Run this to make it public if needed:
--
--    UPDATE storage.buckets SET public = true WHERE id = 'proposal-files';
--    INSERT INTO storage.buckets (id, name, public) 
--    VALUES ('proposal-files', 'proposal-files', true)
--    ON CONFLICT (id) DO UPDATE SET public = true;