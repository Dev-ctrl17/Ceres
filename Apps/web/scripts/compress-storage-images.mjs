import { createHash } from 'node:crypto';
import { createReadStream, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, extname, resolve, sep } from 'node:path';
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const appDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const reportPath = resolve(appDir, 'dedupe-report.csv');
const planPath = resolve(appDir, 'compression-plan.csv');
const compareRoot = resolve(appDir, 'compare');
const backupRoot = resolve(appDir, 'backup-compress');
const logPath = resolve(appDir, 'compress-log.csv');
const excludedBuckets = new Set(['site-assets', 'team-photos', 'proposal-files', 'brochures']);
const contentTypes = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };
const bucketNames = new Set(['property-images', 'ongoing-project-images', 'agent-photos']);

function loadEnv() {
  const envPath = resolve(appDir, '.env');
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*(?:export\s+)?([^=]+)=(.*)$/);
    if (!match) continue;
    const name = match[1].trim();
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
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
      if (char === '"' && text[index + 1] === '"') { cell += '"'; index++; }
      else if (char === '"') quoted = false;
      else cell += char;
    } else if (char === '"') quoted = true;
    else if (char === ',') { row.push(cell); cell = ''; }
    else if (char === '\n') { row.push(cell.replace(/\r$/, '')); if (row.some(Boolean)) rows.push(row); row = []; cell = ''; }
    else cell += char;
  }
  if (cell || row.length) { row.push(cell.replace(/\r$/, '')); if (row.some(Boolean)) rows.push(row); }
  const headers = rows.shift() || [];
  return rows.map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] || ''])));
}

