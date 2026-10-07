import imageCompression from 'browser-image-compression';

const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic']);
const allowedExtensions = new Set(['jpg', 'jpeg', 'png', 'webp', 'heic']);
const MAX_IMAGE_BYTES = 400_000;

export function isSupportedPropertyImage(file) {
  if (!file) return false;
  const mime = String(file.type || '').toLowerCase();
  const extension = String(file.name || '').split('.').pop()?.toLowerCase();
  if (mime && !allowedMimeTypes.has(mime)) return false;
  return allowedMimeTypes.has(mime) || (!mime && allowedExtensions.has(extension));
}

export async function preparePropertyImage(file, { maxDimension = 1600 } = {}) {
  if (!isSupportedPropertyImage(file)) {
    throw new Error('Property images must be JPG, PNG, WebP, or HEIC files.');
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
    if (
      String(file.type || '').toLowerCase() === 'image/webp' &&
      file.size < MAX_IMAGE_BYTES &&
      Math.max(bitmap.width, bitmap.height) <= maxDimension
    ) {
      return file;
    }
  } finally {
    bitmap.close?.();
  }

  let compressedFile;
  try {
    compressedFile = await imageCompression(file, {
      maxSizeMB: 0.38,
      maxWidthOrHeight: maxDimension,
      useWebWorker: true,
      fileType: 'image/webp',
      initialQuality: 0.82,
      maxIteration: 12,
    });
  } catch (error) {
    throw new Error(`Unable to compress image: ${file.name}`, { cause: error });
  }

  if (compressedFile.type !== 'image/webp' || compressedFile.size >= MAX_IMAGE_BYTES) {
    throw new Error('The compressed image must be WebP and smaller than 400 KB.');
  }
  return compressedFile;
}
