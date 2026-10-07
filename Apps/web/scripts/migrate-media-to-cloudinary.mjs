import { createHash, randomUUID } from 'node:crypto';
import { createWriteStream, existsSync, readFileSync } from 'node:fs';
import { copyFile, mkdir, open, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, extname, join, resolve } from 'node:path';
import { Readable, Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const APP_DIR = resolve(SCRIPT_DIR, '..');
const MIGRATION_DIR = join(APP_DIR, 'migration');
const MANIFEST_PATH = join(MIGRATION_DIR, 'manifest.json');
const PAGE_SIZE = 1000;
const DB_BATCH_SIZE = 50;
const UPLOAD_CHUNK_SIZE = 20 * 1024 * 1024;
const SINGLE_UPLOAD_MAX_BYTES = UPLOAD_CHUNK_SIZE;
const MAX_UPLOAD_CONCURRENCY = 10;
const MEDIA_COLUMN = /image|media|photo|video|gallery|avatar|logo|content|body|description|file|document|cover|thumbnail|markdown|html|json/i;
const DIRECT_MEDIA_COLUMN = /image|media|photo|video|gallery|avatar|logo|file|document|cover|thumbnail|pdf/i;
const CLOUDINARY_TRANSFORM = {
  image: 'c_limit,w_2000,h_2000,q_auto,f_webp',
  video: 'c_limit,w_2000,h_2000,q_auto,f_mp4',
};
const STORAGE_BUDGET_BYTES = 25 * 1024 ** 3;
const STORAGE_WARN_AT = 0.8;
const MAX_CLEANUP_AGE_DAYS = 14;

let stopRequested = false;
let logStream = null;
let manifestWrite = Promise.resolve();

function loadEnvFile() {
  const envPath = join(APP_DIR, '.env');
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const entry = trimmed.startsWith('export ') ? trimmed.slice(7).trim() : trimmed;
    const separator = entry.indexOf('=');
    if (separator < 1) continue;
    const key = entry.slice(0, separator).trim();
    let value = entry.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

function parseArgs(argv) {
  const options = {
    execute: false,
    rollback: false,
    deleteSourceVerified: false,
    confirmDeletion: false,
    limit: null,
    onlyTable: null,
    onlyType: null,
    onlyBuckets: null,
    concurrency: 3,
    backup: null,
    excludeTypes: new Set(['pdf']),
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--execute') options.execute = true;
    else if (arg === '--rollback') options.rollback = true;
    else if (arg === '--delete-source-verified') options.deleteSourceVerified = true;
    else if (arg === '--confirm-source-deletion') options.confirmDeletion = true;
    else if (arg === '--limit') {
      options.limit = Number(argv[++index]);
      if (!Number.isSafeInteger(options.limit) || options.limit < 1) {
        throw new Error('--limit must be a positive integer.');
      }
    } else if (arg === '--only-table') {
      options.onlyTable = argv[++index];
      if (!options.onlyTable) throw new Error('--only-table requires a table name.');
    } else if (arg === '--only-type') {
      options.onlyType = argv[++index]?.toLowerCase();
      if (!['image', 'video', 'pdf'].includes(options.onlyType)) {
        throw new Error('--only-type must be image, video, or pdf.');
      }
    } else if (arg === '--only-buckets') {
      const value = argv[++index];
      if (!value) throw new Error('--only-buckets requires a comma-separated bucket list.');
      options.onlyBuckets = new Set(value.split(',').map((bucket) => bucket.trim()).filter(Boolean));
      if (!options.onlyBuckets.size) throw new Error('--only-buckets requires at least one bucket name.');
    } else if (arg === '--exclude-types') {
      const value = argv[++index];
      if (!value) throw new Error('--exclude-types requires a comma-separated list (or "none").');
      options.excludeTypes = value.toLowerCase() === 'none'
        ? new Set()
        : new Set(value.split(',').map((item) => item.trim()).filter(Boolean));
      const unsupported = [...options.excludeTypes].filter((type) => type !== 'pdf');
      if (unsupported.length) {
        throw new Error(`Unsupported excluded type(s): ${unsupported.join(', ')}. Supported: pdf.`);
      }
    } else if (arg === '--concurrency') {
      options.concurrency = Number(argv[++index]);
      if (!Number.isSafeInteger(options.concurrency) ||
        options.concurrency < 1 || options.concurrency > MAX_UPLOAD_CONCURRENCY) {
        throw new Error(`--concurrency must be between 1 and ${MAX_UPLOAD_CONCURRENCY}.`);
      }
    } else if (arg === '--backup') {
      options.backup = argv[++index];
      if (!options.backup) throw new Error('--backup requires a backup file path.');
    } else if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }
  if (options.rollback && (options.execute || options.deleteSourceVerified)) {
    throw new Error('--rollback cannot be combined with --execute or --delete-source-verified.');
  }
  if (options.deleteSourceVerified && (options.execute || options.rollback)) {
    throw new Error('--delete-source-verified is a separate operation.');
  }
  if (options.deleteSourceVerified && !options.confirmDeletion) {
    throw new Error('Source deletion requires --confirm-source-deletion. Never use this before 14 clean days.');
  }
  if (options.confirmDeletion && !options.deleteSourceVerified) {
    throw new Error('--confirm-source-deletion is valid only with --delete-source-verified.');
  }
  return options;
}

function printHelp() {
  console.log(`Cloudinary media migration

Dry-run (default):  node scripts/migrate-media-to-cloudinary.mjs
Execute:            node scripts/migrate-media-to-cloudinary.mjs --execute
Small run:          node scripts/migrate-media-to-cloudinary.mjs --execute --limit 5 --only-table properties
Rollback:           node scripts/migrate-media-to-cloudinary.mjs --rollback [--backup migration/db-backup-<timestamp>.json]
Manual cleanup:     node scripts/migrate-media-to-cloudinary.mjs --delete-source-verified --confirm-source-deletion

Options: --limit N, --only-table NAME, --only-type TYPE, --only-buckets LIST, --concurrency N (default 3), --exclude-types pdf (default; use "none" to include)
Dry-run never writes a manifest, log, backup, or database changes.
`);
}

function log(message = '') {
  console.log(message);
  if (logStream) logStream.write(`${message}\n`);
}

function closeLogStream() {
  if (!logStream) return Promise.resolve();
  const stream = logStream;
  logStream = null;
  return new Promise((resolvePromise, reject) => {
    stream.once('error', reject);
    stream.end(resolvePromise);
  });
}

function safeDecode(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function encodeStoragePath(path) {
  return path.split('/').map((part) => encodeURIComponent(part)).join('/');
}

function deterministicUuid(sourceKey) {
  const bytes = Buffer.from(createHash('sha256').update(sourceKey).digest().subarray(0, 16));
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function entityForTable(table, bucket) {
  const tableEntities = {
    properties: 'properties',
    Property: 'properties',
    property_images: 'properties',
    property_submissions: 'property_submissions',
    propertySubmissions: 'property_submissions',
    ongoing_projects: 'ongoing_projects',
    proposals: 'proposals',
    brochures: 'brochures',
    agents: 'agents',
    agent_applications: 'agent_applications',
    teammembers: 'teammembers',
    page_backgrounds: 'page_backgrounds',
    blogposts: 'blogposts',
    testimonials: 'testimonials',
    reviews: 'reviews',
    profiles: 'profiles',
  };
  if (tableEntities[table]) return tableEntities[table];
  const bucketEntities = {
    'property-images': 'properties',
    'property-videos': 'properties',
    'ongoing-project-images': 'ongoing_projects',
    'ongoing-project-videos': 'ongoing_projects',
    'proposal-files': 'proposals',
    brochures: 'brochures',
    'team-photos': 'teammembers',
    'agent-photos': 'agents',
    'site-assets': 'site_assets',
    'page-backgrounds': 'page_backgrounds',
  };
  return bucketEntities[bucket] || 'media';
}

function entityForBucket(bucket) {
  const entities = {
    'property-images': 'properties',
    'property-videos': 'properties',
    'ongoing-project-images': 'ongoing_projects',
    'ongoing-project-videos': 'ongoing_projects',
    'proposal-files': 'proposals',
    brochures: 'brochures',
    'team-photos': 'teammembers',
    'agent-photos': 'agents',
    'site-assets': 'site_assets',
    'page-backgrounds': 'page_backgrounds',
  };
  return entities[bucket] || 'media';
}

function bucketHint(table, column) {
  if (['properties', 'Property', 'property_images', 'properties_image_backup'].includes(table) ||
    table.toLowerCase().includes('propertysubmission') || table === 'property_submissions') {
    return /video/i.test(column) ? 'property-videos' : 'property-images';
  }
  if (table === 'ongoing_projects') {
    return /video/i.test(column) ? 'ongoing-project-videos' : 'ongoing-project-images';
  }
  if (table === 'proposals') return 'proposal-files';
  if (table === 'brochures') return 'brochures';
  if (table === 'profiles') return 'agent-photos';
  if (table === 'teammembers') return 'team-photos';
  if (table === 'agents' || table === 'agent_applications') return 'agent-photos';
  if (table === 'page_backgrounds') return 'page-backgrounds';
  if (['blogposts', 'testimonials', 'reviews'].includes(table)) return 'site-assets';
  return null;
}

function tableHasMediaColumn(column) {
  return MEDIA_COLUMN.test(column);
}

function isDirectMediaColumn(column) {
  return DIRECT_MEDIA_COLUMN.test(column) && !/description|content|body/i.test(column);
}

function parseStorageUrl(rawUrl) {
  let url;
  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }
  const objectMatch = url.pathname.match(
    /\/storage\/v1\/(?:object|render\/image)\/(?:public\/|authenticated\/)?([^/]+)\/(.*)$/,
  );
  if (objectMatch) {
    return { bucket: objectMatch[1], path: safeDecode(objectMatch[2]) };
  }
  if (url.hostname === 'images.luxurypropertiesltd.com.ng') {
    return { bucket: 'property-images', path: safeDecode(url.pathname.slice(1)) };
  }
  return null;
}

function parseBareStoragePath(value, table, column) {
  if (!isDirectMediaColumn(column) || typeof value !== 'string' || !value || value.length > 2048) return null;
  const bucket = bucketHint(table, column);
  if (!bucket || /^https?:\/\//i.test(value)) return null;
  const cleaned = value.replace(/^\/+/, '');
  if (!cleaned.includes('/') && !/\.[a-z0-9]{2,8}$/i.test(cleaned)) return null;
  return { bucket, path: safeDecode(cleaned) };
}

function extractStorageReferences(value, table, column, refs = [], sortOrder = 0) {
  if (value === null || value === undefined) return refs;
  if (Array.isArray(value)) {
    for (const [index, item] of value.entries()) {
      extractStorageReferences(item, table, column, refs, index);
    }
    return refs;
  }
  if (typeof value === 'object') {
    for (const item of Object.values(value)) {
      extractStorageReferences(item, table, column, refs, sortOrder);
    }
    return refs;
  }
  if (typeof value !== 'string') return refs;

  const urls = value.match(/https?:\/\/[^\s"'<>]+/g) || [];
  for (const raw of urls) {
    const parsed = parseStorageUrl(raw.replace(/[),.;]+$/u, ''));
    if (parsed) refs.push({ ...parsed, oldUrl: raw.replace(/[),.;]+$/u, ''), sortOrder });
  }
  if (!urls.length) {
    const bare = parseBareStoragePath(value, table, column);
    if (bare) refs.push({ ...bare, oldUrl: null, sortOrder });
  }
  return refs;
}

function getExpectedContentType(resourceType, format, contentType) {
  if (resourceType === 'image') {
    const imageTypes = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
      avif: 'image/avif',
    };
    return imageTypes[String(format).toLowerCase()] || 'image/webp';
  }
  if (resourceType === 'video') return 'video/mp4';
  if (format === 'pdf') return 'application/pdf';
  return contentType && contentType !== 'application/octet-stream'
    ? contentType
    : 'application/octet-stream';
}

function detectFileSignature(bytes) {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { resourceType: 'image', format: 'jpg', contentType: 'image/jpeg' };
  }
  if (bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return { resourceType: 'image', format: 'png', contentType: 'image/png' };
  }
  if (bytes.subarray(0, 4).toString('ascii') === 'RIFF' &&
    bytes.subarray(8, 12).toString('ascii') === 'WEBP') {
    return { resourceType: 'image', format: 'webp', contentType: 'image/webp' };
  }
  if (bytes.subarray(0, 4).toString('ascii') === '%PDF') {
    return { resourceType: 'raw', format: 'pdf', contentType: 'application/pdf' };
  }
  if (bytes.length >= 12 && bytes.subarray(4, 8).toString('ascii') === 'ftyp') {
    const brand = bytes.subarray(8, 12).toString('ascii');
    if (/hei[cfmx]|mif1/i.test(brand)) {
      return { resourceType: 'image', format: 'heic', contentType: 'image/heic' };
    }
    return { resourceType: 'video', format: 'mp4', contentType: 'video/mp4' };
  }
  if (bytes.subarray(0, 4).toString('ascii') === 'PK\u0003\u0004') {
    return { resourceType: 'raw', format: 'zip', contentType: 'application/zip' };
  }
  return null;
}

function getKnownType(file) {
  const extension = extname(file.path).slice(1).toLowerCase();
  const contentType = String(file.contentType || '').toLowerCase();
  if (contentType.startsWith('image/')) {
    const format = contentType.split('/')[1].split(';')[0];
    return { resourceType: 'image', format: format === 'jpeg' ? 'jpg' : format, contentType };
  }
  if (contentType.startsWith('video/')) {
    const format = contentType.split('/')[1].split(';')[0];
    return { resourceType: 'video', format: format === 'quicktime' ? 'mov' : format, contentType };
  }
  if (contentType === 'application/pdf' || extension === 'pdf') {
    return { resourceType: 'raw', format: 'pdf', contentType: 'application/pdf' };
  }
  if (['jpg', 'jpeg', 'png', 'webp', 'heic'].includes(extension)) {
    return {
      resourceType: 'image',
      format: extension === 'jpeg' ? 'jpg' : extension,
      contentType: `image/${extension === 'jpg' ? 'jpeg' : extension}`,
    };
  }
  if (['mp4', 'mov'].includes(extension)) {
    return {
      resourceType: 'video',
      format: extension,
      contentType: extension === 'mov' ? 'video/quicktime' : 'video/mp4',
    };
  }
  if (extension) {
    return { resourceType: 'raw', format: extension, contentType: contentType || 'application/octet-stream' };
  }
  return null;
}

function expectedUploadType(file, signatureType) {
  const known = getKnownType(file);
  if (known && known.contentType !== 'application/octet-stream') return known;
  return signatureType || known;
}

function sourceKey(bucket, path) {
  return `${bucket}/${path}`;
}

function getObjectTarget(file, references, cloudName) {
  const primary = references
    .slice()
    .sort((left, right) => Number(left.table.toLowerCase().includes('backup')) -
      Number(right.table.toLowerCase().includes('backup')))[0];
  const entity = primary ? entityForTable(primary.table, file.bucket) : entityForBucket(file.bucket);
  const entityId = primary ? String(primary.rowId) : 'unassigned';
  const deterministicId = deterministicUuid(sourceKey(file.bucket, file.path));
  const publicId = `${entity}/${entityId}/${deterministicId}`;
  const transformed = file.resourceType === 'raw'
    ? `raw/upload/${publicId}${file.format ? `.${file.format}` : ''}`
    : `${file.resourceType === 'image' ? 'image' : 'video'}/upload/${file.resourceType === 'image' ? 'f_auto,q_auto,w_1200,c_limit' : 'f_auto,q_auto,w_2000,c_limit'}/${publicId}`;
  const url = cloudName
    ? `https://res.cloudinary.com/${cloudName}/${transformed}`
    : `(Cloudinary URL after upload: ${publicId})`;
  return { entity, entityId, publicId, url };
}

function makePublicSourceUrl(supabaseUrl, bucket, path) {
  return `${supabaseUrl.replace(/\/+$/, '')}/storage/v1/object/public/${bucket}/${encodeStoragePath(path)}`;
}

function serializedValue(value) {
  return JSON.parse(JSON.stringify(value));
}

async function listFiles(supabase) {
  const { data: buckets, error } = await supabase.storage.listBuckets();
  if (error) throw new Error(`Could not list storage buckets (${error.statusCode || error.name || 'unknown'}).`);
  const files = [];

  async function walk(bucket, folder = '') {
    for (let offset = 0; ; offset += PAGE_SIZE) {
      const { data, error: listError } = await supabase.storage.from(bucket).list(folder, {
        limit: PAGE_SIZE,
        offset,
        sortBy: { column: 'name', order: 'asc' },
      });
      if (listError) {
        throw new Error(`Could not list storage objects in ${bucket}/${folder} (${listError.statusCode || listError.name || 'unknown'}).`);
      }
      for (const item of data || []) {
        const path = folder ? `${folder}/${item.name}` : item.name;
        if (item.id === null || item.metadata === null) {
          await walk(bucket, path);
        } else {
          files.push({
            bucket,
            path,
            size: Number(item.metadata?.size) || 0,
            contentType: item.metadata?.mimetype || item.metadata?.contentType || 'application/octet-stream',
            sourceWidth: Number(item.metadata?.width) || null,
            sourceHeight: Number(item.metadata?.height) || null,
          });
        }
      }
      if ((data || []).length < PAGE_SIZE) break;
    }
  }

  for (const bucket of buckets || []) await walk(bucket.name);
  return files.sort((a, b) => a.bucket.localeCompare(b.bucket) || a.path.localeCompare(b.path));
}

async function listMediaRows(supabase) {
  const { SUPABASE_URL: supabaseUrl, SUPABASE_SERVICE_ROLE_KEY: key } = process.env;
  const response = await fetch(`${supabaseUrl.replace(/\/+$/, '')}/rest/v1/`, {
    headers: { apikey: key, authorization: `Bearer ${key}` },
  });
  if (!response.ok) throw new Error(`Could not inspect database schema (HTTP ${response.status}).`);
  const schema = await response.json();
  const tables = Object.entries(schema.definitions || {})
    .map(([table, definition]) => ({
      table,
      columns: Object.keys(definition.properties || {}).filter(tableHasMediaColumn),
    }))
    .filter((entry) => entry.columns.length > 0);
  const rows = [];

  for (const { table, columns } of tables) {
    const labelColumns = ['title', 'name', 'full_name', 'section_key', 'slug']
      .filter((column) => schema.definitions[table]?.properties?.[column]);
    const selected = [...new Set(['id', ...labelColumns, ...columns])];
    for (let offset = 0; ; offset += 300) {
      const { data, error } = await supabase.from(table).select(selected.join(',')).range(offset, offset + 299);
      if (error) {
        throw new Error(`Could not safely inspect media references in ${table} (${error.code || 'query failed'}).`);
      }
      for (const row of data || []) {
        for (const column of columns) {
          const refs = extractStorageReferences(row[column], table, column);
          if (refs.length) {
            rows.push({
              table,
              rowId: row.id,
              column,
              entityLabel: row.title || row.name || row.full_name || row.section_key || row.slug || '',
              oldValue: serializedValue(row[column]),
              refs,
            });
          }
        }
      }
      if ((data || []).length < 300) break;
    }
  }
  return rows;
}

async function readSourceSignature(supabase, file) {
  const { data, error } = await supabase.storage.from(file.bucket).createSignedUrl(file.path, 600);
  if (error || !data?.signedUrl) {
    throw new Error(`Could not create a short-lived read URL for ${file.bucket}/${file.path}.`);
  }
  const response = await fetch(data.signedUrl, {
    headers: { Range: 'bytes=0-31' },
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok && response.status !== 206) {
    throw new Error(`Could not inspect source bytes for ${file.bucket}/${file.path} (HTTP ${response.status}).`);
  }
  const reader = response.body?.getReader();
  if (!reader) throw new Error(`Source bytes unavailable for ${file.bucket}/${file.path}.`);
  const { value } = await reader.read();
  await reader.cancel().catch(() => {});
  return detectFileSignature(Buffer.from(value || []));
}

async function downloadAndHashSource(supabase, file) {
  const { data, error } = await supabase.storage
    .from(file.source_bucket)
    .createSignedUrl(file.source_path, 600);
  if (error || !data?.signedUrl) {
    throw new Error('Could not create a short-lived source URL for integrity verification.');
  }

  const response = await fetch(data.signedUrl, { signal: AbortSignal.timeout(300000) });
  if (!response.ok || !response.body) {
    throw new Error(`Could not download source for integrity verification (HTTP ${response.status}).`);
  }

  const sourcePath = join(tmpdir(), `cloudinary-migration-${process.pid}-${randomUUID()}`);
  const hash = createHash('sha256');
  let bytes = 0;
  const hashStream = new Transform({
    transform(chunk, _encoding, callback) {
      hash.update(chunk);
      bytes += chunk.length;
      callback(null, chunk);
    },
  });

  try {
    await pipeline(
      Readable.fromWeb(response.body),
      hashStream,
      createWriteStream(sourcePath, { flags: 'wx' }),
    );
    if (bytes !== file.size) {
      throw new Error(`Source size changed: expected ${file.size} bytes, downloaded ${bytes}.`);
    }

    const digest = hash.digest('hex');
    if (file.source_sha256 && file.source_sha256 !== digest) {
      throw new Error('Source SHA-256 differs from the checksum recorded by an earlier run.');
    }
    file.source_sha256 = digest;
    file.source_size = bytes;

    if (file.resource_type === 'image') {
      const metadata = await sharp(sourcePath, { failOn: 'error' }).metadata();
      if (!Number.isSafeInteger(metadata.width) || !Number.isSafeInteger(metadata.height) ||
        metadata.width < 1 || metadata.height < 1 || !metadata.format) {
        throw new Error('Could not read source image dimensions and format.');
      }
      const acceptedSourceFormats = {
        jpg: ['jpeg'],
        jpeg: ['jpeg'],
        png: ['png'],
        webp: ['webp'],
        heic: ['heif', 'heic'],
      };
      if (!acceptedSourceFormats[file.format]?.includes(metadata.format)) {
        throw new Error(`Source image format mismatch: expected ${file.format}, read ${metadata.format}.`);
      }
      file.source_width = metadata.width;
      file.source_height = metadata.height;
      file.source_format = metadata.format;
    }

    if (file.resource_type === 'video' && file.source_width && file.source_height) {
      file.source_format = file.format;
    }
    return sourcePath;
  } catch (error) {
    await rm(sourcePath, { force: true });
    throw error;
  }
}

function mapReferences(files, rows) {
  const refsByKey = new Map();
  const fileSet = new Set(files.map((file) => sourceKey(file.bucket, file.path)));
  for (const row of rows) {
    for (const ref of row.refs) {
      const key = sourceKey(ref.bucket, ref.path);
      if (!refsByKey.has(key)) refsByKey.set(key, []);
      refsByKey.get(key).push({
        ...row,
        oldUrl: ref.oldUrl,
        bucket: ref.bucket,
        path: ref.path,
        sortOrder: ref.sortOrder,
      });
    }
  }
  const missing = [...refsByKey.keys()].filter((key) => !fileSet.has(key));
  return { refsByKey, missing };
}

function getManifestItem(existing, file, references, supabaseUrl, cloudName) {
  const key = sourceKey(file.bucket, file.path);
  const old = existing.get(key);
  const type = getKnownType(file);
  const target = old?.target_public_id
    ? {
      entity: old.entity,
      entityId: old.entity_id,
      publicId: resourcePublicId(old.target_public_id, type?.format || old.format, type?.resourceType || old.resource_type),
      url: old.new_url || `(Cloudinary URL after upload: ${old.target_public_id})`,
    }
    : getObjectTarget({ ...file, ...(type || {}) }, references, cloudName);
  return {
    source_bucket: file.bucket,
    source_path: file.path,
    original_url: makePublicSourceUrl(supabaseUrl, file.bucket, file.path),
    size: file.size,
    content_type: file.contentType,
    resource_type: type?.resourceType || old?.resource_type || 'unresolved',
    format: type?.format || old?.format || null,
    target_public_id: resourcePublicId(target.publicId, type?.format || old?.format, type?.resourceType || old?.resource_type),
    entity: target.entity,
    entity_id: target.entityId,
    new_url: old?.new_url || target.url,
    status: old?.status || 'pending',
    error: old?.error || null,
    references: references.map((ref) => ({
      table: ref.table,
      row_id: String(ref.rowId),
      column: ref.column,
      old_url: ref.oldUrl || makePublicSourceUrl(supabaseUrl, file.bucket, file.path),
      sort_order: ref.sortOrder || 0,
      alt_text: `${ref.entityLabel || target.entity} ${file.resourceType === 'video' ? 'video' : file.resourceType === 'raw' ? 'document' : 'image'} ${(ref.sortOrder || 0) + 1}`,
    })),
    ...(old?.upload_response ? { upload_response: old.upload_response } : {}),
    ...(old?.uploaded_at ? { uploaded_at: old.uploaded_at } : {}),
    ...(old?.verified_at ? { verified_at: old.verified_at } : {}),
    ...((file.source_width || file.sourceWidth || old?.source_width)
      ? { source_width: file.source_width || file.sourceWidth || old.source_width }
      : {}),
    ...((file.source_height || file.sourceHeight || old?.source_height)
      ? { source_height: file.source_height || file.sourceHeight || old.source_height }
      : {}),
    ...((file.source_sha256 || old?.source_sha256)
      ? { source_sha256: file.source_sha256 || old.source_sha256 }
      : {}),
    ...((file.source_size || old?.source_size)
      ? { source_size: file.source_size || old.source_size }
      : {}),
    ...((file.source_format || old?.source_format)
      ? { source_format: file.source_format || old.source_format }
      : {}),
  };
}

async function readExistingManifest() {
  try {
    const parsed = JSON.parse(await readFile(MANIFEST_PATH, 'utf8'));
    return new Map((parsed.files || []).map((item) => [
      sourceKey(item.source_bucket, item.source_path),
      item,
    ]));
  } catch (error) {
    if (error.code === 'ENOENT') return new Map();
    throw new Error(`Existing manifest is invalid: ${error.message}`);
  }
}

async function persistManifest(items, context) {
  await mkdir(MIGRATION_DIR, { recursive: true });
  const payload = {
    version: 1,
    updated_at: new Date().toISOString(),
    supabase_project: new URL(context.supabaseUrl).host,
    cloud_name: context.cloudName || null,
    files: items,
  };
  const tempPath = `${MANIFEST_PATH}.${process.pid}.${randomUUID()}.tmp`;
  await writeFile(tempPath, `${JSON.stringify(payload, null, 2)}\n`, { flag: 'w' });
  try {
    await rename(tempPath, MANIFEST_PATH);
  } catch (error) {
    if (!['EPERM', 'EEXIST'].includes(error.code) || !existsSync(MANIFEST_PATH)) {
      throw error;
    }
    const backupPath = `${MANIFEST_PATH}.${process.pid}.${randomUUID()}.bak`;
    await copyFile(MANIFEST_PATH, backupPath);
    await rm(MANIFEST_PATH, { force: true });
    try {
      await rename(tempPath, MANIFEST_PATH);
    } catch (replaceError) {
      await copyFile(backupPath, MANIFEST_PATH);
      throw replaceError;
    } finally {
      await rm(backupPath, { force: true });
    }
  }
}

async function persistArchivePlan(files) {
  const plan = {
    generated_at: new Date().toISOString(),
    purpose: 'Unreferenced Supabase Storage objects excluded from Cloudinary migration.',
    object_count: files.length,
    total_bytes: files.reduce((sum, file) => sum + file.size, 0),
    files: files.map((file) => ({
      source_bucket: file.source_bucket,
      source_path: file.source_path,
      size: file.size,
      content_type: file.content_type,
    })),
  };
  const path = join(MIGRATION_DIR, 'archive-plan.json');
  await writeFile(path, `${JSON.stringify(plan, null, 2)}\n`, { flag: 'w' });
  return path;
}

function queueManifestSave(items, context) {
  const write = manifestWrite.then(() => persistManifest(items, context));
  manifestWrite = write.catch((error) => {
    log(`Manifest save failed: ${error.message}`);
  });
  return write;
}

function resourcePublicId(publicId, format, resourceType) {
  const withoutExtension = resourceType === 'raw' && format
    ? publicId.replace(new RegExp(`\\.${format.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'), '')
    : publicId;
  return withoutExtension
    .split('/')
    .filter(Boolean)
    .map((segment) => segment.replace(/[^a-zA-Z0-9_-]/g, '-'))
    .join('/');
}

function cloudinaryDeliveryUrl(cloudName, resourceType, publicId, format = '') {
  const encodedPublicId = publicId.split('/').map(encodeURIComponent).join('/');
  if (resourceType === 'raw') {
    return `https://res.cloudinary.com/${cloudName}/raw/upload/${encodedPublicId}${format ? `.${encodeURIComponent(format)}` : ''}`;
  }
  const transform = resourceType === 'image'
    ? 'f_auto,q_auto,w_1200,c_limit'
    : 'f_auto,q_auto,w_2000,c_limit';
  return `https://res.cloudinary.com/${cloudName}/${resourceType}/upload/${transform}/${encodedPublicId}`;
}

function signCloudinaryParams(params, secret) {
  const serialized = Object.keys(params)
    .filter((key) => params[key] !== undefined && params[key] !== null && params[key] !== '')
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');
  return createHash('sha1').update(`${serialized}${secret}`).digest('hex');
}

function cloudinaryParams(file, targetPublicId) {
  const timestamp = Math.floor(Date.now() / 1000);
  const params = {
    folder: `${file.entity}/${file.entity_id}`,
    overwrite: 'false',
    public_id: targetPublicId.split('/').slice(2).join('/'),
    timestamp: String(timestamp),
    unique_filename: 'false',
    use_filename: 'false',
  };
  if (file.format !== 'pdf' && file.resource_type !== 'raw') {
    params.allowed_formats = file.resource_type === 'image' ? 'jpg,jpeg,png,webp,heic' : 'mp4,mov';
    params.transformation = CLOUDINARY_TRANSFORM[file.resource_type];
  }
  if (file.format === 'pdf') {
    delete params.allowed_formats;
    delete params.transformation;
  }
  return { params, timestamp };
}

function appendParams(form, params) {
  for (const [key, value] of Object.entries(params)) form.append(key, String(value));
}

function retryDelay(response, attempt) {
  const retryAfter = Number(response?.headers?.get('retry-after'));
  if (Number.isFinite(retryAfter) && retryAfter > 0) return Math.min(retryAfter * 1000, 30000);
  return Math.min(500 * (2 ** attempt), 15000);
}

async function requestWithBackoff(url, init, label) {
  let lastError;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      const response = await fetch(url, { ...init, signal: AbortSignal.timeout(120000) });
      if (response.status !== 429 && response.status < 500) return response;
      lastError = new Error(`${label} returned HTTP ${response.status}.`);
      if (attempt < 4) await new Promise((resolvePromise) => setTimeout(resolvePromise, retryDelay(response, attempt)));
    } catch (error) {
      lastError = error;
      if (attempt < 4) await new Promise((resolvePromise) => setTimeout(resolvePromise, 500 * (2 ** attempt)));
    }
  }
  throw lastError || new Error(`${label} failed after retries.`);
}

async function cloudinaryUpload(cloudName, apiKey, apiSecret, file, sourcePath) {
  const targetPublicId = resourcePublicId(file.target_public_id, file.format, file.resource_type);
  const resourceTypes = file.format === 'pdf' ? ['image', 'raw'] : [file.resource_type];
  let lastError;

  for (const resourceType of resourceTypes) {
    const existing = await getExistingCloudinaryResource(
      cloudName, apiKey, apiSecret, resourceType, targetPublicId,
    );
    if (existing) return existing;

    const uploadFile = { ...file, resource_type: resourceType };
    const { params } = cloudinaryParams(uploadFile, targetPublicId);
    const signature = signCloudinaryParams(params, apiSecret);
    const apiUrl = `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/${resourceType}/upload`;
    try {
      if (resourceType === 'video' && file.source_size > UPLOAD_CHUNK_SIZE) {
        return await uploadChunked(
          apiUrl, params, apiKey, signature, sourcePath, file.source_size, targetPublicId,
        );
      }
      return await uploadSingle(
        apiUrl, params, apiKey, signature, sourcePath, targetPublicId,
      );
    } catch (error) {
      lastError = error;
      if (file.format !== 'pdf' || resourceType !== 'image') throw error;
      log(`Cloudinary image/PDF upload rejected: ${error.message}; trying raw/PDF.`);
    }
  }

  throw lastError || new Error('Cloudinary rejected the PDF upload.');
}

function redactSecrets(value) {
  let redacted = String(value);
  for (const secret of [
    process.env.CLOUDINARY_API_SECRET,
    process.env.CLOUDINARY_API_KEY,
  ]) {
    if (secret) redacted = redacted.split(secret).join('[REDACTED]');
  }
  return redacted;
}

async function readCloudinaryError(response) {
  const body = await response.text();
  let parsed;
  try {
    parsed = JSON.parse(body);
  } catch {
    parsed = null;
  }
  const message = parsed?.error?.message || body || `HTTP ${response.status}`;
  return redactSecrets(message);
}

async function uploadSingle(apiUrl, params, apiKey, signature, sourcePath, publicId) {
  const form = new FormData();
  form.append('file', new Blob([await readFile(sourcePath)]), basename(publicId));
  appendParams(form, params);
  form.append('api_key', apiKey);
  form.append('signature', signature);
  const response = await requestWithBackoff(
    apiUrl,
    { method: 'POST', body: form },
    'Cloudinary single upload',
  );
  const text = await response.text();
  let result;
  try {
    result = JSON.parse(text);
  } catch {
    result = {};
  }
  if (!response.ok) {
    const message = redactSecrets(result.error?.message || text || `HTTP ${response.status}`);
    throw new Error(`Cloudinary single upload returned HTTP ${response.status}: ${message}`);
  }
  return result;
}

async function uploadChunked(apiUrl, params, apiKey, signature, sourcePath, totalBytes, publicId) {
  const uploadId = randomUUID();
  let responseData = null;
  if (!Number.isSafeInteger(totalBytes) || totalBytes < 1) {
    throw new Error('Source file is empty or its size is invalid.');
  }
  const source = await open(sourcePath, 'r');
  try {
    for (let start = 0; start < totalBytes; start += UPLOAD_CHUNK_SIZE) {
      const end = Math.min(start + UPLOAD_CHUNK_SIZE, totalBytes) - 1;
      const chunk = Buffer.allocUnsafe(end - start + 1);
      const { bytesRead } = await source.read(chunk, 0, chunk.length, start);
      if (bytesRead !== chunk.length) throw new Error('Could not read a complete source upload chunk.');

      const form = new FormData();
      form.append('file', new Blob([chunk]), basename(publicId));
      appendParams(form, params);
      form.append('api_key', apiKey);
      form.append('signature', signature);
      const response = await requestWithBackoff(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Range': `bytes ${start}-${end}/${totalBytes}`,
          'X-Unique-Upload-Id': uploadId,
        },
        body: form,
      }, 'Cloudinary chunked upload');
      const responseText = await response.text();
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = {};
      }
      if (!response.ok) {
        const message = redactSecrets(responseData.error?.message || responseText || `HTTP ${response.status}`);
        throw new Error(`Cloudinary chunked upload returned HTTP ${response.status}: ${message}`);
      }
    }
  } finally {
    await source.close();
  }
  return responseData;
}

