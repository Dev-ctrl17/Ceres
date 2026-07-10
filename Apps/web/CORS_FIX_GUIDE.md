# CORS and Storage Configuration Guide

## Issues Identified

1. **CORS Error**: Email verification Edge Function blocked by CORS policy
2. **Storage RLS Error**: Image uploads failing due to Row Level Security policy

## Solutions

### 1. Fix CORS for Edge Functions

The email verification Edge Function needs CORS headers. You have two options:

#### Option A: Update Edge Function Code (Recommended)

Edit the `verify-email` Edge Function in your Supabase dashboard:

```typescript
// supabase/functions/verify-email/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email } = await req.json()

    // Your email verification logic here
    // Call Mailboxlayer or similar service

    const result = {
      valid: true,
      email: email
    }

    return new Response(
      JSON.stringify(result),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})
```

#### Option B: Deploy Updated Edge Function

1. Go to Supabase Dashboard → Edge Functions
2. Find the `verify-email` function
3. Click "Edit" and update the code with the CORS headers above
4. Deploy the function

### 2. Fix Storage RLS Policies

Run the SQL script `supabase-storage-policies.sql` in your Supabase SQL Editor:

1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste the contents of `supabase-storage-policies.sql`
3. Click "Run" to execute the script

This will:
- Create the `property-images` storage bucket (if it doesn't exist)
- Set up RLS policies to allow authenticated users to upload images
- Allow public read access to images
- Enable proper file size limits (50MB) and MIME type restrictions

### 3. Alternative: Disable Email Verification Temporarily

If you want to test forms without email verification, you can modify the forms to skip verification:

#### For ContactForm.jsx:

```javascript
const onSubmit = async (data) => {
  // Skip email verification for testing
  // Comment out or remove the verification step
  
  // Keep everything else the same
}
```

#### For PropertySubmissionForm.jsx:

```javascript
const onSubmit = async (data) => {
  // Skip email verification for testing
  
  // Keep everything else the same
}
```

## Verification Steps

After applying the fixes:

1. **Test EPAN Registration Form** - Should submit without errors
2. **Test Contact Form** - Should submit without CORS errors
3. **Test Property Submission Form** - Should upload images successfully
4. **Check Supabase Dashboard**:
   - Verify data appears in `propertysubmissions` table
   - Verify data appears in `leads` table
   - Verify images appear in Storage → property-images bucket

## Common Issues

### CORS Error Persists
- Make sure the Edge Function is deployed (not just saved as draft)
- Check that the function URL is correct in your code
- Verify the function has proper permissions in Supabase

### Storage Upload Fails
- Ensure the `property-images` bucket exists in Supabase Storage
- Check that RLS policies are enabled on `storage.objects` table
- Verify the bucket is set to "Public" in Storage settings

### Email Verification Still Fails
- The email verification is optional - forms will work without it
- Check your Mailboxlayer API key is configured correctly
- Consider disabling verification in development

## Quick Test

To quickly test if forms work without email verification:

1. Comment out the email verification code in the forms
2. Try submitting a form
3. If it works, the issue is with the Edge Function CORS
4. If it still fails, check the database column names

## Support

If issues persist:
1. Check the browser console for specific error messages
2. Check Supabase logs in Dashboard → Logs
3. Verify all SQL scripts have been executed
4. Ensure environment variables are set correctly