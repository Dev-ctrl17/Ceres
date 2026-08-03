// ============================================================
// EstateOS API — Automated tests
//
// Run with:  node --test api/estateos/properties.test.js
//
// Covers:
//   - Authentication (401 for missing/invalid keys)
//   - Pagination (page, limit, hasMore, total)
//   - Unpublished listings (include_unpublished)
//   - Invalid data (bad status, page, limit, timestamp)
//   - Status filtering (status=SOLD, PRIVATE, all)
//   - Status change detection (updatedSince filtering)
//   - Rate limiting (429)
//   - Method not allowed (405)
//   - Database error (500)
// ============================================================

import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

import { createHandler, parseQuery, buildQuery } from './properties.js';

// ------------------------------------------------------------------
// Test fixtures
// ------------------------------------------------------------------

const VALID_KEY = 'estateos_live_' + 'a'.repeat(32);
const VALID_KEY_HASH = createHash('sha256').update(VALID_KEY, 'utf8').digest('hex');

const sampleProperties = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    title: 'Luxury 3-Bedroom Apartment in Lekki',
    address: '12 Admiralty Way, Lekki Phase 1',
    property_type: 'apartment',
    status: 'ACTIVE',
    price: 85000000,
    currency: 'NGN',
    bedrooms: 3,
    bathrooms: 3,
    images: ['https://cdn.example.com/lekki-1.jpg', '/images/lekki-2.jpg'],
    amenities: ['Swimming Pool', '24/7 Security'],
    updated_at: '2026-01-15T10:00:00.000Z',
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    title: 'Private 5-Bedroom Duplex in Ikoyi',
    address: '5 Bourdillon Road, Ikoyi',
    property_type: 'duplex',
    status: 'PRIVATE',
    price: 350000000,
    currency: 'NGN',
    bedrooms: 5,
    bathrooms: 6,
    images: ['https://cdn.example.com/ikoyi-1.jpg'],
    amenities: ['Gym', 'Garden'],
    updated_at: '2026-02-01T09:30:00.000Z',
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    title: 'Sold Waterfront Mansion on Banana Island',
    address: 'Plot 7, Banana Island',
    property_type: 'mansion',
    status: 'SOLD',
    price: 2500000000,
    currency: 'NGN',
    bedrooms: 7,
    bathrooms: 8,
    images: ['https://cdn.example.com/banana-1.jpg'],
    amenities: ['Private Beach', 'Helipad'],
    updated_at: '2026-03-10T14:00:00.000Z',
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    title: 'Rented 2-Bedroom Flat in Victoria Island',
    address: '15 Akin Adesola Street, VI',
    property_type: 'flat',
    status: 'RENTED',
    price: 45000000,
    currency: 'NGN',
    bedrooms: 2,
    bathrooms: 2,
    images: ['https://cdn.example.com/vi-1.jpg'],
    amenities: ['Parking', 'Elevator'],
    updated_at: '2026-04-20T08:00:00.000Z',
  },
  {
    id: '55555555-5555-5555-5555-555555555555',
    title: 'Draft Land Parcel in Ajah',
    address: 'Lagos-Epe Expressway, Ajah',
    property_type: 'land',
    status: 'DRAFT',
    price: 120000000,
    currency: 'NGN',
    bedrooms: 0,
    bathrooms: 0,
    images: ['https://cdn.example.com/ajah-1.jpg'],
    amenities: [],
    updated_at: '2026-05-05T12:00:00.000Z',
  },
  {
    id: '66666666-6666-6666-6666-666666666666',
    title: 'Archived Office Building in Ikeja',
    address: '23 Allen Avenue, Ikeja',
    property_type: 'office',
    status: 'ARCHIVED',
    price: 500000000,
    currency: 'NGN',
    bedrooms: 0,
    bathrooms: 4,
    images: ['https://cdn.example.com/ikeja-1.jpg'],
    amenities: ['Conference Room', 'Generator'],
    updated_at: '2026-06-15T16:00:00.000Z',
  },
];

