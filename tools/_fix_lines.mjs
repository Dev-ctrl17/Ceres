// Deterministic line-index indent normalizer for the slug-migration edits.
// (Avoids the token-only-replace double-indent regression.)
// Run: node tools/_fix_lines.mjs
import { readFileSync, writeFileSync } from 'fs';

const root = 'C:/Users/BELLO IREBAMI/Desktop/Javascript/Apps/web';
const logPath = 'C:/Users/BELLO IREBAMI/Desktop/Javascript/tools/_fix_lines.log';
let log = '';

const targets = [
  { file: 'src/App.jsx', idx: 61,  token: '/properties/:slug',        indent: 6,  line: '      <Route path="/properties/:slug" element={<PropertyDetailsPage />} />' },
  { file: 'src/components/PropertyCard.jsx', idx: 46, token: '/properties/${property.slug', indent: 4, line: '    <Link to={`/properties/${property.slug`}>`' },
  { file: 'src/pages/InvestmentBriefPage.jsx', idx: 315, token: '/properties/${property.slug', indent: 18, line: '                  <Link to={`/properties/${property.slug`}>`' },
  { file: 'scripts/getRoutes.js', idx: 49, token: 'const { data: properties', indent: 6, line: '      const { data: properties, error } = await supabase' },
  { file: 'vercel.json', idx: 13, token: '/landing/:slug', indent: 4, line: '    { "source": "/landing/:slug", "destination": "/landing/:slug.html" },' },
  { file: 'src/lib/structuredData.js', idx: 17, token: '"url":', indent: 4, line: '    "url": `https://luxurypropertiesltd.com.ng/properties/${property.slug}`,' },
  { file: 'src/lib/structuredData.js', idx: 193, token: '"availability"', indent: 10, line: '          "availability": "https://schema.org/InStock",' },
  { file: 'api/ssr-property.js', idx: 37, token: 'Public property URLs', indent: 4, line: '    // Public property URLs are now slug-based. `id` may still be a legacy' },
];

let changed = 0;
for (const t of targets) {
  const p = root + '/' + t.file;
  let raw = readFileSync(p, 'utf8');
  const nl = raw.includes('\r\n') ? '\r\n' : '\n';
  const lines = raw.split(nl);
  const cur = lines[t.idx];
  if (cur === undefined) { log += `SKIP ${t.file} idx${t.idx} (line ${t.idx + 1}): out of range\n`; continue; }
  if (!cur.includes(t.token)) { log += `SKIP ${t.file} idx${t.idx} (line ${t.idx + 1}): token '${t.token}' not in ${JSON.stringify(cur)}\n`; continue; }
  const rebuilt = ' '.repeat(t.indent) + t.line.trimStart();
  lines[t.idx] = rebuilt;
  writeFileSync(p, lines.join(nl), 'utf8');
  log += `FIXED ${t.file} line ${t.idx + 1}: ${JSON.stringify(cur.slice(0, 30))} -> ${t.indent}sp\n`;
  changed++;
}
log += `done. changed=${changed}\n`;
writeFileSync(logPath, log, 'utf8');
console.log(log);
