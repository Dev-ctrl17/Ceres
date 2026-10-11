import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { resolveMediaUrl } from '../src/lib/mediaUrls.js';

const APP_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const applyChanges = process.argv.includes('--apply');

function loadEnv() {
  const envPath = resolve(APP_DIR, '.env');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const entry = line.trim();
    if (!entry || entry.startsWith('#')) continue;
    const separator = entry.indexOf('=');
    if (separator < 1) continue;
    const key = entry.slice(0, separator).trim();
    const value = entry.slice(separator + 1).trim().replace(/^['"]|['"]$/g, '');
    if (!process.env[key]) process.env[key] = value;
  }
}

function getFilename(value) {
  try {
    return decodeURIComponent(new URL(value, 'https://local.invalid').pathname.split('/').pop() || '');
  } catch {
    return String(value).split('/').pop() || '';
  }
}

function isBadReference(value) {
  if (typeof value !== 'string' || !value.trim()) return false;
  const filename = getFilename(value);
  if (/property-image-placeholder\.svg$/i.test(filename)) return true;
  const isLegacyStorage = /images\.luxurypropertiesltd\.com\.ng|supabase\.co/i.test(value);
  return isLegacyStorage && /[^a-z0-9._-]/i.test(filename);
}

function isPlaceholder(value) {
  return typeof value === 'string' && /property-image-placeholder\.svg(?:$|[?#])/i.test(value);
}

function repairReference(value) {
  if (isPlaceholder(value)) return null;
  return resolveMediaUrl(value, 'property-images');
}

function parseImages(value) {
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string') return null;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

async function main() {
  loadEnv();
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = applyChanges
    ? process.env.SUPABASE_SERVICE_ROLE_KEY
    : process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error(`Missing ${applyChanges ? 'Supabase URL or service-role key' : 'public Supabase credentials'}.`);
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: properties, count, error } = await supabase
    .from('properties')
    .select('id,slug,title,image_url,images', { count: 'exact' })
    .range(0, 999);
  if (error) throw new Error(`Unable to inspect property images: ${error.message}`);
  if ((count || 0) > (properties || []).length) {
    throw new Error('The report limit was exceeded; increase the requested range before applying repairs.');
  }

  const report = [];
  for (const property of properties || []) {
    const patch = {};
    const references = [];
    if (isBadReference(property.image_url)) {
      const replacement = repairReference(property.image_url);
      references.push({ field: 'image_url', filename: getFilename(property.image_url), mapped: Boolean(replacement) });
      if (replacement || isPlaceholder(property.image_url)) patch.image_url = replacement;
    }

    const images = parseImages(property.images);
    if (images) {
      const repairedImages = [];
      let changed = false;
      for (const image of images) {
        if (!isBadReference(image)) {
          repairedImages.push(image);
          continue;
        }
        const replacement = repairReference(image);
        references.push({ field: 'images', filename: getFilename(image), mapped: Boolean(replacement) });
        if (replacement) {
          repairedImages.push(replacement);
          changed = true;
        } else if (isPlaceholder(image)) {
          changed = true;
        } else {
          repairedImages.push(image);
        }
      }
      if (changed) patch.images = repairedImages;
    }

    if (!references.length) continue;
    report.push({
      id: property.id,
      slug: property.slug,
      title: property.title,
      references,
      updated: Object.keys(patch).length > 0,
    });
    if (applyChanges && Object.keys(patch).length) {
      const { error: updateError } = await supabase
        .from('properties')
        .update(patch)
        .eq('id', property.id);
      if (updateError) throw new Error(`Unable to repair property ${property.id}: ${updateError.message}`);
    }
  }

  console.log(JSON.stringify({
    mode: applyChanges ? 'apply' : 'dry-run',
    recordsScanned: properties?.length || 0,
    recordsWithBadReferences: report.length,
    recordsUpdated: report.filter(({ updated }) => updated).length,
    records: report,
  }, null, 2));
}

main().catch((error) => {
  console.error(`[repair-property-image-urls] ${error.message}`);
  process.exitCode = 1;
});