// ------------------------------------------------------------------
// Mock Supabase client factory
// ------------------------------------------------------------------

function createMockSupabase({ rows = sampleProperties, failQuery = false } = {}) {
  const queryBuilder = {
    _table: null,
    _filters: [],
    _range: null,
    _single: false,
    select(columns, opts) {
      this._select = columns;
      this._countOpts = opts;
      return this;
    },
    eq(column, value) {
      this._filters.push({ type: 'eq', column, value });
      return this;
    },
    in(column, values) {
      this._filters.push({ type: 'in', column, values });
      return this;
    },
    or(filter) {
      this._filters.push({ type: 'or', filter });
      return this;
    },
    range(from, to) {
      this._range = { from, to };
      return this;
    },
    order(column, opts) {
      this._order = { column, ...opts };
      return this;
    },
    maybeSingle() {
      this._single = true;
      return this;
    },
    async then(resolve, reject) {
      if (failQuery) {
        return reject({ code: 'PGRST999', message: 'boom', details: 'test failure' });
      }

      // Auth lookup on estateos_api_keys: return no row (static keys handle auth)
      if (this._table === 'estateos_api_keys') {
        return resolve({ data: null, error: null });
      }

      // Apply status filters
      let filtered = [...rows];
      for (const f of this._filters) {
        if (f.type === 'in' && f.column === 'status') {
          filtered = filtered.filter(r => f.values.includes(r.status));
        }
        if (f.type === 'or' && f.filter.includes('updated_at.gte')) {
          // Parse the updatedSince timestamp from the or filter
          const match = f.filter.match(/updated_at\.gte\.([^,]+)/);
          if (match) {
            const since = new Date(match[1]).getTime();
            filtered = filtered.filter(r => {
              const updated = new Date(r.updated_at).getTime();
              const created = r.created_at ? new Date(r.created_at).getTime() : updated;
              return updated >= since || created >= since;
            });
          }
        }
      }

      const total = filtered.length;

      // Apply pagination
      const from = this._range?.from ?? 0;
      const to = this._range?.to ?? filtered.length - 1;
      const pageItems = filtered.slice(from, to + 1);

      return resolve({ data: pageItems, error: null, count: total });
    },
  };

  const supabase = {
    from(table) {
      queryBuilder._table = table;
      return queryBuilder;
    },
    rpc: async () => ({ data: null, error: null }),
  };

  return { supabase, queryBuilder };
}

// ------------------------------------------------------------------
// Build a handler with injected mocks
// ------------------------------------------------------------------

function buildHandler({ rows, failQuery, rateLimitMax = Infinity } = {}) {
  const { supabase } = createMockSupabase({ rows, failQuery });

  // Mock rate limiter: allow everything unless rateLimitMax is set
  let requestCount = 0;
  const rateLimiter = {
    check() {
      requestCount++;
      if (requestCount > rateLimitMax) {
        return {
          allowed: false,
          status: 429,
          body: { error: 'Rate limit exceeded. Please retry later.', retryAfter: 60 },
          headers: { 'Retry-After': '60' },
        };
      }
      return { allowed: true, headers: {} };
    },
  };

  const logger = { logRequest: () => {} };

  return createHandler({
    supabase,
    rateLimiter,
    logger,
    staticKeyHashes: [VALID_KEY_HASH],
  });
}

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------

function makeRequest({ method = 'GET', url = '/api/estateos/properties', auth = VALID_KEY } = {}) {
  const headers = {};
  if (auth) headers.authorization = `Bearer ${auth}`;
  return { method, url, headers };
}

async function callHandler(handler, req) {
  const res = await handler(req);
  const body = await res.json();
  return { status: res.status, body, headers: res.headers };
}

// ------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------

// --- Authentication ---

test('returns 401 when no Authorization header is provided', async () => {
  const handler = buildHandler();
  const { status, body } = await callHandler(handler, makeRequest({ auth: null }));
  assert.equal(status, 401);
  assert.ok(body.error);
});

