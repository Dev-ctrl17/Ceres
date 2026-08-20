import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC = join(__dirname, '..', 'Apps', 'web', 'public');
const BASE = 'https://luxurypropertiesltd.com.ng';

// Build map: canonical URL -> target path (so we can attribute inbound links)
// We use EXISTS files: blog/*.html, blog/{comparison,listicle}/index.html, landing/*.html, public/*.html root
const targets = {};
function addTarget(canonicalPath, fileRel) { targets[canonicalPath.replace(BASE, '')] = fileRel; }

for (const f of readdirSync(join(PUBLIC, 'blog')).filter(n => n.endsWith('.html'))) {
  const slug = basename(f, '.html');
  addTarget(`/blog/${slug}`, join('blog', f));
}
addTarget('/blog/comparison', join('blog', 'comparison', 'index.html'));
addTarget('/blog/listicle', join('blog', 'listicle', 'index.html'));
for (const f of readdirSync(join(PUBLIC, 'landing')).filter(n => n.endsWith('.html'))) {
  const slug = basename(f, '.html');
  addTarget(`/landing/${slug}`, join('landing', f));
}

// canonical URL for each file
function canonicalOf(absPath) {
  const html = readFileSync(absPath, 'utf8');
  let m = html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/i);
  if (!m) m = html.match(/<link[^>]*href="([^"]+)"[^>]*rel="canonical"/i);
  return m ? m[1].replace(BASE, '') : null;
}

// gather internal links of every crawled container page
const containers = [];
const htmlFiles = [];
function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'amp') continue; // legacy AMP variants, not part of site graph
    const p = join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    else if (entry.name.endsWith('.html')) htmlFiles.push(p);
  }
}
walk(PUBLIC);
// ignore verification file
const pages = htmlFiles.filter(p => !p.includes('googlec5d3e468141d2edd'));

const incoming = new Map(); // url path -> Set of source links
for (const p of pages) {
  const html = readFileSync(p, 'utf8');
  const srcSelf = '/' + p.replace(PUBLIC + '\\', '').replace(/\\/g, '/').replace(/index\.html$/, '').replace(/\.html$/, '');
  const urls = [...html.matchAll(/href="([^"]+)"/g)].map(x => x[1]);
  for (const u of urls) {
    let path = u;
    if (u.startsWith(BASE)) path = u.slice(BASE.length);
    if (!path.startsWith('/')) continue;
    path = path.split(/[?#]/)[0];
    if (path.endsWith('/') && path.length > 1) path = path.slice(0, -1);
    if (!incoming.has(path)) incoming.set(path, new Set());
    incoming.get(path).add(srcSelf);
  }
}

const rows = [];
// iterate targets
for (const [canonPath, fileRel] of Object.entries(targets)) {
  const refs = incoming.get(canonPath);
  rows.push(`${canonPath}\t${refs ? refs.size : 0}`);
}

writeFileSync(join(__dirname, '..', 'tools', 'incoming_links.tsv'), rows.join('\n'), 'utf8');
console.log('wrote', rows.length, 'rows');