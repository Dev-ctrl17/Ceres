import supabase from '@/lib/supabaseClient';

const IMAGE_FORMATS = new Set(['jpg', 'jpeg', 'png', 'webp', 'heic']);
const VIDEO_FORMATS = new Set(['mp4', 'mov']);
const RAW_FORMATS = new Set(['pdf']);
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_VIDEO_BYTES = 100 * 1024 * 1024;
const MAX_VIDEO_SECONDS = 120;
const MAX_RAW_BYTES = 25 * 1024 * 1024;

function getExtension(file) {
  return file.name.split('.').pop()?.toLowerCase() || '';
}

function getResourceType(bucket, extension) {
  if (['property-images', 'ongoing-project-images', 'site-assets', 'page-backgrounds', 'team-photos', 'agent-photos'].includes(bucket)) {
    return IMAGE_FORMATS.has(extension) ? 'image' : null;
  }
  if (['property-videos', 'ongoing-project-videos'].includes(bucket)) {
    return VIDEO_FORMATS.has(extension) ? 'video' : null;
  }
  if (['proposal-files', 'brochures'].includes(bucket)) {
    if (IMAGE_FORMATS.has(extension)) return 'image';
    return RAW_FORMATS.has(extension) ? 'raw' : null;
  }
  return null;
}

function getVideoDuration(file) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const video = document.createElement('video');
    const cleanup = () => {
      video.removeAttribute('src');
      video.load();
      URL.revokeObjectURL(objectUrl);
    };
    const timer = window.setTimeout(() => {
      cleanup();
      reject(new Error('Unable to read video duration.'));
    }, 15000);

    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      window.clearTimeout(timer);
      const duration = video.duration;
      cleanup();
      if (!Number.isFinite(duration) || duration <= 0 || duration > MAX_VIDEO_SECONDS) {
        reject(new Error(`Videos must be ${MAX_VIDEO_SECONDS} seconds or shorter.`));
        return;
      }
      resolve(duration);
    };
    video.onerror = () => {
      window.clearTimeout(timer);
      cleanup();
      reject(new Error('Unable to read video duration.'));
    };
    video.src = objectUrl;
  });
}

async function getAccessToken(requireAuth) {
  if (!requireAuth) return null;
  const { data, error } = await supabase.auth.getSession();
  if (error) throw new Error(`Unable to verify administrator session: ${error.message}`);
  if (!data.session?.access_token) throw new Error('Sign in as an administrator to upload media.');
  return data.session.access_token;
}

function defaultAltText(resourceType, entity) {
  if (resourceType === 'video') return `${entity.replaceAll('_', ' ')} video`;
  if (resourceType === 'raw') return `${entity.replaceAll('_', ' ')} document`;
  return `${entity.replaceAll('_', ' ')} image`;
}

export async function uploadToCloudinary(bucket, file, {
  entity,
  entityId,
  sortOrder = 0,
  altText = '',
  requireAuth = true,
} = {}) {
  if (!(file instanceof File)) throw new Error('A file is required for upload.');
  if (!entity || !entityId) throw new Error('Upload entity and record ID are required.');

  const extension = getExtension(file);
  const resourceType = getResourceType(bucket, extension);
  if (!resourceType) {
    throw new Error('Allowed files are JPG, JPEG, PNG, WebP, HEIC, MP4, MOV, or PDF documents where supported.');
  }

  const maxBytes = resourceType === 'image'
    ? MAX_IMAGE_BYTES
    : resourceType === 'video'
      ? MAX_VIDEO_BYTES
      : MAX_RAW_BYTES;
  if (file.size < 1 || file.size > maxBytes) {
    throw new Error(`File must be smaller than ${Math.floor(maxBytes / 1024 / 1024)} MB.`);
  }

  const duration = resourceType === 'video' ? await getVideoDuration(file) : undefined;
  const token = await getAccessToken(requireAuth);
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const signResponse = await fetch('/api/cloudinary/sign-upload', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      entity,
      entity_id: String(entityId),
      bucket,
      file: {
        name: file.name,
        type: file.type || '',
        size: file.size,
        ...(duration === undefined ? {} : { duration }),
      },
    }),
  });
  const signed = await signResponse.json().catch(() => ({}));
  if (!signResponse.ok) {
    throw new Error(signed.error || `Unable to prepare upload (${signResponse.status}).`);
  }

  if (!signed.cloud_name) throw new Error('Upload service did not provide a Cloudinary cloud name.');

  const uploadForm = new FormData();
  uploadForm.append('file', file);
  for (const [key, value] of Object.entries(signed)) {
    if (key === 'signature' || key === 'api_key' || key === 'resource_type' || key === 'cloud_name') continue;
    if (value !== undefined && value !== null) uploadForm.append(key, String(value));
  }
  uploadForm.append('api_key', signed.api_key);
  uploadForm.append('signature', signed.signature);

  const uploadResponse = await fetch(
    `https://api.cloudinary.com/v1_1/${encodeURIComponent(signed.cloud_name)}/${signed.resource_type}/upload`,
    { method: 'POST', body: uploadForm },
  );
  const uploaded = await uploadResponse.json().catch(() => ({}));
  if (!uploadResponse.ok) {
    throw new Error(uploaded.error?.message || `Cloudinary upload failed (${uploadResponse.status}).`);
  }

  const completeResponse = await fetch('/api/cloudinary/complete-upload', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      entity,
      entity_id: String(entityId),
      sort_order: sortOrder,
      alt_text: altText || defaultAltText(resourceType, entity),
      assets: [uploaded],
    }),
  });
  const completed = await completeResponse.json().catch(() => ({}));
  if (!completeResponse.ok) {
    throw new Error(completed.error || `Unable to save uploaded media metadata (${completeResponse.status}).`);
  }

  const asset = completed.assets?.[0];
  if (!asset?.secure_url || asset.public_id !== uploaded.public_id) {
    throw new Error('Cloudinary upload completed without a valid saved media record.');
  }
  return asset;
}