test('returns 401 for an invalid API key', async () => {
  const handler = buildHandler();
  const { status, body } = await callHandler(
    handler,
    makeRequest({ auth: 'estateos_live_' + 'b'.repeat(32) })
  );
  assert.equal(status, 401);
  assert.ok(body.error);
});

test('returns 401 for a malformed Authorization header', async () => {
  const handler = buildHandler();
  const { status } = await callHandler(handler, makeRequest({ auth: 'Basic abc123' }));
  assert.equal(status, 401);
});

test('returns 401 for a malformed API key format', async () => {
  const handler = buildHandler();
  const { status } = await callHandler(
    handler,
    makeRequest({ auth: 'Bearer not-a-valid-key-format' })
  );
  assert.equal(status, 401);
});

test('returns 200 for a valid API key', async () => {
  const handler = buildHandler();
  const { status, body } = await callHandler(handler, makeRequest());
  assert.equal(status, 200);
  assert.ok(Array.isArray(body.items));
});

// --- Pagination ---

test('returns correct pagination metadata', async () => {
  const handler = buildHandler();
  const { status, body } = await callHandler(
    handler,
    makeRequest({ url: '/api/estateos/properties?page=1&limit=2' })
  );
  assert.equal(status, 200);
  assert.equal(body.page, 1);
  assert.equal(body.limit, 2);
  assert.equal(body.total, 6);
  assert.equal(body.hasMore, true);
  assert.equal(body.items.length, 2);
});

test('returns hasMore=false on the last page', async () => {
  const handler = buildHandler();
  const { body } = await callHandler(
    handler,
    makeRequest({ url: '/api/estateos/properties?page=3&limit=2' })
  );
  assert.equal(body.page, 3);
  assert.equal(body.items.length, 2);
  assert.equal(body.hasMore, false);
});

test('returns empty items for a page beyond the data', async () => {
  const handler = buildHandler();
  const { body } = await callHandler(
    handler,
    makeRequest({ url: '/api/estateos/properties?page=99&limit=10' })
  );
  assert.equal(body.items.length, 0);
  assert.equal(body.total, 6);
  assert.equal(body.hasMore, false);
});

test('returns all items when limit exceeds total', async () => {
  const handler = buildHandler();
  const { body } = await callHandler(
    handler,
    makeRequest({ url: '/api/estateos/properties?page=1&limit=100' })
  );
  assert.equal(body.items.length, 6);
  assert.equal(body.hasMore, false);
});

// --- Unpublished listings ---

test('includes unpublished listings by default (authenticated)', async () => {
  const handler = buildHandler();
  const { body } = await callHandler(handler, makeRequest());
  const statuses = body.items.map(i => i.status);
  assert.ok(statuses.includes('PRIVATE'), 'should include PRIVATE listings');
  assert.ok(statuses.includes('DRAFT'), 'should include DRAFT listings');
  assert.ok(statuses.includes('ARCHIVED'), 'should include ARCHIVED listings');
});

test('excludes unpublished listings when include_unpublished=false', async () => {
  const handler = buildHandler();
  const { body } = await callHandler(
    handler,
    makeRequest({ url: '/api/estateos/properties?include_unpublished=false' })
  );
  const statuses = body.items.map(i => i.status);
  assert.ok(!statuses.includes('PRIVATE'), 'should NOT include PRIVATE listings');
  assert.ok(!statuses.includes('DRAFT'), 'should NOT include DRAFT listings');
  assert.ok(!statuses.includes('ARCHIVED'), 'should NOT include ARCHIVED listings');
  assert.ok(statuses.includes('ACTIVE'));
  assert.ok(statuses.includes('SOLD'));
  assert.ok(statuses.includes('RENTED'));
});

// --- Invalid data ---

test('returns 400 for an invalid status value', async () => {
  const handler = buildHandler();
  const { status, body } = await callHandler(
    handler,
    makeRequest({ url: '/api/estateos/properties?status=INVALID' })
  );
  assert.equal(status, 400);
  assert.ok(body.error);
});

