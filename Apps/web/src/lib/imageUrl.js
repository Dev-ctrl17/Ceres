export const OLD_IMAGE_BASE_URL = 'https://lrmljudwbzjawafuztwp.supabase.co/storage/v1/object/public/property-images/';
export const NEW_IMAGE_BASE_URL = 'https://images.luxurypropertiesltd.com.ng/';

export function toCdnUrl(url) {
  if (typeof url !== 'string' || !url) return url;
  if (!url.startsWith(OLD_IMAGE_BASE_URL)) return url;
  return `${NEW_IMAGE_BASE_URL}${url.slice(OLD_IMAGE_BASE_URL.length)}`;
}
