export function normalizeSupabaseStoragePath(filePath) {
  if (!filePath) return filePath;
  const asString = String(filePath).trim();
  const decodeSegment = (segment) => {
    try {
      return decodeURIComponent(segment);
    } catch {
      return segment;
    }
  };

  if (/^https?:\/\//i.test(asString)) {
    const storageObject = asString.match(/\/storage\/v1\/(?:object|render\/image)\/(?:public\/|authenticated\/)?[^/]+\/(.+)$/);
    if (storageObject) return storageObject[1].split('/').map(decodeSegment).join('/');
    return asString;
  }

  return asString.replace(/^\/+/, '').split('/').map(decodeSegment).join('/');
}