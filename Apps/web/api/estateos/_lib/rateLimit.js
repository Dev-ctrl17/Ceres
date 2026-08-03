// ============================================================
// EstateOS API — Rate limiting
//
// In-memory sliding-window rate limiter keyed by client IP +
// hashed API key. Prevents brute-force and abusive polling.
//
// The raw API key is NEVER stored in the rate-limit map — only
// its SHA-256 hash is used as part of the composite key.
// ============================================================

import { hashApiKey } from './auth.js';

// Default: 300 requests per 15 minutes per client
const DEFAULT_WINDOW_MS = 15 * 60 * 1000;
const DEFAULT_MAX = 300;

function getHeader(req, name) {
  const headers = req?.headers;
  if (!headers) return undefined;

  if (typeof headers.get === 'function') {
    return headers.get(name) || undefined;
  }

  return headers[name] || headers[name.toLowerCase()];
}

/**
 * @param {object} options
 * @param {number} [options.windowMs=900000]
 * @param {number} [options.max=300]
 */
export function createRateLimiter({ windowMs = DEFAULT_WINDOW_MS, max = DEFAULT_MAX } = {}) {
  // Map<compositeKey, number[] of timestamps>
  const hits = new Map();

  /**
   * Check a request against the rate limit.
   * @param {object} req - Vercel request
   * @param {string} [apiKey] - Raw API key (only hashed for the key)
   * @returns {{ allowed: true, headers: object } | { allowed: false, status: number, body: object, headers: object }}
   */
  function check(req, apiKey = '') {
    const ip =
      getHeader(req, 'x-forwarded-for')?.split(',')[0]?.trim() ||
      getHeader(req, 'x-real-ip') ||
      'unknown';

    const hashedKey = apiKey ? hashApiKey(apiKey) : 'anon';
    const compositeKey = `${ip}:${hashedKey}`;

    const now = Date.now();
    const windowStart = now - windowMs;

    const timestamps = (hits.get(compositeKey) || []).filter(t => t > windowStart);

    if (timestamps.length >= max) {
      const retryAfterMs = timestamps[0] + windowMs - now;
      const retryAfterSec = Math.max(1, Math.ceil(retryAfterMs / 1000));

      return {
        allowed: false,
        status: 429,
        body: {
          error: 'Rate limit exceeded. Please retry later.',
          retryAfter: retryAfterSec,
        },
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(retryAfterSec),
          'X-RateLimit-Limit': String(max),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil((timestamps[0] + windowMs) / 1000)),
        },
      };
    }

    timestamps.push(now);
    hits.set(compositeKey, timestamps);

    // Periodic cleanup
    if (Math.random() < 0.01) {
      for (const [k, times] of hits.entries()) {
        const recent = times.filter(t => t > Date.now() - windowMs);
        if (recent.length === 0) hits.delete(k);
        else hits.set(k, recent);
      }
    }

    return {
      allowed: true,
      headers: {
        'X-RateLimit-Limit': String(max),
        'X-RateLimit-Remaining': String(max - timestamps.length),
        'X-RateLimit-Reset': String(Math.ceil((now + windowMs) / 1000)),
      },
    };
  }

  return { check };
}
