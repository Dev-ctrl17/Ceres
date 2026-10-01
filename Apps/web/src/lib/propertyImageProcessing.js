const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
const allowedExtensions = new Set(['jpg', 'jpeg', 'png', 'webp']);

export function isSupportedPropertyImage(file) {
  if (!file) return false;
  const mime = String(file.type || '').toLowerCase();
  const extension = String(file.name || '').split('.').pop()?.toLowerCase();
  if (mime && !allowedMimeTypes.has(mime)) return false;
  return allowedMimeTypes.has(mime) || (!mime && allowedExtensions.has(extension));
}

export async function preparePropertyImage(file, { maxDimension = 1600, quality = 0.86 } = {}) {
  if (!isSupportedPropertyImage(file)) {
    throw new Error('Property images must be JPG, PNG, or WebP files.');
  }

  if (typeof createImageBitmap !== 'function') {
    throw new Error('This browser cannot validate and convert property images.');
  }

  let bitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error(`Unable to decode image: ${file.name}`);
  }

  try {
    if (String(file.type || '').toLowerCase() === 'image/webp' && Math.max(bitmap.width, bitmap.height) <= maxDimension) {
      return file;
    }
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Unable to prepare image canvas.');
    context.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', quality));
    if (!blob || blob.type !== 'image/webp') throw new Error(`Unable to convert ${file.name} to WebP.`);

    const baseName = String(file.name || 'property-image').replace(/\.[^.]+$/, '');
    return new File([blob], `${baseName}.webp`, { type: 'image/webp', lastModified: Date.now() });
  } finally {
    bitmap.close?.();
  }
}
