// Shared slug utilities for property URLs.
// Reused by the admin console, the SSR function, the prerender route
// generator, and the legacy-UUID redirect handler so every tier applies
// the exact same algorithm + collision handling.

// Matches a legacy UUID used in the pre-slug public URL form:
// /properties/<uuid>. Genuine slug URLs never match.
export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Convert a title (or any string) into a URL-safe slug.
 * Mirrors the algorithm already used by AdminDashboard.jsx so that new
 * and legacy slugs are produced identically.
 */
export const generateSlug = (title) =>
  (title || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/**
 * True when the given route param segment is a legacy UUID.
 */
export const isUUID = (value) => typeof value === 'string' && UUID_RE.test(value);

/**
 * Build a URL-safe slug, guaranteeing uniqueness against a Set of
 * already-taken slugs by appending "-2", "-3", etc.
 */
export const uniqueSlug = (title, taken) => {
  const base = generateSlug(title);
  if (!base) {
    // Empty title (e.g. untitled draft) — fall back to a random-ish suffix.
    const fallback = Math.random().toString(36).slice(2, 10);
    if (!taken.has(fallback)) {
      taken.add(fallback);
      return fallback;
    }
  }
  if (!taken.has(base)) {
    taken.add(base);
    return base;
  }
  let counter = 2;
  let candidate = `${base}-${counter}`;
  while (taken.has(candidate)) {
    counter++;
    candidate = `${base}-${counter}`;
  }
  taken.add(candidate);
  return candidate;
};
