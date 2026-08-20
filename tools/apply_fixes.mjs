import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { resolve, join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TOOLS = __dirname;
const PUBLIC = join(__dirname, '..', 'Apps', 'web', 'public');
const SRC = join(__dirname, '..', 'Apps', 'web', 'src');
const BASE = 'https://luxurypropertiesltd.com.ng';

function loadJson(p) { return JSON.parse(readFileSync(p, 'utf8')); }

// merge all data part files
const meta = {};
for (const f of readdirSync(TOOLS).filter(n => n.startsWith('meta_fixes_part') && n.endsWith('.json'))) {
  Object.assign(meta, loadJson(join(TOOLS, f)));
}
const related = {};
for (const f of readdirSync(TOOLS).filter(n => n.startsWith('related_links_part') && n.endsWith('.json'))) {
  Object.assign(related, loadJson(join(TOOLS, f)));
}

const ROOT_DUPLICATES = {
  'buying-guides-blog.html': 'nigerian-real-estate-buying-guide',
  'Real_estate_news.html': 'real-estate-news-market-trends',
  'Investment Tips.html': 'real-estate-investment-tips-nigeria',
  'property_selling_guide_nigeria.html': 'property-selling-guide-nigeria',
  'market_trend_blog_post.html': 'market-trend-blog-post',
};

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function setMetaDescription(html, metaText) {
  // support both "<meta name=description content=" and "<meta content= name=description
  let out = html.replace(/<meta name="description" content="[^"]*"/i, `<meta name="description" content="${esc(metaText)}"`);
  if (out === html) out = html.replace(/<meta content="[^"]*" name="description"/i, `<meta content="${esc(metaText)}" name="description"`);
  return out;
}

function setCanonical(html, canonical) {
  const clean = `<link rel="canonical" href="${canonical}" />`;
  if (/rel="canonical"/i.test(html)) {
    let out = html.replace(/<link[^>]*rel="canonical"[^>]*>/i, clean);
    if (out === html) out = html.replace(/<link[^>]*href="[^"]*"[^>]*rel="canonical"[^>]*>/i, clean);
    return out;
  }
  const anchor = html.match(/<title>[^<]*<\/title>/i);
  const at = anchor ? anchor[0] : '<meta name="viewport"';
  return html.replace(at, at + '\n    ' + clean);
}

function injectRelated(html, links) {
  const block = '\n<section aria-label="Related guides" style="max-width:900px;margin:48px auto;padding:24px;text-align:center;border-top:2px solid #e2e8f0"><h2 style="font-size:22px;color:#0d233a;margin-bottom:16px">Continue Exploring</h2><p style="font-size:16px">' +
    links.map(([url, text]) => `<a href="${url}" style="color:#0d233a;font-weight:600;text-decoration:underline;margin:0 8px">${text}</a>`).join(' &nbsp;•&nbsp; ') +
    '</p></section>\n';
  if (html.includes('</main>')) return html.replace('</main>', block + '</main>');
  return html.replace('</body>', block + '</body>');
}

const changed = [];

function processFile(absPath, slug, canonicalPath) {
  if (!existsSync(absPath)) return false;
  let html = readFileSync(absPath, 'utf8');
  const canonical = `${BASE}${canonicalPath}`;
  if (/rel="canonical"/i.test(html) && html.includes(`href="${canonical}"`)) {
    // canonical OK; still force-format then compare
  }
  html = setCanonical(html, canonical);
  if (meta[slug]) html = setMetaDescription(html, meta[slug]);
  if (related[slug] && !html.includes('Continue Exploring')) html = injectRelated(html, related[slug]);
  writeFileSync(absPath, html);
  changed.push(`  ${slug}\t${canonical}\tmeta=${meta[slug] ? meta[slug].length : '-'}\tlinks=${related[slug] ? related[slug].length : 0}`);
  return true;
}

// 1) blog static files
for (const f of readdirSync(join(PUBLIC, 'blog')).filter(n => n.endsWith('.html'))) {
  const slug = basename(f, '.html');
  processFile(join(PUBLIC, 'blog', f), slug, `/blog/${slug}`);
}
// 2) comparison + listicle
processFile(join(PUBLIC, 'blog', 'comparison', 'index.html'), 'comparison', '/blog/comparison');
processFile(join(PUBLIC, 'blog', 'listicle', 'index.html'), 'listicle', '/blog/listicle');
// 3) landing pages
for (const f of readdirSync(join(PUBLIC, 'landing')).filter(n => n.endsWith('.html'))) {
  const slug = basename(f, '.html');
  processFile(join(PUBLIC, 'landing', f), slug, `/landing/${slug}`);
}
// 4) root-level duplicate blog copies
for (const [file, slug] of Object.entries(ROOT_DUPLICATES)) {
  processFile(join(PUBLIC, file), slug, `/blog/${slug}`);
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// 5) sync React data (blogPosts.js index + per-post files)
function syncDataFiles(slug) {
  if (!meta[slug]) return;
  const idxPath = join(SRC, 'data', 'blogPosts.js');
  if (existsSync(idxPath)) {
    const c = readFileSync(idxPath, 'utf8');
    const start = c.indexOf(`slug: "${slug}"`);
    if (start > -1) {
      const entryEnd = c.indexOf('\n  },', start);
      const bound = entryEnd > -1 ? entryEnd : start + 2000;
      const seg = c.slice(start, bound);
      const m = seg.match(/metaDescription:\s*"[^"]*"/);
      if (m) {
        const out = c.replace(m[0], `metaDescription: "${esc(meta[slug])}"`);
        writeFileSync(idxPath, out);
        changed.push(`  [data:index] ${slug}`);
      }
    }
  }
  const postPath = join(SRC, 'data', 'posts', `${slug}.js`);
  if (existsSync(postPath)) {
    const c = readFileSync(postPath, 'utf8');
    const m = c.match(/metaDescription:\s*"[^"]*"/);
    if (m) {
      const out = c.replace(m[0], `metaDescription: "${esc(meta[slug])}"`);
      writeFileSync(postPath, out);
      changed.push(`  [data:post] ${slug}`);
    }
  }
}

Object.keys(meta).forEach(syncDataFiles);

console.log('=== SEO fixes applied ===');
console.log(changed.join('\n'));
console.log(`Total files/records changed: ${changed.length}`);