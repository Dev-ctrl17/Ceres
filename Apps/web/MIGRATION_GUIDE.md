# Image Upload Migration Guide

This guide explains the fixes applied to resolve image display issues in the Client Success pages and provides steps to migrate existing data.

## Problem Summary

Images uploaded to Supabase Storage were being saved as bare storage paths (e.g., `proposals/1234567890_image.jpg`) instead of full public URLs (e.g., `https://your-project.supabase.co/storage/v1/object/public/proposal-files/proposals/1234567890_image.jpg`).

This caused `<img>` tags to fail because they expect full URLs, not storage paths.

## Changes Made

### 1. Fixed AdminDashboard.jsx (ProposalsManager)

**File:** `Apps/web/src/pages/AdminDashboard.jsx`

**Lines 1773-1792:** Updated the `onSubmit` function to convert storage paths to public URLs:

```javascript
// Upload cover image
if (coverImageFile) {
  toast.info("Uploading cover image...");
  const coverPath = await uploadFile("proposal-files", coverImageFile, "proposals");
  coverImageUrl = getFileUrl("proposal-files", coverPath) || coverPath;  // ✅ Now converts to public URL
}

// Upload gallery images
if (galleryFiles.length > 0) {
  toast.info(`Uploading ${galleryFiles.length} gallery images...`);
  const galleryPaths = await uploadFiles("proposal-files", galleryFiles, "proposals");
  const newGalleryUrls = galleryPaths.map(path => getFileUrl("proposal-files", path) || path);  // ✅ Converts each path
  galleryUrls = [...existingGallery, ...newGalleryUrls];
}

// Upload document
if (documentFile) {
  toast.info("Uploading document...");
  const docPath = await uploadFile("proposal-files", documentFile, "proposals");
  documentUrl = getFileUrl("proposal-files", docPath) || docPath;  // ✅ Converts to public URL
}
```

### 2. Hardened ClientSuccessDetailPage.jsx

**File:** `Apps/web/src/pages/ClientSuccessDetailPage.jsx`

Added defensive helpers to handle:
- **Gallery as JSON string:** The `gallery` column may come back as a JSON string instead of an array
- **Legacy bare paths:** Old data may have storage paths instead of full URLs

```javascript
// Parse gallery (handles both array and JSON string)
const parseGallery = (gallery) => {
  if (!gallery) return [];
  
  if (Array.isArray(gallery)) {
    return gallery.filter(url => url && url.trim() !== '');
  }
  
  if (typeof gallery === 'string') {
    try {
      const parsed = JSON.parse(gallery);
      if (Array.isArray(parsed)) {
        return parsed.filter(url => url && url.trim() !== '');
      }
    } catch (e) {
      console.warn('Failed to parse gallery JSON:', e);
    }
  }
  
  return [];
};

// Resolve image URL - converts storage paths to full public URLs
const resolveImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return getFileUrl('proposal-files', url) || url;
};

// Usage
const galleryImages = parseGallery(proposal.gallery).map(resolveImageUrl).filter(Boolean);
const coverImage = resolveImageUrl(proposal.cover_image_url);
```

### 3. Created Image URL Helper Utilities

**File:** `Apps/web/src/utils/imageUrlHelpers.js`

Created reusable utilities for:
- `isFullUrl()` - Check if a string is already a full URL
- `resolveImageUrl()` - Convert storage paths to public URLs
- `hasLegacyPaths()` - Detect records with legacy bare paths
- `migrateProposalUrls()` - Migrate a single proposal record
- `generateMigrationSQL()` - Generate SQL migration script

## Migrating Existing Data

### Option A: One-Time SQL Migration (Recommended)

If you have existing proposals with bare storage paths, run this SQL in your Supabase SQL Editor:

```sql
-- Step 1: Check how many records need migration
SELECT 
  COUNT(*) as total_proposals,
  COUNT(CASE WHEN cover_image_url NOT LIKE 'http%' THEN 1 END) as legacy_cover_images,
  COUNT(CASE WHEN document_url NOT LIKE 'http%' THEN 1 END) as legacy_documents
FROM proposals;

-- Step 2: Update cover_image_url
-- Replace YOUR_PROJECT_REF with your actual Supabase project reference
UPDATE proposals 
SET cover_image_url = 'https://YOUR_PROJECT_REF.supabase.co/storage/v1/object/public/proposal-files/' || cover_image_url
WHERE cover_image_url NOT LIKE 'http%'
  AND cover_image_url IS NOT NULL
  AND cover_image_url != '';

-- Step 3: Update document_url
UPDATE proposals 
SET document_url = 'https://YOUR_PROJECT_REF.supabase.co/storage/v1/object/public/proposal-files/' || document_url
WHERE document_url NOT LIKE 'http%'
  AND document_url IS NOT NULL
  AND document_url != '';

-- Step 4: Update gallery array (more complex)
-- This updates each element in the gallery array that's not a full URL
UPDATE proposals
SET gallery = (
  SELECT array_agg(
    CASE 
      WHEN elem LIKE 'http%' THEN elem
      ELSE 'https://YOUR_PROJECT_REF.supabase.co/storage/v1/object/public/proposal-files/' || elem
    END
  )
  FROM unnest(gallery) AS elem
)
WHERE gallery IS NOT NULL
  AND EXISTS (SELECT unnest(gallery) AS url WHERE url NOT LIKE 'http%');

-- Step 5: Verify the migration
SELECT 
  id,
  title,
  cover_image_url,
  gallery,
  document_url
FROM proposals
WHERE 
  cover_image_url NOT LIKE 'http%'
  OR (gallery IS NOT NULL AND EXISTS (SELECT unnest(gallery) AS url WHERE url NOT LIKE 'http%'))
  OR (document_url NOT LIKE 'http%');
```

