import { existsSync, readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const appDir = resolve(__dirname, '..');
const distDir = resolve(appDir, 'dist');
const sitemapPath = resolve(distDir, 'sitemap.xml');
const key = process.env.INDEXNOW_KEY;
const siteOrigin = 'https://www.luxurypropertiesltd.com.ng';
const endpoint = 'https://api.indexnow.org/indexnow';

if (!key) throw new Error('Set INDEXNOW_KEY to the key matching the public root key file.');
const keyFile = resolve(appDir, 'public', `${key}.txt`);
if (!existsSync(keyFile) || readFileSync(keyFile, 'utf8').trim() !== key) {
  throw new Error(`Missing or invalid IndexNow key file: public/${key}.txt`);
}

async function loadSitemap() {
  const sitemapUrl = process.env.INDEXNOW_SITEMAP_URL;
  if (!sitemapUrl) {
    if (!existsSync(sitemapPath)) throw new Error(`Missing built sitemap: ${sitemapPath}`);
    return readFileSync(sitemapPath, 'utf8');
  }

  const response = await fetch(sitemapUrl, { signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error(`Could not fetch deployed sitemap (${response.status}): ${sitemapUrl}`);
  return response.text();
}

function parseSitemap(xml) {
  return new Map([...xml.matchAll(/<url\b[^>]*>([\s\S]*?)<\/url>/gi)].flatMap(([, entry]) => {
    const url = entry.match(/<loc>\s*([^<]+?)\s*<\/loc>/i)?.[1]?.replaceAll('&amp;', '&').trim();
    if (!url) return [];
    const lastmod = entry.match(/<lastmod>\s*([^<]+?)\s*<\/lastmod>/i)?.[1]?.trim() || '';
    return [[url, lastmod]];
  }));
}

const currentSitemap = parseSitemap(await loadSitemap());
if (currentSitemap.size === 0) throw new Error('The sitemap contains no URLs.');
const requestedUrls = (process.env.INDEXNOW_URLS || '').split(/[\r\n,]+/).map((url) => url.trim()).filter(Boolean);
let candidateUrls = requestedUrls.length ? requestedUrls : [...currentSitemap.keys()];
if (!requestedUrls.length && process.env.INDEXNOW_PREVIOUS_REF) {
  const previousRef = process.env.INDEXNOW_PREVIOUS_REF;
  const gitRoot = resolve(appDir, '../..');
  let previousXml;
  try {
    previousXml = execFileSync('git', ['show', `${previousRef}:Apps/web/public/sitemap.xml`], {
      cwd: gitRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch (error) {
    throw new Error(`Could not load prior sitemap at ${previousRef}: ${error.message}`);
  }
  const previousSitemap = parseSitemap(previousXml);
  candidateUrls = [...currentSitemap].filter(([url, lastmod]) => (
    !previousSitemap.has(url) || previousSitemap.get(url) !== lastmod
  )).map(([url]) => url);

  let changedFiles;
  try {
    changedFiles = execFileSync('git', ['diff', '--name-only', `${previousRef}..HEAD`], {
      cwd: gitRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).split(/\r?\n/).filter(Boolean);
  } catch (error) {
    throw new Error(`Could not inspect deployed content changes from ${previousRef}: ${error.message}`);
  }
  if (changedFiles.some((path) => (
    path.startsWith('Apps/web/src/')
    || path.startsWith('Apps/web/public/blog/')
    || path.startsWith('Apps/web/public/landing/')
    || ['Apps/web/index.html', 'Apps/web/prerender.mjs', 'Apps/web/vite.config.js'].includes(path)
  ))) {
    candidateUrls = [...currentSitemap.keys()];
  }
}
const canonicalSet = new Set(currentSitemap.keys());
const urls = [...new Set(candidateUrls)].filter((value) => {
  try {
    const url = new URL(value);
    return url.origin === siteOrigin && !url.search && !url.hash && canonicalSet.has(url.href);
  } catch {
    return false;
  }
});

if (urls.length === 0) {
  console.log('[indexnow] No new or changed canonical sitemap URLs to submit.');
  process.exit(0);
}

const verifiedUrls = [];
for (let index = 0; index < urls.length; index += 10) {
  const batch = urls.slice(index, index + 10);
  const results = await Promise.all(batch.map(async (url) => {
    try {
      const response = await fetch(url, { method: 'HEAD', redirect: 'manual', signal: AbortSignal.timeout(10000) });
      if (response.status !== 200) {
        console.warn(`[indexnow] Skipping non-200 URL (${response.status}): ${url}`);
        return null;
      }
      return url;
    } catch (error) {
      console.warn(`[indexnow] Skipping URL after response check failed (${error.message}): ${url}`);
      return null;
    }
  }));
  verifiedUrls.push(...results.filter(Boolean));
}

for (let index = 0; index < verifiedUrls.length; index += 10000) {
  const urlList = verifiedUrls.slice(index, index + 10000);
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: new URL(siteOrigin).host,
      key,
      keyLocation: `${siteOrigin}/${key}.txt`,
      urlList,
    }),
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`IndexNow rejected batch (${response.status}): ${body.slice(0, 500)}`);
  }
  console.log(`[indexnow] Submitted ${urlList.length} verified URLs; response ${response.status}.`);
}
