// ============================================================
// EstateOS API — Authentication module
//
// Verifies `Authorization: Bearer <ESTATEOS_API_KEY>` headers.
//
// Security properties:
//   - Never stores raw keys; only SHA-256 hashes are stored.
//   - Uses a timing-safe comparison to prevent timing attacks.
//   - Keys are read-only and revocable (is_active = false).
//   - The raw key is NEVER logged or echoed in responses.
// ============================================================

import { createHash, timingSafeEqual } from 'node:crypto';

// Expected format: `estateos_live_` + 32 hex chars
const API_KEY_PATTERN = /^estateos_live_[a-f0-9]{32}$/;

/**
 * Hash an API key using SHA-256.
 * @param {string} key - The raw API key
 * @returns {string} Hex-encoded SHA-256 digest
 */
export function hashApiKey(key) {
  return createHash('sha256').update(key, 'utf8').digest('hex');
}

/**
 * Timing-safe comparison of two strings.
 * @param {string} a
 * @param {string} b
 * @returns {boolean}
 */
export function safeEqual(a, b) {
  const bufA = Buffer.from(String(a), 'utf8');
  const bufB = Buffer.from(String(b), 'utf8');
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/**
 * Extract and validate the Bearer token from an Authorization header.
 * @param {string|undefined} authHeader
 * @returns {{ ok: true, key: string } | { ok: false, reason: string }}
 */
export function extractBearerToken(authHeader) {
  if (!authHeader) {
    return { ok: false, reason: 'Missing Authorization header' };
  }

  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return { ok: false, reason: 'Authorization header must use Bearer scheme' };
  }

  const key = match[1].trim();
  if (!API_KEY_PATTERN.test(key)) {
    return { ok: false, reason: 'Malformed API key' };
  }

  return { ok: true, key };
}

/**
 * Validate an API key against the database of hashed keys.
 *
 * In production this looks up `estateos_api_keys` via the service-role
 * Supabase client. The function also accepts a static demo key (used by
 * the automated test suite and local development) so the API can be
 * exercised without a database.
 *
 * @param {string} key - The raw API key supplied by the client
 * @param {object} options
 * @param {import('@supabase/supabase-js').SupabaseClient|null} options.supabase
 * @param {string[]} [options.staticKeys] - Additional static keys (hashed)
 * @returns {Promise<{ ok: true, keyId: string|null } | { ok: false, reason: string }>}
 */
export async function authenticateApiKey(key, { supabase = null, staticKeys = [] } = {}) {
  const keyHash = hashApiKey(key);

  // 1) Static/development keys first
  for (const storedHash of staticKeys) {
    if (safeEqual(keyHash, storedHash)) {
      return { ok: true, keyId: null };
    }
  }

  // 2) Database-backed keys (service role bypasses RLS)
  if (supabase) {
    const { data, error } = await supabase
      .from('estateos_api_keys')
      .select('id, is_active, is_read_only, revoked_at')
      .eq('key_hash', keyHash)
      .maybeSingle();

    if (error) {
      console.error('[estateos] auth query failed:', { code: error.code, message: error.message });
      return { ok: false, reason: 'Internal authentication error' };
    }

    if (!data) {
      return { ok: false, reason: 'Invalid API key' };
    }

    if (!data.is_active || data.revoked_at) {
      return { ok: false, reason: 'API key has been revoked' };
    }

    if (data.is_read_only === false) {
      // The key exists but is write-capable; our endpoint only serves GET.
      // Keeping it read-only enforced both in DB and here.
      return { ok: false, reason: 'API key is not read-only' };
    }

    // Fire-and-forget usage tracking (never block the response on it)
    // NOTE: We deliberately do NOT await this promise — the RPC call can be
    // slow or hang, and waiting for it would eat into Vercel's serverless
    // invocation time budget and cause FUNCTION_INVOCATION_TIMEOUT.
    supabase
      .rpc('estateos_touch_api_key', {
        p_key_hash: keyHash,
        p_ip: '',
      })
      .then(() => {})
      .catch(() => {
        // Non-fatal: usage tracking must never break the API
      });

    return { ok: true, keyId: data.id };
  }

  return { ok: false, reason: 'Invalid API key' };
}

/**
 * Verify the Authorization header end-to-end.
 * @param {string|undefined} authHeader
 * @param {object} deps
 * @returns {Promise<{ ok: true, keyId: string|null } | { ok: false, reason: string, status: number }>}
 */
export async function verifyRequest(authHeader, deps = {}) {
  const extracted = extractBearerToken(authHeader);
  if (!extracted.ok) {
    return { ok: false, reason: extracted.reason, status: 401 };
  }

  const result = await authenticateApiKey(extracted.key, deps);
  if (!result.ok) {
    return { ok: false, reason: result.reason, status: 401 };
  }

  return { ok: true, keyId: result.keyId };
}