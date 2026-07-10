# Storage Setup Guide for Property Images

## Issue
The SQL script cannot grant permissions on storage tables due to Supabase security restrictions. Storage policies must be configured through the Supabase Dashboard UI.

## Solution: Setup via Supabase Dashboard

### Step 1: Verify Bucket Settings

1. Go to **Supabase Dashboard** → **Storage**
2. Find the `property-images` bucket
3. Click on it to open settings
4. Ensure these settings:
   - **Public bucket**: ✅ Enabled
   - **File size limit**: 50 MB (or your preferred limit)
   - **Allowed MIME types**: `image/jpeg, image/jpg, image/png, image/webp, image/gif`

If not set, update them now.

### Step 2: Create Storage Policies

1. In the `property-images` bucket, go to the **Policies** tab
2. Click **"New Policy"** button
3. Create the following 4 policies:

---

#### Policy 1: Allow Uploads (INSERT)

**Policy Name:** `Public can upload property images`

**Allowed Operation:** `INSERT`

**Policy Definition:**
```sql
bucket_id = 'property-images'
AND auth.role() = 'authenticated'
```

**Target Roles:** `authenticated`

---

#### Policy 2: Allow Viewing (SELECT)

**Policy Name:** `Public can view property images`

**Allowed Operation:** `SELECT`

**Policy Definition:**
```sql
bucket_id = 'property-images'
```

**Target Roles:** `public`, `authenticated`

---

#### Policy 3: Allow Updates (UPDATE)

**Policy Name:** `Public can update property images`

**Allowed Operation:** `UPDATE`

**Policy Definition:**
```sql
bucket_id = 'property-images'
AND auth.role() = 'authenticated'
```

**Target Roles:** `authenticated`

---

#### Policy 4: Allow Deletes (DELETE)

**Policy Name:** `Public can delete property images`

**Allowed Operation:** `DELETE`

**Policy Definition:**
```sql
bucket_id = 'property-images'
AND auth.role() = 'authenticated'
```

**Target Roles:** `authenticated`

---

### Step 3: Verify Policies

After creating all 4 policies, you should see them listed in the Policies tab:
- ✅ Public can upload property images (INSERT)
- ✅ Public can view property images (SELECT)
- ✅ Public can update property images (UPDATE)
- ✅ Public can delete property images (DELETE)

### Step 4: Test Image Upload

1. Go to your application
2. Navigate to the Property Submission form
3. Fill out the form and upload an image
4. Submit the form
5. Check if the image uploads successfully

## Alternative: Use Service Role Key (Advanced)

If you need to automate this, you can use the Supabase Service Role Key:

```javascript
// This bypasses RLS policies
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'YOUR_SUPABASE_URL',
  'YOUR_SERVICE_ROLE_KEY' // Not the anon key!
)

// Upload directly
const { data, error } = await supabase.storage
  .from('property-images')
  .upload('path/to/file.jpg', file)
```

**⚠️ Warning:** Never expose the service role key in client-side code!

## Troubleshooting

### Error: "new row violates row-level security policy"

**Solution:** Make sure you've created all 4 policies listed above.

### Error: "Bucket not found"

**Solution:** 
1. Go to Storage → Create a new bucket named `property-images`
2. Set it as public
3. Then create the policies

### Error: "Permission denied"

**Solution:** 
- Check that the bucket is set to "Public"
- Verify policies are created correctly
- Make sure you're authenticated (logged in) when uploading

## Quick Check

After setup, verify:
- [ ] Bucket `property-images` exists and is public
- [ ] INSERT policy exists for authenticated users
- [ ] SELECT policy exists for public
- [ ] UPDATE policy exists for authenticated users
- [ ] DELETE policy exists for authenticated users

## Support

If you're still having issues:
1. Check Supabase Dashboard → Logs for specific errors
2. Verify your Supabase client is using the correct API keys
3. Ensure you're running the app with `npm run dev` or similar
4. Check browser console for detailed error messages