import { toCdnUrl } from './imageUrl.js';

const DEFAULT_SITE_URL = 'https://www.luxurypropertiesltd.com.ng';

export const SITE_URL = (() => {
  const mode = typeof import.meta !== 'undefined' ? import.meta.env?.MODE : 'development';
  const envSiteUrl = typeof import.meta !== 'undefined' ? (import.meta.env?.VITE_SITE_URL || '') : '';
  const processSiteUrl = typeof process !== 'undefined' && process.env ? (process.env.SITE_URL || process.env.VITE_SITE_URL || '') : '';
  const configured = (envSiteUrl || processSiteUrl || (mode === 'production' ? '' : DEFAULT_SITE_URL) || DEFAULT_SITE_URL).trim();

  if (!configured) {
    throw new Error('SITE_URL is required. Set VITE_SITE_URL or SITE_URL to https://www.luxurypropertiesltd.com.ng');
  }

  if (/localhost|127\.0\.0\.1|0\.0\.0\.0/.test(configured)) {
    throw new Error(`SITE_URL must not contain a loopback host in production: ${configured}`);
  }

  return configured.replace(/\/$/, '');
})();

export function buildAbsoluteUrl(path = '/') {
  return getCanonicalUrl(path);
}

export function getCanonicalUrl(path = '/') {
  const safePath = path === undefined || path === null || path === '' ? '/' : String(path);
  const parsed = new URL(safePath, DEFAULT_SITE_URL);
  const normalizedPath = parsed.pathname === '/' ? '/' : parsed.pathname.replace(/\/+$/, '');
  return `${DEFAULT_SITE_URL}${normalizedPath}`;
}

function decodeHtmlEntities(value) {
  const entities = {
    amp: '&',
    apos: "'",
    gt: '>',
    lt: '<',
    nbsp: ' ',
    quot: '"',
    rsquo: '\u2019',
    lsquo: '\u2018',
    rdquo: '\u201d',
    ldquo: '\u201c',
    ndash: '\u2013',
    mdash: '\u2014',
    hellip: '\u2026',
  };
  return String(value || '').replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (entity, value) => {
    if (value[0] === '#') {
      const codePoint = value[1].toLowerCase() === 'x'
        ? Number.parseInt(value.slice(2), 16)
        : Number.parseInt(value.slice(1), 10);
      return Number.isFinite(codePoint) && codePoint > 0 && codePoint <= 0x10ffff
        ? String.fromCodePoint(codePoint)
        : entity;
    }
    return entities[value.toLowerCase()] ?? entity;
  });
}

function trimAtWordBoundary(value, maxLength) {
  if (value.length <= maxLength) return value;
  const prefix = value.slice(0, Math.max(1, maxLength)).trimEnd();
  const boundary = prefix.lastIndexOf(' ');
  return (boundary > 0 ? prefix.slice(0, boundary) : prefix)
    .replace(/[\s.,;:!?&–—-]+$/u, '')
    .trimEnd();
}

export function buildSeoTitle(title, maxLength = 60) {
  let clean = decodeHtmlEntities(title)
    .replace(/\p{Extended_Pictographic}/gu, '')
    .replace(/\s+/g, ' ')
    .replace(/Luxury Properties Ltd/gi, '')
    .replace(/[|:]+/g, ' ')
    .replace(/^[\s–-]+|[\s–-]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (clean && clean === clean.toUpperCase() && /[A-Z]/.test(clean)) {
    clean = clean.toLowerCase().replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
  }
  clean = clean.replace(/\b[A-Z]{2,}\b/g, (word) => `${word[0]}${word.slice(1).toLowerCase()}`);

  const suffix = ' | Luxury Properties Ltd';
  const budget = Math.max(1, maxLength - suffix.length);
  clean = trimAtWordBoundary(clean, budget);
  return `${clean || 'Luxury Real Estate'}${suffix}`;
}

export function buildSeoDescription(description, fallback = '') {
  const cleanText = (value) => decodeHtmlEntities(value)
    .replace(/\p{Extended_Pictographic}/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
  let clean = cleanText(description);

  if (clean.length < 120) {
    const supplement = cleanText(fallback) || 'Contact Luxury Properties Ltd for verified details and private viewing arrangements.';
    clean = `${clean}${clean ? ' ' : ''}${supplement}`;
  }
  while (clean.length < 120) {
    clean = `${clean}${clean ? ' ' : ''}Contact Luxury Properties Ltd for verified information and private viewing arrangements.`;
  }
  if (clean.length > 155) clean = trimAtWordBoundary(clean, 155);
  return clean;
}

export function buildImageUrl(path = '/') {
  if (!path) return `${SITE_URL}/og-image.png`;
  if (/^https?:\/\//i.test(path)) return toCdnUrl(path);
  return toCdnUrl(buildAbsoluteUrl(path));
}
