// Idempotent line-index indent corrector for the slug-migration edits.
// Asserts each target line contains a token before rewriting; skips if already
// correct. Safe to re-run. Fixes the first-line double-indent that token-only
// replace operations introduced.
// Run: node tools/_fix_lines2.mjs
import { readFileSync, writeFileSync } from 'fs';

const root = 'C:/Users/BELLO IREBAMI/Desktop/Javascript/Apps/web';
const logPath = 'C:/Users/BELLO IREBAMI/Desktop/Javascript/tools/_fix_lines2.log';
let log = '';

const targets = [
  { file: 'src/App.jsx',                       idx: 61,  token: '/properties/:slug',           line: '      <Route path="/properties/:slug" element={<PropertyDetailsPage />} />' },
  { file: 'src/components/PropertyCard.jsx',   idx: 46,  token: '/properties/${property.slug',  line: '    <Link to={`/properties/${property.slug`}>`' },
  { file: 'src/pages/InvestmentBriefPage.jsx', idx: 315, token: '/properties/${property.slug',  line: '                  <Link to={`/properties/${property.slug`}>`' },
  { file: 'scripts/getRoutes.js',              idx: 49,  token: 'const { data: properties',     line: '      const { data: properties, error } = await supabase' },
  { file: 'vercel.json',                       idx: 13,  token: '/landing/:slug',               line: '    { "source": "/landing/:slug", "destination": "/landing/:slug.html" },' },
  { file: 'src/lib/structuredData.js',         idx: 17,  token: '"url":',                       line: '    "url": `https://luxurypropertiesltd.com.ng/properties/${property.slug}`,' },
  { file: 'src/lib/structuredData.js',         idx: 193, token: '"availability"',               line: '          "availability": "https://schema.org/InStock",' },
  { file: 'api/ssr-property.js',              idx: 37,  token: 'Public property URLs',         line: '    // Public property URLs are now slug-based. `id` may still be a legacy' },
  { file: 'src/pages/PropertyDetailsPage.jsx', idx: 31,  token: 'Legacy UUID redirect',         line: '        // Legacy UUID redirect (edge func /api/propertyRedirect.js on prod;' },
  { file: 'src/pages/PropertyDetailsPage.jsx', idx: 63,  token: '.neq(',                        line: '          .neq(\'id\', record.id)' },
  { file: 'src/pages/PropertyDetailsPage.jsx', idx: 81,  token: '[slug, navigate]',             line: '  }, [slug, navigate]);' },
  { file: 'src/pages/PropertyDetailsPage.jsx', idx: 157, token: 'properties/${property.slug}',  line: '    { name: property.title, item: `https://luxurypropertiesltd.com.ng/properties/${property.slug}` },' },
  { file: 'src/pages/PropertyDetailsPage.jsx', idx: 165, token: 'rel="canonical"',              line: '        <link rel="canonical" href={`https://luxurypropertiesltd.com.ng/properties/${property.slug}`} />' },
  { file: 'src/pages/PropertyDetailsPage.jsx', idx: 171, token: 'og:url',                       line: '        <meta property="og:url" content={`https://luxurypropertiesltd.com.ng/properties/${property.slug}`} />' },
  { file: 'src/pages/AdminDashboard.jsx',      idx: 1798, token: 'const generateSlug = (title) => {', line: '  const generateSlug = (title) => {' },
];

let changed = 0;
for (const t of targets) {
  const p = root + '/' + t.file;
  let raw = readFileSync(p, 'utf8');
  const nl = raw.includes('\r\n') ? '\r\n' : '\n';
  const lines = raw.split(nl);
  const cur = lines[t.idx];
  if (cur === undefined) { log += `SKIP ${t.file} idx${t.idx} (line ${t.idx + 1}): out of range\n`; continue; }
  if (!cur.includes(t.token)) { log += `SKIP ${t.file} idx${t.idx} (line ${t.idx + 1}): token '${t.token}' NOT present on this line; current: ${JSON.stringify(cur.slice(0, 50))}\n`; continue; }
  if (cur === t.line) { log += `OK   ${t.file} line ${t.idx + 1}: already correct\n`; continue; }
  lines[t.idx] = t.line;
  writeFileSync(p, lines.join(nl), 'utf8');
  log += `FIXED ${t.file} line ${t.idx + 1}: ${JSON.stringify(cur.slice(0, 30))} -> ${JSON.stringify(t.line.slice(0, 30))}\n`;
  changed++;
}
log += `done. changed=${changed}\n`;
writeFileSync(logPath, log, 'utf8');
console.log(log);
