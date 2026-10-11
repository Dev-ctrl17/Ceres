import { randomUUID } from 'node:crypto';
import { slugifyFilename } from '../../src/lib/propertyImageNaming.js';
import {
  authorizeUpload,
  getCloudinaryConfig,
  getEntityResource,
  getSupabaseAdmin,
  getUploadLimits,
  isResourceAllowedForEntity,
  isSafeEntityId,
  sendJson,
  signCloudinaryParams,
} from './_shared.js';

function parseBody(body) {
  if (body && typeof body === 'object') return body;
  if (typeof body === 'string') {
    try {
      return JSON.parse(body);
    } catch {
      return null;
    }
  }
  return null;
}

export default async function signUpload(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendJson(res, 405, { error: 'Method not allowed.' });
  }

  try {
    const body = parseBody(req.body);
    if (!body || !isSafeEntityId(body.entity_id) || typeof body.entity !== 'string') {
      return sendJson(res, 400, { error: 'A valid entity and entity_id are required.' });
    }

    const file = body.file;
    if (!file || typeof file.name !== 'string' || typeof file.type !== 'string' ||
      !Number.isSafeInteger(file.size) || file.size < 1) {
      return sendJson(res, 400, { error: 'Valid file name, type, and size are required.' });
    }

    const extension = file.name.split('.').pop()?.toLowerCase();
    const resourceType = getEntityResource(body.entity, body.bucket, extension);
    if (!resourceType || !isResourceAllowedForEntity(body.entity, resourceType)) {
      return sendJson(res, 415, { error: 'This file type is not allowed for the selected upload.' });
    }
    const mime = file.type.toLowerCase();
    if (mime && !(
      (resourceType === 'image' && ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic'].includes(mime)) ||
      (resourceType === 'video' && ['video/mp4', 'video/quicktime'].includes(mime)) ||
      (resourceType === 'raw' && mime === 'application/pdf')
    )) {
      return sendJson(res, 415, { error: 'File content type does not match an allowed format.' });
    }

    const supabase = getSupabaseAdmin();
    const authorization = await authorizeUpload(req, supabase, body.entity);
    if (!authorization.ok) {
      return sendJson(res, authorization.status, { error: authorization.error });
    }

    const limits = getUploadLimits(resourceType, authorization.audience);
    if (file.size > limits.maxBytes) {
      return sendJson(res, 413, { error: `File exceeds the ${Math.round(limits.maxBytes / 1024 / 1024)} MB limit.` });
    }
    if (resourceType === 'video' &&
      (typeof file.duration !== 'number' || !Number.isFinite(file.duration) ||
        file.duration <= 0 || file.duration > limits.maxDuration)) {
      return sendJson(res, 400, { error: `Video duration must be between 1 and ${limits.maxDuration} seconds.` });
    }

    const folder = `${body.entity}/${body.entity_id}`;
    const filename = slugifyFilename(file.name, randomUUID());
    const publicId = filename.replace(/\.[a-z0-9]+$/i, '');
    const timestamp = Math.floor(Date.now() / 1000);
    const allowedFormats = resourceType === 'image'
      ? 'jpg,jpeg,png,webp,heic'
      : resourceType === 'video'
        ? 'mp4,mov'
        : 'pdf';
    const transformation = resourceType === 'image'
      ? 'c_limit,w_2000,h_2000,q_auto,f_webp'
      : resourceType === 'video'
        ? 'c_limit,w_2000,h_2000,q_auto,f_mp4'
        : undefined;
    const params = {
      allowed_formats: allowedFormats,
      folder,
      overwrite: 'false',
      public_id: publicId,
      timestamp: String(timestamp),
      transformation,
      unique_filename: 'false',
      use_filename: 'false',
    };
    const cloudinary = getCloudinaryConfig();

    return sendJson(res, 200, {
      api_key: cloudinary.apiKey,
      cloud_name: cloudinary.cloudName,
      folder,
      filename,
      public_id: publicId,
      resource_type: resourceType,
      timestamp,
      signature: signCloudinaryParams(params, cloudinary.apiSecret),
      allowed_formats: allowedFormats,
      overwrite: false,
      ...(transformation ? { transformation } : {}),
      unique_filename: false,
      use_filename: false,
    });
  } catch (error) {
    console.error('[cloudinary] upload signing failed:', error.message);
    return sendJson(res, 500, { error: 'Unable to prepare the upload.' });
  }
}
