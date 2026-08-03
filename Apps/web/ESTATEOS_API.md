# EstateOS Private API — Property Listings

Secure, authenticated REST endpoint that lets **EstateOS** fetch both **public** and **unpublished** property listings from Luxury Properties Ltd.

---

## Base URL

```
https://luxurypropertiesltd.com.ng
```

All requests must use **HTTPS** in production.

---

## Endpoint

### `GET /api/estateos/properties`

Returns a paginated list of property listings.

---

## Authentication

Every request **must** include a valid API key in the `Authorization` header:

```
Authorization: Bearer <ESTATEOS_API_KEY>
```

### Key format

```
estateos_live_<32 hex characters>
```

Example:

```
Authorization: Bearer estateos_live_4f8a2b1c9d3e5f7a8b0c1d2e3f4a5b6c
```

### Security properties

| Property | Detail |
|----------|--------|
| **Read-only** | Keys can only perform `GET` requests. |
| **Revocable** | Set `is_active = false` in the `estateos_api_keys` table to revoke instantly. |
| **Hashed storage** | Only SHA-256 hashes are stored — the raw key is never persisted. |
| **Never logged** | The raw key is never written to logs; only a non-secret prefix is recorded. |
| **Server-side only** | The key must never be placed in frontend JavaScript. |
| **HTTPS** | Enforced in production via HSTS. |

### Error responses

| Status | Meaning |
|--------|---------|
| `401` | Missing, malformed, invalid, or revoked API key. |
| `429` | Rate limit exceeded (300 requests / 15 min per IP + key). |
| `405` | Method not allowed (only `GET` is supported). |
| `400` | Invalid query parameter. |
| `500` | Internal server error. |

---

## Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `status` | `string` | `all` | Filter by status. One of: `all`, `DRAFT`, `PRIVATE`, `ACTIVE`, `SOLD`, `RENTED`, `ARCHIVED`. |
| `include_unpublished` | `boolean` | `true` | When `false`, only published listings (`ACTIVE`, `SOLD`, `RENTED`) are returned. |
| `page` | `integer` | `1` | Page number (1-based). |
| `limit` | `integer` | `100` | Items per page. Max `200`. |
| `updatedSince` | `ISO-8601` | — | Only return listings updated (or created) at or after this timestamp. |

---

## Example Request

```bash
curl -X GET \
  'https://luxurypropertiesltd.com.ng/api/estateos/properties?status=all&include_unpublished=true&page=1&limit=2&updatedSince=2026-01-01T00:00:00.000Z' \
  -H 'Authorization: Bearer estateos_live_4f8a2b1c9d3e5f7a8b0c1d2e3f4a5b6c' \
  -H 'Accept: application/json'
```

---

## Example Response

```json
{
  "items": [
    {
      "id": "11111111-1111-1111-1111-111111111111",
      "title": "Luxury 3-Bedroom Apartment in Lekki",
      "address": "12 Admiralty Way, Lekki Phase 1, Lagos, Lagos State",
      "type": "apartment",
      "status": "ACTIVE",
      "price": 85000000,
      "currency": "NGN",
      "bedrooms": 3,
      "bathrooms": 3,
      "images": [
        "https://cdn.example.com/lekki-1.jpg",
        "https://luxurypropertiesltd.com.ng/images/lekki-2.jpg"
      ],
      "amenities": ["Swimming Pool", "24/7 Security"],
      "updatedAt": "2026-01-15T10:00:00.000Z"
    },
    {
      "id": "22222222-2222-2222-2222-222222222222",
      "title": "Private 5-Bedroom Duplex in Ikoyi",
      "address": "5 Bourdillon Road, Ikoyi, Lagos, Lagos State",
      "type": "duplex",
      "status": "PRIVATE",
      "price": 350000000,
      "currency": "NGN",
      "bedrooms": 5,
      "bathrooms": 6,
      "images": [
        "https://cdn.example.com/ikoyi-1.jpg"
      ],
      "amenities": ["Gym", "Garden"],
      "updatedAt": "2026-02-01T09:30:00.000Z"
    }
  ],
  "page": 1,
  "limit": 2,
  "total": 3,
  "hasMore": true
}
```

