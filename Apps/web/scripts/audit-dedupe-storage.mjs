import { createHash } from 'crypto';
import { execFileSync } from 'child_process';
import { createWriteStream, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { resolve, dirname, extname, basename, join } from 'path';
import { finished } from 'stream/promises';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const appDir = resolve(__dirname, '..');
const buckets = [
  'ongoing-project-videos', 'page-backgrounds', 'ongoing-project-images', 'site-assets',
  'brochures', 'proposal-files', 'team-photos', 'agent-photos', 'property-videos', 'property-images',
];
const pageSize = 1000;
const hashCachePath = resolve(appDir, 'hashes.json');
const reportPath = resolve(appDir, 'dedupe-report.csv');
const schemaPath = '/rest/v1/';
const referenceColumnPattern = /(url|uri|path|image|photo|video|file|media|attachment|logo|cover|thumbnail|document|brochure|gallery|asset)/i;
const fileCommandCandidates = process.platform === 'win32'
  ? [process.env.FILE_BIN, 'C:/Program Files/Git/usr/bin/file.exe', 'C:/Program Files (x86)/Git/usr/bin/file.exe']
  : [process.env.FILE_BIN, '/usr/bin/file', '/bin/file'];
const fileCommand = fileCommandCandidates.find((candidate) => candidate && existsSync(candidate));

function loadEnvFile() {
  const path = resolve(appDir, '.env');
  let contents;
  try { contents = readFileSync(path, 'utf8'); } catch { return; }
  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const entry = trimmed.startsWith('export ') ? trimmed.slice(7).trim() : trimmed;
    const equals = entry.indexOf('=');
    if (equals <= 0) continue;
    const key = entry.slice(0, equals).trim();
    let value = entry.slice(equals + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

function csv(value) {
  const text = String(value ?? '');
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function formatBytes(bytes) {
  return `${(bytes / (1024 * 1024)).toFixed(2)} MiB (${bytes.toLocaleString()} bytes)`;
}

function encodeStoragePath(path) {
  return String(path).split('/').map((segment) => encodeURIComponent(segment)).join('/');
}

async function listFolder(client, bucket, folder, files, visited) {
  if (visited.has(folder)) return;
  visited.add(folder);
  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await client.storage.from(bucket).list(folder, {
      limit: pageSize,
      offset,
      sortBy: { column: 'name', order: 'asc' },
    });
    if (error) throw new Error(`${error.statusCode || ''} ${error.message || error.name || 'Storage list failed'}`.trim());
    const entries = data || [];
    for (const entry of entries) {
      const path = folder ? `${folder}/${entry.name}` : entry.name;
      if (entry.id === null || entry.metadata === null) {
        await listFolder(client, bucket, path, files, visited);
      } else {
        files.push({
          bucket,
          path,
          size: Number(entry.metadata?.size) || 0,
          mimeType: entry.metadata?.mimetype || entry.metadata?.contentType || 'unknown',
          updatedAt: entry.updated_at || entry.created_at || '',
          eTag: entry.metadata?.eTag || entry.metadata?.etag || '',
        });
      }
    }
    if (entries.length < pageSize) break;
  }
}

function sniffMime(prefix) {
  if (prefix.length >= 12 && prefix.subarray(4, 8).toString() === 'ftyp') return 'video/mp4';
  if (prefix.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3]))) return 'video/webm';
  if (prefix.subarray(0, 4).toString() === '%PDF') return 'application/pdf';
  if (prefix.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) return 'image/jpeg';
  if (prefix.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png';
  if (prefix.length >= 12 && prefix.subarray(0, 4).toString() === 'RIFF' && prefix.subarray(8, 12).toString() === 'WEBP') return 'image/webp';
  if (prefix.subarray(0, 3).toString() === 'ID3') return 'audio/mpeg';
  return 'unknown';
}

async function hashObject(client, serviceRoleKey, supabaseUrl, object) {
  const url = `${supabaseUrl.replace(/\/$/, '')}/storage/v1/object/${object.bucket}/${encodeStoragePath(object.path)}`;
  const response = await fetch(url, {
    headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` },
    signal: AbortSignal.timeout(120000),
  });
  if (!response.ok || !response.body) throw new Error(`Download failed: HTTP ${response.status}`);

  const hash = createHash('sha256');
  const prefixChunks = [];
  let prefixLength = 0;
  const extensionless = !extname(object.path);
  const needsFile = extensionless || object.mimeType === 'application/octet-stream';
  const inspectionDir = needsFile ? mkdtempSync(join(tmpdir(), 'supabase-file-audit-')) : null;
  const inspectionPath = inspectionDir ? join(inspectionDir, 'object.bin') : null;
  const inspectionStream = inspectionPath ? createWriteStream(inspectionPath) : null;
  try {
    for await (const chunkValue of response.body) {
      const chunk = Buffer.from(chunkValue);
      hash.update(chunk);
      if (prefixLength < 4096) {
        const take = chunk.subarray(0, Math.min(chunk.length, 4096 - prefixLength));
        prefixChunks.push(take);
        prefixLength += take.length;
      }
      if (inspectionStream && !inspectionStream.write(chunk)) {
        await new Promise((resolveDrain, reject) => {
          inspectionStream.once('drain', resolveDrain);
          inspectionStream.once('error', reject);
        });
      }
    }
    if (inspectionStream) {
      inspectionStream.end();
      await finished(inspectionStream);
    }
    const signatureType = sniffMime(Buffer.concat(prefixChunks, prefixLength));
    let detectedMime = signatureType;
    let fileCommandUsed = false;
    if (fileCommand && inspectionPath) {
      try {
        detectedMime = execFileSync(fileCommand, ['--brief', '--mime-type', inspectionPath], {
          encoding: 'utf8',
          timeout: 15000,
          windowsHide: true,
        }).trim() || signatureType;
        fileCommandUsed = true;
      } catch {
        detectedMime = signatureType;
      }
    }
    return { sha256: hash.digest('hex'), detectedMime, fileCommandUsed };
  } finally {
    inspectionStream?.destroy();
    if (inspectionDir) rmSync(inspectionDir, { recursive: true, force: true });
  }
}

function inferBucket(table, column, bucketSet) {
  const tableName = table.toLowerCase();
  const columnName = column.toLowerCase();
  if (tableName.includes('page_background') && bucketSet.has('page-backgrounds')) return 'page-backgrounds';
  if ((tableName.includes('team') || tableName.includes('team_member')) && /image|photo|avatar|file|path|url/.test(columnName) && bucketSet.has('team-photos')) return 'team-photos';
  if ((tableName.includes('agent') || tableName.includes('application')) && /image|photo|avatar|file|path|url/.test(columnName) && bucketSet.has('agent-photos')) return 'agent-photos';
  if (tableName.includes('ongoing_project') && /video/.test(columnName) && bucketSet.has('ongoing-project-videos')) return 'ongoing-project-videos';
  if (tableName.includes('ongoing_project') && /image|photo|gallery|media/.test(columnName) && bucketSet.has('ongoing-project-images')) return 'ongoing-project-images';
  if (tableName === 'properties' && /video|tour/.test(columnName) && bucketSet.has('property-videos')) return 'property-videos';
  if ((tableName === 'properties' || tableName.includes('property_submission')) && /image|photo|gallery|media/.test(columnName) && bucketSet.has('property-images')) return 'property-images';
  if (tableName.includes('brochure') && bucketSet.has('brochures')) return 'brochures';
  if (tableName.includes('proposal') && bucketSet.has('proposal-files')) return 'proposal-files';
  return null;
}

function storageRefFromString(value, table, column, row, bucketSet) {
  if (typeof value !== 'string' || !value.trim()) return [];
  const refs = [];
  const text = value.trim();
  const storagePattern = /\/storage\/v1\/(?:object|render\/image)\/(?:public\/|authenticated\/)?([^/]+)\/(.+?)(?:[?#]|$)/ig;
  for (const match of text.matchAll(storagePattern)) {
    const bucket = match[1];
    if (!bucketSet.has(bucket)) continue;
    let path;
    try { path = decodeURIComponent(match[2]); } catch { path = match[2]; }
    refs.push({ bucket, path, table, column, rowId: row.id ?? row.uuid ?? row.slug ?? 'unknown' });
  }
  if (refs.length) return refs;

  if (/^https?:\/\//i.test(text)) return [];
  let relativePath = text.replace(/^\/+/, '');
  const bucketPrefix = [...bucketSet].find((bucket) => relativePath.startsWith(`${bucket}/`));
  if (bucketPrefix) {
    relativePath = relativePath.slice(bucketPrefix.length + 1);
    refs.push({ bucket: bucketPrefix, path: relativePath, table, column, rowId: row.id ?? row.uuid ?? row.slug ?? 'unknown' });
    return refs;
  }

  const bucket = inferBucket(table, column, bucketSet);
  if (bucket && !/[\\\s]/.test(relativePath)) {
    try { relativePath = decodeURIComponent(relativePath); } catch { /* Keep a malformed value visible as unresolved. */ }
    refs.push({ bucket, path: relativePath, table, column, rowId: row.id ?? row.uuid ?? row.slug ?? 'unknown' });
  }
  return refs;
}

function collectStrings(value, visit) {
  if (typeof value === 'string') return visit(value);
  if (Array.isArray(value)) return value.forEach((item) => collectStrings(item, visit));
  if (value && typeof value === 'object') return Object.values(value).forEach((item) => collectStrings(item, visit));
}

async function fetchSchemaTables(supabaseUrl, serviceRoleKey) {
  const response = await fetch(`${supabaseUrl.replace(/\/$/, '')}${schemaPath}`, {
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      Accept: 'application/openapi+json, application/json',
    },
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw new Error(`PostgREST schema request failed: HTTP ${response.status}`);
  const schema = await response.json();
  const definitions = schema.definitions || schema.components?.schemas || {};
  const tables = new Map();
  for (const [definitionName, definition] of Object.entries(definitions)) {
    const columns = Object.keys(definition?.properties || {});
    if (!columns.length) continue;
    const table = definitionName.startsWith('public.') ? definitionName.slice('public.'.length) : definitionName;
    if (['geometry_columns', 'geography_columns', 'spatial_ref_sys'].includes(table)) continue;
    tables.set(table, columns);
  }
  if (!tables.size) throw new Error('No table definitions were found in the PostgREST schema document.');
  return tables;
}

async function scanReferences(supabaseUrl, serviceRoleKey, bucketSet) {
  const tables = await fetchSchemaTables(supabaseUrl, serviceRoleKey);
  const references = new Map();
  const errors = [];
  for (const [table, columns] of tables) {
    const storageColumns = columns.filter((column) => referenceColumnPattern.test(column));
    if (!storageColumns.length) continue;
    const selected = [...new Set(['id', 'uuid', 'slug', ...storageColumns])].filter((column) => columns.includes(column));
    for (let offset = 0; ; offset += pageSize) {
      const query = new URLSearchParams({ select: selected.join(','), limit: String(pageSize), offset: String(offset) });
      const response = await fetch(`${supabaseUrl.replace(/\/$/, '')}/rest/v1/${encodeURIComponent(table)}?${query}`, {
        headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` },
        signal: AbortSignal.timeout(30000),
      });
      if (!response.ok) {
        errors.push(`${table}: HTTP ${response.status}`);
        break;
      }
      const rows = await response.json();
      for (const row of rows) {
        for (const column of storageColumns) {
          collectStrings(row[column], (value) => {
            for (const ref of storageRefFromString(value, table, column, row, bucketSet)) {
              const key = `${ref.bucket}/${ref.path}`;
              if (!references.has(key)) references.set(key, []);
              references.get(key).push(`${ref.table}.${ref.column} row ${ref.rowId}`);
            }
          });
        }
      }
      if (rows.length < pageSize) break;
    }
  }
  return { references, errors, tableCount: tables.size };
}

