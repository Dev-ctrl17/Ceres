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
    .replace(/[\u0027\u2018\u2019]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/**
 * True when the given route param segment is a legacy UUID.
 */
export const isUUID = (value) => typeof value === 'string' && UUID_RE.test(value);

const CURRENT_PROPERTY_SLUGS = {
  'governor-s-consent-approved-building-plan': 'governors-consent',
  'governor-s-consent-approved-building-plan-0f6d': 'governors-consent-approved-building-plan-2',
  'governor-s-consent-approved-building-plan-dhu4': 'governors-consent-approved-building-plan-3',
  'governor-s-consent-approved-building-plan-253k': 'governors-consent-approved-building-plan-4',
  '-long-lease-investment-opportunity': 'long-lease-investment-opportunity',
  'exquiisite-5-bedroom-fully-detached-smart-luxury-residence': 'exquisite-5-bedroom-fully-detached-smart-luxury-residence',
};

export const getCurrentPropertySlug = (slug) => CURRENT_PROPERTY_SLUGS[slug] || slug;

export const isUsablePropertySlug = (slug) =>
  typeof slug === 'string' &&
  slug.trim().length > 0 &&
  !/^(?:null|undefined)$/i.test(slug.trim());

export const getPropertyRouteSegment = (property) => {
  const slug = typeof property?.slug === 'string' ? property.slug.trim() : '';
  return isUsablePropertySlug(slug) ? getCurrentPropertySlug(slug) : null;
};

/**
 * Build a URL-safe slug, guaranteeing uniqueness against a Set of
 * already-taken slugs by appending "-2", "-3", etc.
 */
export const uniqueSlug = (title, taken, disambiguator = '') => {
  const base = generateSlug(title) || generateSlug(disambiguator) || 'property-listing';
  if (!taken.has(base)) {
    taken.add(base);
    return base;
  }

  const readableSuffix = generateSlug(disambiguator);
  let candidate = readableSuffix && !base.endsWith(`-${readableSuffix}`)
    ? `${base}-${readableSuffix}`
    : `${base}-2`;
  if (!taken.has(candidate)) {
    taken.add(candidate);
    return candidate;
  }

  let counter = 2;
  candidate = `${base}-${counter}`;
  while (taken.has(candidate)) {
    counter++;
    candidate = `${base}-${counter}`;
  }
  taken.add(candidate);
  return candidate;
};
