# Website Visitor Tracker - Installation Guide

## Overview
A complete visitor tracking system with real-time analytics dashboard. Tracks IP, country, device, browser, OS, referrer, landing pages, time on page, and more.

## Files Created

| File | Purpose |
|------|---------|
| `supabase-visitor-tracking-schema.sql` | Database tables (visitors, page_views, live_visitors) |
| `public/tracker.js` | Standalone tracking script (paste in `<head>`) |
| `src/lib/visitorTracking.js` | API service for admin analytics |
| `src/pages/AdminDashboard.jsx` | Updated with Analytics tab |

---

## Step 1: Run the Database Schema

1. Go to your Supabase project → **SQL Editor**
2. Open and run `supabase-visitor-tracking-schema.sql`
3. This creates 3 tables:
   - `visitors` — unique visitor sessions with device/location info
   - `page_views` — individual page views with time-on-page tracking
   - `live_visitors` — currently active visitors (auto-cleaned after 30 min)

---

## Step 2: Add the Tracking Script to Your Website

Paste this ONE script tag in your `<head>` tag:

```html
<script src="https://YOUR_DOMAIN.com/tracker.js"
        data-url="https://YOUR_PROJECT.supabase.co"
        data-key="YOUR_SUPABASE_ANON_KEY">
</script>
```

Replace:
- `YOUR_DOMAIN.com` — your website domain
- `YOUR_PROJECT.supabase.co` — your Supabase project URL
- `YOUR_SUPABASE_ANON_KEY` — your Supabase anon/public key

### What the tracker does:
- Generates a unique session ID per visitor
- Detects device type, browser, OS from user agent
- Captures UTM parameters from URL
- Sends heartbeat every 30 seconds to track live visitors
- Tracks time on page (updates on beforeunload)
- Detects and ignores bots
- Respects cookie consent (requires `_vt_consent=true` cookie)
- Anonymizes IP addresses (last octet removed)

### Cookie Consent Integration
The tracker checks for a cookie named `_vt_consent=true`. To accept tracking:

```javascript
// Call this when user accepts cookies
window._vt_acceptCookies();
```

Or set the cookie manually:
```javascript
document.cookie = '_vt_consent=true; path=/; max-age=' + (365 * 24 * 60 * 60);
```

---

## Step 3: Access the Analytics Dashboard

1. Log in to your admin panel at `/login`
2. Navigate to `/admin`
3. Click the **Analytics** tab

### Dashboard Features:
- **Overview Cards**: Total visitors today, this week, this month, live now
- **Live Visitors**: Real-time list of currently active visitors
- **Top Countries**: Geographic breakdown
- **Devices**: Desktop vs mobile vs tablet
- **Browsers**: Chrome, Firefox, Safari, etc.
- **Top Pages**: Most visited pages with avg time and bounce count
- **Visitors Table**: Searchable table with country, device, browser, OS, page, timestamp
- **Export CSV**: Download all visitor data as CSV

---

## Step 4: Verify It's Working

1. Open your website in a browser
2. Accept cookies (or set `_vt_consent=true` cookie)
3. Visit a few pages
4. Go to Admin → Analytics tab
5. You should see your visit appear in real-time

---

## Privacy Compliance

- **GDPR Ready**: Tracker respects cookie consent before collecting data
- **IP Anonymization**: Last octet of IP is removed before storage
- **Bot Detection**: Known bots/crawlers are automatically excluded
- **Data Control**: Export or delete visitor data from the admin panel

## Troubleshooting

**No data showing?**
1. Check that the Supabase schema was run successfully
2. Verify the `data-url` and `data-key` in the script tag are correct
3. Check browser console for CORS errors
4. Ensure the visitor accepted cookies (`_vt_consent=true`)
5. Check Supabase table permissions (RLS policies are included in schema)

**CORS errors?**
Add your website domain to Supabase's allowed origins:
1. Go to Supabase → Settings → API
2. Under "CORS", add your domain (e.g., `https://yourdomain.com`)