async function getExistingCloudinaryResource(cloudName, apiKey, apiSecret, resourceType, publicId) {
  const search = new URLSearchParams({ 'public_ids[]': publicId });
  const url = `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/resources/${resourceType}/upload?${search}`;
  const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
  try {
    const response = await fetch(url, {
      headers: { Authorization: `Basic ${auth}` },
      signal: AbortSignal.timeout(20000),
    });
    if (!response.ok) return null;
    const body = await response.json();
    return body.resources?.find((resource) => resource.public_id === publicId) || null;
  } catch (error) {
    log(`Cloudinary resumable-asset lookup unavailable (${error.name || 'network error'}); attempting a chunked upload.`);
    return null;
  }
}

function expectedScaledDimensions(width, height) {
  const scale = Math.min(1, 2000 / width, 2000 / height);
  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  };
}

async function waitForCloudinaryDelivery(url, expectedType, isVideo = false) {
  const timeoutMs = isVideo ? 180000 : 30000;
  const deadline = Date.now() + timeoutMs;
  let delayMs = 1000;
  let lastState = 'no response';

  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        signal: AbortSignal.timeout(15000),
      });
      const contentType = (response.headers.get('content-type') || '').split(';')[0].toLowerCase();
      const contentTypeReady = isVideo ? contentType.startsWith('video/') : contentType === expectedType;
      if (response.status === 200 && contentTypeReady) {
        return { contentType, response };
      }
      lastState = `HTTP ${response.status}, content-type ${contentType || 'missing'}`;
    } catch (error) {
      lastState = error.name || 'network error';
    }

    if (Date.now() + delayMs >= deadline) break;
    await new Promise((resolvePromise) => setTimeout(resolvePromise, delayMs));
    delayMs = Math.min(delayMs * 2, 15000);
  }

  throw new Error(
    `${isVideo ? 'Video processing/delivery' : 'Cloudinary delivery'} did not become ready within ${timeoutMs / 1000} seconds (${lastState}).`,
  );
}