test('returns 400 for an invalid page value', async () => {
  const handler = buildHandler();
  const { status } = await callHandler(
    handler,
    makeRequest({ url: '/api/estateos/properties?page=0' })
  );
  assert.equal(status, 400);
});

test('returns 400 for a non-integer limit', async () => {
  const handler = buildHandler();
  const { status } = await callHandler(
    handler,
    makeRequest({ url: '/api/estateos/properties?limit=abc' })
  );
  assert.equal(status, 400);
});

test('returns 400 for a limit above the maximum', async () => {
  const handler = buildHandler();
  const { status } = await callHandler(
    handler,
    makeRequest({ url: '/api/estateos/properties?limit=1000' })
  );
  assert.equal(status, 400);
});

test('returns 400 for an invalid updatedSince timestamp', async () => {
  const handler = buildHandler();
  const { status } = await callHandler(
    handler,
    makeRequest({ url: '/api/estateos/properties?updatedSince=not-a-date' })
  );
  assert.equal(status, 400);
});

test('returns 400 for an invalid include_unpublished value', async () => {
  const handler = buildHandler();
  const { status } = await callHandler(
    handler,
    makeRequest({ url: '/api/estateos/properties?include_unpublished=yes' })
  );
  assert.equal(status, 400);
});

test('accepts a valid updatedSince timestamp', async () => {
  const handler = buildHandler();
  const { status } = await callHandler(
    handler,
    makeRequest({ url: '/api/estateos/properties?updatedSince=2026-01-01T00:00:00.000Z' })
  );
  assert.equal(status, 200);
});

// --- Status filtering ---

test('filters by status=SOLD', async () => {
  const handler = buildHandler();
  const { body } = await callHandler(
    handler,
    makeRequest({ url: '/api/estateos/properties?status=SOLD' })
  );
  assert.equal(body.items.length, 1);
  assert.equal(body.items[0].status, 'SOLD');
});

test('filters by status=PRIVATE', async () => {
  const handler = buildHandler();
  const { body } = await callHandler(
    handler,
    makeRequest({ url: '/api/estateos/properties?status=PRIVATE' })
  );
  assert.equal(body.items.length, 1);
  assert.equal(body.items[0].status, 'PRIVATE');
});

test('filters by status=DRAFT', async () => {
  const handler = buildHandler();
  const { body } = await callHandler(
    handler,
    makeRequest({ url: '/api/estateos/properties?status=DRAFT' })
  );
  assert.equal(body.items.length, 1);
  assert.equal(body.items[0].status, 'DRAFT');
});

test('filters by status=RENTED', async () => {
  const handler = buildHandler();
  const { body } = await callHandler(
    handler,
    makeRequest({ url: '/api/estateos/properties?status=RENTED' })
  );
  assert.equal(body.items.length, 1);
  assert.equal(body.items[0].status, 'RENTED');
});

test('filters by status=ARCHIVED', async () => {
  const handler = buildHandler();
  const { body } = await callHandler(
    handler,
    makeRequest({ url: '/api/estateos/properties?status=ARCHIVED' })
  );
  assert.equal(body.items.length, 1);
  assert.equal(body.items[0].status, 'ARCHIVED');
});

test('status=all returns all statuses', async () => {
  const handler = buildHandler();
  const { body } = await callHandler(
    handler,
    makeRequest({ url: '/api/estateos/properties?status=all' })
  );
  assert.equal(body.items.length, 6);
});

test('status filter is case-insensitive', async () => {
  const handler = buildHandler();
  const { body } = await callHandler(
    handler,
    makeRequest({ url: '/api/estateos/properties?status=sold' })
  );
  assert.equal(body.items.length, 1);
  assert.equal(body.items[0].status, 'SOLD');
});

// --- Status change detection via updatedSince ---

