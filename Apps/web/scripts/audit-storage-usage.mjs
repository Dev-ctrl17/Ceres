import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const appDir = resolve(__dirname, '..');
const buckets = [
  'ongoing-project-videos',
  'page-backgrounds',
  'ongoing-project-images',
  'site-assets',
  'brochures',
  'proposal-files',
  'team-photos',
  'agent-photos',
  'property-videos',
  'property-images',
];
const pageSize = 1000;

function loadEnvFile() {
  const envPath = resolve(appDir, '.env');
  let content;
  try {
    content = readFileSync(envPath, 'utf8');
  } catch {
    return;
  }

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const entry = trimmed.startsWith('export ') ? trimmed.slice(7).trim() : trimmed;
    const separator = entry.indexOf('=');
    if (separator < 1) continue;
    const name = entry.slice(0, separator).trim();
    let value = entry.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[name]) process.env[name] = value;
  }
}

function formatBytes(bytes) {
  const megabytes = bytes / (1024 * 1024);
  return `${megabytes.toFixed(2)} MB (${bytes.toLocaleString()} bytes)`;
}

async function listFolder(client, bucket, folderPath, files, visitedFolders) {
  if (visitedFolders.has(folderPath)) return;
  visitedFolders.add(folderPath);

  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await client.storage.from(bucket).list(folderPath, {
      limit: pageSize,
      offset,
      sortBy: { column: 'name', order: 'asc' },
    });
    if (error) throw new Error(`Storage list failed for ${bucket}/${folderPath || ''} (${error.statusCode || error.name || 'unknown error'}).`);

    const entries = data || [];
    for (const entry of entries) {
      const path = folderPath ? `${folderPath}/${entry.name}` : entry.name;
      if (entry.id === null || entry.metadata === null) {
        await listFolder(client, bucket, path, files, visitedFolders);
        continue;
      }

      const size = Number(entry.metadata?.size);
      files.push({
        bucket,
        path,
        size: Number.isFinite(size) ? size : 0,
        mimeType: entry.metadata?.mimetype || entry.metadata?.contentType || 'unknown',
      });
    }

    if (entries.length < pageSize) break;
  }
}

loadEnvFile();
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Set SUPABASE_URL (or VITE_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY in the environment or Apps/web/.env.');
}

const client = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const bucketTotals = [];
const allFiles = [];
const bucketErrors = [];

for (const bucket of buckets) {
  const files = [];
  try {
    await listFolder(client, bucket, '', files, new Set());
    const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
    bucketTotals.push({ bucket, fileCount: files.length, totalBytes });
    allFiles.push(...files);
  } catch (error) {
    bucketErrors.push({ bucket, error: error.message });
    bucketTotals.push({ bucket, fileCount: files.length, totalBytes: files.reduce((sum, file) => sum + file.size, 0) });
  }
}

console.log('READ-ONLY SUPABASE STORAGE AUDIT');
console.log('No storage objects were modified.');
console.log('\nTOTAL SIZE PER BUCKET');
for (const result of bucketTotals) {
  console.log(`${result.bucket}\t${result.fileCount} files\t${formatBytes(result.totalBytes)}`);
}
console.log(`ALL BUCKETS\t${allFiles.length} files\t${formatBytes(allFiles.reduce((sum, file) => sum + file.size, 0))}`);
console.log('\n30 LARGEST FILES OVERALL');
for (const file of allFiles.sort((left, right) => right.size - left.size).slice(0, 30)) {
  console.log(`${file.bucket}\t${file.path}\t${formatBytes(file.size)}\t${file.mimeType}`);
}
if (bucketErrors.length) {
  console.log('\nBUCKET ERRORS');
  for (const error of bucketErrors) console.log(`${error.bucket}\t${error.error}`);
  process.exitCode = 1;
}
