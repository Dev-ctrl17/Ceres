// ============================================================
// EstateOS Private API — GET /api/estateos/properties
//
// Secure, authenticated endpoint that returns both public and
// unpublished property listings to EstateOS.
//
// Authentication:  Authorization: Bearer <ESTATEOS_API_KEY>
//   - Keys are read-only, revocable, stored as SHA-256 hashes.
//   - Rejects unauthenticated requests with 401.
//   - Raw keys are never logged.
//
// Query parameters:
//   status=all|DRAFT|PRIVATE|ACTIVE|SOLD|RENTED|ARCHIVED
//   include_unpublished=true|false
//   page=1
//   limit=100
//   updatedSince=<ISO timestamp>
//
// Returns 404 for unknown endpoints, 401 for invalid credentials,
// 429 when rate-limited.
// ============================================================

import { createClient } from '@supabase/supabase-js';

import { verifyRequest } from './_lib/auth.js';
import { transformProperties } from './_lib/transform.js';
import { createRateLimiter } from './_lib/rateLimit.js';
import { logRequest } from './_lib/logger.js';

const VALID_STATUSES = ['DRAFT', 'PRIVATE', 'ACTIVE', 'SOLD', 'RENTED', 'ARCHIVED'];
const MAX_LIMIT = 200;
const DEFAULT_LIMIT = 100;
const DEFAULT_PAGE = 1;

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------

function jsonResponse(status, body, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store, max-age=0',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'no-referrer',
      ...extraHeaders,
    },
  });
}

function errorResponse(status, message) {
  return jsonResponse(status, { error: message });
}

/**
 * Parse and validate query parameters.
 * @param {URL} url
 * @returns {{ ok: boolean, error?: string, params: object }}
 */
export function parseQuery(url) {
  const params = {
    status: 'all',
    includeUnpublished: true, // default: authenticated callers see everything
    page: DEFAULT_PAGE,
    limit: DEFAULT_LIMIT,
    updatedSince: null,
  };

  const status = url.searchParams.get('status');
  if (status !== null && status !== '') {
    const s = status.toUpperCase();
    if (s !== 'ALL' && !VALID_STATUSES.includes(s)) {
      return {
        ok: false,
        error: `Invalid status '${status}'. Must be one of: all, ${VALID_STATUSES.join(', ')}`,
      };
    }
    // Normalize 'ALL' to lowercase 'all' so buildQuery's `!== 'all'` check works
    params.status = s === 'ALL' ? 'all' : s;
  }

  const includeUnpublished = url.searchParams.get('include_unpublished');
  if (includeUnpublished !== null && includeUnpublished !== '') {
    if (!['true', 'false'].includes(includeUnpublished.toLowerCase())) {
      return {
        ok: false,
        error: "Invalid include_unpublished value. Must be 'true' or 'false'.",
      };
    }
    params.includeUnpublished = includeUnpublished.toLowerCase() === 'true';
  }

  const pageRaw = url.searchParams.get('page');
  if (pageRaw !== null && pageRaw !== '') {
    const page = Number(pageRaw);
    if (!Number.isInteger(page) || page < 1) {
      return { ok: false, error: 'Invalid page. Must be an integer >= 1.' };
    }
    params.page = page;
  }

  const limitRaw = url.searchParams.get('limit');
  if (limitRaw !== null && limitRaw !== '') {
    const limit = Number(limitRaw);
    if (!Number.isInteger(limit) || limit < 1) {
      return { ok: false, error: 'Invalid limit. Must be an integer >= 1.' };
    }
    if (limit > MAX_LIMIT) {
      return { ok: false, error: `Invalid limit. Maximum allowed value is ${MAX_LIMIT}.` };
    }
    params.limit = limit;
  }

  const updatedSinceRaw = url.searchParams.get('updatedSince');
  if (updatedSinceRaw !== null && updatedSinceRaw !== '') {
    const ts = new Date(updatedSinceRaw);
    if (isNaN(ts.getTime())) {
      return { ok: false, error: 'Invalid updatedSince. Must be a valid ISO-8601 timestamp.' };
    }
    params.updatedSince = ts.toISOString();
  }

  return { ok: true, params };
}