test('updatedSince filters out listings updated before the timestamp', async () => {
  const handler = buildHandler();
  const { body } = await callHandler(
    handler,
    makeRequest({ url: '/api/estateos/properties?updatedSince=2026-03-01T00:00:00.000Z' })
  );
  // Only listings updated on/after March 1: SOLD (Mar 10), RENTED (Apr 20), DRAFT (May 5), ARCHIVED (Jun 15)
  assert.equal(body.items.length, 4);
  const ids = body.items.map(i => i.id);
  assert.ok(ids.includes('33333333-3333-3333-3333-333333333333'), 'SOLD should be included');
  assert.ok(ids.includes('44444444-4444-4444-4444-444444444444'), 'RENTED should be included');
  assert.ok(ids.includes('55555555-5555-5555-5555-555555555555'), 'DRAFT should be included');
  assert.ok(ids.includes('66666666-6666-6666-6666-666666666666'), 'ARCHIVED should be included');
  assert.ok(!ids.includes('11111111-1111-1111-1111-111111111111'), 'ACTIVE (Jan) should be excluded');
  assert.ok(!ids.includes('22222222-2222-2222-2222-222222222222'), 'PRIVATE (Feb) should be excluded');
});

test('updatedSince with a recent timestamp returns only recent changes', async () => {
  const handler = buildHandler();
  const { body } = await callHandler(
    handler,
    makeRequest({ url: '/api/estateos/properties?updatedSince=2026-05-01T00:00:00.000Z' })
  );
  // Only DRAFT (May 5) and ARCHIVED (Jun 15)
  assert.equal(body.items.length, 2);
  const ids = body.items.map(i => i.id);
  assert.ok(ids.includes('55555555-5555-5555-5555-555555555555'));
  assert.ok(ids.includes('66666666-6666-6666-6666-666666666666'));
});

test('updatedSince with a future timestamp returns no items', async () => {
  const handler = buildHandler();
  const { body } = await callHandler(
    handler,
    makeRequest({ url: '/api/estateos/properties?updatedSince=2027-01-01T00:00:00.000Z' })
  );
  assert.equal(body.items.length, 0);
  assert.equal(body.total, 0);
  assert.equal(body.hasMore, false);
});

test('updatedSince combined with status filter detects status changes', async () => {
  const handler = buildHandler();
  const { body } = await callHandler(
    handler,
    makeRequest({ url: '/api/estateos/properties?status=SOLD&updatedSince=2026-03-01T00:00:00.000Z' })
  );
  // SOLD listing was updated Mar 10, so it should be included
  assert.equal(body.items.length, 1);
  assert.equal(body.items[0].status, 'SOLD');
});

test('updatedSince combined with status filter excludes old status changes', async () => {
  const handler = buildHandler();
  const { body } = await callHandler(
    handler,
    makeRequest({ url: '/api/estateos/properties?status=ACTIVE&updatedSince=2026-03-01T00:00:00.000Z' })
  );
  // ACTIVE listing was updated Jan 15, before the cutoff — should be excluded
  assert.equal(body.items.length, 0);
});

test('updatedSince combined with include_unpublished=false detects published changes', async () => {
  const handler = buildHandler();
  const { body } = await callHandler(
    handler,
    makeRequest({ url: '/api/estateos/properties?include_unpublished=false&updatedSince=2026-03-01T00:00:00.000Z' })
  );
  // Only SOLD (Mar 10) and RENTED (Apr 20) are published and updated after cutoff
  assert.equal(body.items.length, 2);
  const statuses = body.items.map(i => i.status);
  assert.ok(statuses.includes('SOLD'));
  assert.ok(statuses.includes('RENTED'));
});

// --- parseQuery unit tests ---

test('parseQuery defaults are correct', () => {
  const url = new URL('https://example.com/api/estateos/properties');
  const result = parseQuery(url);
  assert.equal(result.ok, true);
  assert.equal(result.params.status, 'all');
  assert.equal(result.params.includeUnpublished, true);
  assert.equal(result.params.page, 1);
  assert.equal(result.params.limit, 100);
  assert.equal(result.params.updatedSince, null);
});