function hashKey(object) {
  return `${object.bucket}/${object.path}`;
}

function makeDuplicateGroups(files) {
  const hashes = new Map();
  for (const file of files) {
    if (!file.sha256) continue;
    if (!hashes.has(file.sha256)) hashes.set(file.sha256, []);
    hashes.get(file.sha256).push(file);
  }
  return [...hashes.entries()]
    .filter(([, copies]) => copies.length > 1)
    .map(([sha256, copies]) => {
      const referencedCopies = copies.filter((file) => file.references.length > 0);
      const distinctRows = new Set(referencedCopies.flatMap((file) => file.references));
      const canonical = referencedCopies[0] || copies[0];
      const orphanBytes = copies.filter((file) => file.references.length === 0).reduce((sum, file) => sum + file.size, 0);
      const repointBytes = referencedCopies.filter((file) => file !== canonical).reduce((sum, file) => sum + file.size, 0);
      let classification = 'all copies unreferenced';
      if (referencedCopies.length === 1) classification = 'only one copy referenced';
      else if (referencedCopies.length > 1 && distinctRows.size > 1) classification = 'different rows reference different copies';
      else if (referencedCopies.length > 1) classification = 'multiple copies referenced';
      return {
        sha256,
        copies,
        canonical,
        classification,
        reclaimableBytes: copies.reduce((sum, file) => sum + file.size, 0) - canonical.size,
        orphanBytes,
        repointBytes,
        referencedCopies,
        distinctRows: [...distinctRows],
      };
    });
}

