import { readFileSync, readdirSync, statSync } from 'fs';
import { resolve, dirname, relative } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const appDir = resolve(__dirname, '..');
const distDir = resolve(appDir, 'dist');
const siteOrigin = 'https://www.luxurypropertiesltd.com.ng';
const sitemapPath = resolve(distDir, 'sitemap.xml');
const vercel = JSON.parse(readFileSync(resolve(appDir, 'vercel.json'), 'utf8'));
const sitemapXml = readFileSync(sitemapPath, 'utf8');
const sitemapUrls = [...sitemapXml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)]
  .map((match) => new URL(match[1].replaceAll('&amp;', '&').trim()));
const sitemapPaths = new Set(sitemapUrls.map((url) => url.pathname));
const incoming = new Map(sitemapUrls.map((url) => [url.pathname, 0]));
const redirectLinks = new Map();

function getHtmlFiles(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = resolve(directory, name);
    return statSync(path).isDirectory()
      ? getHtmlFiles(path)
      : path.endsWith('.html') ? [path] : [];
  });
}

function sourceUrl(file) {
  const html = readFileSync(file, 'utf8');
  const canonical = html.match(/<link\b[^>]*\brel\s*=\s*["']canonical["'][^>]*>/i)?.[0];
  const href = canonical?.match(/\bhref\s*=\s*["']([^"']+)["']/i)?.[1];
  if (href) return new URL(href);
  const outputPath = relative(distDir, file).replaceAll('\\', '/');
  const routePath = outputPath === 'index.html'
    ? '/'
    : outputPath.endsWith('/index.html')
      ? `/${outputPath.slice(0, -'/index.html'.length)}`
      : `/${outputPath.replace(/\.html$/i, '')}`;
  return new URL(routePath, siteOrigin);
}

for (const file of getHtmlFiles(distDir)) {
  const html = readFileSync(file, 'utf8');
  const pageUrl = sourceUrl(file);
  for (const match of html.matchAll(/<a\b[^>]*\bhref\s*=\s*["']([^"']+)["'][^>]*>/gi)) {
    const rawHref = match[1].replaceAll('&amp;', '&').trim();
    if (!rawHref || /^(?:mailto:|tel:|javascript:|#)/i.test(rawHref)) continue;
    let target;
    try {
      target = new URL(rawHref, pageUrl);
    } catch {
      continue;
    }
    if (target.origin !== siteOrigin) continue;
    const targetPath = decodeURIComponent(target.pathname).replace(/\/$/, '') || '/';
    const redirect = (vercel.redirects || []).find((item) => item.source === targetPath);
    if (redirect) {
      const source = `${pageUrl.pathname} -> ${targetPath}`;
      redirectLinks.set(source, redirect.destination);
    }
    if (incoming.has(targetPath)) incoming.set(targetPath, incoming.get(targetPath) + 1);
  }
}

const orphans = sitemapUrls.filter((url) => url.pathname !== '/' && incoming.get(url.pathname) === 0);
const singleIncoming = sitemapUrls.filter((url) => url.pathname !== '/' && incoming.get(url.pathname) === 1);
console.log(`[internal-links] ${sitemapUrls.length} sitemap pages; ${singleIncoming.length} have exactly one internal incoming link.`);
console.log(`[internal-links] One-incoming URLs:\n${singleIncoming.map((url) => `- ${url.pathname}`).join('\n') || '- none'}`);
console.log(`[internal-links] Orphan URLs:\n${orphans.map((url) => `- ${url.pathname}`).join('\n') || '- none'}`);
console.log(`[internal-links] Internal links to configured redirects:\n${[...redirectLinks].map(([source, destination]) => `- ${source} -> ${destination}`).join('\n') || '- none'}`);
if (redirectLinks.size) process.exitCode = 1;
