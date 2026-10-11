import {
  authorizeUpload,
  getCloudinaryConfig,
  getSupabaseAdmin,
  isSafeEntityId,
  isResourceAllowedForEntity,
  getUploadLimits,
  safeSignatureEqual,
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

function validAsset(asset, folder, cloudName) {
  if (!asset || typeof asset !== 'object') return false;
  if (typeof asset.public_id !== 'string' || !asset.public_id.startsWith(`${folder}/`)) return false;
  if (!/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(asset.public_id)) return false;
  if (!['image', 'video', 'raw'].includes(asset.resource_type)) return false;
  if (!Number.isSafeInteger(asset.bytes) || asset.bytes < 1) return false;
  if (typeof asset.format !== 'string' || !/^[a-z0-9]{1,12}$/i.test(asset.format)) return false;
  if (!Number.isSafeInteger(asset.version) || asset.version < 1) return false;
  try {
    const url = new URL(asset.secure_url);
    return url.protocol === 'https:' &&
      url.hostname === 'res.cloudinary.com' &&
      url.pathname.startsWith(`/${cloudName}/${asset.resource_type}/upload/`);
  } catch {
    return false;
  }
}

export default async function completeUpload(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendJson(res, 405, { error: 'Method not allowed.' });
  }

  try {
    const body = parseBody(req.body);
    if (!body || !isSafeEntityId(body.entity_id) || typeof body.entity !== 'string' ||
      !Array.isArray(body.assets) || body.assets.length < 1 || body.assets.length > 10) {
      return sendJson(res, 400, { error: 'A valid entity, entity_id, and asset list are required.' });
    }

    const supabase = getSupabaseAdmin();
    const authorization = await authorizeUpload(req, supabase, body.entity);
    if (!authorization.ok) {
      return sendJson(res, authorization.status, { error: authorization.error });
    }

    const cloudinary = getCloudinaryConfig();
    const folder = `${body.entity}/${body.entity_id}`;
    const rows = [];
    for (const [index, asset] of body.assets.entries()) {
      if (!validAsset(asset, folder, cloudinary.cloudName)) {
        return sendJson(res, 400, { error: 'Cloudinary returned invalid asset metadata.' });
      }
      if (!isResourceAllowedForEntity(body.entity, asset.resource_type)) {
        return sendJson(res, 415, { error: 'Uploaded resource type is not allowed for this entity.' });
      }
      const limits = getUploadLimits(asset.resource_type, authorization.audience);
      if (asset.bytes > limits.maxBytes) {
        return sendJson(res, 413, { error: 'Uploaded asset exceeds the permitted size.' });
      }
      const expectedSignature = signCloudinaryParams({
        public_id: asset.public_id,
        version: String(asset.version),
      }, cloudinary.apiSecret);
      if (!safeSignatureEqual(asset.signature, expectedSignature)) {
        return sendJson(res, 400, { error: 'Cloudinary upload response signature is invalid.' });
      }
      if ((asset.resource_type === 'image' && (!Number.isSafeInteger(asset.width) || !Number.isSafeInteger(asset.height))) ||
        (asset.resource_type === 'video' && (typeof asset.duration !== 'number' || asset.duration <= 0 || asset.duration > 120))) {
        return sendJson(res, 400, { error: 'Cloudinary asset dimensions or duration are invalid.' });
      }
      if (asset.resource_type === 'image' && (asset.width > 2000 || asset.height > 2000)) {
        return sendJson(res, 400, { error: 'Cloudinary image exceeds the 2000px dimension limit.' });
      }

      rows.push({
        entity: body.entity,
        entity_id: body.entity_id,
        public_id: asset.public_id,
        resource_type: asset.resource_type,
        secure_url: asset.secure_url,
        width: Number.isSafeInteger(asset.width) ? asset.width : null,
        height: Number.isSafeInteger(asset.height) ? asset.height : null,
        bytes: asset.bytes,
        format: asset.format.toLowerCase(),
        duration: typeof asset.duration === 'number' ? asset.duration : null,
        sort_order: Number.isSafeInteger(body.sort_order)
          ? body.sort_order + index
          : index,
        alt_text: typeof body.alt_text === 'string'
          ? body.alt_text.trim().slice(0, 500)
          : '',
      });
    }

    const { data, error } = await supabase
      .from('media_assets')
      .upsert(rows, { onConflict: 'entity,entity_id,public_id' })
      .select('public_id,secure_url,width,height,bytes,format,duration,sort_order,alt_text');
    if (error) {
      console.error('[cloudinary] metadata persistence failed:', error.code || 'unknown');
      return sendJson(res, 503, { error: 'Upload succeeded, but media metadata could not be saved.' });
    }

    return sendJson(res, 200, { assets: data });
  } catch (error) {
    console.error('[cloudinary] upload completion failed:', error.message);
    return sendJson(res, 500, { error: 'Unable to save uploaded media metadata.' });
  }
}
