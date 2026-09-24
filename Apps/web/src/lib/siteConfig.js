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
    throw new Error(`SITE_URL must not contain localhost in production: ${configured}`);
  }

  return configured.replace(/\/$/, '');
})();

export function buildAbsoluteUrl(path = '/') {
  const safePath = path === undefined || path === null || path === '' ? '/' : String(path);
  const normalizedPath = safePath.startsWith('/') ? safePath : `/${safePath}`;

  if (normalizedPath === '/') {
    return SITE_URL;
  }

  return `${SITE_URL}${normalizedPath.replace(/\/$/, '')}`;
}

export function buildImageUrl(path = '/') {
  if (!path) return `${SITE_URL}/og-image.png`;
  if (/^https?:\/\//i.test(path)) return path;
  return buildAbsoluteUrl(path);
}
