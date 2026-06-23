# Mailboxlayer Email Verification - Setup Instructions

## Overview

This integration adds real-time email verification to all forms on the Luxury Properties Ltd website using the **Mailboxlayer API**. The verification is performed server-side via a **Supabase Edge Function** — the API key is never exposed to the browser.

## Architecture

```
Browser (React Form)
    │
    │ POST /verify-email (email)
    ▼
Supabase Edge Function (verify-email)
    │
    │ GET https://apilayer.net/api/check?access_key=...
    ▼
Mailboxlayer API
    │
    │ Response: format_valid, mx_found, smtp_check, disposable, score, etc.
    ▼
Edge Function returns { valid: true/false, error: "..." }
    │
    ▼
Browser continues or blocks submission
```

## Files Created/Modified

### New Files

| File | Purpose |
|------|---------|
| `supabase/functions/verify-email/index.ts` | Supabase Edge Function that calls Mailboxlayer API |
| `src/services/emailValidation.js` | Frontend email validation service with caching |
| `src/hooks/useEmailValidation.js` | React hook for email validation with loading/error states |

### Modified Files

| File | Changes |
|------|---------|
| `src/components/ContactForm.jsx` | Added email verification before form submission |
| `src/components/PropertySubmissionForm.jsx` | Added email verification for owner email |
| `src/components/Footer.jsx` | Added email verification to newsletter subscription |
| `src/pages/HomePage.jsx` | Added email verification to newsletter subscription |
| `.env` | Added Mailboxlayer configuration variables |

## Deployment Steps

### 1. Get a Mailboxlayer API Key

1. Go to [https://mailboxlayer.com/](https://mailboxlayer.com/)
2. Sign up for an account
3. Get your API access key from the dashboard

### 2. Deploy the Edge Function to Supabase

```bash
# Navigate to the project root
cd Apps/web

# Deploy the verify-email function
npx supabase functions deploy verify-email --project-ref lrmljudwbzjawafuztwp
```

### 3. Set the Mailboxlayer API Key as a Supabase Secret

```bash
# Set the API key as a Supabase secret (NEVER in .env or client code)
npx supabase secrets set MAILBOXLAYER_API_KEY=your_mailboxlayer_api_key_here
```

### 4. Verify the Existing Secrets

Check that the existing Brevo API key is also set:

```bash
npx supabase secrets list
```

Expected secrets:
- `BREVO_API_KEY` (already set)
- `MAILBOXLAYER_API_KEY` (set in step 3)

## How It Works

### Validation Flow

1. User fills out a form and clicks Submit
2. Client-side validation checks required fields
3. A loading indicator shows: "Verifying email..."
4. Frontend sends email to Supabase Edge Function `verify-email`
5. Edge Function calls Mailboxlayer API with the API key
6. Edge Function checks all validation fields:
   - `format_valid` - is the email format correct
   - `mx_found` - does the domain have mail exchange records
   - `smtp_check` - does the SMTP server confirm the mailbox exists
   - `disposable` - is it a temporary/disposable email address
   - `score` - quality score (reject below 0.80)
7. If validation passes → form submission continues
8. If validation fails → friendly error message displayed, submission blocked

### Validation Rules

**Rejected if:**
- `format_valid` is `false` → "Please enter a valid email address."
- `mx_found` is `false` → "Please enter a valid email address."
- `smtp_check` is `false` → "Please enter a valid email address."
- `disposable` is `true` → "Temporary email addresses are not accepted. Please use your permanent email address."
- `score` is below `0.80` → "Please enter a valid email address."

**Allowed but flagged:**
- Role emails (admin@, info@, support@, sales@) → allowed but noted for review

### Service Unavailability

If Mailboxlayer is unavailable:
- A warning message is shown: "Email verification is temporarily unavailable. Please try again in a few moments."
- The submission is **still allowed** to prevent blocking legitimate users

## Performance Optimizations

1. **Caching**: Validation results are cached for 5 minutes (both client-side and server-side)
2. **Rate Limiting**: Server-side rate limiting (10 requests/minute/IP) prevents abuse
3. **Retry Logic**: Automatically retries once on transient failures
4. **Timeout**: 10-second timeout on API calls to prevent hanging
5. **Graceful Degradation**: If Mailboxlayer is down, submissions are still accepted

## Security

- Mailboxlayer API key is stored as a Supabase secret, never in frontend code
- Input sanitization removes dangerous characters from email addresses
- Rate limiting prevents API abuse
- API errors are logged without exposing sensitive information
- Only validation results are returned to the frontend
- CORS headers configured for cross-origin requests

## Testing

After deployment, test the integration:

1. Open the Contact page
2. Enter an invalid email (e.g., `test@`) and submit → should show format error
3. Enter a disposable email (e.g., from `mailinator.com`) → should show disposable error
4. Enter a valid email (e.g., `your@email.com`) → should proceed with submission
5. Check the Supabase Edge Function logs:
   ```bash
   npx supabase functions logs verify-email
   ```

## Troubleshooting

### Edge Function returns 500
- Check that `MAILBOXLAYER_API_KEY` is set as a Supabase secret
- Run `npx supabase secrets list` to verify

### "Email verification is temporarily unavailable"
- Check Supabase Edge Function logs
- Verify Mailboxlayer API key is valid
- Check if Mailboxlayer service is up

### CORS errors
- The Edge Function already has CORS headers configured
- If issues persist, check browser console for specific error messages