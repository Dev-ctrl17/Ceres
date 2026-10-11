export function normalizePropertyName(title) {
  const normalized = String(title || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return normalized || "property";
}

export function getFileExtension(fileName, fallback = "jpg") {
  const match = String(fileName || "").match(/\.([a-z0-9]+)$/i);
  return match ? match[1].toLowerCase() : fallback;
}

export function getPropertyImageName(title, fileName, index) {
  return `${normalizePropertyName(title)}_${index + 1}.${getFileExtension(fileName)}`;
}

export function slugifyFilename(fileName, uniquePrefix = '') {
  const originalName = String(fileName || '').split(/[\\/]/).pop() || 'upload';
  const extensionMatch = originalName.match(/\.([a-z0-9]{1,12})$/i);
  const extension = extensionMatch?.[1].toLowerCase() || '';
  const stem = extensionMatch ? originalName.slice(0, -extensionMatch[0].length) : originalName;
  const slug = (value) => value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const generatedPrefix = `${Date.now()}-${globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2)}`;
  const prefix = slug(uniquePrefix || generatedPrefix).slice(0, 64);
  const safeStem = slug(stem).slice(0, 120).replace(/-+$/g, '') || 'upload';

  return `${prefix}-${safeStem}${extension ? `.${extension}` : ''}`;
}

export function getUniqueUploadFolder(prefix) {
  const uniqueId = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}/${uniqueId}`;
}