async function verifyCloudinaryAsset(file) {
  const upload = file.upload_response;
  if (!upload?.secure_url || !Number.isSafeInteger(upload.bytes)) {
    throw new Error('Cloudinary upload response is missing the delivery URL or byte count.');
  }
  if (!/^[a-f0-9]{64}$/i.test(file.source_sha256 || '') ||
    !Number.isSafeInteger(file.source_size) || file.source_size !== file.size) {
    throw new Error('Source SHA-256 or downloaded source size is missing or invalid.');
  }
  if (file.format !== 'pdf' && upload.resource_type !== file.resource_type) {
    throw new Error(`Cloudinary resource type mismatch: expected ${file.resource_type}.`);
  }
  if (file.resource_type === 'image') {
    if (!Number.isSafeInteger(upload.width) || !Number.isSafeInteger(upload.height) ||
      upload.width < 1 || upload.height < 1 || upload.width > 2000 || upload.height > 2000 ||
      !Number.isSafeInteger(file.source_width) || !Number.isSafeInteger(file.source_height) ||
      !file.source_format) {
      throw new Error('Cloudinary image dimensions do not match the 2000px incoming limit.');
    }
    if (!['webp', 'jpg', 'jpeg', 'png', 'avif'].includes(String(upload.format).toLowerCase())) {
      throw new Error(`Cloudinary returned unsupported image format ${upload.format || '(missing)'}.`);
    }
    if (upload.bytes > file.source_size) {
      log(`WARNING: Cloudinary image output is larger than its source (${upload.bytes} > ${file.source_size} bytes): ${file.source_bucket}/${file.source_path}`);
    }
    const expected = expectedScaledDimensions(file.source_width, file.source_height);
    if (Math.abs(upload.width - expected.width) > 1 ||
      Math.abs(upload.height - expected.height) > 1) {
      throw new Error('Cloudinary image dimensions differ from the source image after 2000px scaling.');
    }
  }
  if (file.resource_type === 'video') {
    if (String(upload.format).toLowerCase() !== 'mp4' ||
      !Number.isSafeInteger(upload.width) || !Number.isSafeInteger(upload.height) ||
      upload.width < 1 || upload.height < 1 || upload.width > 2000 || upload.height > 2000) {
      throw new Error('Cloudinary video output does not match the MP4/2000px profile.');
    }
    if (upload.bytes > file.source_size * 1.25) {
      throw new Error('Transformed video is unexpectedly larger than its Supabase source.');
    }
    if (file.source_width && file.source_height) {
      const expected = expectedScaledDimensions(file.source_width, file.source_height);
      if (Math.abs(upload.width - expected.width) > 1 ||
        Math.abs(upload.height - expected.height) > 1) {
        throw new Error('Cloudinary video dimensions differ from the source metadata after 2000px scaling.');
      }
    }
  }
  if (file.format === 'pdf' &&
    (upload.bytes !== file.source_size || String(upload.format).toLowerCase() !== 'pdf' ||
      !['image', 'raw'].includes(upload.resource_type))) {
    throw new Error('Cloudinary raw-file byte count differs from the Supabase source.');
  }

  const expectedType = file.format === 'pdf'
    ? 'application/pdf'
    : getExpectedContentType(
      file.resource_type,
      file.resource_type === 'image' ? upload.format : file.format,
      file.content_type,
    );
  const { contentType } = await waitForCloudinaryDelivery(
    upload.secure_url,
    expectedType,
    file.resource_type === 'video',
  );
  file.verified_content_type = contentType;
  file.new_url = cloudinaryDeliveryUrl(
    process.env.CLOUDINARY_CLOUD_NAME,
    upload.resource_type,
    upload.public_id,
    upload.format,
  );
  return file;
}

