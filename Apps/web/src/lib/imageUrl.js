import { resolveMediaUrl } from './mediaUrls.js';

export function toCdnUrl(url) {
  if (typeof url !== 'string' || !url) return null;
  const resolved = resolveMediaUrl(url);
  if (resolved) return resolved;
  if (/supabase\.co|images\.luxurypropertiesltd\.com\.ng/i.test(url)) return null;
  return url;
}
