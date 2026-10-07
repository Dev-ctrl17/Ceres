const RESPONSIVE_IMAGE_WIDTHS = [400, 800, 1200];
const CLOUDINARY_UPLOAD_MARKER = '/upload/';

function splitCloudinaryUrl(secureUrl) {
  if (typeof secureUrl !== 'string') return null;
  try {
    const url = new URL(secureUrl);
    if (url.protocol !== 'https:' || url.hostname !== 'res.cloudinary.com') return null;
    const markerIndex = url.pathname.indexOf(CLOUDINARY_UPLOAD_MARKER);
    if (markerIndex < 0) return null;
    const resourceType = url.pathname.slice(1, markerIndex).split('/')[1];
    if (!['image', 'video', 'raw'].includes(resourceType)) return null;
    const tail = url.pathname.slice(markerIndex + CLOUDINARY_UPLOAD_MARKER.length);
    const firstSegment = tail.split('/')[0];
    const hasLeadingTransform = firstSegment.includes(',') &&
      /(?:^|,)(?:f_auto|q_auto|w_\d+|c_limit)(?:,|$)/.test(firstSegment);
    return {
      base: `${url.origin}${url.pathname.slice(0, markerIndex)}${CLOUDINARY_UPLOAD_MARKER}`,
      tail: hasLeadingTransform ? tail.slice(firstSegment.length + 1) : tail,
      resourceType,
      query: url.search,
    };
  } catch {
    return null;
  }
}

function transformedUrl(secureUrl, transformation) {
  const parts = splitCloudinaryUrl(secureUrl);
  if (!parts || parts.resourceType === 'raw') return secureUrl;
  return `${parts.base}${transformation}/${parts.tail}${parts.query}`;
}

export function getCloudinaryImageUrl(secureUrl, width = 800) {
  if (!RESPONSIVE_IMAGE_WIDTHS.includes(width)) {
    throw new RangeError(`Unsupported responsive image width: ${width}`);
  }
  return transformedUrl(secureUrl, `f_auto,q_auto,w_${width},c_limit`);
}

export function getCloudinaryImageSrcSet(secureUrl) {
  return RESPONSIVE_IMAGE_WIDTHS
    .map((width) => `${getCloudinaryImageUrl(secureUrl, width)} ${width}w`)
    .join(', ');
}

export function getCloudinaryVideoUrl(secureUrl) {
  return transformedUrl(secureUrl, 'f_auto,q_auto,w_2000,c_limit');
}

export function getCloudinaryVideoPosterUrl(secureUrl, width = 800) {
  const parts = splitCloudinaryUrl(secureUrl);
  if (!parts || parts.resourceType !== 'video') return null;
  const assetPath = parts.tail.replace(/\.[^/.]+$/, '.jpg');
  return `${parts.base}so_0,f_auto,q_auto,w_${width},c_limit/${assetPath}${parts.query}`;
}
