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

export function getUniqueUploadFolder(prefix) {
  const uniqueId = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}/${uniqueId}`;
}
