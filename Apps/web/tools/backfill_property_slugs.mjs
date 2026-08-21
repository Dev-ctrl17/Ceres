// One-time backfill: assign a stable, unique `slug` to every property row
// that does not yet have one (legacy rows created before the slug column
// was adopted). Reuses the app-level slug algorithm.
//
// Run: node tools/backfill_property_slugs.mjs
// Requires SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (service_role bypasses
// Row-Level Security so we can backfill every row regardless of RLS policy).

import { createClient } from '@supabase/supabase-js';
import { UUID_RE, uniqueSlug } from '../Apps/web/src/lib/slug.js';

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
if (!url || !key) {
  console.error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY env vars.');
  process.exit(1);
}
const supabase = createClient(url, key, { fetch });

console.log('Scanning properties for rows with a NULL slug...');

const { data: rows, error } = await supabase
  .from('properties')
  .select('id, title, slug')
  .is('slug', null);

if (error) {
  console.error('Fetch error:', error.message);
  process.exit(1);
}

if (!rows?.length) {
  console.log('✅ No legacy properties without a slug. Nothing to backfill.');
  process.exit(0);
}

// Snapshot ALL existing slugs so newly generated ones avoid collisions.
const { data: allSlugs } = await supabase
  .from('properties')
  .select('slug')
  .not('slug', 'is', null);
const taken = new Set((allSlugs || []).map((r) => r.slug).filter(Boolean));

let updated = 0;
for (const row of rows) {
  const slug = uniqueSlug(row.title, taken);
  const { error: updErr } = await supabase
    .from('properties')
    .update({ slug })
    .eq('id', row.id);

  if (updErr) {
    console.warn(`- Failed ${row.id}: ${updErr.message}`);
    continue;
  }
  console.log(`- ${row.id}  ${row.title || '<untitled>'}  →  /properties/${slug}`);
  updated++;
}

console.log(`\n✅ Backfilled ${updated}/${rows.length} property slugs.`);
