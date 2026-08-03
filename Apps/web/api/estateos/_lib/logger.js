// ============================================================
// EstateOS API — Request logger
//
// Logs structured request metadata WITHOUT ever logging the
// raw API key. Only the key prefix (first 8 chars) is recorded
// so operators can identify which key made a request.
// ============================================================

/**
 * Derive a safe, non-secret identifier from a raw API key.
 * @param {string|undefined} key
 * @returns {string} e.g. `estateos_…a1b2` or `unknown`
 */
export function safeKeyId(key) {
  if (!key) return 'unknown';

  // Only the first 8 chars of the prefix + last 4 chars — never the full key
  const prefix = key.slice(0, 'estateos_live_'.length + 4); // e.g. estateos_live_ab12
  const suffix = key.slice(-4); // e.g. cd34
  return `${prefix}…${suffix}`;
}

function getHeader(req, name) {
  const headers = req?.headers;
  if (!headers) return undefined;

  if (typeof headers.get === 'function') {
    return headers.get(name) || undefined;
  }

  return headers[name] || headers[name.toLowerCase()];
}

/**
 * Log a request with structured metadata.
 *
 * The raw Authorization header and full API key are REDACTED.
 *
 * @param {object} entry
 * @param {object} entry.req - Vercel request
 * @param {number} entry.status - Response status code
 * @param {number} entry.durationMs - Request duration
 * @param {string} [entry.apiKey] - Raw API key (only used to derive prefix)
 * @param {string|undefined} [entry.error] - Error message (no secrets)
 */
export function logRequest({ req, status, durationMs, apiKey, error }) {
  const url = req.url || req.nextUrl?.pathname || '/api/estateos/properties';

  const entry = {
    ts: new Date().toISOString(),
    level: status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info',
    service: 'estateos-api',
    method: req.method || 'GET',
    path: url.split('?')[0], // strip query params to reduce noise
    status,
    durationMs: Math.round(durationMs),
    keyId: safeKeyId(apiKey), // non-secret key identifier
    ip: getHeader(req, 'x-forwarded-for')?.split(',')[0]?.trim() || getHeader(req, 'x-real-ip') || 'unknown',
    userAgent: getHeader(req, 'user-agent')?.slice(0, 120) || 'unknown',
  };

  if (error) {
    entry.error = error; // must never contain the API key
  }

  if (status >= 500) {
    console.error(JSON.stringify(entry));
  } else if (status >= 400) {
    console.warn(JSON.stringify(entry));
  } else {
    console.log(JSON.stringify(entry));
  }
}
