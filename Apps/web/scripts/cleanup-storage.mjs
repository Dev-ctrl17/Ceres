import { createHash } from 'crypto';
import { appendFileSync, createReadStream, createWriteStream, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import { resolve, dirname, extname, join, sep } from 'path';
import { fileURLToPath } from 'url';
import { Transform, Readable } from 'stream';
import { pipeline } from 'stream/promises';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const appDir = resolve(__dirname, '..');
const reportPath = resolve(appDir, 'dedupe-report.csv');
const manifestPath = resolve(appDir, 'deletion-manifest.csv');
const deferredCandidatesPath = resolve(appDir, 'deferred-candidates.csv');
const cleanupLogPath = resolve(appDir, 'cleanup-log.csv');
const backupRoot = resolve(appDir, 'backup');
const pageSize = 1000;
const deleteBatchSize = 20;
const tier1Folders = [
  'properties/11acdd8f-78b9-4b83-96e2-54b333eb25cc/',
  'properties/8d875453-90a7-4684-ad54-ac1825f1d475/',
  'properties/ec47d3eb-93f8-4317-a2b6-49e2906f32de/',
];
const tier1FlatPrefixes = ['properties/1788651115508_', 'properties/1788651115513_', 'properties/1788651115514_'];
const excludedBuckets = new Set(['site-assets', 'team-photos', 'agent-photos']);
const videoPattern = /\.(?:mp4|mov|webm)$/i;
const pdfPattern = /\.pdf$/i;
const smallDuplicateLimitBytes = 1024 * 1024;
const referenceColumnPattern = /(url|uri|path|image|photo|video|file|media|attachment|logo|cover|thumbnail|document|brochure|gallery|asset)/i;
const allowedBuckets = new Set([
  'ongoing-project-videos', 'page-backgrounds', 'ongoing-project-images', 'site-assets',
  'brochures', 'proposal-files', 'team-photos', 'agent-photos', 'property-videos', 'property-images',
]);

function loadEnvFile() {
  const envPath = resolve(appDir, '.env');
  let contents;
  try { contents = readFileSync(envPath, 'utf8'); } catch { return; }
  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const entry = trimmed.startsWith('export ') ? trimmed.slice(7).trim() : trimmed;
    const separator = entry.indexOf('=');
    if (separator <= 0) continue;
    const name = entry.slice(0, separator).trim();
    let value = entry.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[name]) process.env[name] = value;
  }
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  for (let index = 0; index < text.length; index++) {
    const char = text[index];
    if (quoted) {
      if (char === '"' && text[index + 1] === '"') {
        cell += '"';
        index++;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ',') {
      row.push(cell);
      cell = '';
    } else if (char === '\n') {
      row.push(cell.replace(/\r$/, ''));
      if (row.some((value) => value !== '')) rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }
  if (cell || row.length) {
    row.push(cell.replace(/\r$/, ''));
    if (row.some((value) => value !== '')) rows.push(row);
  }
  if (rows.length < 2) return [];
  const headers = rows[0];
  return rows.slice(1).map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] || ''])));
}