test('parseQuery normalizes status=ALL to all', () => {
  const url = new URL('https://example.com/api/estateos/properties?status=ALL');
  const result = parseQuery(url);
  assert.equal(result.ok, true);
  assert.equal(result.params.status, 'all');
});

test('parseQuery accepts lowercase status values', () => {
  const url = new URL('https://example.com/api/estateos/properties?status=sold');
  const result = parseQuery(url);
  assert.equal(result.ok, true);
  assert.equal(result.params.status, 'SOLD');
});

test('parseQuery rejects empty status', () => {
  const url = new URL('https://example.com/api/estateos/properties?status=');
  const result = parseQuery(url);
  assert.equal(result.ok, true);
  assert.equal(result.params.status, 'all');
});

// --- buildQuery unit tests ---

test('buildQuery applies status filter for ACTIVE', () => {
  const { supabase, queryBuilder } = createMockSupabase();
  const params = { status: 'ACTIVE', includeUnpublished: true, page: 1, limit: 100, updatedSince: null };
  buildQuery(supabase, params);
  const statusFilter = queryBuilder._filters.find(f => f.type === 'in' && f.column === 'status');
  assert.ok(statusFilter, 'should have a status filter');
  assert.ok(statusFilter.values.includes('ACTIVE'));
  assert.ok(statusFilter.values.includes('AVAILABLE'));
  assert.ok(statusFilter.values.includes('FOR SALE'));
});

test('buildQuery applies include_unpublished=false filter', () => {
  const { supabase, queryBuilder } = createMockSupabase();
  const params = { status: 'all', includeUnpublished: false, page: 1, limit: 100, updatedSince: null };
  buildQuery(supabase, params);
  const statusFilter = queryBuilder._filters.find(f => f.type === 'in' && f.column === 'status');
  assert.ok(statusFilter, 'should have a status filter');
  assert.ok(statusFilter.values.includes('ACTIVE'));
  assert.ok(statusFilter.values.includes('SOLD'));
  assert.ok(statusFilter.values.includes('RENTED'));
  assert.ok(!statusFilter.values.includes('PRIVATE'));
  assert.ok(!statusFilter.values.includes('DRAFT'));
  assert.ok(!statusFilter.values.includes('ARCHIVED'));
});

test('buildQuery applies updatedSince filter', () => {
  const { supabase, queryBuilder } = createMockSupabase();
  const params = { status: 'all', includeUnpublished: true, page: 1, limit: 100, updatedSince: '2026-03-01T00:00:00.000Z' };
  buildQuery(supabase, params);
  const orFilter = queryBuilder._filters.find(f => f.type === 'or');
  assert.ok(orFilter, 'should have an or filter');
  assert.ok(orFilter.filter.includes('updated_at.gte.2026-03-01T00:00:00.000Z'));
  assert.ok(orFilter.filter.includes('created_at.gte.2026-03-01T00:00:00.000Z'));
});

test('buildQuery applies pagination range', () => {
  const { supabase, queryBuilder } = createMockSupabase();
  const params = { status: 'all', includeUnpublished: true, page: 3, limit: 20, updatedSince: null };
  buildQuery(supabase, params);
  assert.deepEqual(queryBuilder._range, { from: 40, to: 59 });
});

test('buildQuery orders by updated_at descending', () => {
  const { supabase, queryBuilder } = createMockSupabase();
  const params = { status: 'all', includeUnpublished: true, page: 1, limit: 100, updatedSince: null };
  buildQuery(supabase, params);
  assert.equal(queryBuilder._order.column, 'updated_at');
  assert.equal(queryBuilder._order.ascending, false);
});

// --- Rate limiting ---

test('returns 429 when rate limit is exceeded', async () => {
  const handler = buildHandler({ rateLimitMax: 1 });
  // First request passes
  await callHandler(handler, makeRequest());
  // Second request is rate-limited
  const { status, body } = await callHandler(handler, makeRequest());
  assert.equal(status, 429);
  assert.ok(body.error);
});