function defaultAltText(entity, resourceType, index) {
  const label = entity.replaceAll('_', ' ');
  const type = resourceType === 'video' ? 'video' : resourceType === 'raw' ? 'document' : 'image';
  return `${label} ${type} ${index + 1}`;
}

function replaceValue(value, table, column, replacementMap, replacementRows) {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) {
    return value.map((entry) => replaceValue(entry, table, column, replacementMap, replacementRows));
  }
  if (typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [
      key,
      replaceValue(entry, table, column, replacementMap, replacementRows),
    ]));
  }
  if (typeof value !== 'string') return value;

  let changed = value;
  const urls = value.match(/https?:\/\/[^\s"'<>]+/g) || [];
  for (const raw of urls) {
    const parsed = parseStorageUrl(raw.replace(/[),.;]+$/u, ''));
    if (!parsed) continue;
    const replacement = replacementMap.get(sourceKey(parsed.bucket, parsed.path));
    if (!replacement) continue;
    const oldUrl = raw.replace(/[),.;]+$/u, '');
    changed = changed.replace(oldUrl, replacement.url);
    replacementRows.push({ ...replacement, oldUrl, table });
  }
  if (changed === value && !urls.length && isDirectMediaColumn(column)) {
    const parsed = parseBareStoragePath(value, table, column);
    if (parsed) {
      const replacement = replacementMap.get(sourceKey(parsed.bucket, parsed.path));
      if (replacement) {
        changed = replacement.url;
        replacementRows.push({
          ...replacement,
          oldUrl: makePublicSourceUrl(process.env.SUPABASE_URL, parsed.bucket, parsed.path),
          table,
        });
      }
    }
  }
  return changed;
}

