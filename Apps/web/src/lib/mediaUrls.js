import mediaMigrationMap from '../data/mediaMigrationMap.json' with { type: 'json' };
import { isKnownMissingMedia } from './missingMedia.js';

function decodePath(path) {
  return String(path || '').split('/').map((part) => {
    try {
      return decodeURIComponent(part);
    } catch {
      return part;
    }
  }).join('/');
}

function getStorageReference(value, bucketHint) {
  let url;
  try {
    url = new URL(value, 'https://local.invalid');
  } catch {
    return null;
  }

  const object = url.pathname.match(
    /\/storage\/v1\/(?:object|render\/image)\/(?:public\/|authenticated\/)?([^/]+)\/(.*)$/,
  );
  if (object) {
    return { bucket: object[1], path: decodePath(object[2]) };
  }
  if (url.hostname === 'images.luxurypropertiesltd.com.ng') {
    return { bucket: 'property-images', path: decodePath(url.pathname.slice(1)) };
  }
  if (/\.supabase\.co$/i.test(url.hostname)) return { bucket: bucketHint, path: '' };
  if (/^https?:\/\//i.test(value)) return null;
  if (!bucketHint) return null;
  return { bucket: bucketHint, path: decodePath(value.replace(/^\/+/, '').split('?')[0]) };
}

export function resolveMediaUrl(value, bucketHint = '') {
  if (typeof value !== 'string' || !value.trim()) return null;
  const input = value.trim();
  if (isKnownMissingMedia(input, bucketHint)) return null;

  if (/^https:\/\/res\.cloudinary\.com\//i.test(input)) return input;
  if (/^(?:data:|blob:)/i.test(input)) return input;

  const source = getStorageReference(input, bucketHint);
  if (source?.path) {
    return mediaMigrationMap[`${source.bucket}/${source.path}`] || null;
  }
  if (source) return null;

  return /^https?:\/\//i.test(input) ? input : null;
}

export function rewriteMediaContent(value, bucketHint = '') {
  if (typeof value === 'string') {
    let result = value.replace(
      /https?:\/\/[^\s"'<>]+/g,
      (rawUrl) => {
        const cleanUrl = rawUrl.replace(/[),.;]+$/u, '');
        if (!/supabase\.co|images\.luxurypropertiesltd\.com\.ng/i.test(cleanUrl)) return rawUrl;
        const resolved = resolveMediaUrl(cleanUrl, bucketHint);
        return resolved ? `${resolved}${rawUrl.slice(cleanUrl.length)}` : '';
      },
    );
    result = result.replace(/<img\b[^>]*\bsrc\s*=\s*(["'])\s*\1[^>]*>/gi, '');
    result = result.replace(/<(?:video|source)\b[^>]*\bsrc\s*=\s*(["'])\s*\1[^>]*>/gi, '');
    return result;
  }
  if (Array.isArray(value)) return value.map((item) => rewriteMediaContent(item, bucketHint));
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [
      key,
      rewriteMediaContent(item, bucketHint),
    ]));
  }
  return value;
}
