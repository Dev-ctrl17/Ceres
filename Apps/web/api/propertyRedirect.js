// Vercel Serverless Function — 301 redirect for legacy UUID property URLs.
//
// Property detail pages now use slug-based URLs (/properties/<slug>).
// Old shared links / stale search-index entries still hit /properties/<uuid>.
// This function 301-redirects those to the property's canonical slug URL so
// all SEO equity from the old UUID URLs is preserved.
//
// Wired in vercel.json (`rewrites`), BEFORE the SPA catch-all:
//   {
//     "source": "/properties/:uuid(<uuid-regex>)",
//     "destination": "/api/propertyRedirect.js?uuid=$1"
//   }
//
// Only UUID-shaped segments match the rewrite `source`, so genuine slug
// URLs are served straight from the prerendered shell (or the SPA) and
// never reach this function.

import { createClient } from '@supabase/supabase-js';

// Mirrors src/lib/slug.js — duplicated here so this edge function carries
// no dependency on the client bundle.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DOMAIN = 'https://luxurypropertiesltd.com.ng';

export default async function (req, res) {
  const uuid = req.query?.uuid;

  // Only act on genuine UUIDs — never redirect a human slug or a typo.
  if (!uuid || !UUID_RE.test(uuid)) {
    return res.status(404).send('Property not found');
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).send('Server misconfigured');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  let slug = null;
  try {
    const { data, error } = await Promise.race([
      supabase.from('properties').select('slug').eq('id', uuid).single(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 6000)),
    ]);
    if (error) throw error;
    slug = data?.slug;
  } catch (err) {
    console.error('[propertyRedirect] lookup failed:', err?.message || err);
  }

  if (!slug) {
    return res.status(404).send('Property not found');
  }

  // 301 (permanent): preserves link equity from previously shared
  // UUID-based URLs → canonical slug URL.
  return res.redirect(301, `${DOMAIN}/properties/${slug}`);
}