function uniqueMappings(rows, fileByKey) {
  const mappings = new Map();
  const assets = new Map();
  for (const row of rows) {
    const file = fileByKey.get(sourceKey(row.bucket, row.path));
    if (!file) continue;
    const entity = entityForTable(row.table, file.source_bucket);
    const entityId = String(row.rowId);
    const key = `${row.oldUrl}\u0000${entity}\u0000${entityId}`;
    mappings.set(key, {
      old_url: row.oldUrl,
      new_public_id: file.upload_response.public_id,
      new_url: file.new_url,
      entity,
      entity_id: entityId,
      source_bucket: file.source_bucket,
      source_path: file.source_path,
    });
    const assetKey = `${entity}\u0000${entityId}\u0000${file.upload_response.public_id}`;
    const association = file.references.find((reference) =>
      reference.table === row.table && reference.row_id === entityId);
    assets.set(assetKey, {
      entity,
      entity_id: entityId,
      public_id: file.upload_response.public_id,
      resource_type: file.upload_response.resource_type,
      secure_url: file.upload_response.secure_url,
      width: file.upload_response.width ?? null,
      height: file.upload_response.height ?? null,
      bytes: file.upload_response.bytes,
      format: file.upload_response.format,
      duration: file.upload_response.duration ?? null,
      sort_order: association?.sort_order || 0,
      alt_text: association?.alt_text || defaultAltText(entity, file.resource_type, 0),
      source_bucket: file.source_bucket,
      source_path: file.source_path,
    });
  }
  return { mappings: [...mappings.values()], assets: [...assets.values()] };
}