function makeSameNameGroups(files) {
  const groups = new Map();
  for (const file of files) {
    const key = `${basename(file.path).toLowerCase()}\t${file.size}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(file);
  }
  return [...groups.values()].filter((group) => new Set(group.map((file) => file.bucket)).size > 1);
}

function writeCsv(files, duplicateGroups, sameNameGroups) {
  const duplicateByHash = new Map(duplicateGroups.map((group) => [group.sha256, group]));
  const sameNameByFile = new Map();
  for (const group of sameNameGroups) {
    const bucketNames = [...new Set(group.map((file) => file.bucket))].join('|');
    for (const file of group) sameNameByFile.set(hashKey(file), bucketNames);
  }
  const headers = [
    'bucket', 'path', 'size_bytes', 'stored_mime_type', 'detected_file_type', 'sha256',
    'referenced', 'references', 'duplicate_group_sha256', 'duplicate_count', 'duplicate_classification',
    'canonical_bucket', 'canonical_path', 'keep_as_canonical', 'orphan_reclaimable_bytes',
    'repointable_duplicate_bytes', 'group_reclaimable_bytes', 'same_name_same_size_buckets', 'audit_error',
  ];
  const lines = [headers.join(',')];
  for (const file of files) {
    const group = duplicateByHash.get(file.sha256);
    const values = [
      file.bucket, file.path, file.size, file.mimeType, file.detectedMime || '', file.sha256 || '',
      file.references.length ? 'yes' : 'no', file.references.join(' | '), group?.sha256 || '',
      group?.copies.length || '', group?.classification || '',
      group?.canonical.bucket || '', group?.canonical.path || '',
      group && hashKey(group.canonical) === hashKey(file) ? 'yes' : 'no',
      file.references.length ? 0 : file.size,
      group && group.referencedCopies.length > 1 && file.references.length && hashKey(group.canonical) !== hashKey(file) ? file.size : 0,
      group?.reclaimableBytes ?? '',
      sameNameByFile.get(hashKey(file)) || '', file.error || '',
    ];
    lines.push(values.map(csv).join(','));
  }
  writeFileSync(reportPath, `${lines.join('\r\n')}\r\n`, 'utf8');
}

loadEnvFile();
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the environment or Apps/web/.env.');
}

let hashCache = { version: 1, files: {} };
try {
  hashCache = JSON.parse(readFileSync(hashCachePath, 'utf8'));
  if (!hashCache.files || typeof hashCache.files !== 'object') hashCache = { version: 1, files: {} };
} catch {
  hashCache = { version: 1, files: {} };
}

const client = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
const bucketFiles = [];
const bucketErrors = [];
for (const bucket of buckets) {
  try {
    await listFolder(client, bucket, '', bucketFiles, new Set());
  } catch (error) {
    bucketErrors.push(`${bucket}: ${error.message}`);
  }
}

const serviceUrl = new URL(supabaseUrl);
const files = [];
let cacheHits = 0;
let completed = 0;
for (const object of bucketFiles) {
  const cacheId = hashKey(object);
  const cached = hashCache.files[cacheId];
  const unchanged = cached && cached.size === object.size && cached.updatedAt === object.updatedAt && cached.eTag === object.eTag;
  const needsFile = !extname(object.path) || object.mimeType === 'application/octet-stream';
  try {
    const hashData = unchanged && (!needsFile || cached.detectedMime)
      ? (cacheHits++, cached)
      : await hashObject(client, serviceRoleKey, supabaseUrl, object);
    const refs = [];
    Object.assign(object, {
      sha256: hashData.sha256,
      detectedMime: hashData.detectedMime || '',
      fileCommandUsed: hashData.fileCommandUsed || false,
      references: refs,
    });
    hashCache.files[cacheId] = {
      sha256: object.sha256,
      detectedMime: object.detectedMime,
      size: object.size,
      updatedAt: object.updatedAt,
      eTag: object.eTag,
    };
  } catch (error) {
    object.sha256 = '';
    object.detectedMime = '';
    object.references = [];
    object.error = error.message;
    bucketErrors.push(`${object.bucket}/${object.path}: ${error.message}`);
  }
  files.push(object);
  completed++;
  if (completed % 10 === 0 || completed === bucketFiles.length) {
    writeFileSync(hashCachePath, `${JSON.stringify(hashCache, null, 2)}\n`, 'utf8');
    console.log(`[hash] ${completed}/${bucketFiles.length} objects; cache hits ${cacheHits}.`);
  }
}
if (completed === 0) writeFileSync(hashCachePath, `${JSON.stringify(hashCache, null, 2)}\n`, 'utf8');

let schemaScan;
try {
  schemaScan = await scanReferences(supabaseUrl, serviceRoleKey, new Set(buckets));
} catch (error) {
  schemaScan = { references: new Map(), errors: [`schema scan: ${error.message}`], tableCount: 0 };
}
for (const file of files) file.references = schemaScan.references.get(hashKey(file)) || [];

const duplicateGroups = makeDuplicateGroups(files);
const sameNameGroups = makeSameNameGroups(files);
const orphans = files.filter((file) => file.references.length === 0);
const orphanReclaimableBytes = orphans.reduce((sum, file) => sum + file.size, 0);
const combinedReclaimableBytes = orphanReclaimableBytes + duplicateGroups.reduce((sum, group) => sum + group.repointBytes, 0);
writeCsv(files, duplicateGroups, sameNameGroups);

console.log('\nREAD-ONLY STORAGE DEDUPE AUDIT');
console.log(`Files: ${files.length}; schema tables inspected: ${schemaScan.tableCount}; cache hits: ${cacheHits}.`);
console.log(`file command: ${fileCommand || 'not installed; signature-based MIME detection used.'}`);
console.log(`Unreferenced files: ${orphans.length}`);
console.log(`Duplicate groups: ${duplicateGroups.length}`);
console.log(`Same-name/same-size cross-bucket groups: ${sameNameGroups.length}`);
console.log(`Reclaimable by deleting orphans only: ${formatBytes(orphanReclaimableBytes)}`);
console.log(`Reclaimable by deleting orphans plus consolidating duplicates: ${formatBytes(combinedReclaimableBytes)}`);
console.log(`Full report: ${reportPath}`);
console.log(`Hash cache: ${hashCachePath}`);

console.log('\nDUPLICATE GROUPS');
for (const group of duplicateGroups) {
  console.log(`SHA-256 ${group.sha256}; copies=${group.copies.length}; reclaimable=${formatBytes(group.reclaimableBytes)}; classification=${group.classification}`);
  for (const file of group.copies) {
    console.log(`  ${file.bucket}\t${file.path}\t${formatBytes(file.size)}\t${file.mimeType}\trefs=${file.references.join('; ') || 'none'}`);
  }
}
console.log('\nUNREFERENCED FILES');
for (const file of orphans) console.log(`${file.bucket}\t${file.path}\t${formatBytes(file.size)}\t${file.mimeType}`);
console.log('\nSAME-NAME / SAME-SIZE CROSS-BUCKET CANDIDATES');
for (const group of sameNameGroups) {
  console.log(group.map((file) => `${file.bucket}/${file.path} (${formatBytes(file.size)})`).join(' | '));
}
console.log('\nEXTENSIONLESS OBJECT TYPES');
for (const file of files.filter((item) => !extname(item.path))) {
  console.log(`${file.bucket}\t${file.path}\tstored=${file.mimeType}\tdetected=${file.detectedMime || 'unknown'}`);
}
console.log('\nMP4 FILES STORED AS application/octet-stream');
for (const file of files.filter((item) => /\.mp4$/i.test(item.path) && item.mimeType === 'application/octet-stream')) {
  console.log(`${file.bucket}\t${file.path}\tdetected=${file.detectedMime || 'unknown'}\t${formatBytes(file.size)}`);
}
if (bucketErrors.length || schemaScan.errors.length) {
  console.log('\nAUDIT ERRORS');
  for (const error of [...bucketErrors, ...schemaScan.errors]) console.log(error);
  process.exitCode = 1;
}
