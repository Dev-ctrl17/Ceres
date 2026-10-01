import { existsSync, readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { normalizeSupabaseStoragePath } from '../src/lib/supabaseStoragePath.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const appDir = resolve(__dirname, '..');

function loadEnv() {
  const envPath = resolve(appDir, '.env');
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const separator = trimmed.indexOf('=');
    if (separator > 0) {
      const key = trimmed.slice(0, separator).trim();
      if (!process.env[key]) process.env[key] = trimmed.slice(separator + 1).trim();
    }
  }
}

function resolveRawUrl(client, bucket, reference) {
  if (/^https?:\/\//i.test(reference)) return reference;
  const path = normalizeSupabaseStoragePath(reference);
  return client.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

function resolveTransformUrl(client, bucket, reference) {
  const path = normalizeSupabaseStoragePath(reference);
  return client.storage.from(bucket).getPublicUrl(path, {
    transform: { width: 400, quality: 75, format: 'webp' },
  }).data.publicUrl;
}

async function checkUrl(url) {
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const response = await fetch(url, { method: 'HEAD', redirect: 'manual', signal: AbortSignal.timeout(15000) });
      if (response.status === 429 && attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
        continue;
      }
      return { status: response.status, contentType: response.headers.get('content-type') || '' };
    } catch (error) {
      if (attempt === 3) return { status: 'ERROR', contentType: error.name };
      await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
    }
  }
}

async function mapWithConcurrency(items, concurrency, callback) {
  const results = new Array(items.length);
  let nextIndex = 0;
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (nextIndex < items.length) {
      const index = nextIndex++;
      results[index] = await callback(items[index]);
    }
  }));
  return results;
}

loadEnv();
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
if (!supabaseUrl || !anonKey) {
  throw new Error('Set SUPABASE_URL and SUPABASE_ANON_KEY (or their VITE_ variants) before running this checker.');
}

const client = createClient(supabaseUrl, anonKey);
const { data: properties, error } = await client
  .from('properties')
  .select('title,slug,image_url,images');
if (error) throw new Error(`Could not read properties: ${error.message}`);

const rawReferences = new Map();
const cardReferences = [];
for (const property of properties || []) {
  const images = [...(property.image_url ? [property.image_url] : []), ...(Array.isArray(property.images) ? property.images : [])]
    .filter((image) => typeof image === 'string' && image.trim());
  if (images.length === 0) {
    cardReferences.push({ property, reference: null });
    continue;
  }
  for (const reference of images) {
    const url = resolveRawUrl(client, 'property-images', reference);
    if (!rawReferences.has(url)) rawReferences.set(url, new Set());
    rawReferences.get(url).add(`${property.title} [${property.slug || 'no-slug'}]`);
  }
  cardReferences.push({ property, reference: images[0] });
}

const rawResults = await mapWithConcurrency([...rawReferences], 4, async ([url, listings]) => ({
  url,
  listings: [...listings],
  host: new URL(url).host === new URL(supabaseUrl).host ? 'Supabase Storage' : new URL(url).host,
  ...(await checkUrl(url)),
}));
const cardResults = await mapWithConcurrency(cardReferences, 4, async ({ property, reference }) => {
  if (!reference) return { title: property.title, slug: property.slug, status: 'MISSING', url: '' };
  const url = resolveTransformUrl(client, 'property-images', reference);
  return { title: property.title, slug: property.slug, url, ...(await checkUrl(url)) };
});

const rawFailures = rawResults.filter((result) => result.status !== 200);
const cardFailures = cardResults.filter((result) => result.status !== 200);
console.log(`[property-images] ${properties?.length || 0} properties; ${rawResults.length} unique raw image URLs; ${rawFailures.length} raw failures; ${cardFailures.length} card transform failures/missing.`);
if (process.argv.includes('--report')) {
  const reportPath = resolve(appDir, 'property-image-audit.json');
  writeFileSync(reportPath, `${JSON.stringify({
    checkedAt: new Date().toISOString(),
    propertyCount: properties?.length || 0,
    rawUrlCount: rawResults.length,
    rawFailures: rawFailures.length,
    cardFailures: cardFailures.length,
    rawResults,
    cardResults,
  }, null, 2)}\n`, 'utf8');
  console.log(`[property-images] Full URL-level report: ${reportPath}`);
}
for (const result of rawFailures) {
  console.log(`[raw] ${result.status} ${result.contentType} ${result.host} ${result.url} :: ${result.listings.join('; ')}`);
}
for (const result of cardFailures) {
  console.log(`[card] ${result.status} ${result.contentType || ''} ${result.url} :: ${result.title} [${result.slug || 'no-slug'}]`);
}
if (cardFailures.length) process.exitCode = 1;
