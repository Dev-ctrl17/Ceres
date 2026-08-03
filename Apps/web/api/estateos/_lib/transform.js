// ============================================================
// EstateOS API — Property transform module
//
// Maps a Supabase `properties` row into the exact EstateOS
// response shape. All image URLs are normalized to absolute
// HTTPS URLs. Status values are normalized to the EstateOS enum.
// ============================================================

// EstateOS status enum
export const ESTATEOS_STATUSES = ['DRAFT', 'PRIVATE', 'ACTIVE', 'SOLD', 'RENTED', 'ARCHIVED'];

// Fallback absolute site URL used to resolve relative image paths
const DEFAULT_ORIGIN = 'https://luxurypropertiesltd.com.ng';

/**
 * Normalize a legacy / free-text status into the EstateOS status enum.
 * @param {string|undefined|null} status
 * @returns {string} One of ESTATEOS_STATUSES
 */
export function normalizeStatus(status) {
  if (!status) return 'DRAFT';

  const s = String(status).trim().toUpperCase();

  // Exact matches
  if (ESTATEOS_STATUSES.includes(s)) return s;

  // Common legacy values
  const map = {
    AVAILABLE: 'ACTIVE',
    'FOR SALE': 'ACTIVE',
    'FOR RENT': 'ACTIVE',
    'FOR LEASE': 'ACTIVE',
    ACTIVE: 'ACTIVE',
    PUBLISHED: 'ACTIVE',
    DRAFT: 'DRAFT',
    HIDDEN: 'PRIVATE',
    PRIVATE: 'PRIVATE',
    UNLISTED: 'PRIVATE',
    'OFF MARKET': 'PRIVATE',
    'SOLD OUT': 'SOLD',
    SOLD: 'SOLD',
    LEASED: 'RENTED',
    RENTED: 'RENTED',
    'UNDER CONTRACT': 'ARCHIVED',
    ARCHIVED: 'ARCHIVED',
    PENDING: 'DRAFT',
    INACTIVE: 'ARCHIVED',
    DELETED: 'ARCHIVED',
  };

  return map[s] || 'DRAFT';
}

/**
 * Normalize a property type string.
 * @param {string|undefined|null} type
 * @returns {string}
 */
export function normalizeType(type) {
  if (!type) return 'unknown';
  const t = String(type).trim();
  if (!t) return 'unknown';
  return t.toLowerCase();
}

/**
 * Normalize amenities into a string array.
 * @param {string|string[]|object|undefined|null} amenities
 * @returns {string[]}
 */
export function normalizeAmenities(amenities) {
  if (!amenities) return [];

  if (Array.isArray(amenities)) {
    return amenities
      .map(a => typeof a === 'string' ? a.trim() : String(a ?? '').trim())
      .filter(Boolean);
  }

  if (typeof amenities === 'string') {
    return amenities
      .split(',')
      .map(a => a.trim())
      .filter(Boolean);
  }

  if (typeof amenities === 'object') {
    // JSONB object shape or array-like object
    try {
      return Object.values(amenities)
        .map(a => String(a ?? '').trim())
        .filter(Boolean);
    } catch {
      return [];
    }
  }

  return [];
}

/**
 * Normalize images into an array of absolute HTTPS URLs.
 *
 * Handles:
 *   - Array of URL strings
 *   - JSONB array of objects: [{ url: '...' }, { image_url: '...' }]
 *   - Relative paths like /images/photo.jpg -> https://.../images/photo.jpg
 *   - Supabase storage paths -> absolute public URLs
 *
 * @param {string[]|object[]|string|object|undefined|null} images
 * @param {string} origin - Base origin for resolving relative URLs
 * @returns {string[]}
 */