function toCsv(value) {
  const text = String(value ?? '');
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function csvText(headers, rows) {
  return `${[headers.join(','), ...rows.map((row) => headers.map((header) => toCsv(row[header])).join(','))].join('\r\n')}\r\n`;
}

function isInScope(row) {
  if (row.bucket === 'property-images') {
    return row.path.startsWith('properties/7f484187-c897-43a5-8cf9-893f5f91baf3/')
      || row.path.startsWith('properties/a13997fd-83a6-479a-b817-2d3a67765921/')
      || row.path.startsWith('submissions/1786228966');
  }
  if (row.bucket === 'ongoing-project-images') return true;
  return row.bucket === 'agent-photos' && row.path === 'applications/1788216080122_20260529_143652.jpg';
}

function digest(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

function encodeStoragePath(path) {
  return path.split('/').map(encodeURIComponent).join('/');
}

function parseArgs() {
  const args = process.argv.slice(2);
  const apply = args.includes('--apply');
  const backupOnly = args.includes('--backup-only');
  const bucketIndex = args.indexOf('--bucket');
  const bucketFlag = args.find((argument) => argument.startsWith('--bucket='));
  const bucket = bucketFlag ? bucketFlag.slice('--bucket='.length) : bucketIndex >= 0 ? args[bucketIndex + 1] : '';
  if (apply && backupOnly) throw new Error('Use either --apply or --backup-only, not both.');
  if ((apply || backupOnly) && (!bucket || !bucketNames.has(bucket) || excludedBuckets.has(bucket))) {
    throw new Error('Apply and backup-only require --bucket property-images, ongoing-project-images, or agent-photos.');
  }
  return { apply, backupOnly, bucket };
}

async function downloadObject(baseUrl, serviceRoleKey, item) {
  const url = `${baseUrl}/storage/v1/object/${item.bucket}/${encodeStoragePath(item.path)}`;
  const response = await fetch(url, {
    headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` },
    signal: AbortSignal.timeout(120000),
  });
  if (!response.ok) throw new Error(`download HTTP ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}

function contentTypeFor(item) {
  return contentTypes[extname(item.path).toLowerCase()] || '';
}

async function compressImage(input, item) {
  const extension = extname(item.path).toLowerCase();
  const contentType = contentTypeFor(item);
  if (!contentType) throw new Error('unsupported/non-image extension');
  const image = sharp(input, { failOn: 'error' });
  const metadata = await image.metadata();
  const expectedFormat = extension === '.jpg' || extension === '.jpeg' ? 'jpeg' : extension.slice(1);
  if (metadata.format !== expectedFormat) throw new Error(`extension/format mismatch (${extension} vs ${metadata.format || 'unknown'})`);
  let pipeline = image.rotate().resize({ width: 1920, withoutEnlargement: true });
  if (expectedFormat === 'jpeg') pipeline = pipeline.jpeg({ quality: 75, mozjpeg: true });
  else if (expectedFormat === 'png') pipeline = pipeline.png({ palette: true, compressionLevel: 9 });
  else pipeline = pipeline.webp({ quality: 75 });
  return { buffer: await pipeline.toBuffer(), contentType };
}

function comparePaths(item) {
  const folder = resolve(compareRoot, item.bucket, ...item.path.split('/'));
  const extension = extname(item.path).toLowerCase();
  return { original: resolve(folder, `original${extension}`), compressed: resolve(folder, `compressed${extension}`) };
}

function safeBackupPath(item) {
  const destination = resolve(backupRoot, item.bucket, ...item.path.split('/'));
  if (!destination.startsWith(`${backupRoot}${sep}`)) throw new Error('unsafe backup path');
  return destination;
}

async function stageBackups(items, bucket, baseUrl, serviceRoleKey) {
  let verified = 0;
  let failed = 0;
  for (const item of items.filter((row) => row.bucket === bucket && row.decision.startsWith('compress'))) {
    const key = `${item.bucket}/${item.path}`;
    try {
      const original = await downloadObject(baseUrl, serviceRoleKey, item);
      if (digest(original) !== item.sha256 || original.length !== Number(item.original_bytes)) {
        throw new Error('downloaded original size/SHA-256 does not match compression-plan.csv and dedupe-report.csv');
      }
      const destination = safeBackupPath(item);
      mkdirSync(dirname(destination), { recursive: true });
      if (existsSync(destination)) {
        const existing = readFileSync(destination);
        if (digest(existing) !== item.sha256 || existing.length !== original.length) throw new Error('existing backup size/SHA-256 mismatch; refusing overwrite');
      } else {
        writeFileSync(destination, original, { flag: 'wx' });
      }
      verified++;
      console.log(`Backup verified: ${key}`);
    } catch (error) {
      failed++;
      console.error(`Backup failed: ${key}: ${error.message}`);
    }
  }
  console.log(`Backup-only ${bucket}: verified ${verified}; failed ${failed}.`);
  if (failed) process.exitCode = 1;
}

function appendLog(entry) {
  const headers = ['bucket', 'path', 'status', 'original_bytes', 'uploaded_bytes', 'detail', 'timestamp'];
  const line = headers.map((header) => toCsv(entry[header])).join(',');
  if (!existsSync(logPath)) writeFileSync(logPath, `${headers.join(',')}\r\n${line}\r\n`, 'utf8');
  else writeFileSync(logPath, `${readFileSync(logPath, 'utf8')}${line}\r\n`, 'utf8');
}

async function uploadObject(client, item, buffer, contentType) {
  const { error } = await client.storage.from(item.bucket).upload(item.path, buffer, {
    contentType,
    cacheControl: '31536000',
    upsert: true,
  });
  if (error) throw error;
}

async function verifyPublicObject(baseUrl, item, expectedBytes) {
  const url = new URL(`${baseUrl}/storage/v1/object/public/${item.bucket}/${encodeStoragePath(item.path)}`);
  url.searchParams.set('compression-verify', `${Date.now()}-${Math.random().toString(16).slice(2)}`);
  const response = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(30000) });
  const contentType = response.headers.get('content-type') || '';
  const contentLength = Number(response.headers.get('content-length'));
  return {
    ok: response.status === 200 && contentType.toLowerCase().startsWith('image/') && contentLength === expectedBytes,
    status: response.status,
    contentType,
    contentLength: Number.isFinite(contentLength) ? contentLength : null,
  };
}

async function applyPlan(plan, bucket, baseUrl, serviceRoleKey, client) {
  const logRows = existsSync(logPath) ? parseCsv(readFileSync(logPath, 'utf8')) : [];
  const completed = new Set(logRows.filter((row) => row.status === 'compressed-verified').map((row) => `${row.bucket}/${row.path}`));
  const items = plan.filter((row) => row.bucket === bucket && row.decision.startsWith('compress'));
  let uploadedBytes = 0;
  let failed = 0;
  for (const item of items) {
    const key = `${item.bucket}/${item.path}`;
    if (completed.has(key)) {
      console.log(`Skip already verified: ${key}`);
      continue;
    }
    const timestamp = new Date().toISOString();
    let original;
    let backup;
    let uploadAttempted = false;
    try {
      original = await downloadObject(baseUrl, serviceRoleKey, item);
      if (digest(original) !== item.sha256) {
        appendLog({ bucket: item.bucket, path: item.path, status: 'skipped-hash-mismatch', original_bytes: original.length, uploaded_bytes: '', detail: 'Downloaded source SHA-256 did not match dedupe-report.csv.', timestamp });
        failed++;
        continue;
      }
      const backupPath = safeBackupPath(item);
      mkdirSync(dirname(backupPath), { recursive: true });
      if (existsSync(backupPath)) {
        const existingBackup = readFileSync(backupPath);
        if (digest(existingBackup) !== item.sha256) throw new Error('existing backup SHA-256 mismatch; refusing overwrite');
      } else {
        writeFileSync(backupPath, original, { flag: 'wx' });
      }
      backup = readFileSync(backupPath);
      if (digest(backup) !== item.sha256) throw new Error('backup SHA-256 mismatch; refusing overwrite');
      const { buffer: compressed, contentType } = await compressImage(original, item);
      const percentSaved = (original.length - compressed.length) / original.length * 100;
      if (percentSaved < 20) {
        appendLog({ bucket: item.bucket, path: item.path, status: 'skipped-below-20-percent', original_bytes: original.length, uploaded_bytes: compressed.length, detail: `${percentSaved.toFixed(2)}% saved.`, timestamp });
        continue;
      }
      uploadAttempted = true;
      await uploadObject(client, item, compressed, contentType);
      const verification = await verifyPublicObject(baseUrl, item, compressed.length);
      if (verification.ok) {
        uploadAttempted = false;
        uploadedBytes += compressed.length;
        appendLog({ bucket: item.bucket, path: item.path, status: 'compressed-verified', original_bytes: original.length, uploaded_bytes: compressed.length, detail: `HTTP ${verification.status}; ${verification.contentType}; ${verification.contentLength} bytes.`, timestamp });
        console.log(`Compressed and verified: ${key}`);
        continue;
      }
      await uploadObject(client, item, backup, contentTypeFor(item));
      const restored = await verifyPublicObject(baseUrl, item, backup.length);
      uploadAttempted = false;
      const detail = `Compressed verification failed (HTTP ${verification.status}, ${verification.contentType || 'no content-type'}, ${verification.contentLength ?? 'no content-length'} bytes); original restored; restore verification ${restored.ok ? 'passed' : 'failed'} (HTTP ${restored.status}, ${restored.contentType || 'no content-type'}, ${restored.contentLength ?? 'no content-length'} bytes).`;
      appendLog({ bucket: item.bucket, path: item.path, status: restored.ok ? 'restored-after-verification-failure' : 'restore-verification-failed', original_bytes: original.length, uploaded_bytes: compressed.length, detail, timestamp });
      failed++;
    } catch (error) {
      if (uploadAttempted && backup) {
        try {
          await uploadObject(client, item, backup, contentTypeFor(item));
          const restored = await verifyPublicObject(baseUrl, item, backup.length);
          appendLog({ bucket: item.bucket, path: item.path, status: restored.ok ? 'restored-after-error' : 'restore-verification-failed', original_bytes: original.length, uploaded_bytes: '', detail: `${error.message}; restore verification ${restored.ok ? 'passed' : `failed (HTTP ${restored.status}, ${restored.contentType || 'no content-type'}, ${restored.contentLength ?? 'no content-length'} bytes)`}.`, timestamp });
        } catch (restoreError) {
          appendLog({ bucket: item.bucket, path: item.path, status: 'restore-failed', original_bytes: original?.length ?? '', uploaded_bytes: '', detail: `${error.message}; restore error: ${restoreError.message}`, timestamp });
        }
      } else {
        appendLog({ bucket: item.bucket, path: item.path, status: 'failed', original_bytes: original?.length ?? '', uploaded_bytes: '', detail: error.message, timestamp });
      }
      failed++;
      console.error(`Failed: ${key}: ${error.message}`);
    }
  }
  console.log(`Apply complete for ${bucket}: verified compressed bytes ${uploadedBytes}; failures/skips ${failed}.`);
  if (failed) process.exitCode = 1;
}

loadEnv();
const { apply, backupOnly, bucket } = parseArgs();
const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceRoleKey) throw new Error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
const report = parseCsv(readFileSync(reportPath, 'utf8'));
const referencedRows = report.filter((row) => row.referenced === 'yes' && Number(row.size_bytes) > 500000 && isInScope(row) && !excludedBuckets.has(row.bucket));
const referencedByPath = new Map(report.map((row) => [`${row.bucket}/${row.path}`, row]));

if (apply || backupOnly) {
  if (!existsSync(planPath)) throw new Error('Missing compression-plan.csv; run the dry-run first.');
  const planRows = parseCsv(readFileSync(planPath, 'utf8'));
  const approvedItems = planRows.filter((item) => item.bucket === bucket && item.decision.startsWith('compress')).map((item) => {
    const reportRow = referencedByPath.get(`${item.bucket}/${item.path}`);
    if (!reportRow || reportRow.referenced !== 'yes' || !isInScope(reportRow) || Number(reportRow.size_bytes) <= 500000 || excludedBuckets.has(item.bucket) || Number(item.original_bytes) !== Number(reportRow.size_bytes)) {
      throw new Error(`Plan row is no longer eligible; refusing all apply: ${item.bucket}/${item.path}`);
    }
    return { ...item, ...reportRow, original_bytes: item.original_bytes };
  });
  if (backupOnly) {
    await stageBackups(approvedItems, bucket, supabaseUrl, serviceRoleKey);
    if (process.exitCode) process.exit(process.exitCode);
    process.exit(0);
  }
  const client = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
  await applyPlan(approvedItems, bucket, supabaseUrl, serviceRoleKey, client);
  if (process.exitCode) process.exit(process.exitCode);
  process.exit(0);
}

const largestKeys = new Set([...referencedRows]
  .sort((left, right) => Number(right.size_bytes) - Number(left.size_bytes))
  .slice(0, 5)
  .map((item) => `${item.bucket}/${item.path}`));
const plan = [];
const projectedByBucket = new Map();
const failures = [];
for (const row of referencedRows) {
  const item = { ...row, original_bytes: Number(row.size_bytes), estimated_new_bytes: '', percent_saved: '', decision: '' };
  const key = `${item.bucket}/${item.path}`;
  const extension = extname(item.path).toLowerCase();
  if (!contentTypes[extension]) {
    item.decision = `skip: unsupported/non-image extension ${extension || '(none)'}`;
    plan.push(item);
    continue;
  }
  try {
    const original = await downloadObject(supabaseUrl, serviceRoleKey, item);
    if (digest(original) !== item.sha256) {
      item.decision = 'skip: source SHA-256 mismatch';
      plan.push(item);
      failures.push(`${key}: source SHA-256 mismatch`);
      continue;
    }
    item.original_bytes = original.length;
    const { buffer: compressed } = await compressImage(original, item);
    item.estimated_new_bytes = compressed.length;
    const percentSaved = (original.length - compressed.length) / original.length * 100;
    item.percent_saved = percentSaved.toFixed(2);
    if (percentSaved >= 20) {
      item.decision = 'compress: meets 20% minimum';
      const totals = projectedByBucket.get(item.bucket) || { saved: 0, files: 0 };
      totals.saved += original.length - compressed.length;
      totals.files++;
      projectedByBucket.set(item.bucket, totals);
    } else {
      item.decision = 'skip: less than 20% smaller';
    }
    if (largestKeys.has(key)) {
      const paths = comparePaths(item);
      mkdirSync(dirname(paths.original), { recursive: true });
      writeFileSync(paths.original, original);
      writeFileSync(paths.compressed, compressed);
      console.log(`Comparison copies: ${paths.original} | ${paths.compressed}`);
    }
  } catch (error) {
    item.decision = `skip: ${error.message}`;
    failures.push(`${key}: ${error.message}`);
  }
  plan.push(item);
}

const headers = ['bucket', 'path', 'original_bytes', 'estimated_new_bytes', 'percent_saved', 'decision'];
writeFileSync(planPath, csvText(headers, plan), 'utf8');
const originalBytes = plan.reduce((total, item) => total + Number(item.original_bytes), 0);
console.log(`Dry run candidates: ${plan.length} referenced allowlisted files over 500 KB.`);
console.log(`Original total: ${(originalBytes / 1024 / 1024).toFixed(2)} MiB.`);
console.log(`Compression plan: ${planPath}`);
for (const [name, totals] of projectedByBucket) console.log(`${name}: ${(totals.saved / 1024 / 1024).toFixed(2)} MiB projected saved across ${totals.files} files.`);
for (const row of plan) console.log(`${row.bucket}\t${row.path}\t${row.decision}${row.percent_saved ? `\t${row.percent_saved}%` : ''}`);
if (failures.length) {
  console.log(`Read/transform issues: ${failures.length}`);
  for (const failure of failures) console.log(failure);
}
console.log(`Comparison directory: ${compareRoot}`);