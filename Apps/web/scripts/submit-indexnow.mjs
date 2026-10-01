import { existsSync, readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const appDir = resolve(__dirname, '..');
const distDir = resolve(appDir, 'dist');
const sitemapPath = resolve(distDir, 'sitemap.xml');
const key = process.env.INDEXNOW_KEY;
const siteOrigin = 'https://www.luxurypropertiesltd.com.ng';
const endpoint = 'https://api.indexnow.org/indexnow';

if (!key) throw new Error('Set INDEXNOW_KEY to the key matching the public root key file.');
if (!existsSync(sitemapPath)) throw new Error(`Missing built sitemap: ${sitemapPath}`);
const keyFile = resolve(appDir, 'public', `${key}.txt`);
if (!existsSync(keyFile) || readFileSync(keyFile, 'utf8').trim() !== key) {
  throw new Error(`Missing or invalid IndexNow key file: public/${key}.txt`);
}

const xml = readFileSync(sitemapPath, 'utf8');
const sitemapUrls = [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)].map((match) =>
  match[1].replaceAll('&amp;', '&').trim()
);
const canonicalSet = new Set(sitemapUrls);
const requestedUrls = (process.env.INDEXNOW_URLS || '').split(/[\r\n,]+/).map((url) => url.trim()).filter(Boolean);
const candidateUrls = requestedUrls.length ? requestedUrls : sitemapUrls;
const urls = [...new Set(candidateUrls)].filter((value) => {
  try {
    const url = new URL(value);
    return url.origin === siteOrigin && !url.search && !url.hash && canonicalSet.has(url.href);
  } catch {
    return false;
  }
});

if (urls.length === 0) {
  console.log('[indexnow] No canonical sitemap URLs to submit.');
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
