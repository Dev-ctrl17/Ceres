import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

export const PUBLIC_UPLOAD_ENTITIES = new Set([
  'property_submissions',
  'agent_applications',
]);

const MAX_PUBLIC_UPLOADS_PER_HOUR = 30;

export function sendJson(res, status, payload) {
  res.status(status).setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  return res.json(payload);
}

export function getCloudinaryConfig() {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error('Cloudinary server configuration is incomplete.');
  }
  return { cloudName: CLOUDINARY_CLOUD_NAME, apiKey: CLOUDINARY_API_KEY, apiSecret: CLOUDINARY_API_SECRET };
}

export function getSupabaseAdmin() {
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase server configuration is incomplete.');
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function getBearerToken(req) {
  const authorization = req.headers.authorization;
  const match = typeof authorization === 'string' && authorization.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

function getClientIp(req) {
  const forwarded = req.headers['x-vercel-forwarded-for'];
  const firstForwarded = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  const ip = firstForwarded || req.ip || req.socket?.remoteAddress;
  return typeof ip === 'string' && ip.length <= 100 ? ip.trim() : null;
}

async function consumePublicUploadLimit(req, supabase) {
  const ip = getClientIp(req);
  const pepper = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!ip || !pepper) {
    return { ok: false, status: 400, error: 'Unable to establish request source.' };
  }

  const ipHash = createHmac('sha256', pepper).update(ip).digest('hex');
  const { data, error } = await supabase.rpc('consume_media_upload_limit', {
    p_ip_hash: ipHash,
    p_max_requests: MAX_PUBLIC_UPLOADS_PER_HOUR,
    p_window_seconds: 3600,
  });
  if (error) {
    console.error('[cloudinary] public upload rate-limit check failed:', error.code || 'unknown');
    return { ok: false, status: 503, error: 'Upload service is temporarily unavailable.' };
  }
  if (data !== true) {
    return { ok: false, status: 429, error: 'Upload limit reached. Please try again later.' };
  }
  return { ok: true };
}

export async function authorizeUpload(req, supabase, entity) {
  const token = getBearerToken(req);
  if (token) {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) {
      return { ok: false, status: 401, error: 'A valid sign-in is required.' };
    }
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .maybeSingle();
    if (profileError) {
      console.error('[cloudinary] admin profile lookup failed:', profileError.code || 'unknown');
      return { ok: false, status: 503, error: 'Upload authorization is temporarily unavailable.' };
    }
    if (String(profile?.role || '').toLowerCase() !== 'admin') {
      return { ok: false, status: 403, error: 'Administrator access is required.' };
    }
    return { ok: true, audience: 'admin' };
  }

  if (!PUBLIC_UPLOAD_ENTITIES.has(entity)) {
    return { ok: false, status: 401, error: 'A valid sign-in is required.' };
  }
  const limited = await consumePublicUploadLimit(req, supabase);
  return limited.ok
    ? { ok: true, audience: 'public' }
    : limited;
}

export function signCloudinaryParams(params, apiSecret) {
  const serialized = Object.keys(params)
    .filter((key) => params[key] !== undefined && params[key] !== null && params[key] !== '')
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');
  return createHash('sha1').update(`${serialized}${apiSecret}`).digest('hex');
}

export function safeSignatureEqual(actual, expected) {
  if (typeof actual !== 'string' || typeof expected !== 'string') return false;
  const actualBuffer = Buffer.from(actual, 'hex');
  const expectedBuffer = Buffer.from(expected, 'hex');
  return actualBuffer.length === expectedBuffer.length &&
    actualBuffer.length > 0 &&
    timingSafeEqual(actualBuffer, expectedBuffer);
}

export function isSafeEntityId(value) {
  return typeof value === 'string' &&
    value.length >= 1 &&
    value.length <= 100 &&
    /^[a-zA-Z0-9_-]+$/.test(value);
}

export function getEntityResource(entity, bucket, extension) {
  const imageBuckets = new Set([
    'property-images',
    'ongoing-project-images',
    'site-assets',
    'page-backgrounds',
    'team-photos',
    'agent-photos',
  ]);
  const videoBuckets = new Set(['property-videos', 'ongoing-project-videos']);
  const entityBuckets = {
    properties: new Set(['property-images', 'property-videos']),
    property_submissions: new Set(['property-images']),
    ongoing_projects: new Set(['ongoing-project-images', 'ongoing-project-videos']),
    proposals: new Set(['proposal-files']),
    brochures: new Set(['brochures']),
    agents: new Set(['agent-photos']),
    agent_applications: new Set(['agent-photos']),
    teammembers: new Set(['team-photos']),
    page_backgrounds: new Set(['page-backgrounds']),
    blogposts: new Set(['site-assets']),
  };
  if (!entityBuckets[entity]?.has(bucket)) return null;
  if (imageBuckets.has(bucket)) return ['jpg', 'jpeg', 'png', 'webp', 'heic'].includes(extension) ? 'image' : null;
  if (videoBuckets.has(bucket)) return ['mp4', 'mov'].includes(extension) ? 'video' : null;
  if (['proposal-files', 'brochures'].includes(bucket)) {
    if (['jpg', 'jpeg', 'png', 'webp', 'heic'].includes(extension)) return 'image';
    if (extension === 'pdf') return 'raw';
  }
  return null;
}

export function getUploadLimits(resourceType, audience) {
  if (resourceType === 'image') return { maxBytes: 10 * 1024 * 1024, maxDuration: null };
  if (resourceType === 'video') {
    return { maxBytes: 100 * 1024 * 1024, maxDuration: audience === 'admin' ? 120 : null };
  }
  if (resourceType === 'raw') return { maxBytes: 25 * 1024 * 1024, maxDuration: null };
  return null;
}

export function isResourceAllowedForEntity(entity, resourceType) {
  const allowed = {
    properties: new Set(['image', 'video']),
    property_submissions: new Set(['image']),
    ongoing_projects: new Set(['image', 'video']),
    proposals: new Set(['image', 'raw']),
    brochures: new Set(['image', 'raw']),
    agents: new Set(['image']),
    agent_applications: new Set(['image']),
    teammembers: new Set(['image']),
    page_backgrounds: new Set(['image']),
    blogposts: new Set(['image']),
  };
  return allowed[entity]?.has(resourceType) || false;
}
