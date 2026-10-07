import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const APP_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function loadEnvFile() {
  const envPath = resolve(APP_DIR, '.env');
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const entry = trimmed.startsWith('export ') ? trimmed.slice(7).trim() : trimmed;
    const separator = entry.indexOf('=');
    if (separator < 1) continue;
    const name = entry.slice(0, separator).trim();
    let value = entry.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[name]) process.env[name] = value;
  }
}

function normalizePath(path) {
  return String(path || '').split('/').map((part) => {
    try {
      return decodeURIComponent(part);
    } catch {
      return part;
    }
  }).join('/');
}

async function main() {
  loadEnvFile();
  const { SUPABASE_URL: url, SUPABASE_SERVICE_ROLE_KEY: serviceKey } = process.env;
  if (!url || !serviceKey) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required to export media mappings.');
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const mappings = {};
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await supabase
      .from('media_migration_map')
      .select('source_bucket,source_path,new_url')
      .range(offset, offset + 999);
    if (error) {
      throw new Error(`Could not export media migration mappings (${error.code || 'query failed'}).`);
    }
    for (const row of data || []) {
      if (!row.source_bucket || !row.source_path || !row.new_url) continue;
      if (!/^https:\/\/res\.cloudinary\.com\//i.test(row.new_url)) continue;
      const key = `${row.source_bucket}/${normalizePath(row.source_path)}`;
      const current = mappings[key];
      if (current && current !== row.new_url) {
        throw new Error(`Conflicting Cloudinary mappings for ${row.source_bucket}/${row.source_path}.`);
      }
      mappings[key] = row.new_url;
    }
    if ((data || []).length < 1000) break;
  }

  const outputPath = resolve(APP_DIR, 'src', 'data', 'mediaMigrationMap.json');
  writeFileSync(outputPath, `${JSON.stringify(mappings, null, 2)}\n`);
  console.log(`Exported ${Object.keys(mappings).length} media mappings for render-time legacy URL resolution.`);
}

main().catch((error) => {
  console.error(`Media mapping export failed: ${error.message}`);
  process.exitCode = 1;
});
