// Sitemap generator for https://luxurypropertiesltd.com.ng
//
// Keeps every hand-maintained static <url> entry in public/sitemap.xml
// untouched (byte-for-byte) and appends one canonical <url> per live
// property slug pulled from Supabase — mirroring the pattern already used
// by scripts/getRoutes.js + prerender.mjs.
//
// This is what resolves the audit's "orphan / no incoming link" flags for
// the ~56 dynamic /properties/:slug pages: once each slug is listed here
// AND is reachable via the /properties grid, Similar Properties and
// Investment Brief internal links, the pages are neither orphaned nor
// canonical-less-in-sitemap.
//
// Run:  node scripts/generate-sitemap.mjs   (from Apps/web)
//       npm run sitemap
import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITEMAP_PATH = resolve(__dirname, '../public/sitemap.xml');
const DOMAIN = 'https://luxurypropertiesltd.com.ng';
const LAST_MOD = new Date().toISOString().split('T')[0];

// Load .env manually (same helper as scripts/getRoutes.js).
function loadEnv() {
  const envPath = resolve(__dirname, '../.env');
  if (existsSync(envPath)) {
    const lines = readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const t = line.trim();
      if (t && !t.startsWith('#')) {
        const eq = t.indexOf('=');
        if (eq > -1) {
          const k = t.slice(0, eq).trim();
          const v = t.slice(eq + 1).trim();
          if (!process.env[k]) process.env[k] = v;
        }
      }
    }
  }
}
loadEnv();

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const anon = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const urlBlock = ({ loc, lastmod = LAST_MOD, changefreq = 'monthly', priority = '0.6' }) =>
  `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>\n`;

async function fetchPropertySlugs() {
  // No (or malformed) credentials -> warn and fall back to static-only sitemap.
  if (!url || !anon) {
    console.warn('[generate-sitemap] Missing Supabase credentials — skipping property URLs. Static entries preserved.');
    return [];
  }
  const supabase = createClient(url, anon);
  const { data, error } = await supabase
    .from('properties')
    .select('slug')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('[generate-sitemap] Supabase query failed:', error.message);
    return [];
  }
  const slugs = (data || []).map((p) => p.slug).filter(Boolean);
  console.log(`[generate-sitemap] Found ${slugs.length} property slugs.`);
  return slugs;
}

function buildSitemap(propertySlugs) {
  const raw = readFileSync(SITEMAP_PATH, 'utf8');

  // Preserve the existing static <url> blocks exactly as authored
  // (keep comments too) but drop any stale /properties/<x> block so the
  // property list below is the single source of truth.
  const NEWLINE = raw.includes('\r\n') ? '\r\n' : '\n';
  const blockRe = /<url>[\s\S]*?<\/url>/g;
  const staticChunks = [];
  let lastIndex = 0;
  for (const m of raw.matchAll(blockRe)) {
    staticChunks.push(raw.slice(lastIndex, m.index)); // leading markup/comments/whitespace
    const block = m[0];
    const isProperty = /<loc>\s*https:\/\/luxurypropertiesltd\.com\.ng\/properties\/[^<]+<\/loc>/.test(block);
    if (!isProperty) staticChunks.push(block);
    lastIndex = m.index + m[0].length;
  }
  staticChunks.push(raw.slice(lastIndex)); // closing </urlset>

  // Build the property block list (canonical self-referencing URLs only).
  const propBlocks = propertySlugs.length
    ? `\n  <!-- Dynamic Property Pages (canonical slug URLs) -->\n` +
      propertySlugs.map((slug) =>
        urlBlock({ loc: `${DOMAIN}/properties/${slug}`, changefreq: 'weekly', priority: '0.6' })
      ).join('\n')
    : '';

  // Reassemble. The final raw ends in </urlset>, so we close the property
  // section before it.
  const body = staticChunks.join('');
  // Find the closing </urlset> and insert propBlocks before it.
  const closeIdx = body.lastIndexOf('</urlset>');
  const out = body.slice(0, closeIdx) + propBlocks + NEWLINE + body.slice(closeIdx);
  return out;
}

async function main() {
  const slugs = await fetchPropertySlugs();
  // Deterministic sort so re-runs produce a stable file (good for git diff).
  slugs.sort();
  const xml = buildSitemap(slugs);
  writeFileSync(SITEMAP_PATH, xml, 'utf8');
  console.log(`[generate-sitemap] Wrote ${SITEMAP_PATH}`);
}

main().catch((err) => {
  console.error('[generate-sitemap] Failed:', err);
  process.exit(1);
});