function csv(value) {
  const text = String(value ?? '');
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function formatBytes(bytes) {
  return `${(Number(bytes) / (1024 * 1024)).toFixed(2)} MiB (${Number(bytes).toLocaleString()} bytes)`;
}

function encodeStoragePath(path) {
  return String(path).split('/').map((segment) => encodeURIComponent(segment)).join('/');
}

function inferBucket(table, column) {
  const tableName = table.toLowerCase();
  const columnName = column.toLowerCase();
  if (tableName.includes('page_background')) return 'page-backgrounds';
  if (tableName.includes('team') && /image|photo|avatar|file|path|url/.test(columnName)) return 'team-photos';
  if ((tableName.includes('agent') || tableName.includes('application')) && /image|photo|avatar|file|path|url/.test(columnName)) return 'agent-photos';
  if (tableName.includes('ongoing_project') && /video/.test(columnName)) return 'ongoing-project-videos';
  if (tableName.includes('ongoing_project') && /image|photo|gallery|media/.test(columnName)) return 'ongoing-project-images';
  if (tableName.includes('property') && /video|tour/.test(columnName)) return 'property-videos';
  if (tableName.includes('property') && /image|photo|gallery|media/.test(columnName)) return 'property-images';
  if (tableName.includes('brochure')) return 'brochures';
  if (tableName.includes('proposal')) return 'proposal-files';
  return null;
}

function parseStorageReference(value, table, column, row) {
  if (typeof value !== 'string' || !value.trim()) return [];
  const text = value.trim();
  const results = [];
  const pattern = /\/storage\/v1\/(?:object|render\/image)\/(?:public\/|authenticated\/)?([^/]+)\/(.+?)(?:[?#]|$)/ig;
  for (const match of text.matchAll(pattern)) {
    if (!allowedBuckets.has(match[1])) continue;
    let path;
    try { path = decodeURIComponent(match[2]); } catch { path = match[2]; }
    results.push({ bucket: match[1], path, table, column, rowId: row.id ?? row.uuid ?? row.slug ?? 'unknown' });
  }
  if (results.length || /^https?:\/\//i.test(text)) return results;

  let objectPath = text.replace(/^\/+/, '');
  const explicitBucket = [...allowedBuckets].find((bucket) => objectPath.startsWith(`${bucket}/`));
  const bucket = explicitBucket || inferBucket(table, column);
  if (!bucket) return results;
  if (explicitBucket) objectPath = objectPath.slice(explicitBucket.length + 1);
  try { objectPath = decodeURIComponent(objectPath); } catch { /* Preserve malformed references for matching. */ }
  results.push({ bucket, path: objectPath, table, column, rowId: row.id ?? row.uuid ?? row.slug ?? 'unknown' });
  return results;
}

async function fetchReferenceTables(supabaseUrl, serviceRoleKey) {
  const response = await fetch(`${supabaseUrl.replace(/\/$/, '')}/rest/v1/`, {
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      Accept: 'application/openapi+json, application/json',
    },
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw new Error(`PostgREST schema request failed with HTTP ${response.status}`);
  const schema = await response.json();
  const definitions = schema.definitions || schema.components?.schemas || {};
  const tables = [];
  for (const [name, definition] of Object.entries(definitions)) {
    const columns = Object.keys(definition?.properties || {});
    if (columns.length) tables.push({ name: name.replace(/^public\./, ''), columns });
  }
  return tables;
}

async function findLiveReferences(supabaseUrl, serviceRoleKey, targets) {
  const targetSet = new Set(targets.map((file) => `${file.bucket}/${file.path}`));
  const matches = new Map();
  const errors = [];
  const tables = await fetchReferenceTables(supabaseUrl, serviceRoleKey);
  for (const table of tables) {
    const storageColumns = table.columns.filter((column) => referenceColumnPattern.test(column));
    if (!storageColumns.length) continue;
    const selected = [...new Set(['id', 'uuid', 'slug', ...storageColumns])].filter((column) => table.columns.includes(column));
    for (let offset = 0; ; offset += pageSize) {
      const query = new URLSearchParams({ select: selected.join(','), limit: String(pageSize), offset: String(offset) });
      const response = await fetch(`${supabaseUrl.replace(/\/$/, '')}/rest/v1/${encodeURIComponent(table.name)}?${query}`, {
        headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` },
        signal: AbortSignal.timeout(30000),
      });
      if (!response.ok) {
        errors.push(`${table.name}: HTTP ${response.status}`);
        break;
      }
      const rows = await response.json();
      for (const row of rows) {
        for (const column of storageColumns) {
          const visit = (value) => {
            if (typeof value === 'string') {
              for (const ref of parseStorageReference(value, table.name, column, row)) {
                const key = `${ref.bucket}/${ref.path}`;
                if (!targetSet.has(key)) continue;
                if (!matches.has(key)) matches.set(key, []);
                matches.get(key).push(`${ref.table}.${ref.column} row ${ref.rowId}`);
              }
            } else if (Array.isArray(value)) {
              value.forEach(visit);
            } else if (value && typeof value === 'object') {
              Object.values(value).forEach(visit);
            }
          };
          visit(row[column]);
        }
      }
      if (rows.length < pageSize) break;
    }
  }
  return { matches, errors };
}

function loadManifest() {
  if (!existsSync(reportPath)) throw new Error(`Missing ${reportPath}; run the storage dedupe audit first.`);
  return parseCsv(readFileSync(reportPath, 'utf8'));
}

function candidateTier(file, tier, referencedHashes, orphanAllowlist) {
  if (file.referenced !== 'no') return null;
  const allowlisted = orphanAllowlist.has(`${file.bucket}/${file.path}`);
  if (excludedBuckets.has(file.bucket)) return null;

  if (tier === 1) {
    if (!isTier1HashCandidate(file, referencedHashes) || !isTier1Allowlisted(file.path)) return null;
    return 'Tier 1 explicit allowlist duplicate';
  }
  if (!referencedHashes.has(file.sha256) && !allowlisted) return null;

  const detected = `${file.detected_file_type || ''} ${file.stored_mime_type || ''}`.toLowerCase();
  const isVideoOrPdf = videoPattern.test(file.path) || pdfPattern.test(file.path) || /video\/(mp4|quicktime|webm)|application\/pdf/.test(detected);
  if (tier === 2) return referencedHashes.has(file.sha256) && isVideoOrPdf ? 'Tier 2 duplicate video/PDF' : null;
  if (tier === 3) return referencedHashes.has(file.sha256) && !isVideoOrPdf && Number(file.size_bytes) <= smallDuplicateLimitBytes
    ? 'Tier 3 small duplicate' : null;
  return null;
}

function isTier1HashCandidate(file, referencedHashes) {
  return file.bucket === 'property-images'
    && file.referenced === 'no'
    && referencedHashes.has(file.sha256)
    && !excludedBuckets.has(file.bucket);
}

function isTier1Allowlisted(path) {
  return tier1Folders.some((folder) => path.startsWith(folder))
    || tier1FlatPrefixes.some((prefix) => path.startsWith(prefix));
}

function writeManifest(candidates) {
  const headers = ['bucket', 'path', 'size', 'sha256', 'reason', 'canonical_kept_path', 'referenced', 'matches_referenced_path'];
  const lines = [headers.join(',')];
  for (const item of candidates) {
    lines.push([item.bucket, item.path, item.size_bytes, item.sha256, item.reason, item.canonical_kept_path, item.referenced, item.matches_referenced_path].map(csv).join(','));
  }
  writeFileSync(manifestPath, `${lines.join('\r\n')}\r\n`, 'utf8');
}

function writeDeferredCandidates(candidates) {
  const headers = ['bucket', 'path', 'size', 'sha256', 'reason'];
  const lines = [headers.join(',')];
  for (const item of candidates) {
    lines.push([item.bucket, item.path, item.size_bytes, item.sha256, 'Hash-matched property-image outside Tier 1 allowlist'].map(csv).join(','));
  }
  writeFileSync(deferredCandidatesPath, `${lines.join('\r\n')}\r\n`, 'utf8');
}

function appendCleanupLog(item) {
  const line = [item.bucket, item.path, item.size, item.status, item.timestamp].map(csv).join(',');
  if (!existsSync(cleanupLogPath)) writeFileSync(cleanupLogPath, `bucket,path,size,status,timestamp\r\n${line}\r\n`, 'utf8');
  else writeFileSync(cleanupLogPath, `${readFileSync(cleanupLogPath, 'utf8')}${line}\r\n`, 'utf8');
}

function resolveBackupPath(bucket, objectPath) {
  const destination = resolve(backupRoot, bucket, ...objectPath.split('/'));
  if (!destination.startsWith(`${backupRoot}${sep}`)) throw new Error('Unsafe backup path rejected.');
  return destination;
}

async function backupAndVerify(supabaseUrl, serviceRoleKey, item) {
  const destination = resolveBackupPath(item.bucket, item.path);
  mkdirSync(dirname(destination), { recursive: true });
  if (existsSync(destination)) {
    const digest = await hashLocalFile(destination);
    return { destination, digest, reused: true };
  }

  const url = `${supabaseUrl.replace(/\/$/, '')}/storage/v1/object/${item.bucket}/${encodeStoragePath(item.path)}`;
  const response = await fetch(url, { headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` }, signal: AbortSignal.timeout(120000) });
  if (!response.ok || !response.body) throw new Error(`Backup download failed with HTTP ${response.status}`);
  const hash = createHash('sha256');
  const output = createWriteStream(destination, { flags: 'wx' });
  const hashStream = new Transform({ transform(chunk, _encoding, callback) { hash.update(chunk); callback(null, chunk); } });
  await pipeline(Readable.fromWeb(response.body), hashStream, output);
  return { destination, digest: hash.digest('hex'), reused: false };
}

async function hashLocalFile(path) {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(path)) hash.update(chunk);
  return hash.digest('hex');
}

loadEnvFile();
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const tierArgIndex = process.argv.indexOf('--tier');
const tierArg = process.argv.find((argument) => argument.startsWith('--tier='));
const tierValue = tierArg ? tierArg.split('=')[1] : tierArgIndex >= 0 ? process.argv[tierArgIndex + 1] : '1';
const tier = Number(tierValue);
const apply = process.argv.includes('--apply');
const backupOnly = process.argv.includes('--backup-only');
const orphanAllowlist = new Set((process.env.ORPHAN_ALLOWLIST || '').split(/[\r\n;,]+/).map((item) => item.trim()).filter(Boolean));
if (![1, 2, 3].includes(tier)) throw new Error('Tier must be 1, 2, or 3.');
if (apply && backupOnly) throw new Error('Use either --apply or --backup-only, not both.');
if (!supabaseUrl || !serviceRoleKey) throw new Error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');

const manifestRows = loadManifest();
const referencedHashes = new Set(manifestRows.filter((row) => row.referenced === 'yes' && row.sha256).map((row) => row.sha256));
const referencedPathsByHash = new Map();
for (const row of manifestRows) {
  if (row.referenced !== 'yes' || !row.sha256) continue;
  if (!referencedPathsByHash.has(row.sha256)) referencedPathsByHash.set(row.sha256, new Set());
  referencedPathsByHash.get(row.sha256).add(`${row.bucket}/${row.path}`);
}
const firstByHash = new Map();
for (const row of manifestRows) {
  if (!row.sha256 || firstByHash.has(row.sha256)) continue;
  firstByHash.set(row.sha256, row);
}
const candidates = [];
for (const row of manifestRows) {
  if (!allowedBuckets.has(row.bucket) || !row.path || !row.sha256) continue;
  const reason = candidateTier(row, tier, referencedHashes, orphanAllowlist);
  if (!reason) continue;
  const canonicalRow = row.canonical_bucket && row.canonical_path
    ? `${row.canonical_bucket}/${row.canonical_path}`
    : firstByHash.has(row.sha256) ? `${firstByHash.get(row.sha256).bucket}/${firstByHash.get(row.sha256).path}` : '';
  const matchesReferencedPath = [...(referencedPathsByHash.get(row.sha256) || [])].join('|');
  candidates.push({ ...row, reason, canonical_kept_path: canonicalRow, matches_referenced_path: matchesReferencedPath });
}
const plannedBytes = candidates.reduce((sum, item) => sum + Number(item.size_bytes), 0);
let deferredCandidates = [];
if (tier === 1) {
  deferredCandidates = manifestRows.filter((row) => isTier1HashCandidate(row, referencedHashes) && !isTier1Allowlisted(row.path));
  const plannedMiB = plannedBytes / (1024 * 1024);
  if (candidates.length !== 108 || Math.abs(plannedMiB - 351.35) > 0.01) {
    throw new Error(`Tier 1 assertion failed: expected 108 files / 351.35 MiB +/- 0.01; got ${candidates.length} files / ${plannedMiB.toFixed(2)} MiB (${plannedBytes} bytes). No manifests written.`);
  }
}
writeManifest(candidates);
if (tier === 1 && !apply && !backupOnly) writeDeferredCandidates(deferredCandidates);
console.log(`TIER ${tier} ${apply ? 'APPLY' : 'DRY RUN'}`);
console.log(`Candidates: ${candidates.length}`);
console.log(`Potential reclaim: ${formatBytes(plannedBytes)}`);
if (tier === 1) console.log(`Deferred hash-matched candidates: ${deferredCandidates.length} (${deferredCandidatesPath})`);
if (tier === 1) {
  const groups = new Map([...tier1Folders.map((folder) => [folder, { count: 0, bytes: 0 }]), ...['1788651115508', '1788651115513', '1788651115514', 'other timestamp prefixes', 'other property-image paths'].map((prefix) => [prefix, { count: 0, bytes: 0 }])]);
  for (const item of candidates) {
    const folder = tier1Folders.find((prefix) => item.path.startsWith(prefix));
    const flatPrefix = !folder ? item.path.match(/^properties\/(\d{13})_/)?.[1] : null;
    const group = folder || (groups.has(flatPrefix) ? flatPrefix : flatPrefix ? 'other timestamp prefixes' : 'other property-image paths');
    if (!groups.has(group)) groups.set(group, { count: 0, bytes: 0 });
    const totals = groups.get(group);
    totals.count++;
    totals.bytes += Number(item.size_bytes);
  }
  for (const [group, totals] of groups) console.log(`Tier 1 group ${group}: ${totals.count} files; ${formatBytes(totals.bytes)}`);
}
console.log(`Manifest: ${manifestPath}`);
if (backupOnly) console.log('No delete operation is performed in backup-only mode.');
else if (!apply) console.log('No delete operation is performed in dry-run mode.');
for (const item of candidates) console.log(`${item.bucket}\t${item.path}\t${item.size_bytes} bytes\t${item.reason}\tkeep=${item.canonical_kept_path}`);
if (backupOnly) {
  let verifiedCount = 0;
  let verifiedBytes = 0;
  let failedCount = 0;
  for (const item of candidates) {
    try {
      const backup = await backupAndVerify(supabaseUrl, serviceRoleKey, item);
      if (backup.digest !== item.sha256) throw new Error(`SHA-256 mismatch at ${backup.destination}`);
      verifiedCount++;
      verifiedBytes += Number(item.size_bytes);
      console.log(`Backup verified: ${item.bucket}/${item.path}`);
    } catch (error) {
      failedCount++;
      console.error(`Backup failed: ${item.bucket}/${item.path}: ${error.message}`);
    }
  }
  console.log(`Backup-only finished: verified ${verifiedCount}/${candidates.length}; ${formatBytes(verifiedBytes)}; failed ${failedCount}.`);
  process.exit(failedCount ? 1 : 0);
}
if (!apply) {
  console.log('Dry run complete. Pass --apply only after reviewing deletion-manifest.csv.');
  process.exit(0);
}

const totalPlannedBytes = plannedBytes;
const client = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
let freedBytes = 0;
let removedFiles = 0;
for (let start = 0; start < candidates.length; start += deleteBatchSize) {
  const batch = candidates.slice(start, start + deleteBatchSize);
  const verified = [];
  for (const item of batch) {
    const timestamp = new Date().toISOString();
    try {
      const backup = await backupAndVerify(supabaseUrl, serviceRoleKey, item);
      if (backup.digest !== item.sha256) {
        appendCleanupLog({ ...item, size: item.size_bytes, status: `skipped-hash-mismatch:${backup.destination}`, timestamp });
        continue;
      }
      verified.push(item);
    } catch (error) {
      appendCleanupLog({ ...item, size: item.size_bytes, status: `backup-failed:${error.message}`, timestamp });
    }
  }
  if (!verified.length) continue;

  let liveScan;
  try {
    liveScan = await findLiveReferences(supabaseUrl, serviceRoleKey, verified);
  } catch (error) {
    for (const item of verified) appendCleanupLog({ ...item, size: item.size_bytes, status: `skipped-live-reference-scan-failed:${error.message}`, timestamp: new Date().toISOString() });
    continue;
  }
  if (liveScan.errors.length) {
    for (const item of verified) appendCleanupLog({ ...item, size: item.size_bytes, status: `skipped-live-reference-scan-incomplete:${liveScan.errors.join('|')}`, timestamp: new Date().toISOString() });
    continue;
  }

  const byBucket = new Map();
  for (const item of verified) {
    const key = `${item.bucket}/${item.path}`;
    if (liveScan.matches.get(key)?.length) {
      appendCleanupLog({ ...item, size: item.size_bytes, status: `skipped-live-reference:${liveScan.matches.get(key).join('|')}`, timestamp: new Date().toISOString() });
      continue;
    }
    if (!byBucket.has(item.bucket)) byBucket.set(item.bucket, []);
    byBucket.get(item.bucket).push(item);
  }

  for (const [bucket, items] of byBucket) {
    for (let index = 0; index < items.length; index += deleteBatchSize) {
      const deleteBatch = items.slice(index, index + deleteBatchSize);
      let confirmationScan;
      try {
        confirmationScan = await findLiveReferences(supabaseUrl, serviceRoleKey, deleteBatch);
      } catch (error) {
        for (const item of deleteBatch) appendCleanupLog({ ...item, size: item.size_bytes, status: `skipped-final-reference-scan-failed:${error.message}`, timestamp: new Date().toISOString() });
        continue;
      }
      if (confirmationScan.errors.length) {
        for (const item of deleteBatch) appendCleanupLog({ ...item, size: item.size_bytes, status: `skipped-final-reference-scan-incomplete:${confirmationScan.errors.join('|')}`, timestamp: new Date().toISOString() });
        continue;
      }
      const clearToDelete = deleteBatch.filter((item) => !(confirmationScan.matches.get(`${item.bucket}/${item.path}`)?.length));
      for (const item of deleteBatch.filter((item) => !clearToDelete.includes(item))) {
        appendCleanupLog({ ...item, size: item.size_bytes, status: `skipped-live-reference:${confirmationScan.matches.get(`${item.bucket}/${item.path}`).join('|')}`, timestamp: new Date().toISOString() });
      }
      if (!clearToDelete.length) continue;
      try {
        const { error } = await client.storage.from(bucket).remove(clearToDelete.map((item) => item.path));
        if (error) throw error;
        for (const item of clearToDelete) {
          appendCleanupLog({ ...item, size: item.size_bytes, status: 'deleted-after-backup-and-live-reference-check', timestamp: new Date().toISOString() });
          freedBytes += Number(item.size_bytes);
          removedFiles++;
        }
      } catch (error) {
        for (const item of clearToDelete) appendCleanupLog({ ...item, size: item.size_bytes, status: `delete-failed:${error.message}`, timestamp: new Date().toISOString() });
      }
    }
  }
}
console.log(`Apply finished: deleted ${removedFiles} files; freed ${formatBytes(freedBytes)} of ${formatBytes(totalPlannedBytes)} planned.`);
console.log('Dashboard storage usage can take up to an hour to refresh.');
