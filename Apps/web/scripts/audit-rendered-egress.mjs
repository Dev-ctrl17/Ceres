import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const APP_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BASE_URL = (process.argv[2] || 'http://127.0.0.1:4173').replace(/\/$/, '');
const CONCURRENCY = 4;

function assertNoLegacyStorageUrls(text, source, failures) {
  if (/supabase\.co.{0,120}\/storage\/v1\//i.test(text)) {
    failures.push(`${source}: contains a legacy Supabase Storage URL`);
  }
  if (/images\.luxurypropertiesltd\.com\.ng/i.test(text)) {
    failures.push(`${source}: contains the retired branded image hostname`);
  }
}

function getAttribute(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'));
  return match ? (match[1] ?? match[2] ?? match[3] ?? '') : null;
}

function mediaUrlsFromHtml(html, source, failures) {
  const urls = new Set();
  const mediaTags = html.match(/<(?:img|video|source)\b[^>]*>/gi) || [];
  for (const tag of mediaTags) {
    const tagName = tag.match(/^<(\w+)/)?.[1]?.toLowerCase();
    for (const attribute of ['src', 'poster']) {
      const value = getAttribute(tag, attribute);
      if (value === null) continue;
      if (!value.trim()) {
        failures.push(`${source}: ${tagName} has an empty ${attribute}`);
      } else if (!value.startsWith('data:') && !value.startsWith('blob:')) {
        urls.add(value);
      }
    }
    const srcset = getAttribute(tag, 'srcset');
    if (srcset) {
      for (const [, url] of srcset.matchAll(
        /(?:^|,\s*)((?:https?:\/\/|\/|\.\.?\/)\S+?)\s+\d+w(?=,|$)/g,
      )) {
        if (!url.startsWith('data:')) urls.add(url);
      }
    }
  }
  const inlineCss = [...html.matchAll(/url\(\s*(['"]?)(.*?)\1\s*\)/gi)];
  for (const [, , value] of inlineCss) {
    if (value && !value.startsWith('data:')) urls.add(value);
  }
  const imagePreloads = html.match(/<link\b[^>]*\bas=["']image["'][^>]*>/gi) || [];
  for (const tag of imagePreloads) {
    const value = getAttribute(tag, 'href');
    if (value) urls.add(value);
  }
  return urls;
}

async function forEachLimit(items, limit, callback) {
  let index = 0;
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (index < items.length) {
      const item = items[index++];
      await callback(item);
    }
  }));
}

async function main() {
  const sitemapPath = resolve(APP_DIR, 'public', 'sitemap.xml');
  const sitemap = readFileSync(sitemapPath, 'utf8');
  const failures = [];
  const pagePaths = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)]
    .map(([, loc]) => new URL(loc, BASE_URL).pathname)
    .filter((path, index, all) => all.indexOf(path) === index);
  if (!pagePaths.length) throw new Error('The generated sitemap contains no crawlable page URLs.');
  assertNoLegacyStorageUrls(sitemap, sitemapPath, failures);

  const media = new Set();
  const stylesheets = new Set();
  let checkedPages = 0;

  await forEachLimit(pagePaths, CONCURRENCY, async (path) => {
    const response = await fetch(`${BASE_URL}${path}`, { signal: AbortSignal.timeout(15000) });
    if (!response.ok) {
      failures.push(`${path}: page returned HTTP ${response.status}`);
      return;
    }
    const html = await response.text();
    checkedPages++;
    assertNoLegacyStorageUrls(html, path, failures);
    for (const url of mediaUrlsFromHtml(html, path, failures)) media.add(new URL(url, BASE_URL).href);
    for (const tag of html.match(/<link\b[^>]*\brel=["']stylesheet["'][^>]*>/gi) || []) {
      const href = getAttribute(tag, 'href');
      if (href) stylesheets.add(new URL(href, BASE_URL).href);
    }
  });

  await forEachLimit([...stylesheets], CONCURRENCY, async (url) => {
    const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!response.ok) {
      failures.push(`${url}: stylesheet returned HTTP ${response.status}`);
      return;
    }
    const css = await response.text();
    assertNoLegacyStorageUrls(css, url, failures);
    for (const match of css.matchAll(/url\(\s*(['"]?)(.*?)\1\s*\)/gi)) {
      const asset = match[2];
      if (asset && !asset.startsWith('data:')) media.add(new URL(asset, url).href);
    }
  });

  await forEachLimit([...media], CONCURRENCY, async (url) => {
    try {
      let response;
      try {
        response = await fetch(url, {
          method: 'HEAD',
          redirect: 'follow',
          signal: AbortSignal.timeout(5000),
        });
      } catch {
        response = null;
      }
      if (!response?.ok && (!response || [405, 501].includes(response.status))) {
        response = await fetch(url, {
          headers: { Range: 'bytes=0-0' },
          redirect: 'follow',
          signal: AbortSignal.timeout(15000),
        });
        await response.body?.cancel();
      }
      if (!response.ok) failures.push(`${url}: media returned HTTP ${response.status}`);
    } catch (error) {
      failures.push(`${url}: media request failed (${error.message})`);
    }
  });

  console.log(JSON.stringify({
    baseUrl: BASE_URL,
    sitemapPages: pagePaths.length,
    pagesReturned200: checkedPages,
    stylesheetsChecked: stylesheets.size,
    uniqueMediaUrlsChecked: media.size,
    failures: failures.length,
    failureDetails: failures.slice(0, 50),
  }, null, 2));
  if (failures.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error(`Rendered egress audit failed: ${error.message}`);
  process.exitCode = 1;
});
