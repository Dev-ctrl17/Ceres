import { existsSync, readFileSync } from 'fs';
import { resolve, dirname, extname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const appDir = resolve(__dirname, '..');
const distDir = resolve(appDir, 'dist');
const sitemapPath = resolve(distDir, 'sitemap.xml');
const robotsPath = resolve(distDir, 'robots.txt');
const vercelPath = resolve(appDir, 'vercel.json');
const failures = [];
const titles = new Map();
const descriptions = new Map();

function getAttribute(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'));
  return match?.[1] ?? match?.[2] ?? match?.[3] ?? '';
}

function resolveOutputPath(pathname, rewrites) {
  const normalizedPath = decodeURIComponent(pathname).replace(/\\/g, '/');
  const rewrite = rewrites.find((item) => item.source === normalizedPath && !item.source.includes(':'));
  const rewrittenPath = rewrite?.destination?.split('?')[0] || normalizedPath;
  const relativePath = rewrittenPath.replace(/^\/+/, '');
  const candidates = [
    resolve(distDir, relativePath, 'index.html'),
    resolve(distDir, `${relativePath}.html`),
    resolve(distDir, relativePath),
  ];
  return candidates.find((candidate) => existsSync(candidate) && extname(candidate) !== '.xml');
}

if (!existsSync(sitemapPath)) throw new Error(`Missing built sitemap: ${sitemapPath}`);
if (!existsSync(robotsPath)) throw new Error(`Missing built robots.txt: ${robotsPath}`);

const xml = readFileSync(sitemapPath, 'utf8');
const robots = readFileSync(robotsPath, 'utf8');
const vercel = JSON.parse(readFileSync(vercelPath, 'utf8'));
const urls = [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)].map((match) =>
  match[1].replaceAll('&amp;', '&').trim()
);
const urlEntries = [...xml.matchAll(/<url\b[^>]*>([\s\S]*?)<\/url>/gi)];

if (!/^\s*Sitemap:\s*https:\/\/www\.luxurypropertiesltd\.com\.ng\/sitemap\.xml\s*$/im.test(robots)) {
  failures.push('robots.txt must reference https://www.luxurypropertiesltd.com.ng/sitemap.xml');
}
if (urls.length === 0) failures.push('sitemap.xml contains no URLs');
if (new Set(urls).size !== urls.length) failures.push('sitemap.xml contains duplicate URLs');
for (const [, entry] of urlEntries) {
  const loc = entry.match(/<loc>\s*([^<]+?)\s*<\/loc>/i)?.[1]?.replaceAll('&amp;', '&').trim();
  const lastmod = entry.match(/<lastmod>\s*([^<]+?)\s*<\/lastmod>/i)?.[1]?.trim();
  if (lastmod && (!/^\d{4}-\d{2}-\d{2}$/.test(lastmod) || Number.isNaN(Date.parse(lastmod)))) {
    failures.push(`Sitemap URL has an invalid <lastmod>: ${loc || '(missing loc)'}`);
  }
}

for (const sitemapUrl of urls) {
  let parsed;
  try {
    parsed = new URL(sitemapUrl);
  } catch {
    failures.push(`Invalid sitemap URL: ${sitemapUrl}`);
    continue;
  }

  if (parsed.protocol !== 'https:' || parsed.host !== 'www.luxurypropertiesltd.com.ng') {
    failures.push(`Non-canonical sitemap host or protocol: ${sitemapUrl}`);
  }
  if (parsed.search || parsed.hash) failures.push(`Query string or fragment in sitemap URL: ${sitemapUrl}`);

  const redirect = (vercel.redirects || []).find((item) => item.source === parsed.pathname);
  if (redirect) failures.push(`Sitemap URL matches a configured redirect: ${sitemapUrl} -> ${redirect.destination}`);

  const outputPath = resolveOutputPath(parsed.pathname, vercel.rewrites || []);
  if (!outputPath) {
    failures.push(`No built HTML response (expected 200) for sitemap URL: ${sitemapUrl}`);
    continue;
  }

  const html = readFileSync(outputPath, 'utf8');
  const titleMatches = [...html.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title>/gi)];
  const title = titleMatches[0]?.[1]?.replace(/<[^>]+>/g, '').trim() || '';
  const descriptionTags = [...html.matchAll(/<meta\b[^>]*>/gi)]
    .map(([tag]) => tag)
    .filter((tag) => /\bname=["']description["']/i.test(tag));
  const description = descriptionTags[0]?.match(/\bcontent\s*=\s*(?:"([^"]*)"|'([^']*)')/i);
  const descriptionValue = description?.[1] ?? description?.[2] ?? '';
  const h1Count = [...html.matchAll(/<h1\b[^>]*>/gi)].length;
  if (h1Count !== 1) failures.push(`Sitemap page must have exactly one H1 (${h1Count} found): ${sitemapUrl}`);
  if (titleMatches.length !== 1 || !title) failures.push(`Sitemap page must have exactly one non-empty title: ${sitemapUrl}`);
  if (descriptionTags.length !== 1 || descriptionValue.length < 70 || descriptionValue.length > 160) {
    failures.push(`Sitemap page must have exactly one meta description of 70-160 characters: ${sitemapUrl}`);
  }
  if (title) {
    if (titles.has(title)) failures.push(`Duplicate title on ${sitemapUrl} and ${titles.get(title)}`);
    else titles.set(title, sitemapUrl);
  }
  if (descriptionValue) {
    if (descriptions.has(descriptionValue)) failures.push(`Duplicate description on ${sitemapUrl} and ${descriptions.get(descriptionValue)}`);
    else descriptions.set(descriptionValue, sitemapUrl);
  }
  const canonicalTag = html.match(/<link\b[^>]*\brel\s*=\s*["']canonical["'][^>]*>/i)?.[0];
  const canonicalCount = [...html.matchAll(/<link\b[^>]*\brel\s*=\s*["']canonical["'][^>]*>/gi)].length;
  const canonical = canonicalTag ? getAttribute(canonicalTag, 'href') : '';
  if (canonicalCount !== 1) failures.push(`Sitemap page must have exactly one canonical (${canonicalCount} found): ${sitemapUrl}`);
  if (!canonical) failures.push(`Missing canonical in ${outputPath} for ${sitemapUrl}`);
  else if (canonical !== sitemapUrl) failures.push(`Non-self canonical in ${outputPath}: ${sitemapUrl} -> ${canonical}`);

  const robotsTag = html.match(/<meta\b(?=[^>]*\bname\s*=\s*["']robots["'])[^>]*>/i)?.[0];
  const robotsContent = robotsTag ? getAttribute(robotsTag, 'content') : '';
  if (/\bnoindex\b/i.test(robotsContent)) failures.push(`Noindex page is listed in sitemap: ${sitemapUrl}`);
}

if (failures.length) {
  console.error(`[validate-sitemap] ${failures.length} issue(s):\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

console.log(`[validate-sitemap] Passed: ${urls.length} sitemap URLs have built, indexable, self-canonical HTML output.`);