async function fetchRowsForUpdate(supabase, tableNames) {
  const { SUPABASE_URL: supabaseUrl, SUPABASE_SERVICE_ROLE_KEY: key } = process.env;
  const response = await fetch(`${supabaseUrl.replace(/\/+$/, '')}/rest/v1/`, {
    headers: { apikey: key, authorization: `Bearer ${key}` },
  });
  if (!response.ok) throw new Error(`Could not inspect database schema for update (HTTP ${response.status}).`);
  const schema = await response.json();
  const rows = [];
  for (const table of tableNames) {
    const definition = schema.definitions?.[table];
    if (!definition) throw new Error(`Database table ${table} is no longer exposed in the public schema.`);
    const columns = Object.keys(definition.properties || {}).filter(tableHasMediaColumn);
    for (let offset = 0; ; offset += 300) {
      const { data, error } = await supabase.from(table).select([...new Set(['id', ...columns])].join(',')).range(offset, offset + 299);
      if (error) throw new Error(`Could not re-read ${table} before updates (${error.code || 'query failed'}).`);
      for (const row of data || []) rows.push({ table, row });
      if ((data || []).length < 300) break;
    }
  }
  return rows;
}

async function buildDbChanges(supabase, files) {
  const replacementMap = new Map();
  const fileByKey = new Map();
  const targetTables = new Set();
  for (const file of files) {
    if (!['verified', 'db_updated'].includes(file.status) || !file.upload_response) continue;
    const key = sourceKey(file.source_bucket, file.source_path);
    replacementMap.set(key, {
      url: file.new_url,
      publicId: file.upload_response.public_id,
      file,
      bucket: file.source_bucket,
      path: file.source_path,
    });
    fileByKey.set(key, file);
    for (const reference of file.references) targetTables.add(reference.table);
  }
  if (!targetTables.size) return [];

  const freshRows = await fetchRowsForUpdate(supabase, targetTables);
  const changes = [];
  for (const { table, row } of freshRows) {
    const mediaColumns = Object.keys(row).filter((column) => tableHasMediaColumn(column));
    for (const column of mediaColumns) {
      const references = [];
      const newValue = replaceValue(row[column], table, column, replacementMap, references);
      if (JSON.stringify(newValue) === JSON.stringify(row[column])) continue;
      const rowMappings = uniqueMappings(
        references.map((reference) => ({
          ...reference,
          rowId: row.id,
          oldUrl: reference.oldUrl,
        })),
        fileByKey,
      );
      changes.push({
        table_name: table,
        row_id: String(row.id),
        column_name: column,
        old_value: row[column],
        new_value: newValue,
        maps: rowMappings.mappings,
        assets: rowMappings.assets,
      });
    }
  }
  return changes;
}

