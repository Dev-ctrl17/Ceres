const MISSING_MEDIA = new Set([
  'property-images/properties/1787427017629_WhatsApp Image 2026-08-21 at 3.01.41 PM.jpeg',
  'property-images/properties/1787427017629_WhatsApp Image 2026-08-21 at 3.01.55 PM.jpeg',
  'property-images/properties/1787427017629_WhatsApp Image 2026-08-21 at 3.01.56 PM.jpeg',
  'property-images/properties/1783812813473_WhatsApp Image 2026-07-11 at 10.01.44 PM.jpeg',
  'property-videos/properties/1782078470737.mp4',
  'property-videos/properties/1785598709071_document_6012793565443268604.mp4',
  'property-videos/properties/1785598599925.mp4',
  'property-videos/properties/1782418559518_1782417342511-5f087009-f5e9-41d4-8a78-048515904af3.mp4',
  'property-videos/properties/1782778167093.mp4',
  'property-videos/properties/1783809980608_WhatsApp Video 2026-07-11 at 4.50.51 PM.mp4',
  'property-videos/properties/1783808587279_WhatsApp Video 2026-07-11 at 9.50.48 PM.mp4',
  'property-videos/properties/1783810295001_WhatsApp Video 2026-07-11 at 9.53.15 PM.mp4',
  'property-videos/properties/1783812259222_WhatsApp Video 2026-07-11 at 9.58.08 PM.mp4',
  'property-videos/properties/1783812819593_WhatsApp Video 2026-07-11 at 10.01.43 PM.mp4',
  'property-videos/properties/1789910925725.mp4',
  'property-videos/properties/1785845756618_document_6019418350633885191.mp4',
  'ongoing-project-videos/ongoing_projects/1784762397804_20260722_132905.mp4',
  'ongoing-project-videos/ongoing_projects/1785005923092_WhatsApp Video 2026-07-24 at 3.08.52 PM.mp4',
]);

function decodePath(path) {
  return path.split('/').map((part) => {
    try {
      return decodeURIComponent(part);
    } catch {
      return part;
    }
  }).join('/');
}

export function isKnownMissingMedia(value, bucketHint = '') {
  if (typeof value !== 'string' || !value) return false;

  let bucket = bucketHint;
  let path = value;
  try {
    const url = new URL(value, 'https://local.invalid');
    const storagePath = url.pathname.match(
      /\/storage\/v1\/(?:object|render\/image)\/(?:public\/|authenticated\/)?([^/]+)\/(.*)$/,
    );
    if (storagePath) {
      bucket = storagePath[1];
      path = storagePath[2];
    } else if (url.hostname === 'images.luxurypropertiesltd.com.ng') {
      bucket = 'property-images';
      path = url.pathname.slice(1);
    } else {
      path = url.pathname.replace(/^\/+/, '') || value;
    }
  } catch {
    path = value.replace(/^\/+/, '');
  }

  return MISSING_MEDIA.has(`${bucket}/${decodePath(path)}`);
}

export function filterKnownMissingMedia(values, bucketHint = '') {
  return (Array.isArray(values) ? values : []).filter(
    (value) => !isKnownMissingMedia(value, bucketHint),
  );
}