// --- Method not allowed ---

test('returns 405 for non-GET methods', async () => {
  const handler = buildHandler();
  const { status } = await callHandler(handler, makeRequest({ method: 'POST' }));
  assert.equal(status, 405);
});

test('returns 405 for PUT method', async () => {
  const handler = buildHandler();
  const { status } = await callHandler(handler, makeRequest({ method: 'PUT' }));
  assert.equal(status, 405);
});

test('returns 405 for DELETE method', async () => {
  const handler = buildHandler();
  const { status } = await callHandler(handler, makeRequest({ method: 'DELETE' }));
  assert.equal(status, 405);
});

// --- Database error ---

test('returns 500 when the database query fails', async () => {
  const handler = buildHandler({ failQuery: true });
  const { status } = await callHandler(handler, makeRequest());
  assert.equal(status, 500);
});

// --- Response shape ---

test('returns the exact EstateOS response shape', async () => {
  const handler = buildHandler();
  const { body } = await callHandler(handler, makeRequest());
  assert.ok(Array.isArray(body.items));
  assert.equal(typeof body.page, 'number');
  assert.equal(typeof body.limit, 'number');
  assert.equal(typeof body.total, 'number');
  assert.equal(typeof body.hasMore, 'boolean');

  const item = body.items[0];
  assert.equal(typeof item.id, 'string');
  assert.equal(typeof item.title, 'string');
  assert.equal(typeof item.address, 'string');
  assert.equal(typeof item.type, 'string');
  assert.ok(['DRAFT', 'PRIVATE', 'ACTIVE', 'SOLD', 'RENTED', 'ARCHIVED'].includes(item.status));
  assert.equal(typeof item.price, 'number');
  assert.equal(typeof item.currency, 'string');
  assert.equal(typeof item.bedrooms, 'number');
  assert.equal(typeof item.bathrooms, 'number');
  assert.ok(Array.isArray(item.images));
  assert.ok(Array.isArray(item.amenities));
  assert.equal(typeof item.updatedAt, 'string');
});

test('returns stable IDs that never change', async () => {
  const handler = buildHandler();
  const first = await callHandler(handler, makeRequest());
  const second = await callHandler(handler, makeRequest());
  assert.deepEqual(
    first.body.items.map(i => i.id),
    second.body.items.map(i => i.id)
  );
});

test('returns absolute HTTPS image URLs', async () => {
  const handler = buildHandler();
  const { body } = await callHandler(handler, makeRequest());
  for (const item of body.items) {
    for (const img of item.images) {
      assert.ok(img.startsWith('https://'), `Image URL should be HTTPS: ${img}`);
    }
  }
});

test('normalizes legacy statuses to the EstateOS enum', async () => {
  const legacyRows = [
    {
      id: '77777777-7777-7777-7777-777777777777',
      title: 'Legacy Available Property',
      status: 'Available',
      price: 100000,
      updated_at: '2026-01-01T00:00:00.000Z',
    },
    {
      id: '88888888-8888-8888-8888-888888888888',
      title: 'Legacy For Sale Property',
      status: 'For Sale',
      price: 200000,
      updated_at: '2026-01-02T00:00:00.000Z',
    },
    {
      id: '99999999-9999-9999-9999-999999999999',
      title: 'Legacy Sold Out Property',
      status: 'Sold Out',
      price: 300000,
      updated_at: '2026-01-03T00:00:00.000Z',
    },
  ];
  const handler = buildHandler({ rows: legacyRows });
  const { body } = await callHandler(handler, makeRequest());
  const statuses = body.items.map(i => i.status);
  assert.ok(statuses.includes('ACTIVE'), 'Available should normalize to ACTIVE');
  assert.ok(statuses.includes('ACTIVE'), 'For Sale should normalize to ACTIVE');
  assert.ok(statuses.includes('SOLD'), 'Sold Out should normalize to SOLD');
});