**Expected result:** The final SELECT should return 0 rows.

### Option B: Defensive Frontend Migration (No Database Changes)

If you can't run SQL migrations, use the defensive helpers in `imageUrlHelpers.js`:

```javascript
import { migrateAllProposals, hasLegacyPaths } from '@/utils/imageUrlHelpers';

// In your component:
const fetchProposals = async () => {
  const { data } = await proposalsApi.getAll();
  
  // Migrate all proposals in memory (doesn't save to DB)
  const migratedProposals = migrateAllProposals(data, 'proposal-files');
  
  // Check if any still have legacy paths
  const legacyCount = migratedProposals.filter(hasLegacyPaths).length;
  console.log(`Migrated ${migratedProposals.length} proposals, ${legacyCount} still have legacy paths`);
  
  setProposals(migratedProposals);
};
```

**Note:** This approach resolves URLs in memory but doesn't update the database. New uploads will work correctly, but old data will be re-migrated on each page load.

## Verifying Supabase Storage Bucket is Public

The `getFileUrl()` function uses `getPublicUrl()` which only works for **public buckets**.

### To check if your bucket is public:

1. Go to Supabase Dashboard → Storage
2. Find the `proposal-files` bucket
3. Check if the "Public" toggle is enabled

### To make it public (if not already):

**Via SQL:**
```sql
-- Update the bucket to be public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'proposal-files';

-- If the bucket doesn't exist, create it:
INSERT INTO storage.buckets (id, name, public) 
VALUES ('proposal-files', 'proposal-files', true)
ON CONFLICT (id) DO UPDATE SET public = true;
```

**Via Dashboard:**
1. Go to Storage → proposal-files → Configuration
2. Toggle "Public bucket" to ON
3. Save changes

### Storage Policies Required

Ensure these policies exist (from `supabase-create-proposals-table.sql`):

```sql
-- Public can view files
CREATE POLICY "Public can view proposal files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'proposal-files');

-- Authenticated users can upload files
CREATE POLICY "Authenticated users can upload proposal files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'proposal-files' AND auth.role() = 'authenticated');

-- Authenticated users can update files
CREATE POLICY "Authenticated users can update proposal files"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'proposal-files' AND auth.role() = 'authenticated');

-- Authenticated users can delete files
CREATE POLICY "Authenticated users can delete proposal files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'proposal-files' AND auth.role() = 'authenticated');
```

## Column Type Recommendation

### Current Schema: `gallery TEXT[]`

The current schema uses `TEXT[]` (PostgreSQL array of text), which is **correct** for your use case.

**Why TEXT[] is better than JSONB:**

1. **Native array operations:** You can use PostgreSQL array functions like `unnest()`, `array_agg()`, `array_length()`
2. **Better performance:** Arrays are more efficient for simple list operations
3. **Cleaner queries:** Easier to query and update individual elements
4. **Supabase-js compatibility:** Supabase-js handles arrays natively without manual JSON parsing

**Example queries with TEXT[]:**
```sql
-- Get array length
SELECT array_length(gallery, 1) FROM proposals;

-- Check if array contains a value
SELECT * FROM proposals WHERE 'image.jpg' = ANY(gallery);

-- Append to array
UPDATE proposals 
SET gallery = array_append(gallery, 'new-image.jpg')
WHERE id = 'proposal-id';
```

**When to use JSONB instead:**
- If you need to store objects with multiple properties per item
- If you need complex nested structures
- If you need to query by object keys

For simple URL lists, `TEXT[]` is the right choice.

## Testing the Fix

1. **Upload a new proposal** with images via Admin Dashboard
2. **Check the database** to verify URLs are stored as full URLs:
   ```sql
   SELECT id, title, cover_image_url, gallery, document_url 
   FROM proposals 
   ORDER BY created_at DESC 
   LIMIT 5;
   ```
3. **View the proposal** on the client success page
4. **Verify images load** correctly

## Summary

✅ **Fixed:** AdminDashboard.jsx now converts storage paths to public URLs before saving  
✅ **Fixed:** ClientSuccessDetailPage.jsx handles both arrays and JSON strings for gallery  
✅ **Fixed:** ClientSuccessDetailPage.jsx resolves legacy bare paths to full URLs  
✅ **Created:** Reusable helper utilities in `imageUrlHelpers.js`  
✅ **Documented:** SQL migration script for existing data  
✅ **Verified:** Bucket should be public for `getFileUrl()` to work  

## Next Steps

1. Run the SQL migration (Option A) if you have existing data
2. Verify the `proposal-files` bucket is public
3. Test uploading a new proposal
4. Verify images display correctly on client success pages