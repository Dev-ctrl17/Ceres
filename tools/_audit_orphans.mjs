// Ad-hoc analyzer: list audited pages with ZERO internal incoming links
// (i.e. orphan pages) from the static crawl TSV.
// Run: node tools/_audit_orphans.mjs
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));

const file = resolve(__dirname, 'static_audit.tsv');
const raw = readFileSync(file, 'utf8');
const lines = raw.split(/\r?\n/).filter((l) => l.length > 0);

const header = ['filename', 'canonical_url', 'status', 'indexed', 'title_len', 'meta_len', 'h1', 'incoming'];
const orphans = [];
const nonOrphans = [];

for (const line of lines) {
  const f = line.split('\t');
  const row = Object.fromEntries(header.map((h, i) => [h, f[i] ?? '']));
  if (row.canonical_url === 'NONE' || row.filename === 'googlec5d3e468141d2edd.html') continue; // skip verification assets
  if (!row.incoming || row.incoming.trim() === '') {
    orphans.push(row);
  } else {
    nonOrphans.push(row);
  }
}

let out = '';
out += `Total audited content rows: ${orphans.length + nonOrphans.length}\n`;
out += `Non-orphan (have >=1 internal inlink): ${nonOrphans.length}\n`;
out += `Orphan (ZERO internal inlinks):       ${orphans.length}\n`;
out += '---\n';
out += 'ORPHAN PAGES:\n';
for (const o of orphans) {
  out += `  ${o.filename.padEnd(42)} ${o.canonical_url}\n`;
}
out += '---\n';
const bySection = {};
for (const o of orphans) {
  const m = o.canonical_url.match(/^https?:\/\/[^/]+(.+)/) || [];
  const p = (m[1] || '/').split('/')[1] || '/';
  bySection[`/${p}`] = (bySection[`/${p}`] || 0) + 1;
}
out += 'Orphans by top-level section:\n';
for (const [k, v] of Object.entries(bySection).sort((a, b) => b[1] - a[1])) {
  out += `  ${k}: ${v}\n`;
}

console.log(out);
writeFileSync(resolve(__dirname, '_audit_orphans.out.txt'), out, 'utf8');