export function normalizeImages(images, origin = DEFAULT_ORIGIN) {
  if (!images) return [];

  let list = [];
  if (Array.isArray(images)) {
    list = images;
  } else if (typeof images === 'string') {
    list = images.split(',').map(s => s.trim()).filter(Boolean);
  } else if (typeof images === 'object') {
    // JSONB object
    try {
      list = Object.values(images);
    } catch {
      return [];
    }
  }

  const normalized = [];
  for (const item of list) {
    if (!item) continue;

    // Item may be a string or an object with url/image_url
    let raw = item;
    if (typeof item === 'object') {
      raw = item.url || item.image_url || item.src || item.path || '';
    }

    raw = String(raw).trim();
    if (!raw) continue;

    // Already absolute HTTPS
    if (raw.startsWith('https://')) {
      normalized.push(raw);
      continue;
    }

    // HTTP -> upgrade to HTTPS
    if (raw.startsWith('http://')) {
      normalized.push(`https://${raw.slice('http://'.length)}`);
      continue;
    }

    // Supabase storage path (e.g. properties/abc/photo.jpg)
    if (raw.includes('supabase') || raw.startsWith('storage/')) {
      normalized.push(`https://lrmljudwbzjawafuztwp.supabase.co/storage/v1/object/public/${raw.replace(/^\/+/, '')}`);
      continue;
    }

    // Relative path -> absolute HTTPS
    if (raw.startsWith('/')) {
      normalized.push(`${origin}${raw}`);
      continue;
    }

    // Protocol-relative URL
    if (raw.startsWith('//')) {
      normalized.push(`https:${raw}`);
      continue;
    }

    // Bare path (no leading slash)
    normalized.push(`${origin}/${raw.replace(/^\/+/, '')}`);
  }

  // De-duplicate while preserving order
  return [...new Set(normalized)];
}

/**
 * Normalize a price into a number.
 * @param {number|string|undefined|null} price
 * @returns {number}
 */
export function normalizePrice(price) {
  if (price === null || price === undefined || price === '') return 0;
  const num = Number(price);
  return Number.isFinite(num) ? num : 0;
}

/**
 * Normalize an integer field (bedrooms/bathrooms).
 * @param {number|string|undefined|null} value
 * @returns {number}
 */
export function normalizeInt(value) {
  if (value === null || value === undefined || value === '') return 0;
  const num = Number(value);
  if (!Number.isInteger(num)) return 0;
  return Math.max(0, num);
}

/**
 * Build the full property address string from available fields.
 * @param {object} p - The Supabase property row
 * @returns {string}
 */
export function buildAddress(p) {
  const parts = [
    p.address,
    p.streetAddress,
    p.location,
    p.city,
    p.state,
  ].filter(Boolean);

  // Deduplicate while preserving order
  return [...new Set(parts)].join(', ');
}

/**
 * Extract the updatedAt timestamp from a property row.
 * @param {object} p
 * @returns {string} ISO-8601 string
 */
export function getUpdatedAt(p) {
  const ts = p.updatedAt || p.updated_at || p.created_at || new Date().toISOString();
  if (ts instanceof Date) return ts.toISOString();
  const d = new Date(ts);
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

/**
 * Transform a raw Supabase property row into the EstateOS API shape.
 * @param {object} p - Raw property row
 * @param {object} options
 * @param {string} [options.origin] - Base origin for resolving relative media URLs
 * @returns {object} EstateOS property object
 */
export function transformProperty(p, { origin = DEFAULT_ORIGIN } = {}) {
  if (!p || typeof p !== 'object') return null;

  return {
    id: String(p.id || ''), // stable UUID — never changes
    title: String(p.title || ''),
    address: buildAddress(p),
    type: normalizeType(p.property_type || p.type || p.propertyType),
    status: normalizeStatus(p.status || p.propertyStatus),
    price: normalizePrice(p.price),
    currency: String(p.currency || 'NGN').toUpperCase(),
    bedrooms: normalizeInt(p.bedrooms),
    bathrooms: normalizeInt(p.bathrooms),
    images: normalizeImages(p.images || p.image_url, origin),
    amenities: normalizeAmenities(p.amenities),
    updatedAt: getUpdatedAt(p),
  };
}

/**
 * Transform an array of property rows.
 * @param {object[]} rows
 * @param {object} options
 * @returns {object[]}
 */
export function transformProperties(rows, options = {}) {
  if (!Array.isArray(rows)) return [];
  return rows
    .map(row => transformProperty(row, options))
    .filter(Boolean);
}