/**
 * Build a Supabase query for the properties table honoring the parsed params.
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {object} params - Parsed query params
 * @returns {import('@supabase/supabase-js').PostgrestFilterBuilder}
 */
export function buildQuery(supabase, params) {
  let query = supabase
    .from('properties')
    .select('*', { count: 'exact' });

  // Status filter
  if (params.status !== 'all') {
    // Normalize the EstateOS status to the DB status values.
    // The migration/trigger stores legacy statuses too, so we query
    // on the normalized enum value OR the legacy equivalent.
    const statusMap = {
      ACTIVE: ['ACTIVE', 'Active', 'AVAILABLE', 'Available', 'FOR SALE', 'For Sale', 'FOR RENT', 'For Rent', 'For Lease', 'PUBLISHED', 'Published'],
      DRAFT: ['DRAFT', 'Draft', 'PENDING', 'Pending'],
      PRIVATE: ['PRIVATE', 'Private', 'UNLISTED', 'HIDDEN', 'OFF MARKET', 'Off Market'],
      SOLD: ['SOLD', 'Sold', 'SOLD OUT', 'Sold Out'],
      RENTED: ['RENTED', 'Rented', 'LEASED', 'Leased'],
      ARCHIVED: ['ARCHIVED', 'Archived', 'UNDER CONTRACT', 'INACTIVE', 'DELETED'],
    };
    const values = statusMap[params.status] || [params.status];
    query = query.in('status', values);
  }

  // Unpublished filtering.
  // PRIVATE / DRAFT / ARCHIVED listings are "unpublished".
  // When include_unpublished=false, only ACTIVE/SOLD/RENTED are returned.
  if (!params.includeUnpublished) {
    query = query.in('status', ['ACTIVE', 'Active', 'AVAILABLE', 'Available', 'FOR SALE', 'For Sale', 'FOR RENT', 'For Rent', 'For Lease', 'PUBLISHED', 'Published', 'SOLD', 'Sold', 'SOLD OUT', 'Sold Out', 'RENTED', 'Rented', 'LEASED', 'Leased']);
  }

  // updatedSince filter
  if (params.updatedSince) {
    query = query.or(
      `updated_at.gte.${params.updatedSince},created_at.gte.${params.updatedSince}`
    );
  }

  // Pagination
  const from = (params.page - 1) * params.limit;
  const to = from + params.limit - 1;
  query = query.range(from, to).order('updated_at', { ascending: false });

  return query;
}

/**
 * Create a Supabase client with the service-role key (server-side only).
 */
function createSupabaseClient() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY;

  if (!url || !serviceKey) {
    throw new Error('Supabase URL and service role key are not configured');
  }

  return createClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Load static (development/test) API key hashes from env vars.
 * In production this is empty — keys live in the estateos_api_keys table.
 * @returns {string[]}
 */
function getStaticKeyHashes() {
  const raw = process.env.ESTATEOS_STATIC_KEY_HASHES || '';
  return raw
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
}

/**
 * Create the request handler with injectable dependencies.
 *
 * This factory makes the handler trivially testable without module
 * mocking — tests pass in a mock Supabase client, rate limiter, and
 * logger.
 *
 * @param {object} deps
 * @param {import('@supabase/supabase-js').SupabaseClient} deps.supabase
 * @param {object} [deps.rateLimiter] - { check(req, apiKey) -> { allowed, headers } }
 * @param {object} [deps.logger] - { logRequest(entry) }
 * @param {string[]} [deps.staticKeyHashes]
 * @returns {Function} Vercel-compatible request handler
 */
