# Quick Start Guide - Fix Form Submission Errors

## ✅ Code Fixes Already Applied

All PostgreSQL case sensitivity issues have been fixed in the code:
- EPANPage.jsx ✅
- ContactForm.jsx ✅
- PropertySubmissionForm.jsx ✅

## ⚠️ One Manual Step Required

You MUST configure storage policies in Supabase Dashboard for image uploads to work.

### Setup Instructions (5 minutes):

#### 1. Open Supabase Dashboard
- Go to https://supabase.com/dashboard
- Select your project
- Navigate to **Storage** in the left sidebar

#### 2. Select the Bucket
- Click on **property-images** bucket
- Go to the **Policies** tab

#### 3. Create 4 Policies

Click **"New Policy"** for each:

---

**Policy 1 - Allow Uploads:**
- Name: `Public can upload property images`
- Operation: `INSERT`
- Policy: `bucket_id = 'property-images' AND auth.role() = 'authenticated'`
- Roles: `authenticated`

**Policy 2 - Allow Viewing:**
- Name: `Public can view property images`
- Operation: `SELECT`
- Policy: `bucket_id = 'property-images'`
- Roles: `public`, `authenticated`

**Policy 3 - Allow Updates:**
- Name: `Public can update property images`
- Operation: `UPDATE`
- Policy: `bucket_id = 'property-images' AND auth.role() = 'authenticated'`
- Roles: `authenticated`

**Policy 4 - Allow Deletes:**
- Name: `Public can delete property images`
- Operation: `DELETE`
- Policy: `bucket_id = 'property-images' AND auth.role() = 'authenticated'`
- Roles: `authenticated`

---

#### 4. Test the Forms

1. **Clear browser cache** (Ctrl+Shift+R)
2. **Test EPAN forms** - Should work immediately
3. **Test Contact Form** - Should work immediately
4. **Test Property Submission** - Should work after storage policies are set

## Current Status

| Component | Status | Notes |
|-----------|--------|-------|
| EPAN Agent Registration | ✅ Ready | Works after cache clear |
| EPAN Partnership Inquiry | ✅ Ready | Works after cache clear |
| Contact Form | ✅ Ready | Works after cache clear |
| Property Submission Form | ⚠️ Needs Setup | Requires storage policies |

## Error Messages Explained

### "Email verification service unavailable"
- **Status:** Expected and handled
- **Impact:** None - forms still submit
- **Solution:** Optional - fix CORS if you want email verification

### "new row violates row-level security policy"
- **Status:** Needs manual fix
- **Impact:** Blocks image uploads
- **Solution:** Create storage policies in Supabase Dashboard (see above)

## Need Help?

See detailed guides:
- `STORAGE_SETUP_GUIDE.md` - Full storage setup instructions
- `CORS_FIX_GUIDE.md` - Email verification CORS fix (optional)

## Summary

**The original error "Failed to submit registration. Please try again" is FIXED in the code.**

You just need to:
1. Set up storage policies (5 minutes, one-time)
2. Clear browser cache
3. Test the forms

All forms will work perfectly after completing the storage setup!