---

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `items` | `array` | List of property objects. |
| `items[].id` | `string` | **Stable** property ID (UUID). Never changes. |
| `items[].title` | `string` | Property title. |
| `items[].address` | `string` | Full address string. |
| `items[].type` | `string` | Property type (e.g. `apartment`, `duplex`, `mansion`). |
| `items[].status` | `string` | One of `DRAFT`, `PRIVATE`, `ACTIVE`, `SOLD`, `RENTED`, `ARCHIVED`. |
| `items[].price` | `number` | Price in the listing currency. |
| `items[].currency` | `string` | ISO currency code (e.g. `NGN`). |
| `items[].bedrooms` | `number` | Number of bedrooms. |
| `items[].bathrooms` | `number` | Number of bathrooms. |
| `items[].images` | `array` | Absolute HTTPS image URLs. |
| `items[].amenities` | `array` | List of amenity strings. |
| `items[].updatedAt` | `string` | ISO-8601 timestamp of last update. |
| `page` | `number` | Current page number. |
| `limit` | `number` | Items per page. |
| `total` | `number` | Total number of matching listings. |
| `hasMore` | `boolean` | Whether more pages exist. |

---

## Behavior Notes

- **Unpublished listings** (`DRAFT`, `PRIVATE`, `ARCHIVED`) are returned **only** when a valid EstateOS API key is supplied. Without a valid key, the endpoint returns `401` and no data.
- **Stable IDs** — the `id` field is the property's UUID and never changes, so EstateOS can reliably track listings across syncs.
- **Absolute HTTPS media URLs** — all image URLs are normalized to absolute `https://` URLs.
- **Accurate status** — legacy statuses (e.g. `Available`, `For Sale`, `Sold Out`) are normalized to the EstateOS enum.
- **`updatedAt`** — lets EstateOS detect new, price-changed, media-changed, sold, rented, and deleted listings via the `updatedSince` parameter.
- **Pagination** — use `page` + `limit` and stop when `hasMore` is `false`.

---

## Rate Limiting

- **300 requests** per **15 minutes** per client IP + API key.
- Exceeding the limit returns `429` with a `Retry-After` header.

---

## Setup

### 1. Run the database migration

Run [`supabase-estateos-api.sql`](./supabase-estateos-api.sql) in the Supabase SQL Editor. This creates:

- `estateos_api_keys` — revocable, read-only API keys (hashed).
- `estateos_property_changes` — change log for detecting new/updated/sold/rented/deleted listings.
- Triggers that automatically record property changes.

### 2. Set environment variables (Vercel)

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Your Supabase project URL. |
| `SUPABASE_SERVICE_ROLE_KEY` | Service-role key (server-side only). |
| `ESTATEOS_STATIC_KEY_HASHES` | Optional comma-separated SHA-256 hashes for dev/test keys. |

### 3. Create an API key

Insert a hashed key into `estateos_api_keys`:

```sql
INSERT INTO estateos_api_keys (name, key_hash, key_prefix, key_suffix)
VALUES (
  'EstateOS Production',
  '<sha256 of estateos_live_...>',
  'estateos_',
  '<last 4 chars>'
);
```

Generate the hash:

```bash
node -e "console.log(require('crypto').createHash('sha256').update('estateos_live_<32-hex>').digest('hex'))"
```

### 4. Deploy

Deploy to Vercel. The route is already wired in `vercel.json`.

---

## Running Tests

```bash
cd Apps/web
node --test api/estateos/properties.test.js
```

The test suite (49 tests) covers:

| Category | Tests |
|----------|-------|
| **Authentication** | Missing header, invalid key, malformed header, malformed key format, valid key |
| **Pagination** | Page metadata, `hasMore`, empty pages, limit exceeding total |
| **Unpublished listings** | Included by default, excluded with `include_unpublished=false` |
| **Invalid data** | Bad status, page, limit, `updatedSince`, `include_unpublished` |
| **Status filtering** | All 6 statuses, `all`, case-insensitive |
| **Status change detection** | `updatedSince` filtering, combined with status filter, combined with `include_unpublished` |
| **Query parsing** | Defaults, `ALL` normalization, lowercase, empty values |
| **Query building** | Status filter, unpublished filter, `updatedSince` filter, pagination range, ordering |
| **Rate limiting** | 429 response |
| **Method not allowed** | POST, PUT, DELETE |
| **Database errors** | 500 response |
| **Response shape** | Exact EstateOS shape, stable IDs, HTTPS image URLs, legacy status normalization |