export function createHandler({
  supabase,
  rateLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 300 }),
  logger = { logRequest },
  staticKeyHashes = [],
} = {}) {
  return async function handler(req) {
    const startTime = Date.now();

    // CORS preflight for the EstateOS server client
    if (req.method === 'OPTIONS') {
      return jsonResponse(204, {});
    }

    // Only GET is allowed — keys are read-only
    if (req.method !== 'GET') {
      return jsonResponse(405, {
        error: 'Method not allowed. Only GET is supported.',
      });
    }

    const url = new URL(req.url || '/api/estateos/properties', 'https://luxurypropertiesltd.com.ng');
    const authHeader = req.headers?.authorization || req.headers?.get?.('authorization');

    // Extract raw key for rate-limit keying + safe logging identifier.
    // The raw key itself is NEVER logged or stored in the rate-limit map.
    let rawKey = '';
    if (authHeader) {
      const m = authHeader.match(/^Bearer\s+(.+)$/i);
      if (m) rawKey = m[1].trim();
    }

    // Rate limit BEFORE auth so unauthenticated attackers can't exhaust DB lookups
    const rateCheck = rateLimiter.check(req, rawKey);
    if (!rateCheck.allowed) {
      logger.logRequest({ req, status: 429, durationMs: Date.now() - startTime, apiKey: rawKey });
      return jsonResponse(429, rateCheck.body, rateCheck.headers);
    }

    // Parse query params BEFORE auth so invalid params return 400 fast
    const parsed = parseQuery(url);
    if (!parsed.ok) {
      logger.logRequest({ req, status: 400, durationMs: Date.now() - startTime, apiKey: rawKey, error: parsed.error });
      return jsonResponse(400, { error: parsed.error }, rateCheck.headers);
    }

    // Authenticate against DB-backed keys + optional static dev keys
    const auth = await verifyRequest(authHeader, {
      supabase,
      staticKeys: staticKeyHashes,
    });
    if (!auth.ok) {
      logger.logRequest({ req, status: auth.status || 401, durationMs: Date.now() - startTime, apiKey: rawKey, error: auth.reason });
      return jsonResponse(auth.status || 401, { error: auth.reason });
    }

    try {
      // Query the properties table with the service-role client
      const query = buildQuery(supabase, parsed.params);

      const { data, error, count } = await query;

      if (error) {
        console.error('[estateos] Supabase query failed:', {
          code: error.code,
          message: error.message,
          details: error.details,
        });
        logger.logRequest({ req, status: 500, durationMs: Date.now() - startTime, apiKey: rawKey, error: 'Database query failed' });
        return errorResponse(500, 'Internal server error');
      }

      const items = transformProperties(data || []);
      const total = count || 0;
      const hasMore = (parsed.params.page * parsed.params.limit) < total;

      const body = {
        items,
        page: parsed.params.page,
        limit: parsed.params.limit,
        total,
        hasMore,
      };

      logger.logRequest({ req, status: 200, durationMs: Date.now() - startTime, apiKey: rawKey });
      return jsonResponse(200, body, rateCheck.headers);
    } catch (err) {
      console.error('[estateos] Unhandled error:', {
        message: err.message,
        stack: err.stack,
      });
      logger.logRequest({ req, status: 500, durationMs: Date.now() - startTime, apiKey: rawKey, error: 'Unhandled server error' });
      return errorResponse(500, 'Internal server error');
    }
  };
}

// ------------------------------------------------------------------
// Default export — used by Vercel in production
//
// Lazily initializes the Supabase client on first request so the
// module can be imported (e.g. by tests) without env vars set.
// ------------------------------------------------------------------

let defaultHandler = null;

export default async function handler(req) {
  if (!defaultHandler) {
    defaultHandler = createHandler({
      supabase: createSupabaseClient(),
      staticKeyHashes: getStaticKeyHashes(),
    });
  }
  return defaultHandler(req);
}
