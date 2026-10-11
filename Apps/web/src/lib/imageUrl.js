import { resolveMediaUrl } from './mediaUrls.js';

export function toCdnUrl(url) {
  if (typeof url !== 'string' || !url) return null;
  const resolved = resolveMediaUrl(url);
  if (resolved) return resolved;
  if (/supabase\.co|images\.luxurypropertiesltd\.com\.ng/i.test(url)) return null;
  try {
    const encoded = new URL(url, 'https://local.invalid');
    encoded.pathname = encoded.pathname
      .split('/')
      .map((segment) => {
        try {
          return encodeURIComponent(decodeURIComponent(segment));
        } catch {
          return encodeURIComponent(segment);
        }
      })
      .join('/');
    return encoded.origin === 'https://local.invalid'
      ? `${encoded.pathname}${encoded.search}${encoded.hash}`
      : encoded.toString();
  } catch {
    return null;
  }
}