async function createBackup(changes) {
  await mkdir(MIGRATION_DIR, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = join(MIGRATION_DIR, `db-backup-${timestamp}.json`);
  const payload = {
    created_at: new Date().toISOString(),
    values: changes.map((change) => ({
      table: change.table_name,
      row_id: change.row_id,
      column: change.column_name,
      old_value: change.old_value,
      new_value: change.new_value,
      maps: change.maps,
      assets: change.assets,
    })),
  };
  await writeFile(backupPath, `${JSON.stringify(payload, null, 2)}\n`, { flag: 'wx' });
  return backupPath;
}

async function runDbBatches(supabase, changes, rollback = false) {
  for (let index = 0; index < changes.length; index += DB_BATCH_SIZE) {
    const batch = changes.slice(index, index + DB_BATCH_SIZE);
    const { data, error } = await supabase.rpc('apply_media_migration_batch', {
      p_changes: batch,
      p_rollback: rollback,
    });
    if (error) {
      throw new Error(`Database batch ${Math.floor(index / DB_BATCH_SIZE) + 1} failed (${error.code || 'RPC error'}).`);
    }
    if (!Number.isSafeInteger(data) || data !== batch.length) {
      throw new Error(`Database batch ${Math.floor(index / DB_BATCH_SIZE) + 1} applied ${data} of ${batch.length} rows.`);
    }
  }
}

async function performRollback(supabase, options) {
  const backupPath = options.backup
    ? resolve(APP_DIR, options.backup)
    : await findLatestBackup();
  if (!backupPath) throw new Error('No database backup file was found.');
  const backup = JSON.parse(await readFile(backupPath, 'utf8'));
  if (!Array.isArray(backup.values) || backup.values.length === 0) {
    throw new Error(`Backup contains no restorable values: ${backupPath}`);
  }
  const changes = backup.values.map((item) => ({
    table_name: item.table,
    row_id: String(item.row_id),
    column_name: item.column,
    old_value: item.old_value,
    new_value: item.new_value,
    maps: item.maps || [],
    assets: item.assets || [],
  }));
  log(`ROLLBACK: restoring ${changes.length} database fields from ${backupPath}`);
  await runDbBatches(supabase, changes, true);
  log('Rollback complete. Cloudinary assets and Supabase source files were not deleted.');
}

async function findLatestBackup() {
  const { readdir } = await import('node:fs/promises');
  let files = [];
  try {
    files = await readdir(MIGRATION_DIR);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    return null;
  }
  const latest = files.filter((file) => /^db-backup-.*\.json$/.test(file)).sort().at(-1);
  return latest ? join(MIGRATION_DIR, latest) : null;
}

async function performManualSourceDeletion(supabase, manifest) {
  const eligible = manifest.files.filter((file) =>
    ['verified', 'db_updated'].includes(file.status) &&
    file.verified_at &&
    Date.now() - new Date(file.verified_at).getTime() >= MAX_CLEANUP_AGE_DAYS * 24 * 60 * 60 * 1000,
  );
  if (!eligible.length) {
    throw new Error('No files have been verified for at least 14 days; nothing was deleted.');
  }
  if (eligible.length !== manifest.files.length) {
    throw new Error('Refusing source deletion: the manifest contains unverified files or files verified less than 14 days ago.');
  }
  log('DANGEROUS MANUAL OPERATION: deleting Supabase originals after 14+ clean days.');
  for (const file of eligible) {
    await verifyCloudinaryAsset(file);
    const { error } = await supabase.storage.from(file.source_bucket).remove([file.source_path]);
    if (error) throw new Error(`Source deletion failed for ${file.source_bucket}/${file.source_path} (${error.statusCode || error.name}).`);
    file.source_deleted_at = new Date().toISOString();
    await queueManifestSave(manifest.files, manifest.context);
    log(`SOURCE DELETED ${file.source_bucket}/${file.source_path}`);
  }
}

async function getCurrentCloudinaryStorage(cloudName, apiKey, apiSecret) {
  const url = `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/usage`;
  const authorization = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
  const response = await requestWithBackoff(url, {
    headers: { Authorization: `Basic ${authorization}` },
  }, 'Cloudinary usage query');
  if (!response.ok) throw new Error(`Cloudinary usage query returned HTTP ${response.status}.`);
  const usage = await response.json();
  const currentStorage = Number(usage.storage?.usage);
  if (!Number.isFinite(currentStorage) || currentStorage < 0) {
    throw new Error('Cloudinary usage response did not include a reliable current storage total; refusing to estimate capacity.');
  }
  return currentStorage;
}

async function warnStorageBudget(cloudName, apiKey, apiSecret, files) {
  const currentStorage = await getCurrentCloudinaryStorage(cloudName, apiKey, apiSecret);
  const sourceBytes = files.reduce((sum, file) => sum + file.size, 0);
  const projectedBytes = files.reduce(
    (sum, file) => sum + file.size * (file.resource_type === 'image' ? 4 : 1),
    0,
  );
  const projectedTotal = currentStorage + projectedBytes;
  if (projectedTotal >= STORAGE_WARN_AT * STORAGE_BUDGET_BYTES) {
    throw new Error(
      `Estimated Cloudinary storage would reach ${(projectedTotal / 1024 ** 3).toFixed(2)} GiB. ` +
      `This is at least ${Math.round(STORAGE_WARN_AT * 100)}% of the approximate storage-only ceiling (25 credits treated as 25 GiB); no files were uploaded.`,
    );
  }
  log(`Storage check: current ${(currentStorage / 1024 ** 3).toFixed(3)} GiB; source bytes selected ${(sourceBytes / 1024 ** 3).toFixed(3)} GiB; ` +
    `projected ${(projectedTotal / 1024 ** 3).toFixed(3)} GiB after a conservative 4x image-derivative allowance. 25 credits are not a storage-only quota; delivery bandwidth/transforms also consume credits.`);
}

async function processFile(file, supabase, context, items) {
  if (stopRequested) return;
  if (['db_updated', 'verified'].includes(file.status)) return;
  if (file.resource_type === 'unresolved') {
    file.status = 'failed';
    file.error = 'Could not determine the object resource type from metadata, filename, or file signature.';
    await queueManifestSave(items, context);
    log(`FAILED ${file.source_bucket}/${file.source_path}: ${file.error}`);
    return;
  }

  let sourcePath;
  try {
    sourcePath = await downloadAndHashSource(supabase, file);
    await queueManifestSave(items, context);

    if (!file.upload_response) {
      const result = await cloudinaryUpload(
        context.cloudName,
        context.apiKey,
        context.apiSecret,
        file,
        sourcePath,
      );
      file.upload_response = {
        public_id: result.public_id,
        secure_url: result.secure_url,
        resource_type: result.resource_type,
        format: result.format,
        bytes: result.bytes,
        width: result.width,
        height: result.height,
        duration: result.duration,
        version: result.version,
      };
      file.status = 'uploaded';
      file.uploaded_at = new Date().toISOString();
      file.error = null;
      await queueManifestSave(items, context);
      log(`UPLOADED ${file.source_bucket}/${file.source_path} -> ${file.upload_response.public_id}`);
    }

    await verifyCloudinaryAsset(file);
    file.status = 'verified';
    file.verified_at = new Date().toISOString();
    file.error = null;
    await queueManifestSave(items, context);
    log(`VERIFIED ${file.source_bucket}/${file.source_path} (${file.upload_response.bytes} bytes, ${file.verified_content_type})`);
  } catch (error) {
    file.status = 'failed';
    file.error = error.message;
    await queueManifestSave(items, context);
    log(`FAILED ${file.source_bucket}/${file.source_path}: ${error.message}`);
  } finally {
    if (sourcePath) await rm(sourcePath, { force: true });
  }
}

async function runWithConcurrency(files, concurrency, callback) {
  let nextIndex = 0;
  await Promise.all(Array.from({ length: Math.min(concurrency, files.length) }, async () => {
    while (!stopRequested) {
      const index = nextIndex;
      nextIndex += 1;
      if (index >= files.length) return;
      await callback(files[index]);
    }
  }));
}

function printPlan(items) {
  for (const file of items) {
    log(`FILE ${file.source_bucket}/${file.source_path} | ${file.size} bytes | ${file.content_type} | ${file.resource_type} | ${file.target_public_id} | ${file.status}`);
    for (const reference of file.references) {
      log(`  DB ${reference.table} id=${reference.row_id} column=${reference.column}`);
    }
  }
  const summary = {
    files: items.length,
    by_status: {},
    by_bucket: {},
    bytes: items.reduce((sum, file) => sum + file.size, 0),
    database_references: items.reduce((sum, file) => sum + file.references.length, 0),
  };
  for (const file of items) {
    summary.by_status[file.status] = (summary.by_status[file.status] || 0) + 1;
    if (!summary.by_bucket[file.source_bucket]) summary.by_bucket[file.source_bucket] = { files: 0, bytes: 0 };
    summary.by_bucket[file.source_bucket].files += 1;
    summary.by_bucket[file.source_bucket].bytes += file.size;
  }
  log(`SUMMARY ${JSON.stringify(summary)}`);
  return summary;
}

async function main() {
  loadEnvFile();
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the environment or Apps/web/.env.');
  }
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  if (options.rollback) {
    await performRollback(supabase, options);
    return;
  }

  let logPath = null;
  if (options.execute) {
    if (!process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      throw new Error('CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are required for --execute.');
    }
    await mkdir(MIGRATION_DIR, { recursive: true });
    logPath = join(MIGRATION_DIR, `log-${new Date().toISOString().replace(/[:.]/g, '-')}.txt`);
    logStream = (await import('node:fs')).createWriteStream(logPath, { flags: 'wx' });
    process.on('SIGINT', () => {
      stopRequested = true;
      log('Ctrl-C received; stopping new uploads and saving completed manifest state.');
    });
  }

  const existingManifest = await readExistingManifest();
  const files = await listFiles(supabase);
  const dbRows = await listMediaRows(supabase);
  const { refsByKey, missing } = mapReferences(files, dbRows);
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || '';
  const planned = [];

  for (const file of files) {
    let type = getKnownType(file);
    if (!type && file.contentType === 'application/octet-stream') {
      try {
        type = expectedUploadType(file, await readSourceSignature(supabase, file));
      } catch (error) {
        type = null;
        file.typeError = error.message;
      }
    }
    const refs = refsByKey.get(sourceKey(file.bucket, file.path)) || [];
    const manifestItem = getManifestItem(existingManifest, {
      ...file,
      ...(type || {}),
    }, refs, supabaseUrl, cloudName);
    manifestItem.resource_type = type?.resourceType || 'unresolved';
    manifestItem.format = type?.format || null;
    manifestItem.expected_content_type = type
      ? getExpectedContentType(type.resourceType, type.format, type.contentType)
      : null;
    if (file.typeError) manifestItem.error = file.typeError;
    planned.push(manifestItem);
  }

  if (missing.length) {
    log(`WARNING: ${missing.length} database storage references do not resolve to a listed bucket object.`);
    for (const key of missing) {
      log(`MISSING_SOURCE ${key}`);
      for (const reference of refsByKey.get(key) || []) {
        const label = reference.entityLabel ? ` label=${JSON.stringify(reference.entityLabel)}` : '';
        log(`  MISSING_REFERENCE ${reference.table} id=${reference.rowId} column=${reference.column}${label}`);
      }
    }
  }

  const unreferenced = planned.filter((file) =>
    file.references.length === 0 && !['verified', 'db_updated'].includes(file.status));
  log(`UNREFERENCED_ARCHIVE_PLAN count=${unreferenced.length} source_bytes=${unreferenced.reduce((sum, file) => sum + file.size, 0)}`);
  for (const file of unreferenced) {
    log(`ARCHIVE_ONLY ${file.source_bucket}/${file.source_path} | ${file.size} bytes`);
  }

  const referenced = planned.filter((file) => file.references.length > 0);
  const bucketFiltered = options.onlyBuckets
    ? referenced.filter((file) => options.onlyBuckets.has(file.source_bucket))
    : referenced;
  const typeFiltered = options.onlyType
    ? bucketFiltered.filter((file) =>
      (file.format === 'pdf' ? 'pdf' : file.resource_type) === options.onlyType)
    : bucketFiltered;
  const tableFiltered = options.onlyTable
    ? typeFiltered.filter((file) => file.references.some((reference) => reference.table === options.onlyTable))
    : typeFiltered;
  const outstanding = tableFiltered.filter((file) => !['verified', 'db_updated'].includes(file.status));
  const selected = options.limit ? outstanding.slice(0, options.limit) : outstanding;
  if (!selected.length) {
    throw new Error('No storage files match the selected migration scope.');
  }
  for (const file of selected) {
    const type = file.format === 'pdf' ? 'pdf' : file.resource_type;
    if (options.excludeTypes.has(type) && !['db_updated', 'verified'].includes(file.status)) {
      file.status = 'skipped_excluded_type';
      file.error = `Excluded by --exclude-types ${type}; deferred until after Phase B.`;
    } else if (type === 'pdf' && file.status === 'skipped_excluded_type') {
      file.status = 'pending';
      file.error = null;
    }
  }

  const context = {
    supabaseUrl,
    cloudName,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  };
  const manifestFiles = [...referenced];
  const manifestKeys = new Set(manifestFiles.map((file) =>
    sourceKey(file.source_bucket, file.source_path)));
  for (const file of planned) {
    const key = sourceKey(file.source_bucket, file.source_path);
    if (!manifestKeys.has(key) && ['verified', 'db_updated'].includes(file.status)) {
      manifestFiles.push(file);
      manifestKeys.add(key);
    }
  }
  const manifest = { files: manifestFiles, context };
  if (options.deleteSourceVerified) {
    if (!existsSync(MANIFEST_PATH)) throw new Error('No migration manifest exists.');
    if (manifestFiles.length !== planned.length) throw new Error('Source deletion requires the complete manifest.');
    await performManualSourceDeletion(supabase, manifest);
    return;
  }

  if (!options.execute) {
    log('DRY-RUN — no files or database values will be written');
    printPlan(selected);
    log(`Dry-run complete. No manifest, backup, log, database row, or storage object was changed.`);
    return;
  }

  log('EXECUTION PLAN');
  printPlan(selected);
  const archivePlanPath = await persistArchivePlan(unreferenced);
  log(`ARCHIVE PLAN SAVED (no source objects copied): ${archivePlanPath}`);

  const uploadable = selected.filter((file) =>
    !['db_updated', 'verified'].includes(file.status) && !file.status.startsWith('skipped_'));
  if (uploadable.length) {
    await warnStorageBudget(context.cloudName, context.apiKey, context.apiSecret, uploadable);
  }
  await runWithConcurrency(uploadable, options.concurrency, (file) =>
    processFile(file, supabase, context, manifestFiles));
  await manifestWrite;

  const verified = manifestFiles.filter((file) => ['verified', 'db_updated'].includes(file.status));
  const changes = await buildDbChanges(supabase, verified);
  if (changes.length) {
    const backupPath = await createBackup(changes);
    log(`DATABASE BACKUP SAVED BEFORE WRITES: ${backupPath}`);
    await runDbBatches(supabase, changes);
    const changedTables = new Set(changes.map((change) => change.table_name));
    for (const file of verified) {
      if (file.references.some((reference) => changedTables.has(reference.table))) {
        file.status = 'db_updated';
      }
    }
    log(`DATABASE ROWS UPDATED: ${changes.length}`);
  }

  await queueManifestSave(manifestFiles, context);
  const final = printPlan(selected);
  log(`FINAL ${JSON.stringify({
    total_files: selected.length,
    uploaded: selected.filter((file) => file.upload_response).length,
    verified: selected.filter((file) => ['verified', 'db_updated'].includes(file.status)).length,
    db_fields_updated: changes.length,
    failed: selected.filter((file) => file.status === 'failed').length,
    skipped: selected.filter((file) => file.status.startsWith('skipped_')).length +
      selected.filter((file) => ['verified', 'db_updated'].includes(file.status) && !uploadable.includes(file)).length,
    total_source_bytes: final.bytes,
    manifest: MANIFEST_PATH,
    archive_plan: archivePlanPath,
    log: logPath,
  })}`);
  await manifestWrite;
  await closeLogStream();
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  main().catch(async (error) => {
    log(`Media migration stopped: ${error.message}`);
    await closeLogStream();
    process.exitCode = 1;
  });
}

export {
  cloudinaryDeliveryUrl,
  deterministicUuid,
  detectFileSignature,
  parseStorageUrl,
  signCloudinaryParams,
};
