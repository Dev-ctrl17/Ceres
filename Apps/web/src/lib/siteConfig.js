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

export function buildSeoTitle(title, maxLength = 60) {
  let clean = String(title || '')
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

  const suffix = '| Luxury Properties Ltd';
  const budget = Math.max(1, maxLength - suffix.length - 1);
  if (clean.length > budget) {
    clean = `${clean.slice(0, Math.max(1, budget - 3)).trimEnd()}...`;
  }
  return `${clean || 'Luxury Real Estate'} ${suffix}`;
}

export function buildSeoDescription(description, fallback = '') {
  const cleanText = (value) => String(value || '')
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
  if (clean.length > 155) clean = `${clean.slice(0, 152).trimEnd()}...`;
  return clean;
}

export function buildImageUrl(path = '/') {
  if (!path) return `${SITE_URL}/og-image.png`;
  if (/^https?:\/\//i.test(path)) return path;
  return buildAbsoluteUrl(path